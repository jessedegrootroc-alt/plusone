// Inhoud van het Drang-moment.
// Gebaseerd op: urge surfing (Marlatt, Bowen: Mindfulness-Based Relapse Prevention),
// defusie uit ACT (Hayes), functionele analyse uit CBT (welke behoefte zit eronder?),
// "de film vooruitspoelen" en ontgoocheling via je eigen ervaring (Brewer),
// en opposite action / TIPP uit DBT (Linehan).

export type NeedId = 'bored' | 'stress' | 'lonely' | 'tired' | 'angry' | 'empty' | 'reward' | 'trigger' | 'restless'

export interface Need {
  id: NeedId
  label: string
  /** Wat de drang je eigenlijk belooft te geven. */
  promise: string
  actions: string[]
}

// De behoefte onder de drang. De drang is bijna nooit het echte doel; hij is een snelle, slechte oplossing.
export const NEEDS: Need[] = [
  { id: 'bored', label: 'Verveling', promise: 'prikkels, iets wat gebeurt', actions: ['Zet 10 minuten op de klok en begin aan het zware ding', '20 push-ups, nu, waar je staat', 'Ga 5 minuten naar buiten, zonder telefoon'] },
  { id: 'stress', label: 'Stress of spanning', promise: 'even niet hoeven voelen', actions: ['Fysiologische zucht: 2× kort in door je neus, lang uit door je mond. Drie keer.', 'Koud water over je gezicht, 30 seconden', 'Schrijf in één zin op wat je zorgen geeft'] },
  { id: 'lonely', label: 'Eenzaam', promise: 'verbinding, ergens bij horen', actions: ['Stuur iemand een bericht. Gewoon "hoi, hoe is het?"', 'Bel iemand, al is het maar 2 minuten', 'Ga ergens zitten waar mensen zijn'] },
  { id: 'tired', label: 'Moe', promise: 'rust zonder moeite', actions: ['Leg je telefoon in een andere kamer en ga liggen', 'Drink een groot glas water', '10 minuten ogen dicht, wekker aan'] },
  { id: 'angry', label: 'Boos of gefrustreerd', promise: 'controle terugpakken', actions: ['Laat het eruit: sprint, slagen, 30 squats', 'Schrijf ongecensureerd op wat je voelt en gooi het weg', 'Loop naar buiten en adem 10 keer diep uit'] },
  { id: 'empty', label: 'Leeg of verdrietig', promise: 'iets voelen, of juist niets', actions: ['Schrijf 2 zinnen: wat voel ik echt, en wat heb ik nodig?', 'Zet muziek op die je raakt en luister alleen maar', 'Neem een douche, warm of koud'] },
  { id: 'reward', label: '"Ik heb het verdiend"', promise: 'een beloning', actions: ['Kies een echte beloning: iets wat je morgen nog goed doet', 'Lees je koektrommel: wat heb je al gewonnen?', 'Doe iets kleins voor jezelf: bad, boek, een goede maaltijd'] },
  { id: 'trigger', label: 'Gewoonte: plek, tijd of app', promise: 'het automatische patroon', actions: ['Verander nu van ruimte', 'Blokkeer de app of site voor de rest van vandaag', 'Leg het ding fysiek weg: een andere kamer, een la, de auto'] },
  { id: 'restless', label: 'Onrustig of opgewonden', promise: 'ontlading', actions: ['50 jumping jacks of een rondje rennen', 'Koude douche, 1 minuut', 'Wim Hof: 3 rondes ademen'] },
]

export const NEED_BY_ID = Object.fromEntries(NEEDS.map((n) => [n.id, n])) as Record<NeedId, Need>

/**
 * De stem van de drang. In de app is dat De Schim: hij fluistert, jij hoeft niet te luisteren.
 * Elke zin heeft een eerlijk antwoord. Geen preek: een ander perspectief.
 */
export const VOICES: { says: string; answer: string }[] = [
  { says: 'Eén keer kan geen kwaad.', answer: 'Elke keer was ooit "één keer". Je brein telt niet, het traint.' },
  { says: 'Je hebt het verdiend na vandaag.', answer: 'Je verdient iets wat je morgen nog goed doet. Dit is het niet.' },
  { says: 'Morgen begin je gewoon opnieuw.', answer: 'De jij van morgen heeft het niet makkelijker dan de jij van nu. Begin hier.' },
  { says: 'Het maakt toch niets uit.', answer: 'Het maakt precies zoveel uit als je waarom.' },
  { says: 'Niemand komt het te weten.', answer: 'Jij wel. Jij bent de enige die er altijd bij is.' },
  { says: 'Ik kan dit niet aan zonder.', answer: 'Je zit er nu middenin, en je bent er nog. Je kunt het aan.' },
  { says: 'Even maar, dan stop ik.', answer: 'Kijk naar je eigen geschiedenis: hoe vaak bleef "even" bij even?' },
]

export const AFTER_GAVE_IN = ['Leeg', 'Spijt', 'Moe', 'Beschaamd', 'Opgelucht', 'Niets bijzonders']
export const AFTER_RESISTED = ['Trots', 'Rustig', 'Sterk', 'Nog onrustig', 'Opgelucht']

/** Lichaamsgerichte zinnen tijdens het surfen: aandacht naar het lichaam haalt de kracht uit het verhaal. */
export const SURF_LINES = [
  'Waar zit het? Borst, keel, buik, handen?',
  'Geef het een vorm en een temperatuur. Is het hard, warm, trekkend?',
  'Je hoeft er niets mee te doen. Alleen kijken.',
  'Het is een golf. Hij komt op, piekt, en zakt. Jij blijft staan.',
  'Je bent niet je drang. Jij bent degene die hem ziet.',
  'Je denkt dat je op bent. Je zit op 40%.',
]

/** Verleidingen waarbij professionele hulp er vaak toe doet. */
export const HELP_KEYS = ['gamble', 'alcohol', 'weed', 'smoke', 'vape', 'porn', 'binge', 'lottery']
