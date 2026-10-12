/** Presentation priorities, not a second project registry. Identity stays in EmDash. */
import { activityGameIds } from "./activity.ts";
export const sharingGames = ["fighter", "shoalshot", "protocol-11", "bubbles"] as const;
/** Current FM composite includes all registered listening. Keep public membership coupled. */
export function compositeIsPublic(publicIds: Set<string>) {
  return activityGameIds.every((id) => publicIds.has(id));
}
export function parseSnapshot(value: string | null, now = Date.now()): number | undefined | null {
  if (value === null) return undefined;
  if (!/^\d{10}$/.test(value)) return null;
  const snapshot = Number(value);
  const seconds = Math.floor(now / 1000);
  return snapshot % 3600 === 0 && snapshot <= seconds && snapshot >= seconds - 185 * 86400
    ? snapshot
    : null;
}
export function cardPath(game: string, snapshot: number, download = false) {
  const params = new URLSearchParams({ snapshot: String(snapshot) });
  if (game) params.set("game", game);
  if (download) params.set("download", "1");
  return `/api/activity-card.png?${params}`;
}
export function activityLink(game: string, snapshot: number) {
  const params = new URLSearchParams({ snapshot: String(snapshot) });
  if (game) params.set("game", game);
  return `https://woodhouse.loftwah.com/activity/?${params}`;
}
export function cardIsPng(bytes: Uint8Array) {
  if (bytes.length < 24 || bytes.length > 1024 * 1024) return false;
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((byte, i) => bytes[i] === byte)) return false;
  if (String.fromCharCode(...bytes.slice(12, 16)) !== "IHDR") return false;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getUint32(16) === 1200 && view.getUint32(20) === 630;
}
export async function loadActivityCard(
  game: string,
  snapshot: number,
  fetcher: typeof fetch = fetch
) {
  const url = new URL("https://fm.loftwah.com/api/analytics/games-card.png");
  url.searchParams.set("days", "30");
  url.searchParams.set("snapshot", String(snapshot));
  if (game) url.searchParams.set("game", game);
  try {
    const response = await fetcher(url.href, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/png")) return null;
    if (Number(response.headers.get("content-length")) > 1024 * 1024) {
      await response.body?.cancel();
      return null;
    }
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      length += chunk.value.length;
      if (length > 1024 * 1024) {
        await reader.cancel();
        return null;
      }
      chunks.push(chunk.value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return cardIsPng(bytes) ? bytes : null;
  } catch {
    return null;
  }
}
