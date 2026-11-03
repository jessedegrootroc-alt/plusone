// Het hoofddoel: één doel met een datum, groot bovenaan Vandaag, met een aftelling.
import type { FeatureId } from '../data/catalog'
import type { Domain } from '../data/ladders'
import { todayISO, type MirrorNote, type State } from './store'

/** Kenmerken die bij je lichaam horen: die vallen onder Fysiek, ook de Medaille (een race of prestatie). */
export const PHYSICAL: FeatureId[] = ['medal', 'abs', 'dumbbell', 'frost', 'flame']
export const domainForFeature = (f?: FeatureId): Domain | undefined => (f && PHYSICAL.includes(f) ? 'fysiek' : undefined)

/** Een race of prestatie heeft een datum nodig, anders is het een wens. */
export const needsDate = (f?: FeatureId, text = '') => f === 'medal' || /race|loop|marathon|wedstrijd|triatlon|toernooi|examen/i.test(text)

export const daysLeft = (due: string, today = todayISO()) => Math.round((Date.parse(due) - Date.parse(today)) / 864e5)

/** Het hoofddoel: wat je zelf koos, anders het eerstvolgende doel met een datum. */
export const mainGoal = (s: State): MirrorNote | undefined => {
  const open = (s.notes ?? []).filter((n) => !n.doneAt)
  return open.find((n) => n.id === s.mainGoalId) ?? open.filter((n) => n.due).sort((a, b) => a.due!.localeCompare(b.due!))[0]
}

export const goalTitle = (n: MirrorNote) => n.goal?.trim() || n.text

/** "nog 214 dagen", "vandaag", "3 dagen geleden". */
export const countdownLabel = (due: string, today = todayISO()) => {
  const d = daysLeft(due, today)
  return d > 1 ? `nog ${d} dagen` : d === 1 ? 'nog 1 dag' : d === 0 ? 'vandaag' : `${-d} ${d === -1 ? 'dag' : 'dagen'} geleden`
}
