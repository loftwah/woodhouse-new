import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-share-expansion";
const art = [
  [
    "foilbury-drop-bear-landscape",
    "foilbury",
    "Drop Bear from Fighter · Landscape",
    "Drop Bear from Fighter artwork for Foilbury.",
    "Drop Bear came across from Fighter. Open the current card in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/drop-bear",
    "Explore",
    "feature",
    "jpg",
    [
      ["Landscape", "foilbury-drop-bear-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "foilbury-drop-bear-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "bubbles-bank-line-pin",
    "bubbles",
    "Take the wall · Pinterest pin",
    "Take the wall artwork for Bubbles.",
    "There’s another line into the cluster. Use the wall in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Pinterest pin", "bubbles-bank-line-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "bubbles-bank-line-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "shoalshot-glimmerfin-study-square",
    "shoalshot",
    "The Glimmerfin study · Sketch",
    "The Glimmerfin study artwork for SHOALSHOT.",
    "Look for the silver-blue turn of a Glimmerfin in the Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "shoalshot-glimmerfin-study-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "shoalshot-glimmerfin-study-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-diamond-turn-story",
    "foilbury",
    "Turn the Diamond finish · Story still",
    "Turn the Diamond finish artwork for Foilbury.",
    "Diamond changes when you turn it. Open the current Moss card and try the finish selector.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "art",
    "jpg",
    [
      ["Story still", "foilbury-diamond-turn-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "foilbury-diamond-turn-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "app-composer-pdf-before-after-pin",
    "app-composer",
    "Fill, then export · Pinterest pin",
    "Fill, then export artwork for App Composer.",
    "Open a sample PDF, fill a field, add a visual signature and export it in Paperwork.",
    "https://paperwork.loftwah.com/",
    "Try",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "app-composer-pdf-before-after-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "app-composer-pdf-before-after-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "loftwahfm-night-tape-link",
    "loftwahfm",
    "Night Signal · Link preview",
    "Night Signal artwork for LoftwahFM.",
    "A little Night Signal for the late shift. The station opens directly in LoftwahFM.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    "feature",
    "jpg",
    [
      ["Link preview", "loftwahfm-night-tape-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "loftwahfm-night-tape-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "fighter-reaper-paper-pin",
    "fighter",
    "The Reaper enters · Pinterest pin",
    "The Reaper enters artwork for Fighter.",
    "The Reaper enters. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Pinterest pin", "fighter-reaper-paper-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "fighter-reaper-paper-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "woodhouse-workshop-parts-pin",
    "woodhouse",
    "Games, music and tools · Pinterest pin",
    "Games, music and tools artwork for Woodhouse.",
    "Games, music and tools. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Pinterest pin", "woodhouse-workshop-parts-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "woodhouse-workshop-parts-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "liferaft-recover-one-pin",
    "liferaft",
    "Find the one attachment · Pinterest pin",
    "Find the one attachment artwork for Liferaft.",
    "Find the one attachment. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Pinterest pin", "liferaft-recover-one-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "liferaft-recover-one-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "protocol-11-last-card-pin",
    "protocol-11",
    "One card left · Pinterest pin",
    "One card left artwork for Protocol 11.",
    "One card left. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Pinterest pin", "protocol-11-last-card-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "protocol-11-last-card-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "max-idle-and-active-pin",
    "max",
    "Idle and active · Pinterest pin",
    "Idle and active artwork for MAX.",
    "Watch the room with the locator idle, then hear the cue in the MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "jpg",
    [
      ["Pinterest pin", "max-idle-and-active-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "max-idle-and-active-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "foilbury-keeper-square",
    "foilbury",
    "The Cabinet Keeper · Sketch",
    "The Cabinet Keeper artwork for Foilbury.",
    "Meet the little Keeper with the key. Browse the public cabinet.",
    "https://foilbury.loftwah.com/cabinet/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "foilbury-keeper-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "foilbury-keeper-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-real-finish-plain-diamond-landscape",
    "foilbury",
    "Moss in Plain and Diamond",
    "Moss in Plain and Diamond artwork for Foilbury.",
    "Moss in Plain and Diamond. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "comparison",
    "jpg",
    [
      ["Landscape", "foilbury-real-finish-plain-diamond-landscape.jpg", 1600, 900],
      [
        "ImageGen original JPEG",
        "foilbury-real-finish-plain-diamond-landscape-original.jpg",
        1536,
        864
      ]
    ]
  ],
  [
    "foilbury-moss-cut-paper-pin",
    "foilbury",
    "Moss, the quiet collector · Pinterest pin",
    "Moss, the quiet collector artwork for Foilbury.",
    "Moss, the quiet collector. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "art",
    "jpg",
    [
      ["Pinterest pin", "foilbury-moss-cut-paper-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "foilbury-moss-cut-paper-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "bubbles-bank-line-story",
    "bubbles",
    "Take the wall · Story still",
    "Take the wall artwork for Bubbles.",
    "There’s another line into the cluster. Use the wall in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Story still", "bubbles-bank-line-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "bubbles-bank-line-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "shoalshot-reef-edge-pin",
    "shoalshot",
    "On the reef edge · Pinterest pin",
    "On the reef edge artwork for SHOALSHOT.",
    "On the reef edge. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Pinterest pin", "shoalshot-reef-edge-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "shoalshot-reef-edge-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "fighter-reaper-paper-story",
    "fighter",
    "The Reaper enters · Story still",
    "The Reaper enters artwork for Fighter.",
    "The Reaper enters. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Story still", "fighter-reaper-paper-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "fighter-reaper-paper-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "protocol-11-last-card-story",
    "protocol-11",
    "One card left · Story still",
    "One card left artwork for Protocol 11.",
    "One card left. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Story still", "protocol-11-last-card-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "protocol-11-last-card-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "app-composer-sample-pdf-pin",
    "app-composer",
    "Fill a sample PDF · Pinterest pin",
    "Fill a sample PDF artwork for App Composer.",
    "Fill a sample PDF. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://paperwork.loftwah.com/",
    "Try",
    "art",
    "jpg",
    [
      ["Pinterest pin", "app-composer-sample-pdf-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "app-composer-sample-pdf-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "loftwahfm-cartridge-club-pin",
    "loftwahfm",
    "Cartridge Club on the bench · Pinterest pin",
    "Cartridge Club on the bench artwork for LoftwahFM.",
    "Cartridge Club is music for the arcade bench. Tune in straight from your browser.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "art",
    "jpg",
    [
      ["Pinterest pin", "loftwahfm-cartridge-club-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "loftwahfm-cartridge-club-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "liferaft-recover-one-feed",
    "liferaft",
    "Find the one attachment · Sketch",
    "Find the one attachment artwork for Liferaft.",
    "Find the one attachment. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "liferaft-recover-one-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "liferaft-recover-one-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "max-find-max-pin",
    "max",
    "Find MAX in the browser · Pinterest pin",
    "Find MAX in the browser artwork for MAX.",
    "Open Find MAX and hear the locator in the public browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "jpg",
    [
      ["Pinterest pin", "max-find-max-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "max-find-max-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "woodhouse-workshop-parts-story",
    "woodhouse",
    "Games, music and tools · Story still",
    "Games, music and tools artwork for Woodhouse.",
    "Games, music and tools. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Story still", "woodhouse-workshop-parts-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "woodhouse-workshop-parts-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "foilbury-moss-cut-paper-story",
    "foilbury",
    "Moss, the quiet collector · Story still",
    "Moss, the quiet collector artwork for Foilbury.",
    "Moss, the quiet collector. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "feature",
    "jpg",
    [
      ["Story still", "foilbury-moss-cut-paper-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "foilbury-moss-cut-paper-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "bubbles-bank-line-feed",
    "bubbles",
    "Take the wall · Sketch",
    "Take the wall artwork for Bubbles.",
    "There’s another line into the cluster. Use the wall in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "bubbles-bank-line-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "bubbles-bank-line-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "shoalshot-reef-edge-story",
    "shoalshot",
    "On the reef edge · Story still",
    "On the reef edge artwork for SHOALSHOT.",
    "On the reef edge. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Story still", "shoalshot-reef-edge-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "shoalshot-reef-edge-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "fighter-reaper-paper-feed",
    "fighter",
    "The Reaper enters · Sketch",
    "The Reaper enters artwork for Fighter.",
    "The Reaper enters. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "fighter-reaper-paper-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "fighter-reaper-paper-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "protocol-11-last-card-feed",
    "protocol-11",
    "One card left · Sketch",
    "One card left artwork for Protocol 11.",
    "One card left. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "protocol-11-last-card-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "protocol-11-last-card-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "app-composer-sample-pdf-feed",
    "app-composer",
    "Fill a sample PDF · Sketch",
    "Fill a sample PDF artwork for App Composer.",
    "Fill a sample PDF. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://paperwork.loftwah.com/",
    "Try",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "app-composer-sample-pdf-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "app-composer-sample-pdf-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-cartridge-club-story",
    "loftwahfm",
    "Cartridge Club on the bench · Story still",
    "Cartridge Club on the bench artwork for LoftwahFM.",
    "Cartridge Club is music for the arcade bench. Tune in straight from your browser.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "feature",
    "jpg",
    [
      ["Story still", "loftwahfm-cartridge-club-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "loftwahfm-cartridge-club-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "liferaft-recover-one-sticker",
    "liferaft",
    "Find the one attachment · Sticker",
    "Find the one attachment artwork for Liferaft.",
    "Find the one attachment. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "liferaft-recover-one-sticker.png", 320, 320],
      ["ImageGen original PNG", "liferaft-recover-one-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "max-find-max-story",
    "max",
    "Find MAX in the browser · Story still",
    "Find MAX in the browser artwork for MAX.",
    "Open Find MAX and hear the locator in the public browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "feature",
    "jpg",
    [
      ["Story still", "max-find-max-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "max-find-max-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "woodhouse-workshop-parts-feed",
    "woodhouse",
    "Games, music and tools · Sketch",
    "Games, music and tools artwork for Woodhouse.",
    "Games, music and tools. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "woodhouse-workshop-parts-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "woodhouse-workshop-parts-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "foilbury-moss-cut-paper-feed",
    "foilbury",
    "Moss, the quiet collector · Sketch",
    "Moss, the quiet collector artwork for Foilbury.",
    "Moss, the quiet collector. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "foilbury-moss-cut-paper-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "foilbury-moss-cut-paper-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "bubbles-bank-line-sticker",
    "bubbles",
    "Take the wall · Sticker",
    "Take the wall artwork for Bubbles.",
    "There’s another line into the cluster. Use the wall in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "bubbles-bank-line-sticker.png", 320, 320],
      ["ImageGen original PNG", "bubbles-bank-line-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-edge-feed",
    "shoalshot",
    "On the reef edge · Sketch",
    "On the reef edge artwork for SHOALSHOT.",
    "On the reef edge. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "shoalshot-reef-edge-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "shoalshot-reef-edge-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "fighter-reaper-paper-sticker",
    "fighter",
    "The Reaper enters · Sticker",
    "The Reaper enters artwork for Fighter.",
    "The Reaper enters. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "fighter-reaper-paper-sticker.png", 320, 320],
      ["ImageGen original PNG", "fighter-reaper-paper-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-last-card-sticker",
    "protocol-11",
    "One card left · Sticker",
    "One card left artwork for Protocol 11.",
    "One card left. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "protocol-11-last-card-sticker.png", 320, 320],
      ["ImageGen original PNG", "protocol-11-last-card-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-sample-pdf-sticker",
    "app-composer",
    "Fill a sample PDF · Sticker",
    "Fill a sample PDF artwork for App Composer.",
    "Fill a sample PDF. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://paperwork.loftwah.com/",
    "Try",
    "special",
    "png",
    [
      ["Discord sticker", "app-composer-sample-pdf-sticker.png", 320, 320],
      ["ImageGen original PNG", "app-composer-sample-pdf-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-cartridge-club-feed",
    "loftwahfm",
    "Cartridge Club on the bench · Sketch",
    "Cartridge Club on the bench artwork for LoftwahFM.",
    "Cartridge Club is music for the arcade bench. Tune in straight from your browser.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-cartridge-club-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "loftwahfm-cartridge-club-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "liferaft-local-mbox-landscape",
    "liferaft",
    "Search an MBOX locally · Landscape",
    "Search an MBOX locally artwork for Liferaft.",
    "Search an MBOX locally. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Landscape", "liferaft-local-mbox-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "liferaft-local-mbox-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "max-find-max-feed",
    "max",
    "Find MAX in the browser · Sketch",
    "Find MAX in the browser artwork for MAX.",
    "Open Find MAX and hear the locator in the public browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "max-find-max-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "max-find-max-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "woodhouse-workshop-parts-sticker",
    "woodhouse",
    "Games, music and tools · Sticker",
    "Games, music and tools artwork for Woodhouse.",
    "Games, music and tools. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "woodhouse-workshop-parts-sticker.png", 320, 320],
      ["ImageGen original PNG", "woodhouse-workshop-parts-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-moss-cut-paper-sticker",
    "foilbury",
    "Moss, the quiet collector · Sticker",
    "Moss, the quiet collector artwork for Foilbury.",
    "Moss, the quiet collector. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "foilbury-moss-cut-paper-sticker.png", 320, 320],
      ["ImageGen original PNG", "foilbury-moss-cut-paper-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-three-symbols-link",
    "bubbles",
    "Three and clear · Link preview",
    "Three and clear artwork for Bubbles.",
    "Three and clear. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Link preview", "bubbles-three-symbols-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "bubbles-three-symbols-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "shoalshot-reef-edge-sticker",
    "shoalshot",
    "On the reef edge · Sticker",
    "On the reef edge artwork for SHOALSHOT.",
    "On the reef edge. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "shoalshot-reef-edge-sticker.png", 320, 320],
      ["ImageGen original PNG", "shoalshot-reef-edge-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-viking-face-landscape",
    "fighter",
    "Viking at the cabinet · Landscape",
    "Viking at the cabinet artwork for Fighter.",
    "Viking at the cabinet. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Landscape", "fighter-viking-face-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "fighter-viking-face-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "protocol-11-tactical-landscape",
    "protocol-11",
    "A sharper table · Landscape",
    "A sharper table artwork for Protocol 11.",
    "Classic and Tactical are two bot choices at a local table. Pick a roster and deal a hand.",
    "https://protocol11.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Landscape", "protocol-11-tactical-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "protocol-11-tactical-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "app-composer-creator-links-landscape",
    "app-composer",
    "Give your links a home · Landscape",
    "Give your links a home artwork for App Composer.",
    "Put your links and a moderated guestbook on the same public page. Open the working Creator Hub sample.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "feature",
    "jpg",
    [
      ["Landscape", "app-composer-creator-links-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "app-composer-creator-links-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "loftwahfm-cartridge-club-sticker",
    "loftwahfm",
    "Cartridge Club on the bench · Sticker",
    "Cartridge Club on the bench artwork for LoftwahFM.",
    "Cartridge Club is music for the arcade bench. Tune in straight from your browser.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "special",
    "png",
    [
      ["Discord sticker", "loftwahfm-cartridge-club-sticker.png", 320, 320],
      ["ImageGen original PNG", "loftwahfm-cartridge-club-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-local-mbox-link",
    "liferaft",
    "Search an MBOX locally · Link preview",
    "Search an MBOX locally artwork for Liferaft.",
    "Search an MBOX locally. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Link preview", "liferaft-local-mbox-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "liferaft-local-mbox-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "max-find-max-sticker",
    "max",
    "Find MAX in the browser · Sticker",
    "Find MAX in the browser artwork for MAX.",
    "Open Find MAX and hear the locator in the public browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "special",
    "png",
    [
      ["Discord sticker", "max-find-max-sticker.png", 320, 320],
      ["ImageGen original PNG", "max-find-max-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-the-loom-landscape",
    "woodhouse",
    "A thread through the work · Landscape",
    "A thread through the work artwork for Woodhouse.",
    "A thread through the work. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Landscape", "woodhouse-the-loom-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "woodhouse-the-loom-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "foilbury-silver-shift-landscape",
    "foilbury",
    "Silver in side light · Landscape",
    "Silver in side light artwork for Foilbury.",
    "Moss in Silver catches a cooler light. Open the card and inspect the current Silver finish in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "feature",
    "jpg",
    [
      ["Landscape", "foilbury-silver-shift-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "foilbury-silver-shift-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "bubbles-three-symbols-square",
    "bubbles",
    "Three and clear · Sketch",
    "Three and clear artwork for Bubbles.",
    "Three and clear. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "bubbles-three-symbols-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "bubbles-three-symbols-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "shoalshot-waterline-landscape",
    "shoalshot",
    "Above and below · Landscape",
    "Above and below artwork for SHOALSHOT.",
    "Above and below. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Landscape", "shoalshot-waterline-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "shoalshot-waterline-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "fighter-viking-face-link",
    "fighter",
    "Viking at the cabinet · Link preview",
    "Viking at the cabinet artwork for Fighter.",
    "Viking at the cabinet. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Link preview", "fighter-viking-face-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "fighter-viking-face-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "protocol-11-tactical-link",
    "protocol-11",
    "A sharper table · Link preview",
    "A sharper table artwork for Protocol 11.",
    "Classic and Tactical are two bot choices at a local table. Pick a roster and deal a hand.",
    "https://protocol11.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Link preview", "protocol-11-tactical-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "protocol-11-tactical-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "app-composer-creator-links-link",
    "app-composer",
    "Give your links a home · Link preview",
    "Give your links a home artwork for App Composer.",
    "Put your links and a moderated guestbook on the same public page. Open the working Creator Hub sample.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "feature",
    "jpg",
    [
      ["Link preview", "app-composer-creator-links-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "app-composer-creator-links-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "loftwahfm-night-tape-landscape",
    "loftwahfm",
    "Night Signal · Landscape",
    "Night Signal artwork for LoftwahFM.",
    "A little Night Signal for the late shift. The station opens directly in LoftwahFM.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    "feature",
    "jpg",
    [
      ["Landscape", "loftwahfm-night-tape-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "loftwahfm-night-tape-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "liferaft-local-mbox-square",
    "liferaft",
    "Search an MBOX locally · Sketch",
    "Search an MBOX locally artwork for Liferaft.",
    "Search an MBOX locally. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "liferaft-local-mbox-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "liferaft-local-mbox-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-listen-locator-landscape",
    "max",
    "Listen for the locator · Landscape",
    "Listen for the locator artwork for MAX.",
    "Listen for the locator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "feature",
    "jpg",
    [
      ["Landscape", "max-listen-locator-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "max-listen-locator-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "woodhouse-the-loom-link",
    "woodhouse",
    "A thread through the work · Link preview",
    "A thread through the work artwork for Woodhouse.",
    "A thread through the work. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Link preview", "woodhouse-the-loom-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "woodhouse-the-loom-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "foilbury-silver-shift-link",
    "foilbury",
    "Silver in side light · Link preview",
    "Silver in side light artwork for Foilbury.",
    "Moss in Silver catches a cooler light. Open the card and inspect the current Silver finish in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "feature",
    "jpg",
    [
      ["Link preview", "foilbury-silver-shift-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "foilbury-silver-shift-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "bubbles-three-symbols-avatar",
    "bubbles",
    "Three and clear · Avatar",
    "Three and clear artwork for Bubbles.",
    "Three and clear. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "bubbles-three-symbols-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "bubbles-three-symbols-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "shoalshot-waterline-link",
    "shoalshot",
    "Above and below · Link preview",
    "Above and below artwork for SHOALSHOT.",
    "Above and below. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Link preview", "shoalshot-waterline-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "shoalshot-waterline-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "fighter-viking-face-square",
    "fighter",
    "Viking at the cabinet · Sketch",
    "Viking at the cabinet artwork for Fighter.",
    "Viking at the cabinet. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "fighter-viking-face-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "fighter-viking-face-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "protocol-11-tactical-square",
    "protocol-11",
    "A sharper table · Sketch",
    "A sharper table artwork for Protocol 11.",
    "Classic and Tactical are two bot choices at a local table. Pick a roster and deal a hand.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "protocol-11-tactical-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "protocol-11-tactical-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "app-composer-creator-links-square",
    "app-composer",
    "Give your links a home · Sketch",
    "Give your links a home artwork for App Composer.",
    "Put your links and a moderated guestbook on the same public page. Open the working Creator Hub sample.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "sketch",
    "jpg",
    [
      ["Square feed", "app-composer-creator-links-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "app-composer-creator-links-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-night-tape-square",
    "loftwahfm",
    "Night Signal · Sketch",
    "Night Signal artwork for LoftwahFM.",
    "A little Night Signal for the late shift. The station opens directly in LoftwahFM.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    "sketch",
    "jpg",
    [
      ["Square feed", "loftwahfm-night-tape-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "loftwahfm-night-tape-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "liferaft-local-mbox-avatar",
    "liferaft",
    "Search an MBOX locally · Avatar",
    "Search an MBOX locally artwork for Liferaft.",
    "Search an MBOX locally. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "liferaft-local-mbox-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "liferaft-local-mbox-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-listen-locator-link",
    "max",
    "Listen for the locator · Link preview",
    "Listen for the locator artwork for MAX.",
    "Listen for the locator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "feature",
    "jpg",
    [
      ["Link preview", "max-listen-locator-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "max-listen-locator-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "woodhouse-the-loom-square",
    "woodhouse",
    "A thread through the work · Sketch",
    "A thread through the work artwork for Woodhouse.",
    "A thread through the work. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "woodhouse-the-loom-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "woodhouse-the-loom-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-silver-shift-square",
    "foilbury",
    "Silver in side light · Sketch",
    "Silver in side light artwork for Foilbury.",
    "Moss in Silver catches a cooler light. Open the card and inspect the current Silver finish in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "foilbury-silver-shift-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "foilbury-silver-shift-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "bubbles-first-spark-pin",
    "bubbles",
    "Find the first spark · Pinterest pin",
    "Find the first spark artwork for Bubbles.",
    "Start with First Spark. Aim one shot and see what opens up.",
    "https://bubbles.loftwah.com/puzzle",
    "Play",
    "art",
    "jpg",
    [
      ["Pinterest pin", "bubbles-first-spark-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "bubbles-first-spark-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "shoalshot-waterline-square",
    "shoalshot",
    "Above and below · Sketch",
    "Above and below artwork for SHOALSHOT.",
    "Above and below. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "shoalshot-waterline-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "shoalshot-waterline-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "fighter-viking-face-avatar",
    "fighter",
    "Viking at the cabinet · Avatar",
    "Viking at the cabinet artwork for Fighter.",
    "Viking at the cabinet. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "fighter-viking-face-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "fighter-viking-face-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "protocol-11-tactical-avatar",
    "protocol-11",
    "A sharper table · Avatar",
    "A sharper table artwork for Protocol 11.",
    "Classic and Tactical are two bot choices at a local table. Pick a roster and deal a hand.",
    "https://protocol11.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "protocol-11-tactical-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "protocol-11-tactical-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "app-composer-creator-links-avatar",
    "app-composer",
    "Give your links a home · Avatar",
    "Give your links a home artwork for App Composer.",
    "Put your links and a moderated guestbook on the same public page. Open the working Creator Hub sample.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "icon",
    "jpg",
    [
      ["Profile icon", "app-composer-creator-links-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "app-composer-creator-links-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-put-radio-on-pin",
    "loftwahfm",
    "Put the radio on · Pinterest pin",
    "Put the radio on artwork for LoftwahFM.",
    "Put the radio on. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "art",
    "jpg",
    [
      ["Pinterest pin", "loftwahfm-put-radio-on-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "loftwahfm-put-radio-on-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "liferaft-attachment-export-pin",
    "liferaft",
    "Take the attachment · Pinterest pin",
    "Take the attachment artwork for Liferaft.",
    "Found the message? Export the one attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Pinterest pin", "liferaft-attachment-export-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "liferaft-attachment-export-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "max-listen-locator-square",
    "max",
    "Listen for the locator · Sketch",
    "Listen for the locator artwork for MAX.",
    "Listen for the locator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "sketch",
    "jpg",
    [
      ["Square feed", "max-listen-locator-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "max-listen-locator-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "woodhouse-the-loom-avatar",
    "woodhouse",
    "A thread through the work · Avatar",
    "A thread through the work artwork for Woodhouse.",
    "A thread through the work. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "woodhouse-the-loom-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "woodhouse-the-loom-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-silver-shift-avatar",
    "foilbury",
    "Silver in side light · Avatar",
    "Silver in side light artwork for Foilbury.",
    "Moss in Silver catches a cooler light. Open the card and inspect the current Silver finish in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "foilbury-silver-shift-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "foilbury-silver-shift-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "bubbles-first-spark-x",
    "bubbles",
    "Find the first spark · X header",
    "Find the first spark artwork for Bubbles.",
    "Start with First Spark. Aim one shot and see what opens up.",
    "https://bubbles.loftwah.com/puzzle",
    "Play",
    "banner",
    "jpg",
    [
      ["X header", "bubbles-first-spark-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "bubbles-first-spark-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "shoalshot-waterline-avatar",
    "shoalshot",
    "Above and below · Avatar",
    "Above and below artwork for SHOALSHOT.",
    "Above and below. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "shoalshot-waterline-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "shoalshot-waterline-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "fighter-battle-blast-pin",
    "fighter",
    "Open Battle Blast · Pinterest pin",
    "Open Battle Blast artwork for Fighter.",
    "Open the Battle Blast tutorial in Fighter. Viking and Grim Reaper are already at the cabinet.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Pinterest pin", "fighter-battle-blast-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "fighter-battle-blast-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "protocol-11-draw-pile-pin",
    "protocol-11",
    "Take the top card · Pinterest pin",
    "Take the top card artwork for Protocol 11.",
    "Take the top card. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Pinterest pin", "protocol-11-draw-pile-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "protocol-11-draw-pile-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "app-composer-visitor-postcards-pin",
    "app-composer",
    "Leave a postcard · Pinterest pin",
    "Leave a postcard artwork for App Composer.",
    "Leave a postcard. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "art",
    "jpg",
    [
      ["Pinterest pin", "app-composer-visitor-postcards-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "app-composer-visitor-postcards-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "loftwahfm-put-radio-on-x",
    "loftwahfm",
    "Put the radio on · X header",
    "Put the radio on artwork for LoftwahFM.",
    "Put the radio on. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "banner",
    "jpg",
    [
      ["X header", "loftwahfm-put-radio-on-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "loftwahfm-put-radio-on-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "liferaft-attachment-export-x",
    "liferaft",
    "Take the attachment · X header",
    "Take the attachment artwork for Liferaft.",
    "Found the message? Export the one attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "banner",
    "jpg",
    [
      ["X header", "liferaft-attachment-export-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "liferaft-attachment-export-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "max-listen-locator-avatar",
    "max",
    "Listen for the locator · Avatar",
    "Listen for the locator artwork for MAX.",
    "Listen for the locator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "icon",
    "jpg",
    [
      ["Profile icon", "max-listen-locator-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "max-listen-locator-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "woodhouse-share-the-work-pin",
    "woodhouse",
    "Show your work · Pinterest pin",
    "Show your work artwork for Woodhouse.",
    "Take a piece of the workshop. The Share wall has artwork, clean drawings and download sizes.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Pinterest pin", "woodhouse-share-the-work-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "woodhouse-share-the-work-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "foilbury-gold-shift-pin",
    "foilbury",
    "Gold in warm light · Pinterest pin",
    "Gold in warm light artwork for Foilbury.",
    "Same Moss portrait, warmer surface. Open the Gold finish in the cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "art",
    "jpg",
    [
      ["Pinterest pin", "foilbury-gold-shift-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "foilbury-gold-shift-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "bubbles-first-spark-feed",
    "bubbles",
    "Find the first spark · Sketch",
    "Find the first spark artwork for Bubbles.",
    "Start with First Spark. Aim one shot and see what opens up.",
    "https://bubbles.loftwah.com/puzzle",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "bubbles-first-spark-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "bubbles-first-spark-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "shoalshot-tidepool-entry-pin",
    "shoalshot",
    "Step into the tide pool · Pinterest pin",
    "Step into the tide pool artwork for SHOALSHOT.",
    "Open SHOALSHOT in your browser and take a dive into the Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Pinterest pin", "shoalshot-tidepool-entry-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "shoalshot-tidepool-entry-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "fighter-battle-blast-x",
    "fighter",
    "Open Battle Blast · X header",
    "Open Battle Blast artwork for Fighter.",
    "Open the Battle Blast tutorial in Fighter. Viking and Grim Reaper are already at the cabinet.",
    "https://fighter.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["X header", "fighter-battle-blast-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "fighter-battle-blast-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "protocol-11-draw-pile-x",
    "protocol-11",
    "Take the top card · X header",
    "Take the top card artwork for Protocol 11.",
    "Take the top card. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["X header", "protocol-11-draw-pile-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "protocol-11-draw-pile-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "app-composer-visitor-postcards-x",
    "app-composer",
    "Leave a postcard · X header",
    "Leave a postcard artwork for App Composer.",
    "Leave a postcard. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "banner",
    "jpg",
    [
      ["X header", "app-composer-visitor-postcards-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "app-composer-visitor-postcards-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "loftwahfm-put-radio-on-feed",
    "loftwahfm",
    "Put the radio on · Sketch",
    "Put the radio on artwork for LoftwahFM.",
    "Put the radio on. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-put-radio-on-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "loftwahfm-put-radio-on-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "liferaft-attachment-export-feed",
    "liferaft",
    "Take the attachment · Sketch",
    "Take the attachment artwork for Liferaft.",
    "Found the message? Export the one attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "liferaft-attachment-export-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "liferaft-attachment-export-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "max-idle-and-active-x",
    "max",
    "Idle and active · X header",
    "Idle and active artwork for MAX.",
    "Watch the room with the locator idle, then hear the cue in the MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "banner",
    "jpg",
    [
      ["X header", "max-idle-and-active-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "max-idle-and-active-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "woodhouse-share-the-work-x",
    "woodhouse",
    "Show your work · X header",
    "Show your work artwork for Woodhouse.",
    "Take a piece of the workshop. The Share wall has artwork, clean drawings and download sizes.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "banner",
    "jpg",
    [
      ["X header", "woodhouse-share-the-work-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "woodhouse-share-the-work-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "foilbury-gold-shift-x",
    "foilbury",
    "Gold in warm light · X header",
    "Gold in warm light artwork for Foilbury.",
    "Same Moss portrait, warmer surface. Open the Gold finish in the cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "banner",
    "jpg",
    [
      ["X header", "foilbury-gold-shift-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "foilbury-gold-shift-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "bubbles-first-spark-sticker",
    "bubbles",
    "Find the first spark · Sticker",
    "Find the first spark artwork for Bubbles.",
    "Start with First Spark. Aim one shot and see what opens up.",
    "https://bubbles.loftwah.com/puzzle",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "bubbles-first-spark-sticker.png", 320, 320],
      ["ImageGen original PNG", "bubbles-first-spark-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-tidepool-entry-x",
    "shoalshot",
    "Step into the tide pool · X header",
    "Step into the tide pool artwork for SHOALSHOT.",
    "Open SHOALSHOT in your browser and take a dive into the Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["X header", "shoalshot-tidepool-entry-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "shoalshot-tidepool-entry-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "fighter-battle-blast-feed",
    "fighter",
    "Open Battle Blast · Sketch",
    "Open Battle Blast artwork for Fighter.",
    "Open the Battle Blast tutorial in Fighter. Viking and Grim Reaper are already at the cabinet.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "fighter-battle-blast-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "fighter-battle-blast-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "protocol-11-draw-pile-feed",
    "protocol-11",
    "Take the top card · Sketch",
    "Take the top card artwork for Protocol 11.",
    "Take the top card. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "protocol-11-draw-pile-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "protocol-11-draw-pile-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "app-composer-visitor-postcards-feed",
    "app-composer",
    "Leave a postcard · Sketch",
    "Leave a postcard artwork for App Composer.",
    "Leave a postcard. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "app-composer-visitor-postcards-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "app-composer-visitor-postcards-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-put-radio-on-sticker",
    "loftwahfm",
    "Put the radio on · Sticker",
    "Put the radio on artwork for LoftwahFM.",
    "Put the radio on. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "special",
    "png",
    [
      ["Discord sticker", "loftwahfm-put-radio-on-sticker.png", 320, 320],
      ["ImageGen original PNG", "loftwahfm-put-radio-on-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-attachment-export-sticker",
    "liferaft",
    "Take the attachment · Sticker",
    "Take the attachment artwork for Liferaft.",
    "Found the message? Export the one attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "liferaft-attachment-export-sticker.png", 320, 320],
      ["ImageGen original PNG", "liferaft-attachment-export-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "max-idle-and-active-feed",
    "max",
    "Idle and active · Sketch",
    "Idle and active artwork for MAX.",
    "Watch the room with the locator idle, then hear the cue in the MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "max-idle-and-active-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "max-idle-and-active-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "woodhouse-share-the-work-feed",
    "woodhouse",
    "Show your work · Sketch",
    "Show your work artwork for Woodhouse.",
    "Take a piece of the workshop. The Share wall has artwork, clean drawings and download sizes.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "woodhouse-share-the-work-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "woodhouse-share-the-work-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "foilbury-gold-shift-feed",
    "foilbury",
    "Gold in warm light · Sketch",
    "Gold in warm light artwork for Foilbury.",
    "Same Moss portrait, warmer surface. Open the Gold finish in the cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "foilbury-gold-shift-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "foilbury-gold-shift-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "bubbles-cabinet-sounds-story",
    "bubbles",
    "Cabinet after closing · Story still",
    "Cabinet after closing artwork for Bubbles.",
    "Cabinet after closing. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Story still", "bubbles-cabinet-sounds-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "bubbles-cabinet-sounds-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "shoalshot-tidepool-entry-feed",
    "shoalshot",
    "Step into the tide pool · Sketch",
    "Step into the tide pool artwork for SHOALSHOT.",
    "Open SHOALSHOT in your browser and take a dive into the Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "shoalshot-tidepool-entry-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "shoalshot-tidepool-entry-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "fighter-battle-blast-sticker",
    "fighter",
    "Open Battle Blast · Sticker",
    "Open Battle Blast artwork for Fighter.",
    "Open the Battle Blast tutorial in Fighter. Viking and Grim Reaper are already at the cabinet.",
    "https://fighter.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "fighter-battle-blast-sticker.png", 320, 320],
      ["ImageGen original PNG", "fighter-battle-blast-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-draw-pile-sticker",
    "protocol-11",
    "Take the top card · Sticker",
    "Take the top card artwork for Protocol 11.",
    "Take the top card. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "protocol-11-draw-pile-sticker.png", 320, 320],
      ["ImageGen original PNG", "protocol-11-draw-pile-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-visitor-postcards-sticker",
    "app-composer",
    "Leave a postcard · Sticker",
    "Leave a postcard artwork for App Composer.",
    "Leave a postcard. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "special",
    "png",
    [
      ["Discord sticker", "app-composer-visitor-postcards-sticker.png", 320, 320],
      ["ImageGen original PNG", "app-composer-visitor-postcards-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-workshop-listening-story",
    "loftwahfm",
    "Radio for the workbench · Story still",
    "Radio for the workbench artwork for LoftwahFM.",
    "Radio for the workbench. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "art",
    "jpg",
    [
      ["Story still", "loftwahfm-workshop-listening-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "loftwahfm-workshop-listening-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "liferaft-archive-quiet-story",
    "liferaft",
    "The archive stays close · Story still",
    "The archive stays close artwork for Liferaft.",
    "The archive stays close. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Story still", "liferaft-archive-quiet-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "liferaft-archive-quiet-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "max-idle-and-active-sticker",
    "max",
    "Idle and active · Sticker",
    "Idle and active artwork for MAX.",
    "Watch the room with the locator idle, then hear the cue in the MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "special",
    "png",
    [
      ["Discord sticker", "max-idle-and-active-sticker.png", 320, 320],
      ["ImageGen original PNG", "max-idle-and-active-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-share-the-work-sticker",
    "woodhouse",
    "Show your work · Sticker",
    "Show your work artwork for Woodhouse.",
    "Take a piece of the workshop. The Share wall has artwork, clean drawings and download sizes.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "woodhouse-share-the-work-sticker.png", 320, 320],
      ["ImageGen original PNG", "woodhouse-share-the-work-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-gold-shift-sticker",
    "foilbury",
    "Gold in warm light · Sticker",
    "Gold in warm light artwork for Foilbury.",
    "Same Moss portrait, warmer surface. Open the Gold finish in the cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "foilbury-gold-shift-sticker.png", 320, 320],
      ["ImageGen original PNG", "foilbury-gold-shift-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-cabinet-sounds-discord",
    "bubbles",
    "Cabinet after closing · Discord banner",
    "Cabinet after closing artwork for Bubbles.",
    "Cabinet after closing. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["Discord banner", "bubbles-cabinet-sounds-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "bubbles-cabinet-sounds-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "shoalshot-tidepool-entry-sticker",
    "shoalshot",
    "Step into the tide pool · Sticker",
    "Step into the tide pool artwork for SHOALSHOT.",
    "Open SHOALSHOT in your browser and take a dive into the Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "shoalshot-tidepool-entry-sticker.png", 320, 320],
      ["ImageGen original PNG", "shoalshot-tidepool-entry-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-fight-night-story",
    "fighter",
    "After the bell · Story still",
    "After the bell artwork for Fighter.",
    "After the bell. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Story still", "fighter-fight-night-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "fighter-fight-night-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "protocol-11-card-night-story",
    "protocol-11",
    "An extra chair · Story still",
    "An extra chair artwork for Protocol 11.",
    "An extra chair. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Story still", "protocol-11-card-night-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "protocol-11-card-night-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "app-composer-home-and-away-story",
    "app-composer",
    "Here and there · Story still",
    "Here and there artwork for App Composer.",
    "Here and there. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "art",
    "jpg",
    [
      ["Story still", "app-composer-home-and-away-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "app-composer-home-and-away-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "loftwahfm-workshop-listening-discord",
    "loftwahfm",
    "Radio for the workbench · Discord banner",
    "Radio for the workbench artwork for LoftwahFM.",
    "Radio for the workbench. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "banner",
    "jpg",
    [
      ["Discord banner", "loftwahfm-workshop-listening-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "loftwahfm-workshop-listening-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "liferaft-archive-quiet-discord",
    "liferaft",
    "The archive stays close · Discord banner",
    "The archive stays close artwork for Liferaft.",
    "The archive stays close. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "banner",
    "jpg",
    [
      ["Discord banner", "liferaft-archive-quiet-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "liferaft-archive-quiet-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "max-room-model-story",
    "max",
    "Room model study · Story still",
    "Room model study artwork for MAX.",
    "Room model study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "jpg",
    [
      ["Story still", "max-room-model-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "max-room-model-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "woodhouse-games-at-the-bench-story",
    "woodhouse",
    "The games bench · Story still",
    "The games bench artwork for Woodhouse.",
    "The games bench. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Story still", "woodhouse-games-at-the-bench-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "woodhouse-games-at-the-bench-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "foilbury-diamond-turn-discord",
    "foilbury",
    "Turn the Diamond finish · Discord banner",
    "Turn the Diamond finish artwork for Foilbury.",
    "Diamond changes when you turn it. Open the current Moss card and try the finish selector.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "banner",
    "jpg",
    [
      ["Discord banner", "foilbury-diamond-turn-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "foilbury-diamond-turn-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "bubbles-cabinet-sounds-square",
    "bubbles",
    "Cabinet after closing · Sketch",
    "Cabinet after closing artwork for Bubbles.",
    "Cabinet after closing. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "bubbles-cabinet-sounds-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "bubbles-cabinet-sounds-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "shoalshot-glimmerfin-study-story",
    "shoalshot",
    "The Glimmerfin study · Story still",
    "The Glimmerfin study artwork for SHOALSHOT.",
    "Look for the silver-blue turn of a Glimmerfin in the Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Story still", "shoalshot-glimmerfin-study-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "shoalshot-glimmerfin-study-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "fighter-fight-night-discord",
    "fighter",
    "After the bell · Discord banner",
    "After the bell artwork for Fighter.",
    "After the bell. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["Discord banner", "fighter-fight-night-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "fighter-fight-night-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "protocol-11-card-night-discord",
    "protocol-11",
    "An extra chair · Discord banner",
    "An extra chair artwork for Protocol 11.",
    "An extra chair. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["Discord banner", "protocol-11-card-night-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "protocol-11-card-night-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "app-composer-home-and-away-discord",
    "app-composer",
    "Here and there · Discord banner",
    "Here and there artwork for App Composer.",
    "Here and there. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "banner",
    "jpg",
    [
      ["Discord banner", "app-composer-home-and-away-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "app-composer-home-and-away-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "loftwahfm-workshop-listening-square",
    "loftwahfm",
    "Radio for the workbench · Sketch",
    "Radio for the workbench artwork for LoftwahFM.",
    "Radio for the workbench. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "jpg",
    [
      ["Square feed", "loftwahfm-workshop-listening-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "loftwahfm-workshop-listening-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "liferaft-archive-quiet-square",
    "liferaft",
    "The archive stays close · Sketch",
    "The archive stays close artwork for Liferaft.",
    "The archive stays close. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "liferaft-archive-quiet-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "liferaft-archive-quiet-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-room-model-discord",
    "max",
    "Room model study · Discord banner",
    "Room model study artwork for MAX.",
    "Room model study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "banner",
    "jpg",
    [
      ["Discord banner", "max-room-model-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "max-room-model-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "woodhouse-games-at-the-bench-discord",
    "woodhouse",
    "The games bench · Discord banner",
    "The games bench artwork for Woodhouse.",
    "The games bench. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "banner",
    "jpg",
    [
      ["Discord banner", "woodhouse-games-at-the-bench-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "woodhouse-games-at-the-bench-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "foilbury-diamond-turn-square",
    "foilbury",
    "Turn the Diamond finish · Sketch",
    "Turn the Diamond finish artwork for Foilbury.",
    "Diamond changes when you turn it. Open the current Moss card and try the finish selector.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "foilbury-diamond-turn-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "foilbury-diamond-turn-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "bubbles-cabinet-sounds-avatar",
    "bubbles",
    "Cabinet after closing · Avatar",
    "Cabinet after closing artwork for Bubbles.",
    "Cabinet after closing. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "bubbles-cabinet-sounds-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "bubbles-cabinet-sounds-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "shoalshot-glimmerfin-study-discord",
    "shoalshot",
    "The Glimmerfin study · Discord banner",
    "The Glimmerfin study artwork for SHOALSHOT.",
    "Look for the silver-blue turn of a Glimmerfin in the Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["Discord banner", "shoalshot-glimmerfin-study-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "shoalshot-glimmerfin-study-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "fighter-fight-night-square",
    "fighter",
    "After the bell · Sketch",
    "After the bell artwork for Fighter.",
    "After the bell. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "fighter-fight-night-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "fighter-fight-night-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "protocol-11-card-night-square",
    "protocol-11",
    "An extra chair · Sketch",
    "An extra chair artwork for Protocol 11.",
    "An extra chair. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "protocol-11-card-night-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "protocol-11-card-night-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "app-composer-home-and-away-square",
    "app-composer",
    "Here and there · Sketch",
    "Here and there artwork for App Composer.",
    "Here and there. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "sketch",
    "jpg",
    [
      ["Square feed", "app-composer-home-and-away-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "app-composer-home-and-away-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-workshop-listening-avatar",
    "loftwahfm",
    "Radio for the workbench · Avatar",
    "Radio for the workbench artwork for LoftwahFM.",
    "Radio for the workbench. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "icon",
    "jpg",
    [
      ["Profile icon", "loftwahfm-workshop-listening-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "loftwahfm-workshop-listening-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "liferaft-archive-quiet-avatar",
    "liferaft",
    "The archive stays close · Avatar",
    "The archive stays close artwork for Liferaft.",
    "The archive stays close. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "liferaft-archive-quiet-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "liferaft-archive-quiet-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-room-model-square",
    "max",
    "Room model study · Sketch",
    "Room model study artwork for MAX.",
    "Room model study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "sketch",
    "jpg",
    [
      ["Square feed", "max-room-model-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "max-room-model-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "woodhouse-games-at-the-bench-square",
    "woodhouse",
    "The games bench · Sketch",
    "The games bench artwork for Woodhouse.",
    "The games bench. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "woodhouse-games-at-the-bench-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "woodhouse-games-at-the-bench-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-diamond-turn-avatar",
    "foilbury",
    "Turn the Diamond finish · Avatar",
    "Turn the Diamond finish artwork for Foilbury.",
    "Diamond changes when you turn it. Open the current Moss card and try the finish selector.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "foilbury-diamond-turn-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "foilbury-diamond-turn-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "bubbles-puzzle-map-pin",
    "bubbles",
    "A board worth another go · Pinterest pin",
    "A board worth another go artwork for Bubbles.",
    "A board worth another go. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "bubbles-puzzle-map-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "bubbles-puzzle-map-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "shoalshot-glimmerfin-study-avatar",
    "shoalshot",
    "The Glimmerfin study · Avatar",
    "The Glimmerfin study artwork for SHOALSHOT.",
    "Look for the silver-blue turn of a Glimmerfin in the Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "shoalshot-glimmerfin-study-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "shoalshot-glimmerfin-study-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "fighter-fight-night-avatar",
    "fighter",
    "After the bell · Avatar",
    "After the bell artwork for Fighter.",
    "After the bell. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "fighter-fight-night-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "fighter-fight-night-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "protocol-11-card-night-avatar",
    "protocol-11",
    "An extra chair · Avatar",
    "An extra chair artwork for Protocol 11.",
    "An extra chair. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "protocol-11-card-night-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "protocol-11-card-night-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "app-composer-home-and-away-avatar",
    "app-composer",
    "Here and there · Avatar",
    "Here and there artwork for App Composer.",
    "Here and there. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "icon",
    "jpg",
    [
      ["Profile icon", "app-composer-home-and-away-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "app-composer-home-and-away-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-bright-and-dark-pin",
    "loftwahfm",
    "Two stations, two moods · Pinterest pin",
    "Two stations, two moods artwork for LoftwahFM.",
    "Cartridge Club and Night Signal are two different moods in LoftwahFM’s radio picker.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "loftwahfm-bright-and-dark-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "loftwahfm-bright-and-dark-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "liferaft-search-then-export-pin",
    "liferaft",
    "Search, then export · Pinterest pin",
    "Search, then export artwork for Liferaft.",
    "Open a local MBOX archive. Search for the message and export the attachment you came for.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "liferaft-search-then-export-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "liferaft-search-then-export-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "max-room-model-avatar",
    "max",
    "Room model study · Avatar",
    "Room model study artwork for MAX.",
    "Room model study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "icon",
    "jpg",
    [
      ["Profile icon", "max-room-model-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "max-room-model-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "woodhouse-games-at-the-bench-avatar",
    "woodhouse",
    "The games bench · Avatar",
    "The games bench artwork for Woodhouse.",
    "The games bench. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "woodhouse-games-at-the-bench-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "woodhouse-games-at-the-bench-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-drop-bear-pin",
    "foilbury",
    "Drop Bear from Fighter · Pinterest pin",
    "Drop Bear from Fighter artwork for Foilbury.",
    "Drop Bear came across from Fighter. Open the current card in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/drop-bear",
    "Explore",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "foilbury-drop-bear-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "foilbury-drop-bear-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "bubbles-puzzle-map-landscape",
    "bubbles",
    "A board worth another go · Landscape",
    "A board worth another go artwork for Bubbles.",
    "A board worth another go. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Landscape", "bubbles-puzzle-map-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "bubbles-puzzle-map-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "shoalshot-reef-summer-pin",
    "shoalshot",
    "Summer in the shallows · Pinterest pin",
    "Summer in the shallows artwork for SHOALSHOT.",
    "Summer in the shallows. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "shoalshot-reef-summer-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "shoalshot-reef-summer-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "fighter-battle-first-pin",
    "fighter",
    "Pick your first move · Pinterest pin",
    "Pick your first move artwork for Fighter.",
    "Pick your first move. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "fighter-battle-first-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "fighter-battle-first-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "protocol-11-solo-classic-pin",
    "protocol-11",
    "A local hand · Pinterest pin",
    "A local hand artwork for Protocol 11.",
    "A local hand. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "protocol-11-solo-classic-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "protocol-11-solo-classic-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "app-composer-ready-made-pin",
    "app-composer",
    "Start from a working sample · Pinterest pin",
    "Start from a working sample artwork for App Composer.",
    "Start from a working sample. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "app-composer-ready-made-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "app-composer-ready-made-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "loftwahfm-bright-and-dark-landscape",
    "loftwahfm",
    "Two stations, two moods · Landscape",
    "Two stations, two moods artwork for LoftwahFM.",
    "Cartridge Club and Night Signal are two different moods in LoftwahFM’s radio picker.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "feature",
    "jpg",
    [
      ["Landscape", "loftwahfm-bright-and-dark-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "loftwahfm-bright-and-dark-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "liferaft-search-then-export-landscape",
    "liferaft",
    "Search, then export · Landscape",
    "Search, then export artwork for Liferaft.",
    "Open a local MBOX archive. Search for the message and export the attachment you came for.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Landscape", "liferaft-search-then-export-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "liferaft-search-then-export-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "max-simulator-only-pin",
    "max",
    "The browser simulator · Pinterest pin",
    "The browser simulator artwork for MAX.",
    "The browser simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "max-simulator-only-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "max-simulator-only-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "woodhouse-makers-radio-pin",
    "woodhouse",
    "Radio for makers · Pinterest pin",
    "Radio for makers artwork for Woodhouse.",
    "Radio for makers. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Pinterest pin", "woodhouse-makers-radio-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "woodhouse-makers-radio-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "foilbury-drop-bear-feed",
    "foilbury",
    "Drop Bear from Fighter · Sketch",
    "Drop Bear from Fighter artwork for Foilbury.",
    "Drop Bear came across from Fighter. Open the current card in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/drop-bear",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "foilbury-drop-bear-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "foilbury-drop-bear-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "bubbles-puzzle-map-feed",
    "bubbles",
    "A board worth another go · Sketch",
    "A board worth another go artwork for Bubbles.",
    "A board worth another go. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "bubbles-puzzle-map-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "bubbles-puzzle-map-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "shoalshot-reef-summer-landscape",
    "shoalshot",
    "Summer in the shallows · Landscape",
    "Summer in the shallows artwork for SHOALSHOT.",
    "Summer in the shallows. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Landscape", "shoalshot-reef-summer-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "shoalshot-reef-summer-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "fighter-battle-first-landscape",
    "fighter",
    "Pick your first move · Landscape",
    "Pick your first move artwork for Fighter.",
    "Pick your first move. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Landscape", "fighter-battle-first-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "fighter-battle-first-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "protocol-11-solo-classic-landscape",
    "protocol-11",
    "A local hand · Landscape",
    "A local hand artwork for Protocol 11.",
    "A local hand. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "feature",
    "jpg",
    [
      ["Landscape", "protocol-11-solo-classic-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "protocol-11-solo-classic-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "app-composer-ready-made-feed",
    "app-composer",
    "Start from a working sample · Sketch",
    "Start from a working sample artwork for App Composer.",
    "Start from a working sample. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "app-composer-ready-made-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "app-composer-ready-made-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-bright-and-dark-feed",
    "loftwahfm",
    "Two stations, two moods · Sketch",
    "Two stations, two moods artwork for LoftwahFM.",
    "Cartridge Club and Night Signal are two different moods in LoftwahFM’s radio picker.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-bright-and-dark-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "loftwahfm-bright-and-dark-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "liferaft-search-then-export-feed",
    "liferaft",
    "Search, then export · Sketch",
    "Search, then export artwork for Liferaft.",
    "Open a local MBOX archive. Search for the message and export the attachment you came for.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "liferaft-search-then-export-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "liferaft-search-then-export-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "max-simulator-only-landscape",
    "max",
    "The browser simulator · Landscape",
    "The browser simulator artwork for MAX.",
    "The browser simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "feature",
    "jpg",
    [
      ["Landscape", "max-simulator-only-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "max-simulator-only-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "woodhouse-makers-radio-landscape",
    "woodhouse",
    "Radio for makers · Landscape",
    "Radio for makers artwork for Woodhouse.",
    "Radio for makers. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "feature",
    "jpg",
    [
      ["Landscape", "woodhouse-makers-radio-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "woodhouse-makers-radio-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "foilbury-drop-bear-sticker",
    "foilbury",
    "Drop Bear from Fighter · Sticker",
    "Drop Bear from Fighter artwork for Foilbury.",
    "Drop Bear came across from Fighter. Open the current card in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/drop-bear",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "foilbury-drop-bear-sticker.png", 320, 320],
      ["ImageGen original PNG", "foilbury-drop-bear-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-puzzle-map-sticker",
    "bubbles",
    "A board worth another go · Sticker",
    "A board worth another go artwork for Bubbles.",
    "A board worth another go. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "bubbles-puzzle-map-sticker.png", 320, 320],
      ["ImageGen original PNG", "bubbles-puzzle-map-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-summer-feed",
    "shoalshot",
    "Summer in the shallows · Sketch",
    "Summer in the shallows artwork for SHOALSHOT.",
    "Summer in the shallows. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "shoalshot-reef-summer-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "shoalshot-reef-summer-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "fighter-battle-first-feed",
    "fighter",
    "Pick your first move · Sketch",
    "Pick your first move artwork for Fighter.",
    "Pick your first move. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "fighter-battle-first-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "fighter-battle-first-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "protocol-11-solo-classic-feed",
    "protocol-11",
    "A local hand · Sketch",
    "A local hand artwork for Protocol 11.",
    "A local hand. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "protocol-11-solo-classic-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "protocol-11-solo-classic-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "app-composer-ready-made-sticker",
    "app-composer",
    "Start from a working sample · Sticker",
    "Start from a working sample artwork for App Composer.",
    "Start from a working sample. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "special",
    "png",
    [
      ["Discord sticker", "app-composer-ready-made-sticker.png", 320, 320],
      ["ImageGen original PNG", "app-composer-ready-made-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-bright-and-dark-sticker",
    "loftwahfm",
    "Two stations, two moods · Sticker",
    "Two stations, two moods artwork for LoftwahFM.",
    "Cartridge Club and Night Signal are two different moods in LoftwahFM’s radio picker.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "special",
    "png",
    [
      ["Discord sticker", "loftwahfm-bright-and-dark-sticker.png", 320, 320],
      ["ImageGen original PNG", "loftwahfm-bright-and-dark-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-search-then-export-sticker",
    "liferaft",
    "Search, then export · Sticker",
    "Search, then export artwork for Liferaft.",
    "Open a local MBOX archive. Search for the message and export the attachment you came for.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "liferaft-search-then-export-sticker.png", 320, 320],
      ["ImageGen original PNG", "liferaft-search-then-export-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "max-simulator-only-feed",
    "max",
    "The browser simulator · Sketch",
    "The browser simulator artwork for MAX.",
    "The browser simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "max-simulator-only-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "max-simulator-only-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "woodhouse-makers-radio-feed",
    "woodhouse",
    "Radio for makers · Sketch",
    "Radio for makers artwork for Woodhouse.",
    "Radio for makers. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "woodhouse-makers-radio-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "woodhouse-makers-radio-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "foilbury-keeper-feed",
    "foilbury",
    "The Cabinet Keeper · Portrait feed",
    "The Cabinet Keeper artwork for Foilbury.",
    "Meet the little Keeper with the key. Browse the public cabinet.",
    "https://foilbury.loftwah.com/cabinet/",
    "Explore",
    "art",
    "jpg",
    [
      ["Portrait feed", "foilbury-keeper-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "foilbury-keeper-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "bubbles-game-night-feed",
    "bubbles",
    "A quick round after dinner · Portrait feed",
    "A quick round after dinner artwork for Bubbles.",
    "A quick round after dinner. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Portrait feed", "bubbles-game-night-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "bubbles-game-night-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "shoalshot-reef-summer-sticker",
    "shoalshot",
    "Summer in the shallows · Sticker",
    "Summer in the shallows artwork for SHOALSHOT.",
    "Summer in the shallows. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "shoalshot-reef-summer-sticker.png", 320, 320],
      ["ImageGen original PNG", "shoalshot-reef-summer-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-battle-first-sticker",
    "fighter",
    "Pick your first move · Sticker",
    "Pick your first move artwork for Fighter.",
    "Pick your first move. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "fighter-battle-first-sticker.png", 320, 320],
      ["ImageGen original PNG", "fighter-battle-first-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-solo-classic-sticker",
    "protocol-11",
    "A local hand · Sticker",
    "A local hand artwork for Protocol 11.",
    "A local hand. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "protocol-11-solo-classic-sticker.png", 320, 320],
      ["ImageGen original PNG", "protocol-11-solo-classic-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-profile-as-home-feed",
    "app-composer",
    "A home for your work · Portrait feed",
    "A home for your work artwork for App Composer.",
    "A home for your work. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "art",
    "jpg",
    [
      ["Portrait feed", "app-composer-profile-as-home-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "app-composer-profile-as-home-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-winter-frequency-feed",
    "loftwahfm",
    "Radio through the rain · Portrait feed",
    "Radio through the rain artwork for LoftwahFM.",
    "Radio through the rain. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "art",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-winter-frequency-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "loftwahfm-winter-frequency-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "liferaft-spring-cleanout-feed",
    "liferaft",
    "Old mail, new light · Portrait feed",
    "Old mail, new light artwork for Liferaft.",
    "Old mail, new light. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Portrait feed", "liferaft-spring-cleanout-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "liferaft-spring-cleanout-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "max-simulator-only-sticker",
    "max",
    "The browser simulator · Sticker",
    "The browser simulator artwork for MAX.",
    "The browser simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "special",
    "png",
    [
      ["Discord sticker", "max-simulator-only-sticker.png", 320, 320],
      ["ImageGen original PNG", "max-simulator-only-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-makers-radio-sticker",
    "woodhouse",
    "Radio for makers · Sticker",
    "Radio for makers artwork for Woodhouse.",
    "Radio for makers. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "woodhouse-makers-radio-sticker.png", 320, 320],
      ["ImageGen original PNG", "woodhouse-makers-radio-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-keeper-story",
    "foilbury",
    "The Cabinet Keeper · Story still",
    "The Cabinet Keeper artwork for Foilbury.",
    "Meet the little Keeper with the key. Browse the public cabinet.",
    "https://foilbury.loftwah.com/cabinet/",
    "Explore",
    "seasonal",
    "jpg",
    [
      ["Story still", "foilbury-keeper-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "foilbury-keeper-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "bubbles-game-night-story",
    "bubbles",
    "A quick round after dinner · Story still",
    "A quick round after dinner artwork for Bubbles.",
    "A quick round after dinner. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "seasonal",
    "jpg",
    [
      ["Story still", "bubbles-game-night-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "bubbles-game-night-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "shoalshot-reef-window-feed",
    "shoalshot",
    "Through a blue window · Portrait feed",
    "Through a blue window artwork for SHOALSHOT.",
    "Through a blue window. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Portrait feed", "shoalshot-reef-window-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "shoalshot-reef-window-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "fighter-cabinet-at-the-coast-feed",
    "fighter",
    "Cabinet on the coast · Portrait feed",
    "Cabinet on the coast artwork for Fighter.",
    "Cabinet on the coast. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Portrait feed", "fighter-cabinet-at-the-coast-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "fighter-cabinet-at-the-coast-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "protocol-11-summer-deal-feed",
    "protocol-11",
    "Deal after dark · Portrait feed",
    "Deal after dark artwork for Protocol 11.",
    "Deal after dark. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Portrait feed", "protocol-11-summer-deal-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "protocol-11-summer-deal-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "app-composer-profile-as-home-story",
    "app-composer",
    "A home for your work · Story still",
    "A home for your work artwork for App Composer.",
    "A home for your work. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "seasonal",
    "jpg",
    [
      ["Story still", "app-composer-profile-as-home-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "app-composer-profile-as-home-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "loftwahfm-winter-frequency-story",
    "loftwahfm",
    "Radio through the rain · Story still",
    "Radio through the rain artwork for LoftwahFM.",
    "Radio through the rain. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "seasonal",
    "jpg",
    [
      ["Story still", "loftwahfm-winter-frequency-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "loftwahfm-winter-frequency-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "liferaft-spring-cleanout-story",
    "liferaft",
    "Old mail, new light · Story still",
    "Old mail, new light artwork for Liferaft.",
    "Old mail, new light. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "seasonal",
    "jpg",
    [
      ["Story still", "liferaft-spring-cleanout-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "liferaft-spring-cleanout-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "max-late-light-feed",
    "max",
    "Late light in the simulator · Portrait feed",
    "Late light in the simulator artwork for MAX.",
    "Late light in the simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "jpg",
    [
      ["Portrait feed", "max-late-light-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "max-late-light-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "woodhouse-summer-shed-feed",
    "woodhouse",
    "The summer shed · Portrait feed",
    "The summer shed artwork for Woodhouse.",
    "The summer shed. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Portrait feed", "woodhouse-summer-shed-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "woodhouse-summer-shed-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "foilbury-keeper-avatar",
    "foilbury",
    "The Cabinet Keeper · Avatar",
    "The Cabinet Keeper artwork for Foilbury.",
    "Meet the little Keeper with the key. Browse the public cabinet.",
    "https://foilbury.loftwah.com/cabinet/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "foilbury-keeper-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "foilbury-keeper-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "bubbles-game-night-square",
    "bubbles",
    "A quick round after dinner · Sketch",
    "A quick round after dinner artwork for Bubbles.",
    "A quick round after dinner. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "bubbles-game-night-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "bubbles-game-night-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-window-story",
    "shoalshot",
    "Through a blue window · Story still",
    "Through a blue window artwork for SHOALSHOT.",
    "Through a blue window. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "seasonal",
    "jpg",
    [
      ["Story still", "shoalshot-reef-window-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "shoalshot-reef-window-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "fighter-cabinet-at-the-coast-story",
    "fighter",
    "Cabinet on the coast · Story still",
    "Cabinet on the coast artwork for Fighter.",
    "Cabinet on the coast. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "seasonal",
    "jpg",
    [
      ["Story still", "fighter-cabinet-at-the-coast-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "fighter-cabinet-at-the-coast-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "protocol-11-summer-deal-square",
    "protocol-11",
    "Deal after dark · Sketch",
    "Deal after dark artwork for Protocol 11.",
    "Deal after dark. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "protocol-11-summer-deal-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "protocol-11-summer-deal-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "app-composer-profile-as-home-square",
    "app-composer",
    "A home for your work · Sketch",
    "A home for your work artwork for App Composer.",
    "A home for your work. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "sketch",
    "jpg",
    [
      ["Square feed", "app-composer-profile-as-home-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "app-composer-profile-as-home-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-winter-frequency-square",
    "loftwahfm",
    "Radio through the rain · Sketch",
    "Radio through the rain artwork for LoftwahFM.",
    "Radio through the rain. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "jpg",
    [
      ["Square feed", "loftwahfm-winter-frequency-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "loftwahfm-winter-frequency-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "liferaft-spring-cleanout-square",
    "liferaft",
    "Old mail, new light · Sketch",
    "Old mail, new light artwork for Liferaft.",
    "Old mail, new light. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "liferaft-spring-cleanout-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "liferaft-spring-cleanout-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-late-light-story",
    "max",
    "Late light in the simulator · Story still",
    "Late light in the simulator artwork for MAX.",
    "Late light in the simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "seasonal",
    "jpg",
    [
      ["Story still", "max-late-light-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "max-late-light-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "woodhouse-summer-shed-story",
    "woodhouse",
    "The summer shed · Story still",
    "The summer shed artwork for Woodhouse.",
    "The summer shed. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "seasonal",
    "jpg",
    [
      ["Story still", "woodhouse-summer-shed-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "woodhouse-summer-shed-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "foilbury-front-and-back-feed",
    "foilbury",
    "Front and back · Sketch",
    "Moss front-cover study artwork for Foilbury.",
    "Take a turn around the card in Foilbury. The cabinet shows the published card and its reverse.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "foilbury-front-and-back-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "foilbury-front-and-back-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "bubbles-game-night-avatar",
    "bubbles",
    "A quick round after dinner · Avatar",
    "A quick round after dinner artwork for Bubbles.",
    "A quick round after dinner. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "bubbles-game-night-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "bubbles-game-night-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-window-square",
    "shoalshot",
    "Through a blue window · Sketch",
    "Through a blue window artwork for SHOALSHOT.",
    "Through a blue window. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "shoalshot-reef-window-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "shoalshot-reef-window-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "fighter-cabinet-at-the-coast-square",
    "fighter",
    "Cabinet on the coast · Sketch",
    "Cabinet on the coast artwork for Fighter.",
    "Cabinet on the coast. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "fighter-cabinet-at-the-coast-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "fighter-cabinet-at-the-coast-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "protocol-11-summer-deal-avatar",
    "protocol-11",
    "Deal after dark · Avatar",
    "Deal after dark artwork for Protocol 11.",
    "Deal after dark. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "protocol-11-summer-deal-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "protocol-11-summer-deal-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "app-composer-profile-as-home-avatar",
    "app-composer",
    "A home for your work · Avatar",
    "A home for your work artwork for App Composer.",
    "A home for your work. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "icon",
    "jpg",
    [
      ["Profile icon", "app-composer-profile-as-home-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "app-composer-profile-as-home-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-winter-frequency-avatar",
    "loftwahfm",
    "Radio through the rain · Avatar",
    "Radio through the rain artwork for LoftwahFM.",
    "Radio through the rain. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "icon",
    "jpg",
    [
      ["Profile icon", "loftwahfm-winter-frequency-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "loftwahfm-winter-frequency-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "liferaft-spring-cleanout-avatar",
    "liferaft",
    "Old mail, new light · Avatar",
    "Old mail, new light artwork for Liferaft.",
    "Old mail, new light. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "liferaft-spring-cleanout-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "liferaft-spring-cleanout-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-late-light-square",
    "max",
    "Late light in the simulator · Sketch",
    "Late light in the simulator artwork for MAX.",
    "Late light in the simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "sketch",
    "jpg",
    [
      ["Square feed", "max-late-light-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "max-late-light-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "woodhouse-summer-shed-square",
    "woodhouse",
    "The summer shed · Sketch",
    "The summer shed artwork for Woodhouse.",
    "The summer shed. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "woodhouse-summer-shed-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "woodhouse-summer-shed-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-front-and-back-sticker",
    "foilbury",
    "Front and back · Sticker",
    "Front and back artwork for Foilbury.",
    "Take a turn around the card in Foilbury. The cabinet shows the published card and its reverse.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "foilbury-front-and-back-sticker.png", 320, 320],
      ["ImageGen original PNG", "foilbury-front-and-back-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-glass-and-print-pin",
    "bubbles",
    "From glass to ink · Pinterest pin",
    "From glass to ink artwork for Bubbles.",
    "From glass to ink. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "bubbles-glass-and-print-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "bubbles-glass-and-print-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "shoalshot-reef-window-avatar",
    "shoalshot",
    "Through a blue window · Avatar",
    "Through a blue window artwork for SHOALSHOT.",
    "Through a blue window. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "shoalshot-reef-window-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "shoalshot-reef-window-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "fighter-cabinet-at-the-coast-avatar",
    "fighter",
    "Cabinet on the coast · Avatar",
    "Cabinet on the coast artwork for Fighter.",
    "Cabinet on the coast. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "fighter-cabinet-at-the-coast-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "fighter-cabinet-at-the-coast-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "protocol-11-draw-or-discard-pin",
    "protocol-11",
    "Draw and discard · Pinterest pin",
    "Draw and discard artwork for Protocol 11.",
    "A draw pile and a discard pile. Pull up a chair at a local Classic table.",
    "https://protocol11.loftwah.com/",
    "Play",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "protocol-11-draw-or-discard-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "protocol-11-draw-or-discard-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "app-composer-pdf-before-after-link",
    "app-composer",
    "Fill, then export · Link preview",
    "Fill, then export artwork for App Composer.",
    "Open a sample PDF, fill a field, add a visual signature and export it in Paperwork.",
    "https://paperwork.loftwah.com/",
    "Try",
    "comparison",
    "jpg",
    [
      ["Link preview", "app-composer-pdf-before-after-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "app-composer-pdf-before-after-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "loftwahfm-analogue-digital-pin",
    "loftwahfm",
    "Tape and cartridge · Pinterest pin",
    "Tape and cartridge artwork for LoftwahFM.",
    "Tape and cartridge. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "loftwahfm-analogue-digital-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "loftwahfm-analogue-digital-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "liferaft-with-and-without-pin",
    "liferaft",
    "Archive and attachment · Pinterest pin",
    "Archive and attachment artwork for Liferaft.",
    "Archive and attachment. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "liferaft-with-and-without-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "liferaft-with-and-without-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "max-late-light-avatar",
    "max",
    "Late light in the simulator · Avatar",
    "Late light in the simulator artwork for MAX.",
    "Late light in the simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "icon",
    "jpg",
    [
      ["Profile icon", "max-late-light-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "max-late-light-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "woodhouse-summer-shed-avatar",
    "woodhouse",
    "The summer shed · Avatar",
    "The summer shed artwork for Woodhouse.",
    "The summer shed. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "woodhouse-summer-shed-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "woodhouse-summer-shed-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-finish-mastery-landscape",
    "foilbury",
    "A shelf worth completing · Landscape",
    "A shelf worth completing artwork for Foilbury.",
    "A shelf worth completing. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "art",
    "jpg",
    [
      ["Landscape", "foilbury-finish-mastery-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "foilbury-finish-mastery-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "bubbles-glass-and-print-link",
    "bubbles",
    "From glass to ink · Link preview",
    "From glass to ink artwork for Bubbles.",
    "From glass to ink. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "comparison",
    "jpg",
    [
      ["Link preview", "bubbles-glass-and-print-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "bubbles-glass-and-print-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "shoalshot-reef-scale-pin",
    "shoalshot",
    "One fish, two views · Pinterest pin",
    "One fish, two views artwork for SHOALSHOT.",
    "One fish, two views. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "shoalshot-reef-scale-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "shoalshot-reef-scale-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "fighter-roster-pair-pin",
    "fighter",
    "Same cabinet, different corners · Pinterest pin",
    "Same cabinet, different corners artwork for Fighter.",
    "Same cabinet, different corners. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "fighter-roster-pair-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "fighter-roster-pair-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "protocol-11-draw-or-discard-link",
    "protocol-11",
    "Draw and discard · Link preview",
    "Draw and discard artwork for Protocol 11.",
    "A draw pile and a discard pile. Pull up a chair at a local Classic table.",
    "https://protocol11.loftwah.com/",
    "Play",
    "comparison",
    "jpg",
    [
      ["Link preview", "protocol-11-draw-or-discard-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "protocol-11-draw-or-discard-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "app-composer-pdf-before-after-feed",
    "app-composer",
    "Fill, then export · Sketch",
    "Fill, then export artwork for App Composer.",
    "Open a sample PDF, fill a field, add a visual signature and export it in Paperwork.",
    "https://paperwork.loftwah.com/",
    "Try",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "app-composer-pdf-before-after-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "app-composer-pdf-before-after-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-analogue-digital-link",
    "loftwahfm",
    "Tape and cartridge · Link preview",
    "Tape and cartridge artwork for LoftwahFM.",
    "Tape and cartridge. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "comparison",
    "jpg",
    [
      ["Link preview", "loftwahfm-analogue-digital-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "loftwahfm-analogue-digital-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "liferaft-with-and-without-link",
    "liferaft",
    "Archive and attachment · Link preview",
    "Archive and attachment artwork for Liferaft.",
    "Archive and attachment. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "comparison",
    "jpg",
    [
      ["Link preview", "liferaft-with-and-without-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "liferaft-with-and-without-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "max-sound-and-space-pin",
    "max",
    "Sound and space · Pinterest pin",
    "Sound and space artwork for MAX.",
    "Sound and space. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "max-sound-and-space-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "max-sound-and-space-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "woodhouse-drawings-to-cards-pin",
    "woodhouse",
    "From drawings to finished art · Pinterest pin",
    "From drawings to finished art artwork for Woodhouse.",
    "From drawings to finished art. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "woodhouse-drawings-to-cards-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "woodhouse-drawings-to-cards-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "foilbury-finish-mastery-x",
    "foilbury",
    "A shelf worth completing · X header",
    "A shelf worth completing artwork for Foilbury.",
    "A shelf worth completing. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "banner",
    "jpg",
    [
      ["X header", "foilbury-finish-mastery-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "foilbury-finish-mastery-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "bubbles-glass-and-print-feed",
    "bubbles",
    "From glass to ink · Sketch",
    "From glass to ink artwork for Bubbles.",
    "From glass to ink. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "bubbles-glass-and-print-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "bubbles-glass-and-print-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "shoalshot-reef-scale-link",
    "shoalshot",
    "One fish, two views · Link preview",
    "One fish, two views artwork for SHOALSHOT.",
    "One fish, two views. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "comparison",
    "jpg",
    [
      ["Link preview", "shoalshot-reef-scale-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "shoalshot-reef-scale-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "fighter-roster-pair-feed",
    "fighter",
    "Same cabinet, different corners · Sketch",
    "Same cabinet, different corners artwork for Fighter.",
    "Same cabinet, different corners. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "fighter-roster-pair-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "fighter-roster-pair-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "protocol-11-draw-or-discard-feed",
    "protocol-11",
    "Draw and discard · Sketch",
    "Draw and discard artwork for Protocol 11.",
    "A draw pile and a discard pile. Pull up a chair at a local Classic table.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "protocol-11-draw-or-discard-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "protocol-11-draw-or-discard-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "app-composer-pdf-before-after-sticker",
    "app-composer",
    "Fill, then export · Sticker",
    "Fill, then export artwork for App Composer.",
    "Open a sample PDF, fill a field, add a visual signature and export it in Paperwork.",
    "https://paperwork.loftwah.com/",
    "Try",
    "special",
    "png",
    [
      ["Discord sticker", "app-composer-pdf-before-after-sticker.png", 320, 320],
      ["ImageGen original PNG", "app-composer-pdf-before-after-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-analogue-digital-feed",
    "loftwahfm",
    "Tape and cartridge · Sketch",
    "Tape and cartridge artwork for LoftwahFM.",
    "Tape and cartridge. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-analogue-digital-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "loftwahfm-analogue-digital-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "liferaft-with-and-without-feed",
    "liferaft",
    "Archive and attachment · Sketch",
    "Archive and attachment artwork for Liferaft.",
    "Archive and attachment. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "liferaft-with-and-without-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "liferaft-with-and-without-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "max-sound-and-space-link",
    "max",
    "Sound and space · Link preview",
    "Sound and space artwork for MAX.",
    "Sound and space. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "comparison",
    "jpg",
    [
      ["Link preview", "max-sound-and-space-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "max-sound-and-space-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "woodhouse-drawings-to-cards-link",
    "woodhouse",
    "From drawings to finished art · Link preview",
    "From drawings to finished art artwork for Woodhouse.",
    "From drawings to finished art. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "comparison",
    "jpg",
    [
      ["Link preview", "woodhouse-drawings-to-cards-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "woodhouse-drawings-to-cards-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "foilbury-finish-mastery-square",
    "foilbury",
    "A shelf worth completing · Sketch",
    "A shelf worth completing artwork for Foilbury.",
    "A shelf worth completing. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "foilbury-finish-mastery-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "foilbury-finish-mastery-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "bubbles-glass-and-print-sticker",
    "bubbles",
    "From glass to ink · Sticker",
    "From glass to ink artwork for Bubbles.",
    "From glass to ink. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "bubbles-glass-and-print-sticker.png", 320, 320],
      ["ImageGen original PNG", "bubbles-glass-and-print-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-scale-feed",
    "shoalshot",
    "One fish, two views · Sketch",
    "One fish, two views artwork for SHOALSHOT.",
    "One fish, two views. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "shoalshot-reef-scale-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "shoalshot-reef-scale-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "fighter-roster-pair-sticker",
    "fighter",
    "Same cabinet, different corners · Sticker",
    "Same cabinet, different corners artwork for Fighter.",
    "Same cabinet, different corners. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "fighter-roster-pair-sticker.png", 320, 320],
      ["ImageGen original PNG", "fighter-roster-pair-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-draw-or-discard-sticker",
    "protocol-11",
    "Draw and discard · Sticker",
    "Draw and discard artwork for Protocol 11.",
    "A draw pile and a discard pile. Pull up a chair at a local Classic table.",
    "https://protocol11.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "protocol-11-draw-or-discard-sticker.png", 320, 320],
      ["ImageGen original PNG", "protocol-11-draw-or-discard-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-portable-home-landscape",
    "app-composer",
    "Your little corner · Landscape",
    "Your little corner artwork for App Composer.",
    "Your little corner. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "art",
    "jpg",
    [
      ["Landscape", "app-composer-portable-home-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "app-composer-portable-home-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "loftwahfm-analogue-digital-sticker",
    "loftwahfm",
    "Tape and cartridge · Sticker",
    "Tape and cartridge artwork for LoftwahFM.",
    "Tape and cartridge. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "special",
    "png",
    [
      ["Discord sticker", "loftwahfm-analogue-digital-sticker.png", 320, 320],
      ["ImageGen original PNG", "loftwahfm-analogue-digital-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-with-and-without-sticker",
    "liferaft",
    "Archive and attachment · Sticker",
    "Archive and attachment artwork for Liferaft.",
    "Archive and attachment. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "liferaft-with-and-without-sticker.png", 320, 320],
      ["ImageGen original PNG", "liferaft-with-and-without-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "max-sound-and-space-feed",
    "max",
    "Sound and space · Sketch",
    "Sound and space artwork for MAX.",
    "Sound and space. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "max-sound-and-space-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "max-sound-and-space-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "woodhouse-drawings-to-cards-feed",
    "woodhouse",
    "From drawings to finished art · Sketch",
    "From drawings to finished art artwork for Woodhouse.",
    "From drawings to finished art. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "woodhouse-drawings-to-cards-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "woodhouse-drawings-to-cards-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "foilbury-finish-mastery-avatar",
    "foilbury",
    "A shelf worth completing · Avatar",
    "A shelf worth completing artwork for Foilbury.",
    "A shelf worth completing. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "foilbury-finish-mastery-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "foilbury-finish-mastery-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "bubbles-cabinet-mini-landscape",
    "bubbles",
    "A little arcade world · Landscape",
    "A little arcade world artwork for Bubbles.",
    "A little arcade world. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Landscape", "bubbles-cabinet-mini-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "bubbles-cabinet-mini-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "shoalshot-reef-scale-sticker",
    "shoalshot",
    "One fish, two views · Sticker",
    "One fish, two views artwork for SHOALSHOT.",
    "One fish, two views. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "special",
    "png",
    [
      ["Discord sticker", "shoalshot-reef-scale-sticker.png", 320, 320],
      ["ImageGen original PNG", "shoalshot-reef-scale-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-fighter-bench-landscape",
    "fighter",
    "Work behind the cabinet · Landscape",
    "Work behind the cabinet artwork for Fighter.",
    "Work behind the cabinet. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Landscape", "fighter-fighter-bench-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "fighter-fighter-bench-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "protocol-11-felt-surface-landscape",
    "protocol-11",
    "Felt, paper, lacquer · Landscape",
    "Felt, paper, lacquer artwork for Protocol 11.",
    "Felt, paper, lacquer. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Landscape", "protocol-11-felt-surface-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "protocol-11-felt-surface-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "app-composer-portable-home-x",
    "app-composer",
    "Your little corner · X header",
    "Your little corner artwork for App Composer.",
    "Your little corner. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "banner",
    "jpg",
    [
      ["X header", "app-composer-portable-home-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "app-composer-portable-home-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "loftwahfm-sound-object-landscape",
    "loftwahfm",
    "A dial that stays on · Landscape",
    "A dial that stays on artwork for LoftwahFM.",
    "A dial that stays on. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "art",
    "jpg",
    [
      ["Landscape", "loftwahfm-sound-object-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "loftwahfm-sound-object-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "liferaft-box-and-buoy-landscape",
    "liferaft",
    "The mailroom buoy · Landscape",
    "The mailroom buoy artwork for Liferaft.",
    "The mailroom buoy. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Landscape", "liferaft-box-and-buoy-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "liferaft-box-and-buoy-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "max-sound-and-space-sticker",
    "max",
    "Sound and space · Sticker",
    "Sound and space artwork for MAX.",
    "Sound and space. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "special",
    "png",
    [
      ["Discord sticker", "max-sound-and-space-sticker.png", 320, 320],
      ["ImageGen original PNG", "max-sound-and-space-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-drawings-to-cards-sticker",
    "woodhouse",
    "From drawings to finished art · Sticker",
    "From drawings to finished art artwork for Woodhouse.",
    "From drawings to finished art. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "woodhouse-drawings-to-cards-sticker.png", 320, 320],
      ["ImageGen original PNG", "woodhouse-drawings-to-cards-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-gabe-shelf-pin",
    "foilbury",
    "Gabe on the shelf · Pinterest pin",
    "Gabe on the shelf artwork for Foilbury.",
    "Gabe on the shelf. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/gabe",
    "Explore",
    "art",
    "jpg",
    [
      ["Pinterest pin", "foilbury-gabe-shelf-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "foilbury-gabe-shelf-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "bubbles-cabinet-mini-x",
    "bubbles",
    "A little arcade world · X header",
    "A little arcade world artwork for Bubbles.",
    "A little arcade world. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["X header", "bubbles-cabinet-mini-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "bubbles-cabinet-mini-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "shoalshot-reef-after-dark-landscape",
    "shoalshot",
    "Last light under water · Landscape",
    "Last light under water artwork for SHOALSHOT.",
    "Last light under water. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "jpg",
    [
      ["Landscape", "shoalshot-reef-after-dark-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "shoalshot-reef-after-dark-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "fighter-fighter-bench-x",
    "fighter",
    "Work behind the cabinet · X header",
    "Work behind the cabinet artwork for Fighter.",
    "Work behind the cabinet. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["X header", "fighter-fighter-bench-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "fighter-fighter-bench-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "protocol-11-felt-surface-x",
    "protocol-11",
    "Felt, paper, lacquer · X header",
    "Felt, paper, lacquer artwork for Protocol 11.",
    "Felt, paper, lacquer. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["X header", "protocol-11-felt-surface-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "protocol-11-felt-surface-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "app-composer-portable-home-square",
    "app-composer",
    "Your little corner · Sketch",
    "Your little corner artwork for App Composer.",
    "Your little corner. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "sketch",
    "jpg",
    [
      ["Square feed", "app-composer-portable-home-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "app-composer-portable-home-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-sound-object-x",
    "loftwahfm",
    "A dial that stays on · X header",
    "A dial that stays on artwork for LoftwahFM.",
    "A dial that stays on. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "banner",
    "jpg",
    [
      ["X header", "loftwahfm-sound-object-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "loftwahfm-sound-object-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "liferaft-box-and-buoy-x",
    "liferaft",
    "The mailroom buoy · X header",
    "The mailroom buoy artwork for Liferaft.",
    "The mailroom buoy. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "banner",
    "jpg",
    [
      ["X header", "liferaft-box-and-buoy-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "liferaft-box-and-buoy-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "max-amber-material-landscape",
    "max",
    "Amber material study · Landscape",
    "Amber material study artwork for MAX.",
    "Amber material study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "jpg",
    [
      ["Landscape", "max-amber-material-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "max-amber-material-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "woodhouse-public-work-landscape",
    "woodhouse",
    "Open the workshop · Landscape",
    "Open the workshop artwork for Woodhouse.",
    "Open the workshop. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "art",
    "jpg",
    [
      ["Landscape", "woodhouse-public-work-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "woodhouse-public-work-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "foilbury-gabe-shelf-story",
    "foilbury",
    "Gabe on the shelf · Story still",
    "Gabe on the shelf artwork for Foilbury.",
    "Gabe on the shelf. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/gabe",
    "Explore",
    "feature",
    "jpg",
    [
      ["Story still", "foilbury-gabe-shelf-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "foilbury-gabe-shelf-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "bubbles-cabinet-mini-square",
    "bubbles",
    "A little arcade world · Sketch",
    "A little arcade world artwork for Bubbles.",
    "A little arcade world. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "bubbles-cabinet-mini-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "bubbles-cabinet-mini-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-after-dark-x",
    "shoalshot",
    "Last light under water · X header",
    "Last light under water artwork for SHOALSHOT.",
    "Last light under water. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "banner",
    "jpg",
    [
      ["X header", "shoalshot-reef-after-dark-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "shoalshot-reef-after-dark-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "fighter-fighter-bench-square",
    "fighter",
    "Work behind the cabinet · Sketch",
    "Work behind the cabinet artwork for Fighter.",
    "Work behind the cabinet. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "fighter-fighter-bench-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "fighter-fighter-bench-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "protocol-11-felt-surface-square",
    "protocol-11",
    "Felt, paper, lacquer · Sketch",
    "Felt, paper, lacquer artwork for Protocol 11.",
    "Felt, paper, lacquer. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "protocol-11-felt-surface-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "protocol-11-felt-surface-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "app-composer-portable-home-avatar",
    "app-composer",
    "Your little corner · Avatar",
    "Your little corner artwork for App Composer.",
    "Your little corner. Open the sample Creator Hub and see how a links page and guestbook work together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "icon",
    "jpg",
    [
      ["Profile icon", "app-composer-portable-home-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "app-composer-portable-home-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-sound-object-square",
    "loftwahfm",
    "A dial that stays on · Sketch",
    "A dial that stays on artwork for LoftwahFM.",
    "A dial that stays on. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "jpg",
    [
      ["Square feed", "loftwahfm-sound-object-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "loftwahfm-sound-object-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "liferaft-box-and-buoy-square",
    "liferaft",
    "The mailroom buoy · Sketch",
    "The mailroom buoy artwork for Liferaft.",
    "The mailroom buoy. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "liferaft-box-and-buoy-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "liferaft-box-and-buoy-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-amber-material-x",
    "max",
    "Amber material study · X header",
    "Amber material study artwork for MAX.",
    "Amber material study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "banner",
    "jpg",
    [
      ["X header", "max-amber-material-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "max-amber-material-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "woodhouse-public-work-x",
    "woodhouse",
    "Open the workshop · X header",
    "Open the workshop artwork for Woodhouse.",
    "Open the workshop. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "banner",
    "jpg",
    [
      ["X header", "woodhouse-public-work-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "woodhouse-public-work-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "foilbury-gabe-shelf-feed",
    "foilbury",
    "Gabe on the shelf · Sketch",
    "Gabe on the shelf artwork for Foilbury.",
    "Gabe on the shelf. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/gabe",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "foilbury-gabe-shelf-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "foilbury-gabe-shelf-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "bubbles-cabinet-mini-avatar",
    "bubbles",
    "A little arcade world · Avatar",
    "A little arcade world artwork for Bubbles.",
    "A little arcade world. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "bubbles-cabinet-mini-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "bubbles-cabinet-mini-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-after-dark-square",
    "shoalshot",
    "Last light under water · Sketch",
    "Last light under water artwork for SHOALSHOT.",
    "Last light under water. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "jpg",
    [
      ["Square feed", "shoalshot-reef-after-dark-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "shoalshot-reef-after-dark-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "fighter-fighter-bench-avatar",
    "fighter",
    "Work behind the cabinet · Avatar",
    "Work behind the cabinet artwork for Fighter.",
    "Work behind the cabinet. Open Battle Blast in Fighter and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "fighter-fighter-bench-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "fighter-fighter-bench-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "protocol-11-felt-surface-avatar",
    "protocol-11",
    "Felt, paper, lacquer · Avatar",
    "Felt, paper, lacquer artwork for Protocol 11.",
    "Felt, paper, lacquer. Play a local hand at the Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "protocol-11-felt-surface-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "protocol-11-felt-surface-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-sound-object-avatar",
    "loftwahfm",
    "A dial that stays on · Avatar",
    "A dial that stays on artwork for LoftwahFM.",
    "A dial that stays on. Tune to Cartridge Club for game-inspired music on LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "icon",
    "jpg",
    [
      ["Profile icon", "loftwahfm-sound-object-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "loftwahfm-sound-object-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "liferaft-box-and-buoy-avatar",
    "liferaft",
    "The mailroom buoy · Avatar",
    "The mailroom buoy artwork for Liferaft.",
    "The mailroom buoy. Search a local MBOX archive and export the attachment you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "liferaft-box-and-buoy-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "liferaft-box-and-buoy-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-amber-material-square",
    "max",
    "Amber material study · Sketch",
    "Amber material study artwork for MAX.",
    "Amber material study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "sketch",
    "jpg",
    [
      ["Square feed", "max-amber-material-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "max-amber-material-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "woodhouse-public-work-square",
    "woodhouse",
    "Open the workshop · Sketch",
    "Open the workshop artwork for Woodhouse.",
    "Open the workshop. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "woodhouse-public-work-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "woodhouse-public-work-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-gabe-shelf-sticker",
    "foilbury",
    "Gabe on the shelf · Sticker",
    "Gabe on the shelf artwork for Foilbury.",
    "Gabe on the shelf. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/gabe",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "foilbury-gabe-shelf-sticker.png", 320, 320],
      ["ImageGen original PNG", "foilbury-gabe-shelf-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-after-dark-avatar",
    "shoalshot",
    "Last light under water · Avatar",
    "Last light under water artwork for SHOALSHOT.",
    "Last light under water. Take a browser dive and look for the Glimmerfin in SHOALSHOT’s Tide Pool.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "icon",
    "jpg",
    [
      ["Profile icon", "shoalshot-reef-after-dark-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "shoalshot-reef-after-dark-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "max-amber-material-avatar",
    "max",
    "Amber material study · Avatar",
    "Amber material study artwork for MAX.",
    "Amber material study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "icon",
    "jpg",
    [
      ["Profile icon", "max-amber-material-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "max-amber-material-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "woodhouse-public-work-avatar",
    "woodhouse",
    "Open the workshop · Avatar",
    "Open the workshop artwork for Woodhouse.",
    "Open the workshop. Browse the games, music, tools and artwork from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "woodhouse-public-work-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "woodhouse-public-work-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-nora-envelope-landscape",
    "foilbury",
    "Nora in the cabinet · Landscape",
    "Nora in the cabinet artwork for Foilbury.",
    "Nora in the cabinet. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    "feature",
    "jpg",
    [
      ["Landscape", "foilbury-nora-envelope-landscape.jpg", 1600, 900],
      ["ImageGen original JPEG", "foilbury-nora-envelope-landscape-original.jpg", 1536, 864]
    ]
  ],
  [
    "foilbury-nora-envelope-link",
    "foilbury",
    "Nora in the cabinet · Link preview",
    "Nora in the cabinet artwork for Foilbury.",
    "Nora in the cabinet. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    "feature",
    "jpg",
    [
      ["Link preview", "foilbury-nora-envelope-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "foilbury-nora-envelope-link-original.jpg", 1216, 640]
    ]
  ],
  [
    "foilbury-nora-envelope-square",
    "foilbury",
    "Nora in the cabinet · Sketch",
    "Nora in the cabinet artwork for Foilbury.",
    "Nora in the cabinet. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "foilbury-nora-envelope-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "foilbury-nora-envelope-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-nora-envelope-avatar",
    "foilbury",
    "Nora in the cabinet · Avatar",
    "Nora in the cabinet artwork for Foilbury.",
    "Nora in the cabinet. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "foilbury-nora-envelope-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "foilbury-nora-envelope-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-pippa-print-pin",
    "foilbury",
    "Pippa in print · Pinterest pin",
    "Pippa in print artwork for Foilbury.",
    "Pippa in print. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    "art",
    "jpg",
    [
      ["Pinterest pin", "foilbury-pippa-print-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "foilbury-pippa-print-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "foilbury-pippa-print-x",
    "foilbury",
    "Pippa in print · X header",
    "Pippa in print artwork for Foilbury.",
    "Pippa in print. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    "banner",
    "jpg",
    [
      ["X header", "foilbury-pippa-print-x.jpg", 1500, 500],
      ["ImageGen original JPEG", "foilbury-pippa-print-x-original.jpg", 1536, 512]
    ]
  ],
  [
    "foilbury-pippa-print-feed",
    "foilbury",
    "Pippa in print · Sketch",
    "Pippa in print artwork for Foilbury.",
    "Pippa in print. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Portrait feed", "foilbury-pippa-print-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "foilbury-pippa-print-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "foilbury-pippa-print-sticker",
    "foilbury",
    "Pippa in print · Sticker",
    "Pippa in print artwork for Foilbury.",
    "Pippa in print. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    "special",
    "png",
    [
      ["Discord sticker", "foilbury-pippa-print-sticker.png", 320, 320],
      ["ImageGen original PNG", "foilbury-pippa-print-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-rhea-studio-story",
    "foilbury",
    "Rhea in the cabinet · Story still",
    "Rhea in the cabinet artwork for Foilbury.",
    "Rhea in the cabinet. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    "art",
    "jpg",
    [
      ["Story still", "foilbury-rhea-studio-story.jpg", 1080, 1920],
      ["ImageGen original JPEG", "foilbury-rhea-studio-story-original.jpg", 1008, 1792]
    ]
  ],
  [
    "foilbury-rhea-studio-discord",
    "foilbury",
    "Rhea in the cabinet · Discord banner",
    "Rhea in the cabinet artwork for Foilbury.",
    "Rhea in the cabinet. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    "banner",
    "jpg",
    [
      ["Discord banner", "foilbury-rhea-studio-discord.jpg", 1920, 1080],
      ["ImageGen original JPEG", "foilbury-rhea-studio-discord-original.jpg", 1536, 864]
    ]
  ],
  [
    "foilbury-rhea-studio-square",
    "foilbury",
    "Rhea in the cabinet · Sketch",
    "Rhea in the cabinet artwork for Foilbury.",
    "Rhea in the cabinet. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    "sketch",
    "jpg",
    [
      ["Square feed", "foilbury-rhea-studio-square.jpg", 1080, 1080],
      ["ImageGen original JPEG", "foilbury-rhea-studio-square-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-rhea-studio-avatar",
    "foilbury",
    "Rhea in the cabinet · Avatar",
    "Rhea in the cabinet artwork for Foilbury.",
    "Rhea in the cabinet. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    "icon",
    "jpg",
    [
      ["Profile icon", "foilbury-rhea-studio-avatar.jpg", 512, 512],
      ["ImageGen original JPEG", "foilbury-rhea-studio-avatar-original.jpg", 1024, 1024]
    ]
  ],
  [
    "foilbury-real-finish-plain-diamond-feed",
    "foilbury",
    "Moss in Plain and Diamond",
    "Moss in Plain and Diamond artwork for Foilbury.",
    "Moss in Plain and Diamond. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "comparison",
    "jpg",
    [
      ["Portrait feed", "foilbury-real-finish-plain-diamond-feed.jpg", 1080, 1350],
      ["ImageGen original JPEG", "foilbury-real-finish-plain-diamond-feed-original.jpg", 1024, 1280]
    ]
  ],
  [
    "foilbury-real-finish-silver-gold-pin",
    "foilbury",
    "Moss in Silver and Gold",
    "Moss in Silver and Gold artwork for Foilbury.",
    "Moss in Silver and Gold. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "comparison",
    "jpg",
    [
      ["Pinterest pin", "foilbury-real-finish-silver-gold-pin.jpg", 1000, 1500],
      ["ImageGen original JPEG", "foilbury-real-finish-silver-gold-pin-original.jpg", 1024, 1536]
    ]
  ],
  [
    "foilbury-real-finish-silver-gold-link",
    "foilbury",
    "Moss in Silver and Gold",
    "Moss in Silver and Gold artwork for Foilbury.",
    "Moss in Silver and Gold. Explore the published cards and their current finishes in Foilbury.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "comparison",
    "jpg",
    [
      ["Link preview", "foilbury-real-finish-silver-gold-link.jpg", 1200, 630],
      ["ImageGen original JPEG", "foilbury-real-finish-silver-gold-link-original.jpg", 1216, 640]
    ]
  ]
] as const;

export const shareExpansion: CampaignItem[] = art.map(
  ([id, project, title, alt, caption, href, action, use, ext, files]) => {
    const [, file, width, height] = files[0];
    return {
      id: `share-edition-${id}`,
      project,
      title,
      alt,
      href,
      action,
      use,
      credit: "Woodhouse · GPT Image 2.6 via Fal",
      caption: `${caption}\n${href}`,
      original: `${base}/${file}`,
      image: `${base}/${id}-preview.${ext}`,
      thumbnail: `${base}/${id}-thumb.${ext}`,
      width,
      height,
      kind: "editorial composition",
      reviewedAt: "2026-11-13",
      addedAt: "2026-11-12T16:10:47Z",
      source: `${base}/sources.txt`,
      ...(art.find((row) => row[1] === project)?.[0] === id
        ? { socialPack: `${base}/${project}-expansion-kit.zip` }
        : {}),
      formats: files.map(([label, file, width, height]) => ({
        label,
        image: `${base}/${file}`,
        width,
        height
      }))
    };
  }
);
