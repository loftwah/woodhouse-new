/** Aggregate-only contract. Reviewed 15 October 2026. Never return upstream payloads. */
export const analyticsSchema = "woodhouse.portfolio-analytics/1";
export const analyticsProjects = [
  "woodhouse",
  "app-composer",
  "fighter",
  "shoalshot",
  "protocol-11",
  "loftwahfm",
  "bubbles"
] as const;
export type AnalyticsProject = (typeof analyticsProjects)[number];
type Quality = "exact" | "sampled" | "bounded" | "partial" | "unavailable";
export type Metric = {
  key: string;
  label: string;
  unit: "count" | "seconds";
  value: number | null;
  definition: string;
  quality: Quality;
  daily: { date: string; value: number }[];
};
export type ProjectAnalytics = {
  schema: typeof analyticsSchema;
  project: AnalyticsProject;
  generatedAt: string;
  timezone: "UTC";
  period: { from: string; to: string; days: number; complete: boolean };
  coverage: { startedAt: string | null; through: string; quality: Quality; limitations: string[] };
  metrics: Metric[];
  source: { endpoint: string; revision: string | null };
};
export type PortfolioReport = {
  schema: "woodhouse.portfolio-report/1";
  id: string;
  createdAt: string;
  days: number;
  projects: { project: AnalyticsProject; report: ProjectAnalytics | null }[];
};
const analyticsSources: Record<AnalyticsProject, string> = {
  woodhouse: "https://woodhouse.loftwah.com/api/portfolio-analytics?project=woodhouse",
  "app-composer": "https://composer.loftwah.com/api/portfolio-analytics",
  fighter: "https://fighter.loftwah.com/api/portfolio-analytics",
  shoalshot: "https://woodhouse.loftwah.com/api/portfolio-analytics?project=shoalshot",
  "protocol-11": "https://woodhouse.loftwah.com/api/portfolio-analytics?project=protocol-11",
  loftwahfm: "https://fm.loftwah.com/api/portfolio-analytics",
  bubbles: "https://api.bubbles.loftwah.com/api/portfolio-analytics"
};
const qualities = new Set<unknown>(["exact", "sampled", "bounded", "partial", "unavailable"]);
export function isObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}
function isoDay(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    Number.isFinite(Date.parse(v)) &&
    new Date(v).toISOString().slice(0, 10) === v
  );
}
function isoTime(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
}
function count(v: unknown): v is number {
  return typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
}
function short(v: unknown, max = 600): v is string {
  return (
    typeof v === "string" &&
    v.length > 0 &&
    v.length <= max &&
    !/[<>]/.test(v) &&
    ![...v].some((c) => c.charCodeAt(0) < 32)
  );
}
export function parseDays(value: string | null) {
  return value === null ? 7 : ["7", "30", "90"].includes(value) ? Number(value) : null;
}
export function periodFor(days: number, now = Date.now()) {
  const to = new Date(now).toISOString().slice(0, 10);
  return {
    from: new Date(Date.parse(to) - (days - 1) * 86400000).toISOString().slice(0, 10),
    to,
    days,
    complete: false
  };
}
export function parseProjectAnalytics(
  raw: unknown,
  project: AnalyticsProject,
  days: number,
  now = Date.now()
): ProjectAnalytics | null {
  if (
    !isObject(raw) ||
    raw.schema !== analyticsSchema ||
    raw.project !== project ||
    raw.timezone !== "UTC" ||
    !isoTime(raw.generatedAt) ||
    Date.parse(raw.generatedAt) > now + 300000 ||
    !isObject(raw.period) ||
    raw.period.days !== days ||
    raw.period.from !== periodFor(days, now).from ||
    raw.period.to !== periodFor(days, now).to ||
    !isoDay(raw.period.from) ||
    !isoDay(raw.period.to) ||
    Date.parse(raw.period.to) - Date.parse(raw.period.from) !== (days - 1) * 86400000 ||
    raw.period.to > new Date(now).toISOString().slice(0, 10) ||
    typeof raw.period.complete !== "boolean" ||
    !isObject(raw.coverage) ||
    !(
      raw.coverage.startedAt === null ||
      isoTime(raw.coverage.startedAt) ||
      isoDay(raw.coverage.startedAt)
    ) ||
    !isoTime(raw.coverage.through) ||
    (typeof raw.coverage.startedAt === "string" &&
      Date.parse(raw.coverage.startedAt) > now + 300000) ||
    Date.parse(raw.coverage.through) > now + 300000 ||
    !qualities.has(raw.coverage.quality) ||
    !Array.isArray(raw.coverage.limitations) ||
    raw.coverage.limitations.length > 16 ||
    !raw.coverage.limitations.every((v) => short(v)) ||
    !Array.isArray(raw.metrics) ||
    raw.metrics.length > 32
  )
    return null;
  const metrics: Metric[] = [];
  for (const m of raw.metrics) {
    if (
      !isObject(m) ||
      !short(m.key, 64) ||
      !/^[a-z][a-z0-9_]*$/.test(m.key) ||
      metrics.some((v) => v.key === m.key) ||
      !short(m.label, 100) ||
      !short(m.definition, 1600) ||
      !["count", "seconds"].includes(String(m.unit)) ||
      !(m.value === null || count(m.value)) ||
      !qualities.has(m.quality) ||
      !Array.isArray(m.daily) ||
      m.daily.length > days ||
      (m.value === null && m.quality !== "unavailable")
    )
      return null;
    const daily: Metric["daily"] = [];
    for (const d of m.daily) {
      if (
        !isObject(d) ||
        !isoDay(d.date) ||
        d.date < raw.period.from ||
        d.date > raw.period.to ||
        !count(d.value) ||
        daily.some((v) => v.date === d.date)
      )
        return null;
      daily.push({ date: d.date, value: d.value });
    }
    daily.sort((a, b) => a.date.localeCompare(b.date));
    metrics.push({
      key: m.key,
      label: m.label,
      unit: m.unit as Metric["unit"],
      value: m.value as number | null,
      definition: m.definition,
      quality: m.quality as Quality,
      daily
    });
  }
  return {
    schema: analyticsSchema,
    project,
    generatedAt: raw.generatedAt,
    timezone: "UTC",
    period: { from: raw.period.from, to: raw.period.to, days, complete: raw.period.complete },
    coverage: {
      startedAt: raw.coverage.startedAt,
      through: raw.coverage.through,
      quality: raw.coverage.quality as Quality,
      limitations: [...raw.coverage.limitations] as string[]
    },
    metrics,
    source: {
      endpoint: analyticsSources[project],
      revision:
        isObject(raw.source) &&
        typeof raw.source.revision === "string" &&
        /^[a-f0-9]{7,64}$/.test(raw.source.revision)
          ? raw.source.revision
          : null
    }
  };
}
async function boundedJson(response: Response, limit = 192 * 1024): Promise<unknown> {
  if (
    !response.ok ||
    !response.headers.get("content-type")?.includes("application/json") ||
    Number(response.headers.get("content-length")) > limit
  ) {
    await response.body?.cancel();
    return null;
  }
  const reader = response.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let length = 0;
  for (;;) {
    const part = await reader.read();
    if (part.done) break;
    length += part.value.length;
    if (length > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(part.value);
  }
  const bytes = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, at);
    at += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
export async function loadProjectAnalytics(
  project: AnalyticsProject,
  days: number,
  fetcher: typeof fetch = fetch
) {
  try {
    const url = new URL(analyticsSources[project]);
    url.searchParams.set("days", String(days));
    return parseProjectAnalytics(
      await boundedJson(
        await fetcher(url, { redirect: "manual", signal: AbortSignal.timeout(5000) })
      ),
      project,
      days
    );
  } catch {
    return null;
  }
}
export function formatMetric(metric: Pick<Metric, "value" | "unit">) {
  if (metric.value === null) return "—";
  return metric.unit === "seconds"
    ? metric.value >= 3600
      ? `${(metric.value / 3600).toLocaleString("en-AU", { maximumFractionDigits: 1 })}h`
      : `${Math.floor(metric.value / 60)}m ${metric.value % 60}s`
    : metric.value.toLocaleString("en-AU");
}
/** Compare complete Monday–Sunday UTC weeks only, from exact daily history. */
export function weeklyRecord(
  metric: Metric,
  coverage: ProjectAnalytics["coverage"],
  now = Date.now()
) {
  if (
    metric.quality !== "exact" ||
    !coverage.startedAt ||
    ["browsers", "returning_browsers", "engaged_sessions"].includes(metric.key)
  )
    return null;
  const today = new Date(new Date(now).toISOString().slice(0, 10));
  const currentMonday = new Date(today);
  currentMonday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  const weeks: { from: string; to: string; value: number }[] = [];
  for (let offset = 7; offset <= 84; offset += 7) {
    const from = new Date(currentMonday.valueOf() - offset * 86400000).toISOString().slice(0, 10);
    const to = new Date(Date.parse(from) + 6 * 86400000).toISOString().slice(0, 10);
    if (from <= coverage.startedAt.slice(0, 10) || to >= coverage.through.slice(0, 10)) continue;
    const rows = metric.daily.filter((d) => d.date >= from && d.date <= to);
    if (rows.length !== 7) continue;
    weeks.push({ from, to, value: rows.reduce((sum, d) => sum + d.value, 0) });
  }
  const latest = weeks[0];
  if (!latest || weeks.length < 2 || latest.value === 0) return null;
  const previous = weeks[1]!;
  // Missing recent days must not silently turn an older week into "last week"
  // or compare nonadjacent windows as the immediately preceding period.
  if (
    latest.from !== new Date(currentMonday.valueOf() - 7 * 86400000).toISOString().slice(0, 10) ||
    previous.from !== new Date(currentMonday.valueOf() - 14 * 86400000).toISOString().slice(0, 10)
  )
    return null;
  return {
    ...latest,
    previous: previous.value,
    newBest: latest.value > Math.max(...weeks.slice(1).map((w) => w.value)),
    comparison:
      previous.value > 0
        ? Math.round(((latest.value - previous.value) / previous.value) * 100)
        : null,
    comparedWeeks: weeks.length
  };
}
