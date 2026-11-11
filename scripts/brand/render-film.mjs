#!/usr/bin/env node
/**
 * Render "One fibre" to MP4.
 *
 * The film is a closed-form function of time: film.html exposes renderAt(t)
 * and never animates on its own, so a frame at 12.5 seconds is the same frame
 * whenever it is rendered. That makes the output reproducible and lets us
 * render it in a headless browser without a video framework.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const FPS = 24;
const DURATION = 68;
const WIDTH = 1280;
const HEIGHT = 720;

const framesDir = join(process.env.TMPDIR ?? "/tmp", "loom-film-frames");
const output = join(root, "public", "brand", "loom-film.mp4");
const poster = join(root, "public", "brand", "loom-film-poster.jpg");

const limit = process.argv.includes("--test") ? FPS * 3 : DURATION * FPS;

rmSync(framesDir, { recursive: true, force: true });
mkdirSync(framesDir, { recursive: true });
mkdirSync(dirname(output), { recursive: true });

const started = Date.now();
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
await page.goto(`file://${join(here, "film", "film.html")}`);
await page.evaluate(() => document.fonts.ready);

for (let frame = 0; frame < limit; frame += 1) {
  await page.evaluate((time) => window.renderAt(time), frame / FPS);
  await page.screenshot({
    path: join(framesDir, `frame-${String(frame).padStart(4, "0")}.png`),
    type: "png",
    animations: "disabled",
  });
  if (frame % 120 === 0) process.stdout.write(`frame ${frame}/${limit}\r`);
}
await browser.close();

execFileSync(
  "ffmpeg",
  [
    "-y",
    "-framerate", String(FPS),
    "-i", join(framesDir, "frame-%04d.png"),
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "19",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    output,
  ],
  { stdio: "inherit" },
);

if (limit === DURATION * FPS) {
  const still = join(process.env.TMPDIR ?? "/tmp", "loom-poster.png");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "34.2", "-i", output, "-frames:v", "1", still]);
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "86", still, "--out", poster]);
  rmSync(still, { force: true });
}

rmSync(framesDir, { recursive: true, force: true });

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`\nrendered ${output} and ${poster} in ${seconds}s`);
