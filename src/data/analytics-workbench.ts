import { type Metric, type ProjectAnalytics, type ReportingWindow } from "./portfolio-analytics.ts";
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
    key: "replays",
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
      "Consenting browser identifiers seen before the selected window within the source’s retained history. This is not cohort retention."
  },
  {
    key: "app_opens",
    label: "Mini-app opens",
    meaning:
      "Observed mini-app opens. App Composer bounds its public counter; these are neither unique users nor completed outcomes."
  },
  {
    key: "actions",
    label: "Mini-app actions",
    meaning:
      "Product-defined actions reported by mini-apps. An action counter alone does not establish a conversion or a successful creator outcome."
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
    key: "project_opens",
    label: "Project discovery",
    meaning:
      "Recorded outbound project-open actions from Woodhouse. A click shows discovery intent; it does not establish downstream use or acquisition."
  }
] as const;
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
  if (metric.quality === "bounded" || report.coverage.quality === "bounded") return "bounded";
  if (metric.quality === "sampled" || report.coverage.quality === "sampled") return "sampled";
  if (report.coverage.quality === "unavailable") return "missing";
  if (metric.quality === "partial") return "partial";
  if (!report.coverage.comparableFrom || day <= report.coverage.comparableFrom.slice(0, 10))
    return "legacy";
  if (
    day <= (report.coverage.startedAt ?? report.coverage.through).slice(0, 10) ||
    day >= report.coverage.through.slice(0, 10)
  )
    return "partial";
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
  const yMax = Math.max(1, Math.ceil(max / 5) * 5),
    x = (i: number) => left + (period.days === 1 ? plotW / 2 : (i / (period.days - 1)) * plotW),
    y = (v: number) => top + plotH - (v / yMax) * plotH;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Daily activity chart; exact values are in the chart data table"><g font-family="system-ui,sans-serif" font-size="12" fill="#a9b8d0">`;
  for (let i = 0; i <= 4; i++) {
    const yy = top + (plotH * i) / 4;
    svg += `<path d="M${left} ${yy}H${width - right}" stroke="#263349"/><text x="${left - 10}" y="${yy + 4}" text-anchor="end">${Math.round(yMax * (1 - i / 4)).toLocaleString("en-AU")}</text>`;
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
