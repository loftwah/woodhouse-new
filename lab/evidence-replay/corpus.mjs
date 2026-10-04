// A synthetic evidence corpus, and the shapes a delivery system actually breaks on.
//
// Everything here is invented. No repository body, conversation, personal detail,
// credential, audio file or binary is present, and `assertCorpusIsPublishable`
// proves it rather than asserting it in a comment.

import { createHash } from "node:crypto";
import { ENVELOPE_VERSION, MAX_CORPUS_EVENTS } from "./envelope.mjs";

const BASE_OBSERVED = Date.parse("2026-10-04T00:00:00.000Z");
const at = (minutes) => new Date(BASE_OBSERVED + minutes * 60_000).toISOString();
const sha = (seed) => createHash("sha256").update(seed).digest("hex").slice(0, 40);

export function envelope(overrides) {
  return {
    schema: ENVELOPE_VERSION,
    id: `ev-${sha(JSON.stringify(overrides)).slice(0, 10)}`,
    source: "loftwah/asset-hunter",
    sourceRevision: sha("asset-hunter"),
    correlationId: "cor-portfolio",
    visibility: "public",
    authority: "authoritative",
    occurredAt: at(0),
    observedAt: at(1),
    ...overrides
  };
}

/**
 * The corpus a clean replay runs over: bounded, deterministic, and containing the
 * two cases a naive reducer gets wrong — a late-arriving older observation and a
 * report trying to displace an authoritative record.
 */
export function cleanCorpus() {
  const events = [
    envelope({
      id: "ev-001",
      type: "project.state-reviewed",
      subject: "asset-hunter",
      occurredAt: at(0),
      observedAt: at(5),
      attributes: { state: "public and growing", reviewDate: "2026-10-04" }
    }),
    envelope({
      id: "ev-002",
      type: "project.evidence-recorded",
      subject: "asset-hunter",
      occurredAt: at(1),
      observedAt: at(6),
      attributes: { kind: "production verification", state: "reviewed" }
    }),
    envelope({
      id: "ev-003",
      type: "dispatch.published",
      subject: "nine-projects-and-the-first-one-you-can-check",
      occurredAt: at(2),
      observedAt: at(7),
      attributes: { kind: "Portfolio report" }
    }),
    envelope({
      id: "ev-004",
      type: "project.state-reviewed",
      subject: "bubbles",
      occurredAt: at(3),
      observedAt: at(8),
      attributes: { state: "near convergence", reviewDate: "2026-09-28" }
    }),
    envelope({
      id: "ev-005",
      type: "project.state-reviewed",
      // Newer and authoritative: this is the state that must survive.
      subject: "pirates",
      occurredAt: at(4),
      observedAt: at(9),
      attributes: { state: "parity gate locked", reviewDate: "2026-10-04" }
    }),
    envelope({
      id: "ev-006",
      type: "project.state-reviewed",
      // Arrives later but observed earlier: must not roll the state back.
      subject: "pirates",
      occurredAt: at(2),
      observedAt: at(3),
      attributes: { state: "reconstruction proceeding", reviewDate: "2026-09-01" }
    }),
    envelope({
      id: "ev-007",
      type: "project.state-reviewed",
      // A report about the same subject: must not displace the authoritative record.
      subject: "pirates",
      occurredAt: at(6),
      observedAt: at(10),
      authority: "reported",
      attributes: { state: "parity gate maybe open", reviewDate: "2026-10-05" }
    }),
    envelope({
      id: "ev-008",
      type: "deployment.observed",
      subject: "woodhouse",
      occurredAt: at(5),
      observedAt: at(11),
      visibility: "internal",
      attributes: { sourceDigest: sha("woodhouse"), environment: "preview" }
    }),
    envelope({
      id: "ev-009",
      type: "incident.recorded",
      subject: "woodhouse",
      occurredAt: at(7),
      observedAt: at(12),
      attributes: { summary: "standfirst repeated in every dispatch body" }
    }),
    envelope({
      id: "ev-010",
      type: "project.evidence-recorded",
      subject: "woodhouse",
      occurredAt: at(8),
      observedAt: at(13),
      visibility: "restricted",
      attributes: { note: "internal review state, not for publication" }
    })
  ];
  return events;
}

/** The same corpus delivered badly. Everything here is a delivery shape, not content. */
export function corruptCorpus() {
  const events = cleanCorpus();
  return [
    // An event id that has already been applied: a duplicate delivery.
    events[0],
    // A future schema version a consumer has never heard of.
    {
      ...envelope({ id: "ev-future", type: "project.state-reviewed", subject: "loftwahfm" }),
      schema: "loftwah.evidence/2"
    },
    // A type outside the known set.
    { ...envelope({ id: "ev-unknown-type" }), type: "project.teleported" },
    // A missing source revision, so nothing about it is checkable.
    {
      ...envelope({ id: "ev-no-revision", type: "project.state-reviewed", subject: "max" }),
      sourceRevision: ""
    },
    // A credential-shaped attribute.
    {
      ...envelope({ id: "ev-credential", type: "project.state-reviewed", subject: "max" }),
      attributes: { api_key: "not-a-real-key-but-still-wrong" }
    },
    // Observed before it happened.
    {
      ...envelope({
        id: "ev-backwards",
        type: "project.state-reviewed",
        subject: "max",
        occurredAt: at(20),
        observedAt: at(1)
      })
    }
  ];
}

export function oversizedEvent() {
  return {
    ...envelope({ id: "ev-oversized", type: "project.evidence-recorded", subject: "bubbles" }),
    attributes: { blob: "x".repeat(70 * 1024) }
  };
}

/**
 * Prove the corpus carries nothing private.
 *
 * This is the machine check behind the publication rule in issue #5: no issue
 * body, no credential, no personal detail, no bulk payload. It runs over every
 * event the lab will replay, including the malformed ones.
 */
export function assertCorpusIsPublishable(events) {
  if (events.length > MAX_CORPUS_EVENTS)
    throw new Error(
      `corpus of ${events.length} events exceeds the ${MAX_CORPUS_EVENTS}-event limit`
    );
  const forbidden = [
    [/@[\w.-]+\.[a-z]{2,}/i, "an email address"],
    [/\bgh[pousr]_[A-Za-z0-9]{20,}/, "a GitHub token"],
    [/\bBearer\s+[A-Za-z0-9._-]{20,}/, "an authorization header"],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a private key"],
    [/\bEMDASH_[A-Z_]+=/, "an EmDash environment value"]
  ];
  for (const event of events) {
    const serialised = JSON.stringify(event);
    for (const [pattern, description] of forbidden)
      if (pattern.test(serialised)) throw new Error(`the corpus contains ${description}`);
  }
  return true;
}
