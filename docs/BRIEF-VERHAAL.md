# Brief v2: PlusOne, het verhaal — regieboek

> Geschreven als regieboek van een team dat al vijftien jaar samen interactieve films maakt: creative director, scenarist, illustrator, 2D-animator (cut-out/Spine), motion designer, creative developer en sounddesigner.
> Gebruik dit document als prompt. Alles hier is een besluit, behalve wat onder **Open vragen** staat.
> Basis: een volledige ontleding van santionispirits.com (Active Theory + Plan8): elke scène doorgelopen, en de vertelstem, de scène-volgorde en de interactiecode uit de eigen bestanden van de site gelezen.
> Voor de stijl en animatie geldt *Darkest Dungeon* (Red Hook, GDC-talk "A Torch in the Dark").

---

## 0. Waarom versie 1 mislukte

| Versie 1 | De referentie | Gevolg |
|---|---|---|
| 5 "bedrijven" van grote, losse schermvullende beelden | **13 verhaalscènes + 5 merk-scènes**, opgebouwd als een **stripverhaal**: hoofdpaneel + kleine inzet-panelen (close-ups) die over elkaar schuiven | Er gebeurde te weinig; het voelde als een diashow |
| Slogans in kapitalen ("IEDEREEN BEGINT ERGENS.") | **Een verteller**: 16 echte zinnen die een verhaal vertellen, in een tekstkader, met de **gesproken woorden rood oplichtend** terwijl ze worden uitgesproken | Geen verhaal en geen context; je wist niet wie hij was of waarom het ertoe deed |
| Hoofdpersoon zonder gezicht, naam of verleden | Eerst een wijd shot, dan **gezicht, ogen, handen**: je komt steeds dichter bij hem | Geen band met hem, dus geen spanning |
| Alles binnen 30 schermhoogtes, auto-scroll na gebaren | **±175 seconden vertelstem**; elke scène krijgt de tijd van haar zin | De pacing was te snel |
| Gebaren die het scrollen blokkeren, met een ring onderin | Gebaren **binnen een vastgezette scène**, met een cursor-schijf met tekst ("Hold & Pour"); het gebaar **speelt de scène zelf** | Het gebaar voelde als een slagboom, niet als spelen |
| Beelden die alleen zachtjes driften (parallax) | Wind die door haar en mantels waait, inkt die druipt, panelen met levende inktranden, een camera die meekantelt met je scrollsnelheid, een kleur die over de mantel omhoogkruipt | Het voelde statisch |
| Overgangen met een witte flits | **Inktovergangen** (verticale druipstrepen), titel-drop ná het hoogtepunt, puin dat de lucht in vliegt | Er waren geen momenten om te onthouden |

**De les:** we maken geen "scrollende website met beelden" maar een **geanimeerde graphic novel met een verteller**, waar je met je duim doorheen gaat en op vier momenten zelf aan speelt.

---

## 1. De opdracht in één zin

Een geanimeerde graphic novel in Darkest Dungeon-stijl, met verteller. Een man die alles kwijt is, krijgt in een regenachtige steeg één melding op zijn gebarsten telefoon. Hij tikt, valt door het scherm, ontwaakt aan de voet van zijn eigen berg en breekt daar met één keuze zijn eerste zonde. Daarna gaat het verhaal over in het merk: **Kijk. Kies. Klim.** Aan het eind zet de bezoeker de app op zijn beginscherm.

**Niveau:** Awwwards Site of the Day / FWA of the Month. **Duur:** 3 tot 4 minuten.

---

## 2. De hoofdpersoon (context = spanning)

> Horror en spanning gedijen bij onzekerheid (Bourassa). We vertellen dus niet zijn hele verleden; we laten **sporen** zien, en de bezoeker vult de rest zelf in.

- **Naam:** **Daan**, 34. De naam valt één keer, op een envelop in de goot, en nergens anders.
- **Wie hij was:** amateurbokser met een medaille, vader van een dochter (Noor, 6) die hij niet meer ziet, en ooit een baan.
- **Wie hij nu is:** hij slaapt in een portiek. Drank, gokken en zijn telefoon zijn zijn dag. Hij is niet gewelddadig of zielig, wel **afwezig**: "al jaren niet meer wakker".
- **De sporen** (kleine inzet-panelen in scène 1–2, nooit uitgelegd):
  1. een **bokshandschoen** met een gescheurde veter, onder zijn jas;
  2. een **foto van een meisje**, verfrommeld, in zijn hand of op de grond;
  3. een **brief: "Laatste aanmaning — D. de Vries"**, doorweekt;
  4. een **lege fles**, een **kraslot**, en een **telefoon met een barst** dwars over het scherm.
- **Zijn wens** (de droomwereld): het ideaalbeeld uit de app, de ridder (`karakter-ideaal`). Dat is **wie hij kan worden**, niet wie hij was.
- **Uiterlijk:** lang vet haar, baard van weken, een te grote legerjas met capuchon. Dit is **dezelfde man** als `karakter-schim` → `karakter-verdwaalde` → `karakter-klimmer` → `karakter-ideaal`.
- **Kleur:** zijn jas is **vaal oker** (zoals de mantel van de heilige bij Santioni). Na de transformatie kleurt die jas **van onder naar boven** in de kleur van de deugd die hij kiest (§5, scène 10).

---

## 3. Wat Santioni precies doet (ontleed)

### 3.1 Opbouw

| # | Scène (eigen naam in hun code) | Wat je ziet | Vertelstem | Interactie |
|---|---|---|---|---|
| — | Laden | Gegraveerd embleem, één dunne laadlijn | — | — |
| — | Leeftijdspoort | "ARE YOU OF / LEGAL AGE?" De twee regels schuiven uit elkaar naar boven en onder, en in het midden verschijnen YES · embleem · NO | — | klik |
| — | Titel (Intro) | Donker, kwaststreken schilderen zich in, "THE NOTTURNO EXPERIENCE" in Art-deco-kapitalen. Onderin borrelt een witte inktwolk op | — | — |
| 0 | **Wander** | Een eindeloos wit niets met mist. Een heilige in een vaal okeren mantel loopt, wind trekt aan zijn mantel. Een inzet-paneel toont een close-up van zijn gezicht in de capuchon | 1, 2 | — |
| 1 | **Profile** | Hij doet zijn capuchon af. Groot zijprofiel; inktstrepen als "geluid" eromheen | 3, 4 | — |
| 2 | **Approach** | Op de rug gezien; een monoliet met een rond portaal en een rode zon. Een trap. Rond doek op de voorgrond | 5 | — |
| 3 | **Near** | Mantel in close-up die over de paneelrand waait; inzet van een kelk | 6, 7 | — |
| 4 | **Hand** | Een reusachtige rode cirkel (het portaal), klein silhouet ervoor. Dan zijn hand in close-up tegen een rood vloeibaar oppervlak | 8, 9 | **Hold & Move** |
| 5 | **Target** | Rond paneel: zijn silhouet in het rood, haar dat waait | 10 | — |
| 6 | **Transition** | Het witte blad **druipt** in verticale inktstrepen weg naar zwart, en uit het zwart rijst rood op | — | — |
| 7 | **Cathedral** | Een rode zuilenhal; panoramisch paneel met zijn **ogen** dat over het beeld schuift; klein in de verte drie flessen. Hij loopt naar voren (voetstappen op het ritme van zijn loop) | 11, 12 | — |
| 8 | **Drink Selection** | Hij naast een sokkel met drie flessen; close-up van de flessen die trillen | 13 | **Choose Flavor** |
| 9 | **Drink Pour** | Een hand schenkt in een coupe; de vloeistof vult zich | — | **Hold & Pour** |
| 10 | **Anti-Gravity** | Hij drinkt; zijn **mantel kleurt van onder naar boven blauw**; zijn **ogen wijd open**; een lichtbundel, hij zweeft, met snelheidslijnen | 14, 15 | **Hold** |
| 11 | **Pillar Crumble** | Zuilen scheuren; het dak breekt en **vliegt omhoog weg**; de rode lucht komt vrij | 16 | — |
| 12 | **Colosseum** | **Titel-drop:** "THE NOTTURNO EXPERIENCE" opnieuw, nu groot op rood, met rondvliegend puin. Hij staat getransformeerd in een open zuilenring | — | — |
| 13 | **Taste** | Merkmanifest: "INDULGE NOW / ATONE LATER", met daaronder het ritueel als slider: Chill · Shake · Pour | — | swipe |
| 14 | **Collection** | De drie smaken | — | — |
| 15 | **Products** | 3D-flessen (echt materiaal, PBR) | — | — |
| 16 | **Retail** | "Select houses forthcoming" | — | — |
| 17 | **Footer** | Logo, Instagram, makers | — | — |

### 3.2 Timing (gemeten)

- **Vertelstem:** 16 zinnen, samen **175 s**. Per zin, in seconden: 6,2 · 9,4 · 6,0 · 7,9 · **20,5** · 3,7 · 11,6 · 10,0 · 3,4 · 3,4 · 12,1 · 4,4 · 13,9 · 13,6 · 10,0 · 10,7.
  - Het ritme: korte zinnen vlak vóór een keerpunt ("There's no time." 3,7 s; "Hesitantly his hand draws forward." 3,4 s; "Taking a deep breath, he steps in." 3,4 s). De langste zin (20,5 s) staat vlak vóór het portaal: **de adem voor de sprong**.
- **Variant per keuze:** zin 14 bestaat in drie versies, één per gekozen smaak (mint/chocolade, sinaasappel, marshmallow/koffie). **De keuze van de bezoeker verandert de vertelling.**
- **Scrollafstand:** het verhaal (scène 0–12) is ongeveer **45 muiswieltikken** (±15 schermhoogtes); de merkdelen daarna zijn kort. Elke scène is **vastgezet (sticky)** over een eigen scrollbereik, met een eigen voortgang van 0 tot 1:
  - elementen komen binnen tussen 0 en 0,15;
  - de scène speelt tussen 0,15 en 0,8;
  - alles gaat weer weg tussen 0,8 en 0,95.
  - Uit hun code: Hand-scène `range(0, .15)` in en `range(.8, .95)` uit; Pour `range(.5, .6)`; Selection `range(.45, .55)`; Cathedral `range(.7, .75)`.
- **Vloeiend scrollen:** op desktop lerp 0,08 (traag en zwaar); op mobiel 0,9 (direct onder je duim).
- **De camera kantelt mee met je scrollsnelheid:**
  ```
  rotation.x = lerp(0.002 × scrollDelta, rotation.x, 0.05), begrensd op ±0,2 rad
  ```
  Snel scrollen laat de wereld voorover hellen; stoppen laat hem terugveren. Dit is één van de redenen dat het nooit statisch voelt.

### 3.3 De vier interacties (uit hun code)

> **Belangrijk:** bij Santioni **blokkeren de gebaren het scrollen niet.** De scène staat vast (sticky), de cursor wordt een schijf met tekst, en scrollen speelt de scène ook gewoon af. Vasthouden is de **rijkere** manier om het moment te beleven: meer geluid, een eigen reactie, en de keuze die de vertelstem verandert.

| Scène | Tekst op de cursor | Wat het doet | Tijd |
|---|---|---|---|
| Hand | **Hold & Move** | Je stuurt zijn hand zelf door het vloeibare portaal; het oppervlak rimpelt (een vloeistofsimulatie) waar je beweegt | zolang je vasthoudt |
| Drink Selection | **Choose Flavor** | Hover of tik op een fles: die groeit (1,2 s, easeOutCubic), de andere krimpen (0,6 s). Daarna kies je | 0,6 / 1,2 s |
| Drink Pour | **Hold & Pour** | Vasthouden vult het glas, **lineair in 3 s**; loslaten laat het **in 1 s** terugzakken. Geluid: `pouring_start` / `pouring_stop` | 3 s / 1 s |
| Anti-Gravity | **Hold** | Vasthouden laat hem opstijgen. In 6 s, met *speedUpEase* (traag beginnen, dan versnellen): camera-zoom naar 1,1, de lichtbundel 8× sneller, windlijnen 4× sneller, camera-shake aan. Je vinger tekent lichtdeeltjes. Loslaten laat alles in 3–6 s terugzakken, met `antigravity_release` | 6 s |

### 3.4 Beeld- en animatietechnieken

1. **Stripverhaal-raster:** een hoofdpaneel met 1–2 **zwevende inzet-panelen** (close-ups van gezicht, hand, voorwerp) op een andere diepte, zodat ze sneller of trager schuiven. Panelen overlappen, en **figuren breken uit hun kader**: een mantel of hand steekt over de rand.
2. **Levende panelranden:** een eigen shader (`BorderShader`, met `uFluidEdge`) laat de zwarte kaderlijn trillen als natte inkt. Kaders staan licht schuin in diepte (`uDepthSkew`).
3. **Tekstkaders:** een wit vlak met een dikke zwarte rand, kleine kapitalen in een schreefloze letter. Het **woord dat wordt uitgesproken kleurt rood**, woord voor woord op de tijdcodes van de vertelstem (een karaoke-buffer per woord). Zonder geluid loopt de markering mee met je scroll.
4. **Wind langs curves:** per scène vaste windbanen (`wind-curves.json`) waarlangs streepjes en haren bewegen; de mantel waait echt (gesimuleerd doek of een rig met naslingering).
5. **Inkt als overgang:** het hele beeld druipt weg in verticale strepen (scène 6), en een witte inktwolk borrelt op onder de titel.
6. **Intekenen:** een shader laat lijnen zich tekenen, als een pen die over papier gaat (`uDraw`, 6 s).
7. **Kleurdiscipline:** zwart-wit-gravure plus **één accentkleur per wereld**: wit met oker in de woestijn, **rood** in de nacht, **blauw** alleen voor wat transformeert (mantel en glas).
8. **Transformatie als kleur:** de nieuwe kleur kruipt van de zoom van de mantel omhoog naar de schouders.
9. **Reactieshots:** ná elk groot moment een paneel met **alleen zijn ogen**, eerst halfgesloten en later wijd open. Dat is de emotie, zonder één woord.
10. **Titel-drop ná het hoogtepunt:** de titel komt aan het begin én opnieuw ná de transformatie, als bij een film met een *cold open*.
11. **De poort is een animatie:** de vraag splitst zich, de knoppen komen ertussen tevoorschijn.

### 3.5 Geluid (Plan8)

- **Muziek in lagen (stems)** die meeschuiven met de scrollvoortgang (`getMixForScene`). De overgangen liggen bij Approach, Cathedral, Anti-Gravity en Taste.
- **Losse geluiden** (one-shots): `ui_click`, `bottle_interact`, `pouring_start`, `pouring_stop`, `drinking`, `antigravity_release`. Daarnaast wind, jazz in de verte, en **voetstappen op het ritme van zijn loopanimatie**.
- **Vertelstem:** eerst gegenereerd met ElevenLabs, daarna **opnieuw ingesproken door een echte stem**, voor de menselijkheid.
- **Geluid aan/uit** staat rechtsonder, als een kleine equalizer.

---

## 4. Darkest Dungeon: hoe zij animeren (en wat wij overnemen)

1. **Pose-to-pose, geen soepel tweenen.** De aanvallen in DD zijn **sterke stilstaande poses** die in één frame wisselen; de poses en het geluid doen het werk.
   - **Wij:** op elk keerpunt **springt** de figuur in een nieuwe pose (een kleine overshoot van 1–2 frames, geen glijden). Tussen de keerpunten ademt de figuur alleen.
2. **Zoom op impact.** Bij een treffer zoomt de camera in, schuiven de figuren naar elkaar toe, en wordt de achtergrond donker. Bij een kritieke treffer is alles groter.
   - **Wij:** op elk gelukt gebaar en elke grote klap:
     - in 0,12 s naar zoom 1,12, met de figuur naar het midden en de achtergrond 40% donkerder;
     - 0,7 s vasthouden;
     - in 0,45 s terug, met een harde ease-out.
     - Op de twee grootste momenten (scène 5 en 10) ook een **rode flits van één frame** en **tijdvertraging**: de wereld loopt 0,4 s op 30% snelheid.
3. **Ademen via een cut-out rig** (DD tekent in Photoshop en animeert in **Spine**, met losse delen op botten).
   - **Wij:** elke figuur wordt een rig van romp, hoofd, 2 armdelen, kap/haar en mantelpanden.
     - **Ademen:** de romp schaalt van 1 naar 1,015 en het hoofd beweegt 1–2 px, op 2,5–3,5 s per ademhaling.
     - **Haar en mantel:** bewegen **na** met een vertraging (*follow-through*) en reageren op de windlijnen.
     - **Geen twee figuren** ademen tegelijk.
4. **Licht is stemming.** In DD bepaalt de fakkel hoe donker de wereld is.
   - **Wij:** een **vignet als fakkel**: krap en flakkerend (8–12 Hz, kleine uitslag) in de stad, en open en stil in de droomwereld. De telefoon is in de stad **de enige lichtbron**.
5. **Woorden die klappen.** Statuswoorden ("STRESS", "DEATHBLOW", "VIRTUOUS") verschijnen groot in een schreefletter, met een kleine overshoot en drift.
   - **Wij:** op de vier keerpunten één woord: **WAKKER.** · **SPRING.** · **GEBROKEN.** (de zonde) · **+1**.
6. **Het "moment van de waarheid".** Als in DD een held op het randje staat, stopt het spel en trilt de figuur. Een trom slaat, het scherm wordt donker, en dan volgt het oordeel: *Afflicted* in rood, of *Virtuous* in wit en goud, groot in beeld.
   - **Wij:** dit is precies onze **transformatie** (scène 10): het beeld stopt, er klinkt een trom, en dan volgt het oordeel. De deugd die hij kiest verschijnt groot, in wit-goud, met een korte stem: "**IJVER.**"
7. **Zijwaarts reizen met diepte.** De gangen in DD zijn een zijwaarts scrollend decor met 4–5 lagen en een loopcyclus, met voorgrond die snel voorbijschuift.
   - **Wij:** in scène 7 en 12 loopt hij zijwaarts, en de **voetstappen vallen op het ritme van zijn loop**.
8. **De verteller.** Een oude, zware stem met plechtige, korte zinnen, spaarzaam ingezet ("Ruin has come to our family.").
   - **Wij:** een Nederlandse verteller in die toon, níet als reclamestem.
9. **Effecten.** Bloed- en inktspetters, vonken, en een **impact-frame** (één frame alleen wit silhouet op zwart). Dikke, rafelige inktlijnen en gravure-arcering; alles voelt oud en versleten.
10. **Tempo.** "Onze trailers zijn langer en trager; ze brengen gevoel over in plaats van functie" (Bourassa). **Niet haasten.** Elke scène krijgt de tijd van haar zin.

---

## 5. Het regieboek: scène voor scène (versie 3)

> **Bijgewerkt na de feedback op de animatic:**
> - Roken is het middelpunt (niet de telefoon).
> - Het verhaal speelt in de stad (geen bos).
> - De accountability mirror: hij ziet wie hij nu is, kiest één post-it om vandaag aan te pakken, scheurt hem af, en ziet wie hij kan worden.
> - Het doel van het verhaal: alleen met zijn gedachten kunnen zijn, zonder pijn.
> - Er komen geen woorden meer in beeld die je al ziet ("WAKKER.").
> - De val is traag.
> - De camera beweegt naar wat de verteller op dat moment noemt.
> - **De stem is Daan zelf, in de ik-vorm**, en alleen zijn binnenstem: geen beschrijving van wat je ziet of wat hij voelt. Omgeving en emotie komen uit beeld, geluid en stilte. (Daardoor nog maar ±50 s stem; de rest is geluid.)
>
> De exacte data staat in `src/animatic/script.ts`, de zinnen in `src/animatic/vo.json`, en de beelden in [ILLUSTRATIES-VERHAAL.md](ILLUSTRATIES-VERHAAL.md).

> **Nieuw: [REGIEBOEK-V3.md](REGIEBOEK-V3.md)** is nu leidend (cold open bij Noors deur, twee stemmen, de prijs bij de deur, Noors melodie). De tabel hieronder is de vorige versie.

| # | Scène (Santioni-rol) | Wat je ziet | Wat de camera doet (op de tekst) | Interactie |
|---|---|---|---|---|
| — | Titel (Intro) | Regen, rook, "PLUSONE · het verhaal van Daan" | — | — |
| 0 | De steeg (Wander) | De stad van boven, dan de steeg; Daan op de stoep met het pakje; close-ups van zijn handen en van de peuken in een plas | Duikt van de daken de steeg in ("een stad die nooit slaapt") en zakt naar hem ("zit een man"), dan naar zijn handen ("zoeken het pakje") | — |
| 1 | Het gezicht (Profile) | Zijn gezicht onder de capuchon; de foto van Noor achter het folie | Zoomt in op de foto ("Noor. Mijn dochter."), dan weg ("Ik kijk niet.") | — |
| 2 | De drang (Approach) | Sigaret tussen de lippen, aansteker, trillende vingers, zijn moeë ogen | Eén lange, trage push-in naar de sigaret; de hartslag versnelt | — |
| 3 | De aansteker (Near) | Duim op het wieltje, vonken; klein: de telefoon licht op in zijn jas, op het scherm "+1 · Dag één. Als je wilt." | Geen stem: klikken, vonken, zijn hart; zoomt in op de melding | — |
| 4 | De vlam (Hand) | De vlam springt aan onder zijn lippen ("Eén maar."); hij trekt de sigaret weg ("Niet vandaag.") | — | **Houd vast & trek weg:** eenmaal weg blijft hij weg, en je scrolt verder |
| 5 | Het breken (Target) | Hij staat in één ruk op (pose-sprong) en verpulvert het pakje | Impact van Darkest Dungeon op "breekt" | — |
| 6 | De val (Transition) | Inkt druipt traag over de steeg; de rook wordt een draaikolk; hij valt achterover; zwart, stilte, licht | Traag inzoomen in de draaikolk, over 4 schermhoogtes | — |
| 7 | Ontwaken (Cathedral) | Door zijn ogen: de berg; hij staat op (pose-sprong) en loopt de trappen op. Bovenaan de berg staat de spiegel | Eerst het licht, dan de berg, dan kantelt hij omhoog naar de spiegel op de top ("Ik wil niet kijken.") | — |
| 8 | De spiegel (Eyes Open) | Over zijn schouder, dan zijn ogen, dan het glas: zijn spiegelbeeld zoals hij nú is. Drie post-its slaan op het glas en worden met de hand beschreven: zijn drie waarheden | Push-in naar het glas; elke post-it met een tik van plakband | — |
| 9 | De keuze (Drink Selection) | Dezelfde drie post-its, nu met *Vandaag niet roken* · *Vandaag geen porno* · *Vandaag iets doen voor een ander* | Gekozen: dat blaadje komt naar voren met een krijtcirkel, de andere doven; de schijf zegt "GEKOZEN" | **Kies één** (verandert zin 15) |
| 10 | Afscheuren (Drink Pour) | Close-up: zijn hand scheurt de post-it van het glas | — | **Houd vast & scheur af:** 3 s, net als in de app |
| 11 | De visie (Anti-Gravity) | Zuil van licht; hij verandert van onder naar boven in wie hij kan worden; in de spiegel staat die man al | Moment van de waarheid: trom, "DAG ÉÉN." | **Houd vast:** 6 s opstijgen |
| 12 | De muren breken (Pillar Crumble) | De muren van de steeg scheuren open; erachter de berg | Geen stem: een klap, dan steen en gerommel | — |
| 13 | Stilte (het doel) | Op de top, na zonsopgang: hij zit alleen, ogen dicht, handen open. Alleen met zijn gedachten, en het doet geen pijn | Bijna stil, alleen zijn adem | — |
| 14 | Noor (nieuw) | De ochtend na de regen, terug in de steeg. Hij staat rechtop voor haar deur en klopt. De deur gaat open: Noor. Haar ogen. "Hoi, Noor." Hij knielt, zij rent in zijn armen; haar hand in zijn bokshand | Push-in naar de deur; na het kloppen zijn blik op haar; daarna rust | **Klop aan:** drie keer tikken |
| 15 | Titel-drop (Colosseum) | "PLUSONE" over de berg | — | — |
| 16–20 | Merk | Kijk · Kies · Klim; jouw spiegel (post-its afscheuren in de app); de app; installeren; slotzin | — | — |

**Breed scherm (desktop):** elk paneel heeft een eigen indeling (`d` in `script.ts`). Het verhaal vult de hele breedte. De tekstkaders staan als kolom links, de close-ups naast het hoofdbeeld in plaats van eronder.

## 6. De interacties: regels

1. **Vier gebaren**, op dezelfde plekken als bij Santioni (Hand, Keuze, Schenken/Kijken, Zweven). Niet meer.
2. **Ze blokkeren het scrollen niet.** De scène staat vast over haar scrollbereik, en scrollen speelt haar af.
   - **Vasthouden geeft het volle moment:**
     - je eigen hand in beeld;
     - de geluiden en de stijgende toon;
     - een DD-impact;
     - bij de keuze: een vertelstem die past bij wat jij koos.
   - **Wie toch blokkeren wil** (de wens "gebaren die iets kosten"): zet het per scène aan met `gate: true`. **Advies: alleen bij scène 9** (de spiegel), het moment waarop hij eerlijk kijkt.
3. **De cursor is de uitleg.** Op desktop vervangt een ronde schijf (64 px, wit, met zwarte rand) de muis in een interactieve scène, met twee regels kleine kapitalen erin. Op mobiel staat de schijf midden-onder en pulseert hij zacht.
4. **Tijdens het vasthouden** krimpt de schijf naar 0,85, en een ring om de schijf heen vult zich.
5. **Geen straf.** Loslaten veert terug (1 s bij schenken, 3 s bij zweven).
6. **Toegankelijkheid:** de spatiebalk = vasthouden. Bij "minder beweging" wordt elk gebaar één knop, en scrollen speelt alles af.

---

## 7. Stijlbijbel

- **Lijn:** gravure en inkt, zoals de bestaande art (Doré × Darkest Dungeon). Dikke, rafelige contouren en arcering in plaats van grijsverloop.
- **Kleur:**
  - zwart en papierwit;
  - **één accentkleur per wereld**: rood in de stad en het portaal, het licht van de berg in de droomwereld;
  - de deugdkleur **alleen** op de jas en de deugd-titel.
- **Panelen:**
  - 6 px zwarte rand met een levende inktrand (shader of SVG-filter: turbulentie, 0,6 px uitslag, 12 fps);
  - de witruimte tussen panelen is papier;
  - inzet-panelen werpen een harde schaduw van 6 px naar rechtsonder, zonder blur.
- **Tekstkaders:**
  - wit, met een zwarte rand van 2 px;
  - **Inter 600, 12–13 px, kapitalen, letterspatiëring 0,04 em**;
  - het gesproken woord in **rood #B3261E**.
  - Ze staan altijd boven- of onderaan in het paneel, nooit over een gezicht.
- **Titels:** Marcellus (zoals de app); de deugd- en klapwoorden in Marcellus met een kleine overshoot (schaal 0,92 → 1,04 → 1, in 0,35 s).
- **Beweging:**
  - **figuren:** pose-to-pose, met ademen tussendoor;
  - **camera:** zwaar en traag (lerp 0,08), kantelend met je scrollsnelheid;
  - **klappen:** hard in (0,12 s), zacht uit (0,45 s).
- **Lussen:** regen, adem en wind lopen op een maat van 12 s; zo zie je nooit een naad.

---

## 8. Techniek

- **Plaats:** `verhaal.html` in deze repo. Het bestaande skelet (`src/verhaal/`) wordt grotendeels **herschreven**.
- **Stapel:**
  - **PixiJS v8** (WebGL), met canvas 2D als terugval;
  - **GSAP + ScrollTrigger** voor vastgezette scènes met een eigen voortgang (`pin: true`, `scrub`);
  - **Lenis** (lerp 0,08 op desktop, `syncTouch` op mobiel);
  - **spine-pixi** voor de cut-out rigs (zoals Darkest Dungeon). Spine Essential kost een eenmalige licentie (zie Open vragen). Terugval: een eigen rig met botten in Pixi-containers.
- **Shaders:**
  - inktrand (panelen);
  - druipovergang (scène 6);
  - intekenen (titel en laden);
  - rimpeling (scène 4);
  - damp (scène 9);
  - windlijnen langs curves.
- **De camera kantelt** met de scrollsnelheid (formule in §3.2).
- **Vertelstem en karaoke:** per zin een audiobestand plus tijdcodes per woord (ElevenLabs "with timestamps", of later forced alignment op de echte opname), in `public/verhaal/vo/{n}.mp3` en `timestamps.json`.
  - Het tekstkader krijgt per woord een `<span>`; het actieve woord wordt rood.
  - Zonder geluid volgt de markering de scrollvoortgang van de scène.
- **Muziek:** 4–5 stems die op de scrollvoortgang overvloeien (Howler of de Web Audio API). Plus de losse geluiden, en voetstappen gekoppeld aan het frame van de loopcyclus.
- **Laden:** de opening en scène 0–2 vóór de poort; de rest per scène in de achtergrond, steeds twee scènes vooruit.
- **Echte tekst:** alle vertelzinnen ook als HTML, voor schermlezers en zoekmachines.
- **Budget:**
  - 60 fps op een iPhone 12;
  - eerste beeld binnen 2,5 s op 4G;
  - beelden samen onder 15 MB;
  - geluid samen onder 6 MB.

---

## 9. Beelden: wat er moet komen

> Bestaand (`art/bron`): de achtergronden van kust, woud, inferno, terrassen en paradiso; de figuren `karakter-schim`, `-verdwaalde`, `-balans`, `-klimmer` en `-ideaal`; `item-handspiegel`, `item-telefoon`, `item-drankfles`, `item-brief`, `item-raaf-*`, `item-lantaarn`, de medaillons en de `rig-*`-taferelen; de effecten.
> **Nieuw** (maken volgens `docs/ART-PIPELINE.md`, dezelfde man, dezelfde gravurestijl). Een figuur die geanimeerd wordt, levert ook een **gelaagd PSD** aan met losse delen voor de rig: romp, hoofd, armen, kap of haar, mantelpanden.

| # | Bestand | Scène | Omschrijving |
|---|---|---|---|
| 1 | `verhaal-steeg-{1-4}` | 0, 11 | Nachtelijke steeg in regen, 4 lagen; het portiek op laag 3 |
| 2 | `daan-portiek` (rig) | 0 | Daan zittend, onderuit, capuchon op |
| 3 | `daan-gezicht-kap` | 0 | Close-up van zijn gezicht in de kap, ogen half dicht |
| 4 | `inzet-fles-kraslot-plas` | 0 | Lege fles en kraslot in een plas |
| 5 | `daan-profiel` (rig: hoofd en haar los) | 1 | Groot zijprofiel zonder kap |
| 6 | `inzet-bokshandschoen` | 1 | Handschoen met gescheurde veter |
| 7 | `inzet-foto-meisje` | 1 | Verfrommelde foto |
| 8 | `daan-schouder-telefoon` | 2 | Over de schouder: een groot gebarsten scherm met een leeg rond vlak |
| 9 | `inzet-aanmaning` | 2 | Doorweekte envelop, "D. de Vries" |
| 10 | `daan-jas-wind` (rig) | 3 | De jas die over de rand waait |
| 11 | `inzet-duim` | 3, 4 | Zijn duim van dichtbij |
| 12 | `daan-silhouet-rond` | 5 | Silhouet voor een cirkel |
| 13 | `daan-val` (3 poses) | 6 | Vallend, armen gespreid |
| 14 | `daan-ogen` (2 standen: dicht en open) | 7, 10 | Panoramisch: alleen de ogen |
| 15 | `daan-loop` (rig of 8 frames) | 7, 12 | Zijwaarts lopend, op de rug |
| 16 | `sokkel-spiegel` | 7, 8 | Sokkel met spiegel in de verte en dichtbij |
| 17 | `zegel-{traagheid,vraatzucht,woede}` | 8 | Drie medaillons (bestaand kan, met barst-variant) |
| 18 | `hand-spiegel-damp` | 9 | Hand met spiegel van dichtbij; het glas apart |
| 19 | `daan-zweven` (rig) | 10 | Zwevend, armen gespreid, jas omhoog; los jas-masker voor de kleurwipe |
| 20 | `puin-{1-6}` | 11, 12 | Losse stukken muur |

---

## 10. Geluid en stem

| Deel | Muziek | Geluid |
|---|---|---|
| Opening en scène 0–1 | Eén lage cello, een drone | Regen in twee lagen, een lantaarn die zoemt, een raaf |
| Scène 2–3 | Alles valt weg tot een hartslag; het zoemen is een synth-toon | Gemompel van een stad, ver weg |
| Scène 4–6 | Riser, sub drop, **1 s stilte** | Rimpelen van vloeistof, een droge klap |
| Scène 7–10 | Strijkers en een zacht koor dat per scène een laag erbij krijgt | Voetstappen op steen, zegels die rinkelen, glas, papier dat scheurt, een trom (moment van de waarheid) |
| Scène 11–12 | Het hoofdthema in volle orkestratie | Steen dat breekt, puin dat wegvliegt |
| Merkdelen | Het thema, zacht, in een lus | Een UI-tik |

- **De verteller:** een Nederlandse mannenstem van 55 jaar of ouder, laag en plechtig, de toon van Wayne June (DD), nooit een reclamestem.
  - Eerst met ElevenLabs (voor timing en de karaoke), daarna **opnieuw ingesproken** door een echte stemacteur.
- **Mix:** onder de vertelstem zakt de muziek 6 dB (ducking). De luidheid blijft onder −14 LUFS.
- **Rechten:** alles nieuw gecomponeerd, of een licentie bewaard in `docs/`.

---

## 11. Bouwvolgorde (zo voorkomen we versie 1 opnieuw)

1. **Animatic eerst (1 dag):**
   - grijze stand-in-panelen voor alle scènes;
   - de echte vertelstem (ElevenLabs);
   - de echte scrollafstanden.
   - Doorlopen op een telefoon, en **de pacing goedkeuren vóór er één beeld getekend wordt.**
2. **Verticale plak: opening + scène 0–2** in eindkwaliteit:
   - panelen en inzetten;
   - inktrand en tekstkaders met karaoke;
   - rig en ademen;
   - camera-kanteling en geluid.
   - **Goedkeuren op gevoel.**
3. **Scène 3–6:** de duim-interactie, de impact en de druipovergang.
4. **Scène 7–12:** keuze, spiegel, transformatie en titel-drop.
5. **Merkdelen 13–17.**
6. **Afwerking:** minder beweging, toegankelijkheid, laden en meten.

## 12. Klaar als

- [ ] De animatic is goedgekeurd op pacing: totaal 3–4 minuten, met elke scène ten minste zo lang als haar zin.
- [ ] Na scène 2 weet de bezoeker **wie Daan is** en wil hij weten wat er op het scherm staat.
- [ ] Elke scène heeft een hoofdpaneel, ten minste één inzet of reactieshot, beweging in de figuur (adem of wind) én in de camera.
- [ ] De vier interacties werken met muis, vinger en spatiebalk. Bij de keuze verandert de vertelstem.
- [ ] Zonder geluid volgt de karaoke de scroll en is het verhaal compleet.
- [ ] 60 fps op een iPhone 12, en "minder beweging" werkt.
- [ ] De afsluiting leidt in drie tikken naar een geïnstalleerde app.

## Open vragen

1. **Naam en verleden:** is "Daan, 34, ex-bokser, vader van Noor" goed, of wordt het iemand anders?
2. **Stem:** ElevenLabs alleen als tijdelijke stem, of ook in de definitieve versie?
3. **Spine:** de licentie kopen (Essential), of de rigs zelf bouwen in Pixi? Spine is sneller en beter.
4. **Gebaren:** zoals Santioni (niet blokkerend), of alleen de spiegel (scène 9) blokkerend?
5. **Beelden:** de 20 nieuwe beelden (§9) zelf maken in ChatGPT volgens `ART-PIPELINE.md`, of zal ik de prompts per beeld uitschrijven?
