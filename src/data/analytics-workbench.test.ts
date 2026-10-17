import assert from "node:assert/strict";
import test from "node:test";
import {
  dailyPoints,
  dailyStatus,
  svgPlot,
  measuresFor,
  resolveMeasure,
  productView,
  reportMetric,
  measureForProjectSwitch,
  portfolioOverview,
  overviewMeasures,
  isOverviewMeasure,
  overviewMeasure,
  reportCaption
} from "./analytics-workbench.ts";
import { type ProjectAnalytics, type Metric, analyticsSchema } from "./portfolio-analytics.ts";
import { reportSvg, reportQualifier } from "./portfolio-card.ts";
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
    ["app_opens", "guest_postcards_received", "photo_opens", "inspection_completed", "actions"]
  );
  assert.match(resolveMeasure("app-composer", "actions").meaning, /different tasks/);
  assert.match(
    resolveMeasure("app-composer", "photo_opens").meaning,
    /not image downloads, submissions/
  );
  assert.doesNotMatch(productView("app-composer")!.description, /gameplay|players/);
  assert.equal(
    resolveMeasure("app-composer", "guest_postcards_received").key,
    "guest_postcards_received"
  );
  assert.match(resolveMeasure("app-composer", "guest_postcards_received").meaning, /pending/);
  assert.equal(resolveMeasure("fighter", "guest_postcards_received").key, "game_starts");
});
test("guest receipts retain unknown history and their partial first observation despite bounded source coverage", () => {
  const data = {
    ...source,
    coverage: { ...source.coverage, through: "2026-10-17T12:00:00.000Z", quality: "bounded" }
  } as ProjectAnalytics;
  const receipts: Metric = {
    ...metric,
    key: "guest_postcards_received",
    quality: "partial",
    value: 2,
    daily: [
      { date: "2026-10-15", value: 2 },
      { date: "2026-10-16", value: 0 },
      { date: "2026-10-17", value: 0 }
    ]
  };
  assert.deepEqual(dailyPoints(receipts, period), [null, 2, 0]);
  assert.equal(dailyStatus(data, receipts, "2026-10-14"), "missing");
  assert.equal(dailyStatus(data, receipts, "2026-10-15"), "partial");
  assert.equal(dailyStatus(data, receipts, "2026-10-16"), "bounded");
  assert.equal(dailyStatus(data, receipts, "2026-10-17"), "partial");
  const later = {
    ...receipts,
    quality: "bounded" as const,
    value: 0,
    daily: receipts.daily.slice(1)
  };
  assert.equal(dailyStatus(data, later, "2026-10-16"), "bounded");
  const unknown = { ...receipts, value: null, quality: "unavailable" as const, daily: [] };
  assert.deepEqual(dailyPoints(unknown, period), [null, null, null]);
  assert.equal(dailyStatus(data, unknown, "2026-10-16"), "missing");
});
test("All projects opens on the mixed overview while product defaults stay meaningful", () => {
  assert.equal(resolveMeasure("loftwahfm", "game_starts").key, "listening_seconds");
  assert.equal(resolveMeasure("woodhouse", "game_starts").key, "visits");
  assert.equal(resolveMeasure("fighter", "app_opens").key, "game_starts");
  assert.equal(resolveMeasure(null, "photo_opens").key, "photo_opens");
  assert.equal(resolveMeasure(null).key, "overview");
  assert.equal(resolveMeasure(null, "overview").key, "overview");
  assert.equal(resolveMeasure("fighter", "overview").key, "game_starts");
  assert.equal(resolveMeasure(null, "game_starts").key, "game_starts");
  assert.equal(resolveMeasure("fighter", "replays").key, "game_replays");
  assert.equal(resolveMeasure("shoalshot", "game_replays").key, "game_replays");
  assert.equal(resolveMeasure("loftwahfm", "game_listening_seconds").key, "game_listening_seconds");
});
test("project switches reset across product families and retain comparable game drilldowns", () => {
  assert.equal(measureForProjectSwitch("woodhouse", "fighter", "visits").key, "game_starts");
  assert.equal(
    measureForProjectSwitch("fighter", "bubbles", "active_seconds").key,
    "active_seconds"
  );
  assert.equal(
    measureForProjectSwitch("app-composer", "loftwahfm", "app_opens").key,
    "listening_seconds"
  );
  // Leaving the mixed overview lands on the destination's own default: no
  // gameplay measure was chosen yet, so nothing is carried across.
  assert.equal(measureForProjectSwitch(null, "fighter", "overview").key, "game_starts");
  assert.equal(measureForProjectSwitch(null, "loftwahfm", "overview").key, "listening_seconds");
  assert.equal(measureForProjectSwitch(null, "fighter", "game_replays").key, "game_starts");
  // Choosing All projects returns to the mixed overview, while an explicit
  // `?measure=` address remains a valid single-scope drill-down.
  assert.equal(measureForProjectSwitch("fighter", null, "active_seconds").key, "overview");
  assert.equal(measureForProjectSwitch("app-composer", null, "photo_opens").key, "overview");
  assert.equal(resolveMeasure(null, "active_seconds").key, "active_seconds");
  assert.equal(resolveMeasure(null, "replays").key, "game_replays");
  assert.equal(resolveMeasure(null, "not_a_measure").key, "overview");
});
test("source key compatibility does not mix site attention with active gameplay", () => {
  const time = { ...metric, key: "active_seconds", value: 60 };
  assert.equal(reportMetric("woodhouse", [time], "active_seconds"), undefined);
  assert.equal(reportMetric("fighter", [time], "active_seconds"), time);
  const replay = { ...metric, key: "game_replays", value: 2 };
  assert.equal(
    reportMetric("protocol-11", [replay], resolveMeasure("protocol-11", "replays").key),
    replay
  );
});
test("small-count export axes label the actual integer tick values", () => {
  const svg = svgPlot([{ name: "Inspections", colour: "#7fa2ff", values: [1, 3, 0] }], period);
  const labels = [...svg.matchAll(/text-anchor="end">([^<]+)<\/text>/g)].map((m) => Number(m[1]));
  assert.deepEqual(labels, [3, 2, 1, 0]);
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
    const oldReceipts = reportSvg(report, new Map(), format, "guest_postcards_received");
    assert(oldReceipts.includes("Guest postcards received"));
    assert(oldReceipts.includes("Not reported"));
    const received = reportSvg(
      {
        ...report,
        projects: [
          {
            project: "app-composer",
            report: {
              ...app,
              metrics: [
                ...app.metrics,
                {
                  ...metric,
                  key: "guest_postcards_received",
                  quality: "partial",
                  value: 7,
                  daily: [{ date: "2026-10-16", value: 7 }]
                }
              ]
            }
          }
        ]
      },
      new Map(),
      format,
      "guest_postcards_received"
    );
    assert(received.includes("measure=guest_postcards_received"));
    assert(received.includes(">7</text>"));
    assert(received.includes("Partial coverage"));
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

/* ---------------------------------------------------------------- overview */

type FixtureMetric = {
  key: string;
  value: number | null;
  quality?: Metric["quality"];
  unit?: Metric["unit"];
};
function fixture(project: ProjectAnalytics["project"], metrics: FixtureMetric[]): ProjectAnalytics {
  return {
    schema: analyticsSchema,
    project,
    generatedAt: "2026-10-16T15:00:00.000Z",
    timezone: "UTC",
    period,
    coverage: {
      startedAt: "2026-10-13T00:00:00.000Z",
      comparableFrom: "2026-10-15T00:00:00.000Z",
      through: "2026-10-16T15:00:00.000Z",
      quality: "exact",
      limitations: []
    },
    metrics: metrics.map((m) => ({
      key: m.key,
      label: m.key,
      unit: m.unit ?? "count",
      value: m.value,
      quality: m.quality ?? (m.value === null ? "unavailable" : "exact"),
      definition: "Fixture definition",
      daily: m.value === null ? [] : [{ date: "2026-10-15", value: m.value }]
    })),
    source: { endpoint: "https://example.test/aggregate", revision: null }
  };
}
const gameFixture = (project: ProjectAnalytics["project"], starts: number | null) =>
  fixture(project, [
    { key: "game_starts", value: starts },
    { key: "game_completions", value: 1 },
    { key: "active_seconds", value: 90, unit: "seconds" }
  ]);
// Seven admitted products where only three of four games report game starts, the
// app reports no mini-app opens, LoftwahFM reports no listening and Woodhouse
// reports a genuine zero visits.
const mixed: PortfolioReport = {
  schema: "woodhouse.portfolio-report/1",
  id: "b".repeat(24),
  createdAt: "2026-10-16T15:00:00.000Z",
  days: 3,
  period,
  projects: [
    { project: "fighter", report: gameFixture("fighter", 12) },
    { project: "bubbles", report: gameFixture("bubbles", 0) },
    { project: "protocol-11", report: gameFixture("protocol-11", null) },
    { project: "shoalshot", report: gameFixture("shoalshot", 5) },
    {
      project: "loftwahfm",
      report: fixture("loftwahfm", [{ key: "listening_seconds", value: null, unit: "seconds" }])
    },
    {
      project: "app-composer",
      report: fixture("app-composer", [{ key: "app_opens", value: null }])
    },
    { project: "woodhouse", report: fixture("woodhouse", [{ key: "visits", value: 0 }]) }
  ]
};
const mixedIds = new Set(mixed.projects.map((p) => p.project));
const names = new Map([
  ["fighter", "Fighter"],
  ["bubbles", "Bubbles"],
  ["protocol-11", "Protocol 11"],
  ["shoalshot", "SHOALSHOT"],
  ["loftwahfm", "LoftwahFM"],
  ["app-composer", "App Composer"],
  ["woodhouse", "Woodhouse"]
]);
test("All projects opens on a mixed overview that leads with each product's own measure", () => {
  assert.equal(resolveMeasure(null).key, "overview");
  assert(isOverviewMeasure(resolveMeasure(null)));
  assert.equal(productView(null), null);
  assert.match(overviewMeasure.meaning, /never added together/);
  const rows = portfolioOverview(mixed, mixedIds, names);
  assert.deepEqual(
    rows.map((r) => r.project),
    ["fighter", "bubbles", "protocol-11", "shoalshot", "loftwahfm", "app-composer", "woodhouse"]
  );
  assert.deepEqual(
    rows.map((r) => r.measure.key),
    [
      "game_starts",
      "game_starts",
      "game_starts",
      "game_starts",
      "listening_seconds",
      "app_opens",
      "visits"
    ]
  );
  assert.deepEqual(
    rows.map((r) => r.family),
    ["game", "game", "game", "game", "listening", "app", "audience"]
  );
  // A genuine zero survives, a real reporting failure stays visible, and no
  // overview value is ever a sum of unrelated units.
  assert.equal(rows[1]!.metric?.value, 0);
  assert.equal(rows[2]!.metric?.value, null);
  assert.equal(rows[4]!.metric?.value, null);
  assert.equal(rows[6]!.metric?.value, 0);
  for (const row of rows) assert.deepEqual(overviewMeasures(row.project)[0], row.measure);
});
test("explicit game measures include only games and never count non-games as missing gameplay", () => {
  const rows = mixed.projects.map((row) => ({
    project: row.project,
    name: names.get(row.project) ?? row.project,
    metric: reportMetric(row.project, row.report?.metrics, "game_starts")
  }));
  assert.deepEqual(
    rows.filter((r) => r.metric).map((r) => r.project),
    ["fighter", "bubbles", "protocol-11", "shoalshot"]
  );
  assert.equal(rows.filter((r) => r.metric?.value === null).length, 1);
  // Three of the four eligible games reported; seven products exist overall.
  assert.equal(rows.filter((r) => r.metric && r.metric.value !== null).length, 3);
  assert.equal(rows.filter((r) => r.metric).length, 4);
  const metricsFor = (project: (typeof mixed.projects)[number]["project"]) =>
    mixed.projects.find((p) => p.project === project)!.report!.metrics;
  for (const project of ["woodhouse", "app-composer", "loftwahfm"] as const)
    assert.equal(reportMetric(project, metricsFor(project), "game_starts"), undefined);
  // Applicability never depends on whether a source happened to return data.
  assert.notEqual(reportMetric("bubbles", metricsFor("bubbles"), "game_starts"), undefined);
  assert.equal(reportMetric("fighter", metricsFor("fighter"), "app_opens"), undefined);
  assert.equal(
    reportMetric("app-composer", metricsFor("app-composer"), "active_seconds"),
    undefined
  );
  // A non-game source that reuses a gameplay key is still not gameplay.
  assert.equal(
    reportMetric("woodhouse", [{ ...metric, key: "active_seconds", value: 600 }], "active_seconds"),
    undefined
  );
});
test("overview exports keep the mixed scope, each measure label and the real zero in every format", () => {
  for (const format of ["landscape", "square", "portrait"] as const) {
    const overviewSvg = reportSvg(mixed, names, format, "overview");
    assert(overviewSvg.includes("Project overview"));
    assert(overviewSvg.includes("measure=overview"));
    assert(!overviewSvg.includes("measure=game_starts"));
    for (const label of ["Game starts", "Audible listening", "Mini-app opens", "Visits"])
      assert(overviewSvg.includes(label), `${format} is missing ${label}`);
    for (const project of [
      "Fighter",
      "Bubbles",
      "Protocol 11",
      "SHOALSHOT",
      "LoftwahFM",
      "App Composer",
      "Woodhouse"
    ])
      assert(overviewSvg.includes(project), `${format} is missing ${project}`);
    // The shared image follows the page's games-first portfolio order.
    const positions = [
      "Fighter",
      "Bubbles",
      "Protocol 11",
      "SHOALSHOT",
      "LoftwahFM",
      "App Composer",
      "Woodhouse"
    ].map((project) => overviewSvg.indexOf(project));
    assert.deepEqual(
      [...positions].sort((a, b) => a - b),
      positions,
      `${format} order`
    );
    if (format === "landscape")
      assert(overviewSvg.includes("Daily shape · each panel scaled to its own maximum"));
    assert(overviewSvg.includes(">0</text>"), `${format} dropped the genuine zero`);
    // Four of seven supplied a value: three games plus Woodhouse's genuine zero.
    assert(overviewSvg.includes("4/7 projects supplied their own measure"));
    assert(overviewSvg.includes("units are not added together"));
    assert(!overviewSvg.includes("sources supply this measure"));
    assert.doesNotMatch(overviewSvg, /NaN|undefined/);
    // A project that supplied nothing is not a missing gameplay source.
    assert(!overviewSvg.includes("0/7"));
    assert(overviewSvg.includes("Not measured"));

    const gameplaySvg = reportSvg(mixed, names, format, "game_starts");
    assert(gameplaySvg.includes("Game starts"));
    assert(gameplaySvg.includes("measure=game_starts"));
    assert(!gameplaySvg.includes("measure=overview"));
    for (const project of ["Fighter", "Bubbles", "Protocol 11", "SHOALSHOT"])
      assert(gameplaySvg.includes(project));
    for (const project of ["LoftwahFM", "App Composer", "Woodhouse"])
      assert(!gameplaySvg.includes(project), `${format} listed ${project} under gameplay`);
    assert(gameplaySvg.includes("3/4 sources supply this measure"));
    assert(gameplaySvg.includes("Not measured"));
  }
});
test("the share caption names each project's own measure and the mixed scope", () => {
  const rows = portfolioOverview(mixed, mixedIds, names).map((row) => ({
    name: row.label,
    metric: row.metric,
    overviewMeasure: row.measure
  }));
  const dateLabel = (date: string) => date;
  const caption = reportCaption(
    rows,
    overviewMeasure,
    period,
    "https://example.test/activity/",
    dateLabel
  );
  assert.match(caption, /Fighter: 12 game starts/);
  assert.match(caption, /Bubbles: 0 game starts/);
  assert.match(caption, /Woodhouse: 0 visits/);
  // An unavailable measure is never captioned as a zero or as a gameplay gap.
  assert.doesNotMatch(caption, /LoftwahFM/);
  assert.doesNotMatch(caption, /App Composer/);
  assert.doesNotMatch(caption, /Protocol 11/);
  assert.match(caption, /Each project is shown on its own measure; units are not added together\./);
  assert.match(caption, /not unique people/);
  const scopedRows = mixed.projects
    .map((row) => ({
      name: names.get(row.project) ?? row.project,
      metric: reportMetric(row.project, row.report?.metrics, "game_starts"),
      overviewMeasure: null
    }))
    .filter((row) => row.metric);
  const scoped = reportCaption(
    scopedRows,
    resolveMeasure(null, "game_starts"),
    period,
    "https://example.test/activity/",
    dateLabel
  );
  assert.match(scoped, /Fighter: 12 game starts/);
  assert.match(scoped, /One measure and one unit across the named projects\./);
  assert.doesNotMatch(scoped, /Woodhouse/);
  assert.doesNotMatch(scoped, /Audible listening/);
});
test("shared images describe the same evidence the page shows", () => {
  const coverage = {
    startedAt: "2026-10-13T00:00:00.000Z",
    comparableFrom: "2026-10-15T00:00:00.000Z",
    through: "2026-10-17T15:00:00.000Z",
    quality: "exact" as const,
    limitations: []
  };
  const exact = {
    key: "game_starts",
    value: 4,
    quality: "exact" as const,
    daily: [
      { date: "2026-10-14", value: 4 },
      { date: "2026-10-15", value: 0 },
      { date: "2026-10-16", value: 0 }
    ]
  };
  // A complete window that still carries legacy/test risk says so.
  assert.equal(reportQualifier(exact, { coverage }, period), "Legacy/test risk");
  assert.equal(
    reportQualifier(exact, { coverage: { ...coverage, comparableFrom: null } }, period),
    "Legacy/test risk"
  );
  assert.equal(
    reportQualifier(
      exact,
      { coverage: { ...coverage, comparableFrom: "2026-10-13T00:00:00.000Z" } },
      period
    ),
    "Reported activity"
  );
  // A source that supplied no such metric is not a measured zero.
  assert.equal(reportQualifier(undefined, { coverage }, period), "Not reported");
  assert.equal(reportQualifier(undefined, null, period), "Not measured");
  assert.equal(reportQualifier({ ...exact, value: null }, { coverage }, period), "Not measured");
  assert.equal(reportQualifier({ ...exact, quality: "bounded" }, null, period), "Bounded count");
  assert.equal(reportQualifier({ ...exact, quality: "sampled" }, null, period), "Sampled estimate");
  assert.equal(
    reportQualifier(exact, { coverage: { ...coverage, quality: "unavailable" } }, period),
    "Coverage unavailable"
  );
});
