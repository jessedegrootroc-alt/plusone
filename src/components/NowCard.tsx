import { useEffect, useRef, useState } from 'react'
import { nowTask } from '../lib/now'
import { isWakeHabit, shortTime, wakeTime } from '../lib/wake'
import { buzz, todayISO, update, useStore, type Habit, type State } from '../lib/store'

const MIN = 60 * 1000
/** Hoe ver vooruit je met één tik een deadline zet. */
const QUICK = [60, 120] as const

const hm = (ms: number) => new Date(ms).toTimeString().slice(0, 5)
/** Een tijd ("14:30") vandaag, in ms. */
const at = (hhmm: string, base: number) => { const [h, m] = hhmm.split(':').map(Number); const t = new Date(base); t.setHours(h, m, 0, 0); return t.getTime() }
/** Een deadline op een rond tijdstip: een uur vanaf nu wordt het eerstvolgende kwartier daarna. */
const roundUp = (ms: number) => Math.ceil(ms / (15 * MIN)) * 15 * MIN
/** "1 u 8 min", "2 uur", "24 min", en de laatste tien minuten met seconden: dan telt elke seconde. */
const left = (ms: number) => {
  if (ms < 10 * MIN) { const sec = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` }
  const m = Math.ceil(ms / MIN)
  return m >= 60 ? (m % 60 ? `${Math.floor(m / 60)} u ${m % 60} min` : `${m / 60} uur`) : `${m} min`
}

/**
 * Elke taak heeft een deadline, ook als je er zelf geen zet:
 * - met een vaste tijd: die tijd (12:00 is 12:00, daarna ben je te laat);
 * - zonder tijd: het eind van het dagdeel waarin je nu zit (ochtend 12:00, middag 18:00, avond je dag afsluiten).
 */
const autoDue = (s: State, h: Habit, now: number): { at: number; from: number } => {
  if (h.at) return { at: at(h.at, now), from: at(h.at, now) - 60 * MIN }
  const hour = new Date(now).getHours()
  const close = s.settings?.notify?.close ?? '21:00'
  if (hour >= 3 && hour < 12) return { at: at('12:00', now), from: at(wakeTime(s), now) }
  if (hour >= 12 && hour < 18) return { at: at('18:00', now), from: at('12:00', now) }
  const end = at(close, now)
  return { at: end > at('18:00', now) ? end : at('23:59', now), from: at('18:00', now) }
}

/**
 * Nu: bovenaan Vandaag het ene ding dat nu aan de beurt is, met één knop.
 * Altijd met een deadline die aftelt (zelf gekozen, of het eind van je dagdeel). Een deadline houd je eerder
 * (Ariely & Wertenbroch). Ben je te laat, dan wordt de hele kaart rood en telt hij op: te laat is te laat.
 * Gedaan gaat net als een post-it afscheuren.
 */
export default function NowCard({ onDone }: { onDone: (h: Habit) => void }) {
  const s = useStore()
  const today = todayISO()
  const [now, setNow] = useState(() => Date.now())
  const [pick, setPick] = useState(false)

  const task = nowTask(s, today, hm(now))
  const h = task?.h
  const mine = h && s.logs[today]?.due?.id === h.id ? s.logs[today]!.due! : undefined
  // Je eigen deadline, of anders de automatische. Iets wat pas later komt, heeft nog geen deadline.
  const dl = h && task.when !== 'later' ? mine ?? autoDue(s, h, now) : undefined
  const rest = dl ? dl.at - now : 0
  const over = !!dl && rest <= 0

  // Elke seconde in de laatste tien minuten, anders elke halve minuut
  const tight = !!dl && rest > 0 && rest < 11 * MIN
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), tight ? 1000 : 30000)
    return () => window.clearInterval(t)
  }, [tight])
  // Over de deadline heen terwijl je kijkt: dat voel je
  const wasOver = useRef(over)
  useEffect(() => {
    if (over && !wasOver.current) buzz(60)
    wasOver.current = over
  }, [over])

  if (!task || !h) return null
  const { big, when } = task
  const setDue = (t: number) => {
    buzz(14)
    setNow(Date.now())
    setPick(false)
    update((d) => { (d.logs[today] ??= { v: {} }).due = { id: h.id, at: t, from: Date.now() } })
  }
  const done = () => {
    buzz(18)
    update((d) => { delete d.logs[today]?.due })
    onDone(h)
  }
  // Een deadline verzetten kan alleen bij iets wat je nu kunt doen: niet bij je opstaan, en niet bij iets wat pas later komt
  const canDue = when !== 'later' && !isWakeHabit(h)
  const kind = h.cue ? `Na ${h.cue}` : big ? 'Grote taak' : 'Extra'
  const meta = !dl ? `Om ${shortTime(h.at!)}` : over ? `Deadline was ${shortTime(hm(dl.at))}` : mine ? `${hm(mine.from ?? now)} → ${hm(mine.at)}` : `${kind} · vóór ${shortTime(hm(dl.at))}`
  // De ring loopt leeg zoals een Time Timer; te laat telt hij op
  const share = dl ? Math.min(1, Math.max(0, rest / Math.max(MIN, dl.at - (dl.from ?? dl.at - 60 * MIN)))) : 0
  const R = 30
  const C = 2 * Math.PI * R
  const mins = Math.ceil(rest / MIN)
  const late = Math.max(1, Math.floor(-rest / MIN))
  const ringNum = over ? (late >= 100 ? `+${Math.floor(late / 60)}u` : `+${late}`) : rest < 10 * MIN ? left(rest) : mins >= 100 ? `${Math.round(mins / 60)}u` : String(mins)
  const ringUnit = over ? (late >= 100 ? '' : 'min') : rest < 10 * MIN || mins >= 100 ? '' : 'min'

  return (
    <section className={`now-card ${over ? 'late' : ''}`} aria-label={over ? 'Nu, te laat' : 'Nu'}>
      <div className="now-head">
        <div className="now-titles">
          <span className="eyebrow">{when === 'later' ? 'Hierna' : over ? 'Te laat' : 'Nu'}</span>
          <h2 className="h1 now-task">{h.name}</h2>
          <span className="now-meta">{meta}</span>
        </div>
        {dl && (
          <button className={`now-ring ${over ? 'over' : rest < 10 * MIN ? 'tight' : ''}`} onClick={() => canDue && setPick((p) => !p)} disabled={!canDue} aria-label={over ? `${late} minuten te laat. ${canDue ? 'Tik voor een nieuwe deadline.' : ''}` : `Nog ${left(rest)}, deadline ${hm(dl.at)}. ${canDue ? 'Tik om te wijzigen.' : ''}`}>
            <svg viewBox="0 0 72 72" aria-hidden="true">
              <circle className="now-ring-bg" cx="36" cy="36" r={R} />
              <circle className="now-ring-fg" cx="36" cy="36" r={R} strokeDasharray={C} strokeDashoffset={over ? C : C * (1 - share)} />
            </svg>
            <span className="now-ring-num">{ringNum}</span>
            {ringUnit && <span className="now-ring-unit">{ringUnit}</span>}
          </button>
        )}
      </div>

      {canDue && pick && (
        <div className="now-pick" role="group" aria-label="Vóór hoe laat?">
          <span className="now-pick-q">{over ? 'Nieuwe deadline' : 'Vóór hoe laat?'}</span>
          {QUICK.map((m) => {
            const t = roundUp(now + m * MIN)
            return <button key={m} className="chip" onClick={() => setDue(t)}>{hm(t)}</button>
          })}
          <label className="chip now-pick-own">
            <span>Anders</span>
            <input type="time" aria-label="Eigen deadline" onChange={(e) => {
              if (!e.target.value) return
              const t = at(e.target.value, Date.now())
              if (t > Date.now()) setDue(t)
            }} />
          </label>
        </div>
      )}


      <button className="btn" onClick={done}>Gedaan</button>

    </section>
  )
}
