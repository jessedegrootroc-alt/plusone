# PlusOne: de volgende scènes, één beeld per stap

Dit is wat er nog nodig is, in de volgorde waarin je het maakt: **84 beelden**, scène voor scène. De prompts zijn precies dezelfde als in [ART-PIPELINE.md](ART-PIPELINE.md); dit bestand zet alleen wat nog ontbreekt op volgorde. Na elke scène kun je stoppen: stuur me de beelden, dan bouw ik die scène.

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

## Scène 2 · Het donkere woud (balans −60 tot −20)  ·  21 beelden
De eerste scène die je bereikt als het slecht gaat. De Verdwaalde, je zondetaferelen half in de mist, en ogen van beesten tussen de bomen.

*Wat je straks ziet:* Gebogen ademhaling, de drie beesten van Dante, raven die opvliegen, ogen die oplichten, motten, regen.

### Zondetaferelen (Traagheid heb je al)
In het gesprek **Items**.

#### ☐ 2 · Tafereel zonde: Hoogmoed
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-hoogmoed.png` · *ART-PIPELINE stap 27*
```
Draw one sin tableau, a frozen group of figures like a sculpture, as if they are slowly turning to stone. Symbolic and dignified: no blood, no wounds, no nudity beyond classical drapery. It stands on its own small patch of ground, which is part of the image. Nothing else around it.
PRIDE: a man in a fine robe kneels before a tall ornate gilded mirror, holding a flawless smiling mask in front of his face. His real face behind it is cracking like porcelain. An enormous boulder on his back presses him down. A toppled crown lies beside him. A tattered cloth banner hangs from the top of the mirror frame.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 3 · Tafereel Hoogmoed, zonder doek
**Upload:** `item-tafereel-hoogmoed.png` · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-hoogmoed-zonder-doek.png` · *ART-PIPELINE stap 28*
```
Edit the attached image. Remove only the tattered cloth banner hanging from the mirror frame, and fill in whatever was behind it. Change nothing else: same position, scale, lines and lighting.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 4 · Tafereel zonde: Afgunst
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-afgunst.png` · *ART-PIPELINE stap 29*
```
Draw one sin tableau, a frozen group of figures like a sculpture, as if they are slowly turning to stone. Symbolic and dignified: no blood, no wounds, no nudity beyond classical drapery. It stands on its own small patch of ground, which is part of the image. Nothing else around it.
ENVY: three figures sit shoulder to shoulder against a stone wall, their eyes bound shut with heavy cloth blindfolds. Each leans toward the next, straining to see. The middle figure clutches a glowing phone showing tiny silhouettes of other people's perfect lives.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 5 · Tafereel zonde: Toorn
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-toorn.png` · *ART-PIPELINE stap 30*
```
Draw one sin tableau, a frozen group of figures like a sculpture, as if they are slowly turning to stone. Symbolic and dignified: no blood, no wounds, no nudity beyond classical drapery. It stands on its own small patch of ground, which is part of the image. Nothing else around it.
WRATH: two men locked in an endless struggle, half-sunk in a black swamp, each grabbing the other by the collar with a clenched fist, faces twisted with rage. A shattered glass and a broken phone lie at the edge of the swamp.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 6 · Tafereel zonde: Hebzucht
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-hebzucht.png` · *ART-PIPELINE stap 33*
```
Draw one sin tableau, a frozen group of figures like a sculpture, as if they are slowly turning to stone. Symbolic and dignified: no blood, no wounds, no nudity beyond classical drapery. It stands on its own small patch of ground, which is part of the image. Nothing else around it.
GREED: a gaunt man kneels, chained by the wrist to the post of an enormous iron merchant's scale. One pan is heaped with coins, dice, playing cards and lottery tickets; on the other lies a carved stone heart, his own. He reaches for more coins while the scale tips against him.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 7 · Tafereel Hebzucht, zonder weegbalk
**Upload:** `item-tafereel-hebzucht.png` · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-hebzucht-zonder-balk.png` · *ART-PIPELINE stap 34*
```
Edit the attached image. Remove only the horizontal beam of the scale with both hanging pans and everything on them (keep the upright post), and fill in whatever was behind it. Change nothing else: same position, scale, lines and lighting.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 8 · Tafereel zonde: Vraatzucht
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-vraatzucht.png` · *ART-PIPELINE stap 35*
```
Draw one sin tableau, a frozen group of figures like a sculpture, as if they are slowly turning to stone. Symbolic and dignified: no blood, no wounds, no nudity beyond classical drapery. It stands on its own small patch of ground, which is part of the image. Nothing else around it.
GLUTTONY: a bloated man sits chained to a heavy chair at the end of an endless banquet table, still reaching for more. Empty bottles, overflowing ashtrays, cigarette packs, sweets and greasy wrappers are piled around him. Behind him stand gaunt, starving figures with hollow eyes, watching him in silence.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 9 · Tafereel zonde: Lust
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tafereel-lust.png` · *ART-PIPELINE stap 36*
```
Draw one sin tableau, a frozen group of figures like a sculpture, as if they are slowly turning to stone. Symbolic and dignified: no blood, no wounds, no nudity beyond classical drapery. It stands on its own small patch of ground, which is part of the image. Nothing else around it.
LUST: two lovers in classical drapery, turned to pale stone in a tight embrace, yet both stare not at each other but at a glowing screen held between them. Their drapery is whipped by a storm wind.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

### Wezens en effecten
In het gesprek **Items**.

#### ☐ 10 · Wezen: luipaard
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-luipaard.png` · *ART-PIPELINE stap 97*
```
Draw one single creature, centered: the dark silhouette of a leopard lurking, half-hidden, almost entirely solid black, only its eyes two small white points. Nothing else in the image, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 11 · Wezen: leeuw
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-leeuw.png` · *ART-PIPELINE stap 98*
```
Draw one single creature, centered: the dark silhouette of a lion lurking, half-hidden, almost entirely solid black, only its eyes two small white points. Nothing else in the image, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 12 · Wezen: wolvin
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-wolvin.png` · *ART-PIPELINE stap 99*
```
Draw one single creature, centered: the dark silhouette of a gaunt she-wolf lurking, half-hidden, almost entirely solid black, only its eyes two small white points. Nothing else in the image, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 13 · Wezen: raaf, zittend
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-raaf-zittend.png` · *ART-PIPELINE stap 90*
```
Draw one single creature, centered: a raven perched on a short bare branch, in side view, its head turned slightly toward the viewer. The branch is part of the image. Nothing else in the image, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 14 · Wezen: raaf, vliegend
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-raaf-vleugels-omhoog.png` · *ART-PIPELINE stap 91*
```
Draw one single creature, centered: a raven in flight in side view, flying to the right, with both wings raised high above its body. Nothing else in the image, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 15 · Wezen: raaf, vleugels omlaag
**Upload:** `item-raaf-vleugels-omhoog.png` · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-raaf-vleugels-omlaag.png` · *ART-PIPELINE stap 92*
```
Edit the attached image. Change only this: both wings are now pushed down below the body. Keep everything else exactly the same: same creature, same size, same position, same lines.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 16 · Wezen: mot
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-mot.png` · *ART-PIPELINE stap 104*
```
Draw one single creature, centered: a single moth with open wings, seen from above. Nothing else in the image, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 17 · Effect: ogen in het donker
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-ogen.png` · *ART-PIPELINE stap 112*
```
Draw one light effect: one pair of small glowing animal eyes side by side, in the center, drawn in WHITE. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a solid pure black background (#000000), no transparency.
```

#### ☐ 18 · Effect: regen (naadloos)
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-regen.png` · *ART-PIPELINE stap 121*
```
Draw one light effect: slanting rain made of short diagonal WHITE engraved strokes of varying length, tiling perfectly on all four sides. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a solid pure black background (#000000), no transparency.
```

### Achtergrond, 4 lagen
In het gesprek **Achtergronden**.

#### ☐ 19 · Het donkere woud: laag 1, de verte
**Upload:** niets · **Formaat:** Staand (1024×1536) · **Achtergrond:** Geen (het hele beeld is gevuld) · **Opslaan als:** `achtergrond-woud-1-ver.png` · *ART-PIPELINE stap 137*
```
Draw the farthest background layer of a scene. A dark forest at night: a night sky barely glimpsed through a dense canopy, and far away, through one small gap between the trees, a distant hill touched by the first pale light.
The horizon is at 60% of the image height. No characters.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: fully opaque, the whole canvas filled with the scene, no transparency.
```

#### ☐ 20 · Het donkere woud: laag 2, het midden
**Upload:** `achtergrond-woud-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-woud-2-midden.png` · *ART-PIPELINE stap 138*
```
Draw only the middle-distance layer that belongs in front of the attached background, with the same perspective and the same horizon: dense, twisted, gnarled tree trunks receding into darkness, with dark gaps between them; keep the small distant gap of light visible.
Leave open space on the left and right at about 75% of the image height. Do not redraw the sky or the far distance; that part stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 21 · Het donkere woud: laag 3, de grond
**Upload:** `achtergrond-woud-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-woud-3-grond.png` · *ART-PIPELINE stap 139*
```
Draw only the ground layer that belongs in front of the attached background: a forest floor of tangled roots, dead leaves and undergrowth, from the horizon down to the bottom edge.
The center at about 88% of the image height is flat and calm, because a person stands there. Everything above the ground stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 22 · Het donkere woud: laag 4, de voorgrond
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

## Scène 3 · Paradiso (balans +60 tot +100)  ·  14 beelden
Je ideale zelf, de tempelier, in de nieuwe stijl, met de hemel en de emblemen van je doelen die om je heen zweven.

*Wat je straks ziet:* Diepe, trage ademhaling, de emblemen van je doelen, ademende lichtstralen, een gloed achter je.

### Emblemen van je doelen
In het gesprek **Items**.

#### ☐ 23 · Embleem: lauwerkrans
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-lauwerkrans.png` · *ART-PIPELINE stap 16*
```
Draw one single object, centered: a classical laurel wreath, as it would sit on a man's head, seen from slightly to the side. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 24 · Embleem: medaille
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-medaille.png` · *ART-PIPELINE stap 17*
```
Draw one single object, centered: a round victory medal with an engraved star, hanging from a ribbon that forms a V shape. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 25 · Embleem: stralenkrans
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-stralenkrans.png` · *ART-PIPELINE stap 18*
```
Draw one single object, centered: a thin halo ring seen at an angle, with fine lines radiating from it. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 26 · Embleem: ijsadem
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-ijsadem.png` · *ART-PIPELINE stap 19*
```
Draw one single object, centered: a cluster of sharp ice crystals with a wisp of frozen breath curling from it. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 27 · Embleem: vuur
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-vuur.png` · *ART-PIPELINE stap 20*
```
Draw one single object, centered: a single slender rising flame wrapped in curling waves of heat. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 28 · Embleem: dageraad
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-dageraad.png` · *ART-PIPELINE stap 21*
```
Draw one single object, centered: a half sun rising on a straight horizon line, with long rays fanning out. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 29 · Embleem: boek
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-boek.png` · *ART-PIPELINE stap 22*
```
Draw one single object, centered: a closed leather-bound book with a metal clasp, tilted slightly. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 30 · Embleem: halter
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-halter.png` · *ART-PIPELINE stap 23*
```
Draw one single object, centered: a classical iron dumbbell, lying horizontally. Nothing else in the image, no hand, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

### Effecten
In het gesprek **Items**.

#### ☐ 31 · Effect: lichtstralen
**Upload:** niets · **Formaat:** Staand (1024×1536) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-stralen.png` · *ART-PIPELINE stap 118*
```
Draw one light effect: several broad diagonal rays of light falling from the upper left toward the lower right, drawn as fine parallel WHITE engraved lines that fade out at their edges. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a solid pure black background (#000000), no transparency.
```

#### ☐ 32 · Effect: gloed
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-gloed.png` · *ART-PIPELINE stap 119*
```
Draw one light effect: a glow of concentric WHITE engraved rings with fine radiating lines, centered and fading outward. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a solid pure black background (#000000), no transparency.
```

### Achtergrond, 4 lagen
In het gesprek **Achtergronden**.

#### ☐ 33 · Paradiso: laag 1, de verte
**Upload:** niets · **Formaat:** Staand (1024×1536) · **Achtergrond:** Geen (het hele beeld is gevuld) · **Opslaan als:** `achtergrond-paradiso-1-ver.png` · *ART-PIPELINE stap 149*
```
Draw the farthest background layer of a scene. Doré's heaven: immense concentric rings of white light radiating from a point above the center, built from rays and circles, almost entirely white paper with fine lines.
The horizon is at 60% of the image height. No characters.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: fully opaque, the whole canvas filled with the scene, no transparency.
```

#### ☐ 34 · Paradiso: laag 2, het midden
**Upload:** `achtergrond-paradiso-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-paradiso-2-midden.png` · *ART-PIPELINE stap 150*
```
Draw only the middle-distance layer that belongs in front of the attached background, with the same perspective and the same horizon: a distant celestial rose formed by countless tiny luminous figures arranged in rings, with soft parting clouds.
Leave open space on the left and right at about 75% of the image height. Do not redraw the sky or the far distance; that part stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 35 · Paradiso: laag 3, de grond
**Upload:** `achtergrond-paradiso-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-paradiso-3-grond.png` · *ART-PIPELINE stap 151*
```
Draw only the ground layer that belongs in front of the attached background: a floor of soft, bright, sculpted clouds drawn with sparse lines, from the horizon down to the bottom edge.
The center at about 88% of the image height is flat and calm, because a person stands there. Everything above the ground stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 36 · Paradiso: laag 4, de voorgrond
**Upload:** `achtergrond-paradiso-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-paradiso-4-voorgrond.png` · *ART-PIPELINE stap 152*
```
Draw only the foreground framing layer that belongs in front of the attached background: delicate wisps of cloud and fine streaks of light along the left and right edges and the bottom corners. These are very dark, almost black silhouettes.
The center 60% of the width stays completely empty and transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

**Klaar met scène 3?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.

---

## Scène 4 · Inferno (balans −100 tot −60)  ·  13 beelden
De bodem. De Schim, scherp en dichtbij tussen je zondetaferelen. Als laatste, omdat je hier hopelijk het minst komt.

*Wat je straks ziet:* Snelle, korte ademhaling, het telefoonlicht op zijn gezicht, sintels, vlammen, rook, een wervelwind, vleermuizen en vliegen.

### Wezens en effecten
In het gesprek **Items**.

#### ☐ 37 · Wezen: vleermuis
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-vleermuis-omhoog.png` · *ART-PIPELINE stap 93*
```
Draw one single creature, centered: a bat seen from the front, with both wings raised. Nothing else in the image, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 38 · Wezen: vleermuis, vleugels omlaag
**Upload:** `item-vleermuis-omhoog.png` · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-vleermuis-omlaag.png` · *ART-PIPELINE stap 94*
```
Edit the attached image. Change only this: both wings are now pushed down. Keep everything else exactly the same: same creature, same size, same position, same lines.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 39 · Wezen: vlieg
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-vlieg.png` · *ART-PIPELINE stap 105*
```
Draw one single creature, centered: a single fly, seen from above. Nothing else in the image, no ground, no shadow.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 40 · Effect: sintel
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-sintel.png` · *ART-PIPELINE stap 106*
```
Draw one light effect: one single glowing ember, small, in the center, drawn as WHITE engraved marks with a few radiating lines. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a solid pure black background (#000000), no transparency.
```

#### ☐ 41 · Effect: vonk
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-vonk.png` · *ART-PIPELINE stap 107*
```
Draw one light effect: one single thin spark, in the center, drawn as WHITE engraved lines. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a solid pure black background (#000000), no transparency.
```

#### ☐ 42 · Effect: vlam 1
**Upload:** niets · **Formaat:** Staand (1024×1536) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-vlam-1.png` · *ART-PIPELINE stap 113*
```
Draw one light effect: one tall flame tongue leaning slightly left, drawn as WHITE engraved contours and inner lines, filling the middle of the image. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a solid pure black background (#000000), no transparency.
```

#### ☐ 43 · Effect: vlam 2
**Upload:** `effect-vlam-1.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-vlam-2.png` · *ART-PIPELINE stap 114*
```
Edit the attached image. Change only this: the flame now leans slightly to the right and its tip curls the other way, like the next moment of a flickering fire. Keep everything else exactly the same: same creature, same size, same position, same lines.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a solid pure black background (#000000), no transparency.
```

#### ☐ 44 · Effect: rook (naadloos)
**Upload:** niets · **Formaat:** Liggend (1536×1024) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-rook.png` · *ART-PIPELINE stap 116*
```
Draw one light effect: a band of slowly curling smoke and steam plumes rising upward, in WHITE engraved lines. The left and right edges must match perfectly so it can scroll endlessly. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1536×1024 landscape.
Background: a solid pure black background (#000000), no transparency.
```

#### ☐ 45 · Effect: wervelwind (naadloos)
**Upload:** niets · **Formaat:** Liggend (1536×1024) · **Achtergrond:** Effen zwart · **Opslaan als:** `effect-wervelwind.png` · *ART-PIPELINE stap 120*
```
Draw one light effect: a band of howling whirlwind: streaks of wind, swirling engraved lines and scraps of cloth, all in WHITE. The left and right edges must match perfectly. Only white lines on black, nothing else in the image.
Style: as defined in my style prompt.
Size: 1536×1024 landscape.
Background: a solid pure black background (#000000), no transparency.
```

### Achtergrond, 4 lagen
In het gesprek **Achtergronden**.

#### ☐ 46 · Inferno: laag 1, de verte
**Upload:** niets · **Formaat:** Staand (1024×1536) · **Achtergrond:** Geen (het hele beeld is gevuld) · **Opslaan als:** `achtergrond-inferno-1-ver.png` · *ART-PIPELINE stap 133*
```
Draw the farthest background layer of a scene. The pitch-black abyss at the bottom of Hell: a near-black void, and far away, barely visible, a colossal shadowy figure frozen waist-deep in a lake of ice. A faint cold glow rises from below.
The horizon is at 60% of the image height. No characters.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: fully opaque, the whole canvas filled with the scene, no transparency.
```

#### ☐ 47 · Inferno: laag 2, het midden
**Upload:** `achtergrond-inferno-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-inferno-2-midden.png` · *ART-PIPELINE stap 134*
```
Draw only the middle-distance layer that belongs in front of the attached background, with the same perspective and the same horizon: jagged black rock pillars and broken stone stairs descending into darkness.
Leave open space on the left and right at about 75% of the image height. Do not redraw the sky or the far distance; that part stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 48 · Inferno: laag 3, de grond
**Upload:** `achtergrond-inferno-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-inferno-3-grond.png` · *ART-PIPELINE stap 135*
```
Draw only the ground layer that belongs in front of the attached background: a wet, uneven cave floor of black rock with scattered stones, old bones and small puddles reflecting faint light, from the horizon down to the bottom edge.
The center at about 88% of the image height is flat and calm, because a person stands there. Everything above the ground stays transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 49 · Inferno: laag 4, de voorgrond
**Upload:** `achtergrond-inferno-1-ver.png` · **Formaat:** Staand (1024×1536) · **Achtergrond:** Transparant · **Opslaan als:** `achtergrond-inferno-4-voorgrond.png` · *ART-PIPELINE stap 136*
```
Draw only the foreground framing layer that belongs in front of the attached background: dripping stalactites from the top corners, rusted chains hanging on the left, sharp rocks in the bottom right. These are very dark, almost black silhouettes.
The center 60% of the width stays completely empty and transparent.
Style: as defined in my style prompt.
Size: 1024×1536 portrait.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

**Klaar met scène 4?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.

---

## Scène 5 · Jouw voorwerpen  ·  34 beelden
Je eigen verleidingen en gewoontes liggen als voorwerp in de scène (zoals de telefoon en de kettlebell nu). **Maak alleen de voorwerpen die bij jouw gewoontes horen** en sla de rest over.

*Wat je straks ziet:* Het voorwerp van een verleiding licht op als die roept; dat van een goede gewoonte komt in het licht als je hem doet.

### Bij je verleidingen
In het gesprek **Items**.

#### ☐ 50 · Item: laptop  ·  *hoort bij: porno, lust-scrollen, doomscrollen, schermtijd*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-laptop.png` · *ART-PIPELINE stap 50*
```
Draw one single object, centered: a half-open laptop, its screen glowing. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 51 · Item: asbak  ·  *hoort bij: roken*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-asbak.png` · *ART-PIPELINE stap 51*
```
Draw one single object, centered: a heavy ashtray overflowing with cigarette butts, next to a crushed cigarette pack. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 52 · Item: vape  ·  *hoort bij: vapen, snus*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-vape.png` · *ART-PIPELINE stap 52*
```
Draw one single object, centered: a vape pen lying on its side. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 53 · Item: drankfles  ·  *hoort bij: alcohol, meer dan 5 glazen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-drankfles.png` · *ART-PIPELINE stap 53*
```
Draw one single object, centered: an empty liquor bottle lying tipped over. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 54 · Item: blikje  ·  *hoort bij: frisdrank, energydrank*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-blikje.png` · *ART-PIPELINE stap 54*
```
Draw one single object, centered: a crushed energy-drink can. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 55 · Item: fastfood  ·  *hoort bij: fastfood, eetbui, snaaien na 20:00*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-fastfood.png` · *ART-PIPELINE stap 55*
```
Draw one single object, centered: a greasy crumpled fast-food bag with a few fries spilling out. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 56 · Item: snoep  ·  *hoort bij: snoep, max. suiker*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-snoep.png` · *ART-PIPELINE stap 56*
```
Draw one single object, centered: a torn-open candy wrapper with sweets spilling out. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 57 · Item: dobbelstenen  ·  *hoort bij: gokken / sportsbetting*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-dobbelstenen.png` · *ART-PIPELINE stap 57*
```
Draw one single object, centered: a pair of dice. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 58 · Item: speelkaarten  ·  *hoort bij: online casino / poker*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-speelkaarten.png` · *ART-PIPELINE stap 58*
```
Draw one single object, centered: a fanned-out hand of playing cards. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 59 · Item: munten  ·  *hoort bij: koersen checken, krasloten*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-munten.png` · *ART-PIPELINE stap 59*
```
Draw one single object, centered: a small scattered pile of coins. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 60 · Item: boodschappentas  ·  *hoort bij: impulsaankoop, Klarna*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-boodschappentas.png` · *ART-PIPELINE stap 60*
```
Draw one single object, centered: an overflowing shopping bag. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 61 · Item: wekker  ·  *hoort bij: snoozen, na 23:30 naar bed*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-wekker.png` · *ART-PIPELINE stap 61*
```
Draw one single object, centered: a smashed alarm clock. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 62 · Item: controller  ·  *hoort bij: gamen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-controller.png` · *ART-PIPELINE stap 62*
```
Draw one single object, centered: a game controller with a dangling cable. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 63 · Item: afstandsbediening  ·  *hoort bij: series bingen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-afstandsbediening.png` · *ART-PIPELINE stap 63*
```
Draw one single object, centered: a TV remote control. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 64 · Item: gebroken glas  ·  *hoort bij: woede, snauwen, online ruzie*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-gebroken-glas.png` · *ART-PIPELINE stap 64*
```
Draw one single object, centered: a shattered drinking glass. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 65 · Item: brief  ·  *hoort bij: roddelen, wrok*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-brief.png` · *ART-PIPELINE stap 65*
```
Draw one single object, centered: a torn, crumpled letter. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 66 · Item: tijdschriften  ·  *hoort bij: vergelijken op social media*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-tijdschriften.png` · *ART-PIPELINE stap 66*
```
Draw one single object, centered: a stack of glossy magazines. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 67 · Item: handspiegel  ·  *hoort bij: opscheppen, gelijk willen hebben*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-handspiegel.png` · *ART-PIPELINE stap 67*
```
Draw one single object, centered: a cracked hand mirror. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 68 · Item: kroon  ·  *hoort bij: geen hulp vragen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-kroon.png` · *ART-PIPELINE stap 68*
```
Draw one single object, centered: a toppled golden crown lying on its side. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 69 · Item: masker  ·  *hoort bij: liegen, excuses verzinnen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-masker.png` · *ART-PIPELINE stap 69*
```
Draw one single object, centered: a smiling porcelain mask. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

### Bij je goede gewoontes
In het gesprek **Items**.

#### ☐ 70 · Item: hardloopschoenen  ·  *hoort bij: hardlopen, stappen*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-hardloopschoenen.png` · *ART-PIPELINE stap 71*
```
Draw one single object, centered: a pair of worn running shoes. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 71 · Item: ijsbad  ·  *hoort bij: koude douche / ijsbad*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-ijsbad.png` · *ART-PIPELINE stap 72*
```
Draw one single object, centered: a wooden tub of ice water with floating chunks of ice. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 72 · Item: saunaemmer  ·  *hoort bij: sauna*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-saunaemmer.png` · *ART-PIPELINE stap 73*
```
Draw one single object, centered: a wooden sauna bucket with a ladle. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 73 · Item: saunastenen  ·  *hoort bij: sauna*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-saunastenen.png` · *ART-PIPELINE stap 74*
```
Draw one single object, centered: a heap of hot sauna stones. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 74 · Item: boeken  ·  *hoort bij: lezen, iets nieuws geleerd*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-boeken.png` · *ART-PIPELINE stap 75*
```
Draw one single object, centered: a stack of old books. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 75 · Item: dagboek  ·  *hoort bij: journaling, dankbaarheid*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-dagboek.png` · *ART-PIPELINE stap 76*
```
Draw one single object, centered: an open journal with a quill and an inkpot. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 76 · Item: kaars  ·  *hoort bij: meditatie, box breathing*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-kaars.png` · *ART-PIPELINE stap 77*
```
Draw one single object, centered: a lit candle in a simple holder. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 77 · Item: meditatiekussen  ·  *hoort bij: meditatie, Wim Hof*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-meditatiekussen.png` · *ART-PIPELINE stap 78*
```
Draw one single object, centered: a round meditation cushion. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 78 · Item: fruitschaal  ·  *hoort bij: fruit, groente*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-fruitschaal.png` · *ART-PIPELINE stap 79*
```
Draw one single object, centered: a bowl of fruit. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 79 · Item: waterkruik  ·  *hoort bij: water*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-waterkruik.png` · *ART-PIPELINE stap 80*
```
Draw one single object, centered: a clay water jug with a cup. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 80 · Item: brood  ·  *hoort bij: zelf gekookt, eiwit*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-brood.png` · *ART-PIPELINE stap 81*
```
Draw one single object, centered: a loaf of bread broken in two. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 81 · Item: spaarpot  ·  *hoort bij: geld opzij, no-spend-dag, uitgaven bijhouden*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-spaarpot.png` · *ART-PIPELINE stap 82*
```
Draw one single object, centered: a glass jar of coins. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 82 · Item: lantaarn  ·  *hoort bij: vroeg opstaan, ochtendlicht*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-lantaarn.png` · *ART-PIPELINE stap 83*
```
Draw one single object, centered: an old iron lantern. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

#### ☐ 83 · Item: pelgrimsstaf  ·  *hoort bij: wandeling in de natuur*
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Transparant · **Opslaan als:** `item-pelgrimsstaf.png` · *ART-PIPELINE stap 84*
```
Draw one single object, centered: a pilgrim's wooden staff. Seen from a slightly high angle, as if lying on the ground. Light from the upper left. No text or logos, no ground, no shadow, nothing else in the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a real transparent background (PNG with alpha channel), not a checkerboard pattern.
```

**Klaar met scène 5?** Stuur me de beelden; dan bouw ik hem voordat je verder gaat.

---

## 6 · Scènewissel  ·  1 beeld
Als je van de ene naar de andere scène gaat, neemt een inktvlek het beeld over.

*Wat je straks ziet:* De vlek loopt uit over het scherm en trekt weer weg.

### Overgang
In het gesprek **Items**.

#### ☐ 84 · Scherm: inktvlek
**Upload:** niets · **Formaat:** Vierkant (1024×1024) · **Achtergrond:** Effen wit · **Opslaan als:** `scherm-inktvlek.png` · *ART-PIPELINE stap 132*
```
Draw one interface ornament in black ink: one enormous, irregular black ink blot with splattered edges, as if a bottle of ink has spilled across an engraving, filling most of the image.
Style: as defined in my style prompt.
Size: 1024×1024 square.
Background: a solid plain white background, no transparency.
```

