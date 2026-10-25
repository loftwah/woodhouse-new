// Woodhouse's 25 October campaign: editorial compositions of real published
// product art and current production captures. No product interface is invented.
// Reproduce with node scripts/render-showcase-campaign.mjs (ImageMagick required).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
const root = new URL("../", import.meta.url).pathname;
const sources = `${root}scripts/assets/showcase/sources/`;
const refinementsOnly = process.argv.includes("--refinements");
let out = `${root}public/campaign/20261025/`;
let masters = `${root}scripts/assets/showcase/masters/`;
mkdirSync(out, { recursive: true });
mkdirSync(masters, { recursive: true });
await initWasm(readFileSync(`${root}src/assets/resvg.wasm`));
const fonts = [400, 700].map(
  (w) => new Uint8Array(readFileSync(`${root}public/fonts/bricolage-report-${w}.ttf`))
);
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
const t = (x, y, s, size = 48, fill = "#fff8e8", weight = 700, extra = "") =>
  `<text x="${x}" y="${y}" font-family="Bricolage Grotesque" font-weight="${weight}" font-size="${size}" fill="${fill}" ${extra}>${esc(s)}</text>`;
const im = (f, x, y, w, h, extra = "") => {
  const ext = f.split(".").pop();
  const mime = ext === "webp" ? "png" : ext === "jpg" ? "jpeg" : ext;
  const bytes =
    ext === "webp" ? execFileSync("magick", [sources + f, "png:-"]) : readFileSync(sources + f);
  return `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" href="data:image/${mime};base64,${bytes.toString("base64")}" ${extra}/>`;
};
const rect = (x, y, w, h, fill) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
const secondaryOnly = process.argv.includes("--secondary-only");
if (!secondaryOnly && !refinementsOnly) {
  execFileSync("magick", [
    sources + "protocol-production-20261025.png",
    "-crop",
    "960x160+280+560",
    "+repage",
    sources + "protocol-hand-detail.png"
  ]);
}

const cards = [];
let renderFonts = fonts;
let renderQuality = 86;
function render(id, w, h, bg, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${rect(0, 0, w, h, bg)}${body}</svg>`;
  writeFileSync(`${masters}${id}.svg`, svg);
  const r = new Resvg(svg, {
    font: { fontBuffers: renderFonts, defaultFontFamily: "Bricolage Grotesque" }
  });
  const p = r.render();
  writeFileSync(`${out}${id}-original.png`, p.asPng());
  p.free();
  r.free();
  execFileSync("magick", [
    `${out}${id}-original.png`,
    "-resize",
    "1200x1200>",
    "-strip",
    "-sampling-factor",
    "4:2:0",
    "-quality",
    String(renderQuality),
    `${out}${id}.jpg`
  ]);
  execFileSync("magick", [
    `${out}${id}-original.png`,
    "-resize",
    "300x300",
    "-strip",
    "-quality",
    "85",
    `${out}${id}-feed.jpg`
  ]);
  cards.push({
    id,
    width: w,
    height: h,
    sha256: createHash("sha256")
      .update(readFileSync(`${out}${id}-original.png`))
      .digest("hex")
  });
}
if (!secondaryOnly && !refinementsOnly) {
  // The playfield is the Bubbles subject. Whole screen, no counterfeit UI.
  render(
    "bubbles-one-more-shot",
    1200,
    1200,
    "#17102b",
    t(64, 86, "BUBBLES", 46, "#a9f9ff") +
      t(58, 213, "One more shot.", 112) +
      t(64, 282, "Match three. Clear the board.", 37, "#d6c6f4", 400) +
      im("bubbles-production-20261025.png", 0, 340, 1200, 750) +
      t(64, 1150, "bubbles.loftwah.com", 28, "#a9f9ff", 400)
  );
  // Fight-night bill: two existing roster portraits, with their complete silhouettes.
  render(
    "fighter-first-fight",
    1080,
    1350,
    "#140e1e",
    rect(0, 0, 1080, 270, "#f3d528") +
      t(55, 70, "LOFTWAH", 38, "#140e1e") +
      t(48, 200, "FIGHTER", 142, "#140e1e") +
      im("fighter-viking.webp", 0, 300, 540, 675) +
      im("fighter-reaper.webp", 540, 300, 540, 675) +
      rect(442, 613, 195, 110, "#f3d528") +
      t(476, 695, "VS", 80, "#140e1e") +
      t(55, 1050, "VIKING", 57) +
      t(560, 1050, "GRIM REAPER", 48) +
      t(55, 1180, "Your first fight.", 74, "#f3d528") +
      t(55, 1280, "fighter.loftwah.com", 29, "#fff8e8", 400)
  );
  // A natural-history specimen plate, using published game art, never a fake dive.
  render(
    "shoalshot-lantern-ray",
    1080,
    1350,
    "#042c35",
    t(60, 84, "SHOALSHOT", 46, "#eaca82") +
      t(54, 205, "Below the", 111) +
      t(54, 320, "surface.", 111) +
      im("shoalshot-ray.webp", 60, 300, 960, 850) +
      t(60, 1160, "LANTERN RAY", 43, "#eaca82") +
      t(60, 1224, "Read the tide. Place the shot.", 36, "#c2e1df", 400) +
      t(60, 1292, "shoalshot.loftwah.com", 26, "#c2e1df", 400)
  );
  // The hand is a detail crop of the actual production table, no shared-cast art.
  render(
    "protocol-your-next-move",
    1600,
    1000,
    "#f3e7c6",
    t(66, 92, "PROTOCOL 11", 46, "#12524c") +
      t(57, 250, "Your next move.", 151, "#143b37") +
      t(65, 330, "A card table that changes every round.", 44, "#375b50", 400) +
      `<defs><clipPath id="hand"><rect x="0" y="430" width="1600" height="430"/></clipPath></defs><g clip-path="url(#hand)">${rect(0, 430, 1600, 430, "#13736d") + im("protocol-hand-detail.png", 0, 430, 1600, 430)}</g>` +
      t(65, 934, "protocol11.loftwah.com", 32, "#12524c", 400)
  );
  // Record-shop composition: all covers remain whole and individually recognisable.
  render(
    "fm-find-your-frequency",
    1200,
    1200,
    "#f1efdf",
    t(58, 86, "LOFTWAH FM", 44, "#17181c") +
      t(50, 220, "Find your", 111, "#17181c") +
      t(50, 329, "frequency.", 111, "#17181c") +
      `<g transform="rotate(-8 300 700)">${im("fm-cartridge-funk.jpg", 40, 478, 540, 540)}</g><g transform="rotate(9 900 755)">${im("fm-cloud-control.jpg", 620, 510, 500, 500)}</g>` +
      rect(410, 706, 420, 420, "#17181c") +
      im("fm-beats.jpg", 423, 719, 394, 394) +
      t(58, 1164, "Original music. Stations. Shows.     fm.loftwah.com", 28, "#17181c", 400)
  );
  // Product editorial: the PDF editor is a real public capture, fictional document.
  render(
    "composer-make-something-useful",
    1600,
    1000,
    "#ff6500",
    t(60, 78, "APP COMPOSER", 40) +
      t(52, 220, "Make something", 112) +
      t(52, 331, "useful.", 112) +
      im("composer-paperwork.webp", 510, 320, 1060, 720) +
      t(60, 550, "A PDF editor.", 39, "#161616") +
      t(60, 608, "Built here.", 39, "#161616") +
      t(60, 666, "Open in a tab.", 39, "#161616") +
      t(60, 916, "composer.loftwah.com", 29, "#161616", 400)
  );
  // A publisher spread: three large subjects, never tiny unreadable UI thumbnails.
  render(
    "woodhouse-play-make-listen",
    1600,
    900,
    "#080d19",
    t(58, 82, "WOODHOUSE", 40, "#e9ff49") +
      t(52, 211, "Play. Make. Listen.", 126) +
      `<defs><clipPath id="play"><rect x="0" y="300" width="535" height="490"/></clipPath><clipPath id="make"><rect x="535" y="300" width="530" height="490"/></clipPath><clipPath id="listen"><rect x="1065" y="300" width="535" height="490"/></clipPath></defs><g clip-path="url(#play)">${rect(0, 300, 535, 490, "#042c35")}${im("shoalshot-ray.webp", -80, 270, 700, 550)}</g><g clip-path="url(#make)">${rect(535, 300, 530, 490, "#ff6500")}${im("composer-paperwork.webp", 530, 300, 535, 490)}</g><g clip-path="url(#listen)">${im("fm-cartridge-funk.jpg", 1065, 277, 535, 535)}</g>` +
      t(58, 858, "Games, software and original music from Loftwah.", 31, "#e9ff49", 400) +
      t(1205, 858, "woodhouse.loftwah.com", 23, "#fff8e8", 400)
  );
  // Wide editions are individually composed, rather than crops of portrait posters.
  render(
    "bubbles-one-more-shot-landscape",
    1200,
    630,
    "#17102b",
    im("bubbles-production-20261025.png", 0, 50, 820, 512) +
      t(850, 110, "BUBBLES", 35, "#a9f9ff") +
      t(850, 260, "One", 83) +
      t(850, 342, "more", 83) +
      t(850, 424, "shot.", 83) +
      t(30, 606, "bubbles.loftwah.com", 24, "#a9f9ff", 400)
  );
  render(
    "fighter-first-fight-landscape",
    1200,
    630,
    "#140e1e",
    im("fighter-viking.webp", 0, 0, 430, 538) +
      im("fighter-reaper.webp", 430, 0, 430, 538) +
      rect(860, 0, 340, 630, "#f3d528") +
      t(892, 75, "LOFTWAH", 29, "#140e1e") +
      t(885, 154, "FIGHTER", 60, "#140e1e") +
      t(892, 360, "Your first", 42, "#140e1e") +
      t(892, 416, "fight.", 60, "#140e1e") +
      t(30, 600, "VIKING  VS  GRIM REAPER", 39) +
      t(893, 577, "fighter.loftwah.com", 20, "#140e1e", 400)
  );
  render(
    "shoalshot-lantern-ray-landscape",
    1200,
    630,
    "#042c35",
    t(55, 80, "SHOALSHOT", 35, "#eaca82") +
      t(50, 237, "Below the", 88) +
      t(50, 333, "surface.", 88) +
      im("shoalshot-ray.webp", 515, 20, 680, 570) +
      t(55, 476, "LANTERN RAY", 28, "#eaca82") +
      t(55, 577, "shoalshot.loftwah.com", 24, "#c2e1df", 400)
  );
  render(
    "fm-find-your-frequency-landscape",
    1200,
    630,
    "#f1efdf",
    t(42, 70, "LOFTWAH FM", 34, "#17181c") +
      t(35, 218, "Find your", 76, "#17181c") +
      t(35, 300, "frequency.", 76, "#17181c") +
      im("fm-cartridge-funk.jpg", 530, 65, 410, 410) +
      im("fm-cloud-control.jpg", 817, 210, 335, 335) +
      t(42, 563, "Original music. Stations. Shows.", 25, "#17181c", 400) +
      t(42, 601, "fm.loftwah.com", 23, "#17181c", 400)
  );
  // Authentic screen editions accompany the authored posters.
  for (const [id, f] of [
    ["bubbles-play-20261025", "bubbles-production-20261025.png"],
    ["fighter-tutorial-20261025", "fighter-battle-production-20261025.png"],
    ["shoalshot-dive-20261025", "shoalshot-production-20261025.png"],
    ["composer-home-20261025", "composer-production-20261025.png"],
    ["fm-radio-20261025", "fm-production-20261025.png"]
  ]) {
    execFileSync("magick", [sources + f, "-strip", `${out}${id}-original.png`]);
    execFileSync("magick", [
      sources + f,
      "-resize",
      "1200x1200>",
      "-strip",
      "-quality",
      String(renderQuality),
      `${out}${id}.jpg`
    ]);
  }
  writeFileSync(
    `${out}composition-receipt.json`,
    JSON.stringify(
      {
        reviewedAt: "2026-10-25",
        method:
          "Editorial compositions, public native artwork and production browser captures. No image-generation provider. Not native product OG replacements.",
        cards
      },
      null,
      2
    ) + "\n"
  );
  console.log(cards);
}

// Independently authored secondary campaign, using the same renderer and sources.
function renderSecondary() {
  const firstCard = cards.length;
  renderFonts = [
    ...fonts,
    new Uint8Array(readFileSync("/System/Library/Fonts/Supplemental/Georgia.ttf"))
  ];
  renderQuality = 87;
  const st = (x, y, value, size, fill = "#17181c", family = "Bricolage Grotesque", weight = 700) =>
    t(x, y, value, size, fill, weight).replace(
      `font-family="Bricolage Grotesque"`,
      `font-family="${family}"`
    );
  render(
    "plans-with-you-evening-returned",
    1200,
    1200,
    "#f4efe5",
    im("club-cancelled-invitation-generated.png", 0, 0, 1200, 1200) +
      st(58, 112, "Plans With You", 83, "#122944", "Georgia", 400) +
      st(62, 175, "Waitlist open.", 36, "#122944", "Bricolage Grotesque", 400) +
      st(62, 223, "Paid membership closed.", 36, "#122944", "Bricolage Grotesque", 400)
  );
  render(
    "asset-hunter-discover-possibilities",
    1200,
    1200,
    "#f4efe5",
    im("asset-hunter-discovery-generated.png", 0, 0, 1200, 1200) +
      st(55, 100, "Asset Hunter", 86, "#17181c") +
      st(
        58,
        161,
        "Find a possibility. See how it works.",
        32,
        "#8d390b",
        "Bricolage Grotesque",
        400
      )
  );
  render(
    "max-a-little-help",
    1200,
    1200,
    "#060606",
    im("max-wordmark.png", 62, 45, 270, 90) +
      st(60, 265, "A familiar walker.", 88, "#fff") +
      st(60, 360, "A little help.", 88, "#fff") +
      im("max-module-concept.webp", 0, 400, 1200, 800) +
      rect(0, 1060, 1200, 140, "#060606") +
      st(60, 1115, "Concept image.", 36, "#eee", "Bricolage Grotesque", 400) +
      st(60, 1170, "Explore the public simulator.", 36, "#eee", "Bricolage Grotesque", 400)
  );
  render(
    "plans-with-you-evening-returned-landscape",
    1200,
    630,
    "#f4efe5",
    im("club-cancelled-invitation-generated.png", 570, 0, 630, 630) +
      st(45, 95, "Plans With You", 58, "#122944", "Georgia", 400) +
      st(45, 270, "Evening", 88, "#122944", "Georgia", 400) +
      st(45, 366, "returned.", 88, "#122944", "Georgia", 400) +
      st(48, 530, "Waitlist open.", 36, "#122944", "Bricolage Grotesque", 400) +
      st(48, 580, "Paid membership closed.", 36, "#122944", "Bricolage Grotesque", 400)
  );
  render(
    "asset-hunter-discover-possibilities-landscape",
    1200,
    630,
    "#f4efe5",
    im("asset-hunter-discovery-generated.png", 570, 0, 630, 630) +
      st(45, 94, "Asset Hunter", 66, "#17181c") +
      st(45, 265, "Find a", 95, "#17181c") +
      st(45, 365, "possibility.", 95, "#17181c") +
      st(48, 550, "See the technique. Check the rights.", 25, "#8d390b", "Bricolage Grotesque", 400)
  );
  render(
    "max-a-little-help-landscape",
    1200,
    630,
    "#060606",
    im("max-wordmark.png", 45, 30, 205, 70) +
      st(45, 247, "A familiar", 72, "#fff") +
      st(45, 332, "walker.", 72, "#fff") +
      im("max-module-concept.webp", 510, 60, 690, 460) +
      st(45, 530, "Concept image.", 36, "#eee", "Bricolage Grotesque", 400) +
      st(45, 586, "Public simulator.", 36, "#eee", "Bricolage Grotesque", 400)
  );
  for (const [id, f] of [
    ["max-demo-20261025", "max-demo-production.png"],
    ["plans-with-you-home-20261025", "club-current-production.png"],
    ["asset-hunter-catalogue-20261025", "asset-hunter-current-production.png"]
  ]) {
    execFileSync("magick", [sources + f, "-strip", out + id + "-original.png"]);
    execFileSync("magick", [
      sources + f,
      "-resize",
      "1200x1200>",
      "-strip",
      "-quality",
      "87",
      out + id + ".jpg"
    ]);
  }

  writeFileSync(
    `${out}secondary-composition-receipt.json`,
    JSON.stringify(
      {
        reviewedAt: "2026-10-25",
        method:
          "Two new built-in image_gen conceptual illustrations, a composition of MAX public concept artwork and current production screenshots. No native OG replacement.",
        cards: cards.slice(firstCard)
      },
      null,
      2
    ) + "\n"
  );
}
if (!refinementsOnly) renderSecondary();

// These four subjects were too small or conventional in the first campaign.
// Keep both alternatives privately; publish only the selected second edition.
// Historical 20261025 files remain byte-for-byte untouched.
if (refinementsOnly) {
  const clip = (id, x, y, w, h, body) =>
    `<defs><clipPath id="${id}">${rect(x, y, w, h, "white")}</clipPath></defs><g clip-path="url(#${id})">${body}</g>`;
  const loom = (x, y, w, h) => {
    const bytes = readFileSync(`${root}public/signature/loom-wide.jpg`);
    return `<image x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" href="data:image/jpeg;base64,${bytes.toString("base64")}"/>`;
  };
  const candidates = [
    {
      id: "bubbles-next-shot",
      w: 1200,
      h: 1500,
      bg: "#17102b",
      selected: true,
      body:
        clip(
          "board",
          0,
          320,
          1200,
          1120,
          im("bubbles-production-20261025.png", -360, 190, 1980, 1238)
        ) +
        rect(0, 0, 1200, 220, "#17102b") +
        t(48, 65, "BUBBLES", 35, "#a9f9ff") +
        t(42, 180, "Make the next shot.", 106) +
        rect(0, 1440, 1200, 60, "#17102b") +
        t(
          48,
          1480,
          "Match three. Clear the board.                 bubbles.loftwah.com",
          27,
          "#a9f9ff",
          400
        )
    },
    {
      id: "bubbles-board-detail-rejected",
      w: 1200,
      h: 1200,
      bg: "#17102b",
      body:
        clip(
          "detail",
          0,
          0,
          1200,
          930,
          im("bubbles-production-20261025.png", -660, -110, 2520, 1575)
        ) +
        rect(0, 930, 1200, 270, "#17102b") +
        t(45, 1045, "ONE MORE SHOT.", 104) +
        t(48, 1140, "BUBBLES", 45, "#a9f9ff")
    },
    {
      id: "composer-paperwork-close",
      w: 1600,
      h: 1000,
      bg: "#ff6500",
      selected: true,
      body:
        t(48, 75, "APP COMPOSER", 37) +
        t(42, 201, "A PDF.", 120) +
        t(42, 335, "Your mark.", 110) +
        t(48, 440, "Paperwork", 43, "#17181c") +
        t(48, 498, "A real browser editor.", 32, "#17181c", 400) +
        clip("editor", 650, 0, 950, 1000, im("composer-paperwork.webp", 377, 0, 1527, 1167)) +
        t(48, 815, "Edit. Highlight.", 39, "#17181c") +
        t(48, 869, "Sign. Export.", 39, "#17181c") +
        t(48, 955, "composer.loftwah.com", 27, "#17181c", 400)
    },
    {
      id: "composer-full-screen-rejected",
      w: 1600,
      h: 1000,
      bg: "#ff6500",
      body:
        t(45, 110, "Make something useful.", 110) +
        im("composer-paperwork.webp", 0, 165, 1600, 790) +
        t(45, 975, "APP COMPOSER · PAPERWORK", 27, "#17181c")
    },
    {
      id: "max-try-the-simulator",
      w: 1200,
      h: 1200,
      bg: "#060606",
      selected: true,
      body:
        im("max-wordmark.png", 48, 35, 220, 75) +
        t(350, 90, "Try the simulator.", 55, "#c9f06b") +
        clip(
          "simulator",
          48,
          170,
          1104,
          867,
          im("max-simulator-interaction.png", 48, 170, 1104, 867)
        ) +
        t(48, 1100, "Browser demonstration. No physical walker connected.", 31, "#c9f06b", 400) +
        t(48, 1170, "max.loftwah.com/demo", 29, "#fff8e8", 400)
    },
    {
      id: "max-concept-close-rejected",
      w: 1200,
      h: 1200,
      bg: "#060606",
      body:
        im("max-module-concept.webp", -200, 0, 1800, 1200) +
        rect(0, 0, 1200, 280, "#060606") +
        t(45, 160, "A little help.", 130) +
        rect(0, 1050, 1200, 150, "#060606") +
        t(48, 1110, "MAX · Concept image", 38) +
        t(48, 1170, "Explore the simulator.", 32)
    },
    {
      id: "woodhouse-made-here",
      w: 1600,
      h: 1000,
      bg: "#080d19",
      selected: true,
      body:
        loom(0, 0, 1600, 1000) +
        rect(0, 0, 760, 1000, "#080d19") +
        t(48, 80, "WOODHOUSE", 41, "#e9ff49") +
        t(38, 285, "The things", 137) +
        t(38, 432, "we make.", 153, "#e9ff49") +
        t(48, 680, "Games to play.", 42) +
        t(48, 742, "Software to try.", 42) +
        t(48, 804, "Music to keep.", 42) +
        t(48, 950, "woodhouse.loftwah.com", 31, "#e9ff49", 400)
    },
    {
      id: "woodhouse-overlap-rejected",
      w: 1600,
      h: 1000,
      bg: "#080d19",
      body:
        t(45, 150, "Play. Make. Listen.", 137, "#e9ff49") +
        `<g transform="rotate(-9 420 600)">${im("shoalshot-ray.webp", 50, 300, 800, 620)}</g>` +
        `<g transform="rotate(8 1040 600)">${im("composer-paperwork.webp", 670, 340, 700, 535)}</g>` +
        im("fm-cartridge-funk.jpg", 1100, 500, 450, 450)
    }
  ];
  const wides = [
    {
      id: "bubbles-next-shot-landscape",
      w: 1200,
      h: 630,
      bg: "#17102b",
      body:
        clip(
          "wide-board",
          390,
          0,
          810,
          630,
          im("bubbles-production-20261025.png", 291, 0, 1008, 630)
        ) +
        t(30, 62, "BUBBLES", 31, "#a9f9ff") +
        t(25, 205, "Make", 95) +
        t(25, 300, "the next", 81) +
        t(25, 400, "shot.", 105) +
        t(30, 583, "bubbles.loftwah.com", 22, "#a9f9ff", 400)
    },
    {
      id: "composer-paperwork-close-landscape",
      w: 1200,
      h: 630,
      bg: "#ff6500",
      body:
        t(32, 56, "APP COMPOSER", 30) +
        t(25, 175, "A PDF.", 104) +
        t(25, 280, "Your mark.", 86) +
        t(32, 379, "Paperwork", 34, "#17181c") +
        t(32, 430, "Edit. Highlight. Sign. Export.", 25, "#17181c", 400) +
        t(32, 587, "composer.loftwah.com", 23, "#17181c", 400) +
        clip("wide-editor", 530, 0, 670, 630, im("composer-paperwork.webp", 331, 0, 1054, 805))
    },
    {
      id: "max-try-the-simulator-landscape",
      w: 1200,
      h: 630,
      bg: "#060606",
      body:
        im("max-wordmark.png", 32, 24, 175, 58) +
        t(27, 202, "Meet MAX.", 90) +
        t(32, 275, "Try the simulator.", 35, "#c9f06b") +
        clip(
          "wide-sim",
          480,
          85,
          690,
          405,
          im("max-simulator-interaction.png", 480, 85, 690, 405)
        ) +
        t(32, 515, "Browser demonstration.", 28) +
        t(32, 559, "No physical walker connected.", 26, "#c9f06b", 400) +
        t(32, 606, "max.loftwah.com/demo", 22, "#fff8e8", 400)
    },
    {
      id: "woodhouse-made-here-landscape",
      w: 1200,
      h: 630,
      bg: "#080d19",
      body:
        loom(0, 0, 1200, 630) +
        rect(0, 0, 590, 630, "#080d19") +
        t(32, 57, "WOODHOUSE", 31, "#e9ff49") +
        t(25, 210, "The things", 103) +
        t(25, 321, "we make.", 116, "#e9ff49") +
        t(32, 445, "Games. Software. Original music.", 27) +
        t(32, 589, "woodhouse.loftwah.com", 25, "#e9ff49", 400)
    }
  ];
  out = `${root}output/playwright/portfolio-20261025/alternatives/`;
  masters = out;
  mkdirSync(out, { recursive: true });
  for (const c of candidates) render(c.id, c.w, c.h, c.bg, c.body);
  out = `${root}public/campaign/20261025-v2/`;
  masters = `${root}scripts/assets/showcase/masters-v2/`;
  mkdirSync(out, { recursive: true });
  mkdirSync(masters, { recursive: true });
  for (const c of candidates.filter((c) => c.selected)) render(c.id, c.w, c.h, c.bg, c.body);
  for (const c of wides) render(c.id, c.w, c.h, c.bg, c.body);
  writeFileSync(
    `${out}composition-receipt.json`,
    JSON.stringify(
      {
        reviewedAt: "2026-10-25",
        method:
          "Editorial compositions of real public product captures and Woodhouse's own fibre artwork. Historical first editions retained.",
        cards: cards.slice(-(4 + wides.length))
      },
      null,
      2
    ) + "\n"
  );
}
