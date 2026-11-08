import assert from "node:assert/strict";
import test from "node:test";
import { localAnalytics } from "./engagement.ts";
import { periodFor } from "./portfolio-analytics.ts";

/**
 * The analytics report is assembled from reads that are keyed only by project
 * and reporting window. This harness does not model SQL. It records when each
 * statement is dispatched and refuses to answer until the test releases it, so
 * the test can prove that independent reads are issued together and that the
 * gating which decides whether a read may run at all is unchanged.
 */
const now = Date.parse("2026-11-08T00:00:00Z");
const period = periodFor(7, now);

function labelFor(sql: string, kind: "first" | "all") {
  if (sql.includes("GROUP BY metric")) return "mode-starts";
  if (sql.includes("MIN(day) AS day")) return "daily-start";
  if (sql.includes("SELECT day,metric,value")) return "daily-rows";
  if (sql.includes("wh_analytics_browser_coverage")) return "browser-start";
  if (sql.includes("LIKE 'referral")) return "referral-rows";
  if (sql.includes("GROUP BY v.day ORDER BY v.day")) return "browser-daily";
  if (kind === "first" && sql.includes("COUNT(DISTINCT v.browser_hash)")) return "browser-totals";
  throw new Error(`unexpected statement: ${sql}`);
}

function gatedDatabase(answers: Record<string, unknown>) {
  const dispatched: string[] = [];
  const waiters: Array<() => void> = [];
  const answer = (label: string) => {
    if (!(label in answers)) throw new Error(`no fixture for ${label}`);
    return answers[label];
  };
  const pending = (label: string) =>
    new Promise((resolve) => {
      dispatched.push(label);
      waiters.push(() => resolve(answer(label)));
    });
  const db = {
    prepare(sql: string) {
      const statement = {
        bind() {
          return statement;
        },
        first: () => pending(labelFor(sql, "first")),
        all: () => pending(labelFor(sql, "all"))
      };
      return statement;
    }
  };
  // Releases every statement dispatched since the previous flush, then lets the
  // report code run to its next dispatch point.
  const flush = async () => {
    for (const release of waiters.splice(0)) release();
    await new Promise((resolve) => setImmediate(resolve));
  };
  return { db: db as unknown as D1Database, dispatched, flush };
}

const baseAnswers = () => ({
  "daily-start": { day: period.from },
  "daily-rows": { results: [], success: true },
  "mode-starts": { results: [], success: true },
  "referral-rows": { results: [], success: true },
  "browser-daily": { results: [], success: true },
  "browser-totals": { browsers: 0, returning_browsers: 0 }
});

test("woodhouse issues its independent reads together, then the gated browser pair together", async () => {
  const { db, dispatched, flush } = gatedDatabase({
    ...baseAnswers(),
    "browser-start": { started_at: Math.floor(now / 1000) - 5 * 86400 }
  });
  const report = localAnalytics(db, "woodhouse", 7, now);

  // Nothing in the first stage answers anything else: the collection start, the
  // daily rows, each metric's own start, the browser coverage start and the
  // referral rows all depend on the project and window only. All five are
  // dispatched before any can resolve.
  assert.deepEqual(dispatched, [
    "daily-start",
    "daily-rows",
    "mode-starts",
    "browser-start",
    "referral-rows"
  ]);

  await flush();
  // The browser daily series and its period totals read the same table and are
  // only allowed once coverage exists; they now share one stage.
  assert.deepEqual(dispatched.slice(5), ["browser-daily", "browser-totals"]);

  await flush();
  const result = await report;
  assert.equal(result.project, "woodhouse");
  assert.equal(result.metrics.find((metric) => metric.key === "browsers")?.value, 0);
  assert.equal(dispatched.length, 7);
});

test("game projects read only what their modes and consent support", async () => {
  const { db, dispatched, flush } = gatedDatabase(baseAnswers());
  const report = localAnalytics(db, "protocol-11", 7, now);

  assert.deepEqual(dispatched, ["daily-start", "daily-rows", "mode-starts"]);
  await flush();
  const result = await report;
  // No browser coverage and no Woodhouse referrals means no statement for them.
  assert.deepEqual(dispatched, ["daily-start", "daily-rows", "mode-starts"]);
  assert.match(result.coverage.limitations.join(" "), /Browser returns are unavailable/);
});

test("a consenting-visit gap still suppresses the browser reads", async () => {
  const { db, dispatched, flush } = gatedDatabase({ ...baseAnswers(), "browser-start": null });
  const report = localAnalytics(db, "woodhouse", 7, now);

  assert.deepEqual(dispatched, [
    "daily-start",
    "daily-rows",
    "mode-starts",
    "browser-start",
    "referral-rows"
  ]);
  await flush();
  const result = await report;
  assert.deepEqual(dispatched, [
    "daily-start",
    "daily-rows",
    "mode-starts",
    "browser-start",
    "referral-rows"
  ]);
  assert.match(result.coverage.limitations.join(" "), /has not yet received a consenting visit/);
});

test("referral rows found in the same independent stage still become their own measure", async () => {
  const { db, flush } = gatedDatabase({
    ...baseAnswers(),
    "mode-starts": {
      results: [{ metric: "referral_bubbles", day: period.from }],
      success: true
    },
    "browser-start": { started_at: Math.floor(now / 1000) - 5 * 86400 },
    "referral-rows": {
      results: [{ metric: "referral_bubbles", day: period.from, value: 2 }],
      success: true
    }
  });
  const report = localAnalytics(db, "woodhouse", 7, now);
  await flush();
  await flush();
  const result = await report;
  assert.equal(result.metrics.find((metric) => metric.key === "referral_bubbles")?.value, 2);
});
