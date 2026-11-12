import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261112-refresh";
const addedAt = "2026-11-12T08:04:28Z";
const pieces = [
  {
    slug: "foilbury",
    file: "foilbury",
    title: "Light on foil",
    alt: "An unprinted sheet of card stock catches a spectrum of light inside a dark plum cabinet drawer.",
    caption:
      "A study in what light does to foil. Explore the finishes and designs in Foilbury’s public cabinet.",
    href: "https://foilbury.loftwah.com/cabinet",
    action: "Explore",
    sizes: [
      ["feed", "Portrait feed", 1080, 1350],
      ["square", "Square feed", 1080, 1080]
    ]
  },
  {
    slug: "loftwahfm",
    file: "fm",
    title: "On the dial",
    alt: "Amber light catches the dial of a vintage radio tuner, framed by a looping red patch cable.",
    caption: "Turn the dial. Pick a station and hear what’s playing on LoftwahFM.",
    href: "https://fm.loftwah.com/radio/",
    action: "Listen",
    sizes: [["square", "Square feed", 1080, 1080]]
  },
  {
    slug: "shoalshot",
    file: "tide",
    title: "Where the tide turns",
    alt: "Turquoise caustics cross a rocky tidal pool surrounded by amber rock and sea plants.",
    caption:
      "Sunlight across a tide pool, imagined for SHOALSHOT. Play the real dive in your browser.",
    href: "https://shoalshot.loftwah.com/",
    action: "Play",
    sizes: [["wide", "Landscape", 1600, 900]]
  }
] as const;

export const artworkRefresh: CampaignItem[] = pieces.map(
  ({ slug, file, title, alt, caption, href, action, sizes }) => {
    const formats = sizes.map(([suffix, label, width, height]) => ({
      label,
      width,
      height,
      image: `${base}/${file}-${suffix}.jpg`
    }));
    const primary = formats[0]!;
    return {
      id: `november-studio-${file}`,
      project: slug,
      title,
      alt,
      caption: `${caption}\n${href}`,
      href,
      action,
      image: `${base}/${file}-preview.jpg`,
      thumbnail: `${base}/${file}-thumb.jpg`,
      original: primary.image,
      width: primary.width,
      height: primary.height,
      reviewedAt: "2026-11-12",
      addedAt,
      credit: "Woodhouse · original Codex ImageGen campaign art",
      kind: "editorial composition",
      source: `${base}/provenance.txt`,
      socialPack: `${base}/${slug}-social-pack.zip`,
      formats
    };
  }
);
