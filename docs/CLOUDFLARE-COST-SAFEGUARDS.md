# Cloudflare cost safeguards

Reviewed 8 November 2026 for [issue #157](https://github.com/loftwah/woodhouse-new/issues/157). The
question is not "is the invoice fine" but "what is actually running, what would make it grow, and
what can this repository prove without billing access".

Two kinds of evidence appear below: **observed** (read from deployed configuration or the provider's
analytics API) and **unknown** (blocked by a permission the current token does not have). Nothing is
inferred as zero.

## What the token can and cannot read

| Read | Result |
| --- | --- |
| Account identity (`wrangler whoami`) | observed |
| Worker scripts, schedules, analytics | observed |
| GraphQL analytics (requests, errors, CPU quantiles) | observed |
| `GET /accounts/{id}/subscriptions` | **403 Authentication error** |
| `GET /accounts/{id}/billing/profile` | **403 Authentication error** |
| `GET /accounts/{id}/billing/usage` | **403 Authentication error** |
| Budget alerts | no API route (`404`); configuration is dashboard-only |

So the current token is a Workers/analytics token without **Billing: Read** or **Account Settings:
Read**. The exact missing gate is a billing-scoped read, which is also why the existing alerts and
the current invoice cannot be verified here. That is a permission gap, not a finding of safety.

## Configuration audit

`wrangler.jsonc` declares Workers, D1, KV, R2 and a Worker Loader binding. It declares **no** Workers
AI, no Containers, no Queues, no Browser Rendering, no paid third-party binding and no extra KV or R2
namespace per environment. There is nothing in the committed configuration that bills per call
beyond Workers, D1 and R2 usage.

The one recurring workload is a cron. The committed file says `* * * * *` for both environments, but
`scripts/deploy-publication.mjs` pins the deployed value: production `17 * * * *`, preview `[]`. A
manual `wrangler deploy` that bypassed the release script would install a per-minute cron on preview,
so the script remains the only safe deployment path.

Deployed schedules, read back from the provider:

| Worker | Schedules |
| --- | --- |
| `woodhouse-loftwah` | `17 * * * *` |
| `woodhouse-loftwah-preview` | none |
| `loftwahfm` | `13 3 * * *`, `17 * * * *`, `*/5 * * * *`, `8,23,38,53 * * * *` |
| `max-web` | `17 3 * * *`, `*/2 * * * *` |

## Current usage, 9 October – 8 November 2026

Account-wide: **2,858,742 Worker requests across 107 scripts** in 30 days. The top scripts:

| Script | Requests (30d) | Errors | CPU p50 | CPU p99 |
| --- | --- | --- | --- | --- |
| `woodhouse-loftwah` | 1,405,168 | 16 | **70.2ms** | 520ms |
| `loftwahfm` | 826,691 | 20 | 2.7ms | 107ms |
| `my-domain-redirect-worker-production` | 154,782 | 0 | — | — |
| `woodhouse-loftwah-preview` | 139,686 | 11 | 48.9ms | 565ms |
| `app-composer` | 98,711 | 0 | 7.8ms | 93ms |
| `bubbles-cloud` | 32,571 | 0 | — | — |
| `loftwah-fighter` | 26,756 | 0 | — | — |
| `foilbury` | 25,928 | 0 | 7.5ms | 111ms |
| `max-web` | 23,898 | **19,872** | 4.2ms | 15.8ms |
| `protocol-11` | 21,086 | 24 | — | — |

### The one real cost lever

`woodhouse-loftwah` spends a median **70ms of CPU per request** — roughly 26× `loftwahfm` and 9×
`app-composer`. Multiplied by its request volume that is on the order of **98 million CPU
milliseconds per month**, and the same page also dominates at the 99th percentile.

Whether that crosses the plan's included CPU allowance, and what the overage costs, is **unknown**:
it depends on the subscription's included CPU and current price, both of which sit behind the
billing scope. What is not unknown is the shape: this site, not any add-on, is the only plausible
source of a variable charge.

The likely driver is request mix rather than render cost. Published visits are around 1,134 a week
while the Worker answers 1.4M requests a month, so the overwhelming majority is crawler and
repeated traffic hitting a route that still renders. That is a testable hypothesis, not a
conclusion, and it belongs to its own change with before/after measurement rather than a speculative
cache-header edit here.

### An operational finding, not a cost one

`max-web` answered **19,872 errors out of 23,898 requests** in 30 days while polling every two
minutes. Whatever the cause, that is a broken surface reporting itself continuously. It is recorded
here because the poll is also the account's most frequent cron.

It is **not** routed as a confirmed defect, because the metric does not distinguish an intentional
`4xx` contract (an authorization probe, a health endpoint refusing anonymous callers) from a failure.
The owning repository's own audit is the right place to classify it, and the observation is passed on
rather than asserted as a bug.

## Decisions

- **Keep** the current architecture. No paid add-on exists to remove, and preview correctly deploys
  with no cron.
- **Adopt** a weekly check in the existing [#16](https://github.com/loftwah/woodhouse-new/issues/16)
  intelligence pass: the four reads in this record, plus a comparison against the previous week.
  That is four API calls, not a service.
- **Defer** the CPU investigation until it can be measured against a real change. The candidate is
  cache lifetime and crawler handling on the main site; it needs a before/after, not a guess.
- **Reject** adding a dashboard, a cron job, a Worker, or any always-on monitor for this.

## What still needs a human or a wider token

1. Verify the alert thresholds in the dashboard: cumulative metered spend at **US$1**, **US$3** and
   **US$5** on top of the Workers Paid base, with a real recipient. There is no API route for these,
   so this cannot be read or set from the repository.
2. Read the current invoice and its components. Requires **Billing: Read**.
3. Reconcile this observed usage against that invoice at cycle close.

Until 1 and 2 happen, "no overage noticed" is not evidence of headroom. The numbers above are the
honest starting point.
