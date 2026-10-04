import assert from "node:assert/strict";
import test from "node:test";
import { createHash } from "node:crypto";
import {
  CONTENT_GENERATION_PREFIX,
  contentGenerationDigest,
  isContentGeneration
} from "./content-generation.ts";

test("the digest is real SHA-256 of the joined lines, not a relabelled weaker hash", async () => {
  const lines = ["projects bubbles {}", "dispatches prove-which-build-is-live {}"];
  const digest = await contentGenerationDigest(lines);
  const expected = createHash("sha256").update(lines.join("\n")).digest("hex");
  assert.equal(digest, `${CONTENT_GENERATION_PREFIX}${expected}`);
  // A SHA-1 digest prefixed as sha256 would still be 40 hex chars and would
  // fail this length check, which is the bug this asserts against.
  assert.equal(digest.slice(CONTENT_GENERATION_PREFIX.length).length, 64);
});

test("any change to the model changes the digest", async () => {
  const base = await contentGenerationDigest(["projects bubbles {}", "projects fighter {}"]);
  const edited = await contentGenerationDigest(["projects bubbles {}", 'projects fighter {"x":1}']);
  const removed = await contentGenerationDigest(["projects bubbles {}"]);
  assert.notEqual(base, edited);
  assert.notEqual(base, removed);
});

test("the same model always produces the same digest", async () => {
  const a = await contentGenerationDigest(["projects bubbles {}", "projects fighter {}"]);
  const b = await contentGenerationDigest(["projects bubbles {}", "projects fighter {}"]);
  assert.equal(a, b);
});

test("an empty model still yields a well-formed digest", async () => {
  const digest = await contentGenerationDigest([]);
  assert.ok(isContentGeneration(digest));
  assert.notEqual(digest, await contentGenerationDigest(["anything {}"]));
});

test("recognition rejects a mislabelled or truncated digest", () => {
  assert.ok(isContentGeneration(`sha256:${"a".repeat(64)}`));
  assert.ok(!isContentGeneration(`sha1:${"a".repeat(40)}`));
  assert.ok(!isContentGeneration(`sha256:${"a".repeat(40)}`));
  assert.ok(!isContentGeneration(`SHA256:${"a".repeat(64)}`));
  assert.ok(!isContentGeneration(null));
  assert.ok(!isContentGeneration(undefined));
  assert.ok(!isContentGeneration(42));
});
