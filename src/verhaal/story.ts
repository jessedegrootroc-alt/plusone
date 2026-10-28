// De film in schermhoogtes ("u"): 0 is het begin, END het slot. Alles wat beweegt, leest u.
// Zie docs/BRIEF-VERHAAL.md: vijf bedrijven, en vier gebaren op de keerpunten.

export const END = 30

export type Act = 'stad' | 'telefoon' | 'portaal' | 'klim' | 'paradiso'
export const ACTS: { id: Act; from: number; label: string }[] = [
  { id: 'stad', from: 0, label: 'De stad' },
  { id: 'telefoon', from: 5, label: 'De telefoon' },
  { id: 'portaal', from: 9.6, label: 'Het portaal' },
  { id: 'klim', from: 14.6, label: 'De klim' },
  { id: 'paradiso', from: 24, label: 'Paradiso' },
]

export type GateId = 'telefoon' | 'portaal' | 'trede1' | 'trede2' | 'trede3' | 'krans'
export interface Gate {
  id: GateId
  at: number
  kind: 'hold' | 'drag'
  /** Hoe lang vasthouden (ms). Elke trede iets langer: hoger klimmen kost meer. */
  ms?: number
  label: string
}

/** Scrollen is reizen; op deze keerpunten verander je zelf iets (BRIEF §3). */
export const GATES: Gate[] = [
  { id: 'telefoon', at: 7.2, kind: 'hold', ms: 1200, label: 'Houd vast' },
  { id: 'portaal', at: 9.6, kind: 'drag', label: 'Sleep omlaag' },
  { id: 'trede1', at: 21, kind: 'hold', ms: 900, label: 'Houd vast' },
  { id: 'trede2', at: 22.2, kind: 'hold', ms: 1300, label: 'Blijf vasthouden' },
  { id: 'trede3', at: 23.4, kind: 'hold', ms: 1800, label: 'Blijf vasthouden' },
  { id: 'krans', at: 27.4, kind: 'hold', ms: 1500, label: 'Houd vast' },
]

/** Eén regel per tik: groot, in kapitalen, en weer weg voor de volgende komt. */
export const LINES: { text: string; from: number; to: number; small?: string; big?: boolean }[] = [
  { text: 'IEDEREEN BEGINT ERGENS.', from: 0.6, to: 2.2 },
  { text: 'DE MEESTEN BLIJVEN DAAR.', from: 2.5, to: 4.1 },
  { text: 'EÉN MELDING.', from: 7.45, to: 8.3 },
  { text: 'EÉN KEUZE.', from: 8.45, to: 9.45 },
  { text: 'VALLEN.', from: 10, to: 10.9, big: true },
  { text: 'DIEPER.', from: 11.3, to: 12.2, big: true },
  { text: 'DIEPST.', from: 12.6, to: 13.5, big: true },
  { text: 'KIJK.', small: 'Elke stap een eigen post-it.', from: 15, to: 17.2 },
  { text: 'KIES.', small: 'Wáár je werkt.', from: 18, to: 20.2 },
  { text: 'KLIM.', small: 'Óf je het doet.', from: 20.7, to: 23.9 },
  { text: 'DIT IS NIET HET EINDE.', from: 24.9, to: 26 },
  { text: 'DIT IS DAG ÉÉN.', from: 26.1, to: 27.3 },
  { text: 'WAT JE MORGEN BENT,', small: 'kies je vandaag.', from: 28.1, to: 31 },
]

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v))
/** 0 → 1 tussen a en b, zacht in en uit. */
export const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a))
  return x * x * (3 - 2 * x)
}
/** Zoals de app: snel weg, zacht tot stilstand (cubic-bezier 0.22, 1, 0.36, 1 benaderd). */
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 4)
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k
