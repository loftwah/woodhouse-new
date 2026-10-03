from pathlib import Path
import html
import subprocess
import tempfile
import textwrap

ROOT = Path(__file__).resolve().parents[1]
FONT_PATH = ROOT / "scripts/assets/BricolageGrotesque-Variable.ttf"
DEST = ROOT / "public" / "og"
# The project dossier preview is an authored image, separate from this batch renderer.
CARDS = {
    "woodhouse": ("THE LOFTWAH SOFTWARE FACTORY", "Keeping the machinery running.", "Eight projects. One human operator."),
    "factory": ("THE FACTORY FLOOR", "Eight projects.", "Eight kinds of proof."),
    "dean": ("THE HUMAN OPERATOR", "Dean Lofts.", "Systems that turn intent into shipped software."),
    "dispatches/i-didnt-mean-to-build-a-software-factory": ("FOUNDING ESSAY", "I Didn't Mean to Build a Software Factory", "How agents, evidence and real products became one system."),
    "the-tests-passed": ("FACTORY INCIDENT", "The tests passed.", "The game still looked wrong."),
    "dispatches/a-gate-for-what-the-source-proves": ("PIRATES · FIELD NOTE", "Parity before invention.", "The Gate B reconstruction stays locked until the source supports it."),
    "dispatches/software-is-not-the-walker": ("MAX · FIELD NOTE", "Software is not the walker.", "A green build cannot prove the real-world FIND path."),
}


def card_svg(label: str, title: str, subtitle: str) -> str:
    safe_label = html.escape(label)
    title_lines = textwrap.wrap(title, width=22, break_long_words=False, break_on_hyphens=False)
    subtitle_lines = textwrap.wrap(subtitle, width=59, break_long_words=False, break_on_hyphens=False)
    longest_title_line = max(map(len, title_lines))
    title_size = "66" if longest_title_line < 15 else "54" if longest_title_line < 20 else "44" if longest_title_line < 23 else "34"
    title_text = "\n  ".join(f'<text x="416" y="{244 + index * 58}" fill="#f4f7fd" font-family="Bricolage Grotesque" font-size="{title_size}" font-weight="800">{html.escape(line)}</text>' for index, line in enumerate(title_lines))
    subtitle_y = 244 + (len(title_lines) - 1) * 58 + 70
    subtitle_text = "\n  ".join(f'<text x="416" y="{subtitle_y + index * 27}" fill="#b7c7df" font-family="Bricolage Grotesque" font-size="18">{html.escape(line)}</text>' for index, line in enumerate(subtitle_lines))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#101b31"/><stop offset="1" stop-color="#080d19"/></linearGradient>
    <linearGradient id="stripe" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e9ff49"/><stop offset=".52" stop-color="#78d8ff"/><stop offset="1" stop-color="#ff746a"/></linearGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#8095bb" opacity=".32"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#wash)"/>
  <rect width="1200" height="8" fill="url(#stripe)"/>
  <path d="M0 8h350v622H0z" fill="#111a2c"/>
  <path d="M0 8h350v622H0z" fill="url(#dots)"/>
  <path d="M350 8h2v622h-2z" fill="#647dff"/>
  <circle cx="62" cy="70" r="22" fill="#080d19" stroke="#e9ff49" stroke-width="2"/>
  <path d="M52 64h20M54 70h16M57 76h10" stroke="#e9ff49" stroke-width="2"/>
  <text x="99" y="66" fill="#f4f7fd" font-family="Bricolage Grotesque" font-size="18" font-weight="800" letter-spacing="2">WOODHOUSE</text>
  <text x="99" y="88" fill="#a9b8d0" font-family="Bricolage Grotesque" font-size="12">THE LOFTWAH SOFTWARE FACTORY</text>
  <text x="48" y="142" fill="#79d8ff" font-family="Menlo,monospace" font-size="12" font-weight="700" letter-spacing="1.4">ONE HUMAN · EIGHT PROJECTS</text>
  <path d="M71 192V486" stroke="#647dff" stroke-width="3" stroke-dasharray="5 7"/>
  <circle cx="71" cy="204" r="12" fill="#e9ff49"/><text x="104" y="201" fill="#f4f7fd" font-family="Bricolage Grotesque" font-size="17" font-weight="700">Intent</text><text x="104" y="220" fill="#a9b8d0" font-family="Bricolage Grotesque" font-size="12">Human sets the boundary</text>
  <circle cx="71" cy="273" r="12" fill="#79d8ff"/><text x="104" y="270" fill="#f4f7fd" font-family="Bricolage Grotesque" font-size="17" font-weight="700">Work</text><text x="104" y="289" fill="#a9b8d0" font-family="Bricolage Grotesque" font-size="12">Agents move it forward</text>
  <circle cx="71" cy="342" r="12" fill="#647dff"/><text x="104" y="339" fill="#f4f7fd" font-family="Bricolage Grotesque" font-size="17" font-weight="700">Review</text><text x="104" y="358" fill="#a9b8d0" font-family="Bricolage Grotesque" font-size="12">A person checks the change</text>
  <circle cx="71" cy="411" r="12" fill="#ff746a"/><text x="104" y="408" fill="#f4f7fd" font-family="Bricolage Grotesque" font-size="17" font-weight="700">Release</text><text x="104" y="427" fill="#a9b8d0" font-family="Bricolage Grotesque" font-size="12">Production makes it real</text>
  <circle cx="71" cy="480" r="12" fill="#e9ff49"/><text x="104" y="477" fill="#f4f7fd" font-family="Bricolage Grotesque" font-size="17" font-weight="700">Evidence</text><text x="104" y="496" fill="#a9b8d0" font-family="Bricolage Grotesque" font-size="12">Results return to the operator</text>
  <path d="M416 94h116" stroke="#e9ff49" stroke-width="5"/>
  <text x="416" y="130" fill="#79d8ff" font-family="Menlo,monospace" font-size="15" font-weight="700" letter-spacing="2">{safe_label.upper()}</text>
  {title_text}
  <path d="M416 {subtitle_y - 34}h174" stroke="url(#stripe)" stroke-width="5"/>
  {subtitle_text}
  <path d="M416 534H1148" stroke="#34425e" stroke-width="1"/>
  <text x="416" y="571" fill="#a9b8d0" font-family="Menlo,monospace" font-size="13" letter-spacing="1">AN OBSERVABLE SOFTWARE FACTORY</text>
  <text x="416" y="600" fill="#e9ff49" font-family="Menlo,monospace" font-size="13" letter-spacing="1">REVIEWED 28 SEPTEMBER 2026</text>
  <text x="1148" y="600" fill="#a9b8d0" font-family="Menlo,monospace" font-size="13" text-anchor="end">LOFTWAH.COM</text>
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
            subprocess.run(["magick", "-font", str(FONT_PATH), "-background", "none", str(source), str(overlay)], check=True)
            subprocess.run(["magick", str(overlay), "-background", "#080d19", "-alpha", "remove", "-strip", "-quality", "90", str(jpg_path)], check=True)
        print(jpg_path.relative_to(ROOT))


if __name__ == "__main__":
    main()
