import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-field-guide";
const art = [
  [
    "dean-pippa-zine",
    "woodhouse",
    "art",
    "Last credit",
    "Two-ink comic cover of Dean and Pippa outside an arcade.",
    "An illustrated poster for Last credit.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1122,
    1402,
    "Share poster",
    "Posters",
    "Codex ImageGen",
    [["ImageGen original PNG", "dean-pippa-zine.png", 1122, 1402]]
  ],
  [
    "bubbles-sunprint",
    "bubbles",
    "feature",
    "Bank shot · Cyanotype",
    "Cyanotype print of a Bubbles bank shot.",
    "An illustrated workbench study of Bank shot.",
    "https://bubbles.loftwah.com/",
    "Explore",
    1122,
    1402,
    "Design study",
    "Diagrams",
    "Codex ImageGen",
    [["ImageGen original PNG", "bubbles-sunprint.png", 1122, 1402]]
  ],
  [
    "foilbury-rhea-radio",
    "foilbury",
    "art",
    "Rhea after hours · Mezzotint card",
    "Rhea in a record-cutting room with a gilt border.",
    "Rhea’s teal hair and coral streak keep the portrait readable under warm light.",
    "https://foilbury.loftwah.com/",
    "Explore",
    1122,
    1402,
    "Collectible print",
    "Collectible prints",
    "Codex ImageGen",
    [["ImageGen original PNG", "foilbury-rhea-radio.png", 1122, 1402]]
  ],
  [
    "protocol-chair",
    "protocol-11",
    "special",
    "Pull up a chair · Enamel pin",
    "A honey-and-teal enamel pin shaped like a chair and playing card.",
    "A small emblem drawn from Pull up a chair.",
    "https://protocol11.loftwah.com/",
    "Explore",
    1254,
    1254,
    "Sticker or icon",
    "Stickers",
    "Codex ImageGen",
    [["ImageGen original PNG", "protocol-chair.png", 1254, 1254]]
  ],
  [
    "pippa-studio",
    "woodhouse",
    "art",
    "Pippa has the studio",
    "Pippa in a burgundy studio chair beside a sampler.",
    "A visual story from the world of Pippa has the studio.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1122,
    1402,
    "Visual story",
    "Visual stories",
    "Codex ImageGen",
    [["ImageGen original PNG", "pippa-studio.png", 1122, 1402]]
  ],
  [
    "shoalshot-ray-diagram",
    "shoalshot",
    "feature",
    "Lantern Ray field plate · Diagram",
    "Lantern Ray field plate. Diagram in 1990s instruction manual risograph.",
    "The ray reads as a broad wing before you see the speckles.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "shoalshot-ray-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-ray-diagram.png", 1536, 864]
    ]
  ],
  [
    "app-composer-ldraw-diagram",
    "app-composer",
    "feature",
    "The model comes apart · Diagram",
    "The model comes apart. Diagram in tabletop rulebook foldout.",
    "Seeing the parts apart makes it easier to understand the finished build.",
    "https://ldraw.loftwah.com/",
    "Try",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "app-composer-ldraw-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-ldraw-diagram.png", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-cartridge-poster",
    "loftwahfm",
    "feature",
    "Cartridge Club · Poster",
    "Cartridge Club. Poster in hand-pulled fluorescent gig screenprint.",
    "Cartridge Club puts the game-room colours back on the stereo.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "loftwahfm-cartridge-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "loftwahfm-cartridge-poster.png", 1536, 864]
    ]
  ],
  [
    "liferaft-recover-diagram",
    "liferaft",
    "feature",
    "Recover the attachment · Diagram",
    "Recover the attachment. Diagram in limited-colour chalk diagram.",
    "Open the source message before you choose which attachment to recover.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "liferaft-recover-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-recover-diagram.png", 1024, 1280]
    ]
  ],
  [
    "fighter-ringside-diagram",
    "fighter",
    "feature",
    "Pippa has the better corner · Diagram",
    "Pippa has the better corner. Diagram in printed service manual with yellow highlights.",
    "Pippa has the better corner. Dean can have the other one.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "fighter-ringside-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-ringside-diagram.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-loftwah-icon",
    "woodhouse",
    "special",
    "Dean and Pippa · Arcade avatar",
    "Square illustrated avatar of Dean and Pippa.",
    "A small emblem drawn from Dean and Pippa.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1254,
    1254,
    "Sticker or icon",
    "Stickers",
    "Codex ImageGen",
    [["ImageGen original PNG", "woodhouse-loftwah-icon.png", 1254, 1254]]
  ],
  [
    "max-simulator-diagram",
    "max",
    "feature",
    "A useful rehearsal · Diagram",
    "A useful rehearsal. Diagram in cream drafting-paper graphite plan.",
    "An illustrated workbench study of A useful rehearsal. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1536,
    864,
    "Prototype study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "max-simulator-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "max-simulator-diagram.png", 1536, 864]
    ]
  ],
  [
    "woodhouse-card-source-poster",
    "woodhouse",
    "art",
    "Where the card came from · Poster",
    "Where the card came from. Poster in riso cobalt and rust paper.",
    "Put the source beside the finished card and you can see what travelled.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    1008,
    1792,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "woodhouse-card-source-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "woodhouse-card-source-poster.png", 1008, 1792]
    ]
  ],
  [
    "bubbles-bank-angle-poster",
    "bubbles",
    "feature",
    "The wall is part of the shot · Poster",
    "The wall is part of the shot. Poster in Japanese station poster gouache.",
    "The wall is part of the shot. Go wide to get behind the cluster.",
    "https://bubbles.loftwah.com/",
    "Play",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "bubbles-bank-angle-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "bubbles-bank-angle-poster.png", 1536, 864]
    ]
  ],
  [
    "foilbury-finish-poster",
    "foilbury",
    "feature",
    "The same card under light · Poster",
    "The same card under light. Poster in enamel-sign colour separations.",
    "The art stays the same. The finish changes where the light goes.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "foilbury-finish-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-finish-poster.png", 1024, 1280]
    ]
  ],
  [
    "fighter-beat-poster",
    "fighter",
    "art",
    "Read the impact · Poster",
    "Read the impact. Poster in riso cobalt and rust paper.",
    "A fight reads better when there is time to see who committed and who recoiled.",
    "https://fighter.loftwah.com/",
    "Play",
    1008,
    1792,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "fighter-beat-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-beat-poster.png", 1008, 1792]
    ]
  ],
  [
    "shoalshot-abyssjaw-poster",
    "shoalshot",
    "feature",
    "Abyssjaw in the dark · Poster",
    "Abyssjaw in the dark. Poster in Japanese station poster gouache.",
    "In a dark reef scene, Abyssjaw’s armour still needs a clean edge.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "shoalshot-abyssjaw-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-abyssjaw-poster.png", 1536, 864]
    ]
  ],
  [
    "protocol-11-arcade-poster",
    "protocol-11",
    "feature",
    "Arcade Pop · Poster",
    "Arcade Pop. Poster in mid-century travel lithograph.",
    "Arcade Pop puts the cabinet colours around the card table.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "protocol-11-arcade-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-arcade-poster.png", 1024, 1280]
    ]
  ],
  [
    "app-composer-launch-kit-poster",
    "app-composer",
    "feature",
    "One mark, several destinations · Poster",
    "One mark, several destinations. Poster in Japanese station poster gouache.",
    "One mark can become an icon, a social export and a browser tab.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "app-composer-launch-kit-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "app-composer-launch-kit-poster.png", 1536, 864]
    ]
  ],
  [
    "loftwahfm-bob-poster",
    "loftwahfm",
    "feature",
    "Bob on the dial · Poster",
    "Bob on the dial. Poster in mid-century travel lithograph.",
    "Bob belongs on the cover and at the dial.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "loftwahfm-bob-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-bob-poster.png", 1024, 1280]
    ]
  ],
  [
    "liferaft-archive-poster",
    "liferaft",
    "feature",
    "Keep the original in place · Poster",
    "Keep the original in place. Poster in enamel-sign colour separations.",
    "The archive stays put while Liferaft gives you a copy of the file you wanted.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "liferaft-archive-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-archive-poster.png", 1024, 1280]
    ]
  ],
  [
    "max-simulator-poster",
    "max",
    "art",
    "A useful rehearsal · Poster",
    "A useful rehearsal. Poster in paper theatre deep stage shadows.",
    "An illustrated poster for A useful rehearsal. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1008,
    1792,
    "Prototype study",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "max-simulator-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-simulator-poster.png", 1008, 1792]
    ]
  ],
  [
    "woodhouse-card-source-diagram",
    "woodhouse",
    "feature",
    "Where the card came from · Diagram",
    "Where the card came from. Diagram in blueprint white ink on petrol.",
    "Put the source beside the finished card and you can see what travelled.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "woodhouse-card-source-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "woodhouse-card-source-diagram.png", 1536, 864]
    ]
  ],
  [
    "bubbles-bank-angle-diagram",
    "bubbles",
    "feature",
    "The wall is part of the shot · Diagram",
    "The wall is part of the shot. Diagram in limited-colour chalk diagram.",
    "The wall is part of the shot. Go wide to get behind the cluster.",
    "https://bubbles.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "bubbles-bank-angle-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "bubbles-bank-angle-diagram.png", 1536, 864]
    ]
  ],
  [
    "foilbury-finish-diagram",
    "foilbury",
    "feature",
    "The same card under light · Diagram",
    "The same card under light. Diagram in tabletop rulebook foldout.",
    "The art stays the same. The finish changes where the light goes.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "foilbury-finish-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "foilbury-finish-diagram.png", 1216, 640]
    ]
  ],
  [
    "fighter-beat-diagram",
    "fighter",
    "feature",
    "Read the impact · Diagram",
    "Read the impact. Diagram in blueprint white ink on petrol.",
    "A fight reads better when there is time to see who committed and who recoiled.",
    "https://fighter.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "fighter-beat-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "fighter-beat-diagram.png", 1216, 640]
    ]
  ],
  [
    "shoalshot-abyssjaw-diagram",
    "shoalshot",
    "feature",
    "Abyssjaw in the dark · Diagram",
    "Abyssjaw in the dark. Diagram in limited-colour chalk diagram.",
    "In a dark reef scene, Abyssjaw’s armour still needs a clean edge.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "shoalshot-abyssjaw-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-abyssjaw-diagram.png", 1216, 640]
    ]
  ],
  [
    "protocol-11-arcade-diagram",
    "protocol-11",
    "feature",
    "Arcade Pop · Diagram",
    "Arcade Pop. Diagram in printed service manual with yellow highlights.",
    "Arcade Pop puts the cabinet colours around the card table.",
    "https://protocol11.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "protocol-11-arcade-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "protocol-11-arcade-diagram.png", 1216, 640]
    ]
  ],
  [
    "app-composer-launch-kit-diagram",
    "app-composer",
    "feature",
    "One mark, several destinations · Diagram",
    "One mark, several destinations. Diagram in limited-colour chalk diagram.",
    "One mark can become an icon, a social export and a browser tab.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "app-composer-launch-kit-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "app-composer-launch-kit-diagram.png", 1536, 864]
    ]
  ],
  [
    "loftwahfm-bob-diagram",
    "loftwahfm",
    "feature",
    "Bob on the dial · Diagram",
    "Bob on the dial. Diagram in printed service manual with yellow highlights.",
    "Bob belongs on the cover and at the dial.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "loftwahfm-bob-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "loftwahfm-bob-diagram.png", 1536, 864]
    ]
  ],
  [
    "liferaft-archive-diagram",
    "liferaft",
    "feature",
    "Keep the original in place · Diagram",
    "Keep the original in place. Diagram in tabletop rulebook foldout.",
    "The archive stays put while Liferaft gives you a copy of the file you wanted.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "liferaft-archive-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "liferaft-archive-diagram.png", 1216, 640]
    ]
  ],
  [
    "woodhouse-card-source-story",
    "woodhouse",
    "art",
    "Where the card came from · Story",
    "Where the card came from. Story in claymation set with deep focus.",
    "Put the source beside the finished card and you can see what travelled.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "woodhouse-card-source-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-card-source-story.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-bank-angle-story",
    "bubbles",
    "art",
    "The wall is part of the shot · Story",
    "The wall is part of the shot. Story in inked Franco-Belgian comic.",
    "The wall is part of the shot. Go wide to get behind the cluster.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "bubbles-bank-angle-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-bank-angle-story.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-finish-story",
    "foilbury",
    "art",
    "The same card under light · Story",
    "The same card under light. Story in late-night cinematic miniatures.",
    "The art stays the same. The finish changes where the light goes.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "foilbury-finish-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-finish-story.png", 1008, 1792]
    ]
  ],
  [
    "fighter-beat-story",
    "fighter",
    "art",
    "Read the impact · Story",
    "Read the impact. Story in claymation set with deep focus.",
    "A fight reads better when there is time to see who committed and who recoiled.",
    "https://fighter.loftwah.com/",
    "Play",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "fighter-beat-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-beat-story.png", 1008, 1792]
    ]
  ],
  [
    "shoalshot-abyssjaw-story",
    "shoalshot",
    "art",
    "Abyssjaw in the dark · Story",
    "Abyssjaw in the dark. Story in inked Franco-Belgian comic.",
    "In a dark reef scene, Abyssjaw’s armour still needs a clean edge.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "shoalshot-abyssjaw-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-abyssjaw-story.png", 1008, 1792]
    ]
  ],
  [
    "protocol-11-arcade-story",
    "protocol-11",
    "art",
    "Arcade Pop · Story",
    "Arcade Pop. Story in silent comic in coral and cobalt.",
    "Arcade Pop puts the cabinet colours around the card table.",
    "https://protocol11.loftwah.com/",
    "Play",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "protocol-11-arcade-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "protocol-11-arcade-story.png", 1008, 1792]
    ]
  ],
  [
    "app-composer-launch-kit-story",
    "app-composer",
    "art",
    "One mark, several destinations · Story",
    "One mark, several destinations. Story in inked Franco-Belgian comic.",
    "One mark can become an icon, a social export and a browser tab.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "app-composer-launch-kit-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-launch-kit-story.png", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-bob-story",
    "loftwahfm",
    "art",
    "Bob on the dial · Story",
    "Bob on the dial. Story in silent comic in coral and cobalt.",
    "Bob belongs on the cover and at the dial.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "loftwahfm-bob-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-bob-story.png", 1024, 1280]
    ]
  ],
  [
    "liferaft-find-story",
    "liferaft",
    "art",
    "The thing you remember · Story",
    "The thing you remember. Story in original suburban animated sitcom cels.",
    "Find the archive message by the one detail you still remember.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "liferaft-find-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-find-story.png", 1024, 1280]
    ]
  ],
  [
    "max-simulator-story",
    "max",
    "art",
    "A useful rehearsal · Story",
    "A useful rehearsal. Story in manga in two spot inks.",
    "A visual story from the world of A useful rehearsal. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1024,
    1280,
    "Prototype study",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "max-simulator-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-simulator-story.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-card-source-sticker",
    "woodhouse",
    "special",
    "Where the card came from · Sticker",
    "Where the card came from. Sticker in two-colour embroidered patch.",
    "Put the source beside the finished card and you can see what travelled.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "woodhouse-card-source-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-card-source-sticker.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-bank-angle-sticker",
    "bubbles",
    "special",
    "The wall is part of the shot · Sticker",
    "The wall is part of the shot. Sticker in soft rubber arcade charm.",
    "The wall is part of the shot. Go wide to get behind the cluster.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "bubbles-bank-angle-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-bank-angle-sticker.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-finish-sticker",
    "foilbury",
    "special",
    "The same card under light · Sticker",
    "The same card under light. Sticker in sculpted resin badge.",
    "The art stays the same. The finish changes where the light goes.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "foilbury-finish-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-finish-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-beat-sticker",
    "fighter",
    "special",
    "Read the impact · Sticker",
    "Read the impact. Sticker in two-colour embroidered patch.",
    "A fight reads better when there is time to see who committed and who recoiled.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-beat-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-beat-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-abyssjaw-sticker",
    "shoalshot",
    "special",
    "Abyssjaw in the dark · Sticker",
    "Abyssjaw in the dark. Sticker in soft rubber arcade charm.",
    "In a dark reef scene, Abyssjaw’s armour still needs a clean edge.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-abyssjaw-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-abyssjaw-sticker.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-arcade-sticker",
    "protocol-11",
    "special",
    "Arcade Pop · Sticker",
    "Arcade Pop. Sticker in rubber-hose vinyl decal.",
    "Arcade Pop puts the cabinet colours around the card table.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "protocol-11-arcade-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-arcade-sticker.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-launch-kit-sticker",
    "app-composer",
    "special",
    "One mark, several destinations · Sticker",
    "One mark, several destinations. Sticker in soft rubber arcade charm.",
    "One mark can become an icon, a social export and a browser tab.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "app-composer-launch-kit-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-launch-kit-sticker.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-bob-sticker",
    "loftwahfm",
    "special",
    "Bob on the dial · Sticker",
    "Bob on the dial. Sticker in rubber-hose vinyl decal.",
    "Bob belongs on the cover and at the dial.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "loftwahfm-bob-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-bob-sticker.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-archive-sticker",
    "liferaft",
    "special",
    "Keep the original in place · Sticker",
    "Keep the original in place. Sticker in sculpted resin badge.",
    "The archive stays put while Liferaft gives you a copy of the file you wanted.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "liferaft-archive-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-archive-sticker.png", 1024, 1024]
    ]
  ],
  [
    "max-simulator-sticker",
    "max",
    "special",
    "A useful rehearsal · Sticker",
    "A useful rehearsal. Sticker in glazed ceramic pin.",
    "A small emblem drawn from A useful rehearsal. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1024,
    1024,
    "Prototype study",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "max-simulator-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "max-simulator-sticker.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-card-source-print",
    "woodhouse",
    "art",
    "Where the card came from · Print",
    "Where the card came from. Print in premium acetate sleeve insert.",
    "Put the source beside the finished card and you can see what travelled.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "woodhouse-card-source-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-card-source-print.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-bank-angle-print",
    "bubbles",
    "art",
    "The wall is part of the shot · Print",
    "The wall is part of the shot. Print in woven collector patch art.",
    "The wall is part of the shot. Go wide to get behind the cluster.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "bubbles-bank-angle-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "bubbles-bank-angle-print.png", 1024, 1536]
    ]
  ],
  [
    "foilbury-finish-print",
    "foilbury",
    "art",
    "The same card under light · Print",
    "The same card under light. Print in archival stamp and dry ink.",
    "The art stays the same. The finish changes where the light goes.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "foilbury-finish-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-finish-print.png", 1024, 1024]
    ]
  ],
  [
    "fighter-beat-print",
    "fighter",
    "art",
    "Read the impact · Print",
    "Read the impact. Print in premium acetate sleeve insert.",
    "A fight reads better when there is time to see who committed and who recoiled.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "fighter-beat-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-beat-print.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-abyssjaw-print",
    "shoalshot",
    "art",
    "Abyssjaw in the dark · Print",
    "Abyssjaw in the dark. Print in woven collector patch art.",
    "In a dark reef scene, Abyssjaw’s armour still needs a clean edge.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "shoalshot-abyssjaw-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "shoalshot-abyssjaw-print.png", 1024, 1536]
    ]
  ],
  [
    "protocol-11-arcade-print",
    "protocol-11",
    "art",
    "Arcade Pop · Print",
    "Arcade Pop. Print in vellum drawing in coloured pencil.",
    "Arcade Pop puts the cabinet colours around the card table.",
    "https://protocol11.loftwah.com/",
    "Play",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "protocol-11-arcade-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "protocol-11-arcade-print.png", 1536, 864]
    ]
  ],
  [
    "app-composer-launch-kit-print",
    "app-composer",
    "art",
    "One mark, several destinations · Print",
    "One mark, several destinations. Print in woven collector patch art.",
    "One mark can become an icon, a social export and a browser tab.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "app-composer-launch-kit-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "app-composer-launch-kit-print.png", 1536, 864]
    ]
  ],
  [
    "loftwahfm-bob-print",
    "loftwahfm",
    "art",
    "Bob on the dial · Print",
    "Bob on the dial. Print in vellum drawing in coloured pencil.",
    "Bob belongs on the cover and at the dial.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "loftwahfm-bob-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "loftwahfm-bob-print.png", 1024, 1536]
    ]
  ],
  [
    "liferaft-archive-print",
    "liferaft",
    "art",
    "Keep the original in place · Print",
    "Keep the original in place. Print in archival stamp and dry ink.",
    "The archive stays put while Liferaft gives you a copy of the file you wanted.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "liferaft-archive-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "liferaft-archive-print.png", 1024, 1280]
    ]
  ],
  [
    "max-simulator-print",
    "max",
    "art",
    "A useful rehearsal · Print",
    "A useful rehearsal. Print in matte night-shift safety orange.",
    "A printable collectible inspired by A useful rehearsal. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1536,
    864,
    "Prototype study",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "max-simulator-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "max-simulator-print.png", 1536, 864]
    ]
  ],
  [
    "woodhouse-web-seal-logo",
    "woodhouse",
    "icon",
    "Woodhouse woven seal",
    "A single minimal logo exploration. Tensioned cyan and chartreuse loom fibres build a very clean seal in a dark field. No lettering. Strong shape at 32px.",
    "An alternate mark or header for Woodhouse woven seal.",
    "https://woodhouse.loftwah.com/exhibits/source-plate/",
    "Explore",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "woodhouse-web-seal-logo.png", 1024, 1024]]
  ],
  [
    "bubbles-web-cabinet-logo",
    "bubbles",
    "icon",
    "Bubbles arcade emblem",
    "A circle-ready web icon exploration for the real browser game. A three-bubble cluster and one bright rebound angle on purple. One simple mark. No lettering.",
    "An alternate mark or header for Bubbles arcade emblem.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "bubbles-web-cabinet-logo.png", 1024, 1024]]
  ],
  [
    "foilbury-web-foil-logo",
    "foilbury",
    "icon",
    "Foilbury foil stamp",
    "A maker stamp exploration based on the published paper F over foil plane with one folded corner. Palette cream, black and foil blue. One centred emblem. No other lettering.",
    "An alternate mark or header for Foilbury foil stamp.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "foilbury-web-foil-logo.png", 1024, 1024]]
  ],
  [
    "fighter-web-arcade-logo",
    "fighter",
    "icon",
    "Fighter marquee mark",
    "An original LOFTWAH FIGHTER mark exploration as a halftone arcade-marquee emblem, broad typography, terracotta and ink. Only exact words LOFTWAH FIGHTER.",
    "An alternate mark or header for Fighter marquee mark.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "fighter-web-arcade-logo.png", 1024, 1024]]
  ],
  [
    "shoalshot-web-ray-logo",
    "shoalshot",
    "icon",
    "SHOALSHOT reef mark",
    "A clean avatar-safe emblem exploration from the true Lantern Ray silhouette in chalk against deep petrol. One focused silhouette and no lettering.",
    "An alternate mark or header for SHOALSHOT reef mark.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "shoalshot-web-ray-logo.png", 1024, 1024]]
  ],
  [
    "protocol-11-web-chair-logo",
    "protocol-11",
    "icon",
    "Protocol 11 chair mark",
    "A one-colour icon exploration for a browser card table, top-down chair and an upright card back combine in a refined teal symbol on warm cream. No lettering.",
    "An alternate mark or header for Protocol 11 chair mark.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "protocol-11-web-chair-logo.png", 1024, 1024]]
  ],
  [
    "app-composer-web-launch-logo",
    "app-composer",
    "banner",
    "App Composer launch header",
    "A wide branded web resource. Build a playful modular composition of fitting folded parts inspired by the actual product tools. Exact words APP COMPOSER and composer.loftwah.com, bottom-left kept clear.",
    "An alternate mark or header for App Composer launch header.",
    "https://composer.loftwah.com/launch-kit",
    "Try",
    1536,
    512,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "app-composer-web-launch-logo.png", 1536, 512]]
  ],
  [
    "loftwahfm-web-dial-logo",
    "loftwahfm",
    "icon",
    "LoftwahFM dial mark",
    "A single outline logo exploration for a radio preset, a horizontal dial and record groove combined in elegant amber lines, one dark field. No lettering.",
    "An alternate mark or header for LoftwahFM dial mark.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "loftwahfm-web-dial-logo.png", 1024, 1024]]
  ],
  [
    "liferaft-web-archive-logo",
    "liferaft",
    "icon",
    "Liferaft archive mark",
    "A clean web icon exploration, a single navy archive drawer with a coral pull tab and one paper edge, tactile editorial engraving. No lettering.",
    "An alternate mark or header for Liferaft archive mark.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "liferaft-web-archive-logo.png", 1024, 1024]]
  ],
  [
    "max-web-signal-logo",
    "max",
    "icon",
    "Virtual MAX signal mark",
    "A single web icon exploration for a browser simulator, a muted amber dot and a minimal signal arc on slate. No device silhouette or hardware claims. No lettering.",
    "An alternate mark or header for Virtual MAX signal mark.",
    "https://max.loftwah.com/demo",
    "Try",
    1024,
    1024,
    "Brand exploration",
    "Brand explorations",
    "GPT Image 2.6 via Fal",
    [["ImageGen original PNG", "max-web-signal-logo.png", 1024, 1024]]
  ],
  [
    "woodhouse-dean-poster",
    "woodhouse",
    "feature",
    "Dean off the clock · Poster",
    "Dean off the clock. Poster in 90s arcade marquee hand lettering.",
    "Dean with the glasses, the ginger beard and a record within reach.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1216,
    640,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "woodhouse-dean-poster-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "woodhouse-dean-poster.png", 1216, 640]
    ]
  ],
  [
    "bubbles-cabinet-poster",
    "bubbles",
    "banner",
    "Another credit · Poster",
    "Another credit. Poster in European sci-fi magazine cover.",
    "A browser game in the clothes of a cabinet you could find in a milk bar.",
    "https://bubbles.loftwah.com/",
    "Play",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "bubbles-cabinet-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "bubbles-cabinet-poster.png", 1536, 512]
    ]
  ],
  [
    "foilbury-gabe-poster",
    "foilbury",
    "banner",
    "Gabe’s shelf · Poster",
    "Gabe’s shelf. Poster in surreal lacquer still-life.",
    "Gabe gets the spot in the cabinet where the light stays a little longer.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "foilbury-gabe-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "foilbury-gabe-poster.png", 1536, 512]
    ]
  ],
  [
    "fighter-reaper-poster",
    "fighter",
    "banner",
    "The Reaper enters · Poster",
    "The Reaper enters. Poster in European sci-fi magazine cover.",
    "An illustrated poster for The Reaper enters.",
    "https://fighter.loftwah.com/",
    "Play",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "fighter-reaper-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "fighter-reaper-poster.png", 1536, 512]
    ]
  ],
  [
    "shoalshot-crown-poster",
    "shoalshot",
    "banner",
    "The crown in the current · Poster",
    "The crown in the current. Poster in surreal lacquer still-life.",
    "You can pick out the crown of the jelly before the trailing tentacles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "shoalshot-crown-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "shoalshot-crown-poster.png", 1536, 512]
    ]
  ],
  [
    "protocol-11-felt-poster",
    "protocol-11",
    "art",
    "Classic felt · Poster",
    "Classic felt. Poster in riso cobalt and rust paper.",
    "On Classic Felt, a clear card silhouette does more than another effect.",
    "https://protocol11.loftwah.com/",
    "Play",
    1008,
    1792,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "protocol-11-felt-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "protocol-11-felt-poster.png", 1008, 1792]
    ]
  ],
  [
    "app-composer-ldraw-poster",
    "app-composer",
    "feature",
    "The model comes apart · Poster",
    "The model comes apart. Poster in enamel-sign colour separations.",
    "Seeing the parts apart makes it easier to understand the finished build.",
    "https://ldraw.loftwah.com/",
    "Try",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "app-composer-ldraw-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-ldraw-poster.png", 1024, 1280]
    ]
  ],
  [
    "liferaft-find-poster",
    "liferaft",
    "banner",
    "The thing you remember · Poster",
    "The thing you remember. Poster in surreal lacquer still-life.",
    "Find the archive message by the one detail you still remember.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "liferaft-find-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "liferaft-find-poster.png", 1536, 512]
    ]
  ],
  [
    "max-voice-poster",
    "max",
    "banner",
    "A voice interaction to try · Poster",
    "A voice interaction to try. Poster in European sci-fi magazine cover.",
    "An illustrated poster for A voice interaction to try. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1536,
    512,
    "Prototype study",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "max-voice-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "max-voice-poster.png", 1536, 512]
    ]
  ],
  [
    "woodhouse-dean-diagram",
    "woodhouse",
    "feature",
    "Dean off the clock · Diagram",
    "Dean off the clock. Diagram in 1990s instruction manual risograph.",
    "Dean with the glasses, the ginger beard and a record within reach.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "woodhouse-dean-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-dean-diagram.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-cabinet-diagram",
    "bubbles",
    "feature",
    "Another credit · Diagram",
    "Another credit. Diagram in specimen field plate in fine ink.",
    "A browser game in the clothes of a cabinet you could find in a milk bar.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "bubbles-cabinet-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-cabinet-diagram.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-gabe-diagram",
    "foilbury",
    "feature",
    "Gabe’s shelf · Diagram",
    "Gabe’s shelf. Diagram in isometric construction on recycled stock.",
    "Gabe gets the spot in the cabinet where the light stays a little longer.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "foilbury-gabe-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "foilbury-gabe-diagram.png", 1536, 864]
    ]
  ],
  [
    "fighter-reaper-diagram",
    "fighter",
    "feature",
    "The Reaper enters · Diagram",
    "The Reaper enters. Diagram in specimen field plate in fine ink.",
    "An illustrated workbench study of The Reaper enters.",
    "https://fighter.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "fighter-reaper-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "fighter-reaper-diagram.png", 1216, 640]
    ]
  ],
  [
    "shoalshot-crown-diagram",
    "shoalshot",
    "feature",
    "The crown in the current · Diagram",
    "The crown in the current. Diagram in isometric construction on recycled stock.",
    "You can pick out the crown of the jelly before the trailing tentacles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-crown-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-crown-diagram.png", 1024, 1280]
    ]
  ],
  [
    "protocol-11-felt-diagram",
    "protocol-11",
    "feature",
    "Classic felt · Diagram",
    "Classic felt. Diagram in blueprint white ink on petrol.",
    "On Classic Felt, a clear card silhouette does more than another effect.",
    "https://protocol11.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "protocol-11-felt-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "protocol-11-felt-diagram.png", 1536, 864]
    ]
  ],
  [
    "loftwahfm-cartridge-diagram",
    "loftwahfm",
    "feature",
    "Cartridge Club · Diagram",
    "Cartridge Club. Diagram in cutaway gouache on navy.",
    "Cartridge Club puts the game-room colours back on the stereo.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "loftwahfm-cartridge-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "loftwahfm-cartridge-diagram.png", 1216, 640]
    ]
  ],
  [
    "liferaft-find-diagram",
    "liferaft",
    "feature",
    "The thing you remember · Diagram",
    "The thing you remember. Diagram in isometric construction on recycled stock.",
    "Find the archive message by the one detail you still remember.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "liferaft-find-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "liferaft-find-diagram.png", 1536, 864]
    ]
  ],
  [
    "max-voice-diagram",
    "max",
    "feature",
    "A voice interaction to try · Diagram",
    "A voice interaction to try. Diagram in specimen field plate in fine ink.",
    "An illustrated workbench study of A voice interaction to try. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1216,
    640,
    "Prototype study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "max-voice-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "max-voice-diagram.png", 1216, 640]
    ]
  ],
  [
    "woodhouse-dean-story",
    "woodhouse",
    "art",
    "Dean off the clock · Story",
    "Dean off the clock. Story in pixel-art scene in arcade palette.",
    "Dean with the glasses, the ginger beard and a record within reach.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "woodhouse-dean-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-dean-story.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-cabinet-story",
    "bubbles",
    "art",
    "Another credit · Story",
    "Another credit. Story in woodcut folk tale.",
    "A browser game in the clothes of a cabinet you could find in a milk bar.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "bubbles-cabinet-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-cabinet-story.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-gabe-story",
    "foilbury",
    "art",
    "Gabe’s shelf · Story",
    "Gabe’s shelf. Story in original suburban animated sitcom cels.",
    "Gabe gets the spot in the cabinet where the light stays a little longer.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "foilbury-gabe-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-gabe-story.png", 1024, 1280]
    ]
  ],
  [
    "fighter-humpty-story",
    "fighter",
    "art",
    "Humpty off the wall · Story",
    "Humpty off the wall. Story in analogue disposable-camera snapshot aesthetic.",
    "A visual story from the world of Humpty off the wall.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "fighter-humpty-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-humpty-story.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-crown-story",
    "shoalshot",
    "art",
    "The crown in the current · Story",
    "The crown in the current. Story in original suburban animated sitcom cels.",
    "You can pick out the crown of the jelly before the trailing tentacles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "shoalshot-crown-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-crown-story.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-felt-story",
    "protocol-11",
    "art",
    "Classic felt · Story",
    "Classic felt. Story in claymation set with deep focus.",
    "On Classic Felt, a clear card silhouette does more than another effect.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "protocol-11-felt-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-felt-story.png", 1024, 1280]
    ]
  ],
  [
    "app-composer-ldraw-story",
    "app-composer",
    "art",
    "The model comes apart · Story",
    "The model comes apart. Story in late-night cinematic miniatures.",
    "Seeing the parts apart makes it easier to understand the finished build.",
    "https://ldraw.loftwah.com/",
    "Try",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "app-composer-ldraw-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "app-composer-ldraw-story.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-cartridge-story",
    "loftwahfm",
    "art",
    "Cartridge Club · Story",
    "Cartridge Club. Story in analogue disposable-camera snapshot aesthetic.",
    "Cartridge Club puts the game-room colours back on the stereo.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "loftwahfm-cartridge-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-cartridge-story.png", 1008, 1792]
    ]
  ],
  [
    "liferaft-recover-story",
    "liferaft",
    "art",
    "Recover the attachment · Story",
    "Recover the attachment. Story in inked Franco-Belgian comic.",
    "Open the source message before you choose which attachment to recover.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "liferaft-recover-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-recover-story.png", 1024, 1024]
    ]
  ],
  [
    "max-voice-story",
    "max",
    "art",
    "A voice interaction to try · Story",
    "A voice interaction to try. Story in woodcut folk tale.",
    "A visual story from the world of A voice interaction to try. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1008,
    1792,
    "Prototype study",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "max-voice-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "max-voice-story.png", 1008, 1792]
    ]
  ],
  [
    "woodhouse-dean-sticker",
    "woodhouse",
    "special",
    "Dean off the clock · Sticker",
    "Dean off the clock. Sticker in red and cream punk laptop sticker.",
    "Dean with the glasses, the ginger beard and a record within reach.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "woodhouse-dean-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-dean-sticker.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-cabinet-sticker",
    "bubbles",
    "special",
    "Another credit · Sticker",
    "Another credit. Sticker in monochrome ink stamp.",
    "A browser game in the clothes of a cabinet you could find in a milk bar.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "bubbles-cabinet-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-cabinet-sticker.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-gabe-sticker",
    "foilbury",
    "special",
    "Gabe’s shelf · Sticker",
    "Gabe’s shelf. Sticker in flat pictogram enamel pin.",
    "Gabe gets the spot in the cabinet where the light stays a little longer.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "foilbury-gabe-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-gabe-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-humpty-sticker",
    "fighter",
    "special",
    "Humpty off the wall · Sticker",
    "Humpty off the wall. Sticker in chunky stained-glass emblem.",
    "A small emblem drawn from Humpty off the wall.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-humpty-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-humpty-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-crown-sticker",
    "shoalshot",
    "special",
    "The crown in the current · Sticker",
    "The crown in the current. Sticker in flat pictogram enamel pin.",
    "You can pick out the crown of the jelly before the trailing tentacles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-crown-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-crown-sticker.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-felt-sticker",
    "protocol-11",
    "special",
    "Classic felt · Sticker",
    "Classic felt. Sticker in two-colour embroidered patch.",
    "On Classic Felt, a clear card silhouette does more than another effect.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "protocol-11-felt-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-felt-sticker.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-ldraw-sticker",
    "app-composer",
    "special",
    "The model comes apart · Sticker",
    "The model comes apart. Sticker in sculpted resin badge.",
    "Seeing the parts apart makes it easier to understand the finished build.",
    "https://ldraw.loftwah.com/",
    "Try",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "app-composer-ldraw-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-ldraw-sticker.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-cartridge-sticker",
    "loftwahfm",
    "special",
    "Cartridge Club · Sticker",
    "Cartridge Club. Sticker in chunky stained-glass emblem.",
    "Cartridge Club puts the game-room colours back on the stereo.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "loftwahfm-cartridge-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-cartridge-sticker.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-find-sticker",
    "liferaft",
    "special",
    "The thing you remember · Sticker",
    "The thing you remember. Sticker in flat pictogram enamel pin.",
    "Find the archive message by the one detail you still remember.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "liferaft-find-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-find-sticker.png", 1024, 1024]
    ]
  ],
  [
    "max-voice-sticker",
    "max",
    "special",
    "A voice interaction to try · Sticker",
    "A voice interaction to try. Sticker in monochrome ink stamp.",
    "A small emblem drawn from A voice interaction to try. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1024,
    1024,
    "Prototype study",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "max-voice-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "max-voice-sticker.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-dean-print",
    "woodhouse",
    "art",
    "Dean off the clock · Print",
    "Dean off the clock. Print in grainy contemporary sports card.",
    "Dean with the glasses, the ginger beard and a record within reach.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "woodhouse-dean-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "woodhouse-dean-print.png", 1536, 864]
    ]
  ],
  [
    "bubbles-cabinet-print",
    "bubbles",
    "art",
    "Another credit · Print",
    "Another credit. Print in 1970s technical field guide.",
    "A browser game in the clothes of a cabinet you could find in a milk bar.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "bubbles-cabinet-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "bubbles-cabinet-print.png", 1024, 1536]
    ]
  ],
  [
    "foilbury-gabe-print",
    "foilbury",
    "art",
    "Gabe’s shelf · Print",
    "Gabe’s shelf. Print in gilded bookplate.",
    "Gabe gets the spot in the cabinet where the light stays a little longer.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "foilbury-gabe-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-gabe-print.png", 1024, 1280]
    ]
  ],
  [
    "fighter-moses-print",
    "fighter",
    "art",
    "Moses takes the next turn · Print",
    "Moses takes the next turn. Print in vellum drawing in coloured pencil.",
    "A printable collectible inspired by Moses takes the next turn.",
    "https://fighter.loftwah.com/",
    "Play",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "fighter-moses-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "fighter-moses-print.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-crown-print",
    "shoalshot",
    "art",
    "The crown in the current · Print",
    "The crown in the current. Print in gilded bookplate.",
    "You can pick out the crown of the jelly before the trailing tentacles resolve.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "shoalshot-crown-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-crown-print.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-felt-print",
    "protocol-11",
    "art",
    "Classic felt · Print",
    "Classic felt. Print in premium acetate sleeve insert.",
    "On Classic Felt, a clear card silhouette does more than another effect.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "protocol-11-felt-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol-11-felt-print.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-ldraw-print",
    "app-composer",
    "art",
    "The model comes apart · Print",
    "The model comes apart. Print in archival stamp and dry ink.",
    "Seeing the parts apart makes it easier to understand the finished build.",
    "https://ldraw.loftwah.com/",
    "Try",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "app-composer-ldraw-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "app-composer-ldraw-print.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-cartridge-print",
    "loftwahfm",
    "art",
    "Cartridge Club · Print",
    "Cartridge Club. Print in embossed copper paper.",
    "Cartridge Club puts the game-room colours back on the stereo.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "loftwahfm-cartridge-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-cartridge-print.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-find-print",
    "liferaft",
    "art",
    "The thing you remember · Print",
    "The thing you remember. Print in gilded bookplate.",
    "Find the archive message by the one detail you still remember.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "liferaft-find-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "liferaft-find-print.png", 1024, 1024]
    ]
  ],
  [
    "max-voice-print",
    "max",
    "art",
    "A voice interaction to try · Print",
    "A voice interaction to try. Print in 1970s technical field guide.",
    "A printable collectible inspired by A voice interaction to try. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1024,
    1536,
    "Prototype study",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "max-voice-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "max-voice-print.png", 1024, 1536]
    ]
  ],
  [
    "woodhouse-fibre-study-poster",
    "woodhouse",
    "feature",
    "A line under tension · Poster",
    "A line under tension. Poster in hand-pulled fluorescent gig screenprint.",
    "A strand crosses the next. A few hundred of those make the homepage loom.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "woodhouse-fibre-study-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "woodhouse-fibre-study-poster.png", 1536, 864]
    ]
  ],
  [
    "bubbles-ceiling-poster",
    "bubbles",
    "feature",
    "The ceiling comes down · Poster",
    "The ceiling comes down. Poster in enamel-sign colour separations.",
    "As the board closes in, the shot you kept putting off becomes the only one left.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "bubbles-ceiling-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-ceiling-poster.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-keeper-poster",
    "foilbury",
    "feature",
    "The keeper on shift · Poster",
    "The keeper on shift. Poster in Japanese station poster gouache.",
    "The keeper looks after the collection. The collector chooses what goes on the shelf.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "foilbury-keeper-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "foilbury-keeper-poster.png", 1536, 864]
    ]
  ],
  [
    "fighter-ringside-poster",
    "fighter",
    "feature",
    "Pippa has the better corner · Poster",
    "Pippa has the better corner. Poster in mid-century travel lithograph.",
    "Pippa has the better corner. Dean can have the other one.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "fighter-ringside-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-ringside-poster.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-leviathan-poster",
    "shoalshot",
    "feature",
    "The reef has a ceiling · Poster",
    "The reef has a ceiling. Poster in enamel-sign colour separations.",
    "A little school of fish tells you how big the thing behind it is.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-leviathan-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-leviathan-poster.png", 1024, 1280]
    ]
  ],
  [
    "protocol-11-handoff-poster",
    "protocol-11",
    "feature",
    "Pass the phone · Poster",
    "Pass the phone. Poster in 90s arcade marquee hand lettering.",
    "Keep the hand covered until the phone has changed hands.",
    "https://protocol11.loftwah.com/",
    "Play",
    1216,
    640,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "protocol-11-handoff-poster-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "protocol-11-handoff-poster.png", 1216, 640]
    ]
  ],
  [
    "app-composer-ownership-poster",
    "app-composer",
    "banner",
    "The app is yours · Poster",
    "The app is yours. Poster in surreal lacquer still-life.",
    "Source, data and app belong to the person making the app.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "app-composer-ownership-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "app-composer-ownership-poster.png", 1536, 512]
    ]
  ],
  [
    "loftwahfm-night-poster",
    "loftwahfm",
    "banner",
    "Night Signal · Poster",
    "Night Signal. Poster in European sci-fi magazine cover.",
    "Night Signal is for the part of the evening when one more track sounds reasonable.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "loftwahfm-night-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "loftwahfm-night-poster.png", 1536, 512]
    ]
  ],
  [
    "liferaft-recover-poster",
    "liferaft",
    "feature",
    "Recover the attachment · Poster",
    "Recover the attachment. Poster in Japanese station poster gouache.",
    "Open the source message before you choose which attachment to recover.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "liferaft-recover-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "liferaft-recover-poster.png", 1536, 864]
    ]
  ],
  [
    "max-walker-poster",
    "max",
    "feature",
    "The walker you already have · Poster",
    "The walker you already have. Poster in lo-fi xerox concert bill.",
    "An illustrated poster for The walker you already have. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1216,
    640,
    "Prototype study",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "max-walker-poster-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "max-walker-poster.png", 1216, 640]
    ]
  ],
  [
    "woodhouse-fibre-study-diagram",
    "woodhouse",
    "feature",
    "A line under tension · Diagram",
    "A line under tension. Diagram in cutaway gouache on navy.",
    "A strand crosses the next. A few hundred of those make the homepage loom.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "woodhouse-fibre-study-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-fibre-study-diagram.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-ceiling-diagram",
    "bubbles",
    "feature",
    "The ceiling comes down · Diagram",
    "The ceiling comes down. Diagram in tabletop rulebook foldout.",
    "As the board closes in, the shot you kept putting off becomes the only one left.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "bubbles-ceiling-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-ceiling-diagram.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-keeper-diagram",
    "foilbury",
    "feature",
    "The keeper on shift · Diagram",
    "The keeper on shift. Diagram in limited-colour chalk diagram.",
    "The keeper looks after the collection. The collector chooses what goes on the shelf.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "foilbury-keeper-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-keeper-diagram.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-dust-shrimp-diagram",
    "shoalshot",
    "feature",
    "Dust Shrimp field plate · Diagram",
    "Dust Shrimp field plate. Diagram in 1990s instruction manual risograph.",
    "An illustrated workbench study of Dust Shrimp field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "shoalshot-dust-shrimp-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-dust-shrimp-diagram.png", 1536, 864]
    ]
  ],
  [
    "protocol-11-handoff-diagram",
    "protocol-11",
    "feature",
    "Pass the phone · Diagram",
    "Pass the phone. Diagram in 1990s instruction manual risograph.",
    "Keep the hand covered until the phone has changed hands.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "protocol-11-handoff-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-handoff-diagram.png", 1024, 1280]
    ]
  ],
  [
    "app-composer-ownership-diagram",
    "app-composer",
    "feature",
    "The app is yours · Diagram",
    "The app is yours. Diagram in isometric construction on recycled stock.",
    "Source, data and app belong to the person making the app.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "app-composer-ownership-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "app-composer-ownership-diagram.png", 1216, 640]
    ]
  ],
  [
    "loftwahfm-game-music-diagram",
    "loftwahfm",
    "feature",
    "Bring your own soundtrack · Diagram",
    "Bring your own soundtrack. Diagram in 1990s instruction manual risograph.",
    "The game effects and the music get separate controls.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "loftwahfm-game-music-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "loftwahfm-game-music-diagram.png", 1216, 640]
    ]
  ],
  [
    "max-walker-diagram",
    "max",
    "feature",
    "The walker you already have · Diagram",
    "The walker you already have. Diagram in exploded industrial design pencil.",
    "An illustrated workbench study of The walker you already have. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1024,
    1280,
    "Prototype study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "max-walker-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "max-walker-diagram.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-fibre-study-story",
    "woodhouse",
    "art",
    "A line under tension · Story",
    "A line under tension. Story in analogue disposable-camera snapshot aesthetic.",
    "A strand crosses the next. A few hundred of those make the homepage loom.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "woodhouse-fibre-study-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-fibre-study-story.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-ceiling-story",
    "bubbles",
    "art",
    "The ceiling comes down · Story",
    "The ceiling comes down. Story in late-night cinematic miniatures.",
    "As the board closes in, the shot you kept putting off becomes the only one left.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "bubbles-ceiling-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-ceiling-story.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-keeper-story",
    "foilbury",
    "art",
    "The keeper on shift · Story",
    "The keeper on shift. Story in inked Franco-Belgian comic.",
    "The keeper looks after the collection. The collector chooses what goes on the shelf.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "foilbury-keeper-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-keeper-story.png", 1024, 1024]
    ]
  ],
  [
    "fighter-moses-story",
    "fighter",
    "art",
    "Moses takes the next turn · Story",
    "Moses takes the next turn. Story in silent comic in coral and cobalt.",
    "A visual story from the world of Moses takes the next turn.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "fighter-moses-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-moses-story.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-leviathan-story",
    "shoalshot",
    "art",
    "The reef has a ceiling · Story",
    "The reef has a ceiling. Story in late-night cinematic miniatures.",
    "A little school of fish tells you how big the thing behind it is.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-leviathan-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-leviathan-story.png", 1024, 1280]
    ]
  ],
  [
    "protocol-11-handoff-story",
    "protocol-11",
    "art",
    "Pass the phone · Story",
    "Pass the phone. Story in pixel-art scene in arcade palette.",
    "Keep the hand covered until the phone has changed hands.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "protocol-11-handoff-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol-11-handoff-story.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-ownership-story",
    "app-composer",
    "art",
    "The app is yours · Story",
    "The app is yours. Story in original suburban animated sitcom cels.",
    "Source, data and app belong to the person making the app.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "app-composer-ownership-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "app-composer-ownership-story.png", 1008, 1792]
    ]
  ],
  [
    "loftwahfm-game-music-story",
    "loftwahfm",
    "art",
    "Bring your own soundtrack · Story",
    "Bring your own soundtrack. Story in pixel-art scene in arcade palette.",
    "The game effects and the music get separate controls.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "loftwahfm-game-music-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-game-music-story.png", 1008, 1792]
    ]
  ],
  [
    "liferaft-recover-sticker",
    "liferaft",
    "special",
    "Recover the attachment · Sticker",
    "Recover the attachment. Sticker in soft rubber arcade charm.",
    "Open the source message before you choose which attachment to recover.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "liferaft-recover-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "liferaft-recover-sticker.png", 1024, 1024]
    ]
  ],
  [
    "max-walker-sticker",
    "max",
    "special",
    "The walker you already have · Sticker",
    "The walker you already have. Sticker in hard-edge pulp icon.",
    "A small emblem drawn from The walker you already have. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1024,
    1024,
    "Prototype study",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "max-walker-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "max-walker-sticker.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-fibre-study-sticker",
    "woodhouse",
    "special",
    "A line under tension · Sticker",
    "A line under tension. Sticker in chunky stained-glass emblem.",
    "A strand crosses the next. A few hundred of those make the homepage loom.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "woodhouse-fibre-study-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-fibre-study-sticker.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-ceiling-sticker",
    "bubbles",
    "special",
    "The ceiling comes down · Sticker",
    "The ceiling comes down. Sticker in sculpted resin badge.",
    "As the board closes in, the shot you kept putting off becomes the only one left.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "bubbles-ceiling-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-ceiling-sticker.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-keeper-sticker",
    "foilbury",
    "special",
    "The keeper on shift · Sticker",
    "The keeper on shift. Sticker in soft rubber arcade charm.",
    "The keeper looks after the collection. The collector chooses what goes on the shelf.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "foilbury-keeper-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-keeper-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-moses-sticker",
    "fighter",
    "special",
    "Moses takes the next turn · Sticker",
    "Moses takes the next turn. Sticker in rubber-hose vinyl decal.",
    "A small emblem drawn from Moses takes the next turn.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-moses-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-moses-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-dust-shrimp-sticker",
    "shoalshot",
    "special",
    "Dust Shrimp field plate · Sticker",
    "Dust Shrimp field plate. Sticker in red and cream punk laptop sticker.",
    "A small emblem drawn from Dust Shrimp field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-dust-shrimp-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-dust-shrimp-sticker.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-kitchen-sticker",
    "protocol-11",
    "special",
    "Kitchen table · Sticker",
    "Kitchen table. Sticker in chunky stained-glass emblem.",
    "A card game can feel like the table where someone’s made you a cup of tea.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "protocol-11-kitchen-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-kitchen-sticker.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-ownership-sticker",
    "app-composer",
    "special",
    "The app is yours · Sticker",
    "The app is yours. Sticker in flat pictogram enamel pin.",
    "Source, data and app belong to the person making the app.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "app-composer-ownership-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-ownership-sticker.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-game-music-sticker",
    "loftwahfm",
    "special",
    "Bring your own soundtrack · Sticker",
    "Bring your own soundtrack. Sticker in red and cream punk laptop sticker.",
    "The game effects and the music get separate controls.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "loftwahfm-game-music-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-game-music-sticker.png", 1024, 1024]
    ]
  ],
  [
    "liferaft-recover-print",
    "liferaft",
    "art",
    "Recover the attachment · Print",
    "Recover the attachment. Print in woven collector patch art.",
    "Open the source message before you choose which attachment to recover.",
    "https://liferaft.loftwah.com/",
    "Explore",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "liferaft-recover-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "liferaft-recover-print.png", 1024, 1536]
    ]
  ],
  [
    "max-walker-print",
    "max",
    "art",
    "The walker you already have · Print",
    "The walker you already have. Print in holographic trading-card finish.",
    "A printable collectible inspired by The walker you already have. Virtual MAX is a browser simulator. The hardware remains a prototype.",
    "https://max.loftwah.com/demo",
    "Try",
    1024,
    1024,
    "Prototype study",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "max-walker-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "max-walker-print.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-fibre-study-print",
    "woodhouse",
    "art",
    "A line under tension · Print",
    "A line under tension. Print in embossed copper paper.",
    "A strand crosses the next. A few hundred of those make the homepage loom.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "woodhouse-fibre-study-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-fibre-study-print.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-ceiling-print",
    "bubbles",
    "art",
    "The ceiling comes down · Print",
    "The ceiling comes down. Print in archival stamp and dry ink.",
    "As the board closes in, the shot you kept putting off becomes the only one left.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "bubbles-ceiling-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-ceiling-print.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-keeper-print",
    "foilbury",
    "art",
    "The keeper on shift · Print",
    "The keeper on shift. Print in woven collector patch art.",
    "The keeper looks after the collection. The collector chooses what goes on the shelf.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "foilbury-keeper-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "foilbury-keeper-print.png", 1536, 864]
    ]
  ],
  [
    "fighter-ned-kelly-print",
    "fighter",
    "art",
    "Ned Kelly under the lights · Print",
    "Ned Kelly under the lights. Print in premium acetate sleeve insert.",
    "A printable collectible inspired by Ned Kelly under the lights.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "fighter-ned-kelly-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-ned-kelly-print.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-leviathan-print",
    "shoalshot",
    "art",
    "The reef has a ceiling · Print",
    "The reef has a ceiling. Print in archival stamp and dry ink.",
    "A little school of fish tells you how big the thing behind it is.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-leviathan-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-leviathan-print.png", 1024, 1280]
    ]
  ],
  [
    "protocol-11-handoff-print",
    "protocol-11",
    "art",
    "Pass the phone · Print",
    "Pass the phone. Print in grainy contemporary sports card.",
    "Keep the hand covered until the phone has changed hands.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "protocol-11-handoff-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "protocol-11-handoff-print.png", 1024, 1536]
    ]
  ],
  [
    "app-composer-ownership-print",
    "app-composer",
    "art",
    "The app is yours · Print",
    "The app is yours. Print in gilded bookplate.",
    "Source, data and app belong to the person making the app.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "app-composer-ownership-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-ownership-print.png", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-game-music-print",
    "loftwahfm",
    "art",
    "Bring your own soundtrack · Print",
    "Bring your own soundtrack. Print in grainy contemporary sports card.",
    "The game effects and the music get separate controls.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "loftwahfm-game-music-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "loftwahfm-game-music-print.png", 1536, 864]
    ]
  ],
  [
    "woodhouse-pippa-and-dean-poster",
    "woodhouse",
    "banner",
    "One human. One dog. · Poster",
    "One human. One dog.. Poster in surreal lacquer still-life.",
    "Dean and Pippa. One of them did the work. The other ran the room.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "woodhouse-pippa-and-dean-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "woodhouse-pippa-and-dean-poster.png", 1536, 512]
    ]
  ],
  [
    "bubbles-cluster-poster",
    "bubbles",
    "feature",
    "What falls with it · Poster",
    "What falls with it. Poster in lo-fi xerox concert bill.",
    "Break the connection and the whole loose cluster comes down.",
    "https://bubbles.loftwah.com/",
    "Play",
    1216,
    640,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "bubbles-cluster-poster-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "bubbles-cluster-poster.png", 1216, 640]
    ]
  ],
  [
    "foilbury-moss-poster",
    "foilbury",
    "feature",
    "Moss and the leaf pull · Poster",
    "Moss and the leaf pull. Poster in mid-century travel lithograph.",
    "The hat and floppy ears tell you it’s Moss before the card title comes into focus.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "foilbury-moss-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-moss-poster.png", 1024, 1280]
    ]
  ],
  [
    "fighter-switch-poster",
    "fighter",
    "art",
    "The bench is a decision · Poster",
    "The bench is a decision. Poster in paper theatre deep stage shadows.",
    "The next fighter is a decision you make before the current one runs out of room.",
    "https://fighter.loftwah.com/",
    "Play",
    1008,
    1792,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "fighter-switch-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-switch-poster.png", 1008, 1792]
    ]
  ],
  [
    "shoalshot-reef-poster",
    "shoalshot",
    "feature",
    "The three depths · Poster",
    "The three depths. Poster in lo-fi xerox concert bill.",
    "Dark rock, midwater fish and a distant drop-off give the home reef its depth.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1216,
    640,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "shoalshot-reef-poster-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-reef-poster.png", 1216, 640]
    ]
  ],
  [
    "protocol-11-stock-poster",
    "protocol-11",
    "banner",
    "Two piles give away different things · Poster",
    "Two piles give away different things. Poster in European sci-fi magazine cover.",
    "The stock hides its next card. The top of the discard is there for everyone to see.",
    "https://protocol11.loftwah.com/",
    "Play",
    1536,
    512,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["X header", "protocol-11-stock-poster-placement.jpg", 1500, 500],
      ["ImageGen original PNG", "protocol-11-stock-poster.png", 1536, 512]
    ]
  ],
  [
    "app-composer-studio-poster",
    "app-composer",
    "feature",
    "One cover, four decisions · Poster",
    "One cover, four decisions. Poster in lo-fi xerox concert bill.",
    "Follow one record cover through reference, variation, motion and release. The Media Studio sequence is a concept.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1216,
    640,
    "Concept study",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "app-composer-studio-poster-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "app-composer-studio-poster.png", 1216, 640]
    ]
  ],
  [
    "loftwahfm-tuning-poster",
    "loftwahfm",
    "art",
    "The station has its own signal · Poster",
    "The station has its own signal. Poster in riso cobalt and rust paper.",
    "The living station draws its response from the music it’s playing.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1008,
    1792,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "loftwahfm-tuning-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "loftwahfm-tuning-poster.png", 1008, 1792]
    ]
  ],
  [
    "woodhouse-pippa-and-dean-diagram",
    "woodhouse",
    "feature",
    "One human. One dog. · Diagram",
    "One human. One dog.. Diagram in isometric construction on recycled stock.",
    "Dean and Pippa. One of them did the work. The other ran the room.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "woodhouse-pippa-and-dean-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "woodhouse-pippa-and-dean-diagram.png", 1216, 640]
    ]
  ],
  [
    "bubbles-cluster-diagram",
    "bubbles",
    "feature",
    "What falls with it · Diagram",
    "What falls with it. Diagram in exploded industrial design pencil.",
    "Break the connection and the whole loose cluster comes down.",
    "https://bubbles.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "bubbles-cluster-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "bubbles-cluster-diagram.png", 1536, 864]
    ]
  ],
  [
    "foilbury-moss-diagram",
    "foilbury",
    "feature",
    "Moss and the leaf pull · Diagram",
    "Moss and the leaf pull. Diagram in printed service manual with yellow highlights.",
    "The hat and floppy ears tell you it’s Moss before the card title comes into focus.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "foilbury-moss-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "foilbury-moss-diagram.png", 1536, 864]
    ]
  ],
  [
    "fighter-switch-diagram",
    "fighter",
    "feature",
    "The bench is a decision · Diagram",
    "The bench is a decision. Diagram in cream drafting-paper graphite plan.",
    "The next fighter is a decision you make before the current one runs out of room.",
    "https://fighter.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "fighter-switch-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "fighter-switch-diagram.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-ember-eel-diagram",
    "shoalshot",
    "feature",
    "Ember Eel field plate · Diagram",
    "Ember Eel field plate. Diagram in isometric construction on recycled stock.",
    "An illustrated workbench study of Ember Eel field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-ember-eel-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-ember-eel-diagram.png", 1024, 1280]
    ]
  ],
  [
    "protocol-11-kitchen-diagram",
    "protocol-11",
    "feature",
    "Kitchen table · Diagram",
    "Kitchen table. Diagram in cutaway gouache on navy.",
    "A card game can feel like the table where someone’s made you a cup of tea.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "protocol-11-kitchen-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-kitchen-diagram.png", 1024, 1280]
    ]
  ],
  [
    "app-composer-paperwork-diagram",
    "app-composer",
    "feature",
    "One form, out the door · Diagram",
    "One form, out the door. Diagram in cream drafting-paper graphite plan.",
    "Open a form, fill what you need, then take the finished PDF.",
    "https://paperwork.loftwah.com/",
    "Try",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "app-composer-paperwork-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "app-composer-paperwork-diagram.png", 1216, 640]
    ]
  ],
  [
    "loftwahfm-night-diagram",
    "loftwahfm",
    "feature",
    "Night Signal · Diagram",
    "Night Signal. Diagram in specimen field plate in fine ink.",
    "Night Signal is for the part of the evening when one more track sounds reasonable.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "loftwahfm-night-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-night-diagram.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-pippa-and-dean-story",
    "woodhouse",
    "art",
    "One human. One dog. · Story",
    "One human. One dog.. Story in original suburban animated sitcom cels.",
    "Dean and Pippa. One of them did the work. The other ran the room.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "woodhouse-pippa-and-dean-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "woodhouse-pippa-and-dean-story.png", 1008, 1792]
    ]
  ],
  [
    "bubbles-cluster-story",
    "bubbles",
    "art",
    "What falls with it · Story",
    "What falls with it. Story in Australian street photography zine.",
    "Break the connection and the whole loose cluster comes down.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "bubbles-cluster-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "bubbles-cluster-story.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-moss-story",
    "foilbury",
    "art",
    "Moss and the leaf pull · Story",
    "Moss and the leaf pull. Story in silent comic in coral and cobalt.",
    "The hat and floppy ears tell you it’s Moss before the card title comes into focus.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "foilbury-moss-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-moss-story.png", 1024, 1280]
    ]
  ],
  [
    "fighter-ned-kelly-story",
    "fighter",
    "art",
    "Ned Kelly under the lights · Story",
    "Ned Kelly under the lights. Story in claymation set with deep focus.",
    "A visual story from the world of Ned Kelly under the lights.",
    "https://fighter.loftwah.com/",
    "Play",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "fighter-ned-kelly-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-ned-kelly-story.png", 1008, 1792]
    ]
  ],
  [
    "shoalshot-ray-story",
    "shoalshot",
    "art",
    "Lantern Ray field plate · Story",
    "Lantern Ray field plate. Story in pixel-art scene in arcade palette.",
    "The ray reads as a broad wing before you see the speckles.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-ray-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-ray-story.png", 1024, 1280]
    ]
  ],
  [
    "protocol-11-kitchen-story",
    "protocol-11",
    "art",
    "Kitchen table · Story",
    "Kitchen table. Story in analogue disposable-camera snapshot aesthetic.",
    "A card game can feel like the table where someone’s made you a cup of tea.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "protocol-11-kitchen-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "protocol-11-kitchen-story.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-paperwork-story",
    "app-composer",
    "art",
    "One form, out the door · Story",
    "One form, out the door. Story in manga in two spot inks.",
    "Open a form, fill what you need, then take the finished PDF.",
    "https://paperwork.loftwah.com/",
    "Try",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "app-composer-paperwork-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "app-composer-paperwork-story.png", 1008, 1792]
    ]
  ],
  [
    "loftwahfm-night-story",
    "loftwahfm",
    "art",
    "Night Signal · Story",
    "Night Signal. Story in woodcut folk tale.",
    "Night Signal is for the part of the evening when one more track sounds reasonable.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "loftwahfm-night-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-night-story.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-pippa-and-dean-sticker",
    "woodhouse",
    "special",
    "One human. One dog. · Sticker",
    "One human. One dog.. Sticker in flat pictogram enamel pin.",
    "Dean and Pippa. One of them did the work. The other ran the room.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "woodhouse-pippa-and-dean-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-pippa-and-dean-sticker.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-cluster-sticker",
    "bubbles",
    "special",
    "What falls with it · Sticker",
    "What falls with it. Sticker in hard-edge pulp icon.",
    "Break the connection and the whole loose cluster comes down.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "bubbles-cluster-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-cluster-sticker.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-moss-sticker",
    "foilbury",
    "special",
    "Moss and the leaf pull · Sticker",
    "Moss and the leaf pull. Sticker in rubber-hose vinyl decal.",
    "The hat and floppy ears tell you it’s Moss before the card title comes into focus.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "foilbury-moss-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-moss-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-ned-kelly-sticker",
    "fighter",
    "special",
    "Ned Kelly under the lights · Sticker",
    "Ned Kelly under the lights. Sticker in two-colour embroidered patch.",
    "A small emblem drawn from Ned Kelly under the lights.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-ned-kelly-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-ned-kelly-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-ember-eel-sticker",
    "shoalshot",
    "special",
    "Ember Eel field plate · Sticker",
    "Ember Eel field plate. Sticker in flat pictogram enamel pin.",
    "A small emblem drawn from Ember Eel field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-ember-eel-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-ember-eel-sticker.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-stock-sticker",
    "protocol-11",
    "special",
    "Two piles give away different things · Sticker",
    "Two piles give away different things. Sticker in monochrome ink stamp.",
    "The stock hides its next card. The top of the discard is there for everyone to see.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "protocol-11-stock-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "protocol-11-stock-sticker.png", 1024, 1024]
    ]
  ],
  [
    "app-composer-paperwork-sticker",
    "app-composer",
    "special",
    "One form, out the door · Sticker",
    "One form, out the door. Sticker in glazed ceramic pin.",
    "Open a form, fill what you need, then take the finished PDF.",
    "https://paperwork.loftwah.com/",
    "Try",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "app-composer-paperwork-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-paperwork-sticker.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-night-sticker",
    "loftwahfm",
    "special",
    "Night Signal · Sticker",
    "Night Signal. Sticker in monochrome ink stamp.",
    "Night Signal is for the part of the evening when one more track sounds reasonable.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "loftwahfm-night-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-night-sticker.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-pippa-and-dean-print",
    "woodhouse",
    "art",
    "One human. One dog. · Print",
    "One human. One dog.. Print in gilded bookplate.",
    "Dean and Pippa. One of them did the work. The other ran the room.",
    "https://woodhouse.loftwah.com/",
    "Explore",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "woodhouse-pippa-and-dean-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "woodhouse-pippa-and-dean-print.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-cluster-print",
    "bubbles",
    "art",
    "What falls with it · Print",
    "What falls with it. Print in holographic trading-card finish.",
    "Break the connection and the whole loose cluster comes down.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "bubbles-cluster-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "bubbles-cluster-print.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-moss-print",
    "foilbury",
    "art",
    "Moss and the leaf pull · Print",
    "Moss and the leaf pull. Print in vellum drawing in coloured pencil.",
    "The hat and floppy ears tell you it’s Moss before the card title comes into focus.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "foilbury-moss-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "foilbury-moss-print.png", 1536, 864]
    ]
  ],
  [
    "fighter-reaper-print",
    "fighter",
    "art",
    "The Reaper enters · Print",
    "The Reaper enters. Print in 1970s technical field guide.",
    "A printable collectible inspired by The Reaper enters.",
    "https://fighter.loftwah.com/",
    "Play",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "fighter-reaper-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "fighter-reaper-print.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-ray-print",
    "shoalshot",
    "art",
    "Lantern Ray field plate · Print",
    "Lantern Ray field plate. Print in grainy contemporary sports card.",
    "The ray reads as a broad wing before you see the speckles.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "shoalshot-ray-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "shoalshot-ray-print.png", 1536, 864]
    ]
  ],
  [
    "protocol-11-kitchen-print",
    "protocol-11",
    "art",
    "Kitchen table · Print",
    "Kitchen table. Print in embossed copper paper.",
    "A card game can feel like the table where someone’s made you a cup of tea.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "protocol-11-kitchen-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-kitchen-print.png", 1024, 1280]
    ]
  ],
  [
    "app-composer-paperwork-print",
    "app-composer",
    "art",
    "One form, out the door · Print",
    "One form, out the door. Print in matte night-shift safety orange.",
    "Open a form, fill what you need, then take the finished PDF.",
    "https://paperwork.loftwah.com/",
    "Try",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "app-composer-paperwork-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "app-composer-paperwork-print.png", 1024, 1536]
    ]
  ],
  [
    "loftwahfm-night-print",
    "loftwahfm",
    "art",
    "Night Signal · Print",
    "Night Signal. Print in 1970s technical field guide.",
    "Night Signal is for the part of the evening when one more track sounds reasonable.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "loftwahfm-night-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "loftwahfm-night-print.png", 1536, 864]
    ]
  ],
  [
    "woodhouse-sound-bench-poster",
    "woodhouse",
    "feature",
    "Three things make a sound · Poster",
    "Three things make a sound. Poster in mid-century travel lithograph.",
    "Patch Bench lets the game sound and the radio keep their own jobs.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    1024,
    1280,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "woodhouse-sound-bench-poster-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "woodhouse-sound-bench-poster.png", 1024, 1280]
    ]
  ],
  [
    "bubbles-fizz-poster",
    "bubbles",
    "art",
    "Fizz between rounds · Poster",
    "Fizz between rounds. Poster in paper theatre deep stage shadows.",
    "Fizz takes the cabinet shift between rounds.",
    "https://bubbles.loftwah.com/",
    "Play",
    1008,
    1792,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "bubbles-fizz-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-fizz-poster.png", 1008, 1792]
    ]
  ],
  [
    "foilbury-nora-poster",
    "foilbury",
    "feature",
    "Nora keeps the catalogue · Poster",
    "Nora keeps the catalogue. Poster in 90s arcade marquee hand lettering.",
    "Nora’s scarf and wire glasses do most of the work at card size.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1216,
    640,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "foilbury-nora-poster-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "foilbury-nora-poster.png", 1216, 640]
    ]
  ],
  [
    "fighter-tux-poster",
    "fighter",
    "feature",
    "Tux in the corner · Poster",
    "Tux in the corner. Poster in hand-pulled fluorescent gig screenprint.",
    "An illustrated poster for Tux in the corner.",
    "https://fighter.loftwah.com/",
    "Play",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "fighter-tux-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "fighter-tux-poster.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-tideglass-poster",
    "shoalshot",
    "art",
    "Read the tide · Poster",
    "Read the tide. Poster in paper theatre deep stage shadows.",
    "The Tideglass has its own shape and material language inside the dive.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1008,
    1792,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "shoalshot-tideglass-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-tideglass-poster.png", 1008, 1792]
    ]
  ],
  [
    "protocol-11-stock-diagram",
    "protocol-11",
    "feature",
    "Two piles give away different things · Diagram",
    "Two piles give away different things. Diagram in specimen field plate in fine ink.",
    "The stock hides its next card. The top of the discard is there for everyone to see.",
    "https://protocol11.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "protocol-11-stock-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "protocol-11-stock-diagram.png", 1536, 864]
    ]
  ],
  [
    "app-composer-studio-diagram",
    "app-composer",
    "feature",
    "One cover, four decisions · Diagram",
    "One cover, four decisions. Diagram in exploded industrial design pencil.",
    "Follow one record cover through reference, variation, motion and release. The Media Studio sequence is a concept.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1536,
    864,
    "Concept study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "app-composer-studio-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "app-composer-studio-diagram.png", 1536, 864]
    ]
  ],
  [
    "loftwahfm-tuning-diagram",
    "loftwahfm",
    "feature",
    "The station has its own signal · Diagram",
    "The station has its own signal. Diagram in blueprint white ink on petrol.",
    "The living station draws its response from the music it’s playing.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "loftwahfm-tuning-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-tuning-diagram.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-sound-bench-diagram",
    "woodhouse",
    "feature",
    "Three things make a sound · Diagram",
    "Three things make a sound. Diagram in printed service manual with yellow highlights.",
    "Patch Bench lets the game sound and the radio keep their own jobs.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "woodhouse-sound-bench-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "woodhouse-sound-bench-diagram.png", 1216, 640]
    ]
  ],
  [
    "bubbles-fizz-diagram",
    "bubbles",
    "feature",
    "Fizz between rounds · Diagram",
    "Fizz between rounds. Diagram in cream drafting-paper graphite plan.",
    "Fizz takes the cabinet shift between rounds.",
    "https://bubbles.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "bubbles-fizz-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "bubbles-fizz-diagram.png", 1216, 640]
    ]
  ],
  [
    "foilbury-nora-diagram",
    "foilbury",
    "feature",
    "Nora keeps the catalogue · Diagram",
    "Nora keeps the catalogue. Diagram in 1990s instruction manual risograph.",
    "Nora’s scarf and wire glasses do most of the work at card size.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "foilbury-nora-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "foilbury-nora-diagram.png", 1216, 640]
    ]
  ],
  [
    "fighter-tux-diagram",
    "fighter",
    "feature",
    "Tux in the corner · Diagram",
    "Tux in the corner. Diagram in cutaway gouache on navy.",
    "An illustrated workbench study of Tux in the corner.",
    "https://fighter.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "fighter-tux-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "fighter-tux-diagram.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-glassreef-boxfish-diagram",
    "shoalshot",
    "feature",
    "Glassreef Boxfish field plate · Diagram",
    "Glassreef Boxfish field plate. Diagram in limited-colour chalk diagram.",
    "An illustrated workbench study of Glassreef Boxfish field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "shoalshot-glassreef-boxfish-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-glassreef-boxfish-diagram.png", 1216, 640]
    ]
  ],
  [
    "protocol-11-stock-story",
    "protocol-11",
    "art",
    "Two piles give away different things · Story",
    "Two piles give away different things. Story in woodcut folk tale.",
    "The stock hides its next card. The top of the discard is there for everyone to see.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "protocol-11-stock-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "protocol-11-stock-story.png", 1024, 1280]
    ]
  ],
  [
    "app-composer-studio-story",
    "app-composer",
    "art",
    "One cover, four decisions · Story",
    "One cover, four decisions. Story in Australian street photography zine.",
    "Follow one record cover through reference, variation, motion and release. The Media Studio sequence is a concept.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1024,
    1280,
    "Concept study",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "app-composer-studio-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-studio-story.png", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-tuning-story",
    "loftwahfm",
    "art",
    "The station has its own signal · Story",
    "The station has its own signal. Story in claymation set with deep focus.",
    "The living station draws its response from the music it’s playing.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "loftwahfm-tuning-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "loftwahfm-tuning-story.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-sound-bench-story",
    "woodhouse",
    "art",
    "Three things make a sound · Story",
    "Three things make a sound. Story in silent comic in coral and cobalt.",
    "Patch Bench lets the game sound and the radio keep their own jobs.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "woodhouse-sound-bench-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "woodhouse-sound-bench-story.png", 1008, 1792]
    ]
  ],
  [
    "bubbles-fizz-story",
    "bubbles",
    "art",
    "Fizz between rounds · Story",
    "Fizz between rounds. Story in manga in two spot inks.",
    "Fizz takes the cabinet shift between rounds.",
    "https://bubbles.loftwah.com/",
    "Play",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "bubbles-fizz-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "bubbles-fizz-story.png", 1008, 1792]
    ]
  ],
  [
    "foilbury-nora-story",
    "foilbury",
    "art",
    "Nora keeps the catalogue · Story",
    "Nora keeps the catalogue. Story in pixel-art scene in arcade palette.",
    "Nora’s scarf and wire glasses do most of the work at card size.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "foilbury-nora-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-nora-story.png", 1008, 1792]
    ]
  ],
  [
    "fighter-reaper-story",
    "fighter",
    "art",
    "The Reaper enters · Story",
    "The Reaper enters. Story in woodcut folk tale.",
    "A visual story from the world of The Reaper enters.",
    "https://fighter.loftwah.com/",
    "Play",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "fighter-reaper-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "fighter-reaper-story.png", 1008, 1792]
    ]
  ],
  [
    "shoalshot-reef-story",
    "shoalshot",
    "art",
    "The three depths · Story",
    "The three depths. Story in Australian street photography zine.",
    "Dark rock, midwater fish and a distant drop-off give the home reef its depth.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "shoalshot-reef-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "shoalshot-reef-story.png", 1008, 1792]
    ]
  ],
  [
    "app-composer-studio-sticker",
    "app-composer",
    "special",
    "One cover, four decisions · Sticker",
    "One cover, four decisions. Sticker in hard-edge pulp icon.",
    "Follow one record cover through reference, variation, motion and release. The Media Studio sequence is a concept.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1024,
    1024,
    "Concept study",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "app-composer-studio-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "app-composer-studio-sticker.png", 1024, 1024]
    ]
  ],
  [
    "loftwahfm-tuning-sticker",
    "loftwahfm",
    "special",
    "The station has its own signal · Sticker",
    "The station has its own signal. Sticker in two-colour embroidered patch.",
    "The living station draws its response from the music it’s playing.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "loftwahfm-tuning-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "loftwahfm-tuning-sticker.png", 1024, 1024]
    ]
  ],
  [
    "woodhouse-sound-bench-sticker",
    "woodhouse",
    "special",
    "Three things make a sound · Sticker",
    "Three things make a sound. Sticker in rubber-hose vinyl decal.",
    "Patch Bench lets the game sound and the radio keep their own jobs.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "woodhouse-sound-bench-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "woodhouse-sound-bench-sticker.png", 1024, 1024]
    ]
  ],
  [
    "bubbles-fizz-sticker",
    "bubbles",
    "special",
    "Fizz between rounds · Sticker",
    "Fizz between rounds. Sticker in glazed ceramic pin.",
    "Fizz takes the cabinet shift between rounds.",
    "https://bubbles.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "bubbles-fizz-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "bubbles-fizz-sticker.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-nora-sticker",
    "foilbury",
    "special",
    "Nora keeps the catalogue · Sticker",
    "Nora keeps the catalogue. Sticker in red and cream punk laptop sticker.",
    "Nora’s scarf and wire glasses do most of the work at card size.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "foilbury-nora-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-nora-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-reaper-sticker",
    "fighter",
    "special",
    "The Reaper enters · Sticker",
    "The Reaper enters. Sticker in monochrome ink stamp.",
    "A small emblem drawn from The Reaper enters.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-reaper-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-reaper-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-glassreef-boxfish-sticker",
    "shoalshot",
    "special",
    "Glassreef Boxfish field plate · Sticker",
    "Glassreef Boxfish field plate. Sticker in soft rubber arcade charm.",
    "A small emblem drawn from Glassreef Boxfish field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-glassreef-boxfish-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-glassreef-boxfish-sticker.png", 1024, 1024]
    ]
  ],
  [
    "protocol-11-stock-print",
    "protocol-11",
    "art",
    "Two piles give away different things · Print",
    "Two piles give away different things. Print in 1970s technical field guide.",
    "The stock hides its next card. The top of the discard is there for everyone to see.",
    "https://protocol11.loftwah.com/",
    "Play",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "protocol-11-stock-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "protocol-11-stock-print.png", 1024, 1536]
    ]
  ],
  [
    "app-composer-studio-print",
    "app-composer",
    "art",
    "One cover, four decisions · Print",
    "One cover, four decisions. Print in holographic trading-card finish.",
    "Follow one record cover through reference, variation, motion and release. The Media Studio sequence is a concept.",
    "https://composer.loftwah.com/creator-hub",
    "Try",
    1024,
    1280,
    "Concept study",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "app-composer-studio-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "app-composer-studio-print.png", 1024, 1280]
    ]
  ],
  [
    "loftwahfm-tuning-print",
    "loftwahfm",
    "art",
    "The station has its own signal · Print",
    "The station has its own signal. Print in premium acetate sleeve insert.",
    "The living station draws its response from the music it’s playing.",
    "https://fm.loftwah.com/radio",
    "Listen",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "loftwahfm-tuning-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "loftwahfm-tuning-print.png", 1024, 1280]
    ]
  ],
  [
    "woodhouse-sound-bench-print",
    "woodhouse",
    "art",
    "Three things make a sound · Print",
    "Three things make a sound. Print in vellum drawing in coloured pencil.",
    "Patch Bench lets the game sound and the radio keep their own jobs.",
    "https://woodhouse.loftwah.com/exhibits/patch-bench/",
    "Explore",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "woodhouse-sound-bench-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "woodhouse-sound-bench-print.png", 1024, 1536]
    ]
  ],
  [
    "bubbles-fizz-print",
    "bubbles",
    "art",
    "Fizz between rounds · Print",
    "Fizz between rounds. Print in matte night-shift safety orange.",
    "Fizz takes the cabinet shift between rounds.",
    "https://bubbles.loftwah.com/",
    "Play",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "bubbles-fizz-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "bubbles-fizz-print.png", 1536, 864]
    ]
  ],
  [
    "foilbury-nora-print",
    "foilbury",
    "art",
    "Nora keeps the catalogue · Print",
    "Nora keeps the catalogue. Print in grainy contemporary sports card.",
    "Nora’s scarf and wire glasses do most of the work at card size.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "foilbury-nora-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "foilbury-nora-print.png", 1024, 1536]
    ]
  ],
  [
    "fighter-ringside-print",
    "fighter",
    "art",
    "Pippa has the better corner · Print",
    "Pippa has the better corner. Print in vellum drawing in coloured pencil.",
    "Pippa has the better corner. Dean can have the other one.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "fighter-ringside-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "fighter-ringside-print.png", 1024, 1536]
    ]
  ],
  [
    "shoalshot-reef-print",
    "shoalshot",
    "art",
    "The three depths · Print",
    "The three depths. Print in holographic trading-card finish.",
    "Dark rock, midwater fish and a distant drop-off give the home reef its depth.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "shoalshot-reef-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-reef-print.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-pippa-poster",
    "foilbury",
    "art",
    "Pippa at the cabinet · Poster",
    "Pippa at the cabinet. Poster in riso cobalt and rust paper.",
    "Pippa’s pale chin is just enough to bring the face out of the black coat.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1008,
    1792,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "foilbury-pippa-poster-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-pippa-poster.png", 1008, 1792]
    ]
  ],
  [
    "fighter-viking-poster",
    "fighter",
    "feature",
    "The Viking holds the line · Poster",
    "The Viking holds the line. Poster in lo-fi xerox concert bill.",
    "An illustrated poster for The Viking holds the line.",
    "https://fighter.loftwah.com/",
    "Play",
    1216,
    640,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "fighter-viking-poster-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "fighter-viking-poster.png", 1216, 640]
    ]
  ],
  [
    "shoalshot-glimmerfin-diagram",
    "shoalshot",
    "feature",
    "Glimmerfin field plate · Diagram",
    "Glimmerfin field plate. Diagram in tabletop rulebook foldout.",
    "An illustrated workbench study of Glimmerfin field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "shoalshot-glimmerfin-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-glimmerfin-diagram.png", 1536, 864]
    ]
  ],
  [
    "foilbury-pippa-diagram",
    "foilbury",
    "feature",
    "Pippa at the cabinet · Diagram",
    "Pippa at the cabinet. Diagram in blueprint white ink on petrol.",
    "Pippa’s pale chin is just enough to bring the face out of the black coat.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "foilbury-pippa-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-pippa-diagram.png", 1024, 1280]
    ]
  ],
  [
    "fighter-viking-diagram",
    "fighter",
    "feature",
    "The Viking holds the line · Diagram",
    "The Viking holds the line. Diagram in exploded industrial design pencil.",
    "An illustrated workbench study of The Viking holds the line.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "fighter-viking-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-viking-diagram.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-tideglass-story",
    "shoalshot",
    "art",
    "Read the tide · Story",
    "Read the tide. Story in manga in two spot inks.",
    "The Tideglass has its own shape and material language inside the dive.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "shoalshot-tideglass-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "shoalshot-tideglass-story.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-pippa-story",
    "foilbury",
    "art",
    "Pippa at the cabinet · Story",
    "Pippa at the cabinet. Story in claymation set with deep focus.",
    "Pippa’s pale chin is just enough to bring the face out of the black coat.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "foilbury-pippa-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-pippa-story.png", 1024, 1024]
    ]
  ],
  [
    "fighter-ringside-story",
    "fighter",
    "art",
    "Pippa has the better corner · Story",
    "Pippa has the better corner. Story in silent comic in coral and cobalt.",
    "Pippa has the better corner. Dean can have the other one.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "fighter-ringside-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-ringside-story.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-glimmerfin-sticker",
    "shoalshot",
    "special",
    "Glimmerfin field plate · Sticker",
    "Glimmerfin field plate. Sticker in sculpted resin badge.",
    "A small emblem drawn from Glimmerfin field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-glimmerfin-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-glimmerfin-sticker.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-pippa-sticker",
    "foilbury",
    "special",
    "Pippa at the cabinet · Sticker",
    "Pippa at the cabinet. Sticker in two-colour embroidered patch.",
    "Pippa’s pale chin is just enough to bring the face out of the black coat.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "foilbury-pippa-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-pippa-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-ringside-sticker",
    "fighter",
    "special",
    "Pippa has the better corner · Sticker",
    "Pippa has the better corner. Sticker in rubber-hose vinyl decal.",
    "Pippa has the better corner. Dean can have the other one.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-ringside-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-ringside-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-tideglass-print",
    "shoalshot",
    "art",
    "Read the tide · Print",
    "Read the tide. Print in matte night-shift safety orange.",
    "The Tideglass has its own shape and material language inside the dive.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Discord banner", "shoalshot-tideglass-print-placement.jpg", 1920, 1080],
      ["ImageGen original PNG", "shoalshot-tideglass-print.png", 1536, 864]
    ]
  ],
  [
    "foilbury-pippa-print",
    "foilbury",
    "art",
    "Pippa at the cabinet · Print",
    "Pippa at the cabinet. Print in premium acetate sleeve insert.",
    "Pippa’s pale chin is just enough to bring the face out of the black coat.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "foilbury-pippa-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "foilbury-pippa-print.png", 1024, 1024]
    ]
  ],
  [
    "fighter-switch-print",
    "fighter",
    "art",
    "The bench is a decision · Print",
    "The bench is a decision. Print in matte night-shift safety orange.",
    "The next fighter is a decision you make before the current one runs out of room.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1536,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["For Pinterest", "fighter-switch-print-placement.jpg", 1000, 1500],
      ["ImageGen original PNG", "fighter-switch-print.png", 1024, 1536]
    ]
  ],
  [
    "shoalshot-leviathan-diagram",
    "shoalshot",
    "feature",
    "The reef has a ceiling · Diagram",
    "The reef has a ceiling. Diagram in tabletop rulebook foldout.",
    "A little school of fish tells you how big the thing behind it is.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "shoalshot-leviathan-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-leviathan-diagram.png", 1536, 864]
    ]
  ],
  [
    "foilbury-rhea-poster",
    "foilbury",
    "feature",
    "Rhea in the record room · Poster",
    "Rhea in the record room. Poster in hand-pulled fluorescent gig screenprint.",
    "Rhea’s teal hair and coral streak keep the portrait readable under warm light.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1536,
    864,
    "Share poster",
    "Posters",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "foilbury-rhea-poster-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "foilbury-rhea-poster.png", 1536, 864]
    ]
  ],
  [
    "fighter-switch-story",
    "fighter",
    "art",
    "The bench is a decision · Story",
    "The bench is a decision. Story in manga in two spot inks.",
    "The next fighter is a decision you make before the current one runs out of room.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "fighter-switch-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-switch-story.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-leviathan-sticker",
    "shoalshot",
    "special",
    "The reef has a ceiling · Sticker",
    "The reef has a ceiling. Sticker in sculpted resin badge.",
    "A little school of fish tells you how big the thing behind it is.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-leviathan-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-leviathan-sticker.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-rhea-diagram",
    "foilbury",
    "feature",
    "Rhea in the record room · Diagram",
    "Rhea in the record room. Diagram in cutaway gouache on navy.",
    "Rhea’s teal hair and coral streak keep the portrait readable under warm light.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "foilbury-rhea-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "foilbury-rhea-diagram.png", 1216, 640]
    ]
  ],
  [
    "fighter-switch-sticker",
    "fighter",
    "special",
    "The bench is a decision · Sticker",
    "The bench is a decision. Sticker in glazed ceramic pin.",
    "The next fighter is a decision you make before the current one runs out of room.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-switch-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-switch-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-mirrorwing-diagram",
    "shoalshot",
    "feature",
    "Mirrorwing field plate · Diagram",
    "Mirrorwing field plate. Diagram in cream drafting-paper graphite plan.",
    "An illustrated workbench study of Mirrorwing field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-mirrorwing-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-mirrorwing-diagram.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-rhea-story",
    "foilbury",
    "art",
    "Rhea in the record room · Story",
    "Rhea in the record room. Story in analogue disposable-camera snapshot aesthetic.",
    "Rhea’s teal hair and coral streak keep the portrait readable under warm light.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1008,
    1792,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Story still", "foilbury-rhea-story-placement.jpg", 1080, 1920],
      ["ImageGen original PNG", "foilbury-rhea-story.png", 1008, 1792]
    ]
  ],
  [
    "fighter-tux-print",
    "fighter",
    "art",
    "Tux in the corner · Print",
    "Tux in the corner. Print in embossed copper paper.",
    "A printable collectible inspired by Tux in the corner.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "fighter-tux-print-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-tux-print.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-mirrorwing-sticker",
    "shoalshot",
    "special",
    "Mirrorwing field plate · Sticker",
    "Mirrorwing field plate. Sticker in glazed ceramic pin.",
    "A small emblem drawn from Mirrorwing field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-mirrorwing-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-mirrorwing-sticker.png", 1024, 1024]
    ]
  ],
  [
    "foilbury-rhea-sticker",
    "foilbury",
    "special",
    "Rhea in the record room · Sticker",
    "Rhea in the record room. Sticker in chunky stained-glass emblem.",
    "Rhea’s teal hair and coral streak keep the portrait readable under warm light.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "foilbury-rhea-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "foilbury-rhea-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-tux-story",
    "fighter",
    "art",
    "Tux in the corner · Story",
    "Tux in the corner. Story in analogue disposable-camera snapshot aesthetic.",
    "A visual story from the world of Tux in the corner.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1280,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "fighter-tux-story-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-tux-story.png", 1024, 1280]
    ]
  ],
  [
    "foilbury-rhea-print",
    "foilbury",
    "art",
    "Rhea in the record room · Print",
    "Rhea in the record room. Print in embossed copper paper.",
    "Rhea’s teal hair and coral streak keep the portrait readable under warm light.",
    "https://foilbury.loftwah.com/cabinet/moss",
    "Explore",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "foilbury-rhea-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "foilbury-rhea-print.png", 1024, 1280]
    ]
  ],
  [
    "fighter-tux-sticker",
    "fighter",
    "special",
    "Tux in the corner · Sticker",
    "Tux in the corner. Sticker in chunky stained-glass emblem.",
    "A small emblem drawn from Tux in the corner.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-tux-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-tux-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-ray-sticker",
    "shoalshot",
    "special",
    "Lantern Ray field plate · Sticker",
    "Lantern Ray field plate. Sticker in red and cream punk laptop sticker.",
    "The ray reads as a broad wing before you see the speckles.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-ray-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-ray-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-viking-print",
    "fighter",
    "art",
    "The Viking holds the line · Print",
    "The Viking holds the line. Print in holographic trading-card finish.",
    "A printable collectible inspired by The Viking holds the line.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1280,
    "Collectible print",
    "Collectible prints",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "fighter-viking-print-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "fighter-viking-print.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-razorfin-diagram",
    "shoalshot",
    "feature",
    "Razorfin field plate · Diagram",
    "Razorfin field plate. Diagram in exploded industrial design pencil.",
    "An illustrated workbench study of Razorfin field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "shoalshot-razorfin-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-razorfin-diagram.png", 1216, 640]
    ]
  ],
  [
    "fighter-viking-story",
    "fighter",
    "art",
    "The Viking holds the line · Story",
    "The Viking holds the line. Story in Australian street photography zine.",
    "A visual story from the world of The Viking holds the line.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Visual story",
    "Visual stories",
    "GPT Image 2.6 via Fal",
    [
      ["Square feed", "fighter-viking-story-placement.jpg", 1080, 1080],
      ["ImageGen original PNG", "fighter-viking-story.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-razorfin-sticker",
    "shoalshot",
    "special",
    "Razorfin field plate · Sticker",
    "Razorfin field plate. Sticker in hard-edge pulp icon.",
    "A small emblem drawn from Razorfin field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-razorfin-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-razorfin-sticker.png", 1024, 1024]
    ]
  ],
  [
    "fighter-viking-sticker",
    "fighter",
    "special",
    "The Viking holds the line · Sticker",
    "The Viking holds the line. Sticker in hard-edge pulp icon.",
    "A small emblem drawn from The Viking holds the line.",
    "https://fighter.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "fighter-viking-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "fighter-viking-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reef-diagram",
    "shoalshot",
    "feature",
    "The three depths · Diagram",
    "The three depths. Diagram in exploded industrial design pencil.",
    "Dark rock, midwater fish and a distant drop-off give the home reef its depth.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "shoalshot-reef-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-reef-diagram.png", 1216, 640]
    ]
  ],
  [
    "shoalshot-reef-sticker",
    "shoalshot",
    "special",
    "The three depths · Sticker",
    "The three depths. Sticker in hard-edge pulp icon.",
    "Dark rock, midwater fish and a distant drop-off give the home reef its depth.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-reef-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-reef-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-reefback-diagram",
    "shoalshot",
    "feature",
    "Reefback field plate · Diagram",
    "Reefback field plate. Diagram in specimen field plate in fine ink.",
    "An illustrated workbench study of Reefback field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "shoalshot-reefback-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-reefback-diagram.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-reefback-sticker",
    "shoalshot",
    "special",
    "Reefback field plate · Sticker",
    "Reefback field plate. Sticker in monochrome ink stamp.",
    "A small emblem drawn from Reefback field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-reefback-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-reefback-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-ribbon-dart-diagram",
    "shoalshot",
    "feature",
    "Ribbon Dart field plate · Diagram",
    "Ribbon Dart field plate. Diagram in cutaway gouache on navy.",
    "An illustrated workbench study of Ribbon Dart field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-ribbon-dart-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-ribbon-dart-diagram.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-ribbon-dart-sticker",
    "shoalshot",
    "special",
    "Ribbon Dart field plate · Sticker",
    "Ribbon Dart field plate. Sticker in chunky stained-glass emblem.",
    "A small emblem drawn from Ribbon Dart field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-ribbon-dart-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-ribbon-dart-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-sailray-diagram",
    "shoalshot",
    "feature",
    "Sailray field plate · Diagram",
    "Sailray field plate. Diagram in printed service manual with yellow highlights.",
    "An illustrated workbench study of Sailray field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "shoalshot-sailray-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-sailray-diagram.png", 1216, 640]
    ]
  ],
  [
    "shoalshot-sailray-sticker",
    "shoalshot",
    "special",
    "Sailray field plate · Sticker",
    "Sailray field plate. Sticker in rubber-hose vinyl decal.",
    "A small emblem drawn from Sailray field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-sailray-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-sailray-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-stormglass-squid-diagram",
    "shoalshot",
    "feature",
    "Stormglass Squid field plate · Diagram",
    "Stormglass Squid field plate. Diagram in blueprint white ink on petrol.",
    "An illustrated workbench study of Stormglass Squid field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "shoalshot-stormglass-squid-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-stormglass-squid-diagram.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-stormglass-squid-sticker",
    "shoalshot",
    "special",
    "Stormglass Squid field plate · Sticker",
    "Stormglass Squid field plate. Sticker in two-colour embroidered patch.",
    "A small emblem drawn from Stormglass Squid field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-stormglass-squid-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-stormglass-squid-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-sunscale-sprat-diagram",
    "shoalshot",
    "feature",
    "Sunscale Sprat field plate · Diagram",
    "Sunscale Sprat field plate. Diagram in 1990s instruction manual risograph.",
    "An illustrated workbench study of Sunscale Sprat field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-sunscale-sprat-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-sunscale-sprat-diagram.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-sunscale-sprat-sticker",
    "shoalshot",
    "special",
    "Sunscale Sprat field plate · Sticker",
    "Sunscale Sprat field plate. Sticker in red and cream punk laptop sticker.",
    "A small emblem drawn from Sunscale Sprat field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-sunscale-sprat-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-sunscale-sprat-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-tideglass-diagram",
    "shoalshot",
    "feature",
    "Read the tide · Diagram",
    "Read the tide. Diagram in cream drafting-paper graphite plan.",
    "The Tideglass has its own shape and material language inside the dive.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-tideglass-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-tideglass-diagram.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-tideglass-sticker",
    "shoalshot",
    "special",
    "Read the tide · Sticker",
    "Read the tide. Sticker in glazed ceramic pin.",
    "The Tideglass has its own shape and material language inside the dive.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-tideglass-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-tideglass-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-tidehunter-diagram",
    "shoalshot",
    "feature",
    "Tidehunter field plate · Diagram",
    "Tidehunter field plate. Diagram in isometric construction on recycled stock.",
    "An illustrated workbench study of Tidehunter field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1216,
    640,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Link preview", "shoalshot-tidehunter-diagram-placement.jpg", 1200, 630],
      ["ImageGen original PNG", "shoalshot-tidehunter-diagram.png", 1216, 640]
    ]
  ],
  [
    "shoalshot-tidehunter-sticker",
    "shoalshot",
    "special",
    "Tidehunter field plate · Sticker",
    "Tidehunter field plate. Sticker in flat pictogram enamel pin.",
    "A small emblem drawn from Tidehunter field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-tidehunter-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-tidehunter-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-veilfin-diagram",
    "shoalshot",
    "feature",
    "Veilfin field plate · Diagram",
    "Veilfin field plate. Diagram in limited-colour chalk diagram.",
    "An illustrated workbench study of Veilfin field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1536,
    864,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Landscape", "shoalshot-veilfin-diagram-placement.jpg", 1600, 900],
      ["ImageGen original PNG", "shoalshot-veilfin-diagram.png", 1536, 864]
    ]
  ],
  [
    "shoalshot-veilfin-sticker",
    "shoalshot",
    "special",
    "Veilfin field plate · Sticker",
    "Veilfin field plate. Sticker in soft rubber arcade charm.",
    "A small emblem drawn from Veilfin field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-veilfin-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-veilfin-sticker.png", 1024, 1024]
    ]
  ],
  [
    "shoalshot-void-moth-diagram",
    "shoalshot",
    "feature",
    "Void Moth field plate · Diagram",
    "Void Moth field plate. Diagram in tabletop rulebook foldout.",
    "An illustrated workbench study of Void Moth field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1280,
    "Design study",
    "Diagrams",
    "GPT Image 2.6 via Fal",
    [
      ["Portrait feed", "shoalshot-void-moth-diagram-placement.jpg", 1080, 1350],
      ["ImageGen original PNG", "shoalshot-void-moth-diagram.png", 1024, 1280]
    ]
  ],
  [
    "shoalshot-void-moth-sticker",
    "shoalshot",
    "special",
    "Void Moth field plate · Sticker",
    "Void Moth field plate. Sticker in sculpted resin badge.",
    "A small emblem drawn from Void Moth field plate.",
    "https://shoalshot.loftwah.com/",
    "Play",
    1024,
    1024,
    "Sticker or icon",
    "Stickers",
    "GPT Image 2.6 via Fal",
    [
      ["Profile icon", "shoalshot-void-moth-sticker-placement.jpg", 512, 512],
      ["ImageGen original PNG", "shoalshot-void-moth-sticker.png", 1024, 1024]
    ]
  ]
] as const;

export const fieldGuide: CampaignItem[] = art.map(
  ([
    slug,
    project,
    use,
    title,
    alt,
    caption,
    href,
    action,
    width,
    height,
    stage,
    tag,
    credit,
    files
  ]) => ({
    id: `field-guide-${slug}`,
    series: "field-guide",
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
    addedAt: "2026-11-13T08:33:30Z",
    kind: "editorial composition",
    stage,
    tags: [tag],
    credit: `Woodhouse · ${credit}`,
    source: `${base}/provenance.txt`,
    formats: files.map(([label, file, width, height]) => ({
      label,
      image: `${base}/${file}`,
      width,
      height
    }))
  })
);
