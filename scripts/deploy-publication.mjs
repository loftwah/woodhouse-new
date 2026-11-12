// The observed failure: the public journal was held behind unaccepted CMS
// authoring/recovery workflows. This path releases only the reading surfaces.
// Every CMS endpoint, mutation, preview request and cron is disabled at the edge;
// deploy-production.mjs keeps the full editorial acceptance contract.
import { execFile } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { promisify } from "node:util";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { computeSourceDigest } from "./source-digest.mjs";
import { awaitBuildIdentity } from "./verify-build-identity.mjs";
import { assertPublicationContent, previewReceiptIsFresh } from "./publication-content.mjs";
import { publicationAuditScope, auditScopeArguments } from "./publication-audit-scope.mjs";
import { showcasePublication } from "./showcase-publication.mjs";

const root = process.cwd();
const environment = process.argv.filter((arg) => arg !== "--")[2];
if (!["preview", "production"].includes(environment))
  throw new Error("Usage: pnpm run deploy:publication -- preview|production");
const targets = {
  preview: {
    worker: "woodhouse-loftwah-preview",
    origin: "https://woodhouse-loftwah-preview.loftwah.workers.dev",
    database: "woodhouse-emdash-preview",
    databaseId: "f5274c8f-d22e-4d63-bb0e-832e2d2b4f00",
    bucket: "woodhouse-emdash-media-preview",
    cache: "756d893239394378bf4fad91bd55a22a",
    session: "af0af0c0541b494cbfb6ce022fe6be91"
  },
  production: {
    worker: "woodhouse-loftwah",
    origin: "https://woodhouse.loftwah.com",
    database: "woodhouse-emdash",
    databaseId: "b62500b4-b25a-4fad-8969-eff9ba3c8efa",
    bucket: "woodhouse-emdash-media",
    cache: "e6a825b66fc445f8bc425a9af2a027ec",
    session: "fc5ed72d180343e49a351ef10dec1e51"
  }
};
const target = targets[environment];
let auditScope = publicationAuditScope(process.argv.slice(3));

// The owner target is three minutes from change to verified production, five at
// the outside. A claim about the release path is only worth what the receipt
// says, so every release records where its own time went. These marks are
// bookkeeping, not gates: a slow provider upload is reported, never converted
// into a failed release or a passing one.
const startedAt = Date.now();
const durations = [];
async function timed(stage, operation) {
  const start = Date.now();
  try {
    return await operation();
  } finally {
    durations.push({ stage, ms: Date.now() - start });
  }
}
const exec = promisify(execFile);
async function run(binary, args, { verbose = false } = {}) {
  const child = exec(binary, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, WOODHOUSE_PUBLICATION_MODE: "read-only" }
  });
  if (verbose) {
    child.child.stdout.pipe(process.stdout, { end: false });
    child.child.stderr.pipe(process.stderr, { end: false });
  }
  try {
    return (await child).stdout;
  } catch (error) {
    throw new Error(`${binary} ${args.slice(0, 3).join(" ")} failed.\n${error.stderr ?? ""}`, {
      cause: error
    });
  }
}

// Drain each group on failure as well. In particular, a rejected remote check
// cannot leave a build in flight while the operator starts a retry.
async function together(operations) {
  const entries = Object.entries(operations);
  const results = await Promise.allSettled(
    entries.map(([stage, operation]) => timed(stage, operation))
  );
  const failed = results.flatMap((result, i) =>
    result.status === "rejected" ? [`${entries[i][0]}: ${result.reason.message}`] : []
  );
  if (failed.length) throw new Error(failed.join("\n"));
  return Object.fromEntries(entries.map(([stage], i) => [stage, results[i].value]));
}
// The page audit runs immediately after `wrangler deploy`, and a Worker takes a
// few seconds to answer from every edge node. Twice now the audit failed on the
// first pass and passed unchanged a minute later — a propagation race reported as
// a content failure. The audit is read-only and idempotent, so retrying it is
// safe; the attempt that finally passed is named in the output.
async function auditPages(origin, scope) {
  const args = ["run", "audit:pages", "--", origin, ...auditScopeArguments(scope)];
  // Full production audits saw intermittent failures on public record reads
  // at the default rate. Four requests per second passed the same assertions.
  if (environment === "production" && scope === null) args.push("--request-interval=250");
  for (let attempt = 1; ; attempt += 1) {
    try {
      await run("pnpm", args, { verbose: true });
      if (attempt > 1) console.log(`Page audit passed on attempt ${attempt}.`);
      return;
    } catch (error) {
      if (attempt === 3) throw error;
      console.log(`Page audit attempt ${attempt} failed; retrying in ${attempt * 5}s.`);
      await delay(attempt * 5000);
    }
  }
}

function json(output) {
  return JSON.parse(output.slice(output.search(/[[{]/)));
}
async function verifySecretNames() {
  const secrets = json(
    await run("pnpm", [
      "exec",
      "wrangler",
      "secret",
      "list",
      "--config",
      "wrangler.jsonc",
      "--name",
      target.worker,
      "--format=json"
    ])
  );
  const names = new Set(secrets.map((entry) => entry.name));
  const expected = [
    "RESEND_API_KEY",
    "EMDASH_ENCRYPTION_KEY",
    ...(environment === "production" ? ["WOODHOUSE_GITHUB_TOKEN"] : [])
  ];
  if (expected.some((name) => !names.has(name)))
    throw Error("Required Worker secret names are missing.");
  return [...names].sort();
}
const sourceDigest = await computeSourceDigest(root);
const checks = [];
const seed = JSON.parse(await readFile(path.join(root, "seed/seed.json"), "utf8"));

async function verifyServedContent(origin, identity) {
  const response = await fetch(origin + "/agents/facts.json", {
    signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error("Public facts are unavailable.");
  assertPublicationContent(seed, identity, await response.json());
  const report = seed.content.dispatches
    .filter(
      (entry) =>
        entry.status === "published" &&
        entry.data.public_safe &&
        entry.data.kind === "Portfolio report"
    )
    .sort((a, b) => b.data.review_date.localeCompare(a.data.review_date))[0];
  const page = await fetch(origin + `/dispatches/${report.slug}/`, {
    signal: AbortSignal.timeout(30000)
  });
  const html = await page.text();
  if (!page.ok || !html.includes(report.data.title) || !html.includes(report.data.review_date))
    throw new Error("Latest reviewed portfolio report is absent.");
  checks.push("Served content matches the reviewed seed and latest portfolio report");
}

async function verifyBoundary(origin) {
  const cases = [
    ["/_emdash/admin", "GET"],
    ["/_emdash/api/mcp", "GET"],
    ["/_emdash/api/content", "POST"],
    ["/_emdash/api/plugins/woodhouse-enquiries/submit", "POST"],
    ["/%5Femdash/admin", "GET"],
    ["/?_preview=publication-probe", "GET"],
    ["/", "POST"]
  ];
  // A Worker takes a few seconds to serve every edge node after a deploy. Asking
  // once turned that settling time into "bypassed the publication boundary" —
  // an alarming sentence for a transient, and the kind of false alarm that
  // teaches an operator to rerun without reading. Anything that answers 2xx is
  // a real bypass and fails at once; only an infrastructure-shaped answer
  // (5xx, reset, timeout) is retried, and the last observation is reported.
  const probe = async (url, init, describe) => {
    let last = "";
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      let response;
      try {
        response = await fetch(url, {
          ...init,
          redirect: "manual",
          signal: AbortSignal.timeout(30000)
        });
      } catch (error) {
        last = `the request failed (${error?.name ?? "Error"})`;
        if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
        continue;
      }
      const status = response.status;
      const cacheControl = response.headers.get("cache-control") ?? "";
      await response.body?.cancel();
      if (status >= 200 && status < 300)
        throw new Error(`${describe} answered ${status}, which is a publication bypass.`);
      if (status === 404 && cacheControl.includes("no-store")) return;
      last = `${status} with cache-control "${cacheControl}"`;
      if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
    }
    throw new Error(`${describe} never settled on 404 no-store; last answer was ${last}.`);
  };
  for (const [pathname, method] of cases)
    await probe(origin + pathname, { method }, `The read-only boundary for ${method} ${pathname}`);
  for (const cookie of [
    "emdash-edit-mode=%74rue",
    "emdash-edit-mode = true",
    'emdash-edit-mode="true"'
  ])
    await probe(origin + "/", { headers: { Cookie: cookie } }, `The edit-mode cookie ${cookie}`);
  const html = await fetch(origin + "/contact/", { signal: AbortSignal.timeout(30000) }).then((r) =>
    r.text()
  );
  if (/<form\b/.test(html))
    throw new Error("The read-only contact page advertises an inactive form.");
  checks.push("CMS, previews, mutations and enquiry form are disabled");
}

async function verifyMain() {
  if ((await run("git", ["status", "--porcelain"])).trim())
    throw new Error("Production requires a clean reviewed tree.");
  if ((await run("git", ["branch", "--show-current"])).trim() !== "main")
    throw new Error("Production publication must be built from main.");
  await run("git", ["fetch", "origin", "main"]);
  const [head, remoteMain] = (await run("git", ["rev-parse", "HEAD", "origin/main"]))
    .trim()
    .split("\n");
  if (head !== remoteMain) throw new Error("Production publication must match origin/main.");
}

async function verifyPreview() {
  const receipt = JSON.parse(
    await readFile(path.join(root, ".release/publication-preview.json"), "utf8")
  );
  if (
    receipt.sourceDigest !== sourceDigest ||
    receipt.mode !== "read-only" ||
    !previewReceiptIsFresh(receipt)
  )
    throw new Error("A fresh matching read-only preview is required.");
  // Production audits exactly the pages accepted in preview. The full audit
  // is represented explicitly by null, never by a missing receipt field.
  if (!Object.hasOwn(receipt, "auditScope")) throw new Error("Preview audit scope is missing.");
  auditScopeArguments(receipt.auditScope);
  if (
    process.argv.some((arg) => arg === "--full-audit" || arg.startsWith("--path=")) &&
    JSON.stringify(auditScope) !== JSON.stringify(receipt.auditScope)
  )
    throw new Error("Production audit scope differs from the accepted preview.");
  auditScope = receipt.auditScope;
  await verifyActiveVersion(targets.preview.worker, receipt.workerVersion);
}

async function verifyActiveVersion(worker, version) {
  const active = json(
    await run("pnpm", [
      "exec",
      "wrangler",
      "deployments",
      "status",
      "--config",
      "wrangler.jsonc",
      "--name",
      worker,
      "--json"
    ])
  );
  if (
    active.versions?.length !== 1 ||
    active.versions[0].percentage !== 100 ||
    active.versions[0].version_id !== version
  )
    throw new Error(`${worker} is not serving expected version ${version} at 100% traffic.`);
}
// The observed failure would be a healthy CMS release with a missing analytics
// schema, silently disabling engagement. These are application tables, never
// entries in EmDash's core migration ledger. Mutation is a separate reviewed step.
const analyticsSchemaObjects = [
  "wh_analytics_events",
  "wh_analytics_sessions",
  "wh_analytics_daily",
  "wh_analytics_limits",
  "wh_analytics_reports",
  "wh_analytics_rollup",
  "wh_analytics_mode_rollup",
  "wh_analytics_browser_visits",
  "wh_analytics_browser_coverage"
];
async function verifyAnalyticsSchema() {
  const analyticsSchema = json(
    await run("pnpm", [
      "exec",
      "wrangler",
      "d1",
      "execute",
      target.database,
      "--config",
      "wrangler.jsonc",
      "--env",
      environment,
      "--remote",
      "--json",
      "--command",
      `SELECT name FROM sqlite_master WHERE name IN (${analyticsSchemaObjects.map((name) => "'" + name + "'").join(",")})`
    ])
  );
  const actualSchema = new Set(
    analyticsSchema.flatMap((result) => result.results ?? []).map((row) => row.name)
  );
  if (analyticsSchemaObjects.some((name) => !actualSchema.has(name)))
    throw new Error("Reviewed portfolio analytics schema must be applied before publication.");
}

async function verifyMigrations() {
  const migration = json(
    await run("pnpm", [
      "exec",
      "emdash",
      "migrate",
      "--check",
      "--wrangler-config",
      "wrangler.jsonc",
      "--wrangler-env",
      environment,
      "--json"
    ])
  );
  if (
    !Array.isArray(migration.pending) ||
    !Array.isArray(migration.unknownApplied) ||
    migration.pending.length ||
    migration.unknownApplied.length
  )
    throw new Error("Core migrations must already be clean; publication does not apply them.");
}

const preflight = await together({
  build: () =>
    run("pnpm", ["run", environment === "production" ? "build" : "build:preview"], {
      verbose: true
    }),
  "secret inventory before deploy": verifySecretNames,
  "database readiness": async () => {
    // Keep read-only D1 commands serial against the same database. Only the
    // independent build, Worker inventory and Git/preview checks overlap them.
    await timed("analytics schema", verifyAnalyticsSchema);
    await timed("content model", () =>
      run("pnpm", ["run", "verify:content", "--", environment], {
        verbose: true
      })
    );
    await timed("migration check", verifyMigrations);
  },
  ...(environment === "production"
    ? {
        "main and accepted preview": async () => {
          await verifyMain();
          await verifyPreview();
        }
      }
    : {})
});
const secretNamesBefore = preflight["secret inventory before deploy"];
if (environment === "production") {
  await timed("production recovery point", () =>
    run("pnpm", ["run", "backup:d1:bookmark", "--", "production"], { verbose: true })
  );
}
const configPath = path.join(root, "dist/server/wrangler.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
const db = config.d1_databases?.find((entry) => entry.binding === "DB");
const cache = config.kv_namespaces?.find((entry) => entry.binding === "CACHE");
const session = config.kv_namespaces?.find((entry) => entry.binding === "SESSION");
if (
  config.name !== target.worker ||
  db?.database_name !== target.database ||
  db?.database_id !== target.databaseId ||
  config.r2_buckets?.length !== 1 ||
  config.r2_buckets[0]?.bucket_name !== target.bucket ||
  cache?.id !== target.cache ||
  session?.id !== target.session ||
  config.vars?.WOODHOUSE_ENVIRONMENT !== environment ||
  (environment === "preview"
    ? config.routes?.length !== 0
    : config.routes?.length !== 1 ||
      config.routes[0]?.pattern !== "woodhouse.loftwah.com" ||
      config.routes[0]?.custom_domain !== true)
)
  throw new Error("Publication manifest does not match the configured environment.");
config.vars.WOODHOUSE_PUBLICATION_MODE = "read-only";
// An unaccepted scheduler must not run, even when the runtime handler would refuse it.
// Analytics-only schedule never invokes CMS maintenance or authoring.
config.triggers = { crons: environment === "production" ? ["17 * * * *"] : [] };
await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
if ((await computeSourceDigest(root)) !== sourceDigest)
  throw new Error("Source changed during preflight; rebuild before uploading.");
const deployment = await timed("upload and deploy", () =>
  run("pnpm", [
    "exec",
    "wrangler",
    "deploy",
    "--config",
    configPath,
    "--message",
    `Public journal ${environment}: ${sourceDigest.slice(0, 24)}`
  ])
);
for (const line of deployment.split(/\r?\n/)) {
  if (/^(Uploaded |Deployed |Current Version ID:)/.test(line)) console.log(line);
}
const workerVersion = /Current Version ID:\s*([a-f0-9-]{36})/i.exec(deployment)?.[1];
if (!workerVersion) throw new Error("Wrangler did not return the deployed Worker version.");
const identity = await timed("build identity", () =>
  awaitBuildIdentity(target.origin, {
    expectedDigest: sourceDigest,
    expectedEnvironment: environment
  })
);
if (!identity.ok || (environment === "production" && identity.identity?.gitClean !== true))
  throw new Error("The deployed origin does not report the intended reviewed build.");
const verified = await together({
  "served content": () => verifyServedContent(target.origin, identity.identity),
  "publication boundary": () => verifyBoundary(target.origin),
  "secret inventory": verifySecretNames
});
const secretNames = verified["secret inventory"];
// Leave the crawler isolated from the other origin probes so they cannot add
// load to the public record reads during a sitemap-wide audit.
await timed("page audit", () => auditPages(target.origin, auditScope));
// The audit can retry; check traffic last so a replaced version cannot earn a receipt.
await timed("active traffic", () => verifyActiveVersion(target.worker, workerVersion));
const directory = path.join(root, ".release");
await mkdir(directory, { recursive: true, mode: 0o700 });
await chmod(directory, 0o700);
const manifest = {
  environment,
  origin: target.origin,
  mode: "read-only",
  auditScope,
  workerVersion,
  sourceDigest,
  gitCommit: identity.identity.gitCommit,
  secretNames,
  content: identity.identity.content,
  checks,
  durations: { totalMs: Date.now() - startedAt, stages: durations },
  deployedAt: new Date().toISOString()
};
if (secretNamesBefore.some((name) => !manifest.secretNames.includes(name)))
  throw Error("A previously installed Worker secret is missing after deployment.");
const receiptPath = path.join(directory, `publication-${environment}.json`);
await writeFile(receiptPath, JSON.stringify(manifest, null, 2) + "\n", { mode: 0o600 });
await chmod(receiptPath, 0o600);
const totalSeconds = ((Date.now() - startedAt) / 1000).toFixed(1);
console.log(
  `Public journal verified at ${target.origin}; Worker ${workerVersion} serves 100% traffic.`
);
console.log(
  `Release timing (${environment}): ${totalSeconds}s wall time (stages overlap) — ` +
    durations.map((entry) => `${entry.stage} ${(entry.ms / 1000).toFixed(1)}s`).join(", ")
);
const showcase = await showcasePublication(manifest);
if (!["not_production", "not_prepared"].includes(showcase.status)) {
  console.log("Discord showcase: " + JSON.stringify(showcase));
}
