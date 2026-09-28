from pathlib import Path
import html
import subprocess
import tempfile
import textwrap

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
    "project-preview-unavailable": ("SOURCE PREVIEW", "Project image unavailable.", "The source site's artwork could not be reached. This is Woodhouse fallback artwork."),
}


def card_svg(label: str, title: str, subtitle: str) -> str:
    safe_label = html.escape(label)
    title_lines = textwrap.wrap(title, width=22, break_long_words=False, break_on_hyphens=False)
    subtitle_lines = textwrap.wrap(subtitle, width=59, break_long_words=False, break_on_hyphens=False)
    longest_title_line = max(map(len, title_lines))
    title_size = "66" if longest_title_line < 15 else "54" if longest_title_line < 20 else "44" if longest_title_line < 23 else "34"
    title_text = "\n  ".join(f'<text x="420" y="{263 + index * 58}" fill="#171812" font-family="Arial,sans-serif" font-size="{title_size}" font-weight="800">{html.escape(line)}</text>' for index, line in enumerate(title_lines))
    subtitle_y = 263 + (len(title_lines) - 1) * 58 + 68
    subtitle_text = "\n  ".join(f'<text x="420" y="{subtitle_y + index * 26}" fill="#34352f" font-family="Arial,sans-serif" font-size="18">{html.escape(line)}</text>' for index, line in enumerate(subtitle_lines))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#faf4e6"/>
  <rect width="354" height="630" fill="#e6f451"/>
  <path d="M354 0h22v630h-22z" fill="#171812"/>
  <path d="M0 0h1200v18H0z" fill="#171812"/>
  <path d="M56 58h44v44H56z" fill="#171812"/>
  <path d="M65 70h26M65 80h26M65 90h18" stroke="#e6f451" stroke-width="3"/>
  <text x="116" y="88" fill="#171812" font-family="Arial,sans-serif" font-size="17" font-weight="800" letter-spacing="2">WOODHOUSE</text>
  <path d="M54 154H296M54 170H254M54 186H212" stroke="#171812" stroke-width="6"/>
  <path d="M54 230h246v224H54z" fill="#f2744a" stroke="#171812" stroke-width="3"/>
  <text x="78" y="284" fill="#171812" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="1.2">THE LOFTWAH</text>
  <text x="78" y="314" fill="#171812" font-family="Arial,sans-serif" font-size="13" font-weight="700" letter-spacing="1.2">SOFTWARE FACTORY</text>
  <path d="M78 346h174" stroke="#171812" stroke-width="4"/>
  <text x="78" y="390" fill="#171812" font-family="Arial,sans-serif" font-size="16">Build · review · release</text>
  <circle cx="1170" cy="580" r="176" fill="#4665e8"/>
  <text x="420" y="127" fill="#a83a20" font-family="Menlo,monospace" font-size="16" font-weight="700" letter-spacing="3">{safe_label.upper()}</text>
  {title_text}
  <path d="M420 {subtitle_y - 34}h178" stroke="#f2744a" stroke-width="12"/>
  {subtitle_text}
  <path d="M420 494H1128" stroke="#171812" stroke-width="2"/>
  <text x="420" y="538" fill="#44453d" font-family="Menlo,monospace" font-size="14" letter-spacing="1">AN OBSERVABLE SOFTWARE FACTORY</text>
  <text x="420" y="580" fill="#44453d" font-family="Menlo,monospace" font-size="13" letter-spacing="1">REVIEWED 28 SEPTEMBER 2026</text>
  <text x="1128" y="580" fill="#171812" font-family="Menlo,monospace" font-size="13" text-anchor="end">LOFTWAH.COM</text>
</svg>'''


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    for name, content in CARDS.items():
        jpg_path = DEST / (name + ".jpg")
        jpg_path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=DEST) as scratch:
            scratch_path = Path(scratch)
            overlay = scratch_path / "overlay.png"
            source = scratch_path / "card.svg"
            source.write_text(card_svg(*content), encoding="utf-8")
            subprocess.run(["magick", "-background", "none", str(source), str(overlay)], check=True)
            subprocess.run(["magick", str(overlay), "-background", "#faf4e6", "-alpha", "remove", "-strip", "-quality", "90", str(jpg_path)], check=True)
        print(jpg_path.relative_to(ROOT))


if __name__ == "__main__":
    main()
