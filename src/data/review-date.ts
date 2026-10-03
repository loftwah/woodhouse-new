/**
 * Formats a reviewed `YYYY-MM-DD` date for reader-facing copy. Returns null
 * when the value is missing or unusable so a page can say so rather than
 * printing an invented or machine-formatted date.
 */
export function formatReviewDate(value: string | null | undefined): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf())) return null;
  return parsed.toLocaleDateString("en-AU", {
    dateStyle: "long",
    timeZone: "Australia/Melbourne"
  });
}
