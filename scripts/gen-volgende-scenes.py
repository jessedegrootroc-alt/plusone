# Maakt docs/VOLGENDE-SCENES.md uit docs/ART-PIPELINE.md: alleen wat nog nodig is, scène voor scène.
#   python3 scripts/gen-volgende-scenes.py > docs/VOLGENDE-SCENES.md
# De prompts zelf komen letterlijk uit ART-PIPELINE.md, zodat de stijl overal gelijk blijft.
import os
import re

SRC = open('docs/ART-PIPELINE.md', encoding='utf-8').read()
STEPS = {
    int(m[1]): (m[2].strip(), m[3].strip(), m[4].strip())
    for m in re.finditer(r'### ☐ Stap (\d+) · (.+?)\n(\*\*Upload:.+?)\n```\n(.*?)\n```', SRC, re.S)
}

# Bij welke gewoontes een voorwerp hoort (alleen maken als je die gewoonte hebt)
HOORT = {
    50: 'porno, lust-scrollen, doomscrollen, schermtijd', 51: 'roken', 52: 'vapen, snus', 53: 'alcohol, meer dan 5 glazen',
    54: 'frisdrank, energydrank', 55: 'fastfood, eetbui, snaaien na 20:00', 56: 'snoep, max. suiker', 57: 'gokken / sportsbetting',
    58: 'online casino / poker', 59: 'koersen checken, krasloten', 60: 'impulsaankoop, Klarna', 61: 'snoozen, na 23:30 naar bed',
    62: 'gamen', 63: 'series bingen', 64: 'woede, snauwen, online ruzie', 65: 'roddelen, wrok', 66: 'vergelijken op social media',
    67: 'opscheppen, gelijk willen hebben', 68: 'geen hulp vragen', 69: 'liegen, excuses verzinnen',
    71: 'hardlopen, stappen', 72: 'koude douche / ijsbad', 73: 'sauna', 74: 'sauna', 75: 'lezen, iets nieuws geleerd',
    76: 'journaling, dankbaarheid', 77: 'meditatie, box breathing', 78: 'meditatie, Wim Hof', 79: 'fruit, groente', 80: 'water',
    81: 'zelf gekookt, eiwit', 82: 'geld opzij, no-spend-dag, uitgaven bijhouden', 83: 'vroeg opstaan, ochtendlicht', 84: 'wandeling in de natuur',
}

CHAT = {
    'k': 'het gesprek **Karakters**',
    'i': 'het gesprek **Items**',
    'a': 'het gesprek **Achtergronden**',
}

# (titel, waarom, wat beweegt, [(chat, kop, [stappen])])
PLAN = [
    ('De kust van de berg afmaken', 'De scène leeft al, maar de lucht en de grond tekent de code nu zelf, met een Doré-plaat als noodoplossing. Met deze 4 lagen krijgt hij echte diepte.',
     'De berg met terrassen rechts, de kiezelkust onder je voeten, donkere rotsen als lijst.',
     [('a', 'Achtergrond, 4 lagen', [141, 142, 143, 144])]),
    ('De terrassen (balans +20 tot +60)', 'De eerste scène die je bereikt als het goed gaat. Hier sta je als schildknaap tussen de taferelen van je sterkste deugden.',
     'Ademende schildknaap, deugdtaferelen met één bewegend deel, de engel bij de poort, duiven, lichtjes.',
     [('i', 'Deugdtaferelen (IJver heb je al)', [37, 38, 39, 40, 41, 44, 45, 46, 47, 48]),
      ('i', 'Figuranten en effecten', [103, 95, 96, 109, 108]),
      ('a', 'Achtergrond, 4 lagen', [145, 146, 147, 148])]),
    ('Het donkere woud (balans −60 tot −20)', 'De eerste scène die je bereikt als het slecht gaat. De Verdwaalde, je zondetaferelen half in de mist, en ogen van beesten tussen de bomen.',
     'Gebogen ademhaling, de drie beesten van Dante, raven die opvliegen, ogen die oplichten, motten, regen.',
     [('i', 'Zondetaferelen (Traagheid heb je al)', [27, 28, 29, 30, 33, 34, 35, 36]),
      ('i', 'Wezens en effecten', [97, 98, 99, 90, 91, 92, 104, 112, 121]),
      ('a', 'Achtergrond, 4 lagen', [137, 138, 139, 140])]),
    ('Paradiso (balans +60 tot +100)', 'Je ideale zelf, de tempelier, in de nieuwe stijl, met de hemel en de emblemen van je doelen die om je heen zweven.',
     'Diepe, trage ademhaling, de emblemen van je doelen, ademende lichtstralen, een gloed achter je.',
     [('i', 'Emblemen van je doelen', [16, 17, 18, 19, 20, 21, 22, 23]),
      ('i', 'Effecten', [118, 119]),
      ('a', 'Achtergrond, 4 lagen', [149, 150, 151, 152])]),
    ('Inferno (balans −100 tot −60)', 'De bodem. De Schim, scherp en dichtbij tussen je zondetaferelen. Als laatste, omdat je hier hopelijk het minst komt.',
     'Snelle, korte ademhaling, het telefoonlicht op zijn gezicht, sintels, vlammen, rook, een wervelwind, vleermuizen en vliegen.',
     [('i', 'Wezens en effecten', [93, 94, 105, 106, 107, 113, 114, 116, 120]),
      ('a', 'Achtergrond, 4 lagen', [133, 134, 135, 136])]),
    ('Jouw voorwerpen', 'Je eigen verleidingen en gewoontes liggen als voorwerp in de scène (zoals de telefoon en de kettlebell nu). **Maak alleen de voorwerpen die bij jouw gewoontes horen** en sla de rest over.',
     'Het voorwerp van een verleiding licht op als die roept; dat van een goede gewoonte komt in het licht als je hem doet.',
     [('i', 'Bij je verleidingen', list(range(50, 70))),
      ('i', 'Bij je goede gewoontes', list(range(71, 85)))]),
    ('Scènewissel', 'Als je van de ene naar de andere scène gaat, neemt een inktvlek het beeld over.', 'De vlek loopt uit over het scherm en trekt weer weg.',
     [('i', 'Overgang', [132])]),
]

# Wat al in art/bron staat, hoef je niet nog eens te maken
made = lambda step: (m := re.search(r'Opslaan als:\*\* `([^`]+)`', STEPS[step][1])) and os.path.exists(os.path.join('art/bron', m[1]))
PLAN = [(t, why, mv, [(c, h, [x for x in st if not made(x)]) for c, h, st in g]) for t, why, mv, g in PLAN]
PLAN = [(t, why, mv, [x for x in g if x[2]]) for t, why, mv, g in PLAN]
PLAN = [p for p in PLAN if p[3]]

out = []
w = out.append
total = sum(len(s) for _, _, _, groups in PLAN for _, _, s in groups)
w('# PlusOne: de volgende scènes, één beeld per stap')
w('')
w(f'Dit is wat er nog nodig is, in de volgorde waarin je het maakt: **{total} beelden**, scène voor scène. '
  'De prompts zijn precies dezelfde als in [ART-PIPELINE.md](ART-PIPELINE.md); dit bestand zet alleen wat nog ontbreekt op volgorde. '
  'Na elke scène kun je stoppen: stuur me de beelden, dan bouw ik die scène.')
w('')
w('## Zo werkt het')
w('1. **Eén beeld per keer.** Plak één prompt, wacht op het beeld, sla het op, en ga pas dan naar de volgende stap.')
w('2. **Twee gesprekken in ChatGPT:** *Items* en *Achtergronden* (de karakters zijn klaar). Open ze bij het begin van elke scène opnieuw en plak als eerste bericht **dezelfde stijlprompt** als bij de eerste beelden. Bij elke kop hieronder staat in welk gesprek je zit.')
w('3. **Upload** staat er een bestand bij? Voeg dat beeld toe met het paperclip-icoon, vóór je de prompt verstuurt.')
w('4. **Opslaan als:** gebruik precies die bestandsnaam. Stuur ze me na de scène in de chat, of zet ze in de map `art/bron/`.')
w('5. Vink de stap af (☐ → ☑).')
w('')
w('Klopt het beeld niet? Vraag in hetzelfde gesprek: *"Make it again, closer to the prompt."* Krijg je een geblokt schaakbord in plaats van een doorzichtige achtergrond? Stuur dan: *"Real transparent background, not a checkerboard pattern."*')
w('')
w('## Wat je niet meer hoeft te maken')
w('- **Al binnen, in de nieuwe stijl:** alle vijf karakters (de Schim, de Verdwaalde, jij in balans, de schildknaap en de tempelier), Traagheid en IJver, telefoon, kettlebell, pelgrim, boot, veer, mist en water.')
w('- **De versies zonder armen en met ogen dicht** (ART-PIPELINE stap 2–3, 5–6, 8–9, 11–12 en 14–15). ChatGPT tekent bij zo’n bewerking het hele figuur opnieuw, dus ze passen niet precies over het origineel. Ademen en knipperen doet de app nu zelf.')
w('- **De schermonderdelen** (stap 122–131) en **de pot met stenen** (stap 85–89): de meter, de iconen en de stenen zitten al in de app.')
w('- **Ridder: zwaard, helm en schild** (stap 24–26): de tempelier draagt ze al.')
w('')
n = 0
for i, (title, why, moves, groups) in enumerate(PLAN, 1):
    count = sum(len(s) for _, _, s in groups)
    w('---')
    w('')
    label = f'{count} beeld' if count == 1 else f'{count} beelden'
    w(f'## Scène {i} · {title}  ·  {label}' if i <= 5 else f'## {i} · {title}  ·  {label}')
    w(why)
    w('')
    w(f'*Wat je straks ziet:* {moves}')
    w('')
    for chat, head, steps in groups:
        w(f'### {head}')
        w(f'In {CHAT[chat]}.')
        w('')
        for s in steps:
            n += 1
            t, meta, prompt = STEPS[s]
            extra = f'  ·  *hoort bij: {HOORT[s]}*' if s in HOORT else ''
            w(f'#### ☐ {n} · {t}{extra}')
            w(f'{meta} · *ART-PIPELINE stap {s}*')
            w('```')
            w(prompt)
            w('```')
            w('')
    if i <= 5:
        w(f'**Klaar met scène {i}?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.')
        w('')
if __name__ == '__main__':
    print('\n'.join(out))
