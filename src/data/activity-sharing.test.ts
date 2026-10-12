import assert from "node:assert/strict";
import test from "node:test";
import {
  activityLink,
  cardPath,
  compositeIsPublic,
  cardIsPng,
  loadActivityCard,
  parseSnapshot
} from "./activity-sharing.ts";
const now = Date.parse("2026-10-12T10:30:00Z");
const snapshot = Math.floor(now / 3600000) * 3600;
test("composite sharing requires every contributing game to remain public", () => {
  const ids = ["fighter", "shoalshot", "protocol-11", "bubbles", "pirates"];
  assert.equal(compositeIsPublic(new Set(ids)), true);
  for (const hidden of ids)
    assert.equal(compositeIsPublic(new Set(ids.filter((id) => id !== hidden))), false);
});
const png = (width = 1200, height = 630) => {
  const bytes = new Uint8Array(24);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  bytes.set([73, 72, 68, 82], 12);
  new DataView(bytes.buffer).setUint32(16, width);
  new DataView(bytes.buffer).setUint32(20, height);
  return bytes;
};
test("share snapshots reject future, stale, fractional and non-hour inputs", () => {
  assert.equal(parseSnapshot(null, now), undefined);
  assert.equal(parseSnapshot(String(snapshot), now), snapshot);
  for (const value of [
    "bad",
    String(snapshot + 3600),
    String(snapshot + 1),
    String(snapshot - 186 * 86400),
    `${snapshot}.0`
  ])
    assert.equal(parseSnapshot(value, now), null);
});
test("the download and share link carry exactly the same game and snapshot", () => {
  const image = new URL(cardPath("fighter", snapshot, true), "https://woodhouse.loftwah.com");
  const link = new URL(activityLink("fighter", snapshot));
  assert.equal(image.searchParams.get("snapshot"), link.searchParams.get("snapshot"));
  assert.equal(image.searchParams.get("game"), link.searchParams.get("game"));
  assert.equal(image.searchParams.get("download"), "1");
});
test("PNG relay rejects false image types, malformed headers and unexpected dimensions", async () => {
  assert.equal(cardIsPng(png()), true);
  assert.equal(cardIsPng(png(1200, 1200)), false);
  assert.equal(cardIsPng(new Uint8Array(24)), false);
  assert.equal(
    await loadActivityCard(
      "fighter",
      snapshot,
      async () => new Response(png(), { headers: { "content-type": "text/html" } })
    ),
    null
  );
});
test("relay never follows redirects and never requests an arbitrary provider URL", async () => {
  let requested = "",
    redirect: RequestRedirect | undefined;
  const bytes = await loadActivityCard("fighter", snapshot, async (input, options) => {
    requested = String(input);
    redirect = options?.redirect;
    return new Response(png(), { headers: { "content-type": "image/png" } });
  });
  assert.ok(bytes);
  assert.equal(new URL(requested).origin, "https://fm.loftwah.com");
  assert.equal(new URL(requested).searchParams.get("snapshot"), String(snapshot));
  assert.equal(redirect, "manual");
  assert.equal(
    await loadActivityCard("fighter", snapshot, async () => new Response(null, { status: 302 })),
    null
  );
});
test("relay bounds both declared and streamed image bytes", async () => {
  const oversized = () =>
    new Response(new Uint8Array(1024 * 1024 + 1), { headers: { "content-type": "image/png" } });
  assert.equal(await loadActivityCard("fighter", snapshot, async () => oversized()), null);
  assert.equal(
    await loadActivityCard(
      "fighter",
      snapshot,
      async () =>
        new Response(png(), {
          headers: { "content-type": "image/png", "content-length": "1048577" }
        })
    ),
    null
  );
  assert.equal(
    await loadActivityCard("fighter", snapshot, async () => {
      throw new Error("offline");
    }),
    null
  );
});
