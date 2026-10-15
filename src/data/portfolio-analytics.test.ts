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
import { reportSvg, reportFormats } from "./portfolio-card.ts";
function database() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(readFileSync("migrations/0001-portfolio-analytics.sql", "utf8"));
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
