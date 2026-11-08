# Verification and release paths

Measured 8 November 2026 across three releases from `6aabbff` to `75f2641`. This replaces guesswork
about how long the checks take and which ones a change actually needs. The numbers are observations
on one machine, not a benchmark or a guarantee.

## Conditions

- Apple M4 Pro, macOS, Node v22.23.4, pnpm 12.8.1.
- Warm `node_modules` and Astro cache, single worktree, no other project holding the shared host
  reservation during the runs.
- Three runs for the quick lane, one for the light lane, one for each single stage, three complete
  releases.
- Wall time from process start to exit, including the package-manager start-up. Tests report their
  own duration, which matches the wall time closely.

## Measured

| Path | Command | Runs | Median |
| --- | --- | --- | --- |
| Quick feedback | `pnpm run verify -- --quick` | 6.33s, 6.31s, 5.77s | **6.2s** |
| Light | `pnpm run verify -- --light` | 6.3s | **6.3s** |
| Heavy | `pnpm run verify -- --heavy` | derived from the two stage medians | **~38s** |
| Full | light, then heavy | derived | **~44s** |

Per-stage attribution:

| Stage | Lane | Measured |
| --- | --- | --- |
| EmDash seed validation | light | 0.3s |
| Lint | light | 3.3s |
| Tests | light | 2.9s |
| Astro and TypeScript (`typecheck`) | heavy, reserved | 15.4s, 20.6s, 24.0s |
| Production build and privacy scan | heavy, reserved | 17.3s, 17.5s, 27.2s |

The full pipeline grew from ~34s to ~44s, almost all of it in typecheck and build; the retained
tests grew by under a second. It is still tens of seconds, not minutes. Both lanes now print their own
timing line, so this table can be re-derived from any run instead of copied forward. The spread
between the fastest and slowest typecheck or build is real machine variance, not a different command;
budget for the slow end.

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
run. Three complete releases on the day this record was written:

| Stage | Preview, range of 3 | Production, range of 3 |
| --- | --- | --- |
| Preflight (secrets, digest, seed) | 1.7–4.0s | 1.6–2.3s |
| Preview receipt and active version | — | 3.6–4.2s |
| Production recovery point | — | 2.3–2.7s |
| Analytics schema | 1.0–1.4s | 1.0–1.1s |
| Content model (`verify:content`) | 3.3–4.6s | 4.9–5.6s |
| Build and privacy scan | 17.3–27.0s | 20.5–27.2s |
| Migration check | 1.6–2.0s | 1.5–1.9s |
| Upload and deploy | 37.7–45.2s | 40.0–43.5s |
| Build identity | 1.4–2.8s | 0.6–1.7s |
| Served content | 1.4–4.2s | 2.4–4.3s |
| Publication boundary | 1.5–5.1s | 1.7–2.6s |
| Page audit | 10.9–14.1s | 10.9–11.7s |
| Active traffic | 0.8–1.1s | 0.9–1.1s |
| Secret inventory | 0.9–1.1s | 0.9–1.1s |
| **Total** | **85.5–102.1s** | **98.9–123.8s** |

The first of the three releases paid for something the later two did not: `verify:content` used to
open one remote D1 round trip per relation, twelve in total. The same independent read-only statements
now travel in four batched invocations, which took that stage from 11.6s and 24.4s to 3.3–4.9s. The
assertions did not change, including the per-relation edge comparison.

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
| `75f2641` | 5.8s | 15.4s | 9.8s | 102.1s | 99.3s | **232.4s (3.9 min)** |

The push figure includes the pre-push hook's own quick lane, so the first column double-counts a run
that the hook would otherwise do. A flow that relies on the hook alone saves those seconds; the
conservative total above keeps them.

All three are under the five-minute ceiling, worst case 4.4 minutes. The three-minute default needs a
quiet host and a warm cache, and it is reachable on a good run, but it is not the number to plan
against: 78–86s of every release is two provider uploads and 38–48s is two builds that cannot be
shared. The second sample is close to the floor for a two-environment release.

The honest reading: the checks are not the problem. Together they are 20–30s. The release is two
deploys, and that is what the clock is spent on. The only remaining lever is publishing fewer
environments for a given change, which is a decision about what preview is for, not a number to reach
by quietly dropping a check.
