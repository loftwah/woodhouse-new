#!/usr/bin/env python3
"""Apply the 5 October 2026 portfolio review to the Woodhouse seed.

Idempotent: every entry is replaced by id/slug if present, appended otherwise.
Re-run after editing this file; the seed must round-trip byte-identically when
nothing changes.
"""
import json
import sys

SEED = "seed/seed.json"


def sp(t):
    return {"_type": "span", "text": t}


def block(style, t):
    return {"_type": "block", "style": style, "children": [sp(t)]}


def prose(key, *paras):
    return {"_type": "prose", "_version": 1, "_key": key,
            "content": [block(*p) for p in paras]}


def quote(key, q, attribution):
    return {"_type": "pull_quote", "_version": 1, "_key": key,
            "quote": q, "attribution": attribution}


def upsert(entries, item, key="id"):
    ident = item[key]
    for i, existing in enumerate(entries):
        if existing.get(key) == ident:
            entries[i] = item
            return
    entries.append(item)


def main():
    with open(SEED, encoding="utf-8") as fh:
        seed = json.load(fh)

    content = seed["content"]

    # --- New factory snapshot ------------------------------------------------
    upsert(content["factory_snapshots"], {
        "id": "snapshot-2026-10-05",
        "slug": "2026-10-05",
        "status": "published",
        "data": {
            "title": "Factory snapshot · 5 October 2026",
            "reviewed_at": "2026-10-05",
            "source_description": "A portfolio review supplied for this review date, checked against public repository and deployed-origin evidence rather than taken on trust.",
            "scope": "Nine public-safe project summaries. Asset Hunter is re-reviewed from its public repository, its deployed origin and its own recorded backup evidence. The other eight keep their 28 September 2026 review dates: a portfolio-level review is not a fresh review of each project, and re-dating them would claim work that was not done.",
            "editorial_notes": "This snapshot exists because a supplied portfolio analysis disagreed with parts of the record, and the disagreements were checkable. Its commercial readings were not adopted; its engineering readings were, where a public origin or a repository could confirm them. Where the analysis and the evidence disagreed, the evidence is recorded as winning.",
            "public_safe": True,
        },
    })

    # --- Re-reviewed Asset Hunter status ------------------------------------
    upsert(content["project_statuses"], {
        "id": "status-asset-hunter-2026-10-05",
        "slug": "asset-hunter-2026-10-05",
        "status": "published",
        "data": {
            "project": "$ref:project-asset-hunter",
            "snapshot": "$ref:snapshot-2026-10-05",
            "project_key": "asset-hunter",
            "snapshot_key": "2026-10-05",
            "state": "Deployed and self-verifying · no external use yet",
            "state_tone": "amber",
            "current": "On 5 October 2026 the public site reported commit 9ee8a75 as its build, its version endpoint answered with that same commit and a clean tree, and the published wall read 40 possibilities. The recent commit history added discovery modes, engine inspection of the bytes it downloads, a reader-side rating withdrawal, a share-card brand-freshness check and a backup-and-restore drill — a product verifying its own operation rather than adding surface.",
            "next_proof": "The next proof is not another mechanism. It is external: whether outside builders or agents complete a real hunt, use what they find and return for another. Until a rating, a rights report or a dispute exists, the tables that would record a person's judgement are empty.",
            "proof_boundary": "A dated observation of one public repository and one public origin on one day. It does not establish external demand, and the absence of recorded use is the finding rather than a gap in the record. It says nothing about the catalogue after 5 October 2026.",
            "reviewed_at": "2026-10-05",
            "sort_order": 9,
            "public_safe": True,
        },
    })

    # --- New evidence records ------------------------------------------------
    upsert(content["evidence_records"], {
        "id": "evidence-asset-hunter-2026-10-05-deployment",
        "slug": "asset-hunter-deployment-2026-10-05",
        "status": "published",
        "data": {
            "title": "Asset Hunter · the origin names its commit, answers a version endpoint, and reads clean",
            "project": "$ref:project-asset-hunter",
            "snapshot": "$ref:snapshot-2026-10-05",
            "project_key": "asset-hunter",
            "snapshot_key": "2026-10-05",
            "claim": "On 5 October 2026 the public Asset Hunter site reported commit 9ee8a75 in its page metadata, its version endpoint returned the same commit with a clean tree, and that commit was the head of the public repository's main branch.",
            "evidence_kind": "production verification",
            "evidence_state": "reviewed",
            "occurred_at": "2026-10-05",
            "reviewed_at": "2026-10-05",
            "summary": "Three things had to agree: the metadata the page renders, the small endpoint a machine can ask, and the repository head. Agreeing is what makes this evidence about a deployed build rather than about a deploy message.",
            "source_label": "The public repository loftwah/asset-hunter and the public site assets.loftwah.com",
            "source_url": "https://github.com/loftwah/asset-hunter",
            "revision": "9ee8a7587822c24d17a17fdaf6a466430cfa0bb2",
            "public_safe": True,
            "proof_boundary": "One observation of one public origin on one day. A later commit, a rollback, a cache or a redeploy could change what the site serves without changing this record. It says which build was served; it says nothing about whether the catalogue is right.",
        },
    })

    upsert(content["evidence_records"], {
        "id": "evidence-asset-hunter-2026-10-05-empty-tables",
        "slug": "asset-hunter-empty-human-tables-2026-10-05",
        "status": "published",
        "data": {
            "title": "Asset Hunter · the backup drill reports that nobody has used it",
            "project": "$ref:project-asset-hunter",
            "snapshot": "$ref:snapshot-2026-10-05",
            "project_key": "asset-hunter",
            "snapshot_key": "2026-10-05",
            "claim": "The project's own production backup, taken on 4 October 2026, records the administrator account and passkey as the only rows in the tables that require data. Ratings, rights reports, disputes, exclusion requests and the moderation audit trail were all empty, and the restore drill exits non-zero because an empty table restoring as an empty table proves nothing.",
            "evidence_kind": "source evidence",
            "evidence_state": "reviewed",
            "occurred_at": "2026-10-04",
            "reviewed_at": "2026-10-05",
            "summary": "This is the most useful thing in the project so far. The catalogue is growing and verified, and the tables that would record a stranger's judgement, report or complaint have never had a row. The failure is the product noticing and refusing to call it green.",
            "source_label": "The backup manifest and restore drill in the public repository loftwah/asset-hunter",
            "source_url": "https://github.com/loftwah/asset-hunter",
            "revision": "",
            "public_safe": True,
            "proof_boundary": "Empty tables on 4 October 2026 do not establish that the product will never be used, that nobody has read it, or that nobody used it and left no row. They establish only that no one has rated, reported, disputed or requested exclusion. That is a statement about recorded behaviour, not about the world.",
        },
    })

    # --- Asset Hunter dossier, revised --------------------------------------
    for project in content["projects"]:
        if project.get("id") != "project-asset-hunter":
            continue
        project["data"]["title"] = (
            "A discovery engine has to be willing to report that nobody is using it."
        )
        project["data"]["summary"] = (
            "Asset Hunter is a discovery engine, not a catalogue. A separate crawl-and-inspect engine reads licences "
            "from the bytes it downloads, groups material into distinct possibilities across games, interface, branding, "
            "motion, audio, 3D, shaders, code and architecture, and publishes them into a public EmDash site on "
            "Cloudflare through a contract rather than by touching the CMS directly. Each possibility carries "
            "representative examples, build notes, a prompt scaffold and a per-example rights statement. The repository "
            "is public, the site is public, and the product verifies its own deployment: it names the commit it was "
            "built from, and its restore drill reports honestly when the data it protects is empty."
        )
        project["data"]["why"] = (
            "It keeps two things apart that are easy to conflate. Learning that a treatment exists is not permission to "
            "copy the asset that demonstrated it, so rights are recorded per example and reference-only material is "
            "never presented as cleared. It keeps a third apart: an engine that can find, classify and publish is "
            "implementation, and shipping it is release, and neither one is demand. Its own backup records that nobody "
            "has yet rated, reported, disputed or objected to anything it found."
        )
        project["data"]["teaches"] = (
            "A public product can publish its own evidence and its own negative evidence. This one names the exact "
            "commit it serves, and its restore drill exits non-zero because the tables that would hold a stranger's "
            "judgement have never held a row."
        )

    # --- Dispatch: the cross-project correction ------------------------------
    upsert(content["dispatches"], {
        "id": "dispatch-four-problems-four-solutions",
        "slug": "four-problems-four-solutions",
        "status": "published",
        "bylines": [{"byline": "byline-dean-lofts"}],
        "taxonomies": {"topic": ["agent-operations", "qualification"]},
        "data": {
            "title": "Four projects solved four different problems.",
            "kind": "Case study",
            "deck": "A portfolio review proposed extracting one shared agent-and-browser safety layer from the games and this site. Reading the actual implementations says the opposite: these are four specific failures with four earned answers, and a shared layer would have had to pick a side in each.",
            "review_date": "2026-10-05",
            "source_reference": "A portfolio analysis supplied for this review date, checked against the private repositories and the deployed origins of Bubbles, SHOALSHOT, Fighter, Asset Hunter and Woodhouse on 5 October 2026. The recommendation is recorded because it was tested and did not survive; no private issue, pull request or conversation body is reproduced.",
            "lead": "The strongest claim in the review was that several projects had independently reinvented the same machinery and should stop. Reading the implementations, they had not reinvented anything. They had each hit a different failure.",
            "lesson": "Repetition of vocabulary is not repetition of semantics. Before extracting what looks like a shared layer, check whether the failures are the same failure.",
            "public_safe": True,
            "projects": [
                "$ref:project-bubbles",
                "$ref:project-shoalshot",
                "$ref:project-fighter",
                "$ref:project-asset-hunter",
            ],
            "content": [
                prose(
                    "the-claim",
                    ("h2", "The claim, stated fairly"),
                    ("normal", "A portfolio analysis of this factory concluded that the clearest hidden asset was not any individual game but the autonomous-engineering machinery the games kept rebuilding: agent contracts, browser contention, deterministic evidence, deployment verification, long-run reporting. It called that repetition the strongest signal in the factory, and recommended a narrowly scoped spike to extract the smallest shared layer and make three projects consume it."),
                    ("normal", "That is a reasonable reading of a portfolio described from the outside. Four projects all run agents against browsers. Four projects all capture screenshots and gate on them. Four projects all verify deployments. The surface really does look like one capability wearing four uniforms."),
                ),
                prose(
                    "the-check",
                    ("h2", "What the implementations actually do"),
                    ("normal", "The proposal came with its own condition attached: verify first, and if the semantics are not the same, do not manufacture the abstraction. So we read them. Four capabilities, four different answers."),
                    ("normal", "Browser contention. Bubbles inspects the process table, walks process ancestry, and refuses to start when another test lane is running — and it separates a person's interactive browser from an automation lane, because those are different claims about the host. SHOALSHOT takes a different shape entirely: an atomic lockfile with liveness reaping and a bounded wait, guarding a resource it owns. Same symptom, different blast radius, different mechanism, different failure mode if you get it wrong. Fighter does neither; it lets the operating system pick a port."),
                    ("normal", "Visual evidence. Bubbles compares against checked-in images with a pixel-difference tolerance, because some of its frames are genuinely animated and a strict comparison would be permanently red. SHOALSHOT compares byte-for-byte, because it pins the clock and the locale and can therefore demand exactness. These are opposite engineering choices about what a passing comparison means. Bubbles risks letting a real change through; SHOALSHOT risks a false alarm. A shared helper would have had to choose, and each project chose against the other's failure."),
                    ("normal", "Long-run reporting. Three projects, three different ideas of what an agent's report is allowed to rest on: an executable terminal proof checked against live repository state, a version-controlled ledger with claims and worktree health, and a written execution contract with a dated backlog census that openly admits its default-branch rules are procedural rather than enforced."),
                    ("normal", "Deployment verification. Four mechanisms, no shared shape. This site publishes a named identity schema and fails a deploy that does not report the fingerprint it intended to ship. Asset Hunter carries its own commit in page metadata, answers a version endpoint, and ships a freshness gate that once wrongly declared a site stale seconds after it deployed. Fighter and SHOALSHOT each wrote their own release manifests. The one artefact genuinely shared across the factory is a doctrine document, referenced by name from more than one repository."),
                ),
                prose(
                    "the-verdict",
                    ("h2", "What survived"),
                    ("normal", "Two things, and neither is a framework."),
                    ("normal", "The first is a pattern rather than a library: the projects learned the same lessons in the same order and recorded them. One project found that a screenshot tool's update mode rewrote only the baseline that had actually changed and reported everything green — and the fix for that became doctrine in another repository, cited by name. Cross-project learning happened in the reasoning, deliberately, with no code moving between repositories."),
                    ("normal", "The second is the opposite finding. No project imports anything from any other. There is no shared package, no workspace link, no common dependency. Each project is self-contained, and that is not an accident of scheduling — it is what the different failure modes require."),
                ),
                quote("pull-quote-1", "The shared asset is the argument, not the module.",
                      "Cross-project review, 5 October 2026"),
                prose(
                    "so-what",
                    ("h2", "What this site does with it"),
                    ("normal", "Nothing is being extracted. The honest outcome of the check is the outcome the recommendation allowed for: no shared primitive, and no justification for one. Manufacturing a framework here would have been the exact failure this publication exists to catch — an abstraction justified by the existence of complicated code rather than by a shared failure."),
                    ("normal", "There is one concrete gap worth naming, and it is not about a shared layer. This site publishes a build-identity shape and describes it as intended for reuse across the factory. No other project in the factory has adopted it; each wrote its own. A published protocol with no adopters is a claim about intent, not about the fleet, and it should be described that way until something else actually uses it."),
                ),
                prose(
                    "the-pattern-that-is-worth-keeping",
                    ("h2", "The part that was worth the exercise"),
                    ("normal", "The useful outcome is not an artefact. It is that a portfolio-level claim about this factory turned out to be checkable, and got checked. A recommendation arrived with a verification condition attached; the condition was honoured; the recommendation lost."),
                    ("normal", "That is the whole method in one pass. A supplied analysis is a hypothesis with good reasoning behind it, not a fact to be republished. Where it matched the evidence we adopted it — including its most uncomfortable finding, which is that Asset Hunter's own backup drill reports that nobody has used it yet. Where it did not match, we recorded the disagreement rather than smoothing it over."),
                ),
            ],
        },
    })

    # --- Dispatch: the negative measurement ----------------------------------
    upsert(content["dispatches"], {
        "id": "dispatch-the-empty-tables-are-the-answer",
        "slug": "the-empty-tables-are-the-answer",
        "status": "published",
        "bylines": [{"byline": "byline-dean-lofts"}],
        "taxonomies": {"topic": ["qualification"]},
        "data": {
            "title": "The empty tables are the answer.",
            "kind": "Field note",
            "deck": "Asset Hunter's backup drill found that the tables holding a stranger's rating, rights report or dispute have never had a row. The useful part is not the zero. It is that the product found the zero, wrote it down, and refused to call the drill a pass.",
            "review_date": "2026-10-05",
            "source_reference": "The public Asset Hunter repository and its production backup manifest, reviewed 5 October 2026. Counts are read from the project's own recorded backup; nothing is estimated.",
            "lead": "A catalogue grew to forty possibilities and learned to name the exact commit it was built from. In the same week, a backup recorded that nobody has rated it, reported it, disputed it, or asked for anything to be left uncrawled.",
            "lesson": "A negative measurement taken and published is worth more than a positive one inferred. The tables that would hold a user's judgement are empty, and the product says so in its own words rather than shipping around it.",
            "public_safe": True,
            "projects": ["$ref:project-asset-hunter"],
            "content": [
                prose(
                    "the-counts",
                    ("h2", "What the backup says"),
                    ("normal", "The production backup taken on 4 October 2026 lists the tables it captured and how many rows each held. The administrator account and its passkey were there, one row each. The schema was there. Eighty-seven revisions were there. The catalogue was there, with forty examples and four curated collections."),
                    ("normal", "The tables that exist so that somebody other than the author can act were empty. Ratings: zero. Rights reports: zero. Disputes: zero. Requests to exclude a source: zero. Moderation audit events: zero."),
                ),
                prose(
                    "why-it-matters",
                    ("h2", "Why that is the most valuable thing in the project"),
                    ("normal", "This is the distinction the whole factory keeps trying to make, appearing for once as a number rather than as a principle. Building a discovery engine is implementation. Shipping it is release. Publishing the commit it was built from is production verification. None of those is demand."),
                    ("normal", "Demand is a person rating something they found, reporting a rights problem they recognised, or disputing a judgement the catalogue made about them. Every mechanism for that exists and works. Not one person has used any of them."),
                    ("normal", "A portfolio review supplied this week reached the same conclusion from the outside and called Asset Hunter the strongest standalone product candidate. Both readings are worth keeping. The product is the most complete thing in the factory. On demonstrated external use it is at zero, and it is the only project that can say so precisely."),
                ),
                quote("pq",
                      "An empty table restoring as an empty table is not evidence that a row in it ever will.",
                      "Asset Hunter restore drill, reviewed 5 October 2026"),
                prose(
                    "the-gate-that-refused",
                    ("h2", "The gate that refused to pass"),
                    ("normal", "The obvious response to a drill that finds empty tables is to make the drill green. This one does the opposite: it exits non-zero over exactly that condition, and says in its own documentation that a drill reporting green across untested tables is the failure it exists to prevent."),
                    ("normal", "That is the behaviour worth copying. A verification step that cannot fail is decoration. This one can fail, it fails loudly for an honest reason, and the failure is about the state of the world rather than about the health of the code."),
                ),
                prose(
                    "what-it-does-not-say",
                    ("h2", "What an empty table does not say"),
                    ("normal", "It does not say nobody has read the site. Reading is not recorded. It does not say the catalogue is wrong, or that anyone arrived and found nothing, or that anyone arrived, was served, and left without a reason that produces a row."),
                    ("normal", "It says precisely this: no one has rated, reported, disputed or requested exclusion. Recorded behaviour is not the world, and this record should not be read as a verdict on the product. It is a measurement, taken honestly, of the thing this factory currently has no evidence for."),
                    ("normal", "What would change it is cheap and unglamorous: outside builders and agents doing real hunts, and then saying what they used. That is the next proof. Another mechanism is not."),
                ),
            ],
        },
    })

    with open(SEED, "w", encoding="utf-8") as fh:
        json.dump(seed, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    print("seed updated")


if __name__ == "__main__":
    sys.exit(main())