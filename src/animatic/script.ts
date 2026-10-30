import compassIco from '../icons/compass.svg?raw'
import mirrorIco from '../icons/mirror.svg?raw'
import mountainIco from '../icons/mountain.svg?raw'

// Het regieboek (docs/BRIEF-VERHAAL.md §5) als data: elke scène met haar scrolllengte, panelen, lagen, zinnen en cues.
// De beelden komen uit docs/ILLUSTRATIES-VERHAAL.md (public/verhaal/art/…). Ontbreekt er een, dan toont het paneel
// wat er straks komt te staan. Posities zijn procenten van het beeldkader; `d` is de indeling op een breed scherm.
// `p` is de voortgang binnen een vastgezette scène, 0–1.

/** Wat hij vandaag aanpakt: hij kiest één post-it van de spiegel (zoals de smaak bij Santioni); het verandert de vertelling */
export type Choice = 'rook' | 'porno' | 'buurt'
export const CHOICES: { id: Choice; label: string }[] = [
  { id: 'rook', label: 'Vandaag niet roken' },
  { id: 'porno', label: 'Vandaag geen porno' },
  { id: 'buurt', label: 'Vandaag iets doen voor een ander' },
]
/** Wat de spiegel op zijn glas schrijft: de waarheden die hij al jaren niet hardop zegt (Goggins: accountability mirror).
 *  Eén per keuze, in dezelfde volgorde: wat hij vandaag aanpakt, kiest hij uit wat hij net over zichzelf las. */
export const TRUTHS = ['Ik rook dertig per dag.', 'Ik kijk elke nacht porno tot ik niets meer voel.', 'Ik doe al jaren niets voor een ander.']
/** Waar de drie post-its op het glas zitten (spiegel én keuze, zodat ze blijven waar ze waren): plek %, draaiing, welk getekend blaadje */
export const SPOTS = [
  { x: 30, y: 23, r: -4, s: 2 },
  { x: 70, y: 37, r: 3, s: 3 },
  { x: 33, y: 58, r: 2, s: 1 },
]

/** De bladkleur: nacht vóór de val, licht erna (de omslag van het verhaal, in zwart-wit) */
export type World = 'nacht' | 'zwart' | 'licht'

export type Anim = 'breathe' | 'sway' | 'bob' | 'flicker' | 'tremble' | 'walk' | 'float' | 'spin'
type Rect = [number, number, number, number]
export type Shot = [number, number, number, number] | [number, number, number, number, number]

export interface Layer {
  /** Pad zonder extensie, vanaf /public: verhaal/art/… (nieuw) of art/… (effecten) */
  src: string
  /** cover: vult het paneel · fig: figuur of voorwerp op x/b/h */
  fit?: 'cover' | 'fig'
  /** fig: midden x %, onderkant b %, hoogte h % van het paneel */
  x?: number
  b?: number
  h?: number
  /** fig op een breed scherm: [x, b, h] */
  d?: [number, number, number]
  pos?: string
  depth?: number
  dark?: number
  anim?: Anim
  rot?: number
  op?: number
  /** Alleen zichtbaar tussen p a en b; verschijnt in één klap (pose naar pose, zoals Darkest Dungeon) */
  vis?: [number, number]
  /** Overvloeien: van onzichtbaar naar zichtbaar tussen p a en b */
  fade?: [number, number]
  /** Het beeld dat het wordt: verschijnt van onder naar boven met de interactie */
  reveal?: string
  /** Wordt zichtbaar naarmate de interactie vordert (een getekende eindstand, bv. de sigaret weg) */
  byAct?: boolean
  /** Terugvalbeeld zolang het nieuwe nog niet gemaakt is */
  alt?: string
  /** Breedte gedeeld door hoogte van het beeld (voor pins); standaard 1 */
  aspect?: number
  /** Dingen die óp dit beeld vastzitten, hoe het ook wordt bijgesneden (alleen bij cover) */
  pins?: Pin[]
  role?: 'walker' | 'riser' | 'split-l' | 'split-r' | 'faller'
}

/** Iets op een vaste plek in een beeld: x/y in % van het beeld, w in % van de beeldbreedte.
 *  Tekst (zonder text: de gekozen post-it) zit met het midden op x/y; een beeld staat met de onderkant op y. */
export interface Pin { x: number; y: number; w: number; r?: number; text?: string; kind?: 'note' | 'screen'; src?: string; clip?: string }

export type Fx = 'rain' | 'rain-soft' | 'mist' | 'wind' | 'dust' | 'rays' | 'speed' | 'rings' | 'vig' | 'vig-flicker' | 'beam' | 'sparks' | 'embers'

export interface Panel {
  x: number
  y: number
  w: number
  h: number
  /** De indeling op een breed scherm (desktop) */
  d?: Rect
  kind?: 'main' | 'inset' | 'round' | 'eyes'
  in?: number
  out?: number
  depth?: number
  from?: 'bottom' | 'left' | 'right' | 'top'
  bg?: string
  layers?: Layer[]
  fx?: Fx[]
  /** De camera volgt de vertelling: [p, zoom, x %, y %, kadreren] — waar hij naar kijkt en hoe dichtbij;
   *  kadreren (0–1) schuift dat punt naar het midden van het beeld */
  shots?: Shot[]
  /** Shots op een breed scherm, als het beeld daar anders wordt bijgesneden */
  dshots?: Shot[]
  glow?: { x: number; y: number; r: number; pulse?: boolean; flicker?: boolean }
  /** Oogleden: twee zwarte balken die tussen p a en b uiteengaan (de ogen gaan open) */
  lids?: [number, number]
  /** Post-its op het glas van de spiegel: tekst, plek (%), draaiing en wanneer hij verschijnt (p) */
  postits?: { t: string; x: number; y: number; r: number; s: number; at: number }[]
  /** De keuze: drie post-its op het glas om er één af te scheuren */
  pick?: boolean
  /** Wat dit paneel straks laat zien (staat er zolang de beelden er nog niet zijn) */
  note: string
  role?: 'debris'
  /** Geluid als het paneel binnenkomt: een klik van een aansteker (de montage) */
  sfx?: 'click'
}

export interface Caption {
  /** Sleutel in vo/timings.json; '14' wordt de variant van het gekozen briefje */
  vo: string
  at: number
  to: number
  y: number
  /** De tweede stem: de drang, fluisterend (een eigen tekstkader) */
  who?: 'drang'
}

/** Noors melodie (speeldoos, vals, piano, neuriën), een klik, de melding (twee noten) of even helemaal niets */
export type Sound = { at: number; play: 'melody'; n?: number; mode?: 'box' | 'vals' | 'piano' | 'hum' } | { at: number; play: 'click' | 'motif' }

export type ActKind = 'move' | 'choose' | 'pour' | 'rise' | 'knock'
export interface Act {
  kind: ActKind
  text: string
  touchText?: string
  from: number
  to: number
}

export interface Scene {
  id: string
  name: string
  /** De Santioni-scène waarvan hij de rol overneemt */
  ref: string
  sh: number
  world: World
  panels: Panel[]
  captions: Caption[]
  /** Wat de muziek en het geluid hier doen (staat in de tempo-meter) */
  cue: string
  act?: Act
  word?: { text: string; at: number }
  impact?: number
  shake?: boolean
  title?: { big: string; sub?: string; at?: number }
  fx?: Fx[]
  fall?: boolean
  html?: string
  /** Geluiden op een vast moment (eenmalig, ook terug bij terugscrollen) */
  sounds?: Sound[]
  /** Een rustig moment: het beeld loopt hier nooit sneller dan zoveel seconden per schermhoogte, ook als je snel
   *  scrolt (het speelt dan door tot waar je bent), en scrollen voelt zwaarder. Zonder: zo snel als je scrolt. */
  pace?: number
}

const V = (n: string) => `verhaal/art/${n}`
/** Na de klap van zijn vuist is de wereld in kleur: `naam-kleur`. Zolang die er niet is, toont de speler de zwart-witversie. */
const K = (n: string) => `verhaal/art/${n}-kleur`
const STAD: Layer[] = [
  { src: V('stad-ver'), fit: 'cover', depth: 0.15 },
  { src: V('stad-steeg'), fit: 'cover', depth: 0.4 },
]
const STAD_KLEUR: Layer[] = [
  { src: K('stad-ver'), fit: 'cover', depth: 0.15 },
  { src: K('stad-steeg'), fit: 'cover', depth: 0.4 },
]
const STAD_VOOR: Layer = { src: V('stad-voorgrond'), fit: 'cover', depth: 1.2 }
// De spiegel staat op de top, in de tekening zelf; op een breed scherm blijft die top in beeld
const BERG: Layer[] = [
  { src: K('berg-spiegel'), alt: K('berg-ver'), fit: 'cover', pos: '50% 0%', depth: 0.12 },
  { src: K('berg-midden'), fit: 'cover', depth: 0.4 },
]
const BERG_VOOR: Layer = { src: K('berg-voorgrond'), fit: 'cover', depth: 1.1 }

export const SCENES: Scene[] = [
  {
    // Cold open: het einde vooraf. Zijn knokkels voor een deur in de ochtendzon; het beeld bevriest, de titel
    id: 'deur', name: 'De deur', ref: 'Intro', sh: 1.4, world: 'licht', pace: 3,
    cue: '♪ vogels ver weg · één druppel · zachte hartslag · twee noten speeldoos, afgekapt door de titel',
    title: { big: 'PLUSONE', sub: 'HET VERHAAL VAN DAAN', at: 0.6 },
    sounds: [{ at: 0.1, play: 'melody', n: 2 }],
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.2, bg: '#0b0b0b',
        // Traag induwen en dan stilstaan (bevroren beeld)
        shots: [[0, 1, 50, 50], [0.55, 1.12, 50, 50], [1, 1.12, 50, 50]],
        note: 'Extreme close-up: zijn knokkels vlak voor een houten deur, in laag ochtendlicht van voren',
        layers: [{ src: K('close-klop'), fit: 'cover', anim: 'tremble' }],
      },
    ],
    captions: [{ vo: 'deur', at: 0.08, to: 0.56, y: 88 }],
  },
  {
    id: 'steeg', name: '0 · De steeg', ref: 'Wander', sh: 3.8, world: 'nacht',
    cue: '♪ regen in twee lagen · lantaarn zoemt · cello · de montage: klik na klik, steeds sneller · één valse noot bij het cadeautje',
    sounds: [{ at: 0.84, play: 'melody', n: 1, mode: 'vals' }],
    panels: [
      {
        // Match cut: dezelfde hand als voor de deur, nu 's nachts om het pakje
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', out: 0.16, depth: 0.5, bg: '#050505', fx: ['rain-soft', 'vig'],
        shots: [[0, 1.12, 50, 50], [0.16, 1, 50, 50]],
        note: 'Extreme close-up: trillende vingers om het pakje',
        layers: [{ src: V('close-pakje'), fit: 'cover', anim: 'tremble' }],
      },
      {
        // De camera trekt terug van zijn handen naar de steeg ("ik heb ooit gebokst")
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', in: 0.12, out: 0.42, depth: 0.6, bg: '#050505',
        fx: ['rain', 'mist', 'vig-flicker'], glow: { x: 78, y: 30, r: 34, flicker: true },
        shots: [[0.12, 2.4, 36, 84], [0.34, 1, 50, 55], [0.42, 1, 50, 50]],
        note: 'Nachtelijke steeg in de regen; Daan op de stoep van een portiek, capuchon op, het pakje in zijn handen',
        layers: [...STAD, { src: V('daan-portiek'), fit: 'fig', x: 36, b: 4, h: 50, d: [36, 4, 70], depth: 0.7, anim: 'breathe' }, STAD_VOOR],
      },
      {
        // …en omhoog tot boven de daken: één klein figuurtje (de omgekeerde opening)
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', in: 0.36, depth: 0.3, bg: '#050505', fx: ['rain', 'vig'],
        shots: [[0.36, 2.4, 50, 86], [0.5, 1, 50, 50], [1, 1.06, 50, 55]],
        note: 'De stad van boven, in de regen; diep beneden in de steeg een klein figuur',
        layers: [{ src: V('stad-boven'), fit: 'cover', depth: 0.3, dark: 0.35 }],
      },
      {
        x: 4, y: 8, w: 44, h: 26, d: [4, 10, 28, 38], kind: 'inset', in: 0.5, out: 0.82, from: 'left', depth: 1.2, bg: '#050505', fx: ['vig'], sfx: 'click',
        note: 'Montage: het ritueel, steeds sneller',
        layers: [{ src: V('aansteker-1-vonk'), fit: 'cover', pos: '50% 62%' }],
      },
      {
        x: 52, y: 8, w: 44, h: 26, d: [36, 10, 28, 38], kind: 'inset', in: 0.57, out: 0.82, from: 'right', depth: 1.2, bg: '#050505', fx: ['vig'], sfx: 'click',
        note: 'Montage: het ritueel, steeds sneller',
        layers: [{ src: V('aansteker-2-vlam'), fit: 'cover', pos: '50% 45%' }],
      },
      {
        x: 4, y: 36, w: 44, h: 26, d: [68, 10, 28, 38], kind: 'inset', in: 0.63, out: 0.82, from: 'left', depth: 1.2, bg: '#050505', fx: ['vig'], sfx: 'click',
        note: 'Montage: het ritueel, steeds sneller',
        layers: [{ src: V('close-peuken'), fit: 'cover', pos: '50% 50%' }],
      },
      {
        x: 52, y: 36, w: 44, h: 26, d: [4, 52, 28, 38], kind: 'inset', in: 0.68, out: 0.82, from: 'right', depth: 1.2, bg: '#050505', fx: ['vig'], sfx: 'click',
        note: 'Montage: het ritueel, steeds sneller',
        layers: [{ src: V('close-pakje'), fit: 'cover', pos: '50% 50%' }],
      },
      {
        x: 4, y: 64, w: 44, h: 26, d: [36, 52, 28, 38], kind: 'inset', in: 0.72, out: 0.82, from: 'left', depth: 1.2, bg: '#050505', fx: ['vig'], sfx: 'click',
        note: 'Montage: het ritueel, steeds sneller',
        layers: [{ src: V('aansteker-1-vonk'), fit: 'cover', pos: '50% 18%' }],
      },
      {
        x: 52, y: 64, w: 44, h: 26, d: [68, 52, 28, 38], kind: 'inset', in: 0.75, out: 0.82, from: 'right', depth: 1.2, bg: '#050505', fx: ['vig'], sfx: 'click',
        note: 'Montage: het ritueel, steeds sneller',
        layers: [{ src: V('close-peuken'), fit: 'cover', pos: '30% 70%' }],
      },
      {
        // De gevolgen, zonder dat iemand ze noemt
        x: 10, y: 22, w: 80, h: 42, d: [30, 12, 40, 70], kind: 'inset', in: 0.82, from: 'bottom', depth: 1.4, bg: '#050505', fx: ['rain-soft', 'vig'],
        note: 'Close-up: naast zijn sneaker op de natte stoep een doorweekt verjaardagscadeautje',
        layers: [{ src: V('close-cadeau'), fit: 'cover' }],
      },
    ],
    captions: [
      { vo: '1', at: 0.14, to: 0.4, y: 90 },
      { vo: '2', at: 0.52, to: 0.8, y: 90 },
    ],
  },
  {
    id: 'gezicht', name: '1 · Het gezicht', ref: 'Profile', sh: 2.6, world: 'nacht', pace: 2.4,
    // Haar melodie, helder, tot het pakje dichtklapt
    sounds: [{ at: 0.2, play: 'melody', n: 4 }, { at: 0.62, play: 'click' }],
    cue: '♪ regen dempt · één pianotoon bij de foto',
    panels: [
      {
        x: 0, y: 4, w: 100, h: 58, d: [0, 0, 56, 100], kind: 'main', depth: 0.6, bg: '#050505', fx: ['rain-soft', 'vig'],
        // "Hij kijkt er niet naar" → wegzoomen van zijn ogen, hij wendt zich af
        shots: [[0, 1.05, 50, 45], [0.5, 1.3, 50, 40], [0.75, 1.1, 50, 50]],
        note: 'Close-up van zijn gezicht onder de capuchon, ogen half dicht, regen druipt',
        layers: [{ src: V('close-gezicht'), fit: 'cover', anim: 'breathe' }],
      },
      {
        x: 8, y: 56, w: 64, h: 30, d: [58, 18, 40, 64], kind: 'inset', in: 0.12, out: 0.62, from: 'left', depth: 1.4, bg: '#050505', fx: ['vig'],
        shots: [[0.12, 1, 50, 50], [0.5, 1.25, 50, 42]],
        note: 'Close-up: het open pakje, achter het folie een kreukelige foto van Noor, zijn dochter, die lacht',
        layers: [{ src: V('close-foto'), fit: 'cover' }],
      },
    ],
    captions: [
      { vo: '3', at: 0.2, to: 0.46, y: 90 },
      { vo: '4', at: 0.66, to: 0.98, y: 90 },
    ],
  },
  {
    id: 'drang', name: '2 · De drang', ref: 'Approach', sh: 3.6, world: 'nacht', pace: 3,
    cue: '♪ alles valt weg tot een hartslag die versnelt · de langste adem',
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.5, bg: '#030303', fx: ['rain-soft', 'vig'],
        glow: { x: 44, y: 46, r: 30, pulse: true },
        // De hele zin lang één langzame push-in naar de sigaret tussen zijn lippen
        shots: [[0, 1.1, 46, 60], [1, 2.1, 45, 44]],
        note: 'Daan op de stoep, sigaret tussen de lippen, aansteker in de handen, ogen op de aansteker',
        layers: [...STAD.map((l) => ({ ...l, dark: 0.45 })), { src: V('daan-aansteker'), fit: 'fig', x: 44, b: 4, h: 54, depth: 0.7, anim: 'tremble' }],
      },
      {
        x: -2, y: 8, w: 104, h: 15, d: [0, 5, 100, 20], kind: 'eyes', in: 0.3, out: 0.82, from: 'left', depth: 1.2, bg: '#000',
        note: 'Alleen zijn ogen: moe, bloeddoorlopen, naar beneden',
        layers: [{ src: V('close-ogen-moe'), fit: 'cover', anim: 'tremble' }],
      },
      {
        x: 52, y: 62, w: 44, h: 20, d: [66, 56, 30, 36], kind: 'inset', in: 0.16, out: 0.6, from: 'right', depth: 1.5, bg: '#050505', fx: ['vig'],
        note: 'Close-up: zijn vingers trillen om het pakje',
        layers: [{ src: V('close-pakje'), fit: 'cover', anim: 'tremble' }],
      },
    ],
    sounds: [{ at: 0.42, play: 'melody', n: 5, mode: 'vals' }],
    captions: [
      { vo: 'drang-5a', at: 0.08, to: 0.3, y: 88, who: 'drang' },
      { vo: '5', at: 0.34, to: 0.6, y: 88 },
      { vo: 'drang-5b', at: 0.64, to: 0.96, y: 88, who: 'drang' },
    ],
  },
  {
    id: 'aansteker', name: '3 · De aansteker', ref: 'Near', sh: 2.4, world: 'nacht', shake: true,
    sounds: [{ at: 0.42, play: 'motif' }],
    cue: '♪ klik van het wieltje bij elke vonk · hartslag · dan een zoem in zijn jas',
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 62, 100], kind: 'main', depth: 0.5, bg: '#000', fx: ['sparks', 'vig'],
        shots: [[0, 1.08, 50, 40], [0.3, 1.2, 50, 46], [1, 1.12, 50, 42]],
        note: 'Extreme close-up: sigaret tussen zijn lippen, duim op het wieltje, een regen van vonken, geen vlam',
        layers: [{ src: V('aansteker-1-vonk'), fit: 'cover', pos: '50% 20%' }],
      },
      {
        x: 40, y: 62, w: 56, h: 24, d: [64, 28, 34, 48], kind: 'inset', in: 0.36, from: 'right', depth: 1.4, bg: '#030303', fx: ['vig'],
        glow: { x: 50, y: 46, r: 45, pulse: true },
        shots: [[0.36, 1, 50, 50], [0.62, 1.7, 42, 40]],
        note: 'Close-up: zijn telefoon steekt uit zijn jaszak, het scherm licht op (klein, niet de hoofdzaak)',
        // De melding zelf staat op het scherm; niemand hoeft hem voor te lezen
        layers: [{ src: V('close-melding'), fit: 'cover', anim: 'tremble', pins: [{ x: 42, y: 42, w: 24, r: -5, kind: 'screen', text: '<b>+1</b>Dag één. Als je wilt.' }] }],
      },
    ],
    captions: [],
  },
  {
    id: 'vlam', name: '4 · De vlam', ref: 'Hand', sh: 3.4, world: 'nacht', pace: 2.6,
    cue: '♪ de vlam ruist · hartslag · toon stijgt terwijl je trekt',
    act: { kind: 'move', text: 'HOUD VAST\n& TREK WEG', touchText: 'HOUD VAST\n& SLEEP', from: 0.14, to: 0.92 },
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.2, bg: '#000', fx: ['embers', 'vig'],
        glow: { x: 50, y: 52, r: 46, flicker: true },
        // Drie getekende standen: de vlam vlak bij de sigaret, en (met jouw trek) de sigaret ver weg
        shots: [[0, 1.12, 50, 36], [0.5, 1.22, 50, 32], [1, 1.06, 50, 40]],
        note: 'Extreme close-up: de vlam springt aan, vlak onder de sigaret tussen zijn lippen; met jouw trek houdt hij de sigaret ver weg',
        layers: [
          { src: V('aansteker-2-vlam'), fit: 'cover', pos: '50% 20%' },
          { src: V('aansteker-3-weg'), fit: 'cover', pos: '50% 20%', byAct: true },
        ],
      },
    ],
    captions: [
      { vo: 'drang-8', at: 0.06, to: 0.46, y: 90, who: 'drang' },
      { vo: '9', at: 0.62, to: 0.98, y: 90 },
    ],
  },
  {
    id: 'breken', name: '5 · Het breken', ref: 'Target', sh: 2.2, world: 'nacht', impact: 0.64,
    cue: '♪ één droge klap op “breekt” · dan stilte',
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.5, bg: '#030303', fx: ['rain', 'wind', 'vig'],
        shots: [[0, 1.2, 50, 70], [0.6, 1, 50, 50], [0.66, 1.15, 50, 30], [1, 1.1, 50, 35]],
        note: 'Daan staat in één ruk op en verpulvert het pakje in zijn geheven vuist',
        // Op de klap (0.64, achter de witte flits) springt alles naar kleur: de eerste kleur van het verhaal
        layers: [
          ...STAD.map((l) => ({ ...l, dark: 0.3, vis: [-1, 0.64] as [number, number] })),
          ...STAD_KLEUR.map((l) => ({ ...l, dark: 0.2, vis: [0.64, 2] as [number, number] })),
          { src: K('daan-breken'), fit: 'fig', x: 50, b: 2, h: 76, depth: 0.7, vis: [0.64, 2] },
          { src: V('daan-aansteker'), fit: 'fig', x: 44, b: 2, h: 56, depth: 0.7, vis: [-1, 0.64], anim: 'tremble' },
        ],
      },
      {
        x: 54, y: 10, w: 40, h: 0, d: [62, 12, 28, 0], kind: 'round', in: 0.64, from: 'top', depth: 1.4, bg: '#000', fx: ['sparks'],
        note: 'Close-up: de vuist die het pakje kapotknijpt, tabak en vonken spatten eruit',
        layers: [{ src: K('close-vuist'), fit: 'cover' }],
      },
    ],
    captions: [],
  },
  {
    id: 'val', name: '6 · De val', ref: 'Transition', sh: 4, world: 'zwart', pace: 3.5, fall: true,
    cue: '♪ de rook zuigt alles weg: riser → sub drop → stilte → licht',
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.3, bg: '#000',
        shots: [[0, 1, 50, 50], [0.8, 1.35, 50, 50]],
        note: 'Een draaikolk van sigarettenrook die in het zwart verdwijnt; Daan valt er achterover in, armen gespreid',
        layers: [
          // Eerst nog de steeg en Daan met zijn vuist; de inkt druipt eroverheen
          ...STAD_KLEUR.map((l) => ({ ...l, dark: 0.2, vis: [-1, 0.44] as [number, number] })),
          { src: K('daan-breken'), fit: 'fig', x: 50, b: 2, h: 76, depth: 0.7, vis: [-1, 0.44] },
          { src: K('rook-val'), fit: 'cover', anim: 'spin', depth: 0.2, fade: [0.36, 0.56] },
          { src: K('daan-val'), fit: 'fig', x: 50, b: 30, h: 46, d: [50, 28, 52], depth: 0.6, role: 'faller' },
        ],
      },
    ],
    captions: [],
  },
  {
    id: 'ontwaken', name: '7 · Ontwaken', ref: 'Cathedral', sh: 4, world: 'licht', pace: 2.4,
    cue: '♪ stilte, dan strijkers en een zacht koor · voetstappen op steen',
    panels: [
      {
        // Je kijkt door zijn ogen (de overgang is zijn ogen die opengaan): het licht, de berg ("een berg"),
        // dan de spiegel ("een spiegel, zo hoog als een deur")
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.3, bg: '#d8d3c7', fx: ['rays', 'dust'],
        // Aan het eind kantelt de camera omhoog naar de top: daar staat de spiegel
        shots: [[0, 1.3, 50, 35], [0.45, 1, 50, 55], [0.7, 1, 50, 55, 0], [1, 2.3, 75, 16, 0.35]],
        dshots: [[0, 1.3, 50, 35], [0.45, 1, 50, 55], [0.7, 1, 50, 55, 0], [1, 2, 58, 13.5, 0.33]],
        note: 'De voet van een enorme berg boven de wolken; Daan staat op en loopt naar een spiegel, zo hoog als een deur',
        layers: [
          ...BERG,
          BERG_VOOR,
          { src: K('daan-ontwaken'), fit: 'fig', x: 40, b: 6, h: 22, d: [38, 6, 34], depth: 0.7, vis: [0.3, 0.56] },
          { src: K('daan-lopen'), fit: 'fig', x: 18, b: 4, h: 40, d: [26, 4, 52], depth: 0.7, vis: [0.56, 2], anim: 'walk', role: 'walker' },
        ],
      },
    ],
    captions: [],
  },
  {
    id: 'spiegel', name: '8 · De spiegel', ref: 'Eyes Open', sh: 4.2, world: 'licht', pace: 3.2, impact: 0.48,
    cue: '♪ de muziek valt helemaal weg · wind en zijn adem · een klap als hij terugkijkt · bij elke post-it plakband',
    panels: [
      {
        // Over zijn schouder → zijn ogen → zijn spiegelbeeld → hij kijkt weg (de camera drijft mee) → hij kijkt terug
        x: 0, y: 0, w: 100, h: 100, d: [22, 0, 56, 100], kind: 'main', depth: 0.3, bg: '#151413', fx: ['dust', 'vig'],
        shots: [[0, 1.05, 50, 50], [0.3, 1.12, 50, 42], [0.36, 1.12, 50, 42], [0.45, 1.3, 10, 46], [0.5, 1.12, 50, 42], [1, 1.2, 50, 40]],
        note: 'De spiegel van voren; in het glas zijn spiegelbeeld zoals hij nu is. Daan staat er met zijn rug naar ons voor, kijkt weg, en dan toch',
        postits: TRUTHS.map((t, i) => ({ t, ...SPOTS[i], at: 0.58 + i * 0.1 })),
        layers: [
          { src: K('spiegel-leeg'), fit: 'cover' },
          { src: K('spiegel-nu'), fit: 'cover', fade: [0.22, 0.36] },
          { src: K('daan-spiegel'), fit: 'fig', x: 50, b: -8, h: 66, d: [50, -8, 76], depth: 0.8, anim: 'breathe', vis: [-1, 0.22] },
          { src: K('daan-wegkijken'), fit: 'fig', x: 50, b: -8, h: 66, d: [50, -8, 76], depth: 0.8, anim: 'tremble', vis: [0.36, 0.48] },
          { src: K('daan-spiegel'), fit: 'fig', x: 50, b: -8, h: 66, d: [50, -8, 76], depth: 0.8, anim: 'breathe', vis: [0.48, 0.56] },
        ],
      },
      {
        x: -2, y: 6, w: 104, h: 15, d: [-2, 8, 104, 20], kind: 'eyes', in: 0.12, out: 0.3, depth: 1.2, bg: '#000',
        note: 'Alleen zijn ogen, wijd open: hij kijkt',
        layers: [{ src: K('close-ogen-open'), fit: 'cover' }],
      },
    ],
    captions: [
      { vo: 'drang-12', at: 0.37, to: 0.48, y: 88, who: 'drang' },
      { vo: '13', at: 0.6, to: 0.98, y: 88 },
    ],
  },
  {
    id: 'keuze', name: '9 · De keuze', ref: 'Drink Selection', sh: 2.6, world: 'licht',
    cue: '♪ één lange toon · papier bij aanraken',
    act: { kind: 'choose', text: 'KIES\nÉÉN', from: 0.15, to: 0.98 },
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [22, 0, 56, 100], kind: 'main', depth: 0.3, bg: '#151413', fx: ['dust', 'vig'],
        shots: [[0, 1.2, 50, 40], [1, 1.32, 50, 40]],
        note: 'Dezelfde spiegel, nu met drie post-its op het glas: wat hij vandaag aanpakt',
        pick: true,
        layers: [{ src: K('spiegel-nu'), fit: 'cover' }],
      },
    ],
    captions: [
      { vo: 'drang-14', at: 0.04, to: 0.36, y: 88, who: 'drang' },
      { vo: '14', at: 0.4, to: 0.98, y: 88 },
    ],
  },
  {
    id: 'scheur', name: '10 · Afscheuren', ref: 'Drink Pour', sh: 3, world: 'licht',
    cue: '♪ papier rekt · bij het scheuren een klap en stilte',
    act: { kind: 'pour', text: 'HOUD VAST\n& SCHEUR AF', from: 0.1, to: 0.95 },
    panels: [
      {
        // Zoals in de app: een post-it haal je eraf door hem vast te houden
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.3, bg: '#111', fx: ['vig'],
        shots: [[0, 1.05, 50, 50], [1, 1.2, 50, 46]],
        note: 'Close-up: zijn hand pakt de post-it op het glas vast, en scheurt hem af',
        layers: [
          { src: K('scheur-1'), fit: 'cover', pins: [{ x: 44, y: 51, w: 19, r: 3 }] },
          { src: K('scheur-2'), fit: 'cover', byAct: true },
        ],
      },
    ],
    captions: [],
  },
  {
    id: 'visie', name: '11 · De visie', ref: 'Anti-Gravity', sh: 3.8, world: 'licht',
    cue: '♪ lichtbundel zwelt · trom = moment van de waarheid · koor in majeur',
    act: { kind: 'rise', text: 'HOUD VAST', from: 0.18, to: 0.92 },
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.2, bg: '#000', fx: ['rays', 'beam', 'dust'],
        shots: [[0, 1, 50, 50], [0.5, 1.1, 42, 50], [1, 1.05, 50, 50]],
        note: 'Een zuil van licht; Daan zweeft erin en verandert van onder naar boven in de man die hij kan zijn',
        layers: [
          { src: K('berg-licht'), fit: 'cover', depth: 0.15 },
          { src: K('daan-licht'), fit: 'fig', x: 44, b: 10, h: 62, d: [40, 6, 66], depth: 0.6, anim: 'float', reveal: K('daan-best'), role: 'riser' },
        ],
      },
      {
        x: 58, y: 8, w: 38, h: 30, d: [70, 10, 26, 56], kind: 'inset', in: 0.1, from: 'right', depth: 1.3, bg: '#111', fx: ['vig'],
        note: 'In de spiegel: de man die hij kan worden',
        layers: [{ src: K('spiegel-straks'), fit: 'cover' }],
      },
    ],
    captions: [
      { vo: '15', at: 0.06, to: 0.64, y: 88 },
    ],
  },
  {
    id: 'muren', name: '12 · De muren breken', ref: 'Pillar Crumble', sh: 2.6, world: 'licht', impact: 0.12,
    cue: '♪ steen breekt · puin vliegt weg · thema bouwt op',
    panels: [
      {
        x: 0, y: 6, w: 100, h: 70, d: [0, 0, 100, 100], kind: 'main', depth: 0.4, bg: '#d9d4c8', fx: ['dust'],
        shots: [[0, 1.2, 50, 50], [0.7, 1, 50, 50]],
        note: 'De muren van de steeg staan om hem heen en scheuren open; erachter de berg',
        layers: [
          { src: K('berg-ver'), fit: 'cover', depth: 0.15 },
          { src: K('stad-breekt'), fit: 'cover', depth: 0.5, role: 'split-l' },
          { src: K('stad-breekt'), fit: 'cover', depth: 0.5, role: 'split-r' },
          { src: K('daan-best'), fit: 'fig', x: 50, b: 4, h: 52, d: [50, 2, 74], depth: 0.7, anim: 'breathe' },
        ],
      },
    ],
    captions: [],
  },
  {
    id: 'stilte', name: '13 · Stilte', ref: 'Colosseum', sh: 3.4, world: 'licht', pace: 4,
    cue: '♪ bijna niets: wind, één lang aangehouden akkoord, zijn adem',
    panels: [
      {
        // Het doel van alles: alleen met zijn gedachten kunnen zijn, zonder pijn. Niets beweegt behalve zijn adem.
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.2, bg: '#e3ded2',
        shots: [[0, 1.12, 34, 60], [1, 1, 40, 55]],
        note: 'De top van de berg, net na zonsopgang, stil; Daan zit alleen op een platte steen, ogen dicht, handen open, in vrede',
        layers: [
          { src: K('berg-top'), fit: 'cover', depth: 0.1 },
          { src: K('daan-stil'), fit: 'fig', x: 32, b: 24, h: 26, d: [30, 22, 38], depth: 0.4, anim: 'breathe' },
        ],
      },
    ],
    sounds: [{ at: 0.3, play: 'melody', n: 6, mode: 'piano' }],
    captions: [{ vo: '17', at: 0.12, to: 0.96, y: 8 }],
  },
  {
    // Hij is goed genoeg om haar weer te zien. Bij de deur komt de drang nog één keer terug (de prijs); dan klopt hij
    id: 'noor', name: '14 · Noor', ref: 'Reunion', sh: 5, world: 'licht', pace: 2.8,
    cue: '♪ ochtend: druppels, één vogel · zijn hart · drie kloppen · stilte als de deur opengaat · zij neuriet de melodie, de laatste noot valt',
    act: { kind: 'knock', text: 'KLOP\nAAN', touchText: 'TIK\nDRIE KEER', from: 0.42, to: 0.58 },
    sounds: [{ at: 0.72, play: 'melody', mode: 'hum' }],
    panels: [
      {
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.3, bg: '#d9d4c8', fx: ['dust'],
        shots: [[0, 1.12, 50, 45], [0.28, 1.2, 56, 42], [0.3, 1.04, 50, 50], [0.42, 1.08, 50, 50], [0.58, 1.04, 50, 45], [0.8, 1.12, 50, 42], [1, 1, 50, 50]],
        note: 'De steeg in de ochtend; Daan rechtop voor haar deur met het cadeautje. Zijn hand in zijn jaszak vindt de post-it. Zijn knokkels voor het hout. De deur gaat open: Noor. Hij knielt, zij rent in zijn armen',
        layers: [
          { src: K('stad-ochtend'), fit: 'cover', depth: 0.2, vis: [-1, 0.8] },
          { src: K('daan-deur'), fit: 'fig', x: 60, b: 2, h: 66, d: [60, 0, 84], depth: 0.6, anim: 'breathe', vis: [-1, 0.3] },
          // De prijs: zijn hand zoekt het pakje en vindt de post-it
          { src: K('close-jaszak'), fit: 'cover', anim: 'tremble', vis: [0.3, 0.42] },
          // Het beeld van de opening: nu klop jij
          { src: K('close-klop'), fit: 'cover', vis: [0.42, 0.8] },
          // Wat hij ziet als de deur opengaat: zij, op de plek van de foto
          { src: K('deur-open'), fit: 'cover', pos: '50% 15%', depth: 0.3, byAct: true, vis: [0.42, 0.8] },
          { src: K('daan-noor'), fit: 'cover', pos: '42% 50%', depth: 0.3, vis: [0.8, 2], anim: 'breathe' },
        ],
      },
      {
        x: -2, y: 8, w: 104, h: 15, d: [-2, 8, 104, 20], kind: 'eyes', in: 0.6, out: 0.74, depth: 1.2, bg: '#000',
        note: 'Alleen haar ogen, wijd open: ze ziet hem',
        layers: [{ src: K('close-noor-ogen'), fit: 'cover' }],
      },
      {
        x: 50, y: 58, w: 44, h: 22, d: [68, 50, 28, 40], kind: 'inset', in: 0.88, from: 'right', depth: 1.4, bg: '#111', fx: ['vig'],
        note: 'Close-up: haar kleine hand in zijn grote bokshand',
        layers: [{ src: K('close-handen'), fit: 'cover' }],
      },
    ],
    captions: [
      { vo: 'drang-18', at: 0.3, to: 0.42, y: 88, who: 'drang' },
      { vo: '18', at: 0.64, to: 0.8, y: 88 },
    ],
  },
  {
    id: 'titeldrop', name: '15 · Titel-drop', ref: 'Colosseum', sh: 2.2, world: 'licht',
    cue: '♪ hoofdthema, vol orkest',
    title: { big: 'PLUSONE', sub: 'Wat je morgen bent, kies je vandaag', at: 0.05 },
    panels: [
      {
        // De omgekeerde opening: 's nachts één klein figuur van boven, nu twee, in het licht
        x: 0, y: 0, w: 100, h: 100, d: [0, 0, 100, 100], kind: 'main', depth: 0.3, bg: '#d9d4c8', fx: ['rays', 'dust'],
        shots: [[0, 1.6, 50, 70], [1, 1, 50, 50]],
        note: 'De steeg in de ochtend, van hoog boven',
        layers: [{ src: K('stad-ochtend'), fit: 'cover', depth: 0.3 }],
      },
    ],
    captions: [],
  },
  // ── Het merkdeel: dezelfde bouwstenen als de app (kaarten, de spiegel met post-its, de tabbalk, de witte knop) ──
  {
    id: 'ritueel', name: '16 · Zo werkt het', ref: 'Taste', sh: 1.6, world: 'zwart', panels: [], captions: [],
    cue: '♪ thema zacht in een lus',
    html: `<div class="brand"><div class="b-col b-wide">
      <div class="b-head"><p class="b-eyebrow">Zo werkt PlusOne</p><h2 class="b-display">Wees eerlijk nu.<br/>Word wie je bent.</h2></div>
      <div class="b-cards">
        <div class="b-card"><span class="b-ico">${mirrorIco}</span><p class="b-eyebrow">De spiegel</p><h3 class="b-h2">Kijk.</h3><p class="b-lead">Eén waarheid per post-it, zo eerlijk als je durft.</p></div>
        <div class="b-card"><span class="b-ico">${compassIco}</span><p class="b-eyebrow">Het kompas</p><h3 class="b-h2">Kies.</h3><p class="b-lead">Niet alles tegelijk. Eén ding, vandaag.</p></div>
        <div class="b-card"><span class="b-ico">${mountainIco}</span><p class="b-eyebrow">De reis</p><h3 class="b-h2">Klim.</h3><p class="b-lead">Elke dag één trede. Wat je haalt, blijft.</p></div>
      </div>
    </div></div>`,
  },
  {
    id: 'jouwspiegel', name: '17 · Jouw spiegel', ref: 'Collection', sh: 1.6, world: 'zwart', panels: [], captions: [], cue: '♪ thema',
    // Precies het blok uit de app: kop, het prikbord met twee post-its (waarheid, stap, ladder, termijn, vinkje)
    html: `<div class="brand"><div class="b-col">
      <div class="b-section-head"><h2 class="b-h2">De spiegel</h2><span class="b-small">telt elke dag mee</span></div>
      <div class="b-board">
        <div class="b-board-col"><div class="b-note" style="--rot:-1.5deg;--tape:-4deg"><i class="b-tape"></i><p class="b-truth">Ik scroll tot 2 uur 's nachts.</p><p class="b-note-text">Om 23:00 de telefoon in de keuken.</p><div class="b-ladder"><i class="on"></i><i class="on"></i><i></i><i></i><i></i></div><div class="b-note-foot"><span class="b-date">nog 3 dagen</span><span class="b-check"></span></div></div></div>
        <div class="b-board-col"><div class="b-note" style="--rot:1.2deg;--tape:5deg"><i class="b-tape"></i><p class="b-truth">Ik rook dertig per dag.</p><p class="b-note-text">Vandaag niet roken.</p><div class="b-ladder"><i class="on"></i><i></i><i></i><i></i></div><div class="b-note-foot"><span class="b-date">vandaag</span><span class="b-check on"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.4"/></svg></span></div></div></div>
      </div>
      <p class="b-lead b-center">In de app plak je je eigen waarheden op je spiegel. Elke dag scheur je er één af: gedaan, niet gezegd.</p>
    </div></div>`,
  },
  {
    id: 'app', name: '18 · De app', ref: 'Products', sh: 1.4, world: 'zwart', panels: [], captions: [], cue: '♪ thema',
    html: `<div class="brand"><div class="b-col b-center">
      <img class="b-appicon" src="/icons/icon-512.png" alt="" />
      <div class="b-head b-center"><p class="b-eyebrow">De app</p><h2 class="b-display">PlusOne</h2><p class="b-lead">Elke dag één stap beter. In zwart-wit, zonder afleiding.</p></div>
      <nav class="b-tabbar" aria-hidden="true">
        <span class="b-tab on"><span class="b-tab-ico">${mirrorIco}</span>Spiegel</span>
        <span class="b-tab"><span class="b-tab-ico">${compassIco}</span>Kompas</span>
        <span class="b-tab"><span class="b-tab-ico">${mountainIco}</span>Reis</span>
      </nav>
    </div></div>`,
  },
  {
    id: 'installeer', name: '19 · Installeren', ref: 'Retail', sh: 1.4, world: 'zwart', panels: [], captions: [], cue: '♪ thema',
    html: `<div class="brand"><div class="b-col">
      <div class="b-head"><p class="b-eyebrow">Begin vandaag</p><h2 class="b-display">Zet PlusOne op je beginscherm.</h2><p class="b-lead">Het werkt als een app, zonder app store.</p></div>
      <ol class="b-steps">
        <li><span class="b-dot"></span><div><p class="b-step-t">Open de app</p><p class="b-small">Tik hieronder op Begin dag één.</p></div></li>
        <li><span class="b-dot"></span><div><p class="b-step-t">Tik op Deel</p><p class="b-small">Het vierkantje met de pijl omhoog.</p></div></li>
        <li class="now"><span class="b-dot"></span><div><p class="b-step-t">Zet op beginscherm</p><p class="b-small">Daarna staat PlusOne tussen je apps.</p></div></li>
      </ol>
      <a class="b-btn" href="/">Begin dag één</a>
    </div></div>`,
  },
  {
    id: 'footer', name: '20 · Slot', ref: 'Footer', sh: 1, world: 'zwart', panels: [], captions: [], cue: '',
    html: `<div class="brand"><div class="b-col b-center"><img class="b-laurel" src="/art/item-lauwerkrans.webp" alt="" /><p class="b-end">Wat je morgen bent,<br/>kies je vandaag.</p><p class="b-eyebrow">PlusOne</p></div></div>`,
  },
]
