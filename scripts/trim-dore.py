# Snijdt witte papierranden, kaderlijnen en onderschriften weg rond de Doré-platen.
#   python3 scripts/trim-dore.py <in-map> <uit-map>
#
# AUTO: randen automatisch gevonden (witte rand of kaderlijn rondom).
# CROP: met de hand afgelezen sneden (links, boven, rechts, onder als deel van de maat),
#       voor platen met een brede papierrand of een onderschrift.
# De rest is al randloos en wordt ongewijzigd gekopieerd.
#
# Werkwijze: de papierkleur is de mediaan van de buitenste pixels. Vanaf elke rand
# zoeken we naar binnen tot er een aaneengesloten strook van minstens 1,5% komt
# waarin het merendeel van de pixels duidelijk van het papier afwijkt. Zo houden
# een dunne kaderlijn of een regel onderschrift het zoeken niet tegen.
import os
import shutil
import sys
from statistics import median

import numpy as np
from PIL import Image, ImageStat

AUTO = {'forest', 'gluttony', 'greed', 'virgil', 'wrath'}
CROP = {
    'boat': (0.095, 0.100, 0.905, 0.865),
    'lust': (0.080, 0.105, 0.905, 0.850),
    'ninth': (0.075, 0.105, 0.910, 0.860),
    'pride': (0.080, 0.095, 0.900, 0.870),
    'envy': (0.010, 0.010, 0.990, 0.895),
    'gate': (0.010, 0.010, 0.990, 0.935),
    'shore': (0.010, 0.010, 0.990, 0.895),
    'ladder': (0.010, 0.010, 0.990, 0.885),
}
DIFF = 38       # zoveel grijswaarde verschil met het papier telt als "gravure"
SHARE = 0.45    # deel van de pixels in een rij/kolom dat moet afwijken
RUN = 0.015     # aaneengesloten strook gravure, als deel van de lengte
INSET = 0.006   # kleine marge naar binnen, tegen een laatste randje


def paper_tone(px, w, h):
    edge = [px[x, 0] for x in range(0, w, 3)] + [px[x, h - 1] for x in range(0, w, 3)]
    edge += [px[0, y] for y in range(0, h, 3)] + [px[w - 1, y] for y in range(0, h, 3)]
    return median(edge)


def is_image(line, paper):
    return sum(1 for v in line if abs(v - paper) > DIFF) / len(line) > SHARE


def find_start(lines, paper, run_len):
    run = 0
    for i, line in enumerate(lines):
        run = run + 1 if is_image(line, paper) else 0
        if run >= run_len:
            return i - run + 1
    return 0


def trim(path_in, path_out):
    src = Image.open(path_in).convert('RGB')
    g = src.convert('L')
    w, h = g.size
    px = g.load()
    paper = paper_tone(px, w, h)
    rows = [[px[x, y] for x in range(0, w, 2)] for y in range(h)]
    top = find_start(rows, paper, int(h * RUN))
    bottom = h - find_start(rows[::-1], paper, int(h * RUN))
    cols = [[px[x, y] for y in range(top, bottom, 2)] for x in range(w)]
    left = find_start(cols, paper, int(w * RUN))
    right = w - find_start(cols[::-1], paper, int(w * RUN))
    dx, dy = int(w * INSET), int(h * INSET)
    box = (left + dx, top + dy, right - dx, bottom - dy)
    src.crop(box).save(path_out, 'JPEG', quality=82, optimize=True)
    return (w, h), box


def clean_edges(path):
    """Laatste stap voor elke plaat: dunne lichte randjes (een paar pixels papier of kader) weghalen.
    Hooguit 2% per kant, en alleen zolang de rand duidelijk lichter is dan de gravure zelf."""
    im = Image.open(path).convert('RGB')
    g = im.convert('L')
    w, h = g.size
    inner = ImageStat.Stat(g.crop((w // 4, h // 4, 3 * w // 4, 3 * h // 4))).mean[0]
    light = lambda box: (lambda m: m > 200 and m > inner + 40)(ImageStat.Stat(g.crop(box)).mean[0])
    l, t, r, b = 0, 0, w, h
    while l < w * 0.02 and light((l, t, l + 1, b)): l += 1
    while r > w * 0.98 and light((r - 1, t, r, b)): r -= 1
    while t < h * 0.02 and light((l, t, r, t + 1)): t += 1
    while b > h * 0.98 and light((l, b - 1, r, b)): b -= 1
    if (l, t, r, b) != (0, 0, w, h):
        pad = 2  # nog twee pixels extra, tegen de overgang van wit naar inkt
        im.crop((l + pad if l else 0, t + pad if t else 0, r - pad if r < w else w, b - pad if b < h else h)).save(path, 'JPEG', quality=82, optimize=True)
        return (l, t, w - r, h - b)
    return None


def deepen(path):
    """Platen van het paradijs zijn vaak verbleekt gedrukt of gescand: een witte waas zonder echt zwart.
    Alleen bij die platen (het donkerste stuk is nog lichtgrijs) rekken we de tonen op tot echt zwart en wit,
    en leggen we het midden lager, zodat ze naast de donkere hel-platen niet als witte gloed ogen."""
    im = Image.open(path).convert('RGB')
    g = np.asarray(im.convert('L'), float)
    lo, mid, hi = np.percentile(g, [1, 50, 99.5])
    if np.percentile(g, 2) <= 60:
        return None
    x = np.clip((g - lo) / max(1, hi - lo), 0, 1)
    m = np.clip((mid - lo) / max(1, hi - lo), 0.05, 0.95)
    gamma = np.log(0.42) / np.log(m)  # het midden komt op 42% grijs
    y = (x ** gamma) * 245 + 6
    Image.fromarray(y.astype('uint8')).convert('RGB').save(path, 'JPEG', quality=82, optimize=True)
    return round(gamma, 2)


if __name__ == '__main__':
    src_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    for f in sorted(os.listdir(src_dir)):
        if not f.endswith('.jpg'):
            continue
        name = f[:-4]
        if name in CROP:
            src = Image.open(os.path.join(src_dir, f)).convert('RGB')
            w, h = src.size
            l, t, r, b = CROP[name]
            box = (int(w * l), int(h * t), int(w * r), int(h * b))
            src.crop(box).save(os.path.join(out_dir, f), 'JPEG', quality=82, optimize=True)
            size = (w, h)
        elif name in AUTO:
            size, box = trim(os.path.join(src_dir, f), os.path.join(out_dir, f))
        else:
            shutil.copyfile(os.path.join(src_dir, f), os.path.join(out_dir, f))
            box = None
        extra = clean_edges(os.path.join(out_dir, f))
        deep = deepen(os.path.join(out_dir, f))
        if deep:
            print(f'{f:16} waas weg, gamma {deep}')
        if box:
            cut = (box[0], box[1], size[0] - box[2], size[1] - box[3])
            print(f'{f:16} {size[0]}x{size[1]}  eraf: links {cut[0]:3} boven {cut[1]:3} rechts {cut[2]:3} onder {cut[3]:3}' + (f'  + randje {extra}' if extra else ''))
        elif extra:
            print(f'{f:16} alleen randje weg: {extra}')
