import test from "node:test";
import assert from "node:assert/strict";
import {
  outcomeStories,
  outcomeEvidence,
  outcomeCaption,
  storyLink,
  storyFor
} from "./connected-stories.ts";
import type { PortfolioReport, ProjectAnalytics } from "./portfolio-analytics.ts";
const period = { from: "2026-10-20", to: "2026-10-22", days: 3, complete: true };
const story = outcomeStories[0]!;
const source = {
  schema: "woodhouse.portfolio-analytics/1",
  project: story.project,
  generatedAt: "2026-10-23T00:00:00Z",
  timezone: "UTC",
  period,
  coverage: {
    startedAt: "2026-10-20T00:00:00Z",
    through: "2026-10-22T12:00:00Z",
    quality: "bounded",
    limitations: ["Counters may omit activity."]
  },
  metrics: [
    {
      key: story.measure,
      label: story.label,
      unit: "count",
      value: 4,
      definition: "Completed inspections, not opens.",
      quality: "bounded",
      daily: [
        { date: "2026-10-20", value: 0 },
        { date: "2026-10-22", value: 4 }
      ]
    }
  ],
  source: {
    endpoint: "https://composer.loftwah.com/api/portfolio-analytics",
    revision: "producer-revision"
  }
} satisfies ProjectAnalytics;
const report: PortfolioReport = {
  schema: "woodhouse.portfolio-report/1",
  id: "0123456789abcdef01234567",
  createdAt: "2026-10-23T00:00:00Z",
  days: 3,
  period,
  projects: [{ project: story.project, report: source }]
};
test("missing day, zero and bounded completed work remain distinct", () => {
  const e = outcomeEvidence(report, story, period);
  assert.deepEqual(
    e.daily.map((p) => p.value),
    [0, null, 4]
  );
  assert.equal(e.display, "4");
  assert.deepEqual(e.statuses, ["bounded", "missing", "bounded"]);
  assert.equal(e.definition, source.metrics[0]!.definition);
});
test("missing source or metric never borrows app opens or invents a zero", () => {
  for (const input of [
    null,
    {
      ...report,
      projects: [
        {
          project: story.project,
          report: { ...source, metrics: [{ ...source.metrics[0]!, key: "app_opens", value: 900 }] }
        }
      ]
    }
  ]) {
    const e = outcomeEvidence(input, story, period);
    assert.equal(e.value, null);
    assert.equal(e.display, "Not measured");
    assert(e.daily.every((p) => p.value === null));
  }
});
test("caption freezes relationship, definition, dates and snapshot in its own environment", () => {
  const caption = outcomeCaption(report, story, "https://preview.example");
  assert(caption.includes("Completed inspections, not opens."));
  assert(caption.includes(period.from + " to " + period.to + " UTC"));
  assert(caption.includes(report.id));
  assert(
    caption.includes("https://preview.example/connections/?story=link-check&report=" + report.id)
  );
  assert(caption.includes("Counters may omit activity."));
  assert(!caption.includes("900"));
});
test("selection builder has one story and one report; unsupported story is absent", () => {
  const url = new URL(storyLink(story, report.id));
  assert.equal(url.searchParams.getAll("story").length, 1);
  assert.equal(url.searchParams.getAll("report").length, 1);
  assert.equal(storyFor("invented"), null);
});
test("listening retains seconds without rounding a small observation into a minute", () => {
  const music = outcomeStories[1]!;
  const input: PortfolioReport = {
    ...report,
    projects: [
      {
        project: music.project,
        report: {
          ...source,
          project: music.project,
          metrics: [{ ...source.metrics[0]!, key: music.measure, unit: "seconds", value: 5 }]
        }
      }
    ]
  };
  assert.equal(outcomeEvidence(input, music, period).display, "0h 0m 5s");
  assert.equal(outcomeEvidence(input, story, period).value, null);
});
