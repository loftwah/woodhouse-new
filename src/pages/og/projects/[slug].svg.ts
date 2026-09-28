import type { APIRoute, GetStaticPaths } from "astro";
import { projects, reviewDateLabel } from "../../../data/projects";

const inks = ["#E6F451", "#F2744A", "#4665E8", "#F1BF54", "#65BDA7", "#E88B48", "#B08CEB", "#68BEC7"];

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
  <rect width="1200" height="630" fill="#faf4e6"/>
  <path d="M0 0h22v630H0z" fill="#151612"/>
  <path d="M22 0h316v630H22z" fill="${accent}"/>
  <path d="M338 0h12v630h-12z" fill="#151612"/>
  <path d="M54 50h34v34H54z" fill="#151612"/>
  <path d="M61 61h20M61 68h20M61 75h14" stroke="${accent}" stroke-width="3"/>
  <text x="102" y="77" fill="#151612" font-family="Arial, sans-serif" font-size="19" font-weight="800" letter-spacing="4">WOODHOUSE</text>
  <text x="54" y="262" fill="#151612" font-family="Arial Black, Arial, sans-serif" font-size="164" font-weight="900" letter-spacing="-12">${escapeXml(project.index)}</text>
  <path d="M54 293h228" stroke="#151612" stroke-width="4"/>
  <text x="54" y="338" fill="#151612" font-family="Arial, sans-serif" font-size="17" font-weight="700" letter-spacing="2">PROJECT DOSSIER</text>
  <text x="390" y="88" fill="#a83a20" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="2.5">LOCAL PREVIEW · ${escapeXml(reviewDateLabel.toUpperCase())}</text>
  <text x="390" y="218" fill="#151612" font-family="Arial Black, Arial, sans-serif" font-size="${titleSize}" font-weight="900" letter-spacing="-2">${escapeXml(project.name)}</text>
  <path d="M390 252h116" stroke="${accent}" stroke-width="13"/>
  <text x="390" y="316" fill="#20211b" font-family="Arial, sans-serif" font-size="25" font-weight="600">${escapeXml(project.discipline)}</text>
  <rect x="390" y="369" width="730" height="92" fill="#151612"/>
  <path d="M390 369h18v92h-18z" fill="${accent}"/>
  <text x="435" y="408" fill="${accent}" font-family="Menlo, monospace" font-size="15" font-weight="700" letter-spacing="2">${escapeXml(sourceLabel)}</text>
  <text x="435" y="439" fill="#fff9ed" font-family="Arial, sans-serif" font-size="19">${escapeXml(project.state)}</text>
  <text x="390" y="519" fill="#525247" font-family="Arial, sans-serif" font-size="18">${escapeXml(fallbackLine1)}</text>
  <text x="390" y="552" fill="#525247" font-family="Arial, sans-serif" font-size="18">${escapeXml(fallbackLine2)}</text>
  <text x="1146" y="590" text-anchor="end" fill="#151612" font-family="Menlo, monospace" font-size="13" font-weight="700" letter-spacing="1">WOODHOUSE / ${escapeXml(project.index)} OF 08</text>
  <path d="M1138 40v36m-18-18h36" stroke="#151612" stroke-width="2"/>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
};
