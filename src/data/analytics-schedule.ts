import { refreshLeaderboards } from "./github-collector.ts";
import { analyticsProjects } from "./portfolio-analytics.ts";
import { createPortfolioReport } from "./portfolio-reports.ts";
/** Only aggregate reporting runs in read-only mode; CMS maintenance stays disabled. */
export const analyticsCron = "17 * * * *";
async function refreshPortfolioReports(db: D1Database, fetcher: typeof fetch = fetch) {
  const cutoff = Math.floor(Date.now() / 1000) - 90 * 86400;
  await db.batch([
    db.prepare("DELETE FROM wh_analytics_browser_visits WHERE received_at<?").bind(cutoff),
    db.prepare("DELETE FROM wh_analytics_events WHERE received_at<?").bind(cutoff),
    db.prepare("DELETE FROM wh_analytics_sessions WHERE last_at<?").bind(cutoff),
    db
      .prepare("DELETE FROM wh_analytics_limits WHERE expires_at<?")
      .bind(Math.floor(Date.now() / 1000))
  ]);
  for (const days of [7, 30, 90])
    await createPortfolioReport(db, days, new Set(analyticsProjects), fetcher);
}

/** Dispatch is testable without importing the CMS or giving analytics authoring access. */
export function createAnalyticsScheduledHandler<
  Args extends [{ cron: string }, unknown, ...unknown[]]
>(
  fallback: (...args: Args) => unknown,
  refresh: (db: D1Database) => Promise<void> = refreshPortfolioReports
) {
  return async (...args: Args) => {
    const [controller, environment] = args;
    if (
      controller.cron === analyticsCron &&
      typeof environment === "object" &&
      environment !== null &&
      "WOODHOUSE_ENVIRONMENT" in environment &&
      environment.WOODHOUSE_ENVIRONMENT === "production" &&
      "DB" in environment
    ) {
      await Promise.all([
        refresh(environment.DB as D1Database),
        refreshLeaderboards(environment as { DB: D1Database; WOODHOUSE_GITHUB_TOKEN?: string })
      ]);
      return;
    }
    await fallback(...args);
  };
}
