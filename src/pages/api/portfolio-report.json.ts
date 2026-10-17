import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { listProjectRecords } from "../../content/repository";
import { readPortfolioReport, projectReport } from "../../data/portfolio-reports";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const id = url.searchParams.get("report");
  if (!id)
    return Response.json(
      { available: false },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  const projects = await listProjectRecords();
  if (projects.error)
    return Response.json(
      { available: false },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  try {
    const report = await readPortfolioReport((env as unknown as { DB: D1Database }).DB, id);
    if (!report)
      return Response.json(
        { available: false },
        { status: 404, headers: { "cache-control": "no-store" } }
      );
    const narrowed = projectReport(
      report,
      null,
      new Set(["woodhouse", ...projects.projects.map((p) => p.slug)])
    );
    // The public JSON describes the report's own window. The retained lookback
    // exists to compare weeks on the report page; it is not a second data set to
    // publish under a "these dates" heading.
    const published: Record<string, unknown> = { ...narrowed };
    delete published.history;
    return Response.json(published, { headers: { "cache-control": "public, max-age=60" } });
  } catch {
    return Response.json(
      { available: false },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
};
