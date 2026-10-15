-- Forward application tables only; do not apply through the EmDash migration ledger.
-- Private project-scoped hashes, never raw client/browser/session identifiers.
CREATE TABLE IF NOT EXISTS wh_analytics_browser_visits (
 sequence INTEGER PRIMARY KEY AUTOINCREMENT,
 project TEXT NOT NULL, session_hash TEXT NOT NULL, browser_hash TEXT NOT NULL,
 day TEXT NOT NULL, received_at INTEGER NOT NULL,
 UNIQUE(project,session_hash)
);
CREATE INDEX IF NOT EXISTS wh_analytics_browser_window
 ON wh_analytics_browser_visits(project,day,browser_hash);
CREATE INDEX IF NOT EXISTS wh_analytics_browser_previous
 ON wh_analytics_browser_visits(project,browser_hash,sequence);
CREATE INDEX IF NOT EXISTS wh_analytics_browser_expiry
 ON wh_analytics_browser_visits(received_at);
CREATE TABLE IF NOT EXISTS wh_analytics_browser_coverage (
 project TEXT PRIMARY KEY, started_at INTEGER NOT NULL
);
