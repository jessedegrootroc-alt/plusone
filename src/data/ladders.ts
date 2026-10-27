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

/** De ladder bij jouw post-it: de eerste die past bij je woorden, anders de algemene van het onderdeel. */
export const ladderFor = (domain: Domain, text: string): string[] =>
  (LADDERS[domain].find((l) => l.match?.test(text)) ?? LADDERS[domain][LADDERS[domain].length - 1]).steps
