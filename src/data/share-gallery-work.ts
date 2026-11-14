import type { WoodhouseProject } from "../content/repository";
import { projectActionHref } from "./project-actions";
import type { gameMedia } from "./share-desk";
import type { CampaignItem } from "./showcase-campaign";

export function galleryWork(
  asset: (typeof gameMedia)[number],
  project: WoodhouseProject,
  hasPreview: boolean
): CampaignItem {
  const href = asset.link ?? projectActionHref(project);
  const video = asset.kind === "video";
  return {
    id: asset.id,
    project: asset.project,
    title: asset.title,
    alt: asset.alt,
    caption: asset.caption,
    image: video
      ? (asset.poster ?? "/og/woodhouse-workshop-20261018.jpg")
      : hasPreview
        ? `/share/previews/${asset.id}.webp`
        : asset.file,
    original: asset.file,
    width: asset.width,
    height: asset.height,
    reviewedAt: asset.reviewedAt,
    credit: `${asset.note} · ${asset.credit}`,
    kind: video
      ? "published video"
      : asset.category === "gameplay"
        ? "production screenshot"
        : "published product artwork",
    use: video ? "clip" : asset.category === "gameplay" ? "screenshot" : "art",
    href,
    action:
      project.slug === "loftwahfm"
        ? "Listen"
        : asset.category === "gameplay" && project.slug !== "app-composer"
          ? "Play"
          : "Explore",
    source: href,
    ...(video && { video: asset.file })
  };
}
