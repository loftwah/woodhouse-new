import assert from "node:assert/strict";
import test from "node:test";
import { stat } from "node:fs/promises";
import { campaignItems } from "./showcase-campaign.ts";
import {
  publicCampaignItems,
  campaignSitemapEntries,
  campaignResponsiveImage
} from "./showcase-public.ts";

const published = [
  ...new Set(campaignItems.flatMap((item) => [item.project, ...(item.requiredProjects ?? [])]))
];

test("withdrawn projects disappear from collections and the image sitemap, including composites", () => {
  for (const slug of published.filter((slug) => slug !== "woodhouse")) {
    const remaining = published.filter((entry) => entry !== slug);
    const visible = publicCampaignItems(remaining);
    assert.ok(
      visible.every((item) => item.project !== slug && !item.requiredProjects?.includes(slug))
    );
    const sitemap = campaignSitemapEntries(remaining);
    assert.ok(!sitemap.some((entry) => entry.path === `/share/${slug}/`));
    const removed = campaignItems.filter(
      (item) => item.project === slug || item.requiredProjects?.includes(slug)
    );
    assert.ok(
      sitemap.every(
        (entry) => !entry.images.some((image) => removed.some((item) => item.original === image))
      )
    );
  }
});

test("every advertised campaign original and bounded preview exists locally", async () => {
  assert.equal(new Set(campaignItems.map((item) => item.id)).size, campaignItems.length);
  for (const item of campaignItems) {
    assert.match(item.image, /^\/campaign\/20261025(?:-v2)?\/[a-z0-9-]+\.(webp|jpg|png)$/);
    assert.match(item.original, /^\/campaign\/20261025(?:-v2)?\/[a-z0-9-]+\.(webp|jpg|png)$/);
    assert.match(item.source, /^(https:\/\/|\/campaign\/20261025\/provenance\.txt$)/);
    assert.ok(item.alt.length > 30 && item.caption.length > 20 && item.credit.length > 3);
    assert.ok(item.width > 0 && item.height > 0);
    const preview = await stat(new URL(`../../public${item.image}`, import.meta.url));
    const original = await stat(new URL(`../../public${item.original}`, import.meta.url));
    const responsive = campaignResponsiveImage(item);
    const thumbnail = await stat(new URL(`../../public${responsive.thumbnail}`, import.meta.url));
    assert.ok(
      thumbnail.size < preview.size,
      `${item.id}: small tile avoids the full preview transfer`
    );
    if (item.landscapeImage) {
      assert.match(
        item.landscapeImage,
        /^\/campaign\/20261025(?:-v2)?\/[a-z0-9-]+-landscape\.jpg$/
      );
      assert.ok(
        (await stat(new URL(`../../public${item.landscapeImage}`, import.meta.url))).size <
          6 * 1024 * 1024
      );
    }
    assert.ok(preview.size < 800 * 1024, `${item.id}: preview should stay bounded`);
    assert.ok(original.size < 6 * 1024 * 1024, `${item.id}: original fits image actions`);
    // Woodhouse's new cover uses only its own fibre artwork. The old assertion
    // required sibling membership for every Woodhouse image because its first
    // cover was a three-product composite. Actual composites still declare and
    // exercise their input dependencies in the withdrawal test above.
  }
});
