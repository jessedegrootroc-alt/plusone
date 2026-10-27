import { VICES, VIRTUES } from '../data/catalog'
import { ladderFor } from '../data/ladders'
import { addDays, fromTemplate, todayISO, update } from './store'

/**
 * Vult de app met 21 dagen voorbeelddata om de transformatie te zien.
 * Open met ?demo=good (richting ideale zelf), ?demo=bad (richting de schim) of ?demo=mixed.
 */
export const seedDemo = (mode: string) => {
  const pickV = ['early', 'workout', 'wimhof', 'sauna', 'sugar', 'fruit', 'water', 'meditate', 'read', 'journal']
  const pickX = ['porn', 'smoke', 'gamble', 'doomscroll', 'snooze', 'compare']
  const habits = [
    ...VIRTUES.filter((t) => pickV.includes(t.key)).map(fromTemplate),
    ...VICES.filter((t) => pickX.includes(t.key)).map(fromTemplate),
  ]
  const p = mode === 'good' ? 0.88 : mode === 'bad' ? 0.15 : 0.55
  const start = addDays(todayISO(), -21)
  update((d) => {
    d.onboarded = true
    d.name = d.name || 'Alex'
    d.why = d.why || 'Ik ben het zat om de versie van mezelf te zijn die het opgeeft. Ik wil over een jaar terugkijken en trots zijn.'
    d.habits = habits.map((h) => (h.id.startsWith('workout-') ? { ...h, at: '06:30' } : h.id.startsWith('early-') ? { ...h, weight: 3, at: '06:00' } : h))
    d.notes = [
      { id: 'n1', text: 'Je bent 12 kilo te zwaar. Elke ochtend om 6:30 trainen, geen excuus.', sin: 'gluttony', domain: 'fysiek', steps: ladderFor('fysiek', 'kilo').map((text, i) => ({ text, doneAt: i < 2 ? start : undefined })), createdAt: start },
      { id: 'n2', text: 'Je zegt dat je een bedrijf wilt. Je hebt nog niemand gebeld. Bel deze week drie mensen.', sin: 'sloth', domain: 'financieel', steps: ladderFor('financieel', 'bedrijf').map((text, i) => ({ text, doneAt: i < 1 ? start : undefined })), createdAt: start },
      { id: 'n3', text: 'Je zit elke avond met je hoofd in je telefoon. Je bent rusteloos en leeg.', sin: 'lust', domain: 'spiritueel', steps: ladderFor('spiritueel', 'stilte').map((text) => ({ text })), createdAt: start },
    ]
    d.createdAt = start
    d.logs = {}
    d.avatar = { ...d.avatar, features: ['abs', 'medal', 'frost', 'laurel', 'sun'] }
    d.goals = [
      { id: 'g1', feature: 'abs', text: '12% vetpercentage voor juni' },
      { id: 'g2', feature: 'medal', text: 'Halve marathon onder 1:50' },
      { id: 'g3', feature: 'frost', text: '3 minuten in het ijsbad' },
      { id: 'g4', feature: 'laurel', text: '100 dagen zonder porno' },
      { id: 'g5', feature: 'sun', text: 'Elke werkdag om 5:30 op' },
    ]
    d.jar = [
      { id: 'j1', text: 'Om 22:00 alsnog 5 km gelopen in de regen', date: addDays(todayISO(), -4) },
      { id: 'j2', text: 'Drang naar gokken doorstaan na het voetbal', date: addDays(todayISO(), -9) },
    ]
    for (let day = start; day < todayISO(); day = addDays(day, 1)) {
      const v: Record<string, number> = {}
      for (const h of habits) {
        const good = Math.random() < p
        if (h.type === 'do') v[h.id] = good ? 1 : 0
        else if (h.type === 'avoid') v[h.id] = good ? 0 : 1
        else if (h.type === 'target') v[h.id] = good ? h.amount ?? 1 : Math.floor((h.amount ?? 1) / 3)
        else v[h.id] = good ? Math.min(h.amount ?? 0, Math.floor((h.amount ?? 0) / 2)) : (h.amount ?? 0) + (h.step ?? 1) * 3
      }
      d.logs[day] = { v, sealed: true, energy: Math.random() < 0.2 ? 1 : Math.random() < 0.6 ? 2 : 3 }
    }
    const ago = (n: number) => addDays(todayISO(), -n)
    d.growth = [
      { id: 'c1', area: 'mensen', title: 'Iemand uitgenodigd voor koffie', size: 'klein', fear: 2, status: 'gedaan', createdAt: ago(20), due: ago(17), doneAt: ago(18), felt: 2 },
      { id: 'c2', area: 'lichaam', title: 'Drie minuten in het ijsbad', size: 'klein', fear: 2, status: 'gedaan', createdAt: ago(14), due: ago(10), doneAt: ago(11), felt: 1 },
      { id: 'c3', area: 'werk', title: 'Bedrijfsidee op één A4 uitgeschreven', size: 'klein', fear: 2, status: 'gedaan', createdAt: ago(9), due: ago(5), doneAt: ago(6), felt: 2 },
      { id: 'c4', area: 'werk', title: 'Iemand gebeld die verder is dan jij', size: 'klein', fear: 3, status: 'gedaan', createdAt: ago(6), due: ago(2), doneAt: ago(3), felt: 2 },
      { id: 'c5', area: 'taal', title: 'Een taalpartner gevonden', size: 'groot', step: 'Maak een profiel aan op een tandem-app', fear: 2, status: 'open', createdAt: ago(1), due: addDays(todayISO(), 5) },
    ]
    d.logs[todayISO()] = {
      v: {},
      rocks: [
        { id: 'rock-demo1', text: 'Offerte afmaken', size: 3, at: '12:00' },
        { id: 'rock-demo2', text: 'Moeder bellen', size: 2 },
        { id: 'rock-demo3', text: 'Mail opruimen', size: 1 },
      ],
    }
  })
}
