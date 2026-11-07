# Protocol 11 comedy slice — June, three draft scenes

Prepared 8 November 2026 for [#156](https://github.com/loftwah/woodhouse-new/issues/156). This is a
**handoff draft for `loftwah/protocol-11`**, not game content and not a release claim. Nothing here is
in `AUTHORED_TABLE_SCENES`, nothing is deployed, and every card is `draft` because no independent
reviewer has read it.

## Why Protocol 11

The four active games were checked against their own records:

| Game | Owner art position | This slice |
| --- | --- | --- |
| Bubbles | Three scenes live with MP-approved lines (2026-11-06); wider cast visual acceptance still open on #1402/#1460 | Not chosen — active comedy work in flight |
| Fighter | Reviewer approved with notes, but #367 visual sign-off and MP's in-product taste remain | Not chosen — visual sign-off outstanding |
| Protocol 11 | `docs/creative/table-talk-inventory.md` records "portrait approved" for all ten regulars; companion art tracked separately in #395 | **Chosen** |
| SHOALSHOT | #668/#669 open; Tideglass explicitly rejected as a character experience, art lineage on #689 | Not chosen — unresolved owner art blocker |

Protocol 11 also already has the gate this standard asks for: `src/shared/table-comedy-contract.ts`
rejects unreviewed new scenes, hidden-state inputs, duplicate lines and borrowed material. A draft
that cannot pass that gate is exactly what should be written before anything is merged.

## Character bible entry — June (`june`)

Source of truth for the existing voice: `TABLE_VOICES.june` in `src/shared/table-conversation.ts` and
`RIVAL_STORIES.june` in `src/bots/rival-stories.ts`. This entry extends that voice; it does not
replace the shipped lines.

| Field | June |
| --- | --- |
| Worldview | The table is a kitchen. A card game is something you host, not something that happens to you. |
| Motivation | Keep the table fed, keep the pace human, and finish the hand without making a fuss about finishing it. |
| Contradiction | She insists nothing is urgent while keeping a precise ledger of every discard and exactly how everyone takes their tea. The calm is real; so is the accounting. |
| Relationship to the player | Host. She knows the player is there and speaks to them directly, but never speaks, chooses or complains for their seat. |
| Vocabulary | Kitchen and hosting nouns: kettle, toast, biscuits, interval, washing up, shelf. Short sentences, present tense, questions only when offering something. Never uses "deploy", "rollback", "changelog" or competitive trash talk — those belong to Rhea and Knox. |
| Boundaries | General audience. No sexual humour, no jokes about a player's body, ability, accent or identity, no disaster or illness premises. Food is comfort and evidence, never a weapon. |
| Performance grammar | One beat before speaking, a small tidy gesture (straightening a card, lifting a cup), then the line. She slows down when the table speeds up. No bouncing, no pointing, no overlarge reaction. |
| Three different reactions | **Winning:** offers toast and credits the table, not herself. **Losing:** compliments the finish and immediately offers food; no excuse. **Unexpected:** treats it as a hosting problem ("someone has put the biscuits on the wrong shelf"), never panic and never blame the player. |
| When she is silent | (1) When a player is being spoken over or attacked personally — she waits until the table is safe. (2) During a timed or final competitive beat where a line would delay a move. (3) Immediately after her own payoff line; she does not add a chuckle or a second explanation. |

## Scene cards

Shared constraints for all three: two seated bots, public event kinds only, fixed text, one active
scene, no human seat, expires after two rounds, never repeats a delivered line. All are
`general-audience`, cooldown at the fastest cadence (6000 ms), and use existing portraits and poses —
no new art, so no art blocker.

### 1. `june-biscuit-interval`

```yaml
id: protocol-11/table/june-biscuit-interval
game: protocol-11
surface: public table talk
trigger: June (opener) completes a public laydown of her Protocol
actors: [june, gabe]
setup: June lands the Protocol and announces the good biscuits, treating a dramatic moment as hosting.
escalation: Gabe turns it into act two and starts directing the table; June puts a boundary on the performance.
payoff: June closes her own hand and re-frames the biscuits as the interval, not the prize.
callback: the "good biscuits" from setup return in the payoff.
acting: June straightens a card and lifts her cup; Gabe's cape gesture is the only large movement.
suppression: off-suppresses; quiet-does-not-start; single-active-scene; expires-after-two-rounds; never-repeats-a-delivered-line
rating: everyone
originality: built from a real laydown and the host/theatre contrast already in both voices; no external reference.
author: OpenCode (agent), 2026-11-08
reviewer: unassigned
assets: [fixed text in AUTHORED_TABLE_SCENES, existing portrait and pose frames, no new art]
status: draft
```

| Beat | Kind / condition | Speaker | Line |
| --- | --- | --- | --- |
| start | `laydown` by opener | June | "That's my Protocol. The good biscuits are out, so the table can behave." |
| 1 | `laydown`, responder acts | Gabe | "Act two: the host reveals the plot and the biscuits. Somebody cue the lights." |
| 2 | `one_card`, opener acts | June | "One card, Gabe. Save the interval speech for the interval." |
| 3 | `match_end` | June | "That's the hand. The biscuits were the interval; the Protocol was the warm-up." |

### 2. `june-tea-rollback`

```yaml
id: protocol-11/table/june-tea-rollback
game: protocol-11
surface: public table talk
trigger: Rhea (opener) completes a public laydown and calls the table a release
actors: [rhea, june]
setup: Rhea ships the Protocol with no rollback; June treats the discarded card as perfectly good reuse.
escalation: Rhea closes the round and updates the changelog; June points out the kettle has no changelog.
payoff: June lands the tea as the only release that needs no notes.
callback: "rollback" from setup becomes "never needs a changelog" in the payoff.
acting: Rhea's precise card tap; June's slow pour gesture and a satisfied nod.
suppression: off-suppresses; quiet-does-not-start; single-active-scene; expires-after-two-rounds; never-repeats-a-delivered-line
rating: everyone
originality: the joke is the collision of two shipped vocabularies (release engineering and hosting) over a real pickup; no external reference.
author: OpenCode (agent), 2026-11-08
reviewer: unassigned
assets: [fixed text in AUTHORED_TABLE_SCENES, existing portrait and pose frames, no new art]
status: draft
```

| Beat | Kind / condition | Speaker | Line |
| --- | --- | --- | --- |
| start | `laydown` by opener | Rhea | "Protocol shipped. No rollback, no notes, and the table is now in production." |
| 1 | `pickup`, responder acts | June | "That discard was perfectly good. I'm calling it reuse, not a rollback." |
| 2 | `round_end`, opener acts | Rhea | "Round closed. I've updated the changelog and removed the biscuits." |
| 3 | `match_end` | June | "Tea's poured. That's the only release that never needs a changelog." |

### 3. `june-chair-and-toast`

```yaml
id: protocol-11/table/june-chair-and-toast
game: protocol-11
surface: public table talk
trigger: June (opener) completes a public laydown while Moss is seated
actors: [june, mick]
setup: June offers Moss a choice between the chair and the toast, which is the whole argument in one line.
escalation: Moss claims the universe provided a discard; June assigns the washing up to the universe.
payoff: Moss dissolves the choice — the chair and the toast were the same thing — and the scene closes on his logic, not hers.
callback: the setup's either/or returns as Moss's synthesis.
acting: June sets down a plate; Moss settles deeper into the chair with one slow gesture.
suppression: off-suppresses; quiet-does-not-start; single-active-scene; expires-after-two-rounds; never-repeats-a-delivered-line
rating: everyone
originality: the premise is Moss's shipped cosmology meeting June's shipped hosting, over a real pickup; no external reference.
author: OpenCode (agent), 2026-11-08
reviewer: unassigned
assets: [fixed text in AUTHORED_TABLE_SCENES, existing portrait and pose frames, no new art]
status: draft
```

| Beat | Kind / condition | Speaker | Line |
| --- | --- | --- | --- |
| start | `laydown` by opener | June | "That's the Protocol, Moss. You can have the chair or the toast, not both." |
| 1 | `pickup`, responder acts | Moss | "The universe provided a discard. I provided the chair. Teamwork." |
| 2 | `round_end`, opener acts | June | "Round's in. The universe can do the washing up." |
| 3 | `match_end` | Moss | "Good orbit. The chair and the toast were the same thing after all." |

## What is still missing

1. **Independent editorial review.** All three cards are `draft`. A reviewer independent of the author
   must score originality, character voice, setup/payoff, pacing, gameplay relevance and
   appropriateness, with ≥4 on every axis, and write why each scene belongs to June in this game. No
   score has been given here and none should be inferred from this document.
2. **Contract merge.** The scenes do not exist in `AUTHORED_TABLE_SCENES` or
   `docs/creative/table-comedy-scenes.md`. Protocol 11's gate fails new content whose review is still
   `pending`, so the review must happen before merge or as a deliberate, visible baseline amendment.
   Do not add these to `PENDING_REVIEW_BASELINE` as a shortcut.
3. **Corpus checks.** On merge, the gate must run the exact-duplicate and near-duplicate checks against
   scenes, rival voices, tap banter, fallback quips and Journey lines; confirm every line is ≤160
   characters, single-line, link-free, and that June's shipped catchphrases still work.
4. **Real play evidence.** Recording of each scene reaching setup → escalation → payoff and a later
   callback; phone portrait/landscape and desktop; touch and keyboard; muted and reduced motion;
   a repeated interaction showing the cooldown; an interruption where the player acts mid-scene;
   save and return without double-firing.
5. **Owner taste.** MP's in-product review of the performed scenes, and the remaining human gates on
   Protocol 11 #411. Nothing here claims that acceptance.
6. **Transfer.** These cards need to move into the Protocol 11 repository with its own commit and
   release path. The portfolio repository is not the game's content store and must not become one.
