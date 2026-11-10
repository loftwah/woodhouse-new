# Impeccable installation and use

## Current portfolio requirement and executable setup

Reviewed **2026/11/11 AEDT (Australia/Melbourne, UTC+11) / 2026/11/10 UTC** for [#160](https://github.com/loftwah/woodhouse-new/issues/160).

MP had already required the actual Impeccable skill across every Woodhouse project. Installation, discovery, applied design judgement, fixes and production verification are separate. A routing file, a dependency, a clean detector result or a Woodhouse-only receipt cannot close portfolio coverage. The historical receipt below is retained as history, not today's machine inspection.

### What changed in the repository, not on MP's computer

- `scripts/impeccable-project.mjs` implements a local, explicitly selected, project-scoped setup/check path using the **official installer**, not a counterfeit design skill. It preserves existing instructions/configuration, backs up into Git metadata outside skill discovery, rejects malformed routing blocks and unsafe instruction symlinks, and does not deploy or change cloud accounts.
- `scripts/impeccable-project.test.mjs` has **12 passing focused tests in the isolated Linux execution environment**. Both tested file bytes were checked against their GitHub blob identities: helper `60957ddb43e545b8b353e5a13cc86044c7f6eda9`, tests `0426f8e253abb38a083f2aea02ab2a1fca6a80fb`. These are helper tests, NOT a real Impeccable install, macOS execution or design-use proof.
- `.agents/skills/woodhouse-design/SKILL.md` is a project-specific routing rule in this repository and the accessible portfolio repositories listed in #160. It directs meaningful UI work to the **real upstream Impeccable skill**. It is not a replacement for that skill and is not proof that a running harness has discovered either file.
- The existing #160 owns the coverage matrix; no separate registry, daemon, GitHub Actions workflow or new orchestration service is introduced. Archived Club and Asset Hunter rejected writes and remain explicitly blocked, not silently passed or unarchived.

### Review versions, then run the supported setup

The reviewed upstream skill and CLI are **4.8.2**, recorded separately from the engine. Recheck official releases at execution time; the helper's constants are reviewed pins, not a claim of perpetual latest. A bundled engine and the newest independent engine release can differ. Use the supported combination and actual resolved binary rather than forcing the largest version string.

From the trusted local Woodhouse checkout, select actual repository roots explicitly. No command below has been run on MP's machine by this repository-side change.

```sh
# Focused helper tests; no installation, provider access or production writes.
node --test scripts/impeccable-project.test.mjs

# Read-only inspection of explicitly selected local projects.
node scripts/impeccable-project.mjs --check "$PWD" /absolute/path/to/app-composer

# Actual setup for harnesses in use: official pinned installer, backup,
# owned AGENTS.md routing block and actual launcher doctor diagnostics.
node scripts/impeccable-project.mjs --setup --providers codex,claude \
  "$PWD" /absolute/path/to/app-composer

# Where installation is owned by an existing shared/plugin setup,
# wire only the selected projects' AGENTS.md; no installer is invoked.
node scripts/impeccable-project.mjs --wire "$PWD" /absolute/path/to/app-composer
```

Select the providers actually used; do not assume DeepSeek is a harness or enable unrelated integrations. Omitting `--providers` delegates provider discovery to the official installer. For a reviewed later release, `--cli-version` and `--skill-version` accept separate explicit stable versions. Neither `latest` nor prereleases are silently accepted. `--check` is read-only and cannot be combined with setup/wire.

The helper does **not** clone/pull/reset repositories, overwrite unrelated owner work, install globally, automatically patch product/design truth, run a paid service or launch agents. Synchronise reviewed repository changes through the existing local workflow first. Verify the repository origin and preserve dirty/worktree/branch work. Archived/retired lifecycle decisions remain authoritative. The existing atlas's local path aliases are observations to verify, not permission to operate on any similarly named directory.

Existing symlinked/global/plugin installations need their installation owner: the helper refuses to overwrite an external linked skill. Inspect precedence and update that one installation through its supported route, then wire each consumer and prove actual resolution. Do not create racing updates of one shared installation. The helper currently checks common project-local directories; unknown/plugin-specific layouts require actual harness inspection and are not automatically certified. Linux helper tests do not certify Windows launcher handling.

Successful file inspection is labelled `LOCAL_FILES_READY_NOT_RUNTIME_VERIFIED`. Missing/stale local files are `SETUP_REQUIRED`; errors are `BLOCKED`. The fields `effectiveHarnessSkill`, `hookExecution`, `designUse` and `production` remain **UNVERIFIED**. Those require observed execution, never a Boolean a setup script sets optimistically. Doctor findings must be interpreted; process exit zero alone does not establish complete context.

### The actual work after setup — required in every applicable project

1. Reload the real agent and prove fresh-session discovery **without MP naming Impeccable in the task**. Observe the loaded skill path/revision, CLI and engine, including global/plugin/project precedence. Test supported hooks actually firing. Preserve real hook-trust approval; unsupported or unapproved hooks need explicit checks and an honest status.
2. Read the real upstream `SKILL.md`. Run its resolved launcher `context` once from that project's cwd for the actual target. Read the current PRODUCT.md, DESIGN.md, relevant surface briefs and accepted references. Use already-recorded owner answers; do not make MP repeat the product brief. Resolve actual contradictions rather than treating every old date as a defect. Keep each project's distinct identity and Australian English.
3. Understand and use the relevant upstream playbook: shape/new-work for new surfaces; critique for UX/design judgement; audit for accessibility/responsive/implementation; targeted polish, adapt, harden, typeset, layout, clarify or other relevant work. Read `reference/craft-floor.md` before UI edits. These are agent workflows, not invented CLI subcommands. A scan alone is insufficient.
4. Inspect real rendered pixels **and interactions**, then repair material findings within scope and reinspect. Cover representative phone/desktop sizes, keyboard/focus/touch, contrast/readability, overflow, loading/empty/error/recovery and reduced motion. Games additionally need actual canvas/HUD/gameplay/control geometry evidence. A DOM detector cannot certify game feel, native device behaviour or all accessibility requirements.
5. Keep proof in the existing project issue/PR/evidence: actual tool/harness, source/target, context/playbooks, findings, concrete changes or justified no-change, rendered interactions, checks and remaining limits. Retain private project/user data privately. No fabricated screenshots, success metrics or copied receipts from another app.
6. Deliver runtime repairs through that repository's authorised main and production workflow, then verify changed live behaviour. Tooling-only changes need main and focused checks, not an unrelated redeploy. Preserve real art/security/data/device holds; do not invent a new routine approval gate or use one held surface to abandon all other work.

A launcher failure follows the upstream disclosed fallback: read context directly and continue permitted work, without claiming the command ran. A true absence of a user interface is a specific applicability judgement, not a blanket opt-out for an entire project with menus/admin/HUDs. Retired/archived projects stay visible with their exact restriction.

### Coverage and closure

The current inspected portfolio is the union of the existing Woodhouse leaderboard/architecture records, the repository template and independently maintained Composer apps. Newly added projects must receive their own context and evidence; copying the template's rule does not copy completed acceptance. #160 records each project's routing commit, host setup/discovery, actual design pass, remediation/release evidence and blocker. Do not close it from a single project's receipt.

**Current execution boundary:** repository changes and isolated helper tests are verified. The GitHub connection used for this update cannot execute on MP's Mac or launch the local coding agents. Current host installation, fresh-agent discovery, hook execution and new per-project rendered design passes therefore remain unverified. No background run or production deployment is implied.

Primary sources: [upstream skill](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/SKILL.md), [supported installer/CLI](https://github.com/pbakaus/impeccable/blob/main/README.npm.md), [releases](https://github.com/pbakaus/impeccable/releases), [doctor semantics](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/reference/doctor.md).

---

## Historical Woodhouse-only receipt — retained without revalidation

The following original record describes the earlier Woodhouse slice. Its versions, tool output, interface observations and outstanding findings are historical. They must be rechecked before acting; they do not establish today's portfolio-wide installation or visual state.

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

1. **`.impeccable/config.json`** did not exist, so `doctor` reported the build path as an unrecorded default. It now
   records `"buildPath": "code"`: Woodhouse is a token-and-type editorial system built directly in
   Astro and CSS, with no raster comp stage.
2. **`DESIGN.md`** had no component guidance, so `doctor` reported that agents generating screens got
   nothing normative. Added a **Components** section: where components live, that the route map is
   authoritative, that every failure-capable component must name their failure state, and that data
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
