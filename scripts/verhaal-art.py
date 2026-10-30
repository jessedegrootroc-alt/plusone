"""Zet de illustraties uit ChatGPT (art/verhaal/*.png) om naar webp voor de animatic (public/verhaal/art/).
Lange zijde maximaal 2048 px, transparantie blijft. Draai opnieuw na elk nieuw beeld:

    python3 scripts/verhaal-art.py
"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art/verhaal"
OUT = ROOT / "public/verhaal/art"
MAX = 2048
# Beelden die in de animatic flink worden opgeblazen (de rook draait rond, de camera duikt in de rook en in het scherm
# van zijn telefoon): die gaan eerst 2x omhoog met Lanczos en licht verscherpt, anders rekt de browser ze zelf op en
# worden ze wazig en blokkerig
GROOT = {"rook-val", "rook-val-kleur", "close-melding"}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for png in sorted(SRC.glob("*.png")):
        out = OUT / f"{png.stem}.webp"
        if out.exists() and out.stat().st_mtime >= png.stat().st_mtime:
            continue
        im = Image.open(png)
        if png.stem in GROOT:
            im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=2))
        else:
            im.thumbnail((MAX, MAX), Image.LANCZOS)
        im.save(out, "WEBP", quality=84, method=4)
        print(f"{png.name:32} → {out.relative_to(ROOT)}  {im.size[0]}×{im.size[1]}")


if __name__ == "__main__":
    main()
