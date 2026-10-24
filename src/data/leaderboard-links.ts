import {
  leaderboardLink,
  rankingMeasures,
  safeProject,
  type RankingMeasure
} from "./github-leaderboards.ts";

/** Lossless links to existing reports; no alias store or external shortener. */
export function leaderboardShareLink(
  id: string,
  days: number,
  measure: RankingMeasure,
  project?: string
) {
  if (!/^[a-f0-9]{24}$/.test(id)) throw Error("Invalid report");
  const code = btoa(
    id
      .match(/../g)!
      .map((pair) => String.fromCharCode(parseInt(pair, 16)))
      .join("")
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_");
  return `/l/${[code, ...(days === 28 ? [] : [String(days)]), ...(measure === "merged" ? [] : [measure]), ...(project ? [project] : [])].join("/")}/`;
}

export function readLeaderboardShareLink(path: string) {
  const parts = path.replace(/\/$/, "").split("/");
  const code = parts.shift() ?? "";
  if (!/^[A-Za-z0-9_-]{16}$/.test(code)) return null;
  let id: string;
  try {
    id = [...atob(code.replaceAll("-", "+").replaceAll("_", "/"))]
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
  const days = /^(7|28|90)$/.test(parts[0] ?? "") ? Number(parts.shift()) : 28;
  const measure = rankingMeasures.find((item) => item.key === parts[0])?.key ?? "merged";
  if (parts[0] === measure) parts.shift();
  const project = parts.shift();
  if (parts.length || (project !== undefined && !safeProject(project))) return null;
  return { id, days, measure, project, href: leaderboardLink(id, days, measure, project) };
}
