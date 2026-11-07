# Woodhouse Stitch project

Reviewed 7 November 2026. This records what was actually generated in Google Stitch, what was
rejected, and what a future pass must correct. Stitch is a design workspace; it is not evidence that
a screen works, that the content is true or that the production site has changed.

The design work is tracked in [issue #170](https://github.com/loftwah/woodhouse-new/issues/170). No
production route changed in either pass, and this pass did not redeploy the site.

## Project

- **Project:** `Woodhouse — The Loftwah Software Factory`
- **ID:** `projects/2818325185592691947`
- **Design system:** `Woodhouse` — `assets/df1fd6e3ef6c4118997c3e26fee441db`
  (Stitch generated this from the first prompt; it approximates the production tokens rather than
  reproducing them exactly. The canonical tokens are in [`DESIGN-FOUNDATION.md`](DESIGN-FOUNDATION.md)
  and `src/styles/global.css`.)
- **Device:** desktop project with separate 390px mobile screens.

## Screens generated

The 6 November pass produced the first eight. The 7 November pass corrected the analytics screen and
generated the seven missing families. Where a correction produced a new screen, the accepted screen
is listed; superseded intermediate screens are listed further down and must not be used.

| File | Screen | Stitch ID | Notes |
| --- | --- | --- | --- |
| `01-homepage.jpg` | Homepage, corrected pass | `867a44fcfa664559ad8e3637db7a58ac` | Accurate project content after two corrections. The loom plate is a labelled placeholder, not the real artwork. Buttons are uppercase and Stitch's type weights differ from production. |
| `02-projects.jpg` | Projects catalogue | `70d71a81fbd840d2ae8634545d408989` | Accurate names and hooks. Disciplines/actions for the lower rows were inferred by the model; production's published fields are authoritative. Artwork is abstract placeholder. State labels are too low contrast. |
| `03-project-bubbles.jpg` | Bubbles project record | `e476b48600524396a7548b5b5ad73209` | Uses the supplied copy. Placeholder artwork. Review before using any spacing or copy treatment. |
| `04-field-note.jpg` | Field-note article | `c4a9cc36b55e47f6901ea58af787e4f7` | Uses the supplied argument and evidence rail. Check the plate's labels against the real article. |
| `05-analytics.jpg` | Analytics workbench, corrected | `446563288c1549bbb56b520ca8436857` | **Accepted.** Replaces `4c8e4eea61114476a69251f6369e868f`. Real figures only: 98% fall, 1,134 this week, 63,419 the week before, 11 discovery clicks, and the seven project rows with their notes. Two correction passes removed the benchmark register, "verified telemetry", reference numbers, ISO/rig footer, `REGISTER REFS` rail label and the invented reading-notes panel. The rail's six footer links were dropped by the model in the second pass; not restored. |
| `06-share.jpg` | Share gallery | `7ce2bb923a7b437e8f6f9993f4f20eb9` | Uses the real asset descriptions. Placeholder previews; production uses the approved files. |
| `07-patch-bench.jpg` | Patch bench exhibit | `13595482b46a47179b65209d1c659196` | Direction only. The real exhibit is HTML/CSS/canvas with one audio context; this is a flat reference. |
| `08-mobile-home.jpg` | Homepage, 390px | `b43b458af66846e88841b2cb8f701bf4` | Reading order is correct: `h1` and actions before the plate. Loom is a placeholder. |
| `09-leaderboards.jpg` | Engineering leaderboards | `3c7cd840fdd546dfbde13e10f6928ad4` | **Accepted.** Corrected once to remove an invented ratio ("4 of 7 repositories reporting") and a status footer. Four repository rows with real partial/missing coverage states. |
| `10-listening.jpg` | Scores and listening | `1b26f24c2cd542328b490124a28478f2` | **Accepted.** Corrected once to remove a "system status / build rig" footer and an invented timestamp label. Keeps the reported-listening rows, the dash-for-missing rule and both coral boundary statements. |
| `11-architecture.jpg` | How Woodhouse works | `44cba77a72eb406fb46d26168934f7c8` | **Accepted with deviation.** Register/plate chrome and an invented right-rail record block removed. The plate's three boundary labels collide at narrow desktop widths, so it is a composition reference only. Supplied boundary copy survives in the transcript, which is why "telemetry" and "verified" appear in the source. |
| `12-evidence.jpg` | Evidence record | `2501617aa2fc4427b391194a55925b0d` | **Accepted.** Corrected to remove `EVIDENCE RECORD 04 / 12`, `REV - 04-A`, `REGISTER REF: EVD-2026-004`, `VERIFIED`, `BOUND` and the audit-protocol line. |
| `13-factory.jpg` | The factory | `afa170d5427e44368ed8c1bb3f1fd5ae` | **Accepted with deviation.** Instrument labels and the diagram's invented internals removed. `DOC-ID: FCT-094` survived two explicit correction requests and remains in the breadcrumb; crop or remove it before any use. |
| `14-connections.jpg` | Connections | `b13a26813750401e9ace02bbcc596cbb` | **Accepted.** Corrected to remove `SYNC INTEGRITY: 100%`, the plate header, node ids and the index/cadence labels. The five-row ledger and the source-only states are correct. |
| `15-extension-states.jpg` | Woodhouse-owned surfaces | `5e120b0fc2d4468e94acda28771bcd0b` | **Accepted.** Three panels: the editorial policy refusal, the enquiries list and the read-only production boundary. Corrected to remove `SPEC / REF-048`, `SEC 01–03`, `ENVIRONMENT STATE: LOCKED` and the record counter. The browser title still contains `SPEC`; the visible breadcrumb does not. |
| `16-mobile-projects.jpg` | Projects catalogue, 390px | `496c4282411e43c18f4670bfee5c5c20` | **Accepted.** Deliberate phone composition: stacked linked rows, a clipped horizontal filter rail, 44px targets and a labelled artwork placeholder. The per-row `NN / 12` counter and the card treatment are deviations from production's open rows. |
| `17-interaction-states.jpg` | Interaction and component states | `814da68016b5444daedb3b9a69f9926e` | **Accepted.** Covers actions, search, filters, share, media, analytics, forms, status labels and motion. Corrected to remove the analysis-band chrome and to replace the invented status word "Nominal standby". |
| `18-design-references.jpg` | Design references, closing record | `98f7a54550dd4e22a6f958e5013ef422` | **Accepted.** The consistency record for the whole set: what each screen is, what was corrected, what is banned and what deviations remain. Its own correction removed an invented `CONSISTENCY SCORE: 100%` audit strip — the same failure the sheet documents. |

### Superseded screens

These exist in the project and must not be used as references:

| Superseded ID | Replaced by |
| --- | --- |
| `4c8e4eea61114476a69251f6369e868f` | `446563288c1549bbb56b520ca8436857` (analytics) |
| `a174a7b720a34a34bf239e2d8922519d` | `446563288c1549bbb56b520ca8436857` (first correction, still had `REGISTER REFS`) |
| `7056b66902b34a3aba7436afa8acf6d8` | `3c7cd840fdd546dfbde13e10f6928ad4` |
| `c3ad2bfa404f4856acd03d8f352235d7` | `1b26f24c2cd542328b490124a28478f2` |
| `113994f647bb4ad6b8d16f6f12f949b9` | `44cba77a72eb406fb46d26168934f7c8` |
| `01177786c433458eb5eb87366d593805` | `2501617aa2fc4427b391194a55925b0d` |
| `7d90e384e05b4005890370999833f642` | `afa170d5427e44368ed8c1bb3f1fd5ae` |
| `23bc68bce5d441a7b059c615b1d446c9` | `b13a26813750401e9ace02bbcc596cbb` |
| `0f9f1113bcd64945a2aec8f3598cc319` | `5e120b0fc2d4468e94acda28771bcd0b` |
| `e0326362eb604e3882cd71d77066072d` | `98f7a54550dd4e22a6f958e5013ef422` |

## Rejected first pass

The first homepage screen (`projects/2818325185592691947/screens/b2da9ff5a1b14673a16af825a66bc394`)
is retained in the project by the service but must not be used. It invented:

- 418 active production deployments, 87 production repositories, 1.82ms latency, 99.98% uptime;
- projects Aether-Daemon, Synapse-Bridge, HyperLoom, Substrate-OS and VectorPulse;
- a fictional "Series A technical audit" offer and a telemetry status bar.

It is a worked example of why generated design is not accepted on appearance. The corrected screens
above use the real content supplied in the prompts.

## The recurring failure: invented instrument chrome

Every new screen in the 7 November pass arrived with an invented "instrument" layer: a status
footer (`SYSTEM STATUS: ONLINE`, `ALL SYSTEMS NOMINAL`, `AUTONOMOUS BUILD RIG v4.12`), document and
reference ids (`DOC-ID: FCT-094`, `REF-048`, `REGISTER REF: EVD-2026-004`), plate and figure labels,
and occasionally a fabricated figure (`SYNC INTEGRITY: 100%`, `CONSISTENCY SCORE: 100%`, a "4 of 7
repositories reporting" ratio).

This survived the generic instruction "do not invent". It only went away when a correction named
the exact strings to delete and the exact words to avoid. Nine of the eleven new screens needed at
least one correction; the analytics screen needed two.

What worked, and should be used first next time:

1. Treat generation as a first draft. Budget one correction per screen.
2. In the correction, list the literal strings to delete, the words to avoid, and the exact content
   to keep. Generic "remove invented chrome" is not enough.
3. Verify the result by auditing the generated HTML, not the screenshot. Download `htmlCode`, strip
   tags, and search for banned tokens and percentages. This caught two screens that looked clean and
   one rejection that only existed in the `<title>`.
4. Two correction requests were silently ignored for `13-factory.jpg`. Record the residual rather
   than claiming a clean pass.

## Known inaccuracies in the accepted references

- **Artwork** in every screen is a placeholder. Stitch's available tool surface can generate screens
  from text and edit them with text, but it exposes no screen-image upload, so the placeholders
  could not be replaced with real product artwork in this pass. Every one is labelled
  `ARTWORK FROM THE PROJECT` or `PLACEHOLDER`. Production reads each product's published Open Graph
  image.
- **Inferred fields.** The catalogue screens inferred some disciplines, actions and statuses for
  lower rows. The published EmDash record is authoritative.
- **Type.** Stitch renders display type heavier and wider than Bricolage Grotesque at 500. Several
  new screens render display headings in a serif face instead of Bricolage; production uses
  Bricolage Grotesque. Primary buttons are uppercase and corners reach 4px on some panels.
  Production uses sentence-case actions and 0–2px corners.
- **Loom plate.** The real plate is browser-drawn fibre artwork with a still fallback. The
  references use a quiet placeholder.
- **Residual chrome.** `13-factory.jpg` keeps `DOC-ID: FCT-094` in its breadcrumb. `11-architecture.jpg`
  keeps a collided boundary label in its plate. Neither is a content claim, but neither should be
  copied.

## What was not generated

- Agent Reception, Dean, Contact and Doctrine (the remaining four pages of prompt 11).
- Tablet, laptop and large-desktop compositions for the responsive matrix (prompt 13); only the
  390px projects catalogue was generated.
- The working-loom and shipping-press plates (prompts 16 and 16B), which are gated behind the
  #158/#90 first-frame comparison and were deliberately not commissioned here.
- EmDash-owned authoring surfaces beyond the three extension panels.
- A public Storybook, and any runtime Stitch dependency.

These remain manual Stitch work. Paste prompts 11, 13 and 16 directly into the same project.

## What the mockups changed in production

The reference screens are not a checklist to reproduce literally. The accepted compositions
changed the production system where they were materially better:

| Reference | Applied in production | Not copied |
| --- | --- | --- |
| 01 / 08 Homepage | No structural change. The production hero already leads with the `h1`, plain action and loom plate before the decorative artwork on phones. | Stitch's uppercase buttons, plaque chrome and placeholder loom. |
| 02 Projects catalogue | The catalogue row now uses the reference's tighter plate/record split, a slim source caption and a legible reviewed date. The first row is eager. | Invented disciplines and status labels; abstract placeholder artwork. |
| 03 Bubbles record | "Other work in view" is now a text register (name, discipline, hook, action) instead of three more full artwork rows. 3 × 110px instead of 3 × 387px. | The generated schematic and the invented art plate. |
| 04 Field note | No structural change. Production already has the wide title, narrow measure and evidence rail. | Any generated plate labels. |
| 05 Analytics | The real 98% / 63,419 / 1,134 copy and singular "1 click" are correct in production; the phone rail opens on the selected project. | Every piece of invented benchmark, telemetry and ISO chrome. |
| 06 Share | The phone project rail scrolls horizontally with an edge fade and opens on the current project. | Placeholder previews; production uses the approved files. |
| 07 Patch bench | No visual copy. The real exhibit remains the authored HTML/CSS/canvas experience. | The flat generated bench. |
| 09–18 | No production change. These are design references only; the live routes remain authoritative. | Every generated state label, placeholder and correction artefact. |

This is the intended relationship: the mockups propose composition and hierarchy; the production
route keeps its real content, artwork, accessibility and evidence.

## Prompt 15, executed as an audit

Prompt 15 asks for comparison and removal, not a new page. It was executed twice: as a
source-checked audit of every generated screen's HTML, and as the closing record screen
(`18-design-references.jpg`). The audit is the stronger artefact — a screenshot can hide a wrong
number in a favicon-sized label, and the HTML cannot.

## Signature artwork

The homepage loom is the incumbent under
[issue #158](https://github.com/loftwah/woodhouse-new/issues/158) and #90. It is a real WebGL2
sculpture, but it reads as an abstract fibre lens rather than a working object. The next design
pass is **Prompt 16 — the working loom**, with Prompt 16B (the shipping press) as a materially
different comparison. Do not commission a replacement from Stitch until #158's first-frame comparison
and the phone/short-landscape stills have been reviewed; the incumbent is the baseline, not a
failure to erase.

## Continuing safely

1. Open the project in Stitch and confirm the design system is `Woodhouse`.
2. Paste one prompt at a time. Supply real content, verbatim sentences and exact numbers; do not ask
   the model to fill gaps.
3. Compare the result with the live route and the inventory before accepting it.
4. Budget one correction pass. Name the exact strings to delete and the words to avoid.
5. Audit the generated HTML for banned tokens and percentages, not only the screenshot.
6. Record the new screen ID, its superseded predecessors and its review outcome in this file.
7. Never treat a Stitch screen as production verification.

## Downloads

The JPEGs in `screens/` were downloaded from the Stitch file service after generation. They are
design references, not screenshots of the live site. Production screenshots and before/after
evidence belong under the ignored `.release/` directory.
