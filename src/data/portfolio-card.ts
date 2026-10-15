import { formatMetric, type PortfolioReport, type Metric } from "./portfolio-analytics.ts";
export const reportFormats = {
  landscape: { width: 1200, height: 630 },
  square: { width: 1200, height: 1200 },
  portrait: { width: 1080, height: 1920 }
} as const;
export type ReportFormat = keyof typeof reportFormats;
function escape(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!
  );
}
const ink = "#080d19",
  white = "#f4f7fd",
  muted = "#b4c0d2",
  acid = "#e9ff49";
export function reportSvg(
  report: PortfolioReport,
  names: Map<string, string>,
  format: ReportFormat = "landscape"
) {
  const { width: w, height: h } = reportFormats[format];
  const portrait = format === "portrait",
    landscape = format === "landscape",
    pad = portrait ? 64 : 56;
  const single = report.projects.length === 1;
  const title = single
    ? (names.get(report.projects[0]!.project) ?? "Project activity")
    : "The Loftwah portfolio";
  const available = report.projects.filter((p) =>
    p.report?.metrics.some((m) => m.value !== null)
  ).length;
  const period = report.projects.find((p) => p.report)?.report?.period;
  const text = (x: number, y: number, value: string, size = 24, fill = white, weight = 400) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}">${escape(value)}</text>`;
  const line = (y: number) => `<path d="M${pad} ${y}H${w - pad}" stroke="#384254"/>`;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${ink}"/><g font-family="Bricolage Grotesque">`;
  svg +=
    text(pad, pad + 8, "WOODHOUSE / ACTIVITY", 22, acid, 700) +
    text(pad, pad + 78, title, portrait ? 60 : 52, white, 700);
  svg += text(
    pad,
    pad + 120,
    `${report.days} days · ${period ? `${period.from} — ${period.to}` : report.createdAt.slice(0, 10)} · UTC`,
    24,
    muted
  );
  const keys = [
    "game_starts",
    "game_completions",
    "active_seconds",
    "app_opens",
    "actions",
    "listening_seconds",
    "listening_starts",
    "visits",
    "project_opens"
  ];
  function metrics(ms: Metric[]) {
    return keys
      .flatMap((key) => ms.filter((m) => m.key === key && m.value !== null))
      .slice(0, single ? 4 : 2);
  }
  if (single) {
    const row = report.projects[0]!;
    const ms = metrics(row.report?.metrics ?? []);
    const y = landscape ? 260 : 340;
    const cellH = portrait ? 250 : landscape ? 115 : 200;
    if (!ms.length) svg += text(pad, y, "Awaiting real measurements", 40, muted);
    ms.forEach((m, i) => {
      const column = landscape ? i % 2 : portrait ? 0 : i % 2;
      const yy = y + (landscape ? Math.floor(i / 2) : portrait ? i : Math.floor(i / 2)) * cellH;
      const x = pad + (column * (w - pad * 2)) / 2;
      svg +=
        text(x, yy, formatMetric(m), portrait ? 110 : landscape ? 65 : 95, acid, 700) +
        text(
          x,
          yy + (landscape ? 35 : 50),
          `${m.label}${m.quality === "bounded" ? " · bounded" : m.quality === "sampled" ? " · estimated" : ""}`,
          landscape ? 25 : 30,
          white
        );
    });
  } else {
    const top = landscape ? 236 : portrait ? 320 : 280;
    const rowH = landscape ? 42 : portrait ? 178 : 108;
    report.projects.forEach((row, i) => {
      const y = top + i * rowH;
      const ms = metrics(row.report?.metrics ?? []);
      svg +=
        line(y - 27) +
        text(pad, y + 5, names.get(row.project) ?? row.project, landscape ? 24 : 32, white, 600);
      if (landscape) {
        svg += text(
          430,
          y + 5,
          ms
            .map(
              (m) =>
                `${formatMetric(m)} ${m.label.toLowerCase()}${m.quality === "bounded" ? " (bounded)" : m.quality === "sampled" ? " (estimated)" : ""}`
            )
            .join("   ·   ") || "Awaiting measurements",
          22,
          ms.length ? acid : muted
        );
      } else {
        svg += text(
          pad,
          y + (portrait ? 66 : 47),
          ms
            .map(
              (m) =>
                `${formatMetric(m)} ${m.label.toLowerCase()}${m.quality === "bounded" ? " (bounded)" : m.quality === "sampled" ? " (estimated)" : ""}`
            )
            .join("   ·   ") || "Awaiting measurements",
          portrait ? 30 : 26,
          ms.length ? acid : muted
        );
      }
    });
  }
  const footer = landscape ? h - 70 : h - 155;
  svg +=
    line(footer - 20) +
    text(
      pad,
      footer + 16,
      `${available}/${report.projects.length} sources reporting · Current day is partial`,
      landscape ? 20 : 26,
      muted
    ) +
    text(
      pad,
      footer + (landscape ? 45 : 58),
      "Reported activity. Coverage and definitions vary by project.",
      landscape ? 18 : 24,
      muted
    );
  if (!landscape)
    svg += text(pad, h - 32, `woodhouse.loftwah.com · ${report.createdAt.slice(0, 10)}`, 22, white);
  return svg + "</g></svg>";
}
