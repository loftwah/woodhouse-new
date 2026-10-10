import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { projectCapabilities } from "./capabilities.ts";
import type { CapabilityReview } from "./capabilities.ts";
const seed = JSON.parse(await readFile(new URL("../../seed/seed.json", import.meta.url), "utf8"));
const projects = seed.content.projects.map((e: { slug: string; data: { name: string } }) => ({
  slug: e.slug,
  name: e.data.name
}));
const evidence = seed.content.evidence_records.map(
  (e: { slug: string; data: Record<string, unknown> }) => ({ ...e, id: e.slug })
);
const dispatches = seed.content.dispatches.map(
  (e: { slug: string; data: { review_date: string; content: CapabilityReview[] } }) => ({
    slug: e.slug,
    reviewDate: e.data.review_date,
    content: e.data.content
  })
);
const baseline = () => structuredClone(dispatches);
const review = (ds: typeof dispatches): CapabilityReview =>
  ds
    .flatMap((d: { content: CapabilityReview[] }) => d.content)
    .find((b: CapabilityReview) => b._type === "capability_review");

test("published capability keeps available upstream versions separate from installed consumer versions", () => {
  const [capability] = projectCapabilities(dispatches, projects, evidence);
  assert.ok(capability);
  assert.equal(capability.review.available_version, "1.0.0");
  assert.equal(capability.consumers.length, 5);
  assert.ok(
    capability.consumers.every(
      (c) =>
        c.record.planned &&
        !c.record.implemented &&
        !c.record.deployed &&
        !c.record.verified &&
        !c.record.installed_version
    )
  );
});

test("private, absent or wrong-project evidence cannot back adoption", () => {
  for (const change of ["private", "missing", "wrong-project"]) {
    const proofs = structuredClone(evidence);
    const key = review(dispatches).consumers[0]!.evidence_key;
    const proof = proofs.find((e: { id: string }) => e.id === key);
    if (change === "private") proof.data.public_safe = false;
    if (change === "wrong-project") proof.data.project_key = "other";
    if (change === "missing") proofs.splice(proofs.indexOf(proof), 1);
    assert.equal(projectCapabilities(dispatches, projects, proofs).length, 0);
  }
});

test("a verified checkbox is insufficient without installed, deployment and interaction evidence", () => {
  const ds = baseline();
  const row = review(ds).consumers[0];
  assert.ok(row);
  row.verified = true;
  assert.equal(projectCapabilities(ds, projects, evidence).length, 0);
  row.implemented = true;
  row.installed_version = "1.0.0";
  row.deployed = true;
  row.deployed_revision = "a".repeat(40);
  assert.equal(projectCapabilities(ds, projects, evidence).length, 0);
  row.release_evidence_key = "release";
  row.interaction_evidence_key = "interaction";
  const proof = { public_safe: true, project_key: row.project_key, evidence_state: "reviewed" };
  const proofs = [
    ...evidence,
    { id: "release", data: { ...proof, evidence_kind: "production verification" } },
    { id: "interaction", data: { ...proof, evidence_kind: "qualification" } }
  ];
  assert.equal(projectCapabilities(ds, projects, proofs)[0]?.consumers[0]?.record.verified, true);
});

test("future consumers come from published project identities, not a fixed game list", () => {
  const ds = baseline();
  const block = review(ds);
  block.consumers.push({
    ...block.consumers[0]!,
    project_key: "future-game",
    evidence_key: "future-proof"
  });
  const proof = {
    id: "future-proof",
    data: {
      public_safe: true,
      project_key: "future-game",
      evidence_state: "reviewed",
      evidence_kind: "observation"
    }
  };
  assert.equal(
    projectCapabilities(
      ds,
      [...projects, { slug: "future-game", name: "Future game" }],
      [...evidence, proof]
    )[0]?.consumers.length,
    6
  );
  assert.equal(projectCapabilities(ds, projects, [...evidence, proof]).length, 0);
});

test("unsafe URLs and a review dated after its dispatch are not public capability data", () => {
  const ds = baseline();
  review(ds).programme_url = "javascript:alert(1)";
  assert.equal(projectCapabilities(ds, projects, evidence).length, 0);
  const ds2 = baseline();
  review(ds2).reviewed_at = "2099-01-01";
  assert.equal(projectCapabilities(ds2, projects, evidence).length, 0);
});
