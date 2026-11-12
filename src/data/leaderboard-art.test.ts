import test from "node:test";
import assert from "node:assert/strict";
import {
  activeLeaderboardProjects,
  leaderboardLink,
  type LeaderboardSnapshot
} from "./github-leaderboards.ts";
import { leaderboardSvg } from "./leaderboard-art.ts";
import { leaderboardShareLink } from "./leaderboard-links.ts";

const snapshot = (): LeaderboardSnapshot => {
  const through = "2026-11-11";
  const days = Array.from({ length: 90 }, (_, index) => {
    const day = new Date(Date.parse(through) - (89 - index) * 86400000).toISOString().slice(0, 10);
    return { day, merged: 1, opened: 0, closed: 1, reopened: 0 };
  });
  return {
    schema: "woodhouse.github-leaderboard/1",
    id: "a".repeat(24),
    collectedAt: "2026-11-12T00:00:00.000Z",
    from: days[0]!.day,
    through,
    projects: activeLeaderboardProjects.map((project, index) => ({
      slug: project.slug,
      daily: days.map((day) => ({ ...day, merged: index + 1 })),
      issuesComplete: true,
      eventsComplete: true,
      pullsComplete: true,
      openNow: 0
    }))
  };
};

test("the landscape card places every ranked project in its own row", () => {
  const svg = leaderboardSvg(snapshot(), 28, "merged", "landscape", undefined, 4);
  const rows = [
    ...svg.matchAll(/<text x="[^"]+" y="([\d.]+)"[^>]*data-row="([^"]+)" data-col="([01])"/g)
  ].map((match) => ({ y: Number(match[1]), slug: match[2]!, column: Number(match[3]) }));
  assert.equal(rows.length, activeLeaderboardProjects.length);
  assert.equal(new Set(rows.map((row) => row.slug)).size, activeLeaderboardProjects.length);
  for (const column of [0, 1]) {
    const ys = rows.filter((row) => row.column === column).map((row) => row.y);
    assert.equal(new Set(ys).size, ys.length, `column ${column} has overlapping rows`);
  }
  assert.deepEqual(
    [0, 1].map((column) => rows.filter((row) => row.column === column).length),
    [5, 4]
  );
});

test("existing edition 3 markup does not gain the edition 4 row attributes", () => {
  const legacy = leaderboardSvg(snapshot(), 28, "merged", "landscape", undefined, 3);
  assert(!legacy.includes("data-row="));
  assert(!legacy.includes("data-col="));
});

test("a shared board keeps the retired scope it was showing", () => {
  const base = leaderboardShareLink("a".repeat(24), 28, "merged");
  assert(base.startsWith("/l/"));
  assert(!base.includes("retired"));
  assert.equal(
    leaderboardShareLink("a".repeat(24), 28, "merged", undefined, true),
    `${base}?retired=1`
  );
  assert.match(leaderboardLink("a".repeat(24), 28, "merged", undefined, true), /includeRetired=1/);
  assert.doesNotMatch(leaderboardLink("a".repeat(24), 28, "merged"), /includeRetired/);
});
