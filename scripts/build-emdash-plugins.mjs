import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const output = fileURLToPath(new URL(".emdash/build/plugins/", root));
await mkdir(output, { recursive: true });

for (const name of ["woodhouse-editorial-policy", "woodhouse-enquiries"]) {
  await build({
    entryPoints: [fileURLToPath(new URL(`../src/plugins/${name}.ts`, import.meta.url))],
    outfile: `${output}/${name}.mjs`,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    treeShaking: true,
    sourcemap: false,
    legalComments: "none"
  });
}
