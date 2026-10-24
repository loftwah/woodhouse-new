import assert from "node:assert/strict";
import test from "node:test";
import { fmPlayerStatus } from "./fm-player.ts";

test("FM status names the station and never claims audio is playing", () => {
  const loading = fmPlayerStatus("loading", "Night Signal");
  const ready = fmPlayerStatus("ready", "Night Signal");
  assert.equal(loading, "Loading Night Signal…");
  assert.match(ready, /Night Signal player is loaded/);
  assert.match(ready, /Press Play/);
  assert.doesNotMatch(ready, /playing/i);
});

test("FM failure states keep retry and the direct FM route available", () => {
  for (const stage of ["slow", "failed"] as const) {
    const message = fmPlayerStatus(stage, "Night Signal");
    assert.match(message, /Try again/);
    assert.match(message, /open the station on FM/);
  }
});

test("FM status handles a missing station name and the closed panel", () => {
  assert.equal(fmPlayerStatus("loading", "  "), "Loading the station…");
  assert.equal(fmPlayerStatus("closed", "Night Signal"), "The player loads when this panel opens.");
  assert.match(fmPlayerStatus("checking", "Night Signal"), /Checking Night Signal/);
});
