// Composes the Woodhouse project-dossier social card.
//
// This is not an image generator. The material is Woodhouse's own signature —
// the lens of tensioned fibres the homepage draws live — captured to a master
// still by reshaping the signature stage and screenshotting only the canvas.
// This script does the job a designer would do next: choose a crop, place it,
// and set type over it in Bricolage Grotesque at real 1200x630 dimensions.
//
// The card carries no project count and no review date. Those are the two
// claims that made the preview it replaces stale the moment the portfolio moved.
// See `public/og/project-dossier-20261025.provenance.txt`.
//
//   node scripts/render-dossier-preview.mjs
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
const DEST = `${ROOT}public/og/project-dossier-20261025.jpg`;
const FONT_DIR = `${ROOT}public/fonts`;

const INK = "#080d19";
const PAPER = "#f4f7fd";
const ACID = "#e9ff49";
const COPY = "#b7c7df";
const RULE = "#4a5a78";

const WIDTH = 1200;
const HEIGHT = 630;

// The site imports the same binary as a URL through Astro's asset pipeline.
// Node's loader would try to parse it as JavaScript, so read the bytes here.
await initWasm(readFileSync(`${ROOT}src/assets/resvg.wasm`));

const fonts = [400, 700].map(
  (weight) => new Uint8Array(readFileSync(`${FONT_DIR}/bricolage-report-${weight}.ttf`))
);
const master = readFileSync(MASTER).toString("base64");

const text = (x, y, value, { size, weight = 700, fill = PAPER, spacing = 0 }) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="Bricolage Grotesque" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}">${value}</text>`;

// Two scrims, both linear. A radial one was tried first and multiplied into the
// bright fibres as a soft blotch; straight ramps only ever change brightness.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <clipPath id="card"><rect width="${WIDTH}" height="${HEIGHT}"/></clipPath>
    <linearGradient id="corner" x1="0" y1="630" x2="520" y2="230" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${INK}" stop-opacity="0.92"/>
      <stop offset="0.52" stop-color="${INK}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${INK}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="scrim" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${INK}" stop-opacity="0.97"/>
      <stop offset="0.28" stop-color="${INK}" stop-opacity="0.9"/>
      <stop offset="0.4" stop-color="${INK}" stop-opacity="0.62"/>
      <stop offset="0.5" stop-color="${INK}" stop-opacity="0.2"/>
      <stop offset="0.6" stop-color="${INK}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${INK}"/>
  <g clip-path="url(#card)">
    <g transform="translate(-58 -88) scale(0.9375)">
      <image width="1600" height="1000" href="data:image/png;base64,${master}"/>
    </g>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#corner)"/>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#scrim)"/>
    ${text(74, 128, "WOODHOUSE", { size: 17, spacing: 6.4, fill: ACID })}
    <path d="M74 150h44" stroke="${ACID}" stroke-width="3"/>
    ${text(70, 300, "A project,", { size: 96, spacing: -2.6 })}
    ${text(70, 388, "in context.", { size: 96, spacing: -2.6 })}
    <path d="M74 442h186" stroke="${RULE}" stroke-width="1"/>
    ${text(74, 484, "Work, its limits, and the evidence still to come.", {
      size: 21,
      weight: 400,
      fill: COPY
    })}
    ${text(74, 574, "woodhouse.loftwah.com", { size: 15, weight: 400, fill: ACID, spacing: 1.1 })}
  </g>
</svg>`;

const renderer = new Resvg(svg, {
  font: { fontBuffers: fonts, defaultFontFamily: "Bricolage Grotesque" }
});
const rendered = renderer.render();
const png = `${ROOT}output/og/project-dossier-20261025.png`;
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

console.log("wrote", relative(ROOT, DEST));
