import assert from "node:assert/strict";
import test from "node:test";
import { publicationBlock } from "./woodhouse-editorial-policy.ts";

function event(collection: string, data: Record<string, unknown>) {
  return { collection, content: { data } };
}

test("editorial policy requires explicit public approval", () => {
  assert.equal(
    publicationBlock(
      event("projects", { name: "Project", title: "Dossier", summary: "Reviewed." })
    ),
    "Mark this record as approved for public use before publishing."
  );
});

test("editorial policy blocks impossible review dates and missing proof boundaries", () => {
  assert.match(
    publicationBlock(
      event("evidence_records", {
        public_safe: true,
        reviewed_at: "2026-02-30",
        proof_boundary: "Limited."
      })
    ) ?? "",
    /valid review date/
  );
  assert.match(
    publicationBlock(
      event("project_statuses", {
        public_safe: true,
        reviewed_at: "2026-09-30",
        proof_boundary: "  "
      })
    ) ?? "",
    /what this record does not prove/
  );
});

test("editorial policy keeps conversation source review and structured dispatch content gates", () => {
  assert.match(
    publicationBlock(
      event("conversations", {
        public_safe: true,
        reviewed_at: "2026-09-30",
        proof_boundary: "Summary only.",
        source_reviewed: false
      })
    ) ?? "",
    /human review/
  );
  assert.match(
    publicationBlock(
      event("dispatches", { public_safe: true, title: "Note", deck: "A short note.", content: [] })
    ) ?? "",
    /at least one Woodhouse editorial block/
  );
});

test("valid reviewed records pass and unrelated collections are untouched", () => {
  assert.equal(
    publicationBlock(
      event("incidents", {
        public_safe: true,
        reviewed_at: "2024-02-29",
        proof_boundary: "Does not establish production state.",
        initial_belief: "The cache was current.",
        what_happened: "The page served an old response.",
        evidence: "A live request showed the stale header.",
        root_cause: "The route used the wrong cache key.",
        factory_change: "The route now tags this response."
      })
    ),
    undefined
  );
  assert.equal(publicationBlock(event("pages", { public_safe: false })), undefined);
});
