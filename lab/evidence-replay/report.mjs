// The documented command for issue #5.
//
// Replays one corpus into two independently checkpointed projections, then
// replays it again to show that the second run reaches the same state without
// applying anything twice. Prints a digest per projection so two runs can be
// compared by eye or by machine.
//
// Nothing here can send email, publish, build, deploy, write to GitHub, run a
// tool or touch a device: the lab imports nothing that could, and its only
// outputs are two JSON snapshots and two checkpoint files under a private,
// ignored directory.

import { createHash } from "node:crypto";
import path from "node:path";
import { LocalJournal, ReplayConsumer, exportCheckpoint, removeLabRoot } from "./replay.mjs";
import { PROJECTIONS } from "./projections.mjs";
import { assertCorpusIsPublishable, cleanCorpus } from "./corpus.mjs";

/** Lab output lands in the ignored private `.release/` directory. */
export function defaultRoot() {
  return path.join(
    process.cwd(),
    ".release/lab/evidence-replay",
    new Date().toISOString().replace(/[:.]/g, "-")
  );
}

function digestOf(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

/**
 * Replay `events` into both projections from a clean root.
 *
 * Each projection gets its own consumer, its own checkpoint and its own
 * snapshot, so one can be paused or rebuilt without the other noticing.
 */
export function replayAll({ root = defaultRoot(), events = cleanCorpus(), injection } = {}) {
  assertCorpusIsPublishable(events);
  const journal = LocalJournal.create(path.join(root, "journal"), events);

  const first = {};
  for (const name of Object.keys(PROJECTIONS)) {
    const consumer = new ReplayConsumer({
      root: path.join(root, name),
      journal,
      projectionName: name,
      ...(injection ? { injection: (context) => injection(name, context) } : {})
    });
    first[name] = consumer.run();
    first[name].state = consumer.snapshot();
    first[name].checkpoint = consumer.checkpoint;
  }

  // A second pass over the same corpus must be a no-op: every event id has
  // already been applied, and the checkpoint is already at the end.
  const second = {};
  for (const name of Object.keys(PROJECTIONS)) {
    const consumer = new ReplayConsumer({
      root: path.join(root, name),
      journal,
      projectionName: name
    });
    consumer.restore(consumer.checkpoint);
    const replay = consumer.run();
    second[name] = {
      batches: replay.batches,
      applied: replay.applied,
      duplicates: replay.duplicates,
      notNewer: replay.notNewer,
      digest: digestOf(consumer.snapshot()?.events ?? [])
    };
  }

  return {
    root,
    corpus: { events: events.length, digest: digestOf(events) },
    first,
    second,
    stable: Object.keys(PROJECTIONS).every((name) => {
      const before = digestOf(first[name].state?.events ?? []);
      return second[name].digest === before;
    }),
    timelineDigest: digestOf(first.timeline.state?.events ?? []),
    lastObservedDigest: digestOf(first["last-observed"].state?.events ?? []),
    exportCheckpoint: () =>
      Object.fromEntries(
        Object.keys(PROJECTIONS).map((name) => [
          name,
          path.relative(root, exportCheckpoint(path.join(root, name), name).from)
        ])
      ),
    remove: () => removeLabRoot(root)
  };
}

function line(label, value) {
  return `${label.padEnd(34)} ${value}`;
}

export function formatReport(result) {
  const out = [];
  out.push(line("Corpus", `${result.corpus.events} synthetic events`));
  out.push(line("Corpus digest", result.corpus.digest));
  out.push(line("Contains private material", "no — asserted by check"));
  out.push("");
  for (const [name, report] of Object.entries(result.first)) {
    out.push(name);
    out.push(line("  batches", report.batches));
    out.push(line("  applied", report.applied));
    out.push(line("  duplicates ignored", report.duplicates));
    out.push(line("  not newer", report.notNewer));
    out.push(line("  poison batches", report.poison.length));
    out.push(line("  checkpoint offset", report.checkpoint.offset));
    out.push(line("  halted", report.halted ?? "no"));
  }
  out.push("");
  out.push(
    line(
      "Second pass applied",
      Object.values(result.second)
        .map((r) => r.applied)
        .join(" / ")
    )
  );
  out.push(
    line(
      "Second pass duplicates",
      Object.values(result.second)
        .map((r) => r.duplicates)
        .join(" / ")
    )
  );
  out.push(line("State stable across runs", String(result.stable)));
  out.push(line("Timeline digest", result.timelineDigest));
  out.push(line("Last-observed digest", result.lastObservedDigest));
  out.push("");
  out.push(line("Exported checkpoints", Object.values(result.exportCheckpoint()).join(", ")));
  const relative = path.relative(process.cwd(), result.root);
  out.push(
    line(
      "Artefacts",
      relative.startsWith("..") ? result.root : `${relative} (delete with rm -rf <that directory>)`
    )
  );
  return out.join("\n");
}

const invokedDirectly = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));
if (invokedDirectly) {
  const result = replayAll();
  console.log(formatReport(result));
  process.exitCode = result.stable ? 0 : 1;
}
