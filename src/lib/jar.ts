// De koektrommel lezen: wat voor overwinning het is, en welke het beste past bij wat je vandaag moet doen.
import type { JarItem } from './store'

const KINDS: { re: RegExp; label: string; big?: boolean; tape?: boolean }[] = [
  { re: /^Ondanks angst: /, label: 'Ondanks angst', big: true, tape: true },
  { re: /^Van de spiegel: /, label: 'Van de spiegel', big: true, tape: true },
  { re: /^Grens verlegd: /, label: 'Grens verlegd', big: true },
  { re: /^(?=Drang naar )/, label: 'Golf uitgezeten' },
]

/** Een briefje uit de koektrommel: soort, tekst zonder voorvoegsel, en of het een grote was. */
export const readJar = (j: JarItem) => {
  const k = KINDS.find((x) => x.re.test(j.text))
  return { label: k?.label ?? 'Overwinning', text: k ? j.text.replace(k.re, '') : j.text, big: !!k?.big, tape: !!k?.tape }
}

// Onderwerpen, zodat "marathon" bij "160 km gelopen" past en "workout" bij "ijsbad"
const TOPICS: [string, RegExp][] = [
  ['lopen', /loop|lopen|gelopen|ren|hardlop|km|marathon|stappen|wandel/],
  ['kracht', /workout|train|sport|push|kracht|halter|gym|squat|burpee/],
  ['kou', /ijsbad|koud|kou|douche|sauna|regen/],
  ['vroeg', /\bop\b|opstaan|wekker|snooze|ochtend|5:30|6:00|6:30|vroeg/],
  ['eten', /eten|suiker|kilo|gewicht|snack|vet|drank|wijn|bier|alcohol|fles/],
  ['scherm', /telefoon|scherm|scroll|social|porno|instagram|tiktok/],
  ['werk', /klant|bel|offerte|bedrijf|werk|mail|project|afmaken|deadline/],
  ['mensen', /moeder|vader|vriend|praat|gesprek|sorry|excuus|nee gezegd/],
  ['geld', /geld|spaar|euro|€|uitgave|gok|kopen/],
]
const topicsOf = (t: string) => new Set(TOPICS.filter(([, re]) => re.test(t.toLowerCase())).map(([k]) => k))

/**
 * Het bewijs voor vandaag, zoals Goggins: "ik moet een marathon lopen, maar ik liep al eens 160 km".
 * Liefst een overwinning over hetzelfde onderwerp, en liefst een grote (spiegel of grens). Elke dag een vaste keus,
 * met `shift` blader je naar het volgende bewijs.
 */
export const proofFor = (jar: JarItem[], task: string, seed: string, shift = 0): JarItem | null => {
  if (!jar.length) return null
  const want = topicsOf(task)
  const scored = jar.map((j, i) => {
    const r = readJar(j)
    const overlap = [...topicsOf(r.text)].filter((t) => want.has(t)).length
    return { j, score: overlap * 3 + (r.big ? 2 : 0) + (i < 10 ? 0.5 : 0) }
  })
  // Best passend eerst; bij gelijke stand kiest de dag welke voorop staat. Bladeren loopt daarna door de rest.
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const order = scored.map((x, i) => ({ ...x, tie: (h + i * 2654435761) >>> 0 })).sort((a, b) => b.score - a.score || a.tie - b.tie)
  return order[shift % order.length].j
}
