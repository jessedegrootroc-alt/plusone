import { SINS, type SinId } from '../data/sins'
import type { AreaId } from '../data/growth'
import { addDays, todayISO, type Challenge, type DayLog, type DayRock, type Habit, type MirrorNote, type State } from './store'

export const rockHabit = (r: DayRock): Habit => ({ id: r.id, name: r.text, sin: r.sin ?? 'sloth', kind: 'virtue', type: 'do', weight: r.size, at: r.at })

/** Het id waaronder een post-it als gewoonte in je dag staat. */
export const noteHabitId = (n: MirrorNote) => `note:${n.id}`

/**
 * Een post-it op de spiegel telt elke dag mee als deugd onder zijn zonde (Goggins kijkt hem elke ochtend aan):
 * eraan gewerkt telt, overslaan kost. De dag dat je hem eraf haalt telt als grote steen.
 */
export const noteHabit = (n: MirrorNote, date: string): Habit => ({
  id: noteHabitId(n),
  name: n.text,
  sin: n.sin ?? 'sloth',
  kind: 'virtue',
  type: 'do',
  weight: n.doneAt === date ? 3 : 2,
})

const notesOn = (state: State, date: string) =>
  (state.notes ?? []).filter((n) => n.sin && n.createdAt <= date && (!n.doneAt || date <= n.doneAt))

/**
 * Hoe ver uit je comfortzone, zo zwaar telt het mee (1–3). Een trede van je ladder telt zwaarder naarmate hij
 * hoger ligt: de eerste stappen 1×, het midden 2×, de laatste stappen 3×.
 */
export const stepWeight = (i: number, total: number): 1 | 2 | 3 => Math.min(3, 1 + Math.floor((3 * i) / Math.max(1, total))) as 1 | 2 | 3
/** Een grens: lekker 1×, spannend 2×, doodeng 3×; een grote (mijlpaal) nog een stap zwaarder, tot 3×. */
export const grensWeight = (c: Pick<Challenge, 'fear' | 'size'>): 1 | 2 | 3 => Math.min(3, c.fear + (c.size === 'groot' ? 1 : 0)) as 1 | 2 | 3

export const stepHabitId = (n: MirrorNote, i: number) => `step:${n.id}:${i}`
export const grensHabitId = (c: Challenge) => `grens:${c.id}`

const GRENS_SIN: Partial<Record<AreaId, SinId>> = { geld: 'greed', geven: 'greed', binnen: 'pride', denken: 'pride', mensen: 'envy', liefde: 'envy', familie: 'envy', lichaam: 'gluttony' }

/** Wat je die dag uit je comfortzone haalde: gezette treden en verlegde grenzen. Telt alleen mee, kost nooit iets. */
const stretchesOn = (state: State, date: string): Habit[] => {
  const v = state.logs[date]?.v ?? {}
  const out: Habit[] = []
  for (const n of state.notes ?? []) {
    const total = n.steps?.length ?? 0
    n.steps?.forEach((st, i) => {
      const id = stepHabitId(n, i)
      if (st.doneAt === date && (v[id] ?? 0) >= 1) out.push({ id, name: st.text, sin: n.sin ?? 'sloth', kind: 'virtue', type: 'do', weight: stepWeight(i, total) })
    })
  }
  for (const c of state.growth ?? []) {
    const id = grensHabitId(c)
    if (c.doneAt === date && (v[id] ?? 0) >= 1) out.push({ id, name: c.title, sin: GRENS_SIN[c.area] ?? 'sloth', kind: 'virtue', type: 'do', weight: grensWeight(c) })
  }
  return out
}

/** Vaste gewoontes plus de dagstenen, de post-its en wat je die dag uit je comfortzone haalde. */
export const habitsFor = (state: State, date: string): Habit[] => [
  ...state.habits,
  ...(state.logs[date]?.rocks ?? []).map(rockHabit),
  ...notesOn(state, date).map((n) => noteHabit(n, date)),
  ...stretchesOn(state, date),
]

/** Post-its, treden en grenzen: tellen mee in je balans, maar staan niet in je lijst van gewoontes. */
export const isNote = (h: Habit) => /^(note|step|grens):/.test(h.id)

/** Deugden gesorteerd zoals ze in de pot moeten: grote stenen eerst. */
export const byRock = (hs: Habit[]) => [...hs].sort((a, b) => b.weight - a.weight)

// Hoe snel je lichaam meebeweegt. 0.15 = na ±1 week consequent gedrag zie je duidelijk verschil.
export const ALPHA = 0.15

/**
 * Score van één gewoonte op één dag, als veelvoud van haar gewicht.
 * `final` = de dag is voorbij of afgesloten; dan tellen gemiste deugden en schone verleidingen mee.
 * Vandaag (nog open) tel je alleen wat je al gedaan of toegegeven hebt — je begint de dag niet in de min.
 */
export const habitScore = (h: Habit, log: DayLog | undefined, final: boolean): number => {
  const answered = !!log && h.id in log.v
  const val = log?.v[h.id] ?? 0
  const w = h.weight
  let s = 0
  switch (h.type) {
    case 'do':
      s = val >= 1 ? w : -0.6 * w
      break
    case 'target': {
      const r = Math.min(1, val / Math.max(1, h.amount ?? 1))
      s = w * (1.6 * r - 0.6)
      break
    }
    case 'avoid':
      s = val >= 1 ? -1.5 * w : answered || final ? 0.5 * w : 0
      break
    case 'limit': {
      const max = h.amount ?? 0
      if (val > max) s = -w * Math.min(1.5, 0.6 + ((val - max) / Math.max(1, max)) * 0.6)
      else s = answered || final ? 0.5 * w : 0
      break
    }
  }
  if (!final && s < 0 && (h.type === 'do' || h.type === 'target')) s = 0
  return s
}

const normOf = (habits: Habit[], log: DayLog | undefined, final: boolean, urgeBonus: boolean) => {
  if (!habits.length) return null
  let sum = 0
  let w = 0
  for (const h of habits) {
    sum += habitScore(h, log, final)
    w += h.weight
  }
  let n = sum / w
  if (urgeBonus) n += Math.min(0.3, (log?.urges ?? 0) * 0.1)
  return Math.max(-1, Math.min(1, n))
}

export interface DayPoint {
  date: string
  balance: number
  dayNorm: number | null
  perSin: Record<SinId, number>
  sealed: boolean
  recorded: boolean
}

export interface Series {
  points: DayPoint[]
  balance: number
  perSin: Record<SinId, number>
}

const zeroSins = () => Object.fromEntries(SINS.map((s) => [s.id, 0])) as Record<SinId, number>

/** Loopt alle dagen af vanaf de start en bouwt de langzaam bewegende balans op. */
export const computeSeries = (state: State, until = todayISO()): Series => {
  const today = todayISO()
  let balance = 0
  const perSin = zeroSins()
  const points: DayPoint[] = []
  for (let d = state.createdAt; d <= until; d = addDays(d, 1)) {
    const log = state.logs[d]
    const habits = habitsFor(state, d)
    const isToday = d === today
    const recorded = !!log && (log.sealed || Object.keys(log.v).length > 0 || (log.urges ?? 0) > 0)
    const final = !isToday || !!log?.sealed
    // Een dag die je niet hebt gespiegeld telt licht negatief: deugden gemist, verleidingen onbekend.
    const effLog: DayLog | undefined = !isToday && !recorded ? undefined : log
    const n = !isToday && !recorded
      ? normOf(habits.filter((h) => h.kind === 'virtue'), undefined, true, false)
      : normOf(habits, effLog, final, true)
    // Een open dag beweegt alleen naar rato van wat je al hebt ingevuld,
    // en trekt je alleen omlaag als je daadwerkelijk toegaf.
    const openDay = isToday && !final
    const step = (cur: number, target: number, hs: Habit[]) => {
      if (!openDay) return cur + (target - cur) * ALPHA
      const slipped = hs.some((h) => habitScore(h, effLog, false) < 0)
      if (target < cur) return slipped ? cur + (target - cur) * ALPHA : cur
      const totalW = hs.reduce((a, h) => a + h.weight, 0) || 1
      // Een gezette trede of verlegde grens telt overdag al flink mee, niet pas als je dag af is
      const answeredW = hs.reduce((a, h) => a + (log && h.id in log.v ? h.weight * (/^(step|grens):/.test(h.id) ? 4 : 1) : 0), 0)
      const urge = Math.min(1, (log?.urges ?? 0) * 0.2)
      return cur + (target - cur) * ALPHA * Math.min(1, answeredW / totalW + urge)
    }
    if (n !== null) balance = step(balance, n * 100, habits)
    for (const s of SINS) {
      const hs = habits.filter((h) => h.sin === s.id && (recorded || isToday || h.kind === 'virtue'))
      const sn = normOf(hs, effLog, final, false)
      if (sn !== null) perSin[s.id] = step(perSin[s.id], sn * 100, hs)
    }
    points.push({ date: d, balance, dayNorm: n, perSin: { ...perSin }, sealed: !!log?.sealed, recorded })
  }
  return { points, balance, perSin }
}

/** Dagen op rij dat je eerlijk in de spiegel hebt gekeken (afgesloten). Eerlijkheid telt, niet perfectie. */
export const mirrorStreak = (state: State) => {
  let d = todayISO()
  if (!state.logs[d]?.sealed) d = addDays(d, -1)
  let n = 0
  while (state.logs[d]?.sealed) {
    n++
    d = addDays(d, -1)
  }
  return n
}

export const isDone = (h: Habit, val: number) =>
  h.type === 'do' ? val >= 1
  : h.type === 'target' ? val >= (h.amount ?? 1)
  : h.type === 'avoid' ? val < 1
  : val <= (h.amount ?? 0)

/**
 * De lading van je schaduw (0–1): misstappen en drang van de afgelopen 7 dagen,
 * min wat je in schaduwgesprekken hebt erkend. Erkennen neemt de schaduw zijn greep, ook als je viel.
 */
export const shadowCharge = (state: State) => {
  const since = addDays(todayISO(), -7)
  let slips = 0
  let urges = 0
  for (const [d, log] of Object.entries(state.logs)) {
    if (d < since) continue
    urges += log.urges ?? 0
    for (const h of state.habits) if (h.kind === 'vice' && !isDone(h, log.v[h.id] ?? 0)) slips++
  }
  const talks = (state.shadowLog ?? []).filter((e) => e.at.slice(0, 10) >= since).length
  const raw = slips + urges * 0.5
  return {
    charge: Math.max(0, Math.min(1, (raw - talks * 1.5) / 8)),
    talks,
    raw,
  }
}
