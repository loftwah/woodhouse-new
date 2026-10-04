// The evidence envelope and its validation.
//
// An envelope carries one observation, not one conclusion. Everything a reader
// would want to check is in it: which source, which revision of that source,
// when the thing happened, when the factory observed it, which correlation it
// belongs to, and who is allowed to see it. Interpretation lives in the
// projections, never here.
//
// Deliberately absent: issue bodies, personal information, secrets, audio and
// large binaries. `MAX_ENVELOPE_BYTES` and the visibility allowlist are the two
// places that rule is enforced rather than merely stated.

export const ENVELOPE_VERSION = "loftwah.evidence/1";

/** Who may see an observation. `public` is the only value a publication path may read. */
const VISIBILITIES = ["public", "internal", "restricted"];

/**
 * How much weight a derived view gives an observation.
 *
 * `authoritative` is something the source itself asserts. `reported` is
 * somebody's account of it. A later report never displaces an authoritative
 * record, which is the difference between a dated record and a rumour.
 */
const AUTHORITIES = ["authoritative", "reported"];

export const MAX_ENVELOPE_BYTES = 64 * 1024;
export const MAX_CORPUS_EVENTS = 100;
export const MAX_CORPUS_BYTES = 1024 * 1024;

const EVENT_TYPES = [
  "project.state-reviewed",
  "project.evidence-recorded",
  "dispatch.published",
  "incident.recorded",
  "deployment.observed"
];

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA = /^[0-9a-f]{40,64}$/;

function text(value, limit = 400) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > limit) return null;
  return trimmed;
}

function isIso(value) {
  return typeof value === "string" && ISO.test(value) && !Number.isNaN(Date.parse(value));
}

/**
 * Build a validated envelope, or explain exactly what is wrong with the input.
 *
 * Validation is total: it returns either an envelope or a list of problems, so
 * a caller handling a malformed event never has to guess whether it succeeded.
 */
export function validateEnvelope(candidate) {
  const problems = [];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return { envelope: null, problems: ["an envelope must be an object"] };
  }

  const envelope = {
    schema: candidate.schema,
    id: text(candidate.id, 80),
    type: EVENT_TYPES.includes(candidate.type) ? candidate.type : null,
    source: text(candidate.source, 120),
    sourceRevision: text(candidate.sourceRevision, 80),
    occurredAt: isIso(candidate.occurredAt) ? candidate.occurredAt : null,
    observedAt: isIso(candidate.observedAt) ? candidate.observedAt : null,
    correlationId: text(candidate.correlationId, 80),
    visibility: VISIBILITIES.includes(candidate.visibility) ? candidate.visibility : null,
    authority: AUTHORITIES.includes(candidate.authority) ? candidate.authority : null,
    subject: text(candidate.subject, 80),
    attributes:
      candidate.attributes && typeof candidate.attributes === "object" ? candidate.attributes : null
  };

  if (envelope.schema !== ENVELOPE_VERSION) problems.push(`schema must be ${ENVELOPE_VERSION}`);
  if (!envelope.id) problems.push("id must be a short non-empty string");
  if (!envelope.type)
    problems.push(
      `type must be one of ${EVENT_TYPES.join(", ")}; got ${JSON.stringify(candidate.type)}`
    );
  if (!envelope.source) problems.push("source must name where the observation came from");
  if (!envelope.sourceRevision || !SHA.test(envelope.sourceRevision))
    problems.push(
      "sourceRevision must be a commit or content hash so the observation is checkable"
    );
  if (!envelope.occurredAt) problems.push("occurredAt must be an ISO-8601 instant");
  if (!envelope.observedAt) problems.push("observedAt must be an ISO-8601 instant");
  if (!envelope.correlationId) problems.push("correlationId must group related observations");
  if (!envelope.visibility) problems.push(`visibility must be one of ${VISIBILITIES.join(", ")}`);
  if (!envelope.authority) problems.push(`authority must be one of ${AUTHORITIES.join(", ")}`);
  if (!envelope.subject || !SLUG.test(envelope.subject))
    problems.push("subject must be a lowercase slug");
  if (!envelope.attributes) problems.push("attributes must be an object");

  if (envelope.observedAt && envelope.occurredAt) {
    // An observation cannot precede the thing it observed.
    if (Date.parse(envelope.observedAt) < Date.parse(envelope.occurredAt))
      problems.push("observedAt must not precede occurredAt");
  }

  if (envelope.attributes) {
    const bytes = Buffer.byteLength(JSON.stringify(candidate), "utf8");
    if (bytes > MAX_ENVELOPE_BYTES)
      problems.push(`envelope is ${bytes} bytes, over the ${MAX_ENVELOPE_BYTES}-byte limit`);
    // The corpus carries no bulk payloads. A field that is obviously binary or
    // audio-shaped is rejected here rather than being stored and discovered
    // later.
    for (const [key, value] of Object.entries(envelope.attributes)) {
      if (value instanceof Uint8Array || Buffer.isBuffer(value))
        problems.push(`attributes.${key} is binary; evidence carries references, not payloads`);
      if (typeof value === "string" && value.length > 2000)
        problems.push(`attributes.${key} is too long to be an observation`);
      if (/(password|secret|token|api[_-]?key|authorization)/i.test(key))
        problems.push(`attributes.${key} looks like a credential`);
    }
  }

  return { envelope: problems.length ? null : envelope, problems };
}

/**
 * Which of two observations about the same subject field should be believed.
 *
 * Returns the winner, or null when neither applies. The order is deliberate:
 * an authoritative record outranks a report regardless of time, and a tie is
 * broken by observation time and then by event id so that two runs over the
 * same corpus always agree.
 */
export function preferredObservation(existing, candidate) {
  if (!existing) return candidate;
  if (existing.authority !== candidate.authority) {
    return existing.authority === "authoritative" ? existing : candidate;
  }
  const existingAt = Date.parse(existing.observedAt);
  const candidateAt = Date.parse(candidate.observedAt);
  // A missing or unparsable timestamp compares as unknown rather than as "older",
  // so two unusable stamps fall through to the deterministic tie-break instead of
  // letting arrival order decide.
  if (Number.isFinite(existingAt) && Number.isFinite(candidateAt) && candidateAt !== existingAt)
    return candidateAt > existingAt ? candidate : existing;
  return candidate.id > existing.id ? candidate : existing;
}
