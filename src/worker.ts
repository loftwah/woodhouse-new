import handler, { createScheduledHandler, PluginBridge } from "@emdash-cms/cloudflare/worker";

export { PluginBridge };

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
    const editMode = /(?:^|;\s*)emdash-edit-mode=true(?:;|$)/.test(
      request.headers.get("cookie") ?? ""
    );
    if (url.pathname.startsWith("/_emdash/") || url.searchParams.has("_preview") || editMode) {
      headers.set("Cache-Control", "private, no-store, max-age=0");
      headers.set("Pragma", "no-cache");
      headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
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
