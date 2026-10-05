# Architecture

Reviewed 3 October 2026.

```text
Public visitor / authenticated editor / authorised authoring agent
                            |
                Cloudflare Worker Cache
                            |
           Astro + Woodhouse presentation layer
               |                         |
        EmDash public queries        EmDash Office / MCP
               |                         |
       D1 content and history     Authenticated mutations
               |
          KV object cache

        R2 media and private backups
        Worker Loader sandboxed plugins
```

Astro owns page structure, CSS, diagrams, editorial block renderers and accessible browser behaviour. EmDash owns structured content, editorial state, authors, revisions, previews, media, taxonomy, menus, search records and scheduled publishing. The Worker serves public pages from the published read model; admin, MCP, preview and mutation responses are private. The shared navigation and search index are live CMS data, so public HTML is server-rendered while checked-in styles, diagrams, fonts and images remain static assets.

`src/content/repository.ts` is the only Woodhouse query boundary. Every public query asks for published entries and then checks the explicit `public_safe` flag; public conversations also require `source_reviewed`. CMS links and project metadata are constrained to root-relative or HTTPS URLs. A review date and proof boundary are shown with project state. The current state is a dated editorial record, never live repository telemetry.

The seeded model contains seven collections: project identity, append-only factory snapshots, reviewed project statuses, evidence records, dispatches, structured incident records and an intentionally empty conversations collection. A project status points to a snapshot; evidence records also point to a project and snapshot. Dispatches link to the project/topic context they discuss. The relation keeps historical state instead of overwriting it when a project is reviewed again.

The Cloudflare Worker binds D1 as `DB`, private R2 as `MEDIA`, KV as `CACHE` and `SESSION`, and Worker Loader as `LOADER`. A one-minute scheduled handler runs EmDash maintenance, scheduled publishing and plugin cron work. Automatic EmDash JSON backups are not yet enabled or verified. Production and preview have separate database, media and KV resources. The root Wrangler target defaults to preview; the named production environment owns the custom-domain route.

The public Agent Reception is a curated, read-only interface. It cannot call private repositories, run tools, mutate content or publish conversations. The authenticated EmDash MCP endpoint is a separate authoring interface; its token and assigned role determine what a client can do. No public agent receives write access.

`pnpm run audit:pages` audits a deployed origin for document structure, link integrity, canonical consistency, discovery, social images and privacy. `pnpm run audit` compares `pnpm audit` against a reviewed-advisory list and fails on anything without a recorded exposure and removal condition. `pnpm run smoke:preview` covers the deployed route matrix and the private EmDash response headers.

A local Astro integration stamps the build with the source fingerprint, the commit it was built from and whether that tree was clean. `/build.json` returns that identity under the factory shape `loftwah.build-identity/1`, and both deploy scripts fail unless the live origin reports the fingerprint they intended to ship. The Worker cannot learn its own Cloudflare version id, so it does not claim one; the private release receipt records the version.

That shape is intended to be reusable, so any product in the factory could be checked by the same comparison. As reviewed on 5 October 2026 it had no adopters outside this repository: Bubbles, SHOALSHOT, Fighter and Asset Hunter each shipped their own mechanism, and Bubbles in particular cannot answer which build is live from its served origin. A protocol nobody has adopted is a claim about intent rather than a description of the fleet, so this document records the intention and the empty adoption count rather than the intention alone. Adopting it elsewhere is real work and is not claimed.

The same endpoint reports a `content` fingerprint over the published read model, because code and content reach production by different mechanisms and either can be current while the other is stale. It is a SHA-256 over each record's identifier and full data, so an edit to any published record changes it, and per-collection counts are reported alongside for human sanity-checking. The content read never gates the build identity: a content failure reports `available: false` rather than turning a working identity endpoint into an error. `pnpm run verify:build -- <origin>` reads either half and fails on a mismatch, a mislabelled digest or a missing endpoint.

## Delivering the content model to a remote database

EmDash has no command that writes the content model into a remote D1 database. `emdash seed` applies the seed to a local SQLite file; the runtime auto-seed gate stays shut once `emdash:seed_complete` is set; `emdash schema add-field` accepts only type, label and required, so it cannot express the default values and validation rules that `public_safe` and every reference relation depend on; `emdash menu` is list and get only; and `emdash site import` requires an empty site. That ordering problem — the deploy gate wants the reviewed model in production, and no command could put it there — is resolved.

EmDash's own documented mechanism for moving a whole database is a SQL file: export one D1 and execute it into another. `pnpm run emdash:seed:remote -- preview|production` produces that file from the reviewed seed. It runs `emdash init` and `emdash seed` against a throwaway SQLite file, reads EmDash's own collections, fields, relations, block types, menus, taxonomies, revisions and published records back out, and replays them through `wrangler d1 execute --remote`. It never hand-writes a collection, column or trigger, so it cannot drift from what EmDash would build. `--dry-run` prints the plan and writes the SQL under the ignored `.release/` directory without contacting the remote database beyond read-only inspection; a write additionally requires `WOODHOUSE_CONTENT_MODEL_CONFIRMED` to name the environment.

Nothing is copied from another environment. Users, credentials, sessions, tokens, entry locks, audit logs, media, plugin storage and core migration records are never replayed, and of the `options` table only the seed's own `site:` settings plus `emdash:seed_complete` are written — each environment keeps its own origin, setup state, scheduler state and email provider selection. The script refuses to run when the database holds a collection the seed does not describe, an entry whose slug the seed does not contain, or any draft, scheduled or trashed entry: it installs the reviewed model, it does not edit a live environment's content. Each statement group is applied whole, so a parent is committed before its children, and every search index is rebuilt from EmDash's own insert trigger after the rows are in place.

On 4 October 2026 the reviewed model and published starter records were installed into production D1 this way, after the same run was rehearsed against preview. `pnpm run verify:content -- preview|production` now reports ready for both, with seven collections, nine relations and every published public-safe record present and linked. Production kept its own enrolled admin account, credentials and setup state throughout. The D1 Time Travel bookmark recorded before the write, the generated SQL and a private manifest are kept under ignored `.release/content-model/`.

The remaining constraint on a first production deploy is not the content model. `pnpm run deploy` additionally requires `.release/production-ready.json`: the exact accepted preview Worker version, and one recorded operator observation per preview acceptance check, each pointing at a fresh owner-only artifact with a matching digest. Six of the seventeen checks carry evidence; the rest need an authenticated EmDash session, an inbox and a physical review. Those are the operator's to make, so production deploy remains correctly refused.

## See also

See [EMDASH.md](EMDASH.md) for the content model, plugin decisions, operational workflow, privacy boundary and dated validation state.

See [PLATFORM.md](PLATFORM.md) for what the Cloudflare platform offers this factory, what is actually in use, and the recorded decision on each capability that is not. Read it before proposing a Cloudflare service; it is the map that says which question is already answered.

`lab/` holds executable experiments that stay outside the request and build paths: `lab/artifacts-lifecycle` proves the agent task-workspace lifecycle over ordinary Git, and `lab/evidence-replay` proves that one synthetic corpus replays into two independently checkpointed projections under duplicate, out-of-order, malformed, oversized, interrupted, lost-acknowledgement and expired-lease delivery. Both ran to a recorded defer decision in `lab/*/README.md`. Run them with `pnpm run lab:artifacts`, `pnpm run lab:evidence` and `pnpm run lab:test`. Nothing in `lab/` is imported by the site, and no lab artefact is published.
