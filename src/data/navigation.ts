import type { PublicMenuItem } from "../content/repository";

/**
 * `/activity/` is Woodhouse Analytics. The desktop menu and the phone Index had
 * drifted to "Activity" and "Portfolio activity", and a CMS menu entry can carry
 * any label at all, so the destination keeps one name wherever it is linked.
 */
export const analyticsLabel = "Analytics";
export const analyticsUrl = "/activity/";

export function withAnalyticsLabel(links: PublicMenuItem[]): PublicMenuItem[] {
  return links.map((link) =>
    link.url === analyticsUrl ? { ...link, label: analyticsLabel } : link
  );
}
