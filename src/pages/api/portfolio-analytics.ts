import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { localAnalytics } from "../../data/engagement";
import { parseReportingWindow, type AnalyticsProject } from "../../data/portfolio-analytics";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const project = url.searchParams.get("project") ?? "woodhouse";
  const now = Date.now();
  const period = parseReportingWindow(url.searchParams, now);
  const invalidKeys = [...url.searchParams.keys()].some(
    (key) =>
      !["project", "days", "from", "to", "audit"].includes(key) ||
      url.searchParams.getAll(key).length !== 1
  );
  if (!["woodhouse", "shoalshot", "protocol-11"].includes(project) || !period || invalidKeys)
    return Response.json(
      { available: false },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  try {
    return Response.json(
      await localAnalytics(
        (env as unknown as { DB: D1Database }).DB,
        project as AnalyticsProject,
        period.days,
        now,
        period
      ),
      { headers: { "cache-control": "public, max-age=60", "access-control-allow-origin": "*" } }
    );
  } catch {
    return Response.json(
      { available: false },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
};
