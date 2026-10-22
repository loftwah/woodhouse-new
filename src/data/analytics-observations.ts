/**
 * The observations that open `/activity/`.
 *
 * The observed failure this prevents: a workbench that opens on controls, so a
 * visitor has to configure a chart before they meet a finding, and a
 * "highlight" that quietly turns a recorded click into an adoption claim.
 *
 * Every observation here is derived from the report the page is already showing,
 * names its own period, and carries both what it establishes and the nearest
 * tempting claim it does not support. Nothing is invented to fill a slot: an
 * absent observation stays absent and the page says what is missing.
 */

import {
  formatMetric,
  type AnalyticsProject,
  type Metric,
  type ReportingWindow
} from "./portfolio-analytics.ts";
import type { DiscoveryReferral, WeeklyHighlight } from "./analytics-workbench.ts";

type ObservationKind = "week" | "discovery" | "audience" | "first";

type Observation = {
  kind: ObservationKind;
  /** The project the finding belongs to; `null` only for a portfolio-wide statement. */
  project: AnalyticsProject | null;
  name: string;
  colour: string;
  /** Small label above the figure, naming the project and the measure. */
  kicker: string;
  /** The finding as a sentence. It never asserts a cause. */
  headline: string;
  /** The headline figure on its own. */
  figure: string;
  /** What the figure counts. */
  unitLabel: string;
  /** The dates the figure covers. */
  period: string;
  /** What a reader may take from it. */
  establishes: string;
  /** The nearest tempting claim it does not support. */
  doesNotEstablish: string;
  href: string;
  linkLabel: string;
};

export type ObservationInput = {
  window: ReportingWindow;
  colours: Record<string, string>;
  weekly: WeeklyHighlight[];
  discovery: DiscoveryReferral[];
  discoveryTotal: number | null;
  /** Every published project in scope, with its headline measure and coverage. */
  rows: {
    project: AnalyticsProject;
    name: string;
    data: {
      coverage: { startedAt: string | null; through: string; quality: string };
      metrics: Metric[];
    } | null;
    defaultMeasure: string;
  }[];
  links: {
    week: (project: AnalyticsProject, measure: string, from: string) => string;
    project: (project: AnalyticsProject, measure: string) => string;
    discovery: () => string;
  };
  dateLabel: (date: string) => string;
};

export type ObservationResult = {
  observations: Observation[];
  /** Why a kind produced nothing, so the page can be honest rather than empty. */
  notes: { kind: ObservationKind; reason: string }[];
  /** Present only when nothing at all cleared the bar. */
  emptyReason: string | null;
};

const LIMIT = 3;

/**
 * Source coverage boundaries arrive either as a calendar day or as a full ISO
 * timestamp, depending on the producer. Compare and print the day only, so a
 * timestamp cannot silently fail a string comparison or become an invalid date.
 */
function coverageDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

function pickWeek(weekly: WeeklyHighlight[]): WeeklyHighlight | null {
  // A comparison needs two complete adjacent weeks. A record with no baseline is
  // still not a movement, so it is reported by the week-focus section instead.
  return (
    weekly.find((highlight) => highlight.newBest && highlight.changePercent !== null) ??
    weekly.find((highlight) => highlight.changePercent !== null && highlight.comparedWeeks >= 2) ??
    null
  );
}

export function analyticsObservations(input: ObservationInput): ObservationResult {
  const { window, colours, dateLabel } = input;
  const observations: Observation[] = [];
  const notes: ObservationResult["notes"] = [];
  const periodLabel = `${dateLabel(window.from)}–${dateLabel(window.to)}`;

  const week = pickWeek(input.weekly);
  if (week) {
    const previous = formatMetric({ value: week.previous, unit: week.unit });
    const movement =
      week.changePercent === null
        ? "has no comparable baseline"
        : week.changePercent === 0
          ? "held level with the week before"
          : `${week.changePercent > 0 ? "rose" : "fell"} ${Math.abs(week.changePercent)}% against the week before`;
    observations.push({
      kind: "week",
      project: week.project,
      name: week.name,
      colour: colours[week.project] ?? "#b4c0d2",
      kicker: `${week.name} · ${week.measure.label}`,
      headline: week.newBest
        ? `${week.name} recorded its best complete week of the ${week.comparedWeeks} comparable weeks in retained history.`
        : `${week.name} ${movement} in the complete week of ${dateLabel(week.from)}–${dateLabel(week.to)}.`,
      figure: formatMetric({ value: week.value, unit: week.unit }),
      unitLabel: week.measure.label,
      period: `${dateLabel(week.from)}–${dateLabel(week.to)}, a complete Monday–Sunday UTC week`,
      establishes: `${formatMetric({ value: week.value, unit: week.unit })} recorded, against ${previous} the week before.`,
      doesNotEstablish:
        "That the week is typical, that anything nearby caused it, or that these are people rather than recorded actions.",
      href: input.links.week(week.project, week.measure.key, week.from),
      linkLabel: "Open the week"
    });
  } else {
    notes.push({
      kind: "week",
      reason:
        input.weekly.length > 0
          ? "A complete week is reported below, but it has no earlier comparable week to compare against."
          : "No two adjacent complete weeks are available in retained history for these dates."
    });
  }

  const topDestination = input.discovery[0];
  if (topDestination) {
    const comparison = topDestination.hasTrend
      ? `${topDestination.recent} in ${dateLabel(topDestination.recentFrom)}–${dateLabel(topDestination.recentTo)}, against ${topDestination.prior} in the earlier seven days.`
      : topDestination.priorCoverage === "partial"
        ? `${topDestination.recent} in the most recent seven days. The earlier seven days recorded only ${topDestination.priorObservedDays} of 7, so no comparison is claimed.`
        : `${topDestination.recent} in the most recent seven days. No earlier retained history exists to compare.`;
    observations.push({
      kind: "discovery",
      project: "woodhouse",
      name: "Woodhouse",
      colour: colours.woodhouse ?? "#b4c0d2",
      kicker: `Discovery · ${topDestination.name}`,
      headline: `The busiest measured hand-off from Woodhouse went to ${topDestination.name}.`,
      figure: topDestination.value.toLocaleString("en-AU"),
      unitLabel: "recorded clicks through",
      period: periodLabel,
      establishes: comparison,
      doesNotEstablish:
        "That anyone played, tried or kept using it: this counts the outbound action on this origin, not what happened at the destination.",
      href: input.links.discovery(),
      linkLabel: "See every destination"
    });
  } else {
    notes.push({
      kind: "discovery",
      reason:
        input.discoveryTotal === null
          ? "Discovery counts are unavailable for these dates."
          : "No positive clicks through to a measured project were recorded in these dates."
    });
  }

  const startedInside = input.rows.find((row) => {
    if (row.project === "woodhouse") return false;
    const started = coverageDay(row.data?.coverage.startedAt);
    return Boolean(started && started >= window.from && started <= window.to);
  });
  const startedDay = coverageDay(startedInside?.data?.coverage.startedAt);
  if (startedInside && startedDay) {
    const throughDay = coverageDay(startedInside.data?.coverage.through) ?? window.to;
    const days = Math.max(
      1,
      Math.round((Date.parse(throughDay) - Date.parse(startedDay)) / 86400000) + 1
    );
    observations.push({
      kind: "first",
      project: startedInside.project,
      name: startedInside.name,
      colour: colours[startedInside.project] ?? "#b4c0d2",
      kicker: `New collection · ${startedInside.name}`,
      headline: `${startedInside.name} began reporting inside these dates, so this is the first comparable history it has.`,
      figure: String(days),
      unitLabel: days === 1 ? "day recorded" : "days recorded",
      period: `from ${dateLabel(startedDay)}`,
      establishes: `Everything before ${dateLabel(startedDay)} was never recorded. It is missing, not zero.`,
      doesNotEstablish:
        "That the product was unused before collection began, or that the first days are representative.",
      href: input.links.project(startedInside.project, startedInside.defaultMeasure),
      linkLabel: `Open ${startedInside.name}`
    });
  }

  const woodhouse = input.rows.find((row) => row.project === "woodhouse");
  const visits = woodhouse?.data?.metrics.find((metric) => metric.key === "visits");
  const engaged = woodhouse?.data?.metrics.find((metric) => metric.key === "engaged_sessions");
  if (visits && visits.value !== null) {
    observations.push({
      kind: "audience",
      project: "woodhouse",
      name: "Woodhouse",
      colour: colours.woodhouse ?? "#b4c0d2",
      kicker: "Woodhouse · its own audience",
      headline:
        engaged && engaged.value !== null
          ? `${formatMetric({ value: engaged.value, unit: engaged.unit })} of those visits met the source's engaged-session threshold.`
          : "Woodhouse's own reading traffic, counted the same way as every product's.",
      figure: formatMetric({ value: visits.value, unit: visits.unit }),
      unitLabel: "visits",
      period: periodLabel,
      establishes:
        engaged && engaged.value !== null
          ? `${formatMetric({ value: visits.value, unit: visits.unit })} anonymous tab sessions admitted, ${formatMetric({ value: engaged.value, unit: engaged.unit })} engaged.`
          : `${formatMetric({ value: visits.value, unit: visits.unit })} anonymous tab sessions admitted by the collector.`,
      doesNotEstablish:
        "How many individual people read anything, or whether they came back: both need a measure this source cannot supply.",
      href: input.links.project("woodhouse", "visits"),
      linkLabel: "Open Woodhouse analytics"
    });
  } else {
    notes.push({
      kind: "audience",
      reason: "Woodhouse's own visit measure is unavailable for these dates."
    });
  }

  // Stable order: movement, then discovery, then a new source, then audience.
  const order: ObservationKind[] = ["week", "discovery", "first", "audience"];
  observations.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));

  return {
    observations: observations.slice(0, LIMIT),
    notes,
    emptyReason:
      observations.length === 0
        ? `No project, discovery or audience finding cleared the bar for ${periodLabel}. The measurements below are still complete.`
        : null
  };
}
