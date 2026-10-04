import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// The Woodhouse index and the sitemap are built from different queries. That let
// `/snapshots/2026-10-04/` sit in the sitemap with no search entry: the index
// added one snapshot, taken from the first project that had one, on the reasoning
// that "one snapshot page covers the whole portfolio". A second review produced a
// second snapshot and the newer archive — the one recording the current
// nine-project state — became unreachable by search.
//
// `audit:pages` passed throughout, because it checks that pages are *discoverable
// and linked*; it does not compare the sitemap against the search index. So this
// asserts the two agree, from the seed, rather than trusting either query.
const seed = JSON.parse(await readFile(new URL("../../seed/seed.json", import.meta.url), "utf8"));
const repository = await readFile(
  new URL("../content/repository.ts", import.meta.url),
  "utf8"
);

const snapshots: Array<{ slug: string; status: string; data?: { public_safe?: boolean } }> =
  seed.content.factory_snapshots ?? [];

test("the seed holds more than one dated snapshot", () => {
  // If this ever drops to one, the assertion below stops proving anything.
  assert.ok(
    snapshots.length > 1,
    "expected the seed to hold at least two dated snapshots; this guard exists so the coverage test cannot pass vacuously"
  );
});

test("every public snapshot page is reachable by search", () => {
  // The index must enumerate snapshots, not pick one. A `.find()` here is exactly
  // the bug this file exists to catch.
  assert.match(
    repository,
    /for \(const snapshot of snapshotResult\.snapshots\)/,
    "the search index must iterate every published snapshot, not take the first"
  );
  assert.doesNotMatch(
    repository,
    /projects\.find\(\(project\) => project\.snapshotId\)/,
    "taking one snapshot from one project silently drops the others once a second review lands"
  );
});

test("the snapshot query is part of the search index's own reads", () => {
  assert.match(repository, /listPublicSearchItems\(\)[\s\S]{0,900}listPublicSnapshots\(\)/);
  // A missing query means a missing cache hint and an unreported error, which is
  // how a silently incomplete index ships.
  assert.match(repository, /conversationResult\.cacheHint,\s*\n\s*snapshotResult\.cacheHint/);
  assert.match(repository, /evidenceResult\.error \?\?\s*\n\s*snapshotResult\.error/);
});