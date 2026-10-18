#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT/diagrams"
IMAGE_DIR="$ROOT/public/images/diagrams"
PUBLIC_SOURCE_DIR="$ROOT/public/diagrams"

if ! command -v d2 >/dev/null 2>&1; then
  printf 'D2 CLI is required. Install it from https://d2lang.com/tour/install/\n' >&2
  exit 1
fi

mkdir -p "$IMAGE_DIR" "$PUBLIC_SOURCE_DIR" "$ROOT/output/diagram-models"
for source in "$SOURCE_DIR"/*.d2; do
  name="$(basename "$source" .d2)"
  d2 --font-regular "$ROOT/public/fonts/bricolage-report-400.ttf" \
    --font-bold "$ROOT/public/fonts/bricolage-report-700.ttf" \
    "$source" "$ROOT/output/diagram-models/$name.svg"
  cp "$source" "$PUBLIC_SOURCE_DIR/$name.d2"
done

node "$ROOT/scripts/render-illustrated-plates.mjs"
node "$ROOT/scripts/diagram-sizes.mjs"
