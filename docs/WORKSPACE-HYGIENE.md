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
`dist`, `storybook-static` and `.astro`.

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

## Boundary

This is not a disk cleaner for the host. It does not touch system temporary directories, other
projects, worktrees, stashes or Git objects. Those are separate decisions with separate evidence.
