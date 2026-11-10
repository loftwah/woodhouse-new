# Homepage redesign — 11 November 2026

Production screenshots of the homepage composition shipped under issue #158 and PR #176.
Released 2026/11/11 01:23 AEDT (Australia/Melbourne, UTC+11) / 2026/11/10 14:23 UTC.

- Source: `main` at `024e062630941aaf9a87754b23108e1e3dbc3bc6`
- Worker: `woodhouse-loftwah`, version `1d86de7c-4624-41df-859a-b292bbd56c17` at 100%
- Live: <https://woodhouse.loftwah.com/>
- Build identity: <https://woodhouse.loftwah.com/build.json> reports the same commit and a clean tree.

| File                       | What it shows                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `homepage-before-1440.jpg` | The previous production homepage: a framed plate beside the copy.                                                                                                 |
| `homepage-after-1440.jpg`  | The released first frame: full-width living artwork, “One human. Many worlds.”, overlay navigation, one primary action, the figure caption and its pause control. |
| `homepage-after-390.jpg`   | The same opening at 390px: heading and action first, then the sculpture, with the pause control and caption on the plate's lower edge.                            |
| `work-1440.jpg`            | Chapter 01, the first product spread with its real artwork and a single primary product action.                                                                   |
| `collection-1440.jpg`      | Chapter 04, the collection register with labelled actions and review dates.                                                                                       |
| `sound-390.jpg`            | Chapter 03, the shared radio player promoted to chapter scale at 390px.                                                                                           |

The screenshots are desktop Chrome at 1440×900 and a 390×844 phone viewport. They are evidence of
presentation and of the deployed source, not of physical-device behaviour, MP's taste acceptance or
the loom's motion, which was exercised separately: the live scene started, Freeze motion changed the
control to Resume motion with a status line, and reduced motion hid the control and kept the still
with its explanation.

The page renders the authored still until the first WebGL frame, so a screenshot taken with the tab
hidden shows the poster rather than the moving fibres. The released screenshots were taken with the
tab in the foreground.
