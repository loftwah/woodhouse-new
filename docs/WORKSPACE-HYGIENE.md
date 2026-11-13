# Workspace hygiene

Reviewed 8 November 2026 for the Woodhouse slice of
[issue #153](https://github.com/loftwah/woodhouse-new/issues/153). Measured on this checkout, not
inferred from the portfolio-wide report.

## Measured here

| Category | Size | Treatment |
| --- | --- | --- |
| `node_modules` | 1.2 GB | Rebuildable. Never archived, never evidence. |
| `output/` | 852 MB | Local evidence. Governed by retention, not deleted by hand. |
| `.git` | 761 MB (263 MB pack, 6,340 loose objects) | Source history. Not touched. |
| `.release/` | 547 MB, 107 entries | Release receipts and exports. Retention with a keep-list. |
| `dist/` | 413 MB | Rebuildable output. Removed only on request. |
| `storybook-static/` | 339 MB | Rebuildable output. Removed only on request. |
| `public/` | 332 MB | Published source. Not touched. |
| `scripts/assets/` | 101 MB, 201 tracked files | Source assets. Not touched. |
| `.playwright-mcp/`, `.playwright-cli/` | 87 MB, 1,700+ capture entries | Browser captures. Seven-day retention. |
| `.wrangler/` | 31 MB | Local provider state. Not deleted: it is not reproducible. |

Total: 4.6 GB, against 179.9 GB free. Storage pressure is not the problem; unbounded accumulation is.

## The control

`pnpm run workspace:prune` reports; `pnpm run workspace:prune -- --apply` deletes. `--builds` adds
`dist`, `storybook-static` and `.astro` when the checkout is idle. Add `--json` for a structured
report with counts and byte totals.

- It only touches **direct children** of four evidence roots, and only when asked, three build roots.
- The default run deletes nothing.
- `.release/content-model` and `.release/backups` are keep-listed; release receipts live 90 days,
  routine evidence 30, browser captures 7.
- A symlink is reported and skipped, never followed, so a link pointing outside the repository cannot
  widen a deletion. A test asserts this.
- It prints apparent size and free space before and after. A move inside the same filesystem would
  not count as recovered space, and the script does not move anything.

First run: 1,514 routine capture entries, 0.08 GB, repository 4.6 → 4.5 GB, free 179.90 → 179.98 GB.
That is small because the captures were the only routine material past its age; the value is that the
852 MB of `output/` and 547 MB of `.release/` now expire instead of accumulating forever.

## Test residue

The retained test suite already creates temporary directories under the system temp directory and
removes them with `t.after`, including on failure. Five empty `woodhouse-*` directories remained from
earlier interrupted runs; they held no data. No test writes into the repository, and a run leaves the
worktree clean — `git status` after the suite is empty.

## Portfolio slice

The sizes MP reported for other projects are **not** verified here and are not summed into this
record. They belong to their own repositories:

| Project | Reported | Owner |
| --- | --- | --- |
| Fighter | 15 GB total, 6.4 GB Playwright output | Fighter |
| Bubbles | nine worktrees around 1.8 GB each | Bubbles |
| LoftwahFM | 2.5 GB `.wrangler`, 2.1 GB music | LoftwahFM |
| Card Collector | 2.3 GB `.wrangler` | Card Collector |
| Composer | 1.6 GB `.private` | App Composer |
| Phase 11 | around 12 GB Git objects, path unresolved | unowned until identified |

Music and private data are content, not cache. A `.wrangler` directory holds local databases, so it
is state, not output. Neither should be pruned by an age rule; each project decides with its own
evidence.

## Portfolio R2 artwork archive

Reviewed 13 November 2026, Australia/Melbourne. The private Cloudflare R2 bucket
`loftwah-artwork-archive` holds backed-up artwork masters, creative media and provenance.
Open **Cloudflare → R2 Object Storage → loftwah-artwork-archive → snapshots** to find it from
another machine. Under `snapshots/20261113/`, `indexes/` holds timestamped restore indexes
and `tools/` holds the restore helper and instructions. The newest index lists the paths
verified so far. It can be partial while a transfer is running. Each record carries the
original path, byte length, SHA-256 and the R2 object key or ordered part keys. Keep this
bucket private and retain completed archive objects.

On MP's Mac, open `~/.local/state/loftwah-artwork-archive/20261113/README.md`. From that
directory, run `/opt/homebrew/bin/python3 status.py` for verified, queued and missing counts.
Use the restore instructions there to fetch an original to a new path. Verify that its
SHA-256 matches the index before putting it back into a project. Codex and Woodhouse QR
samples were restored and compared byte for byte on 13 November. The cross-project upload
was still running at review time.

### Default for each project

1. Keep finished masters, editable creative sources, rights and provenance together. Store
   them in the private R2 archive or the project's existing private R2 media workflow. Give
   each kept asset a stable key and record where to restore it in the project’s asset manifest
   or owning issue. Check the bytes from R2 before calling the asset archived.
2. Keep the source and minimum assets required by the current build or offline runtime. Large
   approved downloads can move to the project's existing delivery bucket through its normal
   release. Verify the public route and exact download before dropping the old runtime copy.
   Share, its public catalogue and project builds must never depend on browsing the private archive.
3. Use local working copies and lightweight previews for editing. When a batch is complete, check
   the archive index and restore a representative original. Retire only verified duplicate or
   reproducible local copies that no active worktree, tool or release uses. Use the existing
   prune report for idle build output. Preserve unverified masters and in-flight evidence.

The archive is storage and recovery. [#234](https://github.com/loftwah/woodhouse-new/issues/234)
owns public catalogue delivery and rights metadata. [#179](https://github.com/loftwah/woodhouse-new/issues/179)
routes adoption by each project.

## Boundary

This is not a disk cleaner for the host. It does not touch system temporary directories, other
projects, worktrees, stashes or Git objects. Those are separate decisions with separate evidence.
