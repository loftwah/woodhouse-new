import test from "node:test";
import assert from "node:assert/strict";
import { leaderboardShareLink, readLeaderboardShareLink } from "./leaderboard-links.ts";
import { leaderboardProjects, leaderboardLink, rankingMeasures } from "./github-leaderboards.ts";

test("short links retain the entire report, period, measure and project without an alias store", () => {
  const id = "66a203ac24a2f0f85800359f";
  for (const days of [7, 28, 90])
    for (const measure of rankingMeasures)
      for (const project of [undefined, ...leaderboardProjects.map((p) => p.slug)]) {
        const link = leaderboardShareLink(id, days, measure.key, project);
        assert.equal(link.includes("?"), false);
        assert.deepEqual(readLeaderboardShareLink(link.slice(3)), {
          id,
          days,
          measure: measure.key,
          project,
          href: leaderboardLink(id, days, measure.key, project)
        });
      }
  assert.equal(leaderboardShareLink(id, 28, "merged"), "/l/ZqIDrCSi8PhYADWf/");
});
test("malformed links and unapproved projects cannot become a report redirect", () => {
  for (const input of [
    "",
    "github-auth",
    "../github-auth",
    "ZqIDrCSi8PhYADWf/42",
    "ZqIDrCSi8PhYADWf/unknown",
    "ZqIDrCSi8PhYADWf/bubbles/extra",
    "ZqIDrCSi8PhYADWf//bubbles",
    "https://example.com",
    "ZqIDrCSi8PhYA1n="
  ])
    assert.equal(readLeaderboardShareLink(input), null, input);
  assert.throws(() => leaderboardShareLink("github-auth", 28, "merged"));
});
