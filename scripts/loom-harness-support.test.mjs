import assert from "node:assert/strict";
import { test } from "node:test";
import {
  classifyConsole,
  frameRate,
  largestFrameGap,
  loomListenerMap,
  meanBrightness,
  meanPixelDiff,
  parseHarnessArguments,
  renderMatrix,
  sameListenerMap
} from "./loom-harness-support.mjs";

test("arguments default to the local dev origin and both engines", () => {
  const options = parseHarnessArguments([]);
  assert.equal(options.origin, "http://127.0.0.1:4331");
  assert.deepEqual(options.engines, ["chromium", "webkit"]);
  assert.deepEqual(options.scenarios, []);
});

test("arguments accept a preview origin, one engine and a scenario filter", () => {
  const options = parseHarnessArguments([
    "--",
    "--origin",
    "http://127.0.0.1:4332/",
    "--browser",
    "webkit",
    "--only",
    "bfcache, context-loss",
    "--output",
    "output/run"
  ]);
  assert.equal(options.origin, "http://127.0.0.1:4332");
  assert.deepEqual(options.engines, ["webkit"]);
  assert.deepEqual(options.scenarios, ["bfcache", "context-loss"]);
  assert.equal(options.output, "output/run");
});

test("an unknown argument or browser is refused", () => {
  assert.throws(() => parseHarnessArguments(["--browser", "gecko"]), /Unknown browser/);
  assert.throws(() => parseHarnessArguments(["--watch"]), /Unknown argument/);
  assert.throws(() => parseHarnessArguments(["--origin", "ftp://host"]), /http/);
});

test("pixel diff reports the mean channel change and rejects mismatched captures", () => {
  const before = { width: 2, height: 1, data: [0, 0, 0, 255, 100, 100, 100, 255] };
  const after = { width: 2, height: 1, data: [10, 0, 0, 255, 100, 100, 100, 255] };
  assert.equal(meanPixelDiff(before, after), 10 / 8);
  assert.equal(meanPixelDiff(before, { data: [0, 0, 0, 0] }), null);
  assert.equal(meanPixelDiff(null, after), null);
});

test("brightness distinguishes a painted plate from a blank one", () => {
  assert.equal(meanBrightness({ data: [0, 0, 0, 255, 30, 30, 30, 255] }), 15);
  assert.equal(meanBrightness({ data: [] }), null);
});

test("listener maps report only real differences", () => {
  assert.deepEqual(
    sameListenerMap({ "hero|pointermove|false": 1 }, { "hero|pointermove|false": 1 }),
    []
  );
  assert.deepEqual(sameListenerMap({ "hero|pointermove|false": 1 }, {}), [
    "hero|pointermove|false: 1 -> 0"
  ]);
  assert.deepEqual(sameListenerMap({}, { "window|pagehide|false": 2 }), [
    "window|pagehide|false: 0 -> 2"
  ]);
});

test("the loom listener map ignores dev-server events", () => {
  const map = loomListenerMap({
    "hero|pointermove|false": 1,
    "window|pagehide|false": 1,
    "other|change|bubble": 1,
    "element|change|bubble": 3,
    "document|astro:after-swap|bubble": 6,
    "other|app-toggled|bubble": 4,
    "window|scroll|bubble": 1
  });
  assert.deepEqual(map, {
    "hero|pointermove|false": 1,
    "window|pagehide|false": 1,
    "other|change|bubble": 1
  });
});

test("frame rate and largest gap survive empty and single-frame input", () => {
  assert.equal(frameRate([], 1000), 0);
  assert.equal(frameRate([0, 16, 32], 100), 30);
  assert.equal(largestFrameGap([]), 0);
  assert.equal(largestFrameGap([100]), 0);
  assert.equal(largestFrameGap([0, 16, 916]), 900);
});

test("console classification fails errors and unexplained warnings", () => {
  assert.equal(classifyConsole({ type: "pageerror", text: "boom" }).fail, true);
  assert.equal(classifyConsole({ type: "error", text: "boom" }).fail, true);
  assert.equal(classifyConsole({ type: "warning", text: "WebGL: INVALID_OPERATION" }).fail, true);
  assert.equal(
    classifyConsole({
      type: "error",
      text: "WebSocket connection to 'ws://127.0.0.1:4331/?token=x' failed: Page entered Back-Forward Cache."
    }).fail,
    false
  );
  assert.equal(
    classifyConsole({
      type: "warning",
      text: "GPU stall due to ReadPixels (this message will no longer repeat)"
    }).fail,
    false
  );
  assert.equal(
    classifyConsole({
      type: "error",
      text: "Button failed to load, iconName = pip-placard, layoutTraits = []"
    }).fail,
    false
  );
  assert.equal(classifyConsole({ type: "debug", text: "[vite] connected" }).fail, false);
});

test("matrix renders one row per run and names failed checks", () => {
  const matrix = renderMatrix({
    runs: [
      { scenario: "baseline", engine: "chromium", checks: [{ id: "first-paint", ok: true }] },
      { scenario: "context-loss", engine: "webkit", checks: [{ id: "rebuild", ok: false }] }
    ]
  });
  assert.match(matrix, /\| baseline \| chromium \| pass \| — \|/);
  assert.match(matrix, /\| context-loss \| webkit \| FAIL \| rebuild \|/);
});
