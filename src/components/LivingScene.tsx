import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { FeatureId } from '../data/catalog'
import type { ObjectId } from '../data/objects'
import type { SceneId, SinId } from '../data/sins'
import { getMotion } from '../lib/motion'

/**
 * De kust van de berg (balans −20 tot +20), als levende scène in de stijl van Darkest Dungeon.
 *
 * Hoe een motion designer dit opbouwt:
 * - Lagen met diepte. De camera ademt (zoom) en drijft; elke laag beweegt mee naar zijn diepte,
 *   plus parallax op vinger of kanteling. Ver = bijna stil, dichtbij = meer.
 * - Een rig in plaats van frames. Het karakter vervormt in horizontale stroken: de romp rijst
 *   bij het inademen, de borst wordt breder, het gewicht verschuift langzaam van been naar been.
 *   Het hoofd volgt een fractie later (overlap en follow-through); de voeten blijven staan.
 * - Taferelen hebben één bewegend deel. De slinger van Traagheid tikt eindeloos door;
 *   de hamer van IJver doet aanloop, klap, nadreun en herstel, met stof en een flits bij de inslag.
 * - Rust tussen de bewegingen. Knipperen op willekeurige momenten, soms twee keer.
 *   Figuranten (boot, pelgrim) komen langs en verdwijnen weer; de scène is nooit druk.
 * - Licht vertelt het verhaal: links in de schaduw je zonde, rechts in het licht je deugd.
 *   Hoe hoger je balans binnen deze scène, hoe meer licht er van rechts komt.
 *
 * Scènes met eigen achtergrondlagen (kust, terrassen) leggen alle lagen in één kader van 1024 × 1536:
 * de verte, het midden, de grond en de voorgrond vallen zo precies op elkaar, elk met zijn eigen diepte.
 * Op de terrassen staan de taferelen van je twee sterkste deugden; elk heeft één bewegend deel.
 */

const ART = `${import.meta.env.BASE_URL}art/`
const FILES = {
  char: 'karakter-balans', // per scène vervangen, zie CAST
  boat: 'item-boot',
  pil1: 'item-pelgrim-1',
  pil2: 'item-pelgrim-2',
  bell: 'item-kettlebell',
  phone: 'item-telefoon',
  mist: 'effect-mist',
  water: 'effect-water',
  veer: 'effect-veer',
  ijver: 'rig-ijver-basis',
  arm: 'rig-ijver-arm',
  traag: 'rig-traagheid-basis',
  slinger: 'rig-traagheid-slinger',
  far: '../dore/shore', // per scène vervangen, zie CAST
  mid: 'achtergrond-kust-2-midden',
  ground: 'achtergrond-kust-3-grond',
  front: 'achtergrond-kust-4-voorgrond',
  engel: 'item-engel',
  duif1: 'item-duif-omhoog',
  duif2: 'item-duif-omlaag',
  lichtje: 'effect-lichtje',
  matigheidB: 'rig-matigheid-basis',
  matigheidD: 'rig-matigheid-deel',
  nederigheidB: 'rig-nederigheid-basis',
  nederigheidD: 'rig-nederigheid-deel',
  zuiverheidB: 'rig-zuiverheid-basis',
  zuiverheidD: 'rig-zuiverheid-deel',
  welwillendheidB: 'rig-welwillendheid-basis',
  welwillendheidD: 'rig-welwillendheid-deel',
  geduldB: 'rig-geduld-basis',
  vrijgevigheidB: 'rig-vrijgevigheid-basis',
  gloed: 'effect-gloed',
  stralen: 'effect-stralen',
  e_halo: 'item-stralenkrans',
  e_medal: 'item-medaille',
  e_frost: 'item-ijsadem',
  e_flame: 'item-vuur',
  e_sun: 'item-dageraad',
  e_book: 'item-boek',
  e_dumbbell: 'item-halter',
  e_laurel: 'item-lauwerkrans',
  rook: 'effect-rook',
  wervel: 'effect-wervelwind',
  vlam1: 'effect-vlam-1',
  vlam2: 'effect-vlam-2',
  vonk: 'effect-vonk',
  sintel: 'effect-sintel',
  bat1: 'item-vleermuis-omhoog',
  bat2: 'item-vleermuis-omlaag',
  vlieg: 'item-vlieg',
  o_telefoon: 'item-telefoon',
  o_laptop: 'item-laptop',
  o_asbak: 'item-asbak',
  o_vape: 'item-vape',
  o_drankfles: 'item-drankfles',
  o_blikje: 'item-blikje',
  o_fastfood: 'item-fastfood',
  o_snoep: 'item-snoep',
  o_dobbelstenen: 'item-dobbelstenen',
  o_speelkaarten: 'item-speelkaarten',
  o_munten: 'item-munten',
  o_boodschappentas: 'item-boodschappentas',
  o_wekker: 'item-wekker',
  o_controller: 'item-controller',
  o_afstandsbediening: 'item-afstandsbediening',
  'o_gebroken-glas': 'item-gebroken-glas',
  o_brief: 'item-brief',
  s_hoogmoed: 'rig-hoogmoed-basis',
  s_afgunst: 'rig-afgunst-basis',
  s_toorn: 'rig-toorn-basis',
  s_hebzucht: 'rig-hebzucht-basis',
  s_hebzuchtD: 'rig-hebzucht-deel',
  s_vraatzucht: 'rig-vraatzucht-basis',
  s_lust: 'rig-lust-basis',
  leeuw: 'item-leeuw',
  luipaard: 'item-luipaard',
  wolvin: 'item-wolvin',
  raafZit: 'item-raaf-zittend',
  raaf1: 'item-raaf-vleugels-omhoog',
  raaf2: 'item-raaf-vleugels-omlaag',
  mot: 'item-mot',
  ogen: 'effect-ogen',
  regen: 'effect-regen',
  o_tijdschriften: 'item-tijdschriften',
  o_handspiegel: 'item-handspiegel',
  o_kroon: 'item-kroon',
  o_masker: 'item-masker',
  o_kettlebell: 'item-kettlebell',
  o_hardloopschoenen: 'item-hardloopschoenen',
  o_ijsbad: 'item-ijsbad',
  o_saunaemmer: 'item-saunaemmer',
  o_saunastenen: 'item-saunastenen',
  o_boeken: 'item-boeken',
  o_dagboek: 'item-dagboek',
  o_kaars: 'item-kaars',
  o_meditatiekussen: 'item-meditatiekussen',
  o_fruitschaal: 'item-fruitschaal',
  o_waterkruik: 'item-waterkruik',
  o_brood: 'item-brood',
  o_spaarpot: 'item-spaarpot',
  o_lantaarn: 'item-lantaarn',
  o_pelgrimsstaf: 'item-pelgrimsstaf',
} as const
type Key = keyof typeof FILES

/**
 * Wie je bent in elke scène, en hoe die plek voelt. Ogen en telefoon in bronpixels (1024 × 1536).
 * De Schim ademt kort en snel, je ideale zelf diep en traag. De tempelier knippert niet: hij draagt een helm.
 */
interface Cast {
  char: string
  far: string
  /** Een eigen achtergrondlaag (ART-PIPELINE laag 1): waar de horizon in het beeld ligt, 0–1. */
  farHorizon?: number
  /** Eigen lagen in hetzelfde kader als de verte. */
  mid?: string
  ground?: string
  front?: string
  /** Welk deel van het kader bovenaan het beeld staat (0–1). Zonder: zo gekozen dat je voeten op de grond staan. */
  frameTop?: number
  /** Waar het licht vandaan komt, als deel van de breedte. */
  lightX?: number
  /** De voorgrond vóór je karakter (zonder taferelen), in plaats van erachter. */
  frontOver?: boolean
  /** Welke beelden deze scène nog meer nodig heeft. */
  use: Key[]
  size: number
  feet: number
  breath: number
  eye?: number[]
  cheek?: number[]
  phone?: [number, number]
  light: number
  farBright: number
  dark: number
  feathers: boolean
  embers: boolean
}
const CAST: Record<SceneId, Cast> = {
  inferno: { use: ['rook', 'wervel', 'vlam1', 'vlam2', 'vonk', 'sintel', 'bat1', 'bat2', 'vlieg'], char: 'karakter-schim', far: 'achtergrond-inferno-1-ver', farHorizon: 0.557, mid: 'achtergrond-inferno-2-midden', ground: 'achtergrond-inferno-3-grond', front: 'achtergrond-inferno-4-voorgrond', frontOver: true, lightX: 0.5, size: 0.5, feet: 0.987, breath: 2.2, eye: [795, 262, 838, 292], cheek: [800, 300, 830, 310], phone: [700, 560], light: 0.3, farBright: 0.85, dark: 0.8, feathers: false, embers: true },
  woud: { use: ['leeuw', 'luipaard', 'wolvin', 'raafZit', 'raaf1', 'raaf2', 'mot', 'ogen', 'regen'], char: 'karakter-verdwaalde', far: 'achtergrond-woud-1-ver', farHorizon: 0.55, mid: 'achtergrond-woud-2-midden', ground: 'achtergrond-woud-3-grond', front: 'achtergrond-woud-4-voorgrond', lightX: 0.5, size: 0.6, feet: 0.991, breath: 3.4, eye: [738, 184, 763, 199], cheek: [740, 205, 760, 212], phone: [790, 868], light: 0.4, farBright: 0.62, dark: 0.75, feathers: false, embers: false },
  kust: { use: ['boat', 'pil1', 'pil2', 'bell', 'phone', 'water', 'ijver', 'arm', 'traag', 'slinger'], char: 'karakter-balans', far: 'achtergrond-kust-1-ver', farHorizon: 0.64, mid: 'achtergrond-kust-2-midden', ground: 'achtergrond-kust-3-grond', front: 'achtergrond-kust-4-voorgrond', size: 0.62, feet: 0.955, breath: 4.2, eye: [572, 116, 594, 128], cheek: [575, 131, 592, 137], light: 1, farBright: 0.6, dark: 0.75, feathers: true, embers: false },
  terrassen: { use: ['engel', 'duif1', 'duif2', 'lichtje', 'ijver', 'arm', 'matigheidB', 'matigheidD', 'nederigheidB', 'nederigheidD', 'zuiverheidB', 'zuiverheidD', 'welwillendheidB', 'welwillendheidD', 'geduldB', 'vrijgevigheidB'], char: 'karakter-klimmer', far: 'achtergrond-terrassen-1-ver', farHorizon: 0.6, mid: 'achtergrond-terrassen-2-midden', ground: 'achtergrond-terrassen-3-grond', front: 'achtergrond-terrassen-4-voorgrond', frameTop: 0.26, lightX: 0.22, size: 0.6, feet: 0.994, breath: 5, eye: [553, 112, 568, 121], cheek: [555, 124, 567, 130], light: 1.1, farBright: 0.55, dark: 0.6, feathers: true, embers: false },
  paradiso: { use: ['gloed', 'stralen', 'e_laurel', 'e_halo', 'e_medal', 'e_frost', 'e_flame', 'e_sun', 'e_book', 'e_dumbbell'], char: 'karakter-ideaal', far: 'achtergrond-paradiso-1-ver', farHorizon: 0.43, mid: 'achtergrond-paradiso-2-midden', ground: 'achtergrond-paradiso-3-grond', front: 'achtergrond-paradiso-4-voorgrond', frontOver: true, lightX: 0.5, size: 0.62, feet: 0.996, breath: 6, light: 1.2, farBright: 0.78, dark: 0.4, feathers: true, embers: false },
}
// Zondetaferelen (Inferno en het woud): per zonde welke beelden, en het deel dat beweegt
const SIN_KEYS: Record<SinId, Key[]> = {
  pride: ['s_hoogmoed'], envy: ['s_afgunst'], wrath: ['s_toorn'], sloth: ['traag', 'slinger'],
  greed: ['s_hebzucht', 's_hebzuchtD'], gluttony: ['s_vraatzucht'], lust: ['s_lust'],
}

// Je doelen als embleem rond je ideale zelf (Paradiso)
type Emblem = 'e_halo' | 'e_medal' | 'e_frost' | 'e_flame' | 'e_sun' | 'e_book' | 'e_dumbbell' | 'e_laurel'
const EMBLEM: Record<FeatureId, Emblem | null> = { halo: 'e_halo', medal: 'e_medal', frost: 'e_frost', flame: 'e_flame', sun: 'e_sun', book: 'e_book', dumbbell: 'e_dumbbell', abs: 'e_dumbbell', laurel: 'e_laurel' }

const RANGE: Record<SceneId, [number, number]> = { inferno: [-100, -60], woud: [-60, -20], kust: [-20, 20], terrassen: [20, 60], paradiso: [60, 100] }

// Uit public/art/rig.json (scripts/prep-art.py)
const RIG = {
  traag: { size: 627, piece: [466, 169], pivot: [487, 174], remote: [218, 438] },
  ijver: { size: 627, piece: [195, 0], pivot: [209, 94], hit: [470, 176] },
}

// De deugdtaferelen van de terrassen: per zonde de deugd, en het ene deel dat beweegt.
type Tab = 'ijver' | 'matigheid' | 'nederigheid' | 'zuiverheid' | 'welwillendheid' | 'geduld' | 'vrijgevigheid'
const VIRTUE_TAB: Record<SinId, Tab> = { sloth: 'ijver', gluttony: 'matigheid', pride: 'nederigheid', lust: 'zuiverheid', envy: 'welwillendheid', wrath: 'geduld', greed: 'vrijgevigheid' }
const TABS: Record<Exclude<Tab, 'ijver'>, { kind: 'pour' | 'flame' | 'sway' | 'still'; piece?: number[]; pivot?: number[] }> = {
  matigheid: { kind: 'pour', piece: [260, 190, 320, 300] },
  nederigheid: { kind: 'pour', piece: [270, 395, 360, 530] },
  zuiverheid: { kind: 'flame', piece: [145, 0, 215, 85], pivot: [180, 75] },
  welwillendheid: { kind: 'sway', piece: [315, 160, 610, 425], pivot: [330, 195] },
  geduld: { kind: 'still' },
  vrijgevigheid: { kind: 'still' },
}

const TAU = Math.PI * 2
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a))
  return x * x * (3 - 2 * x)
}
const ease = {
  inOut: (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(x)),
  in: (x: number) => clamp(x) ** 3,
  out: (x: number) => 1 - (1 - clamp(x)) ** 3,
}
const rand = (a: number, b: number) => a + Math.random() * (b - a)

// Beelden worden één keer geladen en gedecodeerd en daarna bewaard, zodat de scène bij
// terugkomen (of na het voorladen in App) meteen in het eerste beeld staat.
const keysFor = (cast: Cast, extra: Key[] = []): Key[] => [...extra, 'char', 'far', 'mist', 'veer', ...(cast.mid ? (['mid'] as Key[]) : []), ...(cast.ground ? (['ground'] as Key[]) : []), ...(cast.front ? (['front'] as Key[]) : []), ...cast.use]
const urlFor = (cast: Cast, k: Key) => {
  const file = k === 'char' ? cast.char : k === 'far' ? cast.far : k === 'mid' ? cast.mid! : k === 'ground' ? cast.ground! : k === 'front' ? cast.front! : FILES[k]
  return `${ART}${file}.${k === 'far' && file.startsWith('../dore') ? 'jpg' : 'webp'}`
}
const pending = new Map<string, Promise<HTMLImageElement>>()
const loaded = new Map<string, HTMLImageElement>()
const loadImg = (url: string) => {
  let p = pending.get(url)
  if (!p) {
    p = new Promise<HTMLImageElement>((res, rej) => {
      const im = new Image()
      // decode() kan blijven hangen als de pagina op de achtergrond staat; na 400 ms gaan we toch door
      const ready = () => { loaded.set(url, im); res(im) }
      im.onload = () => Promise.race([im.decode ? im.decode() : Promise.resolve(), new Promise((r) => setTimeout(r, 400))]).catch(() => {}).then(ready)
      im.onerror = rej
      im.src = url
    })
    pending.set(url, p)
  }
  return p
}
const loadAll = (cast: Cast, extra: Key[] = []) =>
  Promise.all(keysFor(cast, extra).map((k) => loadImg(urlFor(cast, k)).then((im) => [k, im] as const))).then((list) => Object.fromEntries(list) as Record<Key, HTMLImageElement>)
const cachedAll = (cast: Cast, extra: Key[] = []) =>
  keysFor(cast, extra).every((k) => loaded.has(urlFor(cast, k))) ? (Object.fromEntries(keysFor(cast, extra).map((k) => [k, loaded.get(urlFor(cast, k))!])) as Record<Key, HTMLImageElement>) : null

/** Laad de beelden van deze scènes alvast, de eerste eerst. */
export const preloadScenes = (scenes: SceneId[]) => {
  scenes.reduce((chain, sc) => chain.then(() => loadAll(CAST[sc]).then(() => undefined, () => undefined)), Promise.resolve())
}

/** Een beeld vooraf donkerder maken (en desgewenst wat zachter, voor diepte). Werkt in elke browser. */
const bake = (im: CanvasImageSource, w: number, h: number, bright: number, soft = 0) => {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  const g = c.getContext('2d')!
  if (soft > 0) {
    const t = document.createElement('canvas')
    t.width = Math.max(1, Math.round(c.width / (1 + soft)))
    t.height = Math.max(1, Math.round(c.height / (1 + soft)))
    t.getContext('2d')!.drawImage(im, 0, 0, t.width, t.height)
    g.imageSmoothingQuality = 'high'
    g.drawImage(t, 0, 0, c.width, c.height)
  } else {
    g.imageSmoothingQuality = 'high'
    g.drawImage(im, 0, 0, c.width, c.height)
  }
  // Zuiver zwart-wit, zoals de rest van de app
  g.globalCompositeOperation = 'saturation'
  g.fillStyle = '#808080'
  g.fillRect(0, 0, c.width, c.height)
  g.globalCompositeOperation = 'destination-in'
  g.drawImage(im, 0, 0, c.width, c.height)
  if (bright < 1) {
    g.globalCompositeOperation = 'source-atop'
    g.fillStyle = `rgba(0,0,0,${1 - bright})`
    g.fillRect(0, 0, c.width, c.height)
  }
  return c
}

interface Particle { x: number; y: number; vx: number; vy: number; s: number; a: number; ph: number; rot: number }

export default function LivingScene({ balance, scene = 'kust', strong, features, objects, virtueObject, weak, still = false }: { balance: number; scene?: SceneId; /** Je twee sterkste deugden (als zonde-id), voor de taferelen op de terrassen. */ strong?: SinId[]; /** Je doelen, als emblemen in Paradiso. */ features?: FeatureId[]; /** De voorwerpen van je verleidingen, sterkste trek eerst. */ objects?: ObjectId[]; /** Het voorwerp van je sterkste goede gewoonte (kust). */ virtueObject?: ObjectId; /** Je twee zwakste terrassen (zonde-id), als tafereel in Inferno en het woud. */ weak?: SinId[]; still?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const kRef = useRef(0.5)
  const pair = (strong?.length ? [...strong, 'sloth', 'envy'] : ['sloth', 'envy']).filter((x, i, a) => a.indexOf(x) === i).slice(0, 2) as SinId[]
  const tabsKey = pair.join(',')
  const sinKey = (weak?.length ? [...weak, 'sloth', 'greed'] : ['sloth', 'greed']).filter((x, i, a) => a.indexOf(x) === i).slice(0, 2).join(',')
  const objKey = (objects?.length ? objects : ['telefoon']).slice(0, 3).join(',')
  const virtueKey = `o_${virtueObject ?? 'kettlebell'}` as Key
  const objKeys = [...objKey.split(',').map((o) => `o_${o}` as Key), ...(scene === 'kust' ? [virtueKey] : []), ...(scene === 'inferno' || scene === 'woud' ? sinKey.split(',').flatMap((x) => SIN_KEYS[x as SinId]) : [])]
  const emblemKey = [...new Set((features ?? []).map((f) => EMBLEM[f]).filter(Boolean))].join(',')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const [lo, hi] = RANGE[scene]
    kRef.current = clamp((balance - lo) / (hi - lo))
  }, [balance, scene])

  // Layout-effect: als de beelden al klaarliggen, staat de scène in het allereerste beeld
  useLayoutEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let raf = 0
    let alive = true
    let visible = true
    let img: Record<Key, HTMLImageElement> | null = null
    const reduce = still || matchMedia('(prefers-reduced-motion: reduce)').matches
    const cast = CAST[scene]
    const kust = scene === 'kust'
    const terr = scene === 'terrassen'
    const para = scene === 'paradiso'
    const inf = scene === 'inferno'
    const woud = scene === 'woud'
    // Zonder gekozen doelen laten we er drie zien, als belofte van wat kan (de lauwerkrans voor discipline voorop)
    const emblems = (emblemKey ? emblemKey.split(',') : ['e_laurel', 'e_medal', 'e_sun']) as Emblem[]
    const tabs = tabsKey.split(',').map((x) => VIRTUE_TAB[x as SinId])
    const RIGE = { eye: cast.eye, cheek: cast.cheek ?? [0, 0, 1, 1], feet: cast.feet }
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0
    let H = 0
    let bakedK = -1

    // Vooraf gebakken lagen, opnieuw bij elke maatwijziging
    let L: null | {
      horizon: number
      frame: { x: number; y: number; w: number; h: number } | null
      mid: HTMLCanvasElement | null
      groundArt: HTMLCanvasElement | null
      front: HTMLCanvasElement | null
      engel: HTMLCanvasElement | null
      duif: [HTMLCanvasElement, HTMLCanvasElement] | null
      tab: Partial<Record<Tab, { base: HTMLCanvasElement; piece?: HTMLCanvasElement }>>
      tsV: number
      emb: HTMLCanvasElement[]
      sins: { id: SinId; base: HTMLCanvasElement; piece?: HTMLCanvasElement }[]
      beasts: HTMLCanvasElement[]
      ravens: [HTMLCanvasElement, HTMLCanvasElement, HTMLCanvasElement] | null
      mot: HTMLCanvasElement | null
      bats: [HTMLCanvasElement, HTMLCanvasElement] | null
      objs: HTMLCanvasElement[]
      good: HTMLCanvasElement | null
      fly: HTMLCanvasElement | null
      ground: HTMLCanvasElement
      char: HTMLCanvasElement
      cw: number
      ch: number
      skin: string
      boat: HTMLCanvasElement
      far: HTMLCanvasElement
      pil: [HTMLCanvasElement, HTMLCanvasElement]
      traag: HTMLCanvasElement
      slinger: HTMLCanvasElement
      ijver: HTMLCanvasElement
      arm: HTMLCanvasElement
      tsT: number
      tsI: number
      bell: HTMLCanvasElement
      phone: HTMLCanvasElement
    } = null

    const layout = () => {
      if (!img) return
      // Nog geen maat (de kaart is net ingeklapt of nog niet getekend): wachten op de ResizeObserver
      if (!c.clientWidth || !c.clientHeight) {
        L = null
        return
      }
      W = c.clientWidth
      H = c.clientHeight
      c.width = Math.round(W * dpr)
      c.height = Math.round(H * dpr)
      // Eén kader voor alle eigen lagen (1024 × 1536), groot genoeg voor de camera die drijft
      let frame: { x: number; y: number; w: number; h: number } | null = null
      if (cast.farHorizon) {
        const fh = Math.max(W * 1.1 * 1.5, H * 1.08)
        const fw = fh / 1.5
        let y = cast.frameTop != null ? -cast.frameTop * fh : H * 0.95 - 0.88 * fh
        y = Math.max(Math.min(y, -H * 0.03), H * 1.03 - fh)
        frame = { x: (W - fw) / 2, y, w: fw, h: fh }
      }
      const horizon = frame ? frame.y + cast.farHorizon! * frame.h : H * 0.42
      const layerArt = (im: HTMLImageElement | undefined, bright: number, soft = 0) => (frame && im ? bake(im, frame.w * dpr, frame.h * dpr, bright, soft) : null)

      // Grond: donker, met gegraveerde horizontale streken
      const ground = document.createElement('canvas')
      ground.width = c.width
      ground.height = c.height
      const g = ground.getContext('2d')!
      g.scale(dpr, dpr)
      const top = H * 0.6
      const gr = g.createLinearGradient(0, top - H * 0.05, 0, H)
      gr.addColorStop(0, 'rgba(10,10,10,0)')
      gr.addColorStop(0.12, 'rgba(12,12,12,1)')
      gr.addColorStop(1, 'rgba(4,4,4,1)')
      g.fillStyle = gr
      g.fillRect(0, top - H * 0.05, W, H)
      // Vaste toevalsreeks: de streken liggen elke keer op dezelfde plek
      let seed = 7
      const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
      for (let i = 0; i < 70; i++) {
        const y = top + Math.pow(r(), 1.6) * (H - top)
        const x = r() * W
        const len = (20 + r() * 70) * (0.6 + (y - top) / (H - top))
        g.strokeStyle = `rgba(242,242,242,${0.03 + r() * 0.06})`
        g.lineWidth = 0.6
        g.beginPath()
        g.moveTo(x, y)
        g.quadraticCurveTo(x + len / 2, y + (r() - 0.5) * 3, x + len, y + (r() - 0.5) * 2)
        g.stroke()
      }

      const ch = H * cast.size
      const cw = ch * (1024 / 1536)
      const char = bake(img.char, cw * dpr, ch * dpr, 1)
      // Huidskleur onder het oog, voor het ooglid bij het knipperen
      const sc = char.width / 1024
      const px = char.getContext('2d')!.getImageData(RIGE.cheek[0] * sc, RIGE.cheek[1] * sc, Math.max(1, (RIGE.cheek[2] - RIGE.cheek[0]) * sc), Math.max(1, (RIGE.cheek[3] - RIGE.cheek[1]) * sc)).data
      let sum = 0
      let n = 0
      for (let i = 0; i < px.length; i += 4) if (px[i + 3] > 200) { sum += px[i]; n++ }
      const v = Math.round(n ? sum / n : 150)
      const skin = `rgb(${v},${v},${v})`

      const bw = W * 0.36
      const boat = !kust ? ground : bake(img.boat, bw * dpr, bw * (img.boat.height / img.boat.width) * dpr, 0.5, 0.6)
      const ph = H * 0.11
      const pil: [HTMLCanvasElement, HTMLCanvasElement] = !kust ? [ground, ground] : [
        bake(img.pil1, ph * (img.pil1.width / img.pil1.height) * dpr, ph * dpr, 0.42, 0.3),
        bake(img.pil2, ph * (img.pil2.width / img.pil2.height) * dpr, ph * dpr, 0.42, 0.3),
      ]
      const tsT = Math.min(W * 0.46, H * 0.34)
      const tsI = Math.min(W * 0.44, H * 0.33)
      const k = kRef.current
      bakedK = k
      const sT = tsT / RIG.traag.size
      const sI = tsI / RIG.ijver.size
      const tB = 0.36 + 0.12 * (1 - k)
      const iB = 0.56 + 0.3 * k
      L = {
        horizon,
        ground,
        char,
        cw,
        ch,
        skin,
        boat,
        far: (() => {
          if (frame) return bake(img.far, frame.w * dpr, frame.h * dpr, cast.farBright, 0.1)
          // Een Doré-plaat als verte vult alles tot de grond
          const ratio = img.far.height / img.far.width
          const fw = Math.max(W * 1.12, (H * 0.78) / ratio)
          return bake(img.far, fw * dpr, fw * ratio * dpr, cast.farBright, 0.2)
        })(),
        frame,
        mid: layerArt(img.mid, inf ? 0.85 : woud ? 0.55 : terr ? 0.62 : 0.5, 0.1),
        groundArt: layerArt(img.ground, woud ? 0.5 : terr ? 0.7 : 0.55),
        front: layerArt(img.front, 0.32),
        engel: terr && frame ? (() => { const eh = frame.h * 0.15; return bake(img.engel, eh * (img.engel.width / img.engel.height) * dpr, eh * dpr, 0.7, 0.2) })() : null,
        duif: terr ? [bake(img.duif1, W * 0.08 * dpr, W * 0.08 * dpr, 0.85), bake(img.duif2, W * 0.08 * dpr, W * 0.08 * dpr, 0.85)] : null,
        tab: (() => {
          if (!terr) return {}
          const ts = Math.min(W * 0.42, H * 0.32)
          const s = ts / 627
          const vb = 0.62 + 0.3 * k
          const out: Partial<Record<Tab, { base: HTMLCanvasElement; piece?: HTMLCanvasElement }>> = {}
          for (const t of tabs) {
            if (t === 'ijver') { out.ijver = { base: bake(img.ijver, ts * dpr, ts * dpr, vb), piece: bake(img.arm, img.arm.width * s * dpr, img.arm.height * s * dpr, vb) }; continue }
            const b = img[`${t}B` as Key]
            const d = TABS[t].piece ? img[`${t}D` as Key] : undefined
            out[t] = { base: bake(b, ts * dpr, ts * dpr, vb), piece: d ? bake(d, d.width * s * dpr, d.height * s * dpr, vb) : undefined }
          }
          return out
        })(),
        tsV: Math.min(W * 0.42, H * 0.32),
        bats: inf ? [bake(img.bat1, W * 0.14 * dpr, W * 0.14 * dpr, 0.7), bake(img.bat2, W * 0.14 * dpr, W * 0.14 * dpr, 0.7)] : null,
        fly: inf ? bake(img.vlieg, W * 0.035 * dpr, W * 0.035 * dpr, 0.9) : null,
        emb: para ? emblems.map((e) => bake(img![e], W * 0.16 * dpr, W * 0.16 * dpr, 1)) : [],
        pil,
        traag: kust ? bake(img.traag, tsT * dpr, tsT * dpr, tB, 0.35) : ground,
        slinger: kust ? bake(img.slinger, img.slinger.width * sT * dpr, img.slinger.height * sT * dpr, tB, 0.35) : ground,
        ijver: kust ? bake(img.ijver, tsI * dpr, tsI * dpr, iB) : ground,
        arm: kust ? bake(img.arm, img.arm.width * sI * dpr, img.arm.height * sI * dpr, iB) : ground,
        tsT,
        tsI,
        bell: kust ? bake(img.bell, W * 0.12 * dpr, W * 0.12 * dpr, 0.8) : ground,
        phone: kust ? bake(img.phone, W * 0.16 * dpr, W * 0.16 * dpr, 0.6) : ground,
        good: kust ? bake(img![virtueKey], W * 0.17 * dpr, W * 0.17 * dpr, 0.85) : null,
        objs: objKeys.filter((k) => k.startsWith('o_') && !(kust && k === virtueKey && !objKey.split(',').includes(k.slice(2)))).map((k) => bake(img![k], W * 0.2 * dpr, W * 0.2 * dpr, inf ? 0.95 : 0.7)),
        sins: inf || woud ? sinKey.split(',').map((id) => {
          const sid = id as SinId
          const ts = Math.min(W * 0.4, H * 0.3)
          const sb = inf ? 0.62 : 0.9
          const soft = woud ? 0.2 : 0.15
          const [b, d] = SIN_KEYS[sid]
          const pc = d ? img![d] : undefined
          const pscale = sid === 'sloth' ? ts / 627 : ts / 627
          return { id: sid, base: bake(img![b], ts * dpr, ts * dpr, sb, soft), piece: pc ? bake(pc, pc.width * pscale * dpr, pc.height * pscale * dpr, sb, soft) : undefined }
        }) : [],
        beasts: woud ? [bake(img!.luipaard, W * 0.3 * dpr, W * 0.3 * dpr, 0.3, 0.3), bake(img!.leeuw, W * 0.3 * dpr, W * 0.3 * dpr, 0.3, 0.3), bake(img!.wolvin, W * 0.3 * dpr, W * 0.3 * dpr, 0.3, 0.3)] : [],
        ravens: woud ? [bake(img!.raafZit, W * 0.12 * dpr, W * 0.12 * dpr, 0.6), bake(img!.raaf1, W * 0.1 * dpr, W * 0.1 * dpr, 0.5), bake(img!.raaf2, W * 0.1 * dpr, W * 0.1 * dpr, 0.5)] : null,
        mot: woud ? bake(img!.mot, W * 0.045 * dpr, W * 0.045 * dpr, 0.95) : null,
      }
    }

    // Deeltjes en figuranten
    const feathers: Particle[] = []
    const chips: Particle[] = []
    const motes: Particle[] = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), vx: rand(0.004, 0.012), vy: rand(-0.006, 0.002), s: rand(0.5, 1.4), a: rand(0.2, 0.7), ph: rand(0, TAU), rot: 0 }))
    const newFeather = (anywhere: boolean): Particle => ({
      x: anywhere ? rand(0, 1) : rand(-0.15, -0.05),
      y: rand(0.25, 0.95),
      vx: rand(0.012, 0.03),
      vy: rand(-0.012, -0.004),
      s: rand(0.05, 0.09),
      a: rand(0.6, 1),
      ph: rand(0, TAU),
      rot: rand(-1, 1),
    })
    let nextBlink = 2.5
    let blinkAt = -10
    let doubleBlink = false
    let lastHit = -10
    let lastHammerCycle = -1
    let start = performance.now()
    let prev = start

    const draw = (now: number) => {
      if (!L || !img) return
      const t = (now - start) / 1000
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      const k = kRef.current
      if (Math.abs(k - bakedK) > 0.04) layout() // het licht op de taferelen volgt je balans
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      // Camera: ademt en drijft, en volgt de stand van je telefoon (of de muis), al gladgestreken in lib/motion
      const m = getMotion()
      const zoom = 1.02 + 0.015 * Math.sin((TAU * t) / 24)
      const camX = Math.sin((TAU * t) / 31) * 4 + m.x * 8
      const camY = Math.sin((TAU * t) / 23) * 2.5 + m.y * 8
      const layer = (depth: number, fn: () => void) => {
        ctx.save()
        ctx.translate(W / 2 - camX * depth, H * 0.62 - camY * depth)
        const z = 1 + (zoom - 1) * (0.3 + depth)
        ctx.scale(z, z)
        ctx.translate(-W / 2, -H * 0.62)
        fn()
        ctx.restore()
      }
      const hz = L.horizon
      const F = L.frame
      // Tekent een laag in het gezamenlijke kader
      const inFrame = (cv: HTMLCanvasElement | null) => { if (F && cv) ctx.drawImage(cv, F.x, F.y, F.w, F.h) }
      // Waar dingen op de grond staan: een deel van de weg van de horizon naar je voeten
      const onGround = (f: number) => hz + (H * 0.97 - hz) * f

      // 1 · Lucht en dageraad: licht van rechtsboven, sterker naarmate je balans stijgt
      layer(0, () => {
        const sky = ctx.createLinearGradient(0, -H * 0.1, 0, hz + 4)
        sky.addColorStop(0, '#040404')
        const sv = Math.round(10 + 28 * Math.min(1, cast.light))
        sky.addColorStop(1, `rgb(${sv},${sv},${sv})`)
        ctx.fillStyle = sky
        ctx.fillRect(-W * 0.1, -H * 0.1, W * 1.2, (kust ? hz : H * 0.7) + H * 0.1 + 4)
        if (F) {
          // Een echte achtergrondlaag, in het kader
          inFrame(L!.far)
        } else {
        // De verte: alleen boven de horizon, zacht weggemengd naar de lucht
        ctx.save()
        ctx.beginPath()
        ctx.rect(-W * 0.1, -H * 0.1, W * 1.2, (kust ? hz : H * 0.7) + H * 0.1 + 2)
        ctx.clip()
        ctx.globalCompositeOperation = 'lighten'
        const fw = L!.far.width / dpr
        const fh = L!.far.height / dpr
        ctx.drawImage(L!.far, (W - fw) / 2, kust ? hz - fh * 0.52 : H * 0.72 - fh, fw, fh)
        ctx.globalCompositeOperation = 'source-over'
        ctx.restore()
        }
        const lx = W * (cast.lightX ?? 0.82)
        const ly = hz * 0.62
        const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, W * 0.9)
        glow.addColorStop(0, `rgba(255,255,255,${(0.16 + 0.22 * k) * cast.light * (cast.farHorizon ? 0.5 : 1)})`)
        glow.addColorStop(0.35, `rgba(255,255,255,${(0.05 + 0.06 * k) * cast.light})`)
        glow.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = glow
        ctx.fillRect(-W * 0.1, -H * 0.1, W * 1.2, H * 1.2)
        // Stralen: ademen traag, schuiven nauwelijks
        ctx.globalCompositeOperation = 'lighter'
        // De getekende laag heeft eigen stralen; dan alleen een zweem erbovenop die ademt
        for (let i = 0; i < 5; i++) {
          const a0 = (lx < W / 2 ? 0.75 : 2.05) + i * 0.13 + Math.sin(t * 0.05 + i) * 0.02
          const alpha = (0.025 + 0.04 * k) * cast.light * (cast.farHorizon ? 0.4 : 1) * (0.6 + 0.4 * Math.sin(t * 0.35 + i * 1.7))
          const len = H * 1.3
          ctx.beginPath()
          ctx.moveTo(lx, ly)
          ctx.lineTo(lx + Math.cos(a0 - 0.035) * len, ly + Math.sin(a0 - 0.035) * len)
          ctx.lineTo(lx + Math.cos(a0 + 0.035) * len, ly + Math.sin(a0 + 0.035) * len)
          ctx.closePath()
          const rg = ctx.createRadialGradient(lx, ly, 0, lx, ly, len)
          rg.addColorStop(0, `rgba(255,255,255,${alpha})`)
          rg.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = rg
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      })

      // 2 · Water: naadloos, twee lagen tegen elkaar in voor de glinstering
      if (kust) layer(0.12, () => {
        const ww = W * 1.5
        const wh = ww * (img!.water.height / img!.water.width)
        const y = hz - wh * 0.38
        ctx.globalCompositeOperation = 'screen'
        for (const [speed, alpha] of [[5, cast.farHorizon ? 0.3 : 0.5], [-3, 0.12 + 0.1 * Math.sin(t * 0.8)]] as const) {
          const off = (((t * speed) % ww) + ww) % ww
          ctx.globalAlpha = alpha
          ctx.drawImage(img!.water, -off - W * 0.2, y, ww, wh)
          ctx.drawImage(img!.water, -off - W * 0.2 + ww, y, ww, wh)
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
        // Het water wordt naar je toe donkerder: de glinstering zit aan de horizon
        const fade = ctx.createLinearGradient(0, hz + H * 0.03, 0, H * 0.64)
        fade.addColorStop(0, 'rgba(6,6,6,0)')
        fade.addColorStop(1, 'rgba(6,6,6,0.92)')
        ctx.fillStyle = fade
        ctx.fillRect(-W * 0.2, hz + H * 0.03, W * 1.4, H * 0.64 - hz)
      })

      // 2b · Het midden: de berg op de kust, de poort op de terrassen
      if (L.mid) layer(0.18, () => {
        inFrame(L!.mid)
        // De engel bij de poort: zit stil, met een gloed die traag ademt
        if (terr && F && L!.engel) {
          const ew = L!.engel.width / dpr
          const eh = L!.engel.height / dpr
          const ex = F.x + F.w * 0.547 - ew / 2
          const ey = F.y + F.h * 0.497 - eh
          const gl = ctx.createRadialGradient(ex + ew / 2, ey + eh * 0.35, 0, ex + ew / 2, ey + eh * 0.35, eh * 0.9)
          gl.addColorStop(0, `rgba(255,255,255,${0.16 + 0.06 * Math.sin(t * 0.9)})`)
          gl.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = gl
          ctx.fillRect(ex - eh, ey - eh * 0.5, ew + eh * 2, eh * 2)
          ctx.globalCompositeOperation = 'source-over'
          ctx.drawImage(L!.engel, ex, ey, ew, eh)
        }
      })

      // 2b' · Inferno: de wervelwind van Dante raast hoog door de lucht, en vleermuizen fladderen langs
      if (inf) layer(0.1, () => {
        const ww = W * 2
        const wh = ww * (img!.wervel.height / img!.wervel.width)
        const off = ((t * 40) % ww + ww) % ww
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = 0.22 + 0.06 * Math.sin(t * 0.7)
        ctx.drawImage(img!.wervel, -off, H * 0.1, ww, wh)
        ctx.drawImage(img!.wervel, -off + ww, H * 0.1, ww, wh)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      })
      if (inf && L.bats) layer(0.3, () => {
        for (const [period, offset, yy, dir] of [[13, 0, 0.2, 1], [17, 6, 0.32, -1]] as const) {
          const tt = (t + offset) % period
          const fly = 6
          if (tt > fly) continue
          const p = tt / fly
          const frame = Math.floor(tt / 0.09) % 2
          const bv = L!.bats![frame]
          const bw = bv.width / dpr
          const x = dir > 0 ? -bw + p * (W + bw * 2) : W + bw - p * (W + bw * 2)
          const y = H * yy + Math.sin(p * TAU * 2.5) * H * 0.03
          ctx.save()
          ctx.globalAlpha = smooth(0, 0.06, p) * (1 - smooth(0.94, 1, p))
          ctx.translate(x, y)
          ctx.scale(dir * (0.8 + 0.2 * Math.sin(p * 9)), 1)
          ctx.drawImage(bv, -bw / 2, -bw / 2, bw, bw)
          ctx.restore()
        }
        ctx.globalAlpha = 1
      })

      // 2c · Duiven vliegen langs het licht, met hun vleugels in twee standen
      if (terr && L.duif) layer(0.28, () => {
        for (const [period, offset, yy, dir] of [[19, 0, 0.16, 1], [27, 9, 0.26, -1]] as const) {
          const tt = (t + offset) % period
          const fly = 11
          if (tt > fly) continue
          const p = tt / fly
          const frame = Math.floor(tt / 0.17) % 2
          const dv = L!.duif![frame]
          const dw = dv.width / dpr
          const x = dir > 0 ? -dw + p * (W + dw * 2) : W + dw - p * (W + dw * 2)
          const y = H * yy + Math.sin(p * TAU * 1.5) * H * 0.02 - (frame ? 1.5 : 0)
          ctx.save()
          ctx.globalAlpha = smooth(0, 0.08, p) * (1 - smooth(0.92, 1, p)) * 0.9
          ctx.translate(x + dw / 2, y)
          ctx.scale(dir, 1)
          ctx.drawImage(dv, -dw / 2, -dw / 2, dw, dw)
          ctx.restore()
        }
        ctx.globalAlpha = 1
      })

      // 3 · De boot met zielen: steekt traag over, deint mee
      if (kust) layer(0.2, () => {
        const cycle = 80
        const p = (t % cycle) / cycle
        const bw = L!.boat.width / dpr
        const bh = L!.boat.height / dpr
        const x = -bw + p * (W + bw * 2)
        const y = hz + H * 0.065 - bh * 0.85 + Math.sin(t * 1.3) * 1.1
        ctx.save()
        ctx.translate(x + bw / 2, y + bh * 0.8)
        ctx.rotate(Math.sin(t * 1.3 + 0.7) * 0.012)
        ctx.globalAlpha = smooth(0, 0.08, p) * (1 - smooth(0.92, 1, p))
        ctx.drawImage(L!.boat, -bw / 2, -bh * 0.8, bw, bh)
        ctx.restore()
        ctx.globalAlpha = 1
      })

      // 4 · De grond
      layer(0.35, () => (L!.groundArt ? inFrame(L!.groundArt) : ctx.drawImage(L!.ground, 0, 0, W, H)))

      // 4a · Inferno: vlammen links en rechts van de trap, twee beelden om en om, met gloed en opstijgende sintels
      if (inf) layer(0.4, () => {
        for (const [fx, ph] of [[0.13, 0], [0.87, 1.7]] as const) {
          const x = W * fx
          const y = onGround(0.3)
          const fl = Math.floor((t + ph) / 0.11) % 2 ? img!.vlam1 : img!.vlam2
          const fw = W * 0.16 * (1 + 0.06 * Math.sin(t * 8 + ph))
          const fh = fw * (fl.height / fl.width) * (1 + 0.1 * Math.sin(t * 6.3 + ph * 2))
          const gl = ctx.createRadialGradient(x, y - fh * 0.3, 0, x, y - fh * 0.3, fw * 1.6)
          gl.addColorStop(0, `rgba(255,255,255,${0.2 + 0.08 * Math.sin(t * 9 + ph)})`)
          gl.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = gl
          ctx.fillRect(x - fw * 1.6, y - fh * 0.3 - fw * 1.6, fw * 3.2, fw * 3.2)
          ctx.globalCompositeOperation = 'screen'
          ctx.drawImage(fl, x - fw / 2, y - fh, fw, fh)
          // sintels en vonken stijgen op uit het vuur
          for (let i = 0; i < 5; i++) {
            const life = 2.6
            const age = ((t + ph * 3 + i * (life / 5)) % life) / life
            const spr = i % 2 ? img!.sintel : img!.vonk
            const sz = W * (0.035 - 0.02 * age)
            const sx = x + Math.sin(age * 7 + i * 2 + ph) * fw * 0.5
            const sy = y - fh * 0.6 - age * H * 0.35
            ctx.globalAlpha = (1 - age) * 0.9
            ctx.drawImage(spr, sx - sz / 2, sy - sz / 2, sz, sz)
          }
          ctx.globalAlpha = 1
        }
        ctx.globalCompositeOperation = 'source-over'
      })

      // 4b · De randen: rotsen en riet, iets naar buiten geschoven zodat ze de taferelen omlijsten in plaats van bedekken
      if (L.front && F && !cast.frontOver) layer(0.45, () => {
        const sc = 1.25
        ctx.drawImage(L!.front!, F.x - (F.w * (sc - 1)) / 2, F.y + F.h * (1 - sc), F.w * sc, F.h * sc)
      })

      // 5 · Een pelgrim loopt langs, achter de taferelen
      if (kust) layer(0.42, () => {
        const cycle = 46
        const tt = t % cycle
        const walk = 24
        if (tt > walk) return
        const step = 0.62
        const phase = (tt / step) % 1
        const frame = Math.floor(tt / step) % 2
        const pc = L!.pil[frame]
        const pw = pc.width / dpr
        const ph = pc.height / dpr
        const x = -pw + (tt / walk) * (W + pw * 2)
        const y = onGround(0.22) - ph - Math.sin(phase * Math.PI) * 1.4
        ctx.globalAlpha = smooth(0, 1.5, tt) * (1 - smooth(walk - 1.5, walk, tt))
        ctx.drawImage(pc, x, y, pw, ph)
        ctx.globalAlpha = 1
      })

      // 6 · Taferelen: links Traagheid in de schaduw, rechts IJver in het licht
      if (kust) layer(0.5, () => {
        const ts = L!.tsT
        const s = ts / RIG.traag.size
        const x0 = -W * 0.04
        const y0 = onGround(0.62) - ts
        ctx.drawImage(L!.traag, x0, y0, ts, ts)
        // De slinger tikt door, als een seconde die je wegschuift
        const [px, py] = RIG.traag.pivot
        const [qx, qy] = RIG.traag.piece
        ctx.save()
        ctx.translate(x0 + px * s, y0 + py * s)
        ctx.rotate(Math.sin((TAU * t) / 2) * 0.13)
        ctx.drawImage(L!.slinger, (qx - px) * s, (qy - py) * s, L!.slinger.width / dpr, L!.slinger.height / dpr)
        ctx.restore()
        // Het koude licht van de afstandsbediening flikkert als een tv
        const [rx, ry] = RIG.traag.remote
        const fl = 0.18 + 0.1 * Math.sin(t * 7.3) * Math.sin(t * 2.1) + 0.06 * Math.sin(t * 13.7)
        const gx = x0 + rx * s
        const gy = y0 + ry * s
        const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, ts * 0.22)
        rg.addColorStop(0, `rgba(255,255,255,${fl})`)
        rg.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = rg
        ctx.fillRect(gx - ts * 0.22, gy - ts * 0.22, ts * 0.44, ts * 0.44)
        ctx.globalCompositeOperation = 'source-over'
      })
      if (kust) layer(0.5, () => {
        const ts = L!.tsI
        const s = ts / RIG.ijver.size
        // Hamer: aanloop (traag omhoog), klap (snel), nadreun, herstel. 2,8 s per slag.
        const T = 2.8
        const cyc = Math.floor(t / T)
        const ph = (t % T) / T
        let ang: number
        if (ph < 0.5) ang = -0.1 * ease.inOut(ph / 0.5)
        else if (ph < 0.56) ang = -0.1 + 0.32 * ease.in((ph - 0.5) / 0.06)
        else if (ph < 0.64) ang = 0.22 - 0.03 * Math.sin(((ph - 0.56) / 0.08) * Math.PI)
        else ang = 0.22 * (1 - ease.out((ph - 0.64) / 0.36))
        const hit = ph >= 0.56 && cyc !== lastHammerCycle
        const x0 = W * 1.03 - ts
        const y0 = onGround(0.6) - ts
        const [hx, hy] = RIG.ijver.hit
        if (hit) {
          lastHammerCycle = cyc
          lastHit = t
          for (let i = 0; i < 7; i++) chips.push({ x: x0 + hx * s, y: y0 + hy * s, vx: rand(-30, 25), vy: rand(-55, -15), s: rand(0.6, 1.5), a: 1, ph: 0, rot: 0 })
        }
        const shake = Math.max(0, 1 - (t - lastHit) / 0.18) * 1.2
        const sx = x0 + (shake ? rand(-shake, shake) : 0)
        const sy = y0 + (shake ? rand(-shake, shake) * 0.5 : 0)
        ctx.drawImage(L!.ijver, sx, sy, ts, ts)
        const [px, py] = RIG.ijver.pivot
        const [qx, qy] = RIG.ijver.piece
        ctx.save()
        ctx.translate(sx + px * s, sy + py * s)
        ctx.rotate(ang)
        ctx.drawImage(L!.arm, (qx - px) * s, (qy - py) * s, L!.arm.width / dpr, L!.arm.height / dpr)
        ctx.restore()
        // Flits bij de inslag
        const f = Math.max(0, 1 - (t - lastHit) / 0.22)
        if (f > 0) {
          const gx = sx + hx * s
          const gy = sy + hy * s
          const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, ts * 0.12)
          rg.addColorStop(0, `rgba(255,255,255,${0.55 * f})`)
          rg.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = rg
          ctx.fillRect(gx - ts * 0.12, gy - ts * 0.12, ts * 0.24, ts * 0.24)
          ctx.globalCompositeOperation = 'source-over'
        }
        // Steengruis valt
        for (const p of chips) {
          p.vy += 140 * dt
          p.x += p.vx * dt
          p.y += p.vy * dt
          p.a -= dt * 1.4
          ctx.fillStyle = `rgba(230,230,230,${clamp(p.a)})`
          ctx.fillRect(p.x, p.y, p.s, p.s)
        }
        for (let i = chips.length - 1; i >= 0; i--) if (chips[i].a <= 0) chips.splice(i, 1)
      })

      // 6b · Terrassen: je twee sterkste deugden, links en rechts, elk met één deel dat beweegt
      if (terr) layer(0.5, () => {
        const ts = L!.tsV
        const s = ts / 627
        tabs.forEach((name, i) => {
          const tb = L!.tab[name]
          if (!tb) return
          const x0 = i === 0 ? -W * 0.05 : W * 1.05 - ts
          const y0 = onGround(0.62) - ts
          if (name === 'ijver') {
            const T = 2.8
            const ph = (t % T) / T
            const ang = ph < 0.5 ? -0.1 * ease.inOut(ph / 0.5) : ph < 0.56 ? -0.1 + 0.32 * ease.in((ph - 0.5) / 0.06) : ph < 0.64 ? 0.22 - 0.03 * Math.sin(((ph - 0.56) / 0.08) * Math.PI) : 0.22 * (1 - ease.out((ph - 0.64) / 0.36))
            ctx.drawImage(tb.base, x0, y0, ts, ts)
            const [px, py] = RIG.ijver.pivot
            const [qx, qy] = RIG.ijver.piece
            ctx.save()
            ctx.translate(x0 + px * s, y0 + py * s)
            ctx.rotate(ang)
            ctx.drawImage(tb.piece!, (qx - px) * s, (qy - py) * s, tb.piece!.width / dpr, tb.piece!.height / dpr)
            ctx.restore()
            return
          }
          const R = TABS[name]
          if (R.kind === 'still') {
            // Geen los deel: het hele tafereel ademt heel licht, vanaf de grond
            const b = 1 + 0.008 * Math.sin((TAU * t) / 5.5 + i)
            ctx.save()
            ctx.translate(x0 + ts / 2, y0 + ts)
            ctx.scale(1, b)
            ctx.drawImage(tb.base, -ts / 2, -ts, ts, ts)
            ctx.restore()
            return
          }
          ctx.drawImage(tb.base, x0, y0, ts, ts)
          const pc = tb.piece!
          const pw = pc.width / dpr
          const pH = pc.height / dpr
          const qx = x0 + R.piece![0] * s
          const qy = y0 + R.piece![1] * s
          if (R.kind === 'pour') {
            // Water dat blijft stromen: het deel licht in golven op, van boven naar beneden
            ctx.drawImage(pc, qx, qy, pw, pH)
            const flow = ((t * 0.9) % 1)
            const g = ctx.createLinearGradient(0, qy, 0, qy + pH)
            for (let j = 0; j < 4; j++) {
              const c0 = (flow + j / 4) % 1
              g.addColorStop(Math.max(0, c0 - 0.06), 'rgba(255,255,255,0)')
              g.addColorStop(c0, 'rgba(255,255,255,0.35)')
              g.addColorStop(Math.min(1, c0 + 0.06), 'rgba(255,255,255,0)')
            }
            ctx.save()
            ctx.globalCompositeOperation = 'lighter'
            ctx.globalAlpha = 0.6
            ctx.beginPath()
            ctx.rect(qx + pw * 0.3, qy, pw * 0.4, pH)
            ctx.clip()
            ctx.fillStyle = g
            ctx.fillRect(qx, qy, pw, pH)
            ctx.restore()
          } else if (R.kind === 'flame') {
            // De vlam flakkert om zijn voet, met een gloed eromheen
            const [px, py] = [x0 + R.pivot![0] * s, y0 + R.pivot![1] * s]
            const sx = 1 + 0.07 * Math.sin(t * 9.1) * Math.sin(t * 2.3)
            const sy = 1 + 0.12 * Math.sin(t * 7.3 + 1) + 0.05 * Math.sin(t * 13.1)
            ctx.save()
            ctx.translate(px, py)
            ctx.rotate(0.04 * Math.sin(t * 3.7))
            ctx.scale(sx, sy)
            ctx.drawImage(pc, qx - px, qy - py, pw, pH)
            ctx.restore()
            const gl = ctx.createRadialGradient(px, py - pH * 0.4, 0, px, py - pH * 0.4, ts * 0.22)
            gl.addColorStop(0, `rgba(255,255,255,${0.28 + 0.08 * Math.sin(t * 8)})`)
            gl.addColorStop(1, 'rgba(255,255,255,0)')
            ctx.globalCompositeOperation = 'lighter'
            ctx.fillStyle = gl
            ctx.fillRect(px - ts * 0.22, py - pH * 0.4 - ts * 0.22, ts * 0.44, ts * 0.44)
            ctx.globalCompositeOperation = 'source-over'
          } else {
            // Een mantel in de wind: zwaait om de schouder, met een tweede, snellere golf erdoor
            const [px, py] = [x0 + R.pivot![0] * s, y0 + R.pivot![1] * s]
            ctx.save()
            ctx.translate(px, py)
            ctx.rotate(0.05 * Math.sin((TAU * t) / 3.4) + 0.015 * Math.sin((TAU * t) / 1.1))
            ctx.drawImage(pc, qx - px, qy - py, pw, pH)
            ctx.restore()
          }
        })
      })

      // 7 · Voorwerpen op de grond: je verleiding links, je deugd rechts
      if (kust) layer(0.7, () => {
        const shadow = (x: number, y: number, rw: number) => {
          const sg = ctx.createRadialGradient(x, y, 0, x, y, rw)
          sg.addColorStop(0, 'rgba(0,0,0,0.65)')
          sg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.save()
          ctx.scale(1, 0.25)
          ctx.fillStyle = sg
          ctx.fillRect(x - rw, y * 4 - rw, rw * 2, rw * 2)
          ctx.restore()
        }
        // Het voorwerp van je sterkste verleiding
        const pw = W * 0.19
        const px = W * 0.03
        const py = H * 0.975 - pw * 0.85
        shadow(px + pw * 0.5, H * 0.965 * 1, pw * 0.55)
        ctx.drawImage(L!.objs[0], px, py, pw, pw)
        // Elke paar seconden licht het op: de verleiding roept
        const ping = Math.max(0, Math.sin((TAU * t) / 7) - 0.86) / 0.14
        const gx = px + pw * 0.48
        const gy = py + pw * 0.45
        const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, pw * 0.7)
        rg.addColorStop(0, `rgba(255,255,255,${0.1 + 0.35 * ping})`)
        rg.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = rg
        ctx.fillRect(gx - pw * 0.7, gy - pw * 0.7, pw * 1.4, pw * 1.4)
        ctx.globalCompositeOperation = 'source-over'
        // Het voorwerp van je sterkste goede gewoonte, rechts in het licht; hoe hoger je balans, hoe meer het oplicht
        const bw = W * 0.17
        const bx = W * 0.8
        shadow(bx + bw * 0.5, H * 0.968, bw * 0.55)
        const halo = ctx.createRadialGradient(bx + bw / 2, H * 0.975 - bw / 2, 0, bx + bw / 2, H * 0.975 - bw / 2, bw * 0.9)
        halo.addColorStop(0, `rgba(255,255,255,${0.05 + 0.15 * k})`)
        halo.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = halo
        ctx.fillRect(bx - bw * 0.4, H * 0.975 - bw * 1.4, bw * 1.8, bw * 1.8)
        ctx.globalCompositeOperation = 'source-over'
        ctx.drawImage(L!.good ?? L!.bell, bx, H * 0.975 - bw, bw, bw)
      })

      // 7a · Het woud: de drie beesten van Dante sluipen om de beurt door het donker, ogen lichten op
      if (woud && L.beasts.length) layer(0.3, () => {
        const cycle = 21
        const i = Math.floor(t / cycle) % 3
        const p = (t % cycle) / cycle
        const bv = L!.beasts[i]
        const bw = bv.width / dpr
        const dir = i % 2 ? -1 : 1
        const x = dir > 0 ? -bw + p * (W + bw * 2) : W + bw - p * (W + bw * 2)
        const y = H * 0.56 - bw * 0.85 + Math.abs(Math.sin(p * TAU * 6)) * -2
        ctx.save()
        ctx.globalAlpha = smooth(0, 0.12, p) * (1 - smooth(0.88, 1, p)) * 0.85
        ctx.translate(x, y)
        ctx.scale(dir, 1)
        ctx.drawImage(bv, -bw / 2, 0, bw, bw)
        ctx.restore()
        ctx.globalAlpha = 1
        // Ogen in het donker: een paar knippert op, op een vaste plek per keer
        const ec = 5.5
        const k2 = Math.floor(t / ec)
        const pe = (t % ec) / ec
        const ex = W * (0.12 + ((k2 * 0.37) % 0.76))
        const ey = H * (0.32 + ((k2 * 0.23) % 0.22))
        const blink = Math.abs(pe - 0.5) < 0.02 ? 0 : 1
        const ea = smooth(0.1, 0.25, pe) * (1 - smooth(0.7, 0.85, pe)) * blink
        if (ea > 0) {
          const ew = W * 0.09
          ctx.globalAlpha = ea * 0.9
          ctx.drawImage(img!.ogen, ex - ew / 2, ey - ew * 0.2, ew, ew * (img!.ogen.height / img!.ogen.width))
          ctx.globalAlpha = 1
        }
      })

      // 7a' · Je twee zwakste terrassen als zondetafereel, links en rechts (Inferno scherp, het woud half in de mist)
      if ((inf || woud) && L.sins.length) layer(0.55, () => {
        const ts = Math.min(W * 0.4, H * 0.3)
        const s = ts / 627
        L!.sins.forEach((sn, i) => {
          const x0 = i === 0 ? -W * 0.06 : W * 1.06 - ts
          const y0 = onGround(inf ? 0.38 : 0.55) - ts
          if (sn.id === 'sloth' && sn.piece) {
            ctx.drawImage(sn.base, x0, y0, ts, ts)
            const [px, py] = RIG.traag.pivot
            const [qx, qy] = RIG.traag.piece
            ctx.save()
            ctx.translate(x0 + px * s, y0 + py * s)
            ctx.rotate(Math.sin((TAU * t) / 2) * 0.13)
            ctx.drawImage(sn.piece, (qx - px) * s, (qy - py) * s, sn.piece.width / dpr, sn.piece.height / dpr)
            ctx.restore()
          } else if (sn.id === 'greed' && sn.piece) {
            // De weegschaal kantelt traag heen en weer: wat je wint, weegt nooit genoeg
            ctx.drawImage(sn.base, x0, y0, ts, ts)
            const [px, py] = [328, 108]
            ctx.save()
            ctx.translate(x0 + px * s, y0 + py * s)
            ctx.rotate(0.035 * Math.sin((TAU * t) / 4.5))
            ctx.drawImage(sn.piece, -px * s, -py * s, ts, ts)
            ctx.restore()
          } else {
            // Geen los deel: het tafereel ademt zwaar, vanaf de grond
            const b = 1 + 0.01 * Math.sin((TAU * t) / 4 + i)
            ctx.save()
            ctx.translate(x0 + ts / 2, y0 + ts)
            ctx.scale(1, b)
            ctx.drawImage(sn.base, -ts / 2, -ts, ts, ts)
            ctx.restore()
          }
        })
      })

      // 7b · Paradiso: gloed en stralen achter je ideale zelf, ademend met zijn ademhaling
      if (para) layer(0.6, () => {
        const breathe = 0.5 + 0.5 * Math.sin((TAU * t) / cast.breath)
        const cx = W * 0.47
        const cy = H * 0.97 - L!.ch * 0.62
        const gs = W * (1.05 + 0.04 * breathe)
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = 0.32 + 0.12 * breathe
        ctx.translate(cx, cy)
        ctx.rotate((t / 120) * TAU)
        ctx.drawImage(img!.gloed, -gs / 2, -gs / 2, gs, gs)
        ctx.restore()
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = 0.28 + 0.1 * Math.sin(t * 0.4)
        const sw = W * 1.1
        ctx.translate(W * 0.5, 0)
        ctx.rotate(-0.35 + 0.02 * Math.sin(t * 0.07))
        ctx.drawImage(img!.stralen, -sw * 0.15, -H * 0.1, sw, sw * 1.5)
        ctx.restore()
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      })

      // 8 · Jij: de rig
      layer(0.76, () => {
        const { char, cw, ch } = L!
        const feetY = H * 0.97
        const x0 = W * 0.47 - cw * 0.5
        const y0 = feetY - ch * RIGE.feet
        // Een lichtpoel op de grond: het enige echt lichte stuk grond, zoals de fakkel in Darkest Dungeon
        ctx.save()
        ctx.scale(1, 0.3)
        const pool = ctx.createRadialGradient(W * 0.5, feetY / 0.3, 0, W * 0.5, feetY / 0.3, W * 0.55)
        pool.addColorStop(0, `rgba(255,255,255,${0.07 + 0.07 * k})`)
        pool.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = pool
        ctx.fillRect(-W * 0.1, feetY / 0.3 - W * 0.6, W * 1.2, W * 1.2)
        ctx.restore()
        // Achterlicht zet je los van de achtergrond, contactschaduw zet je neer
        const bg = ctx.createRadialGradient(W * 0.5, y0 + ch * 0.35, 0, W * 0.5, y0 + ch * 0.35, ch * 0.55)
        bg.addColorStop(0, `rgba(255,255,255,${0.05 + 0.05 * k})`)
        bg.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, W, H)
        ctx.save()
        ctx.scale(1, 0.22)
        const cs = ctx.createRadialGradient(W * 0.47, feetY / 0.22, 0, W * 0.47, feetY / 0.22, cw * 0.55)
        cs.addColorStop(0, 'rgba(0,0,0,0.8)')
        cs.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = cs
        ctx.fillRect(W * 0.47 - cw * 0.6, feetY / 0.22 - cw * 0.6, cw * 1.2, cw * 1.2)
        ctx.restore()

        // Ademhaling (ritme per scène), gewichtsverplaatsing (7,3 s), hoofd een fractie later
        const T = cast.breath
        const breath = (tt: number) => {
          const p = ((tt % T) + T) % T / T
          return p < 0.42 ? ease.inOut(p / 0.42) : 1 - ease.inOut((p - 0.42) / 0.58)
        }
        const sway = (tt: number) => Math.sin((TAU * tt) / 7.3) * 0.8 + Math.sin((TAU * tt) / 3.1 + 1) * 0.2
        const bodyB = breath(t)
        const headB = breath(t - 0.22)
        const feetPx = ch * RIGE.feet
        const strip = 3 / dpr
        const xform = (ys: number) => {
          const u = clamp((feetPx - ys) / feetPx)
          const w = smooth(0.8, 0.92, u)
          const b = bodyB * (1 - w) + headB * w
          const lift = smooth(0.4, 0.86, u)
          const dy = -ch * 0.008 * b * lift
          const sx = 1 + 0.012 * b * Math.exp(-(((u - 0.7) / 0.12) ** 2))
          const dx = ch * 0.0045 * Math.pow(u, 1.6) * sway(t - 0.35 * u)
          return { dx, dy, sx }
        }
        for (let ys = 0; ys < ch; ys += strip) {
          const { dx, dy, sx } = xform(ys)
          const dw = cw * sx
          ctx.drawImage(char, 0, ys * dpr, char.width, strip * dpr + 1, x0 + dx - (dw - cw) * 0.48, y0 + ys + dy, dw, strip + 0.6)
        }

        // Knipperen: willekeurig, soms twee keer, 140 ms
        if (!reduce && RIGE.eye && t > nextBlink) {
          blinkAt = t
          doubleBlink = Math.random() < 0.2
          nextBlink = t + rand(2.8, 6.5)
        }
        const bl = (tt: number) => (tt < 0 || tt > 0.14 ? 0 : tt < 0.05 ? ease.in(tt / 0.05) : tt < 0.08 ? 1 : 1 - ease.out((tt - 0.08) / 0.06))
        const lid = Math.max(bl(t - blinkAt), doubleBlink ? bl(t - blinkAt - 0.22) : 0)
        if (lid > 0) {
          const s = cw / 1024
          const [ex0, ey0, ex1, ey1] = RIGE.eye!
          const { dx, dy } = xform(ey0 * s)
          const ex = x0 + ex0 * s + dx
          const ey = y0 + ey0 * s + dy
          const ew = (ex1 - ex0) * s
          const eh = (ey1 - ey0) * s
          ctx.fillStyle = L!.skin
          ctx.beginPath()
          ctx.ellipse(ex + ew / 2, ey, ew / 2 + 0.6, eh * lid + 0.4, 0, 0, Math.PI)
          ctx.fill()
          ctx.strokeStyle = 'rgba(10,10,10,0.85)'
          ctx.lineWidth = Math.max(0.6, eh * 0.18)
          ctx.beginPath()
          ctx.ellipse(ex + ew / 2, ey, ew / 2, eh * lid, 0, 0.15, Math.PI - 0.15)
          ctx.stroke()
        }
        // Het koude licht van de telefoon in je hand flikkert, als een scherm dat scrolt
        if (cast.phone) {
          const s = cw / 1024
          const { dx, dy } = xform(cast.phone[1] * s)
          const gx = x0 + cast.phone[0] * s + dx
          const gy = y0 + cast.phone[1] * s + dy
          const fl = 0.32 + 0.12 * Math.sin(t * 6.1) * Math.sin(t * 1.7) + 0.06 * Math.sin(t * 15.3)
          const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, cw * 0.32)
          rg.addColorStop(0, `rgba(255,255,255,${fl})`)
          rg.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = rg
          ctx.fillRect(gx - cw * 0.32, gy - cw * 0.32, cw * 0.64, cw * 0.64)
          ctx.globalCompositeOperation = 'source-over'
        }
      })

      // 8c · Het woud: regen valt schuin en naadloos, twee lagen op verschillende snelheid
      if (woud && img!.regen) layer(1.05, () => {
        const rw = W * 1.2
        const rh = rw * (img!.regen.height / img!.regen.width)
        ctx.globalCompositeOperation = 'screen'
        for (const [speed, alpha, sc] of [[620, 0.22, 1], [380, 0.12, 1.6]] as const) {
          const h2 = rh * sc
          const off = ((t * speed) % h2 + h2) % h2
          ctx.globalAlpha = alpha
          for (let x = -W * 0.1; x < W; x += rw * sc) {
            for (let y = -h2 + off; y < H; y += h2) ctx.drawImage(img!.regen, x, y, rw * sc, h2)
          }
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      })

      // 9 · Mist rond je enkels, twee lagen tegen elkaar in
      layer(1, () => {
        ctx.globalCompositeOperation = 'screen'
        for (const [speed, scale, y, alpha] of [[7, 1.8, 0.58, 0.5], [-4, 2.3, 0.66, 0.32]] as const) {
          const mw = W * scale
          // In Inferno kruipt rook over de grond in plaats van mist
          const fog = inf ? img!.rook : img!.mist
          const mh = mw * (fog.height / fog.width)
          const off = (((t * speed) % mw) + mw) % mw
          ctx.globalAlpha = alpha * (inf ? 0.7 : 1)
          ctx.drawImage(fog, -off, H * y, mw, mh)
          ctx.drawImage(fog, -off + mw, H * y, mw, mh)
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'source-over'
      })

      // 8b · Inferno: je verleidingen liggen om je heen op de vloer, en roepen om de beurt
      if (inf && L.objs.length) layer(0.82, () => {
        const spots = [[0.02, 0.99], [0.76, 0.995], [0.8, 0.86]] as const
        L!.objs.forEach((cv, i) => {
          const [fx, fy] = spots[i]
          const ow = (cv.width / dpr) * (i === 2 ? 0.7 : 1)
          const x = W * fx
          const y = H * fy - ow * 0.8
          const sg = ctx.createRadialGradient(x + ow / 2, H * fy - ow * 0.08, 0, x + ow / 2, H * fy - ow * 0.08, ow * 0.6)
          sg.addColorStop(0, 'rgba(0,0,0,0.7)')
          sg.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = sg
          ctx.fillRect(x - ow * 0.1, H * fy - ow * 0.4, ow * 1.2, ow * 0.6)
          const ping = Math.max(0, Math.sin((TAU * (t + i * 2.3)) / 6.5) - 0.86) / 0.14
          if (ping > 0) {
            const gl = ctx.createRadialGradient(x + ow / 2, y + ow / 2, 0, x + ow / 2, y + ow / 2, ow * 0.8)
            gl.addColorStop(0, `rgba(255,255,255,${0.35 * ping})`)
            gl.addColorStop(1, 'rgba(255,255,255,0)')
            ctx.globalCompositeOperation = 'lighter'
            ctx.fillStyle = gl
            ctx.fillRect(x - ow * 0.3, y - ow * 0.3, ow * 1.6, ow * 1.6)
            ctx.globalCompositeOperation = 'source-over'
          }
          ctx.drawImage(cv, x, y, ow, ow)
        })
      })

      // 9a' · Het woud: een raaf zit hoog op de rand en vliegt soms op; een mot cirkelt om het telefoonlicht
      if (woud && L.ravens) layer(0.7, () => {
        const [sit, up, down] = L!.ravens!
        const cyc = 16
        const p = (t % cyc) / cyc
        const sw = sit.width / dpr
        if (p < 0.7) {
          ctx.save()
          ctx.translate(W * 0.84, H * 0.18)
          ctx.rotate(0.03 * Math.sin(t * 0.8) + (Math.sin(t * 2.3) > 0.97 ? 0.08 : 0))
          ctx.drawImage(sit, -sw / 2, -sw / 2, sw, sw)
          ctx.restore()
        } else {
          const q = (p - 0.7) / 0.3
          const fv = Math.floor(t / 0.12) % 2 ? up : down
          const fw = fv.width / dpr
          ctx.globalAlpha = 1 - smooth(0.85, 1, q)
          ctx.drawImage(fv, W * 0.84 - q * W * 1.1 - fw / 2, H * 0.18 - q * H * 0.12 - fw / 2, fw, fw)
          ctx.globalAlpha = 1
        }
        if (L!.mot && cast.phone) {
          const s = L!.cw / 1024
          const cx = W * 0.47 - L!.cw * 0.5 + cast.phone[0] * s
          const cy = H * 0.97 - L!.ch * RIGE.feet + cast.phone[1] * s
          const mz = L!.mot.width / dpr
          const a = t * 2.4
          ctx.save()
          ctx.translate(cx + Math.cos(a) * W * 0.06 + Math.sin(t * 9) * 2, cy - H * 0.03 + Math.sin(a * 1.4) * H * 0.03)
          ctx.scale(0.75 + 0.25 * Math.abs(Math.sin(t * 18)), 1)
          ctx.drawImage(L!.mot, -mz / 2, -mz / 2, mz, mz)
          ctx.restore()
        }
      })

      // 9a · Inferno: vliegen zoemen rond het licht van de telefoon
      if (inf && L.fly && cast.phone) layer(0.8, () => {
        const s = L!.cw / 1024
        const cx = W * 0.47 - L!.cw * 0.5 + cast.phone![0] * s
        const cy = H * 0.97 - L!.ch * RIGE.feet + cast.phone![1] * s
        const fz = L!.fly!.width / dpr
        for (let i = 0; i < 3; i++) {
          const sp = 2.1 + i * 0.7
          const a = t * sp + i * 2.1
          const x = cx + Math.cos(a) * W * (0.07 + 0.02 * i) + Math.sin(t * 13 + i) * 1.5
          const y = cy - H * 0.04 + Math.sin(a * 1.3) * H * (0.03 + 0.01 * i) + Math.cos(t * 11 + i) * 1.5
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(a + Math.PI / 2)
          ctx.drawImage(L!.fly!, -fz / 2, -fz / 2, fz, fz)
          ctx.restore()
        }
      })

      // 9b · Paradiso: je doelen zweven als emblemen in een boog om je heen, elk in zijn eigen ritme
      if (para && L.emb.length) layer(0.85, () => {
        const n = L!.emb.length
        const cx = W * 0.47
        const cy = H * 0.97 - L!.ch * 0.7
        L!.emb.forEach((cv, i) => {
          const base = n === 1 ? -Math.PI / 2 : Math.PI + (Math.PI * (i + 0.5)) / n
          const a = base + 0.05 * Math.sin(t * 0.3 + i)
          const rx = W * 0.4
          const ry = L!.ch * 0.42
          const x = cx + Math.cos(a) * rx
          const y = cy + Math.sin(a) * ry + Math.sin(t * (0.8 + i * 0.11) + i * 1.7) * H * 0.008
          const sz = cv.width / dpr
          const gl = ctx.createRadialGradient(x, y, 0, x, y, sz * 0.9)
          gl.addColorStop(0, `rgba(255,255,255,${0.22 + 0.08 * Math.sin(t * 1.1 + i)})`)
          gl.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalCompositeOperation = 'lighter'
          ctx.fillStyle = gl
          ctx.fillRect(x - sz, y - sz, sz * 2, sz * 2)
          ctx.globalCompositeOperation = 'source-over'
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(0.06 * Math.sin(t * 0.6 + i * 2))
          ctx.drawImage(cv, -sz / 2, -sz / 2, sz, sz)
          ctx.restore()
        })
      })

      // 9c · De voorgrond vóór je, als die geen taferelen hoeft te omlijsten
      if (L.front && F && cast.frontOver) layer(1.15, () => inFrame(L!.front))

      // 10 · Veren drijven omhoog naar het licht, stof hangt in de stralen
      layer(0.9, () => {
        const want = cast.feathers ? Math.round(4 + 6 * k) : 0
        while (feathers.length < want) feathers.push(newFeather(true))
        if (feathers.length > want) feathers.length = want
        for (let i = 0; i < feathers.length; i++) {
          const p = feathers[i]
          p.ph += dt
          p.x += (p.vx + Math.sin(p.ph * 0.9) * 0.01) * dt
          p.y += (p.vy + Math.cos(p.ph * 1.3) * 0.006) * dt
          if (p.x > 1.15 || p.y < -0.1) feathers[i] = newFeather(false)
          const size = p.s * W
          ctx.save()
          ctx.globalAlpha = p.a
          ctx.translate(p.x * W, p.y * H)
          ctx.rotate(p.rot + Math.sin(p.ph * 1.7) * 0.6)
          ctx.drawImage(img!.veer, -size / 2, -size / 2, size, size * (img!.veer.height / img!.veer.width))
          ctx.restore()
        }
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = 'lighter'
        for (const m of motes) {
          m.ph += dt
          m.x = (m.x + m.vx * dt + 1) % 1
          m.y = (m.y + (cast.embers ? -0.05 : m.vy) * dt + 1) % 1
          const a = m.a * (0.5 + 0.5 * Math.sin(m.ph * (cast.embers ? 5 : 1.3))) * (cast.embers ? 1 : (0.3 + 0.7 * k) * smooth(0.2, 0.9, m.x))
          ctx.fillStyle = `rgba(255,255,255,${a * 0.6})`
          ctx.beginPath()
          ctx.arc(m.x * W, m.y * H * 0.85, m.s, 0, TAU)
          ctx.fill()
        }
        // Lichtjes fonkelen hoog in de lucht van de terrassen
        if (terr && img!.lichtje) {
          for (let i = 0; i < 6; i++) {
            const x = W * ((0.13 + i * 0.37) % 1)
            const y = H * (0.06 + ((i * 0.23) % 0.3))
            const tw = Math.max(0, Math.sin(t * (0.7 + i * 0.13) + i * 2.1))
            const sz = W * (0.025 + 0.02 * tw)
            ctx.globalAlpha = 0.2 + 0.7 * tw
            ctx.drawImage(img!.lichtje, x - sz / 2, y - sz / 2, sz, sz)
          }
          ctx.globalAlpha = 1
        }
        ctx.globalCompositeOperation = 'source-over'
      })

      // 11 · Vignet: het donker aan de randen, links (de zonde) dieper
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const vg = ctx.createRadialGradient(W * 0.55, H * 0.55, Math.min(W, H) * 0.25, W * 0.55, H * 0.55, Math.max(W, H) * 0.78)
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, `rgba(0,0,0,${cast.dark + 0.13 - 0.2 * k})`)
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)
      const side = ctx.createLinearGradient(0, 0, W, 0)
      side.addColorStop(0, `rgba(0,0,0,${kust ? 0.35 - 0.15 * k : 0})`)
      side.addColorStop(0.45, 'rgba(0,0,0,0)')
      ctx.fillStyle = side
      ctx.fillRect(0, 0, W, H)
    }

    const loop = (now: number) => {
      if (!alive) return
      draw(now)
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const resume = () => {
      cancelAnimationFrame(raf)
      if (!alive || reduce || !visible || document.hidden) return
      prev = performance.now()
      raf = requestAnimationFrame(loop)
    }

    const begin = (im: Record<Key, HTMLImageElement>) => {
      img = im
      start = performance.now() - 5000 // begin halverwege, niet in een lege scène
      prev = performance.now()
      setReady(true)
      layout()
      draw(performance.now())
      resume()
    }
    const hit = cachedAll(cast, objKeys)
    if (hit) begin(hit)
    else loadAll(cast, objKeys)
      .then((im) => { if (alive) begin(im) })
      .catch((e) => console.warn('Levende scène niet geladen.', e))

    let lastSize = ''
    const ro = new ResizeObserver(() => {
      const size = `${Math.round(c.clientWidth)}x${Math.round(c.clientHeight)}`
      if (size === lastSize) return
      lastSize = size
      layout()
      if (reduce) draw(performance.now())
    })
    ro.observe(c)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; resume() })
    io.observe(c)
    document.addEventListener('visibilitychange', resume)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', resume)
    }
  }, [still, scene, tabsKey, emblemKey, objKey, sinKey, virtueKey])

  return <canvas ref={ref} className="scene-layer" aria-hidden="true" style={{ zIndex: 4, opacity: ready ? 1 : 0, transition: 'opacity .4s ease' }} />
}
