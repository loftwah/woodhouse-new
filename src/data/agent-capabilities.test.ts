import test from "node:test";
import assert from "node:assert/strict";
import {
  AGENT_CAPABILITY_REVIEWED,
  agentCapabilities,
  publicAgentCapabilities
} from "./agent-capabilities.ts";

test("the reviewed capability points at a real app-owned contract", () => {
  const [capability] = agentCapabilities;
  assert(capability);
  assert.equal(capability.provider.slug, "app-composer");
  assert.equal(capability.provider.contract, "https://composer.loftwah.com/capabilities.json");
  assert.equal(capability.app.origin, "https://guestbook.loftwah.com");
  assert.match(AGENT_CAPABILITY_REVIEWED, /^\d{4}-\d{2}-\d{2}$/);
});

test("every effect is non-public, permitted and confirmed", () => {
  for (const capability of agentCapabilities) {
    for (const operation of capability.operations) {
      assert.match(operation.path, /^\//);
      assert(!operation.path.startsWith("//"));
      if (operation.kind === "effect") {
        assert.equal(operation.confirmation, true);
        assert.notEqual(operation.availability, "public");
        assert(operation.requires.length > 0);
      } else {
        assert.equal(operation.kind, "read");
        assert.equal(operation.confirmation, false);
      }
    }
  }
});

test("the public projection contains no credential-like field or guest code", () => {
  const serialized = JSON.stringify(publicAgentCapabilities());
  assert.doesNotMatch(serialized, /"(token|secret|password|authorization|apiKey|credential)":/i);
  assert.doesNotMatch(serialized, /hunter2/);
  // The permit name is a requirement label, not a value.
  assert.match(serialized, /guest-invitation-code/);
});

test("the projection exposes only the allowlisted fields", () => {
  for (const capability of publicAgentCapabilities()) {
    assert.deepEqual(Object.keys(capability).sort(), ["app", "boundary", "operations", "provider"]);
    assert.deepEqual(Object.keys(capability.provider).sort(), [
      "contract",
      "humanContract",
      "name",
      "origin",
      "slug"
    ]);
    for (const operation of capability.operations) {
      assert.deepEqual(Object.keys(operation).sort(), [
        "availability",
        "confirmation",
        "description",
        "kind",
        "method",
        "name",
        "path",
        "requires",
        "verified"
      ]);
    }
  }
});
