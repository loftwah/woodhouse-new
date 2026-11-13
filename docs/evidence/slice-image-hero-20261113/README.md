# Sliced hero artwork — 13 November 2026

Production evidence for the Slice Image treatment on the homepage hero. The treatment
shipped in #229; #238–#240 correct the phone caption it moved.

Released 2026/11/13 18:12 AEDT (Australia/Melbourne, UTC+11) / 2026/11/13 07:12 UTC.

- Source: `main` at `396c685c6180afe5af88219a9b3dbd534c72d582`, which contains the
  slice merge `aadc07dc1d132b49af851cab189b267739ff91d5` and the caption fixes
  `6521e1fe` and `a4f50cde`.
- Worker: `woodhouse-loftwah`, version `ff6207de-cd55-44ea-92cc-4b0278c710ea` at 100%.
- Live: <https://woodhouse.loftwah.com/>
- Build identity: <https://woodhouse.loftwah.com/build.json> reports the same commit,
  `gitClean: true`, and source digest `sha256:c70fe96d15f4f199e947437fc31f0b84141f53fcc4372bac93f1e0eb5edc543c`.

| File                    | What it shows                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shots/ev-wh-1440.webp` | The released opening at 1440×900: the live loom seen through twenty vertical strips, headline, actions, Freeze motion and caption.               |
| `shots/ev-wh-390.webp`  | The same opening at 390×844: strips over the phone crop, the caption clear of the Build Notes row, the pause control above it.                    |
| `shots/ev-wh-320.webp`  | 320×720, the narrowest reviewed width: no overlap, no horizontal overflow.                                                                        |
| `shots/loom-live.mp4`   | 3¼ seconds of the live canvas at 1440 with the pointer crossing it; the fibres lean and spring back. 720 px wide, 8 fps.                          |
| `shots/loom-live-frame.webp` | One frame of that recording, for readers who cannot play the clip.                                                                          |

Screenshots are Chromium at CSS pixel sizes with the tab in the foreground, so the
canvas rather than the poster is visible.

## What was exercised on the deployed page

- Strips: poster and canvas resolve to the **identical** mask image and share one
  box, so their apertures line up.
- Pointer: moving across the plate displaces the fibres and they spring back; the
  recording is that motion.
- Freeze motion → the control reads **Resume motion** and the status line says
  "Motion frozen. Resume it to brush through the fibres again." Resuming restores
  the label and clears the line.
- Reduced motion: the status line explains that ambient motion is off and the
  control is hidden; the scene keeps its resting frame.
- Scripts blocked: `data-live` stays `false`, the canvas stays hidden, the control
  stays hidden and the masked still poster remains.
- Caption and control: outside the mask. At ≤404px the hero foot wraps to two rows,
  so the page lifts both by `--signature-foot-clearance`; measured 40 px (390) and
  42 px (320) between caption and foot, with the control above the caption.
- No horizontal overflow: `scrollWidth === clientWidth` at 1440, 390 and 320.

## Limits

This records presentation and the released source identity, not MP's taste
acceptance or physical-device behaviour. The mask depends on CSS `mask-image`; a
browser without it keeps the uninterrupted artwork.

## Release notes

The guarded `deploy:publication` pair was run for this change. The first production
attempt was interrupted by a concurrent branch switch in the shared checkout
(`Source changed during preflight`), and a later attempt found `origin/main` had
moved again (#241). Production was then released from `396c685` by the concurrent
main release, which includes this work; the identity above is that deployment,
checked directly rather than inferred from a PR.
