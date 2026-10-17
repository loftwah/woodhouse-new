# Woodhouse workshop — 18 October 2026

`master.png` is the selected illustration produced with the built-in Imagegen tool. It is an imagined paper-and-wood workshop, not a portrait or a screenshot of a product. `prompt.txt` preserves the generation direction. Typography remains editable in `scripts/render-social-cards.py`; generation is not expected to reproduce identical pixels.

Export from the repository root:

```sh
python3 scripts/render-social-cards.py --only=woodhouse
python3 scripts/render-social-cards.py --only=factory
```

The renderer uses the checked-in Bricolage Grotesque font and ImageMagick. It writes 1200 × 630 JPEGs at both the retained legacy URLs and dated `*-workshop-20261018.jpg` URLs. Metadata and the gallery use dated URLs, so new previews do not reuse cached old artwork. Historical report images are untouched.

Independent agent visual review compared the old card and the new export at full resolution and 300px feed width. The selected direction passed with readable main type, a clear maker/game/music relationship and no material collision. This is agent visual criticism, not human taste testing or platform unfurl verification.
