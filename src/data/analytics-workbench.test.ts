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
  reportCaption,
  supportsMeasure,
  measureScope,
  weeklyHighlights,
  discoveryReferrals,
  weekCaptionLines
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
test("a missing whole report or an omitted metric keeps an applicable project in scope", () => {
  // Applicability is a product fact, independent of what a source returned.
  assert.equal(supportsMeasure("fighter", "game_starts"), true);
  assert.equal(supportsMeasure("woodhouse", "game_starts"), false);
  assert.equal(supportsMeasure("app-composer", "app_opens"), true);
  assert.deepEqual(
    measureScope(
      ["fighter", "bubbles", "protocol-11", "shoalshot", "loftwahfm", "app-composer", "woodhouse"],
      "game_starts"
    ),
    ["fighter", "bubbles", "protocol-11", "shoalshot"]
  );
  const missingReport: PortfolioReport = {
    ...mixed,
    projects: mixed.projects.map((row) =>
      row.project === "protocol-11" ? { project: row.project, report: null } : row
    )
  };
  const omittedMetric: PortfolioReport = {
    ...mixed,
    projects: mixed.projects.map((row) =>
      row.project === "protocol-11"
        ? {
            project: row.project,
            report: fixture("protocol-11", [{ key: "active_seconds", value: 30, unit: "seconds" }])
          }
        : row
    )
  };
  for (const [label, report] of [
    ["missing report", missingReport],
    ["omitted metric", omittedMetric]
  ] as const)
    for (const format of ["landscape", "square", "portrait"] as const) {
      const svg = reportSvg(report, names, format, "game_starts");
      assert(svg.includes("Protocol 11"), `${label} ${format} dropped the applicable game`);
      assert(svg.includes("3/4 sources supply this measure"), `${label} ${format} denominator`);
      assert(!svg.includes("3/3"));
      assert(
        /Bubbles[\s\S]{0,400}>0<\/text>/.test(svg),
        `${label} ${format} dropped Bubbles's genuine zero`
      );
      for (const project of ["LoftwahFM", "App Composer", "Woodhouse"])
        assert(!svg.includes(project), `${label} ${format} listed ${project} under gameplay`);
    }
  // A wholly missing source and an omitted metric are named, not silently zero.
  assert(
    reportSvg(missingReport, names, "landscape", "game_starts").includes("Source unavailable")
  );
  assert(reportSvg(omittedMetric, names, "landscape", "game_starts").includes("Not reported"));
});
test("the saved caption carries the same qualifier the card and PNG show", () => {
  const coverage = {
    startedAt: "2026-10-13T00:00:00.000Z",
    comparableFrom: "2026-10-15T00:00:00.000Z",
    through: "2026-10-17T15:00:00.000Z",
    quality: "exact" as const,
    limitations: []
  };
  const full = {
    ...metric,
    daily: [
      { date: "2026-10-14", value: 4 },
      { date: "2026-10-15", value: 0 },
      { date: "2026-10-16", value: 0 }
    ]
  };
  const legacy = reportCaption(
    [{ name: "Fighter", metric: full, overviewMeasure: null, report: { coverage } }],
    resolveMeasure(null, "game_starts"),
    period,
    "https://example.test/activity/",
    (date) => date
  );
  assert.match(legacy, /Fighter: 4 game starts · Legacy\/test risk/);
  const clean = reportCaption(
    [
      {
        name: "Fighter",
        metric: full,
        overviewMeasure: null,
        report: { coverage: { ...coverage, comparableFrom: "2026-10-13T00:00:00.000Z" } }
      }
    ],
    resolveMeasure(null, "game_starts"),
    period,
    "https://example.test/activity/",
    (date) => date
  );
  assert.match(clean, /Fighter: 4 game starts · Reported activity/);
});
test("the last complete week shows a valid comparison and an earned record below the alert threshold", () => {
  const now = Date.parse("2026-10-17T12:00:00.000Z");
  const days: { date: string; value: number }[] = [];
  for (let t = Date.parse("2026-09-21"); t <= Date.parse("2026-10-11"); t += 86400000)
    days.push({ date: new Date(t).toISOString().slice(0, 10), value: 0 });
  const setSum = (from: string, value: number) => {
    const row = days.find((d) => d.date === from);
    if (row) row.value = value;
  };
  setSum("2026-09-21", 5);
  setSum("2026-09-28", 5);
  setSum("2026-10-05", 10);
  const starts: Metric = {
    key: "game_starts",
    label: "Game starts",
    unit: "count",
    value: 160,
    quality: "exact",
    definition: "Reported starts",
    daily: days
  };
  const report = {
    schema: analyticsSchema,
    project: "fighter",
    generatedAt: "2026-10-16T15:00:00.000Z",
    timezone: "UTC",
    period: { from: "2026-09-21", to: "2026-10-16", days: 26, complete: false },
    coverage: {
      startedAt: "2026-09-20T00:00:00.000Z",
      comparableFrom: "2026-09-20T00:00:00.000Z",
      through: "2026-10-16T15:00:00.000Z",
      quality: "exact",
      limitations: []
    },
    metrics: [starts],
    source: { endpoint: "https://example.test/aggregate", revision: null }
  } as ProjectAnalytics;
  const { highlights, gaps } = weeklyHighlights([{ project: "fighter", report }], names, now);
  assert.deepEqual(gaps, []);
  assert.equal(highlights.length, 1);
  const h = highlights[0]!;
  assert.equal(h.from, "2026-10-05");
  assert.equal(h.to, "2026-10-11");
  assert.equal(h.value, 10);
  assert.equal(h.previous, 5);
  assert.equal(h.changePercent, 100);
  assert.equal(h.newBest, true);
  assert.equal(h.comparedWeeks, 3);
  assert.equal(h.unit, "count");
  assert.equal(h.measure.key, "game_starts");
  // A wholly missing source is named with a reason rather than dropped or shown
  // as a zero.
  const missing = weeklyHighlights([{ project: "fighter", report: null }], names, now);
  assert.equal(missing.highlights.length, 0);
  assert.match(missing.gaps[0]!.reason, /No source report/);
  // Too little history cannot earn a comparison or a record.
  const little = weeklyHighlights(
    [
      {
        project: "fighter",
        report: { ...report, metrics: [{ ...starts, daily: days.slice(-7) }] }
      }
    ],
    names,
    now
  );
  assert.equal(little.highlights.length, 0);
  assert.match(little.gaps[0]!.reason, /Fewer than two complete comparable weeks/);
});
test("a seven-day report keeps its week comparison from retained history", () => {
  const now = Date.parse("2026-10-17T12:00:00.000Z");
  const dateAt = (from: string, index: number) =>
    new Date(Date.parse(from) + index * 86400000).toISOString().slice(0, 10);
  const historyDaily: { date: string; value: number }[] = [];
  for (let t = Date.parse("2026-09-20"); t <= Date.parse("2026-10-11"); t += 86400000)
    historyDaily.push({ date: new Date(t).toISOString().slice(0, 10), value: 1 });
  const setWeek = (from: string, value: number) => {
    for (let i = 0; i < 7; i++) {
      const row = historyDaily.find((d) => d.date === dateAt(from, i));
      if (row) row.value = value;
    }
  };
  setWeek("2026-09-21", 5);
  setWeek("2026-09-28", 5);
  setWeek("2026-10-05", 10);
  const weekPeriod = { from: "2026-10-05", to: "2026-10-11", days: 7, complete: true };
  const starts: Metric = {
    key: "game_starts",
    label: "Game starts",
    unit: "count",
    value: 70,
    quality: "exact",
    definition: "Starts",
    daily: historyDaily.filter((d) => d.date >= weekPeriod.from)
  };
  const report = {
    ...fixture("fighter", [starts]),
    period: weekPeriod,
    coverage: {
      startedAt: "2026-09-20T00:00:00.000Z",
      comparableFrom: "2026-09-20T00:00:00.000Z",
      through: "2026-10-12T00:00:00.000Z",
      quality: "exact" as const,
      limitations: []
    }
  };
  const history = {
    from: "2026-09-20",
    to: "2026-10-11",
    days: 22,
    entries: [
      {
        project: "fighter" as const,
        measure: "game_starts",
        label: "Game starts",
        unit: "count" as const,
        quality: "exact" as const,
        coverage: {
          startedAt: "2026-09-20T00:00:00.000Z",
          comparableFrom: "2026-09-20T00:00:00.000Z",
          through: "2026-10-12T00:00:00.000Z"
        },
        daily: historyDaily
      }
    ]
  };
  // Without the retained lookback a seven-day report cannot compare anything.
  const without = weeklyHighlights([{ project: "fighter", report }], names, now);
  assert.equal(without.highlights.length, 0);
  // With it, the same week, previous period and record basis are recovered.
  const with_history = weeklyHighlights([{ project: "fighter", report }], names, now, history);
  const highlight = with_history.highlights[0]!;
  assert.equal(highlight.from, "2026-10-05");
  assert.equal(highlight.to, "2026-10-11");
  assert.equal(highlight.value, 70);
  assert.equal(highlight.previous, 35);
  assert.equal(highlight.changePercent, 100);
  assert.equal(highlight.newBest, true);
  assert.equal(highlight.comparedWeeks, 3);
  // The page, caption and every image format describe that week identically.
  const dateLabel = (date: string) => date;
  const caption = reportCaption(
    [{ name: "Fighter", metric: starts, overviewMeasure: null, report }],
    resolveMeasure("fighter", "game_starts"),
    weekPeriod,
    "https://example.test/activity/?week=2026-10-05",
    dateLabel,
    highlight
  );
  assert.match(caption, /Week in focus · Fighter · 2026-10-05 – 2026-10-11 \(UTC\)/);
  assert.match(caption, /Fighter: 70 (counts|game starts)/);
  assert.match(caption, /Up 100% from 35/);
  assert.match(caption, /previous week 2026-09-28 – 2026-10-04/);
  assert.match(caption, /A new best of 3 comparable weeks\./);
  for (const format of ["landscape", "square", "portrait"] as const) {
    const svg = reportSvg(
      {
        schema: "woodhouse.portfolio-report/1",
        id: "c".repeat(24),
        createdAt: "2026-10-12T00:00:00.000Z",
        days: 7,
        period: weekPeriod,
        projects: [{ project: "fighter", report }],
        history
      },
      names,
      format,
      "game_starts",
      "https://woodhouse.loftwah.com",
      "2026-10-05"
    );
    assert.match(svg, /Week in focus/);
    assert.match(svg, /new best of 3 weeks/);
    assert.match(svg, /week=2026-10-05/);
  }
});
test("a zero baseline and a fall to zero are stated, not invented", () => {
  const dateLabel = (date: string) => date;
  const caption = (week: Parameters<typeof weekCaptionLines>[0]) =>
    weekCaptionLines(week, dateLabel).join("\n");
  const base = {
    name: "Fighter",
    project: "fighter",
    from: "2026-10-05",
    to: "2026-10-11",
    unit: "count" as const,
    comparedWeeks: 2
  };
  // A zero previous week has no percentage to state.
  const fromZero = caption({ ...base, value: 10, previous: 0, changePercent: null, newBest: true });
  assert.match(fromZero, /No prior baseline \(0 the week before\)/);
  assert.doesNotMatch(fromZero, /Up /);
  // A fall to zero remains visible.
  const toZero = caption({ ...base, value: 0, previous: 40, changePercent: -100, newBest: false });
  assert.match(toZero, /Down 100% from 40/);
  assert.match(toZero, /not a record/);
});
test("the discovery breakdown keeps only published destinations and reports a trend honestly", () => {
  const discoveryPeriod = { from: "2026-10-01", to: "2026-10-16", days: 16, complete: false };
  const referrals = (slug: string, perDay: number): Metric => ({
    key: `referral_${slug.replaceAll("-", "_")}`,
    label: `Referrals to ${slug}`,
    unit: "count",
    value: perDay * 16,
    quality: "exact",
    definition: "Referrals",
    daily: Array.from({ length: 16 }, (_, i) => ({
      date: new Date(Date.parse(discoveryPeriod.from) + i * 86400000).toISOString().slice(0, 10),
      value: perDay
    }))
  });
  const entries = discoveryReferrals(
    [referrals("fighter", 3), referrals("protocol-11", 1), referrals("ghost", 5)],
    new Set(["fighter", "protocol-11"]),
    new Map([
      ["fighter", "Fighter"],
      ["protocol-11", "Protocol 11"]
    ]),
    new Map([
      ["fighter", "https://fighter.loftwah.com"],
      ["protocol-11", null]
    ]),
    discoveryPeriod
  );
  // A withdrawn destination is not linked; ranking is by recorded referrals.
  assert.deepEqual(
    entries.map((e) => e.slug),
    ["fighter", "protocol-11"]
  );
  assert.equal(entries[0]!.name, "Fighter");
  assert.equal(entries[0]!.siteUrl, "https://fighter.loftwah.com");
  assert.equal(entries[0]!.value, 48);
  assert.equal(entries[0]!.recent, 21);
  assert.equal(entries[0]!.prior, 21);
  assert.equal(entries[0]!.hasTrend, true);
  // A zero-referral destination is not shown as a discovery.
  assert.deepEqual(
    discoveryReferrals(
      [{ ...referrals("fighter", 0), value: 0 }],
      new Set(["fighter"]),
      new Map([["fighter", "Fighter"]]),
      new Map(),
      discoveryPeriod
    ),
    []
  );
});
test("the discovery trend needs recorded history and never sums an unobserved day as zero", () => {
  const month = { from: "2026-09-17", to: "2026-10-16", days: 30, complete: true };
  const week = (from: string, value: number) =>
    Array.from({ length: 7 }, (_, index) => ({
      date: new Date(Date.parse(from) + index * 86400000).toISOString().slice(0, 10),
      value
    }));
  const metric = (rows: { date: string; value: number }[]): Metric => ({
    key: "referral_fighter",
    label: "Referrals to fighter",
    unit: "count",
    value: rows.reduce((sum, row) => sum + row.value, 0),
    quality: "exact",
    definition: "Referrals",
    daily: rows
  });
  const threeWeeks = [...week("2026-09-26", 4), ...week("2026-10-03", 0), ...week("2026-10-10", 2)];
  const ask = (rows: { date: string; value: number }[]) =>
    discoveryReferrals(
      [metric(rows)],
      new Set(["fighter"]),
      new Map([["fighter", "Fighter"]]),
      new Map(),
      month
    )[0]!;
  // A recorded prior week of zeros is a real baseline: the comparison stands.
  const complete = ask(threeWeeks);
  assert.equal(complete.recent, 14);
  assert.equal(complete.prior, 0);
  assert.equal(complete.priorCoverage, "observed");
  assert.equal(complete.hasTrend, true);
  assert.equal(complete.recentFrom, "2026-10-10");
  assert.equal(complete.priorTo, "2026-10-09");
  // History that starts inside the earlier week is incomplete, not zero.
  const partial = ask(threeWeeks.slice(11));
  assert.equal(partial.priorObservedDays, 3);
  assert.equal(partial.priorCoverage, "partial");
  assert.equal(partial.hasTrend, false);
  assert.equal(partial.prior, 0);
  // No earlier history at all is unavailable, and a longer calendar range alone
  // must not manufacture a comparison.
  const unavailable = ask(threeWeeks.slice(14));
  assert.equal(unavailable.priorCoverage, "unavailable");
  assert.equal(unavailable.hasTrend, false);
  assert.equal(unavailable.recent, 14);
  // A window shorter than fourteen days cannot contain a full earlier week, so
  // its truncated slice is never reported as a complete comparison period.
  const tenDays = { from: "2026-10-07", to: "2026-10-16", days: 10, complete: true };
  const shortWindow = discoveryReferrals(
    [metric(threeWeeks.slice(11))],
    new Set(["fighter"]),
    new Map([["fighter", "Fighter"]]),
    new Map(),
    tenDays
  )[0]!;
  assert.equal(shortWindow.priorObservedDays, 3);
  assert.notEqual(shortWindow.priorCoverage, "observed");
  assert.equal(shortWindow.hasTrend, false);
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
  // An unavailable measure stays in the caption as a missing entry, never as a
  // zero and never silently dropped while the PNG still counts it.
  assert.match(caption, /Protocol 11: game starts not reported · Not measured/);
  assert.match(caption, /LoftwahFM: audible listening not reported · Not measured/);
  assert.match(caption, /App Composer: mini-app opens not reported · Not measured/);
  assert.doesNotMatch(caption, /LoftwahFM: 0/);
  assert.match(caption, /4\/7 projects supplied their own measure · Current UTC day is partial/);
  assert.match(caption, /One relevant measure per project; units are not added together\./);
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
  assert.equal(reportQualifier(undefined, null, period), "Source unavailable");
  assert.equal(reportQualifier({ ...exact, value: null }, { coverage }, period), "Not measured");
  assert.equal(reportQualifier({ ...exact, quality: "bounded" }, null, period), "Bounded count");
  assert.equal(reportQualifier({ ...exact, quality: "sampled" }, null, period), "Sampled estimate");
  assert.equal(
    reportQualifier(exact, { coverage: { ...coverage, quality: "unavailable" } }, period),
    "Coverage unavailable"
  );
});
