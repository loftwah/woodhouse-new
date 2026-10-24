/** Reviewed 24 October 2026. Repository access never expands publication. */
export const leaderboardProjects = [
  { slug: "woodhouse", name: "Woodhouse", repo: "woodhouse-new", colour: "#e9ff49", mark: "W" },
  {
    slug: "app-composer",
    name: "App Composer",
    repo: "app-composer",
    colour: "#ff8758",
    mark: "AC"
  },
  { slug: "fighter", name: "Fighter", repo: "fighter", colour: "#ff746a", mark: "F" },
  { slug: "shoalshot", name: "SHOALSHOT", repo: "shoalshot", colour: "#79d8ff", mark: "S" },
  { slug: "protocol-11", name: "Protocol 11", repo: "protocol-11", colour: "#c1b0ff", mark: "11" },
  { slug: "loftwahfm", name: "LoftwahFM", repo: "loftwahfm", colour: "#ff83cb", mark: "FM" },
  { slug: "bubbles", name: "Bubbles", repo: "bubbles", colour: "#75e6a9", mark: "B" },
  {
    slug: "asset-hunter",
    name: "Asset Hunter",
    repo: "asset-hunter",
    colour: "#ffd276",
    mark: "AH"
  }
] as const;
export const rankingMeasures = [
  {
    key: "merged",
    label: "Changes merged",
    detail: "Pull requests merged on GitHub, counted by merge date."
  },
  {
    key: "closed",
    label: "Issues closed",
    detail: "Issues closed in the period, including a second close after reopening."
  },
  {
    key: "reduction",
    label: "Fewer open issues",
    detail:
      "The drop in open issues: closures minus new and reopened issues. A negative number means the list grew."
  }
] as const;
export type RankingMeasure = (typeof rankingMeasures)[number]["key"];
type DayCounts = {
  day: string;
  merged: number;
  opened: number;
  closed: number;
  reopened: number;
};
export type ProjectCounts = {
  slug: string;
  daily: DayCounts[];
  issuesComplete: boolean;
  eventsComplete: boolean;
  pullsComplete: boolean;
  openNow: number | null;
};
export type LeaderboardSnapshot = {
  schema: "woodhouse.github-leaderboard/1";
  id: string;
  collectedAt: string;
  from: string;
  through: string;
  projects: ProjectCounts[];
};
const DAY = 86400000;
export function completeWindow(days: number, now = Date.now()) {
  const midnight = Math.floor(now / DAY) * DAY;
  return {
    from: new Date(midnight - days * DAY).toISOString().slice(0, 10),
    to: new Date(midnight - DAY).toISOString().slice(0, 10)
  };
}
export function daysBetween(from: string, to: string): string[] {
  const days: string[] = [];
  for (let at = Date.parse(from); at <= Date.parse(to); at += DAY)
    days.push(new Date(at).toISOString().slice(0, 10));
  return days;
}
export function safeProject(slug: string) {
  return leaderboardProjects.find((p) => p.slug === slug);
}
export function measureKey(value: string | null): RankingMeasure {
  return rankingMeasures.find((m) => m.key === value)?.key ?? "merged";
}
export function selectedDays(value: string | null) {
  return [7, 28, 90].includes(Number(value)) ? Number(value) : 28;
}
function projectValue(
  project: ProjectCounts,
  key: RankingMeasure,
  from: string,
  to: string
): number | null {
  if (
    key === "merged"
      ? !project.pullsComplete
      : key === "closed"
        ? !project.eventsComplete
        : !project.eventsComplete || !project.issuesComplete
  )
    return null;
  return project.daily
    .filter((d) => d.day >= from && d.day <= to)
    .reduce((sum, d) => sum + (key === "reduction" ? d.closed - d.opened - d.reopened : d[key]), 0);
}
export function rankedProjects(snapshot: LeaderboardSnapshot, days: number, key: RankingMeasure) {
  const to = snapshot.through;
  const from = new Date(Date.parse(to) - (days - 1) * DAY).toISOString().slice(0, 10);
  const previousTo = new Date(Date.parse(from) - DAY).toISOString().slice(0, 10);
  const previousFrom = new Date(Date.parse(from) - days * DAY).toISOString().slice(0, 10);
  const rows = snapshot.projects
    .filter((p) => safeProject(p.slug))
    .map((project) => ({
      ...safeProject(project.slug)!,
      counts: project,
      value: projectValue(project, key, from, to),
      previous:
        snapshot.from <= previousFrom ? projectValue(project, key, previousFrom, previousTo) : null
    }));
  const sort = (a: (typeof rows)[number], b: (typeof rows)[number]) =>
    (b.value ?? -Infinity) - (a.value ?? -Infinity) ||
    leaderboardProjects.findIndex((p) => p.slug === a.slug) -
      leaderboardProjects.findIndex((p) => p.slug === b.slug);
  rows.sort(sort);
  const previous = rows
    .filter((r) => r.previous !== null)
    .map((r) => ({ ...r, value: r.previous }))
    .sort(sort);
  return {
    from,
    to,
    rows: rows.map((r, i) => {
      const rank = r.value === null ? null : rows.findIndex((a) => a.value === r.value) + 1;
      const oldRank =
        r.previous === null ? null : previous.findIndex((a) => a.value === r.previous) + 1;
      // Movement requires the same complete comparison field in both periods.
      const comparable = rows.every((a) => a.value !== null && a.previous !== null);
      return {
        ...r,
        rank,
        tied: r.value !== null && rows.filter((a) => a.value === r.value).length > 1,
        movement: comparable && rank !== null && oldRank !== null ? oldRank - rank : null,
        position: i + 1
      };
    })
  };
}
export function leaderboardLink(
  id: string,
  days: number,
  measure: RankingMeasure,
  project?: string
) {
  const params = new URLSearchParams({ report: id, days: String(days), measure });
  if (project) params.set("project", project);
  return `/activity/leaderboards/?${params}`;
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dayParts(day: string) {
  const [year = 0, month = 1, date = 1] = day.split("-").map(Number);
  return { year, month, date };
}
/** Human dates for the page, caption and images. No locale-dependent month names. */
export function leaderboardDateRange(from: string, to: string) {
  const start = dayParts(from);
  const end = dayParts(to);
  const startYear = start.year === end.year ? "" : ` ${start.year}`;
  return `${start.date} ${MONTHS[start.month - 1]}${startYear} – ${end.date} ${MONTHS[end.month - 1]} ${end.year}`;
}
export function leaderboardDate(day: string) {
  const { year, month, date } = dayParts(day);
  return `${date} ${MONTHS[month - 1]} ${year}`;
}
export function leaderboardShortDate(day: string) {
  const { month, date } = dayParts(day);
  return `${date} ${MONTHS[month - 1]}`;
}
function openIssues(value: number) {
  const count = Math.abs(value).toLocaleString("en-AU");
  if (value === 0) return "no change in open issues";
  return `${count} ${value > 0 ? "fewer" : "more"} open issue${Math.abs(value) === 1 ? "" : "s"}`;
}
function previousPhrase(value: number | null, key: RankingMeasure, days: number) {
  if (value === null) return "";
  if (key === "reduction") {
    if (value === 0) return `, unchanged from the previous ${days} days`;
    return `, compared with ${Math.abs(value).toLocaleString("en-AU")} ${value > 0 ? "fewer" : "more"} in the previous ${days} days`;
  }
  return `, compared with ${value.toLocaleString("en-AU")} in the previous ${days} days`;
}
function measureSentence(name: string, value: number, key: RankingMeasure, days: number) {
  if (key === "reduction") return `${name} had ${openIssues(value)} over the last ${days} days`;
  if (key === "closed")
    return `${name} closed ${value.toLocaleString("en-AU")} issue${value === 1 ? "" : "s"} in the last ${days} days`;
  return `${name} merged ${value.toLocaleString("en-AU")} pull request${value === 1 ? "" : "s"} in the last ${days} days`;
}
export function leaderboardCaption(
  snapshot: LeaderboardSnapshot,
  days: number,
  key: RankingMeasure,
  project?: string
) {
  const ranked = rankedProjects(snapshot, days, key);
  const range = leaderboardDateRange(ranked.from, ranked.to);
  const rows = project
    ? ranked.rows.filter((r) => r.slug === project)
    : ranked.rows.filter((r) => r.value !== null).slice(0, 3);
  const first = rows[0];
  if (!first || first.value === null) return `No complete GitHub history for ${range}.`;
  let post: string;
  if (project) {
    post = `${measureSentence(first.name, first.value, key, days)}${previousPhrase(first.previous, key, days)}.`;
  } else {
    post = `${measureSentence(first.name, first.value, key, days)}`;
    const rest = rows.slice(1);
    if (rest.length && key === "reduction") {
      if (rest.length > 1 && rest[0]!.value === rest[1]!.value)
        post += `. ${rest[0]!.name} and ${rest[1]!.name} each had ${openIssues(rest[0]!.value ?? 0)}`;
      else
        post += `. ${rest.map((r) => `${r.name} had ${openIssues(r.value ?? 0)}`).join(" and ")}`;
    } else if (rest.length) {
      const tail = rest.map((r) => `${r.name} on ${(r.value ?? 0).toLocaleString("en-AU")}`);
      post += `, with ${tail.join(" and ")}`;
    }
    post += ".";
  }
  return `${post}\n\n${range}.`;
}

// Only these fields cross the private GitHub → public reporting boundary.
export function parseSnapshot(value: unknown): LeaderboardSnapshot | null {
  if (!value || typeof value !== "object") return null;
  const s = value as LeaderboardSnapshot;
  if (
    s.schema !== "woodhouse.github-leaderboard/1" ||
    !/^[a-f0-9]{24}$/.test(s.id) ||
    !Number.isFinite(Date.parse(s.collectedAt)) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(s.from) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(s.through) ||
    !Array.isArray(s.projects)
  )
    return null;
  const projects: ProjectCounts[] = [];
  for (const p of s.projects) {
    if (
      !safeProject(p.slug) ||
      projects.some((a) => a.slug === p.slug) ||
      !Array.isArray(p.daily) ||
      p.daily.length > 180
    )
      return null;
    if (
      [p.issuesComplete, p.eventsComplete, p.pullsComplete].some((v) => typeof v !== "boolean") ||
      (p.openNow !== null && (!Number.isSafeInteger(p.openNow) || p.openNow < 0))
    )
      return null;
    const daily: DayCounts[] = [];
    for (const d of p.daily) {
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(d.day) ||
        d.day < s.from ||
        d.day > s.through ||
        daily.some((a) => a.day === d.day) ||
        [d.merged, d.opened, d.closed, d.reopened].some((v) => !Number.isSafeInteger(v) || v < 0)
      )
        return null;
      daily.push({
        day: d.day,
        merged: d.merged,
        opened: d.opened,
        closed: d.closed,
        reopened: d.reopened
      });
    }
    if (daily.length !== daysBetween(s.from, s.through).length) return null;
    projects.push({
      slug: p.slug,
      daily,
      issuesComplete: p.issuesComplete,
      eventsComplete: p.eventsComplete,
      pullsComplete: p.pullsComplete,
      openNow: p.openNow
    });
  }
  return {
    schema: s.schema,
    id: s.id,
    collectedAt: s.collectedAt,
    from: s.from,
    through: s.through,
    projects
  };
}
export async function readLeaderboard(
  db: D1Database,
  id?: string | null
): Promise<LeaderboardSnapshot | null> {
  if (id && !/^[a-f0-9]{24}$/.test(id)) return null;
  const row = id
    ? await db
        .prepare("SELECT body FROM wh_analytics_reports WHERE id=? AND days=0")
        .bind(id)
        .first<{ body: string }>()
    : await db
        .prepare(
          "SELECT body FROM wh_analytics_reports WHERE days=0 ORDER BY created_at DESC LIMIT 1"
        )
        .first<{ body: string }>();
  if (!row) return null;
  try {
    return parseSnapshot(JSON.parse(row.body));
  } catch {
    return null;
  }
}

export function publishedLeaderboard(
  snapshot: LeaderboardSnapshot,
  admitted: ReadonlySet<string>
): LeaderboardSnapshot {
  return { ...snapshot, projects: snapshot.projects.filter((p) => admitted.has(p.slug)) };
}

/** Signed movement uses one pixels-per-count scale on both sides of zero. */
export function weeklyBarGeometry(value: number | null, maximum: number, signed: boolean) {
  const baseline = signed ? 75 : 130;
  const height =
    value === null ? 0 : (Math.abs(value) / Math.max(1, maximum)) * (signed ? 50 : 105);
  return { baseline, height, y: value !== null && value >= 0 ? baseline - height : baseline };
}
