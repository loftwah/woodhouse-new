import assert from "node:assert/strict";
import test from "node:test";
import { activeFrameSeconds } from "./loom-timing.ts";

test("the scene clock advances at frame time", () => {
  assert.equal(activeFrameSeconds(16.7), 0.0167);
  assert.equal(activeFrameSeconds(50), 0.05);
});

test("a frozen or stalled page adds at most one frame of scene time", () => {
  let phase = 12;
  for (const delta of [16.7, 16.7, 60_000, 16.7]) phase += activeFrameSeconds(delta);
  assert.ok(Math.abs(phase - 12.1001) < 1e-9, `expected 12.1001, got ${phase}`);
  assert.equal(activeFrameSeconds(5_000), 0.05);
});

test("an invalid or backwards timestamp does not move the scene", () => {
  assert.equal(activeFrameSeconds(Number.NaN), 0);
  assert.equal(activeFrameSeconds(Number.POSITIVE_INFINITY), 0);
  assert.equal(activeFrameSeconds(-1), 0);
});
