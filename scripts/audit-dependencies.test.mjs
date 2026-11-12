import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("dependency audit requires a report and preserves reviewed advisory handling", async (t) => {
  const bin = await mkdtemp(join(tmpdir(), "woodhouse-audit-bin-"));
  t.after(() => rm(bin, { recursive: true, force: true }));
  const script = fileURLToPath(new URL("./audit-dependencies.mjs", import.meta.url));
  async function run(report, status) {
    await writeFile(join(bin, "pnpm"), `#!/bin/sh\nprintf '%s' '${report}'\nexit ${status}\n`, {
      mode: 0o700
    });
    return spawnSync(process.execPath, [script], { encoding: "utf8", env: { PATH: bin } });
  }
  for (const report of ["", '{"error":{"code":"ERR_PNPM_AUDIT_BAD_RESPONSE"}}']) {
    const result = await run(report, 1);
    assert.equal(result.status, 1);
    assert.doesNotMatch(result.stdout, /Dependency audit: 0 advisories/);
  }

  const clean = { advisories: {}, metadata: { vulnerabilities: {} } };
  assert.equal((await run(JSON.stringify(clean), 0)).status, 0);

  const report = {
    ...clean,
    advisories: { 1: { github_advisory_id: "GHSA-g3hv-75wg-m249", module_name: "minimatch" } }
  };
  assert.equal((await run(JSON.stringify(report), 1)).status, 0);
  report.advisories[1].github_advisory_id = "GHSA-unreviewed";
  assert.equal((await run(JSON.stringify(report), 1)).status, 1);
});
