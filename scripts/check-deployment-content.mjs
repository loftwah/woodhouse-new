import { readFile } from "node:fs/promises";
import { getReadinessDatabase, verifyDatabaseReadiness } from "./deployment-readiness.mjs";

const args = process.argv.slice(2);
if (args[0] === "--") args.shift();
const environment = args[0] ?? "preview";
const database = getReadinessDatabase(environment);
if (!database) throw new Error("Usage: pnpm run verify:content -- preview|production");

const seed = JSON.parse(await readFile("seed/seed.json", "utf8"));
const result = verifyDatabaseReadiness(database, seed);
console.log(JSON.stringify({ environment, database, ...result }, null, 2));
if (!result.ready) process.exitCode = 1;
