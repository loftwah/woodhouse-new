/**
 * Formats a reviewed `YYYY-MM-DD` date for reader-facing copy. Returns null
 * when the value is missing or unusable so a page can say so rather than
 * printing an invented or machine-formatted date.
 */
export function formatReviewDate(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf())) return null;
  // JavaScript rolls an impossible day into the next month, so `2026-02-30`
  // parses and would print "2 March 2026" for a review dated 30 February. A
  // printed date that differs from the reviewed date is worse than no date.
  if (!parsed.toISOString().startsWith(trimmed)) return null;
  return parsed.toLocaleDateString("en-AU", {
    dateStyle: "long",
    timeZone: "Australia/Melbourne"
  });
}
