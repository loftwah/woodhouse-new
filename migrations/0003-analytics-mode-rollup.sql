-- Forward application tables only; do not apply through the EmDash migration ledger.
--
-- The existing wh_analytics_rollup keeps writing one overall counter per day
-- (`metric = NEW.kind`), and it stays untouched. This trigger writes the same
-- accepted event a second time under a mode-suffixed name (`game_start_classic`,
-- `active_time_public_matchmaking`), so the daily split survives the 90-day
-- retention that eventually deletes wh_analytics_events: after expiry the raw
-- events, which are the only other copy of the mode, are gone.
--
-- Only the additive gameplay counters are split. `visit` and `engaged` are tab
-- session markers, and one tab session can span several modes, so per-mode session
-- counts would overlap and double-count; `project_open` and the derived
-- `referral_<slug>` rows describe discovery, not play. The reader publishes a
-- split only for a product whose client reports more than one play mode.
--
-- Both triggers fire on the same accepted insert, and an ignored duplicate
-- (`INSERT OR IGNORE` that matches the primary key, or the active-time wall-clock
-- guard) fires neither, so an overall counter and its mode subtotals can only ever
-- move together.
CREATE TRIGGER IF NOT EXISTS wh_analytics_mode_rollup AFTER INSERT ON wh_analytics_events
WHEN NEW.kind IN ('game_start', 'game_complete', 'game_replay', 'active_time')
 AND NEW.mode <> ''
BEGIN
 INSERT INTO wh_analytics_daily(project, day, metric, value)
 VALUES(
  NEW.project,
  NEW.day,
  NEW.kind || '_' || NEW.mode,
  CASE WHEN NEW.kind = 'active_time' THEN NEW.seconds ELSE 1 END
 )
 ON CONFLICT(project, day, metric) DO UPDATE SET value = value + excluded.value;
END;

-- Backfill the split from the raw events still retained. This is a replace-style
-- upsert, not an increment: the SELECT is the absolute count for a retained UTC
-- day, so re-running the statement with the same retained events writes the same
-- values and cannot double-count what the trigger has already written.
--
-- Coverage boundary: retention deletes wh_analytics_events whose received_at is
-- older than 90 days, so a UTC day strictly after the retention floor is still
-- complete while the boundary day is already partially trimmed. `day >` the floor
-- keeps the split exact for every day it writes — the mode subtotals of a
-- complete day sum to that day's overall counter — and leaves the trimmed boundary
-- day and every earlier day as gaps rather than guessed values. Earlier
-- wh_analytics_daily rows cannot be reconstructed from the events that no longer
-- exist, and are deliberately not interpolated.
INSERT INTO wh_analytics_daily(project, day, metric, value)
SELECT
 project,
 day,
 kind || '_' || mode,
 CASE WHEN kind = 'active_time' THEN SUM(seconds) ELSE COUNT(*) END
FROM wh_analytics_events
WHERE kind IN ('game_start', 'game_complete', 'game_replay', 'active_time')
 AND mode <> ''
 AND day > strftime('%Y-%m-%d', 'now', '-90 days')
GROUP BY project, day, kind, mode
ON CONFLICT(project, day, metric) DO UPDATE SET value = excluded.value;
