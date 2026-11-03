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

/** Gewonnen (true), verloren (false), of niet te zeggen (null: geen grote taken, of voor je begon). */
export const dayResult = (s: State, date: string): boolean | null => {
  if (date < s.createdAt) return null
  const big = bigTasksOn(s, date)
  if (!big.length) return null
  const l = s.logs[date]
  return big.every((h) => isDone(h, l?.v[h.id] ?? 0) && (l?.v[h.id] ?? 0) > 0)
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
