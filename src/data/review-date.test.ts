import assert from "node:assert/strict";
import test from "node:test";
import { formatReviewDate } from "./review-date.ts";

test("a reviewed date renders in the reader's locale and zone", () => {
  assert.equal(formatReviewDate("2026-09-28"), "28 September 2026");
  // The snapshot is stamped at UTC midnight; Melbourne must not show the
  // previous day.
  assert.equal(formatReviewDate("2026-01-01"), "1 January 2026");
});

test("an unusable review date is reported as missing rather than invented", () => {
  for (const value of [
    null,
    undefined,
    "",
    "   ",
    "Not reviewed",
    "2026-13-40",
    "28/09/2026",
    // JavaScript rolls impossible days into the next month rather than
    // rejecting them, which would print a different day than the one reviewed.
    "2026-02-30",
    "2026-04-31"
  ]) {
    assert.equal(formatReviewDate(value), null, `expected null for ${JSON.stringify(value)}`);
  }
});

test("a padded review date is accepted", () => {
  assert.equal(formatReviewDate(" 2026-09-28 "), "28 September 2026");
});
