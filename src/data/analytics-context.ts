import {
  analyticsProjects,
  isObject,
  type AnalyticsProject,
  type PortfolioReport,
  type ReportRelease
} from "./portfolio-analytics.ts";

const day = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const text = (value: unknown, max: number): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= max &&
  !/[<>]/.test(value) &&
  ![...value].some((c) => c.charCodeAt(0) < 32);

/** Project the existing published evidence model; never treat an implementation as a release. */
export function releaseNotesFromEvidence(
  evidence: { id: string; data: unknown }[],
  members: Set<string>,
  now: number
): ReportRelease[] {
  const candidates = evidence.flatMap(({ id, data }) => {
    if (
      !isObject(data) ||
      data.public_safe !== true ||
      data.evidence_state !== "reviewed" ||
      !["production verification", "production evidence"].includes(String(data.evidence_kind))
    )
      return [];
    return [
      {
        project: data.project_key,
        evidenceId: id,
        date: data.occurred_at,
        reviewedAt: data.reviewed_at,
        title: data.title,
        summary: data.summary,
        boundary: data.proof_boundary,
        revision: data.revision ?? null
      }
    ];
  });
  // A malformed source record is omitted individually. A malformed stored block
  // is discarded as a whole by the stricter reader below.
  return candidates
    .flatMap((note) => parseReportReleases([note], members, now) ?? [])
    .sort((a, b) => b.date.localeCompare(a.date) || a.evidenceId.localeCompare(b.evidenceId))
    .slice(0, 80);
}

export function parseReportReleases(
  raw: unknown,
  members: Set<string>,
  now: number
): ReportRelease[] | undefined {
  if (!Array.isArray(raw) || raw.length > 80) return undefined;
  const capturedDay = new Date(now).toISOString().slice(0, 10);
  const notes: ReportRelease[] = [];
  const ids = new Set<string>();
  for (const item of raw) {
    if (
      !isObject(item) ||
      typeof item.project !== "string" ||
      !members.has(item.project) ||
      !analyticsProjects.some((p) => p === item.project) ||
      typeof item.evidenceId !== "string" ||
      !/^[a-z0-9][a-z0-9-]{0,180}$/.test(item.evidenceId) ||
      ids.has(item.evidenceId) ||
      !day(item.date) ||
      !day(item.reviewedAt) ||
      item.date > item.reviewedAt ||
      item.reviewedAt > capturedDay ||
      !text(item.title, 240) ||
      !text(item.summary, 2400) ||
      !text(item.boundary, 2400) ||
      !(item.revision === null || text(item.revision, 160))
    )
      return undefined;
    ids.add(item.evidenceId);
    notes.push({
      project: item.project as AnalyticsProject,
      evidenceId: item.evidenceId,
      date: item.date,
      reviewedAt: item.reviewedAt,
      title: item.title,
      summary: item.summary,
      boundary: item.boundary,
      revision: item.revision
    });
  }
  return notes;
}

export type ActivityHistoryNote = {
  project: AnalyticsProject;
  date: string;
  kind: "collection" | "comparison" | "release";
  title: string;
  detail: string;
  href?: string;
  reviewedAt?: string;
};
/** Collection dates are observations, never guessed deploy dates or causal explanations. */
export function activityTimeline(report: PortfolioReport): ActivityHistoryNote[] {
  const end = report.period?.to ?? report.createdAt.slice(0, 10);
  const notes: ActivityHistoryNote[] = [];
  for (const { project, report: source } of report.projects) {
    if (!source) continue;
    const started = source.coverage.startedAt?.slice(0, 10);
    if (started && day(started) && started <= end)
      notes.push({
        project,
        date: started,
        kind: "collection",
        title: "Collection began",
        detail:
          "First source-reported collection date. Earlier activity is unavailable; the first day may be partial."
      });
    const comparable = source.coverage.comparableFrom?.slice(0, 10);
    if (comparable && day(comparable) && comparable <= end)
      notes.push({
        project,
        date: comparable,
        kind: "comparison",
        title: "Comparison boundary",
        detail:
          "The source marks this cutover for comparable history. The first boundary day is excluded from complete-week records; later missing or partial days still matter."
      });
  }
  for (const release of report.releases ?? []) {
    if (release.date > end || !report.projects.some((p) => p.project === release.project)) continue;
    notes.push({
      project: release.project,
      date: release.date,
      kind: "release",
      title: release.title,
      detail: release.summary.includes(release.boundary)
        ? release.summary
        : `${release.summary} ${release.boundary}`,
      href: `/evidence/${release.evidenceId}/`,
      reviewedAt: release.reviewedAt
    });
  }
  return notes.sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      a.project.localeCompare(b.project) ||
      a.kind.localeCompare(b.kind)
  );
}

/** Reuse frozen producer values and definitions; a zero never becomes missing or a return rate. */
export function browserReturnSignals(report: PortfolioReport) {
  return report.projects.map(({ project, report: source }) => {
    const metric = source?.metrics.find((m) => m.key === "returning_browsers");
    const browsers = source?.metrics.find((m) => m.key === "browsers");
    const value = metric?.value ?? null;
    const explanation = source?.coverage.limitations
      .filter((note) => /browser|identit|tab.*return/i.test(note))
      .join(" ");
    return {
      project,
      value,
      browsers: browsers?.value ?? null,
      definition: metric?.definition ?? "",
      gap:
        value !== null
          ? null
          : !source
            ? "The source report is unavailable for these dates; no return signal can be inferred."
            : !metric
              ? "This source does not report browser returns. Tab activity cannot establish a returning audience."
              : explanation || metric.definition
    };
  });
}
