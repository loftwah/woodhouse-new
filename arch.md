# VALUE, AUTONOMY AND THE PHYSICAL WORLD

The Loftwah Software Factory is not limited to producing source code.

Software can reach:

- payment providers;
- manufacturers;
- fulfilment providers;
- printers;
- contractors;
- suppliers;
- logistics services;
- communication systems;
- physical hardware;
- customers;
- human operators.

Once a legitimate external capability has an API, ordering process, service interface or human provider, it can potentially become another part of a larger workflow.

The factory should therefore think in terms of **reachable outcomes**, not merely software artefacts.

The limiting questions are:

1. Is the outcome legal?
2. Is it safe?
3. Do we have the right to create or use the required assets?
4. Is there an authorised provider capable of doing the physical work?
5. Do we have sufficient money or other resources?
6. Does the workflow preserve human authority at consequential boundaries?
7. Can the result be independently verified?

If those conditions cannot be satisfied, the factory does not proceed.

---

# SOFTWARE DOES NOT HAVE TO END AT THE SCREEN

MAX is an obvious example.

The final product is not:

> A PWA that passes its tests.

The intended result is a real walker with:

- computing hardware;
- microphone;
- speaker;
- lighting;
- power;
- connectivity;
- physical mounting;
- real-world FIND and STOP behaviour.

Software can specify the bill of materials.

Agents can research compatible components.

Software can maintain the procurement state.

Agents can generate wiring diagrams, enclosure specifications, installation documentation and bench-test procedures.

Suppliers can provide components.

A fabrication service can produce an enclosure.

A human can assemble or install hardware where required.

The factory can then ingest physical test evidence and decide what remains unproven.

The same pattern applies elsewhere.

A design does not have to stop at an image.

An approved asset could become:

- clothing;
- posters;
- books;
- packaging;
- stickers;
- signage;
- cards;
- merchandise;
- printed technical material;
- promotional items;
- fabricated parts.

A provider such as Printful exposes ordering and webhook interfaces that allow software to participate in fulfilment and react to order/shipping events.

The factory is not manufacturing the shirt.

It is coordinating a system in which another authorised party manufactures and fulfils the shirt.

That distinction matters.

---

# THE FACTORY IS A CAPABILITY COMPOSER

This idea is older than AI.

The operator originally assembled websites by remembering which WordPress plugin did each job best.

The same instinct survives.

A capable factory asks:

> Who or what is already exceptionally good at this part?

Then composes that capability rather than automatically rebuilding it.

For example:

```text
Intent
  ↓
Generated artwork
  ↓
Visual review
  ↓
Rights / policy review
  ↓
Print specification
  ↓
Product mock-up
  ↓
Human approval
  ↓
Published product
  ↓
Payment
  ↓
Fulfilment provider
  ↓
Physical object
  ↓
Shipping event
  ↓
Customer
```

The factory may coordinate the chain.

It does not pretend that every link belongs to us.

---

# MONEY IS AN EVENT, NOT A SUCCESS PAGE

Commercial workflows require stronger discipline.

For a normal customer checkout, use an appropriate payment-provider workflow such as Stripe Checkout.

Do not treat:

> Customer returned to `/success`

as proof of payment.

Payment state is authoritative through the payment provider and its event system.

Stripe's current guidance explicitly places fulfilment behind webhooks rather than the browser return page because customers may never return successfully, asynchronous payment methods can settle later, and a completed checkout session may not yet represent a paid order.

The model should therefore be:

```text
CUSTOMER
   ↓
CHECKOUT
   ↓
PAYMENT PROVIDER
   ↓
SIGNED PAYMENT EVENT
   ↓
VALIDATE
   ↓
DEDUPLICATE
   ↓
ORDER LEDGER
   ↓
FULFILMENT WORKFLOW
```

Every consequential external mutation requires an idempotency strategy.

A retry must not accidentally:

- charge twice;
- order two shirts;
- create two shipments;
- send two refunds;
- provision two accounts;
- publish the same release twice.

Stripe supports idempotency keys specifically so safely repeated requests do not duplicate operations.

WOODHOUSE should treat this as a general factory rule rather than a Stripe-specific trick:

> **Every externally consequential operation must answer: what happens if this executes twice?**

---

# EVENT-DRIVEN AI

AI generation should increasingly be triggered by meaningful events rather than only manual chat prompts.

Possible events include:

- project reaches a milestone;
- GitHub issue closes;
- release reaches production;
- customer completes a purchase;
- product inventory changes;
- a new project is created;
- a scheduled audit becomes due;
- an article is approved;
- a customer submits configuration data;
- physical shipment is dispatched;
- production validation fails;
- visual review rejects a release.

An event may cause the factory to generate:

- copy;
- images;
- diagrams;
- video;
- documentation;
- test cases;
- promotional material;
- product variants;
- support information;
- release reports;
- incident reports.

But:

> **Generation is not publication.**

The event should normally create a candidate artefact.

```text
EVENT
  ↓
GENERATE
  ↓
VALIDATE
  ↓
POLICY
  ↓
REVIEW
  ↓
APPROVE
  ↓
PUBLISH / ORDER / EXECUTE
```

The further the output reaches into the real world, the more important the later stages become.

---

# EXAMPLE: EVENT-DRIVEN MERCHANDISE

Imagine a WOODHOUSE article becomes significant enough to warrant a physical poster.

The factory could:

1. recognise the eligible event;
2. generate several poster concepts;
3. run UNSLOP and visual review;
4. check dimensions and print requirements;
5. record asset provenance;
6. verify that artwork does not intentionally misuse protected marks or unauthorised likenesses;
7. create Printful-compatible assets;
8. create product mock-ups;
9. prepare catalogue copy;
10. present the complete product candidate to Dean.

Nothing has been sold yet.

Dean can:

**APPROVE**

**RETURN WITH NOTES**

**REJECT**

Only approval promotes the candidate into the commercial catalogue.

Then:

```text
customer order
   ↓
payment confirmed
   ↓
durable order workflow
   ↓
Printful order
   ↓
provider webhook
   ↓
shipment state
   ↓
customer notification
```

Printful itself retries failed webhook deliveries at increasing intervals, which reinforces why event handlers must be idempotent rather than assuming each event arrives exactly once.

---

# SCHEDULED IMPROVEMENT

The factory does not need to wait for Dean to notice every opportunity.

A mature project can have scheduled systems that periodically ask:

- Has anything broken?
- Has performance regressed?
- Have dependencies aged?
- Are screenshots stale?
- Has documentation diverged?
- Have search results changed?
- Are structured-data results still valid?
- Are production screenshots still visually acceptable?
- Is there a new browser/device class worth testing?
- Are any issues stale?
- Does current product behaviour contradict closed work?
- Are there repeated support/customer failures?
- Have APIs or platform capabilities materially changed?
- Can any recurring manual task now be automated safely?

Cloudflare Agents currently support durable delayed, cron and interval scheduling, including retry behaviour and persisted schedules.

However:

> **Scheduled improvement does not mean scheduled production mutation.**

The default output is:

```text
OBSERVATION
  ↓
PROPOSAL
  ↓
ISSUE / CHANGESET
```

not:

```text
cron
  ↓
YOLO PRODUCTION
```

---

# READ PRODUCTION. PROPOSE CHANGES.

For mature commercial systems, autonomous agents should normally have broad **read authority** and narrow **write authority**.

They may inspect:

- production application state;
- observability;
- public pages;
- deployments;
- logs where policy allows;
- current GitHub state;
- configuration metadata;
- customer-impact evidence appropriately redacted;
- health and performance indicators.

They should not casually mutate production.

The normal path is:

```text
PRODUCTION
     │
     │ READ
     ▼
   AGENT
     │
     │ PROPOSE
     ▼
 CHANGESET
     │
     ├── evidence
     ├── rationale
     ├── diff
     ├── expected outcome
     ├── risk
     ├── rollback
     └── qualification
     │
     ▼
 POLICY ENGINE
     │
     ▼
 HUMAN GATE
```

Dean then has three core actions:

### APPROVE

The authorised pipeline may execute the already-defined change.

### RETURN

The proposal goes back into the factory with comments or changed requirements.

### DENY

The change does not execute.

The refusal is recorded.

The agent may learn from the decision but must not repeatedly attempt to circumvent it.

---

# THE HUMAN GATE IS A REAL CONTROL

Human approval must not mean:

> Agent asks “okay?” and then continues regardless.

Approval is a durable system state.

For consequential changes:

```text
PREPARED
   ↓
QUALIFIED
   ↓
AWAITING_APPROVAL
   │
   ├── DENIED → CLOSED / REWORK
   │
   ├── RETURNED → REWORK
   │
   └── APPROVED
          ↓
        EXECUTE
          ↓
        VERIFY
```

Cloudflare Workflows supports exactly the sort of durable execution we want here: individual retryable steps, long-running workflows and pauses that wait for an external event or human approval before continuing.

The workflow can wait hours or days without the agent having to “remember” what it was doing.

That is materially safer than relying on conversational continuity.

---

# POLICY-DRIVEN PIPELINES

Approval is only one control.

A mature project should have machine-enforced policies determining what agents are allowed to propose and what requires additional gates.

Example:

```text
CHANGE: article typo
risk: trivial
approval: optional

CHANGE: CSS on public marketing page
risk: low
approval: normal release policy

CHANGE: checkout behaviour
risk: commercial
approval: mandatory

CHANGE: production database migration
risk: high
approval: mandatory + backup + rollback proof

CHANGE: send refund
risk: financial
approval: mandatory unless an explicit bounded refund policy permits it

CHANGE: place physical supplier order
risk: financial + physical
approval: mandatory

CHANGE: hardware affecting safety-critical behaviour
risk: physical
approval: mandatory + physical validation
```

We are not trying to remove Dean from consequential judgement.

We are trying to ensure that Dean is involved **only where judgement or authority is actually valuable**.

---

# EVERY FAILURE BECOMES MATERIAL

A production failure is not simply fixed and forgotten.

The factory should ask:

> What kind of failure was this?

Then decide whether it belongs in:

- a bug;
- a change request;
- an incident;
- a regression test;
- a policy rule;
- an UNSLOP rule;
- an architectural decision;
- a monitoring rule;
- a release gate;
- a documentation correction.

The ideal lifecycle:

```text
FAILURE
   ↓
CONTAIN
   ↓
RECORD
   ↓
INVESTIGATE
   ↓
CLASSIFY
   ↓
FIX
   ↓
VERIFY
   ↓
GENERALISE
   ↓
NEW CONTROL
```

The evidence chain remains linked:

```text
incident
   ↕
issue
   ↕
PR
   ↕
commit
   ↕
qualification
   ↕
production release
```

A recurring failure should eventually become difficult to reproduce because the factory has encoded what it learned.

That is one of the central ideas WOODHOUSE exists to demonstrate.

---

# NOT EVERY PROJECT DESERVES THIS MUCH PROCESS

This is equally important.

The factory must not impose commercial-grade process on a disposable experiment.

Governance is expensive.

So is perfect test coverage.

So is production change control.

So is independent review.

A two-hour experiment does not need the compliance machinery of a product taking customer payments.

Process must **scale with value**.

---

# PROJECT VALUE CLASSES

Every project receives an explicit value class.

This controls how much effort, evidence, automation and governance the factory applies.

## CLASS 0 — THROWAWAY

Purpose:

Find out whether an idea works.

Characteristics:

- disposable;
- no users;
- no promise of persistence;
- little or no maintenance expectation;
- minimal architecture constraints;
- may be deleted freely.

Factory behaviour:

**Move extremely fast.**

Do not spend three days constructing CI for a two-hour experiment.

---

## CLASS 1 — EXPERIMENT

Purpose:

Learn something worth preserving.

Characteristics:

- useful code may emerge;
- some evidence matters;
- no significant external dependency;
- still cheap to replace.

Factory behaviour:

- preserve useful findings;
- basic tests where they accelerate learning;
- avoid premature commercial architecture;
- document important discoveries.

---

## CLASS 2 — PROJECT

Purpose:

Build something we intend to keep using or developing.

Characteristics:

- durable repository;
- meaningful architecture;
- issue tracking;
- repeatable build;
- project identity;
- longer-lived assets.

Factory behaviour:

- GitHub becomes authoritative;
- design doctrine becomes relevant;
- regression coverage grows;
- release process becomes explicit.

---

## CLASS 3 — PRODUCT

Purpose:

A coherent experience intended for real users.

Characteristics:

- user-facing;
- production environment;
- supportable;
- design quality matters;
- privacy/security matters;
- production state matters.

Factory behaviour:

- DONE = PRODUCTION;
- independent review;
- production smoke;
- accessibility;
- security;
- performance;
- evidence-backed status.

---

## CLASS 4 — COMMERCIAL

Purpose:

A product involving customers, money, promises or meaningful reputation.

Characteristics may include:

- payments;
- paid customers;
- contractual expectations;
- fulfilment;
- customer data;
- public brand risk;
- business continuity.

Factory behaviour becomes materially stricter:

- protected production;
- read-heavy / write-controlled agent access;
- policy-driven deployment;
- durable change records;
- human approval for consequential mutations;
- payment-event correctness;
- idempotency;
- rollback;
- incident management;
- backups;
- stronger security;
- auditability.

This is the point where the factory deliberately accepts additional friction.

Before this point, that friction may actively damage exploration.

---

## CLASS 5 — TREASURED / HIGH CONSEQUENCE

Not necessarily the highest-revenue project.

This class means:

> Losing, corrupting or mishandling this would genuinely matter.

Reasons might include:

- irreplaceable creative work;
- important historical data;
- substantial customer impact;
- significant revenue;
- costly physical assets;
- high replacement cost;
- strong reputation;
- accumulated evidence/history;
- real-world safety consequences.

Factory behaviour:

- backup and restore are independently proven;
- destructive operations are difficult;
- permissions are narrow;
- important changes require explicit approval;
- critical assets have provenance;
- disaster recovery is exercised rather than assumed;
- physical consequences receive physical validation.

A project may become treasured without becoming a large business.

Value is not revenue alone.

---

# PROMOTION IS EXPLICIT

A project does not accidentally acquire enterprise process because an agent thought it was a good idea.

Value-class promotion is deliberate.

Example:

```text
Throwaway
   ↓
"This is actually fun."
Experiment
   ↓
"We're keeping this."
Project
   ↓
"Other people should use this."
Product
   ↓
"Someone is paying us."
Commercial
   ↓
"This would genuinely hurt to lose."
Treasured
```

Promotion changes the policy profile.

It may activate:

- additional tests;
- backups;
- independent review;
- production protections;
- incident handling;
- monitoring;
- stronger identity/security;
- approval gates.

The key principle:

> **Do not burden an idea with the controls required by the company it might someday become.**

Let it earn those controls.

---

# HONEST VALUATION

The factory should not call eight repositories “eight startups”.

It should not describe prototypes as companies.

It should not value a product at millions of dollars because an agent calculated a hypothetical market.

We value what exists.

Relevant dimensions include:

- actual revenue;
- actual customers;
- usage;
- uniqueness;
- replacement cost;
- development history;
- quality;
- data;
- audience;
- brand;
- operational maturity;
- dependency on the asset;
- difficulty of recreating it;
- personal/creative significance.

WOODHOUSE should therefore be comfortable saying:

> This is a disposable experiment.

or:

> This is technically impressive but commercially worthless today.

or:

> This has no revenue but contains work we consider difficult to replace.

or:

> This is an actual commercial product.

or:

> This project is currently parked.

That honesty increases the credibility of everything else.

---

# AUTONOMY IS EARNED

The factory should not grant unrestricted power because an agent is capable.

A capability becomes more autonomous after repeated evidence that the surrounding controls are sufficient.

The progression might look like:

```text
OBSERVE
  ↓
RECOMMEND
  ↓
PREPARE
  ↓
EXECUTE IN SANDBOX
  ↓
EXECUTE WITH HUMAN APPROVAL
  ↓
AUTOMATE WITH POLICY
```

The final step is not universally desirable.

Some actions should permanently retain human approval.

For example:

- high-value purchasing;
- major financial transfers;
- destructive production changes;
- important public statements;
- risky physical changes;
- legal commitments.

The factory's purpose is not:

> Remove humans.

It is:

> **Spend human judgement where human judgement has the highest value.**

---

# THE ULTIMATE MODEL

The factory increasingly looks like this:

```text
                    HUMAN INTENT
                         │
                         ▼
                     WOODHOUSE
                         │
                    decomposition
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          SOFTWARE               SERVICES
          AGENTS                 / PEOPLE
              │                     │
              ├──── APIs ───────────┤
              ├──── vendors ────────┤
              ├──── payments ───────┤
              ├──── fulfilment ─────┤
              └──── hardware ───────┘
                         │
                         ▼
                      REALITY
                         │
                         ▼
                     EVIDENCE
                         │
                         ▼
                    WOODHOUSE
```

The factory does not stop where software stops.

It stops where its legitimate authority, evidence, resources and available capabilities stop.

And whenever the consequence of a mistake becomes meaningful, the system becomes correspondingly more conservative.

That is how the same factory can create:

a disposable browser experiment in two hours;

a production game;

a commercial media product;

a physical merchandise line;

or a smart walker.

Without pretending that all five deserve the same process.

---

# CORE DOCTRINE

**Move quickly while mistakes are cheap.**

**Add controls as value and consequence increase.**

**Let agents observe more than they are allowed to mutate.**

**Require human authority at consequential boundaries.**

**Drive commercial state from durable events, not optimistic UI flows.**

**Make external operations idempotent.**

**Treat failures as raw material for improving the factory.**

**Do not confuse software proof with physical proof.**

**Do not confuse hypothetical value with actual value.**

**Do not impose commercial process before a project earns it.**

**A good factory is not maximally autonomous.**

**A good factory knows where autonomy is appropriate.**