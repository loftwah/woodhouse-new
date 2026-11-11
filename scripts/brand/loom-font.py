#!/usr/bin/env python3
"""Loom Display — the Woodhouse house face.

A display cut drawn from one system: a 84-unit fibre on a 700-unit cap height,
every curve a superellipse of exponent 2.55, every straight joint bevelled,
round overshoot 10, lowercase absent by design.

Run it to rebuild the binaries and the specimen:

    python3 scripts/brand/loom-font.py

Outputs public/fonts/loom-display.{ttf,woff2}, the glyph source used by the
brand film, and a specimen page for inspection.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

from loom_shapes import (
    CAP,
    STROKE,
    band,
    bezier,
    clip,
    half_disc,
    rect,
    reverse,
    ring,
    superellipse,
)

ROOT = Path(__file__).resolve().parents[2]
FONT_DIR = ROOT / "public" / "fonts"
DATA_DIR = ROOT / "src" / "data"

FAMILY = "Loom Display"
VERSION = "1.000"

Contour = list[tuple[float, float]]
Glyph = dict[str, object]

GLYPHS: dict[str, Glyph] = {}


def add(name: str, advance: float, contours: list[Contour], round=False, descender=0.0) -> None:
    """Register a glyph, clipping its ink to the letter's box.

    Round shapes carry a 10-unit overshoot above the cap height and below the
    baseline; flat shapes stop exactly on both.
    """
    if round:
        box = (-40.0, -12.0 - descender, advance, 712.0)
    else:
        box = (0.0, 0.0, advance - 50.0, CAP)
    cleaned = []
    for contour in contours:
        points = clip(contour, *box)
        if len(points) >= 3:
            cleaned.append(points)
    GLYPHS[name] = {"advance": advance, "contours": cleaned}


def stem(x: float, y0: float, y1: float) -> Contour:
    return rect(x, y0, x + STROKE, y1)


# ---------------------------------------------------------------- capitals ---

add("H", 620, [stem(0, 0, 700), stem(436, 0, 700), rect(0, 306, 520, 390)])
add("I", 184, [stem(0, 0, 700)])
add("E", 600, [stem(0, 0, 700), rect(0, 616, 520, 700), rect(0, 308, 468, 392), rect(0, 0, 520, 84)])
add("F", 588, [stem(0, 0, 700), rect(0, 616, 520, 700), rect(0, 308, 468, 392)])
add("L", 588, [stem(0, 0, 700), rect(0, 0, 520, 84)])
add("T", 610, [rect(0, 616, 520, 700), stem(218, 0, 700)])
add("N", 620, [stem(0, 0, 700), stem(436, 0, 700), band([(30, 760), (490, -60)])])
add("M", 720, [stem(0, 0, 700), stem(616, 0, 700), band([(24, 760), (350, 44), (676, 760)])])
add("K", 620, [stem(0, 0, 700), band([(560, 764), (36, 348)]), band([(36, 352), (560, -64)])])
add("X", 620, [band([(6, 764), (514, -64)]), band([(514, 764), (6, -64)])])
add("Y", 640, [band([(10, 764), (262, 360)]), band([(530, 764), (262, 360)]), rect(220, 0, 304, 392)])
add("Z", 604, [rect(0, 616, 520, 700), band([(492, 700), (28, 0)]), rect(0, 0, 520, 84)])
add("A", 660, [band([(16, -64), (282, 744)]), band([(544, -64), (278, 744)]), rect(120, 296, 440, 380)])
add("V", 660, [band([(16, 764), (282, -44)]), band([(544, 764), (278, -44)])])
add(
    "W",
    820,
    [
        band([(16, 764), (182, -44)]),
        band([(352, 764), (182, -44)]),
        band([(352, 764), (518, -44)]),
        band([(688, 764), (518, -44)]),
    ],
)
add("U", 620, [stem(0, 200, 700), stem(436, 200, 700), *ring(260, 200, 218, 210, a0=180, a1=360)], round=True)
add("J", 540, [stem(396, 0, 700), *ring(438, 220, 330, 230, a0=180, a1=272)], round=True)
add("O", 680, ring(294, 350, 252, 318), round=True)
add("C", 668, ring(284, 350, 242, 318, a0=32, a1=328), round=True)
add(
    "G",
    690,
    ring(284, 350, 242, 318, a0=22, a1=352) + [rect(392, 306, 574, 390)],
    round=True,
)
add("Q", 700, ring(294, 350, 252, 318) + [band([(372, 148), (648, -108)])], round=True, descender=120)
add(
    "D",
    620,
    [half_disc(302, 350, 218, 360, 0), reverse(half_disc(302, 350, 134, 276, 84))],
    round=True,
)
add(
    "P",
    604,
    [stem(0, 0, 700), half_disc(302, 505, 218, 205, 0), reverse(half_disc(302, 505, 134, 121, 84))],
    round=True,
)
add(
    "B",
    604,
    [
        stem(0, 0, 700),
        half_disc(302, 530, 200, 180, 0),
        reverse(half_disc(302, 530, 116, 96, 84)),
        half_disc(302, 212, 218, 222, 0),
        reverse(half_disc(302, 212, 134, 138, 84)),
    ],
    round=True,
)
add(
    "R",
    630,
    [
        stem(0, 0, 700),
        half_disc(302, 505, 218, 205, 0),
        reverse(half_disc(302, 505, 134, 121, 84)),
        band([(286, 336), (548, -40)]),
    ],
    round=True,
)

# S is the one letter that is not two bowls welded together: the two ellipses
# share an inflection at 350, so the spine changes direction of bend once.
S_SPINE = superellipse(302, 530, 235, 180, 20, 270) + superellipse(302, 170, 235, 180, 90, -190)[1:]
add("S", 620, [band(S_SPINE, join="miter")], round=True)

# ---------------------------------------------------------------- figures ---

add("zero", 600, ring(280, 350, 238, 328), round=True)
add("one", 420, [stem(160, 0, 700), band([(258, 712), (140, 604)])])
add(
    "two",
    600,
    [
        *ring(280, 492, 196, 196, a0=148, a1=16),
        band([(492, 566), (60, 42)]),
        rect(0, 0, 560, 84),
    ],
    round=True,
)
add(
    "three",
    604,
    [
        *ring(302, 520, 205, 172, a0=150, a1=-45),
        *ring(302, 180, 222, 190, a0=60, a1=-150),
        rect(110, 310, 512, 394),
    ],
    round=True,
)
add("four", 620, [stem(330, 0, 700), band([(414, 760), (16, 258)]), rect(0, 244, 520, 328)])
add(
    "five",
    604,
    [
        rect(0, 616, 520, 700),
        stem(0, 408, 700),
        half_disc(302, 220, 218, 230, 0),
        reverse(half_disc(302, 220, 134, 146, 84)),
    ],
    round=True,
)
SIX_SPINE = bezier((64, 268), (42, 470), (110, 712), (404, 700), 48)
add(
    "six",
    604,
    [*ring(280, 214, 216, 224), band(SIX_SPINE, join="miter")],
    round=True,
)
add(
    "nine",
    604,
    [*ring(280, 486, 216, 224), band([(560 - x, 700 - y) for x, y in SIX_SPINE], join="miter")],
    round=True,
)
add("seven", 580, [rect(0, 616, 520, 700), band([(492, 660), (128, -40)])])
add(
    "eight",
    604,
    [*ring(280, 540, 158, 162), *ring(280, 176, 196, 186)],
    round=True,
)

# ------------------------------------------------------------ punctuation ---

def dot(x: float, y: float, size: float = 84) -> Contour:
    return superellipse(x + size / 2, y + size / 2, size / 2, size / 2)


add("space", 240, [])
add("period", 184, [dot(0, 0)])
add("comma", 184, [dot(0, 0), band([(58, 74), (8, -104)])], descender=120)
add("colon", 184, [dot(0, 0), dot(0, 232)])
add("semicolon", 184, [dot(0, 232), dot(0, 0), band([(58, 74), (8, -104)])], descender=120)
add("exclam", 210, [rect(0, 232, 84, 700), dot(0, 0)])
add(
    "question",
    560,
    [
        *ring(280, 512, 186, 198, a0=176, a1=14),
        band([(430, 500), (296, 240)]),
        rect(258, 176, 342, 240),
        dot(258, 0),
    ],
    round=True,
)
add("quotesingle", 210, [rect(40, 512, 124, 700)])
add("quotedbl", 360, [rect(40, 512, 124, 700), rect(206, 512, 290, 700)])
add("quoteleft", 210, [band([(100, 700), (44, 560)])])
add("hyphen", 400, [rect(0, 306, 320, 390)])
add("endash", 520, [rect(0, 306, 440, 390)])
add("emdash", 700, [rect(0, 306, 620, 390)])
add("plus", 600, [rect(0, 306, 520, 390), rect(218, 88, 302, 608)])
add("equal", 600, [rect(0, 240, 520, 324), rect(0, 372, 520, 456)])
add("slash", 560, [band([(490, 764), (70, -64)])])
add("parenleft", 330, ring(318, 340, 274, 420, a0=104, a1=256), round=True, descender=100)
add("parenright", 330, ring(12, 340, 274, 420, a0=-76, a1=76), round=True, descender=100)
add("bullet", 400, [superellipse(200, 350, 74, 74)])

# ------------------------------------------------------------------ build ---

LOWERCASE = {
    "a": "A", "b": "B", "c": "C", "d": "D", "e": "E", "f": "F", "g": "G", "h": "H",
    "i": "I", "j": "J", "k": "K", "l": "L", "m": "M", "n": "N", "o": "O", "p": "P",
    "q": "Q", "r": "R", "s": "S", "t": "T", "u": "U", "v": "V", "w": "W", "x": "X",
    "y": "Y", "z": "Z",
}

CMAP = {
    "A": 0x41, "B": 0x42, "C": 0x43, "D": 0x44, "E": 0x45, "F": 0x46, "G": 0x47,
    "H": 0x48, "I": 0x49, "J": 0x4A, "K": 0x4B, "L": 0x4C, "M": 0x4D, "N": 0x4E,
    "O": 0x4F, "P": 0x50, "Q": 0x51, "R": 0x52, "S": 0x53, "T": 0x54, "U": 0x55,
    "V": 0x56, "W": 0x57, "X": 0x58, "Y": 0x59, "Z": 0x5A,
    "zero": 0x30, "one": 0x31, "two": 0x32, "three": 0x33, "four": 0x34,
    "five": 0x35, "six": 0x36, "seven": 0x37, "eight": 0x38, "nine": 0x39,
    "space": 0x20, "period": 0x2E, "comma": 0x2C, "colon": 0x3A, "semicolon": 0x3B,
    "exclam": 0x21, "question": 0x3F, "quotesingle": 0x27, "quotedbl": 0x22,
    "quoteleft": 0x2018, "hyphen": 0x2D, "endash": 0x2013, "emdash": 0x2014,
    "plus": 0x2B, "equal": 0x3D, "slash": 0x2F, "parenleft": 0x28,
    "parenright": 0x29, "bullet": 0x2022,
}

GLYPH_ORDER = [".notdef", "space"] + [
    name for name in GLYPHS if name != "space"
]

KERNING = {
    "A": {"V": -44, "W": -36, "Y": -48, "T": -50, "C": -14, "G": -14, "O": -14, "Q": -14},
    "F": {"A": -20, "O": -14, "C": -12, "G": -12, "period": -18, "comma": -18},
    "L": {"V": -46, "W": -36, "Y": -50, "T": -40},
    "P": {"A": -20, "O": -12, "C": -10, "period": -22, "comma": -22},
    "R": {"V": -18, "W": -12, "Y": -20},
    "T": {"A": -50, "O": -14, "C": -12, "G": -12, "S": -12, "period": -26, "comma": -26, "hyphen": -18},
    "V": {"A": -44, "O": -16, "C": -14, "G": -14, "period": -30, "comma": -30},
    "W": {"A": -36, "O": -12, "period": -24, "comma": -24},
    "Y": {"A": -48, "O": -16, "C": -14, "G": -14, "period": -30, "comma": -30},
    "O": {"A": -14, "period": -14, "comma": -14},
    "C": {"A": -14, "period": -12, "comma": -12},
    "G": {"A": -14},
    "period": {"period": -18},
}


def build_font() -> None:
    FONT_DIR.mkdir(parents=True, exist_ok=True)

    glyph_order = GLYPH_ORDER
    pen_glyphs = {}
    for name in glyph_order:
        pen = TTGlyphPen(None)
        if name == ".notdef":
            for contour in (rect(60, 60, 440, 640), reverse(rect(140, 140, 360, 560))):
                pen.moveTo(contour[0])
                for point in contour[1:]:
                    pen.lineTo(point)
                pen.closePath()
        else:
            for contour in GLYPHS[name]["contours"]:  # type: ignore[index]
                pen.moveTo(contour[0])
                for point in contour[1:]:
                    pen.lineTo(point)
                pen.closePath()
        pen_glyphs[name] = pen.glyph()

    metrics = {}
    for name in glyph_order:
        advance = GLYPHS[name]["advance"] if name != ".notdef" else 500  # type: ignore[index]
        metrics[name] = (round(advance), 0)

    builder = FontBuilder(1000, isTTF=True)
    builder.setupGlyphOrder(glyph_order)
    mapping = {CMAP[name]: name for name in GLYPHS if name in CMAP}
    for lower, upper in LOWERCASE.items():
        if upper in CMAP:
            mapping[ord(lower)] = upper
    builder.setupCharacterMap(mapping)
    builder.setupGlyf(pen_glyphs)
    builder.setupHorizontalMetrics(metrics)
    builder.setupHorizontalHeader(ascent=800, descent=-240)
    builder.setupNameTable(
        {
            "familyName": FAMILY,
            "styleName": "Regular",
            "uniqueFontIdentifier": f"{FAMILY} Regular {VERSION}; Loftwah Software Factory",
            "fullName": f"{FAMILY} Regular",
            "psName": "LoomDisplay-Regular",
            "version": f"Version {VERSION}",
            "copyright": "Copyright 2026 Dean Lofts. Released with the Woodhouse repository under the MIT licence.",
            "designer": "Dean Lofts",
            "manufacturer": "Loftwah Software Factory",
            "description": "An all-caps display cut: one 84-unit fibre, superellipse curves, bevelled joints.",
        }
    )
    builder.setupOS2(
        sTypoAscender=700,
        sTypoDescender=-240,
        sTypoLineGap=0,
        usWinAscent=800,
        usWinDescent=240,
        sxHeight=0,
        sCapHeight=700,
        achVendID="LOFT",
        fsType=0,
        usWeightClass=400,
        usWidthClass=5,
        panose=dict(
            bFamilyType=2, bSerifStyle=0, bWeight=5, bProportion=4, bContrast=0,
            bStrokeVariation=0, bArmStyle=0, bLetterForm=0, bMidline=0, bXHeight=0,
        ),
    )
    builder.setupPost(italicAngle=0.0, underlinePosition=-140, underlineThickness=84, isFixedPitch=0)
    builder.font["head"].unitsPerEm = 1000

    features = []
    for left, pairs in KERNING.items():
        for right, value in pairs.items():
            features.append(f"    pos {left} {right} {value};")
    if features:
        builder.addOpenTypeFeatures("feature kern {\n" + "\n".join(features) + "\n} kern;\n")

    ttf = FONT_DIR / "loom-display.ttf"
    builder.save(ttf)
    builder.font.flavor = "woff2"
    builder.save(FONT_DIR / "loom-display.woff2")
    builder.font.flavor = None

    (DATA_DIR / "loom-glyphs.json").write_text(
        json.dumps(
            {
                "family": FAMILY,
                "version": VERSION,
                "capHeight": CAP,
                "stroke": STROKE,
                "glyphs": {
                    name: {
                        "advance": round(g["advance"]),
                        "contours": [
                            [[round(x, 1), round(y, 1)] for x, y in contour]
                            for contour in g["contours"]
                        ],
                    }
                    for name, g in GLYPHS.items()
                },
            },
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"built {ttf.name}, woff2 and {len(GLYPHS)} glyphs")


if __name__ == "__main__":
    build_font()
