import assert from "node:assert/strict";
import test from "node:test";
import type { EditorialDispatch } from "../content/repository.ts";
import type { PortfolioReport, ProjectAnalytics } from "./portfolio-analytics.ts";
import { portfolioEdition, editionSelections, editionCaption } from "./portfolio-edition.ts";
import { editionCard } from "./edition-card.ts";
import { reportFormats, type ReportFormat } from "./portfolio-card.ts";

const id = "8496128e32ddfd0bddf8da66";
const dispatch = (href = `/editions/one-more-round/?report=${id}`): EditorialDispatch => ({
  slug: "one-more-round",
  title: "One more round.",
  kind: "Portfolio report",
  deck: "Four different invitations to play.",
  reviewDate: "2026-10-23",
  sourceReference: "Public aggregate contracts.",
  lead: "Choose your next round.",
  lesson: "An observation is not a record.",
  featuredImage: null,
  publishedAt: "2026-10-23T00:00:00Z",
  updatedAt: null,
  content: [
    {
      _type: "prose",
      _key: "pin",
      _version: 1,
      content: [
        {
          _type: "block",
          _key: "edition-link",
          style: "normal",
          children: [{ _type: "span", text: "Open edition", marks: ["edition"] }],
          markDefs: [{ _type: "link", _key: "edition", href }]
        }
      ]
    }
  ]
});
const period = { from: "2026-10-12", to: "2026-10-18", days: 7, complete: true };
function gameSource(
  project: "protocol-11" | "shoalshot",
  metrics: ProjectAnalytics["metrics"]
): ProjectAnalytics {
  return {
    schema: "woodhouse.portfolio-analytics/1",
    project,
    generatedAt: "2026-10-23T00:00:00Z",
    timezone: "UTC",
    period,
    coverage: {
      startedAt: "2026-10-16T00:00:00Z",
      comparableFrom: "2026-10-16T00:00:00Z",
      through: "2026-10-23T00:00:00Z",
      quality: "partial",
      limitations: ["Partial collection."]
    },
    metrics,
    source: { endpoint: "https://woodhouse.loftwah.com/api/portfolio-analytics", revision: null }
  };
}
function report(): PortfolioReport {
  return {
    schema: "woodhouse.portfolio-report/1",
    id,
    createdAt: "2026-10-23T00:00:00Z",
    days: 7,
    period,
    projects: [
      {
        project: "protocol-11",
        report: gameSource("protocol-11", [
          {
            key: "active_seconds_classic",
            label: "Classic active play",
            unit: "seconds",
            value: 94,
            quality: "partial",
            definition: "Classic foreground play only.",
            daily: [
              { date: "2026-10-16", value: 0 },
              { date: "2026-10-18", value: 94 }
            ]
          },
          {
            key: "active_seconds",
            label: "All active play",
            unit: "seconds",
            value: 999,
            quality: "exact",
            definition: "All modes.",
            daily: [{ date: "2026-10-18", value: 999 }]
          }
        ])
      },
      {
        project: "shoalshot",
        report: gameSource("shoalshot", [
          {
            key: "game_completions",
            label: "Completed runs",
            unit: "count",
            value: 0,
            quality: "exact",
            definition: "Terminal results.",
            daily: [{ date: "2026-10-18", value: 0 }]
          }
        ])
      }
    ]
  };
}

test("edition publication requires the existing dispatch kind, identity and exact frozen link", () => {
  assert.equal(portfolioEdition([]), null);
  assert.equal(
    portfolioEdition([{ ...dispatch(), kind: "Dispatch" as EditorialDispatch["kind"] }]),
    null
  );
  assert.equal(portfolioEdition([{ ...dispatch(), slug: "other-edition" }]), null);
  for (const href of [
    "https://outside.example/editions/one-more-round/?report=" + id,
    "/editions/one-more-round/?report=invalid",
    "/editions/one-more-round/?report=" + id + "&story=fighter",
    "/editions/one-more-round/?report=" + id + "#unreviewed"
  ])
    assert.equal(portfolioEdition([dispatch(href)]), null);
  const edition = portfolioEdition([dispatch()])!;
  assert.equal(edition.reportId, id);
  assert.equal(edition.reviewDate, "2026-10-23");
  assert.equal(edition.href, `/editions/one-more-round/?report=${id}`);
});

test("edition selections preserve admission, mode scope, missing history and a measured zero", () => {
  const selected = editionSelections(report(), new Set(["protocol-11", "shoalshot"]));
  assert.deepEqual(
    selected.map((s) => s.story.key),
    ["protocol-11", "shoalshot"]
  );
  assert.equal(selected[0]!.evidence.display, "0h 1m 34s");
  assert.equal(selected[0]!.evidence.definition, "Classic foreground play only.");
  assert.equal(selected[0]!.evidence.daily[0]!.value, null);
  assert.equal(selected[0]!.evidence.daily[4]!.value, 0);
  assert.equal(selected[1]!.evidence.value, 0);
  assert.equal(selected[1]!.evidence.display, "0");
  assert.equal(editionSelections(report(), new Set()).length, 0);
  const missing = report();
  missing.projects[0]!.report!.metrics = missing.projects[0]!.report!.metrics.filter(
    (m) => m.key !== "active_seconds_classic"
  );
  const evidence = editionSelections(missing, new Set(["protocol-11"]))[0]!.evidence;
  assert.equal(evidence.value, null);
  assert.equal(evidence.display, "Not measured");
  assert.ok(evidence.daily.every((d) => d.value === null));
});

test("caption binds the edition pin and rejects a different frozen snapshot", () => {
  const edition = portfolioEdition([dispatch()])!;
  const caption = editionCaption(edition, report(), "https://preview.example");
  assert.ok(caption.includes("2026-10-12 to 2026-10-18 UTC"));
  assert.ok(caption.includes("no weekly record or causal claim"));
  assert.ok(caption.includes("https://preview.example/editions/one-more-round/?report=" + id));
  assert.ok(caption.includes("0h 1m 34s"));
  assert.ok(!caption.includes("999"));
  assert.throws(
    () => editionCaption(edition, { ...report(), id: "a".repeat(24) }),
    /snapshot mismatch/
  );
});

for (const format of Object.keys(reportFormats) as ReportFormat[]) {
  test(`${format} edition composition preserves selected measures, provenance and XML escaping`, () => {
    const edition = {
      ...portfolioEdition([dispatch()])!,
      title: "One <script>&\"'",
      deck: "Deck <unsafe>"
    };
    const svg = editionCard(
      edition,
      report(),
      format,
      "https://preview.example",
      new Map(),
      new Set(["protocol-11", "shoalshot"])
    );
    const { width, height } = reportFormats[format];
    assert.ok(svg.includes(`width="${width}" height="${height}"`));
    assert.ok(svg.includes("One &lt;script&gt;&amp;&quot;&apos;"));
    assert.ok(svg.includes("Deck &lt;unsafe&gt;"));
    assert.doesNotMatch(svg, /<script>|<unsafe>|NaN|undefined|Infinity/);
    assert.ok(svg.includes("Protocol 11: 0h 1m 34s"));
    assert.ok(svg.includes("SHOALSHOT: 0"));
    assert.ok(!svg.includes("Bubbles:"));
    assert.ok(!svg.includes("Fighter:"));
    assert.ok(!svg.includes("999"));
    assert.ok(svg.includes("2026-10-12–2026-10-18 UTC"));
    assert.ok(svg.includes("snapshot " + id));
    assert.ok(svg.includes("No weekly record."));
    for (const match of svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"/g)) {
      assert.ok(Number(match[1]) <= width);
      assert.ok(Number(match[2]) <= height);
    }
    assert.throws(
      () =>
        editionCard(
          edition,
          { ...report(), id: "b".repeat(24) },
          format,
          "https://preview.example",
          new Map(),
          new Set()
        ),
      /snapshot mismatch/
    );
  });
}
