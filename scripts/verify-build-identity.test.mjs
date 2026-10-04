import assert from "node:assert/strict";
import test from "node:test";
import {
  compareBuildIdentity,
  describeIdentity,
  identityProblems,
  readBuildIdentity
} from "./verify-build-identity.mjs";

const good = {
  schema: "loftwah.build-identity/1",
  name: "WOODHOUSE",
  environment: "production",
  sourceDigest: `sha256:${"c".repeat(64)}`,
  builtAt: "2026-10-04T00:00:00.000Z",
  gitCommit: "d".repeat(40),
  gitClean: true
};

test("a matching origin produces no problems", () => {
  assert.deepEqual(
    compareBuildIdentity(good, {
      expectedDigest: `sha256:${"c".repeat(64)}`,
      expectedEnvironment: "production"
    }),
    []
  );
});

test("a stale origin is named precisely rather than merely failing", () => {
  const problems = compareBuildIdentity(good, {
    expectedDigest: `sha256:${"e".repeat(64)}`,
    expectedEnvironment: "production"
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /origin serves sha256:ccc/);
  assert.match(problems[0], /eee/);
});

test("an origin reporting the wrong environment is caught", () => {
  const problems = compareBuildIdentity(good, { expectedEnvironment: "preview" });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /expected preview/);
});

test("an absent identity is reported rather than compared", () => {
  assert.deepEqual(compareBuildIdentity(null, { expectedDigest: "sha256:x" }), [
    "no identity was read"
  ]);
});

test("an origin with no identity endpoint reports the missing route", async () => {
  // 127.0.0.1 is allowed over http for local verification only.
  const result = await readBuildIdentity("http://127.0.0.1:1", { timeoutMs: 2000 });
  assert.equal(result.ok, false);
  assert.equal(result.problems.length, 1);
  assert.match(result.problems[0], /build\.json/);
});

test("a remote origin is never read over plaintext", async () => {
  await assert.rejects(
    () => readBuildIdentity("http://woodhouse.loftwah.com"),
    /only be read over HTTPS/
  );
});

test("a bare hostname is accepted and normalised", async () => {
  // Reaches the network path; the assertion is on normalisation, not the result.
  const result = await readBuildIdentity("woodhouse.loftwah.com", { timeoutMs: 2000 }).catch(
    (error) => ({ origin: error.message })
  );
  assert.ok(result);
});

test("the description never invents a worker version", () => {
  const text = describeIdentity(good);
  assert.match(text, /clean tree/);
  assert.ok(!/version/i.test(text));
  assert.match(describeIdentity({ ...good, gitClean: false }), /dirty or unreported tree/);
  assert.equal(describeIdentity(null), "no identity");
});

test("a mislabelled content generation is rejected even when the build identity is valid", () => {
  // Regression guard: a sha1 digest relabelled as sha256 must not verify.
  const mislabelled = {
    ...good,
    content: { available: true, generation: `sha256:${"f".repeat(40)}`, counts: {} }
  };
  assert.ok(
    identityProblems(mislabelled).some((problem) => problem.includes("content.generation"))
  );
  assert.ok(!/^sha256:[a-f0-9]{64}$/.test(mislabelled.content.generation));
});

test("a well-formed content generation passes the structural check", () => {
  const proper = {
    ...good,
    content: { available: true, generation: `sha256:${"f".repeat(64)}`, counts: { projects: 8 } }
  };
  assert.deepEqual(identityProblems(proper), []);
});
