import { dispatchPath } from "../data/what-we-built";
import { SITE_ORIGIN } from "../data/site-origin.ts";
import type { APIRoute } from "astro";
import {
  asText,
  listProjectRecords,
  listPublicEvidence,
  listPublicIncidents,
  listPublishedDispatches
} from "../content/repository";
import { portfolioReadout } from "../data/portfolio";
import { activeProjects } from "../data/project-lifecycle";
import { agentCapabilities, AGENT_CAPABILITY_REVIEWED } from "../data/agent-capabilities";

export const prerender = false;
const siteOrigin = new URL(import.meta.env.SITE ?? SITE_ORIGIN).origin;

export const GET: APIRoute = async ({ cache }) => {
  const [projectResult, dispatchResult, incidentResult, evidenceResult] = await Promise.all([
    listProjectRecords(),
    listPublishedDispatches(),
    listPublicIncidents(),
    listPublicEvidence()
  ]);
  if (projectResult.error || dispatchResult.error || incidentResult.error || evidenceResult.error) {
    return new Response("Unable to load the current public facts.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "private, no-store" }
    });
  }
  for (const hint of projectResult.cacheHints) cache.set(hint);
  for (const hint of [dispatchResult.cacheHint, incidentResult.cacheHint, evidenceResult.cacheHint])
    if (hint) cache.set(hint);

  const projects = projectResult.projects;
  const active = activeProjects(projects);
  // The newest review in the portfolio, not the first project's. This file is
  // read by agents deciding how much to trust the record, so quoting the
  // oldest project's date here understates how current part of it is.
  const reviewDate = portfolioReadout(projects).reviewDate;
  const withPublicSite = projects.filter((project) => project.siteUrl).length;
  const url = (path: string) => `${siteOrigin}${path}`;

  const lines: string[] = [
    "# WOODHOUSE",
    "",
    "> The Loftwah Software Factory: a public, evidence-led observatory, engineering journal, project portfolio and professional record.",
    "",
    "## Read first",
    "",
    `- ${url("/agents/")}`,
    `- ${url("/agents/facts.json")}`,
    `- ${url("/factory/")}`,
    `- ${url("/activity/")} (analytics: each project's own relevant measure)`,
    `- ${url("/api/activity.json")} (aggregate listening; not unique players)`,
    `- ${url("/architecture/")}`,
    `- ${url("/doctrine/")}`,
    `- ${url("/dean/")}`,
    "",
    "## Stories",
    "",
    ...dispatchResult.dispatches.map(
      (dispatch) =>
        `- ${url(dispatchPath(dispatch))} (${dispatch.kind}, reviewed ${dispatch.reviewDate})`
    ),
    "",
    "## Projects",
    "",
    `${active.length} active projects, ${projects.length} in the record. Paused and retired projects keep their dossier and dated evidence.`,
    "",
    ...projects.map(
      (project) =>
        `- ${url(`/projects/${project.slug}/`)} (${project.discipline}; lifecycle: ${project.lifecycle}; state: ${project.state}; reviewed ${project.reviewDate})`
    ),
    "",
    "## Agent capabilities",
    "",
    ...agentCapabilities.flatMap((capability) =>
      capability.operations.map(
        (operation) =>
          `- ${capability.provider.name} → ${capability.app.name}: ${operation.method} ${operation.path} (${operation.kind}; ${operation.availability}${operation.confirmation ? "; confirmation required" : ""}; verified ${operation.verified}) — ${capability.provider.contract}`
      )
    ),
    `- Reviewed ${AGENT_CAPABILITY_REVIEWED}. Woodhouse signposts the app-owned contract; it does not invoke the operation or hold its credentials.`,
    "",
    "## Incidents",
    "",
    ...incidentResult.incidents.map(
      (item) =>
        `- ${url(`/incidents/${encodeURIComponent(item.id)}/`)} (${asText(item.data, "reviewed_at")})`
    ),
    "",
    "## Evidence records",
    "",
    ...evidenceResult.evidence.map(
      (item) =>
        `- ${url(`/evidence/${encodeURIComponent(item.id)}/`)} (${asText(item.data, "evidence_kind")}; reviewed ${asText(item.data, "reviewed_at")})`
    ),
    "",
    "## Evidence limits",
    ""
  ];

  if (reviewDate) {
    lines.push(
      `The project snapshot was reviewed on ${reviewDate}. ${withPublicSite} of ${projects.length} projects publish a site; the remaining ${
        projects.length - withPublicSite
      } has no public site or demo. Do not infer a newer state from this copy. It does not publish private issue bodies, raw conversations, credentials or physical-test claims.`
    );
  } else {
    lines.push(
      `No reviewed project snapshot is currently published. This file does not publish private issue bodies, raw conversations, credentials or physical-test claims.`
    );
  }
  lines.push(
    "",
    "## Contact",
    "",
    "- X: https://x.com/loftwah",
    "- LinkedIn: https://www.linkedin.com/in/deanlofts/",
    "- GitHub: https://github.com/loftwah",
    ""
  );

  const headers = new Headers({
    "content-type": "text/plain; charset=utf-8",
    "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60"
  });
  if (new URL(siteOrigin).hostname.endsWith(".workers.dev"))
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  return new Response(lines.join("\n"), { headers });
};
