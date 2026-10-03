import { unlink } from "node:fs/promises";
import path from "node:path";

const localRuntimeVars = path.join(process.cwd(), "dist", "server", ".dev.vars");
try {
  await unlink(localRuntimeVars);
  console.log("Removed Astro's local-only Worker variables from the deploy artifact.");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
