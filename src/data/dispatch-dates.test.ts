import assert from "node:assert/strict";
import test from "node:test";
import { byDispatchDate, dispatchDate, validReviewDay } from "./dispatch-dates.ts";

// The failure this encodes: `pnpm run emdash:seed:remote` installs dispatches by
// replaying SQL, so EmDash stamped every `published_at` with the same instant.
// Measured on preview, all seven dispatches fell inside a 30 ms window on
// 4 October 2026. Ordering by that column published the founding essay as a
// 4 October dispatch when its evidence was reviewed on 28 September 2026.
const INSTALL_INSTANT = "2026-10-04T12:01:18.336Z";

test("a replayed publication timestamp cannot date a dispatch", () => {
  assert.equal(
    dispatchDate({ reviewDate: "2026-09-28", publishedAt: INSTALL_INSTANT }),
    "2026-09-28"
  );
});

test("a real publication date is used when no review date exists", () => {
  assert.equal(dispatchDate({ reviewDate: null, publishedAt: INSTALL_INSTANT }), "2026-10-04");
  assert.equal(dispatchDate({ reviewDate: "", publishedAt: INSTALL_INSTANT }), "2026-10-04");
});

test("an unusable review date is not a date", () => {
  assert.equal(validReviewDay("2026-13-45"), null);
  assert.equal(validReviewDay("2026-02-30"), null);
  assert.equal(validReviewDay("2026-09-28"), "2026-09-28");
  assert.equal(validReviewDay("not a date"), null);
  assert.equal(
    dispatchDate({ reviewDate: "2026-02-30", publishedAt: INSTALL_INSTANT }),
    "2026-10-04"
  );
});

test("a dispatch with no usable date at all is not invented one", () => {
  assert.equal(dispatchDate({ reviewDate: null, publishedAt: null }), null);
  assert.equal(dispatchDate({ reviewDate: null, publishedAt: "not-a-timestamp" }), null);
});

test("the journal reads newest first by review date, not by install order", () => {
  const journal = [
    {
      slug: "i-didnt-mean-to-build-a-software-factory",
      reviewDate: "2026-09-28",
      publishedAt: INSTALL_INSTANT
    },
    {
      slug: "nine-projects-and-the-first-one-you-can-check",
      reviewDate: "2026-10-04",
      publishedAt: INSTALL_INSTANT
    },
    { slug: "eight-finish-lines", reviewDate: "2026-10-01", publishedAt: INSTALL_INSTANT }
  ];
  assert.deepEqual(
    byDispatchDate(journal).map((item) => item.slug),
    [
      "nine-projects-and-the-first-one-you-can-check",
      "eight-finish-lines",
      "i-didnt-mean-to-build-a-software-factory"
    ]
  );
});

test("dispatches reviewed on the same day hold a stable order", () => {
  const same = [
    { slug: "b-note", reviewDate: "2026-09-28" },
    { slug: "a-note", reviewDate: "2026-09-28" }
  ];
  const once = byDispatchDate(same).map((item) => item.slug);
  assert.deepEqual(once, ["a-note", "b-note"]);
  assert.deepEqual(
    byDispatchDate([...same].reverse()).map((item) => item.slug),
    once
  );
});
