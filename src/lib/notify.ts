// Meldingen: opstaan, dag afsluiten, naar boven. En na een verloren dag de volgende ochtend: niet nog een keer.
// Met toestemming, en de tijden zijn aan te passen op Reis.
//
// Per taak met een vaste tijd: één melding op die tijd, alleen als hij dan nog niet af is. Meer meldingen helpen
// weinig (Bidargaddi e.a.: +4% kans dat je de app opent, en het effect slijt). En wie op meldingen leunt, doet het
// wel maar het wordt geen gewoonte (Stawarz e.a.). Daarom vraagt Vandaag na drie weken of de herinnering uit mag.
//
// Let op: een webapp kan zelf geen melding inplannen voor als hij helemaal dicht is. Hij plant ze zolang de app
// open of op de achtergrond staat. Voor betrouwbare meldingen als de app dicht is, is een push-server nodig
// (bijvoorbeeld via Supabase); die staat nog niet.
import { bigTasksOn, canSave, dayResult, freshStart, lostYesterday, missedYesterday, otherTasksOn } from './days'
import { isDone } from './score'
import { addDays, getState, onLocalChange, todayISO, update } from './store'

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

const show = async (body: string, tag = body) => {
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification('PlusOne', { body, icon: '/icons/icon-192.png', badge: '/icons/favicon-32.png', tag })
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

/** De ochtendmelding: na een misser, op een verse start, of gewoon opstaan. */
const wakeText = (wake: string) => {
  const s = getState()
  const today = todayISO()
  if (missedYesterday(s, today) && canSave(s, addDays(today, -1))) return 'Gisteren gemist. Red hem met een reservedag, en lever vandaag.'
  if (lostYesterday(s, today)) return 'Gisteren verloren. Vandaag niet. Op.'
  const fresh = freshStart(s, today)
  if (fresh === 'week') return 'Nieuwe week. Schone lei. Laat zien wie je bent.'
  if (fresh === 'month') return 'Nieuwe maand. Twee nieuwe reservedagen.'
  return `${wake.replace(/^0/, '')}. Voeten op de vloer. De rest slaapt nog, jij niet.`
}

/** De taken van vandaag met een tijd en een herinnering, die nog niet af zijn. */
const openTasks = () => {
  const s = getState()
  const today = todayISO()
  const v = s.logs[today]?.v ?? {}
  return [...bigTasksOn(s, today), ...otherTasksOn(s, today)].filter((h) => h.at && h.remind !== false && !(isDone(h, v[h.id] ?? 0) && (v[h.id] ?? 0) > 0))
}

/** Alle meldingen opnieuw inplannen (bij het starten, na elke wijziging, en om middernacht voor de nieuwe dag). */
export const schedule = () => {
  timers.forEach((t) => clearTimeout(t))
  timers = []
  const n = getState().settings?.notify
  if (!n?.on || !notifySupported() || Notification.permission !== 'granted') return
  const at = (hm: string, text: () => string | null, tag?: string) => {
    timers.push(window.setTimeout(() => { const t = text(); if (t) void show(t, tag); schedule() }, msUntil(hm)))
  }
  at(n.wake, () => wakeText(n.wake))
  at(n.close, () => 'Spiegel. Heb je gedaan wat je zei?')
  // Was de dag gemist en deed je nog niets goeds? Dan eerst dat, voor je gaat slapen.
  at(n.bed, () => {
    const s = getState()
    const today = todayISO()
    return dayResult(s, today) === false && !s.logs[today]?.black ? 'Je dag staat in de min. Zo ga je niet slapen. Doe nog één ding goed.' : 'Over 15 minuten naar boven. Telefoon beneden.'
  })
  // Per taak: op zijn tijd, en alleen als hij dan nog openstaat
  const nowHM = new Date().toTimeString().slice(0, 5)
  for (const h of openTasks().filter((x) => x.at! > nowHM)) {
    at(h.at!, () => (openTasks().some((x) => x.id === h.id && x.at === h.at) ? (h.cue ? `Na ${h.cue}: ${h.name}. Geen onderhandeling.` : `${h.at!.replace(/^0/, '')}. ${h.name}. Geen onderhandeling.`) : null), 'taak:' + h.id)
  }
  // Om middernacht de taken van de nieuwe dag
  at('00:01', () => null)
}

// Een taak afgescheurd of een tijd veranderd? Dan opnieuw plannen.
let pending = 0
onLocalChange(() => {
  clearTimeout(pending)
  pending = window.setTimeout(schedule, 300)
})
