/** Woodhouse-only, prospective story observations. Reviewed 23 October 2026. */
import {
  discoveryProjects,
  isObject,
  windowForDates,
  type ReportingWindow
} from "./portfolio-analytics.ts";

const distributionStories = [
  "edition",
  "link-check",
  "music",
  "bubbles",
  "protocol-11",
  "fighter",
  "shoalshot"
] as const;
export type DistributionContext = {
  edition: "one-more-round";
  story: (typeof distributionStories)[number];
  report: string;
};
export function parseDistributionContext(raw: unknown): DistributionContext | null {
  if (
    !isObject(raw) ||
    Object.keys(raw).some((key) => !["edition", "story", "report"].includes(key)) ||
    raw.edition !== "one-more-round" ||
    !distributionStories.some((story) => story === raw.story) ||
    typeof raw.report !== "string" ||
    !/^[a-f0-9]{24}$/.test(raw.report)
  )
    return null;
  return {
    edition: raw.edition,
    story: raw.story as DistributionContext["story"],
    report: raw.report
  };
}
const distributionStages = ["arrival", "explored", "opening"] as const;
export type DistributionStage = (typeof distributionStages)[number];
export function distributionMetric(
  context: DistributionContext,
  stage: DistributionStage,
  target = ""
) {
  return `distribution:${context.edition}:${context.story}:${context.report}:${stage}${target ? `:${target}` : ""}`;
}
export function parseDistributionMetric(metric: string) {
  const [prefix, edition, story, report, stage, target, extra] = metric.split(":");
  const context = parseDistributionContext({ edition, story, report });
  if (
    prefix !== "distribution" ||
    !context ||
    extra !== undefined ||
    !distributionStages.some((value) => value === stage) ||
    (stage === "opening"
      ? !discoveryProjects.some((value) => value === target)
      : target !== undefined)
  )
    return null;
  return { ...context, stage: stage as DistributionStage, target: target ?? null };
}
export type StoryDistribution = {
  period: ReportingWindow;
  startedAt: string | null;
  through: string;
  quality: "partial" | "unavailable";
  stories: {
    context: DistributionContext;
    arrivals: number;
    explored: number;
    openings: number;
    destinations: { target: string; openings: number }[];
  }[];
  limitations: string[];
};
/** Independent counts, never a conversion funnel or a downstream-use claim. */
export async function loadStoryDistribution(
  db: D1Database,
  period: ReportingWindow,
  selection: {
    edition: DistributionContext["edition"];
    story?: DistributionContext["story"];
    report?: string;
  },
  now = Date.now()
): Promise<StoryDistribution> {
  const validWindow = windowForDates(period.from, period.to, now);
  if (
    !validWindow ||
    validWindow.days !== period.days ||
    selection.edition !== "one-more-round" ||
    (selection.story !== undefined &&
      !distributionStories.some((story) => story === selection.story)) ||
    (selection.report !== undefined && !/^[a-f0-9]{24}$/.test(selection.report))
  )
    throw new TypeError("Invalid distribution selection");
  const prefix = `distribution:${selection.edition}:`;
  const pattern = `${prefix}${selection.story ?? "*"}:${selection.report ?? "*"}:*`;
  const first = await db
    .prepare(
      "SELECT MIN(day) AS day FROM wh_analytics_daily WHERE project='woodhouse' AND metric GLOB ?"
    )
    .bind(pattern)
    .first<{ day: string | null }>();
  const rows = await db
    .prepare(
      "SELECT metric,SUM(value) AS value FROM wh_analytics_daily WHERE project='woodhouse' AND day>=? AND day<=? AND metric GLOB ? GROUP BY metric"
    )
    .bind(period.from, period.to, pattern)
    .all<{ metric: string; value: number }>();
  const stories: StoryDistribution["stories"] = [];
  for (const row of rows.results) {
    const parsed = parseDistributionMetric(row.metric);
    if (
      !parsed ||
      parsed.edition !== selection.edition ||
      (selection.story && parsed.story !== selection.story) ||
      (selection.report && parsed.report !== selection.report) ||
      !Number.isSafeInteger(row.value) ||
      row.value < 0
    )
      continue;
    let story = stories.find(
      (s) => s.context.story === parsed.story && s.context.report === parsed.report
    );
    if (!story) {
      story = {
        context: { edition: parsed.edition, story: parsed.story, report: parsed.report },
        arrivals: 0,
        explored: 0,
        openings: 0,
        destinations: []
      };
      stories.push(story);
    }
    if (parsed.stage === "arrival") story.arrivals += row.value;
    else if (parsed.stage === "explored") story.explored += row.value;
    else {
      story.openings += row.value;
      story.destinations.push({ target: parsed.target!, openings: row.value });
    }
  }
  return {
    period,
    startedAt: first?.day ? `${first.day}T00:00:00.000Z` : null,
    through: new Date(now).toISOString(),
    quality: first?.day && period.to >= first.day ? "partial" : "unavailable",
    stories: stories.sort(
      (a, b) =>
        a.context.story.localeCompare(b.context.story) ||
        a.context.report.localeCompare(b.context.report)
    ),
    limitations: [
      "Prospective accepted Woodhouse events only; earlier story attribution is unavailable. The first accepted day and current UTC day may be partial.",
      "Arrivals and explored markers count once per anonymous tab session, story and frozen report. Exploration requires 10 active foreground seconds with recent trusted input on the story page. A page arrival does not establish that a shared post caused it.",
      "Native openings count deliberate outbound activations, including repeats. Separate counts do not establish an ordered funnel, a rate, destination use or unique people.",
      "DNT, GPC, opt-out, designated QA, preview and automated traffic are excluded. Blocking and offline browsers hide observations. No cross-site identity or referrer is collected."
    ]
  };
}
