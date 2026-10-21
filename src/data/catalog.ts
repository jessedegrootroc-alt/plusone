import type { SinId } from './sins'

// do      = goede gewoonte om te doen (ja/nee)
// avoid   = verleiding om te weerstaan (ja/nee)
// target  = goede gewoonte met een hoeveelheid om te halen (minimaal)
// limit   = hoeveelheid om onder te blijven (maximaal)
export type HabitType = 'do' | 'avoid' | 'target' | 'limit'

// Snel kiezen: niet per zonde, maar per plek in je leven, zoals je er zelf over denkt.
export type GroupId = 'scherm' | 'eten' | 'middelen' | 'geld' | 'slaap' | 'lichaam' | 'hoofd' | 'mensen' | 'werk'
export const GROUPS: { id: GroupId; name: string }[] = [
  { id: 'scherm', name: 'Scherm' },
  { id: 'eten', name: 'Eten & drinken' },
  { id: 'middelen', name: 'Middelen' },
  { id: 'slaap', name: 'Slaap & ochtend' },
  { id: 'lichaam', name: 'Lichaam' },
  { id: 'hoofd', name: 'Hoofd' },
  { id: 'mensen', name: 'Mensen' },
  { id: 'werk', name: 'Werk & focus' },
  { id: 'geld', name: 'Geld' },
]

export interface HabitTemplate {
  key: string
  name: string
  sin: SinId
  kind: 'vice' | 'virtue'
  type: HabitType
  weight: 1 | 2 | 3
  group: GroupId
  amount?: number
  unit?: string
  step?: number
}

const v = (
  key: string, name: string, sin: SinId, group: GroupId, type: HabitType, weight: 1 | 2 | 3,
  amount?: number, unit?: string, step?: number,
): HabitTemplate => ({ key, name, sin, group, kind: 'vice', type, weight, amount, unit, step })

const g = (
  key: string, name: string, sin: SinId, group: GroupId, type: HabitType, weight: 1 | 2 | 3,
  amount?: number, unit?: string, step?: number,
): HabitTemplate => ({ key, name, sin, group, kind: 'virtue', type, weight, amount, unit, step })

export const VICES: HabitTemplate[] = [
  // Lust
  v('porn', 'Porno', 'lust', 'scherm', 'avoid', 3),
  v('thirst', 'Lust-scrollen (IG / TikTok)', 'lust', 'scherm', 'avoid', 2),
  v('dating', 'Dating-apps uit verveling', 'lust', 'scherm', 'avoid', 1),
  v('fap', 'Masturberen uit verveling', 'lust', 'lichaam', 'avoid', 1),
  // Vraatzucht
  v('smoke', 'Roken', 'gluttony', 'middelen', 'limit', 3, 0, 'sigaretten', 1),
  v('vape', 'Vapen', 'gluttony', 'middelen', 'avoid', 3),
  v('snus', 'Snus / nicotinezakjes', 'gluttony', 'middelen', 'avoid', 2),
  v('alcohol', 'Alcohol', 'gluttony', 'middelen', 'limit', 2, 0, 'glazen', 1),
  v('bingedrink', 'Meer dan 5 glazen op een avond', 'gluttony', 'middelen', 'avoid', 3),
  v('weed', 'Blowen', 'gluttony', 'middelen', 'avoid', 3),
  v('drugs', 'Partydrugs / harddrugs', 'gluttony', 'middelen', 'avoid', 3),
  v('fastfood', 'Fastfood', 'gluttony', 'eten', 'avoid', 2),
  v('soda', 'Frisdrank', 'gluttony', 'eten', 'limit', 1, 0, 'blikjes', 1),
  v('energy', 'Energydrank', 'gluttony', 'eten', 'limit', 1, 0, 'blikjes', 1),
  v('sweets', 'Snoep, koek of chocola', 'gluttony', 'eten', 'limit', 1, 1, 'keer', 1),
  v('latesnack', 'Snaaien na 20:00', 'gluttony', 'eten', 'avoid', 1),
  v('binge', 'Eetbui', 'gluttony', 'eten', 'avoid', 2),
  v('caffeine', 'Cafeïne', 'gluttony', 'eten', 'limit', 1, 3, 'koppen', 1),
  // Hebzucht
  v('gamble', 'Gokken / sportsbetting', 'greed', 'geld', 'avoid', 3),
  v('casino', 'Online casino / poker', 'greed', 'geld', 'avoid', 3),
  v('crypto', 'Compulsief koersen checken', 'greed', 'geld', 'limit', 1, 1, 'keer', 1),
  v('impulse', 'Impulsaankoop', 'greed', 'geld', 'avoid', 2),
  v('bnpl', 'Kopen op afbetaling (Klarna)', 'greed', 'geld', 'avoid', 2),
  v('lottery', 'Krasloten / loterij', 'greed', 'geld', 'avoid', 1),
  // Traagheid
  v('snooze', 'Snoozen', 'sloth', 'slaap', 'avoid', 2),
  v('phonewake', 'Telefoon pakken direct na het wakker worden', 'sloth', 'slaap', 'avoid', 2),
  v('late', 'Na 23:30 naar bed', 'sloth', 'slaap', 'avoid', 2),
  v('phonebed', 'Telefoon in bed', 'sloth', 'slaap', 'avoid', 1),
  v('shorts', 'Shorts / Reels / TikTok', 'sloth', 'scherm', 'limit', 2, 30, 'min', 15),
  v('doomscroll', 'Doomscrollen (nieuws)', 'sloth', 'scherm', 'limit', 2, 30, 'min', 15),
  v('screentime', 'Schermtijd totaal', 'sloth', 'scherm', 'limit', 2, 180, 'min', 30),
  v('binge-tv', 'Series bingen', 'sloth', 'scherm', 'limit', 1, 1, 'afl.', 1),
  v('gaming', 'Gamen', 'sloth', 'scherm', 'limit', 1, 60, 'min', 15),
  v('procrastinate', 'Belangrijkste taak uitgesteld', 'sloth', 'werk', 'avoid', 2),
  v('switch', 'Mail of chat checken tijdens diep werk', 'sloth', 'werk', 'avoid', 1),
  v('skipworkout', 'Training overgeslagen', 'sloth', 'lichaam', 'avoid', 2),
  // Toorn
  v('outburst', 'Woede-uitbarsting', 'wrath', 'hoofd', 'avoid', 2),
  v('snap', 'Snauwen tegen naasten', 'wrath', 'mensen', 'avoid', 2),
  v('roadrage', 'Schelden in het verkeer', 'wrath', 'hoofd', 'avoid', 1),
  v('onlinefight', 'Online ruzie zoeken', 'wrath', 'scherm', 'avoid', 1),
  v('grudge', 'Wrok blijven voeden', 'wrath', 'hoofd', 'avoid', 1),
  // Afgunst
  v('compare', 'Vergelijken op social media', 'envy', 'scherm', 'avoid', 2),
  v('gossip', 'Roddelen', 'envy', 'mensen', 'avoid', 1),
  v('complain', 'Klagen', 'envy', 'hoofd', 'avoid', 1),
  v('victim', 'Slachtofferdenken', 'envy', 'hoofd', 'avoid', 1),
  // Hoogmoed
  v('excuses', 'Excuses verzinnen', 'pride', 'hoofd', 'avoid', 2),
  v('lying', 'Liegen of dingen mooier maken', 'pride', 'mensen', 'avoid', 2),
  v('nohelp', 'Geen hulp vragen terwijl het nodig was', 'pride', 'mensen', 'avoid', 1),
  v('brag', 'Opscheppen / gelijk willen hebben', 'pride', 'mensen', 'avoid', 1),
  v('selfbash', 'Jezelf afkraken', 'pride', 'hoofd', 'avoid', 1),
]

export const VIRTUES: HabitTemplate[] = [
  // IJver
  g('early', 'Vroeg opstaan (voor 6:30)', 'sloth', 'slaap', 'do', 2),
  g('sleep', 'Op tijd slapen (voor 23:00)', 'sloth', 'slaap', 'do', 2),
  g('nophonehour', 'Eerste uur zonder telefoon', 'sloth', 'slaap', 'do', 2),
  g('sunlight', 'Ochtendlicht (10 min buiten)', 'sloth', 'slaap', 'do', 1),
  g('bed', 'Bed opgemaakt', 'sloth', 'slaap', 'do', 1),
  g('workout', 'Workout', 'sloth', 'lichaam', 'do', 3),
  g('run', 'Hardlopen / zone 2', 'sloth', 'lichaam', 'target', 2, 30, 'min', 5),
  g('steps', 'Stappen', 'sloth', 'lichaam', 'target', 1, 10000, 'stappen', 1000),
  g('pushups', 'Push-ups', 'sloth', 'lichaam', 'target', 1, 50, 'stuks', 10),
  g('mobility', 'Stretchen / mobiliteit', 'sloth', 'lichaam', 'target', 1, 10, 'min', 5),
  g('hardthing', 'Het zware ding gedaan', 'sloth', 'hoofd', 'do', 3),
  g('read', 'Lezen', 'sloth', 'hoofd', 'target', 1, 20, 'pagina’s', 5),
  g('deepwork', 'Diep werk', 'sloth', 'werk', 'target', 2, 3, 'uur', 1),
  g('plan', 'Dag gepland (top 3)', 'sloth', 'werk', 'do', 2),
  g('screenlimit', 'Schermtijd onder 2 uur', 'sloth', 'scherm', 'do', 2),
  // Matigheid
  g('sugar', 'Max. suiker', 'gluttony', 'eten', 'limit', 2, 25, 'gram', 5),
  g('water', 'Water', 'gluttony', 'eten', 'target', 1, 8, 'glazen', 1),
  g('protein', 'Eiwit', 'gluttony', 'eten', 'target', 1, 140, 'gram', 10),
  g('veg', 'Groente', 'gluttony', 'eten', 'target', 1, 250, 'gram', 50),
  g('fruit', 'Fruit', 'gluttony', 'eten', 'target', 1, 2, 'stuks', 1),
  g('cooked', 'Zelf gekookt', 'gluttony', 'eten', 'do', 1),
  g('nosnack', 'Geen snacks tussendoor', 'gluttony', 'eten', 'do', 1),
  g('fasting', 'Intermittent fasting 16:8', 'gluttony', 'eten', 'do', 1),
  g('noalcohol', 'Alcoholvrije dag', 'gluttony', 'middelen', 'do', 2),
  g('sauna', 'Sauna', 'gluttony', 'lichaam', 'do', 1),
  // Zuiverheid
  g('phoneout', 'Telefoon buiten de slaapkamer', 'lust', 'slaap', 'do', 2),
  g('wimhof', 'Wim Hof-ademhaling', 'lust', 'hoofd', 'do', 2),
  g('cold', 'Koude douche / ijsbad', 'lust', 'lichaam', 'do', 2),
  g('greyscale', 'Telefoon op grijstinten', 'lust', 'scherm', 'do', 1),
  g('blocker', 'Social media-blocker aan', 'lust', 'scherm', 'do', 1),
  g('presence', 'Echte tijd met iemand, zonder scherm', 'lust', 'mensen', 'do', 1),
  // Geduld
  g('meditate', 'Meditatie', 'wrath', 'hoofd', 'target', 2, 10, 'min', 5),
  g('pause', 'Pauze genomen voor ik reageerde', 'wrath', 'hoofd', 'do', 1),
  g('boxbreath', 'Box breathing bij stress', 'wrath', 'hoofd', 'do', 1),
  g('walk', 'Wandeling in de natuur', 'wrath', 'lichaam', 'do', 1),
  g('listen', 'Echt geluisterd zonder te onderbreken', 'wrath', 'mensen', 'do', 1),
  // Welwillendheid
  g('gratitude', 'Dankbaarheid (3 dingen)', 'envy', 'hoofd', 'do', 1),
  g('reachout', 'Vriend of familie gesproken', 'envy', 'mensen', 'do', 1),
  g('compliment', 'Oprecht compliment gegeven', 'envy', 'mensen', 'do', 1),
  // Vrijgevigheid
  g('help', 'Iemand geholpen', 'greed', 'mensen', 'do', 1),
  g('volunteer', 'Vrijwilligerswerk', 'greed', 'mensen', 'do', 1),
  g('save', 'Geld opzij gezet', 'greed', 'geld', 'do', 1),
  g('budget', 'Uitgaven bijgehouden', 'greed', 'geld', 'do', 1),
  g('nospend', 'No-spend-dag', 'greed', 'geld', 'do', 1),
  g('give', 'Iets gegeven of gedoneerd', 'greed', 'geld', 'do', 1),
  // Nederigheid
  g('journal', 'Journaling / eerlijke reflectie', 'pride', 'hoofd', 'do', 2),
  g('learn', 'Iets nieuws geleerd', 'pride', 'hoofd', 'do', 1),
  g('therapy', 'Therapie of coach-sessie', 'pride', 'hoofd', 'do', 1),
  g('sorry', 'Fout toegegeven / excuses aangeboden', 'pride', 'mensen', 'do', 1),
  g('feedback', 'Om feedback gevraagd', 'pride', 'werk', 'do', 1),
]

// Wat de meeste mensen als eerste kiezen. Staat bovenaan, zodat je in een paar tikken klaar bent.
export const POPULAR: Record<'vice' | 'virtue', string[]> = {
  vice: ['porn', 'smoke', 'vape', 'alcohol', 'shorts', 'snooze', 'gamble', 'fastfood', 'phonebed', 'procrastinate', 'compare', 'weed'],
  virtue: ['workout', 'early', 'sleep', 'water', 'read', 'meditate', 'cold', 'deepwork', 'steps', 'journal', 'sugar', 'nophonehour'],
}

export type FeatureId = 'halo' | 'laurel' | 'medal' | 'abs' | 'frost' | 'flame' | 'sun' | 'book' | 'dumbbell'

export interface FeatureMeta {
  id: FeatureId
  name: string
  meaning: string
  placeholder: string
}

// Kenmerken van je ideale zelf. Elk kenmerk staat voor een concreet doel.
export const FEATURES: FeatureMeta[] = [
  { id: 'abs', name: 'Definitie', meaning: 'Een lichaam dat je zelf gebouwd hebt', placeholder: 'Bijv. 12% vetpercentage voor de zomer' },
  { id: 'medal', name: 'Medaille', meaning: 'Een race of prestatie die je gaat halen', placeholder: 'Bijv. halve marathon onder 1:50' },
  { id: 'dumbbell', name: 'Kracht', meaning: 'Sterker worden, meetbaar', placeholder: 'Bijv. 100 kg bankdrukken' },
  { id: 'laurel', name: 'Lauwerkrans', meaning: 'Discipline die je volhoudt', placeholder: 'Bijv. 100 dagen zonder porno' },
  { id: 'halo', name: 'Stralenkrans', meaning: 'Rust in je hoofd', placeholder: 'Bijv. elke dag 10 min mediteren' },
  { id: 'frost', name: 'IJsadem', meaning: 'Kou als training voor de geest', placeholder: 'Bijv. 3 min in het ijsbad' },
  { id: 'flame', name: 'Vuur', meaning: 'Hitte, herstel, doorzetten', placeholder: 'Bijv. 3× per week sauna' },
  { id: 'sun', name: 'Dageraad', meaning: 'De dag beginnen voor de rest wakker is', placeholder: 'Bijv. elke dag om 5:30 op' },
  { id: 'book', name: 'Boek', meaning: 'Een geest die blijft leren', placeholder: 'Bijv. 24 boeken dit jaar' },
]

// Covey: eerst de grote stenen in de pot, dan het grind, dan het zand.
// Bij goede gewoontes is het gewicht de grootte van de steen; bij verleidingen hoe zwaar ze wegen.
export const ROCK: Record<1 | 2 | 3, string> = { 3: 'Grote steen', 2: 'Middelgrote steen', 1: 'Kleine steen' }
export const ROCK_SHORT: Record<1 | 2 | 3, string> = { 3: 'Groot', 2: 'Middel', 1: 'Klein' }
export const ROCK_PLURAL: Record<1 | 2 | 3, string> = { 3: 'Grote stenen', 2: 'Middelgrote stenen', 1: 'Kleine stenen' }
