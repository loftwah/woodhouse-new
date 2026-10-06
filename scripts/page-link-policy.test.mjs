import { test } from "node:test";
import assert from "node:assert/strict";
import { isCloudflareHiddenContentLink } from "./page-link-policy.mjs";

const injected = {
  attrs: new Map([
    ["aria-hidden", "true"],
    ["style", "display: none !important; visibility: hidden !important"]
  ]),
  inner: ""
};
const managed = new URL("https://example.com/cdn-cgi/content?id=platform-token");
test("only the observed invisible Cloudflare content anchor is excluded", () => {
  assert.equal(isCloudflareHiddenContentLink(injected, managed), true);
  assert.equal(isCloudflareHiddenContentLink({ ...injected, inner: "Read more" }, managed), false);
  assert.equal(isCloudflareHiddenContentLink({ ...injected, attrs: new Map() }, managed), false);
  assert.equal(
    isCloudflareHiddenContentLink(injected, new URL("https://example.com/cdn-cgi/image/file")),
    false
  );
  assert.equal(
    isCloudflareHiddenContentLink(injected, new URL("https://example.com/missing?id=x")),
    false
  );
  assert.equal(
    isCloudflareHiddenContentLink(injected, new URL("https://example.com/cdn-cgi/content")),
    false
  );
});
