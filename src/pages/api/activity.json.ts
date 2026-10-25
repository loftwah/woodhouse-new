import type { APIRoute } from "astro";
import { listProjectRecords } from "../../content/repository";
import { activitySource, loadListeningReport, projectListeningReport } from "../../data/activity";
import { logReportFailure, type ReportDependency } from "../../data/report-failure";
export const prerender = false;
export const GET: APIRoute = async ({ cache }) => {
  const startedAt = Date.now();
  // Both public reads answer through this route's own 503; neither may escape
  // as an uncaught platform 500.
  let stage = "identities";
  let dependency: ReportDependency = "cms";
  try {
    const [projects, report] = await Promise.all([listProjectRecords(), loadListeningReport()]);
    if (projects.error || !report) {
      dependency = projects.error ? "cms" : "artwork";
      logReportFailure({
        route: "/api/activity.json",
        stage,
        scope: "listening",
        reportId: null,
        dependency,
        durationMs: Date.now() - startedAt,
        status: 503,
        error: projects.error ?? "listening report unavailable"
      });
      cache.set(false);
      return Response.json(
        { available: false, source: activitySource },
        {
          status: 503,
          headers: { "cache-control": "no-store" }
        }
      );
    }
    stage = "projection";
    dependency = "render";
    for (const hint of projects.cacheHints) cache.set(hint);
    cache.set({ lastModified: new Date(report.asOf) });
    const publicIds = new Set(projects.projects.map((p) => p.slug));
    return Response.json({
      available: true,
      metric: "reported-audible-seconds",
      days: 30,
      source: activitySource,
      ...projectListeningReport(report, publicIds)
    });
  } catch (error) {
    logReportFailure({
      route: "/api/activity.json",
      stage,
      scope: "listening",
      reportId: null,
      dependency,
      durationMs: Date.now() - startedAt,
      status: 503,
      error
    });
    cache.set(false);
    return Response.json(
      { available: false, source: activitySource },
      {
        status: 503,
        headers: { "cache-control": "no-store" }
      }
    );
  }
};
