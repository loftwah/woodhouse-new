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
// Usage: node scripts/measure-content-visibility.mjs --environment=preview

import { spawnSync } from "node:child_process";

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
const TIMEOUT_MS = 15 * 60 * 1000;

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
if (currentDeck.includes("visibility-probe-"))
  throw new Error(`${SLUG} already carries a probe token; run the cleanup path first.`);

async function visible() {
  const response = await fetch(`${origin}${PATH}`, {
    signal: AbortSignal.timeout(60000),
    headers: { "cache-control": "no-cache" }
  });
  if (!response.ok) return false;
  return (await response.text()).includes(token);
}

const result = { environment, origin, path: PATH, token, polls: [] };
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
  sql(`UPDATE ec_dispatches SET deck = ${quote(currentDeck)} WHERE slug = ${quote(SLUG)}`);
  result.reverted = true;
}

console.log(JSON.stringify(result, null, 2));
console.log(
  result.visibleAfterSeconds === null
    ? `\nThe probe was never visible within ${Math.round(TIMEOUT_MS / 60000)} minutes.`
    : `\nThe out-of-band write became visible after ${result.visibleAfterSeconds}s at ${origin}${PATH}.`
);
if (result.visibleAfterSeconds === null) process.exitCode = 1;
