# Stack refresh record

Reviewed 8 November 2026. #159 owns the ongoing practice; this is the dated inventory and the
decisions taken in the 8 November refresh, so the next pass does not re-derive them.

## Updated

Every version below was installed with pnpm 12.8.1, passed the full `pnpm run verify` pipeline
(lint, tests, seed validation, typecheck, production build and privacy scan) and is what the release
path deployed. No prerelease was taken.

| Package | Before | After |
| --- | --- | --- |
| `astro` | 7.3.5 | 7.4.7 |
| `@astrojs/cloudflare` | 14.3.3 | 14.4.6 |
| `@astrojs/react` | 7.0.0 | 7.1.4 |
| `react` / `react-dom` | 19.3.0 | 19.3.1 |
| `@astrojs/check` | 0.9.10 | 0.9.12 |
| `wrangler` | 4.143.1 | 4.158.0 |
| `@cloudflare/workers-types` | 5.20260929.1 | 5.20261106.1 |
| `eslint` | 10.11.0 | 10.14.0 |
| `@typescript-eslint/parser`, `typescript-eslint` | 8.71.0 | 8.72.1 |
| `prettier` / `prettier-plugin-astro` | 3.9.9 / 1.1.0 | 3.9.10 / 1.1.2 |
| `knip` | 6.38.0 | 6.44.1 |
| `globals` | 17.12.0 | 17.14.0 |
| `playwright-core` | 1.64.1 | 1.65.0 |
| `@aws-sdk/client-s3` | 3.1142.0 | 3.1163.0 |

One override was added to `pnpm-workspace.yaml`, not `package.json` (pnpm 12 no longer reads a
`pnpm` field there): `@emnapi/runtime` is pinned to 1.11.3. `@astrojs/astro2tsx` resolves the
`@napi-rs/wasm-runtime` peer to `2.0.0-beta.2`, and that beta throws
`this.bridge.deleteEnv is not a function` during Node 22 process cleanup, which aborted
`astro check`. 1.11.3 satisfies the same peer range (`^1.7.1`) and is the stable line the rest of the
tree already used. Remove the override when the beta is fixed.

## Deliberately not updated

| Package | Available | Why it stays |
| --- | --- | --- |
| `effect` | 4.1.2 | Effect 3 → 4 is a service/architecture refactor, per the issue's own instruction. |
| `typescript` | 7.0.2 | A major compiler/toolchain change. It needs its own typecheck and build trial plus Astro language-server support, not a mixed dependency release. |
| local pnpm | 12.18.0 | `packageManager` pins 12.8.1. The pnpm binary is host-level and shared by every project on this machine; upgrading it is a deliberate host change, not a repository dependency. The lockfile and frozen install are verified on 12.8.1. |
| local Node | 26 LTS | The build host stays on 22.23.4 (`.tool-versions`). Cloudflare runs workerd, not Node, so this is a local-tooling decision with no runtime effect; changing the host runtime affects other projects and is scheduled separately. |

## EmDash 1.4.0 — taken 8 November 2026

`emdash` and `@emdash-cms/cloudflare` moved from 1.3.1 to 1.4.0 through the reviewed
`upgrading-emdash` routine. This is the CMS item the earlier table deferred, not a routine version bump.

| Package | Before | After |
| --- | --- | --- |
| `emdash` | 1.3.1 | 1.4.0 |
| `@emdash-cms/cloudflare` | 1.3.1 | 1.4.0 |
| `@emdash-cms/admin`, `@emdash-cms/auth`, `@emdash-cms/blocks` (transitive) | 1.3.1 | 1.4.0 |

The updater also refreshed the official EmDash authoring skills from `emdash-cms/skills`; the only
tracked skill change is one sentence in `creating-plugins/SKILL.md`, and `skills-lock.json` records the
new content hash. No runtime dependency was added by the skills refresh.

### Migration and recovery

`1.4.0` adds **no core migrations**; the manifest still ends at `091_redirect_artifacts`. Both checks
reported `pending: []` and `unknownApplied: []`:

- preview target `woodhouse-emdash-preview` (`f5274c8f…`), fingerprint `fc91b88d…`, before deploy;
- production target `woodhouse-emdash` (`b62500b4…`), fingerprint `dfa1ce85…`, after deploy.

Before the release, a full preview D1 dump was written to
`.release/backups/preview/d1-2026-11-07T19-34-14-874Z.sql` (43,080,749 bytes, FTS rebuilt and verified)
and Time Travel bookmarks were recorded for both databases:

- preview: `2026-11-07T19:34:55Z`, `.release/backups/preview/d1-time-travel.json`;
- production: `2026-11-07T19:34:57Z`, `.release/backups/production/d1-time-travel.json`.

The exact bookmark strings stay in those ignored private files. Rollback insurance is the previous
Worker (`e4e3be98-9825-4aa0-907b-8364ef3a2762`, built from `a9528ac`) plus the matching D1 bookmark.
No production maintenance window was declared, so no production SQL dump was taken; the upgrade did
not change the schema.

### Release entries assessed against this project

No application source change was required. The entries that could have touched Woodhouse were checked:

- **Cache hints (change 11).** Public pages set EmDash cache hints, but no code reads the automatic
  `cacheHint.lastModified`; the only explicit `lastModified` is `/activity/listening/`'s report
  `asOf`, which remains a deliberate validator for that report. Losing the automatic header is the fix.
- **Slug generation (change 20).** `projects` has `titleField: name` and also a `title` field. New
  API-created entries without a slug now derive it from `name`, which is the intended correction;
  every existing project entry has an explicit slug, so no published URL moved.
- **Empty media fields (change 14).** The seed's only image field is `null`, not `""`; no stored entry
  depends on the old empty-object shape.
- **Searchable references (changes 15, 18, 19).** No collection has a reference field named `title` or
  `name`, and no reference field is marked `searchable`.
- **Widgets (change 25).** Woodhouse does not use EmDash widget areas.
- **Sandboxed plugins (change 4).** `audit-log`, the editorial policy and enquiries are sandboxed. They
  do not call the content/taxonomy/comment mutations named in the entry, and their hooks already await
  the work they perform.

### Authoring acceptance

MP opened the editorial preview at `https://woodhouse-loftwah-preview.loftwah.workers.dev/_emdash/admin`
on 8 November 2026 and confirmed the authoring journey. The observation, recorded verbatim, is:

> It all works fine

That acceptance was given against preview Worker `2251c535-1952-4852-8d2d-2f5d0489db8f`, source
`7eb92d8`, build identity `sha256:8c6f29a2c999…`. It covers the requested sign-in, record
create/edit/preview and role behaviour as MP reported it; the exact record and role used were not
described, so this is an operator confirmation rather than a step-by-step transcript.

### Release

Source `7eb92d8`, clean tree and `origin/main`. Publication preview Worker
`d3f76473-dfcd-4efc-b7ac-9c2873cb2b4f`; production Worker
`346c6b94-ed70-4033-8e3c-3b2174346faf` at 100%. Build identity `sha256:8c6f29a2c999…` from a clean
tree, content generation unchanged at `sha256:3830ff69a537…`. Scoped audit on `/`,
`/projects/bubbles/` and `/dispatches/`: 3 pages, 71 link targets, 3 unique titles, 2 social images,
9/9 credential paths clean. Live `/build.json` reports the expected source and content; production
`/_emdash/admin`, `/_emdash/api/mcp` and `/_emdash/api/content` return 404; the Bubbles project page
and the stories index render their expected titles.

### Advisories after the upgrade — retirement did not occur

The earlier expectation that EmDash 1.4.0 would retire the seroval and `@hono/node-server` advisories
was **not met**. The installed tree still resolves `seroval` 1.6.7 through
`@tanstack/router-core` and `@hono/node-server` 2.1.1 through `@modelcontextprotocol/sdk`. `pnpm run
audit` therefore still reports the same 7 reviewed advisories:

| Advisory | Package | Exposure | Retires when |
| --- | --- | --- | --- |
| GHSA-f86p-h4j2-7qgj, GHSA-9wx9-5pv9-3349, GHSA-97r2-qh9m-474h, GHSA-wp97-x4hv-qvhp, GHSA-7rv5-mrxv-xcr9 | `seroval` 1.6.7 | Admin SPA only. Production is `WOODHOUSE_PUBLICATION_MODE=read-only` and the Worker refuses every `/_emdash/` request before the EmDash handler. | A later EmDash/admin release resolves seroval ≥1.6.11, or authoring is enabled. |
| GHSA-rmxm-3fg6-px4f | `@hono/node-server` 2.1.1 | Node-only MCP/CLI adapter inside EmDash; not imported by the deployed Worker runtime. | EmDash ships @hono/node-server ≥2.1.3. |
| GHSA-g3hv-75wg-m249 | `minimatch` 10.2.6 | Dev-only ESLint dependency over controlled globs; no request path. | ESLint moves to minimatch ≥11.0.1. |

Forcing transitive overrides outside the CMS release was not attempted: the admin bundle and the MCP
adapter would both be untested combinations. The next EmDash refresh should recheck the retirement
conditions rather than repeat this assumption.

## Workers runtime compatibility

- `compatibility_date` remains `2026-09-28` with `nodejs_compat` and
  `global_fetch_strictly_public`. The refresh did not change any flag or assume Node runs inside the
  Worker.
- The Worker was built and deployed by the refreshed Wrangler 4.158.0; `/build.json` and
  `pnpm run verify:build` confirm the source identity.

## Dependency advisories

`pnpm run audit` reports 7 advisories, all now reviewed in `scripts/audit-dependencies.mjs` with the
exposure and retirement condition:

| Advisory | Package | Exposure | Retires when |
| --- | --- | --- | --- |
| GHSA-f86p-h4j2-7qgj, GHSA-9wx9-5pv9-3349, GHSA-97r2-qh9m-474h, GHSA-wp97-x4hv-qvhp, GHSA-7rv5-mrxv-xcr9 | `seroval` 1.6.7 | Only reached through EmDash's admin SPA. Production is `WOODHOUSE_PUBLICATION_MODE=read-only` and the Worker refuses every `/_emdash/` request before the EmDash handler. | EmDash upgrade to a release with seroval ≥1.6.11, or enabling authoring. |
| GHSA-rmxm-3fg6-px4f | `@hono/node-server` 2.1.1 | Node-only MCP/CLI adapter inside EmDash; not imported by the deployed Worker runtime. | EmDash ships ≥2.1.3. |
| GHSA-g3hv-75wg-m249 | `minimatch` 10.2.6 | Dev-only ESLint dependency over repository-controlled globs; no request path. | ESLint moves to minimatch ≥11.0.1. |

No advisory was dismissed as "not applicable" without naming the boundary that makes it unreachable,
and none of these is claimed to be fixed.

## Other checks

- `pnpm run emdash:doctor`: migrations 90 applied, 7 collections, datetime storage canonical. The
  scheduler row still fails on the upstream literal-source detector because `src/worker.ts` composes
  the scheduler handler instead of re-exporting it verbatim; the wrapper's own guarded-wiring check
  passes. This is a known false positive, not a regression from the refresh.
- `pnpm run share-previews:check`: 198 bounded previews match 201 reviewed image assets.
- `pnpm run format:check`: still flags 10 files. Verified with the previous Prettier 3.9.9 as well, so
  this is pre-existing formatting drift, not caused by the bump. Not fixed here to avoid mixing a
  reformat into a dependency release.

## Release

Source `dad8403`, Worker `7571ac72-37c3-4603-8018-a33ee3d6fa23` at 100% (preview
`36b85f42-291c-4cfd-b2f0-1e934c06ee7a`), build identity `sha256:ab1e75006f45…` from a clean tree,
content generation `sha256:3830ff69a537…`. Scoped audit on `/`, `/activity/`, `/projects/bubbles/`
and `/connections/`: four unique titles, 95 link targets, 3 social images, 9/9 credential paths
clean. The four live routes returned 200 with one `h1` and their expected titles.

The upload grew from about 20 s to about 52 s because the refreshed Astro build emits 2,285
artifacts against 1,604. That is a real release-time cost increase, not a regression in the checks;
if it persists, the next stack pass should find which output grew rather than accepting it.

A live analytics body comparison taken across the deploy differs in today's visits and engaged
sessions (65677 → 65680 and 3952 → 3957). Those are live counters moving with real traffic, not a
runtime change; the empty-window behaviour and shape were verified in the preceding release.
