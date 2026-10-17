# Design system

Reviewed 7 October 2026.

## Direction

Woodhouse is an evidence-led public journal for a small software factory. Its world is a dark technical canvas with vivid, authored diagrams and the artwork each product publishes about itself. The result should feel like a confident engineering publication, not a dashboard or a generated portfolio template.

The site is dark by design on every device. Do not follow the operating-system appearance, read or write a theme preference, offer a theme switch, or show a light surface between navigations.

## Colour and material

- Ink `#080D19` is the page ground. Raised surfaces stay within the same dark family: `#0F182A`, `#111A2C`, and `#17233A`.
- Acid lime `#E9FF49` marks human direction and the Woodhouse identity.
- Cyan `#79D8FF`, cobalt `#647DFF`, and coral `#FF746A` distinguish real system paths and evidence boundaries. A colour must never carry a state without a text label.
- Use crisp edges, strong contrast and restrained light. No paper backgrounds, gradients for decoration, glass, soft dashboard tiles, or nests of boxes.

## Typography

- Display titles use locally hosted Bricolage Grotesque with deliberate line breaks and tight tracking.
- Body copy uses the platform sans-serif at a readable measure of roughly 65–75 characters.
- Monospace is reserved for identifiers, source labels and compact technical detail.
- Sentence case carries prose. Uppercase is for short diagram labels, never whole paragraphs.

## Composition

- The homepage identifies the human operator and coding agents, then leads with the project that moved most in the current review. A dated portfolio report, a compact dossier register and recent dispatches form the reading path. The D2 work map and release/evidence flow follow as an explanation of the system; both remain available on phones.
- The dossier register uses open rows separated by rules. Keep the project identity, labelled state and review date together; each row opens its Woodhouse dossier.
- Project artwork is fetched from each project's own published page metadata and shown from the source image URL at its original 1200×630 aspect ratio. Titles, descriptions, favicons and links identify the source. Do not copy or recreate source-site OG artwork as Woodhouse art.
- Source-page metadata is read during the Woodhouse build; the image itself stays at the source URL. A source-site update appears on the next Woodhouse build (and an image-file update at a stable source URL is served directly).
- Credit product artwork to its project and Woodhouse-made illustrations to Woodhouse. Never present a Woodhouse illustration as product artwork.
- A diagram earns its area by explaining a real system, boundary or decision. Keep its editable `.d2` source beside the checked-in SVG, ship a phone composition as well as the wider version, and provide a meaningful image description and readable text transcript.
- Pages use large type, asymmetrical composition and decisive horizontal rules. Do not solve every section with another box.

## Interaction and states

- Keep page colours fixed from first paint. Dark mode has no transition and no toggle.
- Source artwork and its site caption link open the project site; story titles and dossier links open the Woodhouse record. Keep that distinction visible in the link wording. If source artwork fails, change both its image text and visible credit to identify the Woodhouse illustration. Remove failed source icons cleanly.
- Diagram transcripts use native `<details>` and `<summary>`; do not render the control when there is no transcript.
- The Woodhouse index is searchable from the keyboard with `⌘K` or `Ctrl+K`, and from the phone's House Index.
- Motion is small and purposeful. Respect `prefers-reduced-motion`; do not animate every section into view.

## Responsive and accessibility rules

- Design the narrow reading order deliberately. On the homepage, place the lead artwork and its credit before the story text on phones. Stack register identity, state and review date within the same linked row. Keep source artwork at its original aspect ratio and show the phone-specific D2 SVG at phone widths.
- Nothing depends on hover. Do not hide diagrams on phones; include a text transcript for detail and assistive technology.
- Preserve readable contrast, visible focus, useful image text and clear link purpose. Keep the page free of horizontal overflow.

## Portfolio analytics boundary — reviewed 17 October 2026

`/activity/` is an operational research workbench within the established Woodhouse world. It is called **Analytics** in desktop navigation, the phone Index and the page heading; `/activity/` stays the route. Its compact Bricolage heading, ink surfaces, cyan selection, acid share action, tabular figures and one-pixel seams inherit the site identity. The 190px project rail, dominant single-measure chart and adjacent interpretation column belong to this surface; they do not prescribe the journal, dossiers or share gallery. The approved composition and built-world detail live in `.impeccable/surfaces/src-pages-activity-astro.md`.

- Keep project, inclusive UTC dates and measure selection close to the chart. The portfolio selector groups 18 measures into gameplay, visits & returns, app usage and listening. **All projects opens on a mixed overview**, not on game starts: each admitted project shows the measure its own product view defines — the games on game starts, LoftwahFM on audible listening, App Composer on mini-app opens and Woodhouse on visits — with its value, unit, measure label and reporting context for one selected period. The overview adds no cross-product total, because the units and collection boundaries differ. Choosing a project or an explicit measure opens a single-scope drill-down; games start with game starts, App Composer with mini-app opens, Woodhouse with visits and LoftwahFM with audible listening. One chart carries one measure and one unit. Source colour identifies a named project, while text identifies measurement quality. A missing observation stays a gap; a reported zero stays zero.
- Apply metric relevance once, everywhere. Applicability comes from the product view, not from whether a source returned data. A game that should report a gameplay measure but did not stays in that measure's scope as "Not measured"; a non-game is omitted from gameplay values, chart, table, coverage calendar and coverage denominator. Genuine zero and reported unavailability remain distinct. Overall source health stays separate from coverage of the selected measure. The page, caption, saved link, chart CSV, daily table, coverage calendar and landscape/square/portrait PNGs describe the same scope, measure, unit and period, including the mixed overview. A whole missing report and an omitted metric keep the applicable project in scope; the shared qualifier names "Source unavailable", "Not reported", "Not measured", "Bounded count", "Sampled estimate", "Coverage unavailable", "Partial coverage", "Legacy/test risk" or "Reported activity" beside the value on the overview card, the measure strip, the saved caption and all three PNGs, so a limitation cannot appear on one surface and vanish on another. Both documented measurement exclusions — `?analytics=off` and `?qa` — survive project, measure, date and frozen-report navigation.
- Preserve dates and frozen-report context when changing projects. Switching product families selects the destination's default; switching games retains a compatible measure; returning to All projects returns to the overview. Legacy links without an explicit measure now land on the overview; `?measure=` links remain valid drill-downs. App access, received pending postcards, contribution-page views and completed Link Checks have separate labels and meanings. App headlines show opens, received postcards and finished inspections; receipt counts record admission as pending, not current queue size, approval or publication. Later moderation does not decrement an admission count. Mixed app actions do not become a funnel, creator activation or a successful-publication count. Keep the business interpretation within the selected product's evidence.
- Keep the native Custom dates disclosure closed initially. On phones the project rail scrolls horizontally, the toolbar wraps and interpretation follows the chart. Show the selected measure's meaning before the plot without burying the plot beneath expanded forms or export tools.
- The locally bundled ECharts SVG chart adds crosshair inspection, line/bar choice, zoom and named series toggles. Preserve the server SVG for measured selections and the permanent daily values/coverage table. When every value is missing, show the empty-state explanation and omit chart axes and SVG, retaining the chart host for day inspection and CSV export. A reported zero is measured data and still receives a chart. Keep keyboard day inspection and CSV export together in the native Chart data & export disclosure. Respect reduced motion and retain visible keyboard focus.
- Put daily coverage, definitions, provenance and novice/business interpretation beside the measurement story. Frozen landscape, square and portrait PNGs carry the actual chart, adjacent source-quality labels, UTC context and a retrieval link on the report's serving origin. Compositions are authored exports of the same snapshot, not decorative chart illustrations. Runtime charts and controls need no generated raster assets.
- Keep anonymous-reporting control and optional browser-return consent distinct on the existing measurement page. Woodhouse browser recognition starts off and is limited to this origin and retained 90-day identifiers. Describe browser returns as a partial browser signal, with explicit storage and revocation states; do not present people, cohort retention or a cross-product identity.

This design records inspectable activity and its limits. It supplies no visual shorthand for unique people, proven adoption, cohort retention, revenue or investment readiness. Preview, visual review, production verification and physical-device sharing remain separate evidence states.

## Review

1. Can a new visitor tell who runs the factory, what agents do and how many products it spans?
2. Are project cards displaying the artwork and metadata their own sites publish?
3. Does every image name its source or creator accurately?
4. Does each diagram explain a real boundary, process or decision and work on a phone?
5. Does every project claim stay inside its source and review date?
6. Does the first viewport give a stranger something they can do, in words they would use?

## Visitor-facing copy — reviewed 18 October 2026

The first reading layer is for ordinary visitors. A plain sentence answers what a product is, who
it is for and what a person can do with it before any development detail appears. An available
product offers its real action beside its introduction — Play, Listen, Try or Open — with a
separate, clearly labelled route to its story and development notes.

Keep the display typography and dark surfaces exactly as they are; make the reading order and the
wording plain. Australian English spelling carries through headings, buttons, captions, feedback,
errors, metadata and current story introductions. Read representative copy aloud: if it cannot be
said to another person comfortably, rewrite it.

Project identity fields describe the product and stay stable. Dated engineering status stays
separate and dated. A limitation that changes a visitor's decision sits beside the claim or action
it affects; detailed version, source and verification material belongs in labelled deeper sections.
Remove a repeated generic paragraph when a concise local statement and one link do the same job.
