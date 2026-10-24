import assert from "node:assert/strict";
import test from "node:test";
import { outcomeCard } from "./outcome-card.ts";
import { outcomeStories, type OutcomeStory } from "./connected-stories.ts";
import { reportFormats, type ReportFormat } from "./portfolio-card.ts";
import type { PortfolioReport, ReportingWindow } from "./portfolio-analytics.ts";

const period: ReportingWindow = { from: "2026-10-20", to: "2026-10-22", days: 3, complete: true };
const frozen = (story: OutcomeStory, value: number | null = 7): PortfolioReport => ({
  schema: "woodhouse.portfolio-report/1",
  id: "frozen-outcome",
  createdAt: "2026-10-23T01:02:03.000Z",
  days: 3,
  period,
  projects: [
    {
      project: story.project,
      report: {
        schema: "woodhouse.portfolio-analytics/1",
        project: story.project,
        generatedAt: "2026-10-23T01:02:03.000Z",
        timezone: "UTC",
        period,
        coverage: {
          startedAt: "2026-10-19T00:00:00Z",
          comparableFrom: "2026-10-19T00:00:00Z",
          through: "2026-10-23T00:00:00Z",
          quality: "bounded",
          limitations: ["Some activity may be omitted."]
        },
        metrics: [
          {
            key: story.measure,
            label: story.label,
            unit: story.measure.includes("seconds") ? "seconds" : "count",
            value,
            definition: "Accepted events from the published source; missing dates remain unknown.",
            quality: "bounded",
            daily: [
              { date: "2026-10-20", value: 0 },
              { date: "2026-10-22", value: value ?? 7 }
            ]
          }
        ],
        source: { endpoint: "https://source.example/report", revision: "source-sha" }
      }
    }
  ]
});

for (const story of outcomeStories) {
  for (const format of Object.keys(reportFormats) as ReportFormat[]) {
    test(`${story.key} ${format} preserves the measured outcome and frozen retrieval`, () => {
      const svg = outcomeCard(frozen(story), story, format, "https://preview.example");
      const dimensions = reportFormats[format];
      assert.match(svg, new RegExp(`width="${dimensions.width}" height="${dimensions.height}"`));
      assert.ok(svg.includes(story.label));
      assert.ok(svg.includes(story.boundary));
      assert.ok(svg.includes("Some activity may be omitted."));
      assert.ok(svg.includes("Count may be capped · 2/3 days reported"));
      assert.ok(svg.includes("2026-10-20 — 2026-10-22 · UTC"));
      assert.ok(svg.includes("Snapshot frozen-outcome"));
      assert.ok(svg.includes("Source revision source-sha"));
      assert.ok(
        svg.includes(
          `https://preview.example/connections/?story=${story.key}&amp;report=frozen-outcome`
        )
      );
      assert.ok(svg.includes(story.measure.includes("seconds") ? "0h 0m 7s" : ">7</text>"));
      assert.ok(
        svg.includes(
          `Daily ${story.label.toLowerCase()}${story.measure.includes("seconds") ? " · seconds" : ""}`
        )
      );
      assert.match(svg, /<path data-day="2026-10-20" data-value="0"/);
      assert.doesNotMatch(svg, /data-day="2026-10-21"/);
      assert.match(svg, /<rect data-day="2026-10-22" data-value="7"/);
      assert.doesNotMatch(svg, /NaN|undefined|Infinity/);
    });
  }
}

test("missing evidence draws no positive bars, zero baseline or fictional daily trace", () => {
  const story = outcomeStories[0]!;
  const report = frozen(story);
  report.projects[0]!.report = null;
  const svg = outcomeCard(report, story, "landscape", "https://woodhouse.example");
  assert.match(svg, /Not measured/);
  assert.match(svg, /No data for these dates · 0\/3 days reported/);
  assert.match(svg, /Daily measurements unavailable/);
  assert.doesNotMatch(svg, /data-day=/);
});

test("a reported zero is a measured baseline mark in every format", () => {
  const story = outcomeStories[0]!;
  for (const format of Object.keys(reportFormats) as ReportFormat[]) {
    const svg = outcomeCard(frozen(story, 0), story, format, "https://woodhouse.example");
    assert.match(svg, /<path data-day="2026-10-22" data-value="0"/);
    assert.doesNotMatch(svg, /<rect data-day=/);
    assert.doesNotMatch(svg, /Daily measurements unavailable/);
  }
});

test("all dynamic labels escape XML and long definitions reflow within each composition", () => {
  const story = { ...outcomeStories[0]!, name: "Name <script>&\"'", title: "Title <xml>" };
  const report = frozen(story);
  report.projects[0]!.report!.metrics[0]!.definition =
    "Definitions <&> must stay readable even when they contain longer contract explanations. ".repeat(
      6
    );
  report.projects[0]!.report!.source.revision = "revision <&>";
  for (const format of Object.keys(reportFormats) as ReportFormat[]) {
    const svg = outcomeCard(report, story, format, "https://woodhouse.example");
    assert.match(svg, /Name &lt;script&gt;&amp;&quot;&apos;/);
    assert.match(svg, /Definitions &lt;&amp;&gt;/);
    assert.match(svg, /Source revision revision &lt;&amp;&gt;/);
    assert.doesNotMatch(svg, /<script>|<xml>/);
    const { height, width } = reportFormats[format];
    for (const match of svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)" font-size="([\d.]+)"/g)) {
      assert.ok(Number(match[1]) <= width, "text begins inside image");
      assert.ok(Number(match[2]) <= height, "text baseline stays inside image");
    }
  }
});

test("legacy snapshots use a retained source period before deriving a window", () => {
  const story = outcomeStories[0]!;
  const report = frozen(story);
  delete report.period;
  const svg = outcomeCard(report, story, "square", "https://woodhouse.example");
  assert.ok(svg.includes("2026-10-20 — 2026-10-22 · UTC"));
});

test("approved raster artwork embeds without admitting arbitrary image URLs or SVG data", () => {
  const story = outcomeStories[0]!;
  const report = frozen(story);
  const artwork = "data:image/jpeg;base64,QUJDRA==";
  for (const format of Object.keys(reportFormats) as ReportFormat[]) {
    const svg = outcomeCard(report, story, format, "https://woodhouse.example", artwork);
    assert.ok(svg.includes(`<image href="${artwork}"`));
    assert.match(svg, /published artwork<\/title>/);
  }
  for (const unsafe of [
    "https://outside.example/image.jpg",
    "data:image/svg+xml;base64,PHN2Zz4=",
    'data:image/jpeg;base64,abc" onload="alert(1)'
  ]) {
    assert.doesNotMatch(
      outcomeCard(report, story, "square", "https://woodhouse.example", unsafe),
      /<image/
    );
  }
});
