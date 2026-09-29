# WOODHOUSE CODE EXORCISM

You are in the root of the WOODHOUSE repository.

Your job is to perform a complete engineering-quality pass over the entire application.

This is not a formatting exercise.

This is not a “make the linter green” exercise.

This is not permission to rewrite working code into fashionable abstractions.

Your job is to find and remove:

- AI-generated slop;
- unnecessary complexity;
- stale code;
- duplicated logic;
- bad abstractions;
- unsafe TypeScript;
- dependency cruft;
- compatibility garbage;
- weak error handling;
- pointless defensive programming;
- hidden runtime assumptions;
- security mistakes;
- performance mistakes;
- accessibility regressions;
- Cloudflare mistakes;
- Astro mistakes;
- EmDash misuse;
- Effect misuse;
- comments that lie;
- tests that prove nothing;
- scripts nobody needs;
- abstractions that exist only because an agent thought “architecture” sounded good.

The desired end state is:

> small, explicit, strongly typed, current, boringly reliable code where boring is appropriate and deliberately sophisticated code where the problem genuinely requires it.

Deletion is a successful outcome.

A smaller diff is often better than a clever diff.

Do not preserve bad code merely because somebody already wrote it.

---

# 0. PRESERVE REAL WORK

Before touching anything:

```sh
git status --short
git diff
git diff --cached
git log -20 --oneline
pnpm list --depth 0
```

Understand all uncommitted work.

Do not:

- reset it;
- stash over it;
- clean it;
- discard it;
- assume `main` is newer;
- overwrite somebody else's current implementation.

Read completely:

- `AGENTS.md`
- `PRODUCT.md`
- `DESIGN.md`
- `ARCHITECTURE.md`
- `UNSLOP.md`
- `EMDASH.md` if present
- `README.md`
- `package.json`
- `tsconfig.json`
- Astro configuration
- Wrangler configuration
- EmDash configuration
- all plugin manifests
- all source directories

Inspect the actual repository before choosing tools or architecture.

---

# 1. BASELINE EVERYTHING BEFORE FIXING IT

Run and record the current state.

At minimum inspect:

```sh
pnpm outdated --recursive
pnpm audit
pnpm build
pnpm exec astro check
```

Use current official tooling to inspect:

- TypeScript errors;
- Astro errors;
- unused files;
- unused exports;
- unused dependencies;
- missing dependencies;
- duplicate dependencies;
- dependency vulnerabilities;
- dependency licences where relevant;
- bundle/runtime output;
- generated Worker size;
- Cloudflare binding/configuration health;
- EmDash doctor/validation;
- EmDash migrations;
- tests;
- browser console errors;
- accessibility problems.

Install Knip unless the repository already has an equivalent tool that does the complete job.

Run both normal and production-oriented analysis where useful.

Do not blindly auto-fix Knip output.

Understand why something appears unused before deleting it.

Generated, framework-discovered and Cloudflare entry points can fool naive static analysis.

---

# 2. UPDATE THE FUCKING STACK

Bring all direct dependencies, development dependencies and package-manager tooling to the latest mutually compatible STABLE versions.

STABLE means stable.

Do not automatically adopt:

- alpha;
- beta;
- RC;
- canary;
- next;
- experimental

merely because their semver number is larger.

Explicitly inspect:

```sh
node --version
pnpm --version
pnpm outdated --recursive
```

Update:

- pnpm;
- Astro;
- TypeScript;
- Wrangler;
- EmDash;
- Cloudflare adapters;
- React packages required by EmDash;
- Effect if adopted;
- checking/linting/testing tooling;
- all other dependencies.

Read migration notes for major versions.

Do not simply run an uncontrolled recursive update and hope.

Upgrade significant major versions individually enough to understand breakage.

Fix code against current supported APIs.

Do not leave compatibility wrappers around old APIs unless there is a real compatibility requirement.

At completion:

```sh
pnpm outdated --recursive
```

should report nothing we intentionally want updated except documented deliberate pins.

Every deliberate pin requires:

- package;
- pinned version;
- reason;
- removal condition.

Update `packageManager` in `package.json` to the actual chosen pnpm release.

Update runtime documentation if Node requirements change.

Do not update generated lockfile metadata by hand.

---

# 3. EFFECT — USE IT WHERE IT MAKES CODE BETTER

Evaluate Effect seriously.

Do not either:

1. reject Effect because native Promise code technically works; or
2. Effect-ify every function in the repository.

Use the CURRENT STABLE release unless this repository already has an explicitly justified prerelease strategy.

Query current official Effect documentation before implementing APIs.

## Strong candidates for Effect

Look especially at:

- EmDash service integration;
- D1 access;
- R2 access;
- KV access;
- Resend;
- Woodhouse enquiry handling;
- external metadata fetching;
- scheduled jobs;
- backups;
- Cloudflare service bindings;
- content/evidence workflows;
- multi-step publication operations;
- retries;
- timeouts;
- concurrency;
- configuration;
- runtime validation;
- operational logging.

## Poor candidates for Effect

Do not introduce Effect merely for:

- Astro markup;
- component props;
- CSS;
- tiny pure transformations;
- static arrays;
- simple sorting;
- formatting strings;
- ordinary rendering logic;
- three-line helpers;
- code that has no meaningful effect, failure or dependency boundary.

## Effect design principles

Where Effect is adopted:

### Validate external data once

Use Effect Schema at actual trust boundaries.

Candidates include:

- environment/configuration;
- request payloads;
- plugin input;
- external HTTP responses;
- persisted JSON;
- MCP input;
- enquiry submissions;
- remote project metadata.

Do not repeatedly validate already trusted internal values.

### Make expected failures typed

Expected failures should not become:

```ts
throw new Error("something went wrong");
```

when callers genuinely need to distinguish them.

Use current Effect-recommended typed/domain errors.

Examples might include:

- InvalidEnquiry
- MediaNotFound
- ProjectMetadataUnavailable
- PublicationBlocked
- ResendDeliveryFailed
- InvalidConfiguration

Do not create twenty error classes when one meaningful error type suffices.

### Unexpected failures remain unexpected

Programmer bugs and violated invariants are not business states.

Do not catch everything and pretend success.

Do not turn every defect into:

```ts
return null;
```

### Services for actual services

Effect services/layers are appropriate for real dependencies such as:

- Resend;
- content repository;
- clock;
- metadata client;
- enquiry store;
- Cloudflare service adapters.

Do not create:

- StringService;
- SlugService;
- ArrayService;
- LoggerFactoryFactory;
- GenericManagerService

to satisfy an architectural aesthetic.

### Run Effects at boundaries

Do not scatter:

```ts
Effect.runPromise(...)
```

through every file.

Compose the program and execute it at appropriate application/framework boundaries.

### Retry only retryable things

Never blindly retry:

- validation failures;
- authentication failures;
- forbidden operations;
- malformed configuration.

Potentially retry bounded transient things such as:

- network timeouts;
- temporary upstream errors;
- selected rate limits.

Use bounded retry policies.

No infinite retries.

### Timeouts

External requests must not be able to hang indefinitely.

Use explicit sensible timeouts around network dependencies.

### Structured concurrency

Where independent I/O genuinely benefits from parallelism, make concurrency explicit and bounded.

Do not turn five dependent operations into fake parallelism.

---

# 4. HUNT AI CODE SMELLS EXPLICITLY

Search the complete repository for characteristic agent-generated garbage.

Do not assume passing tests means the code is good.

## Unnecessary abstraction

Find:

- interfaces with one implementation and no testing/substitution reason;
- wrapper functions that only call another function;
- classes containing only static helpers;
- `Manager`, `Service`, `Repository`, `Factory`, `Provider`, `Handler` abstractions with no meaningful boundary;
- generic utilities used once;
- abstractions introduced before duplication exists;
- hooks around things that are not actually variable;
- indirection that forces five files to understand one operation.

Collapse them.

Prefer:

```text
clear direct code
```

over:

```text
interface
→ adapter
→ implementation
→ service
→ manager
→ helper
→ actual call
```

unless the domain genuinely needs those layers.

---

# 5. REMOVE DEFENSIVE NONSENSE

AI frequently writes code terrified of impossible states.

Find patterns like:

```ts
value?.thing ?? "";
```

when `value` cannot legitimately be absent.

Find:

```ts
array ?? [];
```

when the type already guarantees an array.

Find:

```ts
if (!foo) return;
```

that silently discards a real invariant violation.

Find default values that hide corrupted data.

Find broad fallbacks that turn genuine failures into plausible-looking output.

Examples:

```ts
try {
  return await thing();
} catch {
  return [];
}
```

```ts
return result || defaultResult;
```

```ts
catch {
  // ignore
}
```

Delete unjustified defensive paths.

Make invalid states:

- impossible in the type system;
- rejected at the boundary; or
- explicit failures.

A fallback is allowed only when the PRODUCT actually specifies fallback behaviour.

---

# 6. TYPE SAFETY

Eliminate unjustified:

- `any`;
- implicit `any`;
- `as any`;
- `as unknown as`;
- non-null assertions;
- unsafe index access;
- arbitrary casting;
- giant untyped objects;
- string-key dictionaries hiding a real model.

Prefer:

- inference;
- `satisfies`;
- discriminated unions;
- readonly domain data where appropriate;
- explicit boundary schemas;
- generated EmDash types;
- literal types;
- exhaustive matching where it makes the code safer.

Do not duplicate runtime schemas and TypeScript interfaces if one can safely derive the other.

Do not write:

```ts
interface Foo { ... }
const FooSchema = ...
```

with two manually maintained definitions unless the library genuinely requires it.

Explore stricter TypeScript compiler settings.

Aim for the strongest sensible configuration the frameworks support.

Consider, after verifying compatibility:

- `strict`;
- `noUncheckedIndexedAccess`;
- `exactOptionalPropertyTypes`;
- `noImplicitOverride`;
- `noFallthroughCasesInSwitch`;
- `noImplicitReturns`;
- `noPropertyAccessFromIndexSignature`.

Do not switch on a strict option and then litter the code with assertions to silence it.

Fix the model.

---

# 7. STRINGLY-TYPED GARBAGE

Find places where domain concepts are represented by arbitrary strings.

Examples:

```ts
state: string;
kind: string;
tone: string;
status: string;
```

when only a known finite set is valid.

Replace with actual domain types or schemas.

Do not over-enum things that genuinely are editorial free text.

Use domain modelling where it removes invalid states.

---

# 8. DUPLICATED SOURCES OF TRUTH

Search for values repeated across:

- TypeScript;
- EmDash;
- Astro;
- JSON;
- Wrangler;
- README;
- components;
- RSS;
- sitemap;
- Agent Reception;
- SEO metadata.

Examples:

- site origin;
- Dean's public profiles;
- project count;
- snapshot date;
- navigation;
- collection names;
- routes;
- email configuration;
- state labels.

There should be one appropriate authoritative source wherever practical.

Do not replace a clear constant with an elaborate dependency system merely to deduplicate two harmless literals.

Use judgement.

---

# 9. DEAD CODE

Delete it.

Find:

- unused files;
- unused components;
- unused exports;
- unused functions;
- unused dependencies;
- unused CSS;
- old migrations no longer required by the migration system;
- stale scripts;
- commented-out code;
- abandoned feature flags;
- obsolete compatibility shims;
- dead branches;
- old static content superseded by EmDash;
- duplicate renderers;
- old test fixtures.

Do not create:

```text
deprecated/
legacy/
old/
backup/
unused/
```

inside the repository.

Git is the backup.

If code is genuinely obsolete, remove it.

Knip should finish clean or have extremely small, documented, justified exclusions.

---

# 10. COMMENTS

Remove useless comments.

Delete comments that merely narrate code:

```ts
// Set the title
title = value;
```

Delete AI essay-comments explaining obvious syntax.

Delete stale comments.

Keep comments that explain:

- why;
- non-obvious invariants;
- external constraints;
- browser/platform bugs;
- security boundaries;
- evidence rules;
- deliberate counter-intuitive choices.

A comment should contain knowledge the code cannot naturally express.

---

# 11. NAMING

Audit bullshit names such as:

- data
- result
- temp
- thing
- item
- obj
- manager
- processor
- handler
- utils
- helpers
- common
- service

where a domain-specific name would genuinely improve understanding.

Do not turn normal short local variables into Victorian prose.

Names should match Woodhouse concepts.

---

# 12. FUNCTIONS

Find functions that are:

- enormous;
- tiny but pointless;
- doing unrelated work;
- mutating hidden external state;
- returning ambiguous nullable values;
- parameterised by giant option bags with meaningless booleans.

Prefer cohesive operations.

Avoid boolean APIs like:

```ts
doThing(true, false, true);
```

Use meaningful variants/types where needed.

Do not split every five-line function into six helpers.

---

# 13. BOOLEAN SOUP

Find state represented as combinations like:

```text
isDraft
isPublished
isScheduled
isPreview
isArchived
```

where contradictory combinations are possible.

Where appropriate, model the actual state.

The same applies to evidence state and publication state.

Impossible combinations should ideally be impossible to construct.

---

# 14. ASYNC JAVASCRIPT SHIT

Find and fix:

- `new Promise(async (...) => ...)`;
- forgotten `await`;
- unnecessary `await`;
- sequential independent I/O;
- unbounded parallel requests;
- floating promises;
- fire-and-forget operations without ownership;
- errors lost inside event callbacks;
- promise chains mixed pointlessly with `async/await`;
- timeouts without cleanup;
- race conditions;
- side effects hidden in `.map`;
- `forEach(async ...)`;
- background work that disappears when the Worker request ends.

Cloudflare Workers have specific request-lifetime semantics.

Use the platform correctly.

Use Effect structured concurrency where it materially improves ownership.

---

# 15. ERROR HANDLING

Audit every `try`, `catch`, `.catch`, fallback and error response.

Ban meaningless patterns such as:

```ts
catch (error) {
  console.error(error)
  throw error
}
```

unless the logging adds meaningful boundary context.

Ban:

```ts
catch {
  return null
}
```

unless `null` is explicitly part of the business model.

Distinguish:

- validation failure;
- expected domain failure;
- upstream/network failure;
- authentication/authorisation failure;
- unavailable optional content;
- programmer defect.

Errors should have enough context to debug the operation without leaking secrets.

Do not include:

- tokens;
- credentials;
- private submission bodies;
- secret environment values

in error logs.

---

# 16. LOGGING

Kill random:

```ts
console.log(...)
console.error(...)
```

spray.

Use structured logging at actual operational boundaries.

Log:

- operation;
- safe identifiers;
- timing where useful;
- outcome;
- typed error/category.

Do not log everything.

Do not log private content just because observability sounds useful.

Effect logging is appropriate if the application adopts Effect meaningfully.

---

# 17. CONFIGURATION

Audit all environment-variable access.

Environment configuration should be:

- centralised;
- validated;
- typed;
- fail-fast for required production configuration;
- safe around secrets.

Effect Config is a strong candidate if Effect is adopted.

Do not repeatedly call:

```ts
env.SOMETHING;
```

through unrelated business logic.

Never silently replace missing production secrets with development defaults.

---

# 18. SECURITY

Perform an explicit security review.

Search for:

- XSS;
- raw HTML rendering;
- unsafe Portable Text/block rendering;
- open redirects;
- SSRF;
- arbitrary remote fetches;
- uncontrolled external URLs;
- path traversal;
- header injection;
- email injection;
- weak enquiry validation;
- missing CSRF assumptions;
- auth bypass;
- secret exposure;
- draft exposure;
- preview cache leakage;
- private R2 exposure;
- over-scoped MCP credentials;
- over-scoped plugin capabilities;
- unsafe SVG handling;
- dangerous HTML in CMS fields;
- unsafe `set:html`;
- public source maps containing inappropriate material;
- forgotten development endpoints.

Remote metadata fetching deserves special attention for SSRF.

Do not let a CMS field make the Worker fetch arbitrary internal URLs.

Whitelist/validate protocols and appropriate destinations.

---

# 19. EMDASH QUALITY PASS

Audit the EmDash integration against current official documentation.

Look for:

- duplicate queries;
- queries inside loops;
- unnecessarily broad collection fetches;
- repeated schema lookups;
- unsafe draft/public mixing;
- stale generated types;
- hand-written types duplicating generated types;
- wrong cache hints;
- unpublished content entering public data;
- admin logic leaking into public rendering;
- content queries inside low-level presentation components;
- pointless CMS fields;
- generic Blocks we do not need;
- schema complexity without editorial value.

Keep EmDash as the CONTENT/control layer.

Do not allow CMS concerns to infect every Astro component.

Create a small, clear data-access boundary where that improves readability.

Do not create a Java-esque repository universe.

---

# 20. ASTRO QUALITY PASS

Use Astro properly.

Prefer:

- server rendering where live content requires it;
- prerendering where content is actually static;
- native HTML;
- Astro components;
- tiny targeted client scripts.

Avoid unnecessary hydration.

Search for components that ship client JavaScript for something HTML/CSS can do.

Do not introduce React islands merely because React exists for EmDash admin.

Public Woodhouse should remain overwhelmingly Astro/native.

Run:

```sh
pnpm exec astro check
```

as a mandatory verification step because `astro build` does not replace Astro-aware type checking.

---

# 21. CLOUDFLARE QUALITY PASS

Audit:

- D1 usage;
- D1 placement;
- R2;
- KV;
- Worker Cache;
- scheduled handlers;
- plugin sandbox bindings;
- Wrangler environments;
- secrets;
- compatibility flags;
- preview isolation;
- Worker entry points.

Check for accidental Node-only APIs in Cloudflare code.

Do not add Node compatibility flags simply to rescue a dependency without understanding why.

Prefer Web Platform APIs in Worker runtime code where practical.

Avoid unnecessary round trips between Worker and storage.

---

# 22. RESEND QUALITY PASS

We already use Resend.

There should be ONE clean email boundary.

Do not spread direct Resend API calls throughout Woodhouse.

Whether implemented through EmDash's email abstraction or a Woodhouse Effect service, application code should have a coherent mail API.

Validate:

- recipients;
- reply-to;
- subject;
- safe length constraints.

Do not log message bodies.

Enquiry persistence must not fail merely because notification delivery fails.

That separation must be obvious in code.

---

# 23. FETCH

Audit every `fetch`.

Every external fetch should answer:

- Why is this remote call necessary?
- Is the destination trusted?
- What validates the URL?
- What validates the response?
- What is the timeout?
- Which errors are expected?
- Should it retry?
- How many times?
- Is caching appropriate?
- What happens if it fails?
- Is fallback behaviour explicitly part of the product?

No naked seven-second magic numbers sprinkled around the project.

Name policy.

Centralise repeated policy where genuinely repeated.

---

# 24. DATA BOUNDARIES

Every outside boundary starts as untrusted.

Examples:

```text
HTTP
EmDash input
D1 stored JSON
environment
MCP
form submissions
remote metadata
plugin messages
third-party APIs
```

Decode/validate appropriately.

After decoding, trust the domain type.

Do not continue defensively rechecking the same invariant everywhere.

---

# 25. CSS

AI writes shitty CSS too.

Audit the full stylesheet/component CSS.

Find:

- duplicate declarations;
- almost-identical selectors;
- magic widths;
- specificity wars;
- unnecessary `!important`;
- pointless wrapper selectors;
- obsolete styles;
- unused classes;
- accidental global leakage;
- desktop fixes patched again on mobile;
- arbitrary z-index escalation;
- repeated breakpoint values;
- hidden overflow masking layout errors;
- `min-width: 0` missing where actually necessary;
- fixed heights causing content failure;
- transition/animation applied to everything;
- inaccessible focus treatment.

Do not turn CSS into a utility framework unless that is actually better.

WOODHOUSE already has a design system.

Make the CSS express it clearly.

---

# 26. HTML / ACCESSIBILITY

Audit rendered semantics.

Find div soup.

Prefer native elements:

- nav
- main
- article
- section
- aside
- figure
- details
- dialog
- button
- headings
- lists

Do not recreate native controls with ARIA.

Check:

- heading hierarchy;
- accessible names;
- keyboard access;
- focus order;
- focus visibility;
- dialog behaviour;
- reduced motion;
- touch target size;
- image alt;
- diagram transcripts;
- colour-independent state;
- zoom;
- phone viewport;
- safe areas.

ARIA is not seasoning.

Use it only where it communicates something native semantics do not.

---

# 27. CLIENT JAVASCRIPT

Audit every browser script.

Remove:

- event listeners that can be CSS/native HTML;
- duplicate DOM querying;
- unnecessary mutation observers;
- polling;
- global listeners with bad cleanup where lifecycle matters;
- scripts duplicated per component instance;
- client-side code for data already known on the server.

No client framework merely for convenience.

No giant dependency for a trivial interaction.

---

# 28. TESTS

Audit tests for usefulness.

Delete tests that merely prove:

```text
1 === 1
```

or snapshot enormous implementation details with no product meaning.

Focus on high-value contracts.

Examples:

- drafts never leak publicly;
- publication policy blocks unsafe records;
- project snapshot history is preserved;
- evidence boundaries render correctly;
- agent facts expose only public-safe information;
- private Dean email never enters public output;
- enquiry survives notification failure;
- malformed enquiry is rejected;
- external metadata failure uses the explicitly defined fallback;
- published content enters RSS/search/sitemap;
- preview remains no-store;
- expected Effect failures remain distinguishable;
- Resend errors do not become fake success;
- public routes cannot mutate content.

For pure domain logic, use focused unit tests.

For system boundaries, integration tests are better than mocking the universe.

For critical public flows, use browser/E2E tests if the repository already has or genuinely benefits from them.

Do not build a testing cathedral around eight pages.

---

# 29. MOCKING

AI loves mocks.

Review every mock.

If a test mocks five internal modules, it may be testing the implementation rather than behaviour.

Prefer:

- pure functions;
- real domain values;
- lightweight fakes at actual service boundaries;
- Effect Layers for substituting genuine dependencies where Effect is used.

Do not mock what can trivially run for real.

---

# 30. TEST FIXTURES

Make fixtures realistic and minimal.

Avoid:

```ts
const fakeThing = {
  ...200 irrelevant properties
}
```

Use factories/builders only where repeated fixture construction genuinely benefits.

Do not create `TestDataFactoryFactory`.

---

# 31. PERFORMANCE

Measure obvious hot paths.

Audit:

- repeated D1 queries;
- serial external requests;
- oversized responses;
- huge JSON embedded into HTML;
- unnecessary hydration;
- full-collection loading for one item;
- repeated metadata fetching;
- cache misses;
- images;
- fonts;
- Worker startup/module size;
- client bundle size.

Don't micro-optimise static string concatenation while making five database calls.

Optimise architecture before syntax.

---

# 32. BUNDLE / DEPENDENCY WEIGHT

Every dependency has to justify itself.

Ask:

> Is this package buying enough correctness/functionality to be worth its transitive tree?

Remove dependencies where a clear native implementation is genuinely smaller and safer.

But do NOT reimplement:

- cryptography;
- schema validation;
- standards;
- protocol clients;
- complex parsing

merely to reduce dependency count.

Use judgement.

---

# 33. DATE / TIME HANDLING

WOODHOUSE cares about reviewed dates, publishing dates, schedules and evidence timestamps.

Audit date handling.

Distinguish:

- instant;
- local calendar date;
- publication time;
- review date.

Avoid accidental timezone conversion.

Use `Australia/Melbourne` where editorial local time is required.

Store instants appropriately.

Don't turn a date-only record into midnight UTC and accidentally change the displayed day.

---

# 34. URL HANDLING

Do not hand-concatenate URLs where `URL` provides correctness.

Validate user/content-controlled URLs.

Keep:

- canonical origin;
- public paths;
- external project origins

semantically distinct.

Avoid accidental double slashes, wrong encoding or protocol confusion.

---

# 35. REGEX

Review complicated regex written by agents.

If a regex is parsing HTML, URLs, email, structured formats or something with a real parser/API, question it.

Use platform/library parsers where appropriate.

If a regex remains, it should be understandable and tested.

---

# 36. REGEX-BASED HTML METADATA EXTRACTION

Pay particular attention to Woodhouse's remote project metadata loader.

If it still extracts `<meta>`/`<link>` tags from HTML using regex, evaluate whether that remains the right implementation.

Requirements:

- tolerate real-world HTML;
- respect timeout;
- avoid SSRF;
- validate resolved URLs;
- keep failure behaviour explicit;
- avoid pulling in a gigantic DOM implementation solely to read three tags unless justified.

Choose the simplest robust solution.

Document the trade-off if the regex implementation deliberately remains.

---

# 37. RANDOM `JSON.stringify`

Audit JSON serialization/deserialization.

External/persisted JSON should not be assumed to match TypeScript types.

Decode when crossing a trust boundary.

Avoid cycles and leaking internal objects.

Responses should expose intentionally constructed public DTOs, not arbitrary database/domain objects because:

```ts
return Response.json(record);
```

was convenient.

---

# 38. API SHAPES

Public JSON shapes are contracts.

Especially:

`/agents/facts.json`

Use explicit public DTOs.

Do not accidentally expose new database fields just because the internal model gained them.

Private/admin fields must require deliberate mapping before becoming public.

---

# 39. MAGIC CONSTANTS

Find numbers/strings whose meaning matters.

Examples:

```text
7000
86400
30
5
```

Name policy where the value represents an actual system decision.

Do not create constants for:

```ts
const ZERO = 0;
```

Use judgement.

---

# 40. COPY-PASTE IMPLEMENTATIONS

Search similar files side by side.

AI agents frequently solve the same thing repeatedly rather than noticing an existing abstraction.

Look for:

- repeated SEO logic;
- repeated date formatting;
- repeated fetch policy;
- repeated error translation;
- repeated project lookup;
- repeated content query;
- repeated menu retrieval;
- repeated response headers.

Consolidate real repetition.

Do not prematurely generalise merely similar-looking code that represents different concepts.

---

# 41. FALSE GENERALITY

Delete APIs that support hypothetical futures nobody asked for.

Examples:

```ts
type Provider = "resend" | "smtp" | "ses" | "mailgun";
```

when Woodhouse uses Resend.

```ts
interface DatabaseAdapter
```

when production architecture is intentionally D1 via EmDash.

```ts
theme: "light" | "dark";
```

when Woodhouse is explicitly fixed dark.

Do not code imaginary requirements.

Architecture should preserve reasonable substitution boundaries, not pretend every decision is temporary.

---

# 42. FEATURE FLAGS

Remove stale or speculative flags.

Feature flags need:

- a purpose;
- owner;
- lifecycle;
- removal condition.

Do not leave permanent branches for features launched six months ago.

---

# 43. ENVIRONMENT BRANCHING

Audit:

```ts
if (prod) ...
else ...
```

Development and production should differ only where infrastructure/safety demands it.

Do not maintain two implementations of core business behaviour.

Preview should exercise production-shaped architecture with isolated resources.

---

# 44. CACHING

Audit every cache layer.

Woodhouse may have:

- browser cache;
- Worker Cache;
- EmDash cache hints;
- KV object cache;
- D1 behaviour.

Make ownership explicit.

Never cache:

- admin;
- auth;
- drafts;
- previews;
- enquiry content;
- mutation responses;
- personalised editor state

as shared public content.

Avoid cargo-cult cache headers.

---

# 45. ERROR PAGES / EMPTY STATES

AI tends to optimise the happy path.

Verify:

- 404;
- project missing;
- dispatch missing;
- no search results;
- failed remote OG metadata;
- unavailable project art;
- empty incident list;
- EmDash unavailable where applicable;
- malformed content block;
- failed enquiry notification.

These states must be deliberate.

Do not fabricate content to make an empty state look populated.

---

# 46. EFFECT COMPLEXITY BUDGET

After adopting Effect, perform another review specifically asking:

> Did Effect make this clearer?

For each Effect-heavy module, assess:

- typed failure value;
- dependency management value;
- concurrency/resource value;
- validation value;
- retry/timeout value;
- testability value.

If the only justification is:

> this now uses Effect

undo it.

A five-line Promise implementation can be better than a thirty-line Effect program when the problem has no meaningful composition.

Conversely, do not collapse a genuinely typed multi-service workflow back into nested `try/catch` just because Promise code looks superficially shorter.

Optimise for reasoning.

---

# 47. TOOLING

Establish a SMALL coherent quality toolchain.

At minimum Woodhouse needs equivalents of:

- formatting;
- linting;
- Astro-aware type checking;
- dead-code/dependency checking;
- tests;
- production build;
- dependency audit.

Do not install three overlapping linters.

Do not run Prettier + Biome formatting against each other.

Choose tools based on current Astro/TypeScript compatibility.

Document why.

Package scripts should end up with useful commands resembling:

```text
format
format:check
lint
typecheck
deadcode
test
test:e2e
audit
verify
build
deploy
```

Only include commands that actually exist and have value.

`verify` should be the one command an agent can run before saying work is complete.

Something conceptually like:

```text
format check
→ lint
→ astro check
→ dead code
→ tests
→ EmDash validation
→ build
```

Do not make `verify` mutate source.

---

# 48. NO GITHUB ACTIONS

Do not create GitHub Actions.

WOODHOUSE intentionally uses local verification/deployment.

Make local checks excellent.

Agents must run them before completion.

---

# 49. NO WARNINGS AS THE NEW NORMAL

Do not finish with:

```text
Build passed with 73 warnings.
```

Warnings require disposition.

Fix them or document why they are false/irrelevant.

Suppressions must be:

- narrow;
- local;
- explained.

Never globally disable an entire useful rule to silence one awkward file.

---

# 50. ZERO-SLOP FINAL READ

After all automated tools are green, manually read every source file changed in this pass.

Look specifically for things tools will not catch:

- stupid abstractions;
- confusing names;
- false assumptions;
- awkward control flow;
- duplication;
- dead ideas;
- unnecessary comments;
- excessive comments;
- premature generalisation;
- over-engineered Effect;
- under-engineered error handling;
- code that technically works but makes a human ask “why the fuck is this here?”

Simplify again.

---

# 51. DELETE MORE

Do one dedicated deletion pass.

Ask of each:

- dependency;
- file;
- export;
- component;
- helper;
- service;
- type;
- interface;
- option;
- prop;
- CSS selector;
- script;
- configuration flag

whether the project still needs it.

If not, remove it.

Do not value lines of code already written.

---

# 52. VERIFY FROM CLEAN INSTALL

Where practical, verify from dependency truth rather than a lucky dirty `node_modules`.

At minimum:

```sh
pnpm install --frozen-lockfile
pnpm verify
pnpm build
```

If feasible, prove it from a clean dependency state.

Do not delete important local caches/databases without understanding them.

---

# 53. RUNTIME VERIFICATION

Do not stop at static analysis.

Run Woodhouse.

Exercise representative flows:

- homepage;
- Factory;
- project dossier;
- Dispatch;
- Incident;
- Dean;
- Agent Reception;
- search;
- Contact;
- enquiry submission;
- 404;
- EmDash Office;
- draft preview;
- publish workflow where safe.

Inspect browser console.

Inspect Worker logs where useful.

Check mobile and desktop.

---

# 54. PRODUCTION SAFETY

Do NOT automatically deploy merely because this cleanup passes locally.

If the task includes deployment, use the existing Woodhouse preview → verification → production process.

If deployment was not requested, stop at a fully verified repository state.

Never turn “build passed” into “production verified”.

---

# 55. WRITE DOWN THE ENGINEERING RULES WE LEARN

If this exercise reveals recurring patterns that future agents are likely to repeat, update `AGENTS.md`.

Examples:

> Do not swallow metadata fetch failures.

> Use Effect Schema only at trust boundaries.

> Public agent JSON uses explicit DTOs.

> Do not add React to public Woodhouse routes.

> Do not duplicate EmDash-generated types.

> Do not introduce a service abstraction for pure utilities.

Keep these rules short and enforceable.

Do not turn `AGENTS.md` into a textbook.

If a rule belongs to product/design instead, put it in the appropriate existing document.

---

# 56. FINAL QUALITY BAR

The finished repository should satisfy all of these:

## Dependencies

- current stable packages;
- no unexplained outdated dependencies;
- no unused dependencies;
- no reliance on undeclared transitive dependencies;
- vulnerabilities addressed or explicitly assessed.

## TypeScript

- strict;
- no casual `any`;
- no cast chains;
- no fake safety;
- external data validated;
- impossible states minimised.

## Architecture

- Astro owns presentation;
- EmDash owns editorial content/control;
- Effect owns complex effects where useful;
- Cloudflare owns infrastructure primitives;
- Resend owns email;
- no duplicate fake abstraction layers around them.

## Code

- less code where possible;
- understandable code;
- little duplication;
- little indirection;
- no dead branches;
- no generic AI boilerplate;
- no compatibility fossils;
- no speculative extensibility.

## Runtime

- errors explicit;
- timeouts bounded;
- retry intentional;
- concurrency owned;
- secrets safe;
- caches correct.

## Public product

- still unmistakably WOODHOUSE;
- fast;
- accessible;
- mobile excellent;
- no EmDash visual leakage;
- no framework sludge.

---

# 57. FINAL REPORT

Do not just say:

> Refactored codebase and improved quality.

Give me evidence.

Report:

## Dependency changes

Every significant upgrade/removal.

Mention majors and migration work.

## Deleted code

Files, abstractions, exports and dependencies removed.

Include useful before/after totals where they can be measured reliably.

## AI slop found

List concrete classes of bad code discovered.

Show representative examples conceptually without dumping enormous diffs.

## Type safety

What unsafe patterns were removed.

What strictness improved.

## Effect decision

List modules where Effect was adopted and WHY.

List obvious modules where Effect was deliberately NOT adopted and WHY.

## Architecture simplifications

What indirection disappeared.

## Security findings

Everything fixed and any real remaining risk.

## Performance findings

Queries, requests, client JS, caches or bundles improved.

## Tooling

Final quality-tool stack and why each tool remains.

## Verification

Exact commands actually run.

Actual pass/fail results.

## Remaining exceptions

Every warning, ignore, suppression, pin or unresolved issue.

There should be very few.

## Code-health verdict

Conclude with:

- what is now substantially better;
- what still smells;
- what future agents must not reintroduce.

Do not congratulate yourself.

Do not call things “robust”, “production-ready”, “clean” or “enterprise-grade” without showing the evidence.

The final state should make the next competent engineer think:

> This is surprisingly straightforward.

Not:

> An AI clearly had a very productive afternoon.
