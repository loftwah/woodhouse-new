import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import type { PublicMenuItem } from "../content/repository";
import {
  analyticsLabel,
  analyticsUrl,
  isCurrentDestination,
  leaderboardsLabel,
  leaderboardsUrl,
  normalisePathname,
  uniqueDestinations,
  withActivityNavigation,
  withDestinationLabels
} from "./navigation.ts";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("the activity destinations keep one name in desktop and mobile navigation", () => {
  const links: PublicMenuItem[] = [
    { label: "Factory", url: "/factory/" },
    { label: "Activity", url: "/activity/" },
    { label: "Project leaderboards", url: "/activity/leaderboards/" },
    { label: "Docs", url: "https://example.test/docs", target: "_blank" }
  ];
  const labelled = withDestinationLabels(links);
  assert.equal(analyticsLabel, "Analytics");
  assert.equal(analyticsUrl, "/activity/");
  assert.equal(leaderboardsLabel, "Leaderboards");
  assert.equal(leaderboardsUrl, "/activity/leaderboards/");
  assert.equal(labelled.find((link) => link.url === analyticsUrl)?.label, analyticsLabel);
  assert.equal(labelled.find((link) => link.url === leaderboardsUrl)?.label, leaderboardsLabel);
  // Other labels and target behaviour are untouched.
  assert.deepEqual(
    labelled.filter((link) => link.url !== analyticsUrl && link.url !== leaderboardsUrl),
    links.filter((link) => link.url !== analyticsUrl && link.url !== leaderboardsUrl)
  );
  assert.equal(labelled[3]!.target, "_blank");
  // Query strings and a missing trailing slash still name the same destination.
  assert.equal(
    withDestinationLabels([{ label: "Activity", url: "/activity/?days=7" }])[0]!.label,
    analyticsLabel
  );
  assert.equal(
    withDestinationLabels([{ label: "Project leaderboards", url: "/activity/leaderboards" }])[0]!
      .label,
    leaderboardsLabel
  );
  // The input is not mutated.
  assert.equal(links[1]!.label, "Activity");
});

test("CMS primary and house-index duplicates cannot create two Leaderboards entries", () => {
  const primary: PublicMenuItem[] = [
    { label: "Projects", url: "/projects/" },
    { label: "Analytics", url: "/activity/" },
    { label: "Share", url: "/share/" },
    { label: "About", url: "/dean/" }
  ];
  const houseIndex: PublicMenuItem[] = [
    { label: "Factory", url: "/factory/" },
    { label: "Project leaderboards", url: "/activity/leaderboards/" },
    { label: "Contact", url: "/contact/" }
  ];
  const navigation = withActivityNavigation([...primary, ...houseIndex]);
  const leaderboards = navigation.filter((link) => link.url === leaderboardsUrl);
  assert.equal(leaderboards.length, 1);
  assert.equal(leaderboards[0]!.label, leaderboardsLabel);
  assert.equal(navigation.filter((link) => link.url === analyticsUrl).length, 1);
  assert.equal(
    navigation.findIndex((link) => link.url === leaderboardsUrl),
    navigation.findIndex((link) => link.url === analyticsUrl) + 1
  );
  assert.ok(navigation.some((link) => link.url === "/factory/"));
  assert.equal(uniqueDestinations([...primary, ...primary]).length, primary.length);
});

test("a CMS-supplied Leaderboards entry survives without a fallback duplicate", () => {
  const navigation = withActivityNavigation([
    { label: "Analytics", url: "/activity/" },
    { label: "Rankings", url: "/activity/leaderboards/" },
    { label: "Share", url: "/share/" }
  ]);
  assert.deepEqual(
    navigation.map((link) => link.url),
    ["/activity/", "/activity/leaderboards/", "/share/"]
  );
  assert.equal(navigation.find((link) => link.url === leaderboardsUrl)?.label, leaderboardsLabel);
});

test("missing activity destinations get one shared fallback in the right order", () => {
  const navigation = withActivityNavigation([
    { label: "Projects", url: "/projects/" },
    { label: "Share", url: "/share/" }
  ]);
  assert.deepEqual(
    navigation.map((link) => link.url),
    ["/activity/", "/activity/leaderboards/", "/projects/", "/share/"]
  );
  assert.deepEqual(navigation.slice(0, 2), [
    { label: analyticsLabel, url: analyticsUrl },
    { label: leaderboardsLabel, url: leaderboardsUrl }
  ]);
});

test("the seed primary menu ships both activity destinations for fresh installs", () => {
  const seed = JSON.parse(read("../../seed/seed.json")) as {
    menus: Array<{ name: string; items: PublicMenuItem[] }>;
  };
  const primary = seed.menus.find((menu) => menu.name === "primary");
  assert.ok(primary, "expected a primary menu in the seed");
  const leaderboards = primary.items.filter((item) => item.url === leaderboardsUrl);
  assert.equal(leaderboards.length, 1);
  assert.equal(leaderboards[0]!.label, leaderboardsLabel);
  assert.equal(primary.items.filter((item) => item.url === analyticsUrl).length, 1);
  assert.equal(primary.items.find((item) => item.url === analyticsUrl)?.label, analyticsLabel);
});

test("active navigation compares pathnames, not query-bearing canonical paths", () => {
  assert.equal(normalisePathname("/"), "/");
  assert.equal(normalisePathname("/activity/"), "/activity/");
  assert.equal(normalisePathname("/activity/leaderboards"), "/activity/leaderboards/");
  assert.equal(
    normalisePathname("/activity/leaderboards/?report=abc&days=28&measure=merged"),
    "/activity/leaderboards/"
  );
  assert.equal(
    isCurrentDestination("/activity/leaderboards/?report=abc&days=28", leaderboardsUrl),
    true
  );
  assert.equal(isCurrentDestination("/activity/?report=abc&days=28", analyticsUrl), true);
  assert.equal(isCurrentDestination("/activity/leaderboards/", analyticsUrl), false);
  assert.equal(isCurrentDestination("/activity/", leaderboardsUrl), false);
  assert.equal(isCurrentDestination("/activity/listening/", analyticsUrl), false);
  assert.equal(isCurrentDestination("https://example.test/activity/", analyticsUrl), false);
});

test("the layout and both header navigations use the shared current destination", () => {
  const layout = read("../layouts/BaseLayout.astro");
  assert.match(layout, /suppliedCurrentPath \?\? Astro\.url\.pathname/);
  assert.match(layout, /<SiteHeader currentPath=\{currentPath\}/);

  const header = read("../components/SiteHeader.astro");
  assert.match(header, /leaderboardsLabel|withActivityNavigation/);
  assert.match(header, /withActivityNavigation\(primary\)/);
  assert.match(header, /withActivityNavigation\(\[\.\.\.primary, \.\.\.houseIndex\]\)/);
  assert.match(header, /\{desktopLinks\.map/);
  assert.match(header, /\{mobileLinks\.map/);
  assert.match(header, /isCurrentDestination\(currentPath, link\.url\)/);
  assert.doesNotMatch(header, /aria-current=\{currentPath ===/);
});

test("the homepage and eligible project dossiers offer restrained discovery links", () => {
  const home = read("../pages/index.astro");
  assert.match(home, /href="\/activity\/leaderboards\/"/);
  assert.match(home, /See the latest project leaderboards/);

  const dossier = read("../pages/projects/[slug].astro");
  assert.match(
    dossier,
    /import \{ leaderboardProjects \} from "\.\.\/\.\.\/data\/github-leaderboards"/
  );
  assert.match(dossier, /leaderboardProjects\.some\(\(entry\) => entry\.slug === project\.slug\)/);
  assert.match(dossier, /See where \{project\.name\} ranks/);
  assert.match(dossier, /href=\{`\/activity\/leaderboards\/\?project=\$\{project\.slug\}`\}/);
});

test("the phone Index targets are at least 44px tall", () => {
  const css = read("../styles/global.css");
  assert.match(
    css,
    /\.mobile-index nav a \{[^}]*min-height: 2\.75rem;[^}]*\}/,
    "mobile Index links need a 44px tap target"
  );
});
