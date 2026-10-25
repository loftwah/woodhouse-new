import type { EditorialDispatch } from "../content/repository";
import { formatReviewDate } from "./review-date.ts";

export type EditionSectionKey = "shipped" | "improving" | "waiting";
export type EditionEntry = {
  slug: string;
  section: EditionSectionKey;
  headline: string;
  body: string;
  basis: string;
  invitation: string;
  sourceUrl: string;
  sourceReviewed: string;
  readMore?: { label: string; href: string };
};

export const editionSections = [
  {
    key: "shipped",
    title: "Just shipped",
    deck: "Live now, and you can use it today.",
    state: "Shipped"
  },
  {
    key: "improving",
    title: "Getting better",
    deck: "Real work, with the next limit named.",
    state: "Improving"
  },
  {
    key: "waiting",
    title: "Still building",
    deck: "A prototype, a waitlist or a quiet project can still be worth exploring.",
    state: "In progress"
  }
] as const;

export function editionPath(slug: string) {
  return slug === "what-we-built-2026-10-25" ? "/editions/what-we-built/" : `/editions/${slug}/`;
}

/** Project publication is checked separately at render time. This is editorial,
 * never another current-state store. Malformed or incomplete editions fail closed. */
export function readPortfolioEdition(dispatch: EditorialDispatch | null) {
  if (!dispatch || dispatch.kind !== "Portfolio report" || !formatReviewDate(dispatch.reviewDate))
    return null;
  const entries: EditionEntry[] = [];
  for (const block of dispatch.content) {
    if (block._type !== "portfolio_entry") continue;
    if (
      !/^[a-z0-9-]+$/.test(block.project_key) ||
      !editionSections.some((s) => s.key === block.section) ||
      ![block.headline, block.body, block.basis, block.invitation].every(
        (v) => typeof v === "string" && v.trim()
      ) ||
      !formatReviewDate(block.source_reviewed) ||
      block.source_reviewed > dispatch.reviewDate ||
      !/^https:\/\/[^\s]+$/.test(block.source_url) ||
      entries.some((e) => e.slug === block.project_key)
    )
      return null;
    const readMore =
      block.read_more_label &&
      block.read_more_href?.startsWith("/") &&
      !block.read_more_href.startsWith("//") &&
      !block.read_more_href.includes("\\")
        ? { label: block.read_more_label, href: block.read_more_href }
        : undefined;
    entries.push({
      slug: block.project_key,
      section: block.section,
      headline: block.headline,
      body: block.body,
      basis: block.basis,
      invitation: block.invitation,
      sourceUrl: block.source_url,
      sourceReviewed: block.source_reviewed,
      ...(readMore ? { readMore } : {})
    });
  }
  return entries.length ? { dispatch, entries, path: editionPath(dispatch.slug) } : null;
}

/** One canonical address for reader, feed, sitemap and agent discovery. */
export function dispatchPath(dispatch: EditorialDispatch) {
  return (
    readPortfolioEdition(dispatch)?.path ?? `/dispatches/${encodeURIComponent(dispatch.slug)}/`
  );
}
