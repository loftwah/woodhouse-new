import assert from "node:assert/strict";
import test from "node:test";
import {
  OperationTimeoutError,
  clipboardFailureMessage,
  clipboardProblem,
  downloadFailureMessage,
  downloadHandoffMessage,
  downloadReadyMessage,
  withDeadline
} from "./share-feedback.ts";

test("a deadline rejects slow work and ignores a late result", async () => {
  let resolveLate: (value: string) => void = () => undefined;
  const late = new Promise<string>((resolve) => {
    resolveLate = resolve;
  });
  const bounded = withDeadline(late, 5);
  await assert.rejects(bounded, OperationTimeoutError);
  resolveLate("late");
  await new Promise((resolve) => setTimeout(resolve, 5));
  await assert.rejects(bounded, OperationTimeoutError);
});

test("a deadline passes a completed result through", async () => {
  assert.equal(await withDeadline(Promise.resolve("ready"), 1000), "ready");
});

test("clipboard failures separate blocked access from preparation and timeouts", () => {
  assert.equal(clipboardProblem({ name: "NotAllowedError" }), "blocked");
  assert.equal(clipboardProblem({ name: "SecurityError" }), "blocked");
  assert.equal(clipboardProblem(new OperationTimeoutError()), "timed-out");
  assert.equal(clipboardProblem(new Error("Image unavailable")), "unavailable");
});

test("clipboard failure copy names recovery without claiming a copy", () => {
  const image = clipboardFailureMessage("blocked", "image");
  assert.match(image, /blocked/i);
  assert.match(image, /Download/);
  assert.doesNotMatch(image, /copied/i);

  const post = clipboardFailureMessage("timed-out", "post");
  assert.match(post, /did not confirm/);
  assert.match(post, /open below/);
  assert.doesNotMatch(post, /^Post copied/);

  assert.match(clipboardFailureMessage("unavailable", "post"), /Could not copy automatically/);
});

test("download feedback reports a browser handoff and the asset actually used", () => {
  const handoff = downloadHandoffMessage(false);
  assert.match(handoff, /handed to your browser to save/);
  assert.doesNotMatch(handoff, /saved/);
  assert.match(downloadHandoffMessage(true), /reviewed backup artwork/);

  assert.match(downloadReadyMessage(false), /Choose Download/);
  assert.match(downloadReadyMessage(true), /reviewed backup artwork/);

  const failed = downloadFailureMessage(true);
  assert.match(failed, /project image and its reviewed backup did not load/);
  assert.match(failed, /Try the download again/);
  assert.doesNotMatch(downloadFailureMessage(false), /reviewed backup/);
});
