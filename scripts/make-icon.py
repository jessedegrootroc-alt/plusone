# Maakt het app-icoon: post-its zoals in de app, op diep zwart. Op het voorste staat "+1".
#   python3 scripts/make-icon.py            -> public/icons/*.png en public/icon.svg
# Dezelfde briefjes als op Vandaag en je spiegel: bijna wit papier met haast rechte hoeken, grijs plakband met
# gekartelde uiteinden, een donker omgekruld hoekje rechtsonder, de serif van de titels. Achter ligt een tweede
# briefje schuin, zo zie je dat het er meer zijn. Op 32 px (favicon) blijft één briefje met "+1" over.
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

K = 4  # supersampling: alles op 4x tekenen, dan verkleinen
FONT = '/System/Library/Fonts/Optima.ttc'  # flared sans, verwant aan Marcellus uit de app

FRONT = (242, 242, 240)  # --tint van de briefjes (#F2F2F2, iets warmer)
BACK = (196, 195, 190)   # het briefje erachter, in de schaduw
INK = (11, 11, 11)       # tekst op de briefjes (#0B0B0B)


def background(S):
    y, x = np.mgrid[0:S, 0:S] / S
    # Diep zwart met licht van boven, zoals het bord achter de briefjes in de app
    d = np.sqrt((x - 0.5) ** 2 + ((y - 0.32) * 1.15) ** 2)
    t = np.clip(d / 0.8, 0, 1)
    v = 42 * (1 - t) ** 1.8 + 8
    v *= 1 - 0.3 * np.clip((np.maximum(abs(x - 0.5), abs(y - 0.5)) - 0.36) / 0.14, 0, 1) ** 2
    rng = np.random.default_rng(7)
    v += rng.normal(0, 1.5, (S, S))
    v = np.clip(v, 0, 255).astype(np.uint8)
    return Image.fromarray(np.stack([v, v, v, np.full_like(v, 255)], -1))


def paper_grain(im, box, strength):
    """Een zweem papierstructuur, zodat het briefje niet plastic aanvoelt."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    rng = np.random.default_rng(int(w + h))
    n = rng.normal(0, strength, (h, w))
    a = np.array(im.crop(box)).astype(np.float32)
    a[..., :3] = np.clip(a[..., :3] + n[..., None], 0, 255)
    im.paste(Image.fromarray(a.astype(np.uint8)), (x0, y0))


def tape(w, h, angle):
    """Plakband: grijs, half doorzichtig, met gekartelde uiteinden (zoals .tape in de app)."""
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    teeth = 5
    pts = []
    for i in range(teeth + 1):
        pts.append((int(w * 0.04 * (i % 2)), int(h * i / teeth)))
    for i in range(teeth, -1, -1):
        pts.append((w - 1 - int(w * 0.04 * ((i + 1) % 2)), int(h * i / teeth)))
    ImageDraw.Draw(im).polygon(pts, fill=(222, 222, 216, 150))
    return im.rotate(angle, expand=True, resample=Image.BICUBIC)


def note(W, H, color, text=None, tape_on=True, fold=True, font_k=0.62, bold=False):
    pad = int(W * 0.3)
    im = Image.new('RGBA', (W + 2 * pad, H + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    box = (pad, pad, pad + W, pad + H)
    d.rounded_rectangle(box, radius=max(2, int(W * 0.012)), fill=color + (255,))
    paper_grain(im, box, 2.2)
    d = ImageDraw.Draw(im)
    if fold:
        # Het omgekrulde hoekje: een donkere driehoek met een schaduwrand, zoals .jar-note::after
        c = int(W * 0.1)
        x1, y1 = pad + W, pad + H
        d.polygon([(x1 - c, y1), (x1, y1 - c), (x1, y1)], fill=(22, 22, 22, 255))
        d.polygon([(x1 - c, y1), (x1, y1 - c), (x1 - c, y1 - c)], fill=tuple(int(v * 0.86) for v in color) + (255,))
    if text:
        f = ImageFont.truetype(FONT, int(H * font_k), index=1 if bold else 0)  # Regular zoals Marcellus; vet alleen op het kleinste formaat
        bb = d.textbbox((0, 0), text, font=f)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        d.text((pad + (W - tw) / 2 - bb[0], pad + (H - th) / 2 - bb[1] + H * 0.04), text, font=f, fill=INK + (255,))
    if tape_on:
        t = tape(int(W * 0.42), int(H * 0.17), -3)
        im.alpha_composite(t, (pad + W // 2 - t.width // 2, pad - t.height // 2))
    return im


def paste(canvas, layer, cx, cy, angle, shadow=0.7):
    r = layer.rotate(angle, expand=True, resample=Image.BICUBIC)
    if shadow:
        a = r.getchannel('A').filter(ImageFilter.GaussianBlur(r.width * 0.03))
        sh = Image.new('RGBA', r.size, (0, 0, 0, 0))
        sh.putalpha(a.point(lambda v: int(v * shadow)))
        canvas.alpha_composite(sh, (int(cx - r.width / 2), int(cy - r.height / 2 + r.width * 0.03)))
    canvas.alpha_composite(r, (int(cx - r.width / 2), int(cy - r.height / 2)))


def icon(size, scale=1.0, simple=False):
    S = size * K
    im = background(S)
    c = S / 2
    if simple:
        # Favicon: één briefje met "+1", groot, zonder plakband en hoekje
        paste(im, note(int(S * 0.8), int(S * 0.74), FRONT, '+1', tape_on=False, fold=False, font_k=0.7, bold=True), c, c, -4, 0)
    else:
        W, H = int(S * 0.6 * scale), int(S * 0.56 * scale)
        # Een briefje erachter, schuin naar rechts; het voorste schuin naar links, met "+1"
        paste(im, note(W, H, BACK, tape_on=False), c + S * 0.06 * scale, c - S * 0.05 * scale, 9)
        paste(im, note(W, H, FRONT, '+1'), c - S * 0.02 * scale, c + S * 0.04 * scale, -5)
    return im.resize((size, size), Image.LANCZOS).convert('RGB')


if __name__ == '__main__':
    icon(180).save('public/icons/apple-touch-icon.png')
    icon(192).save('public/icons/icon-192.png')
    icon(512).save('public/icons/icon-512.png')
    # Maskable: de inhoud binnen de veilige zone (80%), zodat Android hem rond of als druppel mag knippen
    icon(512, scale=0.8).save('public/icons/icon-maskable-512.png')
    icon(32, simple=True).save('public/icons/favicon-32.png')
    # De SVG voor browsers die die liever nemen: één briefje met "+1" op zwart
    open('public/icon.svg', 'w').write(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n'
        '  <rect width="64" height="64" rx="14" fill="#0E0E0E"/>\n'
        '  <g transform="rotate(-4 32 32)">\n'
        '    <rect x="10" y="11" width="44" height="42" rx="1" fill="#F2F2F0"/>\n'
        '    <path d="M23 32h12M29 26v12" stroke="#0B0B0B" stroke-width="3.2" stroke-linecap="round"/>\n'
        '    <path d="M39 25l3-2v16" fill="none" stroke="#0B0B0B" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>\n'
        '  </g>\n'
        '</svg>\n')
    print('klaar')
