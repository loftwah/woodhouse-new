/**
 * Which date a dispatch's chronology actually comes from.
 *
 * EmDash stamps `published_at` when a record is published. Woodhouse installs its
 * reviewed model by replaying SQL — `pnpm run emdash:seed:remote` — so every
 * seeded dispatch received the same `published_at`, the moment the replay ran.
 * Measured on preview, all seven dispatches carried a `published_at` inside the
 * same 30-millisecond window on 4 October 2026, including dispatches whose
 * evidence was reviewed on 28 September 2026.
 *
 * Sorting by that column made the journal read in reverse order and printed a
 * publication date that no dispatch could have had. The founding essay claimed
 * to be published on 4 October 2026.
 *
 * A review date is a real operator decision and is what the product promises:
 * "Claims have a source and a review date." Publication order follows the review,
 * because the review is the event the record is about. `published_at` is kept
 * for records whose publication date genuinely differs from their review date —
 * an editor publishing through EmDash sets it — but it is never preferred over a
 * review date that is present.
 */

/** A dispatch date pair as the public read model supplies it. */
export type DispatchDates = {
  /** `YYYY-MM-DD` review date from the reviewed record. */
  reviewDate: string | null;
  /** EmDash's publication timestamp, ISO 8601, when it is set. */
  publishedAt?: string | null;
};

/** A usable `YYYY-MM-DD` day, or null. `2026-13-45` is shaped like a date and is not one. */
export function validReviewDay(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed.toISOString().startsWith(trimmed) ? trimmed : null;
}

/** The UTC day an ISO timestamp falls on, or null when it is not a real instant. */
function publishedDay(publishedAt: string | null | undefined): string | null {
  if (typeof publishedAt !== "string" || !publishedAt.trim()) return null;
  const parsed = Date.parse(publishedAt);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

/**
 * The day a dispatch should be filed under, newest meaning latest.
 *
 * The review date wins. A SQL-replayed record carries the install instant as its
 * `published_at`, which would date every dispatch to the day the content model
 * was delivered and would silently become a false claim the moment that day
 * differs from the review.
 */
export function dispatchDate({ reviewDate, publishedAt }: DispatchDates): string | null {
  return validReviewDay(reviewDate) ?? publishedDay(publishedAt);
}

/**
 * Newest-first ordering for the journal.
 *
 * A stable tiebreak on slug matters: dispatches reviewed on the same day are
 * ordered by slug rather than by whatever order the database happened to return,
 * so the journal does not reshuffle itself between requests when two dispatches
 * share a review date.
 */
export function byDispatchDate<T extends DispatchDates & { slug?: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => {
    const leftDay = dispatchDate(left) ?? "";
    const rightDay = dispatchDate(right) ?? "";
    if (leftDay !== rightDay) return rightDay.localeCompare(leftDay);
    return (left.slug ?? "").localeCompare(right.slug ?? "");
  });
}
