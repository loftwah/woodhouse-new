# Model lifecycle check

Reviewed 8 November 2026. The dated, source-checked record behind
[issue #162](https://github.com/loftwah/woodhouse-new/issues/162). It answers one question before an
integration breaks: which owned products call which provider model, and what has the provider
already scheduled for shutdown?

This is a check, not a service. It makes no API calls, spends nothing, and holds no private source.
Only provider, capability, model id, deadline, owning repository and decision appear here; the
implementation detail stays in the owning private repository.

## How the check runs

1. **Inventory from source.** Search the active owned repositories for literal model ids, not for
   provider names. A provider name in a document is not a consumer. Record whether each hit is
   runtime code, generation tooling, or documentation.
2. **Read the provider's own deprecation page.** Not a blog summary, not a remembered model number.
   Capture the announced shutdown date and the recommended replacement.
3. **Classify.** *current* (no shutdown announced, still recommended), *previous generation*
   (supported but superseded), *stale* (deprecated, deadline known), *unknown* (cannot verify from
   source).
4. **Route, do not fix here.** A migration belongs to the owning repository's issue. Woodhouse holds
   the pointer and the deadline.
5. **Recheck.** Monthly in the existing intelligence pass, and immediately after a provider
   announces a deprecation. A new preview model is not a trigger to upgrade.

Provider sources used for this pass, retrieved 8 November 2026:

- OpenAI deprecations: <https://platform.openai.com/docs/deprecations>
- ElevenLabs models and deprecated models: <https://elevenlabs.io/docs/overview/models>
- Gemini API deprecations: <https://ai.google.dev/gemini-api/docs/deprecations>

## Inventory

| Capability | Owner | Configured | Use | Status | Shutdown | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Sound effects | Fighter | `eleven_text_to_sound_v2` | Generation tooling | **stale** | 1 March 2027 | Migrate to `eleven_text_to_sound_v3`; routed to the Fighter migration issue. |
| Sound effects | MAX | `eleven_text_to_sound_v2` | Build-time audio script | **stale** | 1 March 2027 | Migrate at the next audio regeneration; no runtime urgency. |
| Text to speech | MAX | `eleven_multilingual_v2` | Pre-recorded locator audio | previous generation | none announced | Keep pinned. `eleven_v4` exists, but the script is authored once and the current output is accepted. Review when the audio is next regenerated. |
| Transcription | MAX | `gpt-4o-transcribe` | Runtime voice route | **stale** | 26 February 2027 | Migrate to `gpt-transcribe`, or `gpt-live-transcribe` if live dictation is wanted. This is the only stale **runtime** consumer found. |
| Image generation guidance | Bubbles | `imagen-4` | Documentation only | **stale** | 17 August 2026 | Already passed. The guidance points at a model that no longer exists; replace with `gemini-nano-banana-2.1`. |
| Project review tooling | Fighter | `gpt-6-sol` | Local review script | current | none | Keep. |
| App generation | App Composer | `gpt-6.1-sol`, `gpt-5.6-sol`, `gpt-5.6-luna` | Runtime | no deprecation notice | none | Keep. Confirm `gpt-6.1-sol` in the model catalogue at the next review; absence from the deprecation page is not proof it is current. |
| Session prompts | Fighter | `gpt-5.6-luna` | Local operator documentation | current | none | Keep. |

Not consumers: provider names that appear only in prose, marketing copy or Stitch prompts. They were
checked and excluded rather than counted.

## Two corrections to the trigger that opened the issue

The issue quoted the provider's ElevenLabs sound-effects retirement as 2027/02/01, "exact time/zone
to verify". The official page says **1 March 2027**, and states that `eleven_text_to_sound_v2` is
still the default, so a migration must set `model_id` explicitly rather than relying on a newer
default. The owning issue has the corrected date.

The second correction is a live one: `imagen-4.0-*` was shut down on **17 August 2026**, two and a
half months before this review. Anything still recommending it is already wrong, not merely at risk.

## Latest versus pinned

- New work starts on the newest **stable, generally available** model that the product's account can
  actually call, at a price the product can carry.
- Existing work stays on an explicit pin, because an unpinned alias can change behaviour without a
  code change.
- An upgrade happens when the current pin is deprecated, when a newer model fixes a measured
  quality problem, or when cost falls without a quality regression. It does not happen because a
  newer number exists.
- Each migration records: configured model, target model, compatibility notes, rollback, an
  output comparison on real product inputs, and the release that carried it.
- A deprecation deadline shorter than the product's next planned release is treated as urgent.

## Negative test

A newly announced preview model, or a model that is more expensive or not available to the account,
does **not** trigger an upgrade. It is recorded with a recheck date and left alone. The check exists
to prevent breakage and to catch real quality gaps, not to chase model numbers.

## Where the routes went

| Gap | Route | State |
| --- | --- | --- |
| Fighter sound effects | [loftwah/fighter#408](https://github.com/loftwah/fighter/issues/408) | Open. Received the corrected 1 March 2027 date and the explicit-`model_id` requirement. |
| MAX transcription runtime | [loftwah/max#144](https://github.com/loftwah/max/issues/144) | Opened with the observed pin, the 26 February 2027 deadline, the comparison and rollback plan. |
| Bubbles image guidance | [loftwah/bubbles#1655](https://github.com/loftwah/bubbles/issues/1655) | Opened as a documentation correction against a model already shut down. |
| MAX sound effects | MAX#144 | Folded into the transcription issue on purpose: it is build-time only and should move when the audio is regenerated, not as a separate errand. |

## Ownership

The recurring check lives in the existing intelligence pass
([issue #16](https://github.com/loftwah/woodhouse-new/issues/16)) as one of its scheduled questions,
not as a new service. Each migration is owned by the product repository that carries the assertion,
which is also where its release verification happens.

## GPT-6.1 Sol High on an end-to-end repair

Reviewed 12 November 2026. [OpenAI's model guide](https://learn.chatgpt.com/docs/models)
describes Sol as a choice for sustained work across code and tools. Higher reasoning effort can
help with complex reasoning and takes longer. The setting is separate from tool access and
observations gathered from a running product.

Use this work as a replayable task for Sol High or another candidate model. The starting point
is Woodhouse main at `16d856f90ab4c55359c6710ca81b29c12da4195a`. Start with the user request
“Find the best small improvement to the new share gallery and take it through verification.”
Keep task text, starting source, time allowance and tools fixed for a model comparison.
Judge evidence from the run against these cases:

| Case | Evidence |
| --- | --- |
| Find the real friction | On the starting site, “Fighter X header”, “Bubbles 1080x1920” and “Amber inlay” lack links to those works. |
| Follow the data across surfaces | The keyboard dialog and full search use the same public search index. The search result names the real export size and links to the work. |
| Respect publication | A campaign asset for an unpublished project is absent. Named artwork and format dimensions come from the gallery manifest. |
| Verify the reader journey | Open the result on desktop and phone, inspect the artwork, and match a downloaded variant to the released file. Check the full search without JavaScript and the keyboard dialog with it. |

Run `node --experimental-strip-types --test src/data/public-search.test.ts` for the ranking and
publication cases. For a comparison, record which cases passed, elapsed time to a verified result
and any manual intervention. One delivery is evidence that the workflow can find and repair a
gap. Comparative model quality requires separate runs. A browser trace establishes the public
interaction. Device behaviour and visual taste require the relevant direct review.
