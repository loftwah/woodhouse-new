import { test } from "node:test";
import assert from "node:assert/strict";
import { assertPublicationContent, previewReceiptIsFresh } from "./publication-content.mjs";

const seed = {
  content: {
    projects: [
      {
        slug: "game",
        status: "published",
        data: { public_safe: true, name: "Game", discipline: "Cards", summary: "Reviewed game" }
      }
    ],
    project_statuses: [
      {
        status: "published",
        data: {
          public_safe: true,
          project_key: "game",
          reviewed_at: "2026-10-07",
          state: "Live",
          current: "Journey",
          next_proof: "Phone",
          proof_boundary: "Reported"
        }
      }
    ],
    factory_snapshots: [
      { status: "published", data: { public_safe: true, reviewed_at: "2026-10-07" } }
    ]
  }
};
const identity = {
  content: {
    available: true,
    generation: "sha256:" + "a".repeat(64),
    snapshotReviewed: "2026-10-07",
    counts: {
      projects: 1,
      project_statuses: 1,
      factory_snapshots: 1,
      evidence_records: 0,
      dispatches: 0,
      incidents: 0,
      conversations: 0
    }
  }
};
const facts = {
  reviewed: "2026-10-07",
  projectCount: 1,
  projects: [
    {
      slug: "game",
      name: "Game",
      discipline: "Cards",
      summary: "Reviewed game",
      state: "Live",
      current: "Journey",
      nextProof: "Phone",
      proofBoundary: "Reported",
      reviewed: "2026-10-07"
    }
  ]
};

test("publication requires available content, current counts and exact reviewed project text", () => {
  assert.doesNotThrow(() => assertPublicationContent(seed, identity, facts));
  assert.throws(() => assertPublicationContent(seed, { content: { available: false } }, facts));
  const staleCounts = structuredClone(identity);
  staleCounts.content.counts.projects = 0;
  assert.throws(() => assertPublicationContent(seed, staleCounts, facts));
  const staleDate = structuredClone(identity);
  staleDate.content.snapshotReviewed = "2026-10-05";
  assert.throws(() => assertPublicationContent(seed, staleDate, facts));
  const staleText = structuredClone(facts);
  staleText.projects[0].current = "Before Journey";
  assert.throws(() => assertPublicationContent(seed, identity, staleText));
});

test("preview receipt rejects malformed, future and expired timestamps", () => {
  const now = Date.parse("2026-10-07T00:00:00Z");
  assert.equal(previewReceiptIsFresh({ deployedAt: new Date(now).toISOString() }, now), true);
  for (const deployedAt of [
    undefined,
    "invalid",
    new Date(now + 120000).toISOString(),
    new Date(now - 86400001).toISOString()
  ])
    assert.equal(previewReceiptIsFresh({ deployedAt }, now), false);
});

test("publication refuses stale adoption even when collection counts and dates match", () => {
  const withCapability = structuredClone(seed);
  const review = {
    _type: "capability_review",
    capability_key: "radio",
    reviewed_at: "2026-10-07",
    available_version: "1.0.0",
    consumers: [
      { project_key: "game", planned: true, implemented: false, deployed: false, verified: false }
    ]
  };
  withCapability.content.dispatches = [
    { status: "published", data: { public_safe: true, content: [review] } }
  ];
  const build = structuredClone(identity);
  build.content.counts.dispatches = 1;
  const served = { ...facts, capabilities: [{ review }] };
  assert.doesNotThrow(() => assertPublicationContent(withCapability, build, served));
  const stale = structuredClone(served);
  stale.capabilities[0].review.consumers[0].verified = true;
  assert.throws(() => assertPublicationContent(withCapability, build, stale), /adoption stages/);
});
