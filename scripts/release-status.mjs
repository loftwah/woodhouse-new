import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { computeSourceDigest } from "./source-digest.mjs";

const root = process.cwd();
const previewUrl = "https://woodhouse-loftwah-preview.loftwah.workers.dev";

// The preview acceptance journey pnpm run deploy insists on. Kept in step with
// scripts/deploy-production.mjs, which is the enforcing gate.
const requiredChecks = [
  "publicRouteMatrix",
  "privacyScan",
  "desktopAndMobile",
  "ownerPasskeyLogin",
  "editorDraftRevisionPreviewSchedulePublish",
  "searchRssSitemapUpdates",
  "mediaUploadAndRender",
  "publicDraftIsolation",
  "menuEditing",
  "agentMcpSchemaReadAndDraftReadback",
  "agentMcpRoleBoundary",
  "evidenceSnapshotHistory",
  "conversationPrivacyPolicy",
  "enquiryDelivery",
  "backupRecoveryDrill",
  "automaticBackupRetention",
  "scheduledPublishCron"
];

async function readPrivateJson(value) {
  const absolute = path.resolve(root, value);
  const details = await lstat(absolute).catch(() => null);
  if (!details?.isFile() || details.size === 0 || (details.mode & 0o077) !== 0) return null;
  try {
    return JSON.parse(await readFile(absolute, "utf8"));
  } catch {
    return null;
  }
}

async function digestOf(absolute) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(absolute)) hash.update(chunk);
  return hash.digest("hex");
}

function command(args) {
  const result = spawnSync("pnpm", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    return { ok: false, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
  const output = `${result.stdout ?? ""}`;
  const offset = output.search(/[[{]/);
  let json = null;
  if (offset >= 0) {
    try {
      json = JSON.parse(output.slice(offset));
    } catch {
      json = null;
    }
  }
  return { ok: true, output, json };
}

const blocked = [];
const ready = [];

const digest = await computeSourceDigest(root);
console.log(`Woodhouse release status. Source fingerprint ${digest}`);

const preview = await readPrivateJson(".release/preview-deployment.json");
if (!preview) {
  blocked.push("No .release/preview-deployment.json: run pnpm run deploy:preview.");
} else if (preview.sourceDigest !== digest) {
  blocked.push(
    `Preview Worker ${preview.workerVersion} was deployed from an older source; run pnpm run deploy:preview.`
  );
} else {
  ready.push(`Preview ${preview.workerVersion} matches this source at ${preview.url}.`);
}

const active = command([
  "exec",
  "wrangler",
  "deployments",
  "status",
  "--name",
  "woodhouse-loftwah-preview",
  "--json"
]);
const activeVersion = Array.isArray(active.json?.versions) ? active.json.versions[0] : null;
if (
  active?.ok &&
  activeVersion?.version_id === preview?.workerVersion &&
  activeVersion.percentage === 100
)
  ready.push(`Preview ${activeVersion.version_id} is the active 100% deployment.`);
else
  blocked.push(
    `Preview ${preview?.workerVersion ?? "unknown"} is not the active 100% deployment; check pnpm run deploy:preview.`
  );

const smoke = await fetch(`${previewUrl}/robots.txt`, { signal: AbortSignal.timeout(30000) }).catch(
  () => null
);
if (smoke?.ok) ready.push(`Preview hostname responds HTTP ${smoke.status}.`);
else blocked.push("Preview hostname did not respond.");

const migration = command([
  "exec",
  "emdash",
  "migrate",
  "--check",
  "--wrangler-config",
  "wrangler.jsonc",
  "--wrangler-env",
  "production",
  "--json"
]);
const status = Array.isArray(migration.json) ? migration.json.at(-1) : migration.json;
if (migration.ok && status && !status.pending?.length && !status.unknownApplied?.length)
  ready.push("Production core migrations are clean.");
else blocked.push("Production core migration status is not clean; review it before deploying.");

const content = command(["run", "verify:content", "--", "production"]);
if (content.ok)
  ready.push("Production holds the Woodhouse collections and public-safe starter records.");
else blocked.push("Production does not hold the Woodhouse content model and starter records yet.");

const secrets = command([
  "exec",
  "wrangler",
  "secret",
  "list",
  "--name",
  "woodhouse-loftwah",
  "--format=json"
]);
const names = new Set(
  (Array.isArray(secrets.json) ? secrets.json : []).map((secret) => secret.name)
);
const missingSecrets = ["RESEND_API_KEY", "EMDASH_ENCRYPTION_KEY"].filter(
  (name) => !names.has(name)
);
if (missingSecrets.length)
  blocked.push(`Production Worker is missing secret names: ${missingSecrets.join(", ")}.`);
else ready.push("Production Worker holds both required secret names.");

const receipt = await readPrivateJson(".release/production-ready.json");
if (!receipt) {
  blocked.push("No .release/production-ready.json acceptance receipt.");
} else {
  if (receipt.operatorConfirmed !== "woodhouse.loftwah.com")
    blocked.push("The receipt does not confirm the production hostname woodhouse.loftwah.com.");
  if (receipt.preview?.sourceDigest !== digest)
    blocked.push("The receipt was written for a different source fingerprint.");
  if (!receipt.production?.contentModelMigrated)
    blocked.push("The receipt does not record the production content-model migration.");
  if (!receipt.production?.starterContentVerified)
    blocked.push("The receipt does not record verified production starter content.");
  if (!receipt.production?.backup?.encryptionKeyBackupReference)
    blocked.push("The receipt does not name an out-of-band encryption-key recovery record.");

  const recorded = [];
  const stale = [];
  for (const check of requiredChecks) {
    const evidence = receipt.preview?.checks?.[check];
    if (!evidence || evidence.passed !== true) {
      recorded.push(`  ${check}: not recorded`);
      continue;
    }
    const observedAt = Date.parse(evidence.observedAt ?? "");
    const artifact = await lstat(path.resolve(root, evidence.artifactPath ?? "")).catch(() => null);
    const fresh =
      Number.isFinite(observedAt) &&
      observedAt <= Date.now() + 60_000 &&
      Date.now() - observedAt < 30 * 24 * 60 * 60 * 1000;
    const intact =
      artifact?.isFile() &&
      artifact.size > 0 &&
      (artifact.mode & 0o077) === 0 &&
      (await digestOf(path.resolve(root, evidence.artifactPath))) === evidence.sha256;
    if (fresh && intact)
      recorded.push(`  ${check}: evidence from ${evidence.observedAt.slice(0, 10)}`);
    else stale.push(`  ${check}: evidence is older than 30 days or does not match its digest`);
  }
  const accepted = requiredChecks.length - recorded.length - stale.length;
  console.log(
    `\nPreview acceptance evidence: ${accepted}/${requiredChecks.length} checks carry a fresh, intact artifact.`
  );
  if (recorded.length) console.log(recorded.join("\n"));
  if (stale.length) console.log(stale.join("\n"));
}

console.log("");
for (const item of ready) console.log(`ready   ${item}`);
for (const item of blocked) console.log(`blocked ${item}`);
console.log("");
console.log(
  blocked.length
    ? "pnpm run deploy will refuse until every blocked item is resolved and recorded."
    : "Every gate condition is recorded; pnpm run deploy will proceed."
);
process.exitCode = blocked.length ? 1 : 0;
