// The observed failure: the public journal was held behind unaccepted CMS
// authoring/recovery workflows. This path releases only the reading surfaces.
// Every CMS endpoint, mutation, preview request and cron is disabled at the edge;
// deploy-production.mjs keeps the full editorial acceptance contract.
import { spawnSync } from "node:child_process";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { computeSourceDigest } from "./source-digest.mjs";
import { awaitBuildIdentity } from "./verify-build-identity.mjs";
import { assertPublicationContent, previewReceiptIsFresh } from "./publication-content.mjs";

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
function run(binary, args, options = {}) {
  const result = spawnSync(binary, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, WOODHOUSE_PUBLICATION_MODE: "read-only" },
    ...options
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${binary} ${args.slice(0, 3).join(" ")} failed.\n${result.stderr ?? ""}`);
  return result.stdout ?? "";
}
function json(output) {
  return JSON.parse(output.slice(output.search(/[[{]/)));
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
  for (const [pathname, method] of cases) {
    const response = await fetch(origin + pathname, {
      method,
      redirect: "manual",
      signal: AbortSignal.timeout(30000)
    });
    if (response.status !== 404 || !response.headers.get("cache-control")?.includes("no-store"))
      throw new Error(`Read-only boundary failed for ${method} ${pathname}: ${response.status}`);
    await response.body?.cancel();
  }
  for (const cookie of [
    "emdash-edit-mode=%74rue",
    "emdash-edit-mode = true",
    'emdash-edit-mode="true"'
  ]) {
    const response = await fetch(origin + "/", {
      headers: { Cookie: cookie },
      redirect: "manual",
      signal: AbortSignal.timeout(30000)
    });
    if (response.status !== 404 || !response.headers.get("cache-control")?.includes("no-store"))
      throw new Error("Encoded edit-mode cookie bypassed the publication boundary.");
    await response.body?.cancel();
  }
  const html = await fetch(origin + "/contact/", { signal: AbortSignal.timeout(30000) }).then((r) =>
    r.text()
  );
  if (/<form\b/.test(html))
    throw new Error("The read-only contact page advertises an inactive form.");
  checks.push("CMS, previews, mutations and enquiry form are disabled");
}

if (environment === "production") {
  if (run("git", ["status", "--porcelain"]).trim())
    throw new Error("Production requires a clean reviewed tree.");
  if (run("git", ["branch", "--show-current"]).trim() !== "main")
    throw new Error("Production publication must be built from main.");
  run("git", ["fetch", "origin", "main"]);
  if (run("git", ["rev-parse", "HEAD"]).trim() !== run("git", ["rev-parse", "origin/main"]).trim())
    throw new Error("Production publication must match origin/main.");
  const receipt = JSON.parse(
    await readFile(path.join(root, ".release/publication-preview.json"), "utf8")
  );
  if (
    receipt.sourceDigest !== sourceDigest ||
    receipt.mode !== "read-only" ||
    !previewReceiptIsFresh(receipt)
  )
    throw new Error("A fresh matching read-only preview is required.");
  const active = json(
    run("pnpm", [
      "exec",
      "wrangler",
      "deployments",
      "status",
      "--name",
      targets.preview.worker,
      "--json"
    ])
  );
  if (
    active.versions?.length !== 1 ||
    active.versions[0].percentage !== 100 ||
    active.versions[0].version_id !== receipt.workerVersion
  )
    throw new Error("Accepted preview is not the active 100% deployment.");
  const identity = await awaitBuildIdentity(targets.preview.origin, {
    expectedDigest: sourceDigest,
    expectedEnvironment: "preview"
  });
  if (!identity.ok) throw new Error("Preview no longer serves the reviewed source.");
  await verifyServedContent(targets.preview.origin, identity.identity);
  await verifyBoundary(targets.preview.origin);
  run("pnpm", ["run", "audit:pages", "--", targets.preview.origin], { stdio: "inherit" });
  run("pnpm", ["run", "backup:d1:bookmark", "--", "production"], { stdio: "inherit" });
}
run("pnpm", ["run", "verify:content", "--", environment], { stdio: "inherit" });
run("pnpm", ["run", environment === "production" ? "build" : "build:preview"], {
  stdio: "inherit"
});
const migration = json(
  run("pnpm", [
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
config.triggers = { crons: [] };
await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
const deployment = run("pnpm", [
  "exec",
  "wrangler",
  "deploy",
  "--config",
  configPath,
  "--message",
  `Public journal ${environment}: ${sourceDigest.slice(0, 24)}`
]);
for (const line of deployment.split(/\r?\n/)) {
  if (/^(Uploaded |Deployed |Current Version ID:)/.test(line)) console.log(line);
}
const workerVersion = /Current Version ID:\s*([a-f0-9-]{36})/i.exec(deployment)?.[1];
if (!workerVersion) throw new Error("Wrangler did not return the deployed Worker version.");
const identity = await awaitBuildIdentity(target.origin, {
  expectedDigest: sourceDigest,
  expectedEnvironment: environment
});
if (!identity.ok || (environment === "production" && identity.identity?.gitClean !== true))
  throw new Error("The deployed origin does not report the intended reviewed build.");
await verifyServedContent(target.origin, identity.identity);
await verifyBoundary(target.origin);
run("pnpm", ["run", "audit:pages", "--", target.origin], { stdio: "inherit" });
const active = json(
  run("pnpm", ["exec", "wrangler", "deployments", "status", "--name", target.worker, "--json"])
);
if (
  active.versions?.length !== 1 ||
  active.versions[0].percentage !== 100 ||
  active.versions[0].version_id !== workerVersion
)
  throw new Error("The new Worker is not active at 100% traffic.");
const directory = path.join(root, ".release");
await mkdir(directory, { recursive: true, mode: 0o700 });
await chmod(directory, 0o700);
const manifest = {
  environment,
  origin: target.origin,
  mode: "read-only",
  workerVersion,
  sourceDigest,
  gitCommit: identity.identity.gitCommit,
  content: identity.identity.content,
  checks,
  deployedAt: new Date().toISOString()
};
const receiptPath = path.join(directory, `publication-${environment}.json`);
await writeFile(receiptPath, JSON.stringify(manifest, null, 2) + "\n", { mode: 0o600 });
await chmod(receiptPath, 0o600);
console.log(
  `Public journal verified at ${target.origin}; Worker ${workerVersion} serves 100% traffic.`
);
