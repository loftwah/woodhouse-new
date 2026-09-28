import type { APIRoute, GetStaticPaths } from "astro";
import { projects, reviewDateLabel } from "../../../data/projects";

const inks = ["#E9FF49", "#FF746A", "#647DFF", "#FFC95A", "#54D9C5", "#FF9B6B", "#B794FF", "#79D8FF"];

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export const getStaticPaths: GetStaticPaths = () =>
  projects.map((project) => ({ params: { slug: project.slug }, props: { project } }));

export const GET: APIRoute = ({ props }) => {
  const project = props.project;
  const accent = inks[(Number(project.index) - 1) % inks.length];
  const titleSize = project.name.length > 17 ? 58 : project.name.length > 12 ? 68 : 82;
  const sourceLabel = project.siteUrl ? "SOURCE IMAGE DID NOT LOAD" : "NO PUBLIC SITE OR DEMO";
  const fallbackLine1 = project.siteUrl
    ? "The original site's artwork appears when available."
    : "No public site or project preview is available.";
  const fallbackLine2 = project.siteUrl
    ? "This local preview is used only if that image fails."
    : "This is Woodhouse placeholder artwork, not a game screenshot.";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title description">
  <title id="title">${escapeXml(project.name)} project preview placeholder</title>
  <desc id="description">Woodhouse fallback artwork. ${escapeXml(sourceLabel)}.</desc>
  <rect width="1200" height="630" fill="#080d19"/>
  <path d="M0 0h16v630H0z" fill="${accent}"/>
  <path d="M66 50h42v42H66z" fill="#141d32" stroke="#62708d" stroke-width="1"/>
  <path d="M75 64h24M75 72h24M75 80h17" stroke="${accent}" stroke-width="3"/>
  <text x="128" y="80" fill="#f4f7fd" font-family="Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="4">WOODHOUSE</text>
  <text x="66" y="275" fill="${accent}" font-family="Arial, sans-serif" font-size="176" font-weight="700" letter-spacing="-12">${escapeXml(project.index)}</text>
  <path d="M66 307h234" stroke="#62708d" stroke-width="2"/>
  <text x="66" y="354" fill="#a9b8d0" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2">PROJECT DOSSIER</text>
  <text x="390" y="88" fill="${accent}" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2.5">LOCAL PREVIEW · ${escapeXml(reviewDateLabel.toUpperCase())}</text>
  <text x="390" y="218" fill="#f4f7fd" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="700" letter-spacing="-2">${escapeXml(project.name)}</text>
  <path d="M390 252h116" stroke="${accent}" stroke-width="8"/>
  <text x="390" y="316" fill="#dce6f5" font-family="Arial, sans-serif" font-size="25" font-weight="600">${escapeXml(project.discipline)}</text>
  <rect x="390" y="369" width="730" height="92" fill="#141d32" stroke="#394967" stroke-width="1"/>
  <path d="M390 369h8v92h-8z" fill="${accent}"/>
  <text x="425" y="408" fill="${accent}" font-family="Menlo, monospace" font-size="15" font-weight="700" letter-spacing="2">${escapeXml(sourceLabel)}</text>
  <text x="425" y="439" fill="#f4f7fd" font-family="Arial, sans-serif" font-size="19">${escapeXml(project.state)}</text>
  <text x="390" y="519" fill="#b4c0d2" font-family="Arial, sans-serif" font-size="18">${escapeXml(fallbackLine1)}</text>
  <text x="390" y="552" fill="#b4c0d2" font-family="Arial, sans-serif" font-size="18">${escapeXml(fallbackLine2)}</text>
  <text x="1146" y="590" text-anchor="end" fill="#a9b8d0" font-family="Menlo, monospace" font-size="13" font-weight="700" letter-spacing="1">WOODHOUSE / ${escapeXml(project.index)} OF 08</text>
  <path d="M1138 40v36m-18-18h36" stroke="${accent}" stroke-width="2"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
