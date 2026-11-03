// Meldingen: opstaan, dag afsluiten, naar boven. En na een verloren dag de volgende ochtend: niet nog een keer.
// Met toestemming, en de tijden zijn aan te passen op Reis.
//
// Let op: een webapp kan zelf geen melding inplannen voor als hij helemaal dicht is. Hij plant ze zolang de app
// open of op de achtergrond staat. Voor betrouwbare meldingen als de app dicht is, is een push-server nodig
// (bijvoorbeeld via Supabase); die staat nog niet.
import { lostYesterday } from './days'
import { getState, update } from './store'

export const DEFAULT_TIMES = { wake: '06:30', close: '21:00', bed: '22:15' }

export const notifySupported = () => typeof window !== 'undefined' && 'Notification' in window

/** Toestemming vragen. Moet vanuit een tik. */
export const enableNotify = async () => {
  if (!notifySupported()) return false
  const p = await Notification.requestPermission()
  const on = p === 'granted'
  update((d) => {
    d.settings = { ...d.settings, notify: { ...DEFAULT_TIMES, ...d.settings?.notify, on } }
    d.asked = { ...d.asked, notify: true }
  })
  if (on) schedule()
  return on
}

export const disableNotify = () => update((d) => { if (d.settings?.notify) d.settings.notify.on = false })

const show = async (body: string) => {
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification('PlusOne', { body, icon: '/icons/icon-192.png', badge: '/icons/favicon-32.png', tag: body })
    else new Notification('PlusOne', { body, icon: '/icons/icon-192.png' })
  } catch {
    /* melding niet mogelijk */
  }
}

/** Over hoeveel ms een tijd ("06:30") de volgende keer is. */
const msUntil = (hm: string) => {
  const [h, m] = hm.split(':').map(Number)
  const now = new Date()
  const t = new Date(now)
  t.setHours(h, m, 0, 0)
  if (t <= now) t.setDate(t.getDate() + 1)
  return t.getTime() - now.getTime()
}

let timers: number[] = []

/** Alle meldingen opnieuw inplannen (bij het starten en na het wijzigen van de tijden). */
export const schedule = () => {
  timers.forEach((t) => clearTimeout(t))
  timers = []
  const n = getState().settings?.notify
  if (!n?.on || !notifySupported() || Notification.permission !== 'granted') return
  const at = (hm: string, text: () => string) => {
    timers.push(window.setTimeout(() => { void show(text()); schedule() }, msUntil(hm)))
  }
  at(n.wake, () => (lostYesterday(getState()) ? 'Gisteren verloren. Vandaag niet nog een keer.' : `${n.wake.replace(/^0/, '')}. Opstaan. Je weet waarom.`))
  at(n.close, () => 'Tijd om je dag af te sluiten.')
  at(n.bed, () => 'Over 15 minuten naar boven. Telefoon beneden.')
}
