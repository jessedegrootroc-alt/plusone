// Je reis in de cloud. De app blijft eerst lokaal werken (ook offline); is je account verbonden,
// dan gaat elke wijziging na een korte pauze naar Supabase, en haalt de app bij het openen de nieuwste versie op.
// Regel bij botsingen: de laatst gewijzigde versie wint. Een nieuw apparaat neemt je bestaande reis over.
import { useSyncExternalStore } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { getState, onLocalChange, replaceState, type State } from './store'

const META = 'plusone-sync'
const PUSH_AFTER = 1500 // ms rust na je laatste tik

type Meta = { changedAt: number; syncedAt: number }
const readMeta = (): Meta => {
  try { return { changedAt: 0, syncedAt: 0, ...JSON.parse(localStorage.getItem(META) ?? '{}') } } catch { return { changedAt: 0, syncedAt: 0 } }
}
let meta = readMeta()
const saveMeta = () => { try { localStorage.setItem(META, JSON.stringify(meta)) } catch { /* geen opslag */ } }

export type SyncStatus = { state: 'uit' | 'uitgelogd' | 'bezig' | 'bij' | 'offline'; email?: string; at?: number }
let status: SyncStatus = { state: supabase ? 'uitgelogd' : 'uit' }
const listeners = new Set<() => void>()
const setStatus = (s: SyncStatus) => { status = s; listeners.forEach((l) => l()) }
export const useSync = () => useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => status)

let session: Session | null = null
let timer = 0

const push = async () => {
  if (!supabase || !session) return
  setStatus({ ...status, state: 'bezig' })
  const at = new Date()
  const { error } = await supabase.from('user_state').upsert({ user_id: session.user.id, state: getState(), updated_at: at.toISOString() })
  if (error) return setStatus({ ...status, state: 'offline' })
  meta.syncedAt = at.getTime()
  saveMeta()
  setStatus({ state: 'bij', email: session.user.email, at: meta.syncedAt })
}

/** Haal de versie uit de cloud en beslis wie wint. */
const pull = async () => {
  if (!supabase || !session) return
  setStatus({ ...status, state: 'bezig', email: session.user.email })
  const { data, error } = await supabase.from('user_state').select('state, updated_at').eq('user_id', session.user.id).maybeSingle()
  if (error) return setStatus({ ...status, state: 'offline' })
  if (!data) return push() // nog niets in de cloud: dit apparaat is het begin
  const remote = data.state as State
  const remoteAt = Date.parse(data.updated_at)
  const localDirty = meta.changedAt > meta.syncedAt
  // Nieuw apparaat (nooit gesynchroniseerd): je bestaande reis gaat voor, tenzij die nog leeg is
  const takeRemote = meta.syncedAt === 0 ? !!remote.onboarded || !getState().onboarded : !localDirty || remoteAt > meta.changedAt
  if (takeRemote && remoteAt !== meta.syncedAt) {
    replaceState(remote)
    meta = { changedAt: remoteAt, syncedAt: remoteAt }
    saveMeta()
    setStatus({ state: 'bij', email: session.user.email, at: remoteAt })
  } else if (localDirty || meta.syncedAt === 0) {
    await push()
  } else {
    setStatus({ state: 'bij', email: session.user.email, at: meta.syncedAt })
  }
}

/** Eenmalig bij het starten: luister naar inloggen, wijzigingen en terugkomen in de app. */
export const startSync = () => {
  if (!supabase) return
  onLocalChange(() => {
    meta.changedAt = Date.now()
    saveMeta()
    if (!session) return
    clearTimeout(timer)
    timer = window.setTimeout(push, PUSH_AFTER)
  })
  supabase.auth.onAuthStateChange((_event, s) => {
    const was = session?.user.id
    session = s
    if (!s) return setStatus({ state: 'uitgelogd' })
    if (s.user.id !== was) void pull()
  })
  // Terug in de app (misschien heb je op je andere telefoon iets gedaan): even ophalen
  document.addEventListener('visibilitychange', () => { if (!document.hidden && session) void pull() })
  window.addEventListener('online', () => { if (session) void pull() })
}

/** Inloggen zonder wachtwoord: een link in je mail. */
export const sendLoginLink = async (email: string) => {
  if (!supabase) return 'Geen verbinding met de cloud ingesteld.'
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } })
  return error ? error.message : null
}

/** Uitloggen: je reis blijft gewoon op dit apparaat staan. */
export const signOut = async () => { await supabase?.auth.signOut() }
