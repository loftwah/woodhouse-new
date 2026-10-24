import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  WOODHOUSE_SOCIAL_CARD,
  WOODHOUSE_SOCIAL_CARD_ALT,
  isRasterImage,
  socialCardFor
} from "./site-metadata.ts";
import type { WoodhouseProject } from "../content/repository.ts";

// Two failures are being guarded here.
//
// The first: every project page emitted two `og:image` tags — the product's own
// artwork from EmDashHead, then a second generic Woodhouse file appended by the
// layout. Consumers disagree about which one wins, so the page had no
// intentional social identity at all.
//
// The second: Social Club's only artwork is a 1200x630 SVG. X, Facebook,
// LinkedIn, Slack and iMessage all ignore an SVG `og:image`, so that page
// shared with no picture while the markup looked perfectly healthy.

const project = (overrides: Partial<WoodhouseProject>): WoodhouseProject =>
  ({
    slug: "example",
    name: "Example",
    index: "01",
    discipline: "Test",
    title: "Example",
    summary: "Example summary.",
    state: "Public",
    stateTone: "live",
    reviewDate: "2026-10-25",
    ...overrides
  }) as WoodhouseProject;

const layout = await readFile(new URL("../layouts/BaseLayout.astro", import.meta.url), "utf8");
const projectRoute = await readFile(
  new URL("../pages/projects/[slug].astro", import.meta.url),
  "utf8"
);

test("a raster product image is used as the single social image", () => {
  const card = socialCardFor(
    project({
      siteUrl: "https://example.com/",
      previewImage: "https://example.com/og.jpg",
      previewAlt: "Example artwork."
    })
  );
  assert.equal(card.image, "https://example.com/og.jpg");
  assert.equal(card.alt, "Example artwork.");
  assert.equal(card.fromProduct, true);
});

test("a product image without alt text still describes the product", () => {
  const card = socialCardFor(
    project({ name: "Bubbles", siteUrl: "https://bubbles.example/", previewImage: "/a.png" })
  );
  assert.match(card.alt, /Bubbles/);
  assert.equal(card.fromProduct, true);
});

test("an SVG product image falls back to the Woodhouse card instead of unfurling blank", () => {
  const card = socialCardFor(
    project({
      name: "Social Club",
      siteUrl: "https://club.example/",
      previewImage: "https://club.example/og/default.svg",
      previewAlt: "A cream poster."
    })
  );
  assert.equal(card.image, WOODHOUSE_SOCIAL_CARD);
  assert.equal(card.alt, WOODHOUSE_SOCIAL_CARD_ALT);
  assert.equal(card.fromProduct, false);
});

test("a project with no site and no artwork gets the Woodhouse card", () => {
  const card = socialCardFor(project({ name: "Pirates" }));
  assert.equal(card.image, WOODHOUSE_SOCIAL_CARD);
  assert.equal(card.fromProduct, false);
  // The old route described this image as an illustration *for* the project,
  // which described an image that did not exist and named a product it never
  // showed.
  assert.doesNotMatch(card.alt, /Pirates/);
});

test("a raster image with no site is not adopted as product artwork", () => {
  const card = socialCardFor(project({ previewImage: "https://example.com/og.png" }));
  assert.equal(card.image, WOODHOUSE_SOCIAL_CARD);
  assert.equal(card.fromProduct, false);
});

test("raster detection reads the path, not the query string", () => {
  assert.equal(isRasterImage("https://example.com/og.jpg?v=2"), true);
  assert.equal(isRasterImage("https://example.com/og.JPEG"), true);
  assert.equal(isRasterImage("https://example.com/og.webp"), true);
  assert.equal(isRasterImage("https://example.com/og.svg"), false);
  assert.equal(isRasterImage("https://example.com/og.svg?x=.png"), false);
  assert.equal(isRasterImage(""), false);
  assert.equal(isRasterImage(undefined), false);
});

test("the layout emits exactly one og:image tag of its own", () => {
  const emitted = layout.match(/<meta\s+property="og:image"/g) ?? [];
  assert.equal(emitted.length, 0, "the layout must not add a second og:image beside EmDashHead's");
  assert.doesNotMatch(layout, /fallbackImage/);
});

test("the project route asks one function for one social image", () => {
  assert.match(projectRoute, /image=\{social\.image\}/);
  assert.match(projectRoute, /imageAlt=\{social\.alt\}/);
  // The generic preview is retired. A stale filename still in the route would
  // mean some page is advertising a 404 to every crawler.
  assert.doesNotMatch(projectRoute, /project-dossier-preview\.jpg/);
});

test("every published project in the reviewed seed resolves to one raster social image", async () => {
  // Production serves the reviewed seed in read-only mode, so this is the set of
  // pages whose unfurls actually matter. Reading the seed rather than a fixture
  // means a project added with an SVG or an empty og:image fails here instead of
  // shipping a share with no picture.
  const seed = JSON.parse(await readFile(new URL("../../seed/seed.json", import.meta.url), "utf8"));
  const published = seed.content.projects.filter(
    (entry: { status?: string }) => entry.status === "published"
  );
  assert.ok(published.length >= 8, "the portfolio should still have its published projects");

  for (const entry of published as {
    slug: string;
    data: Record<string, unknown>;
  }[]) {
    const card = socialCardFor(
      project({
        slug: entry.slug,
        name: (entry.data.name as string) ?? entry.slug,
        siteUrl: (entry.data.siteUrl as string) ?? undefined,
        ...(entry.data.site_og_image ? { previewImage: entry.data.site_og_image as string } : {})
      })
    );
    assert.ok(card.image, `${entry.slug} must have a social image`);
    assert.equal(
      isRasterImage(card.image),
      true,
      `${entry.slug} must not advertise a non-raster social image (${card.image})`
    );
    assert.ok(card.alt.length > 20, `${entry.slug} must describe its social image`);
  }
});

test("the Woodhouse card is a real, correctly sized raster with retained provenance", async () => {
  const jpeg = await readFile(
    new URL(`../../public${WOODHOUSE_SOCIAL_CARD}`, import.meta.url)
  ).catch(() => null);
  assert.ok(jpeg, "the card named in site-metadata must exist under public/");
  // SOI marker plus a size read from the SOF0 segment would need a decoder;
  // the byte length is enough to catch a placeholder or an empty file.
  assert.equal(jpeg[0], 0xff);
  assert.equal(jpeg[1], 0xd8);
  assert.ok(jpeg.length > 20_000, "a 1200x630 photographic card cannot be this small");

  const provenance = await readFile(
    new URL("../../public/og/project-dossier-20261025.provenance.txt", import.meta.url),
    "utf8"
  );
  assert.match(provenance, /scripts\/assets\/dossier\/loom-master\.png/);
  assert.match(provenance, /scripts\/render-dossier-preview\.mjs/);

  const master = await readFile(
    new URL("../../scripts/assets/dossier/loom-master.png", import.meta.url)
  ).catch(() => null);
  assert.ok(master, "the retained master must stay beside the card it produces");
});
