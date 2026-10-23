import { createAnalyticsScheduledHandler, analyticsCron } from "./analytics-schedule.ts";
import { createPublicationScheduledHandler } from "./publication-policy.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { collectEngagement, localAnalytics } from "./engagement.ts";
import {
  parseProjectAnalytics,
  analysePortfolio,
  weeklyRecord,
  analyticsSchema,
  parseReportingWindow,
  type Metric,
  type ProjectAnalytics
} from "./portfolio-analytics.ts";
import { readPortfolioReport, createPortfolioReport, projectReport } from "./portfolio-reports.ts";
import { dateDays } from "./analytics-workbench.ts";
import { reportSvg, reportFormats } from "./portfolio-card.ts";
import { loadStoryDistribution } from "./story-distribution.ts";
function database(modeRollup = true) {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync("migrations/0001-portfolio-analytics.sql", "utf8"));
  sqlite.exec(readFileSync("migrations/0002-analytics-browser-returns.sql", "utf8"));
  // `false` reproduces the state before the mode split existed, which is what a
  // migration that adds a durable counter has to be tested against.
  if (modeRollup) sqlite.exec(readFileSync("migrations/0003-analytics-mode-rollup.sql", "utf8"));
  const db = {
    prepare(sql: string) {
      let values: unknown[] = [];
      const p = {
        bind(...v: unknown[]) {
          values = v;
          return p;
        },
        async first() {
          return sqlite.prepare(sql).get(...(values as (string | number | null)[])) ?? null;
        },
        async all() {
          return {
            results: sqlite.prepare(sql).all(...(values as (string | number | null)[])),
            success: true
          };
        },
        async run() {
          return sqlite.prepare(sql).run(...(values as (string | number | null)[]));
        }
      };
      return p;
    },
    async batch(statements: { run: () => Promise<unknown> }[]) {
      sqlite.exec("BEGIN");
      try {
        const result = [];
        for (const s of statements) result.push(await s.run());
        sqlite.exec("COMMIT");
        return result;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    }
  };
  return { db: db as unknown as D1Database, sqlite };
}
const now = Date.parse("2026-10-15T12:00:00Z"),
  session = "11223344-1122-4333-8444-112233445566";
const payload = (event = "game_start", extra = {}) => ({
  schema: "woodhouse.engagement/1",
  project: "shoalshot",
  eventId: crypto.randomUUID(),
  sessionId: session,
  event,
  mode: "dive",
  ...extra
});
function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://woodhouse.loftwah.com/api/engagement", {
    method: "POST",
    headers: {
      origin: "https://shoalshot.loftwah.com",
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0",
      "cf-connecting-ip": "192.0.2.1",
      ...headers
    },
    body: JSON.stringify(body)
  });
}
test("real SQLite ingestion deduplicates exact game events and retains daily totals", async () => {
  const { db, sqlite } = database();
  const event = payload();
  assert.equal((await collectEngagement(request(event), db, now)).status, 204);
  await collectEngagement(request(event), db, now + 1000);
  let report = await localAnalytics(db, "shoalshot", 7, now + 1000);
  assert.equal(report.metrics.find((m) => m.key === "game_starts")?.value, 1);
  sqlite.exec("DELETE FROM wh_analytics_events;DELETE FROM wh_analytics_sessions");
  report = await localAnalytics(db, "shoalshot", 7, now + 2000);
  assert.equal(report.metrics.find((m) => m.key === "game_starts")?.value, 1);
  assert.equal(report.metrics.find((m) => m.key === "returning_browsers")?.value, null);
  assert.equal(parseProjectAnalytics(report, "shoalshot", 7, now + 2000)?.project, "shoalshot");
});
test("session markers count once across different event ids, active seconds cannot outrun server time", async () => {
  const { db } = database();
  await collectEngagement(request(payload("visit")), db, now);
  await collectEngagement(request(payload("visit")), db, now + 1000);
  await collectEngagement(request(payload("active_time", { seconds: 30 })), db, now + 5000);
  let report = await localAnalytics(db, "shoalshot", 7, now + 5000);
  assert.equal(report.metrics.find((m) => m.key === "visits")?.value, 1);
  assert.equal(report.metrics.find((m) => m.key === "active_seconds")?.value, 0);
  const tick = payload("active_time", { seconds: 20 });
  await collectEngagement(request(tick), db, now + 21000);
  await collectEngagement(request(tick), db, now + 22000);
  report = await localAnalytics(db, "shoalshot", 7, now + 22000);
  assert.equal(report.metrics.find((m) => m.key === "active_seconds")?.value, 20);
});
test("privacy, QA, invalid origin and malformed payloads never increment", async () => {
  const { db, sqlite } = database();
  for (const h of [
    { dnt: "1" },
    { "sec-gpc": "1" },
    { "x-analytics-test": "1" },
    { "user-agent": "Playwright headless" }
  ]) {
    assert.equal((await collectEngagement(request(payload(), h), db, now)).status, 204);
  }
  assert.equal(
    (await collectEngagement(request(payload(), { origin: "https://attacker.example" }), db, now))
      .status,
    403
  );
  assert.equal(
    (await collectEngagement(request({ ...payload(), email: "private@example.test" }), db, now))
      .status,
    400
  );
  assert.equal(
    (await collectEngagement(request(payload("active_time", { seconds: 31 })), db, now)).status,
    400
  );
  assert.equal(
    (await collectEngagement(request(payload("visit", { mode: "private@example.test" })), db, now))
      .status,
    400
  );
  for (const project of ["constructor", "__proto__", "toString"])
    assert.equal(
      (await collectEngagement(request({ ...payload(), project }), db, now)).status,
      400
    );
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM wh_analytics_events").get()?.n, 0);
  assert.equal((await localAnalytics(db, "shoalshot", 7, now)).coverage.startedAt, null);
});
test("source parser rejects future, duplicate days and identifiers, projects only safe contract", async () => {
  const { db } = database();
  await collectEngagement(request(payload()), db, now);
  const report = await localAnalytics(db, "shoalshot", 7, now);
  assert.equal(
    parseProjectAnalytics({ ...report, generatedAt: "2030-01-01T00:00:00Z" }, "shoalshot", 7, now),
    null
  );
  const bad = structuredClone(report);
  bad.metrics[0]!.daily.push({ ...bad.metrics[0]!.daily[0]! });
  assert.equal(parseProjectAnalytics(bad, "shoalshot", 7, now), null);
  assert.equal(
    parseProjectAnalytics(
      { ...report, coverage: { ...report.coverage, startedAt: "2030-01-01T00:00:00Z" } },
      "shoalshot",
      7,
      now
    ),
    null
  );
  const impossibleQuality = structuredClone(report);
  impossibleQuality.metrics[0]!.quality = "unavailable";
  impossibleQuality.metrics[0]!.value = 1;
  assert.equal(parseProjectAnalytics(impossibleQuality, "shoalshot", 7, now), null);
  const clean = parseProjectAnalytics(
    { ...report, privateUserId: "hidden", rawEvents: ["hidden"] },
    "shoalshot",
    7,
    now
  );
  assert(clean);
  assert(!JSON.stringify(clean).includes("hidden"));
  assert.equal(clean.schema, analyticsSchema);
});
test("records require two full exact equivalent weeks, never current or missing days", () => {
  const daily = [];
  for (let t = Date.parse("2026-09-14"); t <= Date.parse("2026-10-15"); t += 86400000) {
    const date = new Date(t).toISOString().slice(0, 10);
    daily.push({ date, value: date >= "2026-10-05" && date <= "2026-10-11" ? 3 : 1 });
  }
  const metric: Metric = {
    key: "game_starts",
    label: "Starts",
    unit: "count",
    value: 0,
    quality: "exact",
    definition: "test",
    daily
  };
  const coverage = {
    startedAt: "2026-09-14T12:00:00Z",
    comparableFrom: "2026-09-14T12:00:00Z",
    through: "2026-10-15T12:00:00Z",
    quality: "exact" as const,
    limitations: []
  };
  assert.equal(weeklyRecord(metric, coverage, now)?.newBest, true);
  assert.equal(weeklyRecord(metric, coverage, now)?.value, 21);
  assert.equal(
    weeklyRecord({ ...metric, daily: daily.filter((d) => d.date !== "2026-10-05") }, coverage, now),
    null
  );
  assert.equal(weeklyRecord({ ...metric, quality: "bounded" }, coverage, now), null);
  assert.equal(weeklyRecord({ ...metric, key: "browsers" }, coverage, now), null);
  assert.equal(weeklyRecord(metric, { ...coverage, comparableFrom: null }, now), null);
  assert.equal(weeklyRecord(metric, { ...coverage, comparableFrom: "2026-10-15" }, now), null);
  assert.equal(
    weeklyRecord({ ...metric, daily: daily.filter((d) => d.date >= "2026-10-05") }, coverage, now),
    null
  );
});
test("weekly analysis catches a genuine fall to zero without inventing causes or small-number alerts", () => {
  const daily = [];
  for (let t = Date.parse("2026-09-21"); t <= Date.parse("2026-10-15"); t += 86400000) {
    const date = new Date(t).toISOString().slice(0, 10);
    daily.push({ date, value: date >= "2026-10-05" && date <= "2026-10-11" ? 0 : 10 });
  }
  const data: ProjectAnalytics = {
    schema: analyticsSchema,
    project: "fighter",
    generatedAt: new Date(now).toISOString(),
    timezone: "UTC",
    period: { from: "2026-09-16", to: "2026-10-15", days: 30, complete: false },
    coverage: {
      startedAt: "2026-09-20",
      comparableFrom: "2026-09-20",
      through: new Date(now).toISOString(),
      quality: "exact",
      limitations: []
    },
    metrics: [
      {
        key: "game_starts",
        label: "Fight starts",
        unit: "count",
        value: 180,
        quality: "exact",
        definition: "Received starts",
        daily
      }
    ],
    source: {
      endpoint: "https://fighter.loftwah.com/api/portfolio-analytics",
      revision: "a".repeat(40)
    }
  };
  const projects = [{ project: "fighter" as const, report: data }];
  const analysis = analysePortfolio(projects, now);
  assert.equal(analysis.findings.length, 1);
  assert.equal(analysis.findings[0]?.changePercent, -100);
  assert.equal(analysis.findings[0]?.value, 0);
  assert.equal(analysis.findings[0]?.previous, 70);
  assert.equal(analysis.findings[0]?.newBest, false);
  assert.match(analysis.findings[0]!.nextAction, /Check collection health/);
  const partial = structuredClone(projects);
  partial[0]!.report.coverage.quality = "partial";
  assert.equal(analysePortfolio(partial, now).findings.length, 1);
  const sampled = structuredClone(projects);
  sampled[0]!.report.metrics[0]!.quality = "sampled";
  assert.deepEqual(analysePortfolio(sampled, now).findings, []);
  const missing = structuredClone(projects);
  missing[0]!.report.metrics[0]!.daily = daily.filter((d) => d.date !== "2026-10-05");
  assert.deepEqual(analysePortfolio(missing, now).findings, []);
  const small = structuredClone(projects);
  small[0]!.report.metrics[0]!.daily = daily.map((d) => ({ ...d, value: d.value ? 1 : 0 }));
  assert.deepEqual(analysePortfolio(small, now).findings, []);
  for (const [previous, latest, expected] of [
    [201, 251, 0],
    [201, 151, 0],
    [200, 250, 1],
    [200, 150, 1]
  ]) {
    const boundary = structuredClone(projects);
    boundary[0]!.report.metrics[0]!.daily = daily.map((d) => ({
      ...d,
      value: d.date === "2026-09-28" ? previous! : d.date === "2026-10-05" ? latest! : 0
    }));
    assert.equal(analysePortfolio(boundary, now).findings.length, expected);
  }
  const view = projectReport(
    {
      schema: "woodhouse.portfolio-report/1",
      id: "a".repeat(24),
      createdAt: new Date(now).toISOString(),
      days: 30,
      projects,
      analysis
    },
    null,
    new Set(["woodhouse"])
  );
  assert.deepEqual(view.projects, []);
  assert.deepEqual(view.analysis?.findings, []);
});
test("custom UTC windows validate real dates and keep separate same-length snapshots", async () => {
  for (const query of [
    "from=2026-02-29&to=2026-03-02",
    "from=2026-10-16&to=2026-10-16",
    "from=2026-10-02",
    "from=2026-10-03&to=2026-10-02",
    "days=7&from=2026-10-01&to=2026-10-02",
    "from=2026-10-01&from=2026-10-02&to=2026-10-03",
    "from=2026-01-01&to=2026-10-01"
  ])
    assert.equal(parseReportingWindow(new URLSearchParams(query), now), null);
  const one = parseReportingWindow(new URLSearchParams("from=2026-10-01&to=2026-10-01"), now)!;
  const two = parseReportingWindow(new URLSearchParams("from=2026-10-03&to=2026-10-03"), now)!;
  assert.equal(one.complete, true);
  const emptyDb = database().db;
  const emptyFirst = await createPortfolioReport(emptyDb, 1, new Set(), fetch, now, one);
  const emptySecond = await createPortfolioReport(emptyDb, 1, new Set(), fetch, now, two);
  assert.notEqual(
    emptyFirst.id,
    emptySecond.id,
    "Missing sources must not collide across same-length windows at the same instant"
  );
  assert.equal((await readPortfolioReport(emptyDb, emptySecond.id))?.period?.from, two.from);
  const { db } = database();
  await collectEngagement(request(payload()), db, Date.parse("2026-10-01T12:00:00Z"));
  await collectEngagement(request(payload()), db, Date.parse("2026-10-03T12:00:00Z"));
  const first = await createPortfolioReport(db, 1, new Set(["shoalshot"]), fetch, now, one);
  const second = await createPortfolioReport(db, 1, new Set(["shoalshot"]), fetch, now + 100, two);
  assert.notEqual(first.id, second.id);
  assert.equal((await readPortfolioReport(db, first.id))?.period?.from, "2026-10-01");
  assert.equal((await readPortfolioReport(db, second.id))?.period?.from, "2026-10-03");
  assert.equal(first.projects[0]?.report?.metrics.find((m) => m.key === "game_starts")?.value, 1);
  const before = parseReportingWindow(new URLSearchParams("from=2026-09-01&to=2026-09-02"), now)!;
  const unavailable = await localAnalytics(db, "shoalshot", before.days, now, before);
  assert(unavailable.metrics.every((m) => m.value === null));
  assert(parseProjectAnalytics(unavailable, "shoalshot", before.days, now, before));
});
test("saved report stays immutable after new ingestion and emits three true image sizes", async () => {
  const { db, sqlite } = database();
  await collectEngagement(request(payload()), db, now);
  const report = await createPortfolioReport(db, 7, new Set(["shoalshot"]), fetch, now);
  await collectEngagement(request(payload()), db, now + 1000);
  const frozen = await readPortfolioReport(db, report.id);
  assert.equal(frozen?.projects[0]?.report?.metrics.find((m) => m.key === "game_starts")?.value, 1);
  assert.deepEqual(frozen?.analysis, { schema: "woodhouse.weekly-analysis/1", findings: [] });
  sqlite.prepare("UPDATE wh_analytics_reports SET body=? WHERE id=?").run(
    JSON.stringify({
      ...report,
      privateUserId: "private-marker",
      analysis: { schema: "woodhouse.weekly-analysis/1", findings: [{ label: "private-marker" }] }
    }),
    report.id
  );
  assert(!JSON.stringify(await readPortfolioReport(db, report.id)).includes("private-marker"));
  for (const format of Object.keys(reportFormats) as (keyof typeof reportFormats)[]) {
    const svg = reportSvg(report, new Map([["shoalshot", "SHOALSHOT"]]), format);
    assert(svg.includes(`width="${reportFormats[format].width}"`));
    assert(svg.includes("1"));
    assert(!svg.includes(session));
  }
});

test("a stored history block is validated before it can be compared", async () => {
  const { db, sqlite } = database();
  await collectEngagement(request(payload()), db, now);
  const report = await createPortfolioReport(db, 7, new Set(["shoalshot"]), fetch, now);
  const stored = await readPortfolioReport(db, report.id);
  // A seven-day report keeps a lookback, so its comparison survives freezing.
  assert(stored?.history, "the short report retains comparison history");
  assert.equal(stored?.history?.to, stored?.period?.to);
  assert(stored!.history!.from < stored!.history!.to);
  assert(stored!.history!.entries.length > 0);
  for (const entry of stored!.history!.entries) {
    assert(entry.daily.every((point) => point.date >= stored!.history!.from));
    assert(entry.daily.every((point) => point.date <= stored!.history!.to));
  }
  const tamper = (body: unknown) =>
    sqlite
      .prepare("UPDATE wh_analytics_reports SET body=? WHERE id=?")
      .run(typeof body === "string" ? body : JSON.stringify(body), report.id);
  // A future day, a duplicate day, an unknown project and an out-of-range span
  // are each refused rather than trusted.
  for (const bad of [
    { ...stored, history: { ...stored!.history!, to: "2030-01-01" } },
    {
      ...stored,
      history: {
        ...stored!.history!,
        entries: [
          {
            ...stored!.history!.entries[0]!,
            daily: [stored!.history!.entries[0]!.daily[0]!, stored!.history!.entries[0]!.daily[0]!]
          }
        ]
      }
    },
    {
      ...stored,
      history: {
        ...stored!.history!,
        entries: [{ ...stored!.history!.entries[0]!, project: "unknown-project" }]
      }
    },
    { ...stored, history: { from: "2020-01-01", to: "2026-10-11", days: 2476, entries: [] } }
  ]) {
    tamper(bad);
    const read = await readPortfolioReport(db, report.id);
    assert(read, "the report itself still renders");
    assert.equal(read.history, undefined, "the malformed history is dropped");
  }
  // A block that is simply absent stays absent; nothing is invented.
  tamper({ ...stored, history: undefined });
  assert.equal((await readPortfolioReport(db, report.id))?.history, undefined);
  tamper(report);
  assert((await readPortfolioReport(db, report.id))?.history);
});
test("mode-less product visit markers are accepted without inventing a gameplay mode", async () => {
  const { db } = database();
  const body: Record<string, unknown> = payload("visit");
  delete body.mode;
  assert.equal((await collectEngagement(request(body), db, now)).status, 204);
  assert.equal(
    (await localAnalytics(db, "shoalshot", 7, now)).metrics.find((m) => m.key === "visits")?.value,
    1
  );
});

test("live reports reject source windows that differ from their saved current UTC window", async () => {
  const { db } = database();
  await collectEngagement(request(payload()), db, now);
  const report = await localAnalytics(db, "shoalshot", 7, now);
  assert.equal(
    parseProjectAnalytics(
      { ...report, period: { ...report.period, from: "2026-10-08", to: "2026-10-14" } },
      "shoalshot",
      7,
      now
    ),
    null
  );
});

test("hourly analytics never enables CMS maintenance in read-only publication", async () => {
  let editorial = 0,
    analytics = 0;
  const scheduled = createAnalyticsScheduledHandler(
    createPublicationScheduledHandler(async (...args: [{ cron: string }, unknown]) => {
      void args;
      editorial++;
    }),
    async () => {
      analytics++;
    }
  );
  await scheduled(
    { cron: analyticsCron },
    { WOODHOUSE_ENVIRONMENT: "production", WOODHOUSE_PUBLICATION_MODE: "read-only", DB: {} }
  );
  assert.equal(analytics, 1);
  assert.equal(editorial, 0);
  await scheduled(
    { cron: "* * * * *" },
    { WOODHOUSE_ENVIRONMENT: "production", WOODHOUSE_PUBLICATION_MODE: "read-only", DB: {} }
  );
  assert.equal(editorial, 0);
  await scheduled(
    { cron: analyticsCron },
    { WOODHOUSE_ENVIRONMENT: "preview", WOODHOUSE_PUBLICATION_MODE: "read-only", DB: {} }
  );
  assert.equal(analytics, 1);
  await scheduled({ cron: "* * * * *" }, { WOODHOUSE_ENVIRONMENT: "preview", DB: {} });
  assert.equal(editorial, 1);
});

test("shared charts attach source quality to totals and retain an environment-owned retrieval address", async () => {
  const { db } = database();
  await collectEngagement(request(payload()), db, now);
  const report = await createPortfolioReport(db, 7, new Set(["shoalshot"]), fetch, now);
  const source = report.projects[0]!.report!;
  source.coverage.startedAt = "2026-10-01T00:00:00.000Z";
  source.coverage.comparableFrom = "2026-10-14T12:00:00.000Z";
  const metric = source.metrics.find((m) => m.key === "game_starts")!;
  metric.daily = [{ date: "2026-10-10", value: 1 }];
  for (const format of ["landscape", "square"] as const) {
    const svg = reportSvg(
      report,
      new Map([["shoalshot", "SHOALSHOT"]]),
      format,
      "game_starts",
      "https://preview.example"
    );
    assert(svg.includes("Legacy/test risk"));
    assert(svg.includes(`preview.example/activity/?report=${report.id}`));
    assert(svg.includes("measure=game_starts"));
    assert(svg.includes("project=shoalshot"));
    metric.quality = "bounded";
    assert(reportSvg(report, new Map(), format, "game_starts").includes("Bounded count"));
    metric.quality = "exact";
    const originalQuality = source.coverage.quality;
    for (const [quality, label] of [
      ["bounded", "Bounded count"],
      ["sampled", "Sampled estimate"],
      ["unavailable", "Coverage unavailable"]
    ] as const) {
      source.coverage.quality = quality;
      assert(reportSvg(report, new Map(), format, "game_starts").includes(`>${label}</text>`));
    }
    source.coverage.quality = originalQuality;
  }
});

const browserToken = "aabbccdd-1122-4333-8444-aabbccddeeff";
function woodhouseVisit(extra = {}) {
  return payload("visit", { project: "woodhouse", mode: "site", browserToken, ...extra });
}
const woodhouseHeaders = { origin: "https://woodhouse.loftwah.com" };
test("story distribution rejects uncontrolled context and unknown frozen reports without storing events", async () => {
  const { db, sqlite } = database();
  const distribution = { edition: "one-more-round", story: "bubbles", report: "a".repeat(24) };
  for (const context of [
    distribution,
    { ...distribution, edition: "private@example.test" },
    { ...distribution, story: "arbitrary" },
    { ...distribution, report: "private@example.test" },
    { ...distribution, campaign: "personal" }
  ]) {
    assert.equal(
      (
        await collectEngagement(
          request(
            woodhouseVisit({ event: "story_arrival", distribution: context }),
            woodhouseHeaders
          ),
          db,
          now
        )
      ).status,
      400
    );
  }
  assert.equal(
    (
      await collectEngagement(
        request(woodhouseVisit({ event: "story_explored" }), woodhouseHeaders),
        db,
        now
      )
    ).status,
    400
  );
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM wh_analytics_events").get()!.n, 0);
  sqlite.exec("UPDATE wh_analytics_limits SET attempts=120");
  assert.equal(
    (
      await collectEngagement(
        request(woodhouseVisit({ event: "story_arrival", distribution }), woodhouseHeaders),
        db,
        now
      )
    ).status,
    429,
    "Volume admission precedes snapshot-body lookup"
  );
  assert.equal(
    (
      await loadStoryDistribution(
        db,
        { from: "2026-10-15", to: "2026-10-15", days: 1, complete: false },
        { edition: "one-more-round" },
        now
      )
    ).quality,
    "unavailable"
  );
  sqlite.close();
});
test("story distribution uses real SQLite rollups, independent counts, bounded snapshots and existing QA exclusions", async () => {
  const { db, sqlite } = database();
  const report = await createPortfolioReport(db, 7, new Set(["woodhouse"]), fetch, now);
  assert(report);
  const distribution = { edition: "one-more-round", story: "bubbles", report: report.id };
  const send = (event: string, extra = {}, headers = woodhouseHeaders) =>
    collectEngagement(request(woodhouseVisit({ event, distribution, ...extra }), headers), db, now);
  for (const h of [
    { "x-analytics-test": "1" },
    { dnt: "1" },
    { "sec-gpc": "1" },
    { "user-agent": "Playwright" }
  ]) {
    assert.equal((await send("story_arrival", {}, { ...woodhouseHeaders, ...h })).status, 204);
  }
  assert.equal(
    sqlite
      .prepare("SELECT COUNT(*) AS n FROM wh_analytics_events WHERE kind LIKE 'distribution:%'")
      .get()!.n,
    0
  );
  assert.equal((await send("story_arrival")).status, 204);
  await send("story_arrival");
  await send("story_explored");
  await send("story_explored");
  await send("project_open", { target: "bubbles" });
  await send("project_open", { target: "bubbles" });
  await send("project_open", { target: "fighter" });
  assert.equal((await send("visit")).status, 400);
  assert.equal(
    (await collectEngagement(request(payload("story_arrival", { distribution })), db, now)).status,
    400
  );
  const period = { from: "2026-10-15", to: "2026-10-15", days: 1, complete: false };
  const observed = await loadStoryDistribution(db, period, { edition: "one-more-round" }, now);
  assert.equal(observed.startedAt, "2026-10-15T00:00:00.000Z");
  assert.equal(observed.quality, "partial");
  assert.deepEqual(observed.stories, [
    {
      context: distribution,
      arrivals: 1,
      explored: 1,
      openings: 3,
      destinations: [
        { target: "bubbles", openings: 2 },
        { target: "fighter", openings: 1 }
      ]
    }
  ]);
  assert.equal(
    (await localAnalytics(db, "woodhouse", 7, now)).metrics.find((m) => m.key === "project_opens")
      ?.value,
    3
  );
  assert(!JSON.stringify(observed).includes(browserToken));
  assert(!Object.keys(observed).some((key) => /rate|conversion/i.test(key)));
  assert.equal(
    (await loadStoryDistribution(db, period, { edition: "one-more-round", story: "music" }, now))
      .stories.length,
    0
  );
  const previous = await loadStoryDistribution(
    db,
    { ...period, from: "2026-10-14", to: "2026-10-14" },
    { edition: "one-more-round" },
    now
  );
  assert.equal(previous.quality, "unavailable");
  await assert.rejects(
    loadStoryDistribution(
      db,
      { ...period, from: "2025-01-01", days: 288 },
      { edition: "one-more-round" },
      now
    ),
    /Invalid distribution selection/
  );
  await assert.rejects(
    loadStoryDistribution(db, period, { edition: "one-more-round", report: "*" }, now),
    /Invalid distribution selection/
  );
  sqlite.exec("DELETE FROM wh_analytics_events");
  assert.deepEqual(
    (await loadStoryDistribution(db, period, { edition: "one-more-round", report: report.id }, now))
      .stories,
    observed.stories
  );
  sqlite.close();
});
test("distribution selection matches real rows within D1's 50-byte pattern limit and excludes earlier unrelated scopes", async () => {
  const { db, sqlite } = database();
  // Local SQLite permits much larger patterns than deployed D1. Exercise real
  // matching rows with D1's documented boundary imposed on both operators.
  const matching = new DatabaseSync(":memory:");
  for (const operator of ["glob", "like"]) {
    sqlite.function(operator, (pattern, value) => {
      if (typeof pattern !== "string" || Buffer.byteLength(pattern, "utf8") > 50)
        throw new Error("LIKE or GLOB pattern too complex");
      return Number(
        matching.prepare(`SELECT ? ${operator} ? AS matched`).get(value, pattern)!.matched
      );
    });
  }
  const firstReport = "a".repeat(24),
    selectedReport = "b".repeat(24);
  const insert = sqlite.prepare(
    "INSERT INTO wh_analytics_daily(project,day,metric,value) VALUES('woodhouse',?,?,1)"
  );
  insert.run("2026-10-10", `distribution:one-more-round:music:${firstReport}:arrival`);
  insert.run("2026-10-12", `distribution:one-more-round:music:${selectedReport}:arrival`);
  insert.run("2026-10-14", `distribution:one-more-round:bubbles:${selectedReport}:arrival`);
  assert.throws(
    () =>
      sqlite
        .prepare("SELECT metric FROM wh_analytics_daily WHERE metric GLOB ?")
        .all(`distribution:one-more-round:*:${selectedReport}:*`),
    /LIKE or GLOB pattern too complex/
  );
  const period = { from: "2026-10-10", to: "2026-10-15", days: 6, complete: false };
  const selected = { edition: "one-more-round" as const, report: selectedReport };
  const selectedObservation = await loadStoryDistribution(db, period, selected, now);
  assert.equal(selectedObservation.startedAt, "2026-10-12T00:00:00.000Z");
  assert.equal(selectedObservation.stories.length, 2);
  assert(selectedObservation.stories.every((story) => story.context.report === selectedReport));
  assert.equal(
    (await loadStoryDistribution(db, period, { ...selected, story: "bubbles" }, now)).startedAt,
    "2026-10-14T00:00:00.000Z"
  );
  const missing = await loadStoryDistribution(db, period, { ...selected, story: "fighter" }, now);
  assert.equal(missing.startedAt, null);
  assert.equal(missing.quality, "unavailable");
  const beforeSelected = await loadStoryDistribution(
    db,
    { from: "2026-10-11", to: "2026-10-11", days: 1, complete: true },
    selected,
    now
  );
  assert.equal(beforeSelected.quality, "unavailable");
  assert.deepEqual(beforeSelected.stories, []);
  sqlite.close();
  matching.close();
});
test("optional browser associations are project-scoped hashes, deduplicate sessions and preserve anonymous counts", async () => {
  const { db, sqlite } = database();
  const visit = woodhouseVisit();
  await collectEngagement(request(visit, woodhouseHeaders), db, now);
  await collectEngagement(
    request({ ...visit, eventId: crypto.randomUUID() }, woodhouseHeaders),
    db,
    now + 1000
  );
  await collectEngagement(
    request(woodhouseVisit({ browserToken: crypto.randomUUID() }), woodhouseHeaders),
    db,
    now + 2000
  );
  let report = await localAnalytics(db, "woodhouse", 7, now + 2000);
  assert.equal(report.metrics.find((m) => m.key === "browsers")?.value, 1);
  assert.equal(report.metrics.find((m) => m.key === "returning_browsers")?.value, 0);
  assert.equal(report.metrics.find((m) => m.key === "visits")?.value, 1);
  await collectEngagement(
    request(woodhouseVisit({ sessionId: crypto.randomUUID() }), woodhouseHeaders),
    db,
    now + 3000
  );
  report = await localAnalytics(db, "woodhouse", 7, now + 3000);
  assert.equal(report.metrics.find((m) => m.key === "browsers")?.value, 1);
  assert.equal(
    report.metrics.find((m) => m.key === "returning_browsers")?.value,
    1,
    "A same-day different session is a return"
  );
  assert.equal(report.metrics.find((m) => m.key === "visits")?.value, 2);
  const privateRows = sqlite.prepare("SELECT * FROM wh_analytics_browser_visits").all();
  assert.equal(privateRows.length, 2);
  assert(!JSON.stringify(privateRows).includes(browserToken));
  assert(!JSON.stringify(privateRows).includes(session));
  assert(!JSON.stringify(report).includes(privateRows[0]!.browser_hash as string));
  assert(parseProjectAnalytics(report, "woodhouse", 7, now + 3000));
});
test("browser totals use period DISTINCT and earlier retained sessions beyond the selected window", async () => {
  const { db } = database();
  for (const date of ["2026-10-01", "2026-10-03", "2026-10-04"])
    await collectEngagement(
      request(woodhouseVisit({ sessionId: crypto.randomUUID() }), woodhouseHeaders),
      db,
      Date.parse(`${date}T12:00:00Z`)
    );
  const period = parseReportingWindow(new URLSearchParams("from=2026-10-03&to=2026-10-04"), now)!;
  const report = await localAnalytics(db, "woodhouse", 2, now, period);
  for (const key of ["browsers", "returning_browsers"]) {
    const metric = report.metrics.find((m) => m.key === key)!;
    assert.equal(metric.value, 1);
    assert.deepEqual(metric.daily, [
      { date: "2026-10-03", value: 1 },
      { date: "2026-10-04", value: 1 }
    ]);
    assert.equal(
      metric.quality,
      "partial",
      "Opt-in coverage never implies every visitor was measured"
    );
  }
  const before = parseReportingWindow(new URLSearchParams("from=2026-09-01&to=2026-09-02"), now)!;
  const missing = await localAnalytics(db, "woodhouse", 2, now, before);
  assert(
    missing.metrics
      .filter((m) => /browsers/.test(m.key))
      .every((m) => m.value === null && m.daily.length === 0)
  );
});
test("browser raw expiry removes identities without fabricating expired distinct history or deleting event totals", async () => {
  const { db, sqlite } = database();
  await collectEngagement(request(woodhouseVisit(), woodhouseHeaders), db, now);
  const later = now + 91 * 86400000;
  const anonymous = woodhouseVisit({ sessionId: crypto.randomUUID() });
  delete (anonymous as { browserToken?: string }).browserToken;
  await collectEngagement(request(anonymous, woodhouseHeaders), db, later);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM wh_analytics_browser_visits").get()!.n, 0);
  assert.equal(
    sqlite.prepare("SELECT SUM(value) AS n FROM wh_analytics_daily WHERE metric='visit'").get()!.n,
    2
  );
  const oldPeriod = parseReportingWindow(
    new URLSearchParams("from=2026-10-15&to=2026-10-15"),
    later
  )!;
  const expired = await localAnalytics(db, "woodhouse", 1, later, oldPeriod);
  assert(expired.metrics.filter((m) => /browsers/.test(m.key)).every((m) => m.value === null));
  assert.equal(expired.metrics.find((m) => m.key === "visits")?.value, 1);
  assert.equal(
    (await localAnalytics(db, "woodhouse", 7, later)).metrics.find(
      (m) => m.key === "returning_browsers"
    )?.value,
    0
  );
});
test("invalid optional tokens and excluded requests never create browser identities", async () => {
  const { db, sqlite } = database();
  for (const token of ["", "email@example.test", "00000000-0000-0000-0000-000000000000", 123, null])
    assert.equal(
      (
        await collectEngagement(
          request(woodhouseVisit({ browserToken: token }), woodhouseHeaders),
          db,
          now
        )
      ).status,
      400
    );
  for (const h of [
    { dnt: "1" },
    { "sec-gpc": "1" },
    { "x-analytics-test": "1" },
    { "user-agent": "HeadlessChrome" }
  ])
    assert.equal(
      (await collectEngagement(request(woodhouseVisit(), { ...woodhouseHeaders, ...h }), db, now))
        .status,
      204
    );
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM wh_analytics_browser_visits").get()!.n, 0);
  assert.equal(
    sqlite.prepare("SELECT COUNT(*) AS n FROM wh_analytics_browser_coverage").get()!.n,
    0
  );
  assert.equal(
    (await localAnalytics(db, "woodhouse", 7, now)).metrics.find((m) => m.key === "browsers")
      ?.value,
    null
  );
});

test("forward browser tables are idempotent and leave existing schema/rollups intact", () => {
  const { sqlite } = database();
  sqlite.exec(
    "CREATE TABLE core_migrations (version TEXT); INSERT INTO core_migrations VALUES ('existing');"
  );
  const before = sqlite
    .prepare("SELECT sql FROM sqlite_schema WHERE name='wh_analytics_rollup'")
    .get();
  sqlite.exec(readFileSync("migrations/0002-analytics-browser-returns.sql", "utf8"));
  assert.deepEqual(
    sqlite.prepare("SELECT sql FROM sqlite_schema WHERE name='wh_analytics_rollup'").get(),
    before
  );
  assert.equal(sqlite.prepare("SELECT version FROM core_migrations").get()!.version, "existing");
});

test("unsupported game browser tokens remain anonymous and cannot establish pre-adoption identity history", async () => {
  const { db, sqlite } = database();
  for (const [project, mode, origin] of [
    ["shoalshot", "dive", "https://shoalshot.loftwah.com"],
    ["protocol-11", "classic", "https://protocol11.loftwah.com"]
  ] as const) {
    assert.equal(
      (
        await collectEngagement(
          request(payload("visit", { project, mode, browserToken }), { origin }),
          db,
          now
        )
      ).status,
      204
    );
    const report = await localAnalytics(db, project, 7, now);
    assert.equal(
      report.metrics.find((m) => m.key === "visits")?.value,
      1,
      "Compatible optional fields do not block anonymous event counting"
    );
    for (const key of ["browsers", "returning_browsers"]) {
      const metric = report.metrics.find((m) => m.key === key)!;
      assert.equal(metric.value, null);
      assert.equal(metric.quality, "unavailable");
      assert.deepEqual(metric.daily, []);
    }
  }
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS n FROM wh_analytics_browser_visits").get()!.n, 0);
  assert.equal(
    sqlite.prepare("SELECT COUNT(*) AS n FROM wh_analytics_browser_coverage").get()!.n,
    0,
    "Future adoption must start with its own real consent boundary"
  );
});

test("frozen reports retain reviewed release context, filter membership and reject tampering", async () => {
  const { db, sqlite } = database();
  const note = {
    project: "shoalshot" as const,
    evidenceId: "shoalshot-release",
    date: "2026-10-14",
    reviewedAt: "2026-10-15",
    title: "Released sharing",
    summary: "Reviewed release observation.",
    boundary: "Not a physical-device observation.",
    revision: "abc123"
  };
  const report = await createPortfolioReport(db, 7, new Set(["shoalshot"]), fetch, now, undefined, [
    note
  ]);
  assert.deepEqual(report.releases, [note]);
  assert.deepEqual((await readPortfolioReport(db, report.id))?.releases, [note]);
  assert.deepEqual(projectReport(report, null, new Set(["woodhouse"])).releases, []);
  const narrowed = projectReport(report, "shoalshot", new Set(["shoalshot"]));
  assert.deepEqual(narrowed.releases, [note]);
  const historical = await createPortfolioReport(
    db,
    1,
    new Set(["shoalshot"]),
    fetch,
    now,
    { from: "2026-10-14", to: "2026-10-14", days: 1, complete: true },
    [{ ...note, date: "2026-10-15" }]
  );
  assert.deepEqual(
    historical.releases,
    [],
    "a historical report never retains a later release observation"
  );
  const caption = reportSvg(report, new Map([["shoalshot", "SHOALSHOT"]]), "landscape");
  assert.equal(
    reportSvg({ ...report, releases: [] }, new Map([["shoalshot", "SHOALSHOT"]]), "landscape"),
    caption,
    "context never changes the frozen figures or export scope"
  );
  sqlite
    .prepare("UPDATE wh_analytics_reports SET body=? WHERE id=?")
    .run(
      JSON.stringify({ ...report, releases: [{ ...note, evidenceId: "../private" }] }),
      report.id
    );
  assert.equal((await readPortfolioReport(db, report.id))?.releases, undefined);
});

test("the collector accepts exactly the same six discovery targets as the browser", async () => {
  const { db, sqlite } = database();
  for (const target of [
    "app-composer",
    "fighter",
    "shoalshot",
    "protocol-11",
    "loftwahfm",
    "bubbles",
    "max",
    "asset-hunter",
    "pirates"
  ]) {
    const body = payload("project_open", { project: "woodhouse", mode: "site", target });
    const response = await collectEngagement(
      request(body, { origin: "https://woodhouse.loftwah.com" }),
      db,
      now
    );
    assert.equal(response.status, ["max", "asset-hunter", "pirates"].includes(target) ? 400 : 204);
  }
  assert.equal(
    sqlite
      .prepare("SELECT SUM(value) AS n FROM wh_analytics_daily WHERE metric LIKE 'referral_%'")
      .get()!.n,
    6
  );
});

test("a current Melbourne review is frozen without moving its observed date or UTC report window", async () => {
  const { db } = database();
  const capturedAt = Date.parse("2026-10-17T22:00:00Z");
  const note = {
    project: "shoalshot" as const,
    evidenceId: "shoalshot-release",
    date: "2026-10-17",
    reviewedAt: "2026-10-18",
    title: "Reviewed release observation",
    summary: "A dated source observation.",
    boundary: "No deployment time is inferred from the calendar date.",
    revision: "abc123"
  };
  const report = await createPortfolioReport(
    db,
    7,
    new Set(["shoalshot"]),
    fetch,
    capturedAt,
    undefined,
    [note]
  );
  assert.equal(report.period?.from, "2026-10-11");
  assert.equal(report.period?.to, "2026-10-17");
  assert.deepEqual(report.releases, [note]);
  assert.deepEqual((await readPortfolioReport(db, report.id))?.releases, [note]);
  const laterObservation = await createPortfolioReport(
    db,
    1,
    new Set(["shoalshot"]),
    fetch,
    capturedAt,
    { from: "2026-10-17", to: "2026-10-17", days: 1, complete: false },
    [{ ...note, date: "2026-10-18" }]
  );
  assert.deepEqual(
    laterObservation.releases,
    [],
    "observations after the selected UTC end remain omitted"
  );
});

/* --------------------------------------------- Protocol 11 mode subtotals */

const protocol11Origin = "https://protocol11.loftwah.com";
const playModes = ["classic", "journey", "private_room", "public_matchmaking"] as const;
const gameEvent = (event: string, mode: string, extra: Record<string, unknown> = {}) =>
  payload(event, { project: "protocol-11", mode, ...extra });
const gameRequest = (body: unknown, headers: Record<string, string> = {}) =>
  request(body, { origin: protocol11Origin, ...headers });
const modeMetric = (report: ProjectAnalytics, key: string) =>
  report.metrics.find((metric) => metric.key === key);
const dailyOf = (report: ProjectAnalytics, key: string) => modeMetric(report, key)?.daily ?? [];
const windowOf = (from: string, to: string) =>
  parseReportingWindow(new URLSearchParams({ from, to }), now)!;

test("each reported play mode gets its own additive gameplay subtotal and excluded traffic gets none", async () => {
  const { db, sqlite } = database();
  for (const mode of playModes)
    assert.equal(
      (await collectEngagement(gameRequest(gameEvent("game_start", mode)), db, now)).status,
      204,
      mode
    );
  // Visits and engaged sessions are tab-session markers: they are accepted, and
  // they are deliberately never split by mode.
  assert.equal(
    (await collectEngagement(gameRequest(gameEvent("visit", "classic")), db, now + 1000)).status,
    204
  );
  assert.equal(
    (await collectEngagement(gameRequest(gameEvent("engaged", "classic")), db, now + 2000)).status,
    204
  );
  // QA, DNT, GPC, automation and an unlisted mode must not create a subtotal either.
  for (const headers of [
    { dnt: "1" },
    { "sec-gpc": "1" },
    { "x-analytics-test": "1" },
    { "user-agent": "Playwright headless" }
  ])
    assert.equal(
      (
        await collectEngagement(
          gameRequest(gameEvent("game_start", "classic"), headers),
          db,
          now + 3000
        )
      ).status,
      204
    );
  assert.equal(
    (await collectEngagement(gameRequest(gameEvent("game_start", "practice")), db, now + 3000))
      .status,
    400
  );
  const report = await localAnalytics(db, "protocol-11", 7, now + 3000);
  for (const mode of playModes) {
    const metric = modeMetric(report, `game_starts_${mode}`)!;
    assert.equal(metric.value, 1, mode);
    assert.equal(metric.unit, "count");
    assert.match(metric.definition, /Additive with Game starts/);
    assert.match(metric.definition, /does not mean distinct people/);
    assert.deepEqual(metric.daily, [{ date: "2026-10-15", value: 1 }], mode);
  }
  assert.equal(modeMetric(report, "game_starts")?.value, 4);
  assert.equal(
    playModes.reduce((sum, mode) => sum + modeMetric(report, `game_starts_${mode}`)!.value!, 0),
    4,
    "the four mode subtotals sum exactly to the overall measure"
  );
  assert.equal(
    sqlite
      .prepare("SELECT COUNT(*) AS n FROM wh_analytics_events WHERE project='protocol-11'")
      .get()!.n,
    6,
    "four starts plus the visit and engaged markers"
  );
  assert.equal(
    sqlite
      .prepare(
        "SELECT SUM(value) AS n FROM wh_analytics_daily WHERE project='protocol-11' AND metric LIKE 'game\\_start\\_%' ESCAPE '\\'"
      )
      .get()!.n,
    4
  );
  for (const kind of ["visit", "engaged"])
    assert.equal(
      sqlite
        .prepare(
          "SELECT COUNT(*) AS n FROM wh_analytics_daily WHERE project='protocol-11' AND metric LIKE ? ESCAPE '\\'"
        )
        .get(`${kind}\\_%`)!.n,
      0,
      `${kind} is a session marker and is never split by mode`
    );
});

test("duplicate and re-reported gameplay events increment the mode subtotal exactly once", async () => {
  const { db } = database();
  const start = gameEvent("game_start", "classic");
  await collectEngagement(gameRequest(start), db, now);
  // A retried HTTP attempt carries the same event id, and must not be a second start.
  await collectEngagement(gameRequest(start), db, now + 1000);
  const completion = gameEvent("game_complete", "private_room");
  await collectEngagement(gameRequest(completion), db, now + 2000);
  // A restored save re-reports the same observed completion under its own id.
  await collectEngagement(gameRequest(completion), db, now + 3000);
  let report = await localAnalytics(db, "protocol-11", 7, now + 3000);
  assert.equal(modeMetric(report, "game_starts_classic")?.value, 1);
  assert.equal(modeMetric(report, "game_starts")?.value, 1);
  assert.equal(modeMetric(report, "game_completions_private_room")?.value, 1);
  assert.equal(modeMetric(report, "game_completions")?.value, 1);
  // Deduplication is by accepted event id, not by shape: a genuinely new action
  // with a new id is a second accepted event, and the subtotal follows it.
  await collectEngagement(
    gameRequest(gameEvent("game_start", "classic", { eventId: crypto.randomUUID() })),
    db,
    now + 4000
  );
  report = await localAnalytics(db, "protocol-11", 7, now + 4000);
  assert.equal(modeMetric(report, "game_starts_classic")?.value, 2);
  assert.equal(modeMetric(report, "game_starts")?.value, 2);
});

test("mode subtotals reconcile exactly with their overall measure across a day boundary and at the coverage edges", async () => {
  const { db } = database();
  const day = (date: string, offsetSeconds = 0) =>
    Date.parse(`${date}T09:00:00Z`) + offsetSeconds * 1000;
  const sessions = {
    day1: crypto.randomUUID(),
    day2: crypto.randomUUID(),
    day3: crypto.randomUUID()
  };
  const play = async (event: string, mode: string, at: number, sessionId: string, seconds = 0) =>
    collectEngagement(
      gameRequest(gameEvent(event, mode, { sessionId, ...(seconds ? { seconds } : {}) })),
      db,
      at
    );
  await play("game_start", "classic", day("2026-10-10"), sessions.day1);
  await play("game_start", "classic", day("2026-10-10", 1), sessions.day1);
  await play("game_start", "journey", day("2026-10-10", 2), sessions.day1);
  await play("active_time", "classic", day("2026-10-10", 21), sessions.day1, 20);
  await play("active_time", "journey", day("2026-10-10", 42), sessions.day1, 20);
  await play("game_start", "private_room", day("2026-10-11"), sessions.day2);
  await play("game_start", "public_matchmaking", day("2026-10-11", 1), sessions.day2);
  await play("active_time", "private_room", day("2026-10-11", 31), sessions.day2, 30);
  await play("active_time", "public_matchmaking", day("2026-10-11", 62), sessions.day2, 30);
  await play("game_start", "classic", day("2026-10-12"), sessions.day3);
  await play("game_replay", "classic", day("2026-10-12", 1), sessions.day3);
  await play("game_complete", "classic", day("2026-10-12", 2), sessions.day3);
  await play("active_time", "classic", day("2026-10-12", 21), sessions.day3, 20);

  const complete = windowOf("2026-10-10", "2026-10-15");
  const report = await localAnalytics(db, "protocol-11", complete.days, now, complete);
  const expected: Record<string, Record<string, number>> = {
    game_starts: { classic: 3, journey: 1, private_room: 1, public_matchmaking: 1 },
    game_replays: { classic: 1, journey: 0, private_room: 0, public_matchmaking: 0 },
    game_completions: { classic: 1, journey: 0, private_room: 0, public_matchmaking: 0 },
    active_seconds: { classic: 40, journey: 20, private_room: 30, public_matchmaking: 30 }
  };
  for (const [parent, parts] of Object.entries(expected)) {
    const total = modeMetric(report, parent)!;
    const totalExpected = Object.values(parts).reduce((sum, value) => sum + value, 0);
    assert.equal(total.value, totalExpected, parent);
    let windowSum = 0;
    for (const [mode, value] of Object.entries(parts)) {
      const metric = modeMetric(report, `${parent}_${mode}`)!;
      assert.equal(metric.value, value, `${parent}_${mode}`);
      assert.equal(metric.unit, total.unit);
      assert.equal(metric.quality, "exact", `${parent}_${mode} covers the whole window`);
      windowSum += metric.value!;
    }
    // The subtotals of the window are the overall figure, not a second measurement.
    assert.equal(windowSum, total.value, `${parent} window reconciliation`);
    // Every UTC day reconciles too, including the empty days after the last event
    // and the day the first events landed on.
    for (const date of dateDays(complete)) {
      const dayParts = playModes.map(
        (mode) => dailyOf(report, `${parent}_${mode}`).find((point) => point.date === date)?.value
      );
      assert(
        dayParts.every((value) => value !== undefined),
        `${parent}_* is zero-filled from the split's own start, not before it`
      );
      assert.equal(
        dayParts.reduce((sum, value) => sum + value!, 0),
        total.daily.find((point) => point.date === date)!.value,
        `${parent} reconciles on ${date}`
      );
    }
  }
  assert.deepEqual(dailyOf(report, "game_starts_journey"), [
    { date: "2026-10-10", value: 1 },
    { date: "2026-10-11", value: 0 },
    { date: "2026-10-12", value: 0 },
    { date: "2026-10-13", value: 0 },
    { date: "2026-10-14", value: 0 },
    { date: "2026-10-15", value: 0 }
  ]);
  assert.deepEqual(
    dailyOf(report, "active_seconds_public_matchmaking").map((point) => [point.date, point.value]),
    [
      ["2026-10-10", 0],
      ["2026-10-11", 30],
      ["2026-10-12", 0],
      ["2026-10-13", 0],
      ["2026-10-14", 0],
      ["2026-10-15", 0]
    ]
  );
  // A mode that received no event at all is a measured zero from the day the split
  // exists, and its parent is zero on the same days: the partition stays exact.
  assert.deepEqual(
    dailyOf(report, "game_completions_journey").map((point) => [point.date, point.value]),
    [
      ["2026-10-10", 0],
      ["2026-10-11", 0],
      ["2026-10-12", 0],
      ["2026-10-13", 0],
      ["2026-10-14", 0],
      ["2026-10-15", 0]
    ]
  );
  assert.deepEqual(
    dailyOf(report, "game_completions").map((point) => [point.date, point.value]),
    [
      ["2026-10-10", 0],
      ["2026-10-11", 0],
      ["2026-10-12", 1],
      ["2026-10-13", 0],
      ["2026-10-14", 0],
      ["2026-10-15", 0]
    ]
  );
  // The window's own start is a boundary: a window that reaches back before the
  // split keeps the covered days and refuses to total the uncovered ones.
  const partialWindow = windowOf("2026-10-09", "2026-10-15");
  const partial = await localAnalytics(db, "protocol-11", partialWindow.days, now, partialWindow);
  const partialClassic = modeMetric(partial, "game_starts_classic")!;
  assert.equal(partialClassic.quality, "partial");
  assert.equal(partialClassic.daily[0]!.date, "2026-10-10");
  assert.equal(partialClassic.daily.length, 6);
  assert.equal(partialClassic.value, 3);
  // The project's own counter and its split share the same first day, so a window
  // that starts earlier keeps both partial and they still reconcile over the days
  // they cover.
  const partialStarts = modeMetric(partial, "game_starts")!;
  assert.equal(partialStarts.daily.length, 6);
  assert.equal(partialStarts.daily[0]!.date, "2026-10-10");
  assert.equal(partialStarts.value, 6);
  assert.equal(
    playModes.reduce((sum, mode) => sum + modeMetric(partial, `game_starts_${mode}`)!.value!, 0),
    6
  );
  // A window entirely before the split is unavailable, never thirty days of zero.
  const before = windowOf("2026-10-01", "2026-10-05");
  const early = await localAnalytics(db, "protocol-11", before.days, now, before);
  for (const parent of Object.keys(expected))
    for (const mode of playModes) {
      const metric = modeMetric(early, `${parent}_${mode}`)!;
      assert.equal(metric.value, null, `${parent}_${mode}`);
      assert.equal(metric.quality, "unavailable", `${parent}_${mode}`);
      assert.deepEqual(metric.daily, [], `${parent}_${mode}`);
    }
  assert(parseProjectAnalytics(report, "protocol-11", complete.days, now, complete));
});

test("a mode split that begins after its overall counter renders gaps, not zero-filled history", async () => {
  const { db, sqlite } = database(false);
  // Durable daily counters outlive the raw events they were built from, so a
  // project can hold aggregate history that no mode split can be reconstructed for.
  sqlite
    .prepare("INSERT INTO wh_analytics_daily(project,day,metric,value) VALUES(?,?,?,?)")
    .run("protocol-11", "2026-06-01", "game_start", 3);
  await collectEngagement(gameRequest(gameEvent("game_start", "classic")), db, now);
  sqlite.exec(readFileSync("migrations/0003-analytics-mode-rollup.sql", "utf8"));
  const window = windowOf("2026-07-18", "2026-10-15");
  const report = await localAnalytics(db, "protocol-11", window.days, now, window);
  const total = modeMetric(report, "game_starts")!;
  const classic = modeMetric(report, "game_starts_classic")!;
  // The overall counter starts with the project and keeps its full window.
  assert.equal(total.value, 1);
  assert.equal(total.daily.length, 90);
  // The split starts on the day it could first be observed, and the 89 days before
  // it are gaps rather than zeroes.
  assert.deepEqual(classic.daily, [{ date: "2026-10-15", value: 1 }]);
  assert.equal(classic.value, 1);
  assert.equal(classic.quality, "partial");
  assert.equal(
    classic.daily.filter((point) => point.value === 0).length,
    0,
    "no zero is claimed for the days the split did not exist"
  );
  for (const mode of playModes) {
    const metric = modeMetric(report, `game_starts_${mode}`)!;
    assert(
      metric.daily.every((point) => point.date >= "2026-10-15"),
      mode
    );
  }
  assert.equal(
    sqlite
      .prepare(
        "SELECT COUNT(*) AS n FROM wh_analytics_daily WHERE day='2026-06-01' AND metric LIKE 'game\\_start\\_%' ESCAPE '\\'"
      )
      .get()!.n,
    0,
    "expired history is not guessed from the overall counter"
  );
});

test("a project with no accepted gameplay publishes no mode metric and no false zero", async () => {
  const { db, sqlite } = database();
  assert.equal(
    (await collectEngagement(gameRequest(gameEvent("visit", "classic")), db, now)).status,
    204
  );
  const report = await localAnalytics(db, "protocol-11", 30, now);
  assert.deepEqual(
    report.metrics.filter((metric) =>
      /^(game_starts|game_completions|game_replays|active_seconds)_/.test(metric.key)
    ),
    [],
    "a session marker is not gameplay, and no mode subtotal is invented for it"
  );
  assert.equal(report.coverage.startedAt, "2026-10-15T00:00:00.000Z");
  assert.equal(
    sqlite
      .prepare("SELECT COUNT(*) AS n FROM wh_analytics_daily WHERE project='protocol-11'")
      .get()!.n,
    1,
    "the visit is the only durable counter"
  );
  const empty = await localAnalytics(db, "shoalshot", 30, now);
  assert.deepEqual(
    empty.metrics.filter((metric) => metric.key.startsWith("game_starts_")),
    []
  );
  assert.equal(empty.coverage.startedAt, null);
});

test("the mode backfill covers only complete retained days and re-runs without double-counting", () => {
  const { sqlite } = database(false);
  const insert = (date: string, eventId: string, mode: string) =>
    sqlite
      .prepare(
        "INSERT INTO wh_analytics_events(project,event_id,session_hash,kind,seconds,mode,day,received_at) VALUES(?,?,?,?,?,?,?,?)"
      )
      .run(
        "protocol-11",
        eventId,
        `session-${eventId}`,
        "game_start",
        0,
        mode,
        date,
        Math.floor(Date.parse(`${date}T10:00:00Z`) / 1000)
      );
  const expired = new Date(Date.now() - 200 * 86400000).toISOString().slice(0, 10);
  const retained = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  insert(expired, "expired-1", "classic");
  insert(retained, "retained-1", "journey");
  const counter = (metric: string, date: string) =>
    sqlite
      .prepare(
        "SELECT value FROM wh_analytics_daily WHERE project='protocol-11' AND metric=? AND day=?"
      )
      .get(metric, date)?.value ?? null;
  assert.equal(counter("game_start", expired), 1, "the pre-migration overall counter exists");
  sqlite.exec(readFileSync("migrations/0003-analytics-mode-rollup.sql", "utf8"));
  assert.equal(counter("game_start_journey", retained), 1);
  // A day whose events have already been trimmed is a gap, not a partial guess.
  assert.equal(counter("game_start_classic", expired), null);
  assert.equal(counter("game_start", expired), 1, "the overall counter is untouched");
  // Re-running the forward SQL is a replace, never an increment.
  sqlite.exec(readFileSync("migrations/0003-analytics-mode-rollup.sql", "utf8"));
  assert.equal(counter("game_start_journey", retained), 1);
  assert.equal(
    counter("game_start", retained),
    1,
    "the existing rollup is additive with itself and unchanged by this migration"
  );
});

test("the forward mode rollup is idempotent and leaves existing schema and rollups intact", () => {
  const { sqlite } = database();
  sqlite.exec(
    "CREATE TABLE core_migrations (version TEXT); INSERT INTO core_migrations VALUES ('existing');"
  );
  const before = sqlite
    .prepare("SELECT sql FROM sqlite_schema WHERE name='wh_analytics_rollup'")
    .get();
  const modeBefore = sqlite
    .prepare("SELECT sql FROM sqlite_schema WHERE name='wh_analytics_mode_rollup'")
    .get();
  sqlite.exec(readFileSync("migrations/0003-analytics-mode-rollup.sql", "utf8"));
  assert.deepEqual(
    sqlite.prepare("SELECT sql FROM sqlite_schema WHERE name='wh_analytics_rollup'").get(),
    before
  );
  assert.deepEqual(
    sqlite.prepare("SELECT sql FROM sqlite_schema WHERE name='wh_analytics_mode_rollup'").get(),
    modeBefore
  );
  assert.equal(sqlite.prepare("SELECT version FROM core_migrations").get()!.version, "existing");
});

test("every object the publication gate requires is created by the reviewed migrations", () => {
  const { sqlite } = database();
  // The gate runs its own SELECT against production D1 before a release. Reading
  // its list from the script keeps this check honest: an object that a migration
  // creates but the gate does not name could be missing in production, and a name
  // the gate requires that no migration creates would fail a real deployment.
  const gate = readFileSync("scripts/deploy-publication.mjs", "utf8");
  const required = [...gate.matchAll(/"wh_analytics_[a-z_]+"/g)].map((match) =>
    match[0].slice(1, -1)
  );
  assert(required.length >= 9, "the gate names the reviewed analytics objects");
  assert(required.includes("wh_analytics_mode_rollup"));
  const present = new Set(
    sqlite
      .prepare("SELECT name FROM sqlite_master")
      .all()
      .map((row) => row.name as string)
  );
  for (const name of required)
    assert(present.has(name), `${name} is required before publication but no migration creates it`);
});

test("new captures do not reuse a previous producer revision and older reports remain immutable", async () => {
  const { db, sqlite } = database();
  const old = await createPortfolioReport(db, 7, new Set(["woodhouse"]), fetch, now);
  const previous = structuredClone(old);
  previous.projects[0]!.report!.source.revision = "a".repeat(40);
  sqlite
    .prepare("UPDATE wh_analytics_reports SET body=? WHERE id=?")
    .run(JSON.stringify(previous), old.id);
  const fresh = await createPortfolioReport(db, 7, new Set(["woodhouse"]), fetch, now + 1000);
  assert.notEqual(fresh.id, old.id);
  assert.equal(fresh.projects[0]!.report!.source.revision, null);
  assert.equal(
    (await readPortfolioReport(db, old.id))!.projects[0]!.report!.source.revision,
    "a".repeat(40)
  );
  const reused = await createPortfolioReport(db, 7, new Set(["woodhouse"]), fetch, now + 2000);
  assert.equal(reused.id, fresh.id);
  sqlite.close();
});
