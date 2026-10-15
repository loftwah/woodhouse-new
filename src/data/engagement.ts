import {
  analyticsSchema,
  isObject,
  periodFor,
  type AnalyticsProject,
  type Metric,
  type ProjectAnalytics
} from "./portfolio-analytics.ts";
const origins: Record<string, string> = {
  woodhouse: "https://woodhouse.loftwah.com",
  shoalshot: "https://shoalshot.loftwah.com",
  "protocol-11": "https://protocol11.loftwah.com"
};
const modes: Record<string, string[]> = {
  woodhouse: ["site"],
  shoalshot: ["dive"],
  "protocol-11": ["classic", "journey", "private_room", "public_matchmaking"]
};
const events = new Set([
  "visit",
  "engaged",
  "project_open",
  "game_start",
  "game_complete",
  "game_replay",
  "active_time"
]);
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export type EngagementEvent = {
  schema: "woodhouse.engagement/1";
  project: string;
  eventId: string;
  sessionId: string;
  event: string;
  seconds: number;
  mode: string;
  target: string;
  browserToken?: string;
};
function parseEngagement(raw: unknown): EngagementEvent | null {
  if (
    !isObject(raw) ||
    raw.schema !== "woodhouse.engagement/1" ||
    typeof raw.project !== "string" ||
    !Object.hasOwn(origins, raw.project) ||
    typeof raw.eventId !== "string" ||
    !uuid.test(raw.eventId) ||
    typeof raw.sessionId !== "string" ||
    !uuid.test(raw.sessionId) ||
    typeof raw.event !== "string" ||
    !events.has(raw.event) ||
    Object.keys(raw).some(
      (k) =>
        ![
          "schema",
          "project",
          "eventId",
          "sessionId",
          "event",
          "seconds",
          "mode",
          "target",
          "browserToken"
        ].includes(k)
    )
  )
    return null;
  if (
    raw.browserToken !== undefined &&
    (typeof raw.browserToken !== "string" || !uuid.test(raw.browserToken))
  )
    return null;
  const mode =
    typeof raw.mode === "string"
      ? raw.mode
      : raw.event === "visit"
        ? "visit"
        : raw.project === "woodhouse"
          ? "site"
          : "";
  if (
    (raw.event === "visit"
      ? mode !== "visit" && !modes[raw.project]?.includes(mode)
      : !modes[raw.project]?.includes(mode)) ||
    (raw.project === "woodhouse" && raw.event.startsWith("game_")) ||
    (raw.project !== "woodhouse" && raw.event === "project_open")
  )
    return null;
  const seconds = raw.event === "active_time" ? raw.seconds : 0;
  if (
    typeof seconds !== "number" ||
    !Number.isInteger(seconds) ||
    seconds < 0 ||
    seconds > 30 ||
    (raw.event === "active_time" && seconds < 1)
  )
    return null;
  const target =
    raw.event === "project_open" &&
    typeof raw.target === "string" &&
    ["app-composer", "fighter", "shoalshot", "protocol-11", "loftwahfm", "bubbles"].includes(
      raw.target
    )
      ? raw.target
      : "";
  if (raw.event === "project_open" && !target) return null;
  return {
    schema: "woodhouse.engagement/1",
    project: raw.project,
    eventId: raw.eventId,
    sessionId: raw.sessionId,
    event: raw.event,
    seconds,
    mode,
    target,
    ...(typeof raw.browserToken === "string" ? { browserToken: raw.browserToken } : {})
  };
}
async function hash(value: string) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)))
  )
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
function headers(origin: string | null) {
  return {
    "cache-control": "private, no-store",
    "access-control-allow-origin": origin ?? "https://woodhouse.loftwah.com",
    vary: "Origin",
    "x-content-type-options": "nosniff"
  };
}
export async function collectEngagement(request: Request, db: D1Database, now = Date.now()) {
  const origin = request.headers.get("origin");
  const allowed = origin !== null && Object.values(origins).includes(origin);
  if (!allowed) return new Response(null, { status: 403, headers: headers(null) });
  if (request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: {
        ...headers(origin),
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "Content-Type",
        "access-control-max-age": "86400"
      }
    });
  if (request.method !== "POST")
    return new Response(null, { status: 405, headers: headers(origin) });
  if (
    request.headers.get("dnt") === "1" ||
    request.headers.get("sec-gpc") === "1" ||
    /bot|crawler|spider|headless|playwright|curl|python|wget|monitor/i.test(
      request.headers.get("user-agent") ?? ""
    ) ||
    request.headers.has("x-analytics-test")
  )
    return new Response(null, { status: 204, headers: headers(origin) });
  if (
    !request.headers.get("content-type")?.startsWith("application/json") ||
    Number(request.headers.get("content-length")) > 2048
  )
    return new Response(null, { status: 400, headers: headers(origin) });
  // Bound the stream, including requests without Content-Length.
  let body = "";
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers: headers(origin) });
  let size = 0;
  const decoder = new TextDecoder();
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.length;
    if (size > 2048) {
      await reader.cancel();
      return new Response(null, { status: 413, headers: headers(origin) });
    }
    body += decoder.decode(chunk.value, { stream: true });
  }
  body += decoder.decode();
  let event: EngagementEvent | null;
  try {
    event = parseEngagement(JSON.parse(body));
  } catch {
    event = null;
  }
  if (!event || origins[event.project] !== origin)
    return new Response(null, { status: 400, headers: headers(origin) });
  const day = new Date(now).toISOString().slice(0, 10);
  const timestamp = Math.floor(now / 1000);
  // Hashes never appear in public aggregates; no IP, URL, referrer or browser fingerprint is stored.
  const ip = request.headers.get("cf-connecting-ip");
  if (!ip) return new Response(null, { status: 403, headers: headers(origin) });
  const bucket = await hash(`${day}:${Math.floor(timestamp / 60)}:${event.project}:${ip}`);
  const limit = await db
    .prepare(
      "INSERT INTO wh_analytics_limits(bucket,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1 RETURNING attempts"
    )
    .bind(bucket, timestamp + 120)
    .first<{ attempts: number }>();
  if (!limit || limit.attempts > 120)
    return new Response(null, {
      status: 429,
      headers: { ...headers(origin), "retry-after": "60" }
    });
  const session = await hash(`${event.project}:${event.sessionId}`);
  // A visit and engaged marker count once per tab session, regardless of client retries/event IDs.
  const eventId = await hash(
    `${event.project}:${["visit", "engaged"].includes(event.event) ? `${event.sessionId}:${event.event}` : event.eventId}`
  );
  // Optional wire compatibility must not create identity history before a product's
  // reviewed consent client is enabled. Other products still count anonymously.
  const browser =
    event.project === "woodhouse" && event.browserToken
      ? await hash(
          `woodhouse.browser-return/1:${event.project}:${event.browserToken.toLowerCase()}`
        )
      : null;
  await db.batch([
    db
      .prepare(
        "INSERT OR IGNORE INTO wh_analytics_sessions(project,session_hash,started_at,last_at) VALUES(?,?,?,?)"
      )
      .bind(event.project, session, timestamp, timestamp),
    db
      .prepare(
        "INSERT OR IGNORE INTO wh_analytics_events(project,event_id,session_hash,kind,seconds,mode,day,received_at) SELECT ?,?,?,?,?,?,?,? WHERE ?=0 OR EXISTS(SELECT 1 FROM wh_analytics_sessions WHERE project=? AND session_hash=? AND active_seconds+?<=?-started_at+1)"
      )
      .bind(
        event.project,
        eventId,
        session,
        event.event,
        event.seconds,
        event.mode,
        day,
        timestamp,
        event.seconds,
        event.project,
        session,
        event.seconds,
        timestamp
      ),
    ...(browser && event.event === "visit"
      ? [
          db
            .prepare(
              "INSERT OR IGNORE INTO wh_analytics_browser_visits(project,session_hash,browser_hash,day,received_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM wh_analytics_events WHERE project=? AND event_id=? AND kind='visit')"
            )
            .bind(event.project, session, browser, day, timestamp, event.project, eventId),
          db
            .prepare(
              "INSERT OR IGNORE INTO wh_analytics_browser_coverage(project,started_at) VALUES(?,?)"
            )
            .bind(event.project, timestamp)
        ]
      : []),
    ...(event.target
      ? [
          db
            .prepare(
              "INSERT OR IGNORE INTO wh_analytics_events(project,event_id,session_hash,kind,seconds,mode,day,received_at) VALUES(?,?,?,?,0,?,?,?)"
            )
            .bind(
              event.project,
              eventId + ":target",
              session,
              `referral_${event.target.replaceAll("-", "_")}`,
              event.mode,
              day,
              timestamp
            )
        ]
      : []),
    db
      .prepare("DELETE FROM wh_analytics_browser_visits WHERE received_at<?")
      .bind(timestamp - 90 * 86400),
    db.prepare("DELETE FROM wh_analytics_events WHERE received_at<?").bind(timestamp - 90 * 86400),
    db.prepare("DELETE FROM wh_analytics_sessions WHERE last_at<?").bind(timestamp - 90 * 86400),
    db.prepare("DELETE FROM wh_analytics_limits WHERE expires_at<?").bind(timestamp - 86400)
  ]);
  return new Response(null, { status: 204, headers: headers(origin) });
}
const definitions: Record<
  string,
  { key: string; label: string; unit: "count" | "seconds"; definition: string }
> = {
  visit: {
    key: "visits",
    label: "Visits",
    unit: "count",
    definition:
      "One accepted visit marker per tab session; sessions reset after 30 minutes idle. Reloads in the same session do not add visits. Not distinct people."
  },
  engaged: {
    key: "engaged_sessions",
    label: "Engaged sessions",
    unit: "count",
    definition:
      "One accepted marker per tab session after at least 10 seconds of active product use. Foreground, unpaused and recent trusted input required."
  },
  game_start: {
    key: "game_starts",
    label: "Games started",
    unit: "count",
    definition:
      "Accepted new game/dive start actions; restoring or resuming a saved game does not count. Client reported, not verified human play. Multiplayer tabs report participations, not distinct tables."
  },
  game_complete: {
    key: "game_completions",
    label: "Games completed",
    unit: "count",
    definition:
      "Accepted terminal game/result transitions. Client reported; not a validated competitive result. Multiplayer tabs report participations, not distinct tables."
  },
  game_replay: {
    key: "game_replays",
    label: "Deliberate replays",
    unit: "count",
    definition:
      "Accepted deliberate repeat new-game actions in the same tab session, after completion or abandonment. Automatic restores/resumes are excluded."
  },
  active_time: {
    key: "active_seconds",
    label: "Active time",
    unit: "seconds",
    definition:
      "Accepted 1–30 second foreground, unpaused activity increments, ending 30 seconds after trusted input. Server bounds total by session wall time. Radio time is excluded."
  },
  project_open: {
    key: "project_opens",
    label: "Project discoveries",
    unit: "count",
    definition:
      "Accepted deliberate clicks from Woodhouse to a published project destination. Counts clicks, not visits received by that project."
  }
};
export async function localAnalytics(
  db: D1Database,
  project: AnalyticsProject,
  days: number,
  now = Date.now(),
  requestedWindow?: ProjectAnalytics["period"]
): Promise<ProjectAnalytics> {
  const period = requestedWindow ?? periodFor(days, now);
  const generatedAt = new Date(now).toISOString();
  const first = await db
    .prepare("SELECT MIN(day) AS day FROM wh_analytics_daily WHERE project=?")
    .bind(project)
    .first<{ day: string | null }>();
  const rows = await db
    .prepare(
      "SELECT day,metric,value FROM wh_analytics_daily WHERE project=? AND day>=? AND day<=? ORDER BY day"
    )
    .bind(project, period.from, period.to)
    .all<{ day: string; metric: string; value: number }>();
  const started = first?.day ?? null;
  const metrics: Metric[] = Object.entries(definitions)
    .filter(([kind]) =>
      project === "woodhouse" ? !kind.startsWith("game_") : kind !== "project_open"
    )
    .map(([kind, d]) => {
      const daily: Metric["daily"] = [];
      if (started)
        for (let t = Date.parse(period.from); t <= Date.parse(period.to); t += 86400000) {
          const date = new Date(t).toISOString().slice(0, 10);
          if (date < started) continue;
          daily.push({
            date,
            value: rows.results.find((r) => r.day === date && r.metric === kind)?.value ?? 0
          });
        }
      return {
        ...d,
        value: daily.length ? daily.reduce((s, r) => s + r.value, 0) : null,
        quality: daily.length ? "exact" : "unavailable",
        daily
      };
    });
  // Only Woodhouse's reviewed client currently offers consent. Collector acceptance alone
  // must never advertise that Protocol 11 or SHOALSHOT adopted browser measurement.
  const browserStart =
    project === "woodhouse"
      ? await db
          .prepare("SELECT started_at FROM wh_analytics_browser_coverage WHERE project=?")
          .bind(project)
          .first<{ started_at: number }>()
      : null;
  const retainedFrom = new Date(now - 90 * 86400000).toISOString().slice(0, 10);
  const browserStartDay = browserStart
    ? new Date(browserStart.started_at * 1000).toISOString().slice(0, 10)
    : null;
  // A UTC day intersecting expired raw history cannot support an exact period distinct.
  const available =
    browserStartDay !== null && period.to >= browserStartDay && period.from > retainedFrom;
  const browserDaily = available
    ? await db
        .prepare(
          `
    SELECT v.day, COUNT(DISTINCT v.browser_hash) AS browsers,
      COUNT(DISTINCT CASE WHEN EXISTS (
        SELECT 1 FROM wh_analytics_browser_visits p WHERE p.project=v.project
          AND p.browser_hash=v.browser_hash AND p.sequence<v.sequence AND p.received_at>=?
      ) THEN v.browser_hash END) AS returning_browsers
    FROM wh_analytics_browser_visits v WHERE v.project=? AND v.day>=? AND v.day<=? AND v.received_at>=?
    GROUP BY v.day ORDER BY v.day`
        )
        .bind(
          Math.floor(now / 1000) - 90 * 86400,
          project,
          period.from,
          period.to,
          Math.floor(now / 1000) - 90 * 86400
        )
        .all<{ day: string; browsers: number; returning_browsers: number }>()
    : null;
  const browserTotals = available
    ? await db
        .prepare(
          `
    SELECT COUNT(DISTINCT v.browser_hash) AS browsers,
      COUNT(DISTINCT CASE WHEN EXISTS (
        SELECT 1 FROM wh_analytics_browser_visits p WHERE p.project=v.project
          AND p.browser_hash=v.browser_hash AND p.sequence<v.sequence AND p.received_at>=?
      ) THEN v.browser_hash END) AS returning_browsers
    FROM wh_analytics_browser_visits v WHERE v.project=? AND v.day>=? AND v.day<=? AND v.received_at>=?`
        )
        .bind(
          Math.floor(now / 1000) - 90 * 86400,
          project,
          period.from,
          period.to,
          Math.floor(now / 1000) - 90 * 86400
        )
        .first<{ browsers: number; returning_browsers: number }>()
    : null;
  for (const [key, label] of [
    ["browsers", "Reporting browsers"],
    ["returning_browsers", "Returning browsers"]
  ] as const) {
    const daily: Metric["daily"] = [];
    if (available && browserStartDay)
      for (let t = Date.parse(period.from); t <= Date.parse(period.to); t += 86400000) {
        const date = new Date(t).toISOString().slice(0, 10);
        if (date < browserStartDay) continue;
        daily.push({ date, value: browserDaily?.results.find((r) => r.day === date)?.[key] ?? 0 });
      }
    metrics.push({
      key,
      label,
      unit: "count",
      value: browserTotals?.[key] ?? null,
      quality: browserTotals ? "partial" : "unavailable",
      definition:
        project !== "woodhouse"
          ? "Not measured: this product has not enabled optional browser-return measurement. Tab sessions cannot establish returns."
          : key === "browsers"
            ? "Distinct optionally consenting, project-scoped browser tokens with accepted visits in the selected UTC window. Period DISTINCT, not a sum of daily browser counts. Tokens rotate after 90 days; resets, multiple devices and privacy choices prevent interpreting these as people."
            : "Distinct optionally consenting browser tokens with a visit in this UTC window and an earlier different accepted tab session in retained 90-day history, including same-day returns. Period DISTINCT, not a sum of daily returns. This is not cohort retention; expired earlier visits and token rotation hide returns.",
      daily
    });
  }
  return {
    schema: analyticsSchema,
    project,
    generatedAt,
    timezone: "UTC",
    period,
    coverage: {
      startedAt: started ? `${started}T00:00:00.000Z` : null,
      comparableFrom: started ? `${started}T00:00:00.000Z` : null,
      through: generatedAt,
      quality: metrics.some((m) => m.value !== null) ? "partial" : "unavailable",
      limitations: [
        "Exact accepted event counters, not unique humans or anti-cheat proof. Blocking, opt-out, offline play and automated traffic affect coverage.",
        "DNT, GPC, designated QA and preview traffic are excluded. Production browser measurements start with this release; no historical backfill.",
        "Current UTC day and collection-start day may be partial. Cross-device retention, cohort retention and acquisition sources are not measured.",
        ...(project === "woodhouse"
          ? [
              browserStart
                ? `Optional browser measurement first accepted a consenting visit at ${new Date(browserStart.started_at * 1000).toISOString()}. Earlier browser history is unavailable.`
                : "Optional browser measurement has not yet received a consenting visit; browser counts are unavailable.",
              "Browser measures cover opt-in visits only and remain partial. Private project-scoped visit associations expire after 90 days; a window intersecting expired history is unavailable. Browser totals use retained period DISTINCT counts, never daily sums."
            ]
          : [
              "Browser returns are unavailable until this product releases its own optional consent client."
            ])
      ]
    },
    metrics,
    source: {
      endpoint: `https://woodhouse.loftwah.com/api/portfolio-analytics?project=${project}`,
      revision: null
    }
  };
}
