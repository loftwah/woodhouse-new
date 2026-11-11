#!/usr/bin/env node
/**
 * Render the Loom applications: a poster, a social set, the seal in both
 * approved treatments, and a card. Same face, same primitives as the font,
 * so these are artefacts of the identity rather than pictures of it.
 */

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const out = join(root, "public", "brand");
mkdirSync(out, { recursive: true });

const pieces = [
  { id: "poster", file: "loom-poster.png", width: 2480, height: 3508 },
  { id: "square", file: "loom-social-square.png", width: 1080, height: 1080 },
  { id: "portrait", file: "loom-social-portrait.png", width: 1080, height: 1350 },
  { id: "inverted", file: "loom-seal-acid.png", width: 1080, height: 1080 },
  { id: "card-front", file: "loom-card-front.png", width: 1004, height: 650 },
  { id: "card-back", file: "loom-card-back.png", width: 1004, height: 650 },
];

const browser = await chromium.launch({ channel: "chrome" });
for (const piece of pieces) {
  const page = await browser.newPage({
    viewport: { width: piece.width, height: piece.height },
    deviceScaleFactor: 1,
  });
  await page.goto(`file://${join(here, "applications.html")}?piece=${piece.id}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.locator(`#${piece.id}`).screenshot({ path: join(out, piece.file) });
  await page.close();
  console.log(`rendered ${piece.file} (${piece.width}x${piece.height})`);
}
await browser.close();
