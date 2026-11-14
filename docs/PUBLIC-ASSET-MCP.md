# Public asset MCP

Reviewed 2026/11/14. The public, stateless Streamable HTTP endpoint is
`https://woodhouse.loftwah.com/api/v1/assets-mcp`. Configure it as a remote MCP
server in a client that supports the 2025-06-18 protocol. It offers
`search_assets` (project, kind, orientation, q, limit and after) and `get_asset`
(exact id). For example, search with `{"project":"bubbles","orientation":"landscape","limit":2}`;
pass the response's `nextAfter` as `after` for the next page. Both tools use
the same published projection and rights metadata as `/api/v1/assets`.

Public viewing and downloading do not grant reuse rights. Records whose reuse
status is unconfirmed must not be described as cleared. The server cannot
write, fetch arbitrary URLs or access owner-only content; it does not expose
the separate EmDash authoring MCP. It returns JSON rather than streaming
server events and has no session state. Browser origins other than the serving
origin are rejected; ordinary MCP clients without an Origin header can connect.
The request limit is 8 KiB and searches return at most 50 records.

The protocol follows the official [Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)
and [tools specification](https://modelcontextprotocol.io/specification/2025-06-18/server/tools).
