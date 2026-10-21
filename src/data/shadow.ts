import type { SinId } from './sins'

// Schaduwwerk naar C.G. Jung.
// - De schaduw is wat je niet wilt zien van jezelf. Wegduwen maakt hem sterker; erkennen neemt hem zijn greep.
// - In de schaduw zit "goud": een echte behoefte of kracht die je niet bewust leeft. De verleiding is een
//   slechte vervanging voor dat goud.
// - Projectie: wat je in een ander irriteert of benijdt, is vaak iets van jezelf.
// - Het doel is heelheid (het Zelf), geen perfectie.

export interface ShadowVoice {
  /** Wat de schaduw eigenlijk wil. */
  need: string
  /** Het goud: de kracht die in die behoefte zit. */
  gold: string
  /** Bewuste manieren om de schaduw te geven wat hij echt vraagt. */
  ways: string[]
}

export const SHADOW: Record<SinId, ShadowVoice> = {
  lust: { need: 'Nabijheid. Me levend voelen.', gold: 'Vitaliteit', ways: ['Echt contact: bel of zie iemand', 'Voel je lijf: koude douche', 'Maak iets: schrijf, bouw, beweeg'] },
  gluttony: { need: 'Troost. Even niets hoeven.', gold: 'Zorg', ways: ['10 minuten echte pauze', 'Iets warms en goeds eten', '5 lange uitademingen'] },
  greed: { need: 'Spanning. Meer dan dit.', gold: 'Ambitie', ways: ['Neem een echt risico in je werk', 'Sport tot het spannend wordt', 'Schrijf je grootste doel op'] },
  sloth: { need: 'Rust. Even niet moeten.', gold: 'Herstel', ways: ['20 minuten schuldvrije rust', 'Wandel zonder doel', 'Zeg vandaag één ding af'] },
  wrath: { need: 'Grenzen. Gezien worden.', gold: 'Kracht', ways: ['Zeg hardop waar je grens ligt', 'Ren, til, sla: laat het eruit', 'Schrijf de brief die je niet verstuurt'] },
  envy: { need: 'Wat ik zelf ook wil.', gold: 'Verlangen', ways: ['Schrijf op wat je eigenlijk wilt', 'Zet er vandaag één stap naartoe', 'Feliciteer die ander oprecht'] },
  pride: { need: 'Ertoe doen.', gold: 'Waardigheid', ways: ['Vraag iemand om hulp', 'Vertel iemand iets eerlijks', 'Erken één fout, zonder uitleg'] },
}

/** Eigenschappen die je in een ander kunt zien: de spiegel van projectie. */
export const TRAITS = ['Succes', 'Vrijheid', 'Lef', 'Rust', 'Aandacht', 'Zekerheid', 'Macht', 'Schoonheid']

/** Naar Jung: "Men wordt niet verlicht door zich lichtfiguren voor te stellen, maar door de duisternis bewust te maken." */
export const JUNG_LINE = 'Je wordt niet heel door het licht te zoeken, maar door het donker te leren kennen.'
