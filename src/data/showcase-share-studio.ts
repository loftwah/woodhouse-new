import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-share-studio";
const art = [
  [
    "bubbles-match-three",
    "bubbles",
    "Match three",
    "Match three artwork for Bubbles.",
    "Three of a kind and a clean shot. Open Bubbles Classic and clear the first board.",
    "https://bubbles.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "bubbles-match-three.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-match-three-original.png", 1122, 1402]
    ]
  ],
  [
    "foilbury-foil-streak",
    "foilbury",
    "Prismatic pocket badge",
    "Prismatic pocket badge in ink for Foilbury.",
    "Prismatic pocket badge. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "foilbury-foil-streak.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-foil-streak-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-gill-study",
    "shoalshot",
    "Glimmerfin in pencil",
    "Glimmerfin in pencil artwork for SHOALSHOT.",
    "Glimmerfin in pencil. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "shoalshot-gill-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-gill-study-original.png", 1024, 1280]
    ]
  ],
  [
    "composer-paperwork",
    "app-composer",
    "Fill and sign a PDF",
    "Fill and sign a PDF artwork for App Composer.",
    "Open a fictional PDF sample, fill a field, draw a visual signature and export it from Paperwork.",
    "https://paperwork.loftwah.com/",
    "Try",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "composer-paperwork.jpg", 1080, 1350],
      ["ImageGen original PNG", "composer-paperwork-original.png", 1122, 1402]
    ]
  ],
  [
    "fighter-tale-of-tape",
    "fighter",
    "Viking vs Reaper",
    "Viking vs Reaper in ink for Fighter.",
    "Viking and Grim Reaper meet in Battle Blast. Open the tutorial and pick your first move.",
    "https://fighter.loftwah.com/",
    "Play",
    "comparison",
    "Built-in Codex ImageGen",
    "jpg",
    [
      ["Landscape", "fighter-tale-of-tape.jpg", 1600, 900],
      ["ImageGen original PNG", "fighter-tale-of-tape-original.png", 1672, 941]
    ]
  ],
  [
    "liferaft-open-archive",
    "liferaft",
    "Find the attachment",
    "Find the attachment artwork for Liferaft.",
    "Open an old MBOX on your computer and find the attachment you kept. Liferaft searches it locally.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "feature",
    "Built-in Codex ImageGen",
    "jpg",
    [
      ["Portrait feed", "liferaft-open-archive.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-open-archive-original.png", 1122, 1402]
    ]
  ],
  [
    "woodhouse-paper-machine",
    "woodhouse",
    "Paper machine",
    "Paper machine artwork for Woodhouse.",
    "Paper machine. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "woodhouse-paper-machine.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-paper-machine-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol11-last-card",
    "protocol-11",
    "One card left",
    "One card left artwork for Protocol 11.",
    "One card left. A local Classic table is ready in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "protocol11-last-card.jpg", 1080, 1920],
      ["ImageGen original PNG", "protocol11-last-card-original.png", 941, 1672]
    ]
  ],
  [
    "loftwahfm-night-signal",
    "loftwahfm",
    "Night Signal",
    "Night Signal artwork for LoftwahFM.",
    "Put Night Signal on for the late shift. The station opens directly in LoftwahFM.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "loftwahfm-night-signal.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-night-signal-original.png", 941, 1672]
    ]
  ],
  [
    "max-locator-comparison",
    "max",
    "Locator idle and active",
    "Locator idle and active artwork for MAX.",
    "Open the public MAX browser simulator. Compare the room before and after triggering the locator sound.",
    "https://max.loftwah.com/demo",
    "Try",
    "comparison",
    "Built-in Codex ImageGen",
    "jpg",
    [
      ["Portrait feed", "max-locator-comparison.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-locator-comparison-original.png", 1122, 1402]
    ]
  ],
  [
    "foilbury-sticker-moss",
    "foilbury",
    "Moss with lantern",
    "Moss with lantern in enamel for Foilbury.",
    "Moss with lantern. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "foilbury-sticker-moss.png", 320, 320],
      ["ImageGen original PNG", "foilbury-sticker-moss-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-wall-sketch",
    "bubbles",
    "Wall bounce in pencil",
    "Wall bounce in pencil in pencil for Bubbles.",
    "Wall bounce in pencil. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "bubbles-wall-sketch.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-wall-sketch-original.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-cabinet-xtreme",
    "bubbles",
    "Cabinet after dark",
    "Cabinet after dark in screenprint for Bubbles.",
    "Cabinet after dark. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "banner",
    "Built-in Codex ImageGen",
    "jpg",
    [
      ["X header", "bubbles-cabinet-xtreme.jpg", 1500, 500],
      ["ImageGen original PNG", "bubbles-cabinet-xtreme-original.png", 2172, 724]
    ]
  ],
  [
    "shoalshot-coast-header",
    "shoalshot",
    "Where the tide turns",
    "Where the tide turns in risograph for SHOALSHOT.",
    "Where the tide turns. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "shoalshot-coast-header.jpg", 1500, 500],
      ["ImageGen original PNG", "shoalshot-coast-header-original.png", 2172, 724]
    ]
  ],
  [
    "foilbury-cabinet-banner",
    "foilbury",
    "The cabinet shelf",
    "The cabinet shelf artwork for Foilbury.",
    "The cabinet shelf. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "foilbury-cabinet-banner.jpg", 1500, 500],
      ["ImageGen original PNG", "foilbury-cabinet-banner-original.png", 2172, 724]
    ]
  ],
  [
    "fighter-arcade-banner",
    "fighter",
    "The arcade lineup",
    "The arcade lineup in woodcut for Fighter.",
    "The arcade lineup. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "fighter-arcade-banner.jpg", 1500, 500],
      ["ImageGen original PNG", "fighter-arcade-banner-original.png", 2172, 724]
    ]
  ],
  [
    "protocol11-felt-header",
    "protocol-11",
    "Pull up a chair",
    "Pull up a chair artwork for Protocol 11.",
    "Pull up a chair. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "protocol11-felt-header.jpg", 1500, 500],
      ["ImageGen original PNG", "protocol11-felt-header-original.png", 2172, 724]
    ]
  ],
  [
    "composer-hub-banner",
    "app-composer",
    "A place for your work",
    "A place for your work in ink for App Composer.",
    "A place for your work. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "composer-hub-banner.jpg", 1500, 500],
      ["ImageGen original PNG", "composer-hub-banner-original.png", 2172, 724]
    ]
  ],
  [
    "loftwahfm-summer-radio",
    "loftwahfm",
    "Radio on the veranda",
    "Radio on the veranda artwork for LoftwahFM.",
    "Radio on the veranda. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "seasonal",
    "Built-in Codex ImageGen",
    "jpg",
    [
      ["Landscape", "loftwahfm-summer-radio.jpg", 1600, 900],
      ["ImageGen original PNG", "loftwahfm-summer-radio-original.png", 1672, 941]
    ]
  ],
  [
    "liferaft-archive-header",
    "liferaft",
    "Search the archive",
    "Search the archive artwork for Liferaft.",
    "Search the archive. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "liferaft-archive-header.jpg", 1500, 500],
      ["ImageGen original PNG", "liferaft-archive-header-original.png", 2172, 724]
    ]
  ],
  [
    "max-sim-banner",
    "max",
    "Find MAX header",
    "Find MAX header artwork for MAX.",
    "Find MAX header. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "max-sim-banner.jpg", 1500, 500],
      ["ImageGen original PNG", "max-sim-banner-original.png", 2172, 724]
    ]
  ],
  [
    "woodhouse-factory-header",
    "woodhouse",
    "Workshop sign",
    "Workshop sign in letterpress for Woodhouse.",
    "Workshop sign. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "woodhouse-factory-header.jpg", 1500, 500],
      ["ImageGen original PNG", "woodhouse-factory-header-original.png", 2172, 724]
    ]
  ],
  [
    "bubbles-fizz-ceramic",
    "bubbles",
    "Porcelain Fizz",
    "Porcelain Fizz artwork for Bubbles.",
    "Porcelain Fizz. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "bubbles-fizz-ceramic.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-fizz-ceramic-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-glimmerfin-icon",
    "shoalshot",
    "Glimmerfin avatar",
    "Glimmerfin avatar artwork for SHOALSHOT.",
    "Glimmerfin avatar. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "shoalshot-glimmerfin-icon.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-glimmerfin-icon-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-lantern-avatar",
    "foilbury",
    "Lantern keeper",
    "Lantern keeper in enamel for Foilbury.",
    "Lantern keeper. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "foilbury-lantern-avatar.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-lantern-avatar-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-viking-avatar",
    "fighter",
    "Viking avatar",
    "Viking avatar in enamel for Fighter.",
    "Viking avatar. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "fighter-viking-avatar.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-viking-avatar-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol11-card-fan",
    "protocol-11",
    "Classic cards avatar",
    "Three ivory cards sit inside a thin gold circle on green felt.",
    "Classic cards avatar. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "protocol11-card-fan.jpg", 512, 512],
      ["ImageGen original PNG", "protocol11-card-fan-original.png", 1024, 1024]
    ]
  ],
  [
    "composer-guestbook-icon",
    "app-composer",
    "Guestbook icon",
    "Guestbook icon in ink for App Composer.",
    "Guestbook icon. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "icon",
    "Built-in Codex ImageGen",
    "jpg",
    [
      ["Profile icon", "composer-guestbook-icon.jpg", 512, 512],
      ["ImageGen original PNG", "composer-guestbook-icon-original.png", 1254, 1254]
    ]
  ],
  [
    "loftwahfm-fm-icon",
    "loftwahfm",
    "Radio dial avatar",
    "Radio dial avatar artwork for LoftwahFM.",
    "Radio dial avatar. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "loftwahfm-fm-icon.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-fm-icon-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-buoy-avatar",
    "liferaft",
    "Lifebuoy avatar",
    "Lifebuoy avatar artwork for Liferaft.",
    "Lifebuoy avatar. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "liferaft-buoy-avatar.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-buoy-avatar-original.png", 1024, 1024]
    ]
  ],
  [
    "max-pulse-icon",
    "max",
    "Locator pulse avatar",
    "Locator pulse avatar in enamel for MAX.",
    "Locator pulse avatar. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "max-pulse-icon.jpg", 512, 512],
      ["ImageGen original PNG", "max-pulse-icon-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-workshop-avatar",
    "woodhouse",
    "Workshop avatar",
    "Workshop avatar in ink for Woodhouse.",
    "Workshop avatar. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "icon",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "woodhouse-workshop-avatar.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-workshop-avatar-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-first-spark-token",
    "bubbles",
    "First Spark token",
    "First Spark token in enamel for Bubbles.",
    "A little spark from Bubbles’ puzzle cabinet. Try First Spark in your browser.",
    "https://bubbles.loftwah.com/puzzle",
    "Play",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "bubbles-first-spark-token.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-first-spark-token-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-specimen-stamp",
    "shoalshot",
    "Glimmerfin specimen stamp",
    "Glimmerfin specimen stamp artwork for SHOALSHOT.",
    "Glimmerfin specimen stamp. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "shoalshot-specimen-stamp.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-specimen-stamp-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-moss-seal",
    "foilbury",
    "Moss wax seal",
    "Moss wax seal artwork for Foilbury.",
    "Moss wax seal. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "foilbury-moss-seal.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-moss-seal-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-reaper-avatar",
    "fighter",
    "Reaper patch",
    "Reaper patch in charcoal for Fighter.",
    "Reaper patch. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "fighter-reaper-avatar.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-reaper-avatar-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol11-table-token",
    "protocol-11",
    "Classic table token",
    "Classic table token artwork for Protocol 11.",
    "Classic table token. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "protocol11-table-token.jpg", 512, 512],
      ["ImageGen original PNG", "protocol11-table-token-original.png", 1024, 1024]
    ]
  ],
  [
    "composer-link-chain",
    "app-composer",
    "Linkarooie charm",
    "Linkarooie charm in ink for App Composer.",
    "Linkarooie charm. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "composer-link-chain.jpg", 512, 512],
      ["ImageGen original PNG", "composer-link-chain-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-cartridge-pin",
    "loftwahfm",
    "Cartridge Club pin",
    "Cartridge Club pin artwork for LoftwahFM.",
    "Cartridge Club pin. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "loftwahfm-cartridge-pin.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-cartridge-pin-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-attachment-pin",
    "liferaft",
    "Attachment rescue pin",
    "Attachment rescue pin in enamel for Liferaft.",
    "Attachment rescue pin. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "liferaft-attachment-pin.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-attachment-pin-original.png", 1024, 1024]
    ]
  ],
  [
    "max-locator-patch",
    "max",
    "Locator patch",
    "Locator patch artwork for MAX.",
    "Locator patch. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "max-locator-patch.jpg", 512, 512],
      ["ImageGen original PNG", "max-locator-patch-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-loom-pin",
    "woodhouse",
    "Loom pin",
    "Loom pin in enamel for Woodhouse.",
    "Loom pin. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Profile icon", "woodhouse-loom-pin.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-loom-pin-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-fizz-heatwave",
    "bubbles",
    "Fizz in the heat",
    "Fizz in the heat in ink for Bubbles.",
    "Fizz in the heat. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "seasonal",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "bubbles-fizz-heatwave.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-fizz-heatwave-original.png", 1122, 1402]
    ]
  ],
  [
    "shoalshot-solstice",
    "shoalshot",
    "Summer in the Tide Pool",
    "Summer in the Tide Pool in enamel for SHOALSHOT.",
    "Summer in the Tide Pool. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "seasonal",
    "Built-in Codex ImageGen",
    "jpg",
    [
      ["Story still", "shoalshot-solstice.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-solstice-original.png", 941, 1672]
    ]
  ],
  [
    "foilbury-summer-fair",
    "foilbury",
    "Summer cabinet fair",
    "Summer cabinet fair artwork for Foilbury.",
    "Summer cabinet fair. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "seasonal",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "foilbury-summer-fair.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-summer-fair-original.png", 1122, 1402]
    ]
  ],
  [
    "fighter-summer-arcade",
    "fighter",
    "Summer at the cabinet",
    "Summer at the cabinet in pencil for Fighter.",
    "Summer at the cabinet. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "seasonal",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "fighter-summer-arcade.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-summer-arcade-original.png", 1122, 1402]
    ]
  ],
  [
    "protocol11-summer-table",
    "protocol-11",
    "Summer card night",
    "Summer card night in photograph for Protocol 11.",
    "Summer card night. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "seasonal",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "protocol11-summer-table.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol11-summer-table-original.png", 1122, 1402]
    ]
  ],
  [
    "composer-summer-postcard",
    "app-composer",
    "Postcard for the guestbook",
    "Postcard for the guestbook artwork for App Composer.",
    "Postcard for the guestbook. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "seasonal",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "composer-summer-postcard.jpg", 1080, 1350],
      ["ImageGen original PNG", "composer-summer-postcard-original.png", 1122, 1402]
    ]
  ],
  [
    "loftwahfm-cartridge-banner",
    "loftwahfm",
    "Cartridge Club header",
    "Cartridge Club header artwork for LoftwahFM.",
    "Cartridge Club header. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["X header", "loftwahfm-cartridge-banner.jpg", 1500, 500],
      ["ImageGen original PNG", "loftwahfm-cartridge-banner-original.png", 2172, 724]
    ]
  ],
  [
    "liferaft-summer-cleanout",
    "liferaft",
    "The summer archive clean-out",
    "The summer archive clean-out artwork for Liferaft.",
    "The summer archive clean-out. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "seasonal",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "liferaft-summer-cleanout.jpg", 1080, 1920],
      ["ImageGen original PNG", "liferaft-summer-cleanout-original.png", 941, 1672]
    ]
  ],
  [
    "max-summer-model",
    "max",
    "Summer light in the simulator",
    "Summer light in the simulator artwork for MAX.",
    "Summer light in the simulator. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "seasonal",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "max-summer-model.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-summer-model-original.png", 1122, 1402]
    ]
  ],
  [
    "woodhouse-summer-workshop",
    "woodhouse",
    "Summer workshop",
    "Summer workshop artwork for Woodhouse.",
    "Summer workshop. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "seasonal",
    "Built-in Codex ImageGen",
    "jpg",
    [
      ["Discord banner", "woodhouse-summer-workshop.jpg", 1920, 1080],
      ["ImageGen original PNG", "woodhouse-summer-workshop-original.png", 1672, 941]
    ]
  ],
  [
    "bubbles-first-spark-poster",
    "bubbles",
    "First Spark",
    "First Spark in ink for Bubbles.",
    "First Spark gives you one board to think through. Take your first shot and see what opens up.",
    "https://bubbles.loftwah.com/puzzle",
    "Play",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "bubbles-first-spark-poster.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-first-spark-poster-original.png", 941, 1672]
    ]
  ],
  [
    "shoalshot-tide-pool",
    "shoalshot",
    "Dive the Tide Pool",
    "Dive the Tide Pool in gouache for SHOALSHOT.",
    "Open the Tide Pool and look for the silver turn of a Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "shoalshot-tide-pool.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-tide-pool-original.png", 1122, 1402]
    ]
  ],
  [
    "foilbury-light-angle",
    "foilbury",
    "Moss in holographic",
    "Moss in holographic artwork for Foilbury.",
    "Moss looks different in holographic. Open the cabinet and take a closer look.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "foilbury-light-angle.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-light-angle-original.png", 941, 1672]
    ]
  ],
  [
    "fighter-pick-move",
    "fighter",
    "Pick your first move",
    "Pick your first move in charcoal for Fighter.",
    "The cabinet is on. The Viking is ready. Pick a move in the Battle Blast tutorial.",
    "https://fighter.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "fighter-pick-move.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-pick-move-original.png", 941, 1672]
    ]
  ],
  [
    "protocol11-rivals",
    "protocol-11",
    "Classic or Tactical",
    "Classic or Tactical artwork for Protocol 11.",
    "Set up a local game with Classic bots, or put Tactical bots across the table.",
    "https://protocol11.loftwah.com/",
    "Play",
    "comparison",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Landscape", "protocol11-rivals.jpg", 1600, 900],
      ["ImageGen original PNG", "protocol11-rivals-original.png", 1672, 941]
    ]
  ],
  [
    "composer-links-guestbook",
    "app-composer",
    "Links and guestbook",
    "Links and guestbook in ink for App Composer.",
    "Put your links and a moderated guestbook on the same public page. Open the sample Creator Hub.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "comparison",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Landscape", "composer-links-guestbook.jpg", 1600, 900],
      ["ImageGen original PNG", "composer-links-guestbook-original.png", 1672, 941]
    ]
  ],
  [
    "loftwahfm-station-pair",
    "loftwahfm",
    "Cartridge Club and Night Signal",
    "Cartridge Club and Night Signal artwork for LoftwahFM.",
    "Cartridge Club for the arcade bench. Night Signal for the late shift. Both are in LoftwahFM’s radio picker.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "comparison",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Landscape", "loftwahfm-station-pair.jpg", 1600, 900],
      ["ImageGen original PNG", "loftwahfm-station-pair-original.png", 1672, 941]
    ]
  ],
  [
    "liferaft-archive-to-file",
    "liferaft",
    "Archive to attachment",
    "Archive to attachment artwork for Liferaft.",
    "Open the archive, find the message and export the attachment you came for. Liferaft does the search locally.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "comparison",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Landscape", "liferaft-archive-to-file.jpg", 1600, 900],
      ["ImageGen original PNG", "liferaft-archive-to-file-original.png", 1672, 941]
    ]
  ],
  [
    "max-hear-locator",
    "max",
    "Hear the locator",
    "Hear the locator artwork for MAX.",
    "Try Find MAX in the browser and listen for the simulated locator.",
    "https://max.loftwah.com/demo",
    "Try",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "max-hear-locator.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-hear-locator-original.png", 941, 1672]
    ]
  ],
  [
    "woodhouse-games-and-radio",
    "woodhouse",
    "Play and listen",
    "Play and listen in ink for Woodhouse.",
    "Play a round of Bubbles or put LoftwahFM on while you make something. Both came off this bench.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "comparison",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Landscape", "woodhouse-games-and-radio.jpg", 1600, 900],
      ["ImageGen original PNG", "woodhouse-games-and-radio-original.png", 1672, 941]
    ]
  ],
  [
    "bubbles-puzzle-eraser",
    "bubbles",
    "Arcade pencil study",
    "Arcade pencil study in pencil for Bubbles.",
    "Arcade pencil study. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "bubbles-puzzle-eraser.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-puzzle-eraser-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-fish-silhouette",
    "shoalshot",
    "Surface and below",
    "Surface and below in photograph for SHOALSHOT.",
    "Same Tide Pool, two points of view. Look down from the rocks, then take a browser dive.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "comparison",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Landscape", "shoalshot-fish-silhouette.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-fish-silhouette-original.png", 1672, 941]
    ]
  ],
  [
    "foilbury-finish-compare",
    "foilbury",
    "Plain and holographic",
    "Plain and holographic artwork for Foilbury.",
    "Same Moss, two surfaces. Plain keeps the portrait matte. Holographic changes with the light. Open the real Moss card.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "comparison",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Landscape", "foilbury-finish-compare.jpg", 1600, 900],
      ["ImageGen original PNG", "foilbury-finish-compare-original.png", 1672, 941]
    ]
  ],
  [
    "fighter-two-portraits",
    "fighter",
    "Cabinet decal",
    "Cabinet decal artwork for Fighter.",
    "Cabinet decal. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "fighter-two-portraits.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-two-portraits-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol11-first-draw",
    "protocol-11",
    "Your first draw",
    "Your first draw artwork for Protocol 11.",
    "Take your first draw at a local Classic table. Protocol 11 runs in the browser.",
    "https://protocol11.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "protocol11-first-draw.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol11-first-draw-original.png", 1122, 1402]
    ]
  ],
  [
    "composer-build-your-hub",
    "app-composer",
    "Build a Creator Hub",
    "Build a Creator Hub in ink for App Composer.",
    "Start with the working Creator Hub. Try the sample profile and guestbook, then adapt it for your own work.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "composer-build-your-hub.jpg", 1080, 1920],
      ["ImageGen original PNG", "composer-build-your-hub-original.png", 941, 1672]
    ]
  ],
  [
    "loftwahfm-tune-in",
    "loftwahfm",
    "Tune to Cartridge Club",
    "Tune to Cartridge Club artwork for LoftwahFM.",
    "Tune to Cartridge Club for game-inspired music from LoftwahFM.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-tune-in.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-tune-in-original.png", 1122, 1402]
    ]
  ],
  [
    "liferaft-local-search",
    "liferaft",
    "Search an MBOX locally",
    "Search an MBOX locally artwork for Liferaft.",
    "Search by subject, sender or attachment name in a local MBOX archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "liferaft-local-search.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-local-search-original.png", 1024, 1024]
    ]
  ],
  [
    "max-floor-plan",
    "max",
    "Locator floor-plan study",
    "Locator floor-plan study in ink for MAX.",
    "Locator floor-plan study. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "max-floor-plan.jpg", 1080, 1080],
      ["ImageGen original PNG", "max-floor-plan-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-share-cover",
    "woodhouse",
    "Find the artwork",
    "Find the artwork in ink for Woodhouse.",
    "Game art, sleeve studies and clean sketches from the workshop. Open Share and take a piece with you.",
    "https://woodhouse.loftwah.com/share/",
    "Explore",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "woodhouse-share-cover.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-share-cover-original.png", 1122, 1402]
    ]
  ],
  [
    "bubbles-cabinet-night-shift",
    "bubbles",
    "Night shift",
    "Night shift in photograph for Bubbles.",
    "Night shift. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "bubbles-cabinet-night-shift.jpg", 1920, 1080],
      ["ImageGen original PNG", "bubbles-cabinet-night-shift-original.png", 1672, 941]
    ]
  ],
  [
    "shoalshot-silver-turn",
    "shoalshot",
    "A flash of silver",
    "A flash of silver artwork for SHOALSHOT.",
    "A flash of silver. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "shoalshot-silver-turn.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-silver-turn-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-bench",
    "foilbury",
    "Moss at the bench",
    "Moss at the bench artwork for Foilbury.",
    "Moss at the bench. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "foilbury-bench.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-bench-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-fight-night",
    "fighter",
    "Fight night",
    "Fight night artwork for Fighter.",
    "Fight night. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "fighter-fight-night.jpg", 1920, 1080],
      ["ImageGen original PNG", "fighter-fight-night-original.png", 1672, 941]
    ]
  ],
  [
    "protocol11-classic-night",
    "protocol-11",
    "Classic table after hours",
    "Classic table after hours in oil paint for Protocol 11.",
    "Classic table after hours. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "protocol11-classic-night.jpg", 1920, 1080],
      ["ImageGen original PNG", "protocol11-classic-night-original.png", 1672, 941]
    ]
  ],
  [
    "composer-creator-desk",
    "app-composer",
    "Creator desk",
    "Creator desk in ink for App Composer.",
    "Creator desk. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "composer-creator-desk.jpg", 1920, 1080],
      ["ImageGen original PNG", "composer-creator-desk-original.png", 1672, 941]
    ]
  ],
  [
    "loftwahfm-studio-discord",
    "loftwahfm",
    "The listening booth",
    "The listening booth artwork for LoftwahFM.",
    "The listening booth. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "loftwahfm-studio-discord.jpg", 1920, 1080],
      ["ImageGen original PNG", "loftwahfm-studio-discord-original.png", 1672, 941]
    ]
  ],
  [
    "liferaft-deep-water",
    "liferaft",
    "Paper sea",
    "Paper sea artwork for Liferaft.",
    "Paper sea. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "liferaft-deep-water.jpg", 1920, 1080],
      ["ImageGen original PNG", "liferaft-deep-water-original.png", 1672, 941]
    ]
  ],
  [
    "max-sim-discord",
    "max",
    "Signal across the floor",
    "Signal across the floor artwork for MAX.",
    "Signal across the floor. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "max-sim-discord.jpg", 1920, 1080],
      ["ImageGen original PNG", "max-sim-discord-original.png", 1672, 941]
    ]
  ],
  [
    "woodhouse-made-to-browse",
    "woodhouse",
    "Games, music and tools",
    "Games, music and tools in woodcut for Woodhouse.",
    "Play the games, put on a station or open one of the tools. The workshop is open.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "woodhouse-made-to-browse.jpg", 1080, 1920],
      ["ImageGen original PNG", "woodhouse-made-to-browse-original.png", 941, 1672]
    ]
  ],
  [
    "bubbles-one-more-board",
    "bubbles",
    "One more board",
    "One more board artwork for Bubbles.",
    "One more board. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "bubbles-one-more-board.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-one-more-board-original.png", 941, 1672]
    ]
  ],
  [
    "shoalshot-reef-at-dusk",
    "shoalshot",
    "Reef at dusk",
    "Reef at dusk artwork for SHOALSHOT.",
    "Reef at dusk. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "shoalshot-reef-at-dusk.jpg", 1920, 1080],
      ["ImageGen original PNG", "shoalshot-reef-at-dusk-original.png", 1672, 941]
    ]
  ],
  [
    "foilbury-lantern-hall",
    "foilbury",
    "Lantern hall",
    "Lantern hall artwork for Foilbury.",
    "Lantern hall. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "foilbury-lantern-hall.jpg", 1920, 1080],
      ["ImageGen original PNG", "foilbury-lantern-hall-original.png", 1672, 941]
    ]
  ],
  [
    "fighter-reaper-ink",
    "fighter",
    "The Reaper in ink",
    "The Reaper in ink in ink for Fighter.",
    "The Reaper in ink. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "fighter-reaper-ink.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-reaper-ink-original.png", 1122, 1402]
    ]
  ],
  [
    "protocol11-scorepad",
    "protocol-11",
    "Beside the card table",
    "Beside the card table in pencil for Protocol 11.",
    "Beside the card table. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "protocol11-scorepad.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol11-scorepad-original.png", 1024, 1024]
    ]
  ],
  [
    "composer-paperwork-stamp",
    "app-composer",
    "Paperwork stamp",
    "Paperwork stamp artwork for App Composer.",
    "Paperwork stamp. Try a sample PDF in Paperwork.",
    "https://paperwork.loftwah.com/",
    "Try",
    "special",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "composer-paperwork-stamp.jpg", 1080, 1080],
      ["ImageGen original PNG", "composer-paperwork-stamp-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-tape-blueprint",
    "loftwahfm",
    "Tape path",
    "Tape path in pencil for LoftwahFM.",
    "Tape path. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "loftwahfm-tape-blueprint.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-tape-blueprint-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-mime-cutaway",
    "liferaft",
    "Inside an envelope",
    "Inside an envelope in linocut for Liferaft.",
    "Inside an envelope. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "liferaft-mime-cutaway.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-mime-cutaway-original.png", 1122, 1402]
    ]
  ],
  [
    "max-amber-echo",
    "max",
    "Amber echo",
    "Amber echo artwork for MAX.",
    "Amber echo. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "max-amber-echo.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-amber-echo-original.png", 941, 1672]
    ]
  ],
  [
    "woodhouse-night-bench",
    "woodhouse",
    "Bench lights",
    "Bench lights in photograph for Woodhouse.",
    "Bench lights. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Discord banner", "woodhouse-night-bench.jpg", 1920, 1080],
      ["ImageGen original PNG", "woodhouse-night-bench-original.png", 1672, 941]
    ]
  ],
  [
    "bubbles-channel-cover",
    "bubbles",
    "One more go",
    "One more go artwork for Bubbles.",
    "One more go. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "bubbles-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "bubbles-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "shoalshot-reef-lens",
    "shoalshot",
    "Through the reef",
    "Through the reef artwork for SHOALSHOT.",
    "Through the reef. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "shoalshot-reef-lens.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-reef-lens-original.png", 941, 1672]
    ]
  ],
  [
    "foilbury-botanical-proof",
    "foilbury",
    "Leaf pendant proof",
    "Leaf pendant proof in ink for Foilbury.",
    "Leaf pendant proof. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "foilbury-botanical-proof.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-botanical-proof-original.png", 1122, 1402]
    ]
  ],
  [
    "fighter-battle-blast",
    "fighter",
    "Battle Blast",
    "Battle Blast artwork for Fighter.",
    "Meet Viking and Grim Reaper in the Battle Blast tutorial.",
    "https://fighter.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "fighter-battle-blast.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-battle-blast-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol11-deal",
    "protocol-11",
    "The deal",
    "The deal artwork for Protocol 11.",
    "The deal. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Story still", "protocol11-deal.jpg", 1080, 1920],
      ["ImageGen original PNG", "protocol11-deal-original.png", 941, 1672]
    ]
  ],
  [
    "composer-hub-cutaway",
    "app-composer",
    "Paper city",
    "Paper city artwork for App Composer.",
    "Paper city. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "composer-hub-cutaway.jpg", 1080, 1080],
      ["ImageGen original PNG", "composer-hub-cutaway-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-late-summer",
    "loftwahfm",
    "Last light radio",
    "Last light radio artwork for LoftwahFM.",
    "Last light radio. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "seasonal",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-late-summer.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-late-summer-original.png", 1122, 1402]
    ]
  ],
  [
    "liferaft-photo-recovery",
    "liferaft",
    "A photo kept",
    "A photo kept in photograph for Liferaft.",
    "A photo kept. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "liferaft-photo-recovery.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-photo-recovery-original.png", 1024, 1024]
    ]
  ],
  [
    "max-sim-cover",
    "max",
    "Try the browser simulator",
    "Try the browser simulator artwork for MAX.",
    "The MAX browser simulator is open. Try the locator and hear what changes.",
    "https://max.loftwah.com/demo",
    "Try",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Landscape", "max-sim-cover.jpg", 1600, 900],
      ["ImageGen original PNG", "max-sim-cover-original.png", 1672, 941]
    ]
  ],
  [
    "woodhouse-sketchbook",
    "woodhouse",
    "Sketchbook from the bench",
    "Sketchbook from the bench in charcoal for Woodhouse.",
    "Sketchbook from the bench. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "art",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Portrait feed", "woodhouse-sketchbook.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-sketchbook-original.png", 1122, 1402]
    ]
  ],
  [
    "bubbles-cover-sparks",
    "bubbles",
    "Arcade at golden hour",
    "Arcade at golden hour in ink for Bubbles.",
    "Arcade at golden hour. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "bubbles-cover-sparks.jpg", 1702, 630],
      ["ImageGen original PNG", "bubbles-cover-sparks-original.png", 1728, 640]
    ]
  ],
  [
    "shoalshot-look-first",
    "shoalshot",
    "Read the tide",
    "Read the tide artwork for SHOALSHOT.",
    "Take a moment to read the reef before you place the shot. The Tide Pool is open in SHOALSHOT.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via OpenAI",
    "jpg",
    [
      ["Square feed", "shoalshot-look-first.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-look-first-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-channel-cover",
    "foilbury",
    "The Foilbury cabinet",
    "The Foilbury cabinet artwork for Foilbury.",
    "The Foilbury cabinet. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "foilbury-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "foilbury-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "fighter-channel-cover",
    "fighter",
    "Battle Blast channel art",
    "Battle Blast channel art artwork for Fighter.",
    "Battle Blast channel art. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "fighter-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "fighter-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "protocol11-channel-cover",
    "protocol-11",
    "The Classic table channel",
    "The Classic table channel artwork for Protocol 11.",
    "The Classic table channel. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "protocol11-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "protocol11-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "composer-channel-cover",
    "app-composer",
    "Creator Hub channel",
    "Creator Hub channel in ink for App Composer.",
    "Creator Hub channel. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "composer-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "composer-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "loftwahfm-channel-cover",
    "loftwahfm",
    "LoftwahFM channel art",
    "LoftwahFM channel art artwork for LoftwahFM.",
    "LoftwahFM channel art. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "loftwahfm-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "loftwahfm-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "liferaft-channel-cover",
    "liferaft",
    "Liferaft channel art",
    "Liferaft channel art artwork for Liferaft.",
    "Liferaft channel art. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "liferaft-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "liferaft-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "max-sim-channel",
    "max",
    "MAX simulator channel",
    "MAX simulator channel artwork for MAX.",
    "MAX simulator channel. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "max-sim-channel.jpg", 2560, 1440],
      ["ImageGen original PNG", "max-sim-channel-original.png", 1920, 1072]
    ]
  ],
  [
    "woodhouse-channel-cover",
    "woodhouse",
    "Woodhouse channel art",
    "Woodhouse channel art artwork for Woodhouse.",
    "Woodhouse channel art. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "woodhouse-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "woodhouse-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "bubbles-fizz-sticker",
    "bubbles",
    "Fizz cheers",
    "Fizz cheers artwork for Bubbles.",
    "Fizz cheers. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "bubbles-fizz-sticker.png", 320, 320],
      ["ImageGen original PNG", "bubbles-fizz-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-channel-cover",
    "shoalshot",
    "SHOALSHOT reef line",
    "SHOALSHOT reef line artwork for SHOALSHOT.",
    "SHOALSHOT reef line. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["YouTube channel banner", "shoalshot-channel-cover.jpg", 2560, 1440],
      ["ImageGen original PNG", "shoalshot-channel-cover-original.png", 1920, 1072]
    ]
  ],
  [
    "foilbury-cabinet-cover",
    "foilbury",
    "Moss in the collection",
    "Moss in the collection artwork for Foilbury.",
    "Moss in the collection. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "foilbury-cabinet-cover.jpg", 1702, 630],
      ["ImageGen original PNG", "foilbury-cabinet-cover-original.png", 1728, 640]
    ]
  ],
  [
    "fighter-cabinet-cover",
    "fighter",
    "Fighter cabinet cover",
    "Fighter cabinet cover artwork for Fighter.",
    "Fighter cabinet cover. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "fighter-cabinet-cover.jpg", 1702, 630],
      ["ImageGen original PNG", "fighter-cabinet-cover-original.png", 1728, 640]
    ]
  ],
  [
    "protocol11-cardnight-cover",
    "protocol-11",
    "Card night cover",
    "Card night cover in photograph for Protocol 11.",
    "Card night cover. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "protocol11-cardnight-cover.jpg", 1702, 630],
      ["ImageGen original PNG", "protocol11-cardnight-cover-original.png", 1728, 640]
    ]
  ],
  [
    "composer-hub-cover",
    "app-composer",
    "Creator Hub cover",
    "Creator Hub cover artwork for App Composer.",
    "Creator Hub cover. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "composer-hub-cover.jpg", 1702, 630],
      ["ImageGen original PNG", "composer-hub-cover-original.png", 1728, 640]
    ]
  ],
  [
    "loftwahfm-radio-cover",
    "loftwahfm",
    "Radio deck cover",
    "Radio deck cover artwork for LoftwahFM.",
    "Radio deck cover. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "loftwahfm-radio-cover.jpg", 1702, 630],
      ["ImageGen original PNG", "loftwahfm-radio-cover-original.png", 1728, 640]
    ]
  ],
  [
    "liferaft-archive-cover",
    "liferaft",
    "Mail archive cover",
    "Mail archive cover artwork for Liferaft.",
    "Mail archive cover. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "liferaft-archive-cover.jpg", 1702, 630],
      ["ImageGen original PNG", "liferaft-archive-cover-original.png", 1728, 640]
    ]
  ],
  [
    "max-sim-cover-wide",
    "max",
    "Find MAX cover",
    "Find MAX cover artwork for MAX.",
    "Find MAX cover. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "max-sim-cover-wide.jpg", 1702, 630],
      ["ImageGen original PNG", "max-sim-cover-wide-original.png", 1728, 640]
    ]
  ],
  [
    "woodhouse-factory-cover",
    "woodhouse",
    "Woodhouse workshop cover",
    "Woodhouse workshop cover in ink for Woodhouse.",
    "Woodhouse workshop cover. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "woodhouse-factory-cover.jpg", 1702, 630],
      ["ImageGen original PNG", "woodhouse-factory-cover-original.png", 1728, 640]
    ]
  ],
  [
    "bubbles-first-spark-ink",
    "bubbles",
    "First Spark thumbnail",
    "First Spark thumbnail in ink for Bubbles.",
    "First Spark thumbnail. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "bubbles-first-spark-ink.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-first-spark-ink-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-rockpool-cover",
    "shoalshot",
    "Low tide cover",
    "Low tide cover artwork for SHOALSHOT.",
    "Low tide cover. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Facebook cover", "shoalshot-rockpool-cover.jpg", 1702, 630],
      ["ImageGen original PNG", "shoalshot-rockpool-cover-original.png", 1728, 640]
    ]
  ],
  [
    "foilbury-hood-study",
    "foilbury",
    "Moss portrait study",
    "Moss peers out from warm foliage in a green hoodie and tan cap.",
    "Moss portrait study. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "foilbury-hood-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-hood-study-original.png", 1024, 1280]
    ]
  ],
  [
    "fighter-viking-sticker",
    "fighter",
    "Viking raises an eyebrow",
    "Viking raises an eyebrow artwork for Fighter.",
    "Viking raises an eyebrow. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "fighter-viking-sticker.png", 320, 320],
      ["ImageGen original PNG", "fighter-viking-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol11-card-sticker",
    "protocol-11",
    "One card left sticker",
    "One card left sticker in sticker for Protocol 11.",
    "One card left sticker. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "protocol11-card-sticker.png", 320, 320],
      ["ImageGen original PNG", "protocol11-card-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "composer-guestbook-sticker",
    "app-composer",
    "Visitor postcard sticker",
    "Visitor postcard sticker artwork for App Composer.",
    "Visitor postcard sticker. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "composer-guestbook-sticker.png", 320, 320],
      ["ImageGen original PNG", "composer-guestbook-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-dial-sticker",
    "loftwahfm",
    "Tune-in dial sticker",
    "Tune-in dial sticker in enamel for LoftwahFM.",
    "Tune-in dial sticker. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "loftwahfm-dial-sticker.png", 320, 320],
      ["ImageGen original PNG", "loftwahfm-dial-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-envelope-sticker",
    "liferaft",
    "Rescued envelope sticker",
    "Rescued envelope sticker artwork for Liferaft.",
    "Rescued envelope sticker. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "liferaft-envelope-sticker.png", 320, 320],
      ["ImageGen original PNG", "liferaft-envelope-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "max-pulse-sticker",
    "max",
    "Amber locator sticker",
    "Amber locator sticker in enamel for MAX.",
    "Amber locator sticker. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "max-pulse-sticker.png", 320, 320],
      ["ImageGen original PNG", "max-pulse-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-loom-sticker",
    "woodhouse",
    "Lime loom sticker",
    "Lime loom sticker in enamel for Woodhouse.",
    "Lime loom sticker. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "woodhouse-loom-sticker.png", 320, 320],
      ["ImageGen original PNG", "woodhouse-loom-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-arcade-party",
    "bubbles",
    "Summer arcade",
    "Summer arcade artwork for Bubbles.",
    "Summer arcade. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "seasonal",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "bubbles-arcade-party.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-arcade-party-original.png", 1008, 1792]
    ]
  ],
  [
    "shoalshot-fish-sticker",
    "shoalshot",
    "Glimmerfin flash",
    "Glimmerfin flash artwork for SHOALSHOT.",
    "Glimmerfin flash. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "special",
    "GPT Image 2.6 via Fal",
    "png",
    [
      ["Discord sticker", "shoalshot-fish-sticker.png", 320, 320],
      ["ImageGen original PNG", "shoalshot-fish-sticker-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-case-sketch",
    "foilbury",
    "Cabinet pencil proof",
    "Cabinet pencil proof in pencil for Foilbury.",
    "Cabinet pencil proof. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "foilbury-case-sketch.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-case-sketch-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-roster-pencil",
    "fighter",
    "Viking and Reaper pencil study",
    "Viking and Reaper pencil study in pencil for Fighter.",
    "Viking and Reaper pencil study. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "fighter-roster-pencil.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-roster-pencil-original.png", 1024, 1280]
    ]
  ],
  [
    "protocol11-pencil-table",
    "protocol-11",
    "Table layout in graphite",
    "Table layout in graphite artwork for Protocol 11.",
    "Table layout in graphite. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "protocol11-pencil-table.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol11-pencil-table-original.png", 1024, 1280]
    ]
  ],
  [
    "composer-fold-sketch",
    "app-composer",
    "Creator Hub in pencil",
    "Creator Hub in pencil in pencil for App Composer.",
    "Creator Hub in pencil. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "composer-fold-sketch.jpg", 1080, 1350],
      ["ImageGen original PNG", "composer-fold-sketch-original.png", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-spool-study",
    "loftwahfm",
    "Spool in pencil",
    "Spool in pencil in pencil for LoftwahFM.",
    "Spool in pencil. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-spool-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-spool-study-original.png", 1024, 1280]
    ]
  ],
  [
    "liferaft-buoy-sketch",
    "liferaft",
    "Buoy on newsprint",
    "Buoy on newsprint in charcoal for Liferaft.",
    "Buoy on newsprint. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "liferaft-buoy-sketch.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-buoy-sketch-original.png", 1024, 1024]
    ]
  ],
  [
    "max-floor-sketch",
    "max",
    "Simulator floor-plan sketch",
    "Simulator floor-plan sketch in pencil for MAX.",
    "Simulator floor-plan sketch. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "max-floor-sketch.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-floor-sketch-original.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-workbench-sketch",
    "woodhouse",
    "Workbench in pencil",
    "Workbench in pencil in pencil for Woodhouse.",
    "Workbench in pencil. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "woodhouse-workbench-sketch.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-workbench-sketch-original.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-line-up",
    "bubbles",
    "Line up the shot",
    "Line up the shot artwork for Bubbles.",
    "See the opening, then send it. Bubbles Classic runs in the browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "bubbles-line-up.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-line-up-original.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-reef-charcoal",
    "shoalshot",
    "Glimmerfin reef print",
    "A Glimmerfin shines silver over dark green kelp and rock.",
    "Glimmerfin reef print. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "shoalshot-reef-charcoal.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-reef-charcoal-original.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-open-cabinet",
    "foilbury",
    "Open the cabinet",
    "Open the cabinet artwork for Foilbury.",
    "Moss wears the same little leaf pendant in every finish. Open the cabinet and see what the light does.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "foilbury-open-cabinet.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-open-cabinet-original.png", 1024, 1280]
    ]
  ],
  [
    "fighter-arena-sketch",
    "fighter",
    "Viking and Reaper colour study",
    "Blue paper and yellow-orange strokes frame Viking and Grim Reaper.",
    "Viking and Reaper colour study. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "fighter-arena-sketch.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-arena-sketch-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol11-hand-study",
    "protocol-11",
    "The hand in charcoal",
    "The hand in charcoal in charcoal for Protocol 11.",
    "The hand in charcoal. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "protocol11-hand-study.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol11-hand-study-original.png", 1024, 1024]
    ]
  ],
  [
    "composer-form-sketch",
    "app-composer",
    "Paperwork pen study",
    "Paperwork pen study in pencil for App Composer.",
    "Paperwork pen study. Try a sample PDF in Paperwork.",
    "https://paperwork.loftwah.com/",
    "Try",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "composer-form-sketch.jpg", 1080, 1080],
      ["ImageGen original PNG", "composer-form-sketch-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-sleeve-sketch",
    "loftwahfm",
    "Cartridge sleeve roughs",
    "Cartridge sleeve roughs in pencil for LoftwahFM.",
    "Cartridge sleeve roughs. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "loftwahfm-sleeve-sketch.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-sleeve-sketch-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-export-file",
    "liferaft",
    "Export one attachment",
    "Export one attachment artwork for Liferaft.",
    "Take the one file you came for. Liferaft can export an individual attachment from an old mail archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "liferaft-export-file.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-export-file-original.png", 1024, 1280]
    ]
  ],
  [
    "max-acoustic-sketch",
    "max",
    "Sound cue sketches",
    "Sound cue sketches in charcoal for MAX.",
    "Sound cue sketches. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "max-acoustic-sketch.jpg", 1080, 1080],
      ["ImageGen original PNG", "max-acoustic-sketch-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-loom-sketch",
    "woodhouse",
    "First loom sketch",
    "First loom sketch in charcoal for Woodhouse.",
    "First loom sketch. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "sketch",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "woodhouse-loom-sketch.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-loom-sketch-original.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-match-cluster",
    "bubbles",
    "Bubble cluster in glass",
    "Bubble cluster in glass in photograph for Bubbles.",
    "Bubble cluster in glass. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "bubbles-match-cluster.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-match-cluster-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-summer-sunset",
    "shoalshot",
    "Long light in the shallows",
    "Long light in the shallows artwork for SHOALSHOT.",
    "Long light in the shallows. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "seasonal",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "shoalshot-summer-sunset.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-summer-sunset-original.png", 1008, 1792]
    ]
  ],
  [
    "foilbury-leaf-jeweller",
    "foilbury",
    "Gold leaf close-up",
    "Gold leaf close-up artwork for Foilbury.",
    "Gold leaf close-up. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "foilbury-leaf-jeweller.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-leaf-jeweller-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-summer-tournament",
    "fighter",
    "Warm night at the arcade",
    "Warm night at the arcade artwork for Fighter.",
    "Warm night at the arcade. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "seasonal",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "fighter-summer-tournament.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-summer-tournament-original.png", 1008, 1792]
    ]
  ],
  [
    "protocol11-veranda-game",
    "protocol-11",
    "Summer night Classic",
    "Summer night Classic in ink for Protocol 11.",
    "Summer night Classic. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "seasonal",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "protocol11-veranda-game.jpg", 1080, 1920],
      ["ImageGen original PNG", "protocol11-veranda-game-original.png", 1008, 1792]
    ]
  ],
  [
    "composer-linkarooie-story",
    "app-composer",
    "Give your links a home",
    "Give your links a home in ink for App Composer.",
    "Give people one page for the links that matter. The public Creator Hub shows how.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "composer-linkarooie-story.jpg", 1080, 1920],
      ["ImageGen original PNG", "composer-linkarooie-story-original.png", 1008, 1792]
    ]
  ],
  [
    "loftwahfm-winter-airwaves",
    "loftwahfm",
    "Winter airwaves",
    "Winter airwaves in photograph for LoftwahFM.",
    "Winter airwaves. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "seasonal",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "loftwahfm-winter-airwaves.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-winter-airwaves-original.png", 1008, 1792]
    ]
  ],
  [
    "liferaft-envelope-water",
    "liferaft",
    "The envelope on water",
    "The envelope on water artwork for Liferaft.",
    "The envelope on water. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "liferaft-envelope-water.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-envelope-water-original.png", 1024, 1024]
    ]
  ],
  [
    "max-long-afternoon",
    "max",
    "Summer light in the room",
    "Summer light in the room artwork for MAX.",
    "Summer light in the room. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "seasonal",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "max-long-afternoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-long-afternoon-original.png", 1008, 1792]
    ]
  ],
  [
    "woodhouse-night-shift",
    "woodhouse",
    "Summer night at the workbench",
    "Summer night at the workbench artwork for Woodhouse.",
    "Summer night at the workbench. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "seasonal",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "woodhouse-night-shift.jpg", 1080, 1920],
      ["ImageGen original PNG", "woodhouse-night-shift-original.png", 1008, 1792]
    ]
  ],
  [
    "bubbles-first-puzzle-banner",
    "bubbles",
    "Use the wall cover",
    "A wide red and purple Bubbles header shows the words Use the Wall and a cabinet of symbol bubbles.",
    "Use the wall cover. Play a quick round in Bubbles Classic. Match three and clear the board in your browser.",
    "https://bubbles.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "bubbles-first-puzzle-banner.jpg", 1584, 396],
      ["ImageGen original PNG", "bubbles-first-puzzle-banner-original.png", 1920, 640]
    ]
  ],
  [
    "shoalshot-pick-line",
    "shoalshot",
    "Pick a line",
    "Pick a line artwork for SHOALSHOT.",
    "Pick a line through the rocks. The Glimmerfin has already picked its own.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "shoalshot-pick-line.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-pick-line-original.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-collection-header",
    "foilbury",
    "Collector’s workshop",
    "Collector’s workshop artwork for Foilbury.",
    "Collector’s workshop. Take a closer look at Moss and the holographic finish in the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "foilbury-collection-header.jpg", 1584, 396],
      ["ImageGen original PNG", "foilbury-collection-header-original.png", 1920, 640]
    ]
  ],
  [
    "fighter-first-round",
    "fighter",
    "First round",
    "First round artwork for Fighter.",
    "Two familiar faces at the Fighter cabinet. Try Battle Blast and take the first round yourself.",
    "https://fighter.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "fighter-first-round.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-first-round-original.png", 1024, 1280]
    ]
  ],
  [
    "protocol11-solo-table",
    "protocol-11",
    "Play a local hand",
    "Play a local hand artwork for Protocol 11.",
    "Put the kettle on and play a local hand. The bots can fill the rest of the table.",
    "https://protocol11.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "protocol11-solo-table.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol11-solo-table-original.png", 1024, 1280]
    ]
  ],
  [
    "composer-guestbook-object",
    "app-composer",
    "Postcard tray",
    "Postcard tray artwork for App Composer.",
    "Postcard tray. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "composer-guestbook-object.jpg", 1080, 1080],
      ["ImageGen original PNG", "composer-guestbook-object-original.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-radio-stays",
    "loftwahfm",
    "Put the radio on",
    "Put the radio on artwork for LoftwahFM.",
    "Put the radio on and get back to what you’re making. Start with Cartridge Club.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "loftwahfm-radio-stays.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-radio-stays-original.png", 1024, 1280]
    ]
  ],
  [
    "liferaft-archive-linkedin",
    "liferaft",
    "Local archive header",
    "Local archive header artwork for Liferaft.",
    "Local archive header. Open an MBOX archive locally and find the attachment you kept.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "liferaft-archive-linkedin.jpg", 1584, 396],
      ["ImageGen original PNG", "liferaft-archive-linkedin-original.png", 1920, 640]
    ]
  ],
  [
    "max-try-find",
    "max",
    "Try Find MAX",
    "Try Find MAX artwork for MAX.",
    "Open Find MAX and listen for the locator in the browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "max-try-find.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-try-find-original.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-show-your-work",
    "woodhouse",
    "Show your work",
    "Show your work artwork for Woodhouse.",
    "Open Woodhouse Share for game art, radio sleeves and the sketches that went with them.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Portrait feed", "woodhouse-show-your-work.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-show-your-work-original.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-arcade-nights",
    "bubbles",
    "Play Bubbles Classic",
    "Play Bubbles Classic artwork for Bubbles.",
    "A bubble shooter, straight to the cabinet. Match three and clear the board in Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    "feature",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Landscape", "bubbles-arcade-nights.jpg", 1600, 900],
      ["ImageGen original PNG", "bubbles-arcade-nights-original.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-glass-fish",
    "shoalshot",
    "Glass Glimmerfin",
    "Glass Glimmerfin artwork for SHOALSHOT.",
    "Glass Glimmerfin. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "shoalshot-glass-fish.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-glass-fish-original.png", 1024, 1024]
    ]
  ],
  [
    "fighter-cabinet-emboss",
    "fighter",
    "Embossed arena decal",
    "Embossed arena decal artwork for Fighter.",
    "Embossed arena decal. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "fighter-cabinet-emboss.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-cabinet-emboss-original.png", 1024, 1024]
    ]
  ],
  [
    "protocol11-green-felt",
    "protocol-11",
    "Felt and lacquer",
    "Felt and lacquer in photograph for Protocol 11.",
    "Felt and lacquer. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "protocol11-green-felt.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol11-green-felt-original.png", 1024, 1024]
    ]
  ],
  [
    "composer-linkedin-cover",
    "app-composer",
    "Creator Hub profile cover",
    "Creator Hub profile cover artwork for App Composer.",
    "Creator Hub profile cover. Open the public Creator Hub to see a working links page and guestbook together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "composer-linkedin-cover.jpg", 1584, 396],
      ["ImageGen original PNG", "composer-linkedin-cover-original.png", 1920, 640]
    ]
  ],
  [
    "loftwahfm-dial-light",
    "loftwahfm",
    "Dial light",
    "Dial light artwork for LoftwahFM.",
    "Dial light. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "loftwahfm-dial-light.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-dial-light-original.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-search-export",
    "liferaft",
    "Search then export",
    "Search then export in paper collage for Liferaft.",
    "Search the local archive, then export the attachment. Two steps with one concrete result.",
    "https://liferaft.loftwah.com/",
    "Explore",
    "comparison",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Landscape", "liferaft-search-export.jpg", 1600, 900],
      ["ImageGen original PNG", "liferaft-search-export-original.png", 1536, 864]
    ]
  ],
  [
    "max-amber-motif",
    "max",
    "Amber motif",
    "Amber motif artwork for MAX.",
    "Amber motif. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "max-amber-motif.jpg", 1080, 1080],
      ["ImageGen original PNG", "max-amber-motif-original.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-mini-cabinet",
    "woodhouse",
    "Miniature workshop cabinet",
    "Miniature workshop cabinet in ink for Woodhouse.",
    "Miniature workshop cabinet. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Square feed", "woodhouse-mini-cabinet.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-mini-cabinet-original.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-field-cover",
    "shoalshot",
    "Tide Pool field cover",
    "Tide Pool field cover in ink for SHOALSHOT.",
    "Tide Pool field cover. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "shoalshot-field-cover.jpg", 1584, 396],
      ["ImageGen original PNG", "shoalshot-field-cover-original.png", 1920, 640]
    ]
  ],
  [
    "fighter-tutorial-cover",
    "fighter",
    "Inside Battle Blast",
    "Inside Battle Blast in screenprint for Fighter.",
    "Inside Battle Blast. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "fighter-tutorial-cover.jpg", 1584, 396],
      ["ImageGen original PNG", "fighter-tutorial-cover-original.png", 1920, 640]
    ]
  ],
  [
    "protocol11-cards-header",
    "protocol-11",
    "Classic on felt",
    "Classic on felt artwork for Protocol 11.",
    "Classic on felt. Pull up a chair at a local Classic table in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "protocol11-cards-header.jpg", 1584, 396],
      ["ImageGen original PNG", "protocol11-cards-header-original.png", 1920, 640]
    ]
  ],
  [
    "composer-paperwork-flow",
    "app-composer",
    "Fill and export",
    "Fill and export artwork for App Composer.",
    "Fill a sample PDF in Paperwork and export it from the browser. The tool works locally.",
    "https://paperwork.loftwah.com/",
    "Try",
    "comparison",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Landscape", "composer-paperwork-flow.jpg", 1600, 900],
      ["ImageGen original PNG", "composer-paperwork-flow-original.png", 1536, 864]
    ]
  ],
  [
    "loftwahfm-studio-header",
    "loftwahfm",
    "Radio studio header",
    "Radio studio header artwork for LoftwahFM.",
    "Radio studio header. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "loftwahfm-studio-header.jpg", 1584, 396],
      ["ImageGen original PNG", "loftwahfm-studio-header-original.png", 1920, 640]
    ]
  ],
  [
    "max-simulator-linkedin",
    "max",
    "Simulator profile cover",
    "Simulator profile cover artwork for MAX.",
    "Simulator profile cover. Try the locator in the public MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "max-simulator-linkedin.jpg", 1584, 396],
      ["ImageGen original PNG", "max-simulator-linkedin-original.png", 1920, 640]
    ]
  ],
  [
    "woodhouse-loftwah-linkedin",
    "woodhouse",
    "Woodhouse profile cover",
    "Woodhouse profile cover artwork for Woodhouse.",
    "Woodhouse profile cover. Browse the games, music, tools and drawings from Woodhouse.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    "banner",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["LinkedIn cover", "woodhouse-loftwah-linkedin.jpg", 1584, 396],
      ["ImageGen original PNG", "woodhouse-loftwah-linkedin-original.png", 1920, 640]
    ]
  ],
  [
    "shoalshot-underwater-portrait",
    "shoalshot",
    "Silver under the rock",
    "Silver under the rock in linocut for SHOALSHOT.",
    "Silver under the rock. Take a browser dive in SHOALSHOT’s Tide Pool and keep an eye out for the Glimmerfin.",
    "https://shoalshot.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "shoalshot-underwater-portrait.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-underwater-portrait-original.png", 1008, 1792]
    ]
  ],
  [
    "fighter-viking-reaper-ink",
    "fighter",
    "Two faces in ink",
    "Two faces in ink artwork for Fighter.",
    "Two faces in ink. Open Battle Blast in Fighter and meet Viking and Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "fighter-viking-reaper-ink.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-viking-reaper-ink-original.png", 1008, 1792]
    ]
  ],
  [
    "protocol11-draw-discard",
    "protocol-11",
    "Draw or discard",
    "Draw or discard artwork for Protocol 11.",
    "The draw pile and the discard pile are always in reach. Pull up a chair at the Classic table.",
    "https://protocol11.loftwah.com/",
    "Play",
    "comparison",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Landscape", "protocol11-draw-discard.jpg", 1600, 900],
      ["ImageGen original PNG", "protocol11-draw-discard-original.png", 1536, 864]
    ]
  ],
  [
    "loftwahfm-game-station",
    "loftwahfm",
    "Game music bench",
    "Game music bench artwork for LoftwahFM.",
    "Game music bench. Tune to Cartridge Club on LoftwahFM for game-inspired music.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    "art",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Story still", "loftwahfm-game-station.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-game-station-original.png", 1008, 1792]
    ]
  ],
  [
    "max-view-and-listen",
    "max",
    "Look and listen",
    "Look and listen artwork for MAX.",
    "Look at the room, then listen for the locator. You can try both in the MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    "comparison",
    "GPT Image 2.6 via Fal",
    "jpg",
    [
      ["Landscape", "max-view-and-listen.jpg", 1600, 900],
      ["ImageGen original PNG", "max-view-and-listen-original.png", 1536, 864]
    ]
  ]
] as const;

export const shareStudio: CampaignItem[] = art.map(
  ([id, project, title, alt, caption, href, action, use, credit, ext, files]) => {
    const [, file, width, height] = files[0];
    return {
      id: `share-art-${id}`,
      project,
      title,
      alt,
      href,
      action,
      use,
      credit,
      caption: `${caption}\n${href}`,
      original: `${base}/${file}`,
      image: `${base}/${id}-preview.${ext}`,
      thumbnail: `${base}/${id}-thumb.${ext}`,
      width,
      height,
      kind: "editorial composition",
      reviewedAt: "2026-11-13",
      addedAt: "2026-11-12T15:38:19Z",
      source: `${base}/sources.txt`,
      ...(art.find((row) => row[1] === project)?.[0] === id
        ? { socialPack: `${base}/${project}-social-kit.zip` }
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
