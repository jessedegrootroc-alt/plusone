import { AREAS, CHALLENGES, type AreaId, type Size } from '../data/growth'
import { addDays, todayISO, type Challenge, type State } from './store'

// Goggins zegt: zoek elke dag iets op dat je niet wilt. Maar de 40%-regel geldt voor je hoofd,
// niet voor een uitgeput lichaam. Deze regels houden groei in de groeizone en uit de burn-out.
export const MAX_OPEN = 3 // als alles moet, gebeurt er niets
export const MONTH_GOAL = 8 // twee grenzen per week is genoeg om te groeien
const LOAD = { klein: 1, groot: 3 }
const MAX_LOAD = 7 // meer dan een grote en vier kleine per week: tijd voor rust

export type Zone = 'comfort' | 'groei' | 'rust'

export interface Growth {
  open: Challenge[]
  month: Challenge[]
  zone: Zone
  reason: string
  energy?: 1 | 2 | 3
  canAdd: boolean
  bigThisWeek: boolean
  done: number
  said: number
  perArea: Record<AreaId, number>
  quiet: AreaId
  stale: Challenge[]
}

export const growthOf = (s: State, today = todayISO()): Growth => {
  const all = s.growth ?? []
  const week = addDays(today, -6)
  const twoWeeks = addDays(today, -13)
  const open = all.filter((c) => c.status === 'open').sort((a, b) => a.due.localeCompare(b.due))
  const done = all.filter((c) => c.status === 'gedaan')
  const doneSince = (from: string) => done.filter((c) => (c.doneAt ?? '') >= from)
  const month = doneSince(addDays(today, -29))

  const load = doneSince(week).reduce((n, c) => n + LOAD[c.size], 0)
  const energy = s.logs[today]?.energy
  const recent = [0, 1, 2].map((i) => s.logs[addDays(today, -i)]?.energy).filter(Boolean)
  const empty = recent.filter((e) => e === 1).length
  const tooMuch = doneSince(twoWeeks).filter((c) => c.felt === 3).length

  let zone: Zone = 'groei'
  let reason = 'Je zit in de groeizone. Spannend, maar te doen.'
  if (energy === 1 || empty >= 2) {
    zone = 'rust'
    reason = empty >= 2 ? 'Je tank was twee van de drie dagen leeg. Eerst herstellen: slaap, eet goed, wandel.' : 'Je tank is vandaag leeg. Rust is ook training.'
  } else if (tooMuch >= 2) {
    zone = 'rust'
    reason = 'Twee keer ‘te veel’ in twee weken. Kies de komende dagen iets kleiners.'
  } else if (load >= MAX_LOAD) {
    zone = 'rust'
    reason = 'Je hebt deze week al veel verlegd. Laat het landen voor je verder gaat.'
  } else if (!doneSince(twoWeeks).some((c) => c.fear >= 2) && !open.length) {
    zone = 'comfort'
    reason = 'Twee weken niets spannends gedaan. Je kamer is comfortabel, maar daar groei je niet.'
  }

  const perArea = Object.fromEntries(AREAS.map((a) => [a.id, 0])) as Record<AreaId, number>
  done.filter((c) => (c.doneAt ?? '') >= addDays(today, -59)).forEach((c) => perArea[c.area]++)
  const quiet = [...AREAS].sort((a, b) => perArea[a.id] - perArea[b.id])[0].id

  const stale = open.filter((c) => c.due < addDays(today, -2))
  const said = done.length + all.filter((c) => c.status === 'losgelaten').length + stale.length

  return {
    open,
    month,
    zone,
    reason,
    energy,
    canAdd: open.length < MAX_OPEN && zone !== 'rust',
    bigThisWeek: doneSince(week).some((c) => c.size === 'groot') || open.some((c) => c.size === 'groot' && c.due <= addDays(today, 6)),
    done: done.length,
    said,
    perArea,
    quiet,
    stale,
  }
}

// ── Niveaus per plek in je leven ──
// Een kleine grens telt 1 punt, een grote 3, en een die doodeng was nog 1 extra.
// Op het hoogste niveau is het je nieuwe comfortzone geworden: daar groei je niet meer, zoek verderop.
export const LEVELS = [
  { min: 0, name: 'Onbekend terrein' },
  { min: 1, name: 'Eerste stap' },
  { min: 3, name: 'Op gang' },
  { min: 6, name: 'Vertrouwd' },
  { min: 10, name: 'Sterk' },
  { min: 15, name: 'Nieuwe comfortzone' },
] as const

export interface AreaLevel {
  area: AreaId
  points: number
  level: number
  name: string
  /** Hoe ver je bent naar het volgende niveau (0–1). */
  toNext: number
  /** Punten tot het volgende niveau, of 0 op het hoogste. */
  need: number
  done: number
  brave: number
  dropped: number
}

const pointsOf = (c: Challenge) => (c.size === 'groot' ? 3 : 1) + (c.fear === 3 ? 1 : 0)

export const levelsOf = (s: State): AreaLevel[] => {
  const all = s.growth ?? []
  return AREAS.map((a) => {
    const mine = all.filter((c) => c.area === a.id)
    const done = mine.filter((c) => c.status === 'gedaan')
    const points = done.reduce((n, c) => n + pointsOf(c), 0)
    const level = LEVELS.findLastIndex((l) => points >= l.min)
    const next = LEVELS[level + 1]
    return {
      area: a.id,
      points,
      level,
      name: LEVELS[level].name,
      toNext: next ? (points - LEVELS[level].min) / (next.min - LEVELS[level].min) : 1,
      need: next ? next.min - points : 0,
      done: done.length,
      brave: done.filter((c) => c.fear >= 2).length,
      dropped: mine.filter((c) => c.status === 'losgelaten').length,
    }
  })
}

export interface Insight {
  kind: 'kracht' | 'blinde vlek' | 'patroon'
  text: string
  /** Eén korte zin voor op het Kompas. */
  short: string
}

/** Wat de app aan je gedrag ziet: waar je sterk bent, wat je laat liggen, en hoe je kiest. */
export const insightsOf = (s: State): Insight[] => {
  const lv = levelsOf(s)
  const all = s.growth ?? []
  const done = all.filter((c) => c.status === 'gedaan')
  const name = (id: AreaId) => AREAS.find((a) => a.id === id)!.name.toLowerCase()
  const out: Insight[] = []
  if (done.length < 3) {
    out.push({ kind: 'patroon', short: 'Na drie grenzen zie je hier waar je kracht zit.', text: `Je hebt ${done.length ? `pas ${done.length}` : 'nog geen'} ${done.length === 1 ? 'grens' : 'grenzen'} verlegd. Na een stuk of drie zie je hier waar je kracht zit en wat je laat liggen.` })
    return out
  }

  const top = [...lv].sort((a, b) => b.points - a.points || b.brave - a.brave)[0]
  out.push({ kind: 'kracht', short: `${AREAS.find((a) => a.id === top.area)!.name.toLowerCase()}.`, text: `${AREAS.find((a) => a.id === top.area)!.name}: ${top.done} ${top.done === 1 ? 'grens' : 'grenzen'} verlegd, ${top.brave === top.done ? 'allemaal' : top.brave} spannend of eng. Hier zoek je het ongemak al op.` })

  const zero = lv.filter((l) => l.points === 0 && !all.some((c) => c.area === l.area && c.status === 'open'))
  const dropped = [...lv].sort((a, b) => b.dropped - a.dropped)[0]
  if (dropped.dropped >= 2) out.push({ kind: 'blinde vlek', short: `${name(dropped.area)}, al ${dropped.dropped} keer losgelaten.`, text: `${AREAS.find((a) => a.id === dropped.area)!.name}: ${dropped.dropped} keer neergezet en weer losgelaten. Je wilt het wel, maar iets houdt je tegen. Begin hier met iets kleiners.` })
  else if (zero.length) out.push({ kind: 'blinde vlek', short: `${zero.slice(0, 2).map((z) => name(z.area)).join(' en ')}${zero.length > 2 ? ` en nog ${zero.length - 2}` : ''}.`, text: `Nog nooit aangeraakt: ${zero.slice(0, 3).map((z) => name(z.area)).join(', ')}${zero.length > 3 ? ` en nog ${zero.length - 3}` : ''}. Groeien op één plek is sterk worden; groeien overal is heel worden.` })

  const comfy = done.filter((c) => c.fear === 1).length
  const scary = done.filter((c) => c.fear === 3).length
  const big = done.filter((c) => c.size === 'groot').length
  const tooMuch = done.filter((c) => c.felt === 3).length
  if (tooMuch >= 2) out.push({ kind: 'patroon', short: 'Vaak te veel. Kies een stap kleiner.', text: `${tooMuch} keer ‘te veel’. Moed is goed, maar je zit vaak in de paniekzone. Kies een stap kleiner; daar leer je meer.` })
  else if (comfy / done.length > 0.5) out.push({ kind: 'patroon', short: 'Je kiest vaak wat lekker voelt. Kies spannend.', text: 'Je kiest vaak wat ‘lekker’ voelt. Dat is je comfortzone in een ander jasje. Kies de volgende keer ‘spannend’.' })
  else if (!big) out.push({ kind: 'patroon', short: 'Alleen kleine grenzen. Tijd voor een mijlpaal.', text: 'Je doet alleen kleine grenzen. Dat bouwt vertrouwen. Tijd voor één mijlpaal deze maand.' })
  else if (scary > done.length / 2) out.push({ kind: 'patroon', short: 'Vaak doodeng. Groei zit in spannend.', text: 'Je zoekt vaak het doodenge op. Dapper, maar let op je tank: groei zit in spannend, niet in paniek.' })
  else out.push({ kind: 'patroon', short: 'Precies in de groeizone.', text: 'Je kiest spannend, niet doodeng, en maakt ook grote stappen. Precies de groeizone.' })
  return out
}

/** De volgende grens die de app je voorstelt: op de stilste plek, op jouw niveau. */
export const nextSuggestion = (s: State, within?: AreaId[]) => {
  const lv = levelsOf(s).filter((l) => !within || within.includes(l.area))
  const all = s.growth ?? []
  const open = new Set(all.filter((c) => c.status === 'open').map((c) => c.area))
  const target = [...lv].filter((l) => !open.has(l.area)).sort((a, b) => a.points - b.points)[0]
  if (!target) return null
  const size: Size = target.level >= 2 ? 'groot' : 'klein'
  const tried = new Set(all.map((c) => c.title))
  const pick = CHALLENGES.find((c) => c.area === target.area && c.size === size && !tried.has(c.title)) ?? CHALLENGES.find((c) => c.area === target.area && !tried.has(c.title))
  return pick ? { ...pick, level: target } : null
}
