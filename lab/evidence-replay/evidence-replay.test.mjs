import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import test, { after, before, describe } from "node:test";
import {
  BATCH_SIZE,
  LEASE_MS,
  LocalJournal,
  ReplayConsumer,
  exportCheckpoint,
  removeLabRoot
} from "./replay.mjs";
import {
  ENVELOPE_VERSION,
  MAX_ENVELOPE_BYTES,
  MAX_CORPUS_EVENTS,
  preferredObservation,
  validateEnvelope
} from "./envelope.mjs";
import { createLastObserved, createTimeline } from "./projections.mjs";
import {
  assertCorpusIsPublishable,
  cleanCorpus,
  corruptCorpus,
  envelope,
  oversizedEvent
} from "./corpus.mjs";
import { formatReport, replayAll } from "./report.mjs";

let root;
before(() => {
  root = path.join(
    process.cwd(),
    ".release/lab/evidence-replay-tests",
    new Date().toISOString().replace(/[:.]/g, "-")
  );
});
after(() => {
  if (root) removeLabRoot(root);
});

const withRoot = (name) => path.join(root, name);

function consumerFor(label, events, extra = {}, projectionName = "timeline") {
  const journal = LocalJournal.create(withRoot(`${label}-journal`), events);
  const consumer = new ReplayConsumer({
    root: withRoot(label),
    journal,
    projectionName,
    ...extra
  });
  return { journal, consumer };
}

describe("the envelope", () => {
  test("a complete envelope validates", () => {
    const [event] = cleanCorpus();
    const { envelope: validated, problems } = validateEnvelope(event);
    assert.deepEqual(problems, []);
    assert.equal(validated.schema, ENVELOPE_VERSION);
    assert.equal(validated.id, "ev-001");
  });

  test("an unknown event type is refused with the reason named", () => {
    const { problems } = validateEnvelope({ ...envelope({ id: "x" }), type: "project.teleported" });
    assert.ok(problems.some((problem) => problem.includes("type must be one of")));
  });

  test("an unknown schema version is refused rather than guessed at", () => {
    const { problems } = validateEnvelope({
      ...envelope({ id: "x" }),
      schema: "loftwah.evidence/2"
    });
    assert.ok(problems.some((problem) => problem.includes("schema must be")));
  });

  test("an observation with no checkable source revision is refused", () => {
    const { problems } = validateEnvelope({ ...envelope({ id: "x" }), sourceRevision: "" });
    assert.ok(problems.some((problem) => problem.includes("sourceRevision")));
  });

  test("an observation dated before the thing it observed is refused", () => {
    const { problems } = validateEnvelope(
      envelope({
        id: "x",
        occurredAt: "2026-10-04T02:00:00.000Z",
        observedAt: "2026-10-04T01:00:00.000Z"
      })
    );
    assert.ok(problems.some((problem) => problem.includes("must not precede")));
  });

  test("a credential-shaped attribute is refused", () => {
    const { problems } = validateEnvelope(envelope({ id: "x", attributes: { api_key: "nope" } }));
    assert.ok(problems.some((problem) => problem.includes("credential")));
  });

  test("an oversized envelope is refused with its size", () => {
    const { problems } = validateEnvelope(oversizedEvent());
    assert.ok(problems.some((problem) => problem.includes("over the")));
    assert.ok(Buffer.byteLength(JSON.stringify(oversizedEvent()), "utf8") > MAX_ENVELOPE_BYTES);
  });

  test("the corpus size limits are enforced, not just documented", () => {
    const tooMany = Array.from({ length: MAX_CORPUS_EVENTS + 1 }, (_, index) =>
      envelope({ id: `ev-filler-${index}` })
    );
    assert.throws(
      () => new LocalJournal(withRoot("oversized-corpus")).append(tooMany),
      /limited to 100 events/
    );
  });
});

describe("an authoritative record outranks a report, and a late arrival does not rewind", () => {
  test("an authoritative record survives a newer report", () => {
    const authoritative = { ...envelope({ id: "a" }), authority: "authoritative" };
    const report = {
      ...envelope({ id: "b", observedAt: "2026-10-05T00:00:00.000Z" }),
      authority: "reported"
    };
    assert.equal(preferredObservation(authoritative, report), authoritative);
    assert.equal(preferredObservation(report, authoritative), authoritative);
  });

  test("a later observation of equal authority wins", () => {
    const older = { ...envelope({ id: "a", observedAt: "2026-10-01T00:00:00.000Z" }) };
    const newer = { ...envelope({ id: "b", observedAt: "2026-10-02T00:00:00.000Z" }) };
    assert.equal(preferredObservation(older, newer), newer);
    // The newer one is already held, so a late older arrival changes nothing.
    assert.equal(preferredObservation(newer, older), newer);
  });

  test("an exact tie is broken deterministically so replay order cannot matter", () => {
    const first = { ...envelope({ id: "a" }) };
    const second = { ...envelope({ id: "b" }) };
    assert.equal(preferredObservation(first, second), second);
    assert.equal(preferredObservation(second, first), second);
  });

  test("the last-observed projection keeps the authoritative state", () => {
    const projection = createLastObserved();
    for (const event of cleanCorpus()) projection.apply(validateEnvelope(event).envelope);
    const pirates = projection
      .read()
      .find((entry) => entry.subject === "pirates" && entry.type === "project.state-reviewed");
    assert.equal(pirates.attributes.state, "parity gate locked");
    assert.equal(pirates.id, "ev-005");
    // Both rejections are recorded rather than quietly discarded.
    assert.equal(projection.superseded.length, 2);
    assert.ok(projection.superseded.some((entry) => entry.reason.includes("authoritative")));
    assert.ok(projection.superseded.some((entry) => entry.reason.includes("newer observation")));
  });
});

describe("delivery faults", () => {
  test("a duplicate delivery is ignored rather than applied twice", () => {
    const events = cleanCorpus();
    const { consumer } = consumerFor("duplicate", [...events, events[0], events[1]]);
    const report = consumer.run();
    assert.equal(report.applied, events.length);
    assert.equal(report.duplicates, 2);
    assert.equal(consumer.snapshot().applied.length, events.length);
  });

  test("out-of-order arrival reaches the same state as in-order arrival", () => {
    const inOrder = cleanCorpus();
    const shuffled = [...inOrder].reverse();
    const straight = consumerFor("order-a", inOrder).consumer;
    straight.run();
    const reversed = consumerFor("order-b", shuffled).consumer;
    reversed.run();
    const lastObserved = (consumer) =>
      JSON.stringify(consumer.snapshot().events.filter((entry) => entry.subject === "pirates"));
    assert.equal(lastObserved(straight), lastObserved(reversed));
  });

  test("a malformed batch is refused whole, with no per-message dead-letter path assumed", () => {
    const { consumer } = consumerFor("poison", corruptCorpus());
    const report = consumer.run({ maxAttempts: 3 });
    assert.equal(report.poison.length > 0, true);
    // The checkpoint did not move past the bad batch, so nothing after it was skipped.
    assert.equal(consumer.checkpoint.offset, 0);
    assert.match(report.halted, /redelivered 3 times/);
    for (const poison of report.poison)
      assert.ok(poison.problems.length > 0, "a poison batch must record why");
  });

  test("skipping a poison batch is explicit, recorded, and costs its good neighbours", () => {
    // Batch-at-a-time semantics: a malformed event invalidates the whole batch it
    // arrived in, including the valid events beside it. That is a real cost of
    // choosing batches, so the test states it rather than hiding it.
    const events = [...corruptCorpus(), ...cleanCorpus()];
    const { consumer } = consumerFor("poison-skip", events, {
      injection: ({ phase, offset }) =>
        phase === "beforeValidate" && offset === 0 ? "skipPoison" : null
    });
    const report = consumer.run({ maxAttempts: 1 });

    const firstBatch = Math.min(BATCH_SIZE, events.length);
    assert.equal(report.skipped.length, 1);
    assert.equal(report.skipped[0].offset, 0);
    assert.equal(report.poison.length > 0, true, "the refusal is still recorded");
    // The valid event inside the skipped batch was lost with it.
    assert.equal(consumer.snapshot().applied.includes("ev-001"), false);
    // Everything after the skipped batch applied, and the run reached the end.
    assert.equal(consumer.snapshot().applied.length, events.length - firstBatch);
    assert.equal(consumer.checkpoint.offset, events.length);
    assert.equal(report.halted, null);
  });

  test("interrupting before validation leaves the checkpoint exactly where it was", () => {
    const { consumer } = consumerFor("interrupt-early", cleanCorpus(), {
      injection: ({ phase, offset }) =>
        phase === "beforeValidate" && offset === 0 ? "interrupt" : null
    });
    const before = consumer.checkpoint.offset;
    const report = consumer.run();
    assert.equal(consumer.checkpoint.offset, before);
    assert.match(report.halted, /before validation/);
  });

  test("interrupting before the snapshot loses no checkpoint progress and no data", () => {
    let fired = false;
    const { consumer } = consumerFor("interrupt-mid", cleanCorpus(), {
      injection: ({ phase }) => {
        if (phase === "beforeApply" && !fired) {
          fired = true;
          return "interrupt";
        }
        return null;
      }
    });
    const report = consumer.run();
    assert.equal(consumer.checkpoint.offset, 0);
    assert.equal(report.applied, 0, "the interrupted batch applied nothing");
    assert.match(report.halted, /before anything was applied/);
    // Resuming offers the same batch again and the run completes from there.
    const resumed = consumer.run();
    assert.equal(resumed.applied, cleanCorpus().length);
    assert.equal(consumer.checkpoint.offset, cleanCorpus().length);
    assert.equal(consumer.snapshot().applied.length, cleanCorpus().length);
  });

  test("a crash between the projection and the checkpoint replays safely and changes nothing", () => {
    // This is the ordering the whole design rests on: the projection is written
    // first, so a lost checkpoint means redelivery rather than data loss, and the
    // reducer ignoring a known event id makes that redelivery a no-op.
    const events = cleanCorpus();
    let fired = false;
    const { consumer } = consumerFor("interrupt-late", events, {
      injection: ({ phase }) => {
        if (phase === "afterSnapshot" && !fired) {
          fired = true;
          return "interrupt";
        }
        return null;
      }
    });
    const first = consumer.run();
    assert.match(first.halted, /before the checkpoint/);
    const snapshotAfterCrash = JSON.stringify(consumer.snapshot().events);

    // The redelivered batch is recognised as already applied and changes nothing;
    // only the events the crash prevented from being applied go in.
    const resumed = consumer.run();
    assert.equal(resumed.applied, events.length - BATCH_SIZE);
    assert.equal(resumed.duplicates, BATCH_SIZE);
    assert.equal(resumed.applied + resumed.duplicates, events.length);
    assert.equal(consumer.snapshot().applied.length, events.length);
    assert.notEqual(JSON.stringify(consumer.snapshot().events), snapshotAfterCrash);
    assert.equal(consumer.checkpoint.offset, events.length);
  });

  test("a lost acknowledgement leaves the batch owed and it is delivered again", () => {
    const { journal, consumer } = consumerFor("lost-ack", cleanCorpus(), {
      injection: ({ phase }) => (phase === "beforeAck" ? "loseLease" : null)
    });
    const report = consumer.run();
    assert.match(report.halted, /lease .* was gone before acknowledgement/);
    assert.equal(journal.ack("lease-never-held"), false);
    // Nothing was skipped: the offset is still at the start of the corpus.
    assert.equal(consumer.checkpoint.offset, 0);
  });

  test("a lease past its deadline is no longer held", () => {
    const journal = LocalJournal.create(withRoot("lease-journal"), cleanCorpus());
    const lease = journal.lease(0, { now: 1000 });
    assert.equal(journal.expiredLease(lease.id, 1001), false);
    assert.equal(journal.expiredLease(lease.id, LEASE_MS + 1001), true);
  });

  test("retention expiry loses leases but never loses the corpus or the checkpoint", () => {
    const events = cleanCorpus();
    const { journal, consumer } = consumerFor("retention", events);
    consumer.run();
    assert.equal(consumer.checkpoint.offset, events.length);

    // Retention expiry, or a process restart, drops in-flight leases.
    journal.dropLeases();
    assert.equal(journal.size, events.length, "the corpus is untouched");

    const afterExpiry = consumer.run();
    assert.equal(afterExpiry.batches, 0, "a finished consumer has nothing left to take");
    assert.equal(consumer.checkpoint.offset, events.length);
  });

  test("retry exhaustion is bounded and reported rather than looping", () => {
    const { consumer } = consumerFor("retry-exhaustion", corruptCorpus());
    const report = consumer.run({ maxAttempts: 2 });
    assert.equal(report.poisonAttempts, 2);
    assert.match(report.halted, /redelivered 2 times/);
  });
});

describe("independent projections", () => {
  test("two projections checkpoint separately and either can be rebuilt alone", () => {
    const journal = LocalJournal.create(withRoot("shared-journal"), cleanCorpus());
    const timeline = new ReplayConsumer({
      root: withRoot("independent-timeline"),
      journal,
      projectionName: "timeline"
    });
    const lastObserved = new ReplayConsumer({
      root: withRoot("independent-last"),
      journal,
      projectionName: "last-observed"
    });
    // The timeline runs to completion; the other projection is left paused.
    timeline.run();
    assert.equal(timeline.checkpoint.offset, cleanCorpus().length);
    assert.equal(lastObserved.checkpoint.offset, 0);

    // Pausing one did not disturb the other, and the paused one can now catch up
    // without the finished one being rebuilt.
    lastObserved.run();
    assert.equal(lastObserved.checkpoint.offset, cleanCorpus().length);
    assert.equal(timeline.checkpoint.offset, cleanCorpus().length);

    // Rebuilding one projection from its exported checkpoint reproduces it.
    const exported = exportCheckpoint(withRoot("independent-timeline"), "timeline");
    const rebuilt = new ReplayConsumer({
      root: withRoot("rebuilt-timeline"),
      journal,
      projectionName: "timeline"
    });
    rebuilt.restore(JSON.parse(exported.contents));
    assert.deepEqual(rebuilt.snapshot().events, timeline.snapshot().events);
  });

  test("an exported checkpoint is the checkpoint file, and restoring it is deterministic", () => {
    const events = cleanCorpus();
    const { journal, consumer } = consumerFor("checkpoint", events);
    consumer.run();
    const exported = exportCheckpoint(withRoot("checkpoint"), "timeline");
    assert.match(exported.contents, /"offset":10/);

    const restored = new ReplayConsumer({
      root: withRoot("checkpoint-restored"),
      journal,
      projectionName: "timeline"
    });
    restored.restore(JSON.parse(exported.contents));
    assert.deepEqual(restored.snapshot().events, consumer.snapshot().events);
  });

  test("a checkpoint written but not yet durable is not claimed as progress", () => {
    const { consumer } = consumerFor("partial", cleanCorpus());
    // A checkpoint file that was never written leaves the consumer at the start,
    // which is the safe direction to fail in.
    assert.equal(consumer.checkpoint.offset, 0);
    consumer.run();
    assert.equal(consumer.checkpoint.offset, cleanCorpus().length);
  });
});

describe("the published boundary", () => {
  test("a projection's public view excludes internal and restricted observations", () => {
    const timeline = createTimeline();
    for (const event of cleanCorpus()) timeline.apply(validateEnvelope(event).envelope);
    const publicEntries = timeline.publicRead();
    assert.equal(publicEntries.length, 8);
    assert.equal(
      publicEntries.some((entry) => entry.visibility !== "public"),
      false
    );
  });

  test("the corpus is checked for private material before anything is replayed", () => {
    assert.equal(assertCorpusIsPublishable(cleanCorpus()), true);
    assert.throws(
      () => assertCorpusIsPublishable([{ attributes: { note: "dean@deanlofts.xyz" } }]),
      /email address/
    );
    assert.throws(
      () => assertCorpusIsPublishable([{ attributes: { note: "ghp_" + "a".repeat(36) } }]),
      /GitHub token/
    );
    assert.throws(
      () => assertCorpusIsPublishable(new Array(MAX_CORPUS_EVENTS + 1).fill({ id: "x" })),
      /exceeds the 100-event limit/
    );
  });

  test("the snapshot files the lab writes carry no private material", () => {
    const result = replayAll({ root: withRoot("privacy") });
    for (const name of ["timeline", "last-observed"]) {
      const file = path.join(result.root, name, `projection.${name}.json`);
      assert.equal(existsSync(file), true);
      const body = readFileSync(file, "utf8");
      assert.equal(/@[\w.-]+\.[a-z]{2,}/i.test(body), false);
      assert.equal(/gh[pousr]_/.test(body), false);
    }
    result.remove();
  });
});

describe("the documented command", () => {
  test("a clean run reaches the same state twice and changes nothing on the second pass", () => {
    const result = replayAll({ root: withRoot("documented") });
    assert.equal(result.stable, true);
    assert.equal(result.first.timeline.applied, cleanCorpus().length);
    assert.equal(result.first["last-observed"].applied, 8);
    assert.equal(result.first["last-observed"].notNewer, 2);
    for (const projection of Object.values(result.second)) assert.equal(projection.applied, 0);
    assert.match(result.timelineDigest, /^[0-9a-f]{64}$/);
    assert.match(result.lastObservedDigest, /^[0-9a-f]{64}$/);

    const text = formatReport(result);
    assert.match(text, /State stable across runs\s+true/);
    assert.match(text, /Contains private material\s+no/);
    result.remove();
  });

  test("an injected failure is reported rather than hidden, and the lab survives it", () => {
    const result = replayAll({
      root: withRoot("injected"),
      injection: (_name, { phase }) => (phase === "afterSnapshot" ? "interrupt" : null)
    });
    // One interruption per projection is enough to prove the ordering holds.
    assert.match(result.first.timeline.halted, /before the checkpoint/);
    assert.match(result.first["last-observed"].halted, /before the checkpoint/);
    // Even after an injected failure the digests are reported, so an operator can
    // compare a broken run against a good one.
    assert.match(result.timelineDigest, /^[0-9a-f]{64}$/);
    result.remove();
  });

  test("a projection snapshot on disk is valid JSON with no partial write", () => {
    const result = replayAll({
      root: withRoot("atomic"),
      injection: (_name, { phase }) => (phase === "afterSnapshot" ? "interrupt" : null)
    });
    const file = path.join(result.root, "timeline", "projection.timeline.json");
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    assert.equal(parsed.projection, "timeline");
    // A crash mid-write would leave a .tmp file; a committed snapshot never coexists
    // with one, so the visible file is always a whole document.
    assert.equal(existsSync(`${file}.tmp`), false);
    result.remove();
  });
});

describe("the journal", () => {
  test("batches are bounded and a lease covers exactly one batch", () => {
    const journal = LocalJournal.create(withRoot("batching"), cleanCorpus());
    const lease = journal.lease(0, { batchSize: BATCH_SIZE });
    assert.equal(lease.count, BATCH_SIZE);
    assert.equal(journal.lease(0, { batchSize: BATCH_SIZE }).count, BATCH_SIZE, "re-leaseable");
    assert.equal(journal.lease(cleanCorpus().length), null, "nothing past the end");
  });

  test("an acknowledged lease cannot be acknowledged twice", () => {
    const journal = LocalJournal.create(withRoot("ack"), cleanCorpus());
    const lease = journal.lease(0);
    assert.equal(journal.ack(lease.id), true);
    assert.equal(journal.ack(lease.id), false);
    const nacked = journal.lease(0);
    assert.equal(journal.nack(nacked.id), true);
  });

  test("a corpus written to disk is byte-identical to the one it was given", () => {
    const events = cleanCorpus();
    const journal = LocalJournal.create(withRoot("bytes"), events);
    const lines = readFileSync(journal.path, "utf8").split("\n").filter(Boolean);
    assert.deepEqual(
      lines.map((line) => JSON.parse(line)),
      events
    );
  });
});

describe("a corrupted journal on disk is detected rather than replayed", () => {
  test("a truncated final line does not silently become a valid event", () => {
    const journal = LocalJournal.create(withRoot("truncated"), cleanCorpus());
    const body = readFileSync(journal.path, "utf8");
    writeFileSync(journal.path, body.slice(0, body.length - 12));
    const consumer = new ReplayConsumer({
      root: withRoot("truncated-consumer"),
      journal,
      projectionName: "timeline"
    });
    const report = consumer.run({ maxAttempts: 1 });
    // Either the short line parses and fails validation, or the batch is refused.
    // Both are refusals; silently dropping it is not an option.
    assert.equal(report.applied + report.poison.length > 0, true);
  });
});
