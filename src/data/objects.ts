import type { State } from '../lib/store'
import { addDays, todayISO } from '../lib/store'

/** Voorwerpen in de scène voor je verleidingen (ART-PIPELINE stap 49–65). */
export type ObjectId =
  | 'telefoon' | 'laptop' | 'asbak' | 'vape' | 'drankfles' | 'blikje' | 'fastfood' | 'snoep' | 'dobbelstenen'
  | 'speelkaarten' | 'munten' | 'boodschappentas' | 'wekker' | 'controller' | 'afstandsbediening' | 'gebroken-glas' | 'brief'

// Per verleiding (sleutel uit catalog.ts) het voorwerp dat erbij hoort. Niet genoemd: de telefoon.
const BY_HABIT: Record<string, ObjectId> = {
  porn: 'laptop', doomscroll: 'laptop', screentime: 'laptop', switch: 'laptop',
  smoke: 'asbak', vape: 'vape', snus: 'vape',
  alcohol: 'drankfles', bingedrink: 'drankfles', drugs: 'drankfles', weed: 'asbak',
  soda: 'blikje', energy: 'blikje', caffeine: 'blikje',
  fastfood: 'fastfood', binge: 'fastfood', latesnack: 'fastfood', sweets: 'snoep',
  gamble: 'dobbelstenen', casino: 'speelkaarten', crypto: 'munten', lottery: 'munten',
  impulse: 'boodschappentas', bnpl: 'boodschappentas',
  snooze: 'wekker', late: 'wekker', procrastinate: 'wekker', skipworkout: 'wekker',
  gaming: 'controller', 'binge-tv': 'afstandsbediening',
  outburst: 'gebroken-glas', snap: 'gebroken-glas', roadrage: 'gebroken-glas', onlinefight: 'gebroken-glas',
  gossip: 'brief', grudge: 'brief', complain: 'brief', lying: 'brief', excuses: 'brief',
}

export const objectFor = (habitId: string): ObjectId => BY_HABIT[habitId.replace(/-[a-z0-9]{8}$/, '')] ?? 'telefoon'

/**
 * De voorwerpen van je verleidingen, de sterkste trek eerst: hoe zwaar de verleiding weegt,
 * plus hoe vaak je de afgelopen twee weken toegaf. Zonder verleidingen: de telefoon.
 */
export const pullingObjects = (s: State, max = 3): ObjectId[] => {
  const today = todayISO()
  const pull = new Map<ObjectId, number>()
  for (const h of s.habits.filter((x) => x.kind === 'vice')) {
    let slips = 0
    for (let i = 0; i < 14; i++) {
      const v = s.logs[addDays(today, -i)]?.v[h.id] ?? 0
      if (h.type === 'avoid' ? v >= 1 : v > (h.amount ?? 0)) slips++
    }
    const o = objectFor(h.id)
    pull.set(o, (pull.get(o) ?? 0) + h.weight + slips * 2)
  }
  const list = [...pull.entries()].sort((a, b) => b[1] - a[1]).map(([o]) => o)
  return (list.length ? list : ['telefoon']).slice(0, max) as ObjectId[]
}
