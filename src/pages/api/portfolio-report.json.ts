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
    return Response.json(
      projectReport(report, null, new Set(["woodhouse", ...projects.projects.map((p) => p.slug)])),
      { headers: { "cache-control": "public, max-age=60" } }
    );
  } catch {
    return Response.json(
      { available: false },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
};
