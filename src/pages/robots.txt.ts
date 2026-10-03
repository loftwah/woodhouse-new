import type { APIRoute } from "astro";

export const prerender = false;
const siteOrigin = new URL(import.meta.env.SITE ?? "https://woodhouse.loftwah.com").origin;
const preview = new URL(siteOrigin).hostname.endsWith(".workers.dev");

export const GET: APIRoute = () => {
  const body = preview
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nDisallow: /_emdash/\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n# Agent-facing index of the same public record: ${siteOrigin}/llms.txt\n`;
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
      ...(preview ? { "x-robots-tag": "noindex, nofollow, noarchive" } : {})
    }
  });
};
