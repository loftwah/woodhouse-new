import assert from "node:assert/strict";
import test from "node:test";
import { portfolioReadout } from "./portfolio.ts";
import { formatReviewDate } from "./review-date.ts";
import type { PortfolioReview } from "./portfolio.ts";

const project = (overrides: Partial<PortfolioReview> & { slug: string }): PortfolioReview => ({
  reviewDate: "2026-09-28",
  snapshotId: "snapshot-a",
  snapshotSource: "The shareable factory SITREP supplied for the Woodhouse launch.",
  ...overrides
});

test("a portfolio reviewed on one date reports that date", () => {
  const readout = portfolioReadout([project({ slug: "bubbles" }), project({ slug: "fighter" })]);
  assert.equal(readout.reviewDate, "2026-09-28");
  assert.equal(readout.snapshotId, "snapshot-a");
  assert.equal(readout.olderCount, 0);
  assert.deepEqual(readout.reviewDates, ["2026-09-28"]);
});

test("the newest review wins, not the first project in the list", () => {
  // The list is ordered by portfolio index, not by review date. Reading the
  // first entry would have reported 28 September for a page whose newest
  // project was reviewed in October.
  const readout = portfolioReadout([
    project({ slug: "bubbles" }),
    project({
      slug: "asset-hunter",
      reviewDate: "2026-10-04",
      snapshotId: "snapshot-b",
      snapshotSource: "The public Asset Hunter repository and site."
    })
  ]);
  assert.equal(readout.reviewDate, "2026-10-04");
  assert.equal(readout.snapshotId, "snapshot-b");
  assert.equal(readout.snapshotSource, "The public Asset Hunter repository and site.");
  assert.equal(readout.olderCount, 1);
  assert.deepEqual(readout.reviewDates, ["2026-10-04", "2026-09-28"]);
});

test("an unusable review date is ignored rather than sorted", () => {
  const readout = portfolioReadout([
    project({ slug: "bubbles", reviewDate: "" }),
    project({ slug: "loftwahfm", reviewDate: "not a date" }),
    project({ slug: "max", reviewDate: "2026-09-28" })
  ]);
  assert.equal(readout.reviewDate, "2026-09-28");
  assert.equal(readout.olderCount, 0);
  assert.deepEqual(readout.reviewDates, ["2026-09-28"]);
});

test("an empty portfolio reports nothing instead of inventing a date", () => {
  assert.deepEqual(portfolioReadout([]), {
    reviewDate: null,
    snapshotId: null,
    snapshotSource: null,
    reviewDates: [],
    olderCount: 0
  });
});

test("a portfolio with no usable date reports nothing rather than a blank source", () => {
  const readout = portfolioReadout([project({ slug: "bubbles", reviewDate: "2026-13-45" })]);
  assert.equal(readout.reviewDate, null);
  assert.equal(readout.snapshotSource, null);
});

test("a newest review without a linked snapshot does not borrow another project's", () => {
  const readout = portfolioReadout([
    project({ slug: "bubbles", snapshotId: "snapshot-a" }),
    project({ slug: "asset-hunter", reviewDate: "2026-10-04", snapshotId: null })
  ]);
  assert.equal(readout.reviewDate, "2026-10-04");
  assert.equal(readout.snapshotId, null);
});

test("what counts as a usable review date matches the reader-facing formatter", () => {
  // The readout and the printed date must agree, or a page can report a review
  // date it then refuses to render.
  for (const value of [
    "2026-09-28",
    "2026-10-04",
    "2026-13-45",
    "2026-02-30",
    "not a date",
    "",
    " 2026-09-28 "
  ]) {
    const accepted = portfolioReadout([project({ slug: "max", reviewDate: value })]).reviewDate;
    assert.equal(
      accepted !== null,
      formatReviewDate(value) !== null,
      `disagreement for ${JSON.stringify(value)}`
    );
  }
});
