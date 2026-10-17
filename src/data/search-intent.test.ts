import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { aliasesFor, searchMatches, searchStopWords, searchTokens } from "./search-intent.ts";

const seed = JSON.parse(readFileSync(new URL("../../seed/seed.json", import.meta.url), "utf8"));
const projects: { slug: string; data: Record<string, string> }[] = seed.content.projects;

const haystack = (project: { slug: string; data: Record<string, string> }) =>
  [
    project.data.name,
    project.data.title,
    project.data.summary,
    project.data.why,
    project.data.teaches,
    aliasesFor(project.slug)
  ]
    .filter(Boolean)
    .join(" ");

const matchingSlugs = (query: string) =>
  projects.filter((project) => searchMatches(haystack(project), query)).map((p) => p.slug);

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
    ["walking frame", "max"]
  ] as const) {
    assert.ok(matchingSlugs(query).includes(expected), `"${query}" should find ${expected}`);
  }
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
  assert.deepEqual(matchingSlugs("quantum blockchain insurance"), []);
});

test("a plural query token still finds the singular product word", () => {
  assert.ok(matchingSlugs("bubbles shooter").includes("bubbles"));
  assert.ok(matchingSlugs("card games").includes("protocol-11"));
});
