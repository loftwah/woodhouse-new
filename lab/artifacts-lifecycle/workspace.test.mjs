import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test, { after, before, describe } from "node:test";
import {
  LabError,
  LocalWorkspaceStore,
  WorkspaceLifecycle,
  cleanupRoot,
  createCleanCheckout,
  createFixture,
  gitAvailable,
  listTaskRefs,
  readIfPresent,
  sentinelExists,
  tempRoot
} from "./workspace.mjs";

const haveGit = gitAvailable();
const options = haveGit ? {} : { skip: "git is not installed on this machine" };

let root;
let fixture;
let store;
let lifecycle;

before(() => {
  if (!haveGit) return;
  root = tempRoot();
  fixture = createFixture(root);
  store = new LocalWorkspaceStore(fixture.repo);
  lifecycle = new WorkspaceLifecycle(store);
});

after(() => {
  if (root) cleanupRoot(root);
});

describe("baseline", options, () => {
  test("the synthetic fixture has one commit and no hook has run", () => {
    assert.match(fixture.baseCommit, /^[0-9a-f]{40}$/);
    assert.equal(sentinelExists(fixture.repo), false);
  });

  test("the fixture ships a hook that would create a sentinel if executed", () => {
    const hook = path.join(fixture.repo, ".git/hooks/post-checkout");
    assert.equal(existsSync(hook), true);
    assert.match(readFileSync(hook, "utf8"), /HOOK-RAN/);
  });
});

describe("two task forks from the same base", options, () => {
  test("a write in one fork cannot alter the other fork's expected content", async () => {
    const alpha = await lifecycle.startTask("alpha");
    const beta = await lifecycle.startTask("beta");
    assert.equal(alpha.baseCommit, beta.baseCommit);
    assert.equal(alpha.baseCommit, fixture.baseCommit);

    await lifecycle.change("alpha", "src/app.js", "export const answer = 42;\n");

    assert.equal(
      await store.readFile("beta", "src/app.js"),
      "export const answer = 41;\n",
      "beta must still see the base content"
    );
    assert.equal(await store.readFile("alpha", "src/app.js"), "export const answer = 42;\n");
  });

  test("the diff describes only the task's own change", async () => {
    const inspected = await lifecycle.inspect("alpha");
    assert.match(inspected.diff, /answer = 42/);
    assert.doesNotMatch(inspected.diff, /README\.md/);
    assert.equal(inspected.baseCommit, fixture.baseCommit);
    assert.notEqual(inspected.resultCommit, inspected.baseCommit);
  });

  test("a retried start for the same task id is idempotent rather than divergent", async () => {
    // This is the caller's view of an interrupted create: the workspace was
    // created, then the caller stopped before recording it. Starting again must
    // land on the same base rather than failing or drifting.
    await store.fork("gamma");
    const retried = await lifecycle.startTask("gamma");
    assert.equal(retried.baseCommit, fixture.baseCommit);
    assert.deepEqual(
      listTaskRefs(fixture.repo).filter((ref) => ref === "task/gamma"),
      ["task/gamma"]
    );
  });
});

describe("portable export and restore", options, () => {
  test("an exported bundle restores into a clean checkout and verifies there", async () => {
    const exported = await lifecycle.exportTask("alpha", path.join(root, "out", "alpha.bundle"));
    assert.equal(existsSync(exported.path), true);
    assert.match(exported.sha256, /^[0-9a-f]{64}$/);
    assert.equal(exported.provenance.baseCommit, fixture.baseCommit);

    // A clean checkout has no repository of its own until the bundle is applied,
    // which is what "portable" has to mean.
    const clean = createCleanCheckout(root, "verify-alpha");
    assert.equal(existsSync(path.join(clean, ".git")), false);
    const restored = await store.restore(exported.path, clean);
    assert.equal(restored.commit, exported.provenance.resultCommit);

    // Verification runs in the clean checkout, not in the original repository.
    const verified = execFileSync("git", ["show", "HEAD:src/app.js"], {
      cwd: clean,
      encoding: "utf8"
    });
    assert.equal(verified, "export const answer = 42;\n");
  });

  test("the retained result survives deletion of the task workspace", async () => {
    const exported = await lifecycle.exportTask("beta", path.join(root, "out", "beta.bundle"));
    // beta never changed anything, so its bundle is the base commit. Export it
    // again after a change so the retained result is a real diff.
    await lifecycle.change("beta", "src/app.js", "export const answer = 43;\n");
    const changed = await lifecycle.exportTask("beta", path.join(root, "out", "beta2.bundle"));

    assert.equal((await lifecycle.finishTask("beta")).removed, true);
    assert.equal(listTaskRefs(fixture.repo).includes("task/beta"), false);

    const clean = createCleanCheckout(root, "verify-beta");
    await store.restore(changed.path, clean);
    const verified = execFileSync("git", ["show", "HEAD:src/app.js"], {
      cwd: clean,
      encoding: "utf8"
    });
    assert.equal(verified, "export const answer = 43;\n");
    assert.ok(exported.path && changed.path);
  });

  test("a conflicting export of the same task replaces the earlier bundle", async () => {
    await lifecycle.startTask("gamma");
    const destination = path.join(root, "out", "conflict.bundle");
    const first = await lifecycle.exportTask("gamma", destination);
    await lifecycle.change("gamma", "src/app.js", "export const answer = 44;\n");
    const second = await lifecycle.exportTask("gamma", destination);
    assert.equal(first.path, second.path);
    assert.notEqual(first.sha256, second.sha256, "the second export must reflect the new commit");

    const clean = createCleanCheckout(root, "verify-gamma");
    await store.restore(second.path, clean);
    const verified = execFileSync("git", ["show", "HEAD:src/app.js"], {
      cwd: clean,
      encoding: "utf8"
    });
    assert.equal(verified, "export const answer = 44;\n");
  });
});

describe("failure and cleanup preserve unrelated work", options, () => {
  test("an operation on a task that was never started fails closed", async () => {
    await assert.rejects(() => lifecycle.inspect("never-started"), LabError);
  });

  test("a deleted workspace reports a missing task rather than a wrong answer", async () => {
    await lifecycle.startTask("epsilon");
    await lifecycle.finishTask("epsilon");
    await assert.rejects(() => store.readFile("epsilon", "src/app.js"), LabError);
  });

  test("cleanup is idempotent and touches only the task's own ref", async () => {
    await lifecycle.startTask("zeta");
    await lifecycle.change("zeta", "src/app.js", "export const answer = 45;\n");
    const before = listTaskRefs(fixture.repo);
    assert.ok(before.includes("task/alpha"));
    assert.ok(before.includes("task/zeta"));

    assert.equal((await lifecycle.finishTask("zeta")).removed, true);
    // A repeated cleanup is not an error and removes nothing further.
    assert.equal((await lifecycle.finishTask("zeta")).removed, false);
    const after = listTaskRefs(fixture.repo);
    assert.equal(after.includes("task/zeta"), false);
    assert.ok(after.includes("task/alpha"), "another task's workspace must survive");
  });

  test("the fixture's base branch and other tasks are untouched by every operation", async () => {
    const branches = execFileSync(
      "git",
      ["for-each-ref", "--format=%(refname:short)", "refs/heads"],
      {
        cwd: fixture.repo,
        encoding: "utf8"
      }
    )
      .split("\n")
      .filter(Boolean);
    assert.ok(branches.includes("main"));
    assert.ok(branches.includes("task/alpha"));
    // The fixture's own working tree still holds the baseline content: the
    // lifecycle never checked a task branch out over it.
    assert.equal(readIfPresent(fixture.repo, "src/app.js"), "export const answer = 41;\n");
  });

  test("no operation executed a hook that arrived with the repository", () => {
    assert.equal(sentinelExists(fixture.repo), false);
  });

  test("a hostile hook installed into a fork is never executed by the lifecycle", async () => {
    const hostile = createFixture(path.join(root, "hostile"));
    const hostileStore = new LocalWorkspaceStore(hostile.repo);
    // A file whose content would be dangerous if written to disk as code. The
    // lifecycle treats every byte as data.
    const hostileLifecycle = new WorkspaceLifecycle(hostileStore);
    await hostileLifecycle.startTask("task-one");
    await hostileLifecycle.change(
      "task-one",
      "src/app.js",
      "throw new Error('this text is data, never executed');\n"
    );
    const readBack = await hostileStore.readFile("task-one", "src/app.js");
    assert.match(readBack, /never executed/);
    assert.equal(sentinelExists(hostile.repo), false);
  });
});

describe("provenance survives the round trip", options, () => {
  test("base commit, task identity and result commit are recorded and match", async () => {
    await lifecycle.startTask("eta");
    const changed = await lifecycle.change("eta", "README.md", "# Synthetic fixture\n\nEdited.\n");
    const inspected = await lifecycle.inspect("eta");
    const exported = await lifecycle.exportTask("eta", path.join(root, "out", "eta.bundle"));

    assert.equal(inspected.taskId, "eta");
    assert.equal(inspected.baseCommit, fixture.baseCommit);
    assert.equal(inspected.resultCommit, changed.commit);
    assert.equal(exported.provenance.resultCommit, changed.commit);

    const clean = createCleanCheckout(root, "verify-eta");
    const restored = await store.restore(exported.path, clean);
    assert.equal(restored.commit, changed.commit, "the restored HEAD is the task's result commit");
    const readme = execFileSync("git", ["show", "HEAD:README.md"], {
      cwd: clean,
      encoding: "utf8"
    });
    assert.match(readme, /Edited\./);
  });

  test("every recorded task carries whether its store was a simulation", () => {
    assert.ok(lifecycle.provenance.length >= 4);
    for (const record of lifecycle.provenance)
      assert.equal(record.simulated, true, `${record.taskId} must be marked simulated`);
  });
});

describe("the documented command", options, () => {
  test("an end-to-end run reports isolation, portable restore and scoped cleanup", async () => {
    const { runLifecycle, formatReport } = await import("./report.mjs");
    const report = await runLifecycle({ root: path.join(root, "demo") });

    assert.deepEqual(report.failingChecks, []);
    assert.equal(report.tasks.length, 2);
    assert.equal(report.verification.length, 2);
    assert.equal(
      report.verification.every((item) => item.passed),
      true
    );
    assert.equal(report.retainedAfterDeletion, true);
    assert.equal(report.baselineIntact, true);
    assert.match(report.digest, /^[0-9a-f]{64}$/);

    // Isolation is visible in the report: each task changed exactly one file,
    // and the file it changed is the one it was asked to change.
    for (const task of report.tasks)
      assert.equal(task.changedFiles.length, 1, `${task.taskId} changed ${task.changedFiles}`);

    // Every task started from the same base and produced its own commit.
    const bases = new Set(report.tasks.map((task) => task.baseCommit));
    assert.equal(bases.size, 1);
    const results = new Set(report.tasks.map((task) => task.resultCommit));
    assert.equal(results.size, 2);
    for (const task of report.tasks) assert.equal(task.restoredCommit, task.resultCommit);

    // The report labels every record as a local simulation and names its
    // resources, so a reader cannot mistake it for a provider result.
    assert.match(report.provider, /none/);
    assert.match(report.whatThisDoesNotProve, /Nothing about Cloudflare Artifacts/);
    for (const task of report.tasks) assert.match(task.store, /simulation/);
    assert.ok(report.resources.every((entry) => existsSync(entry)));

    // A human-readable rendering exists and names the same facts.
    const text = formatReport(report);
    assert.match(text, /Proves:/);
    assert.match(text, /Does not prove:/);
    assert.match(text, new RegExp(report.digest));
  });

  test("cleanup removed every task ref it created", async () => {
    const { runLifecycle } = await import("./report.mjs");
    const report = await runLifecycle({ root: path.join(root, "demo2") });
    assert.deepEqual(
      report.cleanup.map((entry) => entry.removed),
      [true, true]
    );
  });
});
