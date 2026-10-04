import assert from "node:assert/strict";
import test from "node:test";
import { hasProbeToken, stripProbeToken } from "./visibility-probe.mjs";

// Two runs of `pnpm run measure:visibility` were abandoned while measuring the
// preview cache, and each left a `visibility-probe-*` token in the deck of a
// published dispatch — reader-visible text on a live site. The `finally` block
// that reverts the record does not run for SIGINT or SIGTERM, and the script
// refused to start again without offering a way to clean up.
test("a probe token is removed and the editorial text is left alone", () => {
  const deck =
    "A public origin could not state which source it was serving. visibility-probe-muuc8kms";
  assert.equal(
    stripProbeToken(deck),
    "A public origin could not state which source it was serving."
  );
});

test("a token with no leading space is still removed", () => {
  assert.equal(stripProbeToken("A deck. visibility-probe-abc123"), "A deck.");
  // The probe appends with a leading space, so this is the defensive path. The
  // surrounding editorial text is preserved either way, including its punctuation.
  assert.equal(stripProbeToken("A deck.visibility-probe-abc123"), "A deck.");
});

test("an interrupted run's double space does not survive", () => {
  assert.equal(stripProbeToken("A deck.  visibility-probe-abc123"), "A deck.");
});

test("more than one leftover token is removed", () => {
  assert.equal(stripProbeToken("A deck. visibility-probe-one visibility-probe-two"), "A deck.");
});

test("a deck with no token is unchanged", () => {
  assert.equal(stripProbeToken("A reviewed deck."), "A reviewed deck.");
});

test("a leftover token is detected so a stale run is refused", () => {
  assert.equal(hasProbeToken("A deck. visibility-probe-abc123"), true);
  assert.equal(hasProbeToken("A reviewed deck."), false);
  assert.equal(hasProbeToken(""), false);
});

test("an empty deck does not throw", () => {
  assert.equal(stripProbeToken(""), "");
  assert.equal(stripProbeToken("   "), "");
});
