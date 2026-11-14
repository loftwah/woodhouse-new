/** Stateless, read-only MCP adapter over the same public catalogue as the REST API. */
type Catalogue = (params: URLSearchParams, id?: string) => Promise<Response>;
const version = "2025-06-18";
const maxBody = 8192;
const searchProperties = {
  project: { type: "string", description: "Project slug" },
  kind: {
    type: "string",
    enum: ["editorial composition", "production screenshot", "published product artwork"]
  },
  orientation: { type: "string", enum: ["landscape", "portrait", "square"] },
  q: { type: "string", maxLength: 100 },
  limit: { type: "integer", minimum: 1, maximum: 50 },
  after: { type: "string", description: "Cursor returned as nextAfter by a previous search" }
};
const tools = [
  {
    name: "search_assets",
    description:
      "Search published Woodhouse artwork. Reuse rights are separate from public viewing.",
    inputSchema: { type: "object", properties: searchProperties, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  {
    name: "get_asset",
    description: "Get one published asset by its exact catalogue ID.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
  }
];
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const rpc = (id: unknown, result: object, error = false) =>
  Response.json(
    { jsonrpc: "2.0", id, [error ? "error" : "result"]: result },
    { headers: { "cache-control": "no-store" } }
  );
const invalid = (id: unknown, message: string, code = -32602) => rpc(id, { code, message }, true);

export async function assetMcp(request: Request, catalogue: Catalogue): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return new Response("Forbidden", { status: 403 });
  if (request.method !== "POST")
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  const protocol = request.headers.get("mcp-protocol-version");
  if (protocol && protocol !== version && protocol !== "2025-03-26")
    return new Response("Unsupported protocol version", { status: 400 });
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return new Response("Expected JSON", { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return new Response("Missing body", { status: 400 });
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBody) {
      await reader.cancel();
      return new Response("Request too large", { status: 413 });
    }
    chunks.push(value);
  }
  let message: unknown;
  try {
    const data = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }
    message = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(data));
  } catch {
    return invalid(null, "Parse error", -32700);
  }
  if (
    !object(message) ||
    message.jsonrpc !== "2.0" ||
    typeof message.method !== "string" ||
    ("id" in message && typeof message.id !== "string" && typeof message.id !== "number")
  )
    return invalid(null, "Invalid Request", -32600);
  if (!("id" in message)) return new Response(null, { status: 202 });
  const id = message.id;
  if (message.method === "initialize") {
    if (
      !object(message.params) ||
      typeof message.params.protocolVersion !== "string" ||
      !object(message.params.capabilities) ||
      !object(message.params.clientInfo)
    )
      return invalid(id, "Invalid initialize parameters");
    const requested = message.params.protocolVersion;
    return rpc(id, {
      protocolVersion: requested === "2025-03-26" ? requested : version,
      capabilities: { tools: {} },
      serverInfo: { name: "woodhouse-public-assets", version: "1.0.0" },
      instructions: "Only published assets are returned. Viewing is not a grant of reuse rights."
    });
  }
  if (message.method === "ping") return rpc(id, {});
  if (message.method === "tools/list") return rpc(id, { tools });
  if (message.method !== "tools/call") return invalid(id, "Method not found", -32601);
  if (
    !object(message.params) ||
    typeof message.params.name !== "string" ||
    !object(message.params.arguments ?? {})
  )
    return invalid(id, "Invalid tool call");
  const args = (message.params.arguments ?? {}) as Record<string, unknown>;
  let response: Response;
  if (message.params.name === "search_assets") {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      if (
        !Object.hasOwn(searchProperties, key) ||
        (key === "limit" ? !Number.isInteger(value) : typeof value !== "string")
      )
        return invalid(id, "Invalid search arguments");
      params.set(key, String(value));
    }
    response = await catalogue(params);
  } else if (message.params.name === "get_asset") {
    if (Object.keys(args).length !== 1 || typeof args.id !== "string")
      return invalid(id, "Invalid asset ID");
    response = await catalogue(new URLSearchParams(), args.id);
  } else return invalid(id, "Unknown tool");
  const result = await response.text();
  return rpc(id, {
    content: [{ type: "text", text: result }],
    ...(response.ok ? {} : { isError: true })
  });
}
