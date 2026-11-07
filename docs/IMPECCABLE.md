# Impeccable installation and use

Reviewed 8 November 2026 for [issue #160](https://github.com/loftwah/woodhouse-new/issues/160). This
records what is actually installed, what the supported invocation is, what was repaired, and what a
real audit found. A document naming a version is not evidence that the version is loaded; the checks
below ran.

## Installed

| Location | Version | Role |
| --- | --- | --- |
| `~/.agents/skills/impeccable` | **4.8.0** | Global skill for this harness. |
| `~/.claude/skills/impeccable` | **4.8.0** | Claude Code's copy, updated by the same installer. |
| `.agents/skills/impeccable` (this repo) | **4.8.0** | Project-local copy installed by `npx impeccable install`. |
| Engine binary | **0.1.18** | Bundled by the 4.8.0 installer. |

Upstream on 8 November 2026: skill and CLI **4.8.0** (26 October), engine **0.1.19** (7 November).
The engine is one patch behind; the installer pins 0.1.18, so this is the installer's choice rather
than an old local copy.

**Before:** the global skill was **4.0.4**, five minor versions behind, with a `scripts/context.mjs`
route that no longer exists.

**Rollback:** the pre-update directory is at
`~/.agents/backups/impeccable-4.0.4-20261108`. It was moved out of `skills/` deliberately: left in
place it registered as a second skill with the same name, which is exactly the shadowing the issue
warns about.

**Precedence:** the project copy shadows the global one inside this repository. Both are 4.8.0, so
they cannot diverge. The project copy is ignored by git — it is a 3.3 MB installed tool, not source.

## Supported invocation

The route is the launcher that ships with the skill:

```bash
.agents/skills/impeccable/scripts/impeccable context --target src/pages/activity.astro
.agents/skills/impeccable/scripts/impeccable detect https://woodhouse.loftwah.com/activity/
.agents/skills/impeccable/scripts/impeccable doctor
```

`scripts/context.mjs` and `scripts/detect.mjs` are gone in 4.x. No active reference to either
remained in this repository's docs, scripts or configuration, so nothing needed rewriting.

## Repairs made

1. **`.impeccable/config.json`** did not exist, so the build path was an unrecorded default. It now
   records `"buildPath": "code"`: Woodhouse is a token-and-type editorial system built directly in
   Astro and CSS, with no raster comp stage.
2. **`DESIGN.md`** had no component guidance, so `doctor` reported that agents generating screens got
   nothing normative. Added a **Components** section: where components live, that the route map is
   authoritative, that every failure-capable component must name its failure state, and that data
   arrives as a prop rather than a fabricated fallback.

`doctor` now reports one remaining item and one advisory:

- **PRODUCT.md predates the current product record** (no schema stamp, no Positioning / Operating
  Context / Evidence on Hand / Product Principles sections). The tool's own instruction is to offer
  `init` and fill the gaps **by interview** rather than infer content. That needs MP, so it is left
  open rather than guessed.
- **DESIGN.md "has no colors section"** even though `## Colour and material` documents the full
  palette. The checker looks for the US spelling; this project writes British English. Recorded as a
  tool/document naming mismatch, not a missing palette. Renaming an accepted heading to satisfy a
  linter is the wrong trade.

## Proof of use

Two real runs, not a smoke test:

1. **Context resolution** for `src/pages/activity.astro` resolved `PRODUCT.md`, `DESIGN.md` and the
   matching surface brief `.impeccable/surfaces/src-pages-activity-astro.md`, and instructed reading
   the files in full rather than re-running.
2. **Live audits** of the production routes, which is the correct target for this site: `dist/`
   contains no prerendered HTML because the site renders on the Worker, so a static scan would
   silently under-report.

| Route | Result |
| --- | --- |
| `/activity/` | **29 anti-patterns**: 21 `undersized-ui-text`, 8 `tiny-text` |
| `/` | 16 `undersized-ui-text`, 2 `unbalanced-heading`, 2 `straggler`, plus one each of `repeating-stripes-gradient`, `line-length`, `hero-eyebrow-chip` |

The dominant finding is consistent and measurable: **navigation and footer links render at 9.12px**,
below the tool's 11px floor for functional text, and several body labels sit at 11.2–11.84px. That is
a legibility signal on the shipped site, not a hypothetical.

## What happens next with that finding

The type scale is accepted design, and #90/#95 are in the owner-acceptance batch, so this pass does
not change production navigation or footer type from a tool advisory. The finding is recorded with
its exact sizes so a focused visual change can be measured against it: raise functional mono labels to
at least 11px, keep the display scale, and compare the affected pages at phone and desktop.

## Boundaries

- No hooks were widened and no provider configuration was rewritten beyond the installer's own
  skill/agent directories.
- No second design language was introduced; the repair documents what the CSS already does.
- Coverage for the other projects in #160 is theirs to claim. This record is the Woodhouse slice: a
  verified installation, a repaired context, and a real audit.
