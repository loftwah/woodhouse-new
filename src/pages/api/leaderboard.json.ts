import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { readLeaderboard, publishedLeaderboard } from "../../data/github-leaderboards";
import { listProjectRecords } from "../../content/repository";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const identities = await listProjectRecords();
  if (identities.error)
    return Response.json(
      { available: false },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  const source = await readLeaderboard(
    (env as unknown as { DB: D1Database }).DB,
    url.searchParams.get("report")
  );
  const report = source
    ? publishedLeaderboard(
        source,
        new Set(["woodhouse", ...identities.projects.map((p) => p.slug)])
      )
    : null;
  return Response.json(report ?? { available: false }, {
    status: report ? 200 : 404,
    headers: { "cache-control": report ? "public, max-age=60" : "no-store" }
  });
};
