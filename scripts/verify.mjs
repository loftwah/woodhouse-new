import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageManager =
  process.env.npm_execpath ?? (process.platform === "win32" ? "pnpm.cmd" : "pnpm");
const checks = [
  ["EmDash seed", "emdash:seed:validate"],
  ["EmDash generated types", "emdash:types:check"],
  ["format", "format:check"],
  ["lint", "lint"],
  ["unused code", "deadcode"],
  ["diagram intrinsic sizes", "diagrams:sizes:check"],
  ["dispatch social cards", "social-cards:check"],
  ["dependency audit", "audit"],
  ["EmDash local schema", "emdash:doctor"],
  ["tests", "test"],
  ["Astro and TypeScript", "typecheck"],
  ["production build and privacy scan", "build"]
];

for (const [label, script] of checks) {
  process.stdout.write(`\n== ${label} ==\n`);
  const result = spawnSync(packageManager, ["run", script], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32" && !process.env.npm_execpath
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    process.stderr.write(`Verification stopped at: ${script}\n`);
    break;
  }
}
