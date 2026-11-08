import test from "node:test";
import assert from "node:assert/strict";
import {
  analyticsSchema,
  analysePortfolio,
  type Metric,
  type ProjectAnalytics,
  type ReportingWindow
} from "./portfolio-analytics.ts";
import {
  modeSplitNote,
  overviewMeasures,
  weeklyHighlights,
  type ModeBreakdown
} from "./analytics-workbench.ts";
import { discoveryStory } from "./analytics-story.ts";
import { analyticsObservations } from "./analytics-observations.ts";

const day = (value: string) => new Date(`${value}T00:00:00Z`);

function dailyBetween(from: string, to: string, value: (date: string) => number) {
  const days: Metric["daily"] = [];
  for (let t = day(from).valueOf(); t <= day(to).valueOf(); t += 86400000) {
    const date = new Date(t).toISOString().slice(0, 10);
    days.push({ date, value: value(date) });
  }
  return days;
}

function gameReport(): ProjectAnalytics {
  return {
    schema: analyticsSchema,
    project: "fighter",
    timezone: "UTC",
    period: {
      from: "2026-07-01",
      to: "2026-07-30",
      days: 30,
      complete: true
    },
    generatedAt: "2026-07-30T00:00:00.000Z",
    coverage: {
      startedAt: "2026-07-01T00:00:00.000Z",
      comparableFrom: "2026-07-01T00:00:00.000Z",
      through: "2026-07-30T00:00:00.000Z",
      quality: "exact",
      limitations: []
    },
    metrics: [
      {
        key: "game_starts",
        label: "Games started",
        unit: "count",
        value: 1260,
        quality: "exact",
        definition: "Accepted starts",
        daily: dailyBetween("2026-07-06", "2026-07-26", (date) =>
          date < "2026-07-13" ? 10 : date < "2026-07-20" ? 20 : 30
        )
      }
    ],
    source: {
      endpoint: "https://fighter.loftwah.com/api/portfolio-analytics",
      revision: "a".repeat(40)
    }
  };
}

const fighter = [{ project: "fighter" as const, report: gameReport() }];
const names = new Map([["fighter", "Fighter"]]);

test("a full-week highlight follows the report window's end, not its creation clock", () => {
  const atWindowEnd = weeklyHighlights(fighter, names, Date.parse("2026-07-30"));
  assert.equal(atWindowEnd.highlights.length, 1);
  assert.deepEqual(
    [atWindowEnd.highlights[0]!.from, atWindowEnd.highlights[0]!.to],
    ["2026-07-20", "2026-07-26"]
  );
  assert.equal(atWindowEnd.highlights[0]!.changePercent, 50);

  const atCreation = weeklyHighlights(fighter, names, Date.parse("2026-11-08"));
  assert.equal(atCreation.highlights.length, 0);
  assert.equal(atCreation.gaps.length, 1);
});

test("a retained history block that cannot produce a week does not hide the live comparison", () => {
  const history = {
    from: "2026-07-19",
    to: "2026-07-26",
    days: 8,
    entries: [
      {
        project: "fighter" as const,
        measure: "game_starts",
        label: "Games started",
        unit: "count" as const,
        quality: "exact" as const,
        coverage: {
          startedAt: gameReport().coverage.startedAt,
          comparableFrom: gameReport().coverage.comparableFrom ?? null,
          through: gameReport().coverage.through
        },
        daily: [{ date: "2026-07-26", value: 30 }]
      }
    ]
  };
  const result = weeklyHighlights(fighter, names, Date.parse("2026-07-30"), history);
  assert.equal(result.highlights.length, 1);
  assert.equal(result.gaps.length, 0);
});

test("an unchecked mode split is never described as reconciled", () => {
  const row = (reconciles: boolean | null): ModeBreakdown => ({
    key: "game_starts",
    label: "Games started",
    unit: "count",
    total: 10,
    totalMetric: undefined,
    groups: [],
    from: "2026-10-01",
    coversWindow: true,
    reconciles
  });
  assert.match(modeSplitNote([row(true)]), /sum to the overall figure/);
  assert.match(modeSplitNote([row(false)]), /does not add up/);
  const unchecked = modeSplitNote([row(null)]);
  assert.match(unchecked, /could not be checked/);
  assert.match(unchecked, /No reconciliation is claimed/);
  assert.doesNotMatch(unchecked, /sum to the overall figure/);
});

test("a total without daily history is not paired with a zero-day coverage claim", () => {
  const period: ReportingWindow = {
    from: "2026-11-02",
    to: "2026-11-08",
    days: 7,
    complete: true
  };
  const report = {
    schema: "woodhouse.portfolio-report/1" as const,
    id: "a".repeat(24),
    createdAt: "2026-11-08T02:00:00.000Z",
    days: 7,
    period,
    projects: [
      {
        project: "woodhouse" as const,
        report: {
          ...gameReport(),
          project: "woodhouse" as const,
          metrics: [
            {
              key: "referral_bubbles",
              label: "Referrals to bubbles",
              unit: "count" as const,
              value: 42,
              quality: "exact" as const,
              definition: "Recorded clicks",
              daily: []
            }
          ]
        }
      }
    ]
  };
  const story = discoveryStory({
    report,
    slug: "bubbles",
    name: "Bubbles",
    period
  });
  assert.equal(story.value, 42);
  assert.equal(story.totalOnly, true);
  assert.match(story.coverageLabel, /total was supplied without daily history/i);
  assert.doesNotMatch(story.establishes, /0 of 7 days/);
  assert.match(story.reason, /no daily history/i);
  assert.equal(story.comparison.eligible, false);
});

test("the opening week card is contained by the selected dates", () => {
  const outside: ReportingWindow = {
    from: "2026-10-01",
    to: "2026-10-07",
    days: 7,
    complete: true
  };
  const week = {
    project: "fighter" as const,
    name: "Fighter",
    family: "game" as const,
    measure: overviewMeasures("fighter")[0]!,
    unit: "count" as const,
    from: "2026-11-02",
    to: "2026-11-08",
    value: 100,
    previous: 50,
    changePercent: 100,
    newBest: true,
    comparedWeeks: 2
  };
  const result = analyticsObservations({
    window: outside,
    colours: {},
    weekly: [week],
    discovery: [],
    discoveryTotal: null,
    rows: [],
    links: {
      week: () => "/activity/",
      project: () => "/activity/",
      discovery: () => "/activity/"
    },
    dateLabel: (date) => date
  });
  assert.equal(result.observations.filter((entry) => entry.kind === "week").length, 0);
  assert.match(
    result.notes.find((note) => note.kind === "week")?.reason ?? "",
    /outside these dates/
  );
});

test("analysis only reports measures the product view supports", () => {
  const report = gameReport();
  report.metrics[0]!.daily = dailyBetween("2026-07-06", "2026-07-26", (date) =>
    date < "2026-07-13" ? 10 : date < "2026-07-20" ? 20 : 0
  );
  const projects = [{ project: "fighter" as const, report }];
  assert.equal(analysePortfolio(projects, Date.parse("2026-07-30")).findings.length, 1);
  assert.equal(
    analysePortfolio(projects, Date.parse("2026-07-30"), (_, key) => key !== "game_starts").findings
      .length,
    0
  );
});
