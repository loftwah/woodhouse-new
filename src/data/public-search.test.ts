import test from "node:test";
import assert from "node:assert/strict";
import { campaignSearchItems, publicCampaignItems } from "./showcase-public.ts";

import {
  publicSearchPages,
  publicSearchTokens,
  publicSearchWords,
  rankPublicSearch
} from "./public-search.ts";

test("public search retains canonical content URLs, destination keywords, and content keywords", () => {
  const pages = publicSearchPages([
    {
      href: "/doctrine/",
      title: "Factory doctrine",
      description: "Factory decisions.",
      section: "Doctrine"
    },
    {
      href: "/projects/liferaft/",
      title: "Liferaft",
      description: "Recover email.",
      section: "Projects",
      keywords: "mbox"
    }
  ]);
  const entries = pages.map((page) => ({
    href: page.href,
    ...publicSearchWords(page.title, page.description, page.section, page.keywords)
  }));
  assert.equal(pages.filter((page) => page.href === "/doctrine/").length, 1);
  assert.equal(rankPublicSearch(entries, publicSearchTokens("Printful"))[0]?.href, "/doctrine/");
  assert.equal(
    rankPublicSearch(entries, publicSearchTokens("Find my mbox"))[0]?.href,
    "/projects/liferaft/"
  );
});

test("public search ranks intent before body, keeps tied order, and retains body prefix matching", () => {
  const entries = [
    {
      id: "body",
      ...publicSearchWords("Field note", "", "Stories", "", "A soundtrack about the moon")
    },
    { id: "first", ...publicSearchWords("Soundtrack", "", "Music") },
    { id: "second", ...publicSearchWords("Soundtracks", "", "Music") }
  ];
  assert.deepEqual(
    rankPublicSearch(entries, publicSearchTokens("find my sound")).map((entry) => entry.id),
    ["first", "second", "body"]
  );
  assert.deepEqual(
    rankPublicSearch(entries, publicSearchTokens("moonlit")).map((entry) => entry.id),
    ["body"]
  );
  assert.equal(rankPublicSearch(entries, publicSearchTokens("find my")), entries);
});

test("campaign search finds published pieces by placement and exact dimensions", () => {
  const entries = campaignSearchItems([
    { slug: "bubbles", name: "Bubbles" },
    { slug: "fighter", name: "Fighter" }
  ]).map((page) => ({
    href: page.href,
    ...publicSearchWords(page.title, page.description, page.section, page.keywords, page.searchText)
  }));
  for (const [query, href] of [
    ["Fighter X header", "/share/fighter/#november-fighter"],
    ["Bubbles 1080x1920", "/share/bubbles/#november-bubbles"],
    ["Bubbles 1080 × 1350", "/share/bubbles/#contact-studies-surface-tension"]
  ]) {
    assert.equal(rankPublicSearch(entries, publicSearchTokens(query))[0]?.href, href);
  }
  assert(!entries.some(({ href }) => href.startsWith("/share/foilbury/")));
});

test("fresh work leads on the same review date and archived Foilbury art is off the current index", () => {
  const items = publicCampaignItems(["foilbury", "loftwahfm", "shoalshot"]);
  assert.deepEqual(
    items.slice(0, 3).map(({ id }) => id),
    ["november-studio-foilbury", "november-studio-fm", "november-studio-tide"]
  );
  const foilbury = items.filter(({ project }) => project === "foilbury");
  assert.deepEqual(
    foilbury.map(({ id, archived }) => [id, Boolean(archived)]),
    [
      ["november-studio-foilbury", false],
      ["november-foilbury", true],
      ["foilbury-characters-worth-keeping", true]
    ]
  );
  assert.deepEqual(
    campaignSearchItems([{ slug: "foilbury", name: "Foilbury" }])
      .filter(({ href }) => href.startsWith("/share/foilbury/"))
      .map(({ href }) => href),
    ["/share/foilbury/#november-studio-foilbury"]
  );
});
