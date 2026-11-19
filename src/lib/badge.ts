// Het getal op je app-icoon: hoeveel taken er vandaag nog open staan (Duolingo's widget, zoals een webapp het kan).
// Op de iPhone werkt dit voor een app op je beginscherm, en alleen met toestemming voor meldingen.
// Alles af? Dan verdwijnt het getal.
import { bigTasksOn, otherTasksOn } from './days'
import { isDone } from './score'
import { getState, todayISO, type State } from './store'

type BadgeNav = Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> }

/** Wat er vandaag nog open staat: grote en andere taken die vandaag gelden. */
export const openToday = (s: State, today = todayISO()) => {
  const l = s.logs[today]
  return [...bigTasksOn(s, today), ...otherTasksOn(s, today)].filter((h) => !(isDone(h, l?.v[h.id] ?? 0) && (l?.v[h.id] ?? 0) > 0)).length
}

let last = -1
export const updateBadge = (s: State = getState()) => {
  const nav = navigator as BadgeNav
  if (!nav.setAppBadge) return
  const n = openToday(s)
  if (n === last) return
  last = n
  ;(n > 0 ? nav.setAppBadge(n) : nav.clearAppBadge?.() ?? nav.setAppBadge(0)).catch(() => { last = -1 })
}
