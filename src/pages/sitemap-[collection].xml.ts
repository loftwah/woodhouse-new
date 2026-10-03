import type { APIRoute } from "astro";

export const prerender = false;

// EmDash's generic sitemap emits every published routable CMS entry. Woodhouse
// uses a stricter public_safe/source_reviewed filter in its curated root map.
// Keep the child endpoint unavailable so a future collection cannot bypass it.
export const GET: APIRoute = () =>
  new Response("This sitemap is maintained at /sitemap.xml.", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex, nofollow, noarchive"
    }
  });
