import type { APIRoute } from "astro";
import { listProjectRecords } from "../../content/repository";
import {
  compositeIsPublic,
  cardFormats,
  type CardFormat,
  loadActivityCard,
  parseSnapshot,
  sharingGames
} from "../../data/activity-sharing";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  // Each byte-identical snapshot is cached at its public source. No arbitrary URL relay.
  cache.set(false);
  const game = url.searchParams.get("game") ?? "";
  const format = url.searchParams.get("format") ?? "landscape";
  const snapshot = parseSnapshot(url.searchParams.get("snapshot"));
  const download = url.searchParams.get("download");
  const invalid =
    !Object.hasOwn(cardFormats, format) ||
    snapshot === null ||
    (game !== "" && !sharingGames.some((id) => id === game)) ||
    (download !== null && download !== "1") ||
    // The existing publication audit adds a cache-busting stamp, never forwarded upstream.
    (url.searchParams.get("audit")?.length ?? 0) > 128 ||
    [...url.searchParams.keys()].some(
      (key) => !["game", "snapshot", "download", "audit", "format"].includes(key)
    );
  if (invalid)
    return new Response("Invalid image request.", {
      status: 400,
      headers: { "cache-control": "no-store" }
    });
  {
    const result = await listProjectRecords();
    if (result.error)
      return new Response("Projects unavailable.", {
        status: 503,
        headers: { "cache-control": "no-store" }
      });
    const ids = new Set(result.projects.map((project) => project.slug));
    if (game ? !ids.has(game) : !compositeIsPublic(ids))
      return new Response("Not found.", { status: 404, headers: { "cache-control": "no-store" } });
  }
  const selected = snapshot ?? Math.floor(Date.now() / 3600000) * 3600;
  const shape = format as CardFormat;
  const dimensions = cardFormats[shape];
  const bytes = await loadActivityCard(game, selected, fetch, shape);
  if (!bytes)
    return new Response("Image unavailable. Try the listening report.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  return new Response(bytes.buffer as ArrayBuffer, {
    headers: {
      "content-type": "image/png",
      "cache-control": `public, max-age=${snapshot === undefined ? 60 : 3600}`,
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${game || "games-radio"}-${selected}-${dimensions.width}x${dimensions.height}.png"`,
      "x-listening-snapshot": String(selected),
      "x-image-width": String(dimensions.width),
      "x-image-height": String(dimensions.height),
      "x-content-type-options": "nosniff"
    }
  });
};
