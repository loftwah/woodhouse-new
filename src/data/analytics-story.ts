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
 * A recorded click is discovery intent on this origin. It is not downstream
 * play, adoption, a unique person or evidence that the destination's own
 * reporting agrees.
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
    "Recorded outbound project-open actions from Woodhouse. A click shows discovery intent; it does not establish downstream use or acquisition."
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
      ? "Coverage unavailable"
      : coverage === "observed"
        ? period.complete
          ? `Full coverage · ${plural(observedDays, "day", "days")} observed`
          : `All days observed · current UTC day partial`
        : `Partial coverage · ${observedDays} of ${dates.length} days observed`;
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
        ? `The collector retained no referral counter for ${name} in these dates. That is an absence of recorded evidence, not a measured zero.`
        : "Woodhouse did not supply a discovery report for these dates, so no click count can be claimed."
      : coverage === "partial"
        ? `Collection began ${firstObserved}; ${observedDays} of ${dates.length} days were observed, so earlier days are missing rather than zero.`
        : "";
  const comparisonReason =
    value === null
      ? "No retained referral counter, so no comparison is claimed."
      : !eligible
        ? period.days < 14
          ? "These dates are shorter than the two weeks a comparison needs."
          : prior.observedDays < 7
            ? `The earlier seven days recorded only ${prior.observedDays} of 7, so no comparison is claimed.`
            : "The source does not supply an exact daily counter for both complete weeks."
        : percent === null
          ? `There was no baseline in the earlier seven days (${formatMetric({ value: prior.value ?? 0, unit: "count" })}), so the change is stated as a count, not a percentage.`
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
        ? `No retained referral counter for ${name} in these dates.`
        : `Woodhouse did not supply a discovery report for ${name} in these dates.`
      : value === 0
        ? `No recorded clicks to ${name} across the ${plural(observedDays, "observed day", "observed days")}.`
        : rank === 1 && !tiedAtTop
          ? `${name} was the busiest measured hand-off from Woodhouse: ${plural(value, "recorded click", "recorded clicks")}${movement}`
          : rank === 1 && tiedAtTop
            ? `${name} shared the busiest measured hand-off from Woodhouse: ${plural(value, "recorded click", "recorded clicks")}${movement}`
            : `${name} drew ${plural(value, "recorded click", "recorded clicks")} from Woodhouse${movement}`;
  const establishes =
    value === null
      ? reason
      : `${plural(value, "recorded outbound click", "recorded outbound clicks")} to ${name} between ${period.from} and ${period.to} UTC${coverage === "partial" ? `, across ${observedDays} of ${dates.length} observed days` : ""}.`;
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
          ? "Discovery · joint busiest measured hand-off"
          : "Discovery · busiest measured hand-off"
        : "Discovery · measured hand-off",
    establishes,
    doesNotEstablish:
      "That anyone played, tried, subscribed or returned. A recorded click is discovery intent on this origin, not downstream use or a unique person.",
    reason
  };
}

export function discoveryCaption(
  story: DiscoveryStory,
  link: string,
  dateLabel: (date: string) => string
) {
  const lines = [
    `Woodhouse → ${story.name}`,
    `${story.value === null ? "No recorded project opens" : `${story.valueLabel} recorded project opens`} · ${dateLabel(story.period.from)} – ${dateLabel(story.period.to)} (UTC)`
  ];
  if (story.value !== null && story.rank === 1)
    lines.push(
      story.tiedAtTop
        ? "A joint busiest measured hand-off in this report."
        : "The busiest measured hand-off in this report."
    );
  if (story.value === null) lines.push(story.reason);
  else if (story.coverage === "partial" && story.firstObserved)
    lines.push(
      `Collection began ${dateLabel(story.firstObserved)}; ${story.observedDays} of ${story.period.days} days were observed, so earlier days are missing rather than zero.`
    );
  else if (story.value === 0)
    lines.push(`No recorded clicks to ${story.name} across the observed days.`);
  if (story.comparison.reason) lines.push(story.comparison.reason);
  lines.push(
    `${story.coverageLabel} · ${story.period.complete ? "closed calendar window" : "current UTC day is partial"}.`,
    `It does not establish ${story.doesNotEstablish.charAt(0).toLowerCase()}${story.doesNotEstablish.slice(1)}`,
    link
  );
  return lines.join("\n");
}
