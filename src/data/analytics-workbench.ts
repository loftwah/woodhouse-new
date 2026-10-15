import {
  type AnalyticsProject,
  type Metric,
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
      "New guest postcards recorded after Guestbook saves them as pending. They await moderation. Optional reporting can miss submissions; receipts do not establish approval, publication or unique people."
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
export function measuresFor(project: AnalyticsProject | null) {
  const keys = productView(project)?.keys;
  return keys ? keys.map((key) => measureChoices.find((m) => m.key === key)!) : [...measureChoices];
}
export function resolveMeasure(project: AnalyticsProject | null, requested?: string | null) {
  const choices = measuresFor(project);
  const canonical = requested === "replays" ? "game_replays" : requested;
  return (
    choices.find((m) => m.key === canonical) ??
    choices.find((m) => m.key === productView(project)?.defaultMeasure) ??
    choices[0]!
  );
}
export function measureForProjectSwitch(
  from: AnalyticsProject | null,
  to: AnalyticsProject | null,
  current: string
) {
  const previous = productView(from),
    next = productView(to);
  return resolveMeasure(to, previous && next && previous.family !== next.family ? null : current);
}
export function reportMetric(
  project: AnalyticsProject,
  metrics: Metric[] | undefined,
  key: string
) {
  // Woodhouse's active_seconds describe site attention, not active gameplay.
  // A shared source key alone does not establish the same product meaning.
  return measuresFor(project).some((m) => m.key === key)
    ? metrics?.find((m) => m.key === key)
    : undefined;
}
export function dateDays(period: ReportingWindow) {
  return Array.from({ length: period.days }, (_, i) =>
    new Date(Date.parse(period.from) + i * 86400000).toISOString().slice(0, 10)
  );
}
export function dailyStatus(
  report: ProjectAnalytics | null,
  metric: Metric | undefined,
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
export function dailyPoints(metric: Metric | undefined, period: ReportingWindow) {
  return dateDays(period).map((day) =>
    metric?.value === null ? null : (metric?.daily.find((d) => d.date === day)?.value ?? null)
  );
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
