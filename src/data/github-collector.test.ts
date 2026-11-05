import { test } from "node:test";
import assert from "node:assert/strict";
import { collectGitHub, refreshLeaderboards } from "./github-collector.ts";

const now = Date.parse("2026-11-05T13:00:00Z");
const fetcher: typeof fetch = async (input) => {
  const url = String(input);
  return Response.json(url.includes("/search/issues") ? { total_count: 0 } : []);
};

test("a changed project roster refreshes the saved report once on the same day", async () => {
  const complete = await collectGitHub("fixture", fetcher, now);
  let snapshot = {
    ...complete,
    id: "0123456789abcdef01234567",
    projects: complete.projects.filter((p) => !["liferaft", "foilbury"].includes(p.slug))
  };
  let receipt = { collectedThrough: complete.through, etags: {}, reportId: snapshot.id };
  let reports = 0;
  const db = {
    prepare(sql: string) {
      let args: unknown[] = [];
      return {
        bind(...values: unknown[]) {
          args = values;
          return this;
        },
        async first() {
          return { body: JSON.stringify(sql.includes("github-auth") ? receipt : snapshot) };
        },
        async run() {
          if (sql.includes("'github-auth'")) receipt = JSON.parse(args[1] as string);
          else {
            snapshot = JSON.parse(args[2] as string);
            reports++;
          }
        }
      };
    }
  } as unknown as D1Database;
  await refreshLeaderboards({ DB: db, WOODHOUSE_GITHUB_TOKEN: "fixture" }, fetcher, now);
  assert.equal(reports, 1);
  assert.ok(snapshot.projects.some((p) => p.slug === "liferaft"));
  assert.ok(snapshot.projects.some((p) => p.slug === "foilbury"));
  await refreshLeaderboards({ DB: db, WOODHOUSE_GITHUB_TOKEN: "fixture" }, fetcher, now);
  assert.equal(reports, 1);
});
