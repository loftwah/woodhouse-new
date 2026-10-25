import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readPortfolioEdition, editionPath } from "./what-we-built.ts";
import type { EditorialDispatch } from "../content/repository.ts";
const seed = JSON.parse(readFileSync(new URL("../../seed/seed.json", import.meta.url), "utf8"));
const row = seed.content.dispatches.find(
  (d: { slug: string }) => d.slug === "what-we-built-2026-10-25"
);
const dispatch = (): EditorialDispatch => ({
  ...row.data,
  slug: row.slug,
  reviewDate: row.data.review_date,
  sourceReference: row.data.source_reference,
  publishedAt: null,
  updatedAt: null,
  featuredImage: null
});

test("published edition reads its editorial content from the existing CMS dispatch", () => {
  const edition = readPortfolioEdition(dispatch())!;
  assert.equal(edition.entries.length, 10);
  assert.deepEqual(
    edition.entries.map((e) => e.slug).sort(),
    seed.content.projects.map((p: { slug: string }) => p.slug).sort()
  );
  assert.equal(edition.path, "/editions/what-we-built/");
  assert.match(
    edition.entries.find((e) => e.slug === "social-club")!.body,
    /waitlist; paid membership is not open/
  );
  assert.match(
    edition.entries.find((e) => e.slug === "max")!.body,
    /no physical walker connection/
  );
});
test("editing a draft title and story does not require changing the renderer", () => {
  const original = dispatch();
  const draft = structuredClone(original);
  draft.slug = "rehearsal";
  draft.title = "An evening kept";
  const block = draft.content.find((b) => b._type === "portfolio_entry")!;
  if (block._type === "portfolio_entry") block.headline = "A changed draft headline";
  const result = readPortfolioEdition(draft)!;
  assert.equal(result.dispatch.title, "An evening kept");
  assert.equal(result.entries[0]!.headline, "A changed draft headline");
  assert.deepEqual(result.entries[1], readPortfolioEdition(original)!.entries[1]);
  assert.equal(editionPath("rehearsal"), "/editions/rehearsal/");
});
test("incomplete, duplicated, future-sourced and unsafe-source entries fail closed", () => {
  for (const mutation of ["body", "source", "date", "duplicate"]) {
    const d = dispatch();
    const b = d.content.find((b) => b._type === "portfolio_entry")!;
    if (b._type !== "portfolio_entry") throw Error("missing fixture");
    if (mutation === "body") b.body = "";
    if (mutation === "source") b.source_url = "javascript:alert(1)";
    if (mutation === "date") b.source_reviewed = "2026-10-26";
    if (mutation === "duplicate") d.content.push(structuredClone(b));
    assert.equal(readPortfolioEdition(d), null, mutation);
  }
});
