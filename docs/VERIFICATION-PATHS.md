# Verification and release paths

Reviewed 18 November 2026. [AGENTS.md](../AGENTS.md) sets the two-minute ceiling for routine change to verified production.

| Change | Run |
| --- | --- |
| Documentation and internal scripts | Check the diff and links or run the changed script's focused check. Integrate on main. |
| Routine public page, style or content presentation | Run the smallest relevant check, then publish once and inspect the affected live journey. For visual changes inspect representative phone and desktop widths. |
| Seed, schema, persistent state, auth or publication boundary | Exercise the affected invariant. Use the isolated preview and promote the checked source with `--require-preview`. |
| Backup, recovery or credential handling | Run the specific relevant suite, such as `pnpm run test:r2` or `node --test scripts/secret-prevention.test.mjs`. |

Run `node --experimental-strip-types --test <file>` to target a regression. Lint, typecheck,
seed validation, the retained suite and site-wide crawling are explicit tools for changes that
need their coverage. The old pre-push lint/test hook and omnibus verification wrapper were
removed. Static catalogue integrity, date and sort assertions, search ranking and layout fixtures
were removed from automated coverage. The retained tests protect contracts such as privacy and
consent, safe downloads, authentication, payment, recovery and release provenance.

## Public read-only publication

From clean pushed main, give the release the affected route or repeat `--path` for several.

```sh
pnpm run deploy:publication -- production --path=/affected/route/
```

This builds once with the artifact privacy scan, checks production data, bindings, migrations and
secrets, records the D1 recovery point, then uploads once. The live check proves exact source,
active Worker traffic, served content, the read-only boundary, and the selected documents,
social images and credential paths. Source maps stay in the local build for routine publication.
Live stack traces use compiled locations. Link crawling is available via `pnpm run audit:pages` or
`--full-audit` when the changed behaviour requires a sitemap-wide check.

For changes requiring preview acceptance, run the existing two-environment path.

```sh
pnpm run deploy:publication -- preview --path=/affected/route/
pnpm run deploy:publication -- production --require-preview
```

Production checks the preview receipt's source, scope, age and active Worker version. Full
editorial activation uses the separate [EmDash release path](../EMDASH.md#full-editorial-production-deployment-gate).

## Time and evidence

The 8 November baseline was 221–265 seconds including qualification, push and two releases. Two
provider uploads accounted for 78–86 seconds and two builds for 38–48 seconds. A later production
receipt for `edbb575` took 163.7 seconds on its own, including 89.1 seconds for the build and
50.6 seconds for upload. Builds scan media bytes for credentials. The scan now uses a single-byte
representation for ASCII checks and preserves UTF-8 decoding for non-ASCII configured values.

Read `.release/publication-production.json` for the Worker version, source, actual audit mode and
stage timings. Stage timings overlap. Measure the whole change separately from the command's wall
time and report any overrun with the slow stage and next action.

When building from a separate checkout, point the privacy scan at the trusted local dotenv file
to include the configured private values. Keep that file outside the release worktree.

```sh
WOODHOUSE_PRIVACY_ENV_FILE=/absolute/path/to/trusted.env pnpm run build
```
