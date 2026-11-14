import assert from "node:assert/strict";
import test from "node:test";
import { orderArtwork } from "./artwork-order.ts";
import { campaignItems, type CampaignItem } from "./showcase-campaign.ts";

const base = campaignItems[0]!;
const works: CampaignItem[] = [
  {
    ...base,
    id: "a",
    title: "Zebra",
    series: "wild-25",
    width: 100,
    height: 100,
    fileModifiedAt: "2026-11-14T03:00:00.000Z"
  },
  {
    ...base,
    id: "b",
    title: "Apple",
    series: "commissioned",
    width: 300,
    height: 100,
    fileModifiedAt: "2026-11-14T02:00:00.000Z"
  },
  {
    ...base,
    id: "c",
    title: "Mango",
    series: "wild-25",
    width: 200,
    height: 100,
    fileModifiedAt: "2026-11-14T01:00:00.000Z"
  }
];
const ids = (items: CampaignItem[]) => items.map(({ id }) => id);

test("files sort by individual modification date across collections", () => {
  assert.deepEqual(ids(orderArtwork(works, "newest", "")), ["a", "b", "c"]);
  assert.deepEqual(ids(orderArtwork(works, "oldest", "")), ["c", "b", "a"]);
  assert.deepEqual(ids(orderArtwork(works, "title-desc", "")), ["a", "c", "b"]);
  assert.deepEqual(ids(orderArtwork(works, "largest", "")), ["b", "c", "a"]);
});

test("shuffle stays stable across pages and different input orders", () => {
  const source = Array.from({ length: 50 }, (_, i) => ({ ...base, id: `file-${i}` }));
  const shuffled = ids(orderArtwork(source, "shuffle", "first"));
  assert.deepEqual(shuffled, ids(orderArtwork([...source].reverse(), "shuffle", "first")));
  assert.notDeepEqual(shuffled, ids(orderArtwork(source, "shuffle", "second")));
  assert.equal(new Set(shuffled).size, source.length);
});
