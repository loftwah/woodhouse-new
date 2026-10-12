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
