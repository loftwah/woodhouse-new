/** Public aggregate projection only. Never forward upstream identities or raw events. */
export const activitySource = "https://fm.loftwah.com/api/analytics/games?days=30";
const gameIds = new Set(["bubbles", "protocol-11", "fighter", "shoalshot", "pirates"]);
type GameListening = { id: string; seconds: number; starts: number; rank: number | null };
export type ListeningReport = {
  asOf: string;
  from: string;
  to: string;
  collectionStarted: string;
  games: GameListening[];
  stale: boolean;
};
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function day(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
function count(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
export function parseListeningReport(raw: unknown, now = Date.now()): ListeningReport | null {
  if (
    !record(raw) ||
    raw.ok !== true ||
    raw.available !== true ||
    raw.days !== 30 ||
    typeof raw.asOf !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T/.test(raw.asOf) ||
    !Number.isFinite(Date.parse(raw.asOf)) ||
    Date.parse(raw.asOf) > now + 300000 ||
    !day(raw.from) ||
    !day(raw.to) ||
    !day(raw.collectionStarted) ||
    raw.from > raw.to ||
    raw.collectionStarted > raw.to ||
    raw.to !== new Date(Date.parse(raw.asOf)).toISOString().slice(0, 10) ||
    Date.parse(raw.to) - Date.parse(raw.from) !== 29 * 86400000 ||
    !Array.isArray(raw.games)
  )
    return null;
  const games: GameListening[] = [];
  for (const row of raw.games) {
    if (!record(row) || typeof row.id !== "string" || !gameIds.has(row.id)) continue;
    if (!count(row.seconds) || !count(row.starts) || games.some((g) => g.id === row.id))
      return null;
    games.push({ id: row.id, seconds: row.seconds, starts: row.starts, rank: null });
  }
  return {
    asOf: raw.asOf,
    from: raw.from,
    to: raw.to,
    collectionStarted: raw.collectionStarted,
    games,
    stale: now - Date.parse(raw.asOf) > 86400000
  };
}
/** Rank only the public membership actually presented to readers. */
export function projectListeningReport(
  report: ListeningReport,
  publicIds: Set<string>
): ListeningReport {
  const games = report.games.filter((g) => publicIds.has(g.id)).map((g) => ({ ...g }));
  games.sort((a, b) => b.seconds - a.seconds || a.id.localeCompare(b.id));
  for (let i = 0; i < games.length; i++) {
    const game = games[i]!;
    game.rank =
      game.seconds === 0
        ? null
        : i > 0 && games[i - 1]!.seconds === game.seconds
          ? games[i - 1]!.rank
          : i + 1;
  }
  return { ...report, games };
}
export async function loadListeningReport(
  fetcher: typeof fetch = fetch
): Promise<ListeningReport | null> {
  try {
    const response = await fetcher(activitySource, {
      signal: AbortSignal.timeout(4000),
      redirect: "manual"
    });
    if (!response.ok) {
      console.warn("Public game listening request failed", { status: response.status });
      return null;
    }
    const raw: unknown = await response.json();
    const parsed = parseListeningReport(raw);
    if (!parsed)
      console.warn("Public game listening aggregate rejected", {
        available: record(raw) && raw.available === true,
        ageSeconds:
          record(raw) && typeof raw.asOf === "string"
            ? Math.round((Date.now() - Date.parse(raw.asOf)) / 1000)
            : null
      });
    return parsed;
  } catch (error) {
    console.warn("Public game listening request unavailable", {
      reason: error instanceof Error ? error.name : "unknown",
      detail:
        error instanceof Error && error.name === "TypeError"
          ? error.message.slice(0, 300)
          : undefined
    });
    return null;
  }
}
export function listeningDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60
    ? `${minutes}m ${seconds % 60}s`
    : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}
