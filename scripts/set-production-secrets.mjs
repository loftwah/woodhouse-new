import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Publish the production Worker's secret names from the operator's ignored
// local .env. Values are never printed, logged or written outside a 0600
// temporary file that is removed in a finally block.
//
// This deliberately refuses any local variable that looks like a credential
// but is not one of the two names the production Worker expects, so a stray
// R2 or third-party token cannot be uploaded by accident.

const PRODUCION_WORKER = "woodhouse-loftwah";
const EXPECTED = ["RESEND_API_KEY", "EMDASH_ENCRYPTION_KEY"];
const root = process.cwd();

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

function fail(message) {
  console.error("Production secrets not published: " + message);
  process.exit(1);
}

const localEnv = parseEnv(await readFile(path.join(root, ".env"), "utf8"));
for (const name of localEnv.keys()) {
  if (/(?:key|token|secret|password)/i.test(name) && !EXPECTED.includes(name))
    fail(`refusing to upload unreviewed local secret ${name}.`);
}

const missing = EXPECTED.filter((name) => !localEnv.get(name));
if (missing.length) fail(`the ignored local .env is missing ${missing.join(", ")}.`);

if (!/^emdash_enc_v1_[A-Za-z0-9_-]{43}$/.test(localEnv.get("EMDASH_ENCRYPTION_KEY")))
  fail("the local EmDash encryption key has an unexpected format.");
if (localEnv.get("RESEND_API_KEY").startsWith("re_") === false)
  fail("the local Resend key does not look like a Resend API key.");

const current = spawnSync(
  "pnpm",
  ["exec", "wrangler", "secret", "list", "--name", PRODUCION_WORKER, "--format=json"],
  { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }
);
const existing = new Set();
if (current.status === 0) {
  const offset = current.stdout.search(/[[{]/);
  if (offset >= 0)
    for (const secret of JSON.parse(current.stdout.slice(offset))) existing.add(secret.name);
}

const tempDir = await mkdtemp(path.join(os.tmpdir(), "woodhouse-production-secrets-"));
const secretsFile = path.join(tempDir, "secrets.env");
try {
  await writeFile(
    secretsFile,
    EXPECTED.map((name) => `${name}=${localEnv.get(name)}`).join("\n") + "\n",
    { mode: 0o600 }
  );
  const publish = spawnSync(
    "pnpm",
    ["exec", "wrangler", "secret", "bulk", secretsFile, "--name", PRODUCION_WORKER],
    { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 8 * 1024 * 1024 }
  );
  if (publish.error) throw publish.error;
  if (publish.status !== 0) {
    console.error((publish.stderr ?? publish.stdout ?? "").split("\n").slice(-6).join("\n"));
    fail("Wrangler rejected the production secrets.");
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

const verify = spawnSync(
  "pnpm",
  ["exec", "wrangler", "secret", "list", "--name", PRODUCION_WORKER, "--format=json"],
  { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }
);
const names = new Set();
const offset = verify.stdout.search(/[[{]/);
if (offset >= 0)
  for (const secret of JSON.parse(verify.stdout.slice(offset))) names.add(secret.name);
const stillMissing = EXPECTED.filter((name) => !names.has(name));
if (stillMissing.length) fail(`secret names were not published: ${stillMissing.join(", ")}.`);

await mkdir(path.join(root, ".release"), { recursive: true, mode: 0o700 });
await chmod(path.join(root, ".release"), 0o700);
await writeFile(
  path.join(root, ".release/production-secrets.json"),
  `${JSON.stringify(
    {
      worker: PRODUCION_WORKER,
      names: EXPECTED,
      publishedAt: new Date().toISOString(),
      recovery:
        "Values come from the operator's ignored local .env. The same EMDASH_ENCRYPTION_KEY protects preview and production encrypted settings, so one copy of that file is the recovery path for both.",
      added: EXPECTED.filter((name) => !existing.has(name)),
      unchanged: EXPECTED.filter((name) => existing.has(name))
    },
    null,
    2
  )}\n`,
  { mode: 0o600 }
);

console.log(
  `Published ${EXPECTED.join(", ")} to ${PRODUCION_WORKER}. Added: ${
    EXPECTED.filter((name) => !existing.has(name)).join(", ") || "none"
  }. Values were not printed or logged.`
);
