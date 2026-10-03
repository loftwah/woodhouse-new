import { createHash } from "node:crypto";
import { lstat, readFile, readlink } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const SOURCE_PATHS = [
  "astro.config.mjs",
  "emdash-env.d.ts",
  "package.json",
  "pnpm-lock.yaml",
  "public",
  "scripts",
  "seed",
  "src",
  "tsconfig.json",
  "wrangler.jsonc"
];

export async function computeSourceDigest(root = process.cwd()) {
  const listed = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "--", ...SOURCE_PATHS],
    {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024
    }
  );
  if (listed.error) throw listed.error;
  if (listed.status !== 0)
    throw new Error("Could not list deployment source files for the source digest.");

  const files = [...new Set(listed.stdout.split("\0").filter(Boolean))].sort();
  const hash = createHash("sha256");
  for (const relativePath of files) {
    const absolutePath = path.join(root, relativePath);
    hash.update(relativePath);
    hash.update("\0");
    try {
      const details = await lstat(absolutePath);
      hash.update(String(details.mode & 0o111));
      hash.update("\0");
      hash.update(
        details.isSymbolicLink() ? await readlink(absolutePath) : await readFile(absolutePath)
      );
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      hash.update("deleted\0");
    }
    hash.update("\0");
  }
  return `sha256:${hash.digest("hex")}`;
}
