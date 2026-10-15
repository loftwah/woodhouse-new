-- Application analytics tables are separate from EmDash's core migration ledger.
CREATE TABLE IF NOT EXISTS wh_analytics_events (
 project TEXT NOT NULL, event_id TEXT NOT NULL, session_hash TEXT NOT NULL,
 kind TEXT NOT NULL, seconds INTEGER NOT NULL DEFAULT 0, mode TEXT NOT NULL,
 day TEXT NOT NULL, received_at INTEGER NOT NULL,
 PRIMARY KEY(project,event_id)
);
CREATE INDEX IF NOT EXISTS wh_analytics_events_day ON wh_analytics_events(project,day);
CREATE TABLE IF NOT EXISTS wh_analytics_sessions (
 project TEXT NOT NULL, session_hash TEXT NOT NULL, started_at INTEGER NOT NULL,
 last_at INTEGER NOT NULL, active_seconds INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY(project,session_hash)
);
CREATE TABLE IF NOT EXISTS wh_analytics_daily (
 project TEXT NOT NULL, day TEXT NOT NULL, metric TEXT NOT NULL,
 value INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(project,day,metric)
);
CREATE TABLE IF NOT EXISTS wh_analytics_limits (
 bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS wh_analytics_reports (
 id TEXT PRIMARY KEY, created_at TEXT NOT NULL, days INTEGER NOT NULL, body TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS wh_analytics_reports_date ON wh_analytics_reports(created_at);
CREATE TRIGGER IF NOT EXISTS wh_analytics_rollup AFTER INSERT ON wh_analytics_events BEGIN
 INSERT INTO wh_analytics_daily(project,day,metric,value)
 VALUES(NEW.project,NEW.day,NEW.kind,CASE WHEN NEW.kind='active_time' THEN NEW.seconds ELSE 1 END)
 ON CONFLICT(project,day,metric) DO UPDATE SET value=value+excluded.value;
 UPDATE wh_analytics_sessions SET last_at=MAX(last_at,NEW.received_at),
 active_seconds=active_seconds+NEW.seconds
 WHERE project=NEW.project AND session_hash=NEW.session_hash;
END;
CREATE INDEX IF NOT EXISTS wh_analytics_limits_expiry ON wh_analytics_limits(expires_at);
CREATE INDEX IF NOT EXISTS wh_analytics_events_expiry ON wh_analytics_events(received_at);
CREATE INDEX IF NOT EXISTS wh_analytics_sessions_expiry ON wh_analytics_sessions(last_at);
