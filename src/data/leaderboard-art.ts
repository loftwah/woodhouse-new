import {
  rankedProjects,
  rankingMeasures,
  leaderboardCaption,
  leaderboardDateRange,
  leaderboardShortDate,
  leaderboardProjects,
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
  project?: string,
  edition: 1 | 2 | 3 = 1
) {
  return edition === 3
    ? leaderboardSvgV3(snapshot, days, key, format, project)
    : leaderboardSvgLegacy(snapshot, days, key, format, project, edition);
}
function leaderboardSvgLegacy(
  snapshot: LeaderboardSnapshot,
  days: number,
  key: RankingMeasure,
  format: LeaderboardFormat,
  project?: string,
  edition: 1 | 2 = 1
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
    selected ? selected.name : edition === 2 ? "GitHub leaderboards" : "Projects making moves",
    selected?.colour ?? "#f4f7fd",
    'font-weight="700" letter-spacing="-2"'
  );
  content += text(50, wide ? 141 : 166, 26, label, "#e9ff49", 'font-weight="700"');
  content += text(
    50,
    wide ? 178 : 209,
    22,
    edition === 2
      ? `${new Date(ranked.from + "T00:00:00Z").toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "UTC" })} to ${new Date(ranked.to + "T00:00:00Z").toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })} · ${days} days`
      : `${ranked.from} — ${ranked.to} UTC · ${days} days`,
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
      : edition === 2
        ? "GitHub counts, including bots"
        : "GitHub activity · counts include bots · product quality is a separate question",
    "#b4c0d2"
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>${esc(leaderboardCaption(snapshot, days, key, project))}</title><rect width="${w}" height="${h}" fill="#080d19"/><g font-family="Bricolage Grotesque">${content}</g></svg>`;
}

/** Edition 3. Editions 1 and 2 keep their published images. */
function leaderboardSvgV3(
  snapshot: LeaderboardSnapshot,
  days: number,
  key: RankingMeasure,
  format: LeaderboardFormat,
  project?: string
) {
  const [w, h] = leaderboardFormats[format];
  const wide = format === "landscape";
  const portrait = format === "portrait";
  const ranked = rankedProjects(snapshot, days, key);
  const label = rankingMeasures.find((m) => m.key === key)!.label;
  const selected = project ? ranked.rows.find((r) => r.slug === project) : null;
  const rows = ranked.rows;
  const range = `${leaderboardDateRange(ranked.from, ranked.to)} · ${days} days`;
  const text = (x: number, y: number, size: number, value: unknown, fill = "#f4f7fd", extra = "") =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${esc(value)}</text>`;
  const rule = (x: number, y: number, width: number, colour = "#344158") =>
    `<path d="M${x} ${y}h${width}" stroke="${colour}"/>`;
  const mark = (x: number, y: number, size: number, colour: string, letters: string) => {
    const fontSize = letters.length > 1 ? size * 0.42 : size * 0.5;
    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${colour}"/><text x="${x + size / 2}" y="${y + size / 2 + fontSize * 0.36}" text-anchor="middle" font-size="${fontSize}" fill="#080d19" font-weight="700">${esc(letters)}</text>`;
  };
  const movement = (r: (typeof rows)[number]) =>
    r.value === null
      ? "History unavailable"
      : r.movement === null
        ? "Earlier ranks unavailable"
        : r.movement === 0
          ? "Same rank"
          : `${r.movement > 0 ? "Up" : "Down"} ${Math.abs(r.movement)} ${Math.abs(r.movement) === 1 ? "place" : "places"}`;
  const previous = (r: (typeof rows)[number]) =>
    r.previous === null
      ? "No complete previous period"
      : key === "reduction"
        ? r.previous === 0
          ? `No change in the previous ${days} days`
          : `${number(Math.abs(r.previous))} ${r.previous > 0 ? "fewer" : "more"} open issue${Math.abs(r.previous) === 1 ? "" : "s"} in the previous ${days} days`
        : `${number(r.previous)} in the previous ${days} days`;
  const header = selected
    ? {
        markSize: wide ? 52 : portrait ? 72 : 64,
        markY: wide ? 40 : portrait ? 50 : 46,
        titleX: wide ? 116 : portrait ? 138 : 128,
        titleY: wide ? 90 : portrait ? 128 : 112,
        titleSize: wide ? 64 : portrait ? 92 : 78,
        labelY: wide ? 138 : portrait ? 196 : 170,
        labelSize: wide ? 26 : portrait ? 30 : 28,
        dateY: wide ? 172 : portrait ? 238 : 206,
        dateSize: wide ? 21 : portrait ? 24 : 22
      }
    : {
        markSize: wide ? 50 : portrait ? 64 : 56,
        markY: wide ? 42 : portrait ? 48 : 48,
        titleX: wide ? 116 : portrait ? 132 : 124,
        titleY: wide ? 94 : portrait ? 122 : 110,
        titleSize: wide ? 62 : portrait ? 88 : 76,
        labelY: wide ? 140 : portrait ? 190 : 168,
        labelSize: wide ? 26 : portrait ? 30 : 28,
        dateY: wide ? 174 : portrait ? 230 : 204,
        dateSize: wide ? 21 : portrait ? 23 : 21
      };
  const identity = selected ?? leaderboardProjects[0];
  let content = mark(48, header.markY, header.markSize, identity.colour, identity.mark);
  content += `<text x="${header.titleX}" y="${header.titleY}" font-size="${header.titleSize}" fill="${selected ? selected.colour : "#f4f7fd"}" font-weight="700" letter-spacing="-2">${esc(selected ? selected.name : "Leaderboards")}<tspan fill="#e9ff49">.</tspan></text>`;
  content += text(50, header.labelY, header.labelSize, label, "#e9ff49", 'font-weight="700"');
  content += text(50, header.dateY, header.dateSize, range, "#b4c0d2");
  if (!selected)
    content += text(
      w - 50,
      header.dateY,
      header.dateSize,
      `${rows.length} projects`,
      "#b4c0d2",
      'text-anchor="end"'
    );

  if (!selected) {
    const max = Math.max(1, ...rows.map((r) => Math.abs(r.value ?? 0)));
    const rowH = wide ? 77 : portrait ? 114 : 83;
    const start = wide ? 226 : portrait ? 348 : 286;
    if (portrait) {
      content += text(50, 296, 18, "Rank / project", "#b4c0d2");
      content += text(w - 50, 296, 18, label, "#b4c0d2", 'text-anchor="end"');
    }
    rows.forEach((r, i) => {
      const col = wide && i >= 4 ? 1 : 0;
      const x = 50 + col * 560;
      const y = start + (wide ? i % 4 : i) * rowH;
      const width = wide ? 500 : 980;
      const markSize = wide ? 30 : portrait ? 46 : 40;
      content += text(
        x,
        y,
        wide ? 28 : portrait ? 36 : 32,
        r.rank === null ? "—" : String(r.rank).padStart(2, "0"),
        r.colour,
        'font-weight="700"'
      );
      content += mark(x + 62, y - markSize + 8, markSize, r.colour, r.mark);
      content += text(
        x + 62 + markSize + 14,
        y,
        wide ? 27 : portrait ? 38 : 34,
        r.name,
        "#f4f7fd",
        'font-weight="700"'
      );
      content += text(
        x + width,
        y,
        wide ? 37 : portrait ? 52 : 46,
        number(r.value),
        r.colour,
        'font-weight="700" text-anchor="end"'
      );
      content += text(
        x + 62 + markSize + 14,
        y + (wide ? 24 : portrait ? 30 : 29),
        wide ? 16 : portrait ? 21 : 20,
        `${r.tied ? "Tied · " : ""}${movement(r)}`,
        "#b4c0d2"
      );
      content += rule(x, y + rowH * 0.52, width);
      if (key === "reduction")
        content += `<path d="M${x + width / 2} ${y + rowH * 0.52 - 5}v10" stroke="#b4c0d2"/>`;
      if (r.value !== null && r.value !== 0) {
        const signed = key === "reduction";
        const length = signed
          ? ((r.value / max) * width) / 2
          : Math.max(2, (r.value / max) * width);
        content += `<path d="M${x + (signed ? width / 2 : 0)} ${y + rowH * 0.52}h${length}" stroke="${signed && r.value < 0 ? "#ff746a" : r.colour}" stroke-width="3"/>`;
      }
    });
  } else {
    const daily = selected.counts.daily.filter((d) => d.day >= ranked.from && d.day <= ranked.to);
    const values = daily.map((d) =>
      key === "reduction" ? d.closed - d.opened - d.reopened : d[key]
    );
    const max = Math.max(1, ...values.map(Math.abs));
    const scoreY = wide ? 332 : portrait ? 580 : 470;
    content += text(
      45,
      scoreY,
      wide ? 190 : portrait ? 250 : 236,
      number(selected.value),
      selected.colour,
      'font-weight="700" letter-spacing="-8"'
    );
    content += text(
      w - 52,
      wide ? 274 : portrait ? 348 : 300,
      wide ? 27 : portrait ? 30 : 28,
      selected.rank === null
        ? "History unavailable"
        : `#${selected.rank}${selected.tied ? " · tied" : ""} of ${rows.filter((r) => r.rank !== null).length}`,
      "#f4f7fd",
      'text-anchor="end"'
    );
    content += text(
      52,
      wide ? 378 : portrait ? 640 : 520,
      wide ? 24 : portrait ? 26 : 24,
      previous(selected),
      "#b4c0d2"
    );
    const chartY = wide ? 426 : portrait ? 728 : 630,
      chartH = wide ? 84 : portrait ? 380 : 260,
      chartW = w - 104;
    content += text(52, chartY - 12, wide ? 20 : portrait ? 22 : 20, "Daily changes", "#b4c0d2");
    if (selected.value !== null)
      content += text(
        w - 52,
        chartY - 12,
        wide ? 18 : portrait ? 20 : 18,
        key === "reduction" ? `Daily scale ±${max}` : `Peak ${max}`,
        "#b4c0d2",
        'text-anchor="end"'
      );
    const baseline = chartY + chartH * (key === "reduction" ? 0.5 : 0.85);
    content += rule(52, baseline, chartW);
    values.forEach((v, i) => {
      const bh =
        v === 0
          ? 0
          : Math.max(3, (Math.abs(v) / max) * chartH * (key === "reduction" ? 0.42 : 0.75));
      const bw = chartW / values.length;
      content += `<rect x="${52 + i * bw}" y="${v >= 0 ? baseline - bh : baseline}" width="${Math.max(1, bw - 3)}" height="${bh}" fill="${selected.value === null ? "#344158" : v < 0 ? "#ff746a" : selected.colour}"/>`;
    });
    if (!wide) {
      content += text(
        52,
        chartY + chartH + (portrait ? 34 : 30),
        portrait ? 20 : 18,
        leaderboardShortDate(ranked.from),
        "#b4c0d2"
      );
      content += text(
        w - 52,
        chartY + chartH + (portrait ? 34 : 30),
        portrait ? 20 : 18,
        leaderboardShortDate(ranked.to),
        "#b4c0d2",
        'text-anchor="end"'
      );
    }
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
      : "GitHub counts, including bots",
    "#b4c0d2"
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>${esc(leaderboardCaption(snapshot, days, key, project))}</title><rect width="${w}" height="${h}" fill="#080d19"/><g font-family="Bricolage Grotesque">${content}</g></svg>`;
}
