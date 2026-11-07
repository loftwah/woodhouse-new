import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { selectCandidates } from "./prune-workspace.mjs";

const DAY = 86_400_000;
const now = Date.UTC(2026, 10, 8);
const entry = (name, ageDays, extra = {}) => ({
  name,
  mtimeMs: now - ageDays * DAY,
  isSymbolicLink: false,
  ...extra
});

test("selects only entries older than the threshold", () => {
  const { candidates, kept } = selectCandidates(
    [entry("old", 40), entry("new", 3), entry("edge", 29)],
    { maxAgeDays: 30, now }
  );
  assert.deepEqual(
    candidates.map((c) => c.name),
    ["old"]
  );
  assert.deepEqual(
    kept.map((k) => k.name),
    ["new", "edge"]
  );
});

test("the keep-list wins over age", () => {
  const { candidates, kept } = selectCandidates([entry("content-model", 400), entry("old", 400)], {
    maxAgeDays: 30,
    keep: ["content-model"],
    now
  });
  assert.deepEqual(
    candidates.map((c) => c.name),
    ["old"]
  );
  assert.deepEqual(kept, [{ name: "content-model", reason: "keep-list" }]);
});

test("a symlink is skipped rather than followed", () => {
  const { candidates, skipped } = selectCandidates(
    [entry("linked", 400, { isSymbolicLink: true })],
    { maxAgeDays: 30, now }
  );
  assert.equal(candidates.length, 0);
  assert.deepEqual(skipped, [{ name: "linked", reason: "symlink" }]);
});

test("a build root with no age threshold selects every non-symlink entry", () => {
  const { candidates } = selectCandidates([entry("dist", 0), entry("fresh", 0)], { now });
  assert.equal(candidates.length, 2);
});

test("the real policy never removes a symlink target", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "woodhouse-prune-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const outside = await mkdtemp(join(tmpdir(), "woodhouse-prune-outside-"));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(join(outside, "keep.txt"), "keep");
  await mkdir(join(root, "output"));
  await symlink(outside, join(root, "output", "linked"));

  const { lstat, readdir } = await import("node:fs/promises");
  const entries = [];
  for (const name of await readdir(join(root, "output"))) {
    const stats = await lstat(join(root, "output", name));
    entries.push({ name, mtimeMs: 0, isSymbolicLink: stats.isSymbolicLink() });
  }
  const { candidates } = selectCandidates(entries, { maxAgeDays: 1, now });
  assert.equal(candidates.length, 0);
});
