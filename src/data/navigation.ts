import type { PublicMenuItem } from "../content/repository";

/**
 * `/activity/` is Woodhouse Analytics and `/activity/leaderboards/` is the
 * separate engineering leaderboard. The desktop menu, phone Index and CMS menus
 * have drifted to "Activity", "Portfolio activity" and "Project leaderboards";
 * a CMS entry can also duplicate one supplied by another menu. Normalise both
 * labels and keep one of each, with Leaderboards beside Analytics rather than
 * buried in the secondary Index.
 */
export const analyticsLabel = "Analytics";
export const analyticsUrl = "/activity/";
export const leaderboardsLabel = "Leaderboards";
export const leaderboardsUrl = "/activity/leaderboards/";

const activityDestinations: PublicMenuItem[] = [
  { label: analyticsLabel, url: analyticsUrl },
  { label: leaderboardsLabel, url: leaderboardsUrl }
];

/**
 * A route's canonical `path` can carry a report's query string, so compare the
 * pathname without its query, hash or a trailing slash.
 */
export function normalisePathname(value: string): string {
  const [pathname = "/"] = value.split(/[?#]/, 1);
  if (!pathname.startsWith("/")) return pathname;
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : `${trimmed}/`;
}

export function isCurrentDestination(currentPath: string, url: string): boolean {
  if (!url.startsWith("/")) return false;
  return normalisePathname(currentPath) === normalisePathname(url);
}

function isDestination(link: PublicMenuItem, url: string): boolean {
  return isCurrentDestination(link.url, url);
}

export function withDestinationLabels(links: PublicMenuItem[]): PublicMenuItem[] {
  return links.map((link) => {
    const destination = activityDestinations.find((item) => isDestination(link, item.url));
    return destination ? { ...link, label: destination.label } : link;
  });
}

/** Remove a destination repeated across the primary and secondary CMS menus. */
export function uniqueDestinations(links: PublicMenuItem[]): PublicMenuItem[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (!link.url.startsWith("/")) return true;
    const key = normalisePathname(link.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Ensure Analytics and Leaderboards are present once per navigation. A CMS
 * label and link survive; a missing destination gets the shared fallback and
 * Leaderboards always follows Analytics so an editor cannot bury it later.
 */
export function withActivityNavigation(links: PublicMenuItem[]): PublicMenuItem[] {
  const labelled = uniqueDestinations(withDestinationLabels(links));
  const leaderboards =
    labelled.find((link) => isDestination(link, leaderboardsUrl)) ??
    ({ label: leaderboardsLabel, url: leaderboardsUrl } satisfies PublicMenuItem);
  const withoutLeaderboards = labelled.filter((link) => !isDestination(link, leaderboardsUrl));
  const hasAnalytics = withoutLeaderboards.some((link) => isDestination(link, analyticsUrl));
  const result: PublicMenuItem[] = hasAnalytics
    ? [...withoutLeaderboards]
    : [{ label: analyticsLabel, url: analyticsUrl }, ...withoutLeaderboards];
  const analyticsIndex = result.findIndex((link) => isDestination(link, analyticsUrl));
  result.splice(analyticsIndex + 1, 0, leaderboards);
  return result;
}
