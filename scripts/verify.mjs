import { ValidationChildren } from "./host-validation-children.mjs";
import { completeHostValidation } from "./host-validation-complete.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageManager =
  process.env.npm_execpath ?? (process.platform === "win32" ? "pnpm.cmd" : "pnpm");
const checks = [
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
  ["tests", "test"],
  ["Astro and TypeScript", "typecheck"],
  ["production build and privacy scan", "build"]
];

let activeChild;
let cancelled = false;
let cleanupUncertain = false;
const cancel = () => {
  cancelled = true;
  activeChild?.kill("SIGTERM");
};
process.on("SIGINT", cancel);
process.on("SIGTERM", cancel);
try {
  for (const [label, script] of checks) {
    process.stdout.write(`\n== ${label} ==\n`);
    activeChild = spawn(
      "python3",
      [
        resolve(root, "scripts/host-validation.py"),
        "--gated-child",
        "3",
        packageManager,
        "run",
        script
      ],
      {
        cwd: root,
        stdio: ["inherit", "inherit", "inherit", "pipe"],
        shell: process.platform === "win32" && !process.env.npm_execpath
      }
    );
    const finished = new Promise((resolve, reject) => {
      activeChild.once("error", reject);
      activeChild.once("close", resolve);
    });
    const children = new ValidationChildren(activeChild.pid);
    let status;
    try {
      await children.start();
      activeChild.stdio[3].end(cancelled ? "" : "1");
      status = await finished;
    } finally {
      try {
        await children.cleanup();
      } catch (error) {
        cleanupUncertain = true;
        process.stderr.write(`Validation cleanup failed: ${error.message}\n`);
        process.exitCode = 75;
      }
    }
    activeChild = undefined;
    if (cleanupUncertain) break;
    if (cancelled || status !== 0) {
      process.exitCode = cancelled ? 130 : (status ?? 1);
      process.stderr.write(`Verification stopped at: ${script}\n`);
      break;
    }
  }
} finally {
  process.off("SIGINT", cancel);
  process.off("SIGTERM", cancel);
  if (!cleanupUncertain) completeHostValidation();
}
