import assert from "node:assert/strict";
import test from "node:test";
import { logReportDegraded, logReportFailure, reportRouteEvent } from "./report-failure.ts";

const input = {
  route: "/api/portfolio-card.png",
  stage: "fonts",
  scope: "edition",
  reportId: "0123456789abcdef01234567",
  dependency: "font" as const,
  durationMs: 4012.6,
  status: 503,
  error: new DOMException("The operation was aborted due to timeout", "TimeoutError")
};

test("failure evidence names the route, stage, scope, dependency, duration and status", () => {
  assert.deepEqual(reportRouteEvent({ ...input, event: "failure" }), {
    event: "failure",
    route: "/api/portfolio-card.png",
    stage: "fonts",
    scope: "edition",
    report: "0123456789abcdef01234567",
    dependency: "font",
    durationMs: 4013,
    status: 503,
    error: "TimeoutError: The operation was aborted due to timeout"
  });
});

test("only an already-public snapshot id is repeated in evidence", () => {
  assert.equal(reportRouteEvent({ ...input, reportId: null, event: "failure" }).report, "absent");
  assert.equal(
    reportRouteEvent({
      ...input,
      reportId: "https://private.example/?token=secret",
      event: "failure"
    }).report,
    "malformed"
  );
  assert.equal(
    reportRouteEvent({ ...input, reportId: "0123456789ABCDEF01234567", event: "failure" }).report,
    "malformed"
  );
});

test("evidence masks URLs, relative query strings, stacks, credentials and opaque ids", () => {
  const ulid = "01JABCDEFGHJKMNPQRSTVWXYZ0";
  const uuid = "123e4567-e89b-12d3-a456-426614174000";
  const error = new Error(
    [
      "fetch https://woodhouse.loftwah.com/api/private?token=abc failed",
      "and /api/portfolio-card.png?report=0123456789abcdef01234567&audit=1 too",
      "  at handler (/Users/someone/app.ts:1:1)",
      "authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.def",
      `ref ${ulid} and ${uuid}`
    ].join("\n")
  );
  const event = reportRouteEvent({ ...input, error, event: "failure" });
  for (const leaked of [
    "woodhouse.loftwah.com",
    "token=abc",
    "portfolio-card.png?",
    "report=",
    "/Users/",
    "app.ts",
    "Bearer",
    "eyJhbGciOiJIUzI1NiJ9",
    ulid,
    uuid,
    "\n"
  ])
    assert.equal(event.error.includes(leaked), false, `leaked ${leaked}`);
  assert.match(event.error, /\[url\]/);
  assert.match(event.error, /\[stack\]/);
  assert.match(event.error, /\[credential\]/);
  assert.match(event.error, /\[id\]/);
  assert.ok(event.error.length <= 160);
});

test("evidence keeps a short, ordinary error message readable", () => {
  const event = reportRouteEvent({
    ...input,
    error: new Error("D1_ERROR: Network connection lost"),
    event: "failure"
  });
  assert.equal(event.error, "Error: D1_ERROR: Network connection lost");
});

test("the logger writes one parseable JSON record on the matching channel", () => {
  const recorded: Array<{ level: string; argument: unknown }> = [];
  const originalError = console.error,
    originalWarn = console.warn;
  console.error = (...args: unknown[]) => recorded.push({ level: "error", argument: args[1] });
  console.warn = (...args: unknown[]) => recorded.push({ level: "warn", argument: args[1] });
  try {
    logReportFailure(input);
    logReportDegraded({ ...input, status: null, error: "artwork protocol-11 unavailable" });
  } finally {
    console.error = originalError;
    console.warn = originalWarn;
  }
  assert.deepEqual(
    recorded.map((entry) => entry.level),
    ["error", "warn"]
  );
  const failure = JSON.parse(String(recorded[0]!.argument));
  const degraded = JSON.parse(String(recorded[1]!.argument));
  assert.equal(failure.event, "failure");
  assert.equal(failure.status, 503);
  assert.equal(degraded.event, "degraded");
  assert.equal(degraded.status, null);
  assert.equal(degraded.error, "string: artwork protocol-11 unavailable");
});
