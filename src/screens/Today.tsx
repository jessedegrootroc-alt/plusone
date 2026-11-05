import { useCallback, useMemo, useState } from 'react'
import Scene from '../components/Scene'
import CookieProof from '../components/CookieProof'
import Offers from '../components/Offers'
import TaskNotes from '../components/TaskNotes'
import { NoteSheet } from '../components/MirrorNotes'
import { HabitRow, Icon, Sheet, Toast, useTween } from '../components/ui'
import { pullingObjects, strongestVirtueObject } from '../data/objects'
import { SINS } from '../data/sins'
import { bigTasksOn, dayResult, lostYesterday, otherTasksOn, scheduleLabel, wonStats } from '../lib/days'
import { earnedFeatures } from '../lib/emblems'
import { countdownLabel, goalTitle, mainGoal } from '../lib/goal'
import { computeSeries, isDone } from '../lib/score'
import { addDays, buzz, setValue, todayISO, uid, update, useStore, type Habit } from '../lib/store'

const SLIP_LINES = [
  'Genoteerd. Eén val is data, geen identiteit.',
  'Eerlijk. Nu: mis het niet twee keer.',
  'Gezien. De volgende keuze telt weer volledig.',
]

const greet = (name: string) => {
  const h = new Date().getHours()
  const g = h < 6 ? 'Nog wakker' : h < 12 ? 'Goedemorgen' : h < 18 ? 'Goedemiddag' : 'Goedenavond'
  return name ? `${g}, ${name}` : g
}

export default function Today({ openMirror, openUrge, openShadow }: { openMirror: (date: string) => void; openUrge: () => void; openShadow: (habitId?: string) => void }) {
  const s = useStore()
  const today = todayISO()
  const [date, setDate] = useState(today)
  const [toast, setToast] = useState<string | null>(null)
  const [slipId, setSlipId] = useState<string | null>(null)
  const clearToast = useCallback(() => setToast(null), [])
  const [timeFor, setTimeFor] = useState<Habit | null>(null)
  const [goalSheet, setGoalSheet] = useState(false)
  const [showVices, setShowVices] = useState(false)
  // Na het afscheuren: was het zwaar? Dan wordt het een koekje. Anders is het gewoon gedaan.
  const [torn, setTorn] = useState<{ h: Habit; n: number } | null>(null)
  const [hardFor, setHardFor] = useState<Habit | null>(null)
  const clearTorn = useCallback(() => setTorn(null), [])

  const series = useMemo(() => computeSeries(s), [s])
  const stats = useMemo(() => wonStats(s, today), [s, today])
  // De figuur klimt mee met je gewonnen dagen: hoe groter het deel, hoe hoger op de berg. Geen punten erbij.
  const climb = stats.counted ? -100 + 200 * (stats.won / stats.counted) : 0
  const shown = useTween(climb)
  const pulling = useMemo(() => pullingObjects(s), [s])
  const goodObject = useMemo(() => strongestVirtueObject(s), [s])
  const bySin = (dir: 1 | -1) => SINS.filter((x) => s.habits.some((h) => h.sin === x.id)).sort((a, b) => dir * (series.perSin[a.id] - series.perSin[b.id])).slice(0, 2).map((x) => x.id)

  const log = s.logs[date]
  const sealed = !!log?.sealed
  const big = bigTasksOn(s, date).sort((a, b) => (a.at ?? '99').localeCompare(b.at ?? '99'))
  const other = otherTasksOn(s, date)
  const vices = s.habits.filter((h) => h.kind === 'vice')
  const dayRockIds = new Set((log?.rocks ?? []).map((r) => r.id))
  const done = (h: Habit) => isDone(h, log?.v[h.id] ?? 0) && (log?.v[h.id] ?? 0) > 0
  const slips = vices.filter((h) => !isDone(h, log?.v[h.id] ?? 0))
  const bigDone = big.filter(done).length
  const nowHM = new Date().toTimeString().slice(0, 5)
  const plan = s.logs[addDays(date, -1)]?.aar?.plan
  const lost = date === today && lostYesterday(s, today)
  const goal = mainGoal(s)
  const week = Array.from({ length: 7 }).map((_, i) => addDays(today, i - 6))
  const removeRock = (id: string) => update((d) => {
    const l = d.logs[date]
    if (!l) return
    l.rocks = (l.rocks ?? []).filter((r) => r.id !== id)
    delete l.v[id]
  })
  const change = (id: string, v: number, wasSlip: boolean, isVice: boolean) => {
    setValue(date, id, v)
    if (isVice && !wasSlip && v >= 1) {
      setSlipId(id)
      setToast(SLIP_LINES[Math.floor(Math.random() * SLIP_LINES.length)])
    }
  }
  const shortDate = new Date(date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="screen">
      {/* 1 · Datum en begroeting */}
      <div className="page-head">
        <div>
          <div className="eyebrow one-line">{shortDate}</div>
          <h1 className="h1 one-line">{date === today ? greet(s.name) : 'Terugkijken'}</h1>
        </div>
        {date === today && vices.length > 0 && (
          <button onClick={openUrge} className="hstack urge-btn" aria-label="Ik voel drang">
            {Icon.wave()} <span className="urge-lbl">Drang</span>
          </button>
        )}
      </div>

      {/* 2 · Nooit twee keer missen */}
      {lost && <div className="miss-bar" role="alert">Gisteren verloren. Vandaag niet nog een keer.</div>}

      {/* 3 · Het doel, met aftelling */}
      {date === today && (goal ? (
        <button className="goal-hero" onClick={() => setGoalSheet(true)}>
          <span className="goal-title">{goalTitle(goal)}</span>
          <span className="goal-count">{goal.due ? countdownLabel(goal.due, today) : 'Zet er een datum bij'}</span>
        </button>
      ) : (
        <button className="goal-hero empty" onClick={() => setGoalSheet(true)}>
          <span className="goal-title">Kies je doel</span>
          <span className="goal-count">Met een datum. Dan telt de app af.</span>
        </button>
      ))}

      {/* 4 · Je waarom, elke ochtend */}
      {date === today && s.why && <p className="why-line">{s.why}</p>}
      {plan && date === today && <p className="plan-line"><b>Plan van gisteren:</b> {plan}</p>}

      {/* 5 en 6 · De taken van vandaag als briefjes: scheur eraf wat gedaan is, het gaat in de koektrommel */}
      <section className="section tasks">
        <TaskNotes
          title={date === today ? 'Vandaag' : 'Die dag'}
          bigDone={bigDone}
          bigTotal={big.length}
          items={[
            ...big.map((h) => ({ h, big: true, done: done(h), late: date === today && !!h.at && h.at < nowHM && !done(h), removable: dayRockIds.has(h.id) })),
            ...other.map((h) => ({ h, big: false, done: done(h), late: false, meta: scheduleLabel(h), removable: dayRockIds.has(h.id) })),
          ]}
          onTear={(h) => { setValue(date, h.id, h.type === 'target' ? h.amount ?? 1 : 1); setTorn((t) => ({ h, n: (t?.n ?? 0) + 1 })) }}
          onBack={(h) => { setValue(date, h.id, 0); setTorn(null) }}
          onTime={setTimeFor}
          onRemove={(h) => removeRock(h.id)}
        />
        <div className="won-row">
          <div className="won-dots" aria-label={`${stats.won} van de ${stats.counted} dagen gewonnen`}>
            {week.map((d) => {
              const r = dayResult(s, d)
              return <button key={d} className={`won-dot ${r === true ? 'won' : r === false ? 'lost' : ''} ${d === date ? 'sel' : ''}`} disabled={d < s.createdAt} onClick={() => setDate(d)} aria-label={new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long' })}>{new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2)}</button>
            })}
          </div>
          <div className="small">{stats.won} van de {stats.counted} dagen gewonnen · {s.jar.length} {s.jar.length === 1 ? 'overwinning' : 'overwinningen'}</div>
        </div>
      </section>

      {/* Eén keer: het nieuwe schema, of taak 4 */}
      {date === today && <section className="section"><Offers /></section>}

      {/* Verleidingen: bijhouden, telt niet mee */}
      {vices.length > 0 && (
        <section className="section">
          <div className="card day-card">
            <button className="fold" onClick={() => setShowVices((x) => !x)} aria-expanded={showVices}>
              <span>Verleidingen · {slips.length ? `${slips.length} toegegeven` : 'alles vrij'}</span>
              <span className={`chev ${showVices ? 'open' : ''}`}>{Icon.next()}</span>
            </button>
            {(showVices ? vices : slips).length > 0 && (
              <div className="list flat">
                {(showVices ? vices : slips).map((h) => {
                  const v = log?.v[h.id] ?? 0
                  return <HabitRow key={h.id} compact tight h={h} value={v} answered={sealed || (!!log && h.id in log.v)} onChange={(nv) => change(h.id, nv, !isDone(h, v), true)} />
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bewijs uit je koektrommel: je deed al zwaarder */}
      {date === today && <CookieProof />}

      {/* 7 · Het beeld: de figuur klimt mee met je gewonnen dagen */}
      <div className="card scene-small" style={{ padding: 0, overflow: 'hidden' }}>
        <Scene balance={shown} onTap={() => openMirror(date)} strong={bySin(-1)} features={earnedFeatures(s)} objects={pulling} virtueObject={goodObject} weak={bySin(1)} />
      </div>

      {/* 8 · Dag afsluiten */}
      <div className="mt-24">
        {sealed ? (
          <div className="hstack center-row" style={{ gap: 12 }}>{Icon.check()}<span className="lead" style={{ color: 'var(--ink)' }}>{date === today ? 'Vandaag' : 'Deze dag'} is afgesloten</span></div>
        ) : (
          <button className="btn" onClick={() => openMirror(date)}>Dag afsluiten</button>
        )}
      </div>

      {timeFor && <TimeSheet h={timeFor} date={date} onClose={() => setTimeFor(null)} />}
      {goalSheet && <NoteSheet note={goal} onClose={() => setGoalSheet(false)} />}
      {torn && !toast && <Toast key={torn.n} text="Gedaan. Was het zwaar?" action="In de koektrommel" onDone={clearTorn} onAction={() => setHardFor(torn.h)} />}
      {hardFor && <HardSheet h={hardFor} date={date} onClose={() => setHardFor(null)} />}
      {toast && <Toast text={toast} onDone={clearToast} action={slipId ? 'Vraag je schaduw' : undefined} onAction={() => slipId && openShadow(slipId)} />}
    </div>
  )
}

/**
 * Een taak die zwaar was, wordt een koekje. Niet de taak zelf telt, maar wat je overwon:
 * "6:30 op" wordt "Om 6:30 op, na vier uur slaap".
 */
function HardSheet({ h, date, onClose }: { h: Habit; date: string; onClose: () => void }) {
  const [text, setText] = useState(h.name)
  const save = () => {
    if (!text.trim()) return
    buzz(14)
    update((d) => { d.jar.unshift({ id: uid(), text: text.trim(), date }) })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="stack gap-4">
          <h2 className="h2">Wat maakte het zwaar?</h2>
          <p className="small" style={{ margin: 0 }}>Schrijf op wat je overwon. Dat lees je terug op een zware dag.</p>
        </div>
        <textarea className="input" rows={3} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Bijv. toch gaan lopen in de regen" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } }} />
        <button className="btn" disabled={!text.trim()} onClick={save}>In de koektrommel</button>
      </div>
    </Sheet>
  )
}

const TIMES = ['05:00', '06:00', '06:30', '07:00', '12:00', '18:00', '20:00', '21:00']

function TimeSheet({ h, date, onClose }: { h: Habit; date: string; onClose: () => void }) {
  const [at, setAt] = useState(h.at ?? '06:30')
  const save = (v?: string) => {
    buzz(12)
    update((d) => {
      const r = d.logs[date]?.rocks?.find((x) => x.id === h.id)
      if (r) r.at = v
      else {
        const x = d.habits.find((y) => y.id === h.id)
        if (x) x.at = v
      }
    })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="stack gap-4">
          <h2 className="h2">Wanneer doe je het?</h2>
          <p className="small" style={{ margin: 0 }}>{h.name}. Een vaste tijd maakt het niet-onderhandelbaar: dan is het een afspraak met jezelf, geen voornemen.</p>
        </div>
        <div className="chips">
          {TIMES.map((t) => <button key={t} className={`chip ${at === t ? 'on' : ''}`} onClick={() => setAt(t)}>{t}</button>)}
        </div>
        <input className="input" type="time" value={at} onChange={(e) => setAt(e.target.value)} aria-label="Eigen tijd" />
        <button className="btn" onClick={() => save(at)}>Vastleggen</button>
        {h.at && <button className="link center" onClick={() => save(undefined)}>Geen vaste tijd</button>}
      </div>
    </Sheet>
  )
}

