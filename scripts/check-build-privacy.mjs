import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  parseEnvFile,
  privateEnvValues,
  riskyPathReason,
  scanPublicText
} from "./public-privacy.mjs";

async function filesUnder(directory) {
  const files = [];
  async function visit(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }
    for (const entry of entries) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(target);
      else if (entry.isFile()) files.push(target);
    }
  }
  await visit(directory);
  return files;
}

async function optionalFile(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

/**
 * Inspect the artefact actually staged for publication: every client and Worker
 * file, hidden and nested paths, bundles, source maps and copied static assets.
 * This runs inside `pnpm build`/`build:preview`, so an agent's normal release path
 * fails closed on a known secret value, a high-confidence secret shape or a
 * dangerous published filename before anything is deployed.
 *
 * Findings name the class and the relative path only; a matched value is never
 * printed.
 */
export async function checkBuildPrivacy({ root = process.cwd() } = {}) {
  const buildRoot = path.join(root, "dist");
  const findings = [];
  const envSource = await optionalFile(path.join(root, ".env"));
  const privateValues = envSource ? privateEnvValues(parseEnvFile(envSource)) : [];

  const files = await filesUnder(buildRoot);
  if (!files.length) {
    findings.push({ label: "no build artefact under dist/", file: buildRoot });
    return { ok: false, findings, files: 0 };
  }

  for (const file of files) {
    const relative = path.relative(buildRoot, file);
    const reason = riskyPathReason(relative);
    if (reason) findings.push({ label: `published ${reason}`, file });
    const isPublic = relative.replaceAll("\\", "/").startsWith("client/");
    const bytes = await readFile(file);
    for (const label of scanPublicText(bytes, {
      privateValues,
      includeMarkers: isPublic,
      includePatterns: true
    }))
      findings.push({ label, file });
  }

  const seedPath = path.join(root, "seed/seed.json");
  const seedSource = await optionalFile(seedPath);
  if (seedSource) {
    for (const label of scanPublicText(seedSource, {
      privateValues,
      includePatterns: true
    }))
      findings.push({ label: `seed: ${label}`, file: seedPath });
    let seed;
    try {
      seed = JSON.parse(seedSource);
    } catch {
      findings.push({ label: "seed: unreadable JSON", file: seedPath });
    }
    for (const conversation of seed?.content?.conversations ?? []) {
      if (conversation.data?.public_safe !== true || conversation.data?.source_reviewed !== true)
        findings.push({ label: "unreviewed conversation source in seed", file: seedPath });
    }
  }

  return { ok: findings.length === 0, findings, files: files.length };
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const root = process.cwd();
  const { ok, findings, files } = await checkBuildPrivacy({ root });
  if (!ok) {
    for (const finding of findings)
      console.error(
        `Privacy check failed: ${finding.label} in ${path.relative(root, finding.file)}`
      );
    process.exitCode = 1;
  } else {
    console.log(
      `Privacy check passed across ${files} build artifacts; no dangerous published path, private address or high-confidence secret value found.`
    );
  }
}
