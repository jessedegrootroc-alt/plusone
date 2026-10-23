import type { State } from '../lib/store'
import { addDays, todayISO } from '../lib/store'

/** Voorwerpen in de scène: voor je verleidingen (ART-PIPELINE stap 49–69) en je goede gewoontes (stap 70–84). */
export type ObjectId =
  | 'telefoon' | 'laptop' | 'asbak' | 'vape' | 'drankfles' | 'blikje' | 'fastfood' | 'snoep' | 'dobbelstenen'
  | 'speelkaarten' | 'munten' | 'boodschappentas' | 'wekker' | 'controller' | 'afstandsbediening' | 'gebroken-glas' | 'brief' | 'tijdschriften' | 'handspiegel' | 'kroon' | 'masker'
  | 'kettlebell' | 'hardloopschoenen' | 'ijsbad' | 'saunaemmer' | 'saunastenen' | 'boeken' | 'dagboek' | 'kaars' | 'meditatiekussen'
  | 'fruitschaal' | 'waterkruik' | 'brood' | 'spaarpot' | 'lantaarn' | 'pelgrimsstaf'

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
  gossip: 'brief', grudge: 'brief', complain: 'brief', victim: 'brief',
  compare: 'tijdschriften', thirst: 'tijdschriften',
  brag: 'handspiegel', selfbash: 'handspiegel',
  nohelp: 'kroon',
  lying: 'masker', excuses: 'masker',
}

// Per goede gewoonte het voorwerp dat erbij hoort. Niet genoemd: de kettlebell.
const BY_VIRTUE: Record<string, ObjectId> = {
  workout: 'kettlebell', pushups: 'kettlebell', mobility: 'kettlebell', hardthing: 'kettlebell',
  run: 'hardloopschoenen', steps: 'hardloopschoenen',
  cold: 'ijsbad', wimhof: 'meditatiekussen', sauna: 'saunaemmer',
  read: 'boeken', learn: 'boeken', deepwork: 'boeken',
  journal: 'dagboek', gratitude: 'dagboek', plan: 'dagboek', therapy: 'dagboek',
  meditate: 'kaars', boxbreath: 'kaars', pause: 'kaars',
  fruit: 'fruitschaal', veg: 'fruitschaal', water: 'waterkruik', noalcohol: 'waterkruik',
  cooked: 'brood', protein: 'brood', sugar: 'fruitschaal', nosnack: 'fruitschaal', fasting: 'waterkruik',
  save: 'spaarpot', budget: 'spaarpot', nospend: 'spaarpot', give: 'spaarpot', help: 'brood', volunteer: 'brood',
  early: 'lantaarn', sunlight: 'lantaarn', sleep: 'kaars', nophonehour: 'lantaarn', bed: 'lantaarn',
  walk: 'pelgrimsstaf', presence: 'pelgrimsstaf', reachout: 'pelgrimsstaf', listen: 'pelgrimsstaf', compliment: 'pelgrimsstaf', sorry: 'pelgrimsstaf', feedback: 'dagboek',
  phoneout: 'lantaarn', greyscale: 'lantaarn', blocker: 'lantaarn', screenlimit: 'lantaarn',
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

const baseKey = (id: string) => id.replace(/-[a-z0-9]{8}$/, '')

/**
 * Het voorwerp van je sterkste goede gewoonte: de zwaarste die je de afgelopen twee weken het vaakst deed.
 * Zonder goede gewoontes: de kettlebell.
 */
export const strongestVirtueObject = (s: State): ObjectId => {
  const today = todayISO()
  let best: { o: ObjectId; score: number } | null = null
  for (const h of s.habits.filter((x) => x.kind === 'virtue')) {
    let done = 0
    for (let i = 0; i < 14; i++) {
      const v = s.logs[addDays(today, -i)]?.v[h.id] ?? 0
      if (h.type === 'do' ? v >= 1 : h.type === 'target' ? v >= (h.amount ?? 1) : v <= (h.amount ?? 0)) done++
    }
    const score = h.weight * 2 + done
    if (!best || score > best.score) best = { o: BY_VIRTUE[baseKey(h.id)] ?? 'kettlebell', score }
  }
  return best?.o ?? 'kettlebell'
}
