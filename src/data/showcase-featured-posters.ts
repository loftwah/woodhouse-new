import type { CampaignFormat, CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-poster-studies";

const posters = [
  {
    project: "bubbles",
    title: "Off the Wall",
    alt: "Arcade lettering bends around Fizz and a spray of Bubbles game symbols in cyan and magenta.",
    caption: "Use the side wall. The straight shot can wait.",
    href: "https://bubbles.loftwah.com/",
    action: "Play",
    width: 1080,
    height: 1350
  },
  {
    project: "loftwahfm",
    title: "Night Signal",
    alt: "The words Night Signal curl around a reel of tape in orange ink beside the LoftwahFM mark.",
    caption: "Night Signal is on the dial. Leave it there for a while.",
    href: "https://fm.loftwah.com/radio?station=night-signal",
    action: "Listen",
    width: 1080,
    height: 1080
  },
  {
    project: "foilbury",
    title: "Moss",
    alt: "The original holographic Moss card sits in a plum and brass display cabinet with engraved lettering.",
    caption: "Moss gets the cabinet to itself. Open the card and catch the foil in the light.",
    href: "https://foilbury.loftwah.com/cabinet/moss",
    action: "Explore",
    width: 1080,
    height: 1350
  },
  {
    project: "shoalshot",
    title: "The Tide Pool",
    alt: "Wave-cut letters sit above a Glimmerfin on a teal and coral dive poster.",
    caption: "Take a pass through the Tide Pool. Look between the rocks.",
    href: "https://shoalshot.loftwah.com/",
    action: "Play",
    width: 1080,
    height: 1350
  },
  {
    project: "fighter",
    title: "Across the Ring",
    alt: "Viking and Grim Reaper face off around angular lettering in a purple and ochre arcade poster.",
    caption: "Viking and Grim Reaper meet in the Battle Blast tutorial. Pick your first move.",
    href: "https://fighter.loftwah.com/",
    action: "Play",
    width: 1080,
    height: 1350
  },
  {
    project: "app-composer",
    title: "Links Live Here",
    alt: "Orange and cream cut-paper letters interlock under the official App Composer mark.",
    caption:
      "Give your links and guestbook one place to live. See how Mara Quinn’s demo fits together.",
    href: "https://composer.loftwah.com/creator-hub",
    action: "Try",
    width: 1080,
    height: 1350
  },
  {
    project: "protocol-11",
    title: "Your Draw",
    alt: "Cream Art Deco lettering sits on green felt with a fan of playing cards.",
    caption: "Your turn. Draw one card at a local Classic table.",
    href: "https://protocol11.loftwah.com/",
    action: "Play",
    width: 1080,
    height: 1080
  },
  {
    project: "liferaft",
    title: "Found It",
    alt: "A carved orange envelope with the words Found It sits in an indigo postage stamp.",
    caption:
      "Remember the attachment but forgot the subject line? Search the old MBOX in Liferaft.",
    href: "https://liferaft.loftwah.com/",
    action: "Explore",
    width: 1080,
    height: 1350
  },
  {
    project: "max",
    title: "Ping!",
    alt: "An amber comic-book sound effect radiates through a room outline under the MAX mark and Browser simulator label.",
    caption: "Tap Find MAX to hear the locator in the browser simulator.",
    href: "https://max.loftwah.com/demo",
    action: "Try",
    width: 1080,
    height: 1350
  }
] as const;

const socialVariants: Partial<Record<(typeof posters)[number]["project"], CampaignFormat>> = {
  bubbles: {
    label: "Story still",
    image: `${base}/bubbles-story.jpg`,
    width: 1080,
    height: 1920,
    title: "Bubbles · Off the Wall · vertical"
  },
  fighter: {
    label: "Landscape",
    image: `${base}/fighter-wide.jpg`,
    width: 1600,
    height: 900,
    title: "Fighter · Viking vs Grim Reaper"
  },
  loftwahfm: {
    label: "X header",
    image: `${base}/loftwahfm-x-header.jpg`,
    width: 1500,
    height: 500,
    title: "LoftwahFM · Night Signal header"
  }
};

export const featuredPosters: CampaignItem[] = posters.map(
  ({ project, title, alt, caption, href, action, width, height }) => ({
    id: `poster-study-${project}`,
    project,
    title,
    alt,
    caption: `${caption}\n${href}`,
    image: `${base}/${project}-preview.jpg`,
    thumbnail: `${base}/${project}-thumb.jpg`,
    original: `${base}/${project}.jpg`,
    width,
    height,
    reviewedAt: "2026-11-13",
    addedAt: "2026-11-12T13:22:00Z",
    credit: "Woodhouse · Codex ImageGen poster and original product mark",
    kind: "editorial composition",
    href,
    action,
    source: `${base}/provenance.txt`,
    formats: [
      {
        label: width === height ? "Square feed" : "Portrait feed",
        image: `${base}/${project}.jpg`,
        width,
        height
      },
      ...(socialVariants[project] ? [socialVariants[project]] : [])
    ]
  })
);
