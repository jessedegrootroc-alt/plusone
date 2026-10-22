# Maakt van de ChatGPT-beelden (art/bron, namen uit docs/ART-PIPELINE.md) de lagen voor de app.
#   python3 scripts/prep-art.py art/bron public/art
#
# - Alles wordt WebP met alfakanaal en op schermmaat verkleind.
# - Mist en water hebben een zwarte achtergrond; die mengt de app weg met 'screen'.
# - De veer wordt wit op doorzichtig.
# - Rigs (zoals Darkest Dungeon): het bewegende deel van een tafereel wordt een los stuk
#   met een draaipunt. ChatGPT tekent bij een bewerking het hele beeld opnieuw, dus we nemen
#   de basis en het bewegende deel uit hetzelfde beeld en wissen het deel uit de basis.
# - Pelgrim-stap 2 wordt op stap 1 uitgelijnd, zodat het lopen niet verspringt.
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
rig = {}


def load(name):
    return Image.open(os.path.join(SRC, name + '.png')).convert('RGBA')


def save(im, name, width=None, rgb=False):
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    if rgb:
        im = im.convert('RGB')
    im.save(os.path.join(OUT, name + '.webp'), 'WEBP', quality=80, method=6)
    return im


def mask_poly(size, polys, feather=3):
    m = Image.new('L', size, 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        d.polygon(p, fill=255)
    return m.filter(ImageFilter.GaussianBlur(feather)) if feather else m


def grey_on_white(im):
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
    return np.asarray(Image.alpha_composite(bg, im).convert('L'), float)


def shift_of(a, b):
    """Verschuiving (dx, dy) die b op a legt, via fasecorrelatie."""
    a = a - a.mean()
    b = b - b.mean()
    r = np.fft.ifft2(np.fft.fft2(a) * np.conj(np.fft.fft2(b)) / (np.abs(np.fft.fft2(a) * np.conj(np.fft.fft2(b))) + 1e-9)).real
    dy, dx = np.unravel_index(r.argmax(), r.shape)
    if dy > r.shape[0] // 2:
        dy -= r.shape[0]
    if dx > r.shape[1] // 2:
        dx -= r.shape[1]
    return int(dx), int(dy)


# Karakters: 640 breed is genoeg voor een telefoon met 2× pixels
for n in [f'karakter-{c}{v}' for c in ['schim', 'verdwaalde', 'balans', 'klimmer', 'ideaal'] for v in ['']]:
    if os.path.exists(os.path.join(SRC, n + '.png')):
        save(load(n), n, 640)
# Het oog van karakter-balans, voor het knipperen (in bronpixels 1024×1536)
rig['balans'] = {'w': 1024, 'h': 1536, 'eye': [572, 116, 594, 128], 'cheek': [575, 131, 592, 137], 'feet': 0.955}

# Achtergronden: laag 1 (de verte) is dekkend. Gespiegeld zodat het licht van rechts komt,
# waar in de scène de deugd staat; links blijft de zonde in de schaduw.
# De berg (kust-2) blijft rechts staan: daar ligt de klim, aan de kant van de deugd.
LAYERS = {
    'achtergrond-kust-1-ver': (True, True),
    'achtergrond-kust-2-midden': (False, False),
    'achtergrond-kust-3-grond': (True, False),
    'achtergrond-kust-4-voorgrond': (True, False),
    'achtergrond-terrassen-1-ver': (False, True),
    'achtergrond-terrassen-2-midden': (False, False),
    'achtergrond-terrassen-4-voorgrond': (False, False),
    'achtergrond-paradiso-1-ver': (False, True),
    'achtergrond-paradiso-2-midden': (False, False),
    'achtergrond-paradiso-3-grond': (False, False),
    'achtergrond-paradiso-4-voorgrond': (False, False),
}
for n, (mirror, opaque) in LAYERS.items():
    if os.path.exists(os.path.join(SRC, n + '.png')):
        im = load(n)
        save(im.transpose(Image.FLIP_LEFT_RIGHT) if mirror else im, n, 1024, rgb=opaque)

# Voorwerpen en figuranten
save(load('item-kettlebell'), 'item-kettlebell', 320)
save(load('item-telefoon'), 'item-telefoon', 320)
save(load('item-boot'), 'item-boot', 640)
p1 = load('item-pelgrim-1')
p2 = load('item-pelgrim-2')
dx, dy = shift_of(grey_on_white(p1)[0:700], grey_on_white(p2)[0:700])
p2s = Image.new('RGBA', p2.size, (0, 0, 0, 0))
p2s.paste(p2, (dx, dy), p2)
save(p1, 'item-pelgrim-1', 320)
save(p2s, 'item-pelgrim-2', 320)
rig['pelgrim'] = {'shift': [dx, dy]}

# Effecten
save(load('effect-mist'), 'effect-mist', 1536, rgb=True)
save(load('effect-water'), 'effect-water', 1536, rgb=True)
veer = load('effect-veer').convert('L')
veer = veer.crop(veer.point(lambda v: 255 if v > 24 else 0).getbbox())
white = Image.new('RGBA', veer.size, (255, 255, 255, 0))
white.putalpha(veer)
save(white, 'effect-veer', 160)

# Tafereel Traagheid: de slinger los, draaiend om zijn ophangpunt.
# De versie zonder slinger staat net anders in beeld, dus we wissen de slinger uit het volledige
# beeld en vullen de kast erachter met de donkere kleur eromheen.
full = load('item-tafereel-traagheid')
S = 0.5  # 1254 → 627
pend = Image.new('L', full.size, 0)
d = ImageDraw.Draw(pend)
d.rectangle((968, 344, 980, 472), fill=255)
d.ellipse((939, 468, 1007, 537), fill=255)
d.ellipse((963, 531, 983, 554), fill=255)
pend = pend.filter(ImageFilter.GaussianBlur(1))
box = (933, 338, 1013, 558)
piece = Image.new('RGBA', full.size, (0, 0, 0, 0))
piece.paste(full, (0, 0), pend)
save(piece.crop(box), 'rig-traagheid-slinger', round((box[2] - box[0]) * S))
hole = pend.filter(ImageFilter.MaxFilter(7))
px = np.asarray(full.convert('RGB'), int)
around = np.asarray(hole) == 0
region = np.zeros(around.shape, bool)
region[360:540, 935:1012] = True
fill = tuple(int(v) for v in np.median(px[region & around], axis=0))
base = full.copy()
base.paste(Image.new('RGBA', full.size, fill + (255,)), (0, 0), hole.filter(ImageFilter.GaussianBlur(2)))
save(base, 'rig-traagheid-basis', round(base.width * S))
rig['traagheid'] = {'w': round(base.width * S), 'h': round(base.height * S), 'piece': [round(v * S) for v in box], 'pivot': [round(974 * S), round(348 * S)], 'remote': [round(437 * S), round(875 * S)]}

# Tafereel IJver: de onderarm met hamer los, draaiend om de elleboog
full = load('item-tafereel-ijver')
arm = [(400, 175), (455, 135), (540, 95), (585, 60), (600, 15), (640, 0), (705, 30), (695, 108), (650, 112), (620, 100), (600, 130), (578, 172), (548, 172), (545, 158), (500, 172), (450, 198), (422, 212), (398, 204)]
m = mask_poly(full.size, [arm], 2)
piece = Image.new('RGBA', full.size, (0, 0, 0, 0))
piece.paste(full, (0, 0), m)
box = (390, 0, 710, 216)
save(piece.crop(box), 'rig-ijver-arm', round((box[2] - box[0]) * S))
# Basis: de arm gewist, behalve het stukje bij de elleboog waar hij op de bovenarm ligt
keep = mask_poly(full.size, [[(392, 165), (440, 165), (440, 216), (392, 216)]], 6)
erase = Image.fromarray(np.clip(np.asarray(m, int) - np.asarray(keep, int), 0, 255).astype('uint8'))
a = np.asarray(full.getchannel('A'), int)
full.putalpha(Image.fromarray(np.clip(a - np.asarray(erase, int), 0, 255).astype('uint8')))
save(full, 'rig-ijver-basis', round(full.width * S))
rig['ijver'] = {'w': round(full.width * S), 'h': round(full.height * S), 'piece': [round(v * S) for v in box], 'pivot': [round(418 * S), round(188 * S)], 'hit': [round(940 * S), round(352 * S)]}

# Figuranten en effecten van de terrassen
for n, w in [('item-engel', 360), ('item-duif-omhoog', 200), ('item-duif-omlaag', 200)]:
    if os.path.exists(os.path.join(SRC, n + '.png')):
        save(load(n), n, w)
for n in ['effect-lichtje', 'effect-stofje']:
    if os.path.exists(os.path.join(SRC, n + '.png')):
        lum = load(n).convert('L')
        lum = lum.crop(lum.point(lambda v: 255 if v > 24 else 0).getbbox())
        white = Image.new('RGBA', lum.size, (255, 255, 255, 0))
        white.putalpha(lum)
        save(white, n, 96)


# Paradiso: de emblemen van je doelen, en twee lichteffecten op zwart (die mengt de app weg met 'screen')
for n in ['item-lauwerkrans', 'item-medaille', 'item-stralenkrans', 'item-ijsadem', 'item-vuur', 'item-dageraad', 'item-boek', 'item-halter']:
    if os.path.exists(os.path.join(SRC, n + '.png')):
        save(load(n), n, 220)
for n, w in [('effect-gloed', 640), ('effect-stralen', 640)]:
    if os.path.exists(os.path.join(SRC, n + '.png')):
        save(load(n), n, w, rgb=True)
if os.path.exists(os.path.join(SRC, 'item-tafereel-hoogmoed.png')):
    save(load('item-tafereel-hoogmoed'), 'item-tafereel-hoogmoed', 627)


def rig_pair(name, without, box, kind, pivot=None):
    """Een tafereel met één bewegend deel: de basis is de versie zonder, het deel komt uit het verschil."""
    full = load(f'item-tafereel-{name}')
    base = load(without)
    d = (np.abs(grey_on_white(full) - grey_on_white(base)) > 50).astype('uint8') * 255
    m = Image.fromarray(d).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(11))
    clip = Image.new('L', full.size, 0)
    ImageDraw.Draw(clip).rectangle(box, fill=255)
    m = Image.fromarray(np.minimum(np.asarray(m), np.asarray(clip))).filter(ImageFilter.GaussianBlur(2))
    piece = Image.new('RGBA', full.size, (0, 0, 0, 0))
    piece.paste(full, (0, 0), m)
    save(piece.crop(box), f'rig-{name}-deel', round((box[2] - box[0]) * S))
    save(base, f'rig-{name}-basis', round(base.width * S))
    r = {'piece': [round(v * S) for v in box], 'kind': kind}
    if pivot:
        r['pivot'] = [round(v * S) for v in pivot]
    rig[name] = r


if os.path.exists(os.path.join(SRC, 'item-tafereel-matigheid.png')):
    rig_pair('matigheid', 'item-tafereel-matigheid-zonder-water', (520, 380, 640, 600), 'pour')
    rig_pair('nederigheid', 'item-tafereel-nederigheid-zonder-water', (540, 790, 720, 1060), 'pour')
    rig_pair('zuiverheid', 'item-tafereel-zuiverheid-zonder-vlam', (290, 0, 430, 170), 'flame', (360, 150))
    rig_pair('welwillendheid', 'item-tafereel-welwillendheid-zonder-mantel', (630, 320, 1220, 850), 'sway', (660, 390))
    for name in ['geduld', 'vrijgevigheid']:
        save(load(f'item-tafereel-{name}'), f'rig-{name}-basis', 627)
        rig[name] = {'kind': 'still'}

with open(os.path.join(OUT, 'rig.json'), 'w') as f:
    json.dump(rig, f, indent=2)
print(json.dumps(rig))
print(sorted(os.listdir(OUT)))
