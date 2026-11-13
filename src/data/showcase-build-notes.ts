import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-build-notes";
export const buildNotesKit = (project: string) => `${base}/${project}-build-notes.zip`;
const art = [
  [
    "bubbles-bank-cartoon",
    "bubbles",
    "art",
    "Bank shots · Cartoon",
    "Bank shots in a 90s suburban animated sitcom treatment for Bubbles.",
    "A bank shot uses the side wall to reach a cluster with no direct line.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Story still", "bubbles-bank-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-bank-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-rhea-bench",
    "foilbury",
    "feature",
    "Rhea’s colour study · Build note",
    "Rhea’s colour study in a technical screenprint in midnight ink and orange ink on felt paper treatment for Foilbury.",
    "Rhea’s teal hair and coral streak do half the work of the portrait. We kept the teal and coral apart. Let them blend and the glasses are doing all the work.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    [
      ["Link preview", "foilbury-rhea-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "foilbury-rhea-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-reef-poster",
    "shoalshot",
    "feature",
    "Deep Tide · Poster",
    "Deep Tide in a polished neon-gel product photograph with high contrast and glossy texture treatment for SHOALSHOT.",
    "Deep Tide shifts the reef palette. The fish still have to read against it.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Landscape", "shoalshot-reef-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-reef-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-launch-poster",
    "app-composer",
    "feature",
    "A mark at three sizes · Poster",
    "A mark at three sizes in a acid-violet and orange concert screenprint with assertive hand-cut type with a focused warm palette and sharp material contrast treatment for App Composer.",
    "Launch Kit exports app icons, PWA assets and social artwork from one source.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    [
      ["Landscape", "app-composer-launch-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "app-composer-launch-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-stock-bench",
    "protocol-11",
    "feature",
    "The stock stays down · Build note",
    "The stock stays down in a fine fountain-pen crosshatch on warm paper with pigment swatch blocks treatment for Protocol 11.",
    "The stock is face down. The top of the discard is public. The two piles give away different information. The stock hides its next card. The discard tells everyone what is sitting there.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-stock-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-stock-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-night-cartoon",
    "loftwahfm",
    "art",
    "Night Signal · Cartoon",
    "Night Signal in a shōnen manga impact panel treatment for LoftwahFM.",
    "Night Signal is the after-dark LoftwahFM station for electronic grooves.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    [
      ["Story still", "loftwahfm-night-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-night-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-index-bench",
    "liferaft",
    "feature",
    "Search the index · Build note",
    "Search the index in a technical screenprint in midnight ink and orange ink on felt paper with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft indexes the archive locally for search. Build the local index, then search for the detail you can still remember. The blue drawers are the visual shorthand for that.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "liferaft-index-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-index-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-plate-bench",
    "woodhouse",
    "feature",
    "The contribution and the card · Build note",
    "The contribution and the card in a retro instruction-manual diagram treatment for Woodhouse.",
    "Source Plate puts a contribution beside the card composed from it. Put the contribution beside the result and you can see which parts travelled into the card.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    [
      ["Link preview", "woodhouse-plate-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "woodhouse-plate-bench.png", 1731, 909]
    ],
    "bench",
    "Codex ImageGen"
  ],
  [
    "woodhouse-loom-study",
    "woodhouse",
    "sketch",
    "How the fibres cross · Study",
    "How the fibres cross in a museum mineral plate with translucent glass treatment for Woodhouse.",
    "The homepage loom is a live browser piece made of crossing fibres.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Pinterest pin", "woodhouse-loom-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "woodhouse-loom-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-find-poster",
    "max",
    "feature",
    "Find in the browser · Poster",
    "Find in the browser in a heat-transfer sports poster treatment for MAX.",
    "FIND makes the locator sound in the Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Landscape", "max-find-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "max-find-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-draw-poster",
    "app-composer",
    "banner",
    "Keep the editable file · Poster",
    "Keep the editable file in a letterpress broadside with oversized wood type and real paper bite with a focused warm palette and sharp material contrast treatment for App Composer.",
    "LDraw can keep an editable drawing and export PNG or SVG.",
    "https://ldraw.loftwah.com/",
    "Try",
    [
      ["Discord banner", "app-composer-draw-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "app-composer-draw-poster.png", 1672, 941]
    ],
    "poster",
    "Codex ImageGen"
  ],
  [
    "fighter-tux-icon",
    "fighter",
    "icon",
    "A little Health for Charge · Icon",
    "A little Health for Charge in a soft vinyl collectible macro with one bold toy-scale silhouette treatment for Fighter.",
    "Ping spends some of Tux’s Health to send Charge to his team.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Profile icon", "fighter-tux-icon.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-tux-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-loom-bench",
    "woodhouse",
    "feature",
    "How the fibres cross · Build note",
    "How the fibres cross in a fine fountain-pen crosshatch on warm paper with pigment swatch blocks with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "The homepage loom is a live browser piece made of crossing fibres. The eye appears where the bundles cross. The light is what makes the strands readable as they move.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Link preview", "woodhouse-loom-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "woodhouse-loom-bench.png", 1731, 909]
    ],
    "bench",
    "Codex ImageGen"
  ],
  [
    "bubbles-bank-bench",
    "bubbles",
    "feature",
    "Bank shots · Build note",
    "Bank shots in a clean engineering blueprint treatment for Bubbles.",
    "A bank shot uses the side wall to reach a cluster with no direct line. The line shows the decision before you commit. A wall that only reflected the bubble after firing would make the shot feel like a guess.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "bubbles-bank-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-bank-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-reef-cartoon",
    "shoalshot",
    "art",
    "Deep Tide · Cartoon",
    "Deep Tide in a shōnen manga impact panel treatment for SHOALSHOT.",
    "Deep Tide shifts the reef palette. The fish still have to read against it.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Square feed", "shoalshot-reef-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-reef-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-moss-cartoon",
    "foilbury",
    "art",
    "Moss by the lantern · Cartoon",
    "Moss by the lantern in a early web pixel-art still with handmade dithering treatment for Foilbury.",
    "The hat, long ears and leaf pull tell you it is Moss before you see the card name.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Story still", "foilbury-moss-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-moss-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-tux-cartoon",
    "fighter",
    "art",
    "A little Health for Charge · Cartoon",
    "A little Health for Charge in a blocky 16-bit arcade title art treatment for Fighter.",
    "Ping spends some of Tux’s Health to send Charge to his team.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Square feed", "fighter-tux-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-tux-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-stock-cartoon",
    "protocol-11",
    "art",
    "The stock stays down · Cartoon",
    "The stock stays down in a suburban animated satire in lurid teal and mustard treatment for Protocol 11.",
    "The stock is face down. The top of the discard is public.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Story still", "protocol-11-stock-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "protocol-11-stock-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-launch-cartoon",
    "app-composer",
    "art",
    "A mark at three sizes · Cartoon",
    "A mark at three sizes in a 90s suburban animated sitcom treatment for App Composer.",
    "Launch Kit exports app icons, PWA assets and social artwork from one source.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    [
      ["Square feed", "app-composer-launch-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "app-composer-launch-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-night-bench",
    "loftwahfm",
    "feature",
    "Night Signal · Build note",
    "Night Signal in a warm plywood prototype photographed from above with one red annotation band with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Night Signal is the after-dark LoftwahFM station for electronic grooves. Night Signal has room for an evening of work. The station art starts with one cyan signal and leaves room around it.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    [
      ["Portrait feed", "loftwahfm-night-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-night-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-read-cartoon",
    "liferaft",
    "art",
    "The archive stays put · Cartoon",
    "The archive stays put in a early web pixel-art still with handmade dithering treatment for Liferaft.",
    "Liferaft opens a local MBOX archive in read-only mode.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Square feed", "liferaft-read-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-read-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-find-cartoon",
    "max",
    "art",
    "Find in the browser · Cartoon",
    "Find in the browser in a blocky 16-bit arcade title art treatment for MAX.",
    "FIND makes the locator sound in the Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Story still", "max-find-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-find-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-loom-cartoon",
    "woodhouse",
    "art",
    "How the fibres cross · Cartoon",
    "How the fibres cross in a suburban animated satire in lurid teal and mustard treatment for Woodhouse.",
    "The homepage loom is a live browser piece made of crossing fibres.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Square feed", "woodhouse-loom-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-loom-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-bank-poster",
    "bubbles",
    "feature",
    "Bank shots · Poster",
    "Bank shots in a acid-violet and orange concert screenprint with assertive hand-cut type treatment for Bubbles.",
    "A bank shot uses the side wall to reach a cluster with no direct line.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Landscape", "bubbles-bank-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "bubbles-bank-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-reef-bench",
    "shoalshot",
    "feature",
    "Deep Tide · Build note",
    "Deep Tide in a warm plywood prototype photographed from above with one red annotation band treatment for SHOALSHOT.",
    "Deep Tide shifts the reef palette. The fish still have to read against it. The reef gives the water depth, but the shoal still has to pop in front of it. The illustration pulls those two jobs apart.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Link preview", "shoalshot-reef-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-reef-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-moss-bench",
    "foilbury",
    "feature",
    "Moss by the lantern · Build note",
    "Moss by the lantern in a sharp isometric paper model on pale mint with no perspective distortions treatment for Foilbury.",
    "The hat, long ears and leaf pull tell you it is Moss before you see the card name. Take the lantern away and the hat, ears and leaf pull still give you Moss. That's the bit worth keeping through a style change.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Portrait feed", "foilbury-moss-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-moss-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-tux-bench",
    "fighter",
    "feature",
    "A little Health for Charge · Build note",
    "A little Health for Charge in a hardware design-journal photo treatment for Fighter.",
    "Ping spends some of Tux’s Health to send Charge to his team. Ping makes the little penguin a team decision. Spending Health on Charge changes what the next fighter can do.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Link preview", "fighter-tux-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "fighter-tux-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-stock-poster",
    "protocol-11",
    "feature",
    "The stock stays down · Poster",
    "The stock stays down in a street-art stencil in three heavy opaque colours treatment for Protocol 11.",
    "The stock is face down. The top of the discard is public.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Landscape", "protocol-11-stock-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "protocol-11-stock-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-launch-bench",
    "app-composer",
    "feature",
    "A mark at three sizes · Build note",
    "A mark at three sizes in a clean engineering blueprint treatment for App Composer.",
    "Launch Kit exports app icons, PWA assets and social artwork from one source. A mark that works on a card may turn into a dot as a favicon. Checking the sizes together makes that failure easy to see.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    [
      ["Link preview", "app-composer-launch-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "app-composer-launch-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-night-poster",
    "loftwahfm",
    "feature",
    "Night Signal · Poster",
    "Night Signal in a polished neon-gel product photograph with high contrast and glossy texture with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Night Signal is the after-dark LoftwahFM station for electronic grooves.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    [
      ["Landscape", "loftwahfm-night-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "loftwahfm-night-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-read-bench",
    "liferaft",
    "feature",
    "The archive stays put · Build note",
    "The archive stays put in a sharp isometric paper model on pale mint with no perspective distortions with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft opens a local MBOX archive in read-only mode. Recovery is easier to trust when the archive stays where you found it. Open the source and take out the part you need.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Link preview", "liferaft-read-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "liferaft-read-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-find-bench",
    "max",
    "feature",
    "Find in the browser · Build note",
    "Find in the browser in a hardware design-journal photo treatment for MAX.",
    "FIND makes the locator sound in the Virtual MAX browser simulator. A sound cue makes the Find action easy to notice in the browser demo. The picture shows that cue as an amber ring.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Portrait feed", "max-find-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-find-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-bank-study",
    "bubbles",
    "sketch",
    "Bank shots · Study",
    "Bank shots in a pressed flowers and leaf fragments photographed on black felt treatment for Bubbles.",
    "A bank shot uses the side wall to reach a cluster with no direct line.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "bubbles-bank-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-bank-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-reef-study",
    "shoalshot",
    "sketch",
    "Deep Tide · Study",
    "Deep Tide in a graphite and red pencil thumbnail study treatment for SHOALSHOT.",
    "Deep Tide shifts the reef palette. The fish still have to read against it.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "shoalshot-reef-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "shoalshot-reef-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-moss-poster",
    "foilbury",
    "feature",
    "Moss by the lantern · Poster",
    "Moss by the lantern in a modernist swiss music poster with oversized cut-out letters and inked grid treatment for Foilbury.",
    "The hat, long ears and leaf pull tell you it is Moss before you see the card name.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Landscape", "foilbury-moss-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "foilbury-moss-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-tux-poster",
    "fighter",
    "feature",
    "A little Health for Charge · Poster",
    "A little Health for Charge in a heat-transfer sports poster treatment for Fighter.",
    "Ping spends some of Tux’s Health to send Charge to his team.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Landscape", "fighter-tux-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "fighter-tux-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-stock-study",
    "protocol-11",
    "sketch",
    "The stock stays down · Study",
    "The stock stays down in a museum mineral plate with translucent glass treatment for Protocol 11.",
    "The stock is face down. The top of the discard is public.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-stock-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-stock-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-launch-study",
    "app-composer",
    "sketch",
    "A mark at three sizes · Study",
    "A mark at three sizes in a pressed flowers and leaf fragments photographed on black felt with a focused warm palette and sharp material contrast treatment for App Composer.",
    "Launch Kit exports app icons, PWA assets and social artwork from one source.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    [
      ["Pinterest pin", "app-composer-launch-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "app-composer-launch-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-night-study",
    "loftwahfm",
    "sketch",
    "Night Signal · Study",
    "Night Signal in a graphite and red pencil thumbnail study treatment for LoftwahFM.",
    "Night Signal is the after-dark LoftwahFM station for electronic grooves.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    [
      ["Portrait feed", "loftwahfm-night-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-night-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-read-poster",
    "liferaft",
    "feature",
    "The archive stays put · Poster",
    "The archive stays put in a modernist swiss music poster with oversized cut-out letters and inked grid with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft opens a local MBOX archive in read-only mode.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Landscape", "liferaft-read-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "liferaft-read-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-find-study",
    "max",
    "sketch",
    "Find in the browser · Study",
    "Find in the browser in a pierced tin silhouette backlit in dark crimson and gold with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "FIND makes the locator sound in the Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Portrait feed", "max-find-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-find-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-loom-poster",
    "woodhouse",
    "feature",
    "How the fibres cross · Poster",
    "How the fibres cross in a street-art stencil in three heavy opaque colours treatment for Woodhouse.",
    "The homepage loom is a live browser piece made of crossing fibres.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Landscape", "woodhouse-loom-poster.jpg", 1600, 900],
      ["ImageGen original PNG", "woodhouse-loom-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-bank-icon",
    "bubbles",
    "icon",
    "Bank shots · Icon",
    "Bank shots in a nintendo-era pocket-console pixel badge treatment for Bubbles.",
    "A bank shot uses the side wall to reach a cluster with no direct line.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Profile icon", "bubbles-bank-icon.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-bank-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-reef-icon",
    "shoalshot",
    "icon",
    "Deep Tide · Icon",
    "Deep Tide in a prismatic crt headshot with one scan tear and hard circular silhouette treatment for SHOALSHOT.",
    "Deep Tide shifts the reef palette. The fish still have to read against it.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Profile icon", "shoalshot-reef-icon.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-reef-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-moss-study",
    "foilbury",
    "sketch",
    "Moss by the lantern · Study",
    "Moss by the lantern in a tactile cardboard assemblage shot like an auction catalogue treatment for Foilbury.",
    "The hat, long ears and leaf pull tell you it is Moss before you see the card name.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Portrait feed", "foilbury-moss-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-moss-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-tux-study",
    "fighter",
    "sketch",
    "A little Health for Charge · Study",
    "A little Health for Charge in a pierced tin silhouette backlit in dark crimson and gold treatment for Fighter.",
    "Ping spends some of Tux’s Health to send Charge to his team.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "fighter-tux-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "fighter-tux-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-stock-icon",
    "protocol-11",
    "icon",
    "The stock stays down · Icon",
    "The stock stays down in a white porcelain avatar with a thick cobalt line and spare decoration treatment for Protocol 11.",
    "The stock is face down. The top of the discard is public.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Profile icon", "protocol-11-stock-icon.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-stock-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-launch-icon",
    "app-composer",
    "icon",
    "A mark at three sizes · Icon",
    "A mark at three sizes in a nintendo-era pocket-console pixel badge treatment for App Composer.",
    "Launch Kit exports app icons, PWA assets and social artwork from one source.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    [
      ["Profile icon", "app-composer-launch-icon.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-launch-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-night-icon",
    "loftwahfm",
    "icon",
    "Night Signal · Icon",
    "Night Signal in a prismatic crt headshot with one scan tear and hard circular silhouette with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Night Signal is the after-dark LoftwahFM station for electronic grooves.",
    "https://fm.loftwah.com/radio?station=night-signal",
    "Listen",
    [
      ["Profile icon", "loftwahfm-night-icon.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-night-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-read-study",
    "liferaft",
    "sketch",
    "The archive stays put · Study",
    "The archive stays put in a tactile cardboard assemblage shot like an auction catalogue with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft opens a local MBOX archive in read-only mode.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Pinterest pin", "liferaft-read-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "liferaft-read-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-find-icon",
    "max",
    "icon",
    "Find in the browser · Icon",
    "Find in the browser in a soft vinyl collectible macro with one bold toy-scale silhouette with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "FIND makes the locator sound in the Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Profile icon", "max-find-icon.jpg", 512, 512],
      ["ImageGen original PNG", "max-find-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-loom-icon",
    "woodhouse",
    "icon",
    "How the fibres cross · Icon",
    "How the fibres cross in a white porcelain avatar with a thick cobalt line and spare decoration with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "The homepage loom is a live browser piece made of crossing fibres.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "woodhouse-loom-icon.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-loom-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-canopy-cartoon",
    "bubbles",
    "art",
    "Break the canopy · Cartoon",
    "Break the canopy in a rubber-hose black-ink cartoon on warm newsprint treatment for Bubbles.",
    "Lantern Finale gives you eight shots to bring down the canopy.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Square feed", "bubbles-canopy-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-canopy-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-ray-cartoon",
    "shoalshot",
    "art",
    "Lantern Ray · Cartoon",
    "Lantern Ray in a hand-painted 90s ova background plate treatment for SHOALSHOT.",
    "The Lantern Ray reads as a broad wing before the speckles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Story still", "shoalshot-ray-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-ray-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-moss-icon",
    "foilbury",
    "icon",
    "Moss by the lantern · Icon",
    "Moss by the lantern in a round woodblock stamp treatment for Foilbury.",
    "The hat, long ears and leaf pull tell you it is Moss before you see the card name.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Profile icon", "foilbury-moss-icon.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-moss-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-viking-cartoon",
    "fighter",
    "art",
    "Viking’s next hit · Cartoon",
    "Viking’s next hit in a children’s picture-book gouache treatment for Fighter.",
    "Viking can bank Power for his next attack. The attack spends the stacks.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Story still", "fighter-viking-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-viking-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-kitchen-cartoon",
    "protocol-11",
    "art",
    "Kitchen Table · Cartoon",
    "Kitchen Table in a scratchy underground comix treatment for Protocol 11.",
    "A room treatment changes the feel of the table without changing the deal.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Square feed", "protocol-11-kitchen-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol-11-kitchen-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-paper-cartoon",
    "app-composer",
    "art",
    "A PDF stays here · Cartoon",
    "A PDF stays here in a rubber-hose black-ink cartoon on warm newsprint treatment for App Composer.",
    "Paperwork fills and signs PDFs locally in the browser.",
    "https://paperwork.loftwah.com/",
    "Try",
    [
      ["Story still", "app-composer-paper-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "app-composer-paper-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-low-cartoon",
    "loftwahfm",
    "art",
    "Low Tide · Cartoon",
    "Low Tide in a hand-painted 90s ova background plate treatment for LoftwahFM.",
    "Low Tide is a station of unhurried instrumentals.",
    "https://fm.loftwah.com/radio?station=low-tide",
    "Listen",
    [
      ["Square feed", "loftwahfm-low-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-low-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-read-icon",
    "liferaft",
    "icon",
    "The archive stays put · Icon",
    "The archive stays put in a round woodblock stamp treatment for Liferaft.",
    "Liferaft opens a local MBOX archive in read-only mode.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "liferaft-read-icon.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-read-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-stop-cartoon",
    "max",
    "art",
    "Stop the sound · Cartoon",
    "Stop the sound in a children’s picture-book gouache treatment for MAX.",
    "STOP silences the locator in the Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Square feed", "max-stop-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "max-stop-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-patch-cartoon",
    "woodhouse",
    "art",
    "Game sound and radio · Cartoon",
    "Game sound and radio in a scratchy underground comix treatment for Woodhouse.",
    "Patch Bench lets the game and LoftwahFM radio be heard through separate controls.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    [
      ["Story still", "woodhouse-patch-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "woodhouse-patch-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-canopy-bench",
    "bubbles",
    "feature",
    "Break the canopy · Build note",
    "Break the canopy in a workshop notebook with grease pencil treatment for Bubbles.",
    "Lantern Finale gives you eight shots to bring down the canopy. The interesting shot is the one that detaches the cluster. The eight-shot budget gives the canopy a reason to matter.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Link preview", "bubbles-canopy-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "bubbles-canopy-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-ray-bench",
    "shoalshot",
    "feature",
    "Lantern Ray · Build note",
    "Lantern Ray in a contemporary editorial technical cutaway treatment for SHOALSHOT.",
    "The Lantern Ray reads as a broad wing before the speckles resolve. The wings carry identification from a distance. The little lights are a reward for a closer look.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "shoalshot-ray-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-ray-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-rhea-cartoon",
    "foilbury",
    "art",
    "Rhea’s colour study · Cartoon",
    "Rhea’s colour study in a contemporary animated sitcom cold open with thick contours and deliberately ordinary suburban furniture treatment for Foilbury.",
    "Rhea’s teal hair and coral streak do half the work of the portrait.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    [
      ["Square feed", "foilbury-rhea-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-rhea-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-viking-bench",
    "fighter",
    "feature",
    "Viking’s next hit · Build note",
    "Viking’s next hit in a monochrome newsprint process story with a warm colour spot and clipped corners treatment for Fighter.",
    "Viking can bank Power for his next attack. The attack spends the stacks. Stacking Power leaves you with a decision about when to spend it. The stone pile is the idea drawn in one object.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "fighter-viking-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-viking-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-kitchen-bench",
    "protocol-11",
    "feature",
    "Kitchen Table · Build note",
    "Kitchen Table in a one clean editorial sequence as three geometric plates treatment for Protocol 11.",
    "A room treatment changes the feel of the table without changing the deal. Lighting and furniture carry the feel of the room. The play still belongs to the table.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Link preview", "protocol-11-kitchen-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "protocol-11-kitchen-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-paper-bench",
    "app-composer",
    "feature",
    "A PDF stays here · Build note",
    "A PDF stays here in a workshop notebook with grease pencil treatment for App Composer.",
    "Paperwork fills and signs PDFs locally in the browser. The PDF work happens in the browser. The useful part of the flow is finishing the document and leaving with the file.",
    "https://paperwork.loftwah.com/",
    "Try",
    [
      ["Portrait feed", "app-composer-paper-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-paper-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-low-bench",
    "loftwahfm",
    "feature",
    "Low Tide · Build note",
    "Low Tide in a contemporary editorial technical cutaway treatment for LoftwahFM.",
    "Low Tide is a station of unhurried instrumentals. The open horizon gave the sleeve the same pace as the station. A crowded layout would make a different promise.",
    "https://fm.loftwah.com/radio?station=low-tide",
    "Listen",
    [
      ["Link preview", "loftwahfm-low-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "loftwahfm-low-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-index-cartoon",
    "liferaft",
    "art",
    "Search the index · Cartoon",
    "Search the index in a contemporary animated sitcom cold open with thick contours and deliberately ordinary suburban furniture with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft indexes the archive locally for search.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Story still", "liferaft-index-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "liferaft-index-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-stop-bench",
    "max",
    "feature",
    "Stop the sound · Build note",
    "Stop the sound in a monochrome newsprint process story with a warm colour spot and clipped corners with a focused warm palette and sharp material contrast treatment for MAX.",
    "STOP silences the locator in the Virtual MAX browser simulator. Find needs an obvious way to stop. The ending of the waveform is the whole point of the drawing.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Link preview", "max-stop-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "max-stop-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-patch-bench",
    "woodhouse",
    "feature",
    "Game sound and radio · Build note",
    "Game sound and radio in a one clean editorial sequence as three geometric plates treatment for Woodhouse.",
    "Patch Bench gives the game and radio separate controls. Try muting one while the other plays. A game sound and a music stream are two different things to control. The exhibit leaves both audible and gives each its own place.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    [
      ["Portrait feed", "woodhouse-patch-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-patch-bench.png", 1122, 1402]
    ],
    "bench",
    "Codex ImageGen"
  ],
  [
    "bubbles-canopy-poster",
    "bubbles",
    "banner",
    "Break the canopy · Poster",
    "Break the canopy in a subterranean club flyer in black ink and one phosphor green glow treatment for Bubbles.",
    "Lantern Finale gives you eight shots to bring down the canopy.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["X header", "bubbles-canopy-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "bubbles-canopy-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-ray-poster",
    "shoalshot",
    "banner",
    "Lantern Ray · Poster",
    "Lantern Ray in a metallic fanzine pasteup with bold distressed typography and one loud lime colour treatment for SHOALSHOT.",
    "The Lantern Ray reads as a broad wing before the speckles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["X header", "shoalshot-ray-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "shoalshot-ray-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-rhea-poster",
    "foilbury",
    "banner",
    "Rhea’s colour study · Poster",
    "Rhea’s colour study in a 60s tabloid horror lithography treatment for Foilbury.",
    "Rhea’s teal hair and coral streak do half the work of the portrait.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    [
      ["X header", "foilbury-rhea-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "foilbury-rhea-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-viking-poster",
    "fighter",
    "banner",
    "Viking’s next hit · Poster",
    "Viking’s next hit in a distressed steel type stamped into real rust-red material treatment for Fighter.",
    "Viking can bank Power for his next attack. The attack spends the stacks.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["X header", "fighter-viking-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "fighter-viking-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-kitchen-poster",
    "protocol-11",
    "banner",
    "Kitchen Table · Poster",
    "Kitchen Table in a rubber-stamp poster in burnt orange and ultramarine over old off-white paper treatment for Protocol 11.",
    "A room treatment changes the feel of the table without changing the deal.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["X header", "protocol-11-kitchen-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "protocol-11-kitchen-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-paper-poster",
    "app-composer",
    "banner",
    "A PDF stays here · Poster",
    "A PDF stays here in a subterranean club flyer in black ink and one phosphor green glow with a focused warm palette and sharp material contrast treatment for App Composer.",
    "Paperwork fills and signs PDFs locally in the browser.",
    "https://paperwork.loftwah.com/",
    "Try",
    [
      ["X header", "app-composer-paper-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "app-composer-paper-poster.png", 2172, 724]
    ],
    "poster",
    "Codex ImageGen"
  ],
  [
    "loftwahfm-low-poster",
    "loftwahfm",
    "banner",
    "Low Tide · Poster",
    "Low Tide in a metallic fanzine pasteup with bold distressed typography and one loud lime colour with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Low Tide is a station of unhurried instrumentals.",
    "https://fm.loftwah.com/radio?station=low-tide",
    "Listen",
    [
      ["X header", "loftwahfm-low-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "loftwahfm-low-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-index-poster",
    "liferaft",
    "banner",
    "Search the index · Poster",
    "Search the index in a 60s tabloid horror lithography treatment for Liferaft.",
    "Liferaft indexes the archive locally for search.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["X header", "liferaft-index-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "liferaft-index-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-stop-poster",
    "max",
    "banner",
    "Stop the sound · Poster",
    "Stop the sound in a distressed steel type stamped into real rust-red material with a focused warm palette and sharp material contrast treatment for MAX.",
    "STOP silences the locator in the Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["X header", "max-stop-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "max-stop-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-patch-poster",
    "woodhouse",
    "banner",
    "Game sound and radio · Poster",
    "Game sound and radio in a rubber-stamp poster in burnt orange and ultramarine over old off-white paper with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Patch Bench lets the game and LoftwahFM radio be heard through separate controls.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    [
      ["X header", "woodhouse-patch-poster.jpg", 1500, 500],
      ["ImageGen original PNG", "woodhouse-patch-poster.png", 1536, 512]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-canopy-study",
    "bubbles",
    "sketch",
    "Break the canopy · Study",
    "Break the canopy in a underwater ink suspension in a glass slab treatment for Bubbles.",
    "Lantern Finale gives you eight shots to bring down the canopy.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "bubbles-canopy-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "bubbles-canopy-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-ray-study",
    "shoalshot",
    "sketch",
    "Lantern Ray · Study",
    "Lantern Ray in a oil pastel with dense pigment and scratched-back highlights treatment for SHOALSHOT.",
    "The Lantern Ray reads as a broad wing before the speckles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "shoalshot-ray-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-ray-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-rhea-study",
    "foilbury",
    "sketch",
    "Rhea’s colour study · Study",
    "Rhea’s colour study in a high contrast xerox cyanotype texture treatment for Foilbury.",
    "Rhea’s teal hair and coral streak do half the work of the portrait.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    [
      ["Pinterest pin", "foilbury-rhea-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "foilbury-rhea-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-viking-study",
    "fighter",
    "sketch",
    "Viking’s next hit · Study",
    "Viking’s next hit in a textile quilt portrait with visible stitches and confident simplified form treatment for Fighter.",
    "Viking can bank Power for his next attack. The attack spends the stacks.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "fighter-viking-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-viking-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-kitchen-study",
    "protocol-11",
    "sketch",
    "Kitchen Table · Study",
    "Kitchen Table in a glazed ceramic piece with clear pressure marks and reflected colour treatment for Protocol 11.",
    "A room treatment changes the feel of the table without changing the deal.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "protocol-11-kitchen-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "protocol-11-kitchen-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-paper-study",
    "app-composer",
    "sketch",
    "A PDF stays here · Study",
    "A PDF stays here in a underwater ink suspension in a glass slab treatment for App Composer.",
    "Paperwork fills and signs PDFs locally in the browser.",
    "https://paperwork.loftwah.com/",
    "Try",
    [
      ["Portrait feed", "app-composer-paper-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-paper-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-low-study",
    "loftwahfm",
    "sketch",
    "Low Tide · Study",
    "Low Tide in a oil pastel with dense pigment and scratched-back highlights with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Low Tide is a station of unhurried instrumentals.",
    "https://fm.loftwah.com/radio?station=low-tide",
    "Listen",
    [
      ["Pinterest pin", "loftwahfm-low-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "loftwahfm-low-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-index-study",
    "liferaft",
    "sketch",
    "Search the index · Study",
    "Search the index in a high contrast xerox cyanotype texture treatment for Liferaft.",
    "Liferaft indexes the archive locally for search.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "liferaft-index-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-index-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-stop-study",
    "max",
    "sketch",
    "Stop the sound · Study",
    "Stop the sound in a textile quilt portrait with visible stitches and confident simplified form with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "STOP silences the locator in the Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Pinterest pin", "max-stop-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "max-stop-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-patch-study",
    "woodhouse",
    "sketch",
    "Game sound and radio · Study",
    "Game sound and radio in a glazed ceramic piece with clear pressure marks and reflected colour with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Patch Bench lets the game and LoftwahFM radio be heard through separate controls.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    [
      ["Portrait feed", "woodhouse-patch-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-patch-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-canopy-icon",
    "bubbles",
    "icon",
    "Break the canopy · Icon",
    "Break the canopy in a blown-glass object study with clean colour boundary and bright single background treatment for Bubbles.",
    "Lantern Finale gives you eight shots to bring down the canopy.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Profile icon", "bubbles-canopy-icon.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-canopy-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-ray-icon",
    "shoalshot",
    "icon",
    "Lantern Ray · Icon",
    "Lantern Ray in a small plush mascot patch treatment for SHOALSHOT.",
    "The Lantern Ray reads as a broad wing before the speckles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Profile icon", "shoalshot-ray-icon.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-ray-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-rhea-icon",
    "foilbury",
    "icon",
    "Rhea’s colour study · Icon",
    "Rhea’s colour study in a felt appliqué profile tile with chunky colour blocks treatment for Foilbury.",
    "Rhea’s teal hair and coral streak do half the work of the portrait.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    [
      ["Profile icon", "foilbury-rhea-icon.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-rhea-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-viking-icon",
    "fighter",
    "icon",
    "Viking’s next hit · Icon",
    "Viking’s next hit in a comic-print halftone token on sunny orange with wide circular safe area treatment for Fighter.",
    "Viking can bank Power for his next attack. The attack spends the stacks.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Profile icon", "fighter-viking-icon.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-viking-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-kitchen-icon",
    "protocol-11",
    "icon",
    "Kitchen Table · Icon",
    "Kitchen Table in a acid yellow and black die-cut vinyl emblem treatment for Protocol 11.",
    "A room treatment changes the feel of the table without changing the deal.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Profile icon", "protocol-11-kitchen-icon.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-kitchen-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-paper-icon",
    "app-composer",
    "icon",
    "A PDF stays here · Icon",
    "A PDF stays here in a blown-glass object study with clean colour boundary and bright single background with a focused warm palette and sharp material contrast treatment for App Composer.",
    "Paperwork fills and signs PDFs locally in the browser.",
    "https://paperwork.loftwah.com/",
    "Try",
    [
      ["Profile icon", "app-composer-paper-icon.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-paper-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-low-icon",
    "loftwahfm",
    "icon",
    "Low Tide · Icon",
    "Low Tide in a small plush mascot patch treatment for LoftwahFM.",
    "Low Tide is a station of unhurried instrumentals.",
    "https://fm.loftwah.com/radio?station=low-tide",
    "Listen",
    [
      ["Profile icon", "loftwahfm-low-icon.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-low-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-index-icon",
    "liferaft",
    "icon",
    "Search the index · Icon",
    "Search the index in a felt appliqué profile tile with chunky colour blocks with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft indexes the archive locally for search.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "liferaft-index-icon.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-index-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-stop-icon",
    "max",
    "icon",
    "Stop the sound · Icon",
    "Stop the sound in a comic-print halftone token on sunny orange with wide circular safe area with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "STOP silences the locator in the Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Profile icon", "max-stop-icon.jpg", 512, 512],
      ["ImageGen original PNG", "max-stop-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-patch-icon",
    "woodhouse",
    "icon",
    "Game sound and radio · Icon",
    "Game sound and radio in a acid yellow and black die-cut vinyl emblem treatment for Woodhouse.",
    "Patch Bench lets the game and LoftwahFM radio be heard through separate controls.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    [
      ["Profile icon", "woodhouse-patch-icon.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-patch-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fizz-cartoon",
    "bubbles",
    "art",
    "One eye will do · Cartoon",
    "One eye will do in a clay stop-motion with obvious fingerprints treatment for Bubbles.",
    "Fizz’s silhouette reads as one eye and one droplet before any detail loads.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Story still", "bubbles-fizz-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-fizz-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-jelly-cartoon",
    "shoalshot",
    "art",
    "Crown Jelly · Cartoon",
    "Crown Jelly in a scratched ink underground zine with cobalt risograph registration drift treatment for SHOALSHOT.",
    "The specimen’s outline does the first bit of identification for you.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Square feed", "shoalshot-jelly-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-jelly-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-pippa-cartoon",
    "foilbury",
    "art",
    "Pippa from the cabinet · Cartoon",
    "Pippa from the cabinet in a paper-silhouette shadow play with violet gels and one strong practical lamp treatment for Foilbury.",
    "Pippa’s black coat needs enough separation to keep her expression visible.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    [
      ["Story still", "foilbury-pippa-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-pippa-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-reaper-cartoon",
    "fighter",
    "art",
    "Grim Reaper · Cartoon",
    "Grim Reaper in a animated feature colour key treatment for Fighter.",
    "The pale skull and hood carry Grim Reaper’s read in a crowded lineup.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Square feed", "fighter-reaper-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-reaper-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-arcade-cartoon",
    "protocol-11",
    "art",
    "Arcade Pop · Cartoon",
    "Arcade Pop in a 3d plasticine miniature treatment for Protocol 11.",
    "Arcade Pop is a visual theme for the Protocol 11 table.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Story still", "protocol-11-arcade-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "protocol-11-arcade-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-guest-cartoon",
    "app-composer",
    "art",
    "The postcard gets approved · Cartoon",
    "The postcard gets approved in a clay stop-motion with obvious fingerprints treatment for App Composer.",
    "Approved Guestbook postcards can appear on a public Creator Hub.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Square feed", "app-composer-guest-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "app-composer-guest-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-cartridge-cartoon",
    "loftwahfm",
    "art",
    "Cartridge Club · Cartoon",
    "Cartridge Club in a scratched ink underground zine with cobalt risograph registration drift with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Cartridge Club pairs chiptune swing with instrumental hip hop.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Story still", "loftwahfm-cartridge-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-cartridge-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-three-cartoon",
    "liferaft",
    "art",
    "Three panes · Cartoon",
    "Three panes in a paper-silhouette shadow play with violet gels and one strong practical lamp with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft keeps archive, message list and preview in view together.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Square feed", "liferaft-three-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-three-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-voice-cartoon",
    "max",
    "art",
    "The simulated transcript · Cartoon",
    "The simulated transcript in a animated feature colour key treatment for MAX.",
    "The public demo uses a simulated transcript for its voice button.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Story still", "max-voice-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-voice-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-plate-cartoon",
    "woodhouse",
    "art",
    "The contribution and the card · Cartoon",
    "The contribution and the card in a 3d plasticine miniature treatment for Woodhouse.",
    "Source Plate puts a contribution beside the card composed from it.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    [
      ["Square feed", "woodhouse-plate-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-plate-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fizz-bench",
    "bubbles",
    "feature",
    "One eye will do · Build note",
    "One eye will do in a mechanical exploded-view sheet treatment for Bubbles.",
    "Fizz’s silhouette reads as one eye and one droplet before any detail loads. The big eye carries the expression at icon size. The curl does the rest of the silhouette work.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "bubbles-fizz-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-fizz-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-jelly-bench",
    "shoalshot",
    "feature",
    "Crown Jelly · Build note",
    "Crown Jelly in a old electrical handbook diagram with copper etched outlines and generous margins treatment for SHOALSHOT.",
    "The specimen’s outline does the first bit of identification for you. The crown shape carries the first read. Smaller filaments can wait until the specimen plate opens.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Link preview", "shoalshot-jelly-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-jelly-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-pippa-bench",
    "foilbury",
    "feature",
    "Pippa from the cabinet · Build note",
    "Pippa from the cabinet in a white ink on transparent vellum arranged over a single key object treatment for Foilbury.",
    "Pippa’s black coat needs enough separation to keep her expression visible. On a dark card, a little light round the ears and muzzle is enough. It leaves room for the face to do the talking.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    [
      ["Portrait feed", "foilbury-pippa-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-pippa-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-reaper-bench",
    "fighter",
    "feature",
    "Grim Reaper · Build note",
    "Grim Reaper in a photographic loupe crop on desk treatment for Fighter.",
    "The pale skull and hood carry Grim Reaper’s read in a crowded lineup. The white skull shape survives where the folds of the hood disappear. A busy roster is the test for that.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Link preview", "fighter-reaper-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "fighter-reaper-bench.png", 1731, 909]
    ],
    "bench",
    "Codex ImageGen"
  ],
  [
    "protocol-11-arcade-bench",
    "protocol-11",
    "feature",
    "Arcade Pop · Build note",
    "Arcade Pop in a retro instruction-manual diagram treatment for Protocol 11.",
    "Arcade Pop is a visual theme for the Protocol 11 table. The neon sits outside the deal. We can turn it up around an empty table without teaching the wrong card state.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-arcade-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-arcade-bench.png", 1122, 1402]
    ],
    "bench",
    "Codex ImageGen"
  ],
  [
    "app-composer-guest-bench",
    "app-composer",
    "feature",
    "The postcard gets approved · Build note",
    "The postcard gets approved in a mechanical exploded-view sheet treatment for App Composer.",
    "Approved Guestbook postcards can appear on a public Creator Hub. A postcard becomes a public piece only after approval. The stamp makes that decision visible.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Link preview", "app-composer-guest-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "app-composer-guest-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-cartridge-bench",
    "loftwahfm",
    "feature",
    "Cartridge Club · Build note",
    "Cartridge Club in a old electrical handbook diagram with copper etched outlines and generous margins with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Cartridge Club pairs chiptune swing with instrumental hip hop. A cartridge and a beat machine show the two halves of the station in one glance.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Portrait feed", "loftwahfm-cartridge-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-cartridge-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-three-bench",
    "liferaft",
    "feature",
    "Three panes · Build note",
    "Three panes in a white ink on transparent vellum arranged over a single key object with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft keeps archive, message list and preview in view together. Keeping the folder, message list and preview in view makes it easier to tell where the result came from.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Link preview", "liferaft-three-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "liferaft-three-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-voice-bench",
    "max",
    "feature",
    "The simulated transcript · Build note",
    "The simulated transcript in a photographic loupe crop on desk treatment for MAX.",
    "The public demo uses a simulated transcript for its voice button. The public demo can show the interaction without recording a microphone. Its transcript is simulated.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Portrait feed", "max-voice-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-voice-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fizz-poster",
    "bubbles",
    "art",
    "One eye will do · Poster",
    "One eye will do in a hard direct-flash street photograph treatment for Bubbles.",
    "Fizz’s silhouette reads as one eye and one droplet before any detail loads.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "bubbles-fizz-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "bubbles-fizz-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-jelly-poster",
    "shoalshot",
    "art",
    "Crown Jelly · Poster",
    "Crown Jelly in a chrome relief on an electric-blue stage treatment for SHOALSHOT.",
    "The specimen’s outline does the first bit of identification for you.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "shoalshot-jelly-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "shoalshot-jelly-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-pippa-poster",
    "foilbury",
    "art",
    "Pippa from the cabinet · Poster",
    "Pippa from the cabinet in a laser-light stage poster with deep blacks and bright spot colours treatment for Foilbury.",
    "Pippa’s black coat needs enough separation to keep her expression visible.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    [
      ["Pinterest pin", "foilbury-pippa-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "foilbury-pippa-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-reaper-poster",
    "fighter",
    "art",
    "Grim Reaper · Poster",
    "Grim Reaper in a late-night backlit cinema marquee treatment for Fighter.",
    "The pale skull and hood carry Grim Reaper’s read in a crowded lineup.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "fighter-reaper-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "fighter-reaper-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-arcade-poster",
    "protocol-11",
    "art",
    "Arcade Pop · Poster",
    "Arcade Pop in a arcade marquee poster with large rough type treatment for Protocol 11.",
    "Arcade Pop is a visual theme for the Protocol 11 table.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "protocol-11-arcade-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "protocol-11-arcade-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-guest-poster",
    "app-composer",
    "art",
    "The postcard gets approved · Poster",
    "The postcard gets approved in a hard direct-flash street photograph treatment for App Composer.",
    "Approved Guestbook postcards can appear on a public Creator Hub.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Pinterest pin", "app-composer-guest-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "app-composer-guest-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-cartridge-poster",
    "loftwahfm",
    "art",
    "Cartridge Club · Poster",
    "Cartridge Club in a chrome relief on an electric-blue stage treatment for LoftwahFM.",
    "Cartridge Club pairs chiptune swing with instrumental hip hop.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Pinterest pin", "loftwahfm-cartridge-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "loftwahfm-cartridge-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-three-poster",
    "liferaft",
    "art",
    "Three panes · Poster",
    "Three panes in a laser-light stage poster with deep blacks and bright spot colours with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft keeps archive, message list and preview in view together.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Pinterest pin", "liferaft-three-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "liferaft-three-poster.png", 1024, 1536]
    ],
    "poster",
    "Codex ImageGen"
  ],
  [
    "max-voice-poster",
    "max",
    "art",
    "The simulated transcript · Poster",
    "The simulated transcript in a late-night backlit cinema marquee treatment for MAX.",
    "The public demo uses a simulated transcript for its voice button.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Pinterest pin", "max-voice-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "max-voice-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-plate-poster",
    "woodhouse",
    "art",
    "The contribution and the card · Poster",
    "The contribution and the card in a arcade marquee poster with large rough type treatment for Woodhouse.",
    "Source Plate puts a contribution beside the card composed from it.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    [
      ["Pinterest pin", "woodhouse-plate-poster.jpg", 1000, 1500],
      ["ImageGen original PNG", "woodhouse-plate-poster.png", 1024, 1536]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fizz-study",
    "bubbles",
    "sketch",
    "One eye will do · Study",
    "One eye will do in a fine wire sculpture on dark cream paper treatment for Bubbles.",
    "Fizz’s silhouette reads as one eye and one droplet before any detail loads.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "bubbles-fizz-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-fizz-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-jelly-study",
    "shoalshot",
    "sketch",
    "Crown Jelly · Study",
    "Crown Jelly in a handmade paper mosaic in electric coral and bottle green treatment for SHOALSHOT.",
    "The specimen’s outline does the first bit of identification for you.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "shoalshot-jelly-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "shoalshot-jelly-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-pippa-study",
    "foilbury",
    "sketch",
    "Pippa from the cabinet · Study",
    "Pippa from the cabinet in a neon pinball glass reverse paint treatment for Foilbury.",
    "Pippa’s black coat needs enough separation to keep her expression visible.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    [
      ["Portrait feed", "foilbury-pippa-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-pippa-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-reaper-study",
    "fighter",
    "sketch",
    "Grim Reaper · Study",
    "Grim Reaper in a foam puppet sculpture photographed on cobalt stage treatment for Fighter.",
    "The pale skull and hood carry Grim Reaper’s read in a crowded lineup.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "fighter-reaper-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "fighter-reaper-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-arcade-study",
    "protocol-11",
    "sketch",
    "Arcade Pop · Study",
    "Arcade Pop in a copper engraving with tactile line density and elegant negative space treatment for Protocol 11.",
    "Arcade Pop is a visual theme for the Protocol 11 table.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-arcade-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-arcade-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-guest-study",
    "app-composer",
    "sketch",
    "The postcard gets approved · Study",
    "The postcard gets approved in a fine wire sculpture on dark cream paper treatment for App Composer.",
    "Approved Guestbook postcards can appear on a public Creator Hub.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Pinterest pin", "app-composer-guest-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "app-composer-guest-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-cartridge-study",
    "loftwahfm",
    "sketch",
    "Cartridge Club · Study",
    "Cartridge Club in a handmade paper mosaic in electric coral and bottle green with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Cartridge Club pairs chiptune swing with instrumental hip hop.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Portrait feed", "loftwahfm-cartridge-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-cartridge-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-three-study",
    "liferaft",
    "sketch",
    "Three panes · Study",
    "Three panes in a neon pinball glass reverse paint treatment for Liferaft.",
    "Liferaft keeps archive, message list and preview in view together.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Pinterest pin", "liferaft-three-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "liferaft-three-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-voice-study",
    "max",
    "sketch",
    "The simulated transcript · Study",
    "The simulated transcript in a foam puppet sculpture photographed on cobalt stage with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "The public demo uses a simulated transcript for its voice button.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Portrait feed", "max-voice-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-voice-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-plate-study",
    "woodhouse",
    "sketch",
    "The contribution and the card · Study",
    "The contribution and the card in a copper engraving with tactile line density and elegant negative space with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Source Plate puts a contribution beside the card composed from it.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    [
      ["Pinterest pin", "woodhouse-plate-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "woodhouse-plate-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fizz-icon",
    "bubbles",
    "icon",
    "One eye will do · Icon",
    "One eye will do in a negative-space ink mascot seal treatment for Bubbles.",
    "Fizz’s silhouette reads as one eye and one droplet before any detail loads.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Profile icon", "bubbles-fizz-icon.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-fizz-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-jelly-icon",
    "shoalshot",
    "icon",
    "Crown Jelly · Icon",
    "Crown Jelly in a stoneware wax seal macro treatment for SHOALSHOT.",
    "The specimen’s outline does the first bit of identification for you.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Profile icon", "shoalshot-jelly-icon.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-jelly-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-pippa-icon",
    "foilbury",
    "icon",
    "Pippa from the cabinet · Icon",
    "Pippa from the cabinet in a iridescent acrylic embossed avatar on hot-red paper treatment for Foilbury.",
    "Pippa’s black coat needs enough separation to keep her expression visible.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    [
      ["Profile icon", "foilbury-pippa-icon.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-pippa-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-reaper-icon",
    "fighter",
    "icon",
    "Grim Reaper · Icon",
    "Grim Reaper in a stained glass emblem treatment for Fighter.",
    "The pale skull and hood carry Grim Reaper’s read in a crowded lineup.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Profile icon", "fighter-reaper-icon.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-reaper-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-arcade-icon",
    "protocol-11",
    "icon",
    "Arcade Pop · Icon",
    "Arcade Pop in a deep red pastel paper token with one strong ivory shape treatment for Protocol 11.",
    "Arcade Pop is a visual theme for the Protocol 11 table.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Profile icon", "protocol-11-arcade-icon.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-arcade-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-guest-icon",
    "app-composer",
    "icon",
    "The postcard gets approved · Icon",
    "The postcard gets approved in a negative-space ink mascot seal treatment for App Composer.",
    "Approved Guestbook postcards can appear on a public Creator Hub.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Profile icon", "app-composer-guest-icon.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-guest-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-cartridge-icon",
    "loftwahfm",
    "icon",
    "Cartridge Club · Icon",
    "Cartridge Club in a stoneware wax seal macro treatment for LoftwahFM.",
    "Cartridge Club pairs chiptune swing with instrumental hip hop.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Profile icon", "loftwahfm-cartridge-icon.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-cartridge-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-three-icon",
    "liferaft",
    "icon",
    "Three panes · Icon",
    "Three panes in a iridescent acrylic embossed avatar on hot-red paper with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft keeps archive, message list and preview in view together.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "liferaft-three-icon.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-three-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-voice-icon",
    "max",
    "icon",
    "The simulated transcript · Icon",
    "The simulated transcript in a stained glass emblem treatment for MAX.",
    "The public demo uses a simulated transcript for its voice button.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Profile icon", "max-voice-icon.jpg", 512, 512],
      ["ImageGen original PNG", "max-voice-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-plate-icon",
    "woodhouse",
    "icon",
    "The contribution and the card · Icon",
    "The contribution and the card in a deep red pastel paper token with one strong ivory shape with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Source Plate puts a contribution beside the card composed from it.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    [
      ["Profile icon", "woodhouse-plate-icon.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-plate-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fungus-cartoon",
    "bubbles",
    "art",
    "Silver Fungus Run · Cartoon",
    "Silver Fungus Run in a mid-century upa limited animation treatment for Bubbles.",
    "Silver Fungus Run is a Bubbles Side Story, with its own authored board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Square feed", "bubbles-fungus-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-fungus-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-tideglass-cartoon",
    "shoalshot",
    "art",
    "Tideglass · Cartoon",
    "Tideglass in a 1980s australian newspaper comic treatment for SHOALSHOT.",
    "The Tideglass gives SHOALSHOT a readable instrument inside its own world.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Story still", "shoalshot-tideglass-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-tideglass-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-nora-cartoon",
    "foilbury",
    "art",
    "Nora’s silhouette · Cartoon",
    "Nora’s silhouette in a saturday-morning action-cel poster with one hero silhouette and a hot yellow speed field treatment for Foilbury.",
    "Nora’s glasses and scarf make the portrait readable when it is small.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    [
      ["Square feed", "foilbury-nora-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-nora-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-switch-cartoon",
    "fighter",
    "art",
    "The active slot · Cartoon",
    "The active slot in a noir cartoon still treatment for Fighter.",
    "Switching changes the active fighter. The rest of the lineup stays available.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Story still", "fighter-switch-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-switch-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-circuit-cartoon",
    "protocol-11",
    "art",
    "House Circuit · Cartoon",
    "House Circuit in a neon line-art saturday-cartoon bumper treatment for Protocol 11.",
    "House Circuit is a route through authored stages in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Square feed", "protocol-11-circuit-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol-11-circuit-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-draw-cartoon",
    "app-composer",
    "art",
    "Keep the editable file · Cartoon",
    "Keep the editable file in a mid-century upa limited animation treatment for App Composer.",
    "LDraw can keep an editable drawing and export PNG or SVG.",
    "https://ldraw.loftwah.com/",
    "Try",
    [
      ["Story still", "app-composer-draw-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "app-composer-draw-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-pressure-cartoon",
    "loftwahfm",
    "art",
    "Pressure System · Cartoon",
    "Pressure System in a 1980s australian newspaper comic treatment for LoftwahFM.",
    "Pressure System is the station for heavy drums and arcade rhythm.",
    "https://fm.loftwah.com/radio?station=pressure-system",
    "Listen",
    [
      ["Square feed", "loftwahfm-pressure-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-pressure-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-attachment-cartoon",
    "liferaft",
    "art",
    "One attachment · Cartoon",
    "One attachment in a saturday-morning action-cel poster with one hero silhouette and a hot yellow speed field with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft can export an attachment directly from its source message.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Story still", "liferaft-attachment-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "liferaft-attachment-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-isolated-cartoon",
    "max",
    "art",
    "One browser session · Cartoon",
    "One browser session in a noir cartoon still treatment for MAX.",
    "The public Virtual MAX demo is isolated per browser session.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Square feed", "max-isolated-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "max-isolated-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-share-cartoon",
    "woodhouse",
    "art",
    "Copy the artwork · Cartoon",
    "Copy the artwork in a neon line-art saturday-cartoon bumper treatment for Woodhouse.",
    "Share keeps original downloads and image copy beside each piece.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Story still", "woodhouse-share-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "woodhouse-share-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fungus-bench",
    "bubbles",
    "feature",
    "Silver Fungus Run · Build note",
    "Silver Fungus Run in a dark slate chalk diagram treatment for Bubbles.",
    "Silver Fungus Run is a Bubbles Side Story, with its own authored board. An authored board gives the side story a shape we can actually test. The forest here is a new illustration for that board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Link preview", "bubbles-fungus-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "bubbles-fungus-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-tideglass-bench",
    "shoalshot",
    "feature",
    "Tideglass · Build note",
    "Tideglass in a photocopied drawing-test sheet with restrained proof marks and crimson title treatment for SHOALSHOT.",
    "The Tideglass gives SHOALSHOT a readable instrument inside its own world. An instrument can look like it belongs under water and still have a clean edge. Start there before adding marks.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "shoalshot-tideglass-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-tideglass-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-nora-bench",
    "foilbury",
    "feature",
    "Nora’s silhouette · Build note",
    "Nora’s silhouette in a museum specimen plate with chalk treatment for Foilbury.",
    "Nora’s glasses and scarf make the portrait readable when it is small. The scarf makes a clear block of blue at the bottom of the portrait. That leaves the glasses free to be fine lines.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    [
      ["Link preview", "foilbury-nora-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "foilbury-nora-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-switch-bench",
    "fighter",
    "feature",
    "The active slot · Build note",
    "The active slot in a dark editorial chart-style image treatment for Fighter.",
    "Switching changes the active fighter. The rest of the lineup stays available. The front silhouette is the one you control. Pulling that distinction into the art gives the switch somewhere to land.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "fighter-switch-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-switch-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-circuit-bench",
    "protocol-11",
    "feature",
    "House Circuit · Build note",
    "House Circuit in a laser-cut studio model treatment for Protocol 11.",
    "House Circuit is a route through authored stages in Protocol 11. A route through stages gives a solo session somewhere to go. These three rooms illustrate the idea without numbering the game’s route.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Link preview", "protocol-11-circuit-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "protocol-11-circuit-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-draw-bench",
    "app-composer",
    "feature",
    "Keep the editable file · Build note",
    "Keep the editable file in a dark slate chalk diagram treatment for App Composer.",
    "LDraw can keep an editable drawing and export PNG or SVG. PNG and SVG are useful for sharing. The editable file is what lets you come back and move a node.",
    "https://ldraw.loftwah.com/",
    "Try",
    [
      ["Portrait feed", "app-composer-draw-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-draw-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-pressure-bench",
    "loftwahfm",
    "feature",
    "Pressure System · Build note",
    "Pressure System in a photocopied drawing-test sheet with restrained proof marks and crimson title with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Pressure System is the station for heavy drums and arcade rhythm. The speaker is the whole point of this sleeve. The repetitions around it carry the rhythm.",
    "https://fm.loftwah.com/radio?station=pressure-system",
    "Listen",
    [
      ["Link preview", "loftwahfm-pressure-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "loftwahfm-pressure-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-attachment-bench",
    "liferaft",
    "feature",
    "One attachment · Build note",
    "One attachment in a museum specimen plate with chalk treatment for Liferaft.",
    "Liferaft can export an attachment directly from its source message. The attachment belongs to a source message. Export follows that connection rather than making you lift the whole archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "liferaft-attachment-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-attachment-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-isolated-bench",
    "max",
    "feature",
    "One browser session · Build note",
    "One browser session in a dark editorial chart-style image treatment for MAX.",
    "The public Virtual MAX demo is isolated per browser session. The public session stands on its own. The amber ring stays inside a single browser-window model.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Link preview", "max-isolated-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "max-isolated-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-share-bench",
    "woodhouse",
    "feature",
    "Copy the artwork · Build note",
    "Copy the artwork in a laser-cut studio model treatment for Woodhouse.",
    "Share keeps original downloads and image copy beside each piece. People can grab a social file fast, then open the original when they need the full image. Both actions live on the card.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "woodhouse-share-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-share-bench.png", 1122, 1402]
    ],
    "bench",
    "Codex ImageGen"
  ],
  [
    "bubbles-fungus-poster",
    "bubbles",
    "banner",
    "Silver Fungus Run · Poster",
    "Silver Fungus Run in a letterpress broadside with oversized wood type and real paper bite treatment for Bubbles.",
    "Silver Fungus Run is a Bubbles Side Story, with its own authored board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Discord banner", "bubbles-fungus-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "bubbles-fungus-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-tideglass-poster",
    "shoalshot",
    "banner",
    "Tideglass · Poster",
    "Tideglass in a high-contrast museum billboard with one huge headline and spare visual elements treatment for SHOALSHOT.",
    "The Tideglass gives SHOALSHOT a readable instrument inside its own world.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Discord banner", "shoalshot-tideglass-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "shoalshot-tideglass-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-nora-poster",
    "foilbury",
    "banner",
    "Nora’s silhouette · Poster",
    "Nora’s silhouette in a large-scale tile mural treatment for Foilbury.",
    "Nora’s glasses and scarf make the portrait readable when it is small.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    [
      ["Discord banner", "foilbury-nora-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "foilbury-nora-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-switch-poster",
    "fighter",
    "banner",
    "The active slot · Poster",
    "The active slot in a wild contemporary club poster with solid cobalt and acid yellow treatment for Fighter.",
    "Switching changes the active fighter. The rest of the lineup stays available.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Discord banner", "fighter-switch-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "fighter-switch-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-circuit-poster",
    "protocol-11",
    "banner",
    "House Circuit · Poster",
    "House Circuit in a french paperback cover treatment for Protocol 11.",
    "House Circuit is a route through authored stages in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Discord banner", "protocol-11-circuit-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "protocol-11-circuit-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-pressure-poster",
    "loftwahfm",
    "banner",
    "Pressure System · Poster",
    "Pressure System in a high-contrast museum billboard with one huge headline and spare visual elements with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Pressure System is the station for heavy drums and arcade rhythm.",
    "https://fm.loftwah.com/radio?station=pressure-system",
    "Listen",
    [
      ["Discord banner", "loftwahfm-pressure-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "loftwahfm-pressure-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-attachment-poster",
    "liferaft",
    "banner",
    "One attachment · Poster",
    "One attachment in a large-scale tile mural treatment for Liferaft.",
    "Liferaft can export an attachment directly from its source message.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Discord banner", "liferaft-attachment-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "liferaft-attachment-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-isolated-poster",
    "max",
    "banner",
    "One browser session · Poster",
    "One browser session in a wild contemporary club poster with solid cobalt and acid yellow treatment for MAX.",
    "The public Virtual MAX demo is isolated per browser session.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Discord banner", "max-isolated-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "max-isolated-poster.png", 1672, 941]
    ],
    "poster",
    "Codex ImageGen"
  ],
  [
    "woodhouse-share-poster",
    "woodhouse",
    "banner",
    "Copy the artwork · Poster",
    "Copy the artwork in a french paperback cover treatment for Woodhouse.",
    "Share keeps original downloads and image copy beside each piece.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Discord banner", "woodhouse-share-poster.jpg", 1920, 1080],
      ["ImageGen original PNG", "woodhouse-share-poster.png", 1536, 864]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fungus-study",
    "bubbles",
    "sketch",
    "Silver Fungus Run · Study",
    "Silver Fungus Run in a hard enamel object photography on a wild monochrome backdrop treatment for Bubbles.",
    "Silver Fungus Run is a Bubbles Side Story, with its own authored board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "bubbles-fungus-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "bubbles-fungus-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-tideglass-study",
    "shoalshot",
    "sketch",
    "Tideglass · Study",
    "Tideglass in a dyed natural fabric batik with wide crisp reserve edges treatment for SHOALSHOT.",
    "The Tideglass gives SHOALSHOT a readable instrument inside its own world.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "shoalshot-tideglass-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-tideglass-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-nora-study",
    "foilbury",
    "sketch",
    "Nora’s silhouette · Study",
    "Nora’s silhouette in a sand-cast bronze relief with imperfect seam and hard sun treatment for Foilbury.",
    "Nora’s glasses and scarf make the portrait readable when it is small.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    [
      ["Pinterest pin", "foilbury-nora-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "foilbury-nora-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-switch-study",
    "fighter",
    "sketch",
    "The active slot · Study",
    "The active slot in a tilt-shift miniature scene in cool smoke with one amber focus object treatment for Fighter.",
    "Switching changes the active fighter. The rest of the lineup stays available.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "fighter-switch-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-switch-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-circuit-study",
    "protocol-11",
    "sketch",
    "House Circuit · Study",
    "House Circuit in a golden lacquer and paper veneer on a deep red ground treatment for Protocol 11.",
    "House Circuit is a route through authored stages in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "protocol-11-circuit-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "protocol-11-circuit-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-draw-study",
    "app-composer",
    "sketch",
    "Keep the editable file · Study",
    "Keep the editable file in a hard enamel object photography on a wild monochrome backdrop with a focused warm palette and sharp material contrast treatment for App Composer.",
    "LDraw can keep an editable drawing and export PNG or SVG.",
    "https://ldraw.loftwah.com/",
    "Try",
    [
      ["Portrait feed", "app-composer-draw-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-draw-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-pressure-study",
    "loftwahfm",
    "sketch",
    "Pressure System · Study",
    "Pressure System in a dyed natural fabric batik with wide crisp reserve edges with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "Pressure System is the station for heavy drums and arcade rhythm.",
    "https://fm.loftwah.com/radio?station=pressure-system",
    "Listen",
    [
      ["Pinterest pin", "loftwahfm-pressure-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "loftwahfm-pressure-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-attachment-study",
    "liferaft",
    "sketch",
    "One attachment · Study",
    "One attachment in a sand-cast bronze relief with imperfect seam and hard sun with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft can export an attachment directly from its source message.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "liferaft-attachment-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-attachment-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-isolated-study",
    "max",
    "sketch",
    "One browser session · Study",
    "One browser session in a tilt-shift miniature scene in cool smoke with one amber focus object with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "The public Virtual MAX demo is isolated per browser session.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Pinterest pin", "max-isolated-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "max-isolated-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-share-study",
    "woodhouse",
    "sketch",
    "Copy the artwork · Study",
    "Copy the artwork in a golden lacquer and paper veneer on a deep red ground with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Share keeps original downloads and image copy beside each piece.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "woodhouse-share-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-share-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-fungus-icon",
    "bubbles",
    "icon",
    "Silver Fungus Run · Icon",
    "Silver Fungus Run in a chromatic glass bead avatar treatment for Bubbles.",
    "Silver Fungus Run is a Bubbles Side Story, with its own authored board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Profile icon", "bubbles-fungus-icon.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-fungus-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-tideglass-icon",
    "shoalshot",
    "icon",
    "Tideglass · Icon",
    "Tideglass in a giant chunky profile icon in gouache treatment for SHOALSHOT.",
    "The Tideglass gives SHOALSHOT a readable instrument inside its own world.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Profile icon", "shoalshot-tideglass-icon.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-tideglass-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-nora-icon",
    "foilbury",
    "icon",
    "Nora’s silhouette · Icon",
    "Nora’s silhouette in a printed circuit-board avatar with low detail and one strong iconic object treatment for Foilbury.",
    "Nora’s glasses and scarf make the portrait readable when it is small.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    [
      ["Profile icon", "foilbury-nora-icon.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-nora-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-switch-icon",
    "fighter",
    "icon",
    "The active slot · Icon",
    "The active slot in a negative photographic contact print with a single icon cutout treatment for Fighter.",
    "Switching changes the active fighter. The rest of the lineup stays available.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Profile icon", "fighter-switch-icon.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-switch-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-circuit-icon",
    "protocol-11",
    "icon",
    "House Circuit · Icon",
    "House Circuit in a bold woodcut profile with exaggerated clean eye or icon treatment for Protocol 11.",
    "House Circuit is a route through authored stages in Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Profile icon", "protocol-11-circuit-icon.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-circuit-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-draw-icon",
    "app-composer",
    "icon",
    "Keep the editable file · Icon",
    "Keep the editable file in a chromatic glass bead avatar treatment for App Composer.",
    "LDraw can keep an editable drawing and export PNG or SVG.",
    "https://ldraw.loftwah.com/",
    "Try",
    [
      ["Profile icon", "app-composer-draw-icon.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-draw-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-pressure-icon",
    "loftwahfm",
    "icon",
    "Pressure System · Icon",
    "Pressure System in a giant chunky profile icon in gouache treatment for LoftwahFM.",
    "Pressure System is the station for heavy drums and arcade rhythm.",
    "https://fm.loftwah.com/radio?station=pressure-system",
    "Listen",
    [
      ["Profile icon", "loftwahfm-pressure-icon.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-pressure-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-attachment-icon",
    "liferaft",
    "icon",
    "One attachment · Icon",
    "One attachment in a printed circuit-board avatar with low detail and one strong iconic object with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft can export an attachment directly from its source message.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "liferaft-attachment-icon.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-attachment-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-isolated-icon",
    "max",
    "icon",
    "One browser session · Icon",
    "One browser session in a negative photographic contact print with a single icon cutout with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "The public Virtual MAX demo is isolated per browser session.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Profile icon", "max-isolated-icon.jpg", 512, 512],
      ["ImageGen original PNG", "max-isolated-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-share-icon",
    "woodhouse",
    "icon",
    "Copy the artwork · Icon",
    "Copy the artwork in a bold woodcut profile with exaggerated clean eye or icon with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Share keeps original downloads and image copy beside each piece.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "woodhouse-share-icon.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-share-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-classic-cartoon",
    "bubbles",
    "art",
    "The board comes first · Cartoon",
    "The board comes first in a euro comic clear-line panels treatment for Bubbles.",
    "Classic is the straight arcade game. Aim, match three and clear the board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Story still", "bubbles-classic-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-classic-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-abyss-cartoon",
    "shoalshot",
    "art",
    "Abyssjaw · Cartoon",
    "Abyssjaw in a two-colour woodblock folk print treatment for SHOALSHOT.",
    "Abyssjaw’s angular armour makes it distinct even in a small specimen tile.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Square feed", "shoalshot-abyss-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-abyss-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-foil-cartoon",
    "foilbury",
    "art",
    "A finish catches light · Cartoon",
    "A finish catches light in a franco-belgian architectural cartoon treatment for Foilbury.",
    "The cabinet lets you inspect Moss in Plain, Silver, Gold and Diamond.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Story still", "foilbury-foil-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-foil-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-launch-cartoon",
    "fighter",
    "art",
    "The launch lineup · Cartoon",
    "The launch lineup in a 1980s science-show cut-out animation treatment for Fighter.",
    "This retrospective starts from the published Fighter launch roster art.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Square feed", "fighter-launch-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-launch-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-solo-cartoon",
    "protocol-11",
    "art",
    "A table for one · Cartoon",
    "A table for one in a folded-paper stop-motion stage treatment for Protocol 11.",
    "Classic supports a local game against bots.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Story still", "protocol-11-solo-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "protocol-11-solo-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-links-cartoon",
    "app-composer",
    "art",
    "The good links · Cartoon",
    "The good links in a euro comic clear-line panels treatment for App Composer.",
    "Linkarooie gives a public profile a place for featured picks and grouped links.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Square feed", "app-composer-links-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "app-composer-links-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-bob-cartoon",
    "loftwahfm",
    "art",
    "The BOB sleeve · Cartoon",
    "The BOB sleeve in a two-colour woodblock folk print treatment for LoftwahFM.",
    "The published BOB sleeve starts with a broken record and a dark studio palette.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Story still", "loftwahfm-bob-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-bob-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-message-cartoon",
    "liferaft",
    "art",
    "One message out · Cartoon",
    "One message out in a franco-belgian architectural cartoon treatment for Liferaft.",
    "Liferaft can export an individual message without changing the archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Square feed", "liferaft-message-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-message-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-concept-cartoon",
    "max",
    "art",
    "A prototype in progress · Cartoon",
    "A prototype in progress in a 1980s science-show cut-out animation treatment for MAX.",
    "MAX is being designed as a companion for a walker someone already owns.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Story still", "max-concept-cartoon.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-concept-cartoon.png", 1008, 1792]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-workshop-cartoon",
    "woodhouse",
    "art",
    "Games, music and tools · Cartoon",
    "Games, music and tools in a folded-paper stop-motion stage treatment for Woodhouse.",
    "Woodhouse brings the projects together, with each one keeping its own identity.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Square feed", "woodhouse-workshop-cartoon.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-workshop-cartoon.png", 1024, 1024]
    ],
    "cartoon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-classic-bench",
    "bubbles",
    "feature",
    "The board comes first · Build note",
    "The board comes first in a industrial testing bench photo treatment for Bubbles.",
    "Classic is the straight arcade game. Aim, match three and clear the board. The symbols give players a second way to recognise a match. The board gets the space and the launcher stays out of its way.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "bubbles-classic-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-classic-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-abyss-bench",
    "shoalshot",
    "feature",
    "Abyssjaw · Build note",
    "Abyssjaw in a mechanical parts inventory in charcoal treatment for SHOALSHOT.",
    "Abyssjaw’s angular armour makes it distinct even in a small specimen tile. The sharp edges carry the name before the panel has room for it. More surface detail would have been the easy part.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Link preview", "shoalshot-abyss-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-abyss-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-foil-bench",
    "foilbury",
    "feature",
    "A finish catches light · Build note",
    "A finish catches light in a architectural maquette under noon light treatment for Foilbury.",
    "The cabinet lets you inspect Moss in Plain, Silver, Gold and Diamond. Move the light before judging the finish. The cabinet gives the actual card a place to show what changes.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Portrait feed", "foilbury-foil-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-foil-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-launch-bench",
    "fighter",
    "feature",
    "The launch lineup · Build note",
    "The launch lineup in a one-sheet safety-orange engineering memo poster with generous blank borders treatment for Fighter.",
    "This retrospective starts from the published Fighter launch roster art. The roster works when the silhouettes are different even with the names covered. The original portraits supplied the comparison.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Link preview", "fighter-launch-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "fighter-launch-bench.png", 1731, 909]
    ],
    "bench",
    "Codex ImageGen"
  ],
  [
    "protocol-11-solo-bench",
    "protocol-11",
    "feature",
    "A table for one · Build note",
    "A table for one in a large uncoated process poster with plain navy lines and two material swatches treatment for Protocol 11.",
    "Classic supports a local game against bots. A local bot table cuts the waiting out of trying a hand. The one chair is there for that player.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-solo-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-solo-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-links-bench",
    "app-composer",
    "feature",
    "The good links · Build note",
    "The good links in a industrial testing bench photo treatment for App Composer.",
    "Linkarooie gives a public profile a place for featured picks and grouped links. Featured picks give the first screen a job. Groups give the rest of the links a place to go.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Link preview", "app-composer-links-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "app-composer-links-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-bob-bench",
    "loftwahfm",
    "feature",
    "The BOB sleeve · Build note",
    "The BOB sleeve in a mechanical parts inventory in charcoal treatment for LoftwahFM.",
    "The published BOB sleeve starts with a broken record and a dark studio palette. The crack in the source sleeve carries through even when we take the title and the studio objects away.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Portrait feed", "loftwahfm-bob-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-bob-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-message-bench",
    "liferaft",
    "feature",
    "One message out · Build note",
    "One message out in a architectural maquette under noon light treatment for Liferaft.",
    "Liferaft can export an individual message without changing the archive. Sometimes the one message is enough. The rest of the archive can stay in the drawer.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Link preview", "liferaft-message-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "liferaft-message-bench.png", 1216, 640]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-concept-bench",
    "max",
    "feature",
    "A prototype in progress · Build note",
    "A prototype in progress in a one-sheet safety-orange engineering memo poster with generous blank borders with a focused warm palette and sharp material contrast treatment for MAX.",
    "MAX is being designed as a companion for a walker someone already owns. The concept starts with the walker someone already has. A sketch can show that direction without making a hardware claim.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Portrait feed", "max-concept-bench.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-concept-bench.png", 1024, 1280]
    ],
    "bench",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-workshop-bench",
    "woodhouse",
    "feature",
    "Games, music and tools · Build note",
    "Games, music and tools in a large uncoated process poster with plain navy lines and two material swatches with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Woodhouse brings the projects together, with each one keeping its own identity. The arcade, radio and drawing board share a bench. Each gets to keep the shapes and colours that make it recognisable.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Link preview", "woodhouse-workshop-bench.jpg", 1200, 630],
      ["ImageGen original PNG", "woodhouse-workshop-bench.png", 1731, 908]
    ],
    "bench",
    "Codex ImageGen"
  ],
  [
    "bubbles-classic-poster",
    "bubbles",
    "feature",
    "The board comes first · Poster",
    "The board comes first in a japanese-inspired ink wash with a single red mark and quiet cream texture treatment for Bubbles.",
    "Classic is the straight arcade game. Aim, match three and clear the board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "bubbles-classic-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-classic-poster.png", 1024, 1280]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-abyss-poster",
    "shoalshot",
    "feature",
    "Abyssjaw · Poster",
    "Abyssjaw in a giant painted roadside sign treatment for SHOALSHOT.",
    "Abyssjaw’s angular armour makes it distinct even in a small specimen tile.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "shoalshot-abyss-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-abyss-poster.png", 1122, 1402]
    ],
    "poster",
    "Codex ImageGen"
  ],
  [
    "foilbury-foil-poster",
    "foilbury",
    "feature",
    "A finish catches light · Poster",
    "A finish catches light in a embroidered textile label treatment for Foilbury.",
    "The cabinet lets you inspect Moss in Plain, Silver, Gold and Diamond.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Portrait feed", "foilbury-foil-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-foil-poster.png", 1024, 1280]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-launch-poster",
    "fighter",
    "feature",
    "The launch lineup · Poster",
    "The launch lineup in a art-nouveau relief poster with engraved copper colours and heavy cream type treatment for Fighter.",
    "This retrospective starts from the published Fighter launch roster art.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "fighter-launch-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-launch-poster.png", 1024, 1280]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-solo-poster",
    "protocol-11",
    "feature",
    "A table for one · Poster",
    "A table for one in a linocut show bill with extremely bold face silhouette and off-register title treatment for Protocol 11.",
    "Classic supports a local game against bots.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-solo-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-solo-poster.png", 1024, 1280]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-links-poster",
    "app-composer",
    "feature",
    "The good links · Poster",
    "The good links in a japanese-inspired ink wash with a single red mark and quiet cream texture with a focused warm palette and sharp material contrast treatment for App Composer.",
    "Linkarooie gives a public profile a place for featured picks and grouped links.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Portrait feed", "app-composer-links-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-links-poster.png", 1122, 1402]
    ],
    "poster",
    "Codex ImageGen"
  ],
  [
    "loftwahfm-bob-poster",
    "loftwahfm",
    "feature",
    "The BOB sleeve · Poster",
    "The BOB sleeve in a giant painted roadside sign treatment for LoftwahFM.",
    "The published BOB sleeve starts with a broken record and a dark studio palette.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Portrait feed", "loftwahfm-bob-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-bob-poster.png", 1122, 1402]
    ],
    "poster",
    "Codex ImageGen"
  ],
  [
    "liferaft-message-poster",
    "liferaft",
    "feature",
    "One message out · Poster",
    "One message out in a embroidered textile label treatment for Liferaft.",
    "Liferaft can export an individual message without changing the archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "liferaft-message-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-message-poster.png", 1024, 1280]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-concept-poster",
    "max",
    "feature",
    "A prototype in progress · Poster",
    "A prototype in progress in a art-nouveau relief poster with engraved copper colours and heavy cream type with a focused warm palette and sharp material contrast treatment for MAX.",
    "MAX is being designed as a companion for a walker someone already owns.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Portrait feed", "max-concept-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-concept-poster.png", 1024, 1280]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-workshop-poster",
    "woodhouse",
    "feature",
    "Games, music and tools · Poster",
    "Games, music and tools in a linocut show bill with extremely bold face silhouette and off-register title with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Woodhouse brings the projects together, with each one keeping its own identity.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "woodhouse-workshop-poster.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-workshop-poster.png", 1024, 1280]
    ],
    "poster",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-classic-study",
    "bubbles",
    "sketch",
    "The board comes first · Study",
    "The board comes first in a black-and-white silver gelatin print treatment for Bubbles.",
    "Classic is the straight arcade game. Aim, match three and clear the board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "bubbles-classic-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-classic-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-abyss-study",
    "shoalshot",
    "sketch",
    "Abyssjaw · Study",
    "Abyssjaw in a handmade japanese-style woodblock with contrasting deep green and fuchsia colour treatment for SHOALSHOT.",
    "Abyssjaw’s angular armour makes it distinct even in a small specimen tile.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "shoalshot-abyss-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "shoalshot-abyss-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-foil-study",
    "foilbury",
    "sketch",
    "A finish catches light · Study",
    "A finish catches light in a technical fabric embroidery close-up with oversized cross-stitch strokes treatment for Foilbury.",
    "The cabinet lets you inspect Moss in Plain, Silver, Gold and Diamond.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Portrait feed", "foilbury-foil-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-foil-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-launch-study",
    "fighter",
    "sketch",
    "The launch lineup · Study",
    "The launch lineup in a folded origami on cyan tracing paper with believable material structure treatment for Fighter.",
    "This retrospective starts from the published Fighter launch roster art.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "fighter-launch-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "fighter-launch-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-solo-study",
    "protocol-11",
    "sketch",
    "A table for one · Study",
    "A table for one in a vintage dye-transfer photograph with cyan-magenta split and grain treatment for Protocol 11.",
    "Classic supports a local game against bots.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-solo-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-solo-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-links-study",
    "app-composer",
    "sketch",
    "The good links · Study",
    "The good links in a black-and-white silver gelatin print treatment for App Composer.",
    "Linkarooie gives a public profile a place for featured picks and grouped links.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Pinterest pin", "app-composer-links-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "app-composer-links-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-bob-study",
    "loftwahfm",
    "sketch",
    "The BOB sleeve · Study",
    "The BOB sleeve in a handmade japanese-style woodblock with contrasting deep green and fuchsia colour with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "The published BOB sleeve starts with a broken record and a dark studio palette.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Portrait feed", "loftwahfm-bob-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-bob-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-message-study",
    "liferaft",
    "sketch",
    "One message out · Study",
    "One message out in a technical fabric embroidery close-up with oversized cross-stitch strokes with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft can export an individual message without changing the archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Pinterest pin", "liferaft-message-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "liferaft-message-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-concept-study",
    "max",
    "sketch",
    "A prototype in progress · Study",
    "A prototype in progress in a folded origami on cyan tracing paper with believable material structure with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "MAX is being designed as a companion for a walker someone already owns.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Portrait feed", "max-concept-study.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-concept-study.png", 1024, 1280]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-workshop-study",
    "woodhouse",
    "sketch",
    "Games, music and tools · Study",
    "Games, music and tools in a vintage dye-transfer photograph with cyan-magenta split and grain with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Woodhouse brings the projects together, with each one keeping its own identity.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Pinterest pin", "woodhouse-workshop-study.jpg", 1000, 1500],
      ["ImageGen original PNG", "woodhouse-workshop-study.png", 1024, 1536]
    ],
    "study",
    "GPT Image 2.6 via Fal"
  ],
  [
    "bubbles-classic-icon",
    "bubbles",
    "icon",
    "The board comes first · Icon",
    "The board comes first in a 3-colour enamel pin avatar in a single iconic shape treatment for Bubbles.",
    "Classic is the straight arcade game. Aim, match three and clear the board.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Profile icon", "bubbles-classic-icon.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-classic-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "shoalshot-abyss-icon",
    "shoalshot",
    "icon",
    "Abyssjaw · Icon",
    "Abyssjaw in a golden paper foil stamp avatar with almost no interior detail treatment for SHOALSHOT.",
    "Abyssjaw’s angular armour makes it distinct even in a small specimen tile.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Profile icon", "shoalshot-abyss-icon.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-abyss-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "foilbury-foil-icon",
    "foilbury",
    "icon",
    "A finish catches light · Icon",
    "A finish catches light in a elegant carved jade cameo on cream for a small circle crop treatment for Foilbury.",
    "The cabinet lets you inspect Moss in Plain, Silver, Gold and Diamond.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Profile icon", "foilbury-foil-icon.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-foil-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "fighter-launch-icon",
    "fighter",
    "icon",
    "The launch lineup · Icon",
    "The launch lineup in a 80s tv test-card profile with punchy colour bars in the background treatment for Fighter.",
    "This retrospective starts from the published Fighter launch roster art.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Profile icon", "fighter-launch-icon.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-launch-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "protocol-11-solo-icon",
    "protocol-11",
    "icon",
    "A table for one · Icon",
    "A table for one in a laser-etched translucent plastic badge with edge-lighting treatment for Protocol 11.",
    "Classic supports a local game against bots.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Profile icon", "protocol-11-solo-icon.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-solo-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "app-composer-links-icon",
    "app-composer",
    "icon",
    "The good links · Icon",
    "The good links in a 3-colour enamel pin avatar in a single iconic shape with a focused warm palette and sharp material contrast treatment for App Composer.",
    "Linkarooie gives a public profile a place for featured picks and grouped links.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Profile icon", "app-composer-links-icon.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-links-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "loftwahfm-bob-icon",
    "loftwahfm",
    "icon",
    "The BOB sleeve · Icon",
    "The BOB sleeve in a golden paper foil stamp avatar with almost no interior detail with a focused warm palette and sharp material contrast treatment for LoftwahFM.",
    "The published BOB sleeve starts with a broken record and a dark studio palette.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Profile icon", "loftwahfm-bob-icon.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-bob-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "liferaft-message-icon",
    "liferaft",
    "icon",
    "One message out · Icon",
    "One message out in a elegant carved jade cameo on cream for a small circle crop with a focused warm palette and sharp material contrast treatment for Liferaft.",
    "Liferaft can export an individual message without changing the archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "liferaft-message-icon.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-message-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "max-concept-icon",
    "max",
    "icon",
    "A prototype in progress · Icon",
    "A prototype in progress in a 80s tv test-card profile with punchy colour bars in the background with a focused warm palette and sharp material contrast with an abstract amber pulse or printed sheet treatment for MAX.",
    "MAX is being designed as a companion for a walker someone already owns.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Profile icon", "max-concept-icon.jpg", 512, 512],
      ["ImageGen original PNG", "max-concept-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ],
  [
    "woodhouse-workshop-icon",
    "woodhouse",
    "icon",
    "Games, music and tools · Icon",
    "Games, music and tools in a laser-etched translucent plastic badge with edge-lighting with a focused warm palette and sharp material contrast treatment for Woodhouse.",
    "Woodhouse brings the projects together, with each one keeping its own identity.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "woodhouse-workshop-icon.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-workshop-icon.png", 1024, 1024]
    ],
    "icon",
    "GPT Image 2.6 via Fal"
  ]
] as const;

export const buildNotes: CampaignItem[] = art.map(
  ([slug, project, use, title, alt, caption, href, action, files, kind, credit]) => {
    const [, , width, height] = files[0];
    return {
      id: `build-note-${slug}`,
      series: "build-notes",
      ...(kind === "bench" ? { stage: "Build note" } : {}),
      project,
      use,
      title,
      alt,
      caption: `${caption}\n${href}`,
      href,
      action,
      image: `${base}/${slug}-preview.jpg`,
      thumbnail: `${base}/${slug}-thumb.jpg`,
      original: `${base}/${slug}.png`,
      width,
      height,
      reviewedAt: "2026-11-13",
      addedAt: "2026-11-13T04:11:47Z",
      kind: "editorial composition",
      credit: `Woodhouse · ${credit}`,
      source: `${base}/provenance.txt`,
      formats: files.map(([label, file, width, height]) => ({
        label,
        image: `${base}/${file}`,
        width,
        height
      }))
    };
  }
);
