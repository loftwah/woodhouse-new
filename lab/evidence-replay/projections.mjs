// Two read-only projections rebuilt from the same event log.
//
// A projection is a pure function of the events it has seen. It never reads the
// clock, never calls out, and never decides that something is "live". Two of them
// run over the same corpus for different questions, and each checkpoints on its
// own, so one can be rebuilt without touching the other.

import { preferredObservation } from "./envelope.mjs";

/**
 * Projection one: the evidence timeline.
 *
 * Every accepted observation, ordered by when it happened and then by event id,
 * with the applied events recorded so a rebuild can be compared to what was seen
 * before.
 */
function createTimeline() {
  const entries = new Map();
  const applied = new Set();
  return {
    name: "timeline",
    entries,
    applied,
    apply(envelope) {
      if (this.applied.has(envelope.id)) return { changed: false, reason: "duplicate" };
      this.applied.add(envelope.id);
      this.entries.set(envelope.id, envelope);
      return { changed: true };
    },
    read() {
      return [...this.entries.values()].sort((left, right) => {
        const byTime = Date.parse(left.occurredAt) - Date.parse(right.occurredAt);
        return byTime !== 0 ? byTime : left.id.localeCompare(right.id);
      });
    },
    /** Only observations a public page is allowed to show. */
    publicRead() {
      return this.read().filter((entry) => entry.visibility === "public");
    }
  };
}

/**
 * Projection two: the last observed state per project.
 *
 * This is the projection that has to resist a late arrival. An observation that
 * turns up after a newer one must not roll the state back, and a report must
 * never displace an authoritative record.
 */
function createLastObserved() {
  const state = new Map();
  const applied = new Set();
  const superseded = [];
  return {
    name: "last-observed",
    state,
    applied,
    superseded,
    apply(envelope) {
      if (this.applied.has(envelope.id)) return { changed: false, reason: "duplicate" };
      const key = `${envelope.subject}\0${envelope.type}`;
      const current = this.state.get(key);
      const winner = preferredObservation(current ?? null, envelope);
      if (current && winner === current) {
        this.applied.add(envelope.id);
        this.superseded.push({
          key,
          rejected: envelope.id,
          kept: current.id,
          reason:
            current.authority !== envelope.authority
              ? "kept the authoritative record"
              : "a newer observation already covers this"
        });
        return { changed: false, reason: "not newer" };
      }
      this.applied.add(envelope.id);
      this.state.set(key, envelope);
      return { changed: true, key };
    },
    read() {
      return [...this.state.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, envelope]) => ({ key, ...envelope }));
    }
  };
}

export const PROJECTIONS = { timeline: createTimeline, "last-observed": createLastObserved };
