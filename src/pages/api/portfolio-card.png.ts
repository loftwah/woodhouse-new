import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import wasm from "../../assets/resvg.wasm";
import { listProjectRecords } from "../../content/repository";
import { readPortfolioReport, projectReport } from "../../data/portfolio-reports";
import { reportSvg, reportFormats, type ReportFormat } from "../../data/portfolio-card";
import {
  isOverviewMeasure,
  measureChoices,
  modeMeasureChoices,
  overviewMeasure,
  resolveMeasure
} from "../../data/analytics-workbench";
import { discoveryProjects, type AnalyticsProject } from "../../data/portfolio-analytics";
export const prerender = false;
let initialized: Promise<void> | undefined;
let fonts: Promise<Uint8Array[]> | undefined;
const knownMeasures = new Set<string>([
  overviewMeasure.key,
  ...measureChoices.map((choice) => choice.key),
  ...modeMeasureChoices.map((choice) => choice.key)
]);
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const format = url.searchParams.get("format") ?? "landscape",
    id = url.searchParams.get("report"),
    selected = url.searchParams.get("project"),
    measure = url.searchParams.get("measure"),
    week = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get("week") ?? "")
      ? url.searchParams.get("week")!
      : null,
    destination = /^[a-z0-9-]{1,40}$/.test(url.searchParams.get("destination") ?? "")
      ? url.searchParams.get("destination")!
      : null;
  if (
    !id ||
    (measure !== null && measure !== "replays" && !knownMeasures.has(measure)) ||
    !Object.hasOwn(reportFormats, format) ||
    [...url.searchParams.keys()].some(
      (k) =>
        ![
          "format",
          "report",
          "project",
          "download",
          "audit",
          "measure",
          "week",
          "destination"
        ].includes(k)
    )
  )
    return new Response("Invalid report image.", {
      status: 400,
      headers: { "cache-control": "no-store" }
    });
  const identities = await listProjectRecords();
  if (identities.error)
    return new Response("Reporting unavailable.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  const publicIds = new Set(["woodhouse", ...identities.projects.map((p) => p.slug)]);
  if (selected && !publicIds.has(selected))
    return new Response("Project unavailable.", { status: 404 });
  // A destination must be a currently published project. An unknown value is a
  // bad request rather than a silent fallback to the portfolio composition.
  if (destination && !publicIds.has(destination))
    return new Response("Destination unavailable.", { status: 404 });
  // A destination story only exists in the discovery scope. Validate the
  // measure the renderer will actually resolve, not just the raw parameter, so
  // an edited link cannot return a visits/gameplay composition under a
  // discovery label or a Woodhouse-to-Woodhouse story.
  if (destination) {
    const resolved = resolveMeasure(selected as AnalyticsProject | null, measure);
    if (
      !discoveryProjects.includes(destination as (typeof discoveryProjects)[number]) ||
      (selected !== null && selected !== "woodhouse") ||
      (!isOverviewMeasure(resolved) && resolved.key !== "project_opens")
    )
      return new Response("Destination story unavailable for this scope.", {
        status: 400,
        headers: { "cache-control": "no-store" }
      });
  }
  try {
    const stored = await readPortfolioReport((env as unknown as { DB: D1Database }).DB, id);
    if (!stored)
      return new Response("Report unavailable.", {
        status: 404,
        headers: { "cache-control": "no-store" }
      });
    const report = projectReport(stored, selected as AnalyticsProject | null, publicIds);
    if (!report.projects.length) return new Response("Report unavailable.", { status: 404 });
    initialized ??= initWasm(wasm);
    await initialized;
    fonts ??= Promise.all(
      [400, 700].map(async (weight) => {
        const response = await fetch(new URL(`/fonts/bricolage-report-${weight}.ttf`, url.origin), {
          redirect: "manual",
          signal: AbortSignal.timeout(4000)
        });
        if (!response.ok) throw Error("font unavailable");
        return new Uint8Array(await response.arrayBuffer());
      })
    ).catch((error) => {
      fonts = undefined;
      throw error;
    });
    const names = new Map([
      ...[...identities.projects.map((p) => [p.slug, p.name] as const)],
      ["woodhouse", "Woodhouse"]
    ]);
    const renderer = new Resvg(
      reportSvg(
        report,
        names,
        format as ReportFormat,
        measure ?? undefined,
        url.origin,
        week ?? undefined,
        destination ?? undefined
      ),
      {
        font: { fontBuffers: await fonts, defaultFontFamily: "Bricolage Grotesque" }
      }
    );
    const rendered = renderer.render();
    const bytes = new Uint8Array(rendered.asPng());
    rendered.free();
    renderer.free();
    return new Response(bytes, {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
        ...(url.searchParams.has("download")
          ? {
              "content-disposition": `attachment; filename="woodhouse-${selected ?? "portfolio"}-${id}-${format}.png"`
            }
          : {})
      }
    });
  } catch {
    return new Response("Report image unavailable.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  }
};
