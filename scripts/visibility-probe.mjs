/**
 * The pure part of the visibility probe: identifying and removing the marker the
 * probe writes.
 *
 * Kept separate from `measure-content-visibility.mjs` because that script is a
 * CLI whose top-level statements run on import. A helper that has to be tested
 * cannot live behind an unguarded top-level await.
 */

/** The marker every probe token carries. */
const PROBE_TOKEN_PREFIX = "visibility-probe-";

/** Whether a deck currently carries a probe token. */
export function hasProbeToken(deck) {
  return String(deck ?? "").includes(PROBE_TOKEN_PREFIX);
}

/**
 * Remove any probe token from a deck, leaving the editorial text alone.
 *
 * A run that is interrupted after its write but before its cleanup leaves a
 * `visibility-probe-*` token in a published record. The token is a marker this
 * probe owns, so it can be identified and removed precisely, without needing the
 * original deck value that the write appended to.
 */
export function stripProbeToken(deck) {
  return String(deck ?? "")
    .replace(new RegExp(` ?${PROBE_TOKEN_PREFIX}[a-z0-9]+`, "g"), "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
