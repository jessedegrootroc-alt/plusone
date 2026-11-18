// Drie versies van dezelfde app. Wat je bij de start kiest, bepaalt niet alleen hoeveel taken je krijgt,
// maar ook hoeveel vangnet en welke toon:
// - Beginner: eenvoudig en mild. De eerste twee weken alleen het hoofdpad; kleine overwinningen bouwen vertrouwen (Bandura).
// - Gemiddeld: vangnetten en inzicht. Je zwakke dag, uitleg over de dip in week 3 tot 8 (Lally: gemiddeld 66 dagen), en een getuige.
// - Expert: hard en snel. Geen reservedagen, geen ademhaling vooraf, zware grenzen.
import { missedOn } from './days'
import { addDays, todayISO, type State } from './store'

export type Tier = 'beginner' | 'gemiddeld' | 'expert'

export const TIERS = [
  { id: 'beginner', label: 'Beginner', sub: 'Eén of twee taken per dag. Eerst leren winnen.', min: 1, max: 2 },
  { id: 'gemiddeld', label: 'Gemiddeld', sub: 'Twee of drie taken per dag. Deze keer hou je vol.', min: 2, max: 3 },
  { id: 'expert', label: 'Expert', sub: 'Drie of vier taken per dag. Geen reservedagen, geen smoesjes.', min: 3, max: 4 },
] as const

export const tierOf = (s: State): Tier => s.settings?.tier ?? 'gemiddeld'
export const tierInfo = (t: Tier | string | null | undefined) => TIERS.find((x) => x.id === t) ?? TIERS[1]

/** De hoeveelste dag met de app (de eerste dag is 1). */
export const dayNumber = (s: State, today = todayISO()) =>
  Math.round((new Date(today + 'T12:00:00').getTime() - new Date(s.createdAt + 'T12:00:00').getTime()) / 86400000) + 1

/** Een beginner ziet de eerste twee weken alleen het hoofdpad: taken, ochtendmoment, dag afsluiten. */
export const SIMPLE_DAYS = 14
export const isSimple = (s: State, today = todayISO()) => tierOf(s) === 'beginner' && dayNumber(s, today) <= SIMPLE_DAYS

/** Week 3 tot 8: de zin van het begin is weg, de gewoonte is er nog niet. */
export const inDip = (s: State, today = todayISO()) => { const n = dayNumber(s, today); return n >= 15 && n <= 56 }

export const WEEKDAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']

/**
 * De dag van de week waarop je het vaakst mist, over de laatste acht weken.
 * Pas als het een patroon is: minstens twee keer, en duidelijk vaker dan elke andere dag.
 */
export const weakDay = (s: State, today = todayISO()): number | null => {
  const counts = [0, 0, 0, 0, 0, 0, 0]
  for (let i = 1; i <= 56; i++) {
    const d = addDays(today, -i)
    if (d < s.createdAt) break
    if (missedOn(s, d)) counts[new Date(d + 'T12:00:00').getDay()]++
  }
  const max = Math.max(...counts)
  if (max < 2) return null
  const rest = counts.filter((_, k) => k !== counts.indexOf(max))
  return Math.max(...rest) < max ? counts.indexOf(max) : null
}
