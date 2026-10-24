import assert from "node:assert/strict";
import test from "node:test";
import { discoveryCaption, discoveryStory } from "./analytics-story.ts";
import type {
  Metric,
  PortfolioReport,
  ProjectAnalytics,
  ReportingWindow
} from "./portfolio-analytics.ts";

const period: ReportingWindow = {
  from: "2026-09-23",
  to: "2026-10-22",
  days: 30,
  complete: false
};

const daily = (from: string, values: number[]): Metric["daily"] =>
  values.map((value, index) => ({
    date: new Date(Date.parse(from) + index * 86400000).toISOString().slice(0, 10),
    value
  }));

const referral = (
  key: string,
  value: number,
  start = "2026-10-15",
  values = [0, 2, 2, 1, 1, 0, 0, 0]
): Metric => ({
  key,
  label: "Project discovery",
  unit: "count",
  value,
  definition: "Recorded outbound project-open actions from Woodhouse.",
  quality: "exact",
  daily: daily(start, values)
});

const woodhouseReport = (metrics: Metric[]): ProjectAnalytics => ({
  schema: "woodhouse.portfolio-analytics/1",
  project: "woodhouse",
  generatedAt: "2026-10-22T16:25:49.548Z",
  timezone: "UTC",
  period,
  coverage: {
    startedAt: "2026-10-15T00:00:00.000Z",
    comparableFrom: "2026-10-15T00:00:00.000Z",
    through: "2026-10-22T16:25:49.548Z",
    quality: "partial",
    limitations: []
  },
  metrics,
  source: { endpoint: "https://woodhouse.loftwah.com/api/portfolio-analytics", revision: null }
});

const report = (metrics: Metric[]): PortfolioReport => ({
  schema: "woodhouse.portfolio-report/1",
  id: "a".repeat(24),
  createdAt: "2026-10-22T16:25:49.548Z",
  days: 30,
  period,
  projects: [{ project: "woodhouse", report: woodhouseReport(metrics) }]
});

const dateLabel = (date: string) =>
  new Date(date).toLocaleDateString("en-AU", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

test("a partial destination story keeps missing days distinct from zero", () => {
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 6)]),
    slug: "bubbles",
    name: "Bubbles",
    period
  });
  assert.equal(story.value, 6);
  assert.equal(story.observedDays, 8);
  assert.equal(story.coverage, "partial");
  assert.match(story.coverageLabel, /8 of 30 days counted/);
  assert.equal(story.daily[0]?.date, "2026-09-23");
  assert.equal(story.daily[0]?.value, null);
  assert.equal(story.daily.at(-8)?.value, 0);
  assert.match(story.reason, /missing rather than zero/);
  assert.equal(story.comparison.eligible, false);
  assert.match(story.comparison.reason, /current UTC day is not finished/);
});

test("a complete earlier week earns a comparison and states its direction", () => {
  const values = Array.from({ length: 14 }, (_, index) => (index < 7 ? 1 : 3));
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 28, "2026-10-09", values)]),
    slug: "bubbles",
    name: "Bubbles",
    period: { ...period, from: "2026-10-09", days: 14, complete: true }
  });
  assert.equal(story.comparison.eligible, true);
  assert.equal(story.comparison.change, 14);
  assert.equal(story.comparison.percent, 200);
  assert.match(story.headline, /14 clicks more than the earlier seven days/);
});

test("a missing counter is unavailable, not a measured zero", () => {
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 6)]),
    slug: "fighter",
    name: "Fighter",
    period
  });
  assert.equal(story.value, null);
  assert.equal(story.coverage, "unavailable");
  assert.equal(story.valueLabel, "—");
  assert.match(story.establishes, /not a measured zero/);
  assert.doesNotMatch(story.establishes, /^0 /);
});

test("a measured zero is reported as a zero with its observed days", () => {
  const story = discoveryStory({
    report: report([referral("referral_fighter", 0, "2026-10-15", [0, 0, 0, 0, 0, 0, 0, 0])]),
    slug: "fighter",
    name: "Fighter",
    period
  });
  assert.equal(story.value, 0);
  assert.equal(story.rank, null);
  assert.match(story.headline, /No clicks from Woodhouse to Fighter/);
  assert.match(story.establishes, /0 recorded clicks from Woodhouse/);
});

test("a tie for the top destination is not described as an outright winner", () => {
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 6), referral("referral_loftwahfm", 6)]),
    slug: "bubbles",
    name: "Bubbles",
    period
  });
  assert.equal(story.rank, 1);
  assert.match(story.kicker, /Joint most-opened/);
  assert.match(story.headline, /shared the most-opened spot/);
});

test("the caption and the story name the same destination, period and coverage", () => {
  const story = discoveryStory({
    report: report([referral("referral_loftwahfm", 6)]),
    slug: "loftwahfm",
    name: "LoftwahFM",
    period
  });
  const link =
    "https://woodhouse.loftwah.com/activity/?report=" +
    "a".repeat(24) +
    "&measure=project_opens&destination=loftwahfm";
  const caption = discoveryCaption(story, link, dateLabel);
  assert.match(caption, /LoftwahFM received 6 clicks from Woodhouse/);
  assert.match(caption, /23 Sept 2026 and 22 Oct 2026 \(UTC\)/);
  assert.match(caption, /8 of 30 days counted; the rest are missing/);
  assert.match(caption, /not proof anyone played or stayed/);
  assert.doesNotMatch(
    caption,
    /Legacy\/test risk|Bounded count|Partial coverage|referral counter/i
  );
  assert.ok(caption.endsWith(link));
});

test("all three shared formats carry the same destination story and retrieval scope", async () => {
  const { reportSvg } = await import("./portfolio-card.ts");
  const fixture = report([referral("referral_bubbles", 6)]);
  for (const format of ["landscape", "square", "portrait"] as const) {
    const svg = reportSvg(
      fixture,
      new Map([["bubbles", "Bubbles"]]),
      format,
      "project_opens",
      "https://preview.example",
      undefined,
      "bubbles"
    );
    assert.match(svg, /DISCOVERY STORY/);
    assert.match(svg, /Bubbles/);
    assert.match(svg, />6<\/text>/);
    assert.match(svg, /clicks from Woodhouse/);
    assert.match(svg, /8 of 30 days counted/);
    assert.match(svg, /destination=bubbles/);
    assert.match(svg, /A click shows interest in opening the project/);
  }
  const unrelated = reportSvg(
    fixture,
    new Map([["bubbles", "Bubbles"]]),
    "landscape",
    "visits",
    "https://preview.example",
    undefined,
    "bubbles"
  );
  assert.doesNotMatch(unrelated, /DISCOVERY STORY/);
});

test("a destination with no retained counter still gets an honest card", async () => {
  const { reportSvg } = await import("./portfolio-card.ts");
  const svg = reportSvg(
    report([]),
    new Map([["fighter", "Fighter"]]),
    "landscape",
    "project_opens",
    "https://preview.example",
    undefined,
    "fighter"
  );
  assert.match(svg, /Fighter/);
  assert.match(
    svg,
    /No click count for Fighter in these dates|No click data from Woodhouse for these dates/
  );
  assert.doesNotMatch(svg, />0<\/text>/);
});

test("withdrawn destinations do not win the busiest-hand-off ranking", () => {
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 6), referral("referral_loftwahfm", 4)]),
    slug: "loftwahfm",
    name: "LoftwahFM",
    period,
    published: new Set(["loftwahfm"])
  });
  assert.equal(story.rank, 1);
  assert.equal(story.measuredDestinations, 1);
  assert.match(story.headline, /opened most from Woodhouse/);
});

test("a partial recent week is labelled in the shared caption", () => {
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 2, "2026-10-20", [1, 1, 0])]),
    slug: "bubbles",
    name: "Bubbles",
    period
  });
  assert.equal(story.recent.observedDays, 3);
  assert.equal(story.comparison.eligible, false);
  const caption = discoveryCaption(
    story,
    "https://example.test/activity/?report=x",
    (date) => date
  );
  assert.match(caption, /No click count|days counted/);
});

test("a tie is described as joint in the caption, not as an outright winner", () => {
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 6), referral("referral_loftwahfm", 6)]),
    slug: "bubbles",
    name: "Bubbles",
    period
  });
  assert.equal(story.tiedAtTop, true);
  const caption = discoveryCaption(
    story,
    "https://example.test/activity/?report=x",
    (date) => date
  );
  assert.match(caption, /shared the most-opened spot/);
  assert.doesNotMatch(caption, /was opened most/);
});

test("a complete, fully observed window can claim coverage and a comparison", () => {
  const values = Array.from({ length: 14 }, (_, index) => (index < 7 ? 1 : 2));
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 21, "2026-10-09", values)]),
    slug: "bubbles",
    name: "Bubbles",
    period: { ...period, from: "2026-10-09", days: 14, complete: true }
  });
  assert.equal(story.coverageLabel, "All 14 days counted");
  assert.equal(story.comparison.eligible, true);
  const caption = discoveryCaption(
    story,
    "https://example.test/activity/?report=x",
    (date) => date
  );
  assert.match(caption, /not proof anyone played or stayed/);
});

test("an open window never presents an observed day as full coverage", () => {
  const values = Array.from({ length: 30 }, () => 1);
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 30, "2026-09-23", values)]),
    slug: "bubbles",
    name: "Bubbles",
    period
  });
  assert.equal(story.coverageLabel, "All days so far counted; today is still being counted");
  assert.equal(story.comparison.eligible, false);
});

test("the shared image labels a partial recent week", async () => {
  const { reportSvg } = await import("./portfolio-card.ts");
  const partial = report([referral("referral_bubbles", 2, "2026-10-20", [1, 1, 0])]);
  const svg = reportSvg(
    partial,
    new Map([["bubbles", "Bubbles"]]),
    "landscape",
    "project_opens",
    "https://preview.example",
    undefined,
    "bubbles"
  );
  assert.match(svg, /3 of 7 days counted/);
  assert.doesNotMatch(svg, /Last seven days 2<\/text>/);
});

test("a single-project report keeps its chart and measure label in every format", async () => {
  const { reportSvg } = await import("./portfolio-card.ts");
  const single = {
    schema: "woodhouse.portfolio-report/1" as const,
    id: "b".repeat(24),
    createdAt: "2026-10-22T16:25:49.548Z",
    days: 30,
    period: { ...period, complete: true },
    projects: [
      {
        project: "bubbles" as const,
        report: {
          ...woodhouseReport([
            {
              ...referral(
                "game_starts",
                42,
                "2026-10-01",
                [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1]
              )
            }
          ]),
          project: "bubbles" as const
        }
      }
    ]
  };
  for (const format of ["landscape", "square", "portrait"] as const) {
    const svg = reportSvg(single, new Map([["bubbles", "Bubbles"]]), format, "game_starts");
    assert.match(svg, /Bubbles/);
    assert.match(svg, /game_starts|Game starts/);
    assert.match(svg, /Daily activity chart/);
    assert.match(svg, />42<\/text>/);
  }
});

test("the discovery card uses the same ordinary qualifier in every format", async () => {
  const { reportSvg } = await import("./portfolio-card.ts");
  const fixture = report([referral("referral_bubbles", 6)]);
  for (const format of ["landscape", "square", "portrait"] as const) {
    const svg = reportSvg(
      fixture,
      new Map([["bubbles", "Bubbles"]]),
      format,
      "project_opens",
      "https://preview.example",
      undefined,
      "bubbles"
    );
    assert.match(svg, /8 of 30 days counted; the rest are missing/);
    assert.match(svg, /clicks from Woodhouse/);
    assert.doesNotMatch(
      svg,
      /Legacy\/test risk|Bounded count|Partial coverage|source-qualified|scope reconciliation|recorded project opens/
    );
  }
});
