import test from "node:test";
import assert from "node:assert/strict";
import { producerRevision } from "./build-identity.ts";
test("producer revision is a validated clean serving build identity, never guessed", () => {
  const gitCommit = "a".repeat(40);
  assert.equal(producerRevision({ gitCommit, gitClean: true }), gitCommit);
  assert.equal(producerRevision({ gitCommit, gitClean: false }), null);
  assert.equal(producerRevision({ gitCommit: "not-a-sha", gitClean: true }), null);
  assert.equal(producerRevision(null), null);
  assert.equal(producerRevision(), null);
});
