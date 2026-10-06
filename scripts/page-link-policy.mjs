// Cloudflare adds an invisible content endpoint anchor on the custom domain.
// It is platform markup, not reader navigation. Do not hide visible CDN links
// or ordinary hidden application links from the public link audit.
// https://developers.cloudflare.com/fundamentals/reference/cdn-cgi-endpoint/
export function isCloudflareHiddenContentLink(anchor, url) {
  const style = anchor.attrs.get("style") ?? "";
  return (
    url.pathname === "/cdn-cgi/content" &&
    url.searchParams.has("id") &&
    anchor.attrs.get("aria-hidden") === "true" &&
    !anchor.inner.trim() &&
    /(?:^|;)\s*display\s*:\s*none\s*!important\s*(?:;|$)/i.test(style) &&
    /(?:^|;)\s*visibility\s*:\s*hidden\s*!important\s*(?:;|$)/i.test(style)
  );
}
