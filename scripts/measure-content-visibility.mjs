#!/usr/bin/env node
// Measures how long a write made outside the Worker takes to become visible.
//
// Upstream issue #2435 is open: EmDash has no programmatic purge path for
// content written outside the Worker, so its KV object cache keeps serving the
// previous query result until the entry expires. Woodhouse writes content that
// way on purpose — `pnpm run emdash:seed:remote` installs the reviewed model by
// replaying SQL — so the staleness window is a property of the product and needs
// a measured number rather than a configured one.
//
// Method: write a unique token into one published record directly in D1, then
// poll the plain public URL with no cache-busting parameter, because a
// query-string change would address a different cache entry and measure nothing.
// The probe reverts the record afterwards, so the environment is left as it was.
//
// Usage: node scripts/measure-content-visibility.mjs --environment=preview [--revert]
//        [--timeout-minutes=60]

import { spawnSync } from "node:child_process";
import { hasProbeToken, stripProbeToken } from "./visibility-probe.mjs";

const args = process.argv.slice(2);
const environment = (args.find((argument) => argument.startsWith("--environment=")) ?? "").split(
  "="
)[1];
if (!["preview", "production"].includes(environment))
  throw new Error(
    "Usage: node scripts/measure-content-visibility.mjs --environment=preview|production"
  );

const origins = {
  preview: "https://woodhouse-loftwah-preview.loftwah.workers.dev",
  production: "https://woodhouse.loftwah.com"
};
const databases = { preview: "woodhouse-emdash-preview", production: "woodhouse-emdash" };
const origin = origins[environment];
const database = databases[environment];
const SLUG = "prove-which-build-is-live";
const PATH = `/dispatches/${SLUG}/`;
const POLL_INTERVAL_MS = 5000;
// Raised from 15 minutes to 60 on 5 October 2026. Four runs measured the window
// at 864 s, 698 s and then twice as longer than 15 minutes, so the tool's own
// timeout had stopped being able to answer the question the tool exists for — it
// could report "not visible" without distinguishing a fifteen-minute window from
// a two-hour one.
//
// A run that reaches the limit still exits non-zero and still reports
// `visibleAfterSeconds: null`, but that now means "still invisible after an hour",
// which is a real bound rather than an artefact of a short timeout. Pass
// --timeout-minutes=N to override it.
const timeoutMinutes = (() => {
  const flag = args.find((argument) => argument.startsWith("--timeout-minutes="));
  if (!flag) return 60;
  const parsed = Number(flag.slice("--timeout-minutes=".length));
  if (!Number.isFinite(parsed) || parsed <= 0)
    throw new Error("--timeout-minutes must be a positive number.");
  return parsed;
})();
const TIMEOUT_MS = timeoutMinutes * 60 * 1000;

const token = `visibility-probe-${Date.now().toString(36)}`;

function sql(statement) {
  const result = spawnSync(
    "pnpm",
    ["exec", "wrangler", "d1", "execute", database, "--remote", "--json", "--command", statement],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }
  );
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`D1 write failed: ${result.stderr?.trim()}`);
  const start = result.stdout.search(/[[{]/);
  const parsed = start >= 0 ? JSON.parse(result.stdout.slice(start)) : [];
  return (Array.isArray(parsed) ? parsed : [parsed]).flatMap((batch) => batch.results ?? []);
}

const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;

const currentDeck = sql(`SELECT deck FROM ec_dispatches WHERE slug = ${quote(SLUG)}`)[0]?.deck;
if (typeof currentDeck !== "string")
  throw new Error(`${SLUG} has no deck to probe; is the reviewed model installed?`);

// `--revert` exists because the script refuses to run over a leftover token. It
// detected the interrupted-run state correctly and then offered no way out of
// it, which is worse than not detecting it.
if (args.includes("--revert")) {
  const cleaned = stripProbeToken(currentDeck);
  if (cleaned === currentDeck.trim()) {
    console.log(`${SLUG} carries no probe token; nothing to revert.`);
  } else {
    sql(`UPDATE ec_dispatches SET deck = ${quote(cleaned)} WHERE slug = ${quote(SLUG)}`);
    console.log(`Reverted the probe token from ${SLUG}.`);
  }
  process.exit(0);
}
if (hasProbeToken(currentDeck))
  throw new Error(
    `${SLUG} already carries a probe token from an interrupted run. ` +
      `Re-run with --revert to remove it.`
  );

async function visible() {
  const response = await fetch(`${origin}${PATH}`, {
    signal: AbortSignal.timeout(60000),
    headers: { "cache-control": "no-cache" }
  });
  if (!response.ok) return false;
  return (await response.text()).includes(token);
}

const result = { environment, origin, path: PATH, token, polls: [] };

function revert() {
  sql(`UPDATE ec_dispatches SET deck = ${quote(currentDeck)} WHERE slug = ${quote(SLUG)}`);
  result.reverted = true;
}

// A measurement takes up to 15 minutes, so it is very likely to be interrupted.
// The `finally` block does not run for SIGINT or SIGTERM, and a probe token left
// in a published dispatch is reader-visible text. Two runs were abandoned this way
// while measuring the preview cache, each leaving a token in a live record.
let reverting = false;
const onSignal = (signal) => {
  if (reverting) return;
  reverting = true;
  try {
    revert();
    console.error(`\nReverted the probe token after ${signal}.`);
  } catch (error) {
    console.error(
      `\nCould not revert the probe token after ${signal}: ${error.message}\n` +
        `Re-run with --revert to remove ${token} from ${SLUG}.`
    );
  }
  process.exit(signal === "SIGINT" ? 130 : 143);
};
process.on("SIGINT", onSignal);
process.on("SIGTERM", onSignal);

try {
  // Confirm the record is not already visible, so the measurement cannot pass by
  // accident.
  if (await visible()) throw new Error("the probe token is already visible; refusing to measure");
  sql(`UPDATE ec_dispatches SET deck = deck || ' ' || ${quote(token)} WHERE slug = ${quote(SLUG)}`);

  const started = Date.now();
  let seen = false;
  while (Date.now() - started < TIMEOUT_MS) {
    const elapsed = Math.round((Date.now() - started) / 1000);
    const found = await visible();
    result.polls.push({ seconds: elapsed, visible: found });
    if (found) {
      seen = true;
      result.visibleAfterSeconds = elapsed;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  if (!seen) result.visibleAfterSeconds = null;
} finally {
  revert();
  process.off("SIGINT", onSignal);
  process.off("SIGTERM", onSignal);
}

console.log(JSON.stringify(result, null, 2));
console.log(
  result.visibleAfterSeconds === null
    ? `\nThe probe was still invisible after ${timeoutMinutes} minutes at ${origin}${PATH}. ` +
        `That is a lower bound, not a measurement: nothing here evicts the cached read ` +
        `model, so the window may be longer still. Re-run with a longer --timeout-minutes ` +
        `if you need to know how much longer.`
    : `\nThe out-of-band write became visible after ${result.visibleAfterSeconds}s at ${origin}${PATH}.`
);
if (result.visibleAfterSeconds === null) process.exitCode = 1;
