# Share gallery — current surface brief

Reviewed 25 October 2026. Scope: `/share/`, public project collections and the
retained query-based archive. Mode: Experience. Audience: players, listeners,
builders and people choosing a piece of work to share. Job: discover a desirable
product through its imagery, open the real product, or take an original image and
caption. New campaign work from #142 leads; the previous asset inventory is history.

Direction: an edited wall of complete images, varied in aspect and scale, inside
the existing Woodhouse world. The first screen spends its area on the images,
with a short heading, compact project links and direct product actions. Desktop
uses six tracks: portraits and squares span two, landscapes four.
At phone widths the opening pairs SHOALSHOT and Bubbles, then gives Fighter
the full row; the fourth work and each subsequent fourth work also span the
two-track grid. Complete images keep their authored ratio. The memorable moment
is the work, with a visible View affordance, short title and direct product action.

Content: seven new campaign compositions and five staged production captures,
with four additional landscape poster files for sharing and collection unfurls.
Existing approved clips and published music artwork remain available. Distinguish
editorial art from production screenshots and staged records. Never feature
rejected mascot likenesses. Publication membership controls every promoted project, including
multi-project artwork. Native `/share/[slug]/` collections have their own title,
description, canonical, Open Graph image and CollectionPage/ImageObject data.
The sitemap lists only admitted collections and their original/landscape images;
composites require every contributing project to be published. Native products
retain their own audio, play and release.

Interaction: original-image anchors progressively open a native dialog; Escape
returns to the initiating link. Native disclosures reveal captions and the
existing copy/share/download controls. The archive keeps every existing media ID,
caption, pack, query/page link and fallback, with six previews per archive page.
Existing images and historical files are retained. Mobile remains visual before
archive forms, with no fixed-height letterboxes or destructive crops.

Review, 25 October 2026: the independent finish verdict is **SHIP**, with no
material findings in the supplied final desktop, phone, continuation and viewer
captures: `output/playwright/showoff-20261025/after-desktop-final.png`,
`after-phone-viewport-final.png`, `phone-continuation-final.png` and
`viewer-phone-final.png`. The detector returned `[]`. This is rendered local
review evidence; deployment is pending. MP's subjective taste acceptance,
physical device sharing and destination-app acceptance remain separate. PR #140
is untouched by this scope.

---

The earlier surface record below is historical. Its mandatory six-item default,
introductory navigation and uniform preview layout are superseded above; archive
integrity and sharing behaviour continue to apply.

---
version: 1
slug: src-pages-share-astro
primary_target: src/pages/share.astro
related_targets:
  - src/components/GameMedia.astro
  - src/components/GalleryPagination.astro
  - src/components/ShareActions.astro
  - src/data/share-browser.ts
  - src/layouts/BaseLayout.astro
---

Reviewed 12 October 2026. Experience surface within the established Woodhouse ink/lime publication, with Operate tasks for finding a resource, changing collection, paging, copying and downloading. MP first rejected the selector-and-reading desk and the OG-only interpretation, then rejected the collected media's unbounded single-page scroll. The revised requirement is project/type browsing with six resources per page, while the overview presents the priority projects together. This supersedes rendering every asset in one page; previews and actions still require no dossier reading, artwork disclosure or mandatory setup. PRODUCT.md owns that dated remit; DESIGN.md remains the global visual authority. This is an incumbent-world refinement, so the global design document and its sidecar remain unchanged.

## Built direction

THESIS: browse shareable game media in bounded collections, with original files beside each preview. OWN-WORLD: canonical game pixels on Woodhouse ink; Bricolage headings, open figures and lime downloads. STORY: choose a project and asset type, preview six resources, then copy, download or move to the next page. FIRST VIEWPORT: compact project and type navigation, then a mixed game-image row on desktop or one preview on phone. FORM: the established open gallery, with native URL views and six-item pagination; seed established-share-gallery. This is the five-block direction contract emitted by `BaseLayout.astro` for `/share/`, reconciled with the finished implementation.

The compact “Share the work.” introduction leads into project and asset-type navigation. Native `/share/` URLs vary by `project`, `type` and `page`; a project selection now filters the collection and supplies its heading, metadata and kit destination. Images & screenshots is the default view. Clips, Artwork & covers and Link cards can be scoped to a project; Radio cards, Factory & stories, Logos & SVGs and Social profiles are global views. Every approved resource remains reachable through these views. Figures have no surrounding tile chrome. Titles, dimensions, dated notes and source credits sit immediately below the artifact, followed by its actions. Official profile links remain below the selected collection.

The overview interleaves the nonempty project media groups in priority order rather than exhausting Fighter before showing another game. Its first image page introduces Fighter, SHOALSHOT, Protocol 11, Bubbles and LoftwahFM before repeating a project. A collection contains at most six previews per page. Previous/Next links and a Page n of n label appear above and below every multipage collection, preserving project and type; unavailable directions are labelled disabled text. New project/type choices start at page one, and invalid or out-of-range page numbers resolve to a bounded page. Image views show the displayed range and total, or a plain empty-collection message.

The primary gallery uses three columns above 1100px, two at narrower desktop/tablet widths and one at 600px and below. Artwork uses three, two and two columns at those same widths. Images within the first three media positions on each page load eagerly; later images load lazily. The first three displayed project link-card images also retain eager loading. Thin rules and Bricolage headings preserve the publication's hierarchy around the compact browsing controls.

Desktop project/type choices are native links with the current selection labelled by `aria-current`. On phones, labelled native Project and Asset type selects use the same GET URL model. The visible “Show assets” button makes this form usable without JavaScript; progressive enhancement hides the button and submits on change. Selecting a project while in a global view normalizes to Images & screenshots, and project-scoped phone type options omit the global views. Desktop global-type links clear the project selection. These rules prevent a global choice from leaving a phone project switch in an unrelated or empty view. Query-specific title/canonical metadata and private/no-store route responses preserve each view's identity rather than reusing a path-only cached selection.

## Resources and attribution

The earlier gallery review contained 29 displayed image assets: nine project images, three radio cards, three Woodhouse/factory/operator images, eight published dispatch cards, four SVG assets and two transparent WebP logos. The 12 October 2026 extension adds 213 source-verified media resources, including 12 video clips and 54 published LoftwahFM album covers. These are dated review inventories, not hard-coded counts or availability guarantees. Published records determine the projects and stories; radio availability and public membership determine whether its cards can be shown.

- The five priority projects retain gameplay screenshots, finished films and social variants, guide captures and native result-card examples, now reached through Images & screenshots or Clips. Notes distinguish October interfaces and 12 October release captures from August/September footage, older guides and controlled showcases. Fighter's finished-fight card and SHOALSHOT's zero-catch result card are explicitly local, unverified examples. Protocol 11's controlled table demonstrations and Bubbles' historical controlled film do not imply organic competitive results or the current interface.
- Artwork & covers retains published SHOALSHOT runtime artwork, Protocol 11 artwork and LoftwahFM logos and 54 eligible published album covers. Each cover includes its own public album link. A light preview ground is used only for FM's black logo so the supplied artwork remains legible; the surrounding publication stays ink.
- Eight per-project/category ZIP packs download the approved public images and derived public captions for their full collection together. All five leading projects have gameplay-image packs; SHOALSHOT, Protocol 11 and LoftwahFM also have artwork packs. Packs exclude private manifests, source paths, raw review prose and videos.
- Project images retain their publisher composition, visible project credit and full-size link. A project without publisher artwork uses a credited Woodhouse illustration. Loaded project-image dimensions replace the initial “Original image” label. Each project has its own Download, progressive Copy image and Copy post actions, plus Play, Listen or Open project and a link to its gallery kit. SHOALSHOT uses its current OG v4 artwork, replacing OG v2 in this bounded refresh.
- Games × Radio shows all three LoftwahFM shapes together: landscape (1200 × 630), square (1200 × 1200) and portrait (1080 × 1920), in PNG. Each has its own actions. URLs preserve the public listening snapshot and the concise credit names official game artwork and LoftwahFM composition. Listening remains distinct from project popularity. Missing eligible radio data shows an availability message while the other gallery resources remain usable.
- Factory & stories keeps Woodhouse, The factory, Dean Lofts and the existing dispatch artwork reachable in its paginated global view. Each image has a ready post and direct story link. These are the existing Woodhouse JPGs, not recreated project artwork.
- Logos & SVGs shows the project-network, release-path and evidence-ladder diagrams and Woodhouse mark as SVGs, alongside SHOALSHOT's MP-approved generated transparent WebP wordmark (1998 × 424) and emblem (1161 × 1161). The generated artwork replaces the historical SVG logos. Credits identify the published SHOALSHOT generated brand assets; originals remain downloadable beside their previews.
- Official social profile links use the published footer menu. They prepare MP's next step; the gallery does not publish a post on MP's behalf.

## Image actions and responsive behaviour

Download is a native link to the emitted file. Image previews also open their full-size originals. Copied source images preserve original bytes; original downloads remain available regardless of clipboard support. Video files are either preserved originals or explicitly labelled web exports below 25 MiB. Seven larger Fighter films use same-dimension/duration H264/AAC exports while source masters remain untouched. The Bubbles historical controlled derivative discloses its provenance; its source film and stills remain preserved. Each of the 12 clips has native controls, `playsinline`, a poster and English sound-caption track, with `preload="none"` and no autoplay. Video actions provide Download and progressive Copy post; they do not fetch the movie to prepare image copying or native file sharing. Copy post appears when text clipboard support is available and copies the current caption text. Caption editing is secondary, inside native `<details>`; no disclosure is required to see an image or copy its ready post. Text-copy failure opens the caption, selects it for manual copying and reports that fallback through a status message.

Copy image appears when image clipboard support is available. Image fetching is limited to 6 MiB; conversion rejects decoded images above 16 × 1024 × 1024 pixels. PNG files pass through; other supported images are converted to PNG for the clipboard. The reviewed resource set satisfies both image bounds. Transparent WebP logos use the existing image/canvas conversion at their original dimensions, supplying PNG clipboard compatibility without requiring MP to convert a file. For SVGs, the conversion sets explicit pixel dimensions from the source `viewBox`, falling back to numeric width/height, before image decoding. This prevents responsive SVG dimensions from shrinking the copied artwork. Original downloads remain unchanged. Success reports the copied PNG dimensions; failure points to Download.

Native Share is progressive. Supporting browsers prepare an image file only when its action group enters the viewport and reveal Share only after confirming file-sharing support. Leaving the viewport releases the prepared file and cached original promise and hides Share. Video action groups never enter this preparation path. It uses the current caption and public destination. SHOALSHOT logo downloads and native file sharing preserve the original WebP format, alpha and filename. Cancellation clears the status; a failed handoff directs the visitor to Download or Copy image. Device handoff does not establish that a social post was published.

`GameMedia.astro` contains complete source images and clips with `object-fit: contain`. Wide gameplay previews use a 16:9 area; other primary previews are 300px high. Supporting artwork is 200px high on desktop and 150px high at phone widths. These are preview bounds, not changes to original files. Every figure keeps its credit and actions outside the preview, with wrapping titles and controls.

Action links, buttons and caption summaries have a minimum 44px target and wrap on narrow screens. Radio previews contain the complete composition rather than crop it. Their source CSS explicitly clips overflow, gives images the preview's full width and height with `object-fit: contain`, and bounds the phone preview to 320px high. Logo and SVG previews use a 220px-high block with 1rem padding and clipped overflow. Their images fill the available width and height with `min-height: 0` and `object-fit: contain`, fitting within the 188px inner height without crossing into adjacent captions or controls. The SHOALSHOT asset refresh preserves this layout and containment.

SHOALSHOT's “Play & share a dive” link appears only with its published reviewed production-verification evidence record. It opens the game; this gallery does not validate a dive result, upload a score or turn a local result into a public permalink.

## Review evidence and remaining limits

The earlier gallery finish review on 12 October 2026 returned **SHIP**, resolving phone radio artwork collisions, blank factory/story/SVG review evidence, and two overflowing SVG logos. Captures `.release/share-gallery-20261012/desktop-svg-full-final.png` and `phone-svg-full-final.png` preserve that review history.

The bounded SHOALSHOT refresh finish review on 12 October 2026 returned **SHIP**, with THESIS, OWN-WORLD, STORY, FIRST VIEWPORT and FORM all **Kept** and no material findings. Captures `.release/shoalshot-art-refresh-20261012/desktop-first.png`, `desktop-full.png` and `phone-full.png` record the updated assets. All 29 images loaded at 1440px desktop and 390px phone widths with no horizontal overflow. Fresh validation passed 138 tests and the code peer approved the change.

The game-media extension finish review on 12 October 2026 returned **SHIP**, with THESIS, OWN-WORLD, STORY, FIRST VIEWPORT and FORM all **Kept** and no material findings. Captures `.release/game-media-gallery-20261012/desktop-first.png`, `desktop-shoalshot.png`, `desktop-art.png`, `phone-first.png`, `phone-bubbles.jpg` and `phone-art.jpg` record the finished desktop and phone gallery. Fresh validation passed 139 tests and the production build. The single detector run returned `[]`. Media verification fully decoded every emitted film and checked advertised image dimensions; the integrity test checks file hashes, review dates and delivery bounds. These findings qualify this build; they do not establish deployment or physical sharing acceptance.

The bounded-browsing finish review on 12 October 2026 returned **SHIP**, with THESIS, OWN-WORLD, STORY, FIRST VIEWPORT and FORM all **Kept** and no material findings in inspected source and desktop/phone screenshots. The technical review approved the change after resolving phone global-view to project switching. `.release/share-navigation-20261012/review.md` records that verdict; `desktop-first.jpg`, `desktop-clips.jpg`, `phone-first.jpg` and `phone-art.jpg` preserve the inspected views. The original media, captions, image actions, native clip controls, original downloads and image packs are retained. Browser and deployment acceptance remain separately recorded.

Earlier clipboard checks accepted actual writes for PNG and JPG artwork at 1200 × 630 and a diagram at 2081 × 528. The refresh accepted actual PNG clipboard writes for the current SHOALSHOT wordmark at 1998 × 424 and emblem at 1161 × 1161, superseding the historical 636 × 94 wordmark check. The downloaded wordmark decoded as RGBA with alpha spanning 0–255, and its original bytes matched the immutable upstream source. These checks establish browser write acceptance and original-file integrity; they do not establish a physical operating-system paste, destination-app acceptance or published social post.

Keep each selected collection's previews and actions immediately visible, with native project/type browsing and pagination limiting the scroll. All approved assets must remain reachable without a reading prerequisite. Preserve source credits, original files, snapshot boundaries and truthful local-result limits. Do not infer popularity, invent scores or adoption, add an account/collector, or automatically post. Production deployment identity, live-hostname verification and physical device/share-destination acceptance remain separate evidence.
