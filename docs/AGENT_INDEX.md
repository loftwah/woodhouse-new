# Woodhouse operator index

Reviewed 16 October 2026. Start at [AGENTS.md](../AGENTS.md); this index routes existing work rather than adding a second operating system.

## Design and component work

Reviewed 6 November 2026. Start with [UI-SCREEN-INVENTORY.md](UI-SCREEN-INVENTORY.md) for the route,
states and known weaknesses. [DESIGN-SYSTEM-MAP.md](DESIGN-SYSTEM-MAP.md) connects a route to its
Stitch reference, production component, Storybook story and live page. Use
[STORYBOOK.md](STORYBOOK.md) for the workshop commands, catalogue and limitations. Stitch work uses
[STITCH-PROMPT-PACK.md](STITCH-PROMPT-PACK.md) and records its outcome in
[stitch/README.md](stitch/README.md). The production page remains authoritative; a Stitch screen or
a story is not proof that the public route behaves that way.

## Authority and task routing

- MP's current instruction sets the task. [PRODUCT.md](../PRODUCT.md), [DESIGN.md](../DESIGN.md), [UNSLOP.md](../UNSLOP.md) and [ARCHITECTURE.md](../ARCHITECTURE.md) own accepted local intent and boundaries. Code and tests show what actually happens; reconcile discrepancies with their dated owner records.
- Editorial work — reviewed 18 October 2026: read [UNSLOP.md's writing rules and editing routine](../UNSLOP.md#writing-that-earns-a-readers-time) before drafting. PRODUCT.md owns the project-by-project article series; #18 retains its continuation. Develop each argument from current evidence and carry useful review lessons into the existing rules.
- Copy, UI text, character writing and artwork briefs: load the relevant surface/dialect in [The Loftwah Voice v1.0](LOFTWAH-VOICE.md), then the owning product's accepted visual and character references. UNSLOP remains the editorial procedure; backend-only work does not need the full source. [#204](https://github.com/loftwah/woodhouse-new/issues/204) owns adoption, with local product and release authority preserved.
- [woodhouse#3](https://github.com/loftwah/woodhouse/issues/3), including its later portfolio-quality comment, remains the cross-project operating contract. This repository's AGENTS and product documents own newer Woodhouse coordination requirements. Each spoke retains its own product and release gates; this index grants no extra authority.
- GitHub owns work state: #16 intelligence, #18 discovery/adoption, #17 audience/value, #19 creative quality, #34 analytics, #54 this delivery improvement. Extend existing work before creating a ticket. Historical founding briefs are background, not a substitute for current accepted requirements.
- Public tracking configuration: [TRACKING-CONFIG-PILOT.md](TRACKING-CONFIG-PILOT.md) records the read-only method, the observed → inferred → unknown split, and the standing decision not to add a tag manager. Use it as a pre-pitch check, not a scanner.
- Provider model lifecycles: [MODEL-LIFECYCLE.md](MODEL-LIFECYCLE.md) holds the dated inventory, the verified shutdown dates and where each migration was routed. Recheck it monthly in the #16 intelligence pass, and immediately when a provider announces a retirement.
- Check costs and choose a focused check using [VERIFICATION-PATHS.md](VERIFICATION-PATHS.md).
- Async request-path work: [ASYNC-WATERFALL-AUDIT.md](ASYNC-WATERFALL-AUDIT.md) records the Woodhouse inventory from #163 — what was parallelised, what is deliberately ordered, and the candidates with exact call sites. Add to it rather than re-deriving the analysis.
- Stack freshness: [STACK-REFRESH.md](STACK-REFRESH.md) holds the dated before/after versions, the deferred majors with reasons, the advisory review and the Workers compatibility position for #159. Update it in place on each refresh.
- Codebase structure: [UNTANGLE-CODEBASE.md](UNTANGLE-CODEBASE.md) records the reviewed `untangle-codebase` skill (`.agents/skills/untangle-codebase/`), the decision log from #168 and the fixes still owed. Add to it rather than starting a parallel audit.
- Artwork and media storage: [WORKSPACE-HYGIENE.md](WORKSPACE-HYGIENE.md#portfolio-r2-artwork-archive) records where to find the private R2 archive, how to restore a file, and which local copies projects can retire.
- Cloudflare cost: [CLOUDFLARE-COST-SAFEGUARDS.md](CLOUDFLARE-COST-SAFEGUARDS.md) has the observed usage, the deployed cron policy and the exact billing scope the token lacks. Run the four weekly reads in the #16 pass; do not add a monitor.
- Game writing: [COMEDY-AND-CHARACTER-STANDARD.md](COMEDY-AND-CHARACTER-STANDARD.md) is the portfolio gate for new or materially changed comedy. The standard is shared; each game owns its characters, runtime, evidence and QA issue. The first handoff draft — Protocol 11, June, three draft scenes — is [creative/protocol-11-draft-scenes-20261108.md](creative/protocol-11-draft-scenes-20261108.md); it is not game content and carries no review.
- Use [PLATFORM.md](../PLATFORM.md) before changing a Cloudflare integration and [EMDASH.md](../EMDASH.md) for CMS/recovery work. Query official EmDash documentation for APIs; never send private material to documentation search.
- The repository's [.agents/skills](../.agents/skills) contains EmDash specialists and the reviewed `untangle-codebase` skill (provenance in [UNTANGLE-CODEBASE.md](UNTANGLE-CODEBASE.md)). Select other guidance from the current session's local/global/plugin catalogue and confirm its tools are callable. Debugging, interface work and release review need different guidance; routine prose does not need a browser suite or a new skill.

## Git identity and provenance

Reviewed 2026/11/14 AEDT (Australia/Melbourne, UTC+11) / 2026/11/14 UTC.
[#249](https://github.com/loftwah/woodhouse-new/issues/249) records an agent lane
whose invented `lane-e@users.noreply.github.com` matched an unrelated GitHub user.
That attribution is not evidence of an intrusion.

For Woodhouse-run agents, choose an explicitly MP-approved owner-controlled verified
GitHub email/noreply or genuine bot identity before committing. Orchestrators and
workers inherit the approved author and committer; lane names are task labels, not
invented email addresses. Do not use another person's identity without their explicit
involvement. `node scripts/check-git-identity.mjs` checks effective Git author and
committer against the authenticated account's numeric noreply and, when the token can
read them, its verified emails. It catches the incident example; a match is not proof
of MP's approval. A failure can also mean the token cannot read a legitimate private
email or a different approved author is intended: verify the account and approval
independently, rather than treating the check as an accusation or inventing an address.
The command is optional and adds no hook or new account requirement.

If configuration is wrong, correct the originating worker's Git configuration or
per-command Git environment before the next commit, then recheck. Preserve existing
history; coordinate correction of an already published attribution through its owning
issue rather than rewriting shared history. Authorship is a commit assertion;
authenticated push, co-author credit, review and merge are distinct events, and Git
names and emails are spoofable. For unexpected contributors, inspect commit metadata,
PR provenance, permissions and the diff. Escalate a security incident only on concrete
signs such as unauthorised pushes, malicious changes, exposed secrets or credential misuse.

## References, planning and review

Reviewed 2026/11/12 AEDT (Australia/Melbourne, UTC+11) / 2026/11/12 UTC. Apply the
[shared creation direction](../PRODUCT.md#shared-creation-direction) to the
current task through this project's existing product, design and issue records.

1. **Find the useful context.** Start with accepted project references and current
   source. For each selected example, retain its source pointer, why it is useful,
   qualities to adapt or avoid, applicable usage rights, and the relevant accepted
   or rejected decision. Reuse DESIGN.md and its linked references; keep private
   material in the project's existing private location. A large source collection
   supplies candidates; load only the examples relevant to this task. References
   are evidence and inspiration, while owner instructions define requirements.
2. **Make the intention inspectable.** For new or materially changed experiences,
   prepare an appropriate visualisation, mock-up or working preview and settle
   meaningful product choices. Put the goal, intended behaviour, selected context,
   constraints and observable acceptance in the existing GitHub issue. Reuse
   accepted decisions for routine changes; do not add another approval checkpoint.
3. **Assign models by the work.** Prefer a stronger model for planning, a suitable
   economical model for bounded implementation, and a stronger model for review.
   Honour the user's model choices and actual supported capabilities. Escalate
   unresolved ambiguity or repeated failure instead of spending indefinitely on
   an unsuitable implementation path. Reuse existing scripts and explicitly
   authorised schedules; this direction creates no new scheduler or agent service.
4. **Review the artefact.** The reviewer uses the original brief, chosen references,
   actual diff and relevant rendered or runtime result. An implementer's summary
   alone is insufficient. Fix concrete findings and carry the result through the
   existing delivery route. Keep checks proportionate and reuse valid evidence;
   this division of responsibility does not add repeated broad review cycles.
5. **Retain what mattered.** Record the accepted result and useful decisions in
   existing project records so another session can continue. Report where the
   owner can inspect the outcome, distinguishing integration, deployment and
   observed behaviour under the established delivery contract.

Use a person's existing agent/account through a supported web, local, API or MCP
path. Identify whose entitlement is used; an available chat subscription does not
by itself establish API access. Surface unsupported paths and any extra cost
before execution. Composer's [#311](https://github.com/loftwah/app-composer/issues/311)
owns its integration; [#426](https://github.com/loftwah/app-composer/issues/426)
owns local workflow proof. [Woodhouse #179](https://github.com/loftwah/woodhouse-new/issues/179)
owns portfolio adoption through its existing roster. Each spoke applies the
method to its own product; retired projects stay outside that rollout.

## Launch, doctor, drive, evidence, cleanup

| Work | Existing path and proof |
| --- | --- |
| Local source change | `pnpm install --frozen-lockfile`, then `pnpm dev` on an explicitly owned port. Run a focused check for the changed behaviour. |
| Inspect a running instance | `pnpm run verify:build -- <origin>` reads `/build.json`; compare its source fingerprint/environment with the intended tree. `pnpm run verify:content -- preview\|production` checks the CMS model independently. HTTP 200 alone proves neither. |
| Public reading release | From clean pushed main, run `pnpm run deploy:publication -- production --path=/affected/route/`. Use the isolated preview and `--require-preview` for changes that need rehearsal. See [verification and release paths](VERIFICATION-PATHS.md). |
| Full editorial activation | `pnpm run deploy:preview`, `pnpm run release:status`, then `pnpm run deploy` only after the actual acceptance/recovery observations in [EMDASH.md](../EMDASH.md#full-editorial-production-deployment-gate). `evidence:capture` collects observations; `evidence:record` records an asserted pass, never decides one. Each check binds to the exact preview source, URL and Worker. Old unbound checks must be repeated, not relabelled. |
| Reader journey | Drive the actual route and native controls with available browser tools. Check phone/desktop when visuals change. For discovery, follow a dossier's source link into its product; for activity, change a product/date/measure and inspect unavailable states. Use the existing `?analytics=off` measurement exclusion before automated interaction; do not manufacture public activity. `audit:pages -- <origin>` proves page structure/privacy, not visual quality or physical sharing. |
| Retain and clean | Store bounded private logs, screenshots and exact source/environment identity under ignored `output/` or `.release/`. Stop only servers/browser sessions created by this run, remove owned scratch fixtures, and confirm the evidence survives. Preserve other worktrees, captures and browser/session data. For idle release checkouts, `pnpm run workspace:prune -- --builds-only --apply` clears rebuildable output. `pnpm run workspace:prune` reports what is past retention; add `-- --apply` to delete, `-- --builds` to include build output. Policy and measured sizes: [WORKSPACE-HYGIENE.md](WORKSPACE-HYGIENE.md). |
| Article figures | `pnpm run figures` renders the experiment figures from `src/data/same-prompt-twice.json` and the D2 sources in `public/diagrams/`; `pnpm run figures:check` fails when a committed figure no longer matches. These are deterministic system models and charts, not the illustrated plates in `diagrams/`, which pair a generated master with a reviewed model. |

## Shared local validation capacity

Reviewed 18 November 2026. Use direct, focused checks. One writer owns each worktree's build output.
The shared `scripts/host-validation.py` remains available to projects that need host capacity
arbitration. Issue #91 owns adoption and recovery evidence.

## Handoff and continuation

Reviewed 5 November 2026: when draft changes accumulate faster than they can be
integrated, prioritise that queue over opening more small PRs for the same work. Group
related work into coherent candidates, give each integration branch one writer,
and use focused checks while editing. Run the owning repository's required
qualification on the exact integrated release candidate, not on each constituent
draft. A failed or partial receipt does not authorise release. Close a draft as
incorporated or superseded only after checking its actual changes and tests
against the integrated target. Preserve genuine security, data and release holds.
Independent outcomes can continue. Issue #137 owns portfolio delivery recovery;
the spoke retains its own gates.

Use the existing owning issue/PR as the durable handoff: goal, repository, expected base, writable branch/worktree, bounded scope, required context, acceptance, returned head SHA, commands/results and next exact step. One writer owns each branch/worktree; the coordinator inspects the returned artefact and integrates it. MP is not a relay for routine details.

A fresh operator fetches the target, checks branch/status and compares base/head and relevant source identity before accepting a worker's result. After a relevant edit, re-run the affected proof; an older green summary cannot qualify the changed revision. Local, preview, production, human taste/listening and physical-device evidence remain separate. Record a precise unavailable slice while continuing independent work. No generated verification skill is validated until its actual launch/doctor/drive/evidence/cleanup route has run.
