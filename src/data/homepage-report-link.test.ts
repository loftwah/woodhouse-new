import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// The EmDash migration moved the homepage's portfolio-report entry point from a
// hardcoded data array to the CMS, and dropped it in the process: the CTA
// disappeared from `src/pages/index.astro` while still existing in production,
// so the newest report was reachable only from the dispatches index and the
// search index. Nothing failed. The link simply was not there any more.
//
// These assertions read the page source and the seed together, so the link and
// the record it must point at cannot drift apart silently.
const homepage = await readFile(new URL("../pages/index.astro", import.meta.url), "utf8");
const seed = JSON.parse(await readFile(new URL("../../seed/seed.json", import.meta.url), "utf8"));

const dispatches: Array<{ slug: string; data?: { kind?: string } }> = seed.content.dispatches ?? [];
const reports = dispatches.filter((entry) => entry.data?.kind === "Portfolio report");

test("the seed holds a portfolio report for the homepage to offer", () => {
  assert.ok(reports.length > 0, "expected the seed to describe a Portfolio report dispatch");
});

test("the homepage still offers the portfolio report", () => {
  assert.match(
    homepage,
    /Read the portfolio report/,
    "the homepage lost its portfolio-report entry point in the EmDash migration"
  );
});

test("the homepage report link is built from content, not a hardcoded slug", () => {
  assert.match(
    homepage,
    /href=\{`\/dispatches\/\$\{latestReport\.slug\}\/`\}/,
    "the report link must follow the newest report in the read model"
  );
  // A hardcoded slug would silently point at a superseded report the next time
  // a newer one is reviewed.
  assert.doesNotMatch(
    homepage,
    /href="\/dispatches\/[a-z0-9-]+\/"[^>]*>\s*Read the portfolio report/,
    "the report link must not be pinned to one slug"
  );
});

test("the homepage resolves the report by kind", () => {
  assert.match(homepage, /kind === "Portfolio report"/);
});
