/**
 * Privacy-safe failure evidence for the public report routes.
 *
 * A failed render used to leave nothing behind: the routes' empty `catch`
 * returned a 503 and an operator had no way to tell a font timeout from a
 * database read or an SVG composition error. These records name the route, the
 * stage that failed, the dependency involved, how long the request had run and
 * the response status. `describeError` masks URLs, filesystem paths,
 * credentials and long opaque identifiers; stacks, request URLs and query
 * strings never reach the record, and a report id is repeated only when it is
 * already a public 24-hex snapshot id.
 */
export type ReportDependency = "cms" | "database" | "font" | "artwork" | "wasm" | "render";

export type ReportRouteEvent = {
  event: "failure" | "degraded";
  route: string;
  stage: string;
  scope: string;
  report: string;
  dependency: ReportDependency;
  durationMs: number;
  status: number | null;
  error: string;
};

export type ReportRouteLogInput = {
  route: string;
  stage: string;
  scope: string;
  reportId: string | null;
  dependency: ReportDependency;
  durationMs: number;
  status: number | null;
  error: unknown;
};

const publicReportId = /^[a-f0-9]{24}$/;

/** Only a value that is already a public snapshot id is safe to repeat. */
function reportIdShape(value: string | null) {
  if (!value) return "absent";
  return publicReportId.test(value) ? value : "malformed";
}

// Applied in order: URLs and paths first, then credentials, then any remaining
// long opaque identifier. None of these patterns is allowed to leave its input
// in the record unchanged.
const redactions: Array<[RegExp, string]> = [
  [/\bhttps?:\/\/[^\s"'<>]+/gi, "[url]"],
  [/(?<![\w:/])\/[^\s"'<>]*\?[^\s"'<>]*/g, "[url]"],
  [/(?:\/|[A-Za-z]:\\)[^\s()"']+:\d+:\d+/g, "[stack]"],
  [/(?:^|[\s(])(?:\/|[A-Za-z]:\\)[^\s)'"<>]+/g, "$1[path]"],
  [/\b(?:Bearer|Basic|Token)\s+[A-Za-z0-9._~+/=-]+/gi, "[credential]"],
  [
    /\b(token|key|secret|password|signature|sig|access_token|api_key)["']?\s*[:=]\s*["']?[^\s&"'<>]+/gi,
    "$1=[redacted]"
  ],
  [/\b[A-Za-z0-9_-]{20,}\b/g, "[id]"]
];

function describeError(error: unknown) {
  const name = error instanceof Error ? error.name : typeof error;
  const raw =
    error instanceof Error ? error.message : typeof error === "string" ? error : "unprintable";
  let message = raw;
  for (const [pattern, replacement] of redactions) message = message.replace(pattern, replacement);
  return `${name}: ${message.replace(/\s+/g, " ").trim()}`.slice(0, 160);
}

export function reportRouteEvent(
  input: ReportRouteLogInput & { event: ReportRouteEvent["event"] }
): ReportRouteEvent {
  return {
    event: input.event,
    route: input.route,
    stage: input.stage,
    scope: input.scope,
    report: reportIdShape(input.reportId),
    dependency: input.dependency,
    durationMs: Math.max(0, Math.round(input.durationMs)),
    status: input.status,
    error: describeError(input.error)
  };
}

/** A failed request. The route still answers with its own 503. */
export function logReportFailure(input: ReportRouteLogInput) {
  console.error("report-failure", JSON.stringify(reportRouteEvent({ ...input, event: "failure" })));
}

/** Optional decoration was skipped; the response itself is still the real card. */
export function logReportDegraded(input: ReportRouteLogInput) {
  console.warn(
    "report-degraded",
    JSON.stringify(reportRouteEvent({ ...input, event: "degraded" }))
  );
}
