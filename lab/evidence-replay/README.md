# Evidence replay lab

Answers [issue #5](https://github.com/loftwah/woodhouse-new/issues/5). Reviewed 4 October 2026.

## What this is

An executable event-history experiment: can one corpus be replayed into two independent, read-only projections without duplicating an action or exposing anything private?

The lab is disabled by default — nothing here runs unless you run it — and lives outside the request and build paths. It imports only `node:` built-ins.

```sh
pnpm run lab:evidence    # replay the corpus into both projections and print the digests
pnpm run lab:test        # the contract, reducer and failure-injection tests
```

Output lands under the ignored private `.release/lab/evidence-replay/<timestamp>/` and the run prints its own removal command.

## The envelope

One observation per envelope, versioned `loftwah.evidence/1`: stable event id, event type, source, **source revision** (a commit or content hash, so the observation is checkable), occurrence time, observation time, correlation id, visibility and authority. Raw evidence is separated from interpretation — the envelope says what was seen, the projections say what it means.

`validateEnvelope` is total: it returns an envelope or a list of problems, so a consumer handling a malformed event never has to guess. It refuses an unknown schema version, an unknown event type, a missing source revision, an observation dated before the thing it observed, a credential-shaped attribute, and anything over 64 KiB. The corpus is capped at 100 events and 1 MiB, and both caps are enforced rather than documented. `assertCorpusIsPublishable` runs over every event before replay and rejects an email address, a GitHub token, an authorization header, a private key or an EmDash environment value.

## The two projections

**Timeline** — every accepted observation, ordered by occurrence then id. It has a `publicRead` that returns only `public` visibility, which is the only path a publication could ever take.

**Last observed state per project** — the one that has to resist a late arrival. `preferredObservation` prefers an `authoritative` record over a `reported` one regardless of time, prefers the newer observation at equal authority, and breaks an exact tie on event id so replay order cannot change the outcome. The corpus contains both traps on purpose: an older observation arriving later, and a *newer* report trying to displace an authoritative record. Both rejections are recorded in `superseded` rather than quietly dropped.

## What the consumer guarantees, and how it is proven

The ordering is the design:

1. take a lease on a batch
2. validate every envelope in it — refuse the batch if any fails
3. apply to the in-memory projection
4. write the projection snapshot atomically (temp file + rename)
5. **then** write the checkpoint

**Delivery is at-least-once; the projections are idempotent; together they give effectively-once projection state.** A crash between 4 and 5 loses the checkpoint but not the projection, so the batch is redelivered and every event id is recognised. A crash between 2 and 3 leaves the checkpoint untouched, so nothing is skipped. There is no transactional projection-and-checkpoint boundary to rely on, because none is offered — this is the documented recovery mechanism, and it is proven by injection rather than asserted.

Batch is the unit of delivery and therefore the unit of refusal. **There is no per-message dead-letter path and none is assumed.** A poison batch is refused whole, redelivered up to a bound, and then the run halts with the reasons recorded. Skipping one is possible only as an explicit operator decision, is recorded with its offset, and costs the valid events that shared the batch — the test says so rather than hiding it.

Failures covered by tests, each by injection rather than by hope: duplicate delivery, out-of-order arrival, malformed event, unknown schema, unknown type, missing source revision, credential-shaped attribute, backwards dates, oversized input, interrupt before validation, interrupt before apply, interrupt between projection and checkpoint, lost acknowledgement, lease expiry, retry exhaustion, retention expiry, replay from an exported checkpoint, a truncated line on disk, and two consumers pausing and rebuilding independently.

Two properties the tests assert that are easy to lose: each projection checkpoints separately, so one can be left paused while the other completes and either can be rebuilt alone from its exported checkpoint; and a crash mid-write never leaves a `.tmp` file beside a committed snapshot, so the visible file is always a whole document.

## What replay cannot do

Replay only reconstructs derived data. It cannot send email, publish a CMS entry, trigger a build or deploy, mutate GitHub, execute a tool or issue a physical command — not because those are disabled but because this lab imports nothing that could, and its only outputs are two JSON snapshots and two checkpoint files. A future action processor would be separate scope with its own idempotency and authorisation contract.

## Decision: defer

No adoption, and no live K2 test.

The local proof shows the mechanism is sound. What it does not show is that the mechanism is *needed*. Woodhouse's evidence today is an append-only dated record in EmDash plus git history in GitHub. There is no collector, no event stream and no replay path, and no requirement has been recorded that one would fix.

Verified against the announcement rather than recalled: K2 is in public beta for Workers Paid accounts, capped during beta at 10 GB of storage and 30 MB/s produce per stream, unbilled during beta, with anticipated pricing of $0.04/GB produced, $0.04/GB consumed and $0.02/GB-month retained. Three constraints shape any future design: messages are produced and consumed **as batches, at the expense of message-level retries**, so there is no per-message redelivery to lean on; produce latency is about one second at p99 because writes accumulate into segments; and **message keys and key-based ordering are roadmap, not available**. The announcement's own example creates a stream with `"authentication": false`, so an unauthenticated example configuration must never be copied.

**Local storage versus K2, on the actual need.** The need is zero events a day. A local append-only journal and a temp-file rename already give at-least-once delivery, idempotent reducers and an effectively-once projection — proven here, with no network, no account and no spend. K2 would add a network dependency, a beta-stage limit set and a five-minute lease to solve a problem this factory does not currently have.

**K2 versus Basin.** K2's own guidance is to skip it when the destination is R2 or Iceberg and use Basin Pipelines instead. Since no analytical dataset exists here, neither is justified, and adding a K2 hop in front of Basin would be a redundant stage rather than a simpler one.

### No live test was run, and none is claimed

No K2 stream was created, no authenticated ingestion was exercised, no API token was issued, no Discord or limit-increase form was filled in, and no provider environment was used. Per the issue, a missing authorised account blocks only the live test; the local proof stands on its own and the defer decision rests on it.

### Exit path

Nothing to unwind. No stream, no binding, no resource, no configuration. Delete the lab output with the command the run prints.

### Revisit trigger

Reopen when **all** of these hold: a Woodhouse requirement exists that genuinely needs retained, replayable event history rather than a dated record and git history; K2 has left public beta with published pricing and limits; and message keys or key-based ordering have shipped, so ordering can be reasoned about rather than inferred. Absent the first there is nothing to solve, and absent the other two there is nothing safe to build on.