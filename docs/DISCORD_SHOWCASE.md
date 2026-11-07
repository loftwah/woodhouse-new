# Discord delivery showcase

Issue [#171](https://github.com/loftwah/woodhouse-new/issues/171) owns the factory feed.
The channel answers: what changed, why it matters, which issue/PR owns it, and
where MP can see the result. One integration owner reports one coherent outcome;
workers do not post independent success claims. The channel does not replace GitHub
or each product's existing release evidence.

## Use the existing delivery owner

1. Prepare a short, public-safe event in ignored `.release/` or private operator
   storage. Include the actual issue/PR links, changed behaviour, purpose and exact
   route/actions to inspect it. Do not copy private issue bodies or screenshots.
2. Integrate the accepted change. Run the command from the owning repository:
   `node /trusted/woodhouse-new/scripts/showcase-delivery.mjs /private/event.json`
   previews the payload, verifies the GitHub origin and observes remote `main`.
3. Add `--send` only when the event accurately describes its stage and its audience
   is appropriate. The wrapper proves the commit is in observed remote `main` for
   completion stages, sends through the configured webhook, and reads the returned
   message back. It prints a verified Discord link when available.
4. For runtime work, complete the native deployment and affected real journey,
   then report `PRODUCTION_VERIFIED` with the same outcome ID and the exact source,
   version, origin, check and check time. A merge, upload, HTTP 200, or build header
   alone is not proof that an interactive feature works.
5. Retain the message link and actual release proof in the existing issue/PR.
   Reconcile notification faults separately. Never redeploy merely because a
   notification failed.

In Woodhouse itself the command is also `pnpm showcase:delivery -- <event.json>`.
Other repositories can use a trusted local Woodhouse checkout; do not curl-and-run
moving remote code. There is no new package registry, bot, scheduler or GitHub Action.
App Composer already has `pnpm delivery:announce`; preserve that native command and
select only one transport per event. Its legacy command does not provide this
wrapper's persistent dedupe or read-back, so its operator must reconcile retries.

## Stages

- `MERGED_TO_MAIN`: source integrated; runtime production may still be pending.
- `PRODUCTION_VERIFIED`: exact deployed source/version and the affected live flow
  have been checked. State the limits of that check.
- `DOCS_TOOLING_DONE`: non-runtime work is checked on main. No unnecessary redeploy.
- `BLOCKED` / `RELEASE_FAILED`: explain the precise impediment and next action.
- `PROJECT_HIGHLIGHT`: a useful milestone, demo or authentic visual worth seeing.
  Label prototypes and unverified aspects; this label makes no release claim.

The payload includes Melbourne time and UTC in YYYY/MM/DD format, suppresses all
mentions, and bounds fields to Discord's limits. `demoUrl` can link to an approved
screenshot, short clip or actual feature. Prefer meaningful outcomes to commit noise.

## Configuration and audience

`WOODHOUSE_DISCORD_CHANNEL` contains the webhook URL, not a numeric channel ID.
`WOODHOUSE_DISCORD_WEBHOOK_URL` is a fallback alias only when the canonical variable
is absent. Read the existing process environment, an approved private secret store,
or an ignored owner-only env file. For example, Node supports
`node --env-file=/private/discord.env ...`; never put the value in command history,
tracked files, examples, issues, screenshots or logs. Do not replace MP's shell
configuration silently. Installing a secret on one host does not configure every
agent host. Set up each actual integration runtime deliberately.

Use `WOODHOUSE_DISCORD_STATE_DIR` for the integration owner's durable private state.
Its default is `~/.local/state/woodhouse-discord-showcase`. Keep it outside the
repository and use the same directory when continuing on that host. Coordinate a
handoff and existing message receipt before moving to another host. Do not share
state files publicly. No webhook is stored in the delivery state.

MP approved ongoing use of the supplied webhook after the disclosure risk was
explained. Rotate it if compromise or unintended disclosure is suspected; do not
publish it to perform a test. Access to a repository does not make its private
contents appropriate for the channel. Summaries and attachments must suit the
verified audience.

## Event shape

This example has placeholders and is not sendable until source/evidence are real.

```json
{
  "project": "Woodhouse",
  "repo": "loftwah/woodhouse-new",
  "outcomeId": "issue-171-showcase",
  "stage": "DOCS_TOOLING_DONE",
  "summary": "The delivery feed now links work to its source and result.",
  "changed": "Added the release-owner reporting command.",
  "why": "MP can see which work is actually ready to inspect.",
  "how": "Open the linked PR and executable guide.",
  "verified": "The relevant source, tests and main integration were checked.",
  "commit": "REPLACE_WITH_ACTUAL_40_CHARACTER_MAIN_COMMIT",
  "issueUrls": ["https://github.com/loftwah/woodhouse-new/issues/171"],
  "prUrls": ["REPLACE_WITH_ACTUAL_PR_URL"],
  "evidence": {
    "runtimeAffected": false,
    "check": {"success": true, "description": "Actual focused checks"}
  }
}
```

The wrapper fills `evidence.mergeCommit` only after observing source integration.
For a production event add `deployment: {"version": "actual version", "url":
"https://actual-origin"}` and `evidence.production` with `success: true`,
`environment: "production"`, the same `commit`, `version` and `url`, a meaningful
`check`, and ISO `checkedAt`. These assertions must describe a check that actually
ran. The transport validates binding; it cannot invent or independently establish
an operator's browser/device observation.

## Woodhouse publication adapter

`scripts/deploy-publication.mjs` calls `showcasePublication` after its existing
source/content/privacy checks and active 100% Worker verification, without changing
release authority or making Discord a release gate. It reads
`WOODHOUSE_SHOWCASE_EVENT` or ignored `.release/showcase-event.json`.

For a change whose affected behaviour is genuinely public HTTP content, prepare the
normal event plus `verificationScope: "public-http-content"` and one to five
`productionChecks`, each `{ "path": "/actual/path/", "contains": "expected public text" }`.
The event's commit must match the deployment receipt. The adapter performs these
same-origin checks after deployment, records their limited scope, and sends the
main/production stages through the same guarded wrapper. It never uses previews,
stale events or failed content checks for a production headline.

For interactive, authenticated or physical changes, do not use text matching as a
substitute. The adapter reports `awaiting_affected_flow`; complete the genuine
journey and run the wrapper with its actual proof. Other projects keep their native
release and acceptance paths, using their integrator's final reporting step. No
universal background observer can infer a game, account or physical-device pass.

## Retry and recovery

The event key includes repository, outcome, stage, commit and deployment identity.
Confirmed successful events are deduplicated locally. `wait=true` returns a message
ID, and a read-back checks its semantic fields. Confirmed 429s receive at most two
bounded retries. A timeout, 5xx, crash or ambiguous response is **uncertain** and is
not blindly retried. Abandoned locks also fail closed.

Inspect the exact channel/outcome and stored receipt before recovery. If a message
exists, retain its ID and reconcile the private record. If the operation is known
not to have executed, an owner may reset only that event's failed/uncertain state.
Do not erase a whole ledger, post another event ID to dodge uncertainty, or run
independent senders. Local dedupe does not promise exactly-once across machines.
A sent message with failed read-back may already be visible; never resend it just
because verification failed.

## Verification and rollout

Run `pnpm test:showcase` (or the equivalent `node --test` commands). Tests use stubbed
Discord and synthetic events, including state locks, duplicates, bad evidence,
secret redaction, 429s, uncertain results, source mismatch and stale publications.
Real channel delivery and a real production progression need their own linked
receipts in #171. Do not mark those complete from local tests.

Active rollout: Woodhouse, App Composer, Fighter, SHOALSHOT, Protocol 11, Bubbles,
Foilbury, MAX, LoftwahFM and Liferaft. Current portfolio records mark Plans With You
and Asset Hunter retired and Pirates paused; do not reactivate them for this feed.
Liferaft installer/device evidence and MAX physical evidence retain their native
meaning. Documentation adoption alone is not proof every runtime has its secret
or that every future announcement has been delivered.
