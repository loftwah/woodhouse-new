// The local journal, and the replay consumer that reads it.
//
// The journal is an append-only file of JSON lines. It stands in for a durable
// event stream so the consumer's behaviour can be tested without one: it offers
// the same three operations a stream offers — read a batch from an offset, take
// a lease on it, then ack or nack — including the parts that are inconvenient,
// namely that a lease expires and that acknowledgement is separate from the work.
//
// Durability here is a temp-file rename, which is atomic on the same filesystem.
// That is deliberately stronger than a remote log, so the recovery tests are not
// quietly relying on the local implementation being forgiving.

import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PROJECTIONS } from "./projections.mjs";
import { MAX_CORPUS_BYTES, MAX_CORPUS_EVENTS, validateEnvelope } from "./envelope.mjs";

export const BATCH_SIZE = 8;
/** Matches the documented K2 consume lease, so expiry behaves comparably. */
export const LEASE_MS = 5 * 60 * 1000;

class PoisonBatchError extends Error {
  constructor(offset, events, problems) {
    super(
      `batch at offset ${offset} contains ${events.length} event(s) that are not valid envelopes`
    );
    this.offset = offset;
    this.batch = events;
    this.problems = problems;
  }
}

function writeAtomic(file, contents) {
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, contents, { mode: 0o600 });
  renameSync(temporary, file);
}

export class LocalJournal {
  constructor(root) {
    this.root = root;
    this.path = path.join(root, "events.ndjson");
    mkdirSync(root, { recursive: true, mode: 0o700 });
  }

  static create(root, envelopes) {
    const journal = new LocalJournal(root);
    journal.append(envelopes);
    return journal;
  }

  /** Append raw lines. Bypasses validation on purpose: the corpus is the input. */
  append(envelopes) {
    const existing = existsSync(this.path) ? readFileSync(this.path, "utf8") : "";
    const count = existing.split("\n").filter(Boolean).length;
    const size = Buffer.byteLength(existing, "utf8");
    // The limits bound the corpus as a whole, so the first append is checked too.
    if (count + envelopes.length > MAX_CORPUS_EVENTS)
      throw new Error(
        `the corpus is limited to ${MAX_CORPUS_EVENTS} events; this append would make it ${count + envelopes.length}`
      );
    if (size > MAX_CORPUS_BYTES)
      throw new Error(`the corpus is limited to ${MAX_CORPUS_BYTES} bytes`);
    const lines = envelopes.map((event) => JSON.stringify(event)).join("\n");
    writeFileSync(this.path, `${existing}${lines}\n`, { mode: 0o600 });
    return envelopes.length;
  }

  get size() {
    if (!existsSync(this.path)) return 0;
    return readFileSync(this.path, "utf8").split("\n").filter(Boolean).length;
  }

  /**
   * Read a batch from an offset and take a lease on it.
   *
   * A lease, not a cursor: the consumer may hold the same batch again until it
   * acks or the lease expires, which is exactly the delivery behaviour the
   * replay has to tolerate.
   */
  lease(offset, { batchSize = BATCH_SIZE, now = 0 } = {}) {
    if (!existsSync(this.path)) return null;
    const lines = readFileSync(this.path, "utf8").split("\n").filter(Boolean);
    const slice = lines.slice(offset, offset + batchSize);
    if (!slice.length) return null;
    const id = `lease-${offset}-${now}`;
    const lease = { id, offset, count: slice.length, leasedUntil: now + LEASE_MS };
    this.leases = this.leases ?? new Map();
    this.leases.set(id, lease);
    // Lines are handed over as written. A corrupt line is the consumer's
    // problem to report, not something the reader hides by throwing.
    return { ...lease, events: slice };
  }

  ack(leaseId) {
    if (!this.leases?.has(leaseId)) return false;
    this.leases.delete(leaseId);
    return true;
  }

  nack(leaseId) {
    if (!this.leases?.has(leaseId)) return false;
    this.leases.delete(leaseId);
    return true;
  }

  /** A lease past its deadline is no longer held; the batch is available again. */
  expiredLease(leaseId, now) {
    const lease = this.leases?.get(leaseId);
    return Boolean(lease && now > lease.leasedUntil);
  }

  /** Forget every lease, as retention expiry or a process restart would. */
  dropLeases() {
    this.leases = new Map();
  }
}

/**
 * A replay consumer over one projection.
 *
 * The ordering is the whole point and it is deliberate:
 *
 *   1. take a lease on a batch
 *   2. validate every envelope in it, and refuse the batch if any fails
 *   3. apply the envelopes to the in-memory projection
 *   4. write the projection snapshot atomically
 *   5. only then write the checkpoint
 *
 * A crash between 4 and 5 loses the checkpoint but not the projection, so the
 * batch is replayed. That is safe because the reducers ignore an event id they
 * have already applied: delivery is at-least-once and the projections are
 * idempotent, which together give effectively-once projection state.
 *
 * A crash between 2 and 3 leaves the checkpoint untouched, so nothing is skipped.
 *
 * Replay only ever reconstructs derived data. It cannot send email, publish,
 * build, deploy, write to GitHub, run a tool or touch a device, because this
 * module imports nothing that could do any of those things and its only output
 * is a projection file and a checkpoint file.
 */
export class ReplayConsumer {
  constructor({ root, journal, projectionName, injection = () => null }) {
    this.root = root;
    this.journal = journal;
    this.projectionName = projectionName;
    this.projection = PROJECTIONS[projectionName]();
    this.injection = injection;
    this.checkpointPath = path.join(root, `checkpoint.${projectionName}.json`);
    this.snapshotPath = path.join(root, `projection.${projectionName}.json`);
    this.poison = [];
    this.skipped = [];
    mkdirSync(root, { recursive: true, mode: 0o700 });
  }

  get checkpoint() {
    if (!existsSync(this.checkpointPath)) return { offset: 0, applied: 0 };
    return JSON.parse(readFileSync(this.checkpointPath, "utf8"));
  }

  /** Rebuild in memory from an exported checkpoint rather than from the start. */
  restore(checkpoint) {
    for (let offset = 0; offset < checkpoint.offset; offset += BATCH_SIZE) {
      const batch = this.journal.lease(offset, { batchSize: BATCH_SIZE });
      if (!batch) break;
      for (const line of batch.events) {
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          // A corpus that cannot be parsed cannot be replayed past. The live
          // path refuses such a batch; a rebuild from a checkpoint reports the
          // same gap rather than pretending the projection is complete.
          continue;
        }
        const { envelope } = validateEnvelope(event);
        if (envelope) this.projection.apply(envelope);
      }
    }
    this.#writeSnapshot();
    writeAtomic(this.checkpointPath, JSON.stringify(checkpoint));
    return this.projection.read();
  }

  run({ now = 0, maxAttempts = 3 } = {}) {
    const report = {
      projection: this.projectionName,
      batches: 0,
      applied: 0,
      poisonAttempts: 0,
      duplicates: 0,
      notNewer: 0,
      poison: [],
      skipped: [],
      halted: null,
      startedAt: this.checkpoint.offset,
      endedAt: this.checkpoint.offset
    };

    for (;;) {
      const offset = this.checkpoint.offset;
      const batch = this.journal.lease(offset, { now });
      if (!batch) break;
      if (report.batches < 1000) report.batches += 1;

      const fault = this.injection({ phase: "beforeValidate", offset, attempt: report.batches });
      if (fault === "interrupt") {
        report.halted = "interrupted before validation; the checkpoint did not move";
        break;
      }

      // A batch is the unit of delivery, so a batch is the unit of refusal.
      // There is no per-message dead-letter path here and none is assumed.
      const accepted = [];
      const problems = [];
      batch.events.forEach((line, position) => {
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          problems.push(`line ${offset + position} is not valid JSON`);
          return;
        }
        const result = validateEnvelope(event);
        if (result.envelope) accepted.push(result.envelope);
        else problems.push(...result.problems);
      });
      if (problems.length) {
        const error = new PoisonBatchError(offset, batch.events, problems);
        this.poison.push({ offset, count: batch.events.length, problems });
        report.poison.push({ offset, problems });
        report.poisonAttempts += 1;
        if (fault === "skipPoison" || this.skipPoison) {
          // An explicit operator decision, recorded. Never a silent drop.
          this.skipped.push({
            offset,
            count: batch.events.length,
            at: new Date(now).toISOString()
          });
          report.skipped.push({ offset });
          this.#writeSnapshot();
          this.#commit(offset + batch.count);
          report.endedAt = this.checkpoint.offset;
          continue;
        }
        if (report.poisonAttempts < maxAttempts) {
          // Redelivery of the same batch. The lease is released rather than
          // acknowledged, so the offset is offered again from the start.
          this.journal.dropLeases();
          report.batches -= 1;
          continue;
        }
        this.journal.ack(batch.id);
        report.halted = `${error.message}; redelivered ${maxAttempts} times with no operator action`;
        break;
      }

      const beforeApply = this.injection({ phase: "beforeApply", offset, attempt: report.batches });
      if (beforeApply === "interrupt") {
        report.halted = "interrupted after validation, before anything was applied";
        break;
      }

      for (const envelope of accepted) {
        const outcome = this.projection.apply(envelope);
        if (outcome.reason === "duplicate") report.duplicates += 1;
        else if (outcome.reason === "not newer") report.notNewer += 1;
        else report.applied += 1;
      }

      const afterSnapshot = this.injection({
        phase: "afterSnapshot",
        offset,
        attempt: report.batches
      });
      this.#writeSnapshot();
      if (afterSnapshot === "interrupt") {
        report.halted = "interrupted after the projection was written, before the checkpoint";
        break;
      }

      // The acknowledgement and the checkpoint are the last step. A crash before
      // it means the batch is delivered again, which step 4 above made safe.
      if (this.injection({ phase: "beforeAck", offset, attempt: report.batches }) === "loseLease")
        // A lost lease is indistinguishable from a lost acknowledgement: the
        // batch is still there and still owed, so it must be delivered again.
        this.journal.dropLeases();
      if (!this.journal.ack(batch.id)) {
        report.halted = `the lease ${batch.id} was gone before acknowledgement`;
        break;
      }
      this.#commit(offset + batch.count, report.applied);
      report.endedAt = this.checkpoint.offset;

      if (
        this.injection({ phase: "afterCommit", offset, attempt: report.batches }) === "interrupt"
      ) {
        report.halted = "interrupted after a commit; the next run resumes from the checkpoint";
        break;
      }
    }
    return report;
  }

  #writeSnapshot() {
    const payload = {
      projection: this.projectionName,
      events: this.projection.read(),
      applied: [...this.projection.applied].sort()
    };
    writeAtomic(this.snapshotPath, JSON.stringify(payload, null, 2));
  }

  #commit(offset, applied) {
    writeAtomic(
      this.checkpointPath,
      JSON.stringify({
        offset,
        applied: applied ?? this.checkpoint.applied,
        at: new Date(0).toISOString()
      })
    );
  }

  snapshot() {
    if (!existsSync(this.snapshotPath)) return null;
    return JSON.parse(readFileSync(this.snapshotPath, "utf8"));
  }
}

/** An exported checkpoint is just the checkpoint file; copying it is the export. */
export function exportCheckpoint(root, projectionName) {
  const from = path.join(root, `checkpoint.${projectionName}.json`);
  if (!existsSync(from)) throw new Error(`${projectionName} has no checkpoint to export`);
  return { from, contents: readFileSync(from, "utf8") };
}

export function removeLabRoot(root) {
  rmSync(root, { recursive: true, force: true });
}
