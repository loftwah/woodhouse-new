# Cloudflare platform capability guide

Reviewed **Sunday, 4 October 2026 at 11:18 pm AEDT (Melbourne)** / **Sunday, 4 October 2026 at 12:18 pm UTC**. Machine-readable: `2026-10-04T12:18:36Z`.

This is the canonical record of what the Cloudflare platform offers this factory, what we actually use, and what we decided about the rest. It exists so that an agent reading it does not have to rediscover the same eight announcements, and so that a decision made once is not silently reopened by a later blog post.

It is a capability and decision record, not a description of Woodhouse. For how Woodhouse itself is built and deployed, read [ARCHITECTURE.md](ARCHITECTURE.md).

## How to read this document

Three kinds of statement appear here and they are never mixed:

- **Documented** — what Cloudflare's own announcement or product documentation says, with a link. Verified against the source on the review date above.
- **Verified here** — something an authorised environment in this account actually did. Nothing in this document is in that category. Every capability below is documented-only, because no capability below has been enabled, trialled or provisioned in this account.
- **Unknown** — not established by either. Recorded as unknown rather than guessed.

Installing a package, adding a document, or having access to an account does not prove a runtime integration. Nothing here has.

## Summary

| Capability | Documented availability | Account access | Decision | Owned by |
| --- | --- | --- | --- | --- |
| [K2 event streams](#k2-event-streams) | Public beta, Workers Paid | Not provisioned, not trialled | Defer pending a bounded experiment | [#5](https://github.com/loftwah/woodhouse-new/issues/5) |
| [Managed Cloudflare OS](#managed-cloudflare-os) | Waitlist for managed; the software itself is open source today | Waitlist not joined; no self-hosted deployment | Not needed now, with a revisit trigger | This document |
| [Artifacts](#artifacts) | Open beta, Workers Paid | Not provisioned, not trialled | Defer pending a bounded experiment | [#6](https://github.com/loftwah/woodhouse-new/issues/6) |
| [KV Instant](#kv-instant) | Private beta | Not requested | Not a fit — the limits exclude our use | [#2](https://github.com/loftwah/woodhouse-new/issues/2) |
| [Basin](#basin) | Generally available | Not provisioned | Not needed; no analytical dataset | Asset Hunter outcomes, in its own repository |
| [Modern Workers cryptography](#modern-workers-cryptography) | Opt-in, available today | Not enabled | Not needed; no post-quantum requirement | MAX security programme, in its own repository |
| [AI Search](#ai-search) | Generally available | Not provisioned | Not needed; search is already solved | Asset Hunter reference-search outcome, in its own repository |
| [Sovereign AI and model choice](#sovereign-ai-and-model-choice) | Position, not a product | Not applicable | No decision; no model is routed by this site | Asset Hunter model-contract outcome, in its own repository |

Work that belongs to another repository is referenced, not reproduced. See [Ownership](#ownership).

---

## K2 event streams

- **Documented availability.** Public beta, for accounts on Workers Paid. Limits during beta: at most 10 GB of storage, and 30 MB/s produce per stream. Usage is not billed during the beta. Anticipated pricing once billing begins: $0.04/GB produced, $0.04/GB consumed, $0.02/GB-month retained. A partitioned, durable log implemented on R2 object storage.
- **Account access.** Not provisioned. Not trialled. No stream created.
- **Workload fit.** K2 is built for high-scale data movement, long retention and fan-out consumption where consumers read in batches. Its own guidance is to use Basin Pipelines instead when the destination is object storage or Iceberg, and K2 when doing custom processing or writing elsewhere. Messages are produced and consumed as batches "at the expense of message-level retries"; there is no per-message dead-letter behaviour to design around. Consuming returns a five-minute lease that the client can ack, nack or extend.
- **Existing baseline.** Woodhouse's evidence today is an append-only dated record in EmDash plus git history in GitHub. `AGENTS.md` names GitHub as authoritative for repository and work state. There is no event stream, no collector and no replay path.
- **Chosen action.** Defer. The bounded experiment in [#5](https://github.com/loftwah/woodhouse-new/issues/5) decides whether a replayable evidence collector would help at all. This document records the capability; it does not authorise the collector.
- **Costs and limits.** As above. Three things to design around rather than discover later: message keys and key-based ordering are on the roadmap and **not available today**; push-based worker consumers are roadmap; produce latency is about one second at p99 because writes are batched into segments. Kafka client compatibility is roadmap.
- **Data and security boundary.** K2 is a log, so anything produced into it is retained. Woodhouse's publication boundary forbids private repository bodies, conversation content, credentials, audio and large binaries in a public record. A K2 stream would need the same envelope discipline, and a stream endpoint created with HTTP access can be created unauthenticated — the documented example does exactly that, so an unauthenticated example configuration must never be copied.
- **Known unknowns.** Beta limits and the anticipated pricing are not commitments. Retention behaviour past the beta, and the real recovery story for a projection checkpointed against a five-minute lease, are unproven.
- **Source.** [Announcing Cloudflare K2: serverless event streams](https://blog.cloudflare.com/cloudflare-k2-streams/), published 1 October 2026, last modified 2 October 2026. [Product documentation](https://developers.cloudflare.com/k2/).
- **Re-check trigger.** Re-read before any adoption decision, and whenever the beta ends or the roadmap items above reach general availability.

## Managed Cloudflare OS

- **Documented availability.** Cloudflare OS is open source and available today at `github.com/cloudflare/cloudflare-os`, and can be deployed into your own Cloudflare account. The fully managed option is **waitlist only**: "join the waitlist and we'll reach out". Provisioning it needs a custom domain, the applicable Cloudflare Access policies, and an AI Gateway to connect. Since the original announcement it has gained GitHub repository mounting (search and edit files, create commits, push, open pull requests), a Google Workspace gatekeeper that can read and draft Gmail and reach Drive, and export to xlsx, CSV, PDF, Markdown and HTML — Word and PowerPoint export is stated as coming soon.
- **Account access.** The waitlist has not been joined. No self-hosted deployment exists. Nothing about this capability has been proven in this account, and the managed product is not available to us.
- **Workload fit.** See the assessment below.
- **Existing baseline.** See the assessment below.
- **Chosen action.** Not needed now. See [Managed Cloudflare OS fit assessment](#managed-cloudflare-os-fit-assessment).
- **Costs and limits.** No managed pricing is published, because the managed product is waitlisted. Self-hosting means someone configures, operates and keeps the deployment up to date — an operational responsibility that would be added, not removed.
- **Data and security boundary.** A GitHub mount is not a sandbox. It does not establish a qualified execution environment, a production release gate, or permission to run arbitrary tools. Cloudflare OS reaching Google Workspace expands the systems an agent can touch, which is a wider blast radius than the current model, not a narrower one.
- **Known unknowns.** Managed pricing, managed data residency, and what "managed" actually removes operationally. All unknown while the product is waitlisted.
- **Source.** [Cloudflare OS: your company's agent workspace, managed for you](https://blog.cloudflare.com/managed-cloudflare-os/), published 1 October 2026. [Cloudflare OS open-source repository](https://github.com/cloudflare/cloudflare-os).
- **Re-check trigger.** Revisit only if a concrete gap appears — see the trigger recorded in the assessment.

### Managed Cloudflare OS fit assessment

**The existing task lifecycle, in public-safe terms.** MP holds authority and sets scope. A task starts as a branch or worktree in an ordinary local git checkout. Verification is the repository's own checks plus a build. Review is a human decision recorded in the git history. Release is a guarded deploy path that refuses to run until its recorded evidence is present, and which verifies afterwards that the live origin reports the source it intended to ship. Durable evidence is git history, GitHub issues and pull requests, and private release receipts under an ignored directory.

**Compared against what we actually need.**

| Requirement | Current model | Managed Cloudflare OS | Self-hosted Cloudflare OS |
| --- | --- | --- | --- |
| Repository-scoped authority | GitHub is authoritative by decision | Would add a GitHub mount; authority unchanged | Same |
| Tool permissions | Local agent scope, per task | Workspace-level skills and context | Same |
| Safe concurrent work | Branches and worktrees | Would add isolated workspaces | Same |
| Durable handoff | Git history and GitHub issues | Would add a shared workspace state | Same |
| Source and result provenance | Commit, review date, build identity | Would add workspace identity, not stronger provenance | Same |
| Audit and export | Git history plus recorded receipts | Would add its own audit surface to reconcile | Same |
| Credential revocation | Local credentials, revocable at the source | Adds a credential store to revoke | Same |
| Data retention and deletion | Git plus Cloudflare account | Adds a third retention surface | Same |
| Isolation | Not a sandbox today, and does not claim to be | **Not established** — a mount is not isolation | Same |
| Failure recovery | Time Travel and R2 recovery drills | Unchanged | Unchanged |
| Operational cost | No additional service to run | Managed: unknown price; self-hosted: a service to operate | Highest |

**What would actually disappear or improve.** Stated honestly, the candidate list is short: a shared agent workspace, a durable handoff that is not a git branch, and centralised credential scoping. Each is currently either adequate — git is a durable handoff and GitHub is a credential scope — or owned by GitHub, which the factory has already decided is authoritative. The honest conclusion is that nothing would disappear, and the improvements are conveniences rather than gaps.

**What documentation does not establish.** That a GitHub mount is a qualified sandbox. That Cloudflare OS can hold a release gate. That the managed product is available to this account at all.

**What an authorised environment would prove.** That a self-hosted deployment can be configured, scoped and operated at acceptable cost. That cannot be tested without provisioning it, which this document does not authorise.

**Decision: not needed now.** Retain the existing operating model. Do not install another control plane because it exists, and do not join a waitlist to find out whether it would help.

**Revisit trigger, concretely.** Reopen this only if all three are true: a specific task in the last quarter could not be completed because the *workspace* was the obstacle rather than the code; GitHub issues or PRs demonstrably lost handoff information a task needed; and MP decides the convenience is worth a paid commitment. Absent all three, this stays closed.

## Artifacts

- **Documented availability.** Open beta, for customers on the Workers Paid plan. Pricing is based on repository operations and stored data, and **billing begins on 15 October 2026**. It ships a Workers binding that can create and fork repositories, inspect files and commits, and issue repo-scoped Git tokens; event subscriptions for created, imported, forked, deleted, pushed, cloned and fetched events; a Workers Builds integration that deploys the production branch and creates Workers Previews for other branches; and dashboard and API metrics.
- **Account access.** Not provisioned. Not trialled.
- **Workload fit.** A versioned filesystem that speaks Git, designed for one repository per agent, session or task. That is close to what the factory already does with branches and worktrees, which is why the question is worth an experiment rather than an opinion.
- **Existing baseline.** Branches and worktrees in an ordinary local checkout, GitHub as the authoritative issue, review and merge system.
- **Chosen action.** Defer pending the bounded lifecycle and export experiment in [#6](https://github.com/loftwah/woodhouse-new/issues/6).
- **Costs and limits.** Operations and stored data, from 15 October 2026. The jurisdiction choice is **US or EU**, set when a namespace is created. Australian residency is not offered, and free operation should not be assumed past the beta. Storage separation is not process or OS sandboxing: an Artifacts fork is not a place to run untrusted code.
- **Data and security boundary.** Forked content and any Git hooks or scripts inside it are untrusted input. A push event subscription must stay observational — connecting it to auto-deploy or to GitHub writes creates an unbounded trigger loop. No Workers Builds or GitHub Actions should be enabled to make an evaluation look complete.
- **Known unknowns.** Actual per-operation pricing, token expiry behaviour, and whether a deleted namespace can still be reached by a fork that was exported from it. All unproven.
- **Source.** [We want you to build the next Git platform on Cloudflare](https://blog.cloudflare.com/next-git-platform-on-cloudflare/), published 1 October 2026. [Artifacts documentation](https://developers.cloudflare.com/artifacts/).
- **Re-check trigger.** Re-read after 15 October 2026, when real billing starts, and before any adoption decision.

## KV Instant

- **Documented availability.** Private beta, by signup. A Workers KV mode powered by Quicksilver, with the same `get`/`put`/`list`/`delete` API.
- **Account access.** Not requested. Private beta access has not been sought.
- **Workload fit.** None for this site, and the limits exclude it rather than merely discouraging it. A KV Instant namespace holds at most 1 MB in total, at most 10,000 key-value pairs, and keys of at most 300 bytes; writes are limited to one per namespace per second; metadata is unsupported, so `getWithMetadata` always returns null; and `list` returns every matching key with no pagination.
- **Existing baseline.** `CACHE` is a Workers KV namespace used as EmDash's object cache, which caches query results and is written on every publish. `SESSION` is a Workers KV namespace for EmDash session state. Both need unbounded values and publish-driven writes.
- **Chosen action.** Not a fit. The 1 MB namespace ceiling is smaller than a single cached entry can be, the one-write-per-second limit is below EmDash's publish rate on a busy edit, and the storage price is $100 per MB per month against Workers KV's $0.50 per GB-month. This is a configuration store for a few small, infrequently written flags.
- **Costs and limits.** Reads $0.20 per million, which is 60% cheaper than classic Workers KV. Writes $0.10 **per operation**, against $5.00 per million for classic KV. Storage $100 per MB-month against $0.50 per GB-month. The cheap-read headline is real and irrelevant to a cache of large values.
- **Data and security boundary.** Unchanged. Nothing here is a database, a cache tier upgrade, or a CMS backend.
- **Known unknowns.** Post-beta pricing and whether the namespace ceiling changes. Neither would change the verdict.
- **Source.** [Introducing Workers KV Instant — powered by Quicksilver](https://blog.cloudflare.com/workers-kv-instant/), published 1 October 2026.
- **Re-check trigger.** Only if a need for a small, globally-replicated configuration store appears that the existing KV namespaces cannot serve.

## Basin

- **Documented availability.** Generally available. An open, serverless data platform on Apache Iceberg and R2, for ingesting, managing and querying large datasets without egress fees.
- **Account access.** Not provisioned.
- **Workload fit.** Analytical. It is the destination-shaped service for data you intend to query, not a transactional store. Woodhouse has no analytical dataset: its content model is a published read model that is queried through EmDash's own query layer.
- **Existing baseline.** D1 for structured content, R2 for media and backups, KV for caching. No lakehouse.
- **Chosen action.** Not needed here. If an analytical ingestion and query need appears, compare Basin directly with a simpler baseline rather than assuming it. Do not put a K2 hop in front of Basin: K2's own guidance is to skip it when the destination is R2 or Iceberg.
- **Costs and limits.** No egress fees; storage and query costs are not recorded here because we have no measured workload to attach them to.
- **Data and security boundary.** An analytical copy of permitted data. Anything ingested must already be publishable, because a lake is durable and queryable.
- **Known unknowns.** Query performance characteristics at our data volumes — irrelevant at zero volume.
- **Source.** [Introducing Cloudflare Basin: an open, serverless data platform, now generally available](https://blog.cloudflare.com/cloudflare-basin/), published 1 October 2026.
- **Re-check trigger.** When a real analytical dataset exists, not before.

## Modern Workers cryptography

- **Documented availability.** Opt-in support in Workers for the post-quantum-resistant algorithms ML-KEM and ML-DSA, available to try today.
- **Account access.** Not enabled. Opt-in has not been turned on.
- **Workload fit.** Only for a workload that has a stated post-quantum requirement and has inventoried what each algorithm is protecting. Woodhouse has no such requirement: TLS and session handling are the platform's, and `EMDASH_ENCRYPTION_KEY` protects plugin settings under a key the operator holds out of band.
- **Existing baseline.** Platform TLS, EmDash session handling, and an operator-held encryption key with a recorded out-of-band recovery reference.
- **Chosen action.** Not needed. The cryptography programme belongs to the MAX security work in its own repository, which should inventory purpose and cross-runtime contracts before any algorithm change. A blanket swap here would be a change with no requirement behind it.
- **Costs and limits.** No pricing impact documented. The cost is compatibility: a cross-runtime contract that differs between the Worker and anything that must read the same data.
- **Data and security boundary.** This changes cryptographic guarantees. It is not a security-assurance claim and does not change any physical device.
- **Known unknowns.** Which Workers crypto surfaces are covered by the opt-in, and the performance cost on the request path.
- **Source.** [Support for modern cryptographic algorithms in Workers](https://blog.cloudflare.com/workers-ml-kem-ml-dsa-support/), published 1 October 2026.
- **Re-check trigger.** When a named requirement for post-quantum protection exists for a specific surface.

## AI Search

- **Documented availability.** Generally available. Embeds image pixels for visual search, runs optical character recognition on scanned PDFs, accepts files up to 10 MiB, and works with any chat model.
- **Account access.** Not provisioned.
- **Workload fit.** A derived retrieval index over content that is already permitted. Woodhouse's search requirement is over its own published text, and EmDash's FTS5 index already serves it — verified against a live query in both D1 environments.
- **Existing baseline.** EmDash FTS5 over the published collections, plus a generated page index for the keyboard and phone search surfaces. Both are exercised by tests and by a live query.
- **Chosen action.** Not needed here. Visual and document search are genuine capabilities, and the question belongs with Asset Hunter's reference-search outcome, which is a visual catalogue and would actually use image embeddings.
- **Costs and limits.** Per the announcement, pricing is in the post itself; not summarised here because there is no measured workload.
- **Data and security boundary.** An index derived from permitted content does not change what is permitted. EmDash publication and rights decisions remain authoritative; an index must never widen them.
- **Known unknowns.** Cost at catalogue scale, and index staleness behaviour on a content-only publish — the same class of question [#2](https://github.com/loftwah/woodhouse-new/issues/2) already tracks for cached reads.
- **Source.** [AI Search is now generally available](https://blog.cloudflare.com/ai-search-ga/), published 1 October 2026.
- **Re-check trigger.** If search quality over Woodhouse's own text becomes a stated problem that FTS cannot answer.

## Sovereign AI and model choice

- **Documented availability.** A position, not a product: local open-source models, model-agnostic security tools, and a stated commitment to giving nations genuine choice.
- **Account access.** Not applicable. No model is routed by this site.
- **Workload fit.** None directly. Woodhouse runs no inference. The questions it raises — testable portability, explicit data-routing and fallback policy — are real, and they are Asset Hunter's to answer.
- **Existing baseline.** No model dependency in the published site.
- **Chosen action.** No decision. Open weights or provider branding is not a residency guarantee, and a policy statement is not a control.
- **Costs and limits.** Not applicable.
- **Data and security boundary.** A sovereign-ai claim is a routing and jurisdiction claim. It has to be proven by where data actually goes, not by a provider's brand.
- **Known unknowns.** Everything operational; nothing is consumed by this site.
- **Source.** [One year later: Sovereign AI and the fight for choice](https://blog.cloudflare.com/sovereign-ai-choice-one-year-later/), published 1 October 2026, last modified 2 October 2026.
- **Re-check trigger.** When a model is introduced into any factory product and its data routing has to be stated.

---

## Agent rules

1. Follow the owning issue and the current source. This guide is a map, not a backlog. Do not create work from a row here.
2. Re-check the official documentation, capabilities, pricing and availability before introducing or materially changing an integration. Do not turn announced, roadmap or request-access functionality into a shipping assumption. On the review date, three of the eight capabilities above are beta, waitlisted or private.
3. Keep executable local work moving while an unrelated provider or credential gate is blocked. Record the blocked step and continue; do not stop, and do not manufacture a human approval gate for ordinary local work.
4. No GitHub Actions, no new paid commitment, no new metered service and no cloud resource change to make an evaluation look complete.
5. Existing effectful-code conventions, pure domain boundaries and current product priorities remain in force. Do not add a cloud service to a game, a device command or a static page without an issue-specific need.
6. Keep known facts, assumptions, unresolved evidence and adoption decisions distinguishable. Installing a package or adding a document is not proof of a runtime integration.

## Ownership of private detail

Private implementation detail, credentials, audit findings and project instructions belong to the repository that owns them and are not reproduced here. Rows above that name another repository point at that repository's issue or programme; this document records only that the capability was assessed and what was decided, so that the assessment is not repeated from scratch.

## Reviewing this document

Reviewed on the date at the top. Re-check every row before relying on it for a decision, and re-check the whole document when any of the eight announcements changes state — a beta reaching general availability, a roadmap item shipping, or a waitlist opening.