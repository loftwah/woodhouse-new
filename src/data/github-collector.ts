import {
  leaderboardProjects,
  completeWindow,
  daysBetween,
  readLeaderboard,
  type ProjectCounts,
  type LeaderboardSnapshot
} from "./github-leaderboards.ts";
type Item = {
  id: number;
  created_at: string;
  updated_at?: string;
  merged_at?: string | null;
  pull_request?: unknown;
  event?: string;
  issue?: { id: number; pull_request?: unknown };
};
const maxPages = 100;
/** Never log a request/response: GitHub bodies contain private project work. */
export async function collectGitHub(
  token: string,
  fetcher: typeof fetch = fetch,
  now = Date.now()
): Promise<Omit<LeaderboardSnapshot, "id">> {
  if (!token) throw new Error("GitHub credential unavailable");
  const period = completeWindow(180, now);
  const since = period.from + "T00:00:00Z";
  let requests = 0;
  async function get(path: string) {
    if (++requests > 850) throw Error("GitHub collection request limit reached");
    const response = await fetcher("https://api.github.com" + path, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Woodhouse-project-report"
      },
      redirect: "manual",
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) throw new Error(`GitHub read failed (${response.status})`);
    return response.json() as Promise<unknown>;
  }
  async function pages(
    path: string,
    timestamp: "created_at" | "updated_at",
    count: (item: Item) => void
  ) {
    const seen = new Set<number>();
    for (let page = 1; page <= maxPages; page++) {
      const body = await get(`${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
      if (!Array.isArray(body)) throw Error("GitHub response unavailable");
      const previousSize = seen.size;
      for (const item of body as Item[])
        if (!seen.has(item.id)) {
          seen.add(item.id);
          count(item);
        }
      // Count a page immediately. Retaining private issue/PR bodies across pages
      // exhausted the production Worker's memory on its first scheduled run.
      if (body.length === 100 && seen.size === previousSize) return false;
      // Issues/pulls explicitly sort by update time. The events endpoint has no
      // documented sort parameter, so require its end rather than guess order.
      if (
        body.length < 100 ||
        (timestamp === "updated_at" && body.every((i: Item) => (i[timestamp] ?? "") < since))
      )
        return true;
    }
    return false;
  }
  const projects: ProjectCounts[] = [];
  for (const project of leaderboardProjects) {
    const prefix = `/repos/loftwah/${project.repo}`;
    const daily = daysBetween(period.from, period.to).map((day) => ({
      day,
      merged: 0,
      opened: 0,
      closed: 0,
      reopened: 0
    }));
    const byDay = new Map(daily.map((d) => [d.day, d]));
    const issuesComplete = await pages(
      `${prefix}/issues?state=all&sort=updated&direction=desc&since=${encodeURIComponent(since)}`,
      "updated_at",
      (issue) => {
        if (!issue.pull_request) {
          const d = byDay.get(issue.created_at.slice(0, 10));
          if (d) d.opened++;
        }
      }
    );
    const pullsComplete = await pages(
      `${prefix}/pulls?state=closed&sort=updated&direction=desc`,
      "updated_at",
      (pull) => {
        if (pull.merged_at) {
          const d = byDay.get(pull.merged_at.slice(0, 10));
          if (d) d.merged++;
        }
      }
    );
    const eventsComplete = await pages(`${prefix}/issues/events`, "created_at", (event) => {
      if (!event.issue || event.issue.pull_request) return;
      const d = byDay.get(event.created_at.slice(0, 10));
      if (d && (event.event === "closed" || event.event === "reopened")) d[event.event]++;
    });
    const search = (await get(
      `/search/issues?q=${encodeURIComponent(`repo:loftwah/${project.repo} is:issue is:open`)}&per_page=1`
    )) as { total_count?: number; incomplete_results?: boolean };
    projects.push({
      slug: project.slug,
      daily,
      issuesComplete,
      eventsComplete,
      pullsComplete,
      openNow:
        Number.isSafeInteger(search.total_count) && !search.incomplete_results
          ? search.total_count!
          : null
    });
  }
  return {
    schema: "woodhouse.github-leaderboard/1",
    collectedAt: new Date(now).toISOString(),
    from: period.from,
    through: period.to,
    projects
  };
}
async function storeLeaderboard(db: D1Database, body: Omit<LeaderboardSnapshot, "id">) {
  const bytes = new TextEncoder().encode(JSON.stringify(body));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const id = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
  const snapshot = { ...body, id };
  await db
    .prepare("INSERT OR IGNORE INTO wh_analytics_reports(id,created_at,days,body) VALUES(?,?,0,?)")
    .bind(id, body.collectedAt, JSON.stringify(snapshot))
    .run();
  return snapshot;
}
export async function refreshLeaderboards(
  environment: { DB: D1Database; WOODHOUSE_GITHUB_TOKEN?: string },
  fetcher: typeof fetch = fetch,
  now = Date.now()
) {
  if (!environment.WOODHOUSE_GITHUB_TOKEN) return;
  try {
    // Redacted server-side permission receipt, deliberately outside the public
    // snapshot namespace. Conditional reads avoid downloading unchanged bodies.
    const prior = await environment.DB.prepare(
      "SELECT body FROM wh_analytics_reports WHERE id='github-auth'"
    ).first<{ body: string }>();
    const previous = prior ? JSON.parse(prior.body) : {};
    const etags: Record<string, string> = previous.etags ?? {};
    for (const project of leaderboardProjects)
      for (const kind of ["issues", "pulls"]) {
        const tag = `${project.slug}/${kind}`;
        const response = await fetcher(
          `https://api.github.com/repos/loftwah/${project.repo}/${kind}?per_page=1`,
          {
            headers: {
              Authorization: `Bearer ${environment.WOODHOUSE_GITHUB_TOKEN}`,
              Accept: "application/vnd.github+json",
              "User-Agent": "Woodhouse-project-report",
              ...(etags[tag] ? { "If-None-Match": etags[tag] } : {})
            },
            redirect: "manual",
            signal: AbortSignal.timeout(20000)
          }
        );
        await response.body?.cancel();
        if (!response.ok && response.status !== 304) throw Error("GitHub permission check failed");
        if (response.headers.get("etag")) etags[tag] = response.headers.get("etag")!;
      }
    const receipt = {
      checkedAt: new Date(now).toISOString(),
      issuesRead: true,
      pullsRead: true,
      projects: leaderboardProjects.map((p) => p.slug),
      etags,
      collectedThrough:
        typeof previous.collectedThrough === "string" ? previous.collectedThrough : null,
      reportId: typeof previous.reportId === "string" ? previous.reportId : null
    };
    const saveReceipt = () =>
      environment.DB.prepare(
        "INSERT INTO wh_analytics_reports(id,created_at,days,body) VALUES('github-auth',?,-2,?) ON CONFLICT(id) DO UPDATE SET created_at=excluded.created_at,body=excluded.body"
      )
        .bind(new Date(now).toISOString(), JSON.stringify(receipt))
        .run();
    await saveReceipt();
    const latest = await readLeaderboard(environment.DB);
    // A local backfill must not bypass the installed Worker's first collection.
    if (
      latest?.through === completeWindow(180, now).to &&
      receipt.collectedThrough === latest.through
    )
      return;
    const collected = await storeLeaderboard(
      environment.DB,
      await collectGitHub(environment.WOODHOUSE_GITHUB_TOKEN ?? "", fetcher, now)
    );
    receipt.collectedThrough = collected.through;
    receipt.reportId = collected.id;
    await saveReceipt();
  } catch {
    console.error(
      "GitHub leaderboard refresh failed; the dated last successful report remains available."
    );
  }
}
