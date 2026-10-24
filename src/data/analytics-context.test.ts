import test from "node:test";
import assert from "node:assert/strict";
import {
  releaseNotesFromEvidence,
  parseReportReleases,
  activityTimeline,
  browserReturnSignals
} from "./analytics-context.ts";
import {
  discoveryProjects,
  type PortfolioReport,
  type ProjectAnalytics
} from "./portfolio-analytics.ts";
const now = Date.parse("2026-10-18T01:00:00Z");
const members = new Set(["fighter", "woodhouse"]);
const evidence = (extra: Record<string, unknown> = {}) => ({
  id: "fighter-release",
  data: {
    project_key: "fighter",
    public_safe: true,
    evidence_state: "reviewed",
    evidence_kind: "production verification",
    occurred_at: "2026-10-16",
    reviewed_at: "2026-10-17",
    title: "Fighter release",
    summary: "A reviewed release observation.",
    proof_boundary: "Browser evidence; no physical proof.",
    revision: "abc123",
    ...extra
  }
});
const source = {
  coverage: {
    startedAt: "2026-10-15T12:00:00Z",
    comparableFrom: "2026-10-16T00:00:00Z",
    through: "2026-10-18T01:00:00Z",
    quality: "partial",
    limitations: ["Only opted-in browsers are observed."]
  },
  metrics: [
    { key: "browsers", value: 0, definition: "Optional identifiers only.", daily: [] },
    {
      key: "returning_browsers",
      value: 0,
      definition: "Earlier different tab session in retained history.",
      daily: []
    }
  ]
} as unknown as ProjectAnalytics;
const report = {
  schema: "woodhouse.portfolio-report/1",
  id: "a".repeat(24),
  createdAt: new Date(now).toISOString(),
  days: 7,
  period: { from: "2026-10-12", to: "2026-10-18", days: 7, complete: false },
  projects: [{ project: "fighter", report: source }]
} as PortfolioReport;

test("discovery's shared admitted subset stays inside the seven-product measurement scope", () => {
  assert.deepEqual(discoveryProjects, [
    "app-composer",
    "fighter",
    "shoalshot",
    "protocol-11",
    "loftwahfm",
    "bubbles"
  ]);
});

test("release context uses only dated reviewed public production evidence for report members", () => {
  const notes = releaseNotesFromEvidence(
    [
      evidence(),
      evidence({ public_safe: false }),
      evidence({ project_key: "pirates" }),
      evidence({ evidence_kind: "implementation" }),
      evidence({ evidence_state: "reported" }),
      evidence({ occurred_at: "2026-10-20" }),
      evidence({ reviewed_at: "2026-10-20" })
    ],
    members,
    now
  );
  assert.equal(notes.length, 1);
  assert.equal(notes[0]!.date, "2026-10-16");
  assert.equal(notes[0]!.reviewedAt, "2026-10-17");
  assert.equal(notes[0]!.evidenceId, "fighter-release");
  assert.equal(notes[0]!.boundary, "Browser evidence; no physical proof.");
  assert.equal(
    releaseNotesFromEvidence([evidence({ occurred_at: undefined })], members, now).length,
    0,
    "a review date must not become an invented release date"
  );
  assert.equal(parseReportReleases([{ ...notes[0], project: "pirates" }], members, now), undefined);
  assert.equal(
    parseReportReleases([{ ...notes[0], evidenceId: "../private" }], members, now),
    undefined
  );
  assert.equal(
    parseReportReleases([{ ...notes[0], summary: "<script>" }], members, now),
    undefined
  );
  assert.deepEqual(parseReportReleases(notes, members, now), notes);
});

test("history keeps release observations separate from collection and comparison cutovers", () => {
  const releases = releaseNotesFromEvidence([evidence()], members, now);
  const timeline = activityTimeline({ ...report, releases });
  assert.deepEqual(
    timeline.map((n) => [n.kind, n.date]),
    [
      ["comparison", "2026-10-16"],
      ["release", "2026-10-16"],
      ["collection", "2026-10-15"]
    ]
  );
  assert.match(
    timeline.find((n) => n.kind === "comparison")!.detail,
    /boundary day itself is left out/
  );
  assert.match(timeline.find((n) => n.kind === "release")!.detail, /physical/);
  assert.equal(
    activityTimeline({ ...report, period: { ...report.period!, to: "2026-10-15" } }).some(
      (n) => n.kind === "release"
    ),
    false,
    "a historical window cannot borrow a later release"
  );
});

test("browser-return context preserves real zero, missing source, and exact source-owned gaps", () => {
  const rows = browserReturnSignals({
    ...report,
    projects: [
      ...report.projects,
      {
        project: "woodhouse",
        report: { ...source, metrics: source.metrics.map((m) => ({ ...m, value: null })) }
      },
      { project: "shoalshot", report: null }
    ]
  });
  assert.equal(rows[0]!.value, 0);
  assert.equal(rows[0]!.browsers, 0);
  assert.match(rows[0]!.definition, /Earlier different tab session/);
  assert.equal(rows[1]!.value, null);
  assert.match(rows[1]!.gap!, /Only opted-in/);
  assert.equal(rows[2]!.value, null);
  assert.match(rows[2]!.gap!, /source report is unavailable/);
  const missing = browserReturnSignals({
    ...report,
    projects: [{ project: "fighter", report: { ...source, metrics: [] } }]
  });
  assert.match(missing[0]!.gap!, /does not report browser returns/);
});

test("Melbourne review dates do not become future reviews before UTC midnight", () => {
  const capturedAt = Date.parse("2026-10-17T22:00:00Z");
  const notes = releaseNotesFromEvidence(
    [evidence({ occurred_at: "2026-10-17", reviewed_at: "2026-10-18" })],
    members,
    capturedAt
  );
  assert.equal(notes.length, 1);
  assert.equal(notes[0]!.date, "2026-10-17", "the observed source date stays unchanged");
  assert.equal(notes[0]!.reviewedAt, "2026-10-18");
  assert.deepEqual(parseReportReleases(notes, members, capturedAt), notes);
  assert.equal(
    parseReportReleases([{ ...notes[0], reviewedAt: "2026-10-19" }], members, capturedAt),
    undefined,
    "a genuinely future Melbourne review remains rejected"
  );
});

test("the review gate follows Melbourne midnight across daylight saving", () => {
  for (const [before, after, reviewedAt] of [
    ["2026-10-17T12:59:59Z", "2026-10-17T13:00:00Z", "2026-10-18"],
    ["2026-06-17T13:59:59Z", "2026-06-17T14:00:00Z", "2026-06-18"]
  ]) {
    const entry = evidence({ occurred_at: reviewedAt, reviewed_at: reviewedAt });
    assert.deepEqual(releaseNotesFromEvidence([entry], members, Date.parse(before!)), []);
    assert.equal(releaseNotesFromEvidence([entry], members, Date.parse(after!)).length, 1);
  }
});
