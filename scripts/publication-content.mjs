// A current Worker can still serve stale CMS content. Publication acceptance
// therefore compares its public records with the reviewed seed, not just HTTP 200.
import { isDeepStrictEqual } from "node:util";

const collections = [
  "projects",
  "project_statuses",
  "factory_snapshots",
  "evidence_records",
  "dispatches",
  "incidents",
  "conversations"
];
const published = (seed, collection) =>
  (seed.content[collection] ?? []).filter(
    (entry) => entry.status === "published" && entry.data.public_safe
  );

export function assertPublicationContent(seed, identity, facts) {
  const counts = Object.fromEntries(collections.map((key) => [key, published(seed, key).length]));
  const reviewed = published(seed, "factory_snapshots")
    .map((entry) => entry.data.reviewed_at)
    .sort()
    .at(-1);
  if (
    identity.content?.available !== true ||
    !/^sha256:[a-f0-9]{64}$/.test(identity.content?.generation ?? "") ||
    identity.content.snapshotReviewed !== reviewed ||
    !isDeepStrictEqual(identity.content.counts, counts)
  )
    throw new Error(
      "Served content is unavailable or differs from the reviewed publication counts/date."
    );
  // Capability ownership, compatible versions and consumer stages are CMS content.
  // Matching counts can still hide stale or incorrectly promoted adoption.
  const latestCapabilities = new Map();
  for (const entry of published(seed, "dispatches")) {
    for (const block of entry.data.content ?? []) {
      if (block._type !== "capability_review") continue;
      const previous = latestCapabilities.get(block.capability_key);
      if (!previous || previous.reviewed_at < block.reviewed_at)
        latestCapabilities.set(block.capability_key, block);
    }
  }
  const expectedCapabilities = [...latestCapabilities.values()].sort((a, b) =>
    a.capability_key.localeCompare(b.capability_key)
  );
  const actualCapabilities = (facts.capabilities ?? [])
    .map((item) => item.review)
    .sort((a, b) => a.capability_key.localeCompare(b.capability_key));
  if (!isDeepStrictEqual(actualCapabilities, expectedCapabilities))
    throw new Error(
      "Served capability versions or adoption stages differ from the reviewed CMS publication."
    );
  const expected = published(seed, "projects")
    .map((entry) => {
      const status = published(seed, "project_statuses")
        .filter((item) => item.data.project_key === entry.slug)
        .sort((a, b) => b.data.reviewed_at.localeCompare(a.data.reviewed_at))[0]?.data;
      if (!status) throw new Error(`No reviewed status for ${entry.slug}.`);
      return {
        slug: entry.slug,
        name: entry.data.name,
        discipline: entry.data.discipline,
        summary: entry.data.summary,
        state: status.state,
        current: status.current,
        nextProof: status.next_proof,
        proofBoundary: status.proof_boundary,
        reviewed: status.reviewed_at
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
  const actual = (facts.projects ?? [])
    .map((entry) =>
      Object.fromEntries(Object.keys(expected[0] ?? {}).map((key) => [key, entry[key]]))
    )
    .sort((a, b) => a.slug.localeCompare(b.slug));
  if (
    facts.reviewed !== reviewed ||
    facts.projectCount !== expected.length ||
    !isDeepStrictEqual(actual, expected)
  )
    throw new Error("Served project facts differ from the reviewed publication text.");
}

export function previewReceiptIsFresh(receipt, now = Date.now()) {
  const deployed = Date.parse(receipt.deployedAt);
  return Number.isFinite(deployed) && deployed <= now + 60000 && now - deployed <= 86400000;
}
