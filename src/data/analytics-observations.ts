/**
 * The observations that open `/activity/`.
 *
 * The observed failure this prevents: a workbench that opens on controls, so a
 * visitor has to configure a chart before they meet a finding, and a
 * "highlight" that quietly turns a recorded click into an adoption claim.
 *
 * Every observation here is derived from the report the page is already showing,
 * names its own period, and carries both what it counts and the nearest tempting
 * claim it does not support. Nothing is invented to fill a slot: an absent
 * observation stays absent and the page says what is missing.
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
  /** The comparison, or a plain statement that none is available. */
  comparison: string;
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
  // Among real comparisons the largest movement leads, because the opening
  // names the largest complete-week movement, not the first project in order.
  const comparable = weekly.filter(
    (highlight) => highlight.changePercent !== null && highlight.comparedWeeks >= 2
  );
  if (comparable.length === 0) return null;
  const byMovement = [...comparable].sort(
    (a, b) => Math.abs(b.changePercent ?? 0) - Math.abs(a.changePercent ?? 0)
  );
  return byMovement.find((highlight) => highlight.newBest) ?? byMovement[0] ?? null;
}

export function analyticsObservations(input: ObservationInput): ObservationResult {
  const { window, colours, dateLabel } = input;
  const observations: Observation[] = [];
  const notes: ObservationResult["notes"] = [];
  const periodLabel = `${dateLabel(window.from)}–${dateLabel(window.to)}`;

  const week = pickWeek(input.weekly);
  const weekInsideWindow = week ? week.to >= window.from : false;
  if (week && weekInsideWindow) {
    const valueLabel = formatMetric({ value: week.value, unit: week.unit });
    const previous = formatMetric({ value: week.previous, unit: week.unit });
    const movement =
      week.changePercent === null
        ? `held level with ${previous} the week before`
        : week.changePercent === 0
          ? `held level with ${previous} the week before`
          : `${week.changePercent > 0 ? "rose" : "fell"} ${Math.abs(week.changePercent)}% to ${valueLabel}, from ${previous} the week before`;
    observations.push({
      kind: "week",
      project: week.project,
      name: week.name,
      colour: colours[week.project] ?? "#b4c0d2",
      kicker: `${week.name} · ${week.measure.label}`,
      headline: week.newBest
        ? `${week.name}'s ${week.measure.label.toLowerCase()} reached ${valueLabel} — a new best across the ${week.comparedWeeks} complete weeks we can compare, against ${previous} the week before.`
        : `${week.name}'s ${week.measure.label.toLowerCase()} ${movement}.`,
      figure: valueLabel,
      unitLabel: week.measure.label,
      period: `${dateLabel(week.from)}–${dateLabel(week.to)} · full Monday–Sunday week, UTC`,
      comparison:
        week.changePercent === null
          ? `No earlier week had a usable baseline, so no percentage is claimed.`
          : `Compared with the week before (${dateLabel(new Date(Date.parse(week.from) - 7 * 86400000).toISOString().slice(0, 10))}–${dateLabel(new Date(Date.parse(week.from) - 86400000).toISOString().slice(0, 10))}).`,
      establishes: `${valueLabel} recorded, against ${previous} in the week before.`,
      doesNotEstablish:
        "Why it changed, whether this week is typical, or how many people were involved.",
      href: input.links.week(week.project, week.measure.key, week.from),
      linkLabel: "Open this week"
    });
  } else {
    notes.push({
      kind: "week",
      reason: week
        ? `The last full week (${dateLabel(week.from)}–${dateLabel(week.to)}) is outside these dates, so it is not presented as a change here.`
        : input.weekly.length > 0
          ? "A full week is available, but there is no earlier full week to compare it with."
          : "No two full weeks in a row are available for these dates."
    });
  }

  const topDestination = input.discovery[0];
  if (topDestination) {
    const comparison = topDestination.hasTrend
      ? `${topDestination.recent} clicks in the last seven days, against ${topDestination.prior} in the seven days before.`
      : window.days < 14
        ? `${topDestination.recent} clicks in the last seven days. These dates are shorter than the two weeks needed to compare.`
        : topDestination.priorCoverage === "partial"
          ? `${topDestination.recent} clicks in the last seven days. The earlier seven days have only ${topDestination.priorObservedDays} of 7 days counted, so no comparison is claimed.`
          : `${topDestination.recent} clicks in the last seven days. There is no earlier counted week to compare.`;
    const clicks = `${topDestination.value.toLocaleString("en-AU")} ${
      topDestination.value === 1 ? "click" : "clicks"
    }`;
    observations.push({
      kind: "discovery",
      project: "woodhouse",
      name: "Woodhouse",
      colour: colours.woodhouse ?? "#b4c0d2",
      kicker: `Project discovery · ${topDestination.name}`,
      headline: `${topDestination.name} was the project readers opened most from Woodhouse: ${clicks}.`,
      figure: topDestination.value.toLocaleString("en-AU"),
      unitLabel: "clicks from Woodhouse",
      period: periodLabel,
      comparison,
      establishes: `${clicks} from Woodhouse to ${topDestination.name} between ${dateLabel(window.from)} and ${dateLabel(window.to)} (UTC).`,
      doesNotEstablish:
        "That anyone played, tried or kept using it. This counts clicks on Woodhouse, not what happened next.",
      href: input.links.discovery(),
      linkLabel: "Open this discovery story"
    });
  } else {
    notes.push({
      kind: "discovery",
      reason:
        input.discoveryTotal === null
          ? "Project-click counts are unavailable."
          : "No clicks from Woodhouse to a measured project were recorded."
    });
  }

  const startedInside = input.rows.find((row) => {
    if (row.project === "woodhouse") return false;
    const started = coverageDay(row.data?.coverage.startedAt);
    return Boolean(started && started >= window.from && started <= window.to);
  });
  const startedDay = coverageDay(startedInside?.data?.coverage.startedAt);
  if (startedInside && startedDay) {
    // `coverage.through` is the capture time, not the end of the selected window.
    // Counting to it would report a seven-day window as fifty days of history and
    // change the figure tomorrow from the same URL.
    const captured = coverageDay(startedInside.data?.coverage.through) ?? window.to;
    const throughDay = captured < window.to ? captured : window.to;
    const days = Math.max(
      1,
      Math.round((Date.parse(throughDay) - Date.parse(startedDay)) / 86400000) + 1
    );
    observations.push({
      kind: "first",
      project: startedInside.project,
      name: startedInside.name,
      colour: colours[startedInside.project] ?? "#b4c0d2",
      kicker: `${startedInside.name} · New to this report`,
      headline: `${startedInside.name} started reporting on ${dateLabel(startedDay)}, so this is the first history we have for it.`,
      figure: String(days),
      unitLabel: days === 1 ? "day of history" : "days of history",
      period: `From ${dateLabel(startedDay)}`,
      comparison: "No earlier history to compare.",
      establishes: `Every day before ${dateLabel(startedDay)} is missing, not zero.`,
      doesNotEstablish:
        "That the product was unused before then, or that the first days are typical.",
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
      kicker: "Woodhouse · Visits",
      headline:
        engaged && engaged.value !== null
          ? `${formatMetric({ value: visits.value, unit: visits.unit })} visits, including ${formatMetric({ value: engaged.value, unit: engaged.unit })} that lasted 10 seconds or more.`
          : `${formatMetric({ value: visits.value, unit: visits.unit })} visits recorded for Woodhouse.`,
      figure: formatMetric({ value: visits.value, unit: visits.unit }),
      unitLabel: "visits",
      period: periodLabel,
      comparison: "No earlier period is compared here.",
      establishes:
        engaged && engaged.value !== null
          ? `${formatMetric({ value: visits.value, unit: visits.unit })} visits recorded; ${formatMetric({ value: engaged.value, unit: engaged.unit })} lasted 10 seconds or more.`
          : `${formatMetric({ value: visits.value, unit: visits.unit })} visits recorded by Woodhouse.`,
      doesNotEstablish:
        "How many people read anything, or whether they came back. This counts visits, not people.",
      href: input.links.project("woodhouse", "visits"),
      linkLabel: "Open Woodhouse analytics"
    });
  } else {
    notes.push({
      kind: "audience",
      reason: "Woodhouse's visit count is unavailable for these dates."
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
        ? `Nothing in this report supports a before-and-after claim for ${periodLabel}. The numbers below show what was recorded.`
        : null
  };
}
