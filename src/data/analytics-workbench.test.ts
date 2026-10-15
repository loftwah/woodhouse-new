import assert from "node:assert/strict";
import test from "node:test";
import {
  dailyPoints,
  dailyStatus,
  svgPlot,
  measuresFor,
  resolveMeasure,
  productView
} from "./analytics-workbench.ts";
import { type ProjectAnalytics, type Metric } from "./portfolio-analytics.ts";
import { reportSvg } from "./portfolio-card.ts";
import type { PortfolioReport } from "./portfolio-analytics.ts";
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
test("switching from games to apps selects app usage and keeps typed outcomes distinct", () => {
  assert.equal(resolveMeasure("app-composer", "game_starts").key, "app_opens");
  assert.equal(resolveMeasure("app-composer", "returning_browsers").key, "app_opens");
  assert.equal(resolveMeasure("app-composer", "inspection_completed").key, "inspection_completed");
  assert.deepEqual(
    measuresFor("app-composer").map((m) => m.key),
    ["app_opens", "photo_opens", "inspection_completed", "actions"]
  );
  assert.match(resolveMeasure("app-composer", "actions").meaning, /different tasks/);
  assert.match(
    resolveMeasure("app-composer", "photo_opens").meaning,
    /not image downloads, submissions/
  );
  assert.doesNotMatch(productView("app-composer")!.description, /gameplay|players/);
});
test("product defaults remain meaningful even while their source is unavailable", () => {
  assert.equal(resolveMeasure("loftwahfm", "game_starts").key, "listening_seconds");
  assert.equal(resolveMeasure("woodhouse", "game_starts").key, "visits");
  assert.equal(resolveMeasure("fighter", "app_opens").key, "game_starts");
  assert.equal(resolveMeasure(null, "photo_opens").key, "photo_opens");
  assert.equal(resolveMeasure(null).key, "game_starts");
});
test("app report exports select useful app measures and retain their distinct frozen counts", () => {
  const app = {
    ...source,
    coverage: { ...source.coverage, quality: "bounded" },
    metrics: [
      { ...metric, key: "app_opens", value: 20, daily: [{ date: "2026-10-14", value: 20 }] },
      { ...metric, key: "photo_opens", value: 3, daily: [{ date: "2026-10-14", value: 3 }] },
      {
        ...metric,
        key: "inspection_completed",
        value: 2,
        daily: [{ date: "2026-10-14", value: 2 }]
      }
    ]
  } as ProjectAnalytics;
  const report: PortfolioReport = {
    schema: "woodhouse.portfolio-report/1",
    id: "a".repeat(24),
    createdAt: "2026-10-16T15:00:00.000Z",
    days: 3,
    period,
    projects: [{ project: "app-composer", report: app }]
  };
  for (const format of ["landscape", "square", "portrait"] as const) {
    const fallback = reportSvg(report, new Map(), format, "game_starts");
    assert(fallback.includes("Mini-app opens"));
    assert(fallback.includes("measure=app_opens"));
    assert(!fallback.includes("Game starts"));
    const inspection = reportSvg(report, new Map(), format, "inspection_completed");
    assert(inspection.includes("Completed Link Checks"));
    assert(inspection.includes("measure=inspection_completed"));
    assert(inspection.includes(">2</text>"));
    assert(!inspection.includes(">20</text>"));
    assert(inspection.includes("Bounded count"));
  }
});
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
