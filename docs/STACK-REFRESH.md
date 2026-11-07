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
| `emdash`, `@emdash-cms/*` | 1.4.0 | A CMS minor carries migrations, admin/auth changes and content-model behaviour. It needs the EmDash upgrade routine, a migration check on real data and an owner acceptance pass on authoring. Not a version bump to make unattended. This is the next stack item. |
| `effect` | 4.1.2 | Effect 3 → 4 is a service/architecture refactor, per the issue's own instruction. |
| `typescript` | 7.0.2 | A major compiler/toolchain change. It needs its own typecheck and build trial plus Astro language-server support, not a mixed dependency release. |
| local pnpm | 12.18.0 | `packageManager` pins 12.8.1. The pnpm binary is host-level and shared by every project on this machine; upgrading it is a deliberate host change, not a repository dependency. The lockfile and frozen install are verified on 12.8.1. |
| local Node | 26 LTS | The build host stays on 22.23.4 (`.tool-versions`). Cloudflare runs workerd, not Node, so this is a local-tooling decision with no runtime effect; changing the host runtime affects other projects and is scheduled separately. |

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
