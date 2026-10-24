import type { APIRoute } from "astro";
import { readLeaderboardShareLink } from "../../data/leaderboard-links";
export const prerender = false;
export const GET: APIRoute = ({ params, url, redirect, cache }) => {
  cache.set(false);
  const view = readLeaderboardShareLink(params.view ?? "");
  if (!view) return new Response("Link unavailable.", { status: 404 });
  const target = new URL(view.href, url.origin);
  if (url.searchParams.get("analytics") === "off") target.searchParams.set("analytics", "off");
  if (url.searchParams.has("qa")) target.searchParams.set("qa", url.searchParams.get("qa") ?? "");
  return redirect(target.pathname + target.search, 302);
};
