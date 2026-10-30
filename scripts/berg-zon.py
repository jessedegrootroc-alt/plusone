"""De top van de berg (berg-top-kleur) met de zon dichter bij de rots, zodat ze op een telefoon (staand, je ziet maar een
smalle strook van het brede beeld) samen in beeld passen. De lucht en de wolkenzee tussen de rots en de zon worden
zacht samengedrukt (geen naden: de gloed rond de zon is een vloeiend verloop); de rots, de zon zelf en de rotsen
onderaan blijven precies zoals ze waren. Rechts van de zon rekt de wolkenzee evenveel op, zodat het beeld even breed
blijft en op een breed scherm niets opvalt.

    python3 scripts/berg-zon.py && python3 scripts/verhaal-art.py
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art/verhaal/berg-top-kleur.png"
OUT = ROOT / "art/verhaal/berg-top-zon-kleur.png"
SHIFT = 70  # zoveel pixels schuift de zon naar links (van 1150 naar 1080 in het 1536-beeld; straal ~50 met de rand)
# Hier wordt samengedrukt (in het nieuwe beeld): rechts van de rand van de rots, en klaar vóór de zon begint (1080 - 50),
# zodat de zon in zijn geheel opschuift en rond blijft
SQUEEZE = (910, 1022)
STRETCH = (1290, 1536)  # en hier opgerekt
STILL = (690, 800)  # onder deze rijen loopt de rots verder naar rechts: daar schuift niets (zacht overgaand)


def smooth(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def main():
    img = np.asarray(Image.open(SRC).convert("RGBA")).astype(np.float32)
    h, w, _ = img.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # Elk pixel haalt zijn kleur van iets verder naar rechts: tussen de rots en de zon steeds meer, vanaf de zon SHIFT
    d = SHIFT * smooth(*SQUEEZE, xx) * (1 - smooth(*STRETCH, xx)) * (1 - smooth(*STILL, yy))
    sx = np.clip(xx + d, 0, w - 1)
    x0 = np.floor(sx).astype(int)
    x1 = np.minimum(x0 + 1, w - 1)
    f = (sx - x0)[..., None]
    rows = yy.astype(int)
    out = img[rows, x0] * (1 - f) + img[rows, x1] * f
    Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8)).save(OUT)
    print(f"{OUT.relative_to(ROOT)}  {w}×{h}, zon {SHIFT} px naar links")


if __name__ == "__main__":
    main()
