import { editionShareAssets } from "./edition-share-kit.ts";
import { gameMedia } from "./share-desk.ts";

export const galleryTypes = [
  ["images", "Images & screenshots"],
  ["clips", "Clips"],
  ["edition", "One more round kit"],
  ["artwork", "Artwork & covers"],
  ["cards", "Link cards"],
  ["radio", "Radio cards"],
  ["factory", "Factory & stories"],
  ["logos", "Logos & SVGs"],
  ["social", "Social profiles"]
] as const;
export type GalleryType = (typeof galleryTypes)[number][0];
const galleryPageSize = 6;

export function galleryURL(project?: string, type: GalleryType = "images", page = 1) {
  const query = new URLSearchParams();
  if (project) query.set("project", project);
  if (type !== "images") query.set("type", type);
  if (page > 1) query.set("page", String(page));
  return `/share/${query.size ? `?${query}` : ""}`;
}

export function galleryMedia(projects: string[], project: string | undefined, type: GalleryType) {
  const matches = gameMedia.filter(
    (asset) =>
      projects.includes(asset.project) &&
      (!project || asset.project === project) &&
      (type === "clips"
        ? asset.kind === "video"
        : type === "artwork"
          ? asset.category === "art"
          : type === "images" && asset.kind === "image" && asset.category === "gameplay")
  );
  // The overview shows the portfolio together, rather than exhausting one
  // project's entire collection before showing the next game.
  const groups = projects.map((slug) => matches.filter((asset) => asset.project === slug));
  const ordered: typeof matches = [];
  for (let index = 0; groups.some((group) => index < group.length); index++)
    for (const group of groups) if (group[index]) ordered.push(group[index]!);
  return ordered;
}

export function galleryPage<T>(items: T[], requestedPage = 1) {
  const pages = Math.max(1, Math.ceil(items.length / galleryPageSize));
  const page = Number.isSafeInteger(requestedPage)
    ? Math.max(1, Math.min(pages, requestedPage))
    : 1;
  const start = (page - 1) * galleryPageSize;
  return {
    items: items.slice(start, start + galleryPageSize),
    page,
    pages,
    total: items.length,
    start
  };
}

/** The gallery categories that belong to one project rather than the whole site. */
export const projectGalleryTypes = ["images", "clips", "artwork", "cards", "edition"] as const;
export type ProjectGalleryType = (typeof projectGalleryTypes)[number];

/**
 * What a project actually has to share. Every published project has a link card,
 * so `cards` is always present; the game categories depend on the reviewed
 * media. Entering a project without an explicit category opens the first one it
 * has, so an app never lands on an empty screenshots grid while its own artwork
 * and cards sit one click away.
 */
export function availableProjectTypes(slug: string): ProjectGalleryType[] {
  const assets = gameMedia.filter((asset) => asset.project === slug);
  const types: ProjectGalleryType[] = [];
  if (assets.some((asset) => asset.kind === "image" && asset.category === "gameplay"))
    types.push("images");
  if (assets.some((asset) => asset.kind === "video")) types.push("clips");
  if (assets.some((asset) => asset.category === "art")) types.push("artwork");
  types.push("cards");
  if (editionShareAssets.some((asset) => asset.project === slug)) types.push("edition");
  return types;
}

export function defaultProjectType(slug: string): ProjectGalleryType {
  return availableProjectTypes(slug)[0] ?? "cards";
}

/**
 * The action a visitor can take on a project, derived once for the share desk.
 * A game is played, FM is listened to and everything else is opened; a
 * screenshot grid for an app must not offer "Play".
 */
export function projectActionLabel(slug: string) {
  if (["fighter", "shoalshot", "protocol-11", "bubbles"].includes(slug)) return "Play";
  if (slug === "loftwahfm") return "Listen";
  return "Open project";
}

/**
 * The canonical link to the kit the reader is currently looking at: the same
 * project on the same category they can see. An explicit `type=` is kept, so
 * "Link to this kit" never silently swaps a screenshot kit for a link card. A
 * bare project link (`/share/?project=<slug>`) is a separate behaviour: it opens
 * the first category the project actually has.
 */
export function kitURL(slug: string, view: GalleryType): string {
  const current = (projectGalleryTypes as readonly string[]).includes(view)
    ? (view as ProjectGalleryType)
    : null;
  return galleryURL(
    slug,
    current && availableProjectTypes(slug).includes(current) ? current : defaultProjectType(slug)
  );
}

/**
 * The category a bare project link should open on, or null when the requested
 * category stands. An explicit `?type=` is always kept so a deliberate link is
 * never silently rewritten; only a project's own link (no explicit category)
 * moves to a category it actually has.
 */
export function projectViewRedirect(
  slug: string,
  view: GalleryType,
  explicit: boolean
): ProjectGalleryType | null {
  if (explicit) return null;
  if (!(projectGalleryTypes as readonly string[]).includes(view)) return null;
  if (availableProjectTypes(slug).includes(view as ProjectGalleryType)) return null;
  return defaultProjectType(slug);
}
