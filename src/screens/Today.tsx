import { useCallback, useMemo, useState } from 'react'
import Scene from '../components/Scene'
import CookieProof from '../components/CookieProof'
import Offers from '../components/Offers'
import { NoteSheet } from '../components/MirrorNotes'
import { HabitRow, Icon, Sheet, Toast, useTween } from '../components/ui'
import { pullingObjects, strongestVirtueObject } from '../data/objects'
import { SINS } from '../data/sins'
import { bigTasksOn, dayResult, lostYesterday, otherTasksOn, scheduleLabel, wonStats } from '../lib/days'
import { earnedFeatures } from '../lib/emblems'
import { countdownLabel, goalTitle, mainGoal } from '../lib/goal'
import { computeSeries, isDone } from '../lib/score'
import { addDays, buzz, setValue, todayISO, update, useStore, type Habit } from '../lib/store'

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

      {/* 5 · De grote taken: één tik om af te vinken */}
      <section className="section tasks">
        <div className="section-head"><h2 className="h2">{date === today ? 'Vandaag' : 'Die dag'}</h2><span className="small">{bigDone} van {big.length} gedaan</span></div>
        <div className="card">
          {big.length ? (
            <div className="list flat big-tasks">
              {big.map((h) => {
                const on = done(h)
                const late = date === today && !!h.at && h.at < nowHM && !on
                return (
                  <button key={h.id} className={`big-task ${on ? 'done' : ''}`} aria-pressed={on} onClick={() => { buzz(on ? 6 : 14); setValue(date, h.id, on ? 0 : h.type === 'target' ? h.amount ?? 1 : 1) }}>
                    <span className={`check big ${on ? 'on' : ''}`}>{on && Icon.check('#0B0B0B')}</span>
                    <span className="grow">
                      <span className="bt-name">{h.name}</span>
                      {h.at && <span className={`bt-time ${late ? 'late' : ''}`} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); setTimeFor(h) }}>{h.at}{late ? ' · te laat' : ''}</span>}
                    </span>
                    {dayRockIds.has(h.id) && <span role="button" tabIndex={0} aria-label="Weghalen" className="iconbtn bt-x" onClick={(e) => { e.stopPropagation(); removeRock(h.id) }}>{Icon.close()}</span>}
                  </button>
                )
              })}
            </div>
          ) : (
            <p className="lead" style={{ margin: 0 }}>Geen grote taken voor deze dag. Maak een gewoonte groot onder Reis.</p>
          )}
          <div className="won-row">
            <div className="won-dots" aria-label={`${stats.won} van de ${stats.counted} dagen gewonnen`}>
              {week.map((d) => {
                const r = dayResult(s, d)
                return <button key={d} className={`won-dot ${r === true ? 'won' : r === false ? 'lost' : ''} ${d === date ? 'sel' : ''}`} disabled={d < s.createdAt} onClick={() => setDate(d)} aria-label={new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long' })}>{new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2)}</button>
              })}
            </div>
            <div className="small">{stats.won} van de {stats.counted} dagen gewonnen · {s.jar.length} {s.jar.length === 1 ? 'overwinning' : 'overwinningen'}</div>
          </div>
        </div>
      </section>

      {/* Eén keer: het nieuwe schema, of taak 4 */}
      {date === today && <section className="section"><Offers /></section>}

      {/* 6 · Wat er vandaag nog meer staat */}
      {(other.length > 0 || vices.length > 0) && (
        <section className="section">
          <div className="section-head"><h2 className="h2">Nog meer</h2>{other.length > 0 && <span className="small">{other.filter(done).length} van {other.length}</span>}</div>
          <div className="card day-card">
            <div className="list flat">
              {other.map((h) => (
                <HabitRow key={h.id} compact tight h={h} meta={scheduleLabel(h)} value={log?.v[h.id] ?? 0} answered={!!log && h.id in log.v} onChange={(v) => change(h.id, v, false, false)} onRemove={dayRockIds.has(h.id) ? () => removeRock(h.id) : undefined} />
              ))}
            </div>
            {vices.length > 0 && (
              <>
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
              </>
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
      {toast && <Toast text={toast} onDone={clearToast} action={slipId ? 'Vraag je schaduw' : undefined} onAction={() => slipId && openShadow(slipId)} />}
    </div>
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

