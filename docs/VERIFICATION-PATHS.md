# Verification and release paths

Measured 8 November 2026 on the source at `5b00812`. This replaces guesswork about how long the
checks take and which ones a change actually needs. The numbers are observations on one machine, not
a benchmark or a guarantee.

## Conditions

- Apple M4 Pro, macOS, Node v22.23.4, pnpm 12.8.1.
- Warm `node_modules` and Astro cache, single worktree, no other project holding the shared host
  reservation during the runs.
- Two runs for the quick lane, one for the light lane, one for each single stage, two complete
  releases.
- Wall time from process start to exit, including the package-manager start-up. Tests report their
  own duration, which matches the wall time closely.

## Measured

| Path | Command | Runs | Median |
| --- | --- | --- | --- |
| Quick feedback | `pnpm run verify -- --quick` | 6.33s, 6.31s | **6.3s** |
| Light | `pnpm run verify -- --light` | 6.3s | **6.3s** |
| Heavy | `pnpm run verify -- --heavy` | derived from the two stages | **~38s** |
| Full | light, then heavy | derived | **~44s** |

Per-stage attribution:

| Stage | Lane | Measured |
| --- | --- | --- |
| EmDash seed validation | light | 0.3s |
| Lint | light | 3.3s |
| Tests | light | 2.9s |
| Astro and TypeScript (`typecheck`) | heavy, reserved | 20.6s |
| Production build and privacy scan | heavy, reserved | 17.5s |

The full pipeline grew from ~34s to ~44s, almost all of it in typecheck and build; the retained
tests grew by under a second. It is still tens of seconds, not minutes. Both lanes now print their own
timing line, so this table can be re-derived from any run instead of copied forward.

## What this actually says

- **The light lane and the quick lane are the same lane.** The only difference is seed validation at
  0.3s. A change that edits the seed model should still run the light lane.
- **Typecheck is the single largest local cost** at ~21s, roughly half of the full pipeline. The
  build is second at ~18s.
- **The queued wait is a separate quantity.** A blocked heavy run is another project holding the
  shared slot; record it as wait, not cost.

## The route for ordinary changes

| Change | What to run | Why |
| --- | --- | --- |
| Documentation, comments, copy in a data file | Nothing, or `--quick` if a test covers it. Check links and the diff. | No runtime behaviour changed. |
| Component, style or route code | `--quick`, then `--stage typecheck` (reserved), then the affected page in the browser at phone and desktop. | Types and the real journey catch what lint cannot. |
| Anything that changes the published page set | The runtime route below with `--path=` for each affected journey. | The audit proves structure and privacy on the deployed page. |
| Broad shared change (layout system, header, analytics rail) | Runtime route with `--full-audit`. | Every page can be affected. |
| Seed or content model | `--light` (adds seed validation), then `verify:content -- preview`. | The model is the thing that changed. |
| Host reservation, R2 recovery, credential or privacy code | `--heavy` plus the specific suite (`test:host-reservation`, `test:r2`). | These are the invariants that break silently. |

## Local CI

There is no hosted CI for this repository, deliberately. The checks run here, on the machine that has
the source, the build cache and the failure output.

`pnpm run hooks:install` points `core.hooksPath` at `.githooks`, and `.githooks/pre-push` runs the
**quick lane** before a push leaves the machine. It takes about ten seconds including the push, prints
the failing output when it fails, and refuses to overwrite a `core.hooksPath` that already points
elsewhere.

- Bypass a real emergency with `SKIP_LOCAL_CI=1 git push`; the hook says the push is unverified.
- It runs the quick lane, not the full pipeline. Typecheck and build stay in `pnpm run verify`, because
  a hook that costs 30 seconds is a hook people disable.
- `pnpm run hooks:check` reports whether it is installed and exits non-zero if not.

## The release path

Runtime change: focused checks → preview publication → production publication → live verification.

```bash
pnpm run deploy:publication -- preview --path=/affected/route/
# verify the preview, then, from clean pushed main:
pnpm run deploy:publication -- production --path=/affected/route/
```

The publication script checks the tree is clean and `HEAD` matches `origin/main`, runs
`verify:content`, **builds once**, deploys, waits for the build identity, checks the served content
and the publication boundary, audits the selected pages (with a retry for edge propagation) and
writes a receipt. Production reuses the accepted preview scope.

Two consequences worth stating plainly:

- **Do not run `pnpm verify` and then the publication script for the same commit if you only want the
  build proof.** The publication script builds the same tree again. Run `--quick` and
  `--stage typecheck`, then let the release build be the build. That avoids a duplicate build and a
  stale `dist/`.
- **The release path is dominated by the provider, not by the checks.** Upload and deploy is the
  largest single stage in every release measured.

### Where the time went

Each publication writes its own stage timings to `.release/publication-preview.json` and
`.release/publication-production.json` under `durations`, and prints the same line at the end of the
run. Two complete releases on the day this record was written:

| Stage | Preview (`6aabbff`) | Production (`6aabbff`) | Preview (`5b00812`) | Production (`5b00812`) |
| --- | --- | --- | --- | --- |
| Preflight (secrets, digest, seed) | 2.0s | 1.6s | 1.7s | 2.2s |
| Preview receipt and active version | — | 4.2s | — | 4.1s |
| Production recovery point | — | 2.3s | — | 2.7s |
| Analytics schema | 1.0s | 1.4s | 1.0s | 1.1s |
| Content model (`verify:content`) | 11.6s | 24.4s | 3.3s | 5.6s |
| Build and privacy scan | 18.2s | 27.2s | 17.3s | 20.6s |
| Migration check | 1.7s | 1.5s | 1.6s | 1.9s |
| Upload and deploy | 45.2s | 41.0s | 37.7s | 40.0s |
| Build identity | 1.5s | 1.7s | 2.8s | 1.6s |
| Served content | 1.4s | 3.4s | 4.2s | 4.3s |
| Publication boundary | 5.1s | 2.4s | 2.7s | 1.7s |
| Page audit | 10.9s | 11.0s | 11.4s | 10.9s |
| Active traffic | 1.1s | 0.9s | 0.8s | 1.1s |
| Secret inventory | 1.1s | 0.9s | 0.9s | 1.1s |
| **Total** | **100.8s** | **123.8s** | **85.5s** | **98.9s** |

The `5b00812` release is faster for one reason: `verify:content` used to open one remote D1 round trip
per relation, twelve in total, and now sends the same independent read-only statements in four
batched invocations. The assertions did not change, including the per-relation edge comparison.

### What is proved once, and where

Production used to re-probe the preview before deploying: build identity, served content and ten
boundary endpoints, on top of the preview receipt it had just read. The preview receipt is only
written after those checks pass for an immutable Worker version, and the production run already
confirms that version is still the one taking 100% of preview traffic. Re-running the probes re-proved
the receipt, not the deployment, and cost ~6s each release. It was removed.

Production still proves identity, served content, the publication boundary and the same scoped page
audit on the production origin, which is the deployment that can actually be wrong. The preview
receipt, its source digest, its audit scope and its Worker version are still required and still
checked.

What stays deliberately duplicated, because the environments are separate systems:

- `verify:content` runs against each database. The seed is the same; the stored records are not.
- The build runs once per environment. The two Workers bind different D1, R2 and KV resources.
- The page audit runs on both origins. Preview proves the pages; production proves the deployment.
- The secret inventory is read before and after each deploy, so a lost secret fails the release.

### End to end, measured

| Run | Quick | Typecheck | Push (hook) | Preview | Production | Total |
| --- | --- | --- | --- | --- | --- | --- |
| `6aabbff` | 6.3s | 24.0s | 9.8s | 100.8s | 123.8s | **264.7s (4.4 min)** |
| `5b00812` | 6.2s | 20.6s | 9.8s | 85.5s | 98.9s | **221.0s (3.7 min)** |

Both are under the five-minute ceiling. The three-minute default needs a quiet host and a warm cache;
the second sample is close to the floor for a two-environment release, because 78s of it is two
provider uploads and 38s is two builds that cannot be shared.

The honest reading: the checks are not the problem. Together they are ~30s. The release is two
deploys, and that is what the clock is spent on.
