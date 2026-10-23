import { periodFor, type PortfolioReport } from "./portfolio-analytics.ts";
import { reportFormats, type ReportFormat } from "./portfolio-card.ts";
import { outcomeEvidence, type OutcomeStory } from "./connected-stories.ts";

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!
  );
const colours = { ink: "#080d19", text: "#f4f7fd", muted: "#a9b8d0", rule: "#2a3b51" };

/** A conservative measure also splits identifiers, so URLs cannot run off a card. */
function wrap(value: string, width: number, size: number): string[] {
  const limit = Math.max(1, Math.floor(width / (size * 0.61)));
  const words = value
    .trim()
    .split(/\s+/)
    .flatMap((word) => {
      const chunks: string[] = [];
      for (let i = 0; i < word.length; i += limit) chunks.push(word.slice(i, i + limit));
      return chunks;
    });
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > limit) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * An authored export of a product outcome, using only the selected snapshot.
 * Daily values retain null gaps and a zero baseline; no decorative trace is drawn.
 */
export function outcomeCard(
  report: PortfolioReport,
  story: OutcomeStory,
  format: ReportFormat,
  origin: string,
  artworkDataUri?: string
): string {
  const { width: w, height: h } = reportFormats[format];
  const landscape = format === "landscape";
  const portrait = format === "portrait";
  const pad = landscape ? 52 : 64;
  const body = landscape ? 18 : portrait ? 28 : 25;
  const period =
    report.period ??
    report.projects.find((row) => row.report)?.report?.period ??
    periodFor(report.days, Date.parse(report.createdAt));
  const evidence = outcomeEvidence(report, story, period);
  const colour = /^#[0-9a-f]{6}$/i.test(story.colour) ? story.colour : "#79d8ff";
  const retrieval = new URL("/connections/", origin);
  retrieval.searchParams.set("story", story.key);
  retrieval.searchParams.set("report", report.id);
  const text = (
    x: number,
    y: number,
    value: string,
    size: number,
    fill = colours.text,
    weight = 400,
    anchor = "start"
  ) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${escape(value)}</text>`;
  // Every block has its own vertical budget. Fit by reflowing, rather than
  // truncating a definition or allowing it to overlap the next claim.
  const block = (
    value: string,
    x: number,
    y: number,
    width: number,
    height: number,
    preferred = body,
    fill = colours.muted,
    weight = 400
  ) => {
    let size = preferred;
    let lines = wrap(value, width, size);
    while (lines.length * size * 1.3 > height && size > 1) {
      size -= 0.5;
      lines = wrap(value, width, size);
    }
    return lines
      .map((line, index) => text(x, y + size + index * size * 1.3, line, size, fill, weight))
      .join("");
  };
  const rule = (y: number) => `<path d="M${pad} ${y}H${w - pad}" stroke="${colours.rule}"/>`;
  const chart = (x: number, y: number, width: number, height: number) => {
    const available = evidence.daily.filter((point) => point.value !== null);
    const max = Math.max(1, ...available.map((point) => point.value!));
    const plotX = x + 42;
    const plotW = width - 50;
    const baseline = y + height - 40;
    const plotY = y + 48;
    const plotH = baseline - plotY;
    let out = block(
      story.key === "music" ? "Daily audible seconds" : "Daily completed inspections",
      x,
      y,
      width,
      38,
      landscape ? 18 : body,
      colours.text,
      500
    );
    out += text(plotX, baseline + 30, period.from, landscape ? 14 : 20, colours.muted);
    out += text(
      plotX + plotW,
      baseline + 30,
      period.to,
      landscape ? 14 : 20,
      colours.muted,
      400,
      "end"
    );
    if (!available.length) {
      return (
        out + block("Daily measurements unavailable", plotX, plotY + plotH / 3, plotW, 75, body)
      );
    }
    out += `<path d="M${plotX} ${baseline}H${plotX + plotW}" stroke="${colours.rule}"/>`;
    out += text(plotX - 10, baseline + 5, "0", landscape ? 14 : 20, colours.muted, 400, "end");
    out += text(
      plotX - 10,
      plotY + 5,
      max.toLocaleString("en-AU", { maximumFractionDigits: 1 }),
      landscape ? 14 : 20,
      colours.muted,
      400,
      "end"
    );
    out += `<path d="M${plotX} ${plotY}H${plotX + plotW}" stroke="${colours.rule}" stroke-dasharray="3 6"/>`;
    const slot = plotW / Math.max(1, evidence.daily.length);
    const barWidth = Math.max(1, slot * 0.68);
    evidence.daily.forEach((point, index) => {
      if (point.value === null) return;
      const xx = plotX + index * slot + (slot - barWidth) / 2;
      const barHeight = (Math.max(0, point.value) / max) * plotH;
      // A zero is a mark on the baseline, never a positive-height bar.
      out +=
        point.value === 0
          ? `<path data-day="${escape(point.date)}" data-value="0" d="M${xx.toFixed(2)} ${baseline}h${barWidth.toFixed(2)}" stroke="${colour}" stroke-width="3"/>`
          : `<rect data-day="${escape(point.date)}" data-value="${point.value}" x="${xx.toFixed(2)}" y="${(baseline - barHeight).toFixed(2)}" width="${barWidth.toFixed(2)}" height="${barHeight.toFixed(2)}" fill="${colour}"/>`;
    });
    return out;
  };
  const periodLabel = `${period.from} — ${period.to} · UTC · ${period.days} ${period.days === 1 ? "day" : "days"}`;
  const windowLabel = period.complete ? "Closed calendar window" : "Current UTC day is partial";
  const capture = `Snapshot ${report.id} · captured ${report.createdAt.slice(0, 19).replace("T", " ")} UTC`;
  const provenance = evidence.source?.revision
    ? `Source revision ${evidence.source.revision}`
    : "Source revision not supplied";
  const observedDays = evidence.daily.filter((point) => point.value !== null).length;
  const quality = `${evidence.coverage} · ${observedDays}/${period.days} days reported`;
  const fullBoundary = [story.boundary, ...evidence.limitations]
    .filter((item, index, all) => item && all.indexOf(item) === index)
    .join(" ");
  const boundary = story.boundary;
  const artwork =
    artworkDataUri && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(artworkDataUri)
      ? artworkDataUri
      : null;
  const artworkWidth = landscape ? 130 : 160;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="outcome-title outcome-description"><title id="outcome-title">${escape(`${story.name}: ${story.title}`)}</title><desc id="outcome-description">${escape(`${evidence.display} ${story.label}. ${periodLabel}. ${quality}. ${evidence.definition} ${fullBoundary}`)}</desc><rect width="${w}" height="${h}" fill="${colours.ink}"/><rect width="8" height="${h}" fill="${colour}"/><g font-family="Bricolage Grotesque, sans-serif">`;
  svg += text(pad, landscape ? 48 : 66, "WOODHOUSE", landscape ? 21 : 25, "#e9ff49", 700);
  svg += text(
    w - pad - (artwork ? artworkWidth + 28 : 0),
    landscape ? 48 : 66,
    story.key === "music" ? "MUSIC HEARD" : "INSPECTION COMPLETED",
    landscape ? 15 : 19,
    colour,
    600,
    "end"
  );
  if (artwork)
    svg += `<image href="${escape(artwork)}" x="${w - pad - artworkWidth}" y="${landscape ? 2 : 10}" width="${artworkWidth}" height="${landscape ? 68 : 84}" preserveAspectRatio="xMidYMid meet"><title>${escape(story.name)} published artwork</title></image>`;
  svg += rule(landscape ? 72 : 98);
  if (landscape) {
    svg += block(story.name, pad, 94, 480, 38, 24, colour, 600);
    svg += block(story.title, pad, 143, 490, 112, 46, colours.text, 700);
    svg += block(evidence.display, pad, 267, 470, 91, 78, colour, 700);
    svg += block(story.label, pad, 366, 490, 32, 22, colours.text, 500);
    svg += block(quality, pad, 408, 490, 58, 18);
    svg += chart(600, 96, w - pad - 600, 242);
    svg += block(evidence.definition, 600, 352, w - pad - 600, 80, 18);
    svg += block(periodLabel, 600, 440, w - pad - 600, 28, 17);
    svg += rule(484);
    svg += block(boundary, pad, 496, w - pad * 2, 50, 18);
    svg += block(`${capture} · ${windowLabel} · ${provenance}`, pad, 551, w - pad * 2, 25, 13);
    svg += block(retrieval.href, pad, 589, w - pad * 2, 24, 15, colours.text);
  } else {
    const wide = w - pad * 2;
    svg += block(story.name, pad, portrait ? 140 : 128, wide, 50, portrait ? 36 : 30, colour, 600);
    svg += block(
      story.title,
      pad,
      portrait ? 212 : 193,
      wide,
      portrait ? 198 : 138,
      portrait ? 84 : 66,
      colours.text,
      700
    );
    svg += block(
      story.benefit,
      pad,
      portrait ? 432 : 330,
      wide,
      portrait ? 112 : 78,
      portrait ? 34 : 27,
      colours.muted
    );
    svg += block(
      evidence.display,
      pad,
      portrait ? 575 : 410,
      wide,
      portrait ? 180 : 130,
      portrait ? 156 : 116,
      colour,
      700
    );
    svg += block(
      story.label,
      pad,
      portrait ? 778 : 540,
      wide,
      48,
      portrait ? 37 : 30,
      colours.text,
      500
    );
    svg += block(quality, pad, portrait ? 846 : 595, wide, portrait ? 88 : 65, body);
    svg += block(periodLabel, pad, portrait ? 949 : 650, wide, 44, portrait ? 28 : 22);
    svg += chart(pad, portrait ? 1030 : 710, wide, portrait ? 365 : 200);
    svg += block(
      evidence.definition,
      pad,
      portrait ? 1423 : 930,
      wide,
      portrait ? 125 : 70,
      portrait ? 28 : 21
    );
    svg += rule(portrait ? 1575 : 1015);
    svg += block(
      boundary,
      pad,
      portrait ? 1597 : 1033,
      wide,
      portrait ? 123 : 80,
      portrait ? 24 : 21
    );
    svg += block(
      `${capture} · ${windowLabel}`,
      pad,
      portrait ? 1751 : 1125,
      wide,
      portrait ? 48 : 28,
      portrait ? 20 : 13
    );
    svg += block(
      provenance,
      pad,
      portrait ? 1813 : 1155,
      wide,
      portrait ? 34 : 20,
      portrait ? 18 : 14
    );
    svg += block(
      retrieval.href,
      pad,
      portrait ? 1861 : 1180,
      wide,
      portrait ? 43 : 20,
      portrait ? 20 : 15,
      colours.text
    );
  }
  return svg + "</g></svg>";
}
