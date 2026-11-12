import type { CampaignItem } from "./showcase-campaign.ts";

export const projectStoriesKit = "/campaign/20261113-project-stories/project-stories-kit.zip";
const base = "/campaign/20261113-project-stories";
const art = [
  {
    slug: "sunstruck-shelf",
    project: "shoalshot",
    use: "banner",
    title: "Sunstruck Shelf",
    alt: "Glimmerfin cross between blue reef shelves in a screen-printed travel poster for SHOALSHOT.",
    caption: "Sunstruck Shelf. Follow the reef line and find your angle in SHOALSHOT.",
    href: "https://shoalshot.loftwah.com/",
    action: "Play",
    formats: [
      ["Landscape", "sunstruck-shelf.jpg", 1600, 900],
      ["Discord banner", "sunstruck-shelf-discord-banner.jpg", 1920, 1080],
      ["ImageGen original PNG", "sunstruck-shelf.png", 1672, 941]
    ]
  },
  {
    slug: "tux-avatar",
    project: "fighter",
    use: "icon",
    title: "Tux · Roster avatar",
    alt: "Fighter’s Tux, a black and cream penguin with orange beak and a teal tactical headset.",
    caption:
      "Tux, from Fighter’s roster. Ping spends a bit of his Health to send Charge to the team.",
    href: "https://fighter.loftwah.com/",
    action: "Play",
    formats: [
      ["Profile icon", "tux-avatar.jpg", 512, 512],
      ["Square feed", "tux-avatar-square-feed.jpg", 1080, 1080],
      ["ImageGen original PNG", "tux-avatar.png", 1254, 1254]
    ]
  },
  {
    slug: "lantern-finale",
    project: "bubbles",
    use: "art",
    title: "Lantern Finale",
    alt: "Fizz, the single-eyed droplet, floats past glowing paper lanterns on a Bubbles arcade poster.",
    caption:
      "Fold the lantern canopy in eight shots. Lantern Finale closes Chapter 2 of Bubbles Story.",
    href: "https://bubbles.loftwah.com/story",
    action: "Play",
    formats: [
      ["Story still", "lantern-finale.jpg", 1080, 1920],
      ["ImageGen original PNG", "lantern-finale.png", 941, 1672]
    ]
  },
  {
    slug: "ldraw-route",
    project: "app-composer",
    use: "feature",
    title: "Draw, save, export",
    alt: "An orange and charcoal LDraw workflow diagram connects Draw, Save and Export.",
    caption: "Draw in LDraw, keep an editable copy, then export a PNG or SVG for sharing.",
    href: "https://ldraw.loftwah.com/",
    action: "Try",
    formats: [
      ["Portrait feed", "ldraw-route.jpg", 1080, 1350],
      ["ImageGen original PNG", "ldraw-route.png", 1122, 1402]
    ]
  },
  {
    slug: "keeper-avatar",
    project: "foilbury",
    use: "icon",
    title: "Cabinet Keeper · Paper avatar",
    alt: "Foilbury’s pale paper Cabinet Keeper with a blue spine and brass key on indigo velvet.",
    caption:
      "The Cabinet Keeper, pressed into paper with the key still on. Explore Foilbury’s cabinet.",
    href: "https://foilbury.loftwah.com/cabinet/",
    action: "Explore",
    formats: [
      ["Profile icon", "keeper-avatar.jpg", 512, 512],
      ["Square feed", "keeper-avatar-square-feed.jpg", 1080, 1080],
      ["ImageGen original PNG", "keeper-avatar.png", 1254, 1254]
    ]
  },
  {
    slug: "cartridge-club",
    project: "loftwahfm",
    use: "banner",
    title: "Cartridge Club",
    alt: "A yellow cartridge and CRT glow behind hand-lettered Cartridge Club and LoftwahFM type.",
    caption: "Cartridge Club. Chiptune swing and instrumental hip hop for another round.",
    href: "https://fm.loftwah.com/radio?station=cartridge-club",
    action: "Listen",
    formats: [
      ["Discord banner", "cartridge-club.jpg", 1920, 1080],
      ["Landscape", "cartridge-club-landscape.jpg", 1600, 900],
      ["ImageGen original PNG", "cartridge-club.png", 1672, 941]
    ]
  },
  {
    slug: "late-night-room",
    project: "protocol-11",
    use: "art",
    title: "Late Night Party",
    alt: "A lit fireplace and low lamps frame an empty green felt table in a Protocol 11 poster.",
    caption: "Late Night Party is one of Protocol 11’s table looks. Pull up a chair.",
    href: "https://protocol11.loftwah.com/",
    action: "Play",
    formats: [
      ["Pinterest pin", "late-night-room.jpg", 1000, 1500],
      ["ImageGen original PNG", "late-night-room.png", 1024, 1536]
    ]
  },
  {
    slug: "virtual-max",
    project: "max",
    use: "feature",
    title: "Virtual MAX",
    alt: "An editorial paper mockup of a walker in a browser simulation with a yellow locate ring.",
    caption:
      "Try FIND in Virtual MAX to sound the locator. The public demo runs a simulated walker in your browser.",
    href: "https://max.loftwah.com/demo",
    action: "Try",
    formats: [
      ["Landscape", "virtual-max.jpg", 1600, 900],
      ["ImageGen original PNG", "virtual-max.png", 1672, 941]
    ]
  },
  {
    slug: "liferaft-export",
    project: "liferaft",
    use: "feature",
    title: "Find the attachment",
    alt: "A paper-cut MBOX archive, an envelope and one attachment form a Liferaft recovery poster.",
    caption:
      "Open the MBOX in Liferaft, find the message and export the attachment. The archive is indexed locally.",
    href: "https://liferaft.loftwah.com/",
    action: "Explore",
    formats: [
      ["Portrait feed", "liferaft-export.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-export.png", 1122, 1402]
    ]
  },
  {
    slug: "loom-study",
    project: "woodhouse",
    use: "sketch",
    title: "Building the loom",
    alt: "A graphite fibre construction drawing sits above a luminous braid on dark paper.",
    caption:
      "Woodhouse put its live fibre loom on the homepage on 23 October. This is a new study of how the threads cross.",
    href: "https://woodhouse.loftwah.com/",
    action: "Explore",
    formats: [
      ["Portrait feed", "loom-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "loom-study.png", 1122, 1402]
    ]
  }
] as const;

export const projectStories: CampaignItem[] = art.map((work) => {
  const [, , width, height] = work.formats[0];
  return {
    id: `project-story-${work.slug}`,
    series: "project-stories",
    project: work.project,
    use: work.use,
    title: work.title,
    alt: work.alt,
    caption: `${work.caption}\n${work.href}`,
    href: work.href,
    action: work.action,
    image: `${base}/${work.slug}-preview.jpg`,
    thumbnail: `${base}/${work.slug}-thumb.jpg`,
    original: `${base}/${work.slug}.png`,
    width,
    height,
    reviewedAt: "2026-11-13",
    addedAt: "2026-11-12T17:28:46Z",
    kind: "editorial composition",
    credit: "Woodhouse · Codex ImageGen",
    source: `${base}/provenance.txt`,
    formats: work.formats.map(([label, file, width, height]) => ({
      label,
      image: `${base}/${file}`,
      width,
      height
    }))
  };
});
