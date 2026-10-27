// De emblemen van je ideale zelf komen van je spiegel: elke post-it kan er een dragen.
// Haal je hem, dan verdien je het embleem en staat het in Paradiso. (Vroeger stonden doelen los op Reis.)
import type { FeatureId } from '../data/catalog'
import { guessDomain, guessSin, planFor } from '../data/ladders'
import { todayISO, uid, update, type Goal, type MirrorNote, type State } from './store'

const unique = <T,>(xs: T[]) => [...new Set(xs)]

/** Waar je naartoe werkt: de kenmerken van je ideale zelf en de emblemen op je post-its. */
export const aimedFeatures = (s: State): FeatureId[] => unique([...s.avatar.features, ...(s.notes ?? []).flatMap((n) => (n.feature ? [n.feature] : []))])

/** Wat je verdiend hebt: de emblemen van post-its die je echt hebt gehaald. */
export const earnedFeatures = (s: State): FeatureId[] => unique((s.notes ?? []).flatMap((n) => (n.doneAt && n.feature ? [n.feature] : [])))

/** Een los doel wordt een post-it met een ladder, en het embleem gaat mee. */
export const noteFromGoal = (g: Pick<Goal, 'text' | 'feature' | 'done'>, today = todayISO()): MirrorNote => {
  // Zonder herkenbaar onderdeel: mentaal, want een doel halen is eerst een kwestie van je hoofd
  const domain = guessDomain(g.text) ?? 'mentaal'
  return {
    id: uid(),
    text: g.text,
    feature: g.feature,
    domain,
    sin: guessSin(g.text, domain),
    steps: planFor(domain, '', g.text).map((p, i) => ({ ...p, startedAt: i === 0 ? today : undefined })),
    createdAt: today,
    doneAt: g.done ? today : undefined,
  }
}

/** Eenmalig: oude doelen naar de spiegel. Daarna is de lijst leeg en gebeurt er niets meer. */
export const migrateGoals = (s: State) => {
  if (!s.goals?.length) return
  update((d) => {
    d.notes ??= []
    for (const g of d.goals) if (!d.notes.some((n) => n.feature === g.feature && n.text === g.text)) d.notes.push(noteFromGoal(g))
    d.goals = []
  })
}
