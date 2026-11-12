import test from "node:test";
import assert from "node:assert/strict";
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
