import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { readLeaderboard, publishedLeaderboard } from "../../data/github-leaderboards";
import { listProjectRecords } from "../../content/repository";
import { logReportFailure, type ReportDependency } from "../../data/report-failure";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const reportId = url.searchParams.get("report");
  const startedAt = Date.now();
  // The identity read and the snapshot read are separate public dependencies.
  // A rejection from either answers 503 instead of becoming a platform 500.
  let stage = "identities";
  let dependency: ReportDependency = "cms";
  try {
    const identities = await listProjectRecords();
    if (identities.error) {
      logReportFailure({
        route: "/api/leaderboard.json",
        stage,
        scope: "leaderboard",
        reportId,
        dependency,
        durationMs: Date.now() - startedAt,
        status: 503,
        error: identities.error
      });
      return Response.json(
        { available: false },
        { status: 503, headers: { "cache-control": "no-store" } }
      );
    }
    stage = "report-read";
    dependency = "database";
    const source = await readLeaderboard((env as unknown as { DB: D1Database }).DB, reportId);
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
  } catch (error) {
    logReportFailure({
      route: "/api/leaderboard.json",
      stage,
      scope: "leaderboard",
      reportId,
      dependency,
      durationMs: Date.now() - startedAt,
      status: 503,
      error
    });
    return Response.json(
      { available: false },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
};
