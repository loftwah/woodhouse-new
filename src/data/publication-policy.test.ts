import assert from "node:assert/strict";
import test from "node:test";
import {
  createPublicationScheduledHandler,
  isReadOnlyPublication,
  publicationRequestAllowed
} from "./publication-policy.ts";

const origin = "https://woodhouse.loftwah.com";
test("read-only publication requires an explicit environment value", () => {
  assert.equal(isReadOnlyPublication({ WOODHOUSE_PUBLICATION_MODE: "read-only" }), true);
  for (const env of [null, {}, { WOODHOUSE_PUBLICATION_MODE: "editorial" }])
    assert.equal(isReadOnlyPublication(env), false);
});
test("the published reading routes allow GET and HEAD", () => {
  for (const pathname of ["/", "/projects/protocol-11/", "/agents/facts.json", "/build.json"])
    for (const method of ["GET", "HEAD"])
      assert.equal(publicationRequestAllowed(new Request(origin + pathname, { method })), true);
});
test("CMS, encoded CMS, preview and every mutation are stopped before the handler", () => {
  for (const pathname of [
    "/_emdash",
    "/_emdash/admin",
    "/_emdash/api/mcp",
    "/%5Femdash/admin",
    "/_emdash%2Fapi/content",
    "/_emdash//api/media/file/x",
    "/?%5Fpreview=token"
  ])
    assert.equal(publicationRequestAllowed(new Request(origin + pathname)), false, pathname);
  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    assert.equal(publicationRequestAllowed(new Request(origin, { method })), false, method);
  assert.equal(
    publicationRequestAllowed(
      new Request(origin, { headers: { Cookie: "session=x; emdash-edit-mode=true" } })
    ),
    false
  );
});

test("Astro-normalised edit-mode cookies cannot bypass the reading boundary", () => {
  for (const cookie of [
    "emdash-edit-mode=%74rue",
    "emdash-edit-mode = true",
    'emdash-edit-mode="true"',
    "emdash-edit-mode=false"
  ])
    assert.equal(
      publicationRequestAllowed(new Request(origin, { headers: { Cookie: cookie } })),
      false,
      cookie
    );
});

test("scheduled maintenance is disabled for publication and forwarded for editorial mode", async () => {
  const calls: unknown[][] = [];
  const scheduled = createPublicationScheduledHandler(
    async (event: unknown, env: unknown, context: unknown) => {
      calls.push([event, env, context]);
    }
  );
  await scheduled("event", { WOODHOUSE_PUBLICATION_MODE: "read-only" }, "context");
  assert.deepEqual(calls, []);
  const env = { WOODHOUSE_PUBLICATION_MODE: "editorial" };
  await scheduled("event", env, "context");
  assert.deepEqual(calls, [["event", env, "context"]]);
});
