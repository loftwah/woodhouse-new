# Woodhouse workshop — 18 October 2026

`master.png` is the selected illustration produced with the built-in Imagegen tool. It is an imagined paper-and-wood workshop, not a portrait or a screenshot of a product. `prompt.txt` preserves the generation direction. Typography remains editable in `scripts/render-social-cards.py`; generation is not expected to reproduce identical pixels.

Export from the repository root:

```sh
python3 scripts/render-social-cards.py --only=woodhouse
python3 scripts/render-social-cards.py --only=factory
```

The renderer uses the checked-in Bricolage Grotesque font and ImageMagick. It writes 1200 × 630 JPEGs at both the retained legacy URLs and dated `*-workshop-20261018.jpg` URLs. Metadata and the gallery use dated URLs, so new previews do not reuse cached old artwork. Historical report images are untouched.

Independent agent visual review compared the old card and the new export at full resolution and 300px feed width. The selected direction passed with readable main type, a clear maker/game/music relationship and no material collision. This is agent visual criticism, not human taste testing or platform unfurl verification.

The founding essay reuses this same selected master without overprinted social-card text at `public/images/founding-workshop-20261018.webp`. It is a width-bounded WebP (`magick scripts/assets/woodhouse-workshop/master.png -resize '1600x1600>' -quality 86 public/images/founding-workshop-20261018.webp`), with the conceptual-illustration credit visible beside it. No new image was generated for that editorial reuse.

The Factory FM demonstration capture `public/images/factory-music-demo-20261018.webp` records the public Woodhouse `/lab/game-music.html?analytics=off` page at 1200×760 on 18 October 2026 before playback. It is product material, not generated artwork or an external adopter. No listening event was sent to make that capture.

`public/images/factory-composer-pair-20261018.webp` is a bounded WebP of the public App Composer `/demo` composition pair, captured at 1280×572 on 18 October 2026 from production source `152a886b1eb7de3768613a0429c38fe2713fea40`. The capture used App Composer’s supported same-origin verification header to exclude QA app opens. It shows the apps’ own published identities and links, not a new Woodhouse interpretation of their art. The original is retained with the owning Composer journey evidence.
