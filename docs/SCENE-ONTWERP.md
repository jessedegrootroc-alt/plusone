# PlusOne: ontwerp van de levende scène

Dit is het ontwerp achter de beelden. De prompts zelf staan in [ART-PIPELINE.md](ART-PIPELINE.md).



### De 5 scènes
| # | Scène | Wanneer (balans) | Wie je bent | Wat er rondom je staat |
|---|---|---|---|---|
| 1 | **Inferno**: de afgrond | −100 tot −60 | De Schim | De taferelen van je 2 sterkste zonden, scherp en dichtbij |
| 2 | **Het donkere woud** | −60 tot −20 | De Verdwaalde | Dezelfde zondetaferelen, half in de mist. Ogen van beesten tussen de bomen |
| 3 | **De kust van de berg** | −20 tot +20 | Jij, in balans | Een kruispunt: links in de schaduw je sterkste zonde, rechts in het licht je sterkste deugd |
| 4 | **De terrassen** | +20 tot +60 | De Klimmer (schildknaap) | De taferelen van je 2 sterkste deugden, met pelgrims die meeklimmen |
| 5 | **Paradiso** | +60 tot +100 | Je Ideale Zelf (tempelier) | Je deugdtaferelen in vol licht, met je kenmerken (medaille, krans …) |

- **Geen harde sprongen:** binnen een scène verlopen het licht, de mistdichtheid en het aantal particles traploos met je balans. Pas bij een grens wisselt de scène.
- **Een scènewissel** gebeurt met een inktvlek die het beeld overneemt, plus de Affliction- of Virtue-banner.
- **Welke taferelen je ziet** komt uit het Kompas: het zijn altijd je eigen zwakste zonden en sterkste deugden.

### De lagen, van achter naar voor
```
1  far          lucht, verte, lichtbron                     (beweegt bijna niet)
2  mid          middengrond: bergen, bomen, poort            (trage parallax)
3  tableaux     2 taferelen links en rechts                  (trage parallax + 1 bewegend deel)
4  creatures    raven, duiven, pelgrims, boot, engel         (eigen loops)
5  near         de grond waar je op staat                    (parallax)
6  props        je eigen verleidingen of deugden als objecten (parallax)
7  character    jij, als rig                                 (idle-animatie)
8  front        donkere randen: takken, rotsen, kettingen    (snelle parallax)
9  fx           mist, rook, sintels, stralen, stof           (eindeloze loops)
10 light        vignet en lichtcirkel, volgt je balans        (code)
11 meter        de balansmeter onder je voeten                (UI)
```

### Wat er eindeloos beweegt
| Element | Animatie | Ritme |
|---|---|---|
| Camera | Langzaam in- en uitademen (1,00 → 1,03 zoom), lichte drift | 24 s |
| Parallax | Volgt het kantelen van je telefoon; zonder sensor een trage drift | doorlopend |
| Jij: ademen | Romp schaalt mee. Schim: snel en kort. Ideaal: diep en traag | 2–6 s |
| Jij: knipperen | Wisselt naar `head_blink` | willekeurig, 3–7 s |
| Jij: secundair | Haar, lappen en stof bewegen een fractie na | met de ademhaling mee |
| Taferelen | Eén bewegend deel per tafereel (slinger, weegschaal, waterstraal …) | 4–8 s |
| Wezens | Raaf vliegt op, duif cirkelt, pelgrims lopen, boot drijft | 12–40 s |
| Mist en rook | Schuift naadloos horizontaal | 40–60 s |
| Particles | Sintels stijgen, stof zweeft, motten om het telefoonlicht | doorlopend |
| Licht | Flikkerend telefoonlicht, ademende stralen in Paradiso | 3–8 s |

### Interactie
- **Tik op jezelf:** opent het Spiegelmoment.
- **Tik op een tafereel:** opent de uitleg van die zonde of deugd en de gewoontes die hem voeden.
- **Tik op de meter:** opent het Kompas.
- **"Beweging verminderen" aan op de telefoon:** de scène staat stil en alleen de meter beweegt.

### De meter: onder je voeten
- **Waarom onder:** net als de stressbalk in Darkest Dungeon zit hij direct onder de held, dus je oog gaat vanzelf van jezelf naar je toestand. Bovenaan is ruimte voor datum en begroeting, en onderaan zit hij in je duimzone.
- **Vorm:** een gegraveerde balk van een schedel (links) naar een zon met lauwerkrans (rechts), in 5 segmenten met een medaillon per scène.
- **De indicator:** een lantaarntje dat over de balk schuift. Daarboven staat de naam van je plaat, en eronder het verschil van vandaag (bijvoorbeeld "+2,4 vandaag").

> **Gevolg voor de app:** de app gaat van 7 naar 5 toestanden, zodat scènes en personages één-op-één passen. Dat pas ik aan als de beelden binnenkomen.



