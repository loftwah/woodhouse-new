// The observed failure this prevents: an article figure that quotes measurements
// the text no longer matches, with nothing able to detect the drift.
//
// The figures are rendered from the same checked-in observations the article
// reports. `--check` fails when the committed figures disagree, so a changed
// number is a visible edit rather than a silent one.
//
// The sequence diagram is a system model rendered from its editable `.d2`
// source. It is deliberately not an illustrated plate: the reviewed plate family
// pairs a generated master with a model, and this figure has no generated
// master.
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const check = process.argv.includes("--check");
const sourceDirectory = path.join(root, "public/diagrams");
const target = path.join(root, "public/images/diagrams");
const chartTarget = path.join(root, "public/images/experiments");
const observations = JSON.parse(
  await readFile(path.join(root, "src/data/same-prompt-twice.json"), "utf8")
);
const escape = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const font = async (name) =>
  (await readFile(path.join(root, "public/fonts", name))).toString("base64");
const regular = await font("bricolage-report-400.ttf");
const bold = await font("bricolage-report-700.ttf");

function wrap(text, max = 38) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= max) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function elapsed(seconds) {
  if (seconds == null) return "not separately timed";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;
}

function chart() {
  const [multi, single] = observations.tasks;
  const defect = multi.defect;
  let top = 206;
  const panels = [multi, single]
    .map((task) => {
      const first = wrap(task.outcome.firstPass);
      const second = wrap(task.outcome.secondPass);
      const titleY = top + 38;
      const metaY = top + 62;
      const firstLabelY = top + 96;
      const firstBodyY = top + 122;
      const secondLabelY = firstBodyY + first.length * 22 + 20;
      const secondBodyY = secondLabelY + 26;
      const bottom = secondBodyY + (second.length - 1) * 22 + 24;
      const panel = `<rect x="24" y="${top}" width="512" height="${bottom - top}" rx="16" fill="#0F182A" stroke="#1E2C46"/>
  <text x="44" y="${titleY}" fill="#EAF0FA" font-size="21" font-weight="700">${escape(task.title)}</text>
  <text x="44" y="${metaY}" fill="#8FA3C4" font-size="14">${escape(task.chartMeta)}</text>
  <text x="44" y="${firstLabelY}" fill="#8FA3C4" font-size="12" letter-spacing="1.5">FIRST PASS</text>
  <text x="516" y="${firstLabelY}" fill="#8FA3C4" font-size="13" text-anchor="end">${elapsed(task.passes[0].seconds)}</text>
  ${first.map((line, index) => `<text x="44" y="${firstBodyY + index * 22}" fill="#B7C7DF" font-size="16">${escape(line)}</text>`).join("\n  ")}
  <text x="44" y="${secondLabelY}" fill="#E9FF49" font-size="12" letter-spacing="1.5">SECOND PASS</text>
  <text x="516" y="${secondLabelY}" fill="#E9FF49" font-size="13" text-anchor="end">${elapsed(task.passes[1].seconds)}</text>
  ${second.map((line, index) => `<text x="44" y="${secondBodyY + index * 22}" fill="#EAF0FA" font-size="16" font-weight="700">${escape(line)}</text>`).join("\n  ")}`;
      top = bottom + 18;
      return panel;
    })
    .join("\n  ");
  const footerY = top + 38;
  const reviewed = new Date(`${observations.reviewed}T00:00:00Z`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="${footerY + 64}" viewBox="0 0 560 ${footerY + 64}" role="img" aria-labelledby="t d">
  <title id="t">What the second pass changed</title>
  <desc id="d">${escape(
    `Comparison of what each pass left behind. ${multi.title}: first pass — ${multi.outcome.firstPass} Second pass — ${multi.outcome.secondPass} ${single.title}: first pass — ${single.outcome.firstPass} Second pass — ${single.outcome.secondPass} The second pass of the dispatch inventory repaired a counting defect affecting ${defect.dispatchesAffected} of ${defect.dispatchesTotal} dispatches, by up to ${defect.largestOvercount} words each.`
  )}</desc>
  <style>
    @font-face { font-family: "Bricolage Report"; font-weight: 400; src: url(data:font/ttf;base64,${regular}) format("truetype"); }
    @font-face { font-family: "Bricolage Report"; font-weight: 700; src: url(data:font/ttf;base64,${bold}) format("truetype"); }
    text { font-family: "Bricolage Report", system-ui, sans-serif; }
  </style>
  <rect width="560" height="${footerY + 64}" fill="#080D19"/>
  <rect width="560" height="8" fill="#E9FF49"/>
  <text x="40" y="78" fill="#EAF0FA" font-size="34" font-weight="700">What the second pass</text>
  <text x="40" y="116" fill="#EAF0FA" font-size="34" font-weight="700">changed</text>
  <text x="40" y="154" fill="#B7C7DF" font-size="18">Same prompt, run again after the</text>
  <text x="40" y="178" fill="#B7C7DF" font-size="18">first pass committed.</text>
  ${panels}
  <text x="40" y="${footerY}" fill="#8FA3C4" font-size="15">Recorded ${escape(reviewed)} from commit ${escape(observations.baseCommit.slice(0, 7))}.</text>
  <text x="40" y="${footerY + 24}" fill="#8FA3C4" font-size="15">One repeat per task. Times are the recorded</text>
  <text x="40" y="${footerY + 48}" fill="#8FA3C4" font-size="15">observations, not a controlled benchmark.</text>
</svg>
`;
}

const figures = [
  {
    file: "same-prompt-twice.svg",
    build: () =>
      execFileSync(
        "d2",
        [
          "--font-regular",
          path.join(root, "public/fonts/bricolage-report-400.ttf"),
          "--font-bold",
          path.join(root, "public/fonts/bricolage-report-700.ttf"),
          path.join(sourceDirectory, "same-prompt-twice.d2"),
          "-"
        ],
        { maxBuffer: 64 * 1024 * 1024 }
      ).toString()
  },
  {
    file: "same-prompt-twice-mobile.svg",
    build: () =>
      execFileSync(
        "d2",
        [
          "--font-regular",
          path.join(root, "public/fonts/bricolage-report-400.ttf"),
          "--font-bold",
          path.join(root, "public/fonts/bricolage-report-700.ttf"),
          path.join(sourceDirectory, "same-prompt-twice-mobile.d2"),
          "-"
        ],
        { maxBuffer: 64 * 1024 * 1024 }
      ).toString()
  },
  { file: "same-prompt-twice-comparison.svg", build: chart, directory: chartTarget }
];

await mkdir(target, { recursive: true });
await mkdir(chartTarget, { recursive: true });
let stale = 0;
for (const figure of figures) {
  const destination = path.join(figure.directory ?? target, figure.file);
  const rendered = figure.build();
  const current = await readFile(destination, "utf8").catch(() => null);
  if (current === rendered) continue;
  if (check) {
    console.error(`Article figure is stale: ${path.relative(root, destination)}`);
    stale += 1;
    continue;
  }
  await writeFile(destination, rendered);
  console.log(`Rendered ${path.relative(root, destination)}`);
}
if (check && stale) process.exitCode = 1;
else if (check)
  console.log(`All ${figures.length} article figures match the reviewed observations.`);
