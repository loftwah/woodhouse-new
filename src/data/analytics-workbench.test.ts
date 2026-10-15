import assert from "node:assert/strict";
import test from "node:test";
import { dailyPoints, dailyStatus, svgPlot } from "./analytics-workbench.ts";
import { type ProjectAnalytics, type Metric } from "./portfolio-analytics.ts";
const period = { from: "2026-10-14", to: "2026-10-16", days: 3, complete: false };
const metric: Metric = {
  key: "game_starts",
  label: "Starts",
  unit: "count",
  value: 4,
  quality: "exact",
  definition: "Reported starts",
  daily: [
    { date: "2026-10-14", value: 4 },
    { date: "2026-10-16", value: 0 }
  ]
};
const source = {
  coverage: {
    startedAt: "2026-10-13T14:00:00.000Z",
    comparableFrom: "2026-10-14T11:00:00.000Z",
    through: "2026-10-16T15:00:00.000Z"
  }
} as ProjectAnalytics;
test("chart preserves missing days as gaps, real zeroes, and source comparability boundaries", () => {
  assert.deepEqual(dailyPoints(metric, period), [4, null, 0]);
  assert.equal(dailyStatus(source, metric, "2026-10-14"), "legacy");
  assert.equal(dailyStatus(source, metric, "2026-10-15"), "missing");
  assert.equal(dailyStatus(source, metric, "2026-10-16"), "partial");
  assert.equal(
    dailyStatus(
      { ...source, coverage: { ...source.coverage, comparableFrom: "2026-10-16T11:00:00.000Z" } },
      metric,
      "2026-10-16"
    ),
    "partial"
  );
  const full = { ...metric, daily: [{ date: "2026-10-15", value: 0 }] };
  assert.equal(dailyStatus(source, full, "2026-10-15"), "clean");
  assert.equal(
    dailyStatus(
      { ...source, coverage: { ...source.coverage, comparableFrom: null } },
      full,
      "2026-10-15"
    ),
    "legacy"
  );
  assert.equal(dailyStatus(source, { ...full, quality: "bounded" }, "2026-10-15"), "bounded");
  assert.equal(dailyStatus(source, { ...full, quality: "partial" }, "2026-10-15"), "partial");
  assert.equal(dailyStatus(source, { ...full, quality: "unavailable" }, "2026-10-15"), "missing");
  for (const [quality, expected] of [
    ["bounded", "bounded"],
    ["sampled", "sampled"],
    ["unavailable", "missing"]
  ] as const) {
    assert.equal(
      dailyStatus({ ...source, coverage: { ...source.coverage, quality } }, full, "2026-10-15"),
      expected
    );
  }
  assert.equal(
    dailyStatus(
      { ...source, coverage: { ...source.coverage, quality: "partial" } },
      full,
      "2026-10-15"
    ),
    "clean"
  );
  assert.deepEqual(dailyPoints({ ...metric, value: null, daily: [] }, period), [null, null, null]);
  const svg = svgPlot([{ name: "source", colour: "#79d8ff", values: [4, null, 0] }], period);
  assert.match(svg, /fill="none" stroke-width="2.5"/);
  assert.equal((svg.match(/<circle /g) ?? []).length, 2);
  assert.doesNotMatch(svg, /NaN|undefined/);
});
