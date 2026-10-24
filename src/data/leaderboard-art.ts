import {
  rankedProjects,
  rankingMeasures,
  leaderboardCaption,
  type LeaderboardSnapshot,
  type RankingMeasure
} from "./github-leaderboards.ts";
export const leaderboardFormats = {
  landscape: [1200, 630],
  square: [1080, 1080],
  portrait: [1080, 1350]
} as const;
export type LeaderboardFormat = keyof typeof leaderboardFormats;
const esc = (s: unknown) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!
  );
const number = (n: number | null) => (n === null ? "—" : n.toLocaleString("en-AU"));
export function leaderboardSvg(
  snapshot: LeaderboardSnapshot,
  days: number,
  key: RankingMeasure,
  format: LeaderboardFormat,
  project?: string
) {
  const [w, h] = leaderboardFormats[format];
  const wide = format === "landscape";
  const ranked = rankedProjects(snapshot, days, key);
  const label = rankingMeasures.find((m) => m.key === key)!.label;
  const selected = project ? ranked.rows.find((r) => r.slug === project) : null;
  const rows = ranked.rows;
  const text = (x: number, y: number, size: number, value: unknown, fill = "#f4f7fd", extra = "") =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${esc(value)}</text>`;
  const rule = (x: number, y: number, width: number) =>
    `<path d="M${x} ${y}h${width}" stroke="#344158"/>`;
  let content = text(
    48,
    wide ? 92 : 108,
    wide ? 64 : 78,
    selected ? selected.name : "Projects making moves",
    selected?.colour ?? "#f4f7fd",
    'font-weight="700" letter-spacing="-2"'
  );
  content += text(50, wide ? 141 : 166, 26, label, "#e9ff49", 'font-weight="700"');
  content += text(
    50,
    wide ? 178 : 209,
    22,
    `${ranked.from} — ${ranked.to} UTC · ${days} days`,
    "#b4c0d2"
  );
  if (selected) {
    const scoreY = wide ? 372 : format === "square" ? 470 : 520;
    content += text(
      45,
      scoreY,
      wide ? 182 : 236,
      number(selected.value),
      selected.colour,
      'font-weight="700" letter-spacing="-8"'
    );
    content += text(
      w - 54,
      wide ? 275 : 315,
      28,
      selected.rank === null
        ? "History unavailable"
        : `#${selected.rank}${selected.tied ? " · tied" : ""} of ${rows.filter((r) => r.rank !== null).length}`,
      "#f4f7fd",
      'text-anchor="end"'
    );
    content += text(
      52,
      scoreY + 48,
      24,
      selected.previous === null
        ? "Earlier period unavailable"
        : `${number(selected.previous)} in the previous ${days} days`,
      "#b4c0d2"
    );
    const daily = selected.counts.daily.filter((d) => d.day >= ranked.from && d.day <= ranked.to);
    const values = daily.map((d) =>
      key === "reduction" ? d.closed - d.opened - d.reopened : d[key]
    );
    const max = Math.max(1, ...values.map(Math.abs));
    const chartY = wide ? 470 : format === "square" ? 630 : 760,
      chartH = wide ? 54 : format === "square" ? 260 : 420,
      chartW = w - 104;
    content += text(52, chartY - 12, 20, "Daily changes", "#b4c0d2");
    if (selected.value !== null)
      content += text(
        w - 52,
        chartY - 12,
        18,
        key === "reduction" ? `Daily scale ±${max}` : `Peak ${max}`,
        "#b4c0d2",
        'text-anchor="end"'
      );
    const baseline = chartY + chartH * (key === "reduction" ? 0.5 : 0.85);
    content += rule(52, baseline, chartW);
    values.forEach((v, i) => {
      const bh = Math.max(
        v === 0 ? 2 : 3,
        (Math.abs(v) / max) * chartH * (key === "reduction" ? 0.42 : 0.75)
      );
      const bw = chartW / values.length;
      content += `<rect x="${52 + i * bw}" y="${v >= 0 ? baseline - bh : baseline}" width="${Math.max(1, bw - 3)}" height="${bh}" fill="${selected.value === null ? "#344158" : v < 0 ? "#ff746a" : selected.colour}"/>`;
    });
    if (!wide) {
      const short = (day: string) =>
        new Date(day + "T00:00:00Z").toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
          timeZone: "UTC"
        });
      content += text(52, chartY + chartH + 30, 18, short(ranked.from), "#b4c0d2");
      content += text(
        w - 52,
        chartY + chartH + 30,
        18,
        short(ranked.to),
        "#b4c0d2",
        'text-anchor="end"'
      );
    }
  } else {
    const max = Math.max(1, ...rows.map((r) => Math.abs(r.value ?? 0)));
    const rowH = wide ? 77 : format === "square" ? 83 : 109;
    const start = wide ? 236 : format === "square" ? 290 : 330;
    rows.forEach((r, i) => {
      const col = wide && i >= 4 ? 1 : 0;
      const x = 50 + col * 560;
      const y = start + (wide ? i % 4 : i) * rowH;
      const width = wide ? 500 : 980;
      content += text(
        x,
        y,
        wide ? 28 : 32,
        r.rank === null ? "—" : String(r.rank).padStart(2, "0"),
        r.colour,
        'font-weight="700"'
      );
      content += text(x + 60, y, wide ? 27 : 34, r.name, "#f4f7fd", 'font-weight="700"');
      content += text(
        x + width,
        y,
        wide ? 37 : 46,
        number(r.value),
        r.colour,
        'font-weight="700" text-anchor="end"'
      );
      const movement =
        r.value === null
          ? "History unavailable"
          : r.movement === null
            ? "Earlier ranks unavailable"
            : r.movement === 0
              ? "Same rank"
              : `${r.movement > 0 ? "Up" : "Down"} ${Math.abs(r.movement)} ${Math.abs(r.movement) === 1 ? "place" : "places"}`;
      content += text(
        x + 60,
        y + (wide ? 24 : 29),
        wide ? 16 : 20,
        `${r.tied ? "Tied · " : ""}${movement}`,
        "#b4c0d2"
      );
      content += rule(x, y + rowH * 0.52, width);
      if (key === "reduction")
        content += `<path d="M${x + width / 2} ${y + rowH * 0.52 - 5}v10" stroke="#b4c0d2"/>`;
      if (r.value !== null) {
        const signed = key === "reduction";
        const length = signed
          ? ((r.value / max) * width) / 2
          : Math.max(2, (r.value / max) * width);
        content += `<path d="M${x + (signed ? width / 2 : 0)} ${y + rowH * 0.52}h${length}" stroke="${signed && r.value < 0 ? "#ff746a" : r.colour}" stroke-width="3"/>`;
      }
    });
  }
  content += rule(50, h - 94, w - 100);
  content += text(50, h - 57, 24, "WOODHOUSE", "#e9ff49", 'font-weight="700" letter-spacing="1"');
  content += text(
    w - 50,
    h - 57,
    wide ? 21 : 24,
    "woodhouse.loftwah.com",
    "#f4f7fd",
    'text-anchor="end"'
  );
  content += text(
    50,
    h - 25,
    wide ? 15 : 18,
    key === "reduction"
      ? "Recorded issue movement · positive = fewer open issues · negative = more"
      : "GitHub activity · counts include bots · product quality is a separate question",
    "#b4c0d2"
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>${esc(leaderboardCaption(snapshot, days, key, project))}</title><rect width="${w}" height="${h}" fill="#080d19"/><g font-family="Bricolage Grotesque">${content}</g></svg>`;
}
