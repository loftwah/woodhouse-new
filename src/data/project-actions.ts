import type { WoodhouseProject } from "../content/repository";
import type { ProjectLifecycle } from "./project-lifecycle";

export const creatorHubCaseStudy = "https://composer.loftwah.com/creator-hub";

/**
 * What a visitor can actually do with a project, decided once for every entry
 * point (homepage, project index, dossier, search results).
 *
 * The observed failure: a project's own development status silently became its
 * lead explanation ("Opt-in gameplay reporting with clear collection limits"),
 * and pages offered either a dead Play button or no action at all. A game is
 * played, FM is listened to, a tool is tried and a project without a public
 * build gets an honest route to its record instead.
 *
 * Availability is a reviewed product fact, deliberately separate from the dated
 * engineering status. A held new release does not make an older playable version
 * unavailable: SHOALSHOT's live game is playable while its newer analytics
 * release is held, so the action stays "Play" and the availability line says so.
 */
export type ProjectAction = {
  /** The verb a visitor performs, in sentence case: Play, Listen, Try, Open, See. */
  action: "Play" | "Listen" | "Try" | "Open" | "See";
  /** One short, honest sentence about what is actually available today. */
  availability: string;
};

const reviewed: Record<string, ProjectAction> = {
  fighter: { action: "Play", availability: "Playable now in your browser." },
  bubbles: { action: "Play", availability: "Playable now in your browser." },
  liferaft: { action: "Open", availability: "Open the recovery guide and desktop downloads." },
  foilbury: {
    action: "Open",
    availability: "The public shelf is open; signing in only adds your own album."
  },
  "protocol-11": { action: "Play", availability: "Playable now in your browser." },
  shoalshot: {
    action: "Play",
    availability: "The live game is playable. A newer analytics release is still held."
  },
  loftwahfm: { action: "Listen", availability: "Stations, shows and the player stream now." },
  "app-composer": {
    action: "Try",
    availability: "You can open the live reference apps without an account."
  },
  "asset-hunter": {
    action: "Try",
    availability: "The public catalogue is live and reports the revision it was built from."
  },
  max: {
    action: "Open",
    availability: "The software platform is live. The walker and voice path is not yet proven."
  },
  "social-club": {
    action: "Open",
    availability: "A working prototype, parked while other work continues."
  },
  pirates: {
    action: "See",
    availability: "No public build yet. This is the reconstruction and its evidence."
  }
};

/**
 * Reviewed copy for a project that is paused or retired. The action is always
 * the dossier, never a live product surface: a reader can inspect the history
 * without being sent to a product the portfolio is no longer recommending.
 *
 * Each entry records the lifecycle it was written for. A project that changes
 * between Paused and Retired must not inherit the other state's dated sentence,
 * so a mismatched entry falls back to the state's own wording.
 */
const closedLifecycle: Record<
  string,
  { lifecycle: "paused" | "retired"; action: ProjectAction["action"]; availability: string }
> = {
  "social-club": {
    lifecycle: "retired",
    action: "See",
    availability:
      "Retired 26 October 2026. The dossier, evidence and dated campaign artwork remain; no new active work is planned."
  },
  "asset-hunter": {
    lifecycle: "retired",
    action: "See",
    availability:
      "Retired 26 October 2026. The catalogue and past evidence remain as a dated record, not a current recommendation."
  },
  pirates: {
    lifecycle: "paused",
    action: "See",
    availability:
      "Paused indefinitely on 26 October 2026. The reconstruction and its evidence remain; this is not a cancellation."
  }
};

function lifecycleAction(
  slug: string,
  lifecycle: ProjectLifecycle | undefined
): ProjectAction | null {
  if (lifecycle !== "paused" && lifecycle !== "retired") return null;
  const reviewed = closedLifecycle[slug];
  if (reviewed?.lifecycle === lifecycle) return reviewed;
  return {
    action: "See",
    availability:
      lifecycle === "retired"
        ? "Retired. The dossier and its history remain; there is no current active build."
        : "Paused. The dossier and its history remain; this is not a cancellation."
  };
}

/**
 * The reviewed action for a project. An unknown or newly published project gets
 * the honest default: point at the project's own record rather than inventing an
 * availability claim or offering a link that does not exist.
 */
export function projectAction(
  project: Pick<WoodhouseProject, "slug"> & { lifecycle?: ProjectLifecycle }
): ProjectAction {
  const closed = lifecycleAction(project.slug, project.lifecycle);
  if (closed) return closed;
  return reviewed[project.slug] ?? { action: "See", availability: "See the project record." };
}

/** The action as a visitor reads it: "Play Fighter", "Listen to LoftwahFM". */
export function projectActionLabel(
  project: Pick<WoodhouseProject, "name" | "slug"> & { lifecycle?: ProjectLifecycle }
): string {
  const { action } = projectAction(project);
  return action === "Listen" ? `Listen to ${project.name}` : `${action} ${project.name}`;
}

/** The product's own destination, or its Woodhouse record when there is none. */
export function projectActionHref(
  project: Pick<WoodhouseProject, "slug" | "siteUrl"> & { lifecycle?: ProjectLifecycle }
): string {
  if (project.lifecycle === "paused" || project.lifecycle === "retired")
    return `/projects/${project.slug}/`;
  return project.siteUrl ?? `/projects/${project.slug}/`;
}
