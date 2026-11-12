import type { CampaignItem } from "./showcase-campaign.ts";

const base = "/campaign/20261113-foilbury-native";
const cards = [
  [
    "diamond",
    "Moss · Diamond",
    "moss",
    "foilbury-diamond.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mwa2kzjybey2zppg34vcsk3k"
  ],
  [
    "silver",
    "Moss · Silver",
    "moss",
    "foilbury-silver.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mwa2l7wbfqkxh47m0s1znfd2"
  ],
  [
    "gold",
    "Moss · Gold",
    "moss",
    "foilbury-gold.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mwa2l29t5yrhnwsb7ye8thb4"
  ],
  [
    "plain",
    "Moss · Plain",
    "moss",
    "foilbury-plain.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mwa2l54p6a3r5c6h265htppe"
  ],
  [
    "drop",
    "Drop Bear · Published card",
    "drop-bear",
    "foilbury-drop.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mwa2m458d0n2vzjax4nvqv7x"
  ],
  [
    "gabe",
    "Gabe · Published card",
    "gabe",
    "foilbury-gabe.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mw9eibqf4ntvfrhg6bw8webb"
  ],
  [
    "nora",
    "Nora · Published card",
    "nora",
    "foilbury-nora.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mw9ejhpyz1xa6q6westca39w"
  ],
  [
    "pippa",
    "Pippa · Published card",
    "pippa",
    "foilbury-pippa.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mwa2qxvln55a1f44xsvcpk7m"
  ],
  [
    "rhea",
    "Rhea · Published card",
    "rhea",
    "foilbury-rhea.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/render/rnd_mw9ej0915rfnqad4jg11zpf1"
  ],
  [
    "keeper",
    "Cabinet Keeper · Published portrait",
    "",
    "foilbury-keeper.png",
    "png",
    512,
    512,
    "https://foilbury.loftwah.com/brand/mascot/keeper-neutral-512.png"
  ],
  [
    "diamond-back",
    "Moss · Diamond reverse",
    "moss",
    "foilbury-diamond-back.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/back/rnd_mwa2tuf745vnrcqa1syghaw7"
  ],
  [
    "silver-back",
    "Moss · Silver reverse",
    "moss",
    "foilbury-silver-back.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/back/rnd_mwa2ttdc8d58fdr7hty3yn04"
  ],
  [
    "gold-back",
    "Moss · Gold reverse",
    "moss",
    "foilbury-gold-back.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/back/rnd_mwa2ttx5kkqp2zzkvk92d88j"
  ],
  [
    "plain-back",
    "Moss · Plain reverse",
    "moss",
    "foilbury-plain-back.webp",
    "webp",
    750,
    1050,
    "https://foilbury.loftwah.com/media/back/rnd_mwa2tsvej1dk1hp943pyfbj7"
  ]
] as const;

export const foilburyNativeArtwork: CampaignItem[] = cards.map(
  ([id, title, slug, file, ext, width, height, source]) => {
    const href = `https://foilbury.loftwah.com/cabinet/${slug}`;
    const image = `${base}/${file}`;
    return {
      id: `native-foilbury-${id}`,
      project: "foilbury",
      use: "native",
      title,
      alt: title + " from the published Foilbury cabinet.",
      caption: `${title}. From the public Foilbury cabinet.\n${href}`,
      image,
      thumbnail: `${base}/${id}-thumb.${ext}`,
      original: image,
      width,
      height,
      reviewedAt: "2026-11-13",
      credit: "Foilbury · current public cabinet artwork",
      kind: "published product artwork",
      href,
      action: "Explore",
      source,
      formats: [{ label: ext === "png" ? "Published PNG" : "Published WebP", image, width, height }]
    };
  }
);
