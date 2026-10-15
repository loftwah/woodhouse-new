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
};
function parseEngagement(raw: unknown): EngagementEvent | null {
  if (
    !isObject(raw) ||
    raw.schema !== "woodhouse.engagement/1" ||
    typeof raw.project !== "string" ||
    !origins[raw.project] ||
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
          "target"
        ].includes(k)
    )
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
    (raw.event !== "visit" && !modes[raw.project]?.includes(mode)) ||
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
    target
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
  now = Date.now()
): Promise<ProjectAnalytics> {
  const period = periodFor(days, now);
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
        value: started ? daily.reduce((s, r) => s + r.value, 0) : null,
        quality: started ? "exact" : "unavailable",
        daily
      };
    });
  for (const [key, label] of [
    ["browsers", "Distinct browsers"],
    ["returning_browsers", "Returning browsers"]
  ])
    metrics.push({
      key: key!,
      label: label!,
      unit: "count",
      value: null,
      quality: "unavailable",
      definition:
        "Not measured: this source stores no persistent browser identity. Tab sessions cannot establish returning browsers.",
      daily: []
    });
  return {
    schema: analyticsSchema,
    project,
    generatedAt,
    timezone: "UTC",
    period,
    coverage: {
      startedAt: started ? `${started}T00:00:00.000Z` : null,
      through: generatedAt,
      quality: started ? "partial" : "unavailable",
      limitations: [
        "Exact accepted event counters, not unique humans or anti-cheat proof. Blocking, opt-out, offline play and automated traffic affect coverage.",
        "DNT, GPC, designated QA and preview traffic are excluded. Production browser measurements start with this release; no historical backfill.",
        "Current UTC day and collection-start day may be partial. Browser returns, cross-device retention and acquisition sources are not measured."
      ]
    },
    metrics,
    source: {
      endpoint: `https://woodhouse.loftwah.com/api/portfolio-analytics?project=${project}`,
      revision: null
    }
  };
}
