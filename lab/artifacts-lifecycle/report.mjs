// The documented local command for issue #6.
//
// Run it with `pnpm run lab:artifacts`. It creates a synthetic Git fixture,
// runs the task lifecycle twice from the same base, exports both results as
// standard Git bundles, restores each into a clean checkout, verifies the
// restored result there, cleans up only the task refs, and prints a report.
//
// Everything it prints is labelled. A local run proves the lifecycle works over
// ordinary Git; it proves nothing about Cloudflare's Artifacts service, and the
// report says so rather than leaving the reader to infer it.

import { createHash } from "node:crypto";
import path from "node:path";
import {
  LabError,
  LocalWorkspaceStore,
  WorkspaceLifecycle,
  cleanupRoot,
  createCleanCheckout,
  createFixture,
  gitAvailable,
  listTaskRefs,
  readBlob,
  readIfPresent
} from "./workspace.mjs";

async function verifyInCleanCheckout(store, bundlePath, checkoutRoot, name, file) {
  const clean = createCleanCheckout(checkoutRoot, name);
  const restored = await store.restore(bundlePath, clean);
  const contents = readBlob(clean, restored.commit, file);
  return { clean, restored, contents };
}

/**
 * Run the lifecycle end to end.
 *
 * `root` is created if absent and left in place so the bundles, the clean
 * checkouts and the fixture remain inspectable. Callers that want them gone use
 * `cleanupRoot` on the same path.
 */
export async function runLifecycle({ root = defaultRoot(), keep = true } = {}) {
  if (!gitAvailable()) throw new LabError("git is required to run the workspace lifecycle lab.");

  const fixture = createFixture(root);
  const store = new LocalWorkspaceStore(fixture.repo);
  const lifecycle = new WorkspaceLifecycle(store);

  const tasks = [];
  const verification = [];
  const resources = [];
  const failures = [];

  // Two tasks fork the same base. The first edits code, the second edits
  // documentation, so a change leaking between them would be visible in a diff
  // that should contain only one file.
  const plan = [
    { taskId: "task-code", file: "src/app.js", contents: "export const answer = 42;\n" },
    {
      taskId: "task-docs",
      file: "README.md",
      contents: "# Synthetic fixture\n\nEdited by a task.\n"
    }
  ];

  for (const step of plan) {
    const started = await lifecycle.startTask(step.taskId);
    const changed = await lifecycle.change(step.taskId, step.file, step.contents);
    const inspected = await lifecycle.inspect(step.taskId);
    const bundle = path.join(fixture.root, "out", `${step.taskId}.bundle`);
    const exported = await lifecycle.exportTask(step.taskId, bundle);
    resources.push(bundle);

    // Isolation: this task's diff must not touch the file the other task owns.
    const other = plan.find((entry) => entry.taskId !== step.taskId);
    const isolationHeld = other ? !inspected.diff.includes(other.file) : true;

    const restored = await verifyInCleanCheckout(
      store,
      exported.path,
      fixture.root,
      `verify-${step.taskId}`,
      step.file
    );
    resources.push(restored.clean);
    const passed = restored.contents === step.contents;
    verification.push({ taskId: step.taskId, file: step.file, passed });
    if (!passed)
      failures.push(
        `${step.taskId}: restored ${restored.clean} did not contain the task's change to ${step.file}`
      );
    if (!isolationHeld)
      failures.push(`${step.taskId}: the other task's workspace could not be read`);

    tasks.push({
      taskId: step.taskId,
      baseCommit: started.baseCommit,
      resultCommit: changed.commit,
      changedFiles: [...inspected.diff.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1]),
      bundle: path.relative(fixture.root, exported.path),
      bundleSha256: exported.sha256,
      restoredCommit: restored.restored.commit,
      store: "local Git branches (simulation of an Artifacts-style workspace)"
    });
  }

  // Retention: deleting a task workspace must not destroy the exported result.
  const deleted = [];
  for (const step of plan) {
    const removed = await lifecycle.finishTask(step.taskId);
    deleted.push({ taskId: step.taskId, removed: removed.removed });
  }
  const retained = tasks.every((task) =>
    tasks.some(
      (other) => other.taskId === task.taskId && other.restoredCommit === task.resultCommit
    )
  );
  if (!retained) failures.push("a restored result no longer matches its task's result commit");

  const surviving = listTaskRefs(fixture.repo);
  if (surviving.length) failures.push(`cleanup left task refs behind: ${surviving.join(", ")}`);

  const baselineIntact =
    readIfPresent(fixture.repo, "src/app.js") === "export const answer = 41;\n";
  if (!baselineIntact)
    failures.push("the fixture working tree no longer holds the baseline content");

  const report = {
    whatThisProves:
      "The task-workspace lifecycle — fork, scoped change, diff, portable export, restore into a clean checkout, verification there, scoped cleanup — works over ordinary Git.",
    whatThisDoesNotProve:
      "Nothing about Cloudflare Artifacts. No Artifacts namespace, binding, token or account was used. The store here is a local Git branch set, and every task record says so.",
    provider: "none — no network call, no account, no spend",
    root: fixture.root,
    baseCommit: fixture.baseCommit,
    tasks,
    verification,
    cleanup: deleted,
    retainedAfterDeletion: retained,
    baselineIntact,
    failingChecks: failures,
    digest: createHash("sha256")
      .update(JSON.stringify({ baseCommit: fixture.baseCommit, tasks, verification }))
      .digest("hex"),
    resources
  };

  if (!keep) cleanupRoot(fixture.root);
  return report;
}

function line(label, value) {
  return `${label.padEnd(30)} ${value}`;
}

export function formatReport(report) {
  const out = [];
  out.push(line("Base commit", report.baseCommit));
  out.push(line("Provider", report.provider));
  for (const task of report.tasks) {
    out.push("");
    out.push(`${task.taskId}`);
    out.push(line("  base commit", task.baseCommit));
    out.push(line("  result commit", task.resultCommit));
    out.push(line("  files changed", task.changedFiles.join(", ") || "none"));
    out.push(line("  exported bundle", task.bundle));
    out.push(line("  bundle sha256", task.bundleSha256));
    out.push(line("  restored commit", task.restoredCommit));
    out.push(line("  store", task.store));
  }
  out.push("");
  out.push(
    line(
      "Verification",
      report.verification.map((v) => `${v.taskId}=${v.passed ? "pass" : "FAIL"}`).join(" ")
    )
  );
  out.push(line("Retained after deletion", String(report.retainedAfterDeletion)));
  out.push(line("Baseline intact", String(report.baselineIntact)));
  out.push(
    line(
      "Task refs remaining",
      String(report.cleanup.filter((entry) => entry.removed).length) + " removed"
    )
  );
  out.push(line("Digest", report.digest));
  out.push("");
  out.push(`Proves: ${report.whatThisProves}`);
  out.push(`Does not prove: ${report.whatThisDoesNotProve}`);
  out.push("");
  const relative = path.relative(process.cwd(), report.root);
  out.push(
    relative.startsWith("..")
      ? `Artifacts kept for inspection at ${report.root}`
      : `Artifacts kept for inspection under ${relative}`
  );
  out.push("Delete them with: rm -rf <that directory>");
  if (report.failingChecks.length) {
    out.push("");
    out.push("Failures:");
    for (const failure of report.failingChecks) out.push(`  - ${failure}`);
  }
  return out.join("\n");
}

/**
 * Lab artefacts land under the ignored private `.release/` directory rather than
 * a system temp path, so a run leaves the bundles and checkouts in one place an
 * operator can inspect and delete. Nothing here is a source file.
 */
export function defaultRoot() {
  return path.join(
    process.cwd(),
    ".release/lab/artifacts-lifecycle",
    new Date().toISOString().replace(/[:.]/g, "-")
  );
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  try {
    const report = await runLifecycle();
    console.log(formatReport(report));
    process.exitCode = report.failingChecks.length ? 1 : 0;
  } catch (error) {
    console.error(`Workspace lifecycle lab failed: ${error.message}`);
    process.exitCode = 1;
  }
}
