import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { editionShareAssets } from "./edition-share-kit.ts";
import { galleryPage } from "./share-browser.ts";

test("edition originals, captions and pagination preserve the frozen report identity", () => {
  const frozen = editionShareAssets.filter((asset) => asset.file.endsWith(".png"));
  assert.equal(frozen.length, 21);
  assert.equal(new Set(editionShareAssets.map((asset) => asset.file)).size, 26);
  for (const asset of frozen) {
    assert.ok(asset.link.includes("8496128e32ddfd0bddf8da66"));
    assert.ok(asset.caption.includes("8496128e32ddfd0bddf8da66"));
    const png = readFileSync(`public${asset.file}`);
    assert.equal(
      new DataView(png.buffer, png.byteOffset, png.byteLength).getUint32(16),
      asset.width
    );
    assert.equal(
      new DataView(png.buffer, png.byteOffset, png.byteLength).getUint32(20),
      asset.height
    );
  }
  assert.equal(
    createHash("sha256")
      .update(readFileSync("public/share/one-more-round/edition-landscape.png"))
      .digest("hex"),
    "988bfc6d1ff72ee953fda8f16263599dbedfc1e0cc10af1cabbd32436dde38c7"
  );
  const pages = galleryPage(editionShareAssets).pages;
  const reached = Array.from(
    { length: pages },
    (_, index) => galleryPage(editionShareAssets, index + 1).items
  ).flat();
  assert.deepEqual(reached, editionShareAssets);
  assert.ok(
    Array.from(
      { length: pages },
      (_, index) => galleryPage(editionShareAssets, index + 1).items.length
    ).every((count) => count <= 6)
  );
});

test("campaign and films carry a practical destination and honest source classification", () => {
  const campaign = editionShareAssets.filter((asset) => !asset.file.endsWith(".png"));
  assert.equal(campaign.length, 5);
  for (const asset of campaign) {
    assert.equal(asset.link, "https://woodhouse.loftwah.com/editions/one-more-round/");
    assert.ok(asset.caption.includes(asset.link));
  }
  const transcript = readFileSync("public/share/one-more-round/credits.txt", "utf8");
  for (const term of [
    "seeded Classic",
    "earlier artwork",
    "Historical controlled",
    "saved only on this device",
    "No cloud deployment",
    "Pixel Box Theory"
  ])
    assert.ok(transcript.includes(term));
});
