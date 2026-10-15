import {
  analyticsProjects,
  loadProjectAnalytics,
  parseProjectAnalytics,
  analysePortfolio,
  periodFor,
  windowForDates,
  type AnalyticsProject,
  type PortfolioReport,
  type ReportingWindow
} from "./portfolio-analytics.ts";
import { localAnalytics } from "./engagement.ts";
const reportIdPattern = /^[a-f0-9]{24}$/;
export async function readPortfolioReport(
  db: D1Database,
  id: string
): Promise<PortfolioReport | null> {
  if (!reportIdPattern.test(id)) return null;
  const row = await db
    .prepare("SELECT body FROM wh_analytics_reports WHERE id=?")
    .bind(id)
    .first<{ body: string }>();
  if (!row) return null;
  try {
    const report = JSON.parse(row.body) as PortfolioReport;
    if (
      report.schema !== "woodhouse.portfolio-report/1" ||
      report.id !== id ||
      !Number.isInteger(report.days) ||
      report.days < 1 ||
      report.days > 90 ||
      !Array.isArray(report.projects)
    )
      return null;
    const savedAt = Date.parse(report.createdAt);
    const period = report.period
      ? windowForDates(report.period.from, report.period.to, savedAt)
      : [7, 30, 90].includes(report.days)
        ? periodFor(report.days, savedAt)
        : null;
    if (!period || period.days !== report.days) return null;
    const safe = {
      ...report,
      projects: report.projects
        .filter((r) => analyticsProjects.includes(r.project))
        .map((r) => ({
          project: r.project,
          report: r.report
            ? parseProjectAnalytics(r.report, r.project, report.days, savedAt, period)
            : null
        }))
    };
    // Stored analysis is never trusted as public prose or an additional data source.
    return {
      schema: safe.schema,
      id: safe.id,
      createdAt: safe.createdAt,
      days: safe.days,
      period,
      projects: safe.projects,
      ...(report.analysis?.schema === "woodhouse.weekly-analysis/1"
        ? { analysis: analysePortfolio(safe.projects, Date.parse(safe.createdAt)) }
        : {})
    };
  } catch {
    return null;
  }
}
export async function createPortfolioReport(
  db: D1Database,
  days: number,
  publicIds: Set<string>,
  fetcher: typeof fetch = fetch,
  now = Date.now(),
  requestedWindow?: ReportingWindow
): Promise<PortfolioReport> {
  const period = requestedWindow ?? periodFor(days, now);
  const recent = await db
    .prepare(
      "SELECT id FROM wh_analytics_reports WHERE days=? AND created_at>=? AND json_extract(body,'$.period.from')=? AND json_extract(body,'$.period.to')=? AND json_extract(body,'$.period.complete')=? ORDER BY created_at DESC LIMIT 1"
    )
    .bind(
      days,
      new Date(now - 300000).toISOString(),
      period.from,
      period.to,
      Number(period.complete)
    )
    .first<{ id: string }>();
  if (recent) {
    const report = await readPortfolioReport(db, recent.id);
    if (report) return report;
  }
  const projects = await Promise.all(
    analyticsProjects
      .filter((p) => publicIds.has(p))
      .map(async (project) => {
        let report = null;
        try {
          report = ["woodhouse", "shoalshot", "protocol-11"].includes(project)
            ? await localAnalytics(db, project, days, now, period)
            : await loadProjectAnalytics(project, days, fetcher, requestedWindow);
        } catch {
          /* Missing storage/source is unavailable, never zero. */
        }
        return { project, report };
      })
  );
  const createdAt = new Date(now).toISOString();
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify({ createdAt, days, period, projects }))
  );
  const id = Array.from(new Uint8Array(digest))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
  const report: PortfolioReport = {
    schema: "woodhouse.portfolio-report/1",
    id,
    createdAt,
    days,
    period,
    projects,
    analysis: analysePortfolio(projects, now)
  };
  await db
    .prepare("INSERT OR IGNORE INTO wh_analytics_reports(id,created_at,days,body) VALUES(?,?,?,?)")
    .bind(id, createdAt, days, JSON.stringify(report))
    .run();
  return report;
}
export function projectReport(
  report: PortfolioReport,
  project: AnalyticsProject | null,
  publicIds: Set<string>
) {
  const projects = report.projects.filter(
    (p) => publicIds.has(p.project) && (!project || p.project === project)
  );
  return {
    ...report,
    projects,
    ...(report.analysis
      ? { analysis: analysePortfolio(projects, Date.parse(report.createdAt)) }
      : {})
  };
}
export function reportLink(id: string, project?: string | null) {
  return `https://woodhouse.loftwah.com/activity/?report=${id}${project ? `&project=${project}` : ""}`;
}
