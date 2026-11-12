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
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const FPS = 24;
const DURATION = 68;
const WIDTH = 1280;
const HEIGHT = 720;

const testRender = process.argv.includes("--test");
const limit = testRender ? FPS * 3 : DURATION * FPS;
const destination = join(root, "public", "brand");
const framesDir = mkdtempSync(join(tmpdir(), "loom-film-"));
const output = join(framesDir, "loom-film.mp4");
const poster = join(framesDir, "loom-film-poster.jpg");
const started = Date.now();

try {
  const browser = await chromium.launch({ channel: "chrome" });
  try {
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1
    });
    await page.goto(pathToFileURL(join(here, "film", "film.html")).href);
    await page.evaluate(() => document.fonts.ready);
    for (let frame = 0; frame < limit; frame += 1) {
      await page.evaluate((time) => window.renderAt(time), frame / FPS);
      await page.screenshot({
        path: join(framesDir, `frame-${String(frame).padStart(4, "0")}.png`),
        type: "png",
        animations: "disabled"
      });
      if (frame % 120 === 0) process.stdout.write(`frame ${frame}/${limit}\r`);
    }
  } finally {
    await browser.close();
  }

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      join(framesDir, "frame-%04d.png"),
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "19",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      output
    ],
    { stdio: "inherit" }
  );

  if (!testRender) {
    const still = join(framesDir, "poster.png");
    execFileSync("ffmpeg", [
      "-y",
      "-loglevel",
      "error",
      "-ss",
      "34.2",
      "-i",
      output,
      "-frames:v",
      "1",
      still
    ]);
    execFileSync("sips", [
      "-s",
      "format",
      "jpeg",
      "-s",
      "formatOptions",
      "86",
      still,
      "--out",
      poster
    ]);
    mkdirSync(destination, { recursive: true });
    copyFileSync(output, join(destination, "loom-film.mp4"));
    copyFileSync(poster, join(destination, "loom-film-poster.jpg"));
  }
} finally {
  rmSync(framesDir, { recursive: true, force: true });
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(
  testRender
    ? `\nRendered ${limit} test frames in ${seconds}s.`
    : `\nRendered film and poster in ${seconds}s to ${destination}.`
);
