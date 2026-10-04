import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { computeSourceDigest } from "./source-digest.mjs";
import { awaitBuildIdentity, describeIdentity } from "./verify-build-identity.mjs";
import { verifyDatabaseReadiness } from "./deployment-readiness.mjs";
import { scanPublicText } from "./public-privacy.mjs";
import {
  createR2Client,
  hasR2Credentials,
  loadLocalEnv,
  verifyBucketMatchesManifest,
  verifyBackupManifest
} from "./r2-recovery.mjs";

const root = process.cwd();
const productionUrl = "https://woodhouse.loftwah.com";
const previewUrl = "https://woodhouse-loftwah-preview.loftwah.workers.dev";
const productionDatabase = { name: "woodhouse-emdash", id: "b62500b4-b25a-4fad-8969-eff9ba3c8efa" };
const productionBucket = "woodhouse-emdash-media";
const requiredPreviewChecks = [
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
const receiptPath = path.resolve(root, ".release/production-ready.json");
const releaseRoot = path.resolve(root, ".release") + path.sep;

function fail(message) {
  console.error("Production deploy stopped: " + message);
  process.exit(1);
}

function command(args, options = {}) {
  const result = spawnSync("pnpm", args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
    ...options
  });
  if (result.error) throw result.error;
  if (result.status !== 0) fail("preflight command failed: pnpm " + args.join(" "));
  return result.stdout ?? "";
}

function parseJsonOutput(output, description) {
  const offset = output.search(/\[|[{]/);
  if (offset < 0) fail(description + " did not return JSON.");
  try {
    return JSON.parse(output.slice(offset));
  } catch {
    fail(description + " returned malformed JSON.");
  }
}

function releaseFile(value, field) {
  if (typeof value !== "string" || !value.trim()) fail(field + " must be a path under .release.");
  const absolute = path.resolve(root, value);
  if (!absolute.startsWith(releaseRoot)) fail(field + " must resolve under .release.");
  return absolute;
}

async function readPrivateJson(value, field) {
  const absolute = releaseFile(value, field);
  let details;
  try {
    details = await lstat(absolute);
  } catch {
    fail(field + " is missing or unreadable.");
  }
  if (!details.isFile() || details.size === 0 || (details.mode & 0o077) !== 0) {
    fail(field + " must be a non-empty private file with owner-only permissions.");
  }
  try {
    return { absolute, value: JSON.parse(await readFile(absolute, "utf8")) };
  } catch {
    fail(field + " is not valid JSON.");
  }
}

async function verifyPrivateEvidence(evidence, field) {
  if (
    !evidence ||
    evidence.passed !== true ||
    typeof evidence.observedAt !== "string" ||
    !/^[a-f0-9]{64}$/.test(evidence.sha256 ?? "")
  ) {
    fail(field + " must record a passing observation, timestamp and SHA-256 evidence digest.");
  }
  const observedAt = Date.parse(evidence.observedAt);
  if (
    !Number.isFinite(observedAt) ||
    observedAt > Date.now() + 60_000 ||
    Date.now() - observedAt > 30 * 24 * 60 * 60 * 1000
  ) {
    fail(field + " evidence must be less than 30 days old and not in the future.");
  }
  const absolute = releaseFile(evidence.artifactPath, field + " evidence artifact");
  const details = await lstat(absolute).catch(() => null);
  if (
    !details?.isFile() ||
    details.size === 0 ||
    (details.mode & 0o077) !== 0 ||
    (await fileSha256(absolute)) !== evidence.sha256
  ) {
    fail(
      field + " evidence must be a non-empty, owner-only artifact that matches its SHA-256 digest."
    );
  }
}

async function fileSha256(absolute) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(absolute)) hash.update(chunk);
  return hash.digest("hex");
}

function checkFresh(createdAt, field) {
  const timestamp = Date.parse(createdAt);
  if (
    !Number.isFinite(timestamp) ||
    timestamp > Date.now() + 60_000 ||
    Date.now() - timestamp > 24 * 60 * 60 * 1000
  ) {
    fail(field + " must be less than 24 hours old and not in the future.");
  }
}

const { value: receipt } = await readPrivateJson(
  path.relative(root, receiptPath),
  "Production readiness receipt"
);
if (receipt.operatorConfirmed !== "woodhouse.loftwah.com")
  fail("the receipt must explicitly confirm the production hostname.");

const currentSourceDigest = await computeSourceDigest(root);
if (
  receipt.preview?.url !== previewUrl ||
  receipt.preview?.sourceDigest !== currentSourceDigest ||
  !receipt.preview?.workerVersion
) {
  fail(
    "the receipt must identify the accepted preview URL, current source fingerprint and exact Worker version."
  );
}
const previewDeploymentPath = path.join(root, ".release/preview-deployment.json");
const { value: previewDeployment } = await readPrivateJson(
  path.relative(root, previewDeploymentPath),
  "Preview deployment manifest"
);
if (
  previewDeployment.environment !== "preview" ||
  previewDeployment.worker !== "woodhouse-loftwah-preview" ||
  previewDeployment.url !== previewUrl ||
  previewDeployment.sourceDigest !== currentSourceDigest ||
  previewDeployment.workerVersion !== receipt.preview.workerVersion
) {
  fail(
    "the accepted preview receipt does not match the latest deployed preview source and Worker version."
  );
}
const activePreviewOutput = command([
  "exec",
  "wrangler",
  "deployments",
  "status",
  "--name",
  "woodhouse-loftwah-preview",
  "--json"
]);
const activePreview = parseJsonOutput(activePreviewOutput, "Active preview deployment status");
const activePreviewVersions = activePreview.versions ?? [];
if (
  activePreviewVersions.length !== 1 ||
  activePreviewVersions[0]?.percentage !== 100 ||
  activePreviewVersions[0]?.version_id !== receipt.preview.workerVersion
) {
  fail(
    "the accepted preview Worker version is not the currently active 100% Cloudflare deployment."
  );
}
for (const check of requiredPreviewChecks) {
  await verifyPrivateEvidence(
    receipt.preview?.checks?.[check],
    "Preview acceptance check '" + check + "'"
  );
}

if (
  receipt.production?.contentModelMigrated !== true ||
  receipt.production?.starterContentVerified !== true
) {
  fail(
    "the receipt must record production content-model migration and starter-content review after the read-only checks below pass."
  );
}
const coreMigration = parseJsonOutput(
  command([
    "exec",
    "emdash",
    "migrate",
    "--check",
    "--wrangler-config",
    "wrangler.jsonc",
    "--wrangler-env",
    "production",
    "--json"
  ]),
  "EmDash core migration check"
);
const migration = Array.isArray(coreMigration) ? coreMigration.at(-1) : coreMigration;
if (migration.pending?.length || migration.unknownApplied?.length)
  fail("production core migration status is not clean; review it before deployment.");

const seed = JSON.parse(await readFile(path.join(root, "seed/seed.json"), "utf8"));
const readiness = verifyDatabaseReadiness(productionDatabase.name, seed);
if (!readiness.ready) fail("production content check failed: " + readiness.errors.join("; ") + ".");

const secretOutput = command([
  "exec",
  "wrangler",
  "secret",
  "list",
  "--name",
  "woodhouse-loftwah",
  "--format=json"
]);
const secrets = parseJsonOutput(secretOutput, "Production Worker secret inventory");
const secretNames = new Set((Array.isArray(secrets) ? secrets : []).map((secret) => secret.name));
const missingSecrets = ["RESEND_API_KEY", "EMDASH_ENCRYPTION_KEY"].filter(
  (name) => !secretNames.has(name)
);
if (missingSecrets.length)
  fail(
    "production Worker is missing required secret names: " +
      missingSecrets.join(", ") +
      ". Secret values were not read or printed."
  );

const backup = receipt.production?.backup;
if (
  typeof backup?.encryptionKeyBackupReference !== "string" ||
  !backup.encryptionKeyBackupReference.trim()
)
  fail(
    "the receipt must identify the out-of-band encryption-key recovery record without including the key value."
  );
const { value: d1Backup } = await readPrivateJson(backup.d1ManifestPath, "D1 backup manifest");
if (
  d1Backup.environment !== "production" ||
  d1Backup.database !== productionDatabase.name ||
  d1Backup.databaseId !== productionDatabase.id
)
  fail("the D1 backup manifest does not identify the verified production database.");
checkFresh(d1Backup.createdAt, "D1 recovery point");
const bookmark = d1Backup.bookmark ?? d1Backup.timeTravelBookmark;
if (typeof bookmark !== "string" || !bookmark) {
  if (
    typeof d1Backup.sqlDumpPath !== "string" ||
    !/^[a-f0-9]{64}$/.test(d1Backup.sha256 ?? "") ||
    !Number.isInteger(d1Backup.bytes)
  )
    fail("the D1 manifest must contain a Time Travel bookmark or a verified SQL dump.");
  const sqlPath = releaseFile(d1Backup.sqlDumpPath, "D1 SQL dump");
  const sqlStat = await lstat(sqlPath).catch(() => null);
  if (
    !sqlStat?.isFile() ||
    (sqlStat.mode & 0o077) !== 0 ||
    sqlStat.size !== d1Backup.bytes ||
    (await fileSha256(sqlPath)) !== d1Backup.sha256
  )
    fail("the D1 SQL dump must be private and match its byte count and SHA-256 manifest.");
} else {
  const timeTravel = parseJsonOutput(
    command([
      "exec",
      "wrangler",
      "d1",
      "time-travel",
      "info",
      productionDatabase.name,
      "--timestamp=" + d1Backup.createdAt,
      "--json"
    ]),
    "Production D1 Time Travel readback"
  );
  const actualBookmark = Array.isArray(timeTravel) ? timeTravel[0]?.bookmark : timeTravel.bookmark;
  if (actualBookmark !== bookmark)
    fail("the production D1 Time Travel bookmark does not match the recorded recovery point.");
}

const { value: mediaBackup } = await readPrivateJson(backup.mediaManifestPath, "R2 media manifest");
if (
  mediaBackup.environment !== "production" ||
  mediaBackup.bucket !== productionBucket ||
  mediaBackup.complete !== true ||
  !Array.isArray(mediaBackup.objects) ||
  !Number.isInteger(mediaBackup.objectCount) ||
  mediaBackup.objectCount < 0 ||
  !Number.isInteger(mediaBackup.totalBytes) ||
  mediaBackup.totalBytes < 0 ||
  mediaBackup.objects.length !== mediaBackup.objectCount
) {
  fail("the R2 media manifest is incomplete or targets the wrong production bucket.");
}
try {
  await verifyBackupManifest(backup.mediaManifestPath);
} catch (error) {
  fail("the R2 media archive is not a complete private integrity-checked backup: " + error.message);
}
checkFresh(mediaBackup.createdAt, "R2 recovery manifest");
const bucketInfo = parseJsonOutput(
  command(["exec", "wrangler", "r2", "bucket", "info", productionBucket, "--json"]),
  "Production R2 bucket inventory"
);
if (
  bucketInfo.name !== productionBucket ||
  Number(bucketInfo.object_count) !== mediaBackup.objectCount
)
  fail("the live R2 bucket object count differs from the verified media backup.");
if (mediaBackup.objectCount === 0 && mediaBackup.totalBytes !== 0)
  fail("an empty R2 bucket manifest has a nonzero byte total.");
if (
  mediaBackup.objectCount === 0 &&
  !/^0(?:\s|$)/.test(String(bucketInfo.bucket_size ?? "").trim())
)
  fail("the live R2 bucket has bytes that are absent from the verified media backup.");
if (mediaBackup.verification?.method === "wrangler-r2-bucket-info-empty-only") {
  if (
    mediaBackup.objectCount !== 0 ||
    mediaBackup.verification?.bucketSize !== bucketInfo.bucket_size
  )
    fail("the live empty R2 bucket does not match its verified empty-bucket manifest.");
} else {
  loadLocalEnv();
  if (!hasR2Credentials())
    fail(
      "a scoped R2 S3 token is required to compare the live media bucket with its private object inventory."
    );
  try {
    const liveMedia = await verifyBucketMatchesManifest(
      createR2Client(),
      productionBucket,
      mediaBackup
    );
    if (
      liveMedia.objectCount !== mediaBackup.objectCount ||
      liveMedia.totalBytes !== mediaBackup.totalBytes
    )
      fail("the live R2 inventory differs from the verified media backup.");
  } catch (error) {
    fail("the live R2 bucket did not match the verified media backup: " + error.message);
  }
}

const receiptResolved = await lstat(receiptPath);
if ((receiptResolved.mode & 0o077) !== 0)
  fail("the production readiness receipt must have owner-only file permissions.");
console.log(
  "Production preflight passed: exact preview build, live schema, public-safe starter records, secrets and current backups verified."
);

command(["build"], { stdio: "inherit" });
const config = JSON.parse(await readFile(path.join(root, "dist/server/wrangler.json"), "utf8"));
const d1 = config.d1_databases?.find((binding) => binding.binding === "DB");
const media = config.r2_buckets?.find((binding) => binding.binding === "MEDIA");
if (
  config.name !== "woodhouse-loftwah" ||
  d1?.database_name !== productionDatabase.name ||
  d1?.database_id !== productionDatabase.id ||
  media?.bucket_name !== productionBucket ||
  !config.routes?.some(
    (route) => route.pattern === "woodhouse.loftwah.com" && route.custom_domain === true
  )
) {
  fail("production build manifest does not target the verified Worker, D1, R2 and custom domain.");
}

const deployment = spawnSync(
  "pnpm",
  ["exec", "wrangler", "deploy", "--config", "dist/server/wrangler.json"],
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
  fail(
    "Wrangler production deploy failed with exit code " + (deployment.status ?? "unknown") + "."
  );
}
const deploymentOutput = (deployment.stdout ?? "") + "\n" + (deployment.stderr ?? "");
for (const line of deploymentOutput.split(/\r?\n/)) {
  if (/^(Uploaded |Deployed |Current Version ID:)/.test(line)) console.log(line.trim());
}
const workerVersion = /Current Version ID:\s*([0-9a-f-]{36})/i.exec(deploymentOutput)?.[1];
if (!workerVersion) fail("production deployed, but Wrangler did not report a Worker version ID.");

// The deployed origin has to report the source this run intended to ship. A
// Worker can answer this even after the local tree moves on, so it is the only
// evidence that production is serving this build and not an earlier one.
// Retried, not read once: publishing a version propagates over a short window,
// and a single request straight after the deploy can be served by the version
// being replaced. That reported a successful production deploy as a failure.
const liveIdentity = await awaitBuildIdentity(productionUrl, {
  expectedDigest: currentSourceDigest,
  expectedEnvironment: "production"
});
if (!liveIdentity.ok)
  fail(
    `production deployed as ${workerVersion} but its reported build identity did not match ` +
      `after ${liveIdentity.attempts} attempts: ${liveIdentity.problems.join("; ")}.`
  );
if (liveIdentity.attempts > 1)
  console.log(
    `Production needed ${liveIdentity.attempts} attempts before reporting the new build.`
  );
if (liveIdentity.identity?.gitClean !== true)
  fail("the deployed build was made from a dirty working tree; it has no reviewable commit.");
console.log(`Production reports the deployed source ${describeIdentity(liveIdentity.identity)}`);

const smokePaths = [
  "/",
  "/projects/",
  "/dispatches/",
  "/contact/",
  "/sitemap.xml",
  "/robots.txt",
  "/rss.xml",
  "/agents/facts.json",
  "/build.json"
];
let localEnv = new Map();
try {
  const contents = await readFile(path.join(root, ".env"), "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    )
      value = value.slice(1, -1);
    localEnv.set(match[1], value);
  }
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const privateValues = [...localEnv].flatMap(([name, value]) =>
  /(?:key|token|secret)/i.test(name) || /@deanlofts\.xyz$/i.test(value) ? [value] : []
);
for (const pathname of smokePaths) {
  const response = await fetch(new URL(pathname, productionUrl), {
    signal: AbortSignal.timeout(30000),
    redirect: "manual"
  });
  if (!response.ok)
    fail(
      "production deployed as " +
        workerVersion +
        " but " +
        pathname +
        " returned HTTP " +
        response.status +
        "."
    );
  const body = await response.text();
  const privacyFindings = scanPublicText(body, { privateValues });
  if (privacyFindings.length)
    fail(
      "production deployed as " +
        workerVersion +
        " but the privacy smoke check found " +
        privacyFindings.join(", ") +
        " at " +
        pathname +
        "."
    );
}

const releaseDirectory = path.join(root, ".release");
await mkdir(releaseDirectory, { recursive: true, mode: 0o700 });
await chmod(releaseDirectory, 0o700);
const deploymentManifest = path.join(releaseDirectory, "production-deployment.json");
await writeFile(
  deploymentManifest,
  JSON.stringify(
    {
      environment: "production",
      hostname: "woodhouse.loftwah.com",
      worker: "woodhouse-loftwah",
      workerVersion,
      sourceDigest: currentSourceDigest,
      smokePaths,
      deployedAt: new Date().toISOString()
    },
    null,
    2
  ) + "\n",
  { mode: 0o600 }
);
await chmod(deploymentManifest, 0o600);
console.log(
  "Production hostname and public route smoke checks passed for Worker " + workerVersion + "."
);
