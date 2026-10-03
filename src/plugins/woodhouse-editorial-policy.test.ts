import assert from "node:assert/strict";
import test from "node:test";
import { publicationBlock } from "./woodhouse-editorial-policy.ts";

// Every real publish carries an origin. The default here is the Admin's own API,
// which is the human path; agent paths are constructed explicitly below.
function event(collection: string, data: Record<string, unknown>) {
  return { collection, content: { data }, origin: { source: "api" as const } };
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

const satisfiedDispatch = {
  public_safe: true,
  title: "Dispatch",
  kind: "Field note",
  deck: "A reviewed summary.",
  review_date: "2026-10-03",
  source_reference: "Reviewed on preview.",
  lead: "What we believed.",
  lesson: "What we learned.",
  content: [{ _type: "prose", content: [] }]
};

function dispatchFrom(source: "api" | "mcp" | "visual-editor", role: number) {
  return {
    collection: "dispatches",
    content: { data: satisfiedDispatch },
    origin: { source },
    actor: { id: "01TEST", role, source }
  };
}

test("an agent cannot publish a record that satisfies every other rule", () => {
  assert.equal(
    publicationBlock(dispatchFrom("mcp", 50)),
    "Agent-originated changes cannot be published. Leave the record as a draft for human review."
  );
});

test("an agent cannot schedule around the publish gate either", () => {
  const scheduled = { ...dispatchFrom("mcp", 50), scheduledAt: "2026-10-04T09:00:00Z" };
  assert.equal(
    publicationBlock(scheduled),
    "Agent-originated changes cannot be published. Leave the record as a draft for human review."
  );
});

test("a human publishing in the Admin or the visual editor is unaffected", () => {
  assert.equal(publicationBlock(dispatchFrom("api", 50)), undefined);
  assert.equal(publicationBlock(dispatchFrom("visual-editor", 40)), undefined);
});

test("an agent refusal precedes the field checks, so it cannot be satisfied", () => {
  // Even a record that is public_safe, fully written and block-populated is
  // refused, because the block is about who is asking rather than what they set.
  const refusal = publicationBlock(dispatchFrom("mcp", 50));
  assert.ok(refusal && refusal.startsWith("Agent-originated"));
  assert.equal(publicationBlock(event("dispatches", satisfiedDispatch)), undefined);
});

test("a missing or unknown publish origin fails closed", () => {
  const base = { collection: "dispatches", content: { data: satisfiedDispatch } };
  const expected =
    "Agent-originated changes cannot be published. Leave the record as a draft for human review.";
  // A caller that forgets to declare an origin must not be able to publish.
  assert.equal(publicationBlock(base as never), expected);
  // Nor may a source EmDash adds later, until someone confirms it is human.
  assert.equal(publicationBlock({ ...base, origin: { source: "import" } } as never), expected);
});

test("collections outside the editorial contract stay untouched", () => {
  // The agent refusal is scoped to controlled collections only.
  assert.equal(
    publicationBlock({
      collection: "pages",
      content: { data: {} },
      origin: { source: "mcp" }
    } as never),
    undefined
  );
});
