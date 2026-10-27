// De zeven hoofdzonden als morele as. Volgorde = de terrassen van Dantes Purgatorio, van onder naar boven.
// Alle illustraties: Gustave Doré (1832–1883), publiek domein, via Wikimedia Commons.
// Lokaal gebundeld in public/dore/ — opnieuw ophalen met scripts/fetch-dore.sh.

export type SinId = 'pride' | 'envy' | 'wrath' | 'sloth' | 'greed' | 'gluttony' | 'lust'

export const dore = (slug: string) => `${import.meta.env.BASE_URL}dore/${slug}.jpg`

export interface SinMeta {
  id: SinId
  numeral: string
  sin: string
  sinLatin: string
  virtue: string
  virtueLatin: string
  /** Eén zin: wat deze zonde is. */
  sinDef: string
  sinLine: string
  virtueLine: string
  sinImg: string
  virtueImg: string
  /** Waar het onderwerp van de plaat staat (object-position), zodat een smalle uitsnede het verhaal houdt. */
  sinPos: string
  virtuePos: string
}

export const SINS: SinMeta[] = [
  {
    id: 'pride',
    numeral: 'I',
    sin: 'Hoogmoed',
    sinLatin: 'Superbia',
    virtue: 'Nederigheid',
    virtueLatin: 'Humilitas',
    sinDef: 'Hoogmoed is denken dat je het al weet, en daardoor geen hulp of feedback toelaten.',
    sinLine: 'Denken dat je het al weet. Geen hulp vragen, geen feedback toelaten.',
    virtueLine: 'Leerbaar blijven. De spiegel eerlijk laten spreken.',
    sinImg: dore('pride'),
    sinPos: '50% 45%',
    virtueImg: dore('humility'),
    virtuePos: '50% 50%',
  },
  {
    id: 'envy',
    numeral: 'II',
    sin: 'Afgunst',
    sinLatin: 'Invidia',
    virtue: 'Welwillendheid',
    virtueLatin: 'Humanitas',
    sinDef: 'Afgunst is je leven meten aan dat van een ander, met vergelijken, roddelen en klagen.',
    sinLine: 'Je leven meten aan dat van een ander. Vergelijken, roddelen, klagen.',
    virtueLine: 'Dankbaar zijn voor wat je hebt. Anderen oprecht iets gunnen.',
    sinImg: dore('envy'),
    sinPos: '30% 62%',
    virtueImg: dore('kindness'),
    virtuePos: '45% 55%',
  },
  {
    id: 'wrath',
    numeral: 'III',
    sin: 'Toorn',
    sinLatin: 'Ira',
    virtue: 'Geduld',
    virtueLatin: 'Patientia',
    sinDef: 'Toorn is reageren voordat je nadenkt, zodat je woede jou bestuurt.',
    sinLine: 'Reageren voordat je nadenkt. Woede die jou bestuurt.',
    virtueLine: 'Ruimte tussen prikkel en reactie. Kalmte als kracht.',
    sinImg: dore('wrath'),
    sinPos: '45% 32%',
    virtueImg: dore('patience'),
    virtuePos: '50% 45%',
  },
  {
    id: 'sloth',
    numeral: 'IV',
    sin: 'Traagheid',
    sinLatin: 'Acedia',
    virtue: 'IJver',
    virtueLatin: 'Industria',
    sinDef: 'Traagheid is het makkelijke pad kiezen: snoozen, scrollen en uitstellen tot het te laat is.',
    sinLine: 'Het makkelijke pad. Snoozen, scrollen, uitstellen tot het te laat is.',
    virtueLine: 'Het zware ding eerst doen. Je lichaam en geest eelt geven.',
    sinImg: dore('forest'),
    sinPos: '50% 55%',
    virtueImg: dore('ladder'),
    virtuePos: '50% 40%',
  },
  {
    id: 'greed',
    numeral: 'V',
    sin: 'Hebzucht',
    sinLatin: 'Avaritia',
    virtue: 'Vrijgevigheid',
    virtueLatin: 'Caritas',
    sinDef: 'Hebzucht is altijd meer willen, zoals met gokken, impulsaankopen en de snelle winst.',
    sinLine: 'Altijd meer willen. Gokken, impulsaankopen, de snelle winst.',
    virtueLine: 'Genoeg hebben. Geven, sparen, bouwen voor de lange termijn.',
    sinImg: dore('greed'),
    sinPos: '50% 40%',
    virtueImg: dore('charity'),
    virtuePos: '50% 35%',
  },
  {
    id: 'gluttony',
    numeral: 'VI',
    sin: 'Vraatzucht',
    sinLatin: 'Gula',
    virtue: 'Matigheid',
    virtueLatin: 'Temperantia',
    sinDef: 'Vraatzucht is je lichaam vullen om iets niet te voelen, met suiker, nicotine of alcohol.',
    sinLine: 'Je lichaam vullen om iets niet te voelen. Suiker, nicotine, alcohol.',
    virtueLine: 'Je lichaam voeden, niet verdoven. Grenzen die je zelf kiest.',
    sinImg: dore('gluttony'),
    sinPos: '50% 55%',
    virtueImg: dore('temperance'),
    virtuePos: '30% 58%',
  },
  {
    id: 'lust',
    numeral: 'VII',
    sin: 'Lust',
    sinLatin: 'Luxuria',
    virtue: 'Zuiverheid',
    virtueLatin: 'Castitas',
    sinDef: 'Lust is dopamine zonder verbinding, een storm die je meesleurt.',
    sinLine: 'Dopamine zonder verbinding. De storm die je meesleurt.',
    virtueLine: 'Je energie richten. Echte nabijheid boven het scherm.',
    sinImg: dore('lust'),
    sinPos: '78% 30%',
    virtueImg: dore('rose'),
    virtuePos: '50% 50%',
  },
]

export const SIN_BY_ID = Object.fromEntries(SINS.map((s) => [s.id, s])) as Record<SinId, SinMeta>

export const IMG = {
  forest: dore('forest'),
  virgil: dore('virgil'),
  boat: dore('boat'),
  gate: dore('gate'),
  shore: dore('shore'),
  lucifer: dore('lucifer'),
  ninth: dore('ninth'),
  rose: dore('rose'),
  ladder: dore('ladder'),
  // De reis van de ridder (Doré, Histoire des croisades) en de schaduw (Paradise Lost)
  haunted: dore('foulque'),
  climb: dore('taurus'),
  knight: dore('george'),
  shadow: dore('satan'),
  oath: dore('oath'),
  blessing: dore('benediction'),
}

export type SceneId = 'inferno' | 'woud' | 'kust' | 'terrassen' | 'paradiso'

export interface Stage {
  min: number
  plate: string
  name: string
  scene: SceneId
  /** De plek waar je bent: elke toestand heeft zijn eigen scène. */
  place: string
  realm: 'Inferno' | 'Purgatorio' | 'Paradiso'
  line: string
  img: string
}

// Vijf toestanden, vijf scènes. Grenzen op de balans van -100 tot +100.
export const STAGES: Stage[] = [
  { min: -101, plate: 'I', name: 'De Schim', scene: 'inferno', place: 'Inferno', realm: 'Inferno', line: 'Opgejaagd door je eigen schaduwen. Dit ben jij niet. Dit is wat er overblijft als je het opgeeft.', img: IMG.haunted },
  { min: -60, plate: 'II', name: 'De Verdwaalde', scene: 'woud', place: 'Het donkere woud', realm: 'Inferno', line: 'Je weet de weg nog. Eén goede dag en je ziet het licht weer.', img: IMG.forest },
  { min: -20, plate: 'III', name: 'De Gemiddelde', scene: 'kust', place: 'De kust van de berg', realm: 'Purgatorio', line: 'Comfortabel, aan de voet van de berg. Hier blijven de meesten staan. Jij niet.', img: IMG.shore },
  { min: 20, plate: 'IV', name: 'De Klimmer', scene: 'terrassen', place: 'De terrassen', realm: 'Purgatorio', line: 'Je lichaam volgt je keuzes. Blijf klimmen.', img: IMG.climb },
  { min: 60, plate: 'V', name: 'Je Ideale Zelf', scene: 'paradiso', place: 'Paradiso', realm: 'Paradiso', line: 'Je bent er. En je bent nooit klaar.', img: IMG.knight },
]

export const stageFor = (balance: number): Stage => {
  let s = STAGES[0]
  for (const st of STAGES) if (balance >= st.min) s = st
  return s
}
