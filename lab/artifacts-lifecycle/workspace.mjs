// An isolated, task-scoped workspace over an ordinary Git repository.
//
// This is the lifecycle issue #6 asks to prove before deciding whether Cloudflare
// Artifacts is worth adopting: create a baseline, fork a task workspace, make a
// scoped change, inspect the diff, export it as portable Git, restore it into a
// clean checkout, verify there, and clean up only what the task owned.
//
// Ordinary Git is both the baseline and the transport. Nothing here needs a
// network, an account or a paid plan, so the lifecycle can be proven before any
// provider is involved. `ArtifactsStore` is a filesystem stand-in for the
// Artifacts binding: it exercises the same create/fork/read/commit/export
// operations and is labelled a simulation everywhere it appears, because a local
// filesystem is not evidence about Cloudflare's service.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const DEFAULT_IDENTITY = [
  "-c",
  "user.name=Woodhouse Lab",
  "-c",
  "user.email=lab@woodhouse.invalid",
  "-c",
  "commit.gpgsign=false",
  "-c",
  "core.hooksPath="
];

export class LabError extends Error {}

function git(cwd, args, { allowFailure = false, input, env: extraEnv } = {}) {
  const result = spawnSync("git", [...DEFAULT_IDENTITY, ...args], {
    cwd,
    encoding: "utf8",
    input,
    maxBuffer: 8 * 1024 * 1024,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: "0",
      GIT_CONFIG_NOSYSTEM: "1",
      ...extraEnv
    }
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new LabError(
      `git ${args.slice(0, 3).join(" ")} failed in ${path.basename(cwd)}: ${
        result.stderr?.trim() ?? "unknown error"
      }`
    );
  }
  // stdout is returned raw: a file read through `git show` must keep its bytes,
  // including the trailing newline. Callers that need a single token trim it.
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: (result.stderr ?? "").trim()
  };
}

export function gitAvailable() {
  const result = spawnSync("git", ["--version"], { encoding: "utf8" });
  return result.status === 0;
}

/**
 * A synthetic repository with no history worth stealing and one trap: a
 * post-checkout hook that would create a sentinel file if anything executed it.
 * Imported source is untrusted, so the lifecycle must never run a hook that
 * arrived with a fork.
 */
export function createFixture(root = mkdtempSync(path.join(tmpdir(), "woodhouse-lab-"))) {
  const repo = path.join(root, "fixture");
  mkdirSync(repo, { recursive: true });
  git(repo, ["init", "--quiet", "--initial-branch=main"]);
  mkdirSync(path.join(repo, "src"), { recursive: true });
  writeFileSync(path.join(repo, "README.md"), "# Synthetic fixture\n\nNot a real project.\n");
  writeFileSync(path.join(repo, "src/app.js"), "export const answer = 41;\n");
  // A hostile hook: if any step in the lifecycle runs `git checkout`, this fires.
  const hooks = path.join(repo, ".git/hooks");
  mkdirSync(hooks, { recursive: true });
  writeFileSync(
    path.join(hooks, "post-checkout"),
    `#!/bin/sh\nprintf 'hook ran\\n' > "${path.join(repo, "HOOK-RAN")}"\n`,
    { mode: 0o755 }
  );
  git(repo, ["add", "--all"]);
  git(repo, ["commit", "--quiet", "-m", "Synthetic baseline"]);
  return { root, repo, baseCommit: git(repo, ["rev-parse", "HEAD"]).stdout.trim() };
}

/**
 * The subset of an Artifacts-style workspace store this lifecycle depends on:
 * create a repository, fork it into a task workspace, read and write files,
 * commit, and export the result as something ordinary Git understands.
 *
 * `LocalWorkspaceStore` implements it over Git branches in one repository. A
 * real binding would implement the same six operations; nothing above this
 * interface knows which one it is talking to.
 */
export class LocalWorkspaceStore {
  constructor(repo) {
    this.repo = repo;
  }

  #requireBranch(taskId) {
    if (!existsSync(path.join(this.repo, ".git")))
      throw new LabError(`the fixture repository no longer exists at ${this.repo}`);
    return `task/${taskId}`;
  }

  async createBaseline() {
    return { baseCommit: git(this.repo, ["rev-parse", "HEAD"]).stdout.trim() };
  }

  async fork(taskId) {
    const branch = this.#requireBranch(taskId);
    // Idempotent by task id: a retried fork must not fail or silently diverge.
    const exists = git(this.repo, ["rev-parse", "--verify", branch], { allowFailure: true }).ok;
    if (!exists) git(this.repo, ["branch", branch, "HEAD"]);
    const result = git(this.repo, ["rev-parse", branch]).stdout.trim();
    return { taskId, ref: branch, baseCommit: result, simulated: true };
  }

  async readFile(taskId, relativePath) {
    const branch = this.#requireBranch(taskId);
    const result = git(this.repo, ["show", `${branch}:${relativePath}`], { allowFailure: true });
    if (!result.ok) throw new LabError(`${relativePath} is not present in ${branch}`);
    return result.stdout;
  }

  async writeFile(taskId, relativePath, contents) {
    const branch = this.#requireBranch(taskId);
    const parent = git(this.repo, ["rev-parse", branch]).stdout.trim();
    // The change is built entirely with Git plumbing against a throwaway index:
    // no checkout, no working-tree write, no HEAD move and therefore no hook in
    // the repository can run and no other branch can observe the edit.
    const index = path.join(this.repo, ".git", `lab-index-${taskId}`);
    try {
      const plumbing = { env: { GIT_INDEX_FILE: index } };
      git(this.repo, ["read-tree", parent], plumbing);
      const blob = git(this.repo, ["hash-object", "-w", "--stdin"], {
        ...plumbing,
        input: contents
      }).stdout.trim();
      const existing = git(this.repo, ["ls-tree", parent, "--", relativePath], {
        ...plumbing,
        allowFailure: true
      });
      const mode = existing.ok ? existing.stdout.trim().split(/\s+/)[0] || "100644" : "100644";
      git(
        this.repo,
        ["update-index", "--add", "--cacheinfo", `${mode},${blob},${relativePath}`],
        plumbing
      );
      const tree = git(this.repo, ["write-tree"], plumbing).stdout.trim();
      const commit = git(this.repo, [
        "commit-tree",
        tree,
        "-p",
        parent,
        "-m",
        `task ${taskId}: update ${relativePath}`
      ]).stdout.trim();
      git(this.repo, ["update-ref", `refs/heads/${branch}`, commit, parent]);
      return { commit };
    } finally {
      rmSync(index, { force: true });
      rmSync(`${index}.lock`, { force: true });
    }
  }

  async diff(taskId, baseCommit) {
    const branch = this.#requireBranch(taskId);
    return git(this.repo, ["diff", "--no-color", `${baseCommit}..${branch}`]).stdout;
  }

  async export(taskId, destination) {
    const branch = this.#requireBranch(taskId);
    mkdirSync(path.dirname(destination), { recursive: true });
    // A bundle is standard Git and carries the base commit, so a clean checkout
    // can clone from it without this repository.
    const result = git(this.repo, ["bundle", "create", destination, branch, "--quiet"]);
    if (!result.ok) throw new LabError(`export failed for ${taskId}: ${result.stderr}`);
    return { path: destination, sha256: digestOf(destination), simulated: true };
  }

  async restore(bundlePath, destination) {
    mkdirSync(destination, { recursive: true });
    git(destination, ["init", "--quiet", "--initial-branch=main"]);
    // A bundle carries named refs rather than HEAD, so read the ref it actually
    // contains instead of assuming one.
    const heads = git(bundlePath.replace(/[^/]+$/, ""), [
      "bundle",
      "list-heads",
      path.basename(bundlePath)
    ]).stdout;
    const ref = heads.split("\n")[0]?.trim().split(/\s+/)[1];
    if (!ref) throw new LabError(`the bundle at ${bundlePath} contains no ref to restore`);
    git(destination, ["fetch", "--quiet", bundlePath, `${ref}:refs/heads/restored`]);
    const commit = git(destination, ["rev-parse", "refs/heads/restored"]).stdout.trim();
    // Leave the checkout usable: HEAD points at the restored result, so the
    // verification that follows is ordinary local Git with no arguments.
    git(destination, ["checkout", "--quiet", "restored"]);
    return { destination, commit, ref };
  }

  async delete(taskId) {
    const branch = `task/${taskId}`;
    const before = git(this.repo, ["for-each-ref", "--format=%(refname)", "refs/heads"]).stdout;
    // Idempotent, and scoped to one ref: a missing or already-deleted task is
    // not an error and no other branch is touched.
    git(this.repo, ["update-ref", "-d", `refs/heads/${branch}`], { allowFailure: true });
    const after = git(this.repo, ["for-each-ref", "--format=%(refname)", "refs/heads"]).stdout;
    return { removed: before !== after };
  }
}

/** Read one file at a specific commit from any repository, without checkout. */
export function readBlob(repo, commit, relativePath) {
  const result = git(repo, ["show", `${commit}:${relativePath}`], { allowFailure: true });
  if (!result.ok) throw new LabError(`${relativePath} is not present at ${commit} in ${repo}`);
  return result.stdout;
}

function digestOf(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

/**
 * The lifecycle, independent of which store backs it.
 *
 * Every operation records what it did so a caller can show provenance: the base
 * commit a task started from, the task's identity, and the commit it produced.
 */
export class WorkspaceLifecycle {
  constructor(store) {
    this.store = store;
    this.provenance = [];
  }

  async startTask(taskId) {
    const workspace = await this.store.fork(taskId);
    this.provenance.push({
      taskId,
      baseCommit: workspace.baseCommit,
      simulated: workspace.simulated === true
    });
    return workspace;
  }

  async change(taskId, relativePath, contents) {
    const record = this.provenance.find((entry) => entry.taskId === taskId);
    if (!record) throw new LabError(`task ${taskId} was never started`);
    const { commit } = await this.store.writeFile(taskId, relativePath, contents);
    record.resultCommit = commit;
    return { taskId, commit, baseCommit: record.baseCommit };
  }

  async inspect(taskId) {
    const record = this.provenance.find((entry) => entry.taskId === taskId);
    if (!record) throw new LabError(`task ${taskId} was never started`);
    return {
      taskId,
      baseCommit: record.baseCommit,
      resultCommit: record.resultCommit ?? record.baseCommit,
      diff: await this.store.diff(taskId, record.baseCommit)
    };
  }

  async exportTask(taskId, destination) {
    const record = this.provenance.find((entry) => entry.taskId === taskId);
    if (!record) throw new LabError(`task ${taskId} was never started`);
    const exported = await this.store.export(taskId, destination);
    return { taskId, ...exported, provenance: { ...record } };
  }

  async finishTask(taskId) {
    return this.store.delete(taskId);
  }
}

/**
 * An empty directory for a checkout the bundle has to fill completely.
 *
 * Nothing is pre-seeded on purpose: if the restored result were missing a file,
 * the verification that follows would fail rather than quietly reading a copy
 * left over from the original repository.
 */
export function createCleanCheckout(root, name = "clean") {
  const destination = path.join(root, name);
  mkdirSync(destination, { recursive: true });
  return destination;
}

export function listTaskRefs(repo) {
  return git(repo, ["for-each-ref", "--format=%(refname:short)", "refs/heads/task"])
    .stdout.split("\n")
    .filter(Boolean)
    .sort();
}

export function sentinelExists(repo) {
  return existsSync(path.join(repo, "HOOK-RAN"));
}

export function readIfPresent(root, relativePath) {
  const absolute = path.join(root, relativePath);
  return existsSync(absolute) ? readFileSync(absolute, "utf8") : null;
}

export function tempRoot() {
  return mkdtempSync(path.join(tmpdir(), "woodhouse-workspace-"));
}

export function cleanupRoot(root) {
  rmSync(root, { recursive: true, force: true });
}
