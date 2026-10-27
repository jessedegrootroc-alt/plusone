// Je niveau, zoals Goggins zou meten: niet hoe "deugdzaam" je bent, maar wat je doet.
// De zeven zonden blijven de kaart (wáár je werkt); dit zegt óf je het doet.
// Vier maatstaven over de laatste vier weken, plus hoe lang je het volhoudt.
import { grensWeight, habitsFor, isDone, isNote, stepWeight } from './score'
import { addDays, todayISO, type State } from './store'

const LEVELS = [
  { min: 0, name: 'Zacht' },
  { min: 35, name: 'Gemiddeld' },
  { min: 60, name: 'Ongewoon' },
  { min: 85, name: 'Beest' },
] as const
export type LevelName = (typeof LEVELS)[number]['name']

const WINDOW = 28 // vier weken
const SPAN_WEEKS = 12 // volhouden meet je over een kwartaal: één goede week maakt je geen beest
const DISCOMFORT_PER_WEEK = 4 // twee grenzen of stappen per week, gemiddeld spannend (2×)

export interface Measure {
  key: 'woord' | 'ongemak' | 'eerlijk' | 'volhouden'
  label: string
  /** 0 tot 1 */
  value: number
  /** Wat je deed, in getallen. */
  detail: string
  /** Wat Goggins zou zeggen als dit je zwakste is. */
  push: string
}

/** De dagen die meetellen: tot en met gisteren, en vandaag pas als je hem hebt afgesloten. */
const daysBack = (s: State, n: number, today: string) => {
  const out: string[] = []
  if (s.logs[today]?.sealed) out.push(today)
  for (let i = 1; out.length < n; i++) {
    const d = addDays(today, -i)
    if (d < s.createdAt) break
    out.push(d)
  }
  return out
}

/** Woord gehouden: van je niet-onderhandelbare dingen, hoeveel deed je echt? */
const keptWord = (s: State, days: string[]) => {
  let total = 0
  let done = 0
  for (const d of days) {
    const l = s.logs[d]
    const hs = habitsFor(s, d).filter((h) => h.kind === 'virtue' && h.weight === 3 && !isNote(h))
    total += hs.length
    done += hs.filter((h) => isDone(h, l?.v[h.id] ?? 0)).length
  }
  return { done, total }
}

export const gogginsLevel = (s: State, today = todayISO()) => {
  const days = daysBack(s, WINDOW, today)
  const from = days[days.length - 1] ?? today
  const weeks = Math.max(1, days.length / 7)

  // 1 · Woord gehouden
  const w = keptWord(s, days)
  const woord = w.total ? w.done / w.total : 0

  // 2 · Ongemak gezocht: stappen van je post-its en verlegde grenzen, hoe enger hoe zwaarder
  let pts = 0
  let count = 0
  for (const n of s.notes ?? []) {
    const steps = n.steps ?? []
    steps.forEach((x, i) => { if (x.doneAt && x.doneAt >= from) { pts += stepWeight(i, steps.length); count++ } })
  }
  for (const c of s.growth ?? []) if (c.status === 'gedaan' && (c.doneAt ?? '') >= from) { pts += grensWeight(c); count++ }
  const ongemak = Math.min(1, pts / (DISCOMFORT_PER_WEEK * weeks))

  // 3 · Eerlijkheid: elke avond in de spiegel kijken, ook na een slechte dag
  const sealed = days.filter((d) => s.logs[d]?.sealed).length
  const eerlijk = days.length ? sealed / days.length : 0

  // 4 · Volhouden: weken waarin je je woord hield (80%) én eerlijk keek (5 avonden), over een kwartaal
  let held = 0
  for (let k = 0; k < SPAN_WEEKS; k++) {
    const wk = Array.from({ length: 7 }, (_, i) => addDays(today, -(k * 7 + i + 1))).filter((d) => d >= s.createdAt)
    if (wk.length < 7) break
    const kw = keptWord(s, wk)
    if (kw.total && kw.done / kw.total >= 0.8 && wk.filter((d) => s.logs[d]?.sealed).length >= 5) held++
  }
  const volhouden = held / SPAN_WEEKS

  const parts: Measure[] = [
    { key: 'woord', label: 'Woord gehouden', value: woord, detail: w.total ? `${w.done} van ${w.total} niet-onderhandelbaar` : 'nog niets niet-onderhandelbaar', push: 'Doe wat je zei, ook zonder zin. Juist dan.' },
    { key: 'ongemak', label: 'Ongemak gezocht', value: ongemak, detail: `${count} ${count === 1 ? 'stap of grens' : 'stappen en grenzen'} in 4 weken`, push: 'Zoek elke week iets op wat je niet wilt. Daar eelt je geest.' },
    { key: 'eerlijk', label: 'Eerlijk gekeken', value: eerlijk, detail: `${sealed} van ${days.length} avonden gespiegeld`, push: 'Kijk elke avond in de spiegel, vooral na een slechte dag.' },
    { key: 'volhouden', label: 'Volgehouden', value: volhouden, detail: `${held} van ${SPAN_WEEKS} weken volgehouden`, push: 'Eén goede week is niets. Doe het week na week.' },
  ]
  // Woord en eerlijkheid tellen kwadratisch: tweederde van je beloftes houden is voor Goggins gemiddeld, niet goed
  const score = Math.round(100 * (0.35 * woord ** 2 + 0.25 * ongemak + 0.2 * eerlijk ** 2 + 0.2 * volhouden))
  const i = LEVELS.findLastIndex((l) => score >= l.min)
  const up = LEVELS[i + 1]
  const weakest = [...parts].sort((a, b) => a.value - b.value)[0]
  return { score, name: LEVELS[i].name as LevelName, next: up ? up.name.toLowerCase() : null, to: up ? up.min - score : 0, parts, weakest }
}
export type GogginsLevel = ReturnType<typeof gogginsLevel>
