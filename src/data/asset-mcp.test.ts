import assert from "node:assert/strict";
import test from "node:test";
import { assetMcp } from "./asset-mcp.ts";

const endpoint = "https://woodhouse.loftwah.com/api/v1/assets-mcp";
const calls: string[] = [];
const catalogue = async (params: URLSearchParams, id?: string) => {
  calls.push(id ?? params.toString());
  return Response.json(id ? { asset: { id } } : { assets: [{ id: "public" }], nextAfter: null });
};
const call = (body: unknown, headers: Record<string, string> = {}) =>
  assetMcp(
    new Request(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body)
    }),
    catalogue
  );

test("MCP exposes only the public catalogue through the two read-only tools", async () => {
  const init = (await (
    await call({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: {} }
    })
  ).json()) as {
    result: { protocolVersion: string; content: { text: string }[] };
    error: { code: number };
  };
  assert.equal(init.result.protocolVersion, "2025-06-18");
  const list = (await (await call({ jsonrpc: "2.0", id: 2, method: "tools/list" })).json()) as {
    result: { protocolVersion: string; tools: { name: string }[]; content: { text: string }[] };
    error: { code: number };
  };
  assert.deepEqual(
    list.result.tools.map((item: { name: string }) => item.name),
    ["search_assets", "get_asset"]
  );
  const search = (await (
    await call({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "search_assets", arguments: { project: "bubbles", limit: 2 } }
    })
  ).json()) as {
    result: { protocolVersion: string; content: { text: string }[] };
    error: { code: number };
  };
  assert.equal(JSON.parse(search.result.content[0]!.text).assets[0].id, "public");
  await call({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: { name: "get_asset", arguments: { id: "public" } }
  });
  assert.deepEqual(calls.slice(-2), ["project=bubbles&limit=2", "public"]);
  const denied = (await (
    await call({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: { name: "delete_asset", arguments: {} }
    })
  ).json()) as {
    result: { protocolVersion: string; content: { text: string }[] };
    error: { code: number };
  };
  assert.equal(denied.error.code, -32602);
});

test("origin, size, versions and malformed arguments are bounded", async () => {
  assert.equal((await call({}, { origin: "https://evil.example" })).status, 403);
  assert.equal((await call({}, { "mcp-protocol-version": "9999-01-01" })).status, 400);
  assert.equal((await call({ data: "a".repeat(9000) })).status, 413);
  assert.equal((await assetMcp(new Request(endpoint), catalogue)).status, 405);
  const bad = (await (
    await call({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "search_assets", arguments: { url: "https://evil.example" } }
    })
  ).json()) as {
    result: { protocolVersion: string; content: { text: string }[] };
    error: { code: number };
  };
  assert.equal(bad.error.code, -32602);
  assert.equal((await call({ jsonrpc: "2.0", method: "notifications/initialized" })).status, 202);
});
