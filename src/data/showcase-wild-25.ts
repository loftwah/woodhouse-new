import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-wild-25";
export const wild25Kit = `${base}/wild-25-kit.zip`;
const art = [
  [
    "bubbles-fizz-balloon",
    "bubbles",
    "art",
    "Fizz over the city",
    "A giant translucent one-eyed Fizz floats above a canyon of city buildings.",
    "Fizz, imagined as a balloon big enough to block the street.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Story still", "bubbles-fizz-balloon.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-fizz-balloon.png", 1008, 1792]
    ]
  ],
  [
    "foilbury-rhea-mosaic",
    "foilbury",
    "art",
    "Rhea in broken tile",
    "Rhea in teal and coral ceramic fragments, with round glasses and a teal jacket.",
    "Foilbury’s Rhea rendered as a hand-set ceramic mosaic.",
    "https://foilbury.loftwah.com/cabinet/rhea",
    "Explore",
    [
      ["Square feed", "foilbury-rhea-mosaic.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-rhea-mosaic.png", 1024, 1024]
    ]
  ],
  [
    "fighter-viking-ice",
    "fighter",
    "feature",
    "Viking in the ice",
    "Viking’s bearded bust carved in blue ice beside frozen lettering.",
    "Fighter’s Viking carved in blue ice.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Landscape", "fighter-viking-ice.jpg", 1600, 900],
      ["ImageGen original PNG", "fighter-viking-ice.png", 1536, 864]
    ]
  ],
  [
    "loftwahfm-lowtide-embroidery",
    "loftwahfm",
    "art",
    "Low Tide in thread",
    "An embroidered cobalt and pink wave on scarlet cloth with stitched station lettering.",
    "An embroidered sleeve for LoftwahFM’s Low Tide station.",
    "https://fm.loftwah.com/radio?station=low-tide",
    "Listen",
    [
      ["Pinterest pin", "loftwahfm-lowtide-embroidery.jpg", 1000, 1500],
      ["ImageGen original PNG", "loftwahfm-lowtide-embroidery.png", 1024, 1536]
    ]
  ],
  [
    "shoalshot-leviathan-print",
    "shoalshot",
    "art",
    "Tide Leviathan",
    "A black ink Tide Leviathan against light paper and red marks.",
    "A brush-ink specimen poster based on the game’s Tide Leviathan.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "shoalshot-leviathan-print.jpg", 1000, 1500],
      ["ImageGen original PNG", "shoalshot-leviathan-print.png", 1024, 1536]
    ]
  ],
  [
    "app-composer-paperwork-brutal",
    "app-composer",
    "feature",
    "The paper stack",
    "A huge orange stamp sits on a tower built of white paper.",
    "Paperwork, pictured as an orange stamp over a skyscraper of paper.",
    "https://paperwork.loftwah.com/",
    "Try",
    [
      ["Portrait feed", "app-composer-paperwork-brutal.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-paperwork-brutal.png", 1024, 1280]
    ]
  ],
  [
    "protocol-11-kitchen-isometric",
    "protocol-11",
    "feature",
    "A table in folded paper",
    "A kitchen table and chairs emerge as a yellow-and-purple paper pop-up.",
    "A pop-up paper version of Protocol 11’s Kitchen Table.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "protocol-11-kitchen-isometric.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-kitchen-isometric.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-patch-foam",
    "woodhouse",
    "feature",
    "Patch Bench after hours",
    "A green arcade cabinet and red radio sit apart on a cobalt set.",
    "A studio poster for Patch Bench, where game sound and radio run separately.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    [
      ["Portrait feed", "woodhouse-patch-foam.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-patch-foam.png", 1024, 1280]
    ]
  ],
  [
    "liferaft-archive-cinema",
    "liferaft",
    "feature",
    "The mail vault",
    "A tiny orange envelope lit in the middle of a pale-blue archive vault.",
    "A miniature vault built around finding one message in Liferaft.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["Link preview", "liferaft-archive-cinema.jpg", 1200, 630],
      ["ImageGen original PNG", "liferaft-archive-cinema.png", 1216, 640]
    ]
  ],
  [
    "max-echo-model",
    "max",
    "art",
    "Echo in amber",
    "An amber waveform cut into a dark display with a Virtual MAX simulator label.",
    "An editorial illustration of the Virtual MAX browser demo’s audible locator.",
    "https://max.loftwah.com/demo",
    "Try",
    [
      ["Square feed", "max-echo-model.jpg", 1080, 1080],
      ["ImageGen original PNG", "max-echo-model.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-fizz-pin",
    "bubbles",
    "icon",
    "Fizz in hard enamel",
    "An enamel pin of Fizz on a bright yellow background.",
    "A hard-enamel style Fizz avatar for Bubbles.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Profile icon", "bubbles-fizz-pin.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-fizz-pin.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-board-quilt",
    "bubbles",
    "art",
    "The bubble quilt",
    "Stitched symbols and coloured circles in the top half of a cobalt quilt.",
    "A textile study of the colour and shape language of Bubbles Classic.",
    "https://bubbles.loftwah.com/",
    "Play",
    [
      ["Square feed", "bubbles-board-quilt.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-board-quilt.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-observatory",
    "shoalshot",
    "feature",
    "The reef observatory",
    "A luminous reef in purple, orange and green seen through a copper porthole.",
    "A new view of SHOALSHOT’s deep reef, imagined through a porthole.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Landscape", "shoalshot-reef-observatory.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-reef-observatory.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-ray-circuit",
    "shoalshot",
    "feature",
    "Lantern Ray in copper",
    "The outline of a Lantern Ray etched into a copper and blue circuit-board illustration.",
    "Lantern Ray reimagined as an etched-copper print.",
    "https://shoalshot.loftwah.com/",
    "Play",
    [
      ["Portrait feed", "shoalshot-ray-circuit.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-ray-circuit.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-pippa-shadow",
    "foilbury",
    "art",
    "Pippa after closing",
    "Pippa as a black shadow puppet against a violet theatre curtain.",
    "A shadow-theatre poster for Pippa from Foilbury’s cabinet.",
    "https://foilbury.loftwah.com/cabinet/pippa",
    "Explore",
    [
      ["Story still", "foilbury-pippa-shadow.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-pippa-shadow.png", 1008, 1792]
    ]
  ],
  [
    "foilbury-moss-botanical",
    "foilbury",
    "feature",
    "Moss under glass",
    "Moss’s ears, hat and hoodie assembled from pressed leaves and flowers.",
    "A pressed-leaf portrait of Moss based on the published Foilbury card.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    [
      ["Portrait feed", "foilbury-moss-botanical.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-moss-botanical.png", 1024, 1280]
    ]
  ],
  [
    "fighter-reaper-news",
    "fighter",
    "art",
    "Last edition",
    "Grim Reaper emerges from a black-and-red tabloid page.",
    "A tabloid horror poster starring Fighter’s Grim Reaper.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Pinterest pin", "fighter-reaper-news.jpg", 1000, 1500],
      ["ImageGen original PNG", "fighter-reaper-news.png", 1024, 1536]
    ]
  ],
  [
    "fighter-tux-tape",
    "fighter",
    "icon",
    "Tux on the test signal",
    "Tux’s orange beak and teal headset in a cyan CRT close-up.",
    "A CRT profile portrait of Fighter’s Tux.",
    "https://fighter.loftwah.com/",
    "Play",
    [
      ["Profile icon", "fighter-tux-tape.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-tux-tape.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-arcade-thermal",
    "protocol-11",
    "banner",
    "Arcade Pop in false colour",
    "An empty arcade room in purple, magenta and yellow false colour.",
    "Protocol 11’s Arcade Pop room as a false-colour header.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["X header", "protocol-11-arcade-thermal.jpg", 1500, 500],
      ["ImageGen original PNG", "protocol-11-arcade-thermal.png", 1536, 512]
    ]
  ],
  [
    "protocol-11-felt-impossible",
    "protocol-11",
    "banner",
    "Felt through the walls",
    "A ribbon of green baize rises from a table through a dark doorway.",
    "Classic Felt’s green baize turned into an impossible room.",
    "https://protocol11.loftwah.com/",
    "Play",
    [
      ["Discord banner", "protocol-11-felt-impossible.jpg", 1920, 1080],
      ["ImageGen original PNG", "protocol-11-felt-impossible.png", 1536, 864]
    ]
  ],
  [
    "app-composer-launch-arcade",
    "app-composer",
    "feature",
    "One mark, three ways",
    "The Launch Kit radio mark printed on three toy-like pieces in brightly coloured packaging.",
    "A toy-packaging illustration of Launch Kit’s icon and social export workflow.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    [
      ["Landscape", "app-composer-launch-arcade.jpg", 1600, 900],
      ["ImageGen original PNG", "app-composer-launch-arcade.png", 1536, 864]
    ]
  ],
  [
    "app-composer-ldraw-bent",
    "app-composer",
    "art",
    "Bend the diagram",
    "Three diagram nodes connected by orange neon glass on a black wall.",
    "An illuminated editorial study based on LDraw’s diagram canvas.",
    "https://ldraw.loftwah.com/",
    "Try",
    [
      ["Square feed", "app-composer-ldraw-bent.jpg", 1080, 1080],
      ["ImageGen original PNG", "app-composer-ldraw-bent.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-pressure-xray",
    "loftwahfm",
    "art",
    "Pressure System X-ray",
    "A blacklight speaker cone in orange and cyan with Pressure System lettering.",
    "Pressure System’s drum-heavy sound in a blacklight sleeve.",
    "https://fm.loftwah.com/radio?station=pressure-system",
    "Listen",
    [
      ["Story still", "loftwahfm-pressure-xray.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-pressure-xray.png", 1008, 1792]
    ]
  ],
  [
    "liferaft-archive-punch",
    "liferaft",
    "banner",
    "The archive opens",
    "A bright orange envelope emerges from a torn navy punch card.",
    "A wide banner for opening a local mail archive in Liferaft.",
    "https://liferaft.loftwah.com/",
    "Explore",
    [
      ["X header", "liferaft-archive-punch.jpg", 1500, 500],
      ["ImageGen original PNG", "liferaft-archive-punch.png", 1536, 512]
    ]
  ],
  [
    "woodhouse-loom-plasma",
    "woodhouse",
    "feature",
    "Loom in a vacuum",
    "Mint and yellow light strands cross in a black chamber.",
    "Woodhouse’s browser loom imagined as a laser installation.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    [
      ["Landscape", "woodhouse-loom-plasma.jpg", 1600, 900],
      ["ImageGen original PNG", "woodhouse-loom-plasma.png", 1536, 864]
    ]
  ]
] as const;

export const wild25: CampaignItem[] = art.map(
  ([slug, project, use, title, alt, caption, href, action, files]) => {
    const [, , width, height] = files[0];
    return {
      id: `wild-25-${slug}`,
      series: "wild-25",
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
      addedAt: "2026-11-13T02:39:18Z",
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
