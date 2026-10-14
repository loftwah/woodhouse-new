import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { gameMedia, imageKind } from "./share-desk.ts";
import { formatReviewDate } from "./review-date.ts";
test("reviewed gallery media resolves to intact public files within delivery limits", () => {
  const ids = new Set<string>();
  for (const asset of gameMedia) {
    assert.ok(!ids.has(asset.id), `duplicate ${asset.id}`);
    ids.add(asset.id);
    assert.match(
      asset.file,
      /^\/share\/(fighter|shoalshot|protocol-11|bubbles|loftwahfm|app-composer)\/[a-zA-Z0-9/_.-]+$/
    );
    assert.ok(formatReviewDate(asset.reviewedAt), `${asset.id} needs a valid review date`);
    assert.ok(asset.width > 0 && asset.height > 0);
    assert.ok(asset.caption.includes("https://"));
    assert.ok(!asset.caption.includes("/Users/") && !asset.alt.includes("/Users/"));
    const file = new URL(`../../public${asset.file}`, import.meta.url);
    const bytes = readFileSync(file);
    assert.equal(bytes.length, asset.bytes);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.sha256);
    assert.ok(bytes.length < 25 * 1024 * 1024);
    if (asset.kind === "video") {
      assert.equal(bytes.subarray(4, 8).toString(), "ftyp");
      assert.ok(asset.duration && asset.duration > 0);
      assert.ok(
        asset.poster && statSync(new URL(`../../public${asset.poster}`, import.meta.url)).size > 0
      );
    } else {
      const mime = asset.file.endsWith(".png")
        ? "image/png"
        : asset.file.endsWith(".webp")
          ? "image/webp"
          : asset.file.endsWith(".svg")
            ? "image/svg+xml"
            : "image/jpeg";
      assert.ok(imageKind(bytes, mime), asset.file);
      assert.ok(bytes.length <= 6 * 1024 * 1024, "image clipboard transfer bound");
      assert.ok(asset.width * asset.height <= 16 * 1024 * 1024, "image clipboard decode bound");
    }
  }
});
