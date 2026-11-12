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
    href: page.href ?? "",
    ...publicSearchWords(page.title, page.description, page.section, page.keywords, page.searchText)
  }));
  assert(entries.every(({ href }) => href));
  const cases: [string, string][] = [
    ["Fighter X header", "/share/fighter/#making-of-fighter"],
    ["Bubbles 1080x1920", "/share/bubbles/#project-study-bubble-bank"],
    ["Bubbles 1080 × 1350", "/share/bubbles/#poster-study-bubbles"]
  ];
  for (const [query, href] of cases) {
    assert.equal(rankPublicSearch(entries, publicSearchTokens(query))[0]?.href, href);
  }
  assert(!entries.some(({ href }) => href.startsWith("/share/foilbury/")));
  assert(!entries.some(({ href }) => href.includes("#contact-studies-")));
});

test("fresh work leads on the same review date and archived Foilbury art is off the current index", () => {
  const items = publicCampaignItems(["foilbury", "loftwahfm", "shoalshot"]);
  assert.deepEqual(
    items.slice(0, 4).map(({ id }) => id),
    [
      "project-study-moss-paper",
      "project-study-reef-field-guide",
      "project-study-moss-foil",
      "project-study-cartridge-sleeve"
    ]
  );
  const foilbury = items.filter(({ project }) => project === "foilbury");
  assert.deepEqual(
    foilbury.map(({ id, archived }) => [id, Boolean(archived)]),
    [
      ["project-study-moss-paper", false],
      ["project-study-moss-foil", false],
      ["direct-social-facebook", false],
      ["direct-social-instagram-moss", false],
      ["poster-study-foilbury", false],
      ["making-of-foilbury", false],
      ["field-notes-foilbury", false],
      ["product-social-foilbury", false],
      ["november-studio-foilbury", false],
      ["november-foilbury", true],
      ["foilbury-characters-worth-keeping", true]
    ]
  );
  assert.deepEqual(
    campaignSearchItems([{ slug: "foilbury", name: "Foilbury" }])
      .filter(({ href }) => href.startsWith("/share/foilbury/"))
      .map(({ href }) => href),
    [
      "/share/foilbury/#project-study-moss-paper",
      "/share/foilbury/#project-study-moss-foil",
      "/share/foilbury/#direct-social-facebook",
      "/share/foilbury/#direct-social-instagram-moss",
      "/share/foilbury/#poster-study-foilbury",
      "/share/foilbury/#making-of-foilbury",
      "/share/foilbury/#field-notes-foilbury",
      "/share/foilbury/#product-social-foilbury",
      "/share/foilbury/#november-studio-foilbury"
    ]
  );
});
