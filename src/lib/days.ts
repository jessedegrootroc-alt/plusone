// Eén maat voor je dag: gewonnen of verloren. Een dag is gewonnen als je al je grote taken van die dag
// hebt gedaan. Ja of nee, geen half. Alleen grote taken die die dag gelden tellen mee.
import { habitsFor, isDone, isNote } from './score'
import { addDays, todayISO, type Habit, type State } from './store'

/** 0 = zondag … 6 = zaterdag */
const weekday = (date: string) => new Date(date + 'T12:00:00').getDay()

/** Maandag van de week waar deze datum in valt. */
const weekStart = (date: string) => addDays(date, -((weekday(date) + 6) % 7))

/** Hoe vaak een gewoonte gedaan is tussen twee datums (van tot en met). */
const doneCount = (s: State, h: Habit, from: string, to: string) => {
  let n = 0
  for (let d = from; d <= to; d = addDays(d, 1)) if (isDone(h, s.logs[d]?.v[h.id] ?? 0) && (s.logs[d]?.v[h.id] ?? 0) > 0) n++
  return n
}

/**
 * Of een gewoonte op deze dag geldt. Elke dag: altijd. Vaste dagen: op die dagen.
 * Zo vaak per week of maand: tot je het aantal hebt gehaald (de dag dat je hem doet, telt nog mee).
 */
export const appliesOn = (s: State, h: Habit, date: string) => {
  const sc = h.schedule
  if (!sc || sc.kind === 'daily') return true
  if (sc.kind === 'days') return sc.days.includes(weekday(date))
  const from = sc.kind === 'week' ? weekStart(date) : date.slice(0, 8) + '01'
  const before = doneCount(s, h, from, addDays(date, -1))
  return before < sc.times
}

/** In gewone woorden, voor onder de naam van een gewoonte. */
export const scheduleLabel = (h: Pick<Habit, 'schedule'>) => {
  const sc = h.schedule
  if (!sc || sc.kind === 'daily') return 'elke dag'
  if (sc.kind === 'days') return sc.days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => DAY_SHORT[d]).join(', ')
  return `${sc.times} keer per ${sc.kind === 'week' ? 'week' : 'maand'}`
}
export const DAY_SHORT = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

/** De grote taken van een dag: grote goede gewoontes die die dag gelden, en grote stenen voor alleen die dag. */
export const bigTasksOn = (s: State, date: string) =>
  habitsFor(s, date).filter((h) => h.kind === 'virtue' && h.weight === 3 && !isNote(h) && appliesOn(s, h, date))

/** Wat er die dag nog meer staat: kleinere goede gewoontes die die dag gelden. */
export const otherTasksOn = (s: State, date: string) =>
  habitsFor(s, date).filter((h) => h.kind === 'virtue' && h.weight < 3 && !isNote(h) && appliesOn(s, h, date))

/** Gewonnen of gemist, zonder te kijken of je hem met een reservedag redde. */
const rawResult = (s: State, date: string): boolean | null => {
  if (date < s.createdAt) return null
  const big = bigTasksOn(s, date)
  if (!big.length) return null
  const l = s.logs[date]
  return big.every((h) => isDone(h, l?.v[h.id] ?? 0) && (l?.v[h.id] ?? 0) > 0)
}

/**
 * Gewonnen (true), verloren (false), of niet te zeggen (null: geen grote taken, voor je begon, of gered met een
 * reservedag). Een geredde dag telt niet als gewonnen, maar breekt je reeks ook niet.
 */
export const dayResult = (s: State, date: string): boolean | null => {
  const r = rawResult(s, date)
  return r === false && s.logs[date]?.saved ? null : r
}

/**
 * Reservedagen (Sharif & Shu): een doel met een paar reservedagen houd je langer vol dan een even zwaar doel zonder.
 * Na een misser voelt het nog als vooruitgang, dus je geeft niet op. Twee per maand.
 */
/** Reservedagen per maand, per niveau: een beginner krijgt meer vangnet, een expert geen. */
export const RESERVES = { beginner: 3, gemiddeld: 2, expert: 0 } as const
export const reservesPerMonth = (s: State) => RESERVES[s.settings?.tier ?? 'gemiddeld']

/** Gemist, en gered met een reservedag. */
export const isSaved = (s: State, date: string) => rawResult(s, date) === false && !!s.logs[date]?.saved

/**
 * Hoeveel reservedagen er nog over zijn in de maand van deze datum. Win je de dag na een geredde dag, dan krijg je
 * hem terug (Milkman e.a. 2021: een bonus voor terugkomen na een misser werkte het best van 54 ideeën), één keer per maand.
 */
export const reservesLeft = (s: State, date: string) => {
  const month = date.slice(0, 7)
  const saved = Object.keys(s.logs).filter((d) => d.startsWith(month) && s.logs[d].saved)
  const back = Math.min(1, saved.filter((d) => rawResult(s, addDays(d, 1)) === true).length)
  const per = reservesPerMonth(s)
  return per === 0 ? 0 : Math.max(0, per - saved.length + back)
}

/** Teruggekomen: gisteren gemist, vandaag gewonnen. */
export const isComeback = (s: State, today = todayISO()) => rawResult(s, addDays(today, -1)) === false && rawResult(s, today) === true

/** Of terugkomen vandaag een reservedag teruggaf (de eerste keer deze maand). */
export const reserveBack = (s: State, today = todayISO()) => {
  const y = addDays(today, -1)
  if (!isComeback(s, today) || !s.logs[y]?.saved) return false
  const month = y.slice(0, 7)
  return !Object.keys(s.logs).some((d) => d.startsWith(month) && d < y && s.logs[d].saved && rawResult(s, addDays(d, 1)) === true)
}

/** Gemist (ook als je hem met een reservedag redde). */
export const missedOn = (s: State, date: string) => rawResult(s, date) === false

/** Gisteren gemist (ook als je hem al redde). */
export const missedYesterday = (s: State, today = todayISO()) => missedOn(s, addDays(today, -1))

/**
 * Of je een gemiste dag nog kunt redden: er is een reservedag over, en de dag ervoor was niet ook gemist.
 * Eén keer missen is menselijk, twee keer op rij is een nieuw patroon: dat red je niet.
 */
export const canSave = (s: State, date: string) =>
  rawResult(s, date) === false && !s.logs[date]?.saved && rawResult(s, addDays(date, -1)) !== false && reservesLeft(s, date) > 0

/**
 * Een verse start (Dai, Milkman & Riis): na een herkenbaar begin, zoals een maandag of de eerste van de maand,
 * beginnen mensen vaker opnieuw. Op maandag na een week met twee of meer verloren dagen, of op de eerste van de maand.
 */
export const freshStart = (s: State, today = todayISO()): 'week' | 'month' | null => {
  if (today <= s.createdAt) return null
  if (today.endsWith('-01')) return 'month'
  if (weekday(today) !== 1) return null
  let lost = 0
  for (let i = 1; i <= 7; i++) if (dayResult(s, addDays(today, -i)) === false) lost++
  return lost >= 2 ? 'week' : null
}

/**
 * Doe je het nu zelf? (Stawarz e.a.: wie op meldingen leunt, doet het wel, maar het wordt geen gewoonte.)
 * De afgelopen drie weken op minstens 85% van de dagen dat hij gold gedaan, en minstens tien keer.
 */
export const doesItAlone = (s: State, h: Habit, today = todayISO()) => {
  let due = 0
  let done = 0
  for (let i = 1; i <= 21; i++) {
    const d = addDays(today, -i)
    if (d < s.createdAt) return false
    if (!appliesOn(s, h, d)) continue
    due++
    const v = s.logs[d]?.v[h.id] ?? 0
    if (isDone(h, v) && v > 0) done++
  }
  return due >= 10 && done / due >= 0.85
}

/**
 * "18 van de 21 dagen gewonnen": de laatste 21 dagen sinds je begon, tot en met gisteren.
 * Vandaag telt pas mee als hij al gewonnen is (hij is nog niet voorbij).
 */
export const wonStats = (s: State, today = todayISO(), span = 21) => {
  let won = 0
  let counted = 0
  if (dayResult(s, today) === true) { won++; counted++ }
  for (let i = 1; counted < span && i <= span; i++) {
    const d = addDays(today, -i)
    if (d < s.createdAt) break
    const r = dayResult(s, d)
    if (r === null) continue
    counted++
    if (r) won++
  }
  return { won, counted }
}

/** Nooit twee keer missen: gisteren verloren? */
export const lostYesterday = (s: State, today = todayISO()) => dayResult(s, addDays(today, -1)) === false

/** Alle gewonnen dagen sinds je begon: hoe ver de figuur op de berg staat. */
export const totalWon = (s: State, today = todayISO()) => {
  let n = 0
  for (let d = s.createdAt; d <= today; d = addDays(d, 1)) if (dayResult(s, d) === true) n++
  return n
}

/** Hoeveel dagen op rij gewonnen, tot en met gisteren (vandaag telt mee zodra hij gewonnen is). */
export const winStreak = (s: State, today = todayISO()) => {
  let n = dayResult(s, today) === true ? 1 : 0
  for (let i = 1; ; i++) {
    const d = addDays(today, -i)
    if (d < s.createdAt) break
    const r = dayResult(s, d)
    if (r === null) continue
    if (!r) break
    n++
  }
  return n
}
