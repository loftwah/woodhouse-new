/**
 * Protocol 11's additive gameplay counters, split by the play mode its client
 * reported.
 *
 * One table, three consumers: the collector writes these names into
 * `wh_analytics_daily`, the aggregate endpoint publishes them as metrics, and the
 * workbench groups them for the interface. A second copy anywhere would let the
 * stored name, the published key and the reader-facing definition drift apart.
 *
 * Only additive event counts are split. `visit` and `engaged` are tab-session
 * markers: one session can span several modes, so per-mode session counts would
 * overlap and double-count. They are deliberately not split, and no session
 * measure is derived here.
 *
 * Storage convention: the daily row keeps the event kind plus the mode
 * (`game_start_classic`), matching the existing rollup that stores `NEW.kind` as
 * the overall counter. The published key uses the product measure name plus the
 * mode (`game_starts_classic`), because `game_start` is the event and
 * `game_starts` is the measure.
 */
export const gameplayModes = [
  { key: "classic", label: "Classic", group: "local" },
  { key: "journey", label: "Journey", group: "local" },
  { key: "private_room", label: "Private room", group: "online" },
  { key: "public_matchmaking", label: "Public matchmaking", group: "online" }
] as const;
export type GameplayMode = (typeof gameplayModes)[number]["key"];
export const modeGroups = [
  {
    key: "local",
    label: "Local play",
    definition:
      "Classic and Journey, both played on this device against bots or in pass-and-play. Local plus online equals the overall figure for every day the split covers. These are browser reports, not unique people or unique tables."
  },
  {
    key: "online",
    label: "Online play",
    definition:
      "Private room and Public matchmaking. Each reported tab counts its own participation in an online table, so this is not a count of distinct tables, rooms or people."
  }
] as const;
export type ModeGroup = (typeof modeGroups)[number]["key"];
export function modesInGroup(group: ModeGroup) {
  return gameplayModes.filter((mode) => mode.group === group);
}
/** The event kind, its published parent measure and the sentence it contributes. */
export const gameplayKindMeasures = [
  {
    kind: "game_start",
    parent: "game_starts",
    label: "Game starts",
    unit: "count",
    counts:
      "Accepted new game launches the client reported as {mode}, excluding restores and resumes",
    included: "counted from accepted game_start events whose mode is {mode_key}",
    additive: "Additive with Game starts: the four mode subtotals sum to that overall total",
    doesNotMean: "It does not mean distinct people, distinct tables or verified human play."
  },
  {
    kind: "game_complete",
    parent: "game_completions",
    label: "Game completions",
    unit: "count",
    counts:
      "Accepted terminal results the client reported as {mode}, excluding restored results and Undo or re-scoring",
    included: "counted from accepted game_complete events whose mode is {mode_key}",
    additive: "Additive with Game completions: the four mode subtotals sum to that overall total",
    doesNotMean:
      "It is not a completion rate: starts and completions in a window are not a matched cohort, and it is not a validated competitive result."
  },
  {
    kind: "game_replay",
    parent: "game_replays",
    label: "Deliberate replays",
    unit: "count",
    counts: "Deliberate repeat new-game actions in {mode} inside the same tab session",
    included: "counted from accepted game_replay events whose mode is {mode_key}",
    additive: "Additive with Deliberate replays: the four mode subtotals sum to that overall total",
    doesNotMean:
      "Automatic restores and resumes are excluded, and it does not say whether the earlier game was won or abandoned."
  },
  {
    kind: "active_time",
    parent: "active_seconds",
    label: "Active play time",
    unit: "seconds",
    counts: "Reported foreground play seconds while the active mode was {mode}",
    included:
      "summed from the accepted 1–30 second active_time increments whose mode is {mode_key}",
    additive:
      "Additive with Active play time: the four mode subtotals sum to that overall total, and a session that changes mode contributes to more than one mode because each increment is counted once",
    doesNotMean:
      "Paused, hidden, inactive and radio time are excluded, and it does not establish a person's total play."
  }
] as const;
export type GameplayKindMeasure = (typeof gameplayKindMeasures)[number];
export type ModeMeasureParent = GameplayKindMeasure["parent"];
export type ModeMeasureKey = `${ModeMeasureParent}_${GameplayMode}`;
function modeEntry(mode: GameplayMode) {
  return gameplayModes.find((entry) => entry.key === mode)!;
}
/** The daily counter name: the accepted event kind plus its mode. */
export function modeMetricName(kind: GameplayKindMeasure["kind"], mode: GameplayMode) {
  return `${kind}_${mode}`;
}
/** The published metric key: the measure name plus its mode. */
export function modeMeasureKey(parent: ModeMeasureParent, mode: GameplayMode): ModeMeasureKey {
  return `${parent}_${mode}`;
}
export function modeMeasureLabel(kind: GameplayKindMeasure, mode: GameplayMode) {
  return `${kind.label} · ${modeEntry(mode).label}`;
}
function fill(template: string, mode: GameplayMode) {
  const entry = modeEntry(mode);
  return template.replaceAll("{mode}", entry.label).replaceAll("{mode_key}", entry.key);
}
/**
 * The four-part definition every mode measure carries: what it counts, the exact
 * event kind and mode included, that it is additive with its parent measure, and
 * what it does not mean. The endpoint and the interface both render this sentence
 * so they cannot describe the same counter differently.
 */
export function gameplayModeDefinition(kind: GameplayKindMeasure, mode: GameplayMode) {
  const included = fill(kind.included, mode);
  return `${fill(kind.counts, mode)}. ${included.charAt(0).toUpperCase()}${included.slice(1)}. ${kind.additive}. ${kind.doesNotMean}`;
}
