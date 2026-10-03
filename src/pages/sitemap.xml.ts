import type { APIRoute } from "astro";
import {
  asText,
  listProjectRecords,
  listPublishedDispatches,
  listPublicConversations,
  listPublicEvidence,
  listPublicIncidents,
  listPublicSnapshots,
  listPublicStatusRecords
} from "../content/repository";

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

function dateOnly(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString().slice(0, 10);
}

export const GET: APIRoute = async ({ cache }) => {
  const [
    projectResult,
    dispatchResult,
    evidenceResult,
    incidentResult,
    snapshotResult,
    statusResult,
    conversationResult
  ] = await Promise.all([
    listProjectRecords(),
    listPublishedDispatches(),
    listPublicEvidence(),
    listPublicIncidents(),
    listPublicSnapshots(),
    listPublicStatusRecords(),
    listPublicConversations()
  ]);
  if (
    projectResult.error ||
    dispatchResult.error ||
    evidenceResult.error ||
    incidentResult.error ||
    snapshotResult.error ||
    statusResult.error ||
    conversationResult.error
  )
    return new Response("Unable to load the current sitemap.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "private, no-store" }
    });
  for (const hint of projectResult.cacheHints) cache.set(hint);
  for (const hint of [
    dispatchResult.cacheHint,
    evidenceResult.cacheHint,
    incidentResult.cacheHint,
    snapshotResult.cacheHint,
    statusResult.cacheHint,
    conversationResult.cacheHint
  ])
    if (hint) cache.set(hint);
  const urls: Array<{ path: string; lastmod?: string }> = [
    ...[
      "/",
      "/factory/",
      "/projects/",
      "/dispatches/",
      "/incidents/",
      "/evidence/",
      "/conversations/",
      "/architecture/",
      "/doctrine/",
      "/dean/",
      "/agents/",
      "/contact/"
    ].map((path) => ({ path })),
    ...projectResult.projects.map((project) => ({
      path: `/projects/${project.slug}/`,
      lastmod: project.reviewDate
    })),
    ...dispatchResult.dispatches.map((dispatch) => ({
      path: `/dispatches/${encodeURIComponent(dispatch.slug)}/`,
      lastmod: dateOnly(dispatch.updatedAt ?? dispatch.publishedAt) ?? dispatch.reviewDate
    })),
    ...evidenceResult.evidence.map((item) => ({
      path: `/evidence/${encodeURIComponent(item.id)}/`,
      lastmod: asText(item.data, "reviewed_at")
    })),
    ...incidentResult.incidents.map((item) => ({
      path: `/incidents/${encodeURIComponent(item.id)}/`,
      lastmod: asText(item.data, "reviewed_at")
    })),
    ...snapshotResult.snapshots.map((item) => ({
      path: `/snapshots/${encodeURIComponent(item.id)}/`,
      lastmod: asText(item.data, "reviewed_at")
    })),
    ...statusResult.statuses.map((item) => ({
      path: `/statuses/${encodeURIComponent(item.id)}/`,
      lastmod: asText(item.data, "reviewed_at")
    })),
    ...conversationResult.conversations.map((item) => ({
      path: `/conversations/${encodeURIComponent(item.id)}/`,
      lastmod: asText(item.data, "reviewed_at")
    }))
  ];
  const unique = new Map(urls.map((entry) => [entry.path, entry]));
  const xml = [...unique.values()]
    .map(
      ({ path, lastmod }) =>
        `<url><loc>${xmlSafe(`${siteOrigin}${path}`)}</loc>${lastmod ? `<lastmod>${xmlSafe(lastmod)}</lastmod>` : ""}</url>`
    )
    .join("");
  const headers = new Headers({
    "content-type": "application/xml; charset=utf-8",
    "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60"
  });
  if (new URL(siteOrigin).hostname.endsWith(".workers.dev"))
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`,
    { headers }
  );
};
