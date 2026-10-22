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

function chart() {
  const [multi, single] = observations.tasks;
  const rows = [
    { label: multi.title, pass: "pass 1", value: multi.passes[0].addedLines, tone: "#647DFF" },
    { label: multi.title, pass: "pass 2", value: multi.passes[1].addedLines, tone: "#E9FF49" },
    { label: single.title, pass: "pass 1", value: single.passes[0].addedLines, tone: "#647DFF" },
    { label: single.title, pass: "pass 2", value: single.passes[1].addedLines, tone: "#E9FF49" }
  ];
  const max = 340;
  const left = 60;
  const track = 300;
  const top = 300;
  const rowHeight = 118;
  const scale = (value) => Math.max((value / max) * track, value === 0 ? 4 : 0);
  const bars = rows
    .map((row, index) => {
      const base = top + index * rowHeight;
      const width = scale(row.value);
      return (
        `<text x="${left}" y="${base}" fill="#B7C7DF" font-size="21">${escape(row.label)}</text>` +
        `<text x="${left}" y="${base + 30}" fill="#8FA3C4" font-size="19">${escape(row.pass)}</text>` +
        `<rect x="${left}" y="${base + 44}" width="${track}" height="30" fill="#12203A"/>` +
        `<rect x="${left}" y="${base + 44}" width="${width}" height="30" fill="${row.tone}"/>` +
        `<text x="${left + track + 16}" y="${base + 68}" fill="#EAF0FA" font-size="26" font-weight="700">${row.value}</text>`
      );
    })
    .join("\n  ");
  const defect = observations.tasks[0].defect;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="900" viewBox="0 0 760 900" role="img" aria-labelledby="t d">
  <title id="t">Lines added by each pass of the same prompt</title>
  <desc id="d">${escape(observations.source)} ${escape(
    `Multi-requirement task: pass 1 added ${multi.passes[0].addedLines} lines, pass 2 added ${multi.passes[1].addedLines} and replaced ${multi.passes[1].removedLines}. Single-requirement task: pass 1 added ${single.passes[0].addedLines}, pass 2 added nothing. Pass 2 of the multi-requirement task also found a counting defect affecting ${defect.dispatchesAffected} of ${defect.dispatchesTotal} dispatches, by up to ${defect.largestOvercount} words each.`
  )}</desc>
  <style>
    @font-face { font-family: "Bricolage Report"; font-weight: 400; src: url(data:font/ttf;base64,${regular}) format("truetype"); }
    @font-face { font-family: "Bricolage Report"; font-weight: 700; src: url(data:font/ttf;base64,${bold}) format("truetype"); }
    text { font-family: "Bricolage Report", system-ui, sans-serif; }
  </style>
  <rect width="760" height="900" fill="#080D19"/>
  <rect width="760" height="8" fill="#E9FF49"/>
  <text x="60" y="86" fill="#EAF0FA" font-size="34" font-weight="700">Lines added by each pass</text>
  <text x="60" y="126" fill="#B7C7DF" font-size="20">Two tasks, two sequential passes each.</text>
  <text x="60" y="154" fill="#B7C7DF" font-size="20">The second pass is the same prompt, verbatim.</text>
  <text x="60" y="206" fill="#E9FF49" font-size="20">Pass 2 found a counting defect in</text>
  <text x="60" y="234" fill="#E9FF49" font-size="20">${defect.dispatchesAffected} of ${defect.dispatchesTotal} dispatches, by up to</text>
  <text x="60" y="262" fill="#E9FF49" font-size="20">${defect.largestOvercount} words each.</text>
  ${bars}
  <text x="60" y="836" fill="#8FA3C4" font-size="17">Measured ${escape(observations.reviewed)}. Two tasks cannot</text>
  <text x="60" y="862" fill="#8FA3C4" font-size="17">establish a rate, and neither pass was timed</text>
  <text x="60" y="888" fill="#8FA3C4" font-size="17">against a control.</text>
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
