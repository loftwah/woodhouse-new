// Composes the "What we built" edition card.
//
// Same method as the project-dossier card: not an image generator. The material
// is Woodhouse's own signature — the lens of tensioned fibres the homepage draws
// live — captured to a master still, cropped, and set in Bricolage Grotesque at
// real 1200x630 dimensions. A reader sees an edition, not a template.
//
//   node scripts/render-edition-card.mjs
//
// Authoring only: nothing in src/ imports this file. It needs `magick` to encode
// the JPEG, which `scripts/render-social-cards.py` already requires.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg, initWasm } from "@resvg/resvg-wasm";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MASTER = `${ROOT}scripts/assets/dossier/loom-master.png`;
let DEST = `${ROOT}public/og/what-we-built-20261025-v2.jpg`;
let PROVENANCE = `${ROOT}public/og/what-we-built-20261025-v2.provenance.txt`;
const FONT_DIR = `${ROOT}public/fonts`;

const INK = "#080d19";
const PAPER = "#f4f7fd";
const ACID = "#e9ff49";
const COPY = "#b7c7df";
const RULE = "#4a5a78";

const format = process.argv.slice(2).find((a) => a !== "--") ?? "landscape";
const sizes = { landscape: [1200, 630], square: [1200, 1200], portrait: [1080, 1920] };
if (!sizes[format]) throw new Error("Choose landscape, square or portrait");
const [WIDTH, HEIGHT] = sizes[format];
const portrait = format === "portrait";
const tall = format !== "landscape";

if (format !== "landscape") {
  DEST = DEST.replace(".jpg", `-${format}.jpg`);
  PROVENANCE = PROVENANCE.replace(".provenance", `-${format}.provenance`);
}
await initWasm(readFileSync(`${ROOT}src/assets/resvg.wasm`));

const fonts = [400, 700].map(
  (weight) => new Uint8Array(readFileSync(`${FONT_DIR}/bricolage-report-${weight}.ttf`))
);
const master = readFileSync(MASTER).toString("base64");

const text = (x, y, value, { size, weight = 700, fill = PAPER, spacing = 0, italic = false }) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Bricolage Grotesque" font-size="${size}" font-weight="${weight}" font-style="${italic ? "italic" : "normal"}" letter-spacing="${spacing}">${value}</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <clipPath id="card"><rect width="${WIDTH}" height="${HEIGHT}"/></clipPath>
    <linearGradient id="corner" x1="0" y1="630" x2="560" y2="210" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${INK}" stop-opacity="0.94"/>
      <stop offset="0.55" stop-color="${INK}" stop-opacity="0.58"/>
      <stop offset="1" stop-color="${INK}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="scrim" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${INK}" stop-opacity="0.96"/>
      <stop offset="0.3" stop-color="${INK}" stop-opacity="0.86"/>
      <stop offset="0.44" stop-color="${INK}" stop-opacity="0.5"/>
      <stop offset="0.58" stop-color="${INK}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${INK}"/>
  <g clip-path="url(#card)">
    <g transform="${tall ? `translate(-160 ${portrait ? 420 : 180}) scale(${portrait ? 1.0 : 1.0})` : "translate(-58 -88) scale(0.9375)"}">
      <image width="1600" height="1000" href="data:image/png;base64,${master}"/>
    </g>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#corner)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#scrim)"/>
    ${text(74, 126, "WOODHOUSE · PORTFOLIO EDITION", { size: 16, spacing: 5.6, fill: ACID })}
    <path d="M74 148h44" stroke="${ACID}" stroke-width="3"/>
    ${text(68, tall ? 300 : 292, "What we", { size: 104, spacing: -3 })}
    ${text(68, tall ? 410 : 388, "built", { size: 104, spacing: -3, fill: ACID })}
    <path d="M74 ${tall ? HEIGHT - 210 : 438}h186" stroke="${RULE}" stroke-width="1"/>
    ${text(74, tall ? HEIGHT - 160 : 482, "A dated selection. 25 October 2026.", {
      size: tall ? (portrait ? 36 : 32) : 27,
      weight: 400,
      fill: COPY
    })}
    ${text(74, tall ? HEIGHT - 65 : 574, "woodhouse.loftwah.com", { size: tall ? 25 : 18, weight: 400, fill: ACID, spacing: 1.1 })}
  </g>
</svg>`;

const renderer = new Resvg(svg, {
  font: { fontBuffers: fonts, defaultFontFamily: "Bricolage Grotesque" }
});
const rendered = renderer.render();
const png = `${ROOT}output/og/what-we-built-20261025-v2-${format}.png`;
mkdirSync(dirname(png), { recursive: true });
writeFileSync(png, rendered.asPng());
rendered.free();
renderer.free();

execFileSync("magick", [
  png,
  "-strip",
  "-sampling-factor",
  "4:2:0",
  "-quality",
  "88",
  "-interlace",
  "Plane",
  DEST
]);

writeFileSync(
  PROVENANCE,
  [
    "What we built — portfolio edition card, 25 October 2026",
    "",
    "Method: authored composition, no image-generation provider.",
    "Artwork: Woodhouse's own homepage signature (the tensioned-fibre lens),",
    "captured to scripts/assets/dossier/loom-master.png (1600x1000) and cropped here.",
    "Type: Bricolage Grotesque from public/fonts, set inside the SVG.",
    "Reproduce: node scripts/render-edition-card.mjs",
    `Output: ${relative(ROOT, DEST)} (${WIDTH}x${HEIGHT}).`,
    "",
    "No project count is baked in. The date names the editorial review,",
    "not the moment a reader opens it."
  ].join("\n")
);

console.log("wrote", relative(ROOT, DEST));
