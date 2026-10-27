import type { SinId } from './sins'

/** De vier onderdelen van je spiegel. */
export type Domain = 'financieel' | 'spiritueel' | 'fysiek' | 'mentaal'

export const DOMAINS: { id: Domain; name: string; line: string; sin: SinId }[] = [
  { id: 'fysiek', name: 'Fysiek', line: 'Je lichaam: kracht, conditie, gewicht, slaap.', sin: 'sloth' },
  { id: 'mentaal', name: 'Mentaal', line: 'Je hoofd: discipline, focus, angst, wat je uitstelt.', sin: 'sloth' },
  { id: 'financieel', name: 'Financieel', line: 'Je geld: schulden, sparen, inkomen, je eigen zaak.', sin: 'greed' },
  { id: 'spiritueel', name: 'Spiritueel', line: 'Je binnenkant: rust, zingeving, vergeving, wie je wilt zijn.', sin: 'pride' },
]
export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<Domain, (typeof DOMAINS)[number]>

// Een eerste gok voor het onderdeel op basis van je woorden, zodat je meestal alleen hoeft te bevestigen.
const DOMAIN_HINTS: [Domain, RegExp][] = [
  ['financieel', /geld|schuld|sparen|spaar|inkomen|salaris|bedrijf|omzet|klant|budget|euro|€|beleggen|huur|rood/i],
  ['fysiek', /kilo|gewicht|vet|trainen|sport|gym|rennen|hardlo|marathon|conditie|kracht|eten|suiker|slaap|lichaam|buik|roken|drinken/i],
  ['spiritueel', /medit|bidden|geloof|zin|vergeef|vergeving|dankbaar|stilte|ziel|rust|ego|nederig|waarden/i],
  ['mentaal', /angst|bang|uitstel|stel\w* .*\buit\b|project|discipline|focus|telefoon|scherm|lezen|leren|praten|zelfvertrouwen|piekeren|boos|stress/i],
]
export const guessDomain = (text: string): Domain | undefined => DOMAIN_HINTS.find(([, re]) => re.test(text))?.[0]

/**
 * Ladders: van een eerste stap die je vandaag kunt zetten tot het doel zelf. Elke trede is net iets
 * ongemakkelijker dan de vorige (Goggins: eelt op je geest kweek je stap voor stap, niet in één keer).
 * Per onderdeel een paar ladders met trefwoorden; past er geen, dan de algemene ladder van dat onderdeel.
 */
interface Ladder { match?: RegExp; steps: string[] }

const LADDERS: Record<Domain, Ladder[]> = {
  fysiek: [
    { match: /kilo|gewicht|vet|afvallen|buik|dik/i, steps: [
      'Weeg jezelf vandaag en schrijf het getal op, hoe pijnlijk ook',
      'Een week lang alles opschrijven wat je eet, zonder iets te veranderen',
      'Twee weken geen suiker en geen frisdrank',
      'Vier weken elke dag 10.000 stappen, ook als het regent',
      'Drie maanden 0,5 kilo per week eraf, elke week op dezelfde dag wegen',
      'Je doelgewicht halen en het drie maanden vasthouden',
    ] },
    { match: /hardlo|rennen|marathon|5 ?km|10 ?km|conditie|loop/i, steps: [
      'Vandaag 15 minuten wandelen-hardlopen, om en om',
      '5 km lopen zonder stoppen, hoe langzaam ook',
      'Drie keer per week lopen, vier weken lang, geen week overslaan',
      'Schrijf je in voor een wedstrijd die je eng vindt',
      'Je langste duurloop ooit, op een dag dat je geen zin hebt',
      'De wedstrijd lopen en uitlopen',
    ] },
    { match: /kracht|sterk|spier|gym|trainen|sport/i, steps: [
      'Vandaag 50 push-ups, verdeeld over de dag',
      'Twee weken elke ochtend trainen, voor je telefoon aanraakt',
      'Een trainingsschema van acht weken kiezen en starten',
      'Je zwaarste set ooit, met iemand die meekijkt',
      'Acht weken zonder één training te missen',
      'Je krachtdoel halen en een nieuw doel zetten',
    ] },
    { match: /slaap|moe|opstaan|vroeg/i, steps: [
      'Vanavond je telefoon buiten de slaapkamer',
      'Een week elke dag op dezelfde tijd op, ook in het weekend',
      'Twee weken om 22:30 in bed, schermen uit om 22:00',
      'Een maand om 5:30 op en direct naar buiten',
      'Drie maanden vaste slaaptijden, geen uitzondering',
    ] },
    { steps: [
      'Vandaag iets fysieks doen waar je tegenop ziet',
      'Een week elke dag bewegen, minimaal 30 minuten',
      'Je lichaam meten: gewicht, rustpols, hoe ver je kunt lopen',
      'Vier weken lang drie keer per week trainen',
      'Een fysieke uitdaging boeken die je eng vindt',
      'Die uitdaging volbrengen',
    ] },
  ],
  mentaal: [
    { match: /telefoon|scherm|scroll|social|instagram|tiktok/i, steps: [
      'Vandaag je schermtijd opzoeken en opschrijven',
      'Social media van je beginscherm, en meldingen uit',
      'Een week het eerste en laatste uur van de dag zonder telefoon',
      'Een volledige dag zonder social media',
      'Een maand onder de twee uur schermtijd per dag',
    ] },
    { match: /angst|bang|zelfvertrouwen|spannend|praten|presentatie/i, steps: [
      'Schrijf op waar je precies bang voor bent, en wat het ergste is dat kan gebeuren',
      'Vandaag één klein ding doen dat je spannend vindt',
      'Een gesprek voeren dat je al weken uitstelt',
      'Je mening geven in een groep waar je meestal zwijgt',
      'Iets doen waarbij je kunt falen, voor publiek',
      'Het ding doen waar dit allemaal om draait',
    ] },
    { match: /uitstel|stel\w* .*\buit\b|discipline|focus|lui|afmaken|af maken|project|deadline/i, steps: [
      'Het belangrijkste ding van morgen vanavond opschrijven',
      'Vijf dagen achter elkaar het zwaarste ding als eerste doen',
      'Twee weken elke dag 90 minuten diep werk, telefoon in een andere kamer',
      'Een project afmaken dat al maanden half af ligt',
      'Een maand zonder één dag je belangrijkste taak over te slaan',
    ] },
    { match: /lezen|leren|studie|cursus|taal/i, steps: [
      'Vandaag 20 minuten leren, timer aan',
      'Een week elke dag, ook op dagen zonder zin',
      'Een boek of cursus kiezen en de eerste les doen',
      'Dertig dagen zonder een dag over te slaan',
      'Laten zien wat je hebt geleerd: een toets, een gesprek, iets wat je maakt',
    ] },
    { steps: [
      'Schrijf vandaag eerlijk op wat je jezelf al te lang wijsmaakt',
      'Kies één ding om een week vol te houden, wat er ook gebeurt',
      'Vertel iemand wat je doel is, zodat je er niet meer onderuit kunt',
      'Twee weken het ongemakkelijke ding elke dag als eerste doen',
      'Een maand volhouden zonder één excuus',
    ] },
  ],
  financieel: [
    { match: /schuld|rood|lening|klarna|afbetaling/i, steps: [
      'Vandaag al je schulden op één lijst zetten, met bedragen',
      'Alle abonnementen en vaste lasten nalopen en één opzeggen',
      'Een maand lang elke uitgave opschrijven',
      'De kleinste schuld helemaal aflossen',
      'Elke maand een vast bedrag extra aflossen, zes maanden lang',
      'Schuldenvrij',
    ] },
    { match: /sparen|spaar|buffer|beleggen|vermogen/i, steps: [
      'Vandaag een aparte spaarrekening openen',
      'Een automatische overboeking instellen op de dag dat je salaris binnenkomt',
      'Een maand lang niets kopen wat je niet nodig hebt',
      'Je eerste 1.000 euro buffer',
      'Drie maanden vaste lasten als buffer opbouwen',
    ] },
    { match: /bedrijf|onderneming|klant|omzet|eigen zaak|freelance|verkopen/i, steps: [
      'Je idee op één A4: voor wie, welk probleem, wat het kost',
      'Vijf mensen bellen die je klant zouden kunnen zijn',
      'Een prijs zetten en je aanbod aan één persoon voorleggen',
      'Je eerste betalende klant',
      'Inschrijven bij de KvK',
      'Een maand waarin je bedrijf je vaste lasten betaalt',
    ] },
    { match: /inkomen|salaris|opslag|baan|meer verdienen/i, steps: [
      'Opzoeken wat mensen met jouw werk verdienen',
      'Opschrijven wat je dit jaar hebt bereikt, in cijfers',
      'Een gesprek inplannen over je salaris',
      'Om de opslag vragen, met een bedrag',
      'Een vaardigheid leren waarmee je meer waard wordt',
    ] },
    { steps: [
      'Vandaag je saldo en je schulden opschrijven, zonder weg te kijken',
      'Een maand lang elke uitgave bijhouden',
      'Eén vaste last schrappen',
      'Elke maand automatisch een vast bedrag opzij',
      'Een financieel doel halen dat je eerst onhaalbaar vond',
    ] },
  ],
  spiritueel: [
    { match: /medit|stilte|rust|adem/i, steps: [
      'Vandaag 5 minuten stil zitten, zonder telefoon of muziek',
      'Een week elke ochtend 10 minuten mediteren',
      'Een uur alleen in stilte, buiten',
      'Dertig dagen zonder een dag over te slaan',
      'Een dag of weekend in stilte',
    ] },
    { match: /vergeef|vergeving|ruzie|wrok|familie/i, steps: [
      'Opschrijven wie je iets kwalijk neemt, en waarom',
      'Een brief schrijven die je niet verstuurt',
      'Je eigen aandeel opschrijven, eerlijk',
      'Het gesprek aangaan of het bericht sturen',
      'Loslaten: niet meer terugkomen op wat er gebeurd is',
    ] },
    { match: /dankbaar|zin|waarden|wie ik wil|doel in/i, steps: [
      'Vanavond drie dingen opschrijven waar je dankbaar voor bent',
      'Je vijf belangrijkste waarden opschrijven',
      'Een week checken: heb ik vandaag naar die waarden geleefd?',
      'Iets doen voor een ander zonder dat iemand het weet',
      'Een keuze maken die bij je waarden past, ook als die je iets kost',
    ] },
    { steps: [
      'Vandaag 10 minuten stil zitten en opschrijven wat er bovenkomt',
      'Een week elke avond eerlijk terugkijken op je dag',
      'Opschrijven wie je over tien jaar wilt zijn',
      'Iets doen voor een ander, zonder dat het moet',
      'Een maand leven naar wat je opschreef',
    ] },
  ],
}

/**
 * De ladder bij jouw post-it. Staat er een getal in je doel, dan bouwt de app de ladder daaruit;
 * anders de eerste vaste ladder die past bij je woorden, of de algemene van het onderdeel.
 */
export const ladderFor = (domain: Domain, text: string): string[] =>
  numericLadder(text) ?? (LADDERS[domain].find((l) => l.match?.test(text)) ?? LADDERS[domain][LADDERS[domain].length - 1]).steps

// ── Ladders uit een getal ──
// Staat er een aantal in je doel ("10 klanten benaderen", "12 kilo eraf", "1.000 euro sparen"), dan bouwt de app
// een ladder die altijd zo opbouwt: voorbereiden, de eerste, een kwart, de helft, alles, en de lat hoger.

/** Dutch getal: "1.000" is duizend, "1,5" is anderhalf. */
const parseNum = (raw: string) => Number(/^\d{1,3}(\.\d{3})+$/.test(raw) ? raw.replace(/\./g, '') : raw.replace(',', '.'))
const fmtNum = (n: number) => (Number.isInteger(n) ? n : Math.round(n * 10) / 10).toLocaleString('nl-NL')
/** Mooi afgerond bedrag: 1.000 wordt geen 333,33 maar 350. */
const nice = (n: number) => (n >= 1000 ? Math.round(n / 100) * 100 : n >= 100 ? Math.round(n / 5) * 5 : n >= 10 ? Math.round(n) : Math.round(n * 10) / 10)
/** Treden die echt oplopen: 1, een kwart, de helft, alles (geen dubbele bij kleine aantallen). */
const rungs = (n: number, first: number) => {
  const q = Math.max(first, Math.ceil(n / 4))
  const h = Math.max(q, Math.ceil(n / 2))
  return { first, q: q > first ? q : null, h: h > q && h < n ? h : null }
}

// Werkwoorden: gebiedende wijs (voor "de eerste") en voltooid deelwoord (voor "3 benaderd")
const VERBS: Record<string, [string, string]> = {
  benaderen: ['benader', 'benaderd'], bellen: ['bel', 'gebeld'], mailen: ['mail', 'gemaild'], sturen: ['stuur', 'gestuurd'], versturen: ['verstuur', 'verstuurd'],
  spreken: ['spreek', 'gesproken'], vragen: ['vraag', 'gevraagd'], ontmoeten: ['ontmoet', 'ontmoet'], uitnodigen: ['nodig', 'uitgenodigd'],
  verkopen: ['verkoop', 'verkocht'], pitchen: ['pitch', 'gepitcht'], lezen: ['lees', 'gelezen'], schrijven: ['schrijf', 'geschreven'],
  leren: ['leer', 'geleerd'], maken: ['maak', 'gemaakt'], afmaken: ['maak', 'afgemaakt'], bouwen: ['bouw', 'gebouwd'], posten: ['post', 'gepost'],
  publiceren: ['publiceer', 'gepubliceerd'], opnemen: ['neem', 'opgenomen'], lopen: ['loop', 'gelopen'], rennen: ['ren', 'gerend'],
  fietsen: ['fiets', 'gefietst'], zwemmen: ['zwem', 'gezwommen'], trainen: ['train', 'getraind'], doen: ['doe', 'gedaan'], halen: ['haal', 'gehaald'],
  geven: ['geef', 'gegeven'], helpen: ['help', 'geholpen'], bezoeken: ['bezoek', 'bezocht'], solliciteren: ['solliciteer', 'gesolliciteerd'],
  oefenen: ['oefen', 'geoefend'], afronden: ['rond', 'afgerond'], opruimen: ['ruim', 'opgeruimd'], koken: ['kook', 'gekookt'],
}
const verbIn = (text: string) => {
  const words = text.toLowerCase().match(/[a-zà-ÿ]+/g) ?? []
  const v = words.find((x) => VERBS[x])
  return v ? VERBS[v] : null
}

/** Dingen die je in een middag doet (een mail, een telefoontje): die doe je met urgentie, deze week. */
const QUICK = new Set(['benaderd', 'gebeld', 'gemaild', 'gestuurd', 'verstuurd', 'gesproken', 'gevraagd', 'uitgenodigd', 'gepitcht', 'gepost', 'gesolliciteerd', 'ontmoet', 'gegeven', 'geholpen', 'bezocht'])

const REPS = /^(push-?ups?|opdrukken|pull-?ups?|optrekken|squats?|burpees?|sit-?ups?|lunges?|dips)$/i
const PEOPLE = /^(klanten|mensen|bedrijven|partijen|partners|leads|contacten|investeerders|vrienden|werkgevers|vacatures|bureaus|winkels)$/i

/** Een ladder uit het getal in je doel, of null als er geen bruikbaar getal in staat. */
export const numericLadder = (text: string): string[] | null => {
  const time = text.match(/\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/)
  const clean = time ? text.replace(time[0], ' ') : text
  const what = time ? (text.slice(text.indexOf(time[0]) + time[0].length).match(/^\s*(?:uur\s+)?([a-zà-ÿ]+(?:\s+[a-zà-ÿ]+){0,3})/i)?.[1] ?? '') : ''
  const timeStep = time ? `Twee weken elke dag om ${time[1]}:${time[2]}${what ? ` ${what.toLowerCase()}` : ''}, geen uitzondering` : null
  const withTime = (steps: string[]) => (timeStep ? [steps[0], timeStep, ...steps.slice(1)] : steps)

  // Gewicht: "12 kilo", "8 kg"
  let m = clean.match(/(\d[\d.,]*)\s*(kilo'?s?|kg)\b/i)
  if (m) {
    const n = parseNum(m[1])
    const r = rungs(n, 1)
    return withTime([
      `Weeg je vandaag, schrijf het getal op en zet je doel ernaast: ${fmtNum(n)} kilo eraf`,
      'De eerste kilo eraf',
      ...(r.q ? [`${fmtNum(r.q)} kilo eraf`] : []),
      ...(r.h ? [`Halverwege: ${fmtNum(r.h)} kilo eraf, ook als de weegschaal een week stilstaat`] : []),
      `Het doel: ${fmtNum(n)} kilo eraf`,
      'Lat hoger: drie maanden op je nieuwe gewicht blijven, elke week wegen',
    ])
  }

  // Geld: "1.000 euro", "€500"
  m = clean.match(/(?:€\s?(\d[\d.,]*))|(\d[\d.,]*)\s*(euro|eur)\b/i)
  if (m) {
    const n = parseNum(m[1] ?? m[2])
    const verb = verbIn(clean)
    const part = verb ? verb[1] : /verdien|omzet|inkomen|klant/i.test(clean) ? 'verdiend' : 'gespaard'
    return withTime([
      `Een aparte rekening of potje openen en je doel van €${fmtNum(n)} erop zetten`,
      `De eerste €${fmtNum(nice(n / 10))} ${part}`,
      `€${fmtNum(nice(n / 4))} ${part}`,
      `Halverwege: €${fmtNum(nice(n / 2))} ${part}, ook in een maand dat het tegenzit`,
      `Het doel: €${fmtNum(n)} ${part}`,
      `Lat hoger: €${fmtNum(nice(n * 2))}, het dubbele`,
    ])
  }

  // Afstand: "10 km", "42 kilometer"
  m = clean.match(/(\d[\d.,]*)\s*(km|kilometer)\b/i)
  if (m) {
    const n = parseNum(m[1])
    const verb = verbIn(clean) ?? ['loop', 'gelopen']
    return withTime([
      `Je route of wedstrijd kiezen, en je schoenen vanavond al klaarzetten`,
      `${fmtNum(nice(Math.max(1, n / 10)))} km ${verb[1]} zonder stoppen`,
      `${fmtNum(nice(n / 4))} km ${verb[1]}, drie keer deze week`,
      `Halverwege: ${fmtNum(nice(n / 2))} km ${verb[1]}, op een dag dat je geen zin hebt`,
      `Het doel: ${fmtNum(n)} km ${verb[1]}`,
      `Lat hoger: ${fmtNum(n)} km sneller, of ${fmtNum(nice(n * 1.5))} km`,
    ])
  }

  // Een aantal met iets erachter: "10 klanten benaderen", "50 push-ups", "20 boeken lezen"
  m = clean.match(/(\d[\d.,]*)\s+([a-zà-ÿ-]+)/i)
  if (!m) return null
  const n = parseNum(m[1])
  if (!Number.isFinite(n) || n < 2) return null
  const noun = m[2].toLowerCase()

  if (REPS.test(noun)) {
    const r = rungs(n, Math.max(1, Math.ceil(n / 5)))
    return withTime([
      `Test hoeveel ${noun} je nu in één keer kunt, en schrijf het op`,
      `Een week elke dag ${fmtNum(r.first)} ${noun}, verdeeld over de dag`,
      ...(r.q ? [`${fmtNum(r.q)} ${noun} in één set`] : []),
      ...(r.h ? [`Halverwege: ${fmtNum(r.h)} ${noun} in één set, ook als je armen trillen`] : []),
      `Het doel: ${fmtNum(n)} ${noun} in één set`,
      `Lat hoger: elke dag ${fmtNum(n)} ${noun}, een maand lang`,
    ])
  }

  const verb = verbIn(clean.slice(clean.indexOf(m[0]) + m[0].length)) ?? verbIn(clean) ?? ['doe', 'gedaan']
  const r = rungs(n, 1)
  const who = PEOPLE.test(noun)
  return withTime([
    who ? `Voorbereiden: schrijf de ${fmtNum(n)} ${noun} op, met waarom juist zij` : `Voorbereiden: zet je ${fmtNum(n)} ${noun} op een lijst en plan wanneer`,
    QUICK.has(verb[1]) ? `De eerste: ${verb[0]} er één, vandaag. Dat is de engste stap` : `De eerste: begin vandaag, en heb er deze week één ${verb[1]}`,
    ...(r.q ? [`Een kwart: ${fmtNum(r.q)} ${noun} ${verb[1]}`] : []),
    ...(r.h ? [`De helft: ${fmtNum(r.h)} ${noun} ${verb[1]}, ${who ? 'ook na een nee' : 'ook in een week dat het tegenzit'}`] : []),
    `Het doel: alle ${fmtNum(n)} ${noun} ${verb[1]}`,
    who ? `Lat hoger: nog ${fmtNum(n)} erbij, en wie nee zei over drie maanden opnieuw, met een betere aanpak` : `Lat hoger: nog ${fmtNum(n)}, sneller of beter dan de eerste keer`,
  ])
}

// ── Elke stap een eigen termijn, in het tempo van Goggins ──
// Can't Hurt Me, challenge 2: elke stap is zijn eigen post-it met een termijn, zoals "twee pond eraf in de
// eerste week", daarna stappen van twee tot vijf pond. Dat is ongeveer een kilo per week: stevig, maar vol te houden.
// Challenge 7: bouw kracht en afstand op met 5 tot 10 procent per week, dan blijf je heel.
// En met urgentie (Never Finished): wat je zelf in de hand hebt, zoals mensen benaderen, doe je deze week, niet "ooit".

const kiloIn = (t: string) => {
  if (/eerste kilo/i.test(t)) return 1
  const m = t.match(/(\d[\d.,]*)\s*kilo/i)
  return m ? Number(m[1].replace(',', '.')) : null
}

/** Een aantal met een voltooid deelwoord ("3 klanten benaderd", "alle 20 boeken gelezen"). */
const countIn = (t: string) => {
  const m = t.match(/^(?:een kwart|de helft|het doel)[^\d]*(\d+)\s+[a-zà-ÿ-]+\s+([a-zà-ÿ]+)/i)
  return m ? { n: Number(m[1]), done: m[2].toLowerCase() } : null
}

/** Herhalingen of kilometers in een stap ("25 push-ups", "2,5 km"), voor de 10%-per-week-regel. */
const amountIn = (t: string) => {
  const m = t.match(/(\d[\d.,]*)\s*(km|kilometer|push-?ups?|opdrukken|pull-?ups?|optrekken|squats?|burpees?|sit-?ups?|lunges?|dips)\b/i)
  return m ? Number(m[1].replace(/\.(?=\d{3})/g, '').replace(',', '.')) : null
}

const KILO_PER_WEEK = 1 // twee pond per week, zoals in het boek
const GROWTH_PER_WEEK = 1.1 // tien procent erbij per week

/** Hoeveel dagen een stap mag duren: uit de woorden van de stap, anders een week. */
const daysFor = (t: string, i: number, total: number, prev: { kilo: number; amount: number; count: number }) => {
  if (i === 0) return 1
  if (/^lat hoger/i.test(t)) return 30
  const k = kiloIn(t)
  if (k !== null && k > prev.kilo) return Math.ceil((k - prev.kilo) / KILO_PER_WEEK) * 7
  // Kracht en afstand: tien procent per week, minstens een week per stap.
  // Hardlopen vanaf een kleine basis mag sneller: een halve kilometer per week erbij is ook veilig.
  const a = amountIn(t)
  if (a !== null && prev.amount > 0 && a > prev.amount) {
    const pct = Math.ceil(Math.log(a / prev.amount) / Math.log(GROWTH_PER_WEEK))
    const weeks = /km|kilometer/i.test(t) ? Math.min(pct, Math.ceil((a - prev.amount) / 0.5)) : pct
    return Math.max(1, weeks) * 7
  }
  // Geld sparen of verdienen gaat per maand; de eerste euro's binnen een week
  if (/€/.test(t)) return i === 1 ? 7 : 30
  if (/deze week één/i.test(t)) return 7
  if (/vandaag/i.test(t)) return 1
  // Aantallen: wat je in een middag doet (mensen benaderen, bellen) met urgentie, de rest één per week (een boek, een les)
  const c = countIn(t)
  if (c) {
    if (QUICK.has(c.done)) return /^een kwart/i.test(t) ? 3 : /^de helft/i.test(t) ? 4 : 7
    return Math.max(1, c.n - prev.count) * 7
  }
  if (/^drie maanden/i.test(t)) return 90
  if (/^(dertig dagen|een maand|vier weken)/i.test(t)) return 30
  if (/^twee weken/i.test(t)) return 14
  if (/^(een week|vijf dagen|zeven dagen)/i.test(t)) return 7
  if (/^het doel/i.test(t)) return 14
  return i === total - 1 ? 30 : 7
}

/** De ladder met een termijn per stap. Je doel gaat voor; staat daar geen getal in, dan je harde waarheid. */
export const planFor = (domain: Domain, goal: string, truth = ''): { text: string; days: number }[] => {
  const steps = (goal.trim() && numericLadder(goal)) || ladderFor(domain, goal.trim() ? `${goal}. ${truth}` : truth)
  const prev = { kilo: 0, amount: 0, count: 1 }
  return steps.map((text, i) => {
    const days = daysFor(text, i, steps.length, prev)
    if (i > 0) {
      prev.kilo = kiloIn(text) ?? prev.kilo
      prev.amount = amountIn(text) ?? prev.amount
      prev.count = countIn(text)?.n ?? prev.count
    }
    return { text, days }
  })
}

/** Een termijn in woorden: vandaag, binnen 3 dagen, binnen 2 weken. */
export const termLabel = (days: number) =>
  days <= 1 ? 'vandaag' : days < 7 ? `binnen ${days} dagen` : days === 7 ? 'binnen een week' : days < 63 ? `binnen ${Math.round(days / 7)} weken` : `binnen ${Math.round(days / 30)} maanden`
