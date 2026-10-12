import { gameMedia } from "./share-desk.ts";

export const galleryTypes = [
  ["images", "Images & screenshots"],
  ["clips", "Clips"],
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
