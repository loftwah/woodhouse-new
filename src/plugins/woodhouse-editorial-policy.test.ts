import assert from "node:assert/strict";
import test from "node:test";
import plugin, { publicationBlock } from "./woodhouse-editorial-policy.ts";

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
      event("dispatches", {
        public_safe: true,
        title: "Note",
        kind: "Field note",
        deck: "A short note.",
        review_date: "2026-10-03",
        source_reference: "Reviewed on preview.",
        lead: "What we believed.",
        lesson: "What we learned.",
        content: []
      })
    ) ?? "",
    /at least one Woodhouse editorial block/
  );
});

test("a future review date is not a review that has happened", () => {
  const future = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  assert.match(
    publicationBlock(
      event("evidence_records", {
        public_safe: true,
        reviewed_at: future,
        proof_boundary: "Limited."
      })
    ) ?? "",
    /valid review date/
  );
});

test("a dispatch cannot publish with fields its public reader will discard", () => {
  const complete = {
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
  assert.equal(publicationBlock(event("dispatches", complete)), undefined);
  for (const field of ["kind", "review_date", "source_reference", "lead", "lesson"]) {
    const incomplete = { ...complete, [field]: "" };
    assert.match(
      publicationBlock(event("dispatches", incomplete)) ?? "",
      /dispatch kind, review date, source, lead and lesson/,
      field
    );
  }
});

test("a project status cannot publish without the fields its project reader needs", () => {
  const complete = {
    public_safe: true,
    project_key: "bubbles",
    snapshot_key: "2026-11-08-bubbles",
    state: "Public build",
    current: "The reviewed build is public.",
    next_proof: "Check the next release.",
    proof_boundary: "Does not establish adoption.",
    reviewed_at: "2026-11-08"
  };
  assert.equal(publicationBlock(event("project_statuses", complete)), undefined);
  for (const field of ["project_key", "snapshot_key", "state", "current", "next_proof"]) {
    const incomplete = { ...complete, [field]: "" };
    assert.match(
      publicationBlock(event("project_statuses", incomplete)) ?? "",
      /project, snapshot, state, current read and next proof/,
      field
    );
  }
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

test("an agent cannot schedule around the publish gate either", async () => {
  const scheduled = { ...dispatchFrom("mcp", 50), scheduledAt: "2026-10-04T09:00:00Z" };
  assert.deepEqual(await plugin.hooks["content:beforeSchedule"](scheduled as never), {
    cancel: true,
    reason:
      "Agent-originated changes cannot be published. Leave the record as a draft for human review."
  });
});

test("a controlled record can be published manually but cannot be scheduled", async () => {
  const manual = dispatchFrom("api", 50);
  const scheduled = { ...manual, scheduledAt: "2026-10-04T09:00:00Z" };
  const rejection = {
    cancel: true,
    reason:
      "Scheduled publication is unavailable for Woodhouse records. Publish the reviewed draft manually in the Admin."
  };
  assert.equal(await plugin.hooks["content:beforePublish"](manual as never), undefined);
  assert.deepEqual(await plugin.hooks["content:beforeSchedule"](scheduled as never), rejection);
  assert.deepEqual(
    await plugin.hooks["content:beforePublish"]({
      ...scheduled,
      origin: { source: "scheduler" }
    } as never),
    rejection
  );
  assert.equal(
    await plugin.hooks["content:beforeSchedule"]({ ...scheduled, collection: "pages" } as never),
    undefined
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
