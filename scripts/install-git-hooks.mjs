// Point this checkout at the repository's own hooks.
//
// The observed failure: verification only happened when someone remembered to run
// it, so an unverified commit could leave the machine. The repository has no hosted
// CI by policy, which makes a local gate the only gate.
//
//     pnpm run hooks:install   # set core.hooksPath
//     pnpm run hooks:check     # report whether it is set, exit 1 if not
//
// It refuses to overwrite a hooksPath that already points somewhere else, because
// silently stealing another tool's hooks is how a shared machine loses them.
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const wanted = ".githooks";
const check = process.argv.includes("--check");

const git = (args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();

const current = (() => {
  try {
    return git(["config", "--local", "--get", "core.hooksPath"]);
  } catch {
    return "";
  }
})();

if (check) {
  if (current === wanted) {
    process.stdout.write("hooks: core.hooksPath is .githooks\n");
    process.exit(0);
  }
  process.stdout.write(
    `hooks: not installed (core.hooksPath is ${current ? `"${current}"` : "unset"}). Run: pnpm run hooks:install\n`
  );
  process.exit(1);
}

if (current && current !== wanted) {
  process.stderr.write(
    `hooks: refusing to overwrite core.hooksPath="${current}". Move that hook aside or merge it into .githooks first.\n`
  );
  process.exit(1);
}

git(["config", "--local", "core.hooksPath", wanted]);
process.stdout.write("hooks: core.hooksPath set to .githooks\n");
process.stdout.write(
  "hooks: pre-push now runs the quick lane; bypass with SKIP_LOCAL_CI=1 git push\n"
);
