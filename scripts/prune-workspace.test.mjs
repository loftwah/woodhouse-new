import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  symlink,
  utimes,
  writeFile
} from "node:fs/promises";
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

test("apply skips a symlink at the evidence root itself", async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), "woodhouse-prune-root-"));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const repo = join(fixture, "repo");
  const outside = join(fixture, "outside");
  await mkdir(join(repo, "scripts"), { recursive: true });
  await mkdir(outside);
  const script = join(repo, "scripts", "prune-workspace.mjs");
  await copyFile(new URL("./prune-workspace.mjs", import.meta.url), script);
  const sentinel = join(outside, "retain.txt");
  await writeFile(sentinel, "retain");
  await utimes(sentinel, new Date(0), new Date(0));
  await symlink(outside, join(repo, "output"));
  const result = spawnSync(process.execPath, [await realpath(script), "--apply"], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(await readFile(sentinel, "utf8"), "retain");
  assert.match(result.stdout, /output: symlink skipped/);
});
