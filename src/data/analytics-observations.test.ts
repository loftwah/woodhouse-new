import test from "node:test";
import assert from "node:assert/strict";

import { analyticsObservations, type ObservationInput } from "./analytics-observations.ts";
import type { Metric } from "./portfolio-analytics.ts";
import {
  measureChoices,
  type DiscoveryReferral,
  type WeeklyHighlight
} from "./analytics-workbench.ts";

const window = { from: "2026-10-01", to: "2026-10-30", days: 30, complete: false };
const dateLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-AU", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric"
  });
const colours = {
  woodhouse: "#b4c0d2",
  bubbles: "#79d8ff",
  shoalshot: "#e9ff49",
  fighter: "#ff887e"
};

function metric(key: string, value: number | null, unit: Metric["unit"] = "count"): Metric {
  return {
    key,
    label: key,
    unit,
    value,
    definition: "",
    quality: value === null ? "unavailable" : "exact",
    daily: []
  };
}

function week(overrides: Partial<WeeklyHighlight> = {}): WeeklyHighlight {
  return {
    project: "bubbles",
    name: "Bubbles",
    family: "game",
    measure: measureChoices.find((choice) => choice.key === "active_seconds")!,
    unit: "seconds",
    from: "2026-10-06",
    to: "2026-10-12",
    value: 4200,
    previous: 3600,
    changePercent: 17,
    newBest: false,
    comparedWeeks: 3,
    ...overrides
  };
}

function referral(overrides: Partial<DiscoveryReferral> = {}): DiscoveryReferral {
  return {
    slug: "shoalshot",
    name: "SHOALSHOT",
    siteUrl: "https://shoalshot.loftwah.com",
    metric: metric("referral_shoalshot", 42),
    value: 42,
    recent: 21,
    prior: 14,
    recentFrom: "2026-10-24",
    recentTo: "2026-10-30",
    priorFrom: "2026-10-17",
    priorTo: "2026-10-23",
    recentCoverage: "observed",
    priorCoverage: "observed",
    priorObservedDays: 7,
    hasTrend: true,
    ...overrides
  };
}

function input(overrides: Partial<ObservationInput> = {}): ObservationInput {
  return {
    window,
    colours,
    weekly: [week()],
    discovery: [referral()],
    discoveryTotal: 42,
    rows: [
      {
        project: "woodhouse",
        name: "Woodhouse",
        defaultMeasure: "visits",
        data: {
          coverage: { startedAt: "2026-01-01", through: "2026-10-30", quality: "exact" },
          metrics: [metric("visits", 640), metric("engaged_sessions", 210)]
        }
      },
      {
        project: "bubbles",
        name: "Bubbles",
        defaultMeasure: "game_starts",
        data: {
          coverage: { startedAt: "2026-06-01", through: "2026-10-30", quality: "exact" },
          metrics: []
        }
      }
    ],
    links: {
      week: (project, measure, from) =>
        `/activity/?week=${from}&project=${project}&measure=${measure}`,
      project: (project, measure) => `/activity/?project=${project}&measure=${measure}`,
      discovery: () => "#discovery-heading"
    },
    dateLabel,
    ...overrides
  };
}

test("a complete week with a real comparison becomes the first observation", () => {
  const { observations } = analyticsObservations(input());
  assert.equal(observations[0]?.kind, "week");
  assert.equal(observations[0]?.figure, "1.2h");
  assert.match(observations[0]?.headline ?? "", /rose 17% to 1\.2h/);
  assert.match(observations[0]?.establishes ?? "", /1\.2h recorded, against 1h/);
  assert.match(observations[0]?.comparison ?? "", /Compared with the week before/);
  assert.match(observations[0]?.doesNotEstablish ?? "", /Why it changed/);
  assert.doesNotMatch(observations[0]?.headline ?? "", /caused|because/);
});

test("a week with no comparable baseline is not presented as a movement", () => {
  const { observations, notes } = analyticsObservations(
    input({ weekly: [week({ changePercent: null, comparedWeeks: 0 })] })
  );
  assert.equal(
    observations.some((observation) => observation.kind === "week"),
    false
  );
  assert.match(notes.find((note) => note.kind === "week")?.reason ?? "", /no earlier full week/i);
});

test("a new record leads the wording but still names the comparison set", () => {
  const { observations } = analyticsObservations(input({ weekly: [week({ newBest: true })] }));
  assert.match(observations[0]?.headline ?? "", /a new best across the 3 complete weeks/);
});

test("discovery counts clicks and refuses to claim downstream use", () => {
  const { observations } = analyticsObservations(input({ weekly: [] }));
  const discovery = observations.find((observation) => observation.kind === "discovery");
  assert.equal(discovery?.figure, "42");
  assert.equal(discovery?.unitLabel, "clicks from Woodhouse");
  assert.match(discovery?.comparison ?? "", /21 clicks in the last seven days, against 14/);
  assert.match(discovery?.doesNotEstablish ?? "", /not what happened next/);
});

test("a partial earlier week is reported as partial, not as a trend", () => {
  const { observations } = analyticsObservations(
    input({
      weekly: [],
      discovery: [
        referral({ hasTrend: false, priorCoverage: "partial", priorObservedDays: 3, prior: 0 })
      ]
    })
  );
  const discovery = observations.find((observation) => observation.kind === "discovery");
  assert.match(discovery?.comparison ?? "", /only 3 of 7/);
  assert.match(discovery?.comparison ?? "", /no comparison is claimed/);
});

test("a full ISO coverage timestamp is parsed as its UTC day, not an invalid date", () => {
  const { observations } = analyticsObservations(
    input({
      weekly: [],
      discovery: [],
      rows: [
        {
          project: "app-composer",
          name: "App Composer",
          defaultMeasure: "app_opens",
          data: {
            coverage: {
              startedAt: "2026-10-13T00:00:00.000Z",
              through: "2026-10-22T13:11:38.162Z",
              quality: "partial"
            },
            metrics: []
          }
        }
      ]
    })
  );
  const first = observations.find((observation) => observation.kind === "first");
  assert.equal(first?.figure, "10");
  assert.match(first?.period ?? "", /From 13 Oct 2026/);
  assert.equal(Number.isNaN(Number(first?.figure)), false);
});

test("new collection inside the window names the unrecorded days as missing, not zero", () => {
  const { observations } = analyticsObservations(
    input({
      weekly: [],
      discovery: [],
      discoveryTotal: 0,
      rows: [
        {
          project: "fighter",
          name: "Fighter",
          defaultMeasure: "game_starts",
          data: {
            coverage: { startedAt: "2026-10-20", through: "2026-10-30", quality: "exact" },
            metrics: []
          }
        }
      ]
    })
  );
  const first = observations.find((observation) => observation.kind === "first");
  assert.equal(first?.figure, "11");
  assert.match(first?.establishes ?? "", /missing, not zero/);
  assert.match(first?.doesNotEstablish ?? "", /unused before then/);
});

test("Woodhouse's own audience is reported with its engagement context", () => {
  const { observations } = analyticsObservations(input({ weekly: [], discovery: [] }));
  const audience = observations.find((observation) => observation.kind === "audience");
  assert.equal(audience?.figure, "640");
  assert.equal(audience?.unitLabel, "visits");
  assert.match(audience?.headline ?? "", /210 that lasted 10 seconds or more/);
  assert.match(audience?.doesNotEstablish ?? "", /How many people/);
});

test("missing sources produce reasons rather than an invented finding", () => {
  const { observations, emptyReason } = analyticsObservations(
    input({
      weekly: [],
      discovery: [],
      discoveryTotal: null,
      rows: [
        {
          project: "woodhouse",
          name: "Woodhouse",
          defaultMeasure: "visits",
          data: {
            coverage: { startedAt: "2026-01-01", through: "2026-10-30", quality: "unavailable" },
            metrics: [metric("visits", null)]
          }
        }
      ]
    })
  );
  assert.equal(observations.length, 0);
  assert.match(emptyReason ?? "", /before-and-after claim/);
});

test("a complete week outside the selected dates is not presented as a finding", () => {
  const { observations, notes } = analyticsObservations(
    input({
      window: { from: "2026-10-17", to: "2026-10-23", days: 7, complete: false },
      discovery: [],
      weekly: [week({ from: "2026-10-06", to: "2026-10-12" })]
    })
  );
  assert.equal(
    observations.some((observation) => observation.kind === "week"),
    false
  );
  assert.match(notes.find((note) => note.kind === "week")?.reason ?? "", /outside these dates/);
});

test("a seven-day window explains that two weeks are needed, not that history is missing", () => {
  const { observations } = analyticsObservations(
    input({
      window: { from: "2026-10-17", to: "2026-10-23", days: 7, complete: false },
      weekly: [],
      discovery: [referral({ hasTrend: false, priorCoverage: "unavailable" })]
    })
  );
  const discovery = observations.find((observation) => observation.kind === "discovery");
  assert.match(discovery?.comparison ?? "", /shorter than the two weeks needed to compare/);
  assert.equal(/No earlier counted week/.test(discovery?.comparison ?? ""), false);
});

test("the day count stops at the window end, not at the capture time", () => {
  const { observations } = analyticsObservations(
    input({
      window: { from: "2026-09-01", to: "2026-09-07", days: 7, complete: true },
      weekly: [],
      discovery: [],
      rows: [
        {
          project: "fighter",
          name: "Fighter",
          defaultMeasure: "game_starts",
          data: {
            coverage: {
              startedAt: "2026-09-05T00:00:00.000Z",
              through: "2026-10-23T09:00:00.000Z",
              quality: "exact"
            },
            metrics: []
          }
        }
      ]
    })
  );
  const first = observations.find((observation) => observation.kind === "first");
  assert.equal(first?.figure, "3", "5–7 September is three recorded days, not fifty");
});

test("the largest movement leads, not the first project in report order", () => {
  const { observations } = analyticsObservations(
    input({
      discovery: [],
      weekly: [
        week({ project: "bubbles", name: "Bubbles", changePercent: 4 }),
        week({ project: "shoalshot", name: "SHOALSHOT", changePercent: -63 })
      ]
    })
  );
  assert.match(observations[0]?.headline ?? "", /SHOALSHOT's active play time fell 63%/);
});

test("the opening holds at most three observations", () => {
  const { observations } = analyticsObservations(
    input({
      rows: [
        {
          project: "woodhouse",
          name: "Woodhouse",
          defaultMeasure: "visits",
          data: {
            coverage: { startedAt: "2026-01-01", through: "2026-10-30", quality: "exact" },
            metrics: [metric("visits", 640), metric("engaged_sessions", 210)]
          }
        },
        {
          project: "fighter",
          name: "Fighter",
          defaultMeasure: "game_starts",
          data: {
            coverage: { startedAt: "2026-10-20", through: "2026-10-30", quality: "exact" },
            metrics: []
          }
        }
      ]
    })
  );
  assert.equal(observations.length, 3);
  assert.deepEqual(
    observations.map((observation) => observation.kind),
    ["week", "discovery", "first"]
  );
});

test("links carry the week and the project so a shared finding keeps its context", () => {
  const { observations } = analyticsObservations(input());
  assert.equal(
    observations[0]?.href,
    "/activity/?week=2026-10-06&project=bubbles&measure=active_seconds"
  );
});

test("the opening uses ordinary language and names a comparison or its absence", () => {
  const { observations } = analyticsObservations(input());
  for (const observation of observations) {
    assert.ok(observation.comparison.length > 0, `${observation.kind} has no comparison note`);
    assert.doesNotMatch(
      `${observation.headline} ${observation.establishes} ${observation.comparison}`,
      /Legacy\/test risk|Bounded count|Partial coverage|coverage denominator|source-qualified|scope reconciliation|measurement contract/i
    );
  }
});
