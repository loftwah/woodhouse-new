/** Authored views of existing public measures. Identities/adoption stay in EmDash.
 * Reviewed 23 October 2026; no visitor identity or cross-product funnel. */
import { type PortfolioReport, type ReportingWindow } from "./portfolio-analytics.ts";
import { dailyPoints, dailyStatus, reportQualifier } from "./analytics-workbench.ts";
export type OutcomeStory = {
  key: "link-check" | "music" | "bubbles" | "protocol-11" | "fighter" | "shoalshot";
  project: "app-composer" | "loftwahfm" | "bubbles" | "protocol-11" | "fighter" | "shoalshot";
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
  mode?: string;
  nativeLabel?: string;
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
  },
  {
    nativeLabel: "Open the native game",
    key: "protocol-11",
    project: "protocol-11",
    name: "Protocol 11",
    title: "A different table every round.",
    benefit:
      "Play a changing card game solo or with friends. Each round brings another Protocol; the House Circuit gives a solo player a path through twelve stages.",
    relationship:
      "Classic, Journey, private rooms and public matchmaking are separate modes. This story selects reported active time in Classic only; it never borrows time from another mode.",
    measure: "active_seconds_classic",
    label: "Classic active gameplay",
    colour: "#79d8ff",
    artwork: "/share/protocol-11/last-card-cover.jpg",
    actionHref: "https://protocol11.loftwah.com/",
    actionLabel: "Play Protocol 11",
    reportHref: "https://protocol11.loftwah.com/",
    reportScope:
      "Open the native game to explore its table history and rules. Native records describe their own modes and rules; this report counts accepted active seconds in Classic, not scores.",
    boundary:
      "Classic mode only. Accepted active gameplay seconds are not completed hands, scores or unique players. Read the selected window’s source coverage before comparing periods.",
    mode: "Classic"
  },
  {
    nativeLabel: "Open the native game",
    key: "shoalshot",
    project: "shoalshot",
    name: "SHOALSHOT",
    title: "Read the tide. Place the shot.",
    benefit:
      "Read the tide, line up the target and place a pressure shot. SHOALSHOT puts the feel of that decision at the centre of its Tide Pool arcade slice on phone and desktop.",
    relationship:
      "A reported completion is a source-defined terminal game/result transition. The native game owns catches, collection, saves and rewards; a Woodhouse count never becomes a verified catch or leaderboard result.",
    measure: "game_completions",
    label: "Reported completed runs",
    colour: "#64d6bd",
    artwork: "/share/shoalshot/showcase-still/tideglass-landscape-field.jpg",
    actionHref: "https://shoalshot.loftwah.com/",
    actionLabel: "Play SHOALSHOT",
    reportHref: "https://shoalshot.loftwah.com/",
    reportScope:
      "Open SHOALSHOT and use its native collection and results. The public aggregate counts completed runs; it does not expose catches or a comparable leaderboard.",
    boundary:
      "Accepted terminal game/result transitions, including repeat runs. Client-reported activity is not a validated competitive score, catch or unique player."
  },
  {
    key: "fighter",
    project: "fighter",
    name: "Fighter",
    title: "A squad worth coming back to.",
    benefit:
      "Collect fighters, build a squad and commit moves on a shared Charge Strip. A short battle leads into a collection of characters and a story to work through.",
    relationship:
      "The public contract counts launched non-tutorial fights ending in a win, loss, draw or forfeit. Only the separate replay measure is limited to Quick Fight. Native results and character progress remain with Fighter.",
    measure: "game_completions",
    label: "Reported fight completions",
    colour: "#ff746a",
    artwork: "/share/fighter/loftwah-fighter-showcase-1080p.jpg",
    actionHref: "https://fighter.loftwah.com/",
    actionLabel: "Open Fighter",
    reportHref: "https://fighter.loftwah.com/?view=analytics",
    reportScope:
      "Fighter’s native aggregate view has its own moving window. This completion count is not a player score or evidence that every mode or phone journey has passed its release gates.",
    boundary:
      "Accepted non-tutorial fight results: win, loss, draw or forfeit, attributed to launch day. These are not wins or unique players. Consult the selected source coverage for historical verification risk."
  },
  {
    nativeLabel: "Open the native global boards",
    key: "bubbles",
    project: "bubbles",
    name: "Bubbles",
    title: "Find the angle. Clear the board.",
    benefit:
      "Line up a shot, match three or more and clear the board. Bubbles puts an arcade round, saved progress and a native global board in a browser tab.",
    relationship:
      "Woodhouse reads the public gameplay aggregates. Bubbles keeps score verification, stars and its global board. A zero run-completion count for this window does not mean nobody played outside the observed coverage.",
    measure: "game_completions",
    label: "Reported completed runs",
    colour: "#d8c2ff",
    artwork: "/share/bubbles/classic-gameplay-desktop-20261012.jpg",
    actionHref: "https://bubbles.loftwah.com/",
    actionLabel: "Play Bubbles",
    reportHref: "https://bubbles.loftwah.com/leaderboards?scope=global",
    reportScope:
      "The native global board owns eligible scores, ties and participants. Its scope differs from this dated aggregate of completion events.",
    boundary:
      "Reported terminal runs across supported games, not a count of successful board clears. Replay measurement is unavailable in this source, not zero. These are not unique players or best scores."
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
      : metric?.unit === "seconds"
        ? `${Math.floor(value / 3600)}h ${Math.floor((value % 3600) / 60)}m ${value % 60}s`
        : value.toLocaleString("en-AU");
  return {
    value,
    display,
    definition: metric?.definition ?? "The source has not supplied this measure for these dates.",
    unit: metric?.unit ?? (story.measure.includes("seconds") ? "seconds" : "count"),
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
