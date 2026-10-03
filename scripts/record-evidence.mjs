import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Records one human acceptance observation in the private production receipt.
// It does not decide whether a check passed: the operator supplies an
// artifact and asserts the observation. This only writes the receipt entry in
// the shape scripts/deploy-production.mjs enforces, so the operator never has
// to hand-edit a digest or file mode.

const PRODUCTION_HOSTNAME = "woodhouse.loftwah.com";
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

const argv = process.argv.slice(2).filter((value) => value !== "--");
const flags = new Map();
const positional = [];
for (let index = 0; index < argv.length; index += 1) {
  if (argv[index].startsWith("--")) {
    const next = argv[index + 1];
    if (next && !next.startsWith("--")) flags.set(argv[index].slice(2), next);
    else flags.set(argv[index].slice(2), true);
    index += 1;
  } else positional.push(argv[index]);
}

function fail(message) {
  console.error("Evidence not recorded: " + message);
  process.exit(1);
}

const [check, artifactPath] = positional;
if (!check || !artifactPath)
  fail(
    "usage: pnpm run evidence:record -- <check> <artifact-under-.release> [--replace] [--observed <iso>] [--confirm-hostname woodhouse.loftwah.com]"
  );
if (!requiredChecks.includes(check)) fail(`"${check}" is not a required preview acceptance check.`);

const root = process.cwd();
const releaseRoot = path.resolve(root, ".release");
const artifactAbsolute = path.resolve(root, artifactPath);
if (!artifactAbsolute.startsWith(releaseRoot + path.sep))
  fail("the artifact must live under .release so it stays private and ignored.");

const details = await lstat(artifactAbsolute).catch(() => null);
if (!details?.isFile() || details.size === 0) fail("the artifact is missing or empty.");
if ((details.mode & 0o077) !== 0)
  fail("the artifact must be readable by its owner only (chmod 600).");

const hash = createHash("sha256");
for await (const chunk of createReadStream(artifactAbsolute)) hash.update(chunk);
const sha256 = hash.digest("hex");

const observedFlag = flags.get("observed");
const observedAt = typeof observedFlag === "string" ? observedFlag : new Date().toISOString();
const parsed = Date.parse(observedAt);
if (!Number.isFinite(parsed) || parsed > Date.now() + 60_000)
  fail("the observation timestamp must be a valid date that is not in the future.");

const receiptPath = path.resolve(root, ".release/production-ready.json");
let receipt;
try {
  receipt = JSON.parse(await readFile(receiptPath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") fail("the existing receipt could not be read.");
  const confirmed = flags.get("confirm-hostname");
  if (confirmed !== PRODUCTION_HOSTNAME)
    fail(
      `no receipt exists yet. Re-run with --confirm-hostname ${PRODUCTION_HOSTNAME} to create one, and only once you have decided to target that hostname.`
    );
  receipt = {
    operatorConfirmed: PRODUCTION_HOSTNAME,
    preview: { url: "", sourceDigest: "", workerVersion: "", checks: {} },
    production: {
      contentModelMigrated: false,
      starterContentVerified: false,
      backup: {}
    }
  };
}

const preview = receipt.preview ?? (receipt.preview = { checks: {} });
const checks = preview.checks ?? (preview.checks = {});
if (checks[check] && !flags.has("replace"))
  fail(`"${check}" already has recorded evidence. Pass --replace to supersede it.`);

checks[check] = {
  passed: true,
  observedAt,
  sha256,
  artifactPath: path.relative(root, artifactAbsolute)
};

await mkdir(releaseRoot, { recursive: true, mode: 0o700 });
await chmod(releaseRoot, 0o700);
await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
await chmod(receiptPath, 0o600);

console.log(
  `Recorded ${check} from ${path.relative(root, artifactAbsolute)} (sha256 ${sha256.slice(0, 12)}…, observed ${observedAt}).`
);
console.log(
  requiredChecks.filter((name) => !checks[name]).length
    ? `Still unrecorded: ${requiredChecks.filter((name) => !checks[name]).join(", ")}`
    : "All required preview acceptance checks now carry recorded evidence."
);
console.log("Run pnpm run release:status to confirm the receipt satisfies the deploy gate.");
