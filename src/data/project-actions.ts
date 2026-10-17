import type { WoodhouseProject } from "../content/repository";

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
  "protocol-11": { action: "Play", availability: "Playable now in your browser." },
  shoalshot: {
    action: "Play",
    availability: "The live game is playable. A newer analytics release is still held."
  },
  loftwahfm: { action: "Listen", availability: "Stations, shows and the player stream now." },
  "app-composer": {
    action: "Try",
    availability: "The reference stack is live. First-time setup for a new person is not finished."
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
 * The reviewed action for a project. An unknown or newly published project gets
 * the honest default: point at the project's own record rather than inventing an
 * availability claim or offering a link that does not exist.
 */
export function projectAction(project: Pick<WoodhouseProject, "slug">): ProjectAction {
  return reviewed[project.slug] ?? { action: "See", availability: "See the project record." };
}

/** The action as a visitor reads it: "Play Fighter", "Listen to LoftwahFM". */
export function projectActionLabel(project: Pick<WoodhouseProject, "name" | "slug">): string {
  const { action } = projectAction(project);
  return action === "Listen" ? `Listen to ${project.name}` : `${action} ${project.name}`;
}

/** The product's own destination, or its Woodhouse record when there is none. */
export function projectActionHref(project: Pick<WoodhouseProject, "slug" | "siteUrl">): string {
  return project.siteUrl ?? `/projects/${project.slug}/`;
}
