# Woodhouse Stitch prompt pack

Reviewed 7 November 2026. Copy each prompt into the Woodhouse Stitch project
(`projects/2818325185592691947`) in order. The project's design system is `Woodhouse`; use it for
every screen so the foundational tokens stay consistent.

The first generation pass invented metrics, projects and statuses. It was rejected. The rules below
exist because that happened: **do not invent**. Read
[`stitch/README.md`](stitch/README.md) for the review record and the screens already generated.

Status after the 7 November 2026 pass: prompts 00–08 are generated; 06 was corrected twice and is
accepted. Prompt 07 (both screens), 09 (both), 12, 14 and 15 are generated and recorded. Prompt 11
produced Factory and Connections only; prompt 13 produced the 390px projects catalogue only. The
rest of 11 and 13, and prompts 16/16B, remain manual. Every new screen needed at least one
correction for invented chrome — see the finding in `stitch/README.md` before generating.

## Non-negotiable content rules for every prompt

- Use only the copy and data in the prompt. Do not add projects, metrics, testimonials, logos,
  deployment claims, reader counts or capabilities.
- Sentence case for headings and body. Uppercase only for tiny mono labels.
- Ink `#080D19`; raised `#111A2C` and `#17233A`; acid lime `#E9FF49` for the identity and one
  primary action; cyan `#79D8FF` links; cobalt `#647DFF` connected products; coral `#FF746A`
  boundaries. A colour never carries a state without a text label.
- Bricolage Grotesque display; humanist sans body; mono for identifiers, dates and labels.
- 0–2px corners. 1px rules. No glass, no decorative gradients, no glow, no card-grid soup.
- Product artwork is the product's own published image. Woodhouse campaign art is labelled as
  Woodhouse art. If you cannot show the real image, show a quiet labelled placeholder, not a
  plausible invention.
- Every number must belong to the screen's supplied context. Missing stays missing; a reported
  zero stays zero; different units are never added into one total.
- Phones are composed, not squeezed: author the reading order and keep 44px targets.

### Banned chrome — added 7 November 2026

Stitch adds an invented instrument layer to thin editorial pages even when told not to invent. Ban
it by name in the prompt, then name the literal strings to delete in one correction pass:

- no status footer (`SYSTEM STATUS: ONLINE`, `ALL SYSTEMS NOMINAL`, `AUTONOMOUS BUILD RIG`), no
  rig, revision or build id;
- no document, plate, figure or register ids (`DOC-ID`, `REF-048`, `REGISTER REF`, `SEC 01`,
  `PLATE 01`, `FIG 1.0`, `SPEC-REF`);
- no percentage, score, ratio, uptime, latency or "integrity" figure that the prompt did not supply;
- no internal codenames used as instrument labels (`CODES ENVIRONMENT`, `ARTIFACT CAPTURE`,
  `EDITORIAL REGISTER`);
- no second footer link set (`Archive 2024`, `Telemetry logs`, `Index register`, `Spec sheets`,
  `Security compliance`).

Verify by downloading the generated HTML and searching it, not by reading the screenshot.

---

## Prompt 00 — Master design foundation

Design a foundation sheet for **Woodhouse**, the public journal, observatory and portfolio of the
Loftwah Software Factory. It is a confident engineering publication, not a SaaS dashboard and not a
generated portfolio template.

Show:

- The wordmark `WOODHOUSE` and descriptor `The Loftwah Software Factory`, with the seal mark.
- The type scale: display 96/80/56px Bricolage Grotesque at 500 weight with tight tracking; title
  40/28px; body 20/16/14px humanist sans; mono labels 12/10px.
- The semantic palette with text labels: Ink `#080D19`, Raised `#111A2C`, Soft `#17233A`, Acid
  `#E9FF49`, Cyan `#79D8FF`, Cobalt `#647DFF`, Coral `#FF746A`, Copy `#DCE6F5`, Copy soft `#A9B8D0`.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px.
- One primary acid button, one text link, one status stamp, one horizontal rule, one open ledger row.
- The rules: dark on every device, no theme switch; colour never carries a state alone; every claim
  has a source and a review date; implementation, deployment and use are different states.

Do not add marketing copy, invented metrics or extra components. The sheet is a reference, not a
landing page.

## Prompt 01 — Homepage and discovery

Design the Woodhouse homepage.

Header: `WOODHOUSE` / `The Loftwah Software Factory`; nav Projects, Stories, Analytics,
Leaderboards, Share, About; search.

Hero eyebrow: `THE LOFTWAH SOFTWARE FACTORY`.
Headline: `A software factory.` then `Judged by what ships.` with the second sentence in acid lime.
Paragraph: `I'm Dean. I run a small software factory with the coding agents I direct: 12 real
projects, brought together here. There are games you can play right now, a music service you can
listen to, a couple of tools and a few experiments.`
Actions: primary `Find your next round`, text links `About Dean` and `Explore the new artwork`.
Right: a wide near-black plate for the live loom artwork, labelled `The loom — live browser
artwork`, caption `640 tensioned fibres, one raking light, drawn by the browser. Move across the
plate and brush through them.`, control `Freeze motion`. Do not draw a fake fibre image.

Then `Start here. Three ways in. All of them real.` with three open rows:

- Bubbles — `The classic bubble shooter, in your browser.` — Play
- LoftwahFM — `Music, radio stations and original shows.` — Listen
- App Composer — `Make software. Keep it yours.` — Try

Then `What we built` with `Portfolio edition · 25 October 2026` and `Ten projects in one dated
edit: what shipped, what is getting better, and what is still being built.` Use the real project
register from Prompt 02 if space allows.

Footer: `What has shipped. What still needs work.` / `The Loftwah Software Factory · Reviewed 6
November 2026`.

## Prompt 02 — Portfolio catalogue

Design `/projects/`, the full project ledger.

Header and nav as the site.
Breadcrumb `WOODHOUSE / PROJECTS`.
Headline `Explore the projects.`
Aside: `12 projects · newest review 6 November 2026` and `Each row starts with what the product is
and how you can use it today. The dated status, the artwork source and the limits of each claim sit
further in, on the project's own page.`
Edition bar: `One more round.` / `Find your next game, hear the music and take a story with you` /
separate `See recorded discovery`.
Filters: Everything (current), Play a game, Listen, Build something, Explore experiments. Count
`All 12 projects`.

Open ledger rows, separated by 1px rules. Each row: product artwork panel labelled with the source
domain and `ARTWORK FROM THE PROJECT`; name; discipline; hook; state label; review date; primary
product action; `See how it works`.

Use exactly these rows:

| Name | Discipline | Hook | State | Reviewed | Action |
| --- | --- | --- | --- | --- | --- |
| Bubbles | Game systems · deterministic play | The classic bubble shooter, in your browser. | Replay-checked competition, rebuilt presentation. | 19 October 2026 | Play Bubbles |
| Fighter | Game systems · authored journeys | Collect fighters. Build a squad. Pick your fight. | Fight activity and optional browser returns are live | 16 October 2026 | Play Fighter |
| SHOALSHOT | Game systems · mobile-first presentation | Read the tide. Place the shot. | Card artwork in, save repair shipped, release acceptance open. | 19 October 2026 | Play SHOALSHOT |
| Protocol 11 | Game systems · responsive table play | A card game where the table changes every round. | The refusal answers; three films delivered. | 19 October 2026 | Play Protocol 11 |
| MAX | Assistive hardware · autonomy stack | Your walker, made smarter. | Software prototype · physical proof open | 7 October 2026 | Explore MAX |
| Pirates | Game preservation · evidence recovery | Rebuilding a lost game from its own evidence. | Source-backed playable slice · parity gates still closed. | 19 October 2026 | Play the slice |
| LoftwahFM | Audio streaming · companion broadcasting | Music, radio stations and original shows. | A radio player with recognisable listening companions | 25 October 2026 | Listen to LoftwahFM |
| Plans With You | Calendar tools · intentional social rhythm | Plans cancelled. Time kept. | Waitlist open · paid membership closed | 25 October 2026 | Join the waitlist |
| Asset Hunter | Creative toolchains · modular packaging | A field guide to what can be made. | Portable packs implemented · independent use unproven | 12 October 2026 | Open Asset Hunter |
| App Composer | Software composition · sovereign creators | Make software. Keep it yours. | Creator controls and working public examples | 25 October 2026 | Try App Composer |
| Foilbury | Digital collecting · physical-grade cards | A cabinet of collectible cards. | Public card cabinet | 6 November 2026 | Open the cabinet |
| Liferaft | Personal archives · forensic search | Find your way back into an email archive. | Desktop release available | 6 November 2026 | Get the desktop app |

Footer as the site. Do not add metrics, scores or popularity.

## Prompt 03 — Individual project records

Design the Bubbles project record.

Header, nav, breadcrumb `WOODHOUSE / PROJECTS / BUBBLES`.
Kicker `Game systems · deterministic play`. H1 `Bubbles`. Lime line `The classic bubble shooter, in
your browser.`
Intro: `Bubbles is an arcade bubble shooter you play in the browser or on your phone: line up a
shot, match three or more and clear the board. It's for anyone who wants a quick round that feels
good on a small screen.`
Actions: primary `Play Bubbles`, secondary `See how it works`; line `Playable now in your browser.`
Evidence rail: `REPLAY-CHECKED COMPETITION, REBUILT PRESENTATION.` / `Reviewed 19 October 2026` /
`Public build: A site you can open today` / `Evidence: Operator-reviewed snapshot` / `Record: 01 /
12`.
Large product artwork panel with `Artwork from the bubbles.loftwah.com site` and a source link.
`Take a closer look.` / `New artwork and current product captures, with original downloads.` /
`Explore the Bubbles gallery`.
`Bubbles: a better second attempt.` / `One board, no shot limit. Fewest Shots gives the familiar
bubble shooter a different reason to try again: improve the clear, rather than chase a bigger
score.` / `Read this field note`.
`Why you might care` with the two paragraphs from the live page.
Lime callout: `FAILURES SHOW UP SOMEWHERE` / `A second attempt only counts when the second one is
better. The record shows what changed and what still needs work.`
`Where the work stands` with the live paragraph about Classic and Fewest Shots.
Right rail: `What changed` / `A useful personal challenge starts with a goal a player can understand
and a second attempt they can improve.` and `Proof boundary` / `Reviewed 2026-10-19. This is an
edited public record, not a private source transcript.`
`Other work in view` with Fighter, SHOALSHOT and Protocol 11 and their real hooks.

## Prompt 04 — Editorial reading

Design a field-note article page.

Header, nav, breadcrumb `WOODHOUSE / STORIES / FIELD NOTE`.
Title `Bubbles: a better second attempt.`
Meta `Field note · Reviewed 23 October 2026`.
Deck `One board, no shot limit. Fewest Shots gives the familiar bubble shooter a different reason to
try again: improve the clear, rather than chase a bigger score.`
Rule, then a narrow evidence rail: `EVIDENCE REVIEWED 2026-10-23`, `Filed under: Field note`,
`Source state: Editor-reviewed public summary`.
Body at 65–75 characters:

`Bubbles gives the same aiming problem two different goals. In Classic, a large drop can be worth
more than a quick clear. In Fewest Shots, clearing the board in fewer shots is the point. That
changes which move is worth taking.`

Subhead `Start with one decision.` Then the two live paragraphs about the browser shooter and
Fewest Shots.

Pull quote `A useful second attempt starts with a goal a player can understand.`
A technical plate labelled `The two goals on the same board` comparing Classic and Fewest Shots,
with a readable caption, cyan and lime paths on ink, and a text transcript disclosure.
Right rail: `WHAT CHANGED` and `PROOF BOUNDARY`.
End with `Read next` and three story links: `What we built`, `A journal you can change`,
`Building a better second attempt`.
Footer as the site.

## Prompt 05 — Portfolio editions

Design the `One more round` portfolio edition at `/editions/one-more-round/`.

Header and nav.
Kicker `PORTFOLIO EDITION · 25 OCTOBER 2026`. H1 `One more round.` Deck `Ten projects in one dated
edit: what shipped, what is getting better, and what is still being built. Four of them you can open
right now.`
A short introduction that states the edition is a dated editorial summary, not live telemetry.
Section navigation: The round, What shipped, What is getting better, What is still being built,
Discovery, Take a round with you.
Project entries are open editorial rows with the product's own artwork, a short argument and a real
action. Use real project names and hooks from Prompt 02. Do not assign scores or rankings.
A distribution section: `See recorded discovery` with the actual sources and dates, no invented
reader numbers.
`Take a round with you.` with a film, campaign artwork and frozen report images. Each asset has a
caption and a useful way back. State that frozen report cards retain their 12–18 October 2026 UTC
source limits.
Footer as the site.

## Prompt 06 — Analytics

Executed 7 November 2026 and accepted as `446563288c1549bbb56b520ca8436857`
(`screens/05-analytics.jpg`). Two correction passes were needed: the first fixed the figures and
removed the benchmark/ISO chrome but kept `CADENCE: 7-DAY INTERVAL`, a `REGISTER REFS` rail label and
an invented reading-notes panel; the second removed them.

Design `/activity/`, the analytics research workbench.

Header and nav. Left rail 190px: `All projects 7` selected, then Woodhouse, App Composer, Fighter,
SHOALSHOT, Protocol 11, LoftwahFM, Bubbles with small source dots. Rail foot: How measurement works,
Games x Radio, Explore connected products, Edition discovery, Engineering leaderboards, Explore the
projects.
Heading `Analytics`, line `What people play, hear and use · Engineering leaderboards`.
Controls: 7d, 30d (selected), 90d, Custom dates, `Share report`.
Tabs: Overview (current), Data, Share, Stories, Notes.
Date line `8 Oct 2026 – 6 Nov 2026 · UTC`; `7 of 7 projects have numbers · Today is still being
counted`.

`What changed` with two cards:

1. `WOODHOUSE · VISITS` — `Woodhouse's visits fell 98% to 1,134, from 63,419 the week before.`
   Comparison bars `Week before 63,419` and `This week 1,134` on one scale. `Compared with the week
   before (19 Oct 2026–25 Oct 2026).` `What this doesn't show: Why it changed, whether this week is
   typical, or how many people were involved.` `Open this week`.
2. `PROJECT DISCOVERY · APP COMPOSER` — `App Composer was the project readers opened most from
   Woodhouse: 11 clicks.` `11 clicks in the last seven days. There is no earlier counted week to
   compare.` `What this doesn't show: That anyone played, tried or kept using it. This counts clicks
   on Woodhouse, not what happened next.` `Open this discovery story`.

`Project overview` — `Each project's own measure · same UTC dates`; measure select `Project
overview`; table:

| Project | Measure | Value | Note |
| --- | --- | --- | --- |
| Fighter | Game starts | 4 | Includes old test data |
| Bubbles | Game starts | 0 | Some days missing |
| Protocol 11 | Game starts | 3 | Some days missing |
| SHOALSHOT | Game starts | 4 | Some days missing |
| LoftwahFM | Audible listening | 23.4h | Includes old test data |
| App Composer | Mini-app opens | 3,233 | Count may be capped |
| Woodhouse | Visits | 65,519 | Some days missing |

One small sparkline per row. No combined total. Note: `Open a project to explore its chart. Each
project counts something different, so the totals are not added together. These are recorded
actions, not a count of people.` Actions: View daily table, Download CSV, Data notes & definitions.
Interpretation rail beside the content. No invented chrome, no "verified telemetry", no ISO
certification, no extra status register.

## Prompt 07 — Leaderboards and listening

Design `/activity/leaderboards/` and `/activity/listening/` as two related screens.

Leaderboards: heading `Engineering leaderboards`, line explaining these are GitHub-derived public
activity boards, not a measure of product quality. Show the columns the product actually collects
(repository, merged work, review activity, window, coverage, source) with real source labels. A
coverage note and a link to the method. No synthetic podium, no invented people.
Listening: heading `Scores & listening`, line `Find public Bubbles leaderboards and follow reported
game listening across LoftwahFM. Real sources, clear coverage.` Two columns: `Reported listening`
(audible seconds and playback starts, 30-day window) and `Native game boards` (link out to Bubbles).
State that audible seconds and playback starts are not unique people and are not comparable across
products. Missing and partial coverage stay visible.
Both screens carry the site header, the analytics rail, UTC context and the same one-measure rule.

## Prompt 08 — Share gallery

Design `/share/`.

Header and nav. H1 `Made to be played. Heard. Tried.` Line `Browse the archive` and a separate link
to project editions.
Project rail: All work (current), Fighter, SHOALSHOT, Protocol 11, Bubbles, LoftwahFM, App Composer,
Woodhouse, Plans With You, Asset Hunter, MAX, Pirates, Foilbury, Liferaft. Type rail: Images
(current), Clips, Edition, All.
Six previews per page, media-first. Each has a type label, a short caption, `Copy image`,
`Download`, and a `View` affordance. Use the real published asset descriptions:

- SHOALSHOT — `Below the surface.` Lantern Ray on deep teal, portrait.
- Bubbles — `Make the next shot.` A real gameplay board with symbol bubbles and aiming line, landscape.
- Fighter — `Your first fight.` Yellow fight-night poster with Viking and Grim Reaper, portrait.
- App Composer — `A PDF. Your mark.` Paper-and-pinboard campaign still, portrait.
- Protocol 11 — `Your next move.` Deep green table with cards and tokens, landscape.
- LoftwahFM — `Find your frequency.` Record-shop arrangement of three covers, square.
Pagination `Page 1 of 8`, Previous disabled, Next. Note: `Every image is the approved published
asset. Copy prepares a post; it never posts for you. Originals download at full size.`
`In motion` with one film still and caption. `Keep exploring` with Stories, Analytics, Exhibits.
No invented scores, testimonials or claims.

## Prompt 09 — Architecture and evidence

Design `/architecture/` and `/evidence/[slug]/` as a technical reading family.

Architecture: heading `How Woodhouse works`, intro that the projects are independent and Woodhouse
holds the public record. A technical plate showing work → evidence → edited record → publication,
with labelled boundaries and a phone composition. A text transcript in a native disclosure. Sections
for the public/private boundary, the CMS ownership, GitHub ownership and each project's ownership.
Evidence detail: heading from the record, `Reviewed` date, source type, `What this establishes`,
`What it does not establish`, the source link and the related project. No private transcript.
Use real labels only. Do not draw invented infrastructure, server counts or certification marks.

## Prompt 10 — Working exhibits

Design `/exhibits/`, `/exhibits/patch-bench/` and `/exhibits/source-plate/`.

The exhibit index is an editorial index: `Things you can take apart.` and an explanation that these
are working pieces, not films or screenshots. Two open entries with their own visual languages.
Patch bench: a dark workshop bench in CSS 3D, three lit modules (a playable run, the sound effects it
owns, a real LoftwahFM station) joined by a drawn signal path. Warm lamp pools and bevelled metal are
allowed here because they are the material. Controls outside the canvas: Open the case, Pull the
bench apart, Isolate the game, Disconnect the music, Reconnect the music, Mute. Status beside the
control: `Music connected — LoftwahFM: Cartridge Funk` / `Music disconnected — the run is silent;
effects still play.` Caption: `The game owns its sound effects. LoftwahFM owns the music. One audio
context, two buses.`
Source plate: flat, printed, registered. Two plates on a registration table: the contribution that
owns a photo, and the card composed from it through a published contract. Show the contract fields.
What it does not claim: a demonstration is not adoption, a copy is not a licence.

## Prompt 11 — Factory and supporting pages

Design `/factory/`, `/connections/`, `/agents/`, `/dean/`, `/contact/` and `/doctrine/` as one
supporting family.

Factory: `Good ideas. Shared parts.` Working connections, real examples, links to the patch bench
and the connected portfolio.
Connections: a reviewed connection map with labelled edges, provider and consumer, and open rows
with the evidence state. No unverified adoption.
Agent Reception: a human explanation plus a machine-readable endpoint. State clearly what the JSON
contains and what it does not (no private issues, no live telemetry).
Dean: public biography in a reading measure, with real links. No invented memories or testimonials.
Contact: public profiles and an enquiry form with pending, sent and failed states. Do not promise a
reply time.
Doctrine: operating principles in a long-form reading layout with pull quotes and one technical
plate.
All screens share the header, footer, focus ring and phone reading order.

## Prompt 12 — EmDash-owned presentation

Design only Woodhouse-owned editorial extension surfaces:

- The editorial policy refusal shown to an author when a draft lacks a source reference or review
  date. A clear, calm message, the exact missing field, and the action that will satisfy it.
- The enquiries admin list at `/submissions`: received date, status, a short message preview, and a
  route to the detail. No private data beyond what the admin already shows.
- The read-only production boundary: a disabled publish control with an explanation that production
  is read-only, and the route to preview.
Do not redesign EmDash's editor, media library, revisions or navigation. This prompt is about the
small Woodhouse-owned surfaces, not a replacement CMS.

## Prompt 13 — Responsive design

Produce deliberate phone, tablet, laptop and large-desktop compositions for the homepage, projects
catalogue, project record, article, analytics, share gallery, exhibit and 404.

Rules: phone 390px, tablet 768px, laptop 1280px, desktop 1440px, large 1920px. Name the page in the
first viewport. On the homepage the `h1` and actions precede the decorative loom plate. The projects
ledger stacks name, hook, state and review date inside one linked row. The analytics project rail
scrolls horizontally with a visible edge affordance and opens on the current project. Filter rails
scroll rather than overflow the page. No horizontal page overflow. Touch targets at least 44px.
Long titles, missing artwork, empty lists and unavailable media are designed, not left blank.

## Prompt 14 — Interaction and component states

Consolidate the interaction system:

- Primary, secondary, quiet and destructive actions; hover, focus-visible, pressed, disabled.
- Search trigger, open dialog, typed query, results, no match, unavailable index, close and focus
  return.
- Project filters: current, hover, no results (if supported), count.
- Share: pending copy, copied, failed copy with download still available, pending native share,
  cancelled, handed to device.
- Media: loading poster, missing image with a labelled fallback, video without captions, pagination
  start/middle/end.
- Analytics: measure selected, custom dates open/closed, missing series, zero series, partial
  coverage, frozen report, CSV/PNG actions.
- Forms: required field, invalid, pending, sent, failed, retry.
- Status labels: quiet, reporting, attention, stopped, plus a text label in every case.
- Reduced motion and keyboard focus for every control.

Use the real components and exact labels. Do not invent a new icon set or a second design language.

## Prompt 15 — Final design consistency

Compare every generated Woodhouse screen against the foundation and the live site. Remove:

- invented metrics, projects, statuses, certifications or technical chrome;
- uppercase headings and body copy;
- rounded buttons or cards that contradict the 0–2px rule;
- fake artwork presented as product artwork;
- gradients, glow or glass used as decoration;
- a second navigation or filter system;
- any screen that implies a capability the product does not have.

Keep the dark editorial world, the acid-lime identity, the open rows, the dated evidence and each
product's own artwork. State which screens are design references and which production routes are
authoritative. The production site wins every disagreement.

---

## Prompt 16 — Signature artwork: the working loom (recommended)

Design a still hero plate for Woodhouse's homepage. This is an artwork, not a UI card, dashboard or
product screenshot. It must be beautiful at rest and obviously physical.

Subject: **a working loom, large in the frame**, built from dark machined steel and brass. A top warp
beam holds 640 fine tensioned fibres; they run down through heddles to a lower cloth beam, where a
narrow woven band is beginning to emerge. One shuttle sits part-way across the warp. The fibres are
pale blue, cyan and a little acid lime, with a few cobalt and coral threads. The metal is matte and
used, not shiny chrome. One raking lamp from the upper left makes the fibres catch light and throws a
soft shadow behind the frame. Ink `#080D19` ground. No neon, no glow, no HUD, no fake labels.

Composition: the loom fills the plate with a deliberate crop — the frame runs off the top and bottom
edges, so it reads as a real object rather than a border. Leave the left third calmer; the hero
headline and actions sit outside the plate, not on top of it. The plate is the visual rest, not a
place for copy.

Show three states as separate frames:

1. **At rest.** The warp is still, the shuttle paused, the lamp pool steady. A few fibres carry a
   slight wave from the last pass. This is the first-frame still and the reduced-motion composition.
2. **Mid-brush.** A visitor has moved across the warp. The fibres part in a causal wake, the shuttle
   has moved, and the light catches the disturbed threads. Do not draw a cursor, hand or instruction
   inside the artwork.
3. **Settled.** The wake has travelled and the fibres are returning with a little overshoot. The
   shuttle rests at the far side; the woven band shows one more pass.

Caption outside the plate: **“The loom.”** Then: **“640 tensioned fibres, one shuttle and one raking
light. Move across the warp and brush through them; they spring back.”**

Do not add metrics, project logos, sci-fi telemetry, a fake date or a second artwork. The real
production page supplies the headline, actions and links. This plate is the one authored object.

Phone variant: compose a **portrait loom** at 390px. Keep the same materials and one lamp. Crop the
frame so the warp and shuttle are readable at phone size; do not shrink the desktop composition into
a postage stamp. The plate follows the `h1` and primary action in the reading order.

## Prompt 16B — Signature artwork: the shipping press (alternative, only for comparison)

Design one materially different hero plate for the same page, for a bounded comparison under #158.

Subject: **a working proof press / plotter** on a dark ink desk. A brass pen carriage runs on two
machined rails over a sheet of deep ink-black paper. The pen is drawing a single, fresh line — an
editorial mark, not a logo or readable paragraph. One raking lamp from the left; paper grain, a slight
curl at the sheet edge, a shallow tray of type or a spool of thread at the edge of the frame. The
machine is used, precise and quiet. Ink `#080D19` ground; brass, paper and one cyan or lime line.
No neon, no HUD, no invented chart, no readable fake copy.

Show two states: **at rest** (carriage paused, one clean line already drawn) and **mid-draw** (the
carriage has advanced, a fresh line catches the light, paper shadow shifts). The plate must read as a
physical machine that makes a mark, not as a dashboard.

Caption outside: **“The press.”** Then: **“A working plotter drawing the current edition, one line at
a time. Move across the sheet and the carriage follows.”**

This is an alternative, not an instruction to ship two heroes. Compare it with the working loom on
first-frame impact, material credibility, causal interaction, brand fit, phone composition and
measured rendering cost. Keep the incumbent if it wins.
