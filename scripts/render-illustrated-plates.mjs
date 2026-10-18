// The rejected D2 exports were being mistaken for finished art. The publication
// now has authored image masters; D2 remains the explicitly labelled system
// model. Bind the reviewed model and master so later edits cannot silently
// publish an illustration of a different system.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderPhonePlate } from "./phone-technical-plates.mjs";

const root = process.cwd();
const directory = path.join(root, "scripts/assets/technical-plates");
const target = path.join(root, "public/images/diagrams");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const escape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const regular = (await readFile(path.join(root, "public/fonts/bricolage-report-400.ttf"))).toString(
  "base64"
);
const bold = (await readFile(path.join(root, "public/fonts/bricolage-report-700.ttf"))).toString(
  "base64"
);
await mkdir(target, { recursive: true });
for (const filename of (await readdir(path.join(root, "diagrams")))
  .filter((file) => file.endsWith(".d2"))
  .sort()) {
  const name = path.basename(filename, ".d2");
  const model = await readFile(path.join(root, "diagrams", filename));
  const provenance = JSON.parse(await readFile(path.join(directory, `${name}.json`), "utf8"));
  const masterName = provenance.master ?? `${name}.png`;
  if (path.basename(masterName) !== masterName || !masterName.endsWith(".png"))
    throw new Error(`${name}: invalid artwork master path.`);
  const master = path.join(directory, masterName);
  const bytes = await readFile(master);
  if (sha(model) !== provenance.modelSha256 || sha(bytes) !== provenance.masterSha256)
    throw new Error(
      `${name}: the model or image changed after their paired review. Review the actual illustration and model together before updating provenance.`
    );
  if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a")
    throw new Error(`${name}: expected a retained PNG master.`);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const derivative = path.join(root, "output/illustrated-plates", `${name}.webp`);
  await mkdir(path.dirname(derivative), { recursive: true });
  execFileSync("magick", [master, "-quality", "92", derivative]);
  const image = await readFile(derivative);
  const modelLabels = Object.fromEntries(
    [...model.toString("utf8").matchAll(/^\s*([\w-]+):\s*("(?:[^"\\]|\\.)*")\s*\{/gm)].map(
      (match) => [match[1], JSON.parse(match[2])]
    )
  );
  const labels = Object.values(modelLabels).filter(Boolean);
  const title = provenance.title;
  const description = `${provenance.description} System model: ${labels.join(". ")}`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description"><title id="title">${escape(title)}</title><desc id="description">${escape(description)}</desc><image width="${width}" height="${height}" href="data:image/webp;base64,${image.toString("base64")}"/></svg>\n`;
  if (name.endsWith("-mobile")) {
    svg = renderPhonePlate({
      name,
      labels: modelLabels,
      image: image.toString("base64"),
      artWidth: width,
      artHeight: height,
      regular,
      bold
    });
  }
  await writeFile(path.join(target, `${name}.svg`), svg);
}
console.log("Rendered the reviewed illustrated masters; editable D2 system models remain paired.");
