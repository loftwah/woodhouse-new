import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { acceptanceEvidenceProblems } from "./acceptance-evidence.mjs";

const now = Date.parse("2026-10-16T00:00:00Z");
const preview = {
  url: "https://woodhouse-loftwah-preview.loftwah.workers.dev",
  sourceDigest: "sha256:" + "a".repeat(64),
  workerVersion: "11111111-1111-4111-8111-111111111111",
  deployedAt: new Date(now - 60000).toISOString()
};

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "woodhouse-acceptance-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, ".release"), { mode: 0o700 });
  const body = "Bounded acceptance observation\n";
  await writeFile(path.join(root, ".release/journey.md"), body, { mode: 0o600 });
  const evidence = {
    passed: true,
    observedAt: new Date(now).toISOString(),
    preview: {
      url: preview.url,
      sourceDigest: preview.sourceDigest,
      workerVersion: preview.workerVersion
    },
    sha256: createHash("sha256").update(body).digest("hex"),
    artifactPath: ".release/journey.md"
  };
  return { root, evidence };
}

test("intact evidence for this exact preview is accepted", async (t) => {
  const { root, evidence } = await fixture(t);
  assert.deepEqual(await acceptanceEvidenceProblems(evidence, { root, preview, now }), []);
});

test("updating the top-level receipt cannot carry forward a previous source or Worker pass", async (t) => {
  const { root, evidence } = await fixture(t);
  for (const changed of [
    { ...preview, sourceDigest: "sha256:" + "b".repeat(64) },
    { ...preview, workerVersion: "22222222-2222-4222-8222-222222222222" }
  ]) {
    const problems = await acceptanceEvidenceProblems(evidence, { root, preview: changed, now });
    assert.match(problems.join("; "), /another preview/);
  }
  const legacy = { ...evidence };
  delete legacy.preview;
  assert.match(
    (await acceptanceEvidenceProblems(legacy, { root, preview, now })).join("; "),
    /lacks an exact preview identity/
  );
});

test("tampered, public, missing and escaped evidence never passes", async (t) => {
  const { root, evidence } = await fixture(t);
  const options = { root, preview, now };
  await writeFile(path.join(root, ".release/journey.md"), "Changed after review\n");
  assert.match((await acceptanceEvidenceProblems(evidence, options)).join("; "), /digest/);
  await chmod(path.join(root, ".release/journey.md"), 0o644);
  assert.match((await acceptanceEvidenceProblems(evidence, options)).join("; "), /owner-only/);
  for (const artifactPath of [".release/missing.md", "../outside.md"])
    assert.ok((await acceptanceEvidenceProblems({ ...evidence, artifactPath }, options)).length);
  await mkdir(path.join(root, "outside"));
  await writeFile(path.join(root, "outside/observation.md"), "outside\n", { mode: 0o600 });
  await symlink(path.join(root, "outside"), path.join(root, ".release/escape"));
  assert.match(
    (
      await acceptanceEvidenceProblems(
        { ...evidence, artifactPath: ".release/escape/observation.md" },
        options
      )
    ).join("; "),
    /under .release/
  );
});

test("missing, future, expired and pre-deployment observations remain unverified", async (t) => {
  const { root, evidence } = await fixture(t);
  const options = { root, preview, now };
  assert.ok((await acceptanceEvidenceProblems(undefined, options)).length);
  for (const observedAt of [
    "invalid",
    new Date(now + 60001).toISOString(),
    new Date(now - 31 * 86400000).toISOString(),
    new Date(now - 60001).toISOString()
  ])
    assert.ok(
      (await acceptanceEvidenceProblems({ ...evidence, observedAt }, options)).length,
      observedAt
    );
});
