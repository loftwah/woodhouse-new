import { reportFormats, type ReportFormat } from "./portfolio-card.ts";
import { editionSelections, type PortfolioEdition } from "./portfolio-edition.ts";
import type { PortfolioReport } from "./portfolio-analytics.ts";
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!
  );
/** A cover is editorial selection, not a chart or a competitive podium. */
export function editionCard(
  edition: PortfolioEdition,
  report: PortfolioReport,
  format: ReportFormat,
  origin: string,
  art: ReadonlyMap<string, string>,
  publicIds: ReadonlySet<string>
) {
  if (report.id !== edition.reportId) throw Error("Edition snapshot mismatch");
  const { width: w, height: h } = reportFormats[format];
  const landscape = format === "landscape",
    portrait = format === "portrait";
  const p = 56,
    wide = w - 2 * p;
  const text = (x: number, y: number, s: string, size: number, fill = "#f4f7fd", weight = 400) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
  const image = (key: string, x: number, y: number, ww: number, hh: number) =>
    art.has(key)
      ? `<image href="${esc(art.get(key)!)}" x="${x}" y="${y}" width="${ww}" height="${hh}" preserveAspectRatio="xMidYMid slice"/>`
      : "";
  const period = report.period!;
  const titleWords = edition.title.trim().split(/\s+/);
  const titleLast = titleWords.pop() ?? "";
  const titleFirst = titleWords.join(" ");
  const fit = (s: string, size: number, width: number) =>
    Math.min(size, width / Math.max(1, s.length * 0.62));
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img"><title>${esc(edition.title)}</title><desc>${esc(edition.deck)} Observations ${period.from} to ${period.to} UTC. Partial coverage, no weekly records.</desc><rect width="${w}" height="${h}" fill="#080d19"/><g font-family="Bricolage Grotesque, sans-serif">`;
  svg +=
    text(p, 60, "WOODHOUSE", 24, "#e9ff49", 700) +
    text(
      p,
      landscape ? 165 : 205,
      titleFirst,
      fit(titleFirst, landscape ? 84 : 112, landscape ? 560 : wide),
      "#f4f7fd",
      700
    ) +
    text(
      p,
      landscape ? 260 : 330,
      titleLast,
      fit(titleLast, landscape ? 94 : 124, landscape ? 560 : wide),
      "#e9ff49",
      700
    );
  if (landscape) {
    svg += image("protocol-11", 650, 90, 235, 270) + image("shoalshot", 900, 140, 244, 220);
    svg += text(p, 325, "A table. A shot. A board. A squad.", 25);
  } else {
    const y = portrait ? 470 : 385;
    svg +=
      image("protocol-11", p, y, wide * 0.48, portrait ? 430 : 270) +
      image("shoalshot", p + wide * 0.52, y + 50, wide * 0.48, portrait ? 430 : 270);
    svg += text(
      p,
      portrait ? 1010 : 760,
      `${editionSelections(report, publicIds).filter((s) => ["protocol-11", "shoalshot", "bubbles", "fighter"].includes(s.story.key)).length} different invitations to play.`,
      portrait ? 38 : 36
    );
  }
  const y = landscape ? 405 : portrait ? 1130 : 835,
    step = landscape ? 30 : portrait ? 55 : 42;
  editionSelections(report, publicIds)
    .filter((s) => ["protocol-11", "shoalshot", "bubbles", "fighter"].includes(s.story.key))
    .forEach(({ story, evidence }, i) => {
      svg += text(
        p,
        y + i * step,
        `${story.name}: ${evidence.display} · ${story.label}`,
        landscape ? 19 : portrait ? 29 : 24,
        story.colour
      );
    });
  const foot = landscape ? 535 : portrait ? 1510 : 1040;
  svg += text(
    p,
    foot,
    `${period.from}–${period.to} UTC · partial source coverage`,
    landscape ? 19 : portrait ? 29 : 24
  );
  svg += text(
    p,
    foot + (portrait ? 54 : 25),
    "No ranking, unique people or weekly record. Early history may include verification.",
    landscape ? 17 : portrait ? 25 : 21
  );
  svg += text(
    p,
    foot + (portrait ? 108 : 50),
    `Edited ${edition.reviewDate} · snapshot ${report.id}`,
    landscape ? 16 : portrait ? 24 : 20,
    "#a9b8d0"
  );
  const url = new URL("/editions/one-more-round/", origin).href;
  const urlSize = landscape ? 18 : portrait ? 27 : 23;
  const urlLimit = Math.floor(wide / (urlSize * 0.62));
  const urlLines = Array.from({ length: Math.ceil(url.length / urlLimit) }, (_, i) =>
    url.slice(i * urlLimit, (i + 1) * urlLimit)
  );
  const urlY = landscape ? 612 : portrait ? 1800 : 1145;
  urlLines.forEach((line, i) => {
    svg += text(p, urlY + i * urlSize * 1.3, line, urlSize);
  });
  return svg + "</g></svg>";
}
