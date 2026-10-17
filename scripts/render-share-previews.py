"""Render bounded WebP gallery previews from a manifest produced by
scripts/render-share-previews.mjs.

Originals are never modified: every source file is read and a smaller preview is
written beside the gallery assets under public/share/previews/. Width is bounded
because the gallery displays these at roughly one grid column wide; the original
stays the download and full-size target.
"""

import json
import os
import sys

from PIL import Image, ImageOps

manifest = json.load(open(sys.argv[1], encoding="utf-8"))
max_width = int(manifest["maxWidth"])
quality = int(manifest["quality"])
written = 0
skipped = 0
for item in manifest["items"]:
    source = item["source"]
    destination = item["preview"]
    if not os.path.exists(source):
        print(f"skip {item['id']}: source missing")
        skipped += 1
        continue
    try:
        with Image.open(source) as opened:
            image = ImageOps.exif_transpose(opened)
            if image is None:
                image = opened
            if image.width > max_width:
                height = max(1, round(image.height * max_width / image.width))
                image = image.resize((max_width, height), Image.Resampling.LANCZOS)
            if image.mode == "P":
                image = image.convert("RGBA" if "transparency" in image.info else "RGB")
            elif image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if image.mode in ("LA", "PA") else "RGB")
            os.makedirs(os.path.dirname(destination), exist_ok=True)
            image.save(destination, "WEBP", quality=quality, method=5)
            written += 1
    except Exception as error:  # noqa: BLE001 - report and continue the batch
        print(f"skip {item['id']}: {error}")
        skipped += 1
print(f"Rendered {written} previews ({skipped} skipped).")
