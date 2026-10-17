import {
  formatMetric,
  weeklyRecord,
  type AnalyticsProject,
  type Metric,
  type PortfolioReport,
  type ProjectAnalytics,
  type ReportingWindow
} from "./portfolio-analytics.ts";
export const projectColours: Record<string, string> = {
  fighter: "#ff887e",
  bubbles: "#79d8ff",
  "protocol-11": "#b99aff",
  shoalshot: "#e9ff49",
  "app-composer": "#7fa2ff",
  loftwahfm: "#ff9ccd",
  woodhouse: "#b4c0d2"
};
export const measureChoices = [
  {
    key: "game_starts",
    label: "Game starts",
    meaning:
      "A recorded launch into gameplay. Repeat play counts again. These are browser reports, not verified players."
  },
  {
    key: "game_completions",
    label: "Game completions",
    meaning:
      "A product-defined terminal result. Starts and completions in this window are not a matched cohort, so dividing them would not give a reliable completion rate."
  },
  {
    key: "active_seconds",
    label: "Active play time",
    meaning:
      "Reported time while gameplay is active. Paused, hidden and inactive time is excluded where the product can observe it. Music time is separate."
  },
  {
    key: "visits",
    label: "Visits",
    meaning:
      "Anonymous tab sessions admitted by the collector. Opening another tab or returning after the session boundary may count again; a visit is not a unique person."
  },
  {
    key: "engaged_sessions",
    label: "Engaged sessions",
    meaning:
      "Sessions meeting a source-defined attention threshold. Check each source definition; thresholds and collection coverage can differ."
  },
  {
    key: "game_replays",
    label: "Replays",
    meaning:
      "A subsequent gameplay launch linked to an earlier terminal result where the product can establish that sequence."
  },
  {
    key: "browsers",
    label: "Reporting browsers",
    meaning:
      "Distinct consenting browser identifiers within this window where supported. Devices, profiles, resets and privacy choices prevent interpreting these as unique people."
  },
  {
    key: "returning_browsers",
    label: "Returning browsers",
    meaning:
      "Distinct consenting browser identifiers observed in this window with an earlier different tab session in retained history. Same-day returns may count. This is not cohort retention."
  },
  {
    key: "app_opens",
    label: "Mini-app opens",
    meaning:
      "Recorded mini-app home-page loads. Reloads and bots can count. Counters have daily caps; an open does not establish a unique user or a completed task."
  },
  {
    key: "actions",
    label: "Mixed app actions",
    meaning:
      "Adds Guestbook contribution-page opens and completed Link Check inspections. These represent different tasks; their sum is not a conversion rate or a count of successful creators."
  },
  {
    key: "photo_opens",
    label: "Guestbook contribution opens",
    meaning:
      "Successful public Guestbook contribution-page HTML requests. Repeated opens may count. These are not image downloads, submissions, publications or unique people."
  },
  {
    key: "guest_postcards_received",
    label: "Guest postcards received",
    meaning:
      "New guest postcards recorded after Guestbook accepts them as pending for moderation. This counts admissions, not the current queue size. Optional reporting can miss submissions; receipts do not establish approval, publication or unique people."
  },
  {
    key: "inspection_completed",
    label: "Completed Link Checks",
    meaning:
      "Link Check inspections reported by the owning app after completion. Repeated jobs may count; these are not unique users, outbound clicks or deployment checks."
  },
  {
    key: "listening_seconds",
    label: "Audible listening",
    meaning:
      "Accepted forward audible playback. Pauses, seeking, muted, hidden and stalled playback are excluded by the listening collector. This is music time, not gameplay."
  },
  {
    key: "listening_starts",
    label: "Listening starts",
    meaning:
      "Playback receipts with confirmed audible progression. Repeated plays count again. No unique listener identity is collected."
  },
  {
    key: "game_listening_seconds",
    label: "Game-attributed listening",
    meaning:
      "Accepted audible music time carrying the source’s game attribution. This remains listening time; it does not establish active gameplay or a distinct player."
  },
  {
    key: "game_listening_starts",
    label: "Game-attributed listening starts",
    meaning:
      "Confirmed listening starts carrying the source’s game attribution. Repeated plays count again; this does not count game launches or unique players."
  },
  {
    key: "project_opens",
    label: "Project discovery",
    meaning:
      "Recorded outbound project-open actions from Woodhouse. A click shows discovery intent; it does not establish downstream use or acquisition."
  }
] as const;
type MeasureKey = (typeof measureChoices)[number]["key"];
const gameMeasures: MeasureKey[] = [
  "game_starts",
  "game_completions",
  "active_seconds",
  "game_replays",
  "visits",
  "engaged_sessions",
  "browsers",
  "returning_browsers"
];
type ProductView = {
  family: "game" | "app" | "audience" | "listening";
  label: string;
  defaultMeasure: MeasureKey;
  keys: MeasureKey[];
  headlines: MeasureKey[];
  description: string;
};
const gameView: ProductView = {
  family: "game",
  label: "Play & engagement",
  defaultMeasure: "game_starts",
  keys: gameMeasures,
  headlines: ["game_starts", "game_completions", "active_seconds"],
  description:
    "Explore recorded gameplay starts, completions, active play and return signals, with source-specific coverage and explicit measurement limits."
};
const productViews: Record<AnalyticsProject, ProductView> = {
  "app-composer": {
    family: "app",
    label: "App usage & useful outcomes",
    defaultMeasure: "app_opens",
    keys: [
      "app_opens",
      "guest_postcards_received",
      "photo_opens",
      "inspection_completed",
      "actions"
    ],
    headlines: ["app_opens", "guest_postcards_received", "inspection_completed"],
    description:
      "Inspect mini-app opens, pending guest postcard receipts, contribution views and completed Link Checks, with source coverage and clear limits on what each outcome means."
  },
  woodhouse: {
    family: "audience",
    label: "Audience & project discovery",
    defaultMeasure: "visits",
    keys: ["visits", "engaged_sessions", "project_opens", "browsers", "returning_browsers"],
    headlines: ["visits", "engaged_sessions", "project_opens"],
    description:
      "Explore Woodhouse visits, engaged sessions and deliberate project discovery, with dated charts and explicit audience measurement limits."
  },
  loftwahfm: {
    family: "listening",
    label: "Audible listening",
    defaultMeasure: "listening_seconds",
    keys: [
      "listening_seconds",
      "listening_starts",
      "game_listening_seconds",
      "game_listening_starts"
    ],
    headlines: ["listening_seconds", "listening_starts"],
    description:
      "Explore accepted audible listening and playback starts, with dated charts, source coverage and clear listening definitions."
  },
  fighter: gameView,
  bubbles: gameView,
  "protocol-11": gameView,
  shoalshot: gameView
};
export function productView(project: AnalyticsProject | null) {
  return project ? productViews[project] : null;
}
/**
 * All projects opens on a mixed overview instead of inheriting the first global
 * measure. Gameplay is one product family among four; a portfolio of games,
 * music, an app and this site must not present game starts as its default
 * reading. `overview` is a scope, not a measure: every row keeps its own metric,
 * unit and meaning, and no family total is invented.
 *
 * The overview scope belongs to All projects only, so
 * `?measure=overview&project=fighter` normalises back to Game starts instead of
 * showing a mixed scope for a single product.
 */
export const overviewMeasure = {
  key: "overview",
  label: "Project overview",
  meaning:
    "Each admitted project opens on the measure that describes its own use: gameplay for the games, listening for LoftwahFM, app access and outcomes for App Composer and audience discovery for Woodhouse. The measures have different units and are never added together. Choose a measure for a single-scope drill-down."
} as const;
export function measuresFor(project: AnalyticsProject | null) {
  const keys = productView(project)?.keys;
  if (keys) return keys.map((key) => measureChoices.find((m) => m.key === key)!);
  return [overviewMeasure, ...measureChoices];
}
export function resolveMeasure(project: AnalyticsProject | null, requested?: string | null) {
  const choices = measuresFor(project);
  if (
    project === null &&
    (requested === undefined || requested === null || requested === overviewMeasure.key)
  )
    return overviewMeasure;
  const canonical = requested === "replays" ? "game_replays" : requested;
  const known = measureChoices.find((m) => m.key === canonical);
  return (
    (known && choices.some((m) => m.key === known.key) ? known : undefined) ??
    choices.find((m) => m.key === productView(project)?.defaultMeasure) ??
    // An unreadable measure for All projects returns to the overview; the route
    // normalises the address instead of silently drawing one project family.
    choices[0]!
  );
}
export function isOverviewMeasure(measure: { key: string }): measure is typeof overviewMeasure {
  return measure.key === overviewMeasure.key;
}
export function measureForProjectSwitch(
  from: AnalyticsProject | null,
  to: AnalyticsProject | null,
  current: string
) {
  const previous = productView(from),
    next = productView(to);
  // Leaving All projects always lands on the destination's own default.
  if (!from || !next) return resolveMeasure(to, null);
  return resolveMeasure(to, previous && previous.family !== next.family ? null : current);
}
/** Each project's own headline measure, in the order the product views define them. */
export function overviewMeasures(project: AnalyticsProject) {
  const view = productView(project)!;
  const primary = measureChoices.find((m) => m.key === view.defaultMeasure)!;
  const rest = view.headlines
    .filter((key) => key !== view.defaultMeasure)
    .map((key) => measureChoices.find((m) => m.key === key)!);
  return [primary, ...rest];
}
/** A project's overview row. Applicability is decided by the product view, never by the payload. */
export function overviewMetric(
  report: ProjectAnalytics | null | undefined,
  project: AnalyticsProject
) {
  const [primary] = overviewMeasures(project);
  return report?.metrics.find((m) => m.key === primary!.key);
}
/** Games lead the portfolio overview; the rest follow their product families. */
export const overviewOrder: AnalyticsProject[] = [
  "fighter",
  "bubbles",
  "protocol-11",
  "shoalshot",
  "loftwahfm",
  "app-composer",
  "woodhouse"
];
/**
 * The share caption for one selection. The page, the saved link and the social
 * card must describe the same scope, measure, unit and period, so the caption is
 * built once from the same rows the page renders.
 *
 * Every row here is already in the selected applicable scope. A project whose
 * source is unavailable, whose report omitted the measure or which reported no
 * value for the window keeps a concise missing-source entry instead of
 * disappearing, and the coverage line states the supplied/applicable count the
 * PNG footer uses. The observed failure was a caption that silently shrank the
 * scope the page, chart and shared images described.
 */
export function reportCaption(
  rows: {
    name: string;
    metric: Metric | undefined;
    overviewMeasure: { label: string } | null;
    report?: { coverage: ProjectAnalytics["coverage"] } | null;
  }[],
  measure: { key: string; label: string },
  window: ReportingWindow,
  link: string,
  dateLabel: (date: string) => string
) {
  const mixed = isOverviewMeasure(measure);
  const values = rows.map((r) => {
    const label = (
      mixed && r.overviewMeasure ? r.overviewMeasure.label : measure.label
    ).toLowerCase();
    const qualifier = reportQualifier(r.metric, r.report ?? null, window);
    return r.metric && r.metric.value !== null
      ? `${r.name}: ${formatMetric(r.metric)} ${label} · ${qualifier}`
      : `${r.name}: ${label} not reported · ${qualifier}`;
  });
  const supplied = rows.filter((r) => r.metric?.value !== null && r.metric).length;
  const coverage = `${supplied}/${rows.length} ${
    mixed ? "projects supplied their own measure" : "sources supply this measure"
  } · ${window.complete ? "Closed calendar window" : "Current UTC day is partial"}`;
  return [
    `Portfolio analytics · ${dateLabel(window.from)} – ${dateLabel(window.to)} (UTC)`,
    ...values,
    coverage,
    mixed
      ? "One relevant measure per project; units are not added together."
      : "One measure and one unit across the named projects.",
    "Reported activity, not unique people. Legacy/test and coverage limits apply.",
    link
  ].join("\n");
}
export type OverviewRow = {
  project: AnalyticsProject;
  family: ProductView["family"];
  label: string;
  measure: (typeof measureChoices)[number];
  metric: Metric | undefined;
};
/**
 * Build the mixed overview in product-family order. A project is applicable by
 * definition and stays in the list when its source is unavailable, so a real
 * reporting failure is visible rather than filtered out.
 */
export function portfolioOverview(
  report: PortfolioReport | null,
  publicIds: Set<string>,
  names: Map<string, string>
): OverviewRow[] {
  const members = overviewOrder.filter((project) => publicIds.has(project));
  return members.map((project) => {
    const data = report?.projects.find((p) => p.project === project)?.report ?? null;
    const [primary] = overviewMeasures(project);
    return {
      project,
      family: productView(project)!.family,
      label: names.get(project) ?? project,
      measure: primary!,
      metric: overviewMetric(data, project)
    };
  });
}
/**
 * Whether the product's own view defines this measure at all. Applicability comes
 * from the product definition, never from whether a source returned data: a game
 * that should report gameplay but returned nothing stays in the scope and the
 * coverage denominator as "Not measured".
 */
export function supportsMeasure(project: AnalyticsProject, key: string) {
  return measuresFor(project).some((m) => m.key === key);
}
/**
 * The projects whose product view supports this measure, in the order supplied.
 * A missing whole report or an omitted metric is a reporting failure that keeps
 * the project in scope; a product that does not define the measure is omitted.
 */
export function measureScope(projects: AnalyticsProject[], key: string) {
  return projects.filter((project) => supportsMeasure(project, key));
}
export function reportMetric(
  project: AnalyticsProject,
  metrics: Metric[] | undefined,
  key: string
) {
  // Woodhouse's active_seconds describe site attention, not active gameplay.
  // A shared source key alone does not establish the same product meaning.
  return supportsMeasure(project, key) ? metrics?.find((m) => m.key === key) : undefined;
}
export function dateDays(period: ReportingWindow) {
  return Array.from({ length: period.days }, (_, i) =>
    new Date(Date.parse(period.from) + i * 86400000).toISOString().slice(0, 10)
  );
}
export function dailyStatus(
  report: { coverage: ProjectAnalytics["coverage"] } | null,
  metric: Pick<Metric, "key" | "value" | "quality" | "daily"> | undefined,
  day: string
) {
  const point = metric?.daily.find((d) => d.date === day);
  if (!report || !metric || metric.value === null || metric.quality === "unavailable" || !point)
    return "missing";
  if (
    metric.key === "guest_postcards_received" &&
    (metric.quality === "partial" || metric.quality === "bounded")
  ) {
    // This source emits points only from the first retained receipt. Partial
    // quality means that first observed day is included, not an enablement date.
    return (metric.quality === "partial" && day === metric.daily[0]?.date) ||
      day >= report.coverage.through.slice(0, 10)
      ? "partial"
      : "bounded";
  }
  if (metric.quality === "bounded" || report.coverage.quality === "bounded") return "bounded";
  if (metric.quality === "sampled" || report.coverage.quality === "sampled") return "sampled";
  if (report.coverage.quality === "unavailable") return "missing";
  if (metric.quality === "partial") return "partial";
  if (
    day <= (report.coverage.startedAt ?? report.coverage.through).slice(0, 10) ||
    day >= report.coverage.through.slice(0, 10)
  )
    return "partial";
  if (!report.coverage.comparableFrom || day <= report.coverage.comparableFrom.slice(0, 10))
    return "legacy";
  return "clean";
}
type DiscoveryCoverage = "observed" | "partial" | "unavailable";
export type DiscoveryReferral = {
  slug: string;
  name: string;
  siteUrl: string | null;
  metric: Metric;
  value: number;
  recent: number;
  prior: number;
  recentFrom: string;
  recentTo: string;
  priorFrom: string;
  priorTo: string;
  recentCoverage: DiscoveryCoverage;
  priorCoverage: DiscoveryCoverage;
  priorObservedDays: number;
  hasTrend: boolean;
};
/**
 * The destination breakdown for Woodhouse discovery. The collector stores one
 * `referral_<destination>` counter per published project; this projects those
 * counters for the selected period, keeps only destinations that are still
 * published, and attaches the destination name and link. A click towards a
 * project is a referral, not proof of downstream play, adoption or a person.
 *
 * The observed failure: a long *selected* calendar range was treated as
 * sufficient *comparison history*, and days with no observation were summed as
 * zero. Only days the source actually retained are summed here, and a
 * week-on-week figure needs every day of the earlier week recorded. An observed
 * zero, unavailable earlier history and a week that is still in progress are
 * three different states. The compared windows are the last seven days and the
 * seven before them inside the selected window, by their real dates, so a custom
 * or frozen report never borrows today's range.
 */
export function discoveryReferrals(
  metrics: Metric[] | undefined,
  published: Set<string>,
  names: Map<string, string>,
  siteUrls: Map<string, string | null>,
  period: ReportingWindow
): DiscoveryReferral[] {
  const dates = dateDays(period);
  const recentDates = dates.slice(-7);
  const priorDates = dates.slice(-14, -7);
  const coverageOf = (observedDays: number, total: number): DiscoveryCoverage =>
    observedDays === 0 ? "unavailable" : observedDays < total ? "partial" : "observed";
  return (metrics ?? [])
    .filter((metric) => metric.key.startsWith("referral_"))
    .map((metric) => {
      const slug = metric.key.slice("referral_".length).replaceAll("_", "-");
      const observed = new Map(metric.daily.map((point) => [point.date, point.value]));
      const sum = (days: string[]) =>
        days.reduce((total, day) => total + (observed.get(day) ?? 0), 0);
      const observedDays = (days: string[]) => days.filter((day) => observed.has(day)).length;
      const recentObserved = observedDays(recentDates);
      const priorObserved = observedDays(priorDates);
      // A comparison needs a whole earlier week inside retained history. A
      // window shorter than fourteen days can never supply one.
      const priorComplete = priorDates.length === 7 && priorObserved === 7;
      return {
        slug,
        name: names.get(slug) ?? slug,
        siteUrl: siteUrls.get(slug) ?? null,
        metric,
        value: metric.value ?? 0,
        recent: sum(recentDates),
        prior: sum(priorDates),
        recentFrom: recentDates[0] ?? period.from,
        recentTo: recentDates.at(-1) ?? period.to,
        priorFrom: priorDates[0] ?? period.to,
        priorTo: priorDates.at(-1) ?? period.to,
        recentCoverage: coverageOf(recentObserved, recentDates.length),
        priorCoverage: (
          priorComplete ? "observed" : priorObserved === 0 ? "unavailable" : "partial"
        ) as DiscoveryCoverage,
        priorObservedDays: priorObserved,
        // The current week may still be in progress; that is shown as a caveat,
        // never used to invent history.
        hasTrend: priorComplete
      };
    })
    .filter((entry) => published.has(entry.slug) && entry.value > 0)
    .sort((a, b) => b.value - a.value);
}
export function dailyPoints(metric: Metric | undefined, period: ReportingWindow) {
  return dateDays(period).map((day) =>
    metric?.value === null ? null : (metric?.daily.find((d) => d.date === day)?.value ?? null)
  );
}
export type WeeklyHighlight = {
  project: AnalyticsProject;
  name: string;
  family: ProductView["family"];
  measure: (typeof measureChoices)[number];
  unit: Metric["unit"];
  from: string;
  to: string;
  value: number;
  previous: number;
  changePercent: number | null;
  newBest: boolean;
  comparedWeeks: number;
};
export type WeeklyGap = { project: AnalyticsProject; name: string; reason: string };

/**
 * The last complete Monday–Sunday UTC week for each admitted project's own
 * headline measure, with its previous-week comparison and any earned record.
 *
 * This is deliberately separate from `analysePortfolio`. That function raises an
 * operational alert and reports only movements past a 25% and minimum-volume
 * threshold, so it is the wrong gate for a valid comparison or a genuine record:
 * reusing it here would silently hide every smaller real observation. A project
 * earns a record only with exact daily history for two adjacent complete weeks in
 * retained comparable history.
 */
export function weeklyHighlights(
  projects: PortfolioReport["projects"],
  names: Map<string, string>,
  now = Date.now()
): { highlights: WeeklyHighlight[]; gaps: WeeklyGap[] } {
  const highlights: WeeklyHighlight[] = [];
  const gaps: WeeklyGap[] = [];
  const ordered = [...projects].sort(
    (a, b) => overviewOrder.indexOf(a.project) - overviewOrder.indexOf(b.project)
  );
  for (const { project, report } of ordered) {
    const name = names.get(project) ?? project;
    const [primary] = overviewMeasures(project);
    if (!report) {
      gaps.push({ project, name, reason: "No source report for these dates" });
      continue;
    }
    const metric = report.metrics.find((m) => m.key === primary!.key);
    if (!metric) {
      gaps.push({ project, name, reason: `${primary!.label} is not in this source report` });
      continue;
    }
    const week = weeklyRecord(metric, report.coverage, now);
    if (!week) {
      gaps.push({ project, name, reason: weeklyGapReason(metric, report.coverage, primary!) });
      continue;
    }
    highlights.push({
      project,
      name,
      family: productView(project)!.family,
      measure: primary!,
      unit: metric.unit,
      from: week.from,
      to: week.to,
      value: week.value,
      previous: week.previous,
      changePercent: week.comparison,
      newBest: week.newBest,
      comparedWeeks: week.comparedWeeks
    });
  }
  return { highlights, gaps };
}

function weeklyGapReason(
  metric: Metric,
  coverage: ProjectAnalytics["coverage"],
  measure: { label: string }
) {
  if (["browsers", "returning_browsers", "engaged_sessions"].includes(metric.key))
    return `${measure.label} is a period statistic, not a comparable daily counter`;
  if (metric.quality !== "exact") return `${measure.label} is not an exact counter`;
  if (!coverage.startedAt) return "Collection start is not established";
  if (!coverage.comparableFrom) return "No comparable-history boundary yet";
  return "Fewer than two complete comparable weeks so far";
}

export function qualityText(metric?: Metric) {
  return !metric || metric.value === null
    ? "Not measured"
    : metric.quality === "bounded"
      ? "Bounded count"
      : metric.quality === "sampled"
        ? "Sampled estimate"
        : metric.quality === "partial"
          ? "Partial measurement"
          : "Reported activity";
}
/**
 * The one context-aware label a value carries wherever a reader meets it: the
 * overview card, the single-measure strip, the saved caption and every shared
 * PNG. A simpler label on one surface used to hide legacy/test risk or partial
 * coverage that another surface named, so the same qualifier is used everywhere.
 * Coverage and legacy risk stay distinct from a measured zero.
 */
export function reportQualifier(
  metric: Pick<Metric, "key" | "value" | "quality" | "daily"> | undefined,
  report: { coverage: ProjectAnalytics["coverage"] } | null | undefined,
  period: ReportingWindow
) {
  // A missing source, a source that omitted this metric and a measured metric
  // with no value in the window are three different facts, not one zero.
  if (!metric) return report ? "Not reported" : "Source unavailable";
  if (metric.value === null) return "Not measured";
  if (metric.key === "guest_postcards_received" && metric.quality === "partial")
    return "Partial coverage";
  if (metric.quality === "bounded" || report?.coverage.quality === "bounded")
    return "Bounded count";
  if (metric.quality === "sampled" || report?.coverage.quality === "sampled")
    return "Sampled estimate";
  if (report?.coverage.quality === "unavailable") return "Coverage unavailable";
  if (dateDays(period).some((day) => dailyStatus(report ?? null, metric, day) === "legacy"))
    return "Legacy/test risk";
  if (
    metric.quality === "partial" ||
    metric.daily.length < period.days ||
    dateDays(period).some((day) => dailyStatus(report ?? null, metric, day) === "partial")
  )
    return "Partial coverage";
  return "Reported activity";
}
export function svgPlot(
  series: { name: string; colour: string; values: (number | null)[] }[],
  period: ReportingWindow,
  width = 900,
  height = 340
) {
  const left = 60,
    right = 22,
    top = 24,
    bottom = 40,
    plotW = width - left - right,
    plotH = height - top - bottom;
  const max = Math.max(
    1,
    ...series.flatMap((s) => s.values.filter((x): x is number => x !== null))
  );
  const magnitude = 10 ** Math.floor(Math.log10(max / 4));
  const multiple = [1, 2, 2.5, 5, 10].find((value) => value >= max / 4 / magnitude)!;
  const step = Math.max(1, Math.ceil(multiple * magnitude));
  const yMax = Math.ceil(max / step) * step,
    x = (i: number) => left + (period.days === 1 ? plotW / 2 : (i / (period.days - 1)) * plotW),
    y = (v: number) => top + plotH - (v / yMax) * plotH;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Daily activity chart; exact values are in the chart data table"><g font-family="system-ui,sans-serif" font-size="12" fill="#a9b8d0">`;
  for (let value = yMax; value >= 0; value -= step) {
    const yy = y(value);
    svg += `<path d="M${left} ${yy}H${width - right}" stroke="#263349"/><text x="${left - 10}" y="${yy + 4}" text-anchor="end">${value.toLocaleString("en-AU")}</text>`;
  }
  const dates = dateDays(period);
  const tickIndices = [...new Set([0, Math.floor((period.days - 1) / 2), period.days - 1])];
  for (const i of tickIndices)
    svg += `<text x="${x(i)}" y="${height - 12}" text-anchor="middle">${dates[i]!.slice(5)}</text>`;
  for (const s of series) {
    let pen = false,
      d = "";
    s.values.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(2)} ${y(v).toFixed(2)} `;
      pen = true;
    });
    svg += `<path d="${d}" stroke="${s.colour}" fill="none" stroke-width="2.5"/>`;
    s.values.forEach((v, i) => {
      if (v !== null) svg += `<circle cx="${x(i)}" cy="${y(v)}" r="2.5" fill="${s.colour}"/>`;
    });
  }
  return svg + "</g></svg>";
}
