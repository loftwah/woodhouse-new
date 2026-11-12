import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-project-stories-50";
export const projectStories50Kit = `${base}/project-stories-50-kit.zip`;
const art = [
  [
    "shoalshot-lantern-ray",
    "shoalshot",
    "feature",
    "Lantern Ray",
    "A speckled Lantern Ray glides through a dark blue field under museum-poster lettering.",
    "Look for the Lantern Ray in SHOALSHOT’s specimen collection.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Landscape", "shoalshot-lantern-ray.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-lantern-ray.png", 1536, 864]
    ]
  ],
  [
    "fighter-tux",
    "fighter",
    "art",
    "Root Access",
    "Tux with a teal headset on a grainy green Root Access poster.",
    "Root Access is a move in Tux’s Fighter kit.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "fighter-tux.jpg", 1000, 1500],
      ["ImageGen original PNG", "fighter-tux.png", 1024, 1536]
    ]
  ],
  [
    "bubbles-silver-fungus",
    "bubbles",
    "art",
    "Silver Fungus Run",
    "Fizz stands beneath luminous mushrooms on the cover of Silver Fungus Run.",
    "Silver Fungus Run is a Bubbles Side Story. This is an illustrated cover.",
    "https://bubbles.loftwah.com/story",
    "Play",
    [
      ["Pinterest pin", "bubbles-silver-fungus.jpg", 1000, 1500],
      ["ImageGen original PNG", "bubbles-silver-fungus.png", 1024, 1536]
    ]
  ],
  [
    "app-composer-launch-kit",
    "app-composer",
    "feature",
    "One mark, ready to ship",
    "A radio mark on three differently shaped pieces in a purple Launch Kit packaging mockup.",
    "Launch Kit turns source artwork into app icons, PWA assets and social files.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    [
      ["Portrait feed", "app-composer-launch-kit.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-launch-kit.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-pippa",
    "foilbury",
    "art",
    "Pippa, cabinet portrait",
    "Pippa sits beneath hand-drawn lettering in a purple-and-amber cabinet portrait.",
    "Pippa from the Foilbury cabinet, in a vertical story still.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    [
      ["Story still", "foilbury-pippa.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-pippa.png", 1008, 1792]
    ]
  ],
  [
    "protocol-11-circuit",
    "protocol-11",
    "art",
    "House Circuit",
    "A ribbon passes through three rooms on a vintage House Circuit poster.",
    "House Circuit is a route through Protocol 11’s authored stages.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "protocol-11-circuit.jpg", 1000, 1500],
      ["ImageGen original PNG", "protocol-11-circuit.png", 1024, 1536]
    ]
  ],
  [
    "loftwahfm-low-tide",
    "loftwahfm",
    "feature",
    "Low Tide",
    "A blue-and-magenta coastline with a large white Low Tide title.",
    "Low Tide is unhurried LoftwahFM instrumentals for open water.",
    "https://fm.loftwah.com/radio?station=low-tide",
    "Listen",
    [
      ["Landscape", "loftwahfm-low-tide.jpg", 1600, 900],
      ["ImageGen original PNG", "loftwahfm-low-tide.png", 1536, 864]
    ]
  ],
  [
    "woodhouse-weave",
    "woodhouse",
    "art",
    "Threads under tension",
    "Pale blue and green strands cross in a close view of the Woodhouse loom.",
    "A close-up editorial study of the Woodhouse homepage loom.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Story still", "woodhouse-weave.jpg", 1080, 1920],
      ["ImageGen original PNG", "woodhouse-weave.png", 1008, 1792]
    ]
  ],
  [
    "max-quiet",
    "max",
    "feature",
    "Stop the sound",
    "A stop sign beside a fading waveform on amber paper.",
    "Use STOP in Virtual MAX to silence the demo locator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Link preview", "max-quiet.jpg", 1200, 630],
      ["ImageGen original PNG", "max-quiet.png", 1216, 640]
    ]
  ],
  [
    "liferaft-search",
    "liferaft",
    "feature",
    "A needle in the archive",
    "An amber envelope stands out in a row of dark blue archive folders.",
    "Liferaft indexes an MBOX locally so you can search for the message you remember.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Portrait feed", "liferaft-search.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-search.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-crown",
    "bubbles",
    "icon",
    "Fizz in glass",
    "Fizz as a one-eyed blown-glass droplet lit violet.",
    "The one-eyed droplet from Bubbles, in a glass study for profiles.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Profile icon", "bubbles-crown.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-crown.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-prologue",
    "bubbles",
    "art",
    "Bank Shot Lesson",
    "Fizz beneath a bright arcade mural for Bank Shot Lesson.",
    "Bank Shot Lesson is part of Bubbles Story’s Prologue.",
    "https://bubbles.loftwah.com/story",
    "Play",
    [
      ["Story still", "bubbles-prologue.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-prologue.png", 1008, 1792]
    ]
  ],
  [
    "bubbles-warmup",
    "bubbles",
    "feature",
    "Clear the canopy",
    "A canopy of bright bubbles hangs over an empty arcade cabinet in a pencil study.",
    "Lantern Warmup asks you to clear the canopy in Bubbles Story.",
    "https://bubbles.loftwah.com/story",
    "Play",
    [
      ["Portrait feed", "bubbles-warmup.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-warmup.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-eight-shots",
    "bubbles",
    "feature",
    "Eight shots",
    "Eight empty rings on a black-and-orange arcade bill reading Eight Shots.",
    "Lantern Finale gives you eight shots to make the canopy fold.",
    "https://bubbles.loftwah.com/story",
    "Play",
    [
      ["Landscape", "bubbles-eight-shots.jpg", 1600, 900],
      ["ImageGen original PNG", "bubbles-eight-shots.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-abyssjaw",
    "shoalshot",
    "sketch",
    "Abyssjaw specimen",
    "Three chalk and graphite views of an armoured Abyssjaw on dark paper.",
    "A specimen study of SHOALSHOT’s Abyssjaw.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "shoalshot-abyssjaw.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-abyssjaw.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-deep-tide",
    "shoalshot",
    "banner",
    "Deep Tide",
    "A dark reef header with illuminated coral and Deep Tide lettering on the right.",
    "A reef study of SHOALSHOT’s Deep Tide look.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["X header", "shoalshot-deep-tide.jpg", 1500, 500],
      ["ImageGen original PNG", "shoalshot-deep-tide.png", 1536, 512]
    ]
  ],
  [
    "shoalshot-crown-jelly",
    "shoalshot",
    "icon",
    "Crown Jelly",
    "A turquoise jellyfish within a gold ring on a luminous green background.",
    "Crown Jelly, a text-free SHOALSHOT profile image.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Profile icon", "shoalshot-crown-jelly.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-crown-jelly.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-tideglass",
    "shoalshot",
    "art",
    "Tideglass, in section",
    "The circular Tideglass instrument depicted as a maritime lithograph.",
    "An illustrated study of the Tideglass instrument.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "shoalshot-tideglass.jpg", 1000, 1500],
      ["ImageGen original PNG", "shoalshot-tideglass.png", 1024, 1536]
    ]
  ],
  [
    "foilbury-rhea",
    "foilbury",
    "sketch",
    "Rhea in charcoal",
    "Rhea in coloured charcoal with swept teal and coral hair, round glasses and a teal jacket.",
    "Rhea, drawn from Foilbury’s published cabinet art.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    [
      ["Portrait feed", "foilbury-rhea.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-rhea.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-nora",
    "foilbury",
    "icon",
    "Nora portrait",
    "Nora, a cat in glasses and a scarf, in an indigo and yellow profile portrait.",
    "Nora from Foilbury’s cabinet, sized for a profile.",
    "https://foilbury.loftwah.com/cabinet/nora",
    "Explore",
    [
      ["Profile icon", "foilbury-nora.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-nora.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-gabe",
    "foilbury",
    "art",
    "Gabe in ink",
    "Gabe’s curled moustache and crown in a two-colour ink portrait.",
    "A new ink portrait of Gabe from the Foilbury cabinet.",
    "https://foilbury.loftwah.com/cabinet/gabe",
    "Explore",
    [
      ["Square feed", "foilbury-gabe.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-gabe.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-gold",
    "foilbury",
    "feature",
    "Light on gold",
    "Gold leaves and embossed lettering on dark paper.",
    "An editorial gold-foil material study. See the actual Gold card in the cabinet.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Link preview", "foilbury-gold.jpg", 1200, 630],
      ["ImageGen original PNG", "foilbury-gold.png", 1216, 640]
    ]
  ],
  [
    "fighter-viking",
    "fighter",
    "feature",
    "Viking, before the bell",
    "Viking in a blue scratchboard fight bill with large ivory lettering.",
    "Viking from Fighter, in a fight-bill portrait.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "fighter-viking.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-viking.png", 1024, 1280]
    ]
  ],
  [
    "fighter-reaper",
    "fighter",
    "icon",
    "Grim Reaper in silhouette",
    "The hooded Grim Reaper in bone-white and violet ink.",
    "Fighter’s Grim Reaper as a profile icon.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Profile icon", "fighter-reaper.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-reaper.png", 1024, 1024]
    ]
  ],
  [
    "fighter-switch",
    "fighter",
    "feature",
    "Switch the lineup",
    "Two portrait silhouettes connected by one curved switch arrow on a Fighter poster.",
    "A Fighter lineup illustration for a post about switching the active fighter.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Landscape", "fighter-switch.jpg", 1600, 900],
      ["ImageGen original PNG", "fighter-switch.png", 1536, 864]
    ]
  ],
  [
    "fighter-lineup",
    "fighter",
    "banner",
    "The launch lineup",
    "Three fighters appear in silhouette under a warm spotlight on a launch roster bill.",
    "A retrospective roster bill based on Fighter’s published launch art.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Discord banner", "fighter-lineup.jpg", 1920, 1080],
      ["ImageGen original PNG", "fighter-lineup.png", 1536, 864]
    ]
  ],
  [
    "protocol-11-kitchen",
    "protocol-11",
    "feature",
    "Kitchen Table",
    "The sunny Kitchen Table room behind large green hand-painted lettering.",
    "An illustration of Protocol 11’s Kitchen Table setting.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Landscape", "protocol-11-kitchen.jpg", 1600, 900],
      ["ImageGen original PNG", "protocol-11-kitchen.png", 1536, 864]
    ]
  ],
  [
    "protocol-11-arcade",
    "protocol-11",
    "banner",
    "Arcade Pop",
    "Neon tubes frame the Arcade Pop room and sign.",
    "A header for Protocol 11’s Arcade Pop table theme.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["X header", "protocol-11-arcade.jpg", 1500, 500],
      ["ImageGen original PNG", "protocol-11-arcade.png", 1536, 512]
    ]
  ],
  [
    "protocol-11-felt",
    "protocol-11",
    "sketch",
    "Classic Felt",
    "A green lamp hangs over the edge of an empty felt table.",
    "A study of the baize and edge of Protocol 11’s Classic Felt theme.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-felt.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-felt.png", 1024, 1280]
    ]
  ],
  [
    "protocol-11-invite",
    "protocol-11",
    "art",
    "Save a seat",
    "A pulled-out chair beside a kitchen table under Save a Seat lettering.",
    "A card-night invitation for Protocol 11.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Square feed", "protocol-11-invite.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol-11-invite.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-paperwork",
    "app-composer",
    "feature",
    "Fill, sign, save",
    "An orange stamp and pen on a dark desk beside Paperwork’s fill, sign and save headline.",
    "Fill PDF fields, sign and save with Paperwork. Files stay in your browser.",
    "https://paperwork.loftwah.com/",
    "Try",
    [
      ["Landscape", "app-composer-paperwork.jpg", 1600, 900],
      ["ImageGen original PNG", "app-composer-paperwork.png", 1536, 864]
    ]
  ],
  [
    "app-composer-postcard",
    "app-composer",
    "art",
    "A postcard makes the cut",
    "A seaside postcard on a Guestbook approval poster.",
    "An approved Guestbook postcard can appear on a public Creator Hub.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Pinterest pin", "app-composer-postcard.jpg", 1000, 1500],
      ["ImageGen original PNG", "app-composer-postcard.png", 1024, 1536]
    ]
  ],
  [
    "app-composer-linkarooie",
    "app-composer",
    "art",
    "Keep the good links",
    "Torn portrait and coloured index tabs beneath the Linkarooie headline.",
    "Linkarooie brings a profile, featured picks and grouped links together.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    [
      ["Story still", "app-composer-linkarooie.jpg", 1080, 1920],
      ["ImageGen original PNG", "app-composer-linkarooie.png", 1008, 1792]
    ]
  ],
  [
    "app-composer-ldraw",
    "app-composer",
    "sketch",
    "The editable drawing",
    "Blank diagram nodes connected by orange lines on charcoal paper.",
    "An editorial study for LDraw’s editable diagram workflow.",
    "https://ldraw.loftwah.com/",
    "Try",
    [
      ["Square feed", "app-composer-ldraw.jpg", 1080, 1080],
      ["ImageGen original PNG", "app-composer-ldraw.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-pressure",
    "loftwahfm",
    "art",
    "Pressure System",
    "A dark orange arcade-styled drum graphic for Pressure System.",
    "Heavy drums and arcade rhythm on LoftwahFM’s Pressure System.",
    "https://fm.loftwah.com/radio?station=pressure-system",
    "Listen",
    [
      ["Story still", "loftwahfm-pressure.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-pressure.png", 1008, 1792]
    ]
  ],
  [
    "loftwahfm-soft-focus",
    "loftwahfm",
    "art",
    "Soft Focus",
    "A translucent magenta record in an embossed Soft Focus sleeve.",
    "Soft Focus is LoftwahFM’s station for gentler grooves.",
    "https://fm.loftwah.com/radio?station=soft-focus",
    "Listen",
    [
      ["Square feed", "loftwahfm-soft-focus.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-soft-focus.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-saltwater",
    "loftwahfm",
    "art",
    "Saltwater Static",
    "A buoy in dark waves under a large Saltwater Static title.",
    "Offshore beats and strange transmissions on Saltwater Static.",
    "https://fm.loftwah.com/radio?station=saltwater-static",
    "Listen",
    [
      ["Pinterest pin", "loftwahfm-saltwater.jpg", 1000, 1500],
      ["ImageGen original PNG", "loftwahfm-saltwater.png", 1024, 1536]
    ]
  ],
  [
    "loftwahfm-bob",
    "loftwahfm",
    "sketch",
    "The BOB sleeve",
    "A cracked black record radiates golden marks on a charcoal ground.",
    "A new art study from LoftwahFM’s published BOB sleeve.",
    "https://fm.loftwah.com/radio?station=cartridge-club",
    "Listen",
    [
      ["Portrait feed", "loftwahfm-bob.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-bob.png", 1024, 1280]
    ]
  ],
  [
    "liferaft-read-only",
    "liferaft",
    "banner",
    "Read only",
    "A cream archive box beside navy Read Only and Liferaft lettering.",
    "Liferaft opens MBOX archives in read-only mode.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["X header", "liferaft-read-only.jpg", 1500, 500],
      ["ImageGen original PNG", "liferaft-read-only.png", 1536, 512]
    ]
  ],
  [
    "liferaft-message",
    "liferaft",
    "art",
    "One message out",
    "A single paper envelope rises above a tray of mail on folded paper springs.",
    "Liferaft can export an individual message from the source archive.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Square feed", "liferaft-message.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-message.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-workbench",
    "liferaft",
    "feature",
    "The three panes",
    "Three labelled paper panels represent Liferaft’s archive, messages and preview.",
    "Liferaft keeps archive, message list and preview in view while you recover mail.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Landscape", "liferaft-workbench.jpg", 1600, 900],
      ["ImageGen original PNG", "liferaft-workbench.png", 1536, 864]
    ]
  ],
  [
    "liferaft-rescued",
    "liferaft",
    "icon",
    "Rescue marker",
    "A cream envelope inside a navy and orange rescue ring.",
    "An editorial community icon for Liferaft’s archive recovery.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Profile icon", "liferaft-rescued.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-rescued.png", 1024, 1024]
    ]
  ],
  [
    "max-locate",
    "max",
    "art",
    "Find and stop",
    "A model walker and amber ring illustrate the Virtual MAX Find and Stop actions.",
    "FIND and STOP let you try the locator in the Virtual MAX browser demo.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Story still", "max-locate.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-locate.png", 1008, 1792]
    ]
  ],
  [
    "max-simulator",
    "max",
    "feature",
    "Simulator bench",
    "A black laptop marked Browser Simulator and a yellow Virtual MAX notebook.",
    "A studio illustration of the public Virtual MAX browser simulator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Portrait feed", "max-simulator.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-simulator.png", 1024, 1280]
    ]
  ],
  [
    "max-signal",
    "max",
    "art",
    "Locate signal",
    "An amber locate pulse expands from a dark speaker opening.",
    "The locate sound is the moment the Virtual MAX demo illustrates.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Square feed", "max-signal.jpg", 1080, 1080],
      ["ImageGen original PNG", "max-signal.png", 1024, 1024]
    ]
  ],
  [
    "max-prototype",
    "max",
    "art",
    "A prototype in progress",
    "A concept drawing of a walker with MAX prototype lettering.",
    "A MAX concept study. Follow the public prototype status.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Pinterest pin", "max-prototype.jpg", 1000, 1500],
      ["ImageGen original PNG", "max-prototype.png", 1024, 1536]
    ]
  ],
  [
    "woodhouse-patch",
    "woodhouse",
    "feature",
    "Patch Bench",
    "A small arcade cabinet and radio sit apart on a red Patch Bench.",
    "Patch Bench is a working Woodhouse exhibit where game audio and LoftwahFM remain separate.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    [
      ["Landscape", "woodhouse-patch.jpg", 1600, 900],
      ["ImageGen original PNG", "woodhouse-patch.png", 1536, 864]
    ]
  ],
  [
    "woodhouse-source",
    "woodhouse",
    "feature",
    "Source Plate",
    "A paper postcard and a derived display card side by side on dark paper.",
    "Source Plate shows a contribution beside the card composed from it.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    [
      ["Portrait feed", "woodhouse-source.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-source.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-journal",
    "woodhouse",
    "feature",
    "Workshop journal",
    "A hand-lettered Workshop Journal folder alongside a print of the loom.",
    "A Woodhouse cover for stories about the work and how it took shape.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Link preview", "woodhouse-journal.jpg", 1200, 630],
      ["ImageGen original PNG", "woodhouse-journal.png", 1216, 640]
    ]
  ],
  [
    "woodhouse-darkroom",
    "woodhouse",
    "banner",
    "Loom after hours",
    "Pale green fibres cross a dark installation space.",
    "A Discord banner drawn from the Woodhouse fibre loom.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Discord banner", "woodhouse-darkroom.jpg", 1920, 1080],
      ["ImageGen original PNG", "woodhouse-darkroom.png", 1536, 864]
    ]
  ]
] as const;

export const projectStories50: CampaignItem[] = art.map(
  ([slug, project, use, title, alt, caption, href, action, files]) => {
    const [, , width, height] = files[0];
    return {
      id: `project-story-50-${slug}`,
      series: "project-stories-50",
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
      addedAt: "2026-11-12T23:31:24Z",
      kind: "editorial composition",
      credit: "Woodhouse · GPT Image 2.6 via Fal",
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
