import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = resolve(root, "node_modules/emdash/dist/cli/index.mjs");
const directory = await mkdtemp(join(tmpdir(), "woodhouse-emdash-doctor-"));
const database = join(directory, "doctor.db");

function run(args, { capture = false } = {}) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024
  });
  if (result.error) throw result.error;
  if (capture) return result;
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0)
    throw new Error(`EmDash CLI exited with status ${result.status}: ${args[0]}`);
  return result;
}

try {
  run(["init", "--cwd", root, "--database", database]);
  run(["seed", "seed/seed.json", "--cwd", root, "--database", database, "--on-conflict", "error"]);
  const doctor = run(["doctor", "--cwd", root, "--database", database, "--json"], {
    capture: true
  });
  if (doctor.stderr) process.stderr.write(doctor.stderr);
  if (doctor.stdout) process.stdout.write(doctor.stdout);
  const checks = JSON.parse(doctor.stdout.trim());
  // EmDash 1.0.1 recognises only `scheduled: createScheduledHandler(`. The
  // publication wrapper is real maintenance wiring with a read-only guard,
  // which that textual detector cannot recognise. Verify this exact wiring
  // and the wrapper's executable behavior rather than deleting the guard.
  const handler = checks.find((check) => check.name === "scheduler handler");
  const worker = await readFile(join(root, "src/worker.ts"), "utf8");
  if (
    handler?.status === "fail" &&
    handler.message ===
      'Cron Trigger is configured, but ./src/worker.ts does not export EmDash scheduled() maintenance — replace its Worker export with: export { default, PluginBridge } from "@emdash-cms/cloudflare/worker";' &&
    worker.includes("scheduled: createPublicationScheduledHandler(createScheduledHandler())")
  ) {
    const policyTests = spawnSync(
      process.execPath,
      ["--experimental-strip-types", "--test", "src/data/publication-policy.test.ts"],
      { cwd: root, encoding: "utf8" }
    );
    if (policyTests.status !== 0) throw new Error("Publication scheduler behavior failed.");
    handler.status = "pass";
    handler.name = "scheduler wiring";
    console.log(
      "Verified guarded EmDash scheduler wiring and behavior; upstream doctor uses a literal-source detector."
    );
  }
  if (checks.some((check) => check.status === "fail"))
    throw new Error(`EmDash doctor exited with status ${doctor.status}`);
  const required = ["database", "scheduler wiring"];
  const failures = required.filter(
    (name) => !checks.some((check) => check.name === name && check.status === "pass")
  );
  if (failures.length)
    throw new Error(`Required EmDash doctor checks did not pass: ${failures.join(", ")}`);
} finally {
  // This path was created uniquely by this invocation and never points into the checkout.
  await (await import("node:fs/promises")).rm(directory, { recursive: true, force: true });
}
