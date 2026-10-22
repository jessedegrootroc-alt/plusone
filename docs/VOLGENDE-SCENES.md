# PlusOne: de volgende scènes, één beeld per stap

Dit is wat er nog nodig is, in de volgorde waarin je het maakt: **27 beelden**, scène voor scène. De prompts zijn precies dezelfde als in [ART-PIPELINE.md](ART-PIPELINE.md); dit bestand zet alleen wat nog ontbreekt op volgorde. Na elke scène kun je stoppen: stuur me de beelden, dan bouw ik die scène.

## Zo werkt het
1. **Eén beeld per keer.** Plak één prompt, wacht op het beeld, sla het op, en ga pas dan naar de volgende stap.
2. **Twee gesprekken in ChatGPT:** *Items* en *Achtergronden* (de karakters zijn klaar). Open ze bij het begin van elke scène opnieuw en plak als eerste bericht **dezelfde stijlprompt** als bij de eerste beelden. Bij elke kop hieronder staat in welk gesprek je zit.
3. **Upload** staat er een bestand bij? Voeg dat beeld toe met het paperclip-icoon, vóór je de prompt verstuurt.
4. **Opslaan als:** gebruik precies die bestandsnaam. Stuur ze me na de scène in de chat, of zet ze in de map `art/bron/`.
5. Vink de stap af (☐ → ☑).

Klopt het beeld niet? Vraag in hetzelfde gesprek: *"Make it again, closer to the prompt."* Krijg je een geblokt schaakbord in plaats van een doorzichtige achtergrond? Stuur dan: *"Real transparent background, not a checkerboard pattern."*

## Wat je niet meer hoeft te maken
- **Al binnen, in de nieuwe stijl:** alle vijf karakters (de Schim, de Verdwaalde, jij in balans, de schildknaap en de tempelier), Traagheid en IJver, telefoon, kettlebell, pelgrim, boot, veer, mist en water.
- **De versies zonder armen en met ogen dicht** (ART-PIPELINE stap 2–3, 5–6, 8–9, 11–12 en 14–15). ChatGPT tekent bij zo’n bewerking het hele figuur opnieuw, dus ze passen niet precies over het origineel. Ademen en knipperen doet de app nu zelf.
- **De schermonderdelen** (stap 122–131) en **de pot met stenen** (stap 85–89): de meter, de iconen en de stenen zitten al in de app.
- **Ridder: zwaard, helm en schild** (stap 24–26): de tempelier draagt ze al.

---

## Scène 1 · De terrassen (balans +20 tot +60)  ·  1 beeld
De eerste scène die je bereikt als het goed gaat. Hier sta je als schildknaap tussen de taferelen van je sterkste deugden.

*Wat je straks ziet:* Ademende schildknaap, deugdtaferelen met één bewegend deel, de engel bij de poort, duiven, lichtjes.

### Achtergrond, 4 lagen
In het gesprek **Achtergronden**.

#### ☐ 1 · De terrassen: laag 3, de grond
**Upload:** `achtergrond-terrassen-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-terrassen-3-grond.png` · *ART-PIPELINE stap 147*
```
Draw only the ground layer that belongs in front of the attached background: a broad carved stone ledge with worn steps and a few clumps of mountain grass and flowers, from the horizon down to the bottom edge.
The center at about 88% of the image height is flat and calm, because a person stands there. Everything above the ground stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

**Klaar met scène 1?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.

---

## Scène 2 · Het donkere woud (balans −60 tot −20)  ·  6 beelden
De eerste scène die je bereikt als het slecht gaat. De Verdwaalde, je zondetaferelen half in de mist, en ogen van beesten tussen de bomen.

*Wat je straks ziet:* Gebogen ademhaling, de drie beesten van Dante, raven die opvliegen, ogen die oplichten, motten, regen.

### Zondetaferelen (Traagheid heb je al)
In het gesprek **Items**.

#### ☐ 2 · Tafereel Hoogmoed, zonder doek
**Upload:** `item-tafereel-hoogmoed.png` · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-hoogmoed-zonder-doek.png` · *ART-PIPELINE stap 28*
```
Edit the attached image. Remove only the tattered cloth banner hanging from the mirror frame, and fill in whatever was behind it. Change nothing else: same position, scale, lines and lighting.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

### Wezens en effecten
In het gesprek **Items**.

#### ☐ 3 · Effect: regen (naadloos)
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-regen.png` · *ART-PIPELINE stap 121*
```
Draw one light effect: slanting rain made of short diagonal WHITE engraved strokes of varying length, tiling perfectly on all four sides. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a solid pure black background (#000000), no transparency.
```

### Achtergrond, 4 lagen
In het gesprek **Achtergronden**.

#### ☐ 4 · Het donkere woud: laag 1, de verte
**Upload:** niets · **Formaat:** Staand (1024×1536) · **Achtergrond:** Geen (het hele beeld is gevuld) · **Opslaan als:** `achtergrond-woud-1-ver.png` · *ART-PIPELINE stap 137*
```
Draw the farthest background layer of a scene. A dark forest at night: a night sky barely glimpsed through a dense canopy, and far away, through one small gap between the trees, a distant hill touched by the first pale light.
The horizon is at 60% of the image height. No characters.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: fully opaque, the whole canvas filled with the scene, no transparency.
```

#### ☐ 5 · Het donkere woud: laag 2, het midden
**Upload:** `achtergrond-woud-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-woud-2-midden.png` · *ART-PIPELINE stap 138*
```
Draw only the middle-distance layer that belongs in front of the attached background, with the same perspective and the same horizon: dense, twisted, gnarled tree trunks receding into darkness, with dark gaps between them; keep the small distant gap of light visible.
Leave open space on the left and right at about 75% of the image height. Do not redraw the sky or the far distance; that part stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 6 · Het donkere woud: laag 3, de grond
**Upload:** `achtergrond-woud-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-woud-3-grond.png` · *ART-PIPELINE stap 139*
```
Draw only the ground layer that belongs in front of the attached background: a forest floor of tangled roots, dead leaves and undergrowth, from the horizon down to the bottom edge.
The center at about 88% of the image height is flat and calm, because a person stands there. Everything above the ground stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 7 · Het donkere woud: laag 4, de voorgrond
**Upload:** `achtergrond-woud-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-woud-4-voorgrond.png` · *ART-PIPELINE stap 140*
```
Draw only the foreground framing layer that belongs in front of the attached background: dark gnarled branches reaching in from the top corners and the sides, thorny brambles in the bottom corners. These are very dark, almost black silhouettes.
The center 60% of the width stays completely empty and transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

**Klaar met scène 2?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.

---

## Scène 3 · Paradiso (balans +60 tot +100)  ·  1 beeld
Je ideale zelf, de tempelier, in de nieuwe stijl, met de hemel en de emblemen van je doelen die om je heen zweven.

*Wat je straks ziet:* Diepe, trage ademhaling, de emblemen van je doelen, ademende lichtstralen, een gloed achter je.

### Emblemen van je doelen
In het gesprek **Items**.

#### ☐ 8 · Embleem: lauwerkrans
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-lauwerkrans.png` · *ART-PIPELINE stap 16*
```
Draw one single object, centered: a classical laurel wreath, as it would sit on a man's head, seen from slightly to the side. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

**Klaar met scène 3?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.

---

## Scène 4 · Jouw voorwerpen  ·  18 beelden
Je eigen verleidingen en gewoontes liggen als voorwerp in de scène (zoals de telefoon en de kettlebell nu). **Maak alleen de voorwerpen die bij jouw gewoontes horen** en sla de rest over.

*Wat je straks ziet:* Het voorwerp van een verleiding licht op als die roept; dat van een goede gewoonte komt in het licht als je hem doet.

### Bij je verleidingen
In het gesprek **Items**.

#### ☐ 9 · Item: tijdschriften  ·  *hoort bij: vergelijken op social media*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tijdschriften.png` · *ART-PIPELINE stap 66*
```
Draw one single object, centered: a stack of glossy magazines. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 10 · Item: handspiegel  ·  *hoort bij: opscheppen, gelijk willen hebben*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-handspiegel.png` · *ART-PIPELINE stap 67*
```
Draw one single object, centered: a cracked hand mirror. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 11 · Item: kroon  ·  *hoort bij: geen hulp vragen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-kroon.png` · *ART-PIPELINE stap 68*
```
Draw one single object, centered: a toppled golden crown lying on its side. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 12 · Item: masker  ·  *hoort bij: liegen, excuses verzinnen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-masker.png` · *ART-PIPELINE stap 69*
```
Draw one single object, centered: a smiling porcelain mask. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

### Bij je goede gewoontes
In het gesprek **Items**.

#### ☐ 13 · Item: hardloopschoenen  ·  *hoort bij: hardlopen, stappen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-hardloopschoenen.png` · *ART-PIPELINE stap 71*
```
Draw one single object, centered: a pair of worn running shoes. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 14 · Item: ijsbad  ·  *hoort bij: koude douche / ijsbad*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-ijsbad.png` · *ART-PIPELINE stap 72*
```
Draw one single object, centered: a wooden tub of ice water with floating chunks of ice. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 15 · Item: saunaemmer  ·  *hoort bij: sauna*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-saunaemmer.png` · *ART-PIPELINE stap 73*
```
Draw one single object, centered: a wooden sauna bucket with a ladle. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 16 · Item: saunastenen  ·  *hoort bij: sauna*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-saunastenen.png` · *ART-PIPELINE stap 74*
```
Draw one single object, centered: a heap of hot sauna stones. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 17 · Item: boeken  ·  *hoort bij: lezen, iets nieuws geleerd*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-boeken.png` · *ART-PIPELINE stap 75*
```
Draw one single object, centered: a stack of old books. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 18 · Item: dagboek  ·  *hoort bij: journaling, dankbaarheid*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-dagboek.png` · *ART-PIPELINE stap 76*
```
Draw one single object, centered: an open journal with a quill and an inkpot. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 19 · Item: kaars  ·  *hoort bij: meditatie, box breathing*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-kaars.png` · *ART-PIPELINE stap 77*
```
Draw one single object, centered: a lit candle in a simple holder. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 20 · Item: meditatiekussen  ·  *hoort bij: meditatie, Wim Hof*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-meditatiekussen.png` · *ART-PIPELINE stap 78*
```
Draw one single object, centered: a round meditation cushion. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 21 · Item: fruitschaal  ·  *hoort bij: fruit, groente*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-fruitschaal.png` · *ART-PIPELINE stap 79*
```
Draw one single object, centered: a bowl of fruit. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 22 · Item: waterkruik  ·  *hoort bij: water*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-waterkruik.png` · *ART-PIPELINE stap 80*
```
Draw one single object, centered: a clay water jug with a cup. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 23 · Item: brood  ·  *hoort bij: zelf gekookt, eiwit*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-brood.png` · *ART-PIPELINE stap 81*
```
Draw one single object, centered: a loaf of bread broken in two. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 24 · Item: spaarpot  ·  *hoort bij: geld opzij, no-spend-dag, uitgaven bijhouden*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-spaarpot.png` · *ART-PIPELINE stap 82*
```
Draw one single object, centered: a glass jar of coins. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 25 · Item: lantaarn  ·  *hoort bij: vroeg opstaan, ochtendlicht*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-lantaarn.png` · *ART-PIPELINE stap 83*
```
Draw one single object, centered: an old iron lantern. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 26 · Item: pelgrimsstaf  ·  *hoort bij: wandeling in de natuur*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-pelgrimsstaf.png` · *ART-PIPELINE stap 84*
```
Draw one single object, centered: a pilgrim's wooden staff. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

**Klaar met scène 4?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.

---

## Scène 5 · Scènewissel  ·  1 beeld
Als je van de ene naar de andere scène gaat, neemt een inktvlek het beeld over.

*Wat je straks ziet:* De vlek loopt uit over het scherm en trekt weer weg.

### Overgang
In het gesprek **Items**.

#### ☐ 27 · Scherm: inktvlek
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Effen wit · **Opslaan als:** `scherm-inktvlek.png` · *ART-PIPELINE stap 132*
```
Draw one interface ornament in black ink: one enormous, irregular black ink blot with splattered edges, as if a bottle of ink has spilled across an engraving, filling most of the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a solid plain white background, no transparency.
```

**Klaar met scène 5?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.

