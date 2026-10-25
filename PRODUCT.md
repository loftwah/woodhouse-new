# Product

## Mission

Build the public interface to the Loftwah software factory: an exceptionally designed, evidence-led engineering publication that works as an observatory, technical journal, project portfolio and professional record.

## Audience

Reviewed 18 October 2026. The first reading layer is for ordinary visitors: players, listeners,
builders, potential collaborators and anyone curious about the work. They should be able to find
something to play, hear, try or read, understand why it is interesting, and know what to do next
without learning the factory's internal vocabulary.

Technical readers can still inspect the architecture, evidence and operating method in depth. Those
surfaces stay, clearly labelled, behind the first layer rather than in front of it. A newcomer's
first viewport answers what Woodhouse is, who is behind it and what they can explore.

## Voice

Reviewed 18 October 2026. Use warm, direct Australian English. Concrete verbs, contractions where
they are natural, and sentences a person could comfortably say aloud. Explain what someone can do,
why they might enjoy or benefit from it, and how to start. Technical terms stay where they help a
technical reader; explain a necessary term on first use. Internal identifiers, status vocabulary
and operator words ("dossier", "qualification", "proof boundary", "admitted project") do not belong
in introductory copy.

Keep the distinctive dark Woodhouse design and each project's own identity. Keep a project's
enduring description separate from its dated engineering status: a recent analytics or dependency
update must not redefine what the whole product is. Keep Dean's actual voice; do not invent
personal memories, testimonials or a new persona. Report to MP by leading with the decision and
result, then the evidence that matters, the remaining uncertainty and the next action.

Reviewed 18 October 2026: develop a dedicated article for every project, starting with App Composer
and building the series individually. Each article needs a particular reader, a defensible argument
and a concrete example worth their attention. Explain the product's value and its consequential
tradeoffs; confidence comes from the work shown. Use the existing EmDash dispatches and project
links, retaining historical records and dates. Follow the writing guidance in UNSLOP.md and the
existing discovery programme in #18; a coverage target does not justify thin or repetitive articles.

## Promise

Claims have a source and a review date. Implementation, qualification, production verification and physical proof remain distinct states. A project can be strong in one dimension and unfinished in another.

## First release

The first release publishes the founding essay, project dossiers, engineering incidents, the operating doctrine, architecture and Agent Reception. It uses a dated, reviewed public snapshot because the project repositories are private. It does not claim to provide live project telemetry or expose private issue contents.

EmDash owns editorial drafts, revisions, media and publication, including the reviewed public-safe snapshots, statuses and evidence used by the site. New dispatches use the Woodhouse page layout and a required source reference and review date. GitHub remains authoritative for repository, issue and pull-request state; publishing a CMS entry does not make private repository data public.

## Explicitly out of scope for this release

- A public chat endpoint or a public agent with write permissions. Authenticated EmDash MCP users may create editorial drafts under their assigned role and token scopes.
- Automatic summarisation of private conversations.
- Publishing private GitHub issue, pull request or commit content.
- Invented activity counts, percentages or production claims.
- Claims about physical hardware that has not been physically tested.

## Acceptance

A first-time visitor should understand the name, the factory, the role of agents and the human operator in one viewport. The next scroll should reveal a dated factory record. Project pages should explain why each project matters and what its state does not prove. Pages must be readable on a phone, keyboard-accessible and specific in their search and social metadata.

## Portfolio coordination — reviewed 10 October 2026

Woodhouse owns discovery, reviewed project relationships and evidence about shared capabilities. Each spoke owns its product, identity, source, audio lifecycle and release gates; GitHub remains the canonical work tracker. LoftwahFM owns music/radio generation, programming and its versioned client. Woodhouse makes that capability listenable through FM's official player and links its consumers without operating a radio service, polling games or centralising their releases.

Technical and commercial intelligence should change a concrete decision: compatibility, product quality, audience, positioning or a cheap demand test. Supplied reports and plausible pitches are hypotheses until source-checked; implementation and deployment do not establish demand. Private reports remain private unless explicitly reviewed for publication. Existing issues #16 and #17 own further intelligence and commercial work.

Reviewed 11 October 2026: MP can paste portfolio information and notes without writing an implementation brief. Woodhouse must reconcile the meaningful facts, make justified changes within its existing authority, and carry a changed public portfolio through the established publication path. A research summary alone does not complete an actionable refresh. #18 owns the site/adoption outcome; exact blocked steps and no-change decisions must be stated without stopping independent executable work. The concise operating rule lives in AGENTS.md.

## Shared game music capability — reviewed 16 October 2026

LoftwahFM is the factory's reusable game music library and streaming client.
A game-building agent should consider its existing public catalogue, stations
and typed browser SDK before building music infrastructure. MP intends to
expand the catalogue with music deliberately created for games.

LoftwahFM owns the music/catalogue, radio contract and adapter documentation
(`docs/game-music-hand-off.md`, `docs/radio-game-integration.md`).
Each game retains its own audio settings, sound effects, gameplay and fallback.
Woodhouse keeps the relationship discoverable to factory agents and coordinates
practical reuse through existing project records; it does not operate an audio
server or invent another integration product. App Composer may choose the same
capability for suitable generated games. This is internal readiness and
integration reuse, not an instruction to advertise, launch or commercialise it.

The existing public-safe EmDash capability review remains the publication
source of truth. Installation, actual gameplay integration and verified
listening are different outcomes. Relevant implementation owner: FM #254;
existing game integrations retain their current owning issues.

## Public activity — reviewed 12 October 2026

MP authorised shareable analytics and suitable leaderboards. `/activity/` extends the journal with a separate public aggregate listening view and links to native Bubbles boards. The reviewed portfolio remains dated evidence, not telemetry. Listening is reported audible seconds and playback starts over 30 days; neither is a unique person or game popularity. Missing, stale and partial coverage must stay visible; no synthetic public podium. Accounts, score verification and raw events remain with each project. Woodhouse adds no identity service or collector. #18 owns this discovery surface; consumer work stays with existing spoke issues.

Reviewed 12 October 2026: MP prioritises the four further-along games and LoftwahFM. Sharing must supply a finished image, caption and dated/result link without manual cropping or score transcription. The hub features the supported publisher snapshot image with native download and progressive file sharing; it does not become a game-result validator or shared account system. The existing project brief owns the shopping list; native results and richer reporting remain each project's work.

Reviewed 12 October 2026: `/share/` is the public share desk. The observed failure is requiring MP to hunt across sites for existing promotional assets and captions. Priority projects lead; every published project has an image/post resource where available. Original downloads, editable ready posts, public play/story links, FM's authored formats, factory artwork and published social accounts belong together here. Native download/copy prepares a post; it never posts on MP's behalf. Global navigation, phone index, search and the activity page make the desk discoverable.

Reviewed 12 October 2026: MP rejected the selector-and-reading share desk. `/share/` is now an image gallery: project art, all radio shapes, factory/story cards and SVG assets stay visible together. Direct image copy, original download and ready-post copy belong beside each image. Finding an asset must not require choosing a project, expanding an artwork list or reading a dossier. Existing query links still identify their public project; all gallery resources remain visible.

Reviewed 12 October 2026: the SHOALSHOT gallery kit follows its later generated-art release: current social artwork, transparent wordmark and emblem replace historical SVG branding. Originals remain WebP downloads; image copying produces a PNG without requiring MP to convert a file.

Reviewed 12 October 2026: MP rejected an OG-only interpretation of the gallery. Actual gameplay screenshots, finished promotional films and social variants, native result-card examples, character/game artwork and public album covers belong here alongside link previews. Current interfaces lead; archival footage remains visibly dated. Media previews and original downloads are immediately available, images have clipboard/caption actions, clips have native playback and downloads, and image packs remove file-by-file hunting. Private captures and unfinished or rejected creative candidates are excluded; no project-specific account is invented.

Reviewed 12 October 2026: MP rejected the unbounded single-page media dump after the assets were collected. The share gallery must now browse by project and asset type, with six previews per page and native previous/next links at both ends. The overview shows the priority projects together. This replaces the earlier requirement to render every asset in one page; all approved assets remain reachable, directly copyable and downloadable, with no reading prerequisite or mandatory setup.

## Reading the analytics — reviewed 23 October 2026

MP rejected the long, text-heavy analytics page after using it. `/activity/` now
opens on a compact project table with actual daily trend charts. The visitor can
open a project's chart, inspect a paged daily table, or reach image downloads and
a ready caption from the Share view. Project, measure, inclusive UTC dates and
saved-report identity travel between these task views.

Stories remain available from their own view; coverage, definitions, collection
boundaries and release context live in labelled native disclosures under Notes.
A short coverage label stays beside each number. Missing days stay gaps, a
measured zero stays zero, and unlike product measures are never summed or ranked.
The charts, table, caption and three image formats describe the same report.

## Portfolio analytics — reviewed 15 October 2026

The hourly aggregate snapshots also run `woodhouse.weekly-analysis/1`. This first analysis reports substantial movement between the latest two complete adjacent UTC weeks, with exact coverage, a 25% threshold and minimum baseline/change volumes. A fall to zero remains visible. Findings explain what to investigate; they never assert a release caused a change. No finding is evidence of stability when history is insufficient. Acquisition, cross-visit retention for tab-only sources and automated release/error correlation remain programme work under #34.

MP's #34 mission extends activity to Woodhouse, App Composer, Fighter, SHOALSHOT, Protocol 11, LoftwahFM and Bubbles. Woodhouse owns public reporting and coordination; products retain their own gameplay, saves, identities and release gates. The earlier no-collector scope is superseded only for the bounded anonymous event sink needed by this site and the static game integrations. Existing project-owned D1 reports are reused. No new SaaS, account service, database or paid commitment.

`/activity/` reports 7/30/90-day product windows, explicit collection coverage and unavailable metrics. Radio remains separate at `/activity/listening/`. A saved report freezes aggregate figures for its permalink, caption and three PNG compositions. Exact received events do not establish unique people; returning audiences remain unavailable for tab-only sources. Complete-week records require exact daily history and comparable complete periods, and never manufacture history. Physical iPhone sharing still needs MP's hardware observation.

Reviewed 16 October 2026: Woodhouse adds a separate, default-off choice for recognising returning browsers on its own origin, using the existing event pipeline. Anonymous reporting and product use do not require it. Counts are distinct opt-in browser identifiers over retained history, including returns in different tab sessions on the same day; they are partial observations, not unique people or cohort retention. Cross-product identity remains prohibited. Protocol 11 and SHOALSHOT remain tab-only until their own reviewed consumer releases adopt this optional contract. Old history cannot be reconstructed and expired identity windows remain unavailable.

## Public reuse demonstrations — reviewed 18 October 2026

MP authorised the practical public game-music demonstration and the ownership-first composition story. Factory and the corresponding project pages should let a builder try the connection and reach the existing provider's recipe. Public streaming proof does not wait for speculative commercial packaging; it makes no redistribution, licensing, customer adoption or demand claim. App Composer’s working photo pair demonstrates composition and source ownership; WordPress migration claims still require the separate owning programme’s evidence.

## Home signature — reviewed 23 October 2026

Home's first impression is one artwork the site owns: a lens of tensioned fibres, twisted, lit once and drawn live by the browser. It exists because the portfolio's opening said what the factory is without showing what it can make.

The work is a demonstration, not a product claim. It does not report traffic, prove a technology choice, or adopt anything from another project. A visitor can brush through it; the page's heading, links and actions stay ordinary HTML and work before the artwork loads. What it does not claim: that the reference techniques are original to someone else's implementation (they are not), that the fibres are simulated material, or that the effect stands in for a product.

The patch bench and source plate remain the site's working exhibits with their own routes. Home links to both; the bench is no longer embedded there, because the signature now owns that focal position.

## Working exhibits — reviewed 20 October 2026

An exhibit is a working artifact hosted on this site, not an illustration of one. Two exist under `/exhibits/`.

**The patch bench** is the first. A playable run, the sound effects it owns and a real LoftwahFM station are wired the way a game actually wires them, and the visitor can pull them apart: isolate a layer, disconnect the music, watch the soundtrack stop while the run and its effects carry on, and reconnect on the same client without a second audio engine or a lost run. It is the same demonstration the plain `/lab/game-music.html` page has always made, with the parts left visible.

**The source plate** is the second and deliberately different. It reads the published Here / there contract and shows a contribution beside the card composed from it. Change the source and the composed card changes with it, because the composition reads the contract rather than keeping a copy. Hiding the source removes the card, as the contract says it would. The switch changes the demonstration only; nothing is sent to the provider and no contribution is hidden.

The exhibits are discovered from Home, from Factory and from the game-music dispatch, which carries a "Show me" control so a reader can stop at the decisive moment and change the condition being explained. Each states what it does not claim: no customer adopted this, no audio is bundled or relicensed, and a simulation says it is one. MP's acceptance of the visual direction and of each exhibit remains separate from technical verification.

## Connected product stories — reviewed 23 October 2026

The Factory, homepage, project pages and Analytics lead into `/connections/`.
Visitors can inspect a completed Link Check story or hear how FM music travels
into games, read the source-defined daily history, open the native tool/report,
and share the selected frozen observation. The initial pair uses existing public
aggregates. Composer's separately linked owner-permitted report demonstrates
recorded Open actions using explicitly fictional traffic; it does not establish
customer adoption or join those actions to the Link Check inspection history.
Missing, measured zero, bounded and partial coverage retain their meanings. An
FM total includes all admitted sources; a separate game attribution figure never
inherits that total. No person-level funnel or invented milestone is implied.

## Portfolio editions — reviewed 23 October 2026

`/editions/one-more-round/` is the first current audience edition. Its existing
EmDash portfolio dispatch owns the editorial text, date and fixed report link.
The edition opens with different games to try, then music and a useful builder
connection. Six source-specific stories share the existing daily-history and
frozen export path. A closed reporting week does not make partial collection
complete or earn a record. Historical dispatches and report bodies stay intact.

The edition also exposes prospective Woodhouse-only story observations: arrivals,
ten active foreground seconds and deliberate native openings as separate counts.
They establish neither a shared-post referral, an ordered funnel, downstream use
nor unique people. Measurement exclusions and privacy choices still dominate.

## What we built — the dated portfolio edition, reviewed 25 October 2026

`/editions/what-we-built/` presents a dated selection across the published portfolio.
The existing EmDash dispatch collection owns its title, deck, lead, lesson and
source-checked project stories through the `portfolio_entry` block. The Astro
renderer supplies the magazine composition; it does not own the editorial copy.

The story text remains dated. Names, artwork and destinations are current public
project records, so a withdrawn project is withheld rather than leaving a dead
link. The page states that distinction and reports how many selected entries are
currently public. The cover carries a review date and no project count. This
corrects the first release's contrary rendered count and its inaccurate receipt.

The second-edition rehearsal uses a real local EmDash draft and signed preview.
Production stays in read-only publication mode. Preparing and reviewing a local
draft does not establish that the production admin, scheduling or authoring works.
Future publication still uses the reviewed seed delivery and guarded release path;
the exact local procedure and rehearsal live in EMDASH.md.
