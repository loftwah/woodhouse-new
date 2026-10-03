import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const imageDirectory = path.join(root, "public/images/diagrams");
const manifestPath = path.join(root, "src/data/diagram-sizes.json");

function intrinsicSize(svg, name) {
  const viewBox = /<svg\b[^>]*\bviewBox="([^"]+)"/i.exec(svg)?.[1];
  if (!viewBox) throw new Error(`${name} has no root viewBox, so its intrinsic size is unknown.`);
  const values = viewBox.trim().split(/\s+/).map(Number);
  const [, , width, height] = values;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw new Error(`${name} has an unusable viewBox: ${viewBox}`);
  return { width: Math.round(width), height: Math.round(height) };
}

const files = (await readdir(imageDirectory)).filter((file) => file.endsWith(".svg")).sort();
if (!files.length) throw new Error(`No rendered diagrams were found in ${imageDirectory}.`);

const sizes = {};
for (const file of files) {
  sizes[path.basename(file, ".svg")] = intrinsicSize(
    await readFile(path.join(imageDirectory, file), "utf8"),
    file
  );
}
const serialised = `${JSON.stringify(sizes, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = await readFile(manifestPath, "utf8").catch(() => "");
  if (current !== serialised) {
    console.error(
      "src/data/diagram-sizes.json is stale; run pnpm run diagrams:sizes after re-rendering."
    );
    process.exitCode = 1;
  } else {
    console.log(`Diagram intrinsic sizes match all ${files.length} rendered SVGs.`);
  }
} else {
  await writeFile(manifestPath, serialised);
  console.log(`Recorded intrinsic sizes for ${files.length} rendered diagrams.`);
}
