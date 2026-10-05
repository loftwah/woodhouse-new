# WOODHOUSE

The Loftwah Software Factory.

Woodhouse is an evidence-led public observatory, engineering journal, project portfolio and professional record for the software factory operated by Dean Lofts.

## Product surface

- The factory floor presents an explicitly dated portfolio snapshot.
- Project dossiers explain what each product does, why it matters and what it teaches the factory.
- Dispatches, conversations and incidents turn engineering work into readable case studies.
- Agent Reception publishes a bounded, machine-readable summary without exposing private repository contents.
- Architecture and doctrine explain the operating model.

Most project repositories are private. Public copy comes from the shareable factory report supplied for this site, plus the public repository and published site of any project whose repository is public. Woodhouse does not call a snapshot live telemetry, and does not publish private issue text or credentials.

## Local work

Use Node 22.16 or later and pnpm.

- Install dependencies with `pnpm install --frozen-lockfile`.
- Start the local site with pnpm dev.
- Open the EmDash editor at `http://localhost:4321/_emdash/admin/`.
- Build with pnpm build.
- Run the complete local checks with pnpm run verify: seed validation, generated types, format, lint, dead code, diagram sizes, the reviewed dependency audit, EmDash Doctor, tests, typecheck and the production build with its privacy scan.
- Audit a deployed origin with pnpm run audit:pages -- https://host. It checks document structure, internal link integrity, canonical consistency, page discovery, social images and privacy across every sitemap page.
- Validate the EmDash seed with pnpm run emdash:seed:validate; regenerate schema types with pnpm run emdash:types.
- Install the reviewed content model and starter records into a deployed environment with pnpm run emdash:seed:remote -- preview|production. Add --dry-run to print the plan and the generated SQL under the ignored .release directory without writing. A write also requires WOODHOUSE_CONTENT_MODEL_CONFIRMED to name the environment, because it changes a live database. It builds the model locally with EmDash's own init and seed and replays it into D1, so no collection, field or trigger is hand-written; it never copies users, credentials, sessions, media or plugin state from anywhere, and it refuses to run over entries the seed does not describe.
- Re-render the diagrams and refresh their reserved sizes with pnpm run diagrams.
- Build and deploy the isolated Cloudflare preview with `pnpm run deploy:preview`.
- Measure how long a content change takes to reach the public site with `pnpm run measure:visibility -- --environment=preview|production`. It writes a unique token straight into D1, polls the plain public URL, records when it appears and reverts the record afterwards.
- Read the production release posture with `pnpm run release:status`. It compares the recorded preview against the current source, confirms the active preview deployment, runs the read-only production checks and verifies every acceptance artifact for freshness, permissions and digest. It exits non-zero while anything is blocked.
- Record one human acceptance observation with `pnpm run evidence:record -- <check> <artifact-under-.release>`. It validates that the artifact exists, is owner-only and is non-empty, computes its digest and writes the receipt entry in the shape the deploy gate requires. It never decides that a check passed: the operator supplies the artifact and asserts the observation.
- The root Wrangler target defaults to the preview Worker. Production requires the explicit `production` environment; use the guarded `pnpm run deploy` path, which requires private workflow evidence, the migrated content model, verified starter content and recovery checks. A direct explicit Wrangler production deploy bypasses the repository acceptance gate. See [EMDASH.md](EMDASH.md) for the receipt fields and release requirements.

Astro keeps the authored Woodhouse presentation, while EmDash supplies published content and global menus/search at request time. The Cloudflare Worker uses D1 (`DB`), private R2 media (`MEDIA`), KV object cache (`CACHE`), and a Worker Loader sandbox (`LOADER`). The preview environment has separate D1, R2 and KV resources and no production custom-domain route.

See [PLATFORM.md](PLATFORM.md) before proposing a Cloudflare service. It records the platform capabilities this factory has assessed, which are in use, and the decision taken on each one that is not.

See [EMDASH-ASSESSMENT.md](EMDASH-ASSESSMENT.md) for the written recommendation on EmDash as the CMS backend, the eight acceptance questions answered with evidence, the measured cost position, the verified upstream issue states, and what is still unfinished. [EMDASH.md](EMDASH.md) is the engineering record; the assessment is the decision.

Email uses the site-owned `woodhouse-resend-email` provider in `src/plugins/resend-email.ts`, with `woodhouse@loftwah.com` as its sender. Keep `RESEND_API_KEY` and `EMDASH_ENCRYPTION_KEY` in ignored local `.env` for development and configure them as Cloudflare Worker secrets per environment. The provider reads the Resend key at runtime. Activate it and select it under EmDash Admin → Settings → Email. Complete non-empty R2 recovery uses separate, bucket-scoped R2 S3 access keys in ignored local `.env`; see [EMDASH.md](EMDASH.md) for backup and isolated restore commands.

### Protecting the editorial service

EmDash's native passkey login is the selected authentication mode. On a fresh preview, the first visit to `/_emdash/admin/` opens setup for the first Admin; use the private tagged Woodhouse address there and register a passkey. Keep open signup disabled. Cloudflare Access is deliberately deferred: it replaces EmDash's other production auth methods and must be proven with the intended authenticated MCP client before it can be considered.

EmDash's authenticated content MCP endpoint is `/_emdash/api/mcp`. Connect only with an authorised EmDash account and narrow authoring scopes. Agent Reception remains a separate public read-only surface. See [EMDASH.md](EMDASH.md) for the content model, feature decisions, privacy rules, backups, migration and verification state.

## Refreshing the public snapshot

The newest portfolio snapshot is dated 5 October 2026; it re-reviewed Asset Hunter only, and the eight launch projects keep their 28 September 2026 review dates. A portfolio-level review is not a fresh review of each project, so a snapshot never re-dates projects whose own evidence was not re-read.

Update the `projects`, `factory_snapshots`, `project_statuses` and `evidence_records` in EmDash from a reviewed, public-safe report before changing review dates. Do not copy private issue or pull request bodies into public data. Check any claim that a deployed origin can support against that origin rather than against a deploy message, and record a supplied analysis as a hypothesis to be tested rather than as a fact to be republished: `scripts/apply-portfolio-brain.py` is the worked example of that pass, and it is idempotent.

`pnpm run social-cards` regenerates the page-specific raster previews from the shared artwork. It requires ImageMagick on the machine running it. Each dispatch has its own card under `public/og/dispatches/`, named for its slug; a dispatch without one falls back to the shared factory card.
