// Het standaardschema: drie grote taken elke dag, een paar taken op vaste momenten, en twee verleidingen
// die je bijhoudt maar die (nog) niet meetellen. Bij een nieuwe start klaargezet, bij bestaande data als voorstel.
import { addDays, todayISO, uid, type Habit, type State } from './store'

const h = (name: string, weight: 1 | 2 | 3, extra: Partial<Habit> = {}): Habit => ({ id: 'schema-' + uid(), name, sin: 'sloth', kind: 'virtue', type: 'do', weight, ...extra })

export const defaultHabits = (): Habit[] => [
  // Grote taken, elke dag
  h('6:30 op', 3, { at: '06:30', wake: true }),
  h('Bewegen (fietsen naar werk of hardlopen)', 3),
  h('22:30 naar boven, telefoon beneden', 3, { at: '22:30', sin: 'lust' }),
  // Vaste dagen: geen grote taak, telt niet mee voor een gewonnen dag
  h('Hardlopen 30 min, rustig', 2, { schedule: { kind: 'days', days: [2, 4] } }),
  h('Lange loop', 2, { schedule: { kind: 'week', times: 1 }, cue: 'Op zaterdag of zondag' }),
  h('Webjoy', 2, { schedule: { kind: 'week', times: 3 }, cue: '2 avonden en zaterdagochtend' }),
  h('Iets met mijn broertjes', 2, { schedule: { kind: 'month', times: 1 } }),
  // Verleidingen: bijhouden, telt nog niet mee
  { id: 'schema-' + uid(), name: 'Roken', sin: 'gluttony', kind: 'vice', type: 'avoid', weight: 2 },
  { id: 'schema-' + uid(), name: 'Alcohol', sin: 'gluttony', kind: 'vice', type: 'avoid', weight: 2 },
]

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/** Wat uit het schema nog niet bij je gewoontes staat. */
export const missingFromSchema = (s: State) => defaultHabits().filter((x) => !s.habits.some((y) => same(y.name, x.name)))

/** Het schema toevoegen aan je gewoontes, zonder iets van jou weg te halen. */
export const applySchema = (d: State) => {
  for (const x of defaultHabits()) if (!d.habits.some((y) => same(y.name, x.name))) d.habits.push(x)
}

/** Het voorstel staat er alleen als je het nog niet beantwoordde en er iets ontbreekt. */
export const offerSchema = (s: State) => s.onboarded && !s.asked?.schema && missingFromSchema(s).length > 0

/** Na 30 dagen, met minstens 25 gewonnen: één keer vragen of je klaar bent voor taak 4. */
export const offerTask4 = (s: State, won30: number, today = todayISO()) => !s.asked?.task4 && s.createdAt <= addDays(today, -30) && won30 >= 25

/** Taak 4: stoppen met roken of drinken, als grote taak elke dag. */
export const addTask4 = (d: State, what: 'roken' | 'drinken') => {
  d.habits.push(h(what === 'roken' ? 'Niet gerookt' : 'Niet gedronken', 3, { sin: 'gluttony' }))
  d.asked = { ...d.asked, task4: true }
}
