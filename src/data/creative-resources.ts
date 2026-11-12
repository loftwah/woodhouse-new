export const creativePlates = [
  {
    id: "workbench",
    title: "Workbench",
    alt: "Charcoal cutting mat with drafting film, registration grids and an acid-green game token",
    use: "A landscape background for a release note, game jam or prototype announcement. The left side leaves room for a headline.",
    width: 1536,
    height: 1024,
    prompt:
      "Use case: stylized-concept. Asset type: wide editorial image and reusable background plate for Woodhouse’s creative resource library. A straight-down, meticulously art-directed photograph of a small physical game-production workbench laid on a charcoal-black cutting mat: graphite grey laser-cut mechanical registration grids, translucent drafting film, restrained acid yellow-green accents, coarse paper and tiny unmarked material swatches. One strong asymmetric composition, object grouping toward the right, quiet dark negative space on the left, directional low-key light with believable shadows, crisp material detail, tactile and restrained. Landscape 3:2. No lettering, numbers, logos, faces, trademarks, screens, typography, or watermark. An original scene with no third-party reference image."
  },
  {
    id: "amber-inlay",
    title: "Amber inlay",
    alt: "Curved lines in brushed graphite metal with a narrow amber glass inlay",
    use: "A portrait background for a game card, story still or vertical announcement. The upper field leaves room for type.",
    width: 1024,
    height: 1536,
    prompt:
      "Use case: stylized-concept. Asset type: reusable vertical card-art background for a small independent game studio. Macro product photograph of an abstract dark brushed graphite metal inlay, with embossed concentric contour lines like an instrument dial and a single muted amber glass sliver at the lower right, a quiet nearly black upper two thirds for future editorial type. Elegant unusual material, raking warm light, tight restrained palette of black and amber, crisp fine grain, optically believable. Portrait aspect. Full bleed, no text, numbers, logos, characters, watermarks or third-party reference images. It is an abstract material plate, not a finished card mockup."
  }
].map((plate) => ({
  ...plate,
  image: `/media/resources/${plate.id}.png`,
  preview: `/media/resources/${plate.id}.webp`
}));

export const resourceReviewDate = "2026-11-12";

export const resourceSources = [
  {
    id: "game-assets",
    title: "Game assets",
    resources: [
      {
        name: "Kenney UI Pack",
        source: "https://kenney.nl/assets/ui-pack",
        use: "Buttons, sliders and panels for a game menu or HUD prototype.",
        terms: "CC0",
        licence: "https://kenney.nl/assets/ui-pack"
      },
      {
        name: "Kenney Playing Cards",
        source: "https://kenney.nl/assets/playing-cards-pack",
        use: "Deck graphics for a card-game prototype, collection mockup or layout test.",
        terms: "CC0",
        licence: "https://kenney.nl/assets/playing-cards-pack"
      },
      {
        name: "Kenney Interface Sounds",
        source: "https://kenney.nl/assets/interface-sounds",
        use: "Short sounds for selection, confirmation and other UI feedback.",
        terms: "CC0",
        licence: "https://kenney.nl/assets/interface-sounds"
      },
      {
        name: "Poly Haven",
        source: "https://polyhaven.com/textures",
        use: "Textures, HDRIs and models for scene lighting, mockups and image references.",
        terms: "CC0 for assets",
        licence: "https://polyhaven.com/license"
      }
    ]
  },
  {
    id: "interface-assets",
    title: "Interface assets",
    resources: [
      {
        name: "Lucide",
        source: "https://github.com/lucide-icons/lucide",
        use: "A consistent SVG icon set for toolbars, navigation and game settings.",
        terms: "ISC and MIT notices",
        licence: "https://github.com/lucide-icons/lucide/blob/main/LICENSE"
      },
      {
        name: "Bricolage Grotesque",
        source: "https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque",
        use: "The variable display family used by Woodhouse, with upstream font files and licence.",
        terms: "SIL Open Font License 1.1",
        licence: "https://github.com/google/fonts/blob/main/ofl/bricolagegrotesque/OFL.txt"
      }
    ]
  },
  {
    id: "test-datasets",
    title: "Test datasets",
    resources: [
      {
        name: "MNIST",
        source: "https://huggingface.co/datasets/ylecun/mnist",
        use: "Small labelled digit images for exercising image import or classification. The Hub provides a Parquet export.",
        terms: "MIT listed on the dataset card",
        licence: "https://huggingface.co/datasets/ylecun/mnist"
      },
      {
        name: "MINDS-14",
        source: "https://huggingface.co/datasets/PolyAI/minds14",
        use: "Short recorded speech samples for testing a multilingual transcription flow. Credit PolyAI when reusing.",
        terms: "CC BY 4.0 listed on the dataset card",
        licence: "https://huggingface.co/datasets/PolyAI/minds14"
      }
    ]
  }
];
