import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

// One acceptance contract for recording, status and the enforcing editorial gate.
export const requiredPreviewChecks = [
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

export function previewIdentity(preview) {
  if (
    preview?.url !== "https://woodhouse-loftwah-preview.loftwah.workers.dev" ||
    !/^sha256:[a-f0-9]{64}$/.test(preview?.sourceDigest ?? "") ||
    !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(preview?.workerVersion ?? "")
  )
    throw new Error("Identify the preview URL, source fingerprint and exact Worker version first.");
  return {
    url: preview.url,
    sourceDigest: preview.sourceDigest,
    workerVersion: preview.workerVersion
  };
}

export async function acceptanceEvidenceProblems(evidence, { root, preview, now = Date.now() }) {
  const problems = [];
  if (evidence?.passed !== true) return ["no passing observation recorded"];
  try {
    const expected = previewIdentity(preview);
    const observed = previewIdentity(evidence.preview);
    if (Object.keys(expected).some((key) => expected[key] !== observed[key]))
      problems.push("observation belongs to another preview source or Worker; repeat the journey");
  } catch {
    problems.push("observation lacks an exact preview identity; repeat and record the journey");
  }
  const observedAt = Date.parse(evidence.observedAt ?? "");
  const deployedAt = Date.parse(preview?.deployedAt ?? "");
  if (!Number.isFinite(observedAt) || observedAt > now + 60000 || now - observedAt > 30 * 86400000)
    problems.push("observation must be less than 30 days old and not in the future");
  if (!Number.isFinite(deployedAt) || observedAt < deployedAt)
    problems.push("observation predates the accepted preview deployment");

  const releaseRoot = path.resolve(root, ".release") + path.sep;
  const absolute = path.resolve(
    root,
    typeof evidence.artifactPath === "string" ? evidence.artifactPath : ""
  );
  const details = await lstat(absolute).catch(() => null);
  const resolved = await realpath(absolute).catch(() => "");
  const resolvedRelease = await realpath(path.resolve(root, ".release")).catch(() => "");
  if (
    !absolute.startsWith(releaseRoot) ||
    !resolvedRelease ||
    !resolved.startsWith(resolvedRelease + path.sep) ||
    !details?.isFile() ||
    details.size === 0 ||
    (details.mode & 0o077) !== 0
  ) {
    problems.push("artifact must be a non-empty owner-only file under .release");
  } else if (
    !/^[a-f0-9]{64}$/.test(evidence.sha256 ?? "") ||
    createHash("sha256")
      .update(await readFile(absolute))
      .digest("hex") !== evidence.sha256
  ) {
    problems.push("artifact no longer matches its SHA-256 digest");
  }
  return problems;
}
