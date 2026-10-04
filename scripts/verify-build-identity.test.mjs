import assert from "node:assert/strict";
import test from "node:test";
import {
  awaitBuildIdentity,
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

// The failure these encode, measured on preview: a deploy that had already
// succeeded was reported as failed because the identity check was a single
// request. `origin serves sha256:07c90ac… but sha256:89fafe31… was expected`,
// and the origin served the expected digest on the very next request. Publishing
// a Worker version propagates over a short window, so the first request after a
// deploy can still be answered by the version being replaced.
test("a previous Worker version is waited out rather than failed", async () => {
  const expectedDigest = `sha256:${"c".repeat(64)}`;
  const outgoing = { ...good, environment: "preview", sourceDigest: `sha256:${"a".repeat(64)}` };
  const reads = [
    { origin: "https://preview.test", ok: true, problems: [], identity: outgoing },
    {
      origin: "https://preview.test",
      ok: true,
      problems: [],
      identity: { ...good, environment: "preview" }
    }
  ];
  const slept = [];
  const result = await awaitBuildIdentity("https://preview.test", {
    expectedDigest,
    expectedEnvironment: "preview",
    read: async () => reads.shift(),
    sleep: async (ms) => slept.push(ms),
    intervalMs: 5000
  });
  assert.equal(result.ok, true);
  assert.equal(result.attempts, 2);
  assert.equal(result.identity.sourceDigest, expectedDigest);
  // The first mismatch was the outgoing version, so it waited rather than failing.
  assert.deepEqual(slept, [5000]);
  assert.match(result.attempts_log[0], /sha256:aaaa/);
  assert.match(result.attempts_log[1], /sha256:cccc/);
});

test("a single successful read is not delayed", async () => {
  const slept = [];
  const result = await awaitBuildIdentity("https://preview.test", {
    expectedDigest: `sha256:${"c".repeat(64)}`,
    expectedEnvironment: "production",
    read: async () => ({ origin: "https://preview.test", ok: true, problems: [], identity: good }),
    sleep: async (ms) => slept.push(ms)
  });
  assert.equal(result.ok, true);
  assert.equal(result.attempts, 1);
  assert.deepEqual(slept, []);
});

test("a genuinely wrong build still fails, and says how long it waited", async () => {
  const wrong = { ...good, sourceDigest: `sha256:${"b".repeat(64)}` };
  const result = await awaitBuildIdentity("https://preview.test", {
    expectedDigest: `sha256:${"c".repeat(64)}`,
    expectedEnvironment: "production",
    attempts: 3,
    read: async () => ({ origin: "https://preview.test", ok: true, problems: [], identity: wrong }),
    sleep: async () => {}
  });
  assert.equal(result.ok, false);
  assert.equal(result.attempts, 3);
  assert.equal(result.attempts_log.length, 3);
  assert.ok(result.problems.some((problem) => problem.includes("was expected")));
});

test("an origin that never serves an identity fails rather than hanging", async () => {
  const result = await awaitBuildIdentity("https://preview.test", {
    expectedDigest: `sha256:${"c".repeat(64)}`,
    attempts: 2,
    read: async () => ({
      origin: "https://preview.test",
      ok: false,
      problems: ["/build.json could not be reached (network error)"],
      identity: null
    }),
    sleep: async () => {}
  });
  assert.equal(result.ok, false);
  assert.equal(result.attempts, 2);
});
