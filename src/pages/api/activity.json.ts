import type { APIRoute } from "astro";
import { listProjectRecords } from "../../content/repository";
import { activitySource, loadListeningReport, projectListeningReport } from "../../data/activity";
export const prerender = false;
export const GET: APIRoute = async ({ cache }) => {
  const [projects, report] = await Promise.all([listProjectRecords(), loadListeningReport()]);
  if (projects.error || !report) {
    cache.set(false);
    return Response.json(
      { available: false, source: activitySource },
      {
        status: 503,
        headers: { "cache-control": "no-store" }
      }
    );
  }
  for (const hint of projects.cacheHints) cache.set(hint);
  cache.set({ lastModified: new Date(report.asOf) });
  const publicIds = new Set(projects.projects.map((p) => p.slug));
  return Response.json({
    available: true,
    metric: "reported-audible-seconds",
    days: 30,
    source: activitySource,
    ...projectListeningReport(report, publicIds)
  });
};
