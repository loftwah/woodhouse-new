import test from "node:test";
import assert from "node:assert/strict";
import { collectGitHub, refreshLeaderboards } from "./github-collector.ts";
import {
  completeWindow,
  rankedProjects,
  parseSnapshot,
  leaderboardCaption,
  leaderboardLink
} from "./github-leaderboards.ts";
import { publishedLeaderboard, weeklyBarGeometry } from "./github-leaderboards.ts";
import { leaderboardSvg, leaderboardFormats } from "./leaderboard-art.ts";
const now = Date.parse("2026-10-24T01:00:00Z");
const fixture: typeof fetch = async (input, init) => {
  assert.equal(init?.redirect, "manual", "Workers only accepts manual/follow redirects");
  const url = new URL(String(input));
  const common = { title: "PRIVATE BODY MUST NOT ESCAPE", author: { login: "private-author" } };
  let result: unknown;
  if (url.pathname.endsWith("/issues/events"))
    result = [
      { id: 1, event: "closed", created_at: "2026-10-15T00:00:00Z", issue: { id: 10 } },
      { id: 2, event: "reopened", created_at: "2026-10-16T00:00:00Z", issue: { id: 10 } },
      { id: 3, event: "closed", created_at: "2026-10-17T00:00:00Z", issue: { id: 10 } },
      { id: 3, event: "closed", created_at: "2026-10-17T00:00:00Z", issue: { id: 10 } },
      {
        id: 4,
        event: "closed",
        created_at: "2026-10-17T00:00:00Z",
        issue: { id: 11, pull_request: {} }
      }
    ];
  else if (url.pathname.endsWith("/pulls"))
    result = [
      { id: 10, ...common, created_at: "2026-09-01T00:00:00Z", merged_at: "2026-10-23T23:59:59Z" },
      { id: 11, ...common, created_at: "2026-10-15T00:00:00Z", merged_at: null },
      { id: 12, ...common, created_at: "2026-10-23T23:59:59Z", merged_at: "2026-10-24T00:00:00Z" }
    ];
  else if (url.pathname === "/search/issues")
    result = { total_count: 3, incomplete_results: false };
  else
    result = [
      { id: 10, ...common, created_at: "2026-10-15T00:00:00Z" },
      { id: 11, ...common, created_at: "2026-10-15T00:00:00Z", pull_request: {} }
    ];
  return Response.json(result);
};
async function snapshot() {
  return { ...(await collectGitHub("fixture", fixture, now)), id: "a".repeat(24) };
}
test("complete UTC windows exclude the current day, including exact midnight", () => {
  assert.deepEqual(completeWindow(28, now), { from: "2026-09-26", to: "2026-10-23" });
  assert.deepEqual(completeWindow(7, Date.parse("2026-10-24T00:00:00Z")), {
    from: "2026-10-17",
    to: "2026-10-23"
  });
});

test("weekly positive and negative movement use equal scale, with zero and missing values drawing no bar", () => {
  const up = weeklyBarGeometry(152, 152, true),
    down = weeklyBarGeometry(-152, 152, true);
  assert.equal(up.height, down.height);
  assert.equal(up.baseline - up.y, down.y + down.height - down.baseline);
  assert.ok(up.y >= 0 && down.y + down.height <= 150);
  assert.equal(weeklyBarGeometry(0, 152, true).height, 0);
  assert.equal(weeklyBarGeometry(null, 152, true).height, 0);
});
test("GitHub counting excludes PR issues, deduplicates events and handles reopen/reclose and merge dates", async () => {
  const s = await snapshot();
  const p = s.projects[0]!;
  assert.equal(
    p.daily.reduce((n, d) => n + d.merged, 0),
    1
  );
  assert.equal(
    p.daily.reduce((n, d) => n + d.opened, 0),
    1
  );
  assert.equal(
    p.daily.reduce((n, d) => n + d.closed, 0),
    2
  );
  assert.equal(
    p.daily.reduce((n, d) => n + d.reopened, 0),
    1
  );
  assert.equal(rankedProjects(s, 28, "reduction").rows[0]!.value, 0);
  assert.doesNotMatch(JSON.stringify(s), /PRIVATE|private-author|pull_request|repo|token|fixture/);
});
test("stable shared ranks distinguish missing data and zero; incomplete peers suppress movement", async () => {
  const s = await snapshot();
  s.projects[1]!.pullsComplete = false;
  const r = rankedProjects(s, 28, "merged").rows;
  assert.equal(r[0]!.slug, "woodhouse");
  assert.equal(r[0]!.rank, 1);
  assert.equal(r[0]!.tied, true);
  assert.equal(r.at(-1)!.value, null);
  assert.equal(r.at(-1)!.rank, null);
  assert.ok(r.every((a) => a.movement === null));
  assert.equal(rankedProjects(await snapshot(), 7, "merged").rows[0]!.value, 1);
});
test("unauthorised, limited and failed reads abort rather than publish zero", async () => {
  for (const status of [401, 403, 429, 500])
    await assert.rejects(
      collectGitHub("fixture", async () => new Response("private upstream body", { status }), now),
      new RegExp(String(status))
    );
  await assert.rejects(
    collectGitHub(
      "fixture",
      async () => {
        throw Error("timeout");
      },
      now
    ),
    /timeout/
  );
  await assert.rejects(collectGitHub("", fixture, now), /credential/);
});
test("snapshot parser projects approved fields, rejects changed allowlist, missing days and invalid counts", async () => {
  const s = await snapshot();
  assert.ok(parseSnapshot(s));
  assert.doesNotMatch(
    JSON.stringify(
      parseSnapshot({
        ...s,
        token: "never",
        projects: s.projects.map((p) => ({ ...p, secret: "never" }))
      })
    ),
    /never/
  );
  assert.equal(parseSnapshot({ ...s, projects: [{ ...s.projects[0], slug: "unapproved" }] }), null);
  assert.equal(parseSnapshot({ ...s, projects: [{ ...s.projects[0], daily: [] }] }), null);
  const bad = structuredClone(s);
  bad.projects[0]!.daily[0]!.merged = -1;
  assert.equal(parseSnapshot(bad), null);
});
test("all image shapes and a project image use the exact saved ranking, caption and deep link", async () => {
  const s = await snapshot();
  const original = JSON.stringify(s);
  for (const format of Object.keys(leaderboardFormats) as (keyof typeof leaderboardFormats)[]) {
    const svg = leaderboardSvg(s, 28, "merged", format);
    assert.match(svg, /Projects making moves/);
    assert.match(svg, /2026-09-26/);
    assert.match(svg, /2026-10-23/);
    assert.match(svg, /Bubbles/);
    assert.doesNotMatch(svg, /PRIVATE|private-author/);
    assert.match(leaderboardSvg(s, 28, "merged", format, "bubbles"), /Bubbles/);
  }
  assert.match(leaderboardCaption(s, 28, "merged", "bubbles"), /Bubbles: 1/);
  assert.match(
    leaderboardLink(s.id, 28, "merged", "bubbles"),
    /report=a{24}&days=28&measure=merged&project=bubbles/
  );
  assert.equal(JSON.stringify(s), original);
});

test("a repeated full page fails closed; real pagination deduplicates overlap and reaches its end", async () => {
  const first = Array.from({ length: 100 }, (_, i) => ({
    id: i + 100,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    merged_at: "2026-10-01T00:00:00Z"
  }));
  const repeated: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/pulls"))
      return Response.json(Number(url.searchParams.get("page")) <= 2 ? first : []);
    return fixture(input, init);
  };
  const incomplete = { ...(await collectGitHub("fixture", repeated, now)), id: "b".repeat(24) };
  assert.equal(incomplete.projects[0]!.pullsComplete, false);
  assert.equal(rankedProjects(incomplete, 28, "merged").rows[0]!.rank, null);
  const paged: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/pulls"))
      return Response.json(
        Number(url.searchParams.get("page")) === 1 ? first : [first[0], { ...first[0], id: 999 }]
      );
    return fixture(input, init);
  };
  const complete = { ...(await collectGitHub("fixture", paged, now)), id: "c".repeat(24) };
  assert.equal(complete.projects[0]!.pullsComplete, true);
  assert.equal(rankedProjects(complete, 28, "merged").rows[0]!.value, 101);
});
test("closure counts stay available independently of issue creation history, while net movement does not", async () => {
  const s = await snapshot();
  s.projects[0]!.issuesComplete = false;
  assert.equal(rankedProjects(s, 28, "closed").rows.find((r) => r.slug === "woodhouse")!.value, 2);
  assert.equal(
    rankedProjects(s, 28, "reduction").rows.find((r) => r.slug === "woodhouse")!.value,
    null
  );
});
test("current publication projects the same field for the page, image and caption without rewriting history", async () => {
  const s = await snapshot();
  const projected = publishedLeaderboard(s, new Set(["woodhouse", "bubbles"]));
  assert.equal(projected.projects.length, 2);
  assert.equal(s.projects.length, 8);
  assert.doesNotMatch(leaderboardSvg(projected, 28, "merged", "landscape"), /Fighter|App Composer/);
  assert.doesNotMatch(leaderboardCaption(projected, 28, "merged"), /Fighter|App Composer/);
});

test("a local backfill still gets one real Worker collection and private receipt, then only conditional permission checks", async () => {
  const seed = await snapshot();
  let privateBody: string | null = null;
  const saved: unknown[] = [];
  const db = {
    prepare(sql: string) {
      return {
        first: async () =>
          sql.includes("id='github-auth'")
            ? privateBody
              ? { body: privateBody }
              : null
            : { body: JSON.stringify(seed) },
        bind(...values: unknown[]) {
          return {
            run: async () => {
              if (sql.includes("VALUES('github-auth'")) privateBody = String(values[1]);
              else saved.push(JSON.parse(String(values[2])));
            }
          };
        }
      };
    }
  } as unknown as D1Database;
  await refreshLeaderboards({ DB: db, WOODHOUSE_GITHUB_TOKEN: "fixture" }, fixture, now);
  assert.equal(saved.length, 1, "same-day backfill bypassed configured Worker collection");
  const receipt = JSON.parse(privateBody!);
  assert.equal(receipt.projects.length, 8);
  assert.equal(receipt.issuesRead, true);
  assert.equal(receipt.pullsRead, true);
  assert.equal(receipt.collectedThrough, seed.through);
  assert.equal(receipt.reportId, (saved[0] as { id: string }).id);
  assert.doesNotMatch(privateBody!, /PRIVATE|private-author|fixture/);
  await refreshLeaderboards({ DB: db, WOODHOUSE_GITHUB_TOKEN: "fixture" }, fixture, now + 1000);
  assert.equal(saved.length, 1, "Worker recollected a complete day unnecessarily");
});
