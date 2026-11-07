import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { listProjectRecords } from "../../content/repository";
import { readPortfolioReport, projectReport } from "../../data/portfolio-reports";
import { logReportFailure, type ReportDependency } from "../../data/report-failure";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const id = url.searchParams.get("report");
  if (!id)
    return Response.json(
      { available: false },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  const startedAt = Date.now();
  // The activity page reads this before it can render a frozen report, so a
  // rejected CMS or database read must stay a 503 rather than an uncaught 500.
  let stage = "identities";
  let dependency: ReportDependency = "cms";
  try {
    // The identity list (CMS) and the stored report (D1) are separate stores and
    // the response only joins them after both arrive, so they run together. The
    // CMS failure keeps precedence: a rejected report read has not been awaited
    // yet when the 503 is decided.
    const reportRead = readPortfolioReport((env as unknown as { DB: D1Database }).DB, id).then(
      (report) => ({ report, error: null as unknown }),
      (error: unknown) => ({ report: null, error })
    );
    const projects = await listProjectRecords();
    if (projects.error) {
      logReportFailure({
        route: "/api/portfolio-report.json",
        stage,
        scope: "report",
        reportId: id,
        dependency,
        durationMs: Date.now() - startedAt,
        status: 503,
        error: projects.error
      });
      return Response.json(
        { available: false },
        { status: 503, headers: { "cache-control": "no-store" } }
      );
    }
    stage = "report-read";
    dependency = "database";
    const { report, error: readError } = await reportRead;
    if (readError) throw readError;
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
  } catch (error) {
    logReportFailure({
      route: "/api/portfolio-report.json",
      stage,
      scope: "report",
      reportId: id,
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
