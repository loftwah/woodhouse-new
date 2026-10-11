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
const allDispatches = seed.content.dispatches.map(
  (e: { slug: string; data: { review_date: string; content: CapabilityReview[] } }) => ({
    slug: e.slug,
    reviewDate: e.data.review_date,
    content: e.data.content
  })
);
// Preserve the earlier single-version review as a historical fixture.
const dispatches = allDispatches.filter((d: { content: CapabilityReview[] }) =>
  d.content.some((b) => b._type === "capability_review" && b._version === 1)
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
  const shoalshot = capability.consumers.find((c) => c.project.slug === "shoalshot")!;
  assert.equal(shoalshot.record.implemented, true);
  assert.equal(shoalshot.record.installed_version, "1.0.0");
  assert.equal(
    capability.consumers.find((c) => c.project.slug === "bubbles")?.record.in_progress,
    true
  );
  assert.ok(
    capability.consumers.every((c) => c.record.planned && !c.record.deployed && !c.record.verified)
  );
  assert.ok(
    capability.consumers
      .filter((c) => !["shoalshot", "protocol-11"].includes(c.project.slug))
      .every((c) => !c.record.implemented && !c.record.installed_version)
  );
  assert.equal(
    capability.consumers.find((c) => c.project.slug === "protocol-11")?.record.implemented,
    true
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
  const prefix = `loftwahfm-radio-${row.project_key}-client-1-0-0-`;
  row.evidence_key = prefix + "implementation-2026-10-10";
  row.release_evidence_key = prefix + "release-2026-10-10";
  row.interaction_evidence_key = prefix + "interaction-2026-10-10";
  const proof = {
    public_safe: true,
    project_key: row.project_key,
    evidence_state: "reviewed",
    reviewed_at: "2026-10-10",
    revision: row.deployed_revision
  };
  const proofs = [
    ...evidence,
    { id: row.evidence_key, data: { ...proof, evidence_kind: "implementation" } },
    { id: row.release_evidence_key, data: { ...proof, evidence_kind: "production verification" } },
    { id: row.interaction_evidence_key, data: { ...proof, evidence_kind: "qualification" } }
  ];
  assert.equal(projectCapabilities(ds, projects, proofs)[0]?.consumers[0]?.record.verified, true);
  row.installed_version = "999.0.0";
  assert.equal(projectCapabilities(ds, projects, proofs).length, 0);
  row.installed_version = "1.0.0";
  row.deployed_revision = "unrelated-revision";
  assert.equal(projectCapabilities(ds, projects, proofs).length, 0);
  row.deployed_revision = "a".repeat(40);
  proofs.at(-1)!.data.revision = "older-unverified-revision";
  assert.equal(projectCapabilities(ds, projects, proofs).length, 0);
});

test("future consumers come from published project identities, not a fixed game list", () => {
  const ds = baseline();
  const block = review(ds);
  block.consumers.push({
    ...block.consumers[0]!,
    project_key: "future-game",
    implemented: false,
    installed_version: "",
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

test("listening uses only the official FM player and preserves evidence when optional links are invalid", () => {
  const [capability] = projectCapabilities(dispatches, projects, evidence);
  assert.equal(capability!.listening?.embed, "https://fm.loftwah.com/widget?station=night-signal");
  assert.equal(capability!.listening?.shows.length, 2);
  assert.equal(
    capability!.consumers[0]?.stationHref,
    "https://fm.loftwah.com/radio?station=low-tide"
  );
  for (const unsafe of [
    "https://unrelated.example/widget?station=night-signal",
    "https://fm.loftwah.com@unrelated.example/widget?station=night-signal",
    "https://fm.loftwah.com/widget?station=night-signal&autoplay=true",
    "https://fm.loftwah.com/widget?station=another-station",
    "javascript:alert(1)"
  ]) {
    const ds = baseline();
    review(ds).embed_url = unsafe;
    const [projected] = projectCapabilities(ds, projects, evidence);
    assert.ok(projected);
    assert.equal(projected.listening, null);
    assert.equal(projected.consumers.length, 5);
  }
  const ds = baseline();
  review(ds).published_shows![0]!.url =
    "https://fm.loftwah.com/radio?edition=not-a-reviewed-edition";
  assert.equal(projectCapabilities(ds, projects, evidence)[0]?.listening?.shows.length, 1);
  review(ds).shows_evidence_key = "missing-publication-proof";
  assert.equal(projectCapabilities(ds, projects, evidence)[0]?.listening?.shows.length, 0);
});

test("current review accepts explicitly supported mixed pins and exact deployed browser receipts", () => {
  const [capability] = projectCapabilities(allDispatches, projects, evidence);
  assert.equal(capability?.review.reviewed_at, "2026-10-11");
  assert.equal(capability?.review.available_version, "1.2.0");
  const pins = Object.fromEntries(
    capability!.consumers.map((c) => [c.project.slug, c.record.installed_version])
  );
  assert.deepEqual(pins, {
    shoalshot: "1.2.0",
    fighter: "1.1.0",
    "protocol-11": "1.0.0",
    bubbles: "1.0.0",
    pirates: ""
  });
  assert.ok(
    capability!.consumers
      .filter((c) => c.project.slug !== "pirates")
      .every((c) => c.record.implemented && c.record.deployed && c.record.verified)
  );
  assert.equal(
    capability!.consumers.find((c) => c.project.slug === "pirates")!.record.implemented,
    false
  );
});

test("a mixed-version review fails closed on unsupported pins and unverifiable compatibility", () => {
  const current = allDispatches.filter((d: { content: CapabilityReview[] }) =>
    d.content.some((b) => b._type === "capability_review" && b._version === 2)
  );
  for (const fault of [
    "unsupported",
    "duplicate",
    "wrong-hash",
    "missing-proof",
    "private-proof",
    "future-proof",
    "wrong-provider",
    "swapped-support-proof",
    "unrelated-support-proof",
    "wrong-stage-version",
    "wrong-release"
  ]) {
    const ds = structuredClone(current);
    const block = review(ds);
    assert.equal(block._version, 2);
    if (block._version !== 2) throw new Error("Expected current schema");
    const proofs = structuredClone(evidence);
    const support = block.supported_clients[0]!;
    const proof = proofs.find((e: { id: string }) => e.id === support.evidence_key);
    if (fault === "unsupported") block.consumers[1]!.installed_version = "1.9.0";
    if (fault === "duplicate") block.supported_clients.push({ ...support });
    if (fault === "wrong-hash") block.package_sha256 = "a".repeat(64);
    if (fault === "missing-proof") support.evidence_key = "missing";
    if (fault === "private-proof") proof.data.public_safe = false;
    if (fault === "future-proof") proof.data.reviewed_at = "2026-10-12";
    if (fault === "wrong-provider") proof.data.project_key = "fighter";
    if (fault === "swapped-support-proof")
      support.evidence_key = block.supported_clients[2]!.evidence_key;
    if (fault === "unrelated-support-proof")
      support.evidence_key = "loftwahfm-games-radio-analytics-2026-10-11";
    if (fault === "wrong-stage-version")
      block.consumers[0]!.evidence_key = block.consumers[0]!.evidence_key.replace("1-2-0", "1-0-0");
    if (fault === "wrong-release") block.consumers[0]!.deployed_revision = "different";
    assert.equal(projectCapabilities(ds, projects, proofs).length, 0, fault);
  }
});
