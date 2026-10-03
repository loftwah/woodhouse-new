import { chmod, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const args = process.argv.slice(2);
if (args[0] === "--") args.shift();
const environment = args[0];
const targets = {
  preview: { database: "woodhouse-emdash-preview", id: "f5274c8f-d22e-4d63-bb0e-832e2d2b4f00" },
  production: { database: "woodhouse-emdash", id: "b62500b4-b25a-4fad-8969-eff9ba3c8efa" }
};

if (!targets[environment])
  throw new Error("Usage: pnpm run backup:d1:bookmark -- preview|production");

const target = targets[environment];
const createdAt = new Date().toISOString();
const result = spawnSync(
  "pnpm",
  [
    "exec",
    "wrangler",
    "d1",
    "time-travel",
    "info",
    target.database,
    "--timestamp=" + createdAt,
    "--json"
  ],
  {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024
  }
);
if (result.error) throw result.error;
if (result.status !== 0)
  throw new Error("Cloudflare D1 did not return a Time Travel recovery bookmark.");

const jsonStart = result.stdout.search(/\[|[{]/);
if (jsonStart < 0) throw new Error("Wrangler returned no JSON Time Travel bookmark.");
const response = JSON.parse(result.stdout.slice(jsonStart));
const bookmark = Array.isArray(response) ? response[0]?.bookmark : response.bookmark;
if (typeof bookmark !== "string" || !bookmark)
  throw new Error("Cloudflare D1 returned no Time Travel bookmark.");

const outputPath = path.resolve(root, ".release/backups", environment, "d1-time-travel.json");
await mkdir(path.dirname(outputPath), { recursive: true, mode: 0o700 });
await chmod(path.dirname(outputPath), 0o700);
await writeFile(
  outputPath,
  JSON.stringify(
    {
      schemaVersion: 1,
      environment,
      database: target.database,
      databaseId: target.id,
      createdAt,
      bookmark,
      method: "Cloudflare D1 Time Travel"
    },
    null,
    2
  ) + "\n",
  { mode: 0o600 }
);
await chmod(outputPath, 0o600);
console.log(
  "D1 Time Travel recovery bookmark recorded for " +
    environment +
    ": " +
    path.relative(root, outputPath) +
    "."
);
