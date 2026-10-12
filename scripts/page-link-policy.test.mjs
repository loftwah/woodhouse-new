import { test } from "node:test";
import assert from "node:assert/strict";
import { isCloudflareHiddenContentLink, socialImageURL } from "./page-link-policy.mjs";

test("social image audits retain the HTML-escaped game and snapshot query", () => {
  const url = socialImageURL(
    "/api/activity-card.png?snapshot=1791774000&amp;game=fighter",
    "https://example.com/activity/"
  );
  assert.equal(
    url.pathname + url.search,
    "/api/activity-card.png?snapshot=1791774000&game=fighter"
  );
  assert.equal(url.searchParams.get("game"), "fighter");
  assert.equal(
    socialImageURL("/og/woodhouse.jpg", "https://example.com/").pathname,
    "/og/woodhouse.jpg"
  );
});

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
