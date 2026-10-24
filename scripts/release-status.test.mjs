import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { requiredPreviewChecks } from "./acceptance-evidence.mjs";
import { computeSourceDigest } from "./source-digest.mjs";

const script = new URL("./release-status.mjs", import.meta.url).pathname;

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "woodhouse-status-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  spawnSync("git", ["init", "--quiet"], { cwd: root });
  await writeFile(path.join(root, "package.json"), "{}\n");
  await mkdir(path.join(root, ".release"), { mode: 0o700 });
  await mkdir(path.join(root, "bin"));
  const preview = {
    url: "https://woodhouse-loftwah-preview.loftwah.workers.dev",
    sourceDigest: await computeSourceDigest(root),
    workerVersion: "11111111-1111-4111-8111-111111111111",
    deployedAt: new Date(Date.now() - 1000).toISOString()
  };
  // Only external edges are stubbed; the real status CLI reads private fixtures
  // and decides its exit status. No provider request or acceptance claim is made.
  await writeFile(
    path.join(root, "bin/pnpm"),
    `#!${process.execPath}
const args = process.argv.slice(2);
console.log(JSON.stringify(args.includes('deployments')
  ? {versions:[{version_id:'${preview.workerVersion}',percentage:100}]}
  : args.includes('secret') ? [{name:'RESEND_API_KEY'},{name:'EMDASH_ENCRYPTION_KEY'},{name:'WOODHOUSE_GITHUB_TOKEN'}]
  : {pending:[],unknownApplied:[]}));
`,
    { mode: 0o700 }
  );
  await writeFile(
    path.join(root, "fetch.mjs"),
    "globalThis.fetch=async()=>({ok:true,status:200});\n"
  );
  await writeFile(path.join(root, ".release/preview-deployment.json"), JSON.stringify(preview), {
    mode: 0o600
  });
  const receipt = {
    operatorConfirmed: "woodhouse.loftwah.com",
    preview: { ...preview, checks: {} },
    production: {
      contentModelMigrated: true,
      starterContentVerified: true,
      backup: { encryptionKeyBackupReference: "fictional recovery reference" }
    }
  };
  const receiptPath = path.join(root, ".release/production-ready.json");
  const save = () => writeFile(receiptPath, JSON.stringify(receipt), { mode: 0o600 });
  const run = () =>
    spawnSync(process.execPath, ["--import", path.join(root, "fetch.mjs"), script], {
      cwd: root,
      encoding: "utf8",
      timeout: 10000,
      env: { ...process.env, PATH: path.join(root, "bin") + path.delimiter + process.env.PATH }
    });
  return { root, preview, receipt, save, run };
}

test("status refuses missing observations even when unrelated preflight edges pass", async (t) => {
  const f = await fixture(t);
  await f.save();
  const result = f.run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /observations are missing/);
});

test("status rejects carried-forward observations and accepts only intact current ones", async (t) => {
  const f = await fixture(t);
  const body = "Fictional status observation\n";
  await writeFile(path.join(f.root, ".release/journey.md"), body, { mode: 0o600 });
  const evidence = {
    passed: true,
    observedAt: new Date().toISOString(),
    preview: {
      url: f.preview.url,
      sourceDigest: f.preview.sourceDigest,
      workerVersion: f.preview.workerVersion
    },
    artifactPath: ".release/journey.md",
    sha256: createHash("sha256").update(body).digest("hex")
  };
  f.receipt.preview.checks = Object.fromEntries(
    requiredPreviewChecks.map((name) => [name, structuredClone(evidence)])
  );
  await f.save();
  assert.equal(f.run().status, 0);
  f.receipt.preview.checks.publicRouteMatrix.preview.sourceDigest = "sha256:" + "b".repeat(64);
  await f.save();
  const stale = f.run();
  assert.equal(stale.status, 1, stale.stdout + stale.stderr);
  assert.match(stale.stdout, /another preview/);
  const saved = JSON.parse(
    await readFile(path.join(f.root, ".release/production-ready.json"), "utf8")
  );
  assert.deepEqual(saved, f.receipt, "status must not rewrite old observations");
});
