# Verification and release paths

Measured 8 November 2026 on the source at `3b32de4`. This replaces guesswork about how long the
checks take and which ones a change actually needs. The numbers are observations on one machine, not
a benchmark or a guarantee.

## Conditions

- Apple M4 Pro, macOS, Node v22.23.4, pnpm 12.8.1.
- Warm `node_modules` and Astro cache, single worktree, no other project holding the shared host
  reservation during the runs.
- Clean tree at `3b32de4`. Three runs for the light lanes, two for the heavy lane, one for each
  single stage.
- Wall time from process start to exit, including the package-manager start-up. Tests report their
  own duration (2.04s), which matches the wall time closely.

## Measured

| Path | Command | Runs | Median |
| --- | --- | --- | --- |
| Quick feedback | `pnpm run verify -- --quick` | 5.94s, 5.30s, 5.41s | **5.41s** |
| Light | `pnpm run verify -- --light` | 5.48s, 6.42s, 5.31s | **5.48s** |
| Heavy | `pnpm run verify -- --heavy` | 28.56s, 27.75s | **28.2s** |
| Full | light, then heavy | derived | **~34s** |

Per-stage attribution:

| Stage | Lane | Measured |
| --- | --- | --- |
| EmDash seed validation | light | 0.31s |
| Lint | light | 3.72s |
| Tests | light | 2.21s |
| Astro and TypeScript (`typecheck`) | heavy, reserved | 17.93s |
| Production build and privacy scan | heavy, reserved | 12.99s |

## What this actually says

- **The light lane and the quick lane are the same lane.** The only difference is the seed
  validation at 0.31s. Both land at ~5.5s. The distinction costs nothing, but it also buys almost
  nothing; a change that edits the seed model should still run the light lane.
- **Typecheck is the single largest cost** at 17.9s, about 48% of the full pipeline. The build is
  second at 13.0s, about 35%. Together they are 83% of everything.
- **The full pipeline is ~34s, not minutes.** The 49-second light run recorded in #155 was a
  different suite; the retained tests are now ~2s of real work. Anyone budgeting minutes for routine
  verification is budgeting for a pipeline that no longer exists.
- **The queued wait is a separate quantity.** Every heavy run above took the shared reservation
  immediately. A blocked run is not a slow pipeline; it is another project holding the slot, and it
  should be recorded as wait, not cost.

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
**quick lane** before a push leaves the machine. It takes about five seconds, prints the failing
output when it fails, and refuses to overwrite a `core.hooksPath` that already points elsewhere.

- Bypass a real emergency with `SKIP_LOCAL_CI=1 git push`; the hook says the push is unverified.
- It runs the quick lane, not the full pipeline. Typecheck and build stay in `pnpm run verify`, because
  a hook that costs 30 seconds is a hook people disable.
- `pnpm run hooks:check` reports whether it is installed and exits non-zero if not.

First use caught a real lint error in the hook's own installer, which is the behaviour you want from a
gate.

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
- **The release path is dominated by the deploy and the audit, not by the checks.** The checks are
  ~23s before the release build; the rest is upload, edge propagation, the audit retry and the
  D1 bookmark.

The preview-to-production measurement below is filled in on the first runtime release after this
record, because a docs-only change does not justify a redeploy.

| Release path | Measured | Scope |
| --- | --- | --- |
| Preview publication | 70.5s, 81.9s | two routes each |
| Production publication | 91.0s, 80.6s | same scope |

Where the time goes, from the release output: build ~4s, upload **20–21s**, trigger deploy 1–2s, then
the served-content check, boundary check, scoped page audit and D1 bookmark. The upload dominates and
is provider-side; the checks before it are ~23s.

**End to end for one real fix:** commit → push → preview 81.9s → verify canonical on preview →
production 80.6s → verify canonical live. With `--quick` (2.2s) and a reserved typecheck (18.5s) that
is about **3.1 minutes** from edit to verified production, for a two-route change, on a quiet host.
That is inside the 3–5 minute target and it is the only honest sample: a docs-only change is faster
because it never enters this path.
