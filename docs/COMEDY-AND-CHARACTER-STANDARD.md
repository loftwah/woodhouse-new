# Comedy and character standard

Reviewed 8 November 2026. Portfolio standard for the four active games — Bubbles, Fighter,
Protocol 11, SHOALSHOT — under [issue #156](https://github.com/loftwah/woodhouse-new/issues/156).
It defines what good looks like and how a scene is reviewed. Each game still owns its characters, its
runtime and its release.

This is a gate for **new or materially changed comedy**. It is not a retroactive block on unrelated
gameplay fixes, and it does not authorise replacing an existing mascot.

## 1. The rule underneath every other rule

A joke has to come from **this character, in this game, reacting to something that actually
happened**. If the line would work equally well in the other three games with a name swapped, it is
not a character line. It is a quip with a costume.

Three consequences:

- **Game first.** The state is the setup. A line that ignores the board, the run, the hand or the
  fight is decoration.
- **Never invent.** A character may not claim a win, a secret, a streak, another player's behaviour or
  a memory of a match that did not occur. Humour is commentary on real state, not a second narrative.
- **Silence is a line.** Each character needs an explicit list of moments where they say nothing.

## 2. Originality and rights

Binding for every contributor and every generator:

- Do not copy or closely paraphrase routines, transcripts, premises, scenario structures, punchlines,
  recurring bits, stage directions, delivery, cadence, recordings or likenesses from any comedian,
  sketch, show or game. Swapping surface details is still copying.
- Do not prompt a model to "write as" a named performer, or to take a specific routine and set it in
  the game.
- Do not paste copyrighted transcripts into prompts or commit them as reference.
- Translate influence into **abstract mechanics only**: setup, mismatch, escalation, reversal,
  callback, restraint.
- Third-party characters, brands or likenesses need their own rights and portrayal review. A shared
  cast agreement licenses nothing by itself.
- If provenance is uncertain, the scene is blocked, not shipped.

An automated similarity check is a risk signal. It is never proof of originality, and it never replaces
the reviewer.

## 3. Character bible

One entry per speaking character, kept beside the game's content. Required fields:

| Field | What it must answer |
| --- | --- |
| Worldview | What the character believes about the game's world, in one sentence. |
| Motivation | What they want on every turn. |
| Contradiction | The flaw that makes them funny without making them stupid. |
| Relationship to the player | Ally, rival, bystander, narrator — and whether they know the player is there. |
| Vocabulary | Words they use, words they never use, sentence length, whether they ask questions. |
| Boundaries | Subjects they will not touch, and the rating they must stay inside. |
| Performance grammar | How they move, pause and react: a look, a beat, a sound, a shrug. |
| Three different reactions | To winning, to losing, and to something unexpected — no template with the noun changed. |
| When they are silent | At least two situations. |

A character whose three reactions can be produced by one template is unfinished.

## 4. Scene card

Every substantial comic scene has one. "Substantial" means more than a single reaction bark. The card
lives with the scene in the game's own content, not in a central database.

```yaml
id: bubbles/replay/missed-cascade-01
game: bubbles
surface: end-of-run summary
trigger: run ended with three or more shots that cleared no bubbles
actors: [character-id]
setup: the board is still full and the player knows it
escalation: the character notices the pattern before saying anything about it
payoff: names the pattern as a habit, not a failure
callback: possible reference to the earlier "one more shot" beat
acting: one beat of silence, then a gesture; no sound sting
suppression: never during the first run; never twice in three runs
rating: everyone
originality: built from a real end-state shape, no external reference
author: name
reviewer: name, independent of the author
assets: [line-id, gesture-id, optional svg]
status: draft | reviewed | blocked
```

Rules that keep the card honest:

- `trigger` must be a state the game can actually detect. If the condition cannot be evaluated, the
  scene does not exist.
- `suppression` is mandatory. Saying what stops it firing is part of the writing.
- A card with no named independent reviewer is `draft`, whatever else it says.
- The id is unique and stable. Reusing an id for new copy breaks save and analytics lineage.

## 5. Pacing

- Rare strong moments beat constant banter. A character who comments on everything is furniture.
- Vary length: a look, then a line, then a longer beat when it has earned the room.
- Cooldowns per character and per scene family. Repeated interactions escalate once, then stop.
- Never delay a player's move, hide information, or steal focus from the board.
- Every joke has a silent equivalent. With sound off or reduced motion on, the scene still reads —
  through a pose, a caption or nothing at all, deliberately.
- Interruption is normal, not a failure: a scene must be abandoned cleanly when the player acts.

## 6. Audience and tone

- Edgy, dark or adult material only where that game's rating, context and player choice support it.
  Stand-up references are not a licence to transplant subjects.
- No punching down at players or protected groups. No sexual humour by default. No disaster humour
  borrowed from a routine.
- Tone matches the game's actual audience, not the writer's favourite comedian.

## 7. Review rubric

Score each axis 0–5. Target **4 or more on every axis**. Any score of 0–2, or an owner rejection,
means rewrite rather than argue.

| Axis | 4 or 5 looks like | 0–2 looks like |
| --- | --- | --- |
| Originality | The premise comes from this game's state; no recognisable external structure | A known routine or a generic quip with nouns swapped |
| Character voice | Only this character could say it, and the vocabulary rules are visible | Any character could say it |
| Setup and payoff | The trigger sets up something the payoff earns | The line arrives without a setup, or the setup has no turn |
| Pacing | Appears at the right frequency, escalates once, stops | Repeats, interrupts, or comments on everything |
| Gameplay relevance | It is about what the player just did | It is about nothing in particular |
| Appropriateness | Right for the rating and the moment | Punches down, off-rating, or mistimed |

The reviewer writes **why this belongs to this character in this game**. A model cannot sign its own
work, and a passing test is not an editorial approval.

## 8. Fail-closed QA

Ship nothing if any of these fail:

- duplicate or missing scene id;
- trigger not derivable from real game state;
- copy that references an event the game cannot have observed;
- cooldown or speaker exclusivity broken;
- rating mismatch for the surface;
- missing audio or art asset behind a scene;
- recycled line already used by another character;
- an imported reference or transcript in the repository;
- no named independent reviewer;
- unresolved owner rejection on the character's visuals.

## 9. Evidence for release

Per game, for each released substantial scene:

- a real recording of normal play reaching the scene, plus at least one callback later in a session;
- phone portrait and landscape, and desktop;
- touch and keyboard;
- muted, and reduced motion;
- a repeated interaction showing the cooldown or escalation stopping;
- an interruption: the player acts mid-scene and the scene yields;
- save and return, proving the scene does not double-fire or vanish;
- the older cast still working, unchanged.

"Screenshots of mockups" and "the script ran" are not this evidence. The reviewer watches the product.

## 10. What this standard does not do

- It does not centralise the games' writing runtime or generate dialogue in one place.
- It does not licence third-party characters or establish a shared voice cast.
- It does not override a game's own content system, save format or rating.
- It does not make a portfolio-level claim that any game has passed. Each game's QA issue does that,
  in that repository, with its own evidence.
