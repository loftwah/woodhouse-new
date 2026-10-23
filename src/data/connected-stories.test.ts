import test from "node:test";
import assert from "node:assert/strict";
import {
  outcomeStories,
  outcomeFindings,
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

test("Classic story never substitutes another mode, overall gameplay or another game's completion", () => {
  const classic = storyFor("protocol-11")!;
  const shoalshot = storyFor("shoalshot")!;
  const metric = {
    ...source.metrics[0]!,
    key: "active_seconds",
    unit: "seconds" as const,
    value: 999
  };
  const input: PortfolioReport = {
    ...report,
    projects: [
      {
        project: "protocol-11",
        report: {
          ...source,
          project: "protocol-11",
          metrics: [metric, { ...metric, key: "active_seconds_journey", value: 800 }]
        }
      },
      {
        project: "fighter",
        report: {
          ...source,
          project: "fighter",
          metrics: [{ ...source.metrics[0]!, key: "game_completions", value: 123 }]
        }
      }
    ]
  };
  assert.equal(outcomeEvidence(input, classic, period).value, null);
  assert.equal(outcomeEvidence(input, shoalshot, period).value, null);
  input.projects[0]!.report!.metrics.push({
    ...metric,
    key: classic.measure,
    value: 94,
    daily: [{ date: "2026-10-22", value: 94 }]
  });
  const selected = outcomeEvidence(input, classic, period);
  assert.equal(selected.unit, "seconds");
  assert.equal(selected.display, "0h 1m 34s");
  assert.deepEqual(
    selected.daily.map((p) => p.value),
    [null, null, 94]
  );
  const caption = outcomeCaption(input, classic);
  assert.ok(caption.includes("Classic active gameplay"));
  assert.ok(caption.includes("0h 1m 34s"));
  assert.ok(!caption.includes("999"));
  assert.ok(!caption.includes("800"));
});

test("completion stories retain their own terminal-result definitions and measured zero", () => {
  for (const key of ["shoalshot", "fighter", "bubbles"]) {
    const selected = storyFor(key)!;
    const ownSource: ProjectAnalytics = {
      ...source,
      project: selected.project,
      metrics: [
        {
          ...source.metrics[0]!,
          key: selected.measure,
          value: 0,
          definition: `Terminal results for ${key}.`,
          daily: [{ date: "2026-10-22", value: 0 }]
        }
      ]
    };
    const evidence = outcomeEvidence(
      { ...report, projects: [{ project: selected.project, report: ownSource }] },
      selected,
      period
    );
    assert.equal(evidence.unit, "count");
    assert.equal(evidence.display, "0");
    assert.equal(evidence.definition, `Terminal results for ${key}.`);
    assert.deepEqual(
      evidence.daily.map((d) => d.value),
      [null, null, 0]
    );
  }
});

test("findings lead with usable observations without comparing incompatible totals", () => {
  const published = new Set(outcomeStories.map((item) => item.project));
  const projects = [
    ["fighter", 900, "exact", "2026-10-22"],
    ["bubbles", 0, "bounded", "2026-10-01"],
    ["music", 9000, "bounded", "2026-10-01"],
    ["link-check", 2, "bounded", "2026-10-01"]
  ].map(([key, value, quality, comparableFrom]) => {
    const selected = storyFor(String(key))!;
    return {
      project: selected.project,
      report: {
        ...source,
        project: selected.project,
        coverage: { ...source.coverage, quality, comparableFrom, through: "2026-10-23T00:00:00Z" },
        metrics: [
          {
            ...source.metrics[0]!,
            key: selected.measure,
            value,
            quality,
            daily: [{ date: "2026-10-21", value }]
          }
        ]
      }
    };
  }) as PortfolioReport["projects"];
  const findings = outcomeFindings({ ...report, projects }, period, published);
  assert.deepEqual(
    findings.map(({ story }) => story.key),
    ["music", "link-check", "bubbles", "fighter", "protocol-11", "shoalshot"]
  );
  assert.equal(findings[1]!.observed.value, 2);
  assert(findings[3]!.observed.statuses.includes("legacy"));
  assert.equal(findings[4]!.observed.value, null);
  assert.equal(outcomeFindings(report, period, new Set()).length, 0);
  assert.deepEqual(
    outcomeFindings(null, period, published).map(({ story }) => story.key),
    ["protocol-11", "shoalshot", "bubbles", "fighter", "music", "link-check"]
  );
});
