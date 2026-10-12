import assert from "node:assert/strict";
import test from "node:test";
import { gameMedia } from "./share-desk.ts";
import { galleryMedia, galleryPage, galleryURL } from "./share-browser.ts";
const projects = ["fighter", "shoalshot", "protocol-11", "bubbles", "loftwahfm"];

test("bounded gallery pages keep all reviewed media reachable exactly once", () => {
  const found: string[] = [];
  for (const type of ["images", "clips", "artwork"] as const) {
    const media = galleryMedia(projects, undefined, type);
    const first = galleryPage(media);
    for (let n = 1; n <= first.pages; n++) {
      const page = galleryPage(media, n);
      assert.ok(page.items.length <= 6);
      found.push(...page.items.map((asset) => asset.id));
    }
  }
  assert.equal(new Set(found).size, found.length);
  assert.deepEqual([...found].sort(), gameMedia.map((asset) => asset.id).sort());
});

test("overview presents all five projects before repeating a project", () => {
  const page = galleryPage(galleryMedia(projects, undefined, "images"));
  assert.deepEqual(
    page.items.slice(0, 5).map((asset) => asset.project),
    projects
  );
});

test("project and format views preserve selection across native page URLs", () => {
  const media = galleryMedia(projects, "fighter", "clips");
  assert.ok(media.length > 6);
  assert.ok(media.every((asset) => asset.project === "fighter" && asset.kind === "video"));
  assert.equal(galleryURL("fighter", "clips", 2), "/share/?project=fighter&type=clips&page=2");
  assert.equal(galleryURL(), "/share/");
  assert.equal(galleryPage(media, Number.NaN).page, 1);
  assert.equal(galleryPage(media, -3).page, 1);
  assert.equal(galleryPage(media, 1000000).page, 2);
  assert.equal(galleryMedia(["fighter"], "shoalshot", "images").length, 0);
});
