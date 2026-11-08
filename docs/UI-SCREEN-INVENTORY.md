# Woodhouse UI screen and interaction inventory

Reviewed 6 November 2026 against the route tree in `src/pages`, the production site at
<https://woodhouse.loftwah.com/> and the local development server. This is the working map for the
Stitch design project and the Storybook workshop. It is not a backlog and it does not replace the
owning issues (#18 discovery, #34 analytics, #86 feedback, #141/#142 media, #160 Impeccable).

## How to read this

- **Route** is the public path. Dynamic routes are shown with `[slug]`.
- **Data** names the authoritative source. `EmDash` means the published CMS read model; a page must
  never fall back to private repository content.
- **Stitch** refers to a screen in the Woodhouse Stitch project or a prompt in
  [`STITCH-PROMPT-PACK.md`](STITCH-PROMPT-PACK.md).
- **Workshop** refers to a Storybook story or composition in `src/stories`.
- **Production** is the live destination. A local story or Stitch screen is not evidence that the
  public page behaves that way.

## A. Homepage and discovery

| Screen | Route | Audience and task | Function and data | Components | Desktop / phone | States | Stitch / workshop | Current weakness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Homepage | `/` | First-time visitor: understand the factory and find something to do | Dated portfolio readout, current edition, three product picks, complete register, recent stories, loom signature. EmDash dispatches, projects, capabilities; live product OG artwork | `BaseLayout`, `SiteHeader`, `SiteSearch`, `SignaturePlate`, `EditionInvitation`, `ProjectRow`, `FMListening`, `ProjectNetwork`, `SiteFooter` | Two-column signature hero; phone puts `h1` and actions before the decorative plate | 503 if CMS reads fail; artwork fallback; reduced-motion still; search dialog; empty edition | Stitch 01, 08; `Compositions/Projects ledger`, `Foundations/Signature plate` | First viewport is strong; the page is long and the edition block adds a second entry point before the register |
| Projects catalogue | `/projects/` | Player, listener, builder: choose something real to do | Query `?do=play\|listen\|build\|explore`; counts; complete ledger. EmDash projects; live source OG artwork | `ProjectRow`, `EditionInvitation`, `StatusStamp` | Open ledger rows with a contained product plate and a wider record column; phone stacks identity, state and date inside one linked row | Filter with no matches is not possible today; source-artwork failure swaps to a Woodhouse illustration; 503 on CMS failure | Stitch 02; `Portfolio/Project row` | The first product still sits below the page intro and edition block; the ledger remains long by design |
| Project record | `/projects/[slug]/` | Evaluate one product: what it is, whether it works, what it proves | Product artwork, hook, state, review date, evidence links, capability record, film, related story, other work. EmDash project/status/snapshot/evidence | `ProjectRow`, `StatusStamp`, `CapabilityRecord`, `GameMedia`, `EditorialBlocks`, `D2Diagram` | Artwork full width; evidence rail moves above or below the prose; phone keeps the primary action visible | Unknown slug → 404; source image failure; unavailable film; private evidence excluded | Stitch 03; `Portfolio/Project row` | Long dossier; the "Take a closer look" plate is an unlabelled image link until it loads |
| Header and navigation | every page | Find the next destination or search | CMS primary and house-index menus normalised; ⌘K / Ctrl+K; phone Menu | `SiteHeader`, `BrandMark`, `SiteSearch` | One-line desktop nav + search + More; phone wordmark + Menu | Current page labelled; search no-match and unavailable states; keyboard focus | Stitch 01; `Navigation/Site header`, `Navigation/Site search` | "More" and the phone Menu carry slightly different labels for the same destinations |
| Search dialog | any page | Search titles, descriptions and public body text | Published search projection; destination shortcuts | `SiteSearch` | Modal on both; results grouped by section | No match, unavailable index, Escape, focus return | `Navigation/Site search` | No recent searches; no result count |
| Footer | every page | Recover navigation and the review date | CMS footer menu; newest project review date | `SiteFooter` | Two bands; phone stacks | Missing review date hides the label | `Navigation/Site footer` | Dense on phones when many footer links exist |

## B. Project portfolio

| Screen | Route | Audience and task | Function and data | Components | Desktop / phone | States | Stitch / workshop | Current weakness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Featured picks | `/` section | A quick, opinionated way in | Deliberate Bubbles / LoftwahFM / App Composer selection, not the whole catalogue; live OG artwork and real action | `ProjectRow` (compact) | Three open rows | Missing project omits the row; artwork fallback | Stitch 01; `Portfolio/Project row` | Picks can drift if a product is withdrawn |
| Project status and evidence | `/statuses/[slug]/`, `/snapshots/[slug]/`, `/evidence/[slug]/` | Inspect one dated claim | Reviewed snapshot, status record, evidence boundary and source. EmDash | `StatusStamp`, `EditorialBlocks`, `D2Diagram` | Reading column + evidence rail | Unknown or unpublished record → 404; no private source | Stitch 03/09 | Cross-links depend on editors choosing the same review date |
| Related work | project and editorial pages | Continue exploring | Published relationships only | `ProjectRow`, `ProjectReferenceBlock` | Ledger rows | Withdrawn project withheld | Stitch 03; `Editorial/Project reference` | Can repeat the same three products across pages |

## C. Editorial publication

| Screen | Route | Audience and task | Function and data | Components | Desktop / phone | States | Stitch / workshop | Current weakness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Stories index | `/dispatches/` | Reader: find the writing worth their time | Current edition callout, dispatch ledger, kind, review date. EmDash dispatches | `EditionInvitation`, ledger markup | Two-column title + aside; single column phone | Empty archive; CMS failure notice; private drafts excluded | Stitch 04; `Compositions/Article reading` | The edition block competes with the dispatch ledger for the first action |
| Dispatch article | `/dispatches/[slug]/` | Read one argument and inspect its evidence | Portable Text blocks, plates, quotes, callouts, source reference, related links. EmDash | `EditorialBlocks`, `Prose`, `PullQuote`, `Callout`, `TechnicalPlateBlock`, `DiagramPlateBlock`, `ImagePlateBlock`, `EvidenceLinkBlock` | Wide title, narrow measure, evidence rail; phone stacks rail before or after prose | Unknown slug → 404; missing image; diagram transcript; long titles; code wrap | Stitch 04; `Editorial/*`, `Compositions/Article reading` | Article header consumes most of the first viewport on desktop |
| Incidents index and detail | `/incidents/`, `/incidents/[slug]/` | Learn what failed and which control changed | Dated incident records and lessons. EmDash | Editorial blocks, status stamps | Same reading pattern | Unknown record; withdrawn incident | Stitch 04/09 | Similar shape to dispatches; the difference is carried mostly by copy |
| Portfolio editions | `/editions/[slug]/`, `/editions/one-more-round/` | Take a dated portfolio round with you | Edition sections, share assets, distribution record, frozen observations. EmDash + checked-in files | `PortfolioEdition`, `EditionShareKit`, `EditionShareAssets`, `ShowcaseGallery` | Editorial edition with media kit; phone stacks | Missing film/pack; frozen report context; preview mode hidden publicly | Stitch 05; `Editions/*` | Media kit is long; frozen numbers need their date close to the asset |
| Conversations | `/conversations/`, `/conversations/[slug]/` | Understand the publication boundary | Public explanation of private conversation handling; selected published conversations | Editorial blocks | Reading measure | No automatic publication; empty state | Stitch 04 | The index can read as policy rather than writing |
| Doctrine | `/doctrine/` | Understand how the factory operates | Operating principles, value, autonomy, commercial and physical boundaries | Editorial blocks, `D2Diagram` | Long-form reading | Private examples excluded | Stitch 08 | Dense for a first-time reader |
| Evidence index and detail | `/evidence/`, `/evidence/[slug]/` | Check a claim and its limit | Reviewed public claims, source, review date, proof boundary. EmDash | `EditorialBlocks`, `CapabilityRecord` | Register + detail | Unknown record; unavailable source; no private transcript | Stitch 09 | The index can be mistaken for a completeness claim |

## D. Analytics

| Screen | Route | Audience and task | Function and data | Components | Desktop / phone | States | Stitch / workshop | Current weakness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Portfolio workbench | `/activity/` | Understand what people play, hear and use without overclaiming | Project rail, UTC dates, one measure per scope, mixed overview, chart, coverage, interpretation, share. Aggregate analytics API + frozen reports | `MeasurementNavigation`, `OutcomeFindings`, `ActivitySharing`, ECharts client | 190px rail + chart + interpretation; phone rail scrolls horizontally, toolbar wraps | Missing, stale, partial, zero, unavailable, coverage, frozen link, CSV, PNG, chart with no axes | Stitch 05; `Media/Share actions`, `Media/Gallery pagination` | Phone rail can hide the selected project; small mono notes are hard to read; discovery copy pluralisation |
| Leaderboards | `/activity/leaderboards/` | Compare public engineering activity | GitHub-derived boards, coverage, source links. Public snapshot | `MeasurementNavigation`, leaderboard markup | Board table + notes; phone scrolls the board | Partial collection, unavailable source, no synthetic podium | Stitch 07 | Dense table on phones |
| Listening | `/activity/listening/` | Hear what the games and station report | Audible seconds, playback starts, native Bubbles boards, FM links | `MeasurementNavigation`, `FMListening` | Two-column sources; phone stacks | Missing source, partial coverage, native destination unavailable | Stitch 07 | "Listening" and "played" can be confused without the definitions |
| Measurement choices | `/activity/measurement/` | Decide what is measured and how to opt out | Definitions, exclusions, browser-return consent, retention | `MeasurementNavigation`, consent UI | Reading measure + control | Consent off/on/revoked; `?analytics=off` and `?qa` preserved | Stitch 05/07 | Consent and exclusion are separate but look similar |

## E. Share and media

| Screen | Route | Audience and task | Function and data | Components | Desktop / phone | States | Stitch / workshop | Current weakness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Share gallery | `/share/` | Find an approved image or clip and post it | Project and type filters, six previews per page, copy/download, captions, campaign and native captures. Checked-in public assets + EmDash edition media | `ShowcaseGallery`, `GameMedia`, `ShareActions`, `GalleryPagination`, `EditionShareKit` | Media-first grid, project rail, type rail; phone rails scroll horizontally and open on the current project | Missing asset, failed clipboard, unsupported share, video poster, pagination end | Stitch 06; `Media/*`, `Editions/*` | Pagination sits far below the last row; the phone rail still needs the edge fade to be read as scrollable |
| Project share collection | `/share/[slug]/` | Post one product | Project-specific assets, captions and links | Same as gallery; one reviewed work is a share card with the caption and link preview visible | Filtered gallery | Unknown project → 404; no assets | Stitch 06 | A single-work card is one screen; long captions wrap, the copyable text keeps its link |
| Edition share kit | `/share/` (edition view) and `/editions/one-more-round/` | Take a complete edition | Film, campaign artwork, frozen report images, pack download, captions | `EditionShareKit`, `EditionShareAssets`, `ReportShare` | Media grid + kit links | Pack unavailable; film unavailable; report context | Stitch 05/06; `Editions/*` | Pack and individual files are separate actions without a clear order |

## F. Working exhibits

| Screen | Route | Audience and task | Function and data | Components | Desktop / phone | States | Stitch / workshop | Current weakness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Exhibits index | `/exhibits/` | See what can be pulled apart | Two authored exhibits, what each shows and what it does not claim | `FactoryPlate` | Editorial index, open rows | Reduced motion; offline exhibit; external FM unavailable | Stitch 10 | The two exhibits have very different visual languages by design; the index must explain that |
| Patch bench | `/exhibits/patch-bench/` | Play the run, hear its effects, isolate or disconnect the music | One game canvas, one effects bus, one FM music bus, spring positions, mute, status text | Exhibit scripts + `FMListening` | Bench in CSS 3D; phone stacks controls and scene | Closed/open case, pulled apart, isolated layer, music connected/disconnected, muted, reduced motion | Stitch 10 | Canvas is decorative; all controls are HTML. Music provider failure must stay legible |
| Source plate | `/exhibits/source-plate/` | See a contribution become a composed card through a contract | Two flat plates, registration, source/derived comparison | Exhibit scripts + `D2Diagram` | Flat table; phone stacks plates and transcript | Reduced motion, missing source, copy affordance | Stitch 10 | The relationship can be missed if the contract text is below the fold |

## G. Factory and supporting pages

| Screen | Route | Audience and task | Function and data | Components | Desktop / phone | States | Stitch / workshop | Current weakness |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Factory | `/factory/` | See how projects connect | Working connections, examples, architecture links | `FactoryPlate`, `ProjectNetwork`, `D2Diagram` | Split sections; phone stacks | Archived example, external demo unavailable | Stitch 11 | Diagram density on phones |
| Architecture | `/architecture/` | Understand the publication system | Build, evidence, privacy, release path | `D2Diagram`, editorial blocks | Reading measure + plates | Private material excluded; stale diagram transcript | Stitch 09/11 | Long technical read |
| Agent Reception | `/agents/` | Machine-readable public facts | Human page plus `/agents/facts.json` | Editorial blocks, JSON endpoint | Reading + data | No private issue data; unavailable endpoint | Stitch 11 | The page must not imply live telemetry |
| Connections | `/connections/` | Follow the shared capabilities | Connection map and reviewed examples | `ProjectNetwork`, `CapabilityRecord` | Network + register | Missing provider; unverified consumer | Stitch 11 | Dense edge labels |
| Operator biography | `/dean/` | Know who runs the factory | Dean's public biography and links | Editorial blocks | Reading measure | No invented biography | Stitch 11 | Long; no portrait by design |
| Contact | `/contact/` | Make contact safely | Public profiles and enquiry form | Form markup, `contact-feedback` | Two-column; phone stacked | Validation, pending, sent, failed, no notification address | Stitch 11 | Success state must not promise a reply time |
| Not found | `/404/` | Recover from a bad address | 404 with search, front door and four destinations | `BaseLayout`, `SiteSearch` | Two-column; phone stacked | Search unavailable; no client data | Stitch 14 | Rebuilt 6 November 2026: was a centred dead end with one link |

## H. Editorial administration (EmDash-owned)

Woodhouse owns the content model, publication policy hooks, the enquiries admin page and the
read-only production boundary. EmDash owns the authoring, preview, revision and media interface.
The workshop must not redesign or reimplement EmDash admin screens. Relevant Woodhouse surfaces:

- `woodhouse-editorial-policy` — publish/schedule policy hook; refusal must be legible in EmDash.
- `woodhouse-enquiries` — `/submissions` admin page, notification setting, submit and admin routes.
- Production read-only mode — toolbar off, writes refused, previews noindex.

## Machine and media routes

`/rss.xml`, `/sitemap.xml`, `/sitemap-[collection].xml`, `/llms.txt`, `/build.json`,
`/agents/facts.json`, `/api/portfolio-analytics`, `/api/portfolio-report.json`,
`/api/activity.json`, `/api/leaderboard.json`, `/api/guestbook-items.json`,
`/api/share-image`, `/api/*card.png`, `/og/projects/[slug].svg`.
These are not visual screens. Their privacy and publication contracts are owned by
`ARCHITECTURE.md`, the publication policy tests and the build privacy check.

## Cross-screen requirements

- The site is dark by design. No light mode, no theme toggle, no light flash.
- Every page has a skip link, a visible focus ring, meaningful `h1`, and a route back to the work.
- Data pages fail closed: a CMS/analytics failure shows an unavailable state, never a blank panel
  or an invented value.
- Measurements with different units are never added together.
- Private drafts, private issues, credentials and unpublished evidence never appear in a public
  render, a story or a Stitch prompt.
- Product artwork belongs to the product. Woodhouse campaign artwork is labelled as such.

## Known presentation weaknesses (6 November 2026)

These are the concrete items the programme addresses or records:

1. `/404/` was a centred dead end with one action. Rebuilt with search and four destinations.
2. Analytics discovery copy could say "1 clicks". Fixed to singular/plural.
3. The phone analytics project rail could open with the selected project off-screen. It now scrolls
   the rail horizontally to the current item, without moving the page.
4. The current-edition invitation wrapped its arrow onto a line by itself on phones and read as one
   run-on sentence. It now has a title line, a description line and a separate discovery link.
5. "Read the edition↗" had no gap between the label and the arrow. Fixed.
6. The projects ledger's first artwork is now eager/high priority, so the first row is not waiting
   for a lazy load.
7. The projects ledger is long. It remains a ledger by design; a compact index was rejected as a
   second navigation system rather than a fix to the rows. The row itself now uses the Stitch
   reference's tighter plate/record split, and compact rows on project and Agent Reception pages
   are a text register rather than a second full artwork row.
8. Share's phone project rail could cut off the current project. It now scrolls horizontally with
   an edge fade and opens on the selected project.
9. Stitch's first homepage pass invented metrics and projects. It was rejected and corrected; see
   [`stitch/README.md`](stitch/README.md). Stitch artwork is a placeholder, not product evidence.
