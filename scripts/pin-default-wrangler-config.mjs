import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const redirectPath = path.resolve(process.cwd(), ".wrangler/deploy/config.json");
let redirect;
try {
  redirect = JSON.parse(await readFile(redirectPath, "utf8"));
} catch (error) {
  if (error?.code === "ENOENT") process.exit(0);
  throw error;
}

if (redirect.configPath !== "../../wrangler.jsonc" || redirect.prerenderWorkerConfigPath) {
  await writeFile(
    redirectPath,
    `${JSON.stringify({ configPath: "../../wrangler.jsonc", auxiliaryWorkers: [] }, null, 2)}\n`
  );
  console.log("Pinned unqualified Wrangler commands to the preview-default root config.");
}
