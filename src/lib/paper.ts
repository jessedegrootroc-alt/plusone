// Elk papiertje hangt een beetje anders: schuin, iets andere tint, de punaise of het plakband net ergens anders.
// Willekeurig, maar vast per id, zodat een briefje niet bij elke render verspringt.

const hash = (s: string) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}
/** Een vast getal tussen 0 en 1 per id en per eigenschap. */
const rnd = (id: string, salt: number) => (hash(id + ':' + salt) % 10000) / 10000

/** Gebroken wit, nooit helemaal gelijk. */
const TINTS = ['#F2F2F2', '#ECEBE7', '#F5F4F0', '#E7E7E5']

export const paperFor = (id: string, max = 3) => {
  // Nooit bijna recht: tussen 35% en 100% van de maximale hoek, links of rechts
  const side = rnd(id, 1) < 0.5 ? -1 : 1
  const rot = side * max * (0.35 + 0.65 * rnd(id, 2))
  return {
    rot: Math.round(rot * 10) / 10,
    tint: TINTS[Math.floor(rnd(id, 3) * TINTS.length)],
    /** Waar de punaise of het plakband zit, in % van de breedte. */
    pin: Math.round(38 + rnd(id, 4) * 24),
    /** Het plakband hangt zelf ook scheef. */
    tape: Math.round((rnd(id, 5) * 2 - 1) * 8),
    /** Een paar pixels uit het rooster, zodat het met de hand opgehangen lijkt. */
    dx: Math.round((rnd(id, 6) * 2 - 1) * 5),
  }
}
