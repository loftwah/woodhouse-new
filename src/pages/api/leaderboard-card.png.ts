import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { Resvg } from "@resvg/resvg-wasm";
import { ensureReportRenderer, loadReportFonts } from "../../data/report-renderer";
import {
  readLeaderboard,
  measureKey,
  selectedDays,
  safeProject
} from "../../data/github-leaderboards";
import { publishedLeaderboard } from "../../data/github-leaderboards";
import { listProjectRecords } from "../../content/repository";
import {
  leaderboardSvg,
  leaderboardFormats,
  type LeaderboardFormat
} from "../../data/leaderboard-art";
import { logReportFailure, type ReportDependency } from "../../data/report-failure";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const format = url.searchParams.get("format") ?? "landscape";
  const version = url.searchParams.get("v");
  const edition = version === "3" ? 3 : version === "2" ? 2 : 1;
  const project = url.searchParams.get("project") ?? undefined;
  const reportId = url.searchParams.get("report");
  if (!Object.hasOwn(leaderboardFormats, format) || (project && !safeProject(project)) || !reportId)
    return new Response("Image unavailable.", { status: 400 });
  const startedAt = Date.now();
  // Same boundary as the portfolio card: every public read happens inside the
  // route's own error handling, so a database failure answers 503 rather than
  // becoming an uncaught platform 500.
  let stage = "identities";
  let dependency: ReportDependency = "cms";
  try {
    const identities = await listProjectRecords();
    if (identities.error) {
      logReportFailure({
        route: "/api/leaderboard-card.png",
        stage,
        scope: "leaderboard",
        reportId,
        dependency,
        durationMs: Date.now() - startedAt,
        status: 503,
        error: identities.error
      });
      return new Response("Projects unavailable.", {
        status: 503,
        headers: { "cache-control": "no-store" }
      });
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
    if (!report || (project && !report.projects.some((p) => p.slug === project)))
      return new Response("Report unavailable.", { status: 404 });
    stage = "renderer-init";
    dependency = "wasm";
    await ensureReportRenderer();
    stage = "fonts";
    dependency = "font";
    const buffers = await loadReportFonts(url.origin);
    stage = "compose";
    dependency = "render";
    const renderer = new Resvg(
      leaderboardSvg(
        report,
        selectedDays(url.searchParams.get("days")),
        measureKey(url.searchParams.get("measure")),
        format as LeaderboardFormat,
        project,
        edition
      ),
      { font: { fontBuffers: buffers, defaultFontFamily: "Bricolage Grotesque" } }
    );
    try {
      stage = "render";
      const image = renderer.render();
      try {
        const bytes = new Uint8Array(image.asPng());
        return new Response(bytes, {
          headers: {
            "content-type": "image/png",
            "cache-control": "public, max-age=86400",
            "x-content-type-options": "nosniff",
            ...(url.searchParams.has("download")
              ? {
                  "content-disposition": `attachment; filename="${edition === 3 ? `woodhouse-${project ?? "leaderboards"}-${selectedDays(url.searchParams.get("days"))}days-${measureKey(url.searchParams.get("measure"))}-${report.through}-${format}` : edition === 2 ? `woodhouse-${project ?? "github-rankings"}-${selectedDays(url.searchParams.get("days"))}days-${measureKey(url.searchParams.get("measure"))}-${report.through}-${format}` : `woodhouse-${project ?? "leaderboard"}-${report.id}-${format}`}.png"`
                }
              : {})
          }
        });
      } finally {
        image.free();
      }
    } finally {
      renderer.free();
    }
  } catch (error) {
    // This stage handles only local WASM, public fonts and the approved counts.
    // No GitHub response or credential enters it; keep failures off the page.
    logReportFailure({
      route: "/api/leaderboard-card.png",
      stage,
      scope: project ? "project" : "leaderboard",
      reportId,
      dependency,
      durationMs: Date.now() - startedAt,
      status: 503,
      error
    });
    return new Response("Image unavailable. Please try again.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  }
};
