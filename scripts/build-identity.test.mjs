import assert from "node:assert/strict";
import test from "node:test";
import {
  BUILD_IDENTITY_GLOBAL,
  BUILD_IDENTITY_SCHEMA,
  buildIdentity,
  readGitProvenance,
  validateIdentity
} from "./build-identity.mjs";
import { BUILD_IDENTITY_SCHEMA as WORKER_SCHEMA } from "../src/data/build-identity.ts";

const valid = {
  sourceDigest: `sha256:${"a".repeat(64)}`,
  builtAt: "2026-10-04T00:00:00.000Z",
  environment: "production",
  gitCommit: "b".repeat(40),
  gitClean: true
};

test("a complete build identity validates", () => {
  assert.deepEqual(validateIdentity(buildIdentity(valid)), []);
  assert.equal(buildIdentity(valid).schema, BUILD_IDENTITY_SCHEMA);
});

test("the declared global matches the one the integration replaces", () => {
  assert.equal(BUILD_IDENTITY_GLOBAL, "__WOODHOUSE_BUILD_IDENTITY__");
});

test("the build-time and Worker copies of the schema cannot drift", () => {
  assert.equal(BUILD_IDENTITY_SCHEMA, WORKER_SCHEMA);
});

test("an identity missing its fingerprint is refused rather than shipped", () => {
  for (const sourceDigest of [undefined, "", "abc", "sha256:zz", `md5:${"a".repeat(64)}`]) {
    const problems = validateIdentity(buildIdentity({ ...valid, sourceDigest }));
    assert.ok(
      problems.some((problem) => problem.includes("sourceDigest")),
      `expected a sourceDigest problem for ${JSON.stringify(sourceDigest)}`
    );
  }
});

test("an identity with an unusable build time or environment is refused", () => {
  assert.ok(validateIdentity(buildIdentity({ ...valid, builtAt: "yesterday" })).length > 0);
  assert.ok(validateIdentity(buildIdentity({ ...valid, environment: "staging" })).length > 0);
});

test("git provenance reports a full commit and an explicit dirty flag", () => {
  const provenance = readGitProvenance(process.cwd());
  assert.equal(typeof provenance.gitClean, "boolean");
  if (provenance.gitCommit !== null) assert.match(provenance.gitCommit, /^[a-f0-9]{40}$/);
});

test("an unavailable git commit becomes null instead of a guess", () => {
  const identity = buildIdentity({ ...valid, gitCommit: null, gitClean: false });
  assert.equal(identity.gitCommit, null);
  assert.equal(identity.gitClean, false);
  assert.deepEqual(validateIdentity(identity), []);
});

test("the identity claims no Cloudflare Worker version", () => {
  // The Worker cannot know its own version id. Anything reporting one would be
  // a claim the runtime cannot support.
  const identity = buildIdentity(valid);
  assert.equal(identity.workerVersion, undefined);
  assert.ok(!("workerVersion" in identity));
});
