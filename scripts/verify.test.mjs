// The observed failure this protects against: a "throughput" change that
// quietly drops a verification gate, or moves a mutating stage into the
// unreserved lane. Both would look faster and prove less.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { completeHostValidation } from "./host-validation-complete.mjs";
import { heavyStages, lightStages } from "./verify.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const verify = resolve(root, "scripts/verify.mjs");
const reservation = resolve(root, "scripts/host-validation.py");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const planned = [...lightStages, ...heavyStages].map(([, script]) => script);

// Frozen on purpose: the pipeline may not shrink without an explicit edit here.
const contract = [
  "test:host-reservation",
  "emdash:seed:validate",
  "emdash:types:check",
  "format:check",
  "lint",
  "deadcode",
  "diagrams:sizes:check",
  "social-cards:check",
  "share-previews:check",
  "lab:test",
  "audit",
  "emdash:doctor",
  "test",
  "typecheck",
  "build"
];

test("the pipeline still runs every gate exactly once", () => {
  assert.equal(new Set(planned).size, planned.length, "a stage is listed twice");
  assert.deepEqual([...planned].sort(), [...contract].sort());
  for (const script of planned) assert.ok(pkg.scripts[script], `package.json lost ${script}`);
});

test("only the stages that rewrite build output take the host slot", () => {
  assert.deepEqual(
    heavyStages.map(([, script]) => script),
    ["typecheck", "build"]
  );
  // The reservation payload must never contain a read-only stage.
  for (const [label, script] of lightStages)
    assert.ok(!heavyStages.some(([, heavy]) => heavy === script), `${label} is reserved`);
});

test("a busy host slot stops the heavy lane instead of starting it", async () => {
  const directory = mkdtempSync(join(tmpdir(), "woodhouse-verify-"));
  const state = join(directory, "state");
  const holderCode = [
    'const fs = require("node:fs");',
    'process.once("SIGTERM", () => {',
    "  fs.writeFileSync(process.env.LOFTWAH_VALIDATION_COMPLETION,",
    '    JSON.stringify({ version: 1, generation: process.env.LOFTWAH_VALIDATION_GENERATION, cleanup: "complete" }) + "\\n");',
    "  process.exit(130);",
    "});",
    "setInterval(() => {}, 1000);"
  ].join("\n");
  const holder = spawn(
    "python3",
    [
      reservation,
      "--project",
      "holder",
      "--operation",
      "hold",
      "--state-dir",
      state,
      "--",
      process.execPath,
      "-e",
      holderCode
    ],
    { cwd: root, stdio: "ignore" }
  );
  const exited = new Promise((done) => holder.on("close", done));
  const collected = (args, options = {}) =>
    new Promise((resolveRun) => {
      const child = spawn(process.execPath, args, { cwd: root, ...options });
      let text = "";
      child.stdout.on("data", (chunk) => (text += chunk));
      child.stderr.on("data", (chunk) => (text += chunk));
      child.on("close", (status) => resolveRun({ status, text }));
    });
  try {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        if (JSON.parse(readFileSync(join(state, "holder.json"), "utf8")).state === "running") break;
      } catch {
        // Not admitted yet.
      }
      await new Promise((done) => setTimeout(done, 50));
    }
    assert.equal(JSON.parse(readFileSync(join(state, "holder.json"), "utf8")).state, "running");

    // A light stage never consults the slot, so it completes while it is busy.
    const light = await collected([verify, "--stage", "diagrams:sizes:check"]);
    assert.equal(light.status, 0, light.text);
    assert.doesNotMatch(light.text, /CAPACITY WAIT/);

    // The heavy lane must wait, then refuse to start rather than run beside it.
    const heavy = await collected([
      verify,
      "--heavy",
      "--state-dir",
      state,
      "--wait-seconds",
      "0.3"
    ]);
    assert.equal(heavy.status, 75, heavy.text);
    assert.match(heavy.text, /CAPACITY WAIT EXPIRED/);
    assert.doesNotMatch(heavy.text, /Astro and TypeScript/);

    // A single reserved stage takes the same route, so the split cannot leave
    // one mutating stage running outside the slot.
    const single = await collected([
      verify,
      "--stage",
      "build",
      "--state-dir",
      state,
      "--wait-seconds",
      "0.3"
    ]);
    assert.equal(single.status, 75, single.text);
    assert.doesNotMatch(single.text, /production build and privacy scan/);

    // An invented or stale environment pair is not a reservation.
    const invented = await collected([verify, "--reserved", "--stage", "typecheck"], {
      env: {
        ...process.env,
        LOFTWAH_VALIDATION_COMPLETION: "/tmp/complete.json",
        LOFTWAH_VALIDATION_GENERATION: "e".repeat(32)
      }
    });
    assert.notEqual(invented.status, 0, invented.text);
    assert.match(invented.text, /runs only inside a host reservation/);

    // The reserved payload refuses to run with no reservation at all. (Inside an
    // outer reservation the inherited contract still means a slot is held.)
    const bare = { ...process.env };
    delete bare.LOFTWAH_VALIDATION_COMPLETION;
    delete bare.LOFTWAH_VALIDATION_GENERATION;
    const unreserved = await collected([verify, "--reserved"], { env: bare });
    assert.notEqual(unreserved.status, 0, unreserved.text);
    assert.match(unreserved.text, /runs only inside a host reservation/);
    assert.doesNotMatch(unreserved.text, /Astro and TypeScript/);
  } finally {
    holder.kill("SIGTERM");
    await exited;
    rmSync(directory, { recursive: true, force: true });
  }
});

test("cleanup acknowledgement is exact and refuses a broken contract", () => {
  const directory = mkdtempSync(join(tmpdir(), "woodhouse-ack-"));
  const destination = join(directory, "complete.json");
  const generation = "b".repeat(32);
  const previous = {
    completion: process.env.LOFTWAH_VALIDATION_COMPLETION,
    generation: process.env.LOFTWAH_VALIDATION_GENERATION
  };
  try {
    delete process.env.LOFTWAH_VALIDATION_COMPLETION;
    delete process.env.LOFTWAH_VALIDATION_GENERATION;
    completeHostValidation(); // Direct editing checks hold no lease.
    process.env.LOFTWAH_VALIDATION_COMPLETION = destination;
    process.env.LOFTWAH_VALIDATION_GENERATION = generation;
    completeHostValidation();
    assert.deepEqual(JSON.parse(readFileSync(destination, "utf8")), {
      version: 1,
      generation,
      cleanup: "complete"
    });
    process.env.LOFTWAH_VALIDATION_GENERATION = "not-a-generation";
    assert.throws(() => completeHostValidation(), /Invalid host validation completion contract/);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      const name =
        key === "completion" ? "LOFTWAH_VALIDATION_COMPLETION" : "LOFTWAH_VALIDATION_GENERATION";
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    rmSync(directory, { recursive: true, force: true });
  }
});
