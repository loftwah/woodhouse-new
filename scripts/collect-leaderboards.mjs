// One-time/backfill operator path. Values and private GitHub records never log.
import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { parseEnvFile } from "./public-privacy.mjs";
import { collectGitHub } from "../src/data/github-collector.ts";
const local = parseEnvFile(await readFile(".env", "utf8"));
const token =
  local.get("WOODHOUSE_GITHUB_TOKEN") ||
  execFileSync("gh", ["auth", "token"], { encoding: "utf8" }).trim();
const body = await collectGitHub(token);
const digest = await crypto.subtle.digest(
  "SHA-256",
  new TextEncoder().encode(JSON.stringify(body))
);
const id = [...new Uint8Array(digest)]
  .map((b) => b.toString(16).padStart(2, "0"))
  .join("")
  .slice(0, 24);
const snapshot = { ...body, id };
await mkdir("output/leaderboards", { recursive: true });
await writeFile("output/leaderboards/initial.json", JSON.stringify(snapshot, null, 2), {
  mode: 0o600
});
const quote = (s) => "'" + s.replaceAll("'", "''") + "'";
await writeFile(
  "output/leaderboards/initial.sql",
  `INSERT OR IGNORE INTO wh_analytics_reports(id,created_at,days,body) VALUES(${quote(id)},${quote(body.collectedAt)},0,${quote(JSON.stringify(snapshot))});\n`,
  { mode: 0o600 }
);
console.log(
  JSON.stringify(
    {
      id,
      through: body.through,
      projects: body.projects.map((p) => ({
        project: p.slug,
        issues: p.issuesComplete,
        events: p.eventsComplete,
        pulls: p.pullsComplete
      }))
    },
    null,
    2
  )
);
