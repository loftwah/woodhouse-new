import type { CampaignItem } from "./showcase-campaign.ts";

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
    alt: "The Liferaft icon and a historical v0.1.2 screenshot showing a fictional attachment recovery, over a blue and orange rescue chart.",
    caption:
      "Open an MBOX archive on your desktop and pull out the attachment you need. Artwork includes an earlier v0.1.2 capture.",
    href: "https://liferaft.loftwah.com/",
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

const fieldNotes = [
  {
    slug: "bubbles",
    caption: "Start Puzzles and try First Spark. The wall is there to be used.",
    alt: "A lime arcade instruction card with Fizz and a staged First Spark puzzle board.",
    headlines: {
      square: "Find the gap.",
      story: "Try First Spark",
      wide: "The puzzle board",
      "x-header": "Take the bank shot",
      feed: "First Spark"
    }
  },
  {
    slug: "shoalshot",
    caption: "Take a slow pass through the Tide Pool and keep an eye out for the Glimmerfin.",
    alt: "A turquoise and cream SHOALSHOT field guide with a Glimmerfin over a reef.",
    headlines: {
      square: "Glimmerfin",
      story: "Look between the rocks",
      wide: "A pass through the reef",
      "x-header": "A closer look at the Tide Pool",
      feed: "Fish of the Tide Pool"
    }
  },
  {
    slug: "foilbury",
    caption: "Flip Moss over in the cabinet, then give the foil a tilt.",
    alt: "The actual Moss holographic card and its reverse in a brass-green Foilbury catalogue plate.",
    headlines: {
      square: "The reverse",
      story: "Tilt the foil",
      wide: "Inside the Moss cabinet",
      "x-header": "Open the cabinet",
      feed: "Moss, front and back"
    }
  },
  {
    slug: "fighter",
    caption:
      "Open the Battle Blast tutorial and see what Viking and Grim Reaper bring into the ring.",
    alt: "Fighter's Viking and Grim Reaper in ochre and purple print beside the actual matchup.",
    headlines: {
      square: "Viking and Grim Reaper",
      story: "Start Battle Blast",
      wide: "The opening matchup",
      "x-header": "See you in the ring",
      feed: "Across the ring"
    }
  },
  {
    slug: "loftwahfm",
    caption: "Put Night Signal on and leave it running while you finish what you’re making.",
    alt: "The LoftwahFM Night Signal station art against a red-orange and black record-shop flyer.",
    href: "https://fm.loftwah.com/radio?station=night-signal",
    headlines: {
      square: "After dark",
      story: "Leave the dial here",
      wide: "On Night Signal",
      "x-header": "Back-room radio",
      feed: "Night Signal"
    }
  },
  {
    slug: "protocol-11",
    caption: "Start a local Classic table and see what comes together in your opening hand.",
    alt: "A Protocol 11 poster with Deco arcs, green felt, and the actual Classic table.",
    headlines: {
      square: "Arrange the hand",
      story: "Draw one card",
      wide: "Classic at the table",
      "x-header": "Pull up a chair",
      feed: "What fits your hand?"
    }
  },
  {
    slug: "app-composer",
    caption: "Open Mara Quinn’s demo and see how a profile and a guestbook work together.",
    alt: "App Composer's real public Creator Hub on a cream, orange and plum quick-start poster.",
    headlines: {
      square: "One profile, one guestbook",
      story: "Open the Creator Hub",
      wide: "Mara Quinn's demo",
      "x-header": "Make a home for your links",
      feed: "A page of your own"
    }
  },
  {
    slug: "max",
    caption: "Use Find MAX to hear the locator in the browser simulator.",
    alt: "The actual MAX simulator on a graphite floor-plan illustration with amber signal rings.",
    headlines: {
      square: "Send a locator ping",
      story: "Listen for the ping",
      wide: "Try Find MAX",
      "x-header": "Find MAX on the web",
      feed: "Where's MAX?"
    }
  },
  {
    slug: "liferaft",
    caption: "Open your MBOX archive and search for the attachment you remember.",
    alt: "A Liferaft screenshot on a cream-and-navy maritime chart with an orange rescue basket.",
    headlines: {
      square: "Find that old attachment",
      story: "Search the archive",
      wide: "From MBOX to attachment",
      "x-header": "Old mail, found again",
      feed: "An email worth keeping"
    }
  },
  {
    slug: "woodhouse",
    caption: "Have a look around the workshop. There’s a game to play and a station to put on.",
    alt: "A Woodhouse cutaway illustration with a record deck, reef and arcade cabinet in open wooden drawers.",
    headlines: {
      square: "The workshop, opened up",
      story: "Go through the drawers",
      wide: "Games and radio from the bench",
      "x-header": "The Loftwah Software Factory",
      feed: "What's on the bench"
    }
  }
] as const;

type ProductWork = {
  slug: string;
  name: string;
  alt: string;
  caption: string;
  href: string;
  action: CampaignItem["action"];
  headlines: Record<keyof typeof placements, string>;
};

function productCampaign(
  works: readonly ProductWork[],
  base: string,
  prefix: string,
  addedAt: string
): CampaignItem[] {
  return works.map(({ slug, name, alt, caption, href, action, headlines }) => ({
    id: `${prefix}-${slug}`,
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
    addedAt,
    credit: "Woodhouse · official product sources and Codex ImageGen campaign illustration",
    kind: "editorial composition",
    source: `${base}/${slug}-notes.txt`,
    socialPack: `${base}/${slug}-social-pack.zip`,
    formats: (Object.keys(placements) as Array<keyof typeof placements>).map((key) => ({
      ...placements[key],
      image: `${base}/${slug}-${key}.jpg`,
      title: `${name} · ${headlines[key]}`
    }))
  }));
}

export const productSocialCampaign = productCampaign(
  projects,
  "/campaign/20261112-products",
  "product-social",
  "2026-11-12T12:17:00Z"
);

const productsBySlug = new Map(projects.map((project) => [project.slug, project]));

export const fieldNotesCampaign = productCampaign(
  fieldNotes.map((note) => ({ ...productsBySlug.get(note.slug)!, ...note })),
  "/campaign/20261112-field-notes",
  "field-notes",
  "2026-11-12T12:32:00Z"
);
