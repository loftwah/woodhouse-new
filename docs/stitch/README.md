# Woodhouse Stitch project

Reviewed 6 November 2026. This records what was actually generated in Google Stitch, what was
rejected, and what a future pass must correct. Stitch is a design workspace; it is not evidence that
a screen works, that the content is true or that the production site has changed.

The remaining Stitch work is parked in [issue #170](https://github.com/loftwah/woodhouse-new/issues/170)
after the service hit its daily generation limit. Production repairs and the Storybook workshop did
not depend on it and are already shipped.

## Project

- **Project:** `Woodhouse — The Loftwah Software Factory`
- **ID:** `projects/2818325185592691947`
- **Design system:** `Woodhouse` — `assets/df1fd6e3ef6c4118997c3e26fee441db`
  (Stitch generated this from the first prompt; it approximates the production tokens rather than
  reproducing them exactly. The canonical tokens are in [`DESIGN-FOUNDATION.md`](DESIGN-FOUNDATION.md)
  and `src/styles/global.css`.)
- **Device:** desktop project with a separate 390px mobile screen.

## Screens generated

| File | Screen | Stitch ID | Notes |
| --- | --- | --- | --- |
| `01-homepage.jpg` | Homepage, corrected pass | `867a44fcfa664559ad8e3637db7a58ac` | Accurate project content after two corrections. The loom plate is a labelled placeholder, not the real artwork. Buttons are uppercase and Stitch's type weights differ from production. |
| `02-projects.jpg` | Projects catalogue | `70d71a81fbd840d2ae8634545d408989` | Accurate names and hooks. Disciplines/actions for the lower rows were inferred by the model; production's published fields are authoritative. Artwork is abstract placeholder. State labels are too low contrast. |
| `03-project-bubbles.jpg` | Bubbles project record | `e476b48600524396a7548b5b5ad73209` | Uses the supplied copy. Placeholder artwork. Review before using any spacing or copy treatment. |
| `04-field-note.jpg` | Field-note article | `c4a9cc36b55e47f6901ea58af787e4f7` | Uses the supplied argument and evidence rail. Check the plate's labels against the real article. |
| `05-analytics.jpg` | Analytics workbench | `4c8e4eea61114476a69251f6369e868f` | **Not accepted as-is.** See "Known inaccuracies". |
| `06-share.jpg` | Share gallery | `7ce2bb923a7b437e8f6f9993f4f20eb9` | Uses the real asset descriptions. Placeholder previews; production uses the approved files. |
| `07-patch-bench.jpg` | Patch bench exhibit | `13595482b46a47179b65209d1c659196` | Direction only. The real exhibit is HTML/CSS/canvas with one audio context; this is a flat reference. |
| `08-mobile-home.jpg` | Homepage, 390px | `b43b458af66846e88841b2cb8f701bf4` | Reading order is correct: `h1` and actions before the plate. Loom is a placeholder. |

## Rejected first pass

The first homepage screen (`projects/2818325185592691947/screens/b2da9ff5a1b14673a16af825a66bc394`)
is retained in the project by the service but must not be used. It invented:

- 418 active production deployments, 87 production repositories, 1.82ms latency, 99.98% uptime;
- projects Aether-Daemon, Synapse-Bridge, HyperLoom, Substrate-OS and VectorPulse;
- a fictional "Series A technical audit" offer and a telemetry status bar.

It is a worked example of why generated design is not accepted on appearance. The corrected screens
above use the real content supplied in the prompts.

## Known inaccuracies in the accepted references

- **Analytics (05)** still carries generated technical chrome ("benchmark register", "verified
  telemetry", reference numbers, ISO certification, an invented measurement-boundary box and a
  system-status footer) and a placeholder prior value of 1,158 instead of the real 63,419. The
  correction request hit the daily Stitch generation limit on 6 November 2026. The real figures and
  allowed labels are in [Prompt 06](../STITCH-PROMPT-PACK.md#prompt-06--analytics). Do not copy this
  screen's numbers or chrome; use the production page.
- **Artwork** in every screen is a placeholder. It is never evidence of the product's official
  artwork. Production reads each product's published Open Graph image.
- **Inferred fields.** The catalogue screen inferred some disciplines, actions and statuses for
  lower rows. The published EmDash record is authoritative.
- **Type and buttons.** Stitch uses heavier display weights, uppercase primary buttons and slightly
  rounder corners than production. Production uses Bricolage Grotesque at 500, sentence-case actions
  and 0–2px corners.
- **Loom plate.** The real plate is browser-drawn fibre artwork with a still fallback. The references
  use a quiet placeholder.

## What was not generated

- Leaderboards, listening and measurement-choice screens.
- Architecture/evidence detail, Factory, Connections, Agent Reception, Dean, Contact, Doctrine.
- EmDash-owned authoring surfaces.
- Component/state sheets and a formal responsive matrix.

Those remain manual Stitch work. Use
[`STITCH-PROMPT-PACK.md`](../STITCH-PROMPT-PACK.md) prompts 07, 09, 11, 12, 13, 14 and 15. They are
written to be pasted directly into the same project so the generated design system stays consistent.

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

This is the intended relationship: the mockups propose composition and hierarchy; the production
route keeps its real content, artwork, accessibility and evidence. The remaining ungenerated
families can be inferred from the foundation and these patterns, but the design work in
[issue #170](https://github.com/loftwah/woodhouse-new/issues/170) is still useful if it is picked up.

## Continuing safely

1. Open the project in Stitch and confirm the design system is `Woodhouse`.
2. Paste one prompt at a time. Supply real content; do not ask the model to fill gaps.
3. Compare the result with the live route and the inventory before accepting it.
4. If the model invents a metric, project or certification, reject the screen rather than editing
   around it. The first pass is the reason for this rule.
5. Record the new screen ID and its review outcome in this file.
6. Never treat a Stitch screen as production verification.

## Downloads

The JPEGs in `screens/` were downloaded from the Stitch file service after generation. They are
design references, not screenshots of the live site. Production screenshots and before/after
evidence belong under the ignored `.release/` directory.
