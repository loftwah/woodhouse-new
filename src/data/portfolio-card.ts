import { formatMetric, periodFor, type PortfolioReport } from "./portfolio-analytics.ts";
import {
  dailyPoints,
  dailyStatus,
  dateDays,
  measureChoices,
  projectColours,
  svgPlot
} from "./analytics-workbench.ts";
export const reportFormats = {
  landscape: { width: 1200, height: 630 },
  square: { width: 1200, height: 1200 },
  portrait: { width: 1080, height: 1920 }
} as const;
export type ReportFormat = keyof typeof reportFormats;
const escape = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!
  );
/** Authored layouts share frozen series and coverage, never illustrative chart traces. */
export function reportSvg(
  report: PortfolioReport,
  names: Map<string, string>,
  format: ReportFormat = "landscape",
  requestedMeasure?: string,
  origin = "https://woodhouse.loftwah.com"
) {
  const { width: w, height: h } = reportFormats[format];
  const landscape = format === "landscape",
    portrait = format === "portrait",
    pad = 56;
  const period =
    report.period ??
    report.projects.find((p) => p.report)?.report?.period ??
    periodFor(report.days, Date.parse(report.createdAt));
  const measure =
    measureChoices.find((m) => m.key === requestedMeasure) ??
    measureChoices.find((m) =>
      report.projects.some((p) =>
        p.report?.metrics.some((v) => v.key === m.key && v.value !== null)
      )
    ) ??
    measureChoices[0];
  const rows = report.projects.map((row) => ({
    ...row,
    name: names.get(row.project) ?? row.project,
    metric: row.report?.metrics.find((m) => m.key === measure.key),
    colour: projectColours[row.project] ?? "#b4c0d2"
  }));
  const qualifier = (row: (typeof rows)[number]) => {
    if (!row.metric || row.metric.value === null) return "Not measured";
    if (row.metric.quality === "bounded" || row.report?.coverage.quality === "bounded")
      return "Bounded count";
    if (row.metric.quality === "sampled" || row.report?.coverage.quality === "sampled")
      return "Sampled estimate";
    if (row.report?.coverage.quality === "unavailable") return "Coverage unavailable";
    if (dateDays(period).some((day) => dailyStatus(row.report, row.metric, day) === "legacy"))
      return "Legacy/test risk";
    if (
      row.metric.quality === "partial" ||
      row.metric.daily.length < period.days ||
      dateDays(period).some((day) => dailyStatus(row.report, row.metric, day) === "partial")
    )
      return "Partial coverage";
    return "Reported activity";
  };
  const retrieval = new URL("/activity/", origin);
  retrieval.searchParams.set("report", report.id);
  retrieval.searchParams.set("measure", measure.key);
  if (rows.length === 1) retrieval.searchParams.set("project", rows[0]!.project);
  const retrievalLabel = retrieval.href.replace(/^https?:\/\//, "");
  const series = rows
    .filter((r) => r.metric)
    .map((r) => ({ name: r.name, colour: r.colour, values: dailyPoints(r.metric, period) }));
  const text = (x: number, y: number, v: string, size = 24, fill = "#f4f7fd", weight = 400) =>
    `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}">${escape(v)}</text>`;
  const line = (y: number) => `<path d="M${pad} ${y}H${w - pad}" stroke="#2a3b51"/>`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#080d19"/><g font-family="Bricolage Grotesque">`;
  svg +=
    text(pad, 62, "WOODHOUSE", 22, "#e9ff49", 700) +
    text(w - 330, 62, "PORTFOLIO ANALYTICS", 16, "#a9b8d0", 500);
  svg += text(
    pad,
    landscape ? 123 : 148,
    report.projects.length === 1 ? rows[0]!.name : measure.label,
    landscape ? 42 : 58,
    "#f4f7fd",
    700
  );
  svg += text(
    pad,
    landscape ? 157 : 191,
    `${period.from} — ${period.to} · UTC · ${period.days} days`,
    landscape ? 20 : 25,
    "#a9b8d0"
  );
  const chartY = landscape ? 273 : portrait ? 300 : 250,
    chartH = landscape ? 217 : portrait ? 570 : 400;
  if (report.projects.length === 1 && !landscape)
    svg += text(pad, landscape ? 204 : 237, measure.label, landscape ? 22 : 28, "#79d8ff", 500);
  if (landscape) {
    const cellW = (w - pad * 2) / Math.max(1, rows.length);
    rows.forEach((r, i) => {
      const x = pad + i * cellW;
      svg +=
        `<circle cx="${x + 4}" cy="194" r="4" fill="${r.colour}"/>` +
        text(
          x + 14,
          200,
          rows.length === 1 ? measure.label : r.name,
          rows.length > 5 ? 16 : 20,
          "#b4c0d2"
        ) +
        text(
          x,
          237,
          r.metric ? formatMetric(r.metric) : "—",
          rows.length > 5 ? 28 : 35,
          r.colour,
          700
        ) +
        text(x, 259, qualifier(r), 13, "#a9b8d0");
    });
  }
  const plot = svgPlot(series, period, w - pad * 2, chartH)
    .replace("<svg ", `<svg x="${pad}" y="${chartY}" width="${w - pad * 2}" height="${chartH}" `)
    .replace('font-family="system-ui,sans-serif"', 'font-family="Bricolage Grotesque"')
    .replace('font-size="12"', 'font-size="16"');
  svg += plot;
  if (!series.some((s) => s.values.some((v) => v !== null)))
    svg += text(
      pad + 70,
      chartY + chartH / 2,
      "Daily measurements unavailable",
      landscape ? 25 : 32,
      "#a9b8d0"
    );
  if (!landscape) {
    const top = chartY + chartH + (portrait ? 85 : 60),
      rowH = portrait ? 112 : 49;
    svg += text(
      pad,
      top - 20,
      `${measure.label} · ${rows.find((r) => r.metric)?.metric?.unit === "seconds" ? "audible / active seconds" : "reported counts"}`,
      22,
      "#a9b8d0"
    );
    rows.forEach((r, i) => {
      const y = top + i * rowH;
      svg +=
        line(y) +
        `<circle cx="${pad + 5}" cy="${y + 27}" r="5" fill="${r.colour}"/>` +
        text(pad + 22, y + (portrait ? 36 : 32), r.name, portrait ? 28 : 24, "#f4f7fd", 500) +
        (!portrait ? text(440, y + 32, qualifier(r), 17, "#a9b8d0") : "") +
        text(
          w - pad - (portrait ? 220 : 190),
          y + (portrait ? 36 : 32),
          r.metric ? formatMetric(r.metric) : "—",
          portrait ? 36 : 27,
          r.colour,
          700
        );
      if (portrait) svg += text(pad + 22, y + 77, qualifier(r), 21, "#a9b8d0");
    });
  }
  const foot = landscape ? 528 : portrait ? 1770 : 1070;
  svg +=
    line(foot - 14) +
    text(
      pad,
      foot + 17,
      `${rows.filter((r) => r.metric?.value !== null && r.metric).length}/${rows.length} sources supply this measure · ${period.complete ? "Closed calendar window" : "Current UTC day is partial"}`,
      landscape ? 19 : 23,
      "#b4c0d2"
    );
  svg += text(
    pad,
    foot + 48,
    "Reported activity, not unique people. Legacy/test and coverage limits apply.",
    landscape ? 18 : 22,
    "#a9b8d0"
  );
  svg += text(
    pad,
    foot + 78,
    retrievalLabel,
    Math.min(landscape ? 17 : 20, (w - pad * 2) / (retrievalLabel.length * 0.56)),
    "#a9b8d0"
  );
  if (!landscape)
    svg += text(
      pad,
      h - 28,
      `Captured ${report.createdAt.slice(0, 19).replace("T", " ")} UTC · snapshot ${report.id}`,
      18,
      "#b4c0d2"
    );
  return svg + "</g></svg>";
}
