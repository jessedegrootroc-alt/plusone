# Maakt het app-icoon: de lauwerkrans van de overwinning rond "+1", in zilver op diep zwart.
#   python3 scripts/make-icon.py            -> public/icons/*.png
# Opbouw zoals een icoonontwerper het doet: één sterk silhouet, licht van boven, de krans als ring
# waar "+1" in staat (de voorste bladeren vallen over de cijfers), korrel tegen het "digitale" vlak,
# en per formaat apart afgesteld: hoe kleiner, hoe groter en eenvoudiger.
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

SRC = 'art/bron/item-lauwerkrans.png'
FONT = '/System/Library/Fonts/Optima.ttc'  # flared sans, verwant aan Marcellus uit de app


def wreath_src():
    im = Image.open(SRC).convert('RGBA')
    im = im.crop(im.getchannel('A').point(lambda a: 255 if a > 24 else 0).getbbox())
    rgb = ImageEnhance.Contrast(im.convert('RGB')).enhance(1.18)
    rgb = ImageEnhance.Brightness(rgb).enhance(1.06)
    out = rgb.convert('RGBA')
    out.putalpha(im.getchannel('A'))
    return out


WREATH = wreath_src()


def background(S):
    y, x = np.mgrid[0:S, 0:S] / S
    # Diep zwart met licht van boven: radiaal, iets boven het midden
    d = np.sqrt((x - 0.5) ** 2 + ((y - 0.36) * 1.15) ** 2)
    t = np.clip(d / 0.78, 0, 1)
    v = 44 * (1 - t) ** 1.8 + 8
    # Vignet langs de randen
    v *= 1 - 0.35 * np.clip((np.maximum(abs(x - 0.5), abs(y - 0.5)) - 0.36) / 0.14, 0, 1) ** 2
    # Korrel, zodat het vlak niet plastic aanvoelt
    rng = np.random.default_rng(7)
    v += rng.normal(0, 1.6, (S, S))
    v = np.clip(v, 0, 255).astype(np.uint8)
    return Image.fromarray(np.stack([v, v, v, np.full_like(v, 255)], -1))


def beam(S):
    # Een zachte lichtbundel van boven op de krans
    m = Image.new('L', (S, S), 0)
    ImageDraw.Draw(m).polygon([(S * 0.42, -S * 0.05), (S * 0.58, -S * 0.05), (S * 0.8, S * 0.75), (S * 0.2, S * 0.75)], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(S * 0.07))
    return m.point(lambda a: int(a * 0.07))


def text_layer(S, size_k, cx, cy):
    """'+1' in zilver: verloop van licht naar donker, met een schaduw en een randje licht bovenop."""
    big = ImageFont.truetype(FONT, int(S * size_k), index=1)
    small = ImageFont.truetype(FONT, int(S * size_k * 0.72), index=1)
    one_w = big.getbbox('1')[2] - big.getbbox('1')[0]
    plus_box = small.getbbox('+')
    plus_w = plus_box[2] - plus_box[0]
    gap = S * size_k * 0.04
    total = plus_w + gap + one_w
    mask = Image.new('L', (S, S), 0)
    d = ImageDraw.Draw(mask)
    x0 = cx - total / 2
    one_box = big.getbbox('1')
    oy = cy - (one_box[3] + one_box[1]) / 2
    d.text((x0 + plus_w + gap - one_box[0], oy), '1', font=big, fill=255)
    py = cy - (plus_box[3] + plus_box[1]) / 2 + S * size_k * 0.02
    d.text((x0 - plus_box[0], py), '+', font=small, fill=255)
    bb = mask.getbbox()
    grad = np.zeros((S, S), np.float32)
    ys = np.arange(S)[:, None]
    tt = np.clip((ys - bb[1]) / max(1, bb[3] - bb[1]), 0, 1)
    grad[:] = 255 - 95 * tt  # wit boven, zilvergrijs onder
    g = Image.fromarray(grad.astype(np.uint8))
    silver = Image.merge('RGBA', (g, g, g, mask))
    shadow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    sm = mask.filter(ImageFilter.GaussianBlur(S * 0.012)).point(lambda a: int(a * 0.85))
    shadow.paste((0, 0, 0, 255), (0, int(S * 0.012)), sm)
    # Lichtrandje: het masker iets omhoog verschoven, alleen waar het over de rand uitsteekt
    edge = ImageChops_sub(mask, mask.transform(mask.size, Image.AFFINE, (1, 0, 0, 0, 1, S * 0.004)))
    hl = Image.new('RGBA', (S, S), (255, 255, 255, 0))
    hl.putalpha(edge.point(lambda a: int(a * 0.8)))
    return shadow, silver, hl


def ImageChops_sub(a, b):
    from PIL import ImageChops
    return ImageChops.subtract(a, b)


def icon(size, k=1.0, with_text=True, supersample=4):
    S = size * supersample
    img = background(S)
    light = Image.new('RGBA', (S, S), (242, 242, 242, 255))
    img = Image.composite(light, img, beam(S))
    # De krans
    w = int(S * 0.74 * k)
    h = int(WREATH.height * w / WREATH.width)
    cy = S * 0.51  # de groep (krans + cijfers) staat optisch in het midden
    wr = WREATH.resize((w, h), Image.LANCZOS)
    x, y = (S - w) // 2, int(cy - h / 2)
    # Gloed achter de krans en een contactschaduw eronder
    a = Image.new('L', (S, S), 0)
    a.paste(wr.getchannel('A'), (x, y))
    glow = a.filter(ImageFilter.GaussianBlur(S * 0.05)).point(lambda v: int(v * 0.12))
    img = Image.composite(Image.new('RGBA', (S, S), (242, 242, 242, 255)), img, glow)
    sh = Image.new('L', (S, S), 0)
    ImageDraw.Draw(sh).ellipse([S / 2 - w * 0.4, y + h - S * 0.03, S / 2 + w * 0.4, y + h + S * 0.035], fill=190)
    img = Image.composite(Image.new('RGBA', (S, S), (0, 0, 0, 255)), img, sh.filter(ImageFilter.GaussianBlur(S * 0.025)))
    img.alpha_composite(wr, (x, y))
    if with_text:
        tcy = cy - h * 0.11
        shadow, silver, hl = text_layer(S, 0.31 * k, S / 2, tcy)
        img.alpha_composite(shadow)
        img.alpha_composite(silver)
        img.alpha_composite(hl)
        # De voorste bladeren vallen over de cijfers: zo staat "+1" ín de krans
        front = wr.copy()
        fm = Image.new('L', wr.size, 0)
        ImageDraw.Draw(fm).rectangle([0, int(h * 0.64), w, h], fill=255)
        fm = fm.filter(ImageFilter.GaussianBlur(h * 0.03))
        from PIL import ImageChops
        front.putalpha(ImageChops.multiply(front.getchannel('A'), fm))
        img.alpha_composite(front, (x, y))
    out = img.resize((size, size), Image.LANCZOS).convert('RGB')
    return out.filter(ImageFilter.UnsharpMask(radius=1.2 if size >= 128 else 0.6, percent=60, threshold=2))


def favicon(size):
    """Zo klein leest een krans als ruis: alleen '+1' in zilver, groot, op hetzelfde zwart."""
    S = size * 8
    img = background(S)
    shadow, silver, hl = text_layer(S, 0.62, S / 2, S * 0.52)
    for l in (shadow, silver, hl):
        img.alpha_composite(l)
    return img.resize((size, size), Image.LANCZOS).convert('RGB')


if __name__ == '__main__':
    import sys
    outdir = sys.argv[1] if len(sys.argv) > 1 else 'public/icons'
    icon(180).save(f'{outdir}/apple-touch-icon.png', optimize=True)
    icon(192).save(f'{outdir}/icon-192.png', optimize=True)
    icon(512).save(f'{outdir}/icon-512.png', optimize=True)
    icon(512, k=0.78).save(f'{outdir}/icon-maskable-512.png', optimize=True)  # binnen de veilige cirkel
    favicon(32).save(f'{outdir}/favicon-32.png', optimize=True)
    print('klaar')
