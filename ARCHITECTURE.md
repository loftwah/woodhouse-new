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

See [EMDASH.md](EMDASH.md) for the content model, plugin decisions, operational workflow, privacy boundary and dated validation state.
