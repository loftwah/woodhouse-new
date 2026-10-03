import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// This is the schema generator EmDash's Astro integration uses at dev startup.
// Keep the generated module committed so editors and CI typecheck without a live Admin token.
const generator = resolve(root, "node_modules/emdash/dist/schema/project-env-types.mjs");
const { generateProjectEnvTypes } = await import(pathToFileURL(generator).href);
const generated = await generateProjectEnvTypes(root);
const output = resolve(root, "emdash-env.d.ts");

if (process.argv.includes("--check")) {
  const current = await readFile(output, "utf8");
  if (current !== generated) {
    process.stderr.write(
      "emdash-env.d.ts is stale. Run `pnpm run emdash:types` and review the generated diff.\n"
    );
    process.exitCode = 1;
  } else {
    process.stdout.write("emdash-env.d.ts matches the validated Woodhouse EmDash seed.\n");
  }
} else {
  await writeFile(output, generated, "utf8");
  process.stdout.write("Generated emdash-env.d.ts from the validated Woodhouse EmDash seed.\n");
}
