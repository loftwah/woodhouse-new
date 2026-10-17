import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import type { PublicMenuItem } from "../content/repository";
import { analyticsLabel, analyticsUrl, withAnalyticsLabel } from "./navigation.ts";

test("the analytics destination keeps one name in desktop and mobile navigation", () => {
  const links: PublicMenuItem[] = [
    { label: "Factory", url: "/factory/" },
    { label: "Activity", url: "/activity/" },
    { label: "Docs", url: "https://example.test/docs", target: "_blank" }
  ];
  const labelled = withAnalyticsLabel(links);
  assert.equal(analyticsLabel, "Analytics");
  assert.equal(analyticsUrl, "/activity/");
  assert.equal(labelled.find((link) => link.url === analyticsUrl)?.label, "Analytics");
  // Other labels and target behaviour are untouched.
  assert.deepEqual(
    labelled.filter((link) => link.url !== analyticsUrl),
    links.filter((link) => link.url !== analyticsUrl)
  );
  assert.equal(labelled[2]!.target, "_blank");
  assert.deepEqual(
    withAnalyticsLabel([{ label: "Portfolio activity", url: "/activity/" }])[0]!.label,
    "Analytics"
  );
});

test("the header uses the shared label for its fallback and CMS-provided entries", () => {
  const source = readFileSync("src/components/SiteHeader.astro", "utf8");
  // The old hard-coded labels are what drifted apart.
  assert.doesNotMatch(source, />\s*Portfolio activity\s*</);
  assert.doesNotMatch(source, />\s*Activity\s*</);
  assert.match(source, /import \{ analyticsLabel, analyticsUrl, withAnalyticsLabel \}/);
  // Both the desktop navigation and the mobile Index render the same constant.
  assert.equal(source.match(/\{analyticsLabel\}/g)?.length, 2);
  assert.match(source, /withAnalyticsLabel\(links\)/);
  assert.match(source, /withAnalyticsLabel\(houseIndexLinks\)/);
});
