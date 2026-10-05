import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Portfolio projects are reviewed separately and the list is sorted by dossier
// order, so `projects[0]` is Bubbles and carries the launch review date. Taking
// the portfolio's date from the first project reports the *oldest* review as
// though it described the whole site.
//
// That was invisible while every project shared one date, and it became a false
// claim the moment Asset Hunter was re-reviewed on its own: the footer of every
// page printed "Reviewed 28 September 2026" while the newest project state was
// 5 October 2026, and `llms.txt` — read by agents deciding how far to trust the
// record — told them the snapshot was a week older than it was.
//
// These assertions read the two surfaces and the seed together, so the reported
// date cannot silently go back to being the first project's.

const baseLayout = await readFile(new URL("../layouts/BaseLayout.astro", import.meta.url), "utf8");
const llmsTxt = await readFile(new URL("../pages/llms.txt.ts", import.meta.url), "utf8");
const seed = JSON.parse(await readFile(new URL("../../seed/seed.json", import.meta.url), "utf8"));

test("the seed still contains projects with more than one review date", () => {
  // The fixture this guards against is a portfolio where every project happens
  // to share a date. If that ever becomes true again, these tests pass for the
  // wrong reason and the shared date would hide a reintroduced bug.
  const dates = new Set(
    (seed.content.project_statuses ?? []).map(
      (status: { data?: { reviewed_at?: string } }) => status.data?.reviewed_at
    )
  );
  assert.ok(dates.size > 1, "expected the portfolio to span more than one review date");
});

test("the footer reports the newest portfolio review, not the first project's", () => {
  assert.match(
    baseLayout,
    /portfolioReadout/,
    "the footer must derive its date from the portfolio"
  );
  assert.doesNotMatch(
    baseLayout,
    /projects\[0\]\?\.reviewDate/,
    "the footer must not take the portfolio's date from the first project, which is the oldest"
  );
});

test("llms.txt reports the newest portfolio review, not the first project's", () => {
  assert.match(llmsTxt, /portfolioReadout/, "llms.txt must derive its date from the portfolio");
  assert.doesNotMatch(
    llmsTxt,
    /projects\[0\]\?\.reviewDate/,
    "llms.txt must not take the portfolio's date from the first project, which is the oldest"
  );
});
