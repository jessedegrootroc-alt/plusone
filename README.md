# PlusOne

Elke dag één keuze. Omhoog of omlaag.

Je wereld verandert langzaam mee met je gewoontes, in vijf Doré-platen: van **De Schim** (Foulque Nerra, opgejaagd door zijn schaduwen) via **jij, in balans** naar **je ideale zelf**, de hemelse ridder. Het morele kompas zijn de zeven hoofdzonden en hun deugden: de terrassen van Dantes louteringsberg, met illustraties van Gustave Doré (publiek domein).

```bash
npm install
npm run dev
```

Voorbeelddata om de transformatie te zien: open `/?demo=good`, `/?demo=bad` of `/?demo=mixed`. Dit overschrijft je lokale data.

## Opbouw

| Scherm | Doel |
| --- | --- |
| **Onboarding** (9 stappen) | Intro → hoe het werkt → naam en *waarom* → schaduw (verleidingen per zonde) → licht (deugden per deugd) → **grote stenen eerst** (elke deugd groot, middel of klein) → ideale zelf bouwen → doelen per kenmerk → contract (vasthouden om te tekenen) |
| **Spiegel** (home) | Avatar, plaat (I–VII), de rode lijn, de pot, afvinken per steengrootte, stenen voor vandaag, Spiegelmoment, Drang-knop |
| **Kompas** | Radar van de 7 zonden en deugden, je zwakste terras, koers over 30 dagen, Doré-plaat per terras |
| **Zelf** | Nu tegenover ideaal, doelen, waarom, koektrommel, gewoontes beheren, de reis bekijken |

## Ontwerpkeuzes

**Zo weinig mogelijk klikken**
- Verleidingen staan standaard op *vrij*. Je tikt er alleen op als je toegaf.
- Deugden: één tik op de rij. Hoeveelheden: tik op de rij = +1 stap.
- Spiegelmoment: één vraag per scherm met twee grote knoppen. Wat je overdag al afvinkte wordt overgeslagen. Ook hoeveelheden zijn één tik ("Doel gehaald" / "Eronder gebleven"). Op desktop werken de pijltjestoetsen.
- "Alles klopt zo, sluit de dag af" als snelste route.

**Psychologie**
- *Langzaam en eerlijk*: de balans is een voortschrijdend gemiddelde (α = 0,15). Eén slechte dag maakt je geen Schim, en één goede dag maakt je niet ideaal.
- *Geen ochtendstraf*: een open dag beweegt alleen naar rato van wat je al invulde, en trekt je alleen omlaag als je echt toegaf.
- *Een terugval is geen identiteit*: na een misstap volgt geen schaamte maar "Mis het nooit twee keer".
- *De streak telt eerlijkheid, niet perfectie*: hij telt de dagen dat je gespiegeld hebt.
- *Identiteit boven doelen*: het ideale zelf is het anker, en elk kenmerk hangt aan een concreet, meetbaar doel.
- *Als-dan-plannen* per gewoonte.
- *Het Drang-moment*: geen timer maar een korte route in 8 tikken. Je meet hoe sterk de drang is (1–10), benoemt de behoefte eronder (verveling, stress, eenzaam …), herkent de gedachte van De Schim en krijgt er een eerlijk antwoord op (defusie, ACT). Daarna speel je de film door met je eigen eerdere gevoelens na toegeven of doorstaan (Brewer), surf je 90 seconden de golf (Marlatt, Bowen), meet je opnieuw en kies je een actie die bij de behoefte past (opposite action, DBT). Elk moment wordt bewaard; onder Zelf zie je je patronen.
- *Commitment*: het contract teken je door vast te houden, niet met een losse tik.

**De schaduw (C.G. Jung)**
- De Schim is geen vijand maar je schaduw: wat je wegduwt, wordt sterker. In de scène staat hij achter je en groeit met de misstappen en drang van de afgelopen 7 dagen. Elk schaduwgesprek neemt hem een deel van zijn greep, ook als je viel.
- *Schaduwgesprek*: kies wat je wilt, hoor wat de schaduw eigenlijk zoekt (rust, troost, spanning, grenzen …), zie het "goud" erin en kies een bewuste manier om het te geven. Bij boosheid of jaloezie komt er een projectiestap bij: wat je in de ander ziet, woont ook in jou.
- Dynamisch: na een misstap (melding "Vraag je schaduw"), na toegeven in het Drang-moment, via een terras in het Kompas, of door op je schaduw in de scène te tikken.
- Het Kompas is een *mandala* van het Zelf. Lichte bladen naar buiten tonen wat je leeft, gearceerde bladen naar binnen wat je schaduw vasthoudt. *Evenwicht* meet heelheid, geen perfectie.

**Grote, middelgrote en kleine stenen (Covey)**
- Elke deugd is een steen. De grootte bepaalt hoe zwaar die in je balans weegt (groot = 3, middel = 2, klein = 1).
- De pot op het Spiegel-scherm vult zich: grote stenen liggen onderop, gedane stenen zijn ingekleurd en open stenen zijn een stippellijn.
- *Steen voor vandaag*: eenmalige prioriteiten voor één dag, bijvoorbeeld "offerte afmaken". Ze tellen mee onder IJver.
- In de onboarding sorteer je je deugden. Bij meer dan drie grote stenen krijg je een waarschuwing: als alles groot is, is niets groot.
- Het Spiegelmoment vraagt de grote stenen eerst.

**Goggins (Can't Hurt Me en Never Finished)**: alleen zichtbaar op het moment dat het helpt
- Het Spiegelmoment is de *accountability mirror*: elke avond, eerlijk.
- *Debrief (After Action Report)*: alleen op een slechte dag, drie vragen van één tik (wat ging mis, waar begon het, wat doe je morgen anders). Het plan staat de volgende ochtend onder je scène.
- *Koektrommel*: op een slechte dag laat het Spiegelmoment een eigen overwinning zien in plaats van om een nieuwe te vragen. Doorstane drang komt er automatisch in.
- *De 40%-regel*: tijdens het surfen van een drang een tank met "Nog 60% in de tank".
- *Never Finished*: in Paradiso is de boodschap "Je bent er. En je bent nooit klaar."
- "Het zware ding" als deugd.

## Techniek
Vite, React en TypeScript. Geen backend: alle data staat in `localStorage` op het apparaat. Alle beelden zijn echte Doré-platen (`public/dore/`, `src/components/Plate.tsx`). Het ontwerpsysteem staat bovenaan `src/index.css`: 4-puntsraster, twee lettertypes (Marcellus voor titels en getallen, Inter voor alle tekst), vier groottes (28 · 20 · 16 · 13), drie tekstkleuren en twee gewichten. `python3 scripts/grid-lint.py` controleert of inline stijlen in de schermen zich daaraan houden (`--fix` past het aan). De scorelogica staat in `src/lib/score.ts`.

De 20 Doré-illustraties zitten in de app zelf (`public/dore/`, ±5,6 MB). Ze zijn van Wikimedia Commons gehaald, verkleind tot maximaal 1100 px en gecomprimeerd. Om ze opnieuw op te halen of een plaat te vervangen, pas je de lijst in het script aan en draai je:

```bash
./scripts/fetch-dore.sh
```

**Offline:** in de productiebuild (`npm run build`, daarna `npm run preview`) slaat een service worker (`public/sw.js`) de app, de platen en de lettertypes op, zodat de app zonder internet werkt. In `npm run dev` staat die bewust uit. Hoog `CACHE` in `sw.js` op als je platen vervangt.

"Sméagol" en Gollum zijn IP van Tolkien en de filmstudio's. Daarom heet die toestand hier **De Schim**, en is de figuur zelf getekend.
