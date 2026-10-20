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
- LoftwahFM’s MP-confirmed identity (18 October 2026) uses its original waveform/Loftwah/FM mark, strong black contrast, vivid pink/cyan and bold musical energy. Follow its approved whole-site image. An approved radio-collection sleeve does not redefine the whole-site brand; preserve the producer’s distinct identity rather than substituting a generic retro-radio treatment.
- A diagram earns its area by explaining a real system, boundary or decision. Keep its editable `.d2` source beside the checked-in SVG, ship a phone composition as well as the wider version, and provide a meaningful image description and readable text transcript.
- Pages use large type, asymmetrical composition and decisive horizontal rules. Do not solve every section with another box.

### Diagram direction — MP correction, 18 October 2026

MP rejected the current diagram treatment as missing the requested design direction. The shipped D2 exports are not an approved visual reference. Technical clarity, valid rendering, passing checks and the absence of earlier objections do not establish design acceptance.

The owning brief remains `prompt.md`, sections 8–12: recognisably Woodhouse technical plates suitable for a high-end engineering publication, with deliberate typography, line weights, shape grammar, annotations, project markers, evidence notation and composition. The current coloured boxes, default lettering, nested containers and decorative cobalt glow fall short of that brief. A palette or font swap alone does not address the composition failure. Portrait plates need comfortably readable labels and their own full composition; a vertical stack of miniature boxes does not satisfy the phone requirement.

Corrections must preserve the diagrams' real meaning, editable D2 sources, useful descriptions and text transcripts. Assess the finished visual against the original brief and MP's feedback; do not promote the existing implementation or an agent review into MP's taste acceptance.

## Interaction and states

- Keep page colours fixed from first paint. Dark mode has no transition and no toggle.
- Source artwork and its site caption link open the project site; story titles and dossier links open the Woodhouse record. Keep that distinction visible in the link wording. If source artwork fails, change both its image text and visible credit to identify the Woodhouse illustration. Remove failed source icons cleanly.
- Diagram transcripts use native `<details>` and `<summary>`; do not render the control when there is no transcript.
- The Woodhouse index is searchable from the keyboard with `⌘K` or `Ctrl+K`, and from the phone's House Index.
- Motion is small and purposeful. Respect `prefers-reduced-motion`; do not animate every section into view.

## Working exhibits — authorised expansion, reviewed 20 October 2026

Issue #85 authorised a purposeful exception to the small-motion rule above. The narrow reading — that motion is small and purposeful — did not describe the work the issue asked for, and it did not describe what the site now contains.

A **working exhibit** is a bounded interactive island that runs on this site and shows a real capability of the factory with its parts left visible. There are two, each with its own visual language:

- `/exhibits/patch-bench/` — **The patch bench.** A dark workshop bench in CSS 3D space. Three modules — a playable run, the sound effects it owns, and a real LoftwahFM station — sit on the bench joined by a drawn signal path. The visitor opens the case, pulls the bench apart, isolates a layer, and disconnects the music. The scene is real HTML so focus, text and controls stay usable; only the run is drawn on a canvas.
- `/exhibits/source-plate/` — **The source plate.** Two flat plates on a registration table: the contribution that owns a photo and the card composed from it through a published contract. Deliberately different from the bench — printed, flat and registered rather than three-dimensional and machined.

The rules for exhibits:

- **Lighting and material are allowed.** The ban on gradients for decoration does not apply to a lit surface, a bevelled edge or a lamp pool, because in an exhibit those are the material and the light. They are still not decoration: every gradient in an exhibit does a job a drawing could not.
- **Motion must be interruptible.** Every position in an exhibit is a spring, not a timeline. A visitor who reverses a pull halfway through sees the scene follow the new intention. A canned animation that cannot be reversed is not an exhibit.
- **Reduced motion keeps the whole experience.** The springs snap instead of travelling, the idle movement stops, and every function, control and explanation stays.
- **Sound begins through deliberate action.** No exhibit creates an audio context on load or starts sound without a gesture.
- **A simulation waits for its player.** A run, a timer or a score that advances while nobody is playing it will have ended before the visitor has read the copy, and it empties the state the exhibit claims to hold. The bench's run waits for the visitor's first deliberate decision and says that it is waiting.
- **One audio owner.** An exhibit owns one audio context, one effects bus and one music bus. A second transport is never created to change state.
- **Text, links and focus stay outside the canvas.** A canvas may draw a scene; it may not hold the only copy of a control or a status.
- **The exhibit states what it does not claim.** A demonstration is not an adoption, a copy is not a licence, and a simulation says it is one.

## Interaction contract for feedback — reviewed 20 October 2026

Issue #86 asks for the visibility-of-system-status standard across the portfolio. The expectations are recorded here so new controls inherit them:

1. Acknowledge input immediately: a changed object, a selected state or a visible pending label. Aim for a response within roughly 100 ms.
2. Name the work near its control while it runs: "Preparing image…", "Sending…", "Loading the player…". Determinate progress only when the progress is real.
3. Report the real outcome and its scope. Distinguish a local save from a cloud sync, a request received from work completed, and a browser download requested from a file saved.
4. Keep unavailable actions understandable, and keep recovery, retry and navigation available.
5. Keep failure recoverable: say what failed, keep the person's input, and offer a relevant next step.
6. Associate status with the operation that produced it. A late response must never overwrite a newer intent, and repeated activation must not duplicate work.
7. Make the same meaning available to everyone: keyboard operation, non-colour cues and a readable status beside the action.
8. Author the response. A press should feel deliberate. The shared treatment darkens and settles rather than moving the control, so a pressed target stays under the finger.

This contract applies to the exhibits as well as to the rest of the site.

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

## Connected examples and workshop artwork — reviewed 18 October 2026

Factory gives builders a route through working connections: FM music in a separately hosted demo and independently owned apps composed into one studio. Open rows pair a concrete explanation with immediate actions; versions and adoption records remain available in native disclosures. Projects keeps the complete inventory. The phone navigation says Menu when it is the only navigation control. Repeated source metadata no longer delays the project action, and a failed source image removes its source-only caption as well as changing its credit.

Woodhouse’s social identity is a tactile miniature workshop: one symbolic maker connects underwater play, a game arena and a record player. Ink, lime type and the large “One human. Many worlds.” line carry the thumbnail. This is a conceptual illustration, not Dean’s portrait or screenshots of the products. The generated master, prompt and deterministic export instructions live beside the existing renderer.

## Rejected second diagram edition — reviewed 18 October 2026

The rebuilt family uses open typographic fields on ink, Bricolage lettering, cyan work paths, lime human direction and coral stops. Text names the work; reference medallions order a sequence; a human circle and a decision diamond separate responsibility from a check. A blocked lane has no outgoing publication path. Risk classes form a comparison register with no lifecycle arrows. Lineage is a sequence of working habits rather than an invented dated roadmap. Each plate carries its own subject, exception and dated source or method note.

Wide editions use bounded reading fields rather than an automatic line of nested boxes. Portrait editions are separately composed at 327–376 source pixels wide, with explicit line breaks and full exceptions retained. They do not require the transcript to rescue miniature lettering. Editable `.d2` sources and SVGs remain paired; `pnpm diagrams` embeds the existing Bricolage fonts. Native transcripts and source links remain available. The cobalt glow is removed.

The founding essay alternates a readable prose measure with full-width plates, the existing conceptual workshop illustration and dated public product captures. Its historical account stays tied to 28 September; the editorial expansion has its own 18 October review. The continuation leads to the working Factory examples. Product-first Home and Factory reading orders are retained.

These describe the rebuilt edition. Independent agent review and publication verification are evidence about that edition, not MP’s taste acceptance. MP’s rejection of the former edition remains recorded above.


### MP rejection of the second edition — 18 October 2026

MP rejected the oversized typographic D2 exports after seeing production. Their deployment and agent PASS did not meet the visual brief. Large slogans, repeated numbered portrait rails, unstable symbols and relationships supplied only by footer prose are failures, not an accepted reference.

The replacement uses commissioned-style generated illustrations with subject-specific technical composition and genuinely readable portrait labels. The final illustration and the editable D2 system model are different artifacts and must be labelled honestly. Retain the generated masters, exact prompts and reviewed model identity together. A renderer must refuse a model/master change that has not been reviewed as a pair. Native descriptions and complete transcripts remain mandatory. Production and agent review never confer MP taste acceptance.

### Replacement direction — MP feedback, 18 October 2026

MP positively received the illustrated replacement shown in the article's before/after comparison and asked for the family to be used fully. Carry the selected eleven illustrations and their readable phone editions through the existing pages and share gallery. Preserve the generated masters, prompts, editable system models and transcripts. This feedback establishes the shown visual direction; the earlier rejected editions remain rejected, and technical verification still belongs to each released format.
