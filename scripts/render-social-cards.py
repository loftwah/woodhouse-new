from pathlib import Path
import html
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "public" / "og"
CARDS = {
    "woodhouse": ("THE LOFTWAH SOFTWARE FACTORY", "Keeping the machinery running.", "Eight projects. One human operator."),
    "factory": ("THE FACTORY FLOOR", "Eight projects.", "Eight kinds of proof."),
    "dean": ("THE HUMAN OPERATOR", "Dean Lofts.", "Systems that turn intent into shipped software."),
    "dispatches/i-didnt-mean-to-build-a-software-factory": ("FOUNDING ESSAY", "I Didn't Mean to Build a Software Factory", "How agents, evidence and real products became one system."),
    "the-tests-passed": ("FACTORY INCIDENT", "The tests passed.", "The game still looked wrong."),
    "dispatches/a-gate-for-what-the-source-proves": ("PIRATES · FIELD NOTE", "Parity before invention.", "The Gate B reconstruction stays locked until the source supports it."),
    "dispatches/software-is-not-the-walker": ("MAX · FIELD NOTE", "Software is not the walker.", "A green build cannot prove the real-world FIND path."),
    "projects/bubbles": ("PROJECT DOSSIER · 01", "BUBBLES", "FINAL CONVERGENCE"),
    "projects/fighter": ("PROJECT DOSSIER · 02", "FIGHTER", "A+ CONVERGENCE"),
    "projects/shoalshot": ("PROJECT DOSSIER · 03", "SHOALSHOT", "RELEASE CONVERGENCE"),
    "projects/protocol-11": ("PROJECT DOSSIER · 04", "PROTOCOL 11", "QUALIFICATION & RECONCILIATION"),
    "projects/max": ("PROJECT DOSSIER · 05", "MAX", "PHYSICAL PROOF REQUIRED"),
    "projects/pirates": ("PROJECT DOSSIER · 06", "PIRATES", "GATE B LOCKED"),
    "projects/loftwahfm": ("PROJECT DOSSIER · 07", "LOFTWAHFM", "PARKED AGAINST THE LARGER ROADMAP"),
    "projects/social-club": ("PROJECT DOSSIER · 08", "SOCIAL CLUB", "PARKED"),
}


def card_svg(label: str, title: str, subtitle: str) -> str:
    safe_label = html.escape(label)
    safe_title = html.escape(title)
    safe_subtitle = html.escape(subtitle)
    title_size = "62" if len(title) < 20 else "48"
    fade_bands = "\n  ".join(
        f'<rect x="{x}" width="80" height="630" fill="#141512" fill-opacity="{opacity}"/>'
        for x, opacity in ((680, ".92"), (760, ".78"), (840, ".58"), (920, ".38"), (1000, ".20"), (1080, ".07"))
    )
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="680" height="630" fill="#141512"/>
  {fade_bands}
  <path d="M64 62H1136M64 568H1136" stroke="#8e794f" stroke-width="1"/>
  <circle cx="78" cy="85" r="16" fill="none" stroke="#c6a96a"/>
  <path d="M69 82h18M72 87h12M75 92h6" stroke="#c6a96a" stroke-width="1"/>
  <text x="108" y="90" fill="#f0ebdf" font-family="Georgia,serif" font-size="22" letter-spacing="5">WOODHOUSE</text>
  <text x="64" y="146" fill="#c6a96a" font-family="Menlo,monospace" font-size="14" letter-spacing="2">{safe_label.upper()}</text>
  <text x="64" y="282" fill="#f0ebdf" font-family="Georgia,serif" font-size="{title_size}" font-weight="500">{safe_title}</text>
  <path d="M64 317h68" stroke="#c6a96a" stroke-width="2"/>
  <text x="64" y="366" fill="#d2c9b5" font-family="Arial,sans-serif" font-size="24">{safe_subtitle}</text>
  <text x="64" y="535" fill="#b8b5a9" font-family="Menlo,monospace" font-size="13" letter-spacing="1">AN OBSERVABLE SOFTWARE FACTORY</text>
  <text x="64" y="592" fill="#b8b5a9" font-family="Menlo,monospace" font-size="12" letter-spacing="1">REVIEWED 28 SEPTEMBER 2026</text>
  <text x="1136" y="592" fill="#c6a96a" font-family="Menlo,monospace" font-size="12" text-anchor="end">LOFTWAH.COM</text>
</svg>'''


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    art_path = ROOT / "public" / "images" / "woodhouse-card.jpg"
    for name, content in CARDS.items():
        jpg_path = DEST / (name + ".jpg")
        jpg_path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=DEST) as scratch:
            scratch_path = Path(scratch)
            art_crop = scratch_path / "art.jpg"
            base = scratch_path / "base.png"
            overlay = scratch_path / "overlay.png"
            source = scratch_path / "card.svg"
            source.write_text(card_svg(*content), encoding="utf-8")
            subprocess.run(["magick", str(art_path), "-resize", "600x630^", "-gravity", "center", "-extent", "600x630", "-evaluate", "Multiply", "0.90", str(art_crop)], check=True)
            subprocess.run(["magick", "-size", "1200x630", "xc:#141512", str(art_crop), "-gravity", "east", "-composite", str(base)], check=True)
            subprocess.run(["magick", "-background", "none", str(source), str(overlay)], check=True)
            subprocess.run(["magick", str(base), str(overlay), "-compose", "over", "-composite", "-strip", "-quality", "88", str(jpg_path)], check=True)
        print(jpg_path.relative_to(ROOT))


if __name__ == "__main__":
    main()
