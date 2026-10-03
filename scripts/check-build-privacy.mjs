import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { scanPublicText } from "./public-privacy.mjs";

const root = process.cwd();
const buildRoot = path.join(root, "dist");
const publicRoot = path.join(buildRoot, "client");

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

const allFiles = await filesUnder(buildRoot);
const publicFiles = await filesUnder(publicRoot);
const findings = [];
let localSecrets = new Map();
try {
  localSecrets = parseEnv(await readFile(path.join(root, ".env"), "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const privateValues = [...localSecrets].flatMap(([name, value]) => {
  if (typeof value !== "string" || value.length < 8) return [];
  return /(?:key|token|secret)/i.test(name) || /@deanlofts\.xyz$/i.test(value) ? [value] : [];
});

for (const file of allFiles) {
  const bytes = await readFile(file);
  for (const label of scanPublicText(bytes, { privateValues, includeMarkers: false }))
    findings.push({ label, file });
}

for (const file of publicFiles) {
  const bytes = await readFile(file);
  for (const label of scanPublicText(bytes, { privateValues })) findings.push({ label, file });
}

const seedPath = path.join(root, "seed/seed.json");
const seedSource = await readFile(seedPath, "utf8");
const seed = JSON.parse(seedSource);
for (const label of scanPublicText(seedSource, { privateValues }))
  findings.push({ label: "seed: " + label, file: seedPath });
for (const conversation of seed.content?.conversations ?? []) {
  if (conversation.data?.public_safe !== true || conversation.data?.source_reviewed !== true) {
    findings.push({ label: "unreviewed conversation source in seed", file: seedPath });
  }
}

if (findings.length) {
  for (const finding of findings)
    console.error(`Privacy check failed: ${finding.label} in ${path.relative(root, finding.file)}`);
  process.exitCode = 1;
} else {
  console.log(
    `Privacy check passed across ${allFiles.length} build artifacts; no private address or local secret values found.`
  );
}
