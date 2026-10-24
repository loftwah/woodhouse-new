import assert from "node:assert/strict";
import test from "node:test";
import { createOperationIntent } from "./operation-intent.ts";

test("a newer intent retires an older response", () => {
  const intent = createOperationIntent();
  const first = intent.begin();
  const second = intent.begin();
  assert.equal(intent.isCurrent(first), false);
  assert.equal(intent.isCurrent(second), true);

  const written: string[] = [];
  const write = (message: string, token: number) => {
    if (intent.isCurrent(token)) written.push(message);
  };
  write("old response", first);
  write("new response", second);
  assert.deepEqual(written, ["new response"]);
});

test("cancelling makes the current response stale", () => {
  const intent = createOperationIntent();
  const token = intent.begin();
  intent.cancel();
  assert.equal(intent.isCurrent(token), false);
});
