"""Derive static OFL report fonts: resvg does not select a variable font's axes.

Observed failure: the variable source defaults to weight 800, flattening body and
axis typography into extra-bold. Run: uv run --with fonttools scripts/render-report-fonts.py
Existing upstream source and OFL licence live in scripts/assets; no remote font.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
root = Path(__file__).resolve().parent.parent
source = TTFont(root / "scripts/assets/BricolageGrotesque-Variable.ttf")
for weight in (400, 700):
    instance = instantiateVariableFont(source, {"wght": weight, "opsz": 24, "wdth": 100}, inplace=False)
    instance.save(root / f"public/fonts/bricolage-report-{weight}.ttf")
