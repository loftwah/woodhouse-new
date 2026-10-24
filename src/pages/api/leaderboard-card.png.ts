import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { Resvg } from "@resvg/resvg-wasm";
import { ensureReportRenderer } from "../../data/report-renderer";
import {
  readLeaderboard,
  measureKey,
  selectedDays,
  safeProject
} from "../../data/github-leaderboards";
import { publishedLeaderboard } from "../../data/github-leaderboards";
import { listProjectRecords } from "../../content/repository";
import {
  leaderboardSvg,
  leaderboardFormats,
  type LeaderboardFormat
} from "../../data/leaderboard-art";
export const prerender = false;
let fonts: Promise<Uint8Array[]> | undefined;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const format = url.searchParams.get("format") ?? "landscape";
  const version = url.searchParams.get("v");
  const edition = version === "3" ? 3 : version === "2" ? 2 : 1;
  const project = url.searchParams.get("project") ?? undefined;
  if (
    !Object.hasOwn(leaderboardFormats, format) ||
    (project && !safeProject(project)) ||
    !url.searchParams.get("report")
  )
    return new Response("Image unavailable.", { status: 400 });
  const identities = await listProjectRecords();
  if (identities.error)
    return new Response("Projects unavailable.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  const source = await readLeaderboard(
    (env as unknown as { DB: D1Database }).DB,
    url.searchParams.get("report")
  );
  const report = source
    ? publishedLeaderboard(
        source,
        new Set(["woodhouse", ...identities.projects.map((p) => p.slug)])
      )
    : null;
  if (!report || (project && !report.projects.some((p) => p.slug === project)))
    return new Response("Report unavailable.", { status: 404 });
  let stage = "renderer initialization";
  try {
    await ensureReportRenderer();
    stage = "font loading";
    fonts ??= Promise.all(
      [400, 700].map(async (weight) => {
        const r = await fetch(new URL(`/fonts/bricolage-report-${weight}.ttf`, url.origin), {
          redirect: "manual",
          signal: AbortSignal.timeout(6000)
        });
        if (!r.ok) throw Error("Font unavailable");
        return new Uint8Array(await r.arrayBuffer());
      })
    ).catch((e) => {
      fonts = undefined;
      throw e;
    });
    const buffers = await fonts;
    stage = "SVG conversion";
    const renderer = new Resvg(
      leaderboardSvg(
        report,
        selectedDays(url.searchParams.get("days")),
        measureKey(url.searchParams.get("measure")),
        format as LeaderboardFormat,
        project,
        edition
      ),
      { font: { fontBuffers: buffers, defaultFontFamily: "Bricolage Grotesque" } }
    );
    stage = "PNG rendering";
    const image = renderer.render();
    const bytes = new Uint8Array(image.asPng());
    image.free();
    renderer.free();
    return new Response(bytes, {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=86400",
        "x-content-type-options": "nosniff",
        ...(url.searchParams.has("download")
          ? {
              "content-disposition": `attachment; filename="${edition === 3 ? `woodhouse-${project ?? "leaderboards"}-${selectedDays(url.searchParams.get("days"))}days-${measureKey(url.searchParams.get("measure"))}-${report.through}-${format}` : edition === 2 ? `woodhouse-${project ?? "github-rankings"}-${selectedDays(url.searchParams.get("days"))}days-${measureKey(url.searchParams.get("measure"))}-${report.through}-${format}` : `woodhouse-${project ?? "leaderboard"}-${report.id}-${format}`}.png"`
            }
          : {})
      }
    });
  } catch (error) {
    // This stage handles only local WASM, public fonts and the approved counts.
    // No GitHub response or credential enters it; keep failures off the page.
    console.error(
      "Leaderboard PNG failed",
      stage,
      error instanceof Error ? error.message : "unknown failure"
    );
    return new Response("Image unavailable. Please try again.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  }
};
