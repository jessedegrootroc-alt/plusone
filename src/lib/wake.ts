// Je opstaantijd. Goggins wilde eerder op zijn dan iedereen; welke tijd dat voor jou is, kies je zelf.
// De tijd staat op één plek: je ochtendmelding en je grote taak "op" lopen gelijk.
import { DEFAULT_TIMES } from './notify'
import type { Habit, State } from './store'

/** Je opstaan-taak: gemarkeerd, of een oude taak die zo heet ("6:30 op"). */
export const isWakeHabit = (h: Habit) => !!h.wake || /^\d{1,2}[:.]\d{2} op$/i.test(h.name.trim())

export const wakeTime = (s: State) => s.settings?.notify?.wake ?? s.habits.find(isWakeHabit)?.at ?? DEFAULT_TIMES.wake

/** "06:30" → "6:30" */
export const shortTime = (t: string) => t.replace(/^0(\d)/, '$1')

/** Zet je opstaantijd overal tegelijk: de melding, en de grote taak (ook de naam, als die de tijd bevat). */
export const setWakeTime = (d: State, t: string) => {
  if (!t) return
  d.settings = { ...d.settings, notify: { ...DEFAULT_TIMES, on: false, ...d.settings?.notify, wake: t } }
  for (const h of d.habits.filter(isWakeHabit)) {
    h.at = t
    if (/^\d{1,2}[:.]\d{2} op$/i.test(h.name.trim())) h.name = `${shortTime(t)} op`
  }
}
