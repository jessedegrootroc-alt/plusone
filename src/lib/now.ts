// Nu: van alles wat er vandaag staat, het ene ding dat nu aan de beurt is. Goggins: het ding dat je niet wilt doen,
// nu, en niet eerst de rest. Hoe minder je hoeft te kiezen, hoe kleiner de kans dat je onderhandelt.
import { bigTasksOn, otherTasksOn } from './days'
import { isDone } from './score'
import type { Habit, State } from './store'
import { isWakeHabit } from './wake'

export type NowTask = {
  h: Habit
  /** Een grote taak (telt voor je dag), of een kleinere als de grote af zijn */
  big: boolean
  /** Te laat (zijn tijd is voorbij), vrij (geen vaste tijd) of straks (zijn tijd komt nog) */
  when: 'late' | 'free' | 'later'
}

const byTime = (a: Habit, b: Habit) => (a.at ?? '99').localeCompare(b.at ?? '99')
const minutes = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m }
/** Opstaan kun je niet meer inhalen: na drie uur (het ochtendmoment) staat hij niet meer op Nu. Afvinken kan op het briefje. */
const tooLate = (h: Habit, nowHM: string) => isWakeHabit(h) && !!h.at && minutes(nowHM) - minutes(h.at) > 180
const whenOf = (h: Habit, nowHM: string): NowTask['when'] => (!h.at ? 'free' : h.at < nowHM ? 'late' : 'later')

/**
 * Wat nu aan de beurt is: eerst een grote taak die al te laat is, dan een grote zonder vaste tijd, dan de
 * eerstvolgende grote. Zijn de grote af, dan op dezelfde manier een kleinere. Heb je ergens een deadline op gezet,
 * dan blijft die staan, ook als er intussen een andere te laat raakt.
 */
export const nowTask = (s: State, date: string, nowHM: string): NowTask | null => {
  const v = s.logs[date]?.v ?? {}
  const open = (h: Habit) => !(isDone(h, v[h.id] ?? 0) && (v[h.id] ?? 0) > 0)
  const big = bigTasksOn(s, date).filter((h) => open(h) && !tooLate(h, nowHM))
  const other = otherTasksOn(s, date).filter((h) => open(h) && !tooLate(h, nowHM))
  const due = s.logs[date]?.due
  const busy = due && [...big, ...other].find((h) => h.id === due.id)
  if (busy) return { h: busy, big: big.includes(busy), when: whenOf(busy, nowHM) }
  const pick = (list: Habit[], isBig: boolean): NowTask | null => {
    const h = list.filter((x) => x.at && x.at < nowHM).sort(byTime)[0] ?? list.find((x) => !x.at) ?? list.filter((x) => x.at).sort(byTime)[0]
    return h ? { h, big: isBig, when: whenOf(h, nowHM) } : null
  }
  return pick(big, true) ?? pick(other, false)
}
