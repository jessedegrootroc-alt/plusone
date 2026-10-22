# Maakt docs/NOG-TE-DOEN.md: een korte afvinklijst van de beelden die nog ontbreken, in de volgorde
# waarin je ze het beste maakt, met daaronder per beeld de prompt.
#   python3 scripts/gen-nog-te-doen.py > docs/NOG-TE-DOEN.md
# Gebruikt dezelfde stappen en prompts als gen-volgende-scenes.py, en slaat over wat al in art/bron staat.
import os
import re
import runpy

g = runpy.run_path(os.path.join(os.path.dirname(__file__), 'gen-volgende-scenes.py'), run_name='lib')
STEPS, made = g['STEPS'], g['made']
HOORT, CHAT = g['HOORT'], g['CHAT']

# Volgorde: eerst de scène die nog niet leeft, dan de losse beelden die een scène afmaken, dan de voorwerpen.
BLOKKEN = [
    ('1 · Het donkere woud', 'De enige scène die nog niet leeft (balans −60 tot −20). Met de zondetaferelen komen ook je twee sterkste zonden in Inferno te staan.', [
        ('i', 'Zondetaferelen', [28, 29, 30, 33, 34, 35, 36]),
        ('i', 'Wezens en effecten', [97, 98, 99, 90, 91, 92, 104, 112, 121]),
        ('a', 'Achtergrond, 4 lagen', [137, 138, 139, 140]),
    ]),
    ('2 · Losse beelden die een scène afmaken', 'Elk van deze maakt een scène die al leeft compleet.', [
        ('a', 'De terrassen: de grond', [147]),
        ('i', 'Paradiso: het laatste embleem', [16]),
        ('i', 'Scènewissel: de inktvlek', [132]),
    ]),
    ('3 · Voorwerpen bij je verleidingen', 'Maak alleen de voorwerpen die bij jouw verleidingen horen.', [
        ('i', 'Voorwerpen', [66, 67, 68, 69]),
    ]),
    ('4 · Voorwerpen bij je goede gewoontes', 'Hiermee ligt rechts op de kust je sterkste goede gewoonte, in plaats van altijd de kettlebell. Maak alleen wat bij jou hoort.', [
        ('i', 'Voorwerpen', list(range(71, 85))),
    ]),
]

name_of = lambda s: re.search(r'Opslaan als:\*\* `([^`]+)`', STEPS[s][1])[1]
blokken = [(t, why, [(c, h, [s for s in st if not made(s)]) for c, h, st in groups]) for t, why, groups in BLOKKEN]
blokken = [(t, why, [x for x in groups if x[2]]) for t, why, groups in blokken]
blokken = [b for b in blokken if b[2]]
total = sum(len(st) for _, _, groups in blokken for _, _, st in groups)

out = []
w = out.append
w('# Nog te doen: illustraties')
w('')
w(f'Nog **{total} beelden**. Werk van boven naar beneden en maak **één beeld per keer** in ChatGPT. '
  'Stuur me de beelden na elk blok, dan bouw ik ze in.')
w('')
w('**Zo werk je:** open in ChatGPT een gesprek *Items* en een gesprek *Achtergronden*, en plak in elk eerst dezelfde stijlprompt als bij je eerdere beelden. '
  'Plak dan één prompt, wacht op het beeld en sla het op onder precies de naam die erbij staat. '
  'Staat er bij **Upload** een bestand, voeg dat dan eerst toe.')
w('')
w('## Afvinklijst')
w('')
n = 0
for t, why, groups in blokken:
    w(f'**{t}**')
    w('')
    for _, head, steps in groups:
        for s in steps:
            n += 1
            extra = f' · *{HOORT[s]}*' if s in HOORT else ''
            w(f'- [ ] {n}. {STEPS[s][0]} → `{name_of(s)}`{extra}')
    w('')

w('---')
w('')
w('## De prompts')
n = 0
for t, why, groups in blokken:
    w('')
    w(f'## {t}')
    w(why)
    for chat, head, steps in groups:
        w('')
        w(f'### {head}')
        w(f'In {CHAT[chat]}.')
        w('')
        for s in steps:
            n += 1
            title, meta, prompt = STEPS[s]
            w(f'#### {n} · {title}')
            w(meta)
            w('```')
            w(prompt)
            w('```')
            w('')
print('\n'.join(out))
