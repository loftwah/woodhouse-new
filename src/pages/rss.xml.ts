import type { APIRoute } from "astro";
import { listPublishedDispatches } from "../content/repository";
import { validReviewDay } from "../data/dispatch-dates";

export const prerender = false;
const siteOrigin = new URL(import.meta.env.SITE ?? "https://woodhouse.loftwah.com").origin;

function xmlSafe(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/**
 * The instant a feed reader should treat an item as published.
 *
 * The review date wins. `published_at` is EmDash's own timestamp, and because
 * the reviewed model is installed by replaying SQL it holds the install instant
 * for every seeded dispatch — a feed of `pubDate` values one day old, describing
 * work reviewed up to a week earlier.
 */
function publicationDate(publishedAt: string | null, reviewed: string | null) {
  const reviewInstant = validReviewDay(reviewed) ? new Date(`${reviewed}T00:00:00+10:00`) : null;
  if (reviewInstant && !Number.isNaN(reviewInstant.valueOf())) return reviewInstant;
  const published = publishedAt ? new Date(publishedAt) : null;
  return published && !Number.isNaN(published.valueOf()) ? published : new Date(0);
}

export const GET: APIRoute = async ({ cache }) => {
  const result = await listPublishedDispatches();
  if (result.error)
    return new Response("Unable to load the current dispatch feed.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "private, no-store" }
    });
  if (result.cacheHint) cache.set(result.cacheHint);
  const dispatches = result.dispatches.map((item) => ({
    ...item,
    date: publicationDate(item.publishedAt, item.reviewDate)
  }));
  const items = dispatches
    .map((dispatch) => {
      const link = `${siteOrigin}/dispatches/${encodeURIComponent(dispatch.slug)}/`;
      return `<item><title>${xmlSafe(dispatch.title)}</title><link>${xmlSafe(link)}</link><guid>${xmlSafe(link)}</guid><description>${xmlSafe(dispatch.deck)}</description><pubDate>${dispatch.date.toUTCString()}</pubDate><category>${xmlSafe(dispatch.kind)}</category></item>`;
    })
    .join("");
  const latest = dispatches[0]?.date;
  const lastBuildDate = latest ? `<lastBuildDate>${latest.toUTCString()}</lastBuildDate>` : "";
  const feed = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>WOODHOUSE Dispatches</title><link>${xmlSafe(`${siteOrigin}/dispatches/`)}</link><description>Notes on running the Loftwah Software Factory.</description><language>en-AU</language>${lastBuildDate}<generator>WOODHOUSE</generator><atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${xmlSafe(`${siteOrigin}/rss.xml`)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
  const headers = new Headers({
    "content-type": "application/rss+xml; charset=utf-8",
    "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60"
  });
  if (new URL(siteOrigin).hostname.endsWith(".workers.dev"))
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return new Response(feed, { headers });
};
