import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Worker } from "node:worker_threads";
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

// Bounded worker pool: no artifact or pattern is skipped and values never enter logs.
async function scanFiles(files, buildRoot, privateValues) {
  const count = Math.min(4, files.length);
  const groups = Array.from({ length: count }, () => []);
  files.forEach((file, index) =>
    groups[index % count].push({
      index,
      file,
      isPublic: path.relative(buildRoot, file).replaceAll("\\", "/").startsWith("client/")
    })
  );
  const workers = [];
  try {
    for (const group of groups) {
      workers.push(
        new Worker(new URL("./privacy-scan-worker.mjs", import.meta.url), {
          workerData: { files: group, privateValues },
          execArgv: process.execArgv.filter((arg) => !arg.startsWith("--input-type"))
        })
      );
    }
    const batches = await Promise.all(
      workers.map(
        (worker) =>
          new Promise((resolve, reject) => {
            let findings;
            worker.once("message", (value) => {
              findings = value;
            });
            worker.once("error", reject);
            worker.once("exit", (code) => {
              if (code !== 0 || !Array.isArray(findings))
                reject(new Error("Privacy scan worker failed."));
              else resolve(findings);
            });
          })
      )
    );
    return batches.flat().sort((a, b) => a.index - b.index);
  } finally {
    await Promise.all(workers.map((worker) => worker.terminate()));
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
export async function checkBuildPrivacy({ root = process.cwd(), envFile } = {}) {
  const buildRoot = path.join(root, "dist");
  const findings = [];
  const envPath = envFile ?? path.join(root, ".env");
  const envSource = await optionalFile(envPath);
  if (envFile && envSource === null)
    throw new Error("The configured privacy environment file is unavailable.");
  const privateValues = envSource ? privateEnvValues(parseEnvFile(envSource)) : [];
  const configuredValuesIncluded = privateValues.length > 0;

  const files = await filesUnder(buildRoot);
  if (!files.length) {
    findings.push({ label: "no build artefact under dist/", file: buildRoot });
    return { ok: false, findings, files: 0, configuredValuesIncluded };
  }

  const scanned = await scanFiles(files, buildRoot, privateValues);
  const labelsByIndex = new Map(scanned.map(({ index, labels }) => [index, labels]));
  for (const [index, file] of files.entries()) {
    const relative = path.relative(buildRoot, file);
    const reason = riskyPathReason(relative);
    if (reason) findings.push({ label: `published ${reason}`, file });
    for (const label of labelsByIndex.get(index) ?? []) findings.push({ label, file });
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
        findings.push({
          label: "unreviewed conversation source in seed",
          file: seedPath
        });
    }
  }

  return {
    ok: findings.length === 0,
    findings,
    files: files.length,
    configuredValuesIncluded
  };
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const root = process.cwd();
  const { ok, findings, files, configuredValuesIncluded } = await checkBuildPrivacy({
    root,
    envFile: process.env.WOODHOUSE_PRIVACY_ENV_FILE || undefined
  });
  console.log(
    configuredValuesIncluded
      ? "Privacy check includes configured private values."
      : "Privacy check has no configured private values; credential-shape checks remain active."
  );
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
