# Houdt inline stijlen in de schermen aan het ontwerpsysteem.
#   python3 scripts/grid-lint.py          -> toont wat er afwijkt
#   python3 scripts/grid-lint.py --fix    -> past het aan
#
# Afstanden (padding, margin, gap): veelvouden van 4.
# Tekst: vier groottes met vaste regelhoogte: 13/20 · 16/24 · 20/28 · 28/36.
# Lettertypes: Marcellus (var(--title), altijd gewicht 400) of Inter (400 of 600).
# Tekstkleur: --ink, --ink-2 of --ink-3, geen losse transparanties.
import glob
import math
import re
import sys

FIX = '--fix' in sys.argv
SPACING = r'(padding(?:Top|Bottom|Left|Right)?|margin(?:Top|Bottom|Left|Right)?|gap|rowGap|columnGap)'
SIZES = {13: '20px', 16: '24px', 20: '28px', 28: '36px'}

grid = lambda n: 0 if n == 0 else int(math.copysign(max(4, round(abs(n) / 4) * 4), n))
issues = 0


def size_for(n: float) -> int:
    if n >= 24:
        return 28
    if n >= 18:
        return 20
    if n >= 15:
        return 16
    return 13


def fix_px_string(v: str) -> str:
    if any(k in v for k in ('calc', 'env', 'var', '%', 'auto', 'vh', 'vw', 'dvh')):
        return v
    return re.sub(r'-?\d+(?:\.\d+)?(?=px)', lambda m: str(grid(float(m.group()))), v)


def report(path, what):
    global issues
    issues += 1
    if not FIX:
        print(f'{path}: {what}')


def fix_style(path: str, style: str, svg: bool) -> str:
    """Eén inline style-object ({{ ... }}) normaliseren."""
    out = style

    # Lettertype: Cormorant bestaat niet meer
    out = out.replace("fontFamily: 'var(--serif)'", "fontFamily: 'var(--title)'").replace("fontFamily: 'var(--sc)'", "fontFamily: 'var(--sans)'")
    is_title = "fontFamily: 'var(--title)'" in out

    # Gewicht: Marcellus heeft alleen 400; Inter 400 of 600
    def weight(m):
        w = int(m.group(1))
        new = 400 if is_title else (600 if w >= 550 else 400)
        if new != w:
            report(path, f'fontWeight {w} -> {new}')
        return f'fontWeight: {new}'

    out = re.sub(r'fontWeight: (\d+)', weight, out)
    if is_title and 'fontWeight' not in out:
        out = out.replace("fontFamily: 'var(--title)'", "fontFamily: 'var(--title)', fontWeight: 400", 1)

    # Grootte + regelhoogte
    fm = re.search(r'fontSize: (\d+(?:\.\d+)?)', out)
    if fm:
        n = float(fm.group(1))
        new = size_for(n)
        if new != n:
            report(path, f'fontSize {fm.group(1)} -> {new}')
        out = re.sub(r'fontSize: \d+(?:\.\d+)?', f'fontSize: {new}', out, count=1)
        if not svg:
            out = re.sub(r",?\s*lineHeight: [^,}]+", '', out)
            out = out.replace(f'fontSize: {new}', f"fontSize: {new}, lineHeight: '{SIZES[new]}'", 1)

    # Tekstkleur: drie niveaus in plaats van losse transparanties
    def colour(m):
        a = float(m.group(1))
        new = "'#F2F2F2'" if a >= 0.8 else "'var(--ink-2)'" if a >= 0.5 else "'var(--ink-3)'"
        report(path, f'color rgba .{m.group(1)[2:] if m.group(1).startswith("0.") else m.group(1)} -> {new}')
        return f'color: {new}'

    out = re.sub(r"(?<![a-zA-Z])color: 'rgba\(242, ?242, ?242, ?(0?\.\d+)\)'", colour, out)
    return out


for path in glob.glob('src/**/*.tsx', recursive=True):
    src = open(path).read()
    out = src

    # 1. Afstanden
    def spacing(m):
        key, val = m.group(1), m.group(2)
        new = "'" + fix_px_string(val[1:-1]) + "'" if val.startswith("'") else str(grid(float(val)))
        if new != val:
            report(path, f'{key}: {val} -> {new}')
        return f'{key}: {new}'

    out = re.sub(SPACING + r": ('[^']*'|-?\d+(?:\.\d+)?)(?=[,\s}])", spacing, out)

    # 2. Typografie en kleur per style-object
    def style_obj(m):
        before = out[max(0, m.start() - 120):m.start()]
        svg = bool(re.search(r'<(text|tspan)\b[^<]*$', before))
        return m.group(1) + fix_style(path, m.group(2), svg) + '}}'

    out = re.sub(r'(style=\{\{)([^{}]*)\}\}', style_obj, out)

    if FIX and out != src:
        open(path, 'w').write(out)

print(f'{issues} afwijkingen' + (' aangepast' if FIX else ''))
