import { producerRevision } from "./build-identity.ts";
import {
  analyticsProjects,
  loadProjectAnalytics,
  parseProjectAnalytics,
  parseReportHistory,
  analysePortfolio,
  periodFor,
  windowForDates,
  type AnalyticsProject,
  type PortfolioReport,
  type ReportHistory,
  type ReportHistoryEntry,
  type ReportRelease,
  type ReportingWindow
} from "./portfolio-analytics.ts";
import { parseReportReleases } from "./analytics-context.ts";
import { localAnalytics } from "./engagement.ts";
import { overviewMeasures } from "./analytics-workbench.ts";

const reportIdPattern = /^[a-f0-9]{24}$/;
/**
 * How much daily history a short report retains so it can still compare weeks.
 * A 90-day report already holds at least three complete months, so it needs no
 * extra lookback.
 */
const historyDays = 84;
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
    const history = parseReportHistory(
      report.history,
      new Set(safe.projects.map((r) => r.project)),
      savedAt
    );
    const releases = parseReportReleases(
      report.releases,
      new Set(safe.projects.map((r) => r.project)),
      savedAt
    );
    return {
      schema: safe.schema,
      id: safe.id,
      createdAt: safe.createdAt,
      days: safe.days,
      period,
      projects: safe.projects,
      ...(history ? { history } : {}),
      ...(releases ? { releases } : {}),
      ...(report.analysis?.schema === "woodhouse.weekly-analysis/1"
        ? { analysis: analysePortfolio(safe.projects, Date.parse(safe.createdAt)) }
        : {})
    };
  } catch {
    return null;
  }
}
/**
 * Retain each public project's own headline measure over a longer lookback, so a
 * short report can still make a week-on-week comparison after it is frozen.
 * Only exact counters qualify, matching the live rule; a source that cannot serve
 * the lookback simply contributes no entry and the project reports why.
 */
async function collectHistory(
  load: (
    project: AnalyticsProject,
    days: number,
    window: ReportingWindow | undefined
  ) => Promise<Awaited<ReturnType<typeof localAnalytics>> | null>,
  members: AnalyticsProject[],
  period: ReportingWindow,
  now: number
): Promise<ReportHistory | undefined> {
  if (period.days >= historyDays) return undefined;
  const from = new Date(Date.parse(period.to) - (historyDays - 1) * 86400000)
    .toISOString()
    .slice(0, 10);
  const window = windowForDates(from, period.to, now);
  if (!window) return undefined;
  const loaded = await Promise.all(
    members.map(async (project) => ({ project, report: await load(project, historyDays, window) }))
  );
  const entries: ReportHistoryEntry[] = [];
  for (const { project, report } of loaded) {
    if (!report) continue;
    const [headline] = overviewMeasures(project);
    const metric = report.metrics.find((m) => m.key === headline!.key);
    if (!metric || metric.quality !== "exact" || !metric.daily.length) continue;
    entries.push({
      project,
      measure: metric.key,
      label: metric.label,
      unit: metric.unit,
      quality: metric.quality,
      coverage: {
        startedAt: report.coverage.startedAt,
        comparableFrom: report.coverage.comparableFrom ?? null,
        through: report.coverage.through
      },
      daily: metric.daily
    });
  }
  return entries.length
    ? { from: window.from, to: window.to, days: window.days, entries }
    : undefined;
}

export async function createPortfolioReport(
  db: D1Database,
  days: number,
  publicIds: Set<string>,
  fetcher: typeof fetch = fetch,
  now = Date.now(),
  requestedWindow?: ReportingWindow,
  releaseNotes?: ReportRelease[]
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
    if (
      report &&
      (releaseNotes === undefined || report.releases !== undefined) &&
      report.projects
        .filter((entry) => ["woodhouse", "shoalshot", "protocol-11"].includes(entry.project))
        .every((entry) => entry.report?.source.revision === producerRevision())
    )
      return report;
  }
  const members = analyticsProjects.filter((p) => publicIds.has(p));
  const load = async (
    project: AnalyticsProject,
    days: number,
    window: ReportingWindow | undefined
  ) => {
    try {
      return ["woodhouse", "shoalshot", "protocol-11"].includes(project)
        ? await localAnalytics(db, project, days, now, window)
        : await loadProjectAnalytics(project, days, fetcher, window);
    } catch {
      /* Missing storage/source is unavailable, never zero. */
      return null;
    }
  };
  const projects = await Promise.all(
    members.map(async (project) => ({ project, report: await load(project, days, period) }))
  );
  const createdAt = new Date(now).toISOString();
  const history = await collectHistory(load, members, period, now);
  const releases = parseReportReleases(
    releaseNotes?.filter((note) => note.date <= period.to),
    new Set(members),
    now
  );
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      JSON.stringify({ createdAt, days, period, projects, history, releases })
    )
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
    ...(history ? { history } : {}),
    ...(releases ? { releases } : {}),
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
): PortfolioReport {
  const projects = report.projects.filter(
    (p) => publicIds.has(p.project) && (!project || p.project === project)
  );
  const retained = new Set(projects.map((p) => p.project));
  const result: PortfolioReport = { ...report, projects };
  if (report.releases)
    result.releases = report.releases.filter((note) => retained.has(note.project));
  const history = report.history
    ? { ...report.history, entries: report.history.entries.filter((e) => retained.has(e.project)) }
    : undefined;
  if (history?.entries.length) result.history = history;
  else delete result.history;
  if (result.analysis) result.analysis = analysePortfolio(projects, Date.parse(report.createdAt));
  return result;
}
export function reportLink(id: string, project?: string | null) {
  return `https://woodhouse.loftwah.com/activity/?report=${id}${project ? `&project=${project}` : ""}`;
}
