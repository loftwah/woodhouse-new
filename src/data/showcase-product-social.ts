import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261112-products";
const placements = {
  feed: { label: "Portrait feed", width: 1080, height: 1350 },
  square: { label: "Square feed", width: 1080, height: 1080 },
  story: { label: "Story still", width: 1080, height: 1920 },
  wide: { label: "Landscape", width: 1600, height: 900 },
  "x-header": { label: "X header", width: 1500, height: 500 }
} as const;

const projects = [
  {
    slug: "bubbles",
    name: "Bubbles",
    alt: "A one-eyed Fizz made of luminous violet liquid rises beside multicoloured bubbles under the Bubbles mark.",
    caption: "Aim off the wall, match three and see how much of the board comes down.",
    href: "https://bubbles.loftwah.com/",
    action: "Play",
    headlines: {
      feed: "Mind the angle.",
      square: "Three of a kind.",
      story: "Bank the next shot.",
      wide: "That's the board.",
      "x-header": "Pick your shot."
    }
  },
  {
    slug: "shoalshot",
    name: "SHOALSHOT",
    alt: "A bright Glimmerfin swims across a blue reef under the SHOALSHOT wordmark.",
    caption: "Take a first dive in the Tide Pool and look for the fish between the rocks.",
    href: "https://shoalshot.loftwah.com/",
    action: "Play",
    headlines: {
      feed: "Into the Tide Pool",
      square: "Meet the Glimmerfin",
      story: "Down to the reef",
      wide: "Play the Tide Pool",
      "x-header": "Pick a line through the reef"
    }
  },
  {
    slug: "foilbury",
    name: "Foilbury",
    alt: "The real holographic Moss card stands inside an illustrated plum and brass cabinet under the Foilbury wordmark.",
    caption: "Open Moss in the cabinet, tilt the card and see where the foil catches.",
    href: "https://foilbury.loftwah.com/cabinet/moss",
    action: "Explore",
    headlines: {
      feed: "Moss, in holographic",
      square: "From the cabinet",
      story: "Give the card a tilt",
      wide: "Look closer at Moss",
      "x-header": "The card cabinet is open"
    }
  },
  {
    slug: "fighter",
    name: "Fighter",
    alt: "Fighter's Viking and Grim Reaper face each other in illustrated roster art under the native Fighter mark.",
    caption: "Viking opens against Grim Reaper in the Battle Blast tutorial. Pick your first move.",
    href: "https://fighter.loftwah.com/",
    action: "Play",
    headlines: {
      feed: "Viking meets Grim Reaper",
      square: "Grim Reaper",
      story: "Pick your first move",
      wide: "Try Battle Blast",
      "x-header": "Viking vs Grim Reaper"
    }
  },
  {
    slug: "loftwahfm",
    name: "LoftwahFM",
    alt: "The LoftwahFM wordmark over an illustrated record sleeve with a cartridge and vinyl.",
    caption: "Cartridge Club is on the dial. Put it on for the next round.",
    href: "https://fm.loftwah.com/radio?station=cartridge-club",
    action: "Listen",
    headlines: {
      feed: "Cartridge Club",
      square: "On the sleeve",
      story: "Beats between rounds",
      wide: "A look inside the crate",
      "x-header": "Beats from the back room"
    }
  },
  {
    slug: "protocol-11",
    name: "Protocol 11",
    alt: "Illustrated cards on green felt under the Protocol 11 wordmark.",
    caption: "Take a seat at a Classic table, draw a card and see what fits your hand.",
    href: "https://protocol11.loftwah.com/",
    action: "Play",
    headlines: {
      feed: "Your draw.",
      square: "A seat at the table",
      story: "Make your first set",
      wide: "A Classic table",
      "x-header": "Room for another hand"
    }
  },
  {
    slug: "app-composer",
    name: "App Composer",
    alt: "The real Mara Quinn Creator Hub profile on a ceramic workbench illustration, with the App Composer wordmark.",
    caption:
      "Mara Quinn's demo pairs a Linkarooie profile with a guestbook. Open it, then build a hub of your own.",
    href: "https://composer.loftwah.com/creator-hub",
    action: "Try",
    headlines: {
      feed: "Give your links a home",
      square: "Build a Creator Hub",
      story: "Open Mara's profile",
      wide: "See the apps together",
      "x-header": "Links and a guestbook"
    }
  },
  {
    slug: "max",
    name: "MAX",
    alt: "The real Find MAX browser simulator over an illustrated amber-lit entryway, with the official MAX wordmark.",
    caption: "Try Find MAX in the browser to hear the locator in the simulator.",
    href: "https://max.loftwah.com/demo",
    action: "Try",
    headlines: {
      feed: "Try Find MAX",
      square: "Meet Virtual MAX",
      story: "Hear the locator",
      wide: "Open the simulator",
      "x-header": "Find MAX in your browser"
    }
  },
  {
    slug: "liferaft",
    name: "Liferaft",
    alt: "The Liferaft icon and a real example of finding an email attachment, over a blue and orange rescue-chart illustration.",
    caption: "Open an MBOX archive on your desktop and pull out the attachment you need.",
    href: "https://github.com/loftwah/liferaft/releases/tag/v0.1.2",
    action: "Explore",
    headlines: {
      feed: "Find the missing attachment",
      square: "Search your old mail",
      story: "Pull out the attachment",
      wide: "Open an MBOX archive",
      "x-header": "The email you kept"
    }
  },
  {
    slug: "woodhouse",
    name: "Woodhouse",
    alt: "The Woodhouse seal above a painted miniature arcade, record deck and reef tank connected by a bright yellow cable.",
    caption: "Pick a game, put the radio on, or see what else is on the workbench.",
    href: "https://woodhouse.loftwah.com/",
    action: "Explore",
    headlines: {
      feed: "From the workbench",
      square: "Cabinet and turntable",
      story: "Take a look around",
      wide: "Inside Woodhouse",
      "x-header": "Games, radio and software"
    }
  }
] as const;

export const productSocialCampaign: CampaignItem[] = projects.map(
  ({ slug, name, alt, caption, href, action, headlines }) => {
    const formats = (Object.keys(placements) as Array<keyof typeof placements>).map((key) => ({
      ...placements[key],
      image: `${base}/${slug}-${key}.jpg`,
      title: `${name} · ${headlines[key]}`
    }));
    return {
      id: `product-social-${slug}`,
      project: slug,
      title: headlines.feed,
      alt,
      caption: `${caption}\n${href}`,
      href,
      action,
      image: `${base}/${slug}-preview.jpg`,
      thumbnail: `${base}/${slug}-thumb.jpg`,
      original: `${base}/${slug}-feed.jpg`,
      width: placements.feed.width,
      height: placements.feed.height,
      reviewedAt: "2026-11-12",
      addedAt: "2026-11-12T12:17:00Z",
      credit: "Woodhouse · official product sources and Codex ImageGen campaign illustration",
      kind: "editorial composition",
      source: `${base}/${slug}-notes.txt`,
      socialPack: `${base}/${slug}-social-pack.zip`,
      formats
    };
  }
);
