import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

/**
 * The caching a public page is allowed to declare.
 *
 * The route rules in `astro.config.mjs` ask for 60 seconds fresh plus 60 seconds
 * of stale-while-revalidate, but the response that actually reached the edge
 * carried `cache-control: no-cache` on every public page. An origin that declares
 * no caching while the edge stores the response anyway is the worst of both:
 * the declaration is not honoured, so a content change stayed invisible while the
 * stored entry's `age` grew past 17 minutes, and neither the origin's nor the
 * request's `no-cache` caused a revalidation. Stating the intended bound here
 * makes it observable and makes the edge's reuse of it bounded.
 */
const PUBLIC_CACHE_CONTROL = "public, max-age=60, s-maxage=60, stale-while-revalidate=60";

function wantsPrivateCaching(request: Request, url: URL) {
  const editMode = /(?:^|;\s*)emdash-edit-mode=true(?:;|$)/.test(
    request.headers.get("cookie") ?? ""
  );
  return (
    request.method !== "GET" ||
    url.pathname.startsWith("/_emdash/") ||
    url.searchParams.has("_preview") ||
    editMode
  );
}

const worker = {
  ...handler,
  async fetch(...args: Parameters<NonNullable<typeof handler.fetch>>) {
    const [request, env, ctx] = args;
    const fetchHandler = handler.fetch;
    if (!fetchHandler) throw new Error("EmDash Worker fetch handler is unavailable.");
    const response = await fetchHandler.call(handler, request, env, ctx);
    const url = new URL(request.url);
    const headers = new Headers(response.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "SAMEORIGIN");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    headers.set("Permissions-Policy", "camera=(), geolocation=(), microphone=()");
    if (wantsPrivateCaching(request, url)) {
      headers.set("Cache-Control", "private, no-store, max-age=0");
      headers.set("Pragma", "no-cache");
      headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    } else if (response.ok && headers.get("content-type")?.includes("text/html")) {
      // Only rewrite a response that declared nothing usable. Anything already
      // private, no-store or explicitly bounded keeps the directive its route set.
      const declared = (headers.get("cache-control") ?? "").toLowerCase();
      if (!declared || declared === "no-cache" || declared === "no-store")
        headers.set("Cache-Control", PUBLIC_CACHE_CONTROL);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  },
  scheduled: createScheduledHandler()
} satisfies typeof handler;

export default worker;
