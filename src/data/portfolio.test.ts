import assert from "node:assert/strict";
import test from "node:test";
import { portfolioReadout, type PortfolioReview } from "./portfolio.ts";

const review = (slug: string, reviewDate: string): PortfolioReview => ({
  slug,
  reviewDate,
  snapshotId: `snapshot-${slug}`,
  snapshotSource: `Source for ${slug}`
});

test("the readout takes the newest real review date", () => {
  const result = portfolioReadout([
    review("older", "2026-09-28"),
    review("newer", "2026-10-18"),
    review("impossible", "2026-02-30")
  ]);
  assert.equal(result.reviewDate, "2026-10-18");
  assert.equal(result.snapshotId, "snapshot-newer");
  assert.equal(result.olderCount, 1);
});

test("a future review date never becomes the newest review", () => {
  const future = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  const result = portfolioReadout([review("past", "2026-10-18"), review("future", future)]);
  assert.equal(result.reviewDate, "2026-10-18");
  assert.deepEqual(result.reviewDates, ["2026-10-18"]);
  assert.equal(result.olderCount, 0);
});

test("a portfolio with only future or impossible dates reports no review", () => {
  const future = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  assert.deepEqual(portfolioReadout([review("future", future), review("bad", "2026-13-45")]), {
    reviewDate: null,
    snapshotId: null,
    snapshotSource: null,
    reviewDates: [],
    olderCount: 0
  });
});
