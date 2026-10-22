import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { exhibitAnchors, exhibitSteps } from "./exhibit-model.ts";

/**
 * The drift check for the patch bench explanation.
 *
 * The explanation is only true while the implementation still contains the
 * strings it cites. When a message, control or identifier is renamed, this fails
 * and the step is stale until someone re-reads the behaviour — rather than the
 * page quietly describing something that no longer happens.
 */
test("every cited implementation anchor still exists", async () => {
  const cache = new Map<string, string>();
  for (const anchor of exhibitAnchors) {
    let source = cache.get(anchor.path);
    if (source === undefined) {
      source = await readFile(path.join(process.cwd(), anchor.path), "utf8");
      cache.set(anchor.path, source);
    }
    assert.equal(
      source.includes(anchor.anchor),
      true,
      `Stale explanation: ${anchor.path} no longer contains "${anchor.anchor}" (${anchor.note})`
    );
  }
});

test("the walkthrough keeps one step per distinct state and cites each one", () => {
  const ids = exhibitSteps.map((step) => step.id);
  assert.equal(new Set(ids).size, ids.length, "step ids must be unique");
  assert.ok(
    exhibitSteps.length >= 6,
    "the walkthrough covers the waiting, playing, disconnect, reconnect and failure paths"
  );
  for (const step of exhibitSteps) {
    assert.ok(step.action.trim().length > 0, `${step.id} needs an action`);
    assert.ok(step.state.run.trim().length > 0, `${step.id} needs the run state`);
    assert.ok(step.state.music.trim().length > 0, `${step.id} needs the music state`);
    assert.ok(step.source.path.endsWith(".ts"), `${step.id} must cite implementation source`);
  }
});

test("the explanation never claims the run stops when the music does", () => {
  for (const step of exhibitSteps) {
    const text = `${step.result} ${step.because}`.toLowerCase();
    if (text.includes("soundtrack is stopped") || text.includes("music stops")) {
      // A sentence about the soundtrack stopping must also say the run keeps
      // going; otherwise the step reads as the old, wrong single-audio model.
      assert.match(text, /run (keeps|continues|is|state)/, `${step.id} must say what the run does`);
    }
  }
});
