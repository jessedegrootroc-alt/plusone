"""Het briefje in zijn jaszak (close-jaszak): de post-it die hij van de spiegel scheurde, met zijn keuze erop. De tekst
wordt in de tekening zelf geschreven, zoals een tekenaar het zou doen: in het vlak van het papier (perspectief), met de
kreukels mee gebogen, met de schaduw van elk facet erover, gebarsten langs de vouwen en onder zijn duim. Per keuze en
per taal één beeld (close-jaszak-kleur-rook.png, ...-rook-en.png, ...), daarna omzetten naar webp:

    python3 scripts/briefje-art.py && python3 scripts/verhaal-art.py

Het handschrift is Caveat, net als op het afscheurblaadje in de animatic; de browser (Playwright WebKit) zet de tekst,
zodat de regels net zo afbreken.
"""
import asyncio
import random
import re
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "art/verhaal/close-jaszak-kleur.png"
SIZE = 2048  # 2x, net als de beelden die flink worden opgeblazen (zie GROOT in verhaal-art.py)
# De hoeken van het papier in het 1024-beeld: linksboven, rechtsboven, rechtsonder en linksonder (onder zijn duim, geschat)
CORNERS = [(548, 228), (834, 327), (754, 613), (468, 514)]
# Waar de tekst op het papier staat (0..1 van het papier): iets rechts van het midden en hoog, vrij van zijn duim
CENTER, WIDTH, MAX_H = (0.52, 0.45), 0.7, 0.46
INK = np.array([29, 28, 26], np.float32) / 255  # de stift van de spiegel (#1d1c1a)
N = 1000  # het papier als vlak van N x N css-pixels


def labels():
    """De keuzes uit script.ts (één bron voor de tekst): {id: (nl, en)}."""
    text = (ROOT / "src/animatic/script.ts").read_text()
    return {k: (nl, en) for k, nl, en in re.findall(r"\{ id: '(\w+)', label: t\('([^']+)', '([^']+)'\) \}", text)}


async def handwriting(texts):
    """Elke tekst als inktmasker (N x N, 0..1) in het vlak van het papier. Elk woord en elke letter een klein beetje
    anders (scheef, op en neer, groter of kleiner), zoals je schrijft: dezelfde letter is nooit twee keer gelijk. De regels
    breken af zoals op het afscheurblaadje (text-wrap: balance)."""
    from playwright.async_api import async_playwright
    out = {}
    async with async_playwright() as p:
        b = await p.webkit.launch(headless=True)
        pg = await b.new_page(viewport={"width": N, "height": N}, device_scale_factor=2)
        for text in texts:
            rnd = random.Random(text)
            jitter = lambda r, y, z: f"rotate:{rnd.uniform(-r, r):.2f}deg;translate:0 {rnd.uniform(-y, y):.3f}em;scale:{rnd.uniform(1 - z, 1 + z):.3f}"
            words = " ".join(f'<span style="{jitter(2.2, 0.035, 0.04)}">' + "".join(f'<i style="{jitter(4, 0.03, 0.05)}">{c}</i>' for c in w) + "</span>"
                             for w in text.split())
            await pg.set_content(f"""<html><head><link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=block" rel="stylesheet">
<style>html, body {{ margin: 0; background: transparent; }} #p {{ position: relative; width: {N}px; height: {N}px; }}
#t {{ position: absolute; left: {CENTER[0] * N}px; top: {CENTER[1] * N}px; width: {WIDTH * N}px; translate: -50% -50%; rotate: -1.2deg;
font: 700 188px/0.9 Caveat; text-align: center; text-wrap: balance; color: #000; }} #t span, #t i {{ display: inline-block; font-style: normal; white-space: nowrap; }}</style></head>
<body><div id="p"><div id="t">{words}</div></div></body></html>""")
            await pg.evaluate("document.fonts.ready")
            if not await pg.evaluate("document.fonts.check('700 160px Caveat')"):
                raise SystemExit("Caveat is niet geladen (geen internet?)")
            # Zo groot als past (zoals je op een post-it schrijft): niet hoger dan MAX_H van het papier, geen woord breder dan de regel
            await pg.evaluate(f"(() => {{ const t = document.getElementById('t'); let s = 188; const fits = () => t.offsetHeight <= {MAX_H * N} && [...t.children].every((w) => w.offsetWidth <= t.clientWidth); while (!fits() && s > 80) {{ s -= 4; t.style.fontSize = s + 'px' }} }})()")
            png = await pg.locator("#p").screenshot(omit_background=True)
            im = Image.open(__import__("io").BytesIO(png)).getchannel("A").resize((N, N), Image.LANCZOS)
            out[text] = np.asarray(im, np.float32) / 255
        await b.close()
    return out


def homography(src, dst):
    """De 3x3-matrix die de punten src op dst afbeeldt."""
    a = []
    for (u, v), (x, y) in zip(src, dst):
        a += [[u, v, 1, 0, 0, 0, -u * x, -v * x, -x], [0, 0, 0, u, v, 1, -u * y, -v * y, -y]]
    h = np.linalg.svd(np.array(a, np.float64))[2][-1]
    return (h / h[-1]).reshape(3, 3)


def blur(a, r, top=255.0):
    """Gaussisch vervagen (via 8 bit: ruim nauwkeurig genoeg voor maskers, ruis en de hoogtekaart); a loopt van 0 tot top."""
    im = Image.fromarray(np.clip(a * (255 / top), 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im, np.float32) * (top / 255)


def sample(img, x, y):
    """Bilineair uit img (h x w) op de plekken x, y; buiten het beeld 0."""
    h, w = img.shape
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = x - x0, y - y0
    out = np.zeros_like(x, np.float32)
    for dx, dy, wt in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        xi, yi = x0 + dx, y0 + dy
        ok = (xi >= 0) & (xi < w) & (yi >= 0) & (yi < h)
        out[ok] += img[yi[ok], xi[ok]] * wt[ok]
    return out


def paper(base):
    """Wat de tekening over het papier vertelt: waar het zichtbaar is (zacht randje, niet onder zijn duim), de vouwen,
    de toon van elk facet en de korrel van het papier."""
    s = SIZE / 1024
    rgb = base.astype(np.float32)
    lum = rgb.mean(axis=2)
    sat = (rgb.max(axis=2) - rgb.min(axis=2)) / np.maximum(rgb.max(axis=2), 1)
    quad = Image.new("L", (SIZE, SIZE))
    ImageDraw.Draw(quad).polygon([(x * s, y * s) for x, y in CORNERS], fill=255)
    inside = np.asarray(quad) > 0
    light = Image.fromarray(((lum > 145) & (sat < 0.18) & inside).astype(np.uint8) * 255)
    # Dicht de kreuklijnen in het masker (dun), maar niet zijn duim (groot)
    closed = light.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    on = np.asarray(closed) > 0
    visible = np.asarray(closed.filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
    flat = np.where(on, lum, lum[on].mean())
    # Elk facet van het verfrommelde papier heeft zijn eigen toon: hoe ver die afwijkt van zijn omgeving
    tone = blur(flat, 2.5) - blur(flat, 30)
    # Vouwen: de getekende kreuklijnen en de randen waar de toon van facet naar facet omslaat
    crease = (lum < blur(lum, 6) - 28) & on
    gy, gx = np.gradient(blur(flat, 1.5))
    g = np.hypot(gx, gy)
    folds = ((g > np.percentile(g[on], 92)) | crease) & on
    # De korrel: lichte vezeltjes waar de stift minder inkt achterlaat
    grain = lum - blur(lum, 2)
    return visible, folds, tone, grain


def write(base, mask, visible, folds, tone, grain):
    """De inkt in het beeld: in perspectief op het papier, per facet verschoven, gebarsten langs de vouwen, in de korrel
    van het papier en met de schaduw van elk facet."""
    s = SIZE / 1024
    hinv = np.linalg.inv(homography([(0, 0), (1, 0), (1, 1), (0, 1)], CORNERS))
    ys, xs = np.nonzero(visible > 0.01)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    cut = lambda m: m[y0:y1, x0:x1]
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    # Geschreven toen het papier nog plat was, daarna verfrommeld: elk facet ligt iets anders, dus de letters verspringen
    # bij elke vouw en lopen binnen een facet gewoon door (tot ~4 px op 2048)
    t = cut(tone)
    k = 4.0 / max(np.percentile(np.abs(t[cut(visible) > 0.5]), 98), 1e-3)
    dx, dy = np.clip(0.45 * k * t, -5, 5), np.clip(k * t, -5, 5)
    px, py = (xx + dx) / s, (yy + dy) / s
    w = hinv[2, 0] * px + hinv[2, 1] * py + hinv[2, 2]
    u = (hinv[0, 0] * px + hinv[0, 1] * py + hinv[0, 2]) / w
    v = (hinv[1, 0] * px + hinv[1, 1] * py + hinv[1, 2]) / w
    a = sample(mask, u * N - 0.5, v * N - 0.5)
    rng = np.random.default_rng(7)
    h, wd = a.shape
    norm = lambda m: (m - m.min()) / max(np.ptp(m), 1e-6)
    # Stift op papier: rafelige randjes en niet overal even veel inkt (de druk)
    fine = blur(rng.random((h, wd)), 0.8, 1)
    a = np.clip(a + (fine - fine.mean()) * 1.6 * a * (1 - a) * 4, 0, 1)
    a *= 0.8 + 0.2 * norm(blur(rng.random((h, wd)), 9, 1))
    # De korrel van het papier: op lichte vezeltjes blijft minder inkt achter
    a *= np.clip(1 - 0.035 * np.maximum(cut(grain), 0), 0.45, 1)
    # Gebarsten langs de vouwen: dunne lichte haarlijntjes door de letters, met onderbrekingen
    breakup = norm(blur(rng.random((h, wd)), 1.2, 1)) > 0.45
    a *= 1 - 0.6 * (cut(folds) & breakup)
    a = np.clip(a, 0, 1) * cut(visible)
    # Vermenigvuldigen: de inkt neemt de toon van elk facet aan (donkerder in de schaduw van een vouw)
    out = base.astype(np.float32).copy()
    out[y0:y1, x0:x1] *= 1 - a[..., None] * (1 - INK)
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    src = Image.open(SRC).convert("RGB")
    base = np.asarray(src.resize((SIZE, SIZE), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=2)))
    visible, folds, tone, grain = paper(base)
    choices = labels()
    masks = asyncio.run(handwriting([t for pair in choices.values() for t in pair]))
    for k, (nl, en) in choices.items():
        for text, suffix in ((nl, ""), (en, "-en")):
            out = SRC.with_name(f"{SRC.stem}-{k}{suffix}.png")
            Image.fromarray(write(base, masks[text], visible, folds, tone, grain)).save(out)
            print(f"{out.name:36} {text}")


if __name__ == "__main__":
    main()
