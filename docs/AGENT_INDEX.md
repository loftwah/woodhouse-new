# Woodhouse operator index

Reviewed 16 October 2026. Start at [AGENTS.md](../AGENTS.md); this index routes existing work rather than adding a second operating system.

## Authority and task routing

- MP's current instruction sets the task. [PRODUCT.md](../PRODUCT.md), [DESIGN.md](../DESIGN.md), [UNSLOP.md](../UNSLOP.md) and [ARCHITECTURE.md](../ARCHITECTURE.md) own accepted local intent and boundaries. Code and tests show what actually happens; reconcile discrepancies with their dated owner records.
- [woodhouse#3](https://github.com/loftwah/woodhouse/issues/3), including its later portfolio-quality comment, remains the cross-project operating contract. This repository's AGENTS and product documents own newer Woodhouse coordination requirements. Each spoke retains its own product and release gates; this index grants no extra authority.
- GitHub owns work state: #16 intelligence, #18 discovery/adoption, #17 audience/value, #19 creative quality, #34 analytics, #54 this delivery improvement. Extend existing work before creating a ticket. Historical founding briefs are background, not a substitute for current accepted requirements.
- Use [PLATFORM.md](../PLATFORM.md) before changing a Cloudflare integration and [EMDASH.md](../EMDASH.md) for CMS/recovery work. Query official EmDash documentation for APIs; never send private material to documentation search.
- The repository's [.agents/skills](../.agents/skills) contains EmDash specialists. Select other guidance from the current session's local/global/plugin catalogue and confirm its tools are callable. Debugging, interface work and release review need different guidance; routine prose does not need a browser suite or a new skill.

## Launch, doctor, drive, evidence, cleanup

| Work | Existing path and proof |
| --- | --- |
| Local source change | `pnpm install --frozen-lockfile`, then `pnpm dev` on an explicitly owned port. `pnpm run verify` is the complete local pipeline. Focused `node --test scripts/<name>.test.mjs` or `node --experimental-strip-types --test src/<path>.test.ts` supplies quick feedback, followed by required checks. |
| Inspect a running instance | `pnpm run verify:build -- <origin>` reads `/build.json`; compare its source fingerprint/environment with the intended tree. `pnpm run verify:content -- preview\|production` checks the CMS model independently. HTTP 200 alone proves neither. |
| Public reading release | Follow [ARCHITECTURE.md's publication path](../ARCHITECTURE.md#public-publication-and-editorial-activation): `pnpm run deploy:publication -- preview`, then production from clean pushed main and the same accepted source. The script builds, verifies content/boundaries, audits pages, records the Worker and checks active traffic. Do not use the full editorial path merely to publish reading surfaces. |
| Full editorial activation | `pnpm run deploy:preview`, `pnpm run release:status`, then `pnpm run deploy` only after the actual acceptance/recovery observations in [EMDASH.md](../EMDASH.md#full-editorial-production-deployment-gate). `evidence:capture` collects observations; `evidence:record` records an asserted pass, never decides one. Each check binds to the exact preview source, URL and Worker. Old unbound checks must be repeated, not relabelled. |
| Reader journey | Drive the actual route and native controls with available browser tools. Check phone/desktop when visuals change. For discovery, follow a dossier's source link into its product; for activity, change a product/date/measure and inspect unavailable states. Use the existing `?analytics=off` measurement exclusion before automated interaction; do not manufacture public activity. `audit:pages -- <origin>` proves page structure/privacy, not visual quality or physical sharing. |
| Retain and clean | Store bounded private logs, screenshots and exact source/environment identity under ignored `output/` or `.release/`. Stop only servers/browser sessions created by this run, remove owned scratch fixtures, and confirm the evidence survives. Preserve other worktrees, captures and browser/session data. |

## Handoff and continuation

Use the existing owning issue/PR as the durable handoff: goal, repository, expected base, writable branch/worktree, bounded scope, required context, acceptance, returned head SHA, commands/results and next exact step. One writer owns each branch/worktree; the coordinator inspects the returned artefact and integrates it. MP is not a relay for routine details.

A fresh operator fetches the target, checks branch/status and compares base/head and relevant source identity before accepting a worker's result. After a relevant edit, re-run the affected proof; an older green summary cannot qualify the changed revision. Local, preview, production, human taste/listening and physical-device evidence remain separate. Record a precise unavailable slice while continuing independent work. No generated verification skill is validated until its actual launch/doctor/drive/evidence/cleanup route has run.
