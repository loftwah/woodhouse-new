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
  assert.match(story.coverageLabel, /8 of 30 days observed/);
  assert.equal(story.daily[0]?.date, "2026-09-23");
  assert.equal(story.daily[0]?.value, null);
  assert.equal(story.daily.at(-8)?.value, 0);
  assert.match(story.reason, /missing rather than zero/);
  assert.equal(story.comparison.eligible, false);
  assert.match(story.comparison.reason, /only 1 of 7/);
});

test("a complete earlier week earns a comparison and states its direction", () => {
  const values = Array.from({ length: 14 }, (_, index) => (index < 7 ? 1 : 3));
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 28, "2026-10-09", values)]),
    slug: "bubbles",
    name: "Bubbles",
    period: { ...period, from: "2026-10-09", days: 14 }
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
  assert.match(story.headline, /No recorded clicks to Fighter/);
  assert.match(story.establishes, /0 recorded outbound clicks/);
});

test("a tie for the top destination is not described as an outright winner", () => {
  const story = discoveryStory({
    report: report([referral("referral_bubbles", 6), referral("referral_loftwahfm", 6)]),
    slug: "bubbles",
    name: "Bubbles",
    period
  });
  assert.equal(story.rank, 1);
  assert.match(story.kicker, /joint busiest/);
  assert.match(story.headline, /shared the busiest/);
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
  assert.match(caption, /Woodhouse → LoftwahFM/);
  assert.match(caption, /6 recorded project opens/);
  assert.match(caption, /23 Sept 2026 – 22 Oct 2026 \(UTC\)/);
  assert.match(caption, /Partial coverage · 8 of 30 days observed/);
  assert.match(caption, /not downstream use/);
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
    assert.match(svg, /recorded project opens/);
    assert.match(svg, /Partial coverage/);
    assert.match(svg, /destination=bubbles/);
    assert.match(svg, /A recorded click is discovery intent/);
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
  assert.match(svg, /No retained referral counter|No report supplied/);
  assert.doesNotMatch(svg, />0<\/text>/);
});
