/** Public publication can ship before CMS authoring is accepted. */
export function isReadOnlyPublication(env: unknown): boolean {
  return (
    typeof env === "object" &&
    env !== null &&
    "WOODHOUSE_PUBLICATION_MODE" in env &&
    env.WOODHOUSE_PUBLICATION_MODE === "read-only"
  );
}

export function createPublicationScheduledHandler<Args extends [unknown, unknown, ...unknown[]]>(
  scheduled: (...args: Args) => unknown
) {
  return async (...args: Args) => {
    if (isReadOnlyPublication(args[1])) return;
    await scheduled(...args);
  };
}

export function publicationRequestAllowed(request: Request): boolean {
  const url = new URL(request.url);
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname).replace(/\/+/g, "/");
  } catch {
    return false;
  }
  // Decoding can reveal a traversal the URL parser left encoded (`..%2f`).
  // Collapse nothing: a path with a dot segment or a backslash is refused
  // outright, so a router that resolves it cannot reach the CMS behind the gate.
  if (pathname.split("/").some((segment) => segment === "." || segment === "..")) return false;
  if (pathname.includes("\\") || pathname.includes("\0")) return false;
  if (pathname === "/_emdash" || pathname.startsWith("/_emdash/")) return false;
  if (url.searchParams.has("_preview")) return false;
  // Astro trims cookie names and decodes values. Refuse the edit-mode cookie
  // itself so encoded/quoted values cannot select an editorial read model.
  for (const cookie of (request.headers.get("cookie") ?? "").split(";")) {
    const name = cookie.split("=", 1)[0]?.trim();
    if (name === "emdash-edit-mode") return false;
  }
  // This single route implements only bounded public catalogue reads over MCP.
  if (request.method === "POST") return url.pathname === "/api/v1/assets-mcp";
  return request.method === "GET" || request.method === "HEAD";
}
