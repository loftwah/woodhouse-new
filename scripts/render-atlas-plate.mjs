#!/usr/bin/env node
// Renders the portfolio architecture plate from the reviewed atlas dataset.
//
// A hand-drawn SVG drifts the moment a project is added or a relationship is
// corrected. This plate is drawn from `src/data/architecture-atlas.ts`, so the
// picture and the project profiles share one reviewed source. The editable
// model is that dataset plus this script; `diagrams/portfolio-atlas.d2` keeps
// the same topology in the site's existing D2 convention.
//
// Run: node --experimental-strip-types scripts/render-atlas-plate.mjs
// Check: node --experimental-strip-types scripts/render-atlas-plate.mjs --check

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { atlasGroups, atlasProfiles, atlasRelationships, atlasReview } = await import(
  path.join(root, "src/data/architecture-atlas.ts")
);

const palette = {
  ink: "#080D19",
  raised: "#0F182A",
  rule: "#2A3850",
  text: "#EAF0FA",
  soft: "#A9B8D0",
  lime: "#E9FF49",
  cyan: "#79D8FF",
  amber: "#FFD276",
  electric: "#647DFF",
  grey: "#8798B0"
};

const statusColour = {
  live: palette.cyan,
  demo: palette.amber,
  planned: palette.electric,
  unknown: palette.grey
};

const statusLabel = {
  live: "LIVE",
  demo: "DEMO",
  planned: "PLANNED",
  unknown: "UNKNOWN"
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Greedy word wrap; SVG has no text flow of its own. */
function wrap(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const plateRelationships = atlasRelationships.filter(
  (relationship) => relationship.plate !== false
);
const lanes = atlasGroups
  .map((group) => ({
    group,
    nodes: atlasProfiles.filter((profile) => profile.group === group.key)
  }))
  .filter((lane) => lane.nodes.length > 0);

// The plate keeps the site's display face. An SVG used in <img> cannot reach
// the page's @font-face, so the variable font is embedded once per file.
const fontData = (
  await readFile(path.join(root, "public/fonts/bricolage-grotesque-latin-variable.woff2"))
).toString("base64");
const fontStyle = `<style>@font-face{font-family:"Bricolage Grotesque";src:url(data:font/woff2;base64,${fontData}) format("woff2");font-weight:400 800;font-style:normal}</style>`;

function nodeOf(slug) {
  return atlasProfiles.find((profile) => profile.slug === slug);
}

function desktopPlate() {
  const width = 1600;
  const margin = 48;
  const labelWidth = 152;
  const nodeWidth = 250;
  const nodeHeight = 98;
  const gap = 16;
  const bandGap = 44;
  const bandHeight = nodeHeight + 26;
  const headerHeight = 132;
  const legendHeight = 76;
  const height = headerHeight + lanes.length * (bandHeight + bandGap) + legendHeight;

  const positions = new Map();
  let y = headerHeight;
  for (const lane of lanes) {
    lane.nodes.forEach((profile, index) => {
      positions.set(profile.slug, {
        x: margin + labelWidth + index * (nodeWidth + gap),
        y: y + 10,
        width: nodeWidth,
        height: nodeHeight
      });
    });
    lane.y = y;
    y += bandHeight + bandGap;
  }

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="atlas-plate-title atlas-plate-desc">`,
    `<title id="atlas-plate-title">Portfolio architecture map</title>`,
    `<desc id="atlas-plate-desc">Twelve Loftwah products and the Woodhouse publisher, grouped by purpose. ${plateRelationships.length} verified capability relationships are drawn. The measurement and contract relationships are listed in the page ledger, and the same information is available as text below the image.</desc>`,
    `<defs><marker id="atlas-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 8 4 L 0 8 z" fill="${palette.lime}"/></marker></defs>`,
    fontStyle,
    `<rect width="${width}" height="${height}" fill="${palette.ink}"/>`,
    `<g font-family="Bricolage Grotesque, system-ui, sans-serif" fill="${palette.text}">`,
    `<text x="${margin}" y="44" font-size="13" letter-spacing="3" fill="${palette.lime}">LOFTWAH SOFTWARE FACTORY / ARCHITECTURE</text>`,
    `<text x="${margin}" y="82" font-size="34" font-weight="700" letter-spacing="-1">Twelve products and the publisher.</text>`,
    `<text x="${margin}" y="108" font-size="15" fill="${palette.soft}">Each product owns its code, data and release. An arrow is a verified relationship, not a shared platform.</text>`
  );

  for (const lane of lanes) {
    parts.push(
      `<text x="${margin}" y="${lane.y + 2}" font-size="12" font-weight="700" letter-spacing="2" fill="${palette.lime}">${escapeXml(
        lane.group.label.toUpperCase()
      )}</text>`,
      `<text x="${margin}" y="${lane.y + 24}" font-size="11" fill="${palette.soft}">${lane.nodes.length} ${
        lane.nodes.length === 1 ? "project" : "projects"
      }</text>`,
      `<line x1="${margin}" y1="${lane.y + bandHeight - 6}" x2="${width - margin}" y2="${
        lane.y + bandHeight - 6
      }" stroke="${palette.rule}" stroke-width="1"/>`
    );
    for (const profile of lane.nodes) {
      const box = positions.get(profile.slug);
      const colour = statusColour[profile.status] ?? palette.grey;
      parts.push(
        `<g><title>${escapeXml(profile.name)}</title>`,
        `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" fill="${palette.raised}" stroke="${palette.rule}" stroke-width="1"/>`,
        `<rect x="${box.x}" y="${box.y}" width="4" height="${box.height}" fill="${colour}"/>`,
        `<text x="${box.x + 16}" y="${box.y + 26}" font-size="18" font-weight="700">${escapeXml(
          profile.name
        )}</text>`
      );
      wrap(profile.role, 34)
        .slice(0, 2)
        .forEach((line, index) => {
          parts.push(
            `<text x="${box.x + 16}" y="${box.y + 47 + index * 15}" font-size="12" fill="${
              palette.soft
            }">${escapeXml(line)}</text>`
          );
        });
      parts.push(
        `<text x="${box.x + 16}" y="${box.y + box.height - 12}" font-size="10" letter-spacing="1.4" fill="${colour}">${
          statusLabel[profile.status] ?? "UNKNOWN"
        }</text>`,
        `</g>`
      );
    }
  }

  // Relationships. Several consumers of one capability are drawn as a bus:
  // short stubs from each consumer, one trunk, one drop into the provider.
  // That is legible at portfolio scale and reflects what the source says —
  // four games pin one client, rather than four unrelated point-to-point
  // integrations that happen to share a label.
  const groups = new Map();
  for (const relationship of plateRelationships) {
    const key = `${relationship.to}|${relationship.short}`;
    const group = groups.get(key) ?? [];
    group.push(relationship);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    const target = positions.get(group[0].to);
    if (!target) continue;
    if (group.length > 1) {
      const sources = group.map((relationship) => positions.get(relationship.from)).filter(Boolean);
      if (sources.length < 2) continue;
      const trunkY = target.y - 34;
      const sourceXs = sources.map((box) => box.x + box.width / 2);
      const startX = Math.min(...sourceXs);
      const endX = Math.max(...sourceXs);
      const dropX = target.x + target.width / 2;
      parts.push(
        `<line x1="${startX}" y1="${trunkY}" x2="${endX}" y2="${trunkY}" stroke="${palette.lime}" stroke-width="1.4" opacity="0.85"/>`
      );
      for (const box of sources) {
        const x = box.x + box.width / 2;
        parts.push(
          `<line x1="${x}" y1="${box.y + box.height}" x2="${x}" y2="${trunkY}" stroke="${palette.lime}" stroke-width="1.4" opacity="0.85"/>`
        );
      }
      parts.push(
        `<line x1="${dropX}" y1="${trunkY}" x2="${dropX}" y2="${target.y}" stroke="${palette.lime}" stroke-width="1.4" opacity="0.85" marker-end="url(#atlas-arrow)"/>`,
        `<text x="${(startX + endX) / 2}" y="${trunkY - 7}" font-size="10" text-anchor="middle" fill="${palette.lime}">${escapeXml(
          group[0].short
        )}${group[0].pair ? " · two-way" : ""} · ${group.length} consumers</text>`
      );
      continue;
    }
    const relationship = group[0];
    const from = positions.get(relationship.from);
    if (!from) continue;
    const leftToRight = from.x + from.width / 2 <= target.x + target.width / 2;
    const startX = leftToRight ? from.x + from.width : from.x;
    const endX = leftToRight ? target.x : target.x + target.width;
    const startY = from.y + from.height / 2;
    const endY = target.y + target.height / 2;
    const direction = leftToRight ? 1 : -1;
    const controlY = startY < endY ? startY + 34 : startY - 34;
    const pathData = `M ${startX} ${startY} C ${startX + direction * 36} ${controlY}, ${
      endX - direction * 36
    } ${controlY}, ${endX} ${endY}`;
    parts.push(
      `<path d="${pathData}" fill="none" stroke="${palette.lime}" stroke-width="1.4" opacity="0.85" marker-end="url(#atlas-arrow)"/>`,
      `<text x="${
        (startX + endX) / 2
      }" y="${controlY - 6}" font-size="9.5" text-anchor="middle" fill="${palette.lime}">${escapeXml(
        relationship.short
      )}${relationship.pair ? " · two-way" : ""}</text>`
    );
  }

  const legendY = height - 48;
  let legendX = margin;
  for (const status of ["live", "demo", "planned", "unknown"]) {
    parts.push(
      `<rect x="${legendX}" y="${legendY - 10}" width="9" height="9" fill="${statusColour[status]}"/>`,
      `<text x="${legendX + 15}" y="${legendY - 1}" font-size="11" letter-spacing="1" fill="${
        palette.soft
      }">${statusLabel[status]}</text>`
    );
    legendX += 104;
  }
  parts.push(
    `<text x="${margin}" y="${legendY + 22}" font-size="11" fill="${palette.soft}">Arrows: verified relationships only. Reviewed ${escapeXml(
      atlasReview.display
    )}; evidence on each project profile.</text>`,
    `</g>`,
    `</svg>`
  );
  return parts.join("\n");
}

function mobilePlate() {
  const width = 720;
  const margin = 32;
  const rowHeight = 76;
  const laneGap = 24;
  const headerHeight = 150;
  const rowWidth = width - margin * 2;
  const connectionsHeight = 58 + plateRelationships.length * 25;
  const height =
    headerHeight +
    lanes.reduce((total, lane) => total + 18 + lane.nodes.length * rowHeight + laneGap, 0) +
    connectionsHeight;

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="atlas-mobile-title atlas-mobile-desc">`,
    `<title id="atlas-mobile-title">Portfolio architecture map, phone composition</title>`,
    `<desc id="atlas-mobile-desc">Twelve products and the publisher, grouped by purpose with their status. Verified cross-project relationships are listed at the foot of the plate.</desc>`,
    fontStyle,
    `<rect width="${width}" height="${height}" fill="${palette.ink}"/>`,
    `<g font-family="Bricolage Grotesque, system-ui, sans-serif" fill="${palette.text}">`,
    `<text x="${margin}" y="42" font-size="11" letter-spacing="2.4" fill="${palette.lime}">LOFTWAH SOFTWARE FACTORY</text>`,
    `<text x="${margin}" y="80" font-size="30" font-weight="700" letter-spacing="-0.8">Portfolio architecture.</text>`,
    `<text x="${margin}" y="108" font-size="13" fill="${palette.soft}">Twelve products and the publisher, with separate</text>`,
    `<text x="${margin}" y="128" font-size="13" fill="${palette.soft}">code, data and releases. Capability links are below.</text>`
  );

  let y = headerHeight;
  for (const lane of lanes) {
    parts.push(
      `<text x="${margin}" y="${y}" font-size="11" font-weight="700" letter-spacing="2" fill="${palette.lime}">${escapeXml(
        lane.group.label.toUpperCase()
      )} · ${lane.nodes.length}</text>`
    );
    y += 18;
    for (const profile of lane.nodes) {
      const colour = statusColour[profile.status] ?? palette.grey;
      parts.push(
        `<g><title>${escapeXml(profile.name)}</title>`,
        `<rect x="${margin}" y="${y}" width="${rowWidth}" height="${rowHeight - 8}" fill="${
          palette.raised
        }" stroke="${palette.rule}" stroke-width="1"/>`,
        `<rect x="${margin}" y="${y}" width="4" height="${rowHeight - 8}" fill="${colour}"/>`,
        `<text x="${margin + 16}" y="${y + 23}" font-size="16" font-weight="700">${escapeXml(
          profile.name
        )}</text>`,
        `<text x="${margin + 16}" y="${y + 42}" font-size="11.5" fill="${
          palette.soft
        }">${escapeXml(wrap(profile.role, 58)[0] ?? "")}</text>`,
        `<text x="${margin + 16}" y="${y + 61}" font-size="9.5" letter-spacing="1.2" fill="${colour}">${
          statusLabel[profile.status] ?? "UNKNOWN"
        }</text>`,
        `</g>`
      );
      y += rowHeight;
    }
    y += laneGap;
  }

  parts.push(
    `<text x="${margin}" y="${y + 4}" font-size="11" font-weight="700" letter-spacing="2" fill="${palette.lime}">VERIFIED CAPABILITY CONNECTIONS</text>`
  );
  y += 24;
  for (const relationship of plateRelationships) {
    const from = nodeOf(relationship.from)?.name ?? relationship.from;
    const to = nodeOf(relationship.to)?.name ?? relationship.to;
    parts.push(
      `<text x="${margin}" y="${y + 12}" font-size="11.5" fill="${palette.text}">${escapeXml(
        `${from} → ${to}`
      )}${relationship.pair ? " · two-way" : ""}</text>`,
      `<text x="${width - margin}" y="${y + 12}" font-size="10.5" text-anchor="end" fill="${
        palette.soft
      }">${escapeXml(relationship.short)}</text>`
    );
    y += 25;
  }
  parts.push(
    `<text x="${margin}" y="${y + 26}" font-size="10.5" fill="${palette.soft}">Reviewed ${escapeXml(
      atlasReview.display
    )}. Full evidence on each project's architecture page.</text>`,
    `</g>`,
    `</svg>`
  );
  return parts.join("\n");
}

const output = {
  "portfolio-atlas.svg": desktopPlate(),
  "portfolio-atlas-mobile.svg": mobilePlate()
};

const check = process.argv.includes("--check");
let stale = 0;
for (const [name, svg] of Object.entries(output)) {
  const target = path.join(root, "public/images/diagrams", name);
  if (check) {
    const current = await readFile(target, "utf8").catch(() => "");
    if (current !== svg) {
      console.error(`${name} is stale; run pnpm run atlas:plate.`);
      stale += 1;
    }
    continue;
  }
  await writeFile(target, svg);
  console.log(`Wrote ${name} (${svg.length} bytes).`);
}
if (check && stale === 0) console.log("Atlas plates match the reviewed dataset.");
if (stale) process.exitCode = 1;
