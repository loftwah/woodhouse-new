/**
 * One Woodhouse-to-project discovery story, shared by the page, the caption and
 * all three report images.
 *
 * The observed failure this prevents: the page let a reader select a destination
 * while the frozen permalink, caption and image still described the whole
 * portfolio or a different destination. The story is therefore built once from
 * the frozen report and the same period, and every surface reads it rather than
 * deriving its own version.
 *
 * A recorded click is interest in opening a project on this origin. It is not
 * downstream play, adoption, a unique person or evidence that the destination's
 * own reporting agrees.
 */

import {
  formatMetric,
  type AnalyticsProject,
  type Metric,
  type PortfolioReport,
  type ProjectAnalytics,
  type ReportingWindow
} from "./portfolio-analytics.ts";
import { dateDays, projectColours } from "./analytics-workbench.ts";

type StoryCoverage = "observed" | "partial" | "unavailable";

type StoryWindow = {
  value: number | null;
  from: string;
  to: string;
  observedDays: number;
  days: number;
  state: StoryCoverage;
};

export type DiscoveryStory = {
  slug: string;
  name: string;
  colour: string;
  siteUrl: string | null;
  period: ReportingWindow;
  measure: { key: string; label: string; unit: "count"; meaning: string };
  value: number | null;
  valueLabel: string;
  daily: { date: string; value: number | null }[];
  observedDays: number;
  firstObserved: string | null;
  lastObserved: string | null;
  coverage: StoryCoverage;
  coverageLabel: string;
  recent: StoryWindow;
  prior: StoryWindow;
  comparison: { eligible: boolean; change: number | null; percent: number | null; reason: string };
  /** 1-based place among destinations with a positive recorded count. */
  rank: number | null;
  tiedAtTop: boolean;
  measuredDestinations: number;
  headline: string;
  kicker: string;
  establishes: string;
  doesNotEstablish: string;
  /** Why a value or comparison is absent, ready to print without hedging. */
  reason: string;
};

const DISCOVERY_MEASURE = {
  key: "project_opens",
  label: "Project discovery",
  unit: "count" as const,
  meaning:
    "Recorded clicks from Woodhouse to a project. A click shows someone chose to open the project; it does not show what they did after."
};

const plural = (value: number, one: string, many: string) =>
  `${value.toLocaleString("en-AU")} ${value === 1 ? one : many}`;

const coverageState = (observedDays: number, days: number): StoryCoverage =>
  observedDays === 0 ? "unavailable" : observedDays < days ? "partial" : "observed";

function windowSlice(metric: Metric | undefined, dates: string[]): StoryWindow {
  const observed = new Map(metric?.daily.map((point) => [point.date, point.value]) ?? []);
  const values = dates
    .map((date) => observed.get(date))
    .filter((v): v is number => v !== undefined);
  return {
    value: values.length ? values.reduce((sum, value) => sum + value, 0) : null,
    from: dates[0] ?? "",
    to: dates.at(-1) ?? "",
    observedDays: values.length,
    days: dates.length,
    state: coverageState(values.length, dates.length)
  };
}

/**
 * The projects whose referral counters exist in this report, in the same
 * descending order the discovery section uses. A zero counter is a measured
 * zero; an absent counter is missing history.
 */
function referralCounts(
  report: ProjectAnalytics | null | undefined,
  published?: ReadonlySet<string>
) {
  return (report?.metrics ?? [])
    .filter((metric) => metric.key.startsWith("referral_"))
    .map((metric) => ({
      slug: metric.key.slice("referral_".length).replaceAll("_", "-"),
      value: metric.value
    }))
    .filter(
      (entry): entry is { slug: string; value: number } =>
        entry.value !== null && entry.value > 0 && (!published || published.has(entry.slug))
    )
    .sort((a, b) => b.value - a.value);
}

export function discoveryStory(input: {
  report: PortfolioReport | null;
  slug: AnalyticsProject;
  name: string;
  siteUrl?: string | null;
  period: ReportingWindow;
  colour?: string;
  /** Published destinations the page can actually show. */
  published?: ReadonlySet<string>;
}): DiscoveryStory {
  const { report, slug, name, period } = input;
  const source = report?.projects.find((entry) => entry.project === "woodhouse")?.report ?? null;
  const metric = source?.metrics.find(
    (entry) => entry.key === `referral_${slug.replaceAll("-", "_")}`
  );
  const dates = dateDays(period);
  const observed = new Map(metric?.daily.map((point) => [point.date, point.value]) ?? []);
  const daily = dates.map((date) => ({
    date,
    value: observed.has(date) ? (observed.get(date) ?? 0) : null
  }));
  const observedDays = daily.filter((point) => point.value !== null).length;
  const firstObserved = daily.find((point) => point.value !== null)?.date ?? null;
  const lastObserved = [...daily].reverse().find((point) => point.value !== null)?.date ?? null;
  const value = metric?.value ?? null;
  const coverage = value === null ? "unavailable" : coverageState(observedDays, dates.length);
  const coverageLabel =
    value === null
      ? "No click count for these dates"
      : coverage === "observed"
        ? period.complete
          ? `All ${dates.length} days counted`
          : "All days so far counted; today is still being counted"
        : `${observedDays} of ${dates.length} days counted; the rest are missing`;
  const recent = windowSlice(metric, dates.slice(-7));
  const prior = windowSlice(metric, dates.slice(-14, -7));
  const eligible =
    metric?.quality === "exact" &&
    value !== null &&
    prior.days === 7 &&
    prior.observedDays === 7 &&
    recent.days === 7 &&
    recent.observedDays === 7 &&
    period.complete;
  const change =
    eligible && prior.value !== null && recent.value !== null ? recent.value - prior.value : null;
  const percent = change !== null && prior.value ? Math.round((change / prior.value) * 100) : null;
  const ranked = referralCounts(source, input.published);
  const place = ranked.findIndex((entry) => entry.slug === slug);
  const rank = place >= 0 ? place + 1 : null;
  const topValue = ranked[0]?.value ?? null;
  const tiedAtTop = rank === 1 && ranked.filter((entry) => entry.value === topValue).length > 1;
  const reason =
    value === null
      ? source
        ? `No click count was kept for ${name} in these dates. That is missing evidence, not a measured zero.`
        : "Woodhouse did not provide click numbers for these dates, so no count is claimed."
      : coverage === "partial"
        ? `Counting began ${firstObserved}; ${observedDays} of ${dates.length} days have data, so earlier days are missing rather than zero.`
        : "";
  const comparisonReason =
    value === null
      ? "No click count, so no comparison is claimed."
      : !eligible
        ? !period.complete
          ? "The current UTC day is not finished, so the last seven days are not a full week."
          : period.days < 14
            ? "These dates are shorter than the two weeks a comparison needs."
            : prior.observedDays < 7
              ? `The earlier seven days have only ${prior.observedDays} of 7 days counted, so no comparison is claimed.`
              : recent.observedDays < 7
                ? `The last seven days have only ${recent.observedDays} of 7 days counted, so no comparison is claimed.`
                : "The project does not report a complete daily click count for both full weeks."
        : percent === null
          ? `The earlier seven days had no clicks (${formatMetric({ value: prior.value ?? 0, unit: "count" })}), so the change is stated as a count, not a percentage.`
          : "";
  const movement =
    eligible && change !== null
      ? change === 0
        ? ", level with the earlier seven days."
        : `, ${plural(Math.abs(change), "click", "clicks")} ${change > 0 ? "more" : "fewer"} than the earlier seven days.`
      : ".";
  const headline =
    value === null
      ? source
        ? `No click count for ${name} in these dates.`
        : `Woodhouse did not provide click numbers for ${name} in these dates.`
      : value === 0
        ? `No clicks from Woodhouse to ${name} in the ${plural(observedDays, "day", "days")} counted.`
        : rank === 1 && !tiedAtTop
          ? `${name} was opened most from Woodhouse: ${plural(value, "click", "clicks")}${movement}`
          : rank === 1 && tiedAtTop
            ? `${name} shared the most-opened spot from Woodhouse: ${plural(value, "click", "clicks")}${movement}`
            : `${name} received ${plural(value, "click", "clicks")} from Woodhouse${movement}`;
  const establishes =
    value === null
      ? reason
      : `${plural(value, "recorded click", "recorded clicks")} from Woodhouse to ${name} between ${period.from} and ${period.to} UTC${coverage === "partial" ? `, across ${observedDays} of ${dates.length} days with data` : ""}.`;
  return {
    slug,
    name,
    colour: input.colour ?? projectColours[slug] ?? "#b4c0d2",
    siteUrl: input.siteUrl ?? null,
    period,
    measure: DISCOVERY_MEASURE,
    value,
    valueLabel: value === null ? "—" : value.toLocaleString("en-AU"),
    daily,
    observedDays,
    firstObserved,
    lastObserved,
    coverage,
    coverageLabel,
    recent,
    prior,
    comparison: { eligible, change, percent, reason: comparisonReason },
    rank,
    tiedAtTop,
    measuredDestinations: ranked.length,
    headline,
    kicker:
      value !== null && rank === 1
        ? tiedAtTop
          ? "Project discovery · Joint most-opened"
          : "Project discovery · Opened most"
        : "Project discovery · Clicks to this project",
    establishes,
    doesNotEstablish:
      "That anyone played, tried, subscribed or came back. A click on Woodhouse shows interest in opening the project, not what happened after.",
    reason
  };
}

export function discoveryCaption(
  story: DiscoveryStory,
  link: string,
  dateLabel: (date: string) => string
) {
  const lines = [
    story.value === null
      ? `No click count from Woodhouse to ${story.name} for ${dateLabel(story.period.from)} – ${dateLabel(story.period.to)} (UTC).`
      : `${story.name} received ${story.valueLabel} ${story.value === 1 ? "click" : "clicks"} from Woodhouse between ${dateLabel(story.period.from)} and ${dateLabel(story.period.to)} (UTC).`
  ];
  if (story.value !== null && story.rank === 1)
    lines.push(
      story.tiedAtTop
        ? "It shared the most-opened spot among the projects measured."
        : "It was the project opened most from Woodhouse in this report."
    );
  if (story.value === null) lines.push(story.reason);
  else if (story.value === 0)
    lines.push(`No clicks were recorded in the ${story.observedDays} days counted.`);
  else if (story.coverage === "partial" && story.firstObserved)
    lines.push(
      `Counting began ${dateLabel(story.firstObserved)}; ${story.observedDays} of ${story.period.days} days have data, so earlier days are missing rather than zero.`
    );
  if (
    story.comparison.eligible &&
    story.comparison.change !== null &&
    story.recent.value !== null &&
    story.prior.value !== null
  )
    lines.push(
      story.comparison.change === 0
        ? `The last seven days had ${story.recent.value} clicks, level with the seven days before.`
        : `The last seven days had ${story.recent.value} clicks, ${Math.abs(story.comparison.change).toLocaleString("en-AU")} ${story.comparison.change > 0 ? "more" : "fewer"} than the seven days before (${story.prior.value}).`
    );
  else if (story.comparison.reason) lines.push(story.comparison.reason);
  if (story.value !== null) lines.push(`${story.coverageLabel}.`);
  lines.push(
    "A click shows interest in opening the project; it is not proof anyone played or stayed.",
    link
  );
  return lines.join("\n");
}
