# Stageshow pilot — the patch bench still

Reviewed 8 November 2026 for [issue #161](https://github.com/loftwah/woodhouse-new/issues/161). One
bounded pilot: does the Stageshow discipline improve a real Woodhouse illustration, and is the result
truthful?

The discipline is the contribution, not the aesthetic: story and subject → reference → framing →
authentic sources → compose → inspect → improve. Nothing from the Stageshow demo was copied, and no
React runtime was added. Its licence is MIT; its example artwork is not covered by that licence, so
none of it is used.

## Subject and brief

**Subject:** the patch bench, the shipped working exhibit at
<https://woodhouse.loftwah.com/exhibits/patch-bench/>.

**Core fact:** a small game, the sound effects it owns, and a real LoftwahFM station are three
separate parts with three separate owners, and the exhibit lets a visitor disconnect the music while
the game keeps its sound.

**Audience and destination:** someone who has never seen the site, arriving from a link where the
image is the first thing they meet. Wide for a link preview, portrait for a phone-shaped share card.

**Focal point:** the three parts, not a headline. **Supporting words:** one line of what it is, one
line of why it is interesting, one boundary label. **Omitted:** all metrics, all screenshots of the
game in play, any claim that another game has adopted the pattern.

## Authentic versus staged

Two candidates were produced at both sizes.

| Candidate | What it is | Verdict |
| --- | --- | --- |
| Authentic capture (`capture-bench-1200x630.png`, `capture-bench-1080x1350.png`) | Playwright at 2× device scale against the live exhibit, scrolled to the bench | **Rejected.** At rest the game canvas renders empty, so the hero object is a black rectangle; the tighter crop cuts the bench card and implies play that is not happening. |
| Authored still (`final-patch-bench-1200x630.jpg`, `final-patch-bench-1080x1350.jpg`) | SVG composed from the exhibit's real parts, rendered through ImageMagick with the project's Bricolage Grotesque | **Selected.** It states the relationship the exhibit exists to show, and it is labelled as an illustration on the artwork itself. |

The selected still does not pretend to be a screenshot. It carries
`ILLUSTRATION OF A SHIPPED EXHIBIT — NOT A SCREENSHOT` in coral at the foot of both variants. A
reader cannot mistake it for a product capture, which is the failure mode the issue warns about.

## Composition and the correction

- Wide **1200×630**: eyebrow, one display sentence, a supporting line, three modules on a bench
  baseline, one labelled consequence line, a boundary label and the route.
- Portrait **1080×1350**: composed rather than squeezed — the headline breaks across three lines at
  88px, the modules stack with colour spines, and the same boundary label sits at the foot.
- Both use the production palette and type: ink ground, acid identity, cyan/cobalt/coral for the
  parts, Bricolage Grotesque display at 700–800.

**Before (v1) → after (v2), one evidenced fix.** In v1 the module edges used `#17233a` on `#111a2c`,
which is effectively invisible, and the connectors between the three parts were drawn in the same
colour. The result read as three unrelated boxes, contradicting the sentence "one bench". v2 raised
the edge colour to `#243149`, drew visibly dashed connectors with colour-coded nodes at each end, and
added the bench baseline and its `ONE BENCH` label. No copy changed; the fix is legibility of the
claim, which is the point.

## Inspection

- Judged at the advertised sizes and downscaled to a 390px-wide view; the boundary label stays
  legible and the display sentence still reads first.
- Hierarchy check: eyebrow → headline → supporting line → parts → consequence → boundary → route.
  Nothing overlaps, nothing clips, and the portrait does not repeat the wide layout at a smaller size.
- Truth check: every word describes something a visitor can open today. There are no numbers, no
  usage claims, no named adopters.

## Reproduction

```bash
python3 scripts/render-story-still.py --out=.release/stageshow-161
```

Inputs: `scripts/render-story-still.py` and `scripts/assets/BricolageGrotesque-Variable.ttf`.
Outputs are deterministic JPEGs; re-running produces byte-identical files for the same source.
Source revision: `441ab5c` at render time. ImageMagick 7.1.2-10.

| Asset | Size | Bytes | SHA-256 |
| --- | --- | --- | --- |
| `final-patch-bench-1200x630.jpg` | 1200×630 | 115,002 | `89023acbdac0fc721da8f43cd342c78e646c48f9c93b92d2421594a61029a1a1` |
| `final-patch-bench-1080x1350.jpg` | 1080×1350 | 147,234 | `8ade932f6842e8e9fb9227c4ced6c6ecbb945765a24d28d2020120936ceddc34` |

## Where the assets live

Both finals, the source SVGs, the rejected captures and the capture scripts are under the ignored
`.release/stageshow-161/`. They are **not** published, not added to `public/og`, and no production
route changed. Presentation through the #142 asset workflow is that issue's call; #161 was asked for
the pilot, and adding public media without its owner would be a different change.

If the wide still is adopted, the natural destination is an Open Graph image for the exhibit route,
which already exists. That is a one-line change in a release that owns the decision, not something to
slip into a docs pass.
