import type { APIRoute } from "astro";
import { listProjectRecords } from "../../content/repository";
import { loadShareImage } from "../../data/share-desk";
import { logReportFailure, type ReportDependency } from "../../data/report-failure";
export const prerender = false;
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const slug = url.searchParams.get("project") ?? "";
  const asset = url.searchParams.get("asset") ?? "social";
  if (
    !["social", "wordmark", "emblem"].includes(asset) ||
    !/^[a-z0-9-]{1,64}$/.test(slug) ||
    (url.searchParams.get("audit")?.length ?? 0) > 128 ||
    [...url.searchParams.keys()].some((key) => !["project", "audit", "asset"].includes(key))
  )
    return new Response("Invalid image request.", {
      status: 400,
      headers: { "cache-control": "no-store" }
    });
  const startedAt = Date.now();
  // The published-content read is a dependency like any other: its failure
  // belongs to this route's 503, not to an uncaught platform 500.
  let stage = "identities";
  let dependency: ReportDependency = "cms";
  try {
    const result = await listProjectRecords();
    if (result.error) {
      logReportFailure({
        route: "/api/share-image",
        stage,
        scope: asset,
        reportId: null,
        dependency,
        durationMs: Date.now() - startedAt,
        status: 503,
        error: result.error
      });
      return new Response("Projects unavailable.", {
        status: 503,
        headers: { "cache-control": "no-store" }
      });
    }
    const project = result.projects.find((p) => p.slug === slug);
    const source =
      asset === "social"
        ? project?.previewImage
        : project?.slug === "shoalshot"
          ? `https://shoalshot.loftwah.com/ui/brand/shoalshot-${asset}-20261012.webp`
          : undefined;
    if (!source)
      return new Response("Image not found.", {
        status: 404,
        headers: { "cache-control": "no-store" }
      });
    stage = "image";
    dependency = "artwork";
    const image = await loadShareImage(source);
    if (!image)
      return new Response("Image unavailable. Open the original project image.", {
        status: 503,
        headers: { "cache-control": "no-store" }
      });
    return new Response(image.bytes.buffer as ArrayBuffer, {
      headers: {
        "content-type": image.mime,
        "content-disposition": `attachment; filename="${slug}-${asset}.${image.extension}"`,
        "cache-control": "public, max-age=300",
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'; sandbox"
      }
    });
  } catch (error) {
    logReportFailure({
      route: "/api/share-image",
      stage,
      scope: asset,
      reportId: null,
      dependency,
      durationMs: Date.now() - startedAt,
      status: 503,
      error
    });
    return new Response("Image unavailable. Open the original project image.", {
      status: 503,
      headers: { "cache-control": "no-store" }
    });
  }
};
