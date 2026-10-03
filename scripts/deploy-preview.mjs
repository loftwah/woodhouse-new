import { spawnSync } from "node:child_process";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { computeSourceDigest } from "./source-digest.mjs";

const root = process.cwd();
const previewUrl = "https://woodhouse-loftwah-preview.loftwah.workers.dev";
const expected = {
  name: "woodhouse-loftwah-preview",
  database: { name: "woodhouse-emdash-preview", id: "f5274c8f-d22e-4d63-bb0e-832e2d2b4f00" },
  buckets: ["woodhouse-emdash-media-preview"],
  kv: { CACHE: "756d893239394378bf4fad91bd55a22a", SESSION: "af0af0c0541b494cbfb6ce022fe6be91" }
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(
      `${command} ${args[0] ?? ""} failed with exit code ${result.status ?? "unknown"}.`
    );
}

function parseEnv(contents) {
  const values = new Map();
  for (const line of contents.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    values.set(match[1], value);
  }
  return values;
}

run("pnpm", ["build:preview"]);

const config = JSON.parse(await readFile(path.join(root, "dist/server/wrangler.json"), "utf8"));
const d1 = config.d1_databases?.find((binding) => binding.binding === "DB");
const r2 = config.r2_buckets?.map((binding) => binding.bucket_name) ?? [];
const kv = Object.fromEntries(
  (config.kv_namespaces ?? []).map((binding) => [binding.binding, binding.id])
);
const hasLoader = config.worker_loaders?.some((binding) => binding.binding === "LOADER");
if (
  config.name !== expected.name ||
  config.routes?.length !== 0 ||
  d1?.database_name !== expected.database.name ||
  d1?.database_id !== expected.database.id ||
  JSON.stringify([...r2].sort()) !== JSON.stringify([...expected.buckets].sort()) ||
  kv.CACHE !== expected.kv.CACHE ||
  kv.SESSION !== expected.kv.SESSION ||
  !hasLoader ||
  config.vars?.WOODHOUSE_ENVIRONMENT !== "preview"
) {
  throw new Error(
    "Preview manifest did not match the isolated Worker, database, buckets, cache, session and route configuration; no deployment was attempted."
  );
}
console.log(
  "Preview manifest verified: isolated D1/R2/KV, Worker Loader, and no custom-domain route."
);
run("pnpm", ["run", "verify:content", "--", "preview"]);

const localEnv = parseEnv(await readFile(path.join(root, ".env"), "utf8"));
const allowedSecrets = ["RESEND_API_KEY", "EMDASH_ENCRYPTION_KEY"];
for (const name of localEnv.keys()) {
  if (/(?:key|token|secret)/i.test(name) && !allowedSecrets.includes(name))
    throw new Error(`Refusing to upload unreviewed local secret ${name}.`);
}
const secretEntries = allowedSecrets.map((name) => [name, localEnv.get(name)]);
if (secretEntries.some(([, value]) => !value))
  throw new Error(
    "The ignored local .env must contain both preview Worker secrets; secret values are never printed."
  );
if (!/^emdash_enc_v1_[A-Za-z0-9_-]{43}$/.test(localEnv.get("EMDASH_ENCRYPTION_KEY")))
  throw new Error(
    "The local EmDash encryption key has an unexpected format; secret values are never printed."
  );
if (secretEntries.some(([, value]) => /[\r\n]/.test(value)))
  throw new Error("A configured secret contains a newline and cannot be uploaded safely.");

const tempDir = await mkdtemp(path.join(os.tmpdir(), "woodhouse-preview-secrets-"));
const secretsFile = path.join(tempDir, "worker-secrets.env");
await writeFile(
  secretsFile,
  secretEntries.map(([name, value]) => `${name}=${value}`).join("\n") + "\n",
  { mode: 0o600 }
);
const sourceDigest = await computeSourceDigest(root);
let deploymentOutput;
try {
  const deployment = spawnSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "deploy",
      "--config",
      "dist/server/wrangler.json",
      "--secrets-file",
      secretsFile
    ],
    {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024
    }
  );
  if (deployment.error) throw deployment.error;
  if (deployment.status !== 0) {
    if (deployment.stdout) process.stdout.write(deployment.stdout);
    if (deployment.stderr) process.stderr.write(deployment.stderr);
    throw new Error(`Preview deploy failed with exit code ${deployment.status ?? "unknown"}.`);
  }
  deploymentOutput = `${deployment.stdout}\n${deployment.stderr}`;
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

const response = await fetch(previewUrl, {
  signal: AbortSignal.timeout(60000),
  redirect: "manual"
});
if (!response.ok)
  throw new Error(
    `Preview Worker returned HTTP ${response.status} at ${previewUrl}; inspect the preview before proceeding.`
  );
const workerVersion = /Current Version ID:\s*([0-9a-f-]{36})/i.exec(deploymentOutput)?.[1];
if (!workerVersion)
  throw new Error(
    "Preview deployed, but Wrangler did not report a Worker version ID; no acceptance manifest was written."
  );
for (const line of deploymentOutput.split(/\r?\n/)) {
  if (/^(Uploaded |Deployed |\s+https:\/\/|\s+schedule:|Current Version ID:)/.test(line))
    console.log(line.trim());
}

const releaseDirectory = path.join(root, ".release");
await mkdir(releaseDirectory, { recursive: true, mode: 0o700 });
await chmod(releaseDirectory, 0o700);
const previewManifestPath = path.join(releaseDirectory, "preview-deployment.json");
await writeFile(
  previewManifestPath,
  `${JSON.stringify(
    {
      environment: "preview",
      worker: expected.name,
      url: previewUrl,
      workerVersion,
      sourceDigest,
      deployedAt: new Date().toISOString()
    },
    null,
    2
  )}\n`,
  { mode: 0o600 }
);
await chmod(previewManifestPath, 0o600);
console.log(
  `Preview responded at ${previewUrl} (HTTP ${response.status}); source fingerprint recorded privately.`
);
