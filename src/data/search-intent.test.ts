import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  aliasesFor,
  searchMatches,
  searchRank,
  searchScore,
  searchStopWords,
  searchTokens
} from "./search-intent.ts";

const seed = JSON.parse(readFileSync(new URL("../../seed/seed.json", import.meta.url), "utf8"));
const projects: { slug: string; data: Record<string, string> }[] = seed.content.projects;

/**
 * The same fields the published index carries for a project: the title, summary,
 * discipline and dated status text plus the reviewed intent aliases.
 */
const haystack = (project: { slug: string; data: Record<string, string> }) =>
  [
    project.data.name,
    project.data.discipline,
    project.data.title,
    project.data.summary,
    project.data.why,
    project.data.teaches,
    aliasesFor(project.slug)
  ]
    .filter(Boolean)
    .join(" ");

const ranked = (query: string) =>
  projects
    .map((project) => ({
      slug: project.slug,
      score: searchRank(haystack(project), query, aliasesFor(project.slug))
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.slug);

test("an ordinary intent phrase finds the project it means", () => {
  // The reported defect: "music for my game" found nothing while "music" worked.
  for (const [query, expected] of [
    ["music", "loftwahfm"],
    ["music for my game", "loftwahfm"],
    ["bubble shooter", "bubbles"],
    ["card game", "protocol-11"],
    ["build an app", "app-composer"],
    ["fishing game", "shoalshot"],
    ["fighting game", "fighter"],
    ["walking frame", "max"],
    ["fm", "loftwahfm"]
  ] as const) {
    assert.ok(
      projects.some(
        (project) => project.slug === expected && searchMatches(haystack(project), query)
      ),
      `"${query}" should match ${expected}`
    );
  }
});

test("the best match leads an intent phrase", () => {
  // LoftwahFM satisfies both tokens; a project that only mentions a game is an
  // alternative result, not the headline answer.
  assert.equal(ranked("music for my game")[0], "loftwahfm");
  assert.equal(ranked("bubble shooter")[0], "bubbles");
  assert.equal(ranked("card game")[0], "protocol-11");
});

test("stop words and short tokens do not decide a match", () => {
  const stop = new Set(searchStopWords);
  assert.deepEqual(
    searchTokens("how do i build an app for my game").filter((token) => !stop.has(token)),
    ["build", "app", "game"]
  );
  // A query made only of filler still shows the whole index rather than nothing.
  assert.equal(searchMatches("anything at all", "how do i"), true);
  assert.equal(searchMatches("anything at all", " "), true);
});

test("a query about nothing in the record matches nothing", () => {
  assert.deepEqual(ranked("quantum blockchain insurance"), []);
});

test("a two-letter word inside another word is not a match", () => {
  // "incident" must not match a project through the "in" in "inside".
  const haystackText = "Fighter inside a browser tab";
  assert.equal(searchScore(haystackText, "incident"), 0);
  // Real prefix relationships still work, in both directions.
  assert.equal(searchScore("an app builder inside", "apps"), 1);
  assert.equal(searchScore("bubble shooter game", "shooters"), 1);
});
