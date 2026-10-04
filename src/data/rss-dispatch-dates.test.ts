import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { dispatchDate, validReviewDay } from "./dispatch-dates.ts";

// The feed's own date handling, exercised against the source. `rss.xml.ts` keeps
// its helper private because it is a route-local detail, but the behaviour is
// public: a feed reader sees `pubDate`, and a dispatch reviewed on a given day
// must not appear to have been published on the day before.
const rss = await readFile(new URL("../pages/rss.xml.ts", import.meta.url), "utf8");

test("the feed derives an item date from the review date", () => {
  assert.match(rss, /publicationDate\(item\.publishedAt, item\.reviewDate\)/);
  assert.match(rss, /validReviewDay\(reviewed\)/);
});

test("the feed does not fall back to midnight in a single fixed offset", () => {
  // `T00:00:00+10:00` is 14:00 on the previous UTC day, which printed a dispatch
  // reviewed on 4 October as published 3 October to every reader outside
  // Australia.
  assert.doesNotMatch(rss, /T00:00:00\+10:00/);
  assert.match(rss, /T00:00:00Z/);
});

test("a review date renders on its own calendar day in UTC", () => {
  const day = validReviewDay("2026-10-04");
  assert.equal(day, "2026-10-04");
  assert.equal(new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10), "2026-10-04");
});

test("the feed still has a real date to fall back on", () => {
  assert.equal(
    dispatchDate({ reviewDate: null, publishedAt: "2026-10-04T12:01:18.336Z" }),
    "2026-10-04"
  );
});
