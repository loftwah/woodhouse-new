import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { localAnalytics } from "../../data/engagement";
import { parseDays, type AnalyticsProject } from "../../data/portfolio-analytics";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const project = url.searchParams.get("project") ?? "woodhouse";
  const days = parseDays(url.searchParams.get("days"));
  if (!["woodhouse", "shoalshot", "protocol-11"].includes(project) || days === null)
    return Response.json(
      { available: false },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  try {
    return Response.json(
      await localAnalytics(
        (env as unknown as { DB: D1Database }).DB,
        project as AnalyticsProject,
        days
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
