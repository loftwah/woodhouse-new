import { formatMetric, periodFor, type PortfolioReport } from "./portfolio-analytics.ts";
import {
  dailyPoints,
  resolveMeasure,
  isOverviewMeasure,
  overviewMeasures,
  overviewOrder,
  reportMetric,
  reportQualifier,
  supportsMeasure,
  projectColours,
  svgPlot,
  weeklyHighlights
} from "./analytics-workbench.ts";
// Re-exported so the shared-image tests keep one import path; the qualifier is
// owned by the workbench module the page and the renderer both use.
export { reportQualifier };
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
  origin = "https://woodhouse.loftwah.com",
  highlightedWeek?: string
) {
  const { width: w, height: h } = reportFormats[format];
  const landscape = format === "landscape",
    portrait = format === "portrait",
    pad = 56;
  const period =
    report.period ??
    report.projects.find((p) => p.report)?.report?.period ??
    periodFor(report.days, Date.parse(report.createdAt));
  const measure = resolveMeasure(
    report.projects.length === 1 ? report.projects[0]!.project : null,
    requestedMeasure
  );
  const overview = isOverviewMeasure(measure);
  // Applicability comes from the product view, never from the payload: a non-game
  // must not appear as a missing gameplay source, and a game that should report a
  // measure stays in the denominator even when it returned nothing. A project that
  // supplied nothing keeps its own measure named rather than becoming a gameplay gap.
  //
  // The overview follows the page's games-first order so the shared image and the
  // page describe the same portfolio in the same sequence.
  const ordered = overview
    ? [...report.projects].sort(
        (a, b) => overviewOrder.indexOf(a.project) - overviewOrder.indexOf(b.project)
      )
    : report.projects;
  const rows = ordered.map((row) => {
    const headline = overview ? overviewMeasures(row.project)[0]! : null;
    return {
      ...row,
      name: names.get(row.project) ?? row.project,
      metric: overview
        ? row.report?.metrics.find((m) => m.key === headline!.key)
        : reportMetric(row.project, row.report?.metrics, measure.key),
      measureLabel: overview ? headline!.label : measure.label,
      colour: projectColours[row.project] ?? "#b4c0d2"
    };
  });
  // A scoped measure renders every project that supports it. A game that
  // supports it but returned nothing — because its whole report is missing or the
  // metric was omitted — keeps its "— / Not measured" cell and stays in the
  // coverage denominator. A non-game never appears as a missing gameplay source.
  // A single-product report always names the requested measure, even when that
  // source did not supply it.
  const shown =
    overview || rows.length === 1
      ? rows
      : rows.filter((row) => supportsMeasure(row.project, measure.key));
  const applicable = shown.length;
  const qualifier = (row: (typeof rows)[number]) => reportQualifier(row.metric, row.report, period);
  // A highlighted week comes from the same retained history the page reads, so the
  // page, caption and all three images state the same week, previous period and
  // record basis rather than the narrow figure alone.
  const focus = highlightedWeek
    ? weeklyHighlights(
        report.projects,
        names,
        Date.parse(report.createdAt),
        report.history
      ).highlights.find(
        (highlight) =>
          highlight.from === highlightedWeek &&
          (!requestedMeasure || highlight.measure.key === measure.key) &&
          (rows.length !== 1 || highlight.project === rows[0]!.project)
      )
    : undefined;
  const retrieval = new URL("/activity/", origin);
  retrieval.searchParams.set("report", report.id);
  retrieval.searchParams.set("measure", measure.key);
  if (rows.length === 1) retrieval.searchParams.set("project", rows[0]!.project);
  if (focus) retrieval.searchParams.set("week", focus.from);
  const retrievalLabel = retrieval.href.replace(/^https?:\/\//, "");
  const series = shown
    .filter((r) => r.metric)
    .map((r) => ({ name: r.name, colour: r.colour, values: dailyPoints(r.metric, period) }));
  const text = (x: number, y: number, v: string, size = 24, fill = "#f4f7fd", weight = 400) =>
    `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}">${escape(v)}</text>`;
  const line = (y: number) => `<path d="M${pad} ${y}H${w - pad}" stroke="#2a3b51"/>`;
  /**
   * Each overview panel is scaled to its own maximum. The panels are daily shapes
   * for the same window, not a shared axis: one project's seconds and another's
   * counts are never compared by height.
   */
  const sparkline = (
    values: (number | null)[],
    x: number,
    y: number,
    width: number,
    height: number,
    colour: string
  ) => {
    if (values.every((value) => value === null)) return "";
    const max = Math.max(1, ...values.filter((v): v is number => v !== null));
    const step = values.length > 1 ? width / (values.length - 1) : width;
    let pen = false,
      d = "";
    values.forEach((value, index) => {
      if (value === null) {
        pen = false;
        return;
      }
      const px = x + index * step,
        py = y + height - (value / max) * height;
      d += `${pen ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)} `;
      pen = true;
    });
    return (
      `<path d="M${x} ${y + height}H${x + width}" stroke="#26364c"/>` +
      (d ? `<path d="${d}" fill="none" stroke="${colour}" stroke-width="2"/>` : "")
    );
  };
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
    focus ? (landscape ? 140 : 172) : landscape ? 157 : 191,
    `${period.from} — ${period.to} · UTC · ${period.days} ${period.days === 1 ? "day" : "days"}`,
    landscape ? 20 : 25,
    "#a9b8d0"
  );
  if (focus) {
    const movement =
      focus.changePercent === null
        ? `no prior baseline (${formatMetric({ value: focus.previous, unit: focus.unit })} the week before)`
        : `${focus.changePercent > 0 ? "up" : focus.changePercent < 0 ? "down" : "level"} ${Math.abs(focus.changePercent)}% from ${formatMetric({ value: focus.previous, unit: focus.unit })}`;
    const focusLine = `Week in focus · ${focus.from} — ${focus.to} · ${focus.name} · ${formatMetric({ value: focus.value, unit: focus.unit })} ${focus.measure.label.toLowerCase()} · ${movement}${focus.newBest ? ` · new best of ${focus.comparedWeeks} weeks` : ""}`;
    svg +=
      `<circle cx="${pad + 4}" cy="${(landscape ? 172 : 204) - 4}" r="4" fill="#e9ff49"/>` +
      text(
        pad + 14,
        landscape ? 172 : 204,
        focusLine,
        Math.min(landscape ? 17 : 20, (w - pad * 2) / (focusLine.length * 0.5)),
        "#e9ff49",
        500
      );
  }
  const chartY = overview
      ? landscape
        ? 236
        : portrait
          ? 300
          : 240
      : landscape
        ? 273
        : portrait
          ? 300
          : 250,
    chartH = landscape ? 217 : portrait ? 570 : 400;
  if (report.projects.length === 1 && !landscape && !focus)
    svg += text(pad, landscape ? 204 : 237, measure.label, landscape ? 22 : 28, "#79d8ff", 500);
  if (overview && !landscape && !focus)
    svg += text(pad, landscape ? 204 : 237, "One relevant measure per project", 26, "#79d8ff", 500);
  if (landscape) {
    if (overview) {
      const cellW = (w - pad * 2) / Math.max(1, shown.length);
      shown.forEach((r, i) => {
        const x = pad + i * cellW;
        svg +=
          `<circle cx="${x + 4}" cy="196" r="4" fill="${r.colour}"/>` +
          text(x + 14, 202, r.name, shown.length > 5 ? 16 : 20, "#b4c0d2") +
          text(
            x,
            244,
            r.metric ? formatMetric(r.metric) : "—",
            shown.length > 5 ? 28 : 35,
            r.colour,
            700
          ) +
          text(x, 268, r.measureLabel, 14, "#f4f7fd") +
          text(x, 288, qualifier(r), 13, "#a9b8d0");
      });
      svg +=
        text(pad, 330, "Daily shape · each panel scaled to its own maximum", 16, "#a9b8d0") +
        shown
          .map((r, i) =>
            sparkline(
              r.metric ? dailyPoints(r.metric, period) : [],
              pad + i * cellW,
              352,
              cellW - 22,
              90,
              r.colour
            )
          )
          .join("");
    } else {
      const cellW = (w - pad * 2) / Math.max(1, shown.length);
      shown.forEach((r, i) => {
        const x = pad + i * cellW;
        svg +=
          `<circle cx="${x + 4}" cy="194" r="4" fill="${r.colour}"/>` +
          text(
            x + 14,
            200,
            shown.length === 1 ? measure.label : r.name,
            shown.length > 5 ? 16 : 20,
            "#b4c0d2"
          ) +
          text(
            x,
            237,
            r.metric ? formatMetric(r.metric) : "—",
            shown.length > 5 ? 28 : 35,
            r.colour,
            700
          ) +
          text(x, 259, qualifier(r), 13, "#a9b8d0");
      });
    }
  }
  if (!overview) {
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
  }
  if (!landscape) {
    const top = overview ? (portrait ? 340 : 300) : chartY + chartH + (portrait ? 85 : 60),
      rowH = overview ? (portrait ? 190 : 95) : portrait ? 112 : 49;
    if (!overview)
      svg += text(
        pad,
        top - 20,
        `${measure.label} · ${shown.find((r) => r.metric)?.metric?.unit === "seconds" ? "audible / active seconds" : "reported counts"}`,
        22,
        "#a9b8d0"
      );
    shown.forEach((r, i) => {
      const y = top + i * rowH;
      svg +=
        line(y) +
        `<circle cx="${pad + 5}" cy="${y + 27}" r="5" fill="${r.colour}"/>` +
        text(
          pad + 22,
          y + (portrait ? 36 : 32),
          overview ? `${r.name} · ${r.measureLabel}` : r.name,
          portrait ? 28 : 24,
          "#f4f7fd",
          500
        ) +
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
      if (overview)
        svg += sparkline(
          r.metric ? dailyPoints(r.metric, period) : [],
          portrait ? pad + 22 : 620,
          portrait ? y + 92 : y + 46,
          portrait ? 430 : 250,
          portrait ? 48 : 32,
          r.colour
        );
    });
    if (overview)
      svg += text(
        pad,
        top + shown.length * rowH + 26,
        "Daily shape · each row scaled to its own maximum; the units differ by project.",
        20,
        "#a9b8d0"
      );
  }
  const foot = landscape ? 528 : portrait ? 1770 : 1070;
  const supplied = shown.filter((r) => r.metric?.value !== null && r.metric).length;
  svg +=
    line(foot - 14) +
    text(
      pad,
      foot + 17,
      `${supplied}/${applicable} ${
        overview ? "projects supplied their own measure" : "sources supply this measure"
      } · ${period.complete ? "Closed calendar window" : "Current UTC day is partial"}`,
      landscape ? 17 : 23,
      "#b4c0d2"
    );
  svg += text(
    pad,
    foot + 48,
    overview
      ? "One relevant measure per project; units are not added together."
      : "Reported activity, not unique people. Legacy/test and coverage limits apply.",
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
