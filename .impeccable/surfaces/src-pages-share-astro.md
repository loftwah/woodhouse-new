---
version: 1
slug: src-pages-share-astro
primary_target: src/pages/share.astro
related_targets:
  - src/components/ShareActions.astro
---

Reviewed 12 October 2026. Experience surface within the established Woodhouse ink/lime publication. MP explicitly rejected the selector-and-reading resource desk: artwork must be visible together, ready to copy or use without choosing a project or opening an artwork disclosure. PRODUCT.md owns that dated remit; DESIGN.md remains the global visual authority.

## Built direction

THESIS: see finished assets together and copy or download directly beside each image. OWN-WORLD: Bricolage headings, canonical project and LoftwahFM artwork, open ink space, thin rules and a lime Download action. STORY: Fighter, SHOALSHOT, Protocol 11, Bubbles and LoftwahFM lead; radio shapes, factory/story artwork, logo and SVG originals and official profiles follow. FIRST VIEWPORT: a compact invitation and section links lead directly into a three-column artwork gallery on desktop; phones stack each image with its own credit and actions. FORM: an image gallery in the existing publication, with all resources in the page flow.

The grid uses three columns above 1100px, two at narrower desktop/tablet widths and one at 600px and below. Figures have no surrounding tile chrome. Their concise titles, source credits and dimensions follow the images, then the actions. Section rules separate Projects, Games × Radio, Factory & stories, Logos & SVGs and official profiles. A `?project=` link sets project metadata and can anchor to the relevant figure; it does not filter the gallery. The first three project images load eagerly; later artwork loads lazily.

## Resources and attribution

The current review inventory contains 29 displayed image assets: nine project images, three radio cards, three Woodhouse/factory/operator images, eight published dispatch cards, four SVG assets and two transparent WebP logos. This is a dated inventory, not a hard-coded count or availability guarantee. Published records determine the projects and stories; radio availability and public membership determine whether its cards can be shown.

- Project images retain their publisher composition, visible project credit and full-size link. A project without publisher artwork uses a credited Woodhouse illustration. Loaded project-image dimensions replace the initial “Original image” label. Each project has its own Download, progressive Copy image and Copy post actions, plus Play, Listen or Open project and a link to its gallery kit. SHOALSHOT uses its current OG v4 artwork, replacing OG v2 in this bounded refresh.
- Games × Radio shows all three LoftwahFM shapes together: landscape (1200 × 630), square (1200 × 1200) and portrait (1080 × 1920), in PNG. Each has its own actions. URLs preserve the public listening snapshot and the concise credit names official game artwork and LoftwahFM composition. Listening remains distinct from project popularity. Missing eligible radio data shows an availability message while the other gallery resources remain usable.
- Factory & stories keeps Woodhouse, The factory, Dean Lofts and the existing dispatch artwork visible in the gallery. Each image has a ready post and direct story link. These are the existing Woodhouse JPGs, not recreated project artwork.
- Logos & SVGs shows the project-network, release-path and evidence-ladder diagrams and Woodhouse mark as SVGs, alongside SHOALSHOT's MP-approved generated transparent WebP wordmark (1998 × 424) and emblem (1161 × 1161). The generated artwork replaces the historical SVG logos. Credits identify the published SHOALSHOT generated brand assets; originals remain downloadable beside their previews.
- Official social profile links use the published footer menu. They prepare MP's next step; the gallery does not publish a post on MP's behalf.

## Image actions and responsive behaviour

Download is a native link to the original image file. Copy post appears when text clipboard support is available and copies the current caption text. Caption editing is secondary, inside native `<details>`; no disclosure is required to see an image or copy its ready post. Text-copy failure opens the caption, selects it for manual copying and reports that fallback through a status message.

Copy image appears when image clipboard support is available. PNG files pass through; other supported images are converted to PNG for the clipboard. Transparent WebP logos use the existing image/canvas conversion at their original dimensions, supplying PNG clipboard compatibility without requiring MP to convert a file. For SVGs, the conversion sets explicit pixel dimensions from the source `viewBox`, falling back to numeric width/height, before image decoding. This prevents responsive SVG dimensions from shrinking the copied artwork. Original downloads remain unchanged. Success reports the copied PNG dimensions; failure points to Download.

Native Share is progressive. Supporting browsers prepare the original file when its action group enters the viewport and reveal Share only after confirming file-sharing support. It uses the current caption and public destination. SHOALSHOT logo downloads and native file sharing preserve the original WebP format, alpha and filename. Cancellation clears the status; a failed handoff directs the visitor to Download or Copy image. Device handoff does not establish that a social post was published.

Action links, buttons and caption summaries have a minimum 44px target and wrap on narrow screens. Radio previews contain the complete composition rather than crop it. Their source CSS explicitly clips overflow, gives images the preview's full width and height with `object-fit: contain`, and bounds the phone preview to 320px high. Logo and SVG previews use a 220px-high block with 1rem padding and clipped overflow. Their images fill the available width and height with `min-height: 0` and `object-fit: contain`, fitting within the 188px inner height without crossing into adjacent captions or controls. The SHOALSHOT asset refresh preserves this layout and containment.

SHOALSHOT's “Play & share a dive” link appears only with its published reviewed production-verification evidence record. It opens the game; this gallery does not validate a dive result, upload a score or turn a local result into a public permalink.

## Review evidence and remaining limits

The earlier gallery finish review on 12 October 2026 returned **SHIP**, resolving phone radio artwork collisions, blank factory/story/SVG review evidence, and two overflowing SVG logos. Captures `.release/share-gallery-20261012/desktop-svg-full-final.png` and `phone-svg-full-final.png` preserve that review history.

The bounded SHOALSHOT refresh finish review on 12 October 2026 returned **SHIP**, with THESIS, OWN-WORLD, STORY, FIRST VIEWPORT and FORM all **Kept** and no material findings. Captures `.release/shoalshot-art-refresh-20261012/desktop-first.png`, `desktop-full.png` and `phone-full.png` record the updated assets. All 29 images loaded at 1440px desktop and 390px phone widths with no horizontal overflow. Fresh validation passed 138 tests and the code peer approved the change.

Earlier clipboard checks accepted actual writes for PNG and JPG artwork at 1200 × 630 and a diagram at 2081 × 528. The refresh accepted actual PNG clipboard writes for the current SHOALSHOT wordmark at 1998 × 424 and emblem at 1161 × 1161, superseding the historical 636 × 94 wordmark check. The downloaded wordmark decoded as RGBA with alpha spanning 0–255, and its original bytes matched the immutable upstream source. These checks establish browser write acceptance and original-file integrity; they do not establish a physical operating-system paste, destination-app acceptance or published social post.

Keep the images and actions visible without a project selector or a reading prerequisite. Preserve source credits, original files, snapshot boundaries and truthful local-result limits. Do not infer popularity, invent scores or adoption, add an account/collector, or automatically post. Production deployment identity, live-hostname verification and physical device/share-destination acceptance remain separate evidence.
