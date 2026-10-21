import { useSyncExternalStore } from 'react'
import type { FeatureId, HabitTemplate, HabitType } from '../data/catalog'
import type { AreaId, Size } from '../data/growth'
import type { SinId } from '../data/sins'

export interface Habit {
  id: string
  name: string
  sin: SinId
  kind: 'vice' | 'virtue'
  type: HabitType
  weight: 1 | 2 | 3
  amount?: number
  unit?: string
  step?: number
  cue?: string
  /** Vaste tijd ("06:30"): Goggins plant in blokken, niet in lijstjes. */
  at?: string
}

export interface AvatarConfig {
  frame: 'v' | 'hourglass' | 'straight'
  skin: number
  face: 'oval' | 'round' | 'square'
  hair: 'bald' | 'short' | 'quiff' | 'long' | 'curly' | 'bun'
  hairShade: number
  beard: 'none' | 'stubble' | 'short' | 'full'
  brows: 'soft' | 'strong'
  outfit: 'tee' | 'tank' | 'bare' | 'toga'
  features: FeatureId[]
}

export interface Goal {
  id: string
  feature: FeatureId
  text: string
  done?: boolean
}

/** Een eenmalige steen voor één dag (Covey): iets wat vandaag in de pot moet. Gedaan = v[id] >= 1. */
export interface DayRock {
  id: string
  text: string
  size: 1 | 2 | 3
  at?: string
  /** Het ongemak van vandaag: iets wat je niet wilt doen, en toch doet. */
  suck?: boolean
}

export interface DayLog {
  v: Record<string, number>
  sealed?: boolean
  urges?: number
  rocks?: DayRock[]
  /** Debrief na een slechte dag (Goggins' After Action Report). */
  aar?: { what?: string; cause?: string; plan?: string }
  /** Hoe vol je tank is (1 leeg · 2 oké · 3 vol). De rem op grenzen verleggen. */
  energy?: 1 | 2 | 3
}

/** Eén grens die je gaat verleggen. Pas gedaan als je het gedaan hebt, niet als je het zei. */
export interface Challenge {
  id: string
  area: AreaId
  title: string
  size: Size
  step?: string
  fear: 1 | 2 | 3
  status: 'open' | 'gedaan' | 'losgelaten'
  createdAt: string
  due: string
  doneAt?: string
  felt?: 1 | 2 | 3
  /** De eerste stap van twee minuten is gezet. */
  stepDone?: boolean
}

/** Een post-it op de spiegel (Goggins): wat er mis is en wat er moet gebeuren, in je eigen harde woorden. */
export interface MirrorNote {
  id: string
  text: string
  /** Onder welke zonde dit valt. Zo telt de post-it mee in je balans en je mandala. */
  sin?: SinId
  createdAt: string
  doneAt?: string
}

export interface JarItem {
  id: string
  text: string
  date: string
}

/** Eén drang-moment: wat er trok, hoe hard, wat eronder zat, en hoe het afliep. */
export interface UrgeEvent {
  id: string
  at: string
  habitId?: string
  before?: number
  after?: number
  need?: string
  voice?: number
  action?: string
  outcome?: 'resisted' | 'gave-in'
  feeling?: string
}

/** Eén schaduwgesprek: wat je wilde, wat de schaduw eigenlijk zocht, en hoe je het bewust gaf. */
export interface ShadowEvent {
  id: string
  at: string
  habitId?: string
  sin: string
  projection?: boolean
  trait?: string
  way?: string
}

export interface State {
  version: 1
  onboarded: boolean
  name: string
  why: string
  createdAt: string
  habits: Habit[]
  avatar: AvatarConfig
  goals: Goal[]
  logs: Record<string, DayLog>
  jar: JarItem[]
  urgeLog: UrgeEvent[]
  shadowLog: ShadowEvent[]
  growth: Challenge[]
  notes: MirrorNote[]
}

const KEY = 'plusone.v1'

export const todayISO = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return todayISO(d)
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const DEFAULT_AVATAR: AvatarConfig = {
  frame: 'v',
  skin: 1,
  face: 'oval',
  hair: 'short',
  hairShade: 0,
  beard: 'stubble',
  brows: 'strong',
  outfit: 'tank',
  features: [],
}

const fresh = (): State => ({
  version: 1,
  onboarded: false,
  name: '',
  why: '',
  createdAt: todayISO(),
  habits: [],
  avatar: DEFAULT_AVATAR,
  goals: [],
  logs: {},
  jar: [],
  urgeLog: [],
  shadowLog: [],
  growth: [],
  notes: [],
})

const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...fresh(), ...JSON.parse(raw) }
  } catch {
    /* geen opslag beschikbaar */
  }
  return fresh()
}

let state: State = load()
const listeners = new Set<() => void>()

export const getState = () => state

export const update = (fn: (draft: State) => void) => {
  const draft = structuredClone(state)
  fn(draft)
  state = draft
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* geen opslag beschikbaar */
  }
  listeners.forEach((l) => l())
}

export const resetAll = () => update((d) => Object.assign(d, fresh()))

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useStore = () => useSyncExternalStore(subscribe, getState)

export const fromTemplate = (t: HabitTemplate): Habit => ({
  id: t.key + '-' + uid(),
  name: t.name,
  sin: t.sin,
  kind: t.kind,
  type: t.type,
  weight: t.weight,
  amount: t.amount,
  unit: t.unit,
  step: t.step,
})

export const setValue = (date: string, habitId: string, value: number) =>
  update((d) => {
    const log = (d.logs[date] ??= { v: {} })
    log.v[habitId] = Math.max(0, value)
  })

export const buzz = (ms = 8) => {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* geen trilfunctie */
  }
}
