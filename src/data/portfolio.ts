/**
 * The portfolio readout date, derived from the projects on the page.
 *
 * A portfolio is reviewed project by project, not all at once, so its projects
 * do not all carry the same review date. Taking the date from the first project
 * in the list would silently report the oldest review in the portfolio as if it
 * were the current one. This reports the newest review, says how many projects
 * predate it, and returns the snapshot that review belongs to.
 */
export type PortfolioReview = {
  slug: string;
  reviewDate: string;
  snapshotId: string | null;
  snapshotSource: string;
};

export type PortfolioReadout = {
  /** The newest `YYYY-MM-DD` review date in the portfolio, or null when empty. */
  reviewDate: string | null;
  /** The snapshot the newest review belongs to. */
  snapshotId: string | null;
  /** That snapshot's reviewed source, described in reader-facing terms. */
  snapshotSource: string | null;
  /** Distinct review dates in the portfolio, newest first. */
  reviewDates: string[];
  /** Projects last reviewed before `reviewDate`. */
  olderCount: number;
};

/**
 * A usable review date is a real calendar day, not merely four digits, two
 * digits and two more: `2026-13-45` is shaped like a date and is not one, and
 * a page that printed it would be claiming a review that never happened.
 * `portfolio.test.ts` asserts this agrees with the reader-facing formatter.
 */
function validDate(value: string): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(trimmed);
}

export function portfolioReadout(projects: PortfolioReview[]): PortfolioReadout {
  const dated = projects.filter((project) => validDate(project.reviewDate));
  if (!dated.length) {
    return {
      reviewDate: null,
      snapshotId: null,
      snapshotSource: null,
      reviewDates: [],
      olderCount: 0
    };
  }
  // Dates are ISO calendar days, so a string comparison is also a date order.
  const newest = dated.reduce((latest, project) =>
    project.reviewDate.trim() > latest.reviewDate.trim() ? project : latest
  );
  const newestDate = newest.reviewDate.trim();
  return {
    reviewDate: newestDate,
    snapshotId: newest.snapshotId,
    snapshotSource: newest.snapshotSource || null,
    reviewDates: [...new Set(dated.map((project) => project.reviewDate.trim()))].sort().reverse(),
    olderCount: dated.filter((project) => project.reviewDate.trim() < newestDate).length
  };
}
