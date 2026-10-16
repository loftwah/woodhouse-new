import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { computeSourceDigest } from "./source-digest.mjs";

const script = new URL("./record-evidence.mjs", import.meta.url).pathname;
const url = "https://woodhouse-loftwah-preview.loftwah.workers.dev";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "woodhouse-evidence-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  spawnSync("git", ["init", "--quiet"], { cwd: root });
  await writeFile(path.join(root, "package.json"), "{}\n");
  await mkdir(path.join(root, ".release"), { mode: 0o700 });
  const preview = {
    environment: "preview",
    worker: "woodhouse-loftwah-preview",
    url,
    sourceDigest: await computeSourceDigest(root),
    workerVersion: "11111111-1111-4111-8111-111111111111",
    deployedAt: new Date(Date.now() - 1000).toISOString()
  };
  await writeFile(path.join(root, ".release/preview-deployment.json"), JSON.stringify(preview), {
    mode: 0o600
  });
  await writeFile(
    path.join(root, ".release/production-ready.json"),
    JSON.stringify({
      operatorConfirmed: "woodhouse.loftwah.com",
      preview: { ...preview, checks: {} }
    }),
    { mode: 0o600 }
  );
  await writeFile(path.join(root, ".release/journey.md"), "Actual journey evidence fixture\n", {
    mode: 0o600
  });
  return { root, preview };
}

function record(root, extra = []) {
  return spawnSync(
    process.execPath,
    [script, "publicRouteMatrix", ".release/journey.md", ...extra],
    {
      cwd: root,
      encoding: "utf8"
    }
  );
}

test("recorded observations retain the exact accepted preview identity", async (t) => {
  const { root, preview } = await fixture(t);
  const result = record(root);
  assert.equal(result.status, 0, result.stderr);
  const receipt = JSON.parse(
    await readFile(path.join(root, ".release/production-ready.json"), "utf8")
  );
  assert.deepEqual(receipt.preview.checks.publicRouteMatrix.preview, {
    url,
    sourceDigest: preview.sourceDigest,
    workerVersion: preview.workerVersion
  });
});

test("a changed source cannot record an observation against the previous preview", async (t) => {
  const { root } = await fixture(t);
  await writeFile(path.join(root, "package.json"), '{"changed":true}\n');
  const result = record(root);
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, /preview|source/i);
});

test("an observation predating the preview cannot be relabelled as current", async (t) => {
  const { root } = await fixture(t);
  const result = record(root, ["--observed", new Date(Date.now() - 60000).toISOString()]);
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, /predates|before|deployment/i);
});
