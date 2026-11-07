"""Render the patch-bench product-story still at its two advertised sizes.

The observed failure: the exhibition capture at rest shows an empty canvas and
cuts the bench, so it cannot carry the story, and cropping it tighter would
imply play that is not happening. This renders a labelled illustration instead,
which states what it is on the artwork itself.

Same technique as `render-social-cards.py`: author SVG, let ImageMagick apply the
project's own Bricolage Grotesque, then strip to a JPEG. Deterministic, local,
no browser and no network.

    python3 scripts/render-story-still.py --out .release/stageshow-161
"""

from pathlib import Path
import html
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
FONT_PATH = ROOT / "scripts/assets/BricolageGrotesque-Variable.ttf"

INK = "#080d19"
RAISED = "#111a2c"
SOFT = "#17233a"
COPY = "#dce6f5"
COPY_SOFT = "#a9b8d0"
ACID = "#e9ff49"
CYAN = "#79d8ff"
COBALT = "#647dff"
CORAL = "#ff746a"

MODULES = (
    ("01", "The run", "A small game that routes signals", CYAN),
    ("02", "Its effects", "The sound effects the game owns", ACID),
    ("03", "The station", "A real LoftwahFM stream", COBALT),
)


def wide() -> str:
    modules = []
    for index, (number, name, note, colour) in enumerate(MODULES):
        x = 96 + index * 344
        modules.append(
            f'<rect x="{x}" y="286" width="304" height="176" rx="2" fill="{RAISED}" stroke="#243149"/>'
            f'<rect x="{x}" y="287" width="304" height="3" fill="{colour}"/>'
            f'<text x="{x + 22}" y="324" fill="{colour}" font-family="Bricolage Grotesque" font-size="15" font-weight="700" letter-spacing="1.1">{number}</text>'
            f'<text x="{x + 22}" y="368" fill="{COPY}" font-family="Bricolage Grotesque" font-size="27" font-weight="700">{html.escape(name)}</text>'
            f'<text x="{x + 22}" y="400" fill="{COPY_SOFT}" font-family="Bricolage Grotesque" font-size="15">{html.escape(note)}</text>'
        )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="{INK}"/>
  <rect width="1200" height="6" fill="{ACID}"/>
  <text x="96" y="92" fill="{ACID}" font-family="Bricolage Grotesque" font-size="16" font-weight="700" letter-spacing="2.2">WOODHOUSE · WORKING EXHIBIT</text>
  <text x="96" y="172" fill="{COPY}" font-family="Bricolage Grotesque" font-size="64" font-weight="800">Your game. Its own soundtrack.</text>
  <text x="96" y="222" fill="{COPY_SOFT}" font-family="Bricolage Grotesque" font-size="24">Three parts, three owners, one bench. Open it and take them apart.</text>
  {''.join(modules)}
  <path d="M400 374 H440 M744 374 H784" stroke="{COPY_SOFT}" stroke-width="2" stroke-dasharray="5 6"/>
  <circle cx="400" cy="374" r="3" fill="{CYAN}"/><circle cx="440" cy="374" r="3" fill="{ACID}"/>
  <circle cx="744" cy="374" r="3" fill="{ACID}"/><circle cx="784" cy="374" r="3" fill="{COBALT}"/>
  <line x1="96" y1="492" x2="1104" y2="492" stroke="#243149"/>
  <line x1="248" y1="486" x2="248" y2="498" stroke="#243149"/><line x1="592" y1="486" x2="592" y2="498" stroke="#243149"/><line x1="936" y1="486" x2="936" y2="498" stroke="#243149"/>
  <text x="1104" y="480" text-anchor="end" fill="{COPY_SOFT}" font-family="Bricolage Grotesque" font-size="14" letter-spacing="1.4">ONE BENCH</text>
  <text x="96" y="522" fill="{COPY}" font-family="Bricolage Grotesque" font-size="26" font-weight="700">The game owns its effects. LoftwahFM owns the music.</text>
  <text x="96" y="556" fill="{COPY_SOFT}" font-family="Bricolage Grotesque" font-size="19">One audio context, two buses. Disconnect the station and the run keeps its sound.</text>
  <rect x="96" y="582" width="322" height="1" fill="{SOFT}"/>
  <text x="96" y="612" fill="{CORAL}" font-family="Bricolage Grotesque" font-size="15">ILLUSTRATION OF A SHIPPED EXHIBIT — NOT A SCREENSHOT</text>
  <text x="1104" y="612" text-anchor="end" fill="{ACID}" font-family="Bricolage Grotesque" font-size="16" font-weight="700">woodhouse.loftwah.com/exhibits/patch-bench/</text>
</svg>'''


def portrait() -> str:
    modules = []
    for index, (number, name, note, colour) in enumerate(MODULES):
        y = 512 + index * 196
        modules.append(
            f'<rect x="72" y="{y}" width="936" height="164" rx="2" fill="{RAISED}" stroke="#243149"/>'
            f'<rect x="72" y="{y}" width="4" height="164" fill="{colour}"/>'
            f'<text x="108" y="{y + 44}" fill="{colour}" font-family="Bricolage Grotesque" font-size="17" font-weight="700" letter-spacing="1.2">{number}</text>'
            f'<text x="108" y="{y + 92}" fill="{COPY}" font-family="Bricolage Grotesque" font-size="40" font-weight="700">{html.escape(name)}</text>'
            f'<text x="108" y="{y + 130}" fill="{COPY_SOFT}" font-family="Bricolage Grotesque" font-size="24">{html.escape(note)}</text>'
            + (
                f'<line x1="540" y1="{y + 164}" x2="540" y2="{y + 196}" stroke="{COPY_SOFT}" stroke-width="2" stroke-dasharray="5 7"/>'
                f'<circle cx="540" cy="{y + 164}" r="3" fill="{colour}"/>'
                f'<circle cx="540" cy="{y + 196}" r="3" fill="{[m[3] for m in MODULES][index + 1]}"/>'
                if index < len(MODULES) - 1
                else ""
            )
        )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <rect width="1080" height="1350" fill="{INK}"/>
  <rect width="1080" height="8" fill="{ACID}"/>
  <text x="72" y="104" fill="{ACID}" font-family="Bricolage Grotesque" font-size="20" font-weight="700" letter-spacing="2.4">WOODHOUSE · WORKING EXHIBIT</text>
  <text x="72" y="228" fill="{COPY}" font-family="Bricolage Grotesque" font-size="88" font-weight="800">Your game.</text>
  <text x="72" y="326" fill="{ACID}" font-family="Bricolage Grotesque" font-size="88" font-weight="800">Its own</text>
  <text x="72" y="424" fill="{ACID}" font-family="Bricolage Grotesque" font-size="88" font-weight="800">soundtrack.</text>
  <text x="72" y="482" fill="{COPY_SOFT}" font-family="Bricolage Grotesque" font-size="27">Three parts, three owners, one bench.</text>
  {''.join(modules)}
  <text x="72" y="1162" fill="{COPY}" font-family="Bricolage Grotesque" font-size="30" font-weight="700">The game owns its effects.</text>
  <text x="72" y="1204" fill="{COPY}" font-family="Bricolage Grotesque" font-size="30" font-weight="700">LoftwahFM owns the music.</text>
  <text x="72" y="1248" fill="{COPY_SOFT}" font-family="Bricolage Grotesque" font-size="22">One audio context, two buses.</text>
  <rect x="72" y="1272" width="360" height="1" fill="{SOFT}"/>
  <text x="72" y="1306" fill="{CORAL}" font-family="Bricolage Grotesque" font-size="16">ILLUSTRATION OF A SHIPPED EXHIBIT — NOT A SCREENSHOT</text>
  <text x="1008" y="1306" text-anchor="end" fill="{ACID}" font-family="Bricolage Grotesque" font-size="17" font-weight="700">patch bench</text>
</svg>'''


def main() -> None:
    out = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--out=")), None)
    if len(sys.argv) > 1 and not out:
        raise SystemExit("Usage: render-story-still.py --out=<directory>")
    dest = Path(out) if out else ROOT / "output" / "story-stills"
    dest.mkdir(parents=True, exist_ok=True)
    for suffix, svg, width, height in (
        ("1200x630", wide(), 1200, 630),
        ("1080x1350", portrait(), 1080, 1350),
    ):
        source = dest / f"story-patch-bench-{suffix}.svg"
        source.write_text(svg, encoding="utf-8")
        target = dest / f"story-patch-bench-{suffix}.jpg"
        subprocess.run(
            [
                "magick",
                "-font",
                str(FONT_PATH),
                "-background",
                "none",
                str(source),
                "-background",
                INK,
                "-alpha",
                "remove",
                "-strip",
                "-quality",
                "92",
                str(target),
            ],
            check=True,
        )
        print(f"{target.relative_to(ROOT) if target.is_relative_to(ROOT) else target} {width}x{height}")


if __name__ == "__main__":
    main()
