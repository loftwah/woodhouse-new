# Project brief: public activity, scores and optional accounts

Reviewed 12 October 2026. MP authorised Woodhouse to coordinate this work. #18 owns Woodhouse discovery; GitHub remains the tracker. The public hub is `/activity/`; its read-only aggregate projection is `/api/activity.json`. There is no central account service or event collector.

Copy the block below into a project's existing chat. Fit the work to that project's current owning issues and explicit holds. A leaderboard is useful only when a repeatable competitive activity and defensible result already exist.

```text
MP asks this project to support useful analytics, shareable results and suitable public leaderboards. Woodhouse coordinates discovery at https://woodhouse.loftwah.com/activity/; each project owns its gameplay, privacy, identities, data and releases.

Inspect current source, production identity, existing issues and product scope first. Reuse shipped capabilities. Implement the smallest useful admitted change and carry it through your normal release path. Preserve owner dirt, local saves, offline/signed-out play and audio ownership. Explicit holds and physical/provider gates still apply. Do not buy services, create paid commitments or replace account systems without MP's authority.

1. Measure decisions: count meaningful starts, finishes and deliberate replays where the product supports them. Name the event trigger, metric, window and coverage start. Keep page requests separate from play. Browser measurements are reported events, not proof of distinct humans. Exclude tests; make retries idempotent where events affect results. Avoid email, display names, user IDs or raw session histories in public aggregates. State duplicate/bot/sampling limitations. Use existing private Cloudflare traffic analytics for acquisition/performance where configured; use project-owned product events for engagement.

2. For LoftwahFM, verify the current supported client and listening-v1 contract. Upgrade only if compatible. Configure source:'game' and the registered gameId. Progress must reflect actual host-audible native playback, respecting mute, all parent gains, pause, visibility policy and interruptions. Attribute actual provider/referral clicks. Automated verification is test traffic. Existing versions can keep playing without telemetry; installed SDK, deployed integration and real receipts are separate claims. Do not manufacture game listening to populate a board.

3. If a public leaderboard fits, reuse the native board. Define mode/ruleset/season, unit, sort and ties. Validate results server-side, preferably from replay evidence; never trust a browser-supplied winning score. Rate-limit writes, deduplicate submissions, isolate fixtures and apply moderation. Turnstile is abuse friction, not score validation. Keep public identity explicitly chosen; no emails/private IDs in public entries. Cover withdraw/delete/rename behaviour. Public reads should be cached and bounded. Provide the native board URL first; Woodhouse will mirror only after public fields, publication consent and request budget have been reviewed.

4. Accounts are optional product value: publish scores, recover a profile or sync compatible saves. Reuse existing sign-in and secure sessions; do not build a fleet account service. Anonymous play must remain usable. Define linking, sign-out, deletion and conflict recovery before adding sync. If accounts or boards are outside current product scope, state that and keep analytics independent.

5. Share something players earned: a personal best or finished run with its ruleset, a stable native result/board link and a product-owned social preview. Avoid cross-game score comparisons, fake podiums, public player histories or invented adoption totals. Report source coverage clearly when no real data exists.

Return evidence in the existing GitHub owning issue: exact deployed commit/Worker, public URLs and safe API examples, metric/window/coverage definitions, tests and real interaction proof, account/score-validation policy, measurement limitations and remaining gates. Include a copyable public-safe receipt for Woodhouse. Do not contact customers or other chats without MP's authorization.
```

## Current routing

- Bubbles: reuse the shipped cloud account and native `/leaderboards?scope=global` surface; radio #1322. The public read budget is 60 requests per IP/hour, so the hub links to boards instead of polling them. Do not widen existing sync scope.
- LoftwahFM: owns Games × Radio and `listening-v1`; #239–#241 supplied the initial release. Own public aggregate quality and the consumer contract. Empty game rows remain unranked until legitimate reporting arrives.
- Protocol 11: radio #198; finish the active gameplay release before analytics follow-up. Native table/game outcomes need their own scope and integrity decision before public ranking.
- Fighter: radio #319. Preserve deterministic gameplay and the host AudioManager; assess boards/accounts against the current product before adding them.
- SHOALSHOT: radio #605. Its local-first scope does not currently admit a large account platform or leaderboard programme. Improve admitted reporting and sharing while preserving save recovery; propose a change to the owning scope before expanding it.
- Pirates: radio #451 is Enhanced-only; Original makes no FM requests. Respect its qualification and hosted-origin gate. No player/activity claims from source archaeology.

## Cloudflare decision

Reuse existing Workers and D1 for authoritative application data; Analytics Engine for aggregate product telemetry where already configured; Web Analytics for private site acquisition/performance. Turnstile can protect submission/sign-in friction but cannot prove a game result. Durable Objects become relevant only for an observed real-time coordination need. There is no need to provision a new resource for this hub. Every new service still requires current platform, budget and account review.

Official sources reviewed: [Web Analytics](https://developers.cloudflare.com/web-analytics/about/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Analytics Engine pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/), [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/). Limits and pricing must be rechecked before introducing a new service.


## Priority shopping list — reviewed 12 October 2026

MP prioritised Fighter, SHOALSHOT, Protocol 11, Bubbles and LoftwahFM and explicitly authorised direct follow-ups in their existing chats. MP should not relay prompts or assemble share images. This list extends the existing brief; project issues remain authoritative.

| Project | First useful native outcome | Reporting to reuse or complete |
| --- | --- | --- |
| Fighter | Finished-fight image, caption and play/result link; label local result provenance | Existing battle start/terminal outcome records, deliberate rematches, truthful FM attribution |
| SHOALSHOT | Dive Summary/run image with actual mode and result; keep local-first recovery | Verify existing FM instrumentation versus actual receipts; admitted run start/finish/replay events |
| Protocol 11 | Completed-game/result image with actual rules and result, after current gameplay release | Root-owned FM attribution, meaningful game starts/finishes/rematches where admitted |
| Bubbles | Native personal-best/result sharing with board-specific context; preserve House/personal/verified distinctions | Finish already-started #1322 attribution; reuse native profiles, boards and read budgets |
| LoftwahFM | Three authored Games × Radio formats, native download/share and snapshot metadata | Existing listening, trends, prior periods, station/track contribution and referral aggregates |

Request this small public-safe packet in the existing owning issue: current play/result/board URLs; deployed source/Worker evidence; native share-image URL, pixel dimensions, file type, caption and stable snapshot/result link; canonical artwork/logo source and public-use credit/rights; result mode/rules/version, units, sort/ties and local-versus-server verification; metric event triggers, UTC window, coverage start, update cadence, test exclusion and sampling/bot/dedup limitations. Public reads must expose only explicitly public aliases and aggregates, never raw histories, emails or private IDs. A local personal-result card needs no central account or public event upload. Public submission remains an optional native decision.

The useful engagement questions are: did a real play start, did it reach a terminal outcome, and did the player deliberately play again? A share-sheet opening, image download or clipboard success is not proof of a posted share or acquired player. A rematch can reuse a new-game event when the existing ledger already captures it; do not create redundant counters. Rates/trends need valid denominators and comparable coverage.

### Share experience and dimensions

- Landscape **1200 × 630** is the supported initial FM image. Square **1200 × 1200** and portrait **1080 × 1920** are requested additions; publish them only after the provider's exact release and image bytes are verified.
- Each format is an authored composition with readable type and declared safe areas. Preserve canonical product art/aspect and public credit. No automatic centre-crop, screenshot of controls, fake player podium or private account details.
- Default to a finished result or dated report with **Download image**, device **Share image** when supported, and **Copy caption + link**. Prepare a bounded image before invoking file sharing so the click retains user activation. Cancellation is silent. Keep native download/link fallback and signed-out play.
- Woodhouse presents the priority game's or composite FM image in its first viewport, exposes dimensions and source time, and keeps the listening ledger and native boards below. It relays the current fixed publisher PNG solely for same-origin download/file sharing; it does not render, transform or store the artwork. Historical links follow FM's retained-snapshot window.
- Woodhouse can add richer comparison/station/track discovery only after the safe source fields and denominators are reviewed. Scores from different games are never one competitive ranking. Accounts and score validation stay native.

Official sharing behavior reviewed: [Web Share](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share) and [file-sharing support detection](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare). File sharing varies by browser/device; browser automation cannot prove a recipient published an image.
