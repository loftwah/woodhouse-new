# Artifacts workspace lifecycle lab

Answers [issue #6](https://github.com/loftwah/woodhouse-new/issues/6). Reviewed 4 October 2026.

## What this is

An executable proof of the one thing worth checking about Cloudflare Artifacts: does an isolated, task-scoped workspace with a portable Git export work well enough to be worth adopting?

The lifecycle is implemented against a small store interface and exercised over ordinary local Git. Two task workspaces fork the same base, each makes a scoped change, each diff is inspected, each result is exported as a standard Git bundle, each bundle is restored into an empty checkout, the change is verified **there**, and the task refs are cleaned up.

```sh
pnpm run lab:artifacts           # the documented run; prints a report
pnpm run lab:artifacts -- --keep # keep the bundles and checkouts (default: keep)
pnpm run lab:test                # the contract and failure tests
```

Artefacts land under the ignored private `.release/lab/artifacts-lifecycle/<timestamp>/` and are deleted with `rm -rf` on that directory. Nothing is written outside it, and nothing here is a source file.

## What it proves, and what it does not

**Proves:** fork, scoped change, diff, portable export, restore into a clean checkout, verification in that checkout, provenance (base commit, task identity, result commit) surviving the round trip, retained results surviving workspace deletion, scoped and idempotent cleanup, and that a hook arriving inside a repository is never executed.

**Does not prove:** anything about Cloudflare Artifacts. No Artifacts namespace, binding, token, account or spend was used. The store here is a set of local Git branches, and every record the run prints says so. This is the failure mode the issue warns about — a local run presented as cloud evidence — so the report states its own boundary and the tests assert that each task record is marked as a simulation.

## The operation being improved

Concrete, not general: **starting an isolated task, editing in it, and getting the result back out in a form ordinary Git understands, without leaving anything behind.** In this factory that is what every agent task does. The baseline is `git branch` plus `git bundle`; there is no second scheduler, foreman or control plane here.

Two implementation choices came directly out of writing the tests:

- **Changes are built with Git plumbing against a throwaway index** — `hash-object`, `update-index --cacheinfo`, `write-tree`, `commit-tree`, `update-ref` — rather than by writing the working tree and committing. Nothing checks out, nothing moves HEAD, no hook can run, and the fixture's own working tree still holds the baseline content afterwards. An earlier version wrote the working tree and then tried to repair HEAD; it corrupted the base branch and the tests caught it.
- **Cleanup deletes exactly one ref.** `git update-ref -d refs/heads/task/<id>`, scoped, idempotent, and it leaves every other task's workspace and the base branch alone. A retried start for the same task id lands on the same base commit instead of failing or drifting.

## Decision: defer

No adoption, and no live trial.

The local proof shows the lifecycle works, and the honest conclusion from it is that ordinary Git already provides everything this lab exercises: named isolated workspaces, a real diff, a portable bundle, provenance in the commit graph, and scoped cleanup. Artifacts' documented additions — programmatic fork, repo-scoped Git tokens, event subscriptions, Workers Builds — are a *different* way to do that, not a capability the local baseline lacks.

What was not measured, and therefore not claimed: whether Artifacts reduces wall-clock time or operational friction for this factory. The lab cannot measure that, because there is no Artifacts environment to compare against and creating one is not authorised. **MP has not joined a waitlist, created a namespace, or spent anything under this issue.**

The documented facts that would shape a real trial, from [PLATFORM.md](../../PLATFORM.md): open beta on Workers Paid; billing starts 15 October 2026 on operations and stored data; namespace jurisdiction is **US or EU only**, so Australian residency is not offered; storage separation is not process or OS sandboxing; and push-event subscriptions are capable of creating an unbounded trigger loop if wired to deploys.

### Exit path

Nothing to unwind. No account, no resource, no binding, no configuration. The lab is ordinary Node and `git`.

### Revisit trigger

Reopen when **all** of these hold: Artifacts reaches general availability with published per-operation pricing; the US/EU jurisdiction question has an answer that suits this factory; and a task in the last quarter was measurably slowed by workspace setup rather than by the work itself. Absent the first two there is nothing to evaluate, and absent the third there is no problem to solve.

### Not authorised, and not done

No competition entry, no account or signup, no new paid commitment, no private-source upload, no production provisioning or deployment, no cross-project workflow replacement, no GitHub Actions and no Workers Builds.