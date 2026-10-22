// The observed failure: `pnpm run verify` held the host's single exclusive
// capacity slot for the entire sequence, so another project's 1.7-second format
// check waited behind a multi-minute heavy qualification. Measured on this host,
// only `typecheck` and `build` both dominate CPU and rewrite the worktree's
// build output (`dist/`, `.astro/`); every other stage only reads the tree.
//
// A capacity reservation is host resource arbitration, not repository
// ownership. It does not make two builds in the same worktree safe, and it is
// not a substitute for the release scripts' clean-tree/main/origin checks. One
// writer per worktree still owns integration and deployment.
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { completeHostValidation } from "./host-validation-complete.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const self = fileURLToPath(import.meta.url);
const packageManager =
  process.env.npm_execpath ?? (process.platform === "win32" ? "pnpm.cmd" : "pnpm");

/** Stages that only read the tree, so they never take the host capacity slot. */
export const lightStages = [
  ["host reservation contract", "test:host-reservation"],
  ["EmDash seed", "emdash:seed:validate"],
  ["EmDash generated types", "emdash:types:check"],
  ["format", "format:check"],
  ["lint", "lint"],
  ["unused code", "deadcode"],
  ["diagram intrinsic sizes", "diagrams:sizes:check"],
  ["dispatch social cards", "social-cards:check"],
  ["share gallery previews", "share-previews:check"],
  ["labs", "lab:test"],
  ["dependency audit", "audit"],
  ["EmDash local schema", "emdash:doctor"],
  ["tests", "test"]
];

/** Stages that rewrite `dist/` and `.astro/` and dominate CPU. Reserved. */
export const heavyStages = [
  ["Astro and TypeScript", "typecheck"],
  ["production build and privacy scan", "build"]
];

const allStages = [...lightStages, ...heavyStages];
const stageFor = (script) => allStages.find(([, name]) => name === script);

let activeChild;
let cancelled = false;

function spawnOwned(binary, args) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(binary, args, {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32" && !process.env.npm_execpath
    });
    activeChild = child;
    child.once("error", rejectRun);
    child.once("close", (status) => {
      activeChild = undefined;
      resolveRun(cancelled ? 130 : (status ?? 1));
    });
  });
}

function runStage([label, script]) {
  process.stdout.write(`\n== ${label} ==\n`);
  return spawnOwned(packageManager, ["run", script]);
}

/** Hold the shared host slot for exactly this payload, then release it. */
function reserved(operation, payload, options) {
  const args = [
    resolve(root, "scripts/host-validation.py"),
    "--project",
    "woodhouse",
    "--operation",
    operation
  ];
  if (options.stateDir) args.push("--state-dir", options.stateDir);
  if (options.waitSeconds !== undefined) args.push("--wait-seconds", String(options.waitSeconds));
  args.push("--", ...payload);
  return spawnOwned("python3", args);
}

async function runStages(list) {
  for (const stage of list) {
    const status = await runStage(stage);
    if (status !== 0) {
      process.stderr.write(`Verification stopped at: ${stage[1]}\n`);
      return status;
    }
  }
  return 0;
}

/** Take the host slot, then run the mutating stages inside it. */
function heavyLane(options) {
  const payload = [process.execPath, self, "--reserved"];
  if (options.stage) payload.push("--stage", options.stage);
  return reserved(options.stage ?? "typecheck and build", payload, options);
}

/**
 * The reservation payload. It acknowledges owned cleanup on every exit path,
 * including failure and cancellation: the supervisor quarantines the slot when
 * the acknowledgement is missing, so skipping it would punish a clean stop.
 */
async function runReserved(options) {
  if (!process.env.LOFTWAH_VALIDATION_COMPLETION || !process.env.LOFTWAH_VALIDATION_GENERATION)
    throw new Error("The reserved heavy lane runs only inside a host reservation");
  const list = options.stage ? [stageFor(options.stage)] : heavyStages;
  try {
    return await runStages(list);
  } finally {
    completeHostValidation();
  }
}

function parseArguments(argv) {
  const options = { mode: "full", stage: undefined, stateDir: undefined, waitSeconds: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    else if (argument === "--heavy") options.mode = "heavy";
    else if (argument === "--reserved") options.mode = "reserved";
    else if (argument === "--stage") options.stage = argv[(index += 1)];
    else if (argument === "--state-dir") options.stateDir = argv[(index += 1)];
    else if (argument === "--wait-seconds") options.waitSeconds = Number(argv[(index += 1)]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (options.stage && !stageFor(options.stage)) throw new Error(`Unknown stage: ${options.stage}`);
  return options;
}

export async function main(argv) {
  const options = parseArguments(argv);
  const interrupt = () => {
    cancelled = true;
    activeChild?.kill("SIGTERM");
  };
  process.on("SIGINT", interrupt);
  process.on("SIGTERM", interrupt);
  try {
    if (options.mode === "reserved") return await runReserved(options);
    if (options.mode === "heavy") return await heavyLane(options);
    if (options.stage) {
      const stage = stageFor(options.stage);
      return lightStages.includes(stage) ? await runStages([stage]) : await heavyLane(options);
    }
    process.stdout.write("== light stages (host capacity not held) ==\n");
    const lightStatus = await runStages(lightStages);
    return lightStatus !== 0 ? lightStatus : await heavyLane(options);
  } finally {
    process.off("SIGINT", interrupt);
    process.off("SIGTERM", interrupt);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === self) {
  process.exitCode = await main(process.argv.slice(2));
}
