// Workspace retention for the artefacts this repository actually produces.
//
// The observed failure: evidence, release receipts and browser captures only
// ever accumulate. Nothing here is source, and nothing here is safe to delete by
// a wildcard, so the policy is explicit per root, a keep-list protects the live
// exports, and the default run deletes nothing.
//
// This is deliberately not a general disk cleaner. It only touches direct
// children of the four evidence roots plus, when asked, the three build outputs.
import { lstat, readdir, rm, statfs } from "node:fs/promises";
import { resolve, dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Evidence roots, with the age after which an entry is routine. */
export const evidenceRoots = [
  { path: "output", maxAgeDays: 30 },
  { path: ".release", maxAgeDays: 90, keep: ["content-model", "backups"] },
  { path: ".playwright-mcp", maxAgeDays: 7 },
  { path: ".playwright-cli", maxAgeDays: 7 }
];

/** Rebuildable output. Removed only with --builds, because a build is running. */
export const buildRoots = [{ path: "dist" }, { path: "storybook-static" }, { path: ".astro" }];

/**
 * Pure policy: which entries are older than the threshold and not protected.
 * Symlinks and non-directories are reported but never selected, so a link that
 * points outside the root cannot widen the deletion.
 */
export function selectCandidates(entries, { maxAgeDays, keep = [], now = Date.now() } = {}) {
  const protectedNames = new Set(keep);
  const candidates = [];
  const kept = [];
  const skipped = [];
  for (const entry of entries) {
    if (protectedNames.has(entry.name)) {
      kept.push({ name: entry.name, reason: "keep-list" });
      continue;
    }
    if (entry.isSymbolicLink) {
      skipped.push({ name: entry.name, reason: "symlink" });
      continue;
    }
    const ageDays = (now - entry.mtimeMs) / 86_400_000;
    if (ageDays <= maxAgeDays) {
      kept.push({ name: entry.name, reason: `younger than ${maxAgeDays}d` });
      continue;
    }
    candidates.push({ name: entry.name, ageDays });
  }
  return { candidates, kept, skipped };
}

async function readEntries(dir) {
  let names;
  try {
    names = await readdir(dir);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const entries = [];
  for (const name of names) {
    try {
      const stats = await lstat(join(dir, name));
      entries.push({ name, mtimeMs: stats.mtimeMs, isSymbolicLink: stats.isSymbolicLink() });
    } catch {
      // A vanished entry is not a failure; the policy simply has nothing to act on.
    }
  }
  return entries;
}

/** Apparent size, without following symlinks. */
async function apparentSize(target) {
  const stats = await lstat(target).catch(() => undefined);
  if (!stats) return 0;
  if (stats.isSymbolicLink()) return 0;
  if (!stats.isDirectory()) return stats.size;
  let total = 0;
  for (const name of await readdir(target).catch(() => [])) {
    total += await apparentSize(join(target, name));
  }
  return total;
}

async function freeBytes() {
  const stats = await statfs(root);
  return stats.bavail * stats.bsize;
}

const gb = (bytes) => `${(bytes / 1e9).toFixed(2)} GB`;

export async function main(argv) {
  const apply = argv.includes("--apply");
  const includeBuilds = argv.includes("--builds");
  const unknown = argv.filter((arg) => !["--apply", "--builds", "--json"].includes(arg));
  if (unknown.length) throw new Error(`Unknown argument: ${unknown[0]}`);

  const roots = includeBuilds ? [...evidenceRoots, ...buildRoots] : evidenceRoots;
  const before = await freeBytes();
  const report = [];
  let reclaimable = 0;
  let removed = 0;

  for (const spec of roots) {
    const dir = resolve(root, spec.path);
    if (dir !== root && !dir.startsWith(root + sep))
      throw new Error(`Outside the repository: ${dir}`);
    const details = await lstat(dir).catch((error) => {
      if (error.code !== "ENOENT") throw error;
      return null;
    });
    if (details?.isSymbolicLink()) {
      process.stdout.write(`${spec.path}: symlink skipped\n`);
      continue;
    }
    const entries = details ? await readEntries(dir) : [];
    const { candidates, kept, skipped } = selectCandidates(entries, {
      maxAgeDays: spec.maxAgeDays ?? 0,
      keep: spec.keep
    });
    let bytes = 0;
    for (const candidate of candidates) bytes += await apparentSize(join(dir, candidate.name));
    reclaimable += bytes;
    report.push({
      root: spec.path,
      maxAgeDays: spec.maxAgeDays ?? 0,
      candidates: candidates.length,
      bytes,
      kept: kept.length,
      skipped: skipped.length
    });
    if (apply && candidates.length) {
      const current = await lstat(dir);
      if (current.isSymbolicLink() || current.dev !== details.dev || current.ino !== details.ino)
        throw new Error(`Workspace root changed during inspection: ${spec.path}`);
      for (const candidate of candidates) {
        await rm(join(dir, candidate.name), { recursive: true, force: true });
        removed += 1;
      }
    }
  }

  const after = await freeBytes();
  for (const line of report) {
    const age = line.maxAgeDays ? `${line.maxAgeDays}d` : "always";
    process.stdout.write(
      `${line.root.padEnd(16)} older than ${age.padEnd(6)}  ${String(line.candidates).padStart(4)} candidates  ${gb(line.bytes).padStart(9)}  ${line.kept} kept, ${line.skipped} symlink(s) skipped\n`
    );
  }
  process.stdout.write(`\ntotal reclaimable: ${gb(reclaimable)}\n`);
  process.stdout.write(`free space before: ${gb(before)}, after: ${gb(after)}\n`);
  if (!apply) {
    process.stdout.write("dry run: nothing was deleted. Re-run with --apply.\n");
    return 0;
  }
  process.stdout.write(`deleted ${removed} entries.\n`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2));
}
