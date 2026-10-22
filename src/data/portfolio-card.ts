import {
  formatMetric,
  periodFor,
  type AnalyticsProject,
  type PortfolioReport
} from "./portfolio-analytics.ts";
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
import { discoveryStory, type DiscoveryStory } from "./analytics-story.ts";
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
const day = (date: string) => {
  const parsed = new Date(date + "T00:00:00Z");
  return `${parsed.getUTCDate()} ${parsed.toLocaleDateString("en-AU", {
    timeZone: "UTC",
    month: "short"
  })}`;
};
const longDay = (date: string) => `${day(date)} ${date.slice(0, 4)}`;
/** Break a product name into readable lines without clipping it. */
function wrap(value: string, max: number): string[] {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
/** The same authored layouts share frozen series and coverage, never illustrative chart traces. */
export function reportSvg(
  report: PortfolioReport,
  names: Map<string, string>,
  format: ReportFormat = "landscape",
  requestedMeasure?: string,
  origin = "https://woodhouse.loftwah.com",
  highlightedWeek?: string,
  destination?: string
) {
  const { width: w, height: h } = reportFormats[format];
  const landscape = format === "landscape",
    portrait = format === "portrait",
    pad = landscape ? 56 : 64;
  const period =
    report.period ??
    report.projects.find((p) => p.report)?.report?.period ??
    periodFor(report.days, Date.parse(report.createdAt));
  const measure = resolveMeasure(
    report.projects.length === 1 ? report.projects[0]!.project : null,
    requestedMeasure
  );
  const overview = isOverviewMeasure(measure);
  // A destination story is a distinct authored export of the same frozen report.
  // It is only meaningful for the discovery scope, so an unrelated measure keeps
  // its ordinary composition rather than borrowing a different story.
  if (destination && (overview || measure.key === "project_opens")) {
    const story = discoveryStory({
      report,
      slug: destination as AnalyticsProject,
      name: names.get(destination) ?? destination,
      period,
      published: new Set(names.keys()),
      ...(projectColours[destination] ? { colour: projectColours[destination] } : {})
    });
    return discoveryCard(report, story, format, origin, w, h, pad);
  }
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
  // A single-measure, single-source report names the project, not the measure as
  // its headline. The measure stays directly below the figure.
  const single = !overview && shown.length === 1;
  const title =
    report.projects.length === 1 ? rows[0]!.name : single ? shown[0]!.name : measure.label;
  const titleSize = landscape ? (single ? 54 : 42) : single ? 68 : 58;
  svg += text(pad, landscape ? 123 : 148, title, titleSize, "#f4f7fd", 700);
  svg += text(
    pad,
    focus ? (landscape ? 140 : 172) : landscape ? 157 : 191,
    `${longDay(period.from)} — ${longDay(period.to)} · UTC · ${period.days} ${period.days === 1 ? "day" : "days"}`,
    landscape ? 20 : 25,
    "#a9b8d0"
  );
  if (focus) {
    const movement =
      focus.changePercent === null
        ? `no prior baseline (${formatMetric({ value: focus.previous, unit: focus.unit })} the week before)`
        : `${focus.changePercent > 0 ? "up" : focus.changePercent < 0 ? "down" : "level"} ${Math.abs(focus.changePercent)}% from ${formatMetric({ value: focus.previous, unit: focus.unit })}`;
    const focusLine = `Week in focus · ${longDay(focus.from)} — ${longDay(focus.to)} · ${focus.name} · ${formatMetric({ value: focus.value, unit: focus.unit })} ${focus.measure.label.toLowerCase()} · ${movement}${focus.newBest ? ` · new best of ${focus.comparedWeeks} weeks` : ""}`;
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
    chartH = landscape ? 217 : portrait ? 620 : 430;
  if ((report.projects.length === 1 || single) && !landscape && !focus)
    svg += text(pad, 237, measure.label, 28, "#79d8ff", 500);
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
    } else if (single) {
      // The single-measure export earns the full width: the figure and its
      // qualifier stay on the left, the chart owns the right. The old layout
      // left most of the canvas empty under one row.
      const r = shown[0]!;
      const figureY = 300;
      svg +=
        `<circle cx="${pad + 6}" cy="${figureY - 74}" r="6" fill="${r.colour}"/>` +
        text(pad + 20, figureY - 68, measure.label, 22, "#a9b8d0", 500) +
        text(pad, figureY, r.metric ? formatMetric(r.metric) : "—", 96, r.colour, 700) +
        text(pad, figureY + 34, qualifier(r), 19, "#f4f7fd") +
        text(
          pad,
          figureY + 66,
          `${period.complete ? "Closed calendar window" : "Current UTC day is partial"} · ${period.days} days`,
          17,
          "#a9b8d0"
        );
      const plot = svgPlot(series, period, 560, 280)
        .replace("<svg ", `<svg x="${w - pad - 560}" y="238" width="560" height="280" `)
        .replace('font-family="system-ui,sans-serif"', 'font-family="Bricolage Grotesque"')
        .replace('font-size="12"', 'font-size="16"');
      svg += plot;
      if (!series.some((s) => s.values.some((v) => v !== null)))
        svg += text(w - pad - 490, 390, "Daily measurements unavailable", 25, "#a9b8d0");
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
  if (!landscape && single) {
    // A single-source export keeps a real chart in every format. The landscape
    // composition puts it beside the figure; square and portrait give it the
    // full width and keep the source detail underneath.
    const singleChartY = portrait ? 320 : 285;
    const singleChartH = portrait ? 560 : 380;
    const plot = svgPlot(series, period, w - pad * 2, singleChartH)
      .replace(
        "<svg ",
        `<svg x="${pad}" y="${singleChartY}" width="${w - pad * 2}" height="${singleChartH}" `
      )
      .replace('font-family="system-ui,sans-serif"', 'font-family="Bricolage Grotesque"')
      .replace('font-size="12"', 'font-size="16"');
    svg += plot;
    if (!series.some((s) => s.values.some((v) => v !== null)))
      svg += text(
        pad + 70,
        singleChartY + singleChartH / 2,
        "Daily measurements unavailable",
        32,
        "#a9b8d0"
      );
    const r = shown[0]!;
    const y = singleChartY + singleChartH + 40;
    svg +=
      line(y) +
      `<circle cx="${pad + 5}" cy="${y + 27}" r="5" fill="${r.colour}"/>` +
      text(pad + 22, y + 32, r.name, 24, "#f4f7fd", 500) +
      text(portrait ? 520 : 500, y + 32, qualifier(r), 17, "#a9b8d0") +
      text(w - pad - 190, y + 32, r.metric ? formatMetric(r.metric) : "—", 27, r.colour, 700);
  }
  if (!overview && !single) {
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
  if (!landscape && !single) {
    const top = overview
        ? portrait
          ? 340
          : 300
        : single
          ? chartY + chartH + (portrait ? 95 : 70)
          : chartY + chartH + (portrait ? 85 : 60),
      rowH = overview ? (portrait ? 190 : 95) : portrait ? 112 : 49;
    if (!overview && !single)
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

/**
 * A destination story, composed for its actual canvas rather than stretched from
 * one generic template. Landscape is a two-column argument; square is a feed
 * poster; portrait is a short visual essay. Every number comes from the frozen
 * report and every missing day stays a gap.
 */
function discoveryCard(
  report: PortfolioReport,
  story: DiscoveryStory,
  format: ReportFormat,
  origin: string,
  w: number,
  h: number,
  pad: number
) {
  const landscape = format === "landscape",
    portrait = format === "portrait";
  const retrieval = new URL("/activity/", origin);
  retrieval.searchParams.set("report", report.id);
  retrieval.searchParams.set("measure", "project_opens");
  retrieval.searchParams.set("destination", story.slug);
  const retrievalLabel = retrieval.href.replace(/^https?:\/\//, "");
  const retrievalRows = (() => {
    const [head = "", ...rest] = retrievalLabel.split("&");
    return rest.length ? [head, `&${rest.join("&")}`] : [head];
  })();
  const text = (
    x: number,
    y: number,
    v: string,
    size = 24,
    fill = "#f4f7fd",
    weight = 400,
    anchor?: "end" | "middle"
  ) =>
    `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}"${anchor ? ` text-anchor="${anchor}"` : ""}>${escape(v)}</text>`;
  const rule = (y: number, x = pad, width = w - pad * 2, colour = "#2a3b51") =>
    `<path d="M${x} ${y}H${x + width}" stroke="${colour}"/>`;
  const market = `${story.period.complete ? "closed calendar window" : "current UTC day partial"}`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${story.colour}" stop-opacity="0.22"/><stop offset="1" stop-color="${story.colour}" stop-opacity="0"/></radialGradient></defs><rect width="${w}" height="${h}" fill="#080d19"/><rect x="0" y="0" width="8" height="${h}" fill="${story.colour}"/><g font-family="Bricolage Grotesque">`;
  const header = (y: number, size: number) =>
    text(pad, y, "WOODHOUSE", size, "#e9ff49", 700) +
    text(w - pad, y, "DISCOVERY STORY", size * 0.72, "#a9b8d0", 500, "end");
  const nameLines = wrap(story.name, landscape ? 14 : portrait ? 13 : 18);
  const nameSize = landscape ? 64 : portrait ? 88 : 72;
  const lineHeight = nameSize * 1.02;
  const figureSize = landscape ? 150 : portrait ? 250 : 190;
  const empty = story.value === null;
  const figure = empty ? "No data" : story.valueLabel;
  const figureFont = empty ? (landscape ? 64 : portrait ? 96 : 80) : figureSize;
  const metaSize = landscape ? 20 : portrait ? 28 : 26;
  // --- shared chart: bars, not an invented trend line. Missing days have no bar.
  const chart = (x: number, y: number, width: number, height: number) => {
    const points = story.daily;
    const values = points.filter((point) => point.value !== null) as {
      date: string;
      value: number;
    }[];
    const max = Math.max(1, ...values.map((point) => point.value));
    const slot = width / Math.max(1, points.length);
    const bar = Math.max(2, slot * 0.66);
    const axisY = y + height + (landscape ? 26 : 34);
    let out = text(x, y - 26, "Daily recorded clicks", landscape ? 17 : 22, "#a9b8d0", 500);
    out += rule(y + height, x, width);
    out += text(x, axisY, longDay(story.period.from), landscape ? 15 : 19, "#a9b8d0");
    out += text(
      x + width,
      axisY,
      longDay(story.period.to),
      landscape ? 15 : 19,
      "#a9b8d0",
      400,
      "end"
    );
    if (!values.length) {
      out += text(
        x + 8,
        y + height / 2,
        story.reason.startsWith("Woodhouse did not supply")
          ? "No Woodhouse discovery report for these dates"
          : `No retained clicks for ${story.name} in these dates`,
        landscape ? 20 : 26,
        "#a9b8d0"
      );
      return out;
    }
    // Restrained grid lines keep small counts readable without implying a
    // precise scale. The label is placed on the value it names, so a half line
    // never claims a rounded number that its bars do not sit on.
    for (const fraction of max > 2 ? [0.5, 1] : [1]) {
      const tick = max * fraction;
      const yy = y + height - (tick / max) * height;
      out += `<path d="M${x} ${yy}H${x + width}" stroke="#1b293d"/>`;
      out += text(
        x - 10,
        yy + 5,
        Number.isInteger(tick) ? String(tick) : tick.toFixed(1),
        landscape ? 13 : 16,
        "#7f8ea8"
      );
    }
    out += text(x - 10, y + height + 5, "0", landscape ? 13 : 16, "#7f8ea8", 400, "end");
    points.forEach((point, index) => {
      if (point.value === null) return;
      const barHeight = point.value === 0 ? 4 : Math.max(4, (point.value / max) * height);
      out += `<rect x="${(x + index * slot + (slot - bar) / 2).toFixed(1)}" y="${(y + height - barHeight).toFixed(1)}" width="${bar.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="1" fill="${story.colour}"/>`;
    });
    if (story.firstObserved) {
      const index = points.findIndex((point) => point.date === story.firstObserved);
      if (index > 0) {
        const xx = x + index * slot;
        const marker = `collection began ${day(story.firstObserved)}`;
        const markerSize = landscape ? 14 : 17;
        const markerWidth = marker.length * markerSize * 0.56;
        out += `<path d="M${xx} ${y - 2}V${y + height}" stroke="#e9ff49" stroke-dasharray="4 5" opacity="0.55"/>`;
        out += text(
          xx + markerWidth + 20 > x + width ? xx - 8 : xx + 8,
          y - 8,
          marker,
          markerSize,
          "#e9ff49",
          400,
          xx + markerWidth + 20 > x + width ? "end" : undefined
        );
        // The gap note is only drawn when the pre-collection area can hold it
        // without crossing the first bar or the mid gridline.
        if (index > 12)
          out += text(
            x + 8,
            y + height / 2,
            `No counter retained before ${day(story.firstObserved)}`,
            landscape ? 14 : 18,
            "#6f7f99"
          );
      }
    }
    return out;
  };
  const recentLines = (() => {
    if (story.value === null) return ["No comparison available"];
    const recent = `Most recent seven days ${story.recent.value?.toLocaleString("en-AU") ?? "—"}`;
    if (story.comparison.eligible && story.comparison.change !== null) {
      const direction =
        story.comparison.change === 0
          ? "level with the week before"
          : `${Math.abs(story.comparison.change).toLocaleString("en-AU")} ${story.comparison.change > 0 ? "more" : "fewer"} than the week before`;
      return [recent, direction];
    }
    return [
      recent,
      `Earlier seven days not comparable · ${story.prior.observedDays} of 7 observed`
    ];
  })();
  const signal = story.kicker
    .replace("Discovery · ", "")
    .replace("busiest", "Busiest")
    .replace("joint", "Joint");
  const boundary =
    "A recorded click is discovery intent on Woodhouse. It is not downstream play, adoption or a unique person.";
  if (landscape) {
    svg += header(58, 22);
    svg += rule(86, pad, w - pad * 2, "#e9ff49");
    svg += text(pad, 126, `FROM WOODHOUSE · ${signal.toUpperCase()}`, 15, "#a9b8d0", 600);
    let y = 126;
    for (const line of nameLines) {
      y += lineHeight;
      svg += text(pad, y, line, nameSize, story.colour, 700);
    }
    const figureY = y + (nameLines.length > 1 ? 90 : 150);
    svg += `<circle cx="${pad + 250}" cy="${figureY - figureSize / 2.6}" r="210" fill="url(#glow)"/>`;
    svg += text(pad, figureY, figure, figureFont, "#f4f7fd", 700);
    if (!empty) svg += text(pad, figureY + 40, "recorded project opens", 24, "#f4f7fd", 500);
    svg += text(
      pad,
      figureY + 74,
      `${longDay(story.period.from)} — ${longDay(story.period.to)} · UTC · ${story.period.days} days`,
      metaSize,
      "#a9b8d0"
    );
    svg += text(
      pad,
      figureY + 104,
      story.coverageLabel,
      17,
      story.coverage === "partial" ? "#e9ff49" : "#a9b8d0",
      500
    );
    const chartX = 640,
      chartY = 176,
      chartW = w - pad - chartX,
      chartH = 250;
    svg += chart(chartX, chartY, chartW, chartH);
    recentLines.forEach((value, index) => {
      svg += text(
        chartX,
        474 + index * 24,
        value,
        17,
        index === 0 ? "#f4f7fd" : "#a9b8d0",
        index === 0 ? 500 : 400
      );
    });
    svg += rule(516);
    svg += text(pad, 542, boundary, 15, "#a9b8d0");
    svg += text(
      pad,
      572,
      `Snapshot ${report.id} · captured ${report.createdAt.slice(0, 10)} · ${market}`,
      14,
      "#7f8ea8"
    );
    svg += text(
      w - pad,
      596,
      retrievalLabel,
      Math.min(13, 760 / (retrievalLabel.length * 0.56)),
      "#a9b8d0",
      400,
      "end"
    );
  } else if (portrait) {
    svg += header(70, 26);
    svg += rule(104, pad, w - pad * 2, "#e9ff49");
    svg += text(pad, 156, `FROM WOODHOUSE · ${signal.toUpperCase()}`, 19, "#a9b8d0", 600);
    let y = 156;
    for (const line of nameLines) {
      y += lineHeight;
      svg += text(pad, y, line, nameSize, story.colour, 700);
    }
    svg += `<circle cx="${w - 160}" cy="${y - 60}" r="300" fill="url(#glow)"/>`;
    const figureY = y + (nameLines.length > 1 ? 150 : 230);
    svg += text(pad, figureY, figure, figureFont, "#f4f7fd", 700);
    if (!empty) svg += text(pad, figureY + 58, "recorded project opens", 34, "#f4f7fd", 500);
    svg += text(
      pad,
      figureY + 106,
      `${longDay(story.period.from)} — ${longDay(story.period.to)}`,
      30,
      "#a9b8d0"
    );
    svg += text(pad, figureY + 146, `UTC · ${story.period.days} days · ${market}`, 26, "#a9b8d0");
    svg += text(
      pad,
      figureY + 188,
      story.coverageLabel,
      26,
      story.coverage === "partial" ? "#e9ff49" : "#a9b8d0",
      500
    );
    wrap(story.headline, 44).forEach((line, index) => {
      svg += text(pad, 740 + index * 42, line, 30, "#f4f7fd", 500);
    });
    svg += chart(pad + 20, 880, w - pad * 2 - 40, 340);
    recentLines.forEach((value, index) => {
      svg += text(
        pad,
        1330 + index * 40,
        value,
        26,
        index === 0 ? "#f4f7fd" : "#a9b8d0",
        index === 0 ? 500 : 400
      );
    });
    svg += rule(1380);
    // The boundary wraps to a readable measure rather than one long line.
    const words = boundary.split(" ");
    let line = "",
      ly = 1428;
    for (const word of words) {
      if ((line + " " + word).trim().length > 54) {
        svg += text(pad, ly, line, 24, "#a9b8d0");
        line = word;
        ly += 36;
      } else line = (line + " " + word).trim();
    }
    if (line) svg += text(pad, ly, line, 24, "#a9b8d0");
    svg += text(pad, 1560, `Snapshot ${report.id}`, 19, "#7f8ea8");
    retrievalRows.forEach((value, index) => {
      svg += text(pad, 1594 + index * 30, value, 18, "#a9b8d0");
    });
  } else {
    svg += header(76, 26);
    svg += rule(112, pad, w - pad * 2, "#e9ff49");
    svg += text(pad, 168, `FROM WOODHOUSE · ${signal.toUpperCase()}`, 19, "#a9b8d0", 600);
    let y = 168;
    for (const line of nameLines) {
      y += lineHeight;
      svg += text(pad, y, line, nameSize, story.colour, 700);
    }
    svg += `<circle cx="${w - 200}" cy="${y - 40}" r="280" fill="url(#glow)"/>`;
    const figureY = y + (nameLines.length > 1 ? 110 : 170);
    svg += text(pad, figureY, figure, figureFont, "#f4f7fd", 700);
    if (!empty) svg += text(pad, figureY + 50, "recorded project opens", 30, "#f4f7fd", 500);
    svg += text(
      pad,
      figureY + 92,
      `${longDay(story.period.from)} — ${longDay(story.period.to)} · UTC`,
      26,
      "#a9b8d0"
    );
    svg += text(
      pad,
      figureY + 130,
      `${story.period.days} days · ${story.coverageLabel}`,
      22,
      story.coverage === "partial" ? "#e9ff49" : "#a9b8d0",
      500
    );
    if (story.value === 0)
      svg += text(pad, figureY + 162, "No recorded clicks in the observed days", 18, "#a9b8d0");
    svg += chart(pad + 10, 630, w - pad * 2 - 20, 260);
    recentLines.forEach((value, index) => {
      svg += text(
        pad,
        960 + index * 32,
        value,
        23,
        index === 0 ? "#f4f7fd" : "#a9b8d0",
        index === 0 ? 500 : 400
      );
    });
    svg += rule(1024);
    svg += text(pad, 1060, boundary.split(". ")[0] + ".", 20, "#a9b8d0");
    svg += text(
      pad,
      1088,
      "Not a unique person or evidence that the destination was used.",
      20,
      "#a9b8d0"
    );
    svg += text(pad, 1118, `Snapshot ${report.id}`, 14, "#7f8ea8");
    svg += text(w - pad, 1148, retrievalLabel, 13, "#a9b8d0", 400, "end");
  }
  return svg + "</g></svg>";
}
