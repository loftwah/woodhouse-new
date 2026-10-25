import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { Resvg } from "@resvg/resvg-wasm";
import { ensureReportRenderer, loadReportFonts } from "../../data/report-renderer";
import { listProjectRecords, listPublishedDispatches } from "../../content/repository";
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
import { storyFor } from "../../data/connected-stories";
import { outcomeCard } from "../../data/outcome-card";
import { portfolioEdition } from "../../data/portfolio-edition";
import { editionCard } from "../../data/edition-card";
import { outcomeStories } from "../../data/connected-stories";
import {
  logReportDegraded,
  logReportFailure,
  type ReportDependency
} from "../../data/report-failure";
export const prerender = false;
const artwork = new Map<string, Promise<string | undefined>>();
const knownMeasures = new Set<string>([
  overviewMeasure.key,
  ...measureChoices.map((choice) => choice.key),
  ...modeMeasureChoices.map((choice) => choice.key)
]);
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const editionKey = url.searchParams.get("edition");
  if (
    editionKey &&
    (editionKey !== "one-more-round" ||
      ["project", "measure", "story", "destination", "week"].some((k) => url.searchParams.has(k)))
  )
    return new Response("Edition scope unavailable.", { status: 400 });
  const outcome = storyFor(url.searchParams.get("story"));
  if (url.searchParams.has("story") && (!outcome || selectedStoryMismatch()))
    return new Response("Story scope unavailable.", { status: 400 });
  function selectedStoryMismatch() {
    return (
      url.searchParams.get("project") !== outcome?.project ||
      url.searchParams.get("measure") !== outcome?.measure ||
      url.searchParams.has("destination") ||
      url.searchParams.has("week")
    );
  }
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
          "destination",
          "story",
          "edition"
        ].includes(k) || url.searchParams.getAll(k).length !== 1
    )
  )
    return new Response("Invalid report image.", {
      status: 400,
      headers: { "cache-control": "no-store" }
    });
  const startedAt = Date.now();
  const scope = editionKey ? "edition" : outcome ? "story" : selected ? "project" : "overview";
  // Every public read and every renderer step below answers with this route's
  // own 503. Nothing before this point touches a dependency, so a rejected CMS
  // or database read can no longer escape as an uncaught platform 500.
  let stage = "identities";
  let dependency: ReportDependency = "cms";
  try {
    const identities = await listProjectRecords();
    if (identities.error) {
      logReportFailure({
        route: "/api/portfolio-card.png",
        stage,
        scope,
        reportId: id,
        dependency,
        durationMs: Date.now() - startedAt,
        status: 503,
        error: identities.error
      });
      return new Response("Reporting unavailable.", {
        status: 503,
        headers: { "cache-control": "no-store" }
      });
    }
    const publicIds = new Set(["woodhouse", ...identities.projects.map((p) => p.slug)]);
    const publishedDestinationSlugs = new Set(
      identities.projects
        .filter(
          (p) =>
            p.siteUrl && discoveryProjects.includes(p.slug as (typeof discoveryProjects)[number])
        )
        .map((p) => p.slug)
    );
    if (selected && !publicIds.has(selected))
      return new Response("Project unavailable.", { status: 404 });
    // A destination must be a currently published discovery project with a site
    // address. An unknown value is a bad request rather than a silent fallback to
    // the portfolio composition.
    if (destination && !publishedDestinationSlugs.has(destination))
      return new Response("Destination unavailable.", { status: 404 });
    stage = "report-read";
    dependency = "database";
    const stored = await readPortfolioReport((env as unknown as { DB: D1Database }).DB, id);
    if (!stored)
      return new Response("Report unavailable.", {
        status: 404,
        headers: { "cache-control": "no-store" }
      });
    const report = projectReport(stored, selected as AnalyticsProject | null, publicIds);
    if (!report.projects.length) return new Response("Report unavailable.", { status: 404 });
    // A destination story only exists in the discovery scope. Resolve the measure
    // the renderer will actually use for this report, not just the raw parameter,
    // so an edited link cannot return a visits/gameplay composition under a
    // discovery label or a Woodhouse-to-Woodhouse story.
    if (destination) {
      const renderProject = report.projects.length === 1 ? report.projects[0]!.project : null;
      const resolved = resolveMeasure(renderProject, measure);
      if (
        (selected !== null && selected !== "woodhouse") ||
        (!isOverviewMeasure(resolved) && resolved.key !== "project_opens")
      )
        return new Response("Destination story unavailable for this scope.", {
          status: 400,
          headers: { "cache-control": "no-store" }
        });
    }
    stage = "renderer-init";
    dependency = "wasm";
    await ensureReportRenderer();
    const names = new Map([
      ...[...identities.projects.map((p) => [p.slug, p.name] as const)],
      ["woodhouse", "Woodhouse"]
    ]);
    stage = "edition-dispatches";
    dependency = "cms";
    const publishedEditions = editionKey ? await listPublishedDispatches() : null;
    const edition =
      publishedEditions && !publishedEditions.error
        ? portfolioEdition(publishedEditions.dispatches)
        : null;
    if (editionKey && publishedEditions?.error) {
      logReportFailure({
        route: "/api/portfolio-card.png",
        stage,
        scope,
        reportId: id,
        dependency,
        durationMs: Date.now() - startedAt,
        status: 503,
        error: publishedEditions.error
      });
      return new Response("Edition snapshot unavailable.", {
        status: 503,
        headers: { "cache-control": "no-store" }
      });
    }
    if (editionKey && (!edition || edition.reportId !== id))
      return new Response("Edition snapshot unavailable.", { status: 404 });
    const editionArt = new Map<string, string>();
    if (edition) {
      stage = "edition-artwork";
      dependency = "artwork";
      await Promise.all(
        outcomeStories
          .filter((s) => ["protocol-11", "shoalshot"].includes(s.key) && publicIds.has(s.project))
          .map(async (s) => {
            const imageStarted = Date.now();
            try {
              const response = await fetch(new URL(s.artwork, url.origin), {
                signal: AbortSignal.timeout(4000),
                redirect: "manual"
              });
              if (!response.ok || !response.headers.get("content-type")?.startsWith("image/jpeg")) {
                logReportDegraded({
                  route: "/api/portfolio-card.png",
                  stage,
                  scope,
                  reportId: id,
                  dependency,
                  durationMs: Date.now() - imageStarted,
                  status: response.ok ? null : response.status,
                  error: `artwork ${s.key} unavailable`
                });
                return;
              }
              const bytes = new Uint8Array(await response.arrayBuffer());
              if (bytes.length > 500000) {
                logReportDegraded({
                  route: "/api/portfolio-card.png",
                  stage,
                  scope,
                  reportId: id,
                  dependency,
                  durationMs: Date.now() - imageStarted,
                  status: null,
                  error: `artwork ${s.key} too large`
                });
                return;
              }
              let binary = "";
              for (const b of bytes) binary += String.fromCharCode(b);
              editionArt.set(s.key, `data:image/jpeg;base64,${btoa(binary)}`);
            } catch (error) {
              // Decoration only: one missing image must not replace the edition
              // cover, which is otherwise a complete and truthful card.
              logReportDegraded({
                route: "/api/portfolio-card.png",
                stage,
                scope,
                reportId: id,
                dependency,
                durationMs: Date.now() - imageStarted,
                status: null,
                error
              });
            }
          })
      );
    }
    let embedded: string | undefined;
    if (outcome) {
      stage = "story-artwork";
      dependency = "artwork";
      const path =
        outcome.key === "music" ? "/share/loftwahfm/this-is-loftwahfm.jpg" : outcome.artwork;
      const key = url.origin + path;
      if (!artwork.has(key))
        artwork.set(
          key,
          (async () => {
            const imageStarted = Date.now();
            try {
              const response = await fetch(key, {
                redirect: "manual",
                signal: AbortSignal.timeout(4000)
              });
              if (!response.ok || !response.headers.get("content-type")?.startsWith("image/"))
                throw Error(`artwork unavailable (${response.status})`);
              const bytes = new Uint8Array(await response.arrayBuffer());
              if (bytes.length > 500000) throw Error("art too large");
              let binary = "";
              for (const byte of bytes) binary += String.fromCharCode(byte);
              return `data:image/jpeg;base64,${btoa(binary)}`;
            } catch (error) {
              // The story still renders without its cover; the visitor loses
              // decoration, not the measured outcome or its boundary.
              artwork.delete(key);
              logReportDegraded({
                route: "/api/portfolio-card.png",
                stage: "story-artwork",
                scope,
                reportId: id,
                dependency: "artwork",
                durationMs: Date.now() - imageStarted,
                status: null,
                error
              });
              return undefined;
            }
          })()
        );
      embedded = await artwork.get(key);
    }
    // Fetch fonts only once the request is known to render. The 4s deadline
    // therefore covers the font subrequest alone, and an edition 404/503 does
    // not start two subrequests for a card it will not return.
    stage = "fonts";
    dependency = "font";
    const fontBuffers = await loadReportFonts(url.origin);
    stage = "compose";
    dependency = "render";
    const renderer = new Resvg(
      edition
        ? editionCard(edition, report, format as ReportFormat, url.origin, editionArt, publicIds)
        : outcome
          ? outcomeCard(report, outcome, format as ReportFormat, url.origin, embedded)
          : reportSvg(
              report,
              names,
              format as ReportFormat,
              measure ?? undefined,
              url.origin,
              week ?? undefined,
              destination ?? undefined,
              publishedDestinationSlugs
            ),
      {
        font: { fontBuffers, defaultFontFamily: "Bricolage Grotesque" }
      }
    );
    try {
      stage = "render";
      const rendered = renderer.render();
      try {
        const bytes = new Uint8Array(rendered.asPng());
        return new Response(bytes, {
          headers: {
            "content-type": "image/png",
            "cache-control": "public, max-age=300",
            "x-content-type-options": "nosniff",
            ...(url.searchParams.has("download")
              ? {
                  // `woodhouse` is the portfolio scope's own project key, so
                  // interpolating it beside the site prefix produced
                  // `woodhouse-woodhouse-<id>`. Name the scope once.
                  "content-disposition": `attachment; filename="${selected && selected !== "woodhouse" ? `woodhouse-${selected}` : "woodhouse-portfolio"}-${id}-${format}.png"`
                }
              : {})
          }
        });
      } finally {
        rendered.free();
      }
    } finally {
      // A failed render or PNG encode must not leave the WASM allocations for
      // this isolate to discover later.
      renderer.free();
    }
  } catch (error) {
    logReportFailure({
      route: "/api/portfolio-card.png",
      stage,
      scope,
      reportId: id,
      dependency,
      durationMs: Date.now() - startedAt,
      status: 503,
      error
    });
    return new Response("Report image unavailable.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  }
};
