/** Authored views of existing public measures. Identities/adoption stay in EmDash.
 * Reviewed 23 October 2026; no visitor identity or cross-product funnel. */
import { type PortfolioReport, type ReportingWindow } from "./portfolio-analytics.ts";
import { dailyPoints, dailyStatus, reportQualifier } from "./analytics-workbench.ts";
export type OutcomeStory = {
  key: "link-check" | "music";
  project: "app-composer" | "loftwahfm";
  name: string;
  title: string;
  benefit: string;
  relationship: string;
  measure: string;
  label: string;
  colour: string;
  artwork: string;
  actionHref: string;
  actionLabel: string;
  reportHref: string;
  reportScope: string;
  boundary: string;
};
export const outcomeStories: readonly OutcomeStory[] = [
  {
    key: "link-check",
    project: "app-composer",
    name: "Link Check × App Composer",
    title: "Know where a link will take you.",
    benefit:
      "Inspect a link before you share it. Link Check follows the address and shows what it finds; Composer brings this independently hosted tool into a collection of useful apps.",
    relationship:
      "Link Check works at its own address and inside Composer. Its completed inspections are reported through Composer’s public app contract. Opening the app and finishing an inspection are separate measures.",
    measure: "inspection_completed",
    label: "Completed Link Checks",
    colour: "#ff975a",
    artwork: "/og/projects/app-composer.jpg",
    actionHref: "https://share.loftwah.com",
    actionLabel: "Inspect a link",
    reportHref:
      "https://composer.loftwah.com/activity/linkcheck?days=30&surface=all&metric=inspection_completed",
    reportScope:
      "Composer’s native report covers the latest 30 UTC days, all connected route versions. It moves with time; this saved Woodhouse window stays fixed.",
    boundary:
      "Reported completed inspections, including repeat jobs. Bounded counters can omit activity. These are not unique people or proof of a composed owner workflow."
  },
  {
    key: "music",
    project: "loftwahfm",
    name: "LoftwahFM × games",
    title: "A soundtrack with somewhere to go.",
    benefit:
      "Find music to listen to, then hear how the same station can sit inside a game. LoftwahFM owns the stream; the game keeps its controls, sound effects and save.",
    relationship:
      "Games can use FM’s versioned browser client and public stations. The listening history here includes every admitted FM source. Only the separately labelled game-attributed measure describes music reported by games.",
    measure: "listening_seconds",
    label: "All-source audible listening",
    colour: "#a4d8ff",
    artwork: "/share/previews/fm-cover-this-is-loftwahfm.webp",
    actionHref: "https://fm.loftwah.com/radio",
    actionLabel: "Find a station",
    reportHref: "https://fm.loftwah.com/analytics?days=30",
    reportScope:
      "FM’s native report opens its latest 30-day overview. It includes its own source filters; its moving window may differ from this frozen Woodhouse report.",
    boundary:
      "Accepted audible music time across all admitted sources. This is not gameplay time or unique listeners. History before 15 October may include unmarked verification."
  }
];
export function storyFor(value: string | null | undefined) {
  return outcomeStories.find((s) => s.key === value) ?? null;
}
export function outcomeEvidence(
  report: PortfolioReport | null,
  story: OutcomeStory,
  period: ReportingWindow
) {
  const source = report?.projects.find((p) => p.project === story.project)?.report ?? null;
  const metric = source?.metrics.find((m) => m.key === story.measure);
  const value = metric?.value ?? null;
  const daily = dailyPoints(metric, period).map((value, i) => ({
    date: new Date(Date.parse(period.from) + i * 86400000).toISOString().slice(0, 10),
    value
  }));
  const display =
    value === null
      ? "Not measured"
      : story.measure === "listening_seconds"
        ? `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m ${value % 60}s`
        : value.toLocaleString("en-AU");
  return {
    value,
    display,
    definition: metric?.definition ?? "The source has not supplied this measure for these dates.",
    quality: metric?.quality ?? "unavailable",
    coverage: reportQualifier(metric, source, period),
    daily,
    statuses: daily.map((point) => dailyStatus(source, metric, point.date)),
    limitations: source?.coverage.limitations ?? [
      "The source report is unavailable. Missing evidence is not a measured zero."
    ],
    source: source?.source ?? null
  };
}
export function storyLink(
  story: OutcomeStory,
  reportId?: string,
  origin = "https://woodhouse.loftwah.com"
) {
  const url = new URL("/connections/", origin);
  url.searchParams.set("story", story.key);
  if (reportId) url.searchParams.set("report", reportId);
  return url.href;
}
export function outcomeCaption(report: PortfolioReport, story: OutcomeStory, origin?: string) {
  const period = report.period!;
  const evidence = outcomeEvidence(report, story, period);
  return `${story.title}\n${evidence.display} · ${story.label}\n${period.from} to ${period.to} UTC · ${evidence.coverage}\n${evidence.definition}\n${story.boundary}\n${evidence.limitations.join(" ")}\nSnapshot ${report.id}\n${storyLink(story, report.id, origin)}`;
}
