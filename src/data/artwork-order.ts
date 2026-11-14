import type { CampaignItem } from "./showcase-campaign.ts";
import fileDates from "./artwork-file-dates.json" with { type: "json" };

const dates: Record<string, string> = fileDates;

export const artworkSorts = [
  ["newest", "Newest files"],
  ["oldest", "Oldest files"],
  ["release-newest", "Newest releases"],
  ["shuffle", "Shuffle"],
  ["title", "Title A–Z"],
  ["title-desc", "Title Z–A"],
  ["largest", "Largest originals"]
] as const;

export function artworkDate(item: CampaignItem) {
  return item.fileModifiedAt ?? dates[item.original] ?? item.addedAt ?? item.reviewedAt;
}

function shuffleRank(seed: string, id: string) {
  let hash = 2166136261;
  for (const char of `${seed}:${id}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  return (hash ^ (hash >>> 16)) >>> 0;
}

export function orderArtwork(
  items: CampaignItem[],
  sort: (typeof artworkSorts)[number][0],
  seed: string
) {
  const title = (a: CampaignItem, b: CampaignItem) =>
    a.title.localeCompare(b.title, "en-AU", { sensitivity: "base" });
  const newest = (a: CampaignItem, b: CampaignItem) => artworkDate(b).localeCompare(artworkDate(a));
  return [...items].sort((a, b) => {
    if (sort === "release-newest") {
      return (b.sourceReleasedAt ?? "").localeCompare(a.sourceReleasedAt ?? "") ||
        newest(a, b) || a.id.localeCompare(b.id);
    }
    const primary =
      sort === "shuffle"
        ? shuffleRank(seed, a.id) - shuffleRank(seed, b.id)
        : sort === "title"
          ? title(a, b)
          : sort === "title-desc"
            ? title(b, a)
            : sort === "largest"
              ? b.width * b.height - a.width * a.height
              : sort === "oldest"
                ? newest(b, a)
                : newest(a, b);
    return primary || a.id.localeCompare(b.id);
  });
}
