import assert from "node:assert/strict";
import test from "node:test";
import type { WoodhouseProject } from "../content/repository.ts";
import { createProjectArtworkReader } from "./live-project-artwork.ts";
import { socialCardFor } from "./site-metadata.ts";

const project = Object.freeze({
  slug: "app-composer",
  name: "App Composer",
  siteUrl: "https://composer.loftwah.com/",
  previewImage: "https://composer.loftwah.com/old.jpg",
  previewAlt: "The old composition.",
  summary: "A reviewed description.",
  reviewDate: "2026-10-25"
}) as WoodhouseProject;
const html = (image: string) =>
  new Response(
    `<html><head>
  <meta content='${image}' property='og:image'>
  <meta name="og:image:alt" content="A new &quot;approved&quot; image &amp; mark.">
  <meta property="og:image:width" content="1600">
  <meta property="og:image:height" content="900">
  </head><body></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } }
  );

test("reads the publisher's OG URL, alt and dimensions without changing reviewed evidence", async () => {
  const reader = createProjectArtworkReader((async () =>
    html("/new.jpg?v=2&amp;colour=orange")) as typeof fetch);
  const resolved = await reader(project);
  assert.equal(resolved.previewImage, "https://composer.loftwah.com/new.jpg?v=2&colour=orange");
  assert.equal(resolved.previewAlt, 'A new "approved" image & mark.');
  assert.equal(resolved.previewWidth, 1600);
  assert.equal(resolved.previewHeight, 900);
  assert.equal(resolved.summary, project.summary);
  assert.equal(resolved.reviewDate, project.reviewDate);
  assert.equal(project.previewImage, "https://composer.loftwah.com/old.jpg");
  assert.equal(socialCardFor(resolved).width, 1600);
});

test("a changed live filename automatically replaces the cached image after five minutes", async () => {
  let now = 1000;
  let image = "/first.jpg";
  let calls = 0;
  const reader = createProjectArtworkReader(
    (async () => {
      calls++;
      return html(image);
    }) as typeof fetch,
    () => now
  );
  assert.equal((await reader(project)).previewImage, "https://composer.loftwah.com/first.jpg");
  image = "/second.jpg";
  now += 299_999;
  assert.equal((await reader(project)).previewImage, "https://composer.loftwah.com/first.jpg");
  now += 1;
  assert.equal((await reader(project)).previewImage, "https://composer.loftwah.com/second.jpg");
  assert.equal(calls, 2);
});

test("a temporary upstream outage retains the last fetched product image", async () => {
  let now = 1000;
  let unavailable = false;
  const reader = createProjectArtworkReader(
    (async () => {
      if (unavailable) throw new Error("offline");
      return html("/current.jpg");
    }) as typeof fetch,
    () => now
  );
  await reader(project);
  unavailable = true;
  now += 300_000;
  assert.equal((await reader(project)).previewImage, "https://composer.loftwah.com/current.jpg");
});

test("cached renders reuse resolved data and stripped query parameters cannot change the read", async () => {
  let calls = 0;
  const reader = createProjectArtworkReader((async (url, options) => {
    calls++;
    assert.equal(url, "https://composer.loftwah.com/");
    assert.equal(options?.redirect, "manual");
    assert.ok(options?.signal);
    return html("/current.jpg");
  }) as typeof fetch);
  const withQuery = { ...project, siteUrl: project.siteUrl + "?private=ignored#fragment" };
  await reader(withQuery);
  await Promise.all([reader(withQuery), reader(project)]);
  assert.equal(calls, 1);
});

test("a missing or arbitrary site never causes an outbound read", async () => {
  const reader = createProjectArtworkReader((async () => {
    assert.fail("must not fetch");
  }) as typeof fetch);
  for (const siteUrl of [
    undefined,
    "https://example.com/",
    "https://composer.loftwah.com:8443/",
    "https://user:pass@composer.loftwah.com/"
  ]) {
    const entry = { ...project, siteUrl };
    assert.equal(await reader(entry), entry);
  }
});

test("redirects, oversized HTML, missing OG, unapproved image URLs and wrong MIME keep the reviewed image", async () => {
  const responses = [
    new Response(null, { status: 302, headers: { location: "https://example.com/" } }),
    new Response("x".repeat(256 * 1024 + 1), { headers: { "content-type": "text/html" } }),
    html("https://example.com/image.jpg"),
    new Response("<html><head></head></html>", { headers: { "content-type": "text/html" } }),
    new Response("{}", { headers: { "content-type": "application/json" } })
  ];
  for (const response of responses) {
    const reader = createProjectArtworkReader((async () => response) as typeof fetch);
    assert.equal(await reader(project), project);
  }
});

test("comments, script literals and body metadata cannot replace the actual head image", async () => {
  const reader = createProjectArtworkReader(
    (async () =>
      new Response(
        `<html><head>
    <!-- <meta property="og:image" content="/comment.jpg"> -->
    <script>const example = '<meta property="og:image" content="/script.jpg">';</script>
    <meta property="og:image" content="/real.jpg"></head>
    <body><meta property="og:image" content="/body.jpg"></body></html>`,
        { headers: { "content-type": "text/html" } }
      )) as typeof fetch
  );
  const resolved = await reader(project);
  assert.equal(resolved.previewImage, "https://composer.loftwah.com/real.jpg");
  assert.equal(resolved.previewAlt, "Artwork from the App Composer site.");
});
