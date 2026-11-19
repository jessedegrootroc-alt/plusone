// Eén stap tegelijk. Van alle post-its op je spiegel werk je er aan één; de rest wacht.
// Zo heb je op een dag je taken, het ochtendmoment, één stap van de spiegel en dag afsluiten. Meer niet.
import { addDays, todayISO, type MirrorNote, type State } from './store'

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5)

/** De stap die nu op een post-it hangt, en hoeveel dagen je er nog voor hebt. */
export const nextStep = (n: MirrorNote, today = todayISO()) => {
  const steps = n.steps ?? []
  const i = steps.findIndex((x) => !x.doneAt)
  const step = i >= 0 ? steps[i] : null
  const start = step ? step.startedAt ?? steps[i - 1]?.doneAt ?? n.createdAt : today
  const left = step ? daysBetween(today, addDays(start, step.days ?? 7)) : 0
  return { i, step, total: steps.length, done: steps.filter((x) => x.doneAt).length, left }
}
export const leftLabel = (left: number) => (left < 0 ? 'over tijd' : left === 0 ? 'vandaag' : left === 1 ? 'nog 1 dag' : `nog ${left} dagen`)

/**
 * De post-it waar je nu aan werkt: die je zelf koos, anders de eerste uit de start van de app
 * (daar staat het deel waar je het slechtst voor stond vooraan), anders de eerste.
 */
export const activeNote = (s: State): MirrorNote | undefined => {
  const open = (s.notes ?? []).filter((n) => !n.doneAt && (n.steps ?? []).some((st) => !st.doneAt))
  return open.find((n) => n.id === s.focusNote) ?? open.find((n) => n.answer) ?? open[0]
}

/** Een post-it de actieve maken: zijn stap begint vandaag, de termijn loopt pas vanaf nu. */
export const focusOn = (d: State, id: string) => {
  d.focusNote = id
  const st = d.notes.find((n) => n.id === id)?.steps?.find((x) => !x.doneAt)
  if (st) st.startedAt = todayISO()
}
