import { useCallback, useMemo, useState } from 'react'
import Scene from '../components/Scene'
import CookieProof from '../components/CookieProof'
import Offers from '../components/Offers'
import TaskNotes from '../components/TaskNotes'
import Witness from '../components/Witness'
import { NoteSheet } from '../components/MirrorNotes'
import { HabitRow, Icon, Sheet, Toast, useTween } from '../components/ui'
import { pullingObjects, strongestVirtueObject } from '../data/objects'
import { SINS } from '../data/sins'
import { bigTasksOn, canSave, dayResult, doesItAlone, freshStart, isComeback, isSaved, lostYesterday, missedOn, missedYesterday, otherTasksOn, reserveBack, reservesLeft, scheduleLabel, wonStats } from '../lib/days'
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
  // Reservedagen: gisteren gemist? Eén keer red je hem, twee keer op rij niet.
  const yesterday = addDays(today, -1)
  const missed = date === today && missedYesterday(s, today)
  const savable = missed && canSave(s, yesterday)
  const left = reservesLeft(s, yesterday)
  const twoInRow = missed && missedOn(s, addDays(today, -2))
  const comeback = date === today && isComeback(s, today)
  const saveYesterday = () => {
    buzz(18)
    update((d) => { (d.logs[yesterday] ??= { v: {} }).saved = true })
  }
  // Een verse start: maandag na een slechte week, of de eerste van de maand
  const fresh = date === today && s.asked?.fresh !== today ? freshStart(s, today) : null
  // Herinneringen afbouwen: doe je een taak al drie weken zelf, dan vraagt de app of de melding uit mag
  const notifyOn = !!s.settings?.notify?.on
  const selfMade = date === today && notifyOn ? [...big, ...other].find((h) => h.at && h.remind !== false && !h.remindAsked && !dayRockIds.has(h.id) && doesItAlone(s, h, today)) : undefined
  const answerRemind = (h: Habit, keep: boolean) => update((d) => {
    const x = d.habits.find((y) => y.id === h.id)
    if (x) { x.remindAsked = true; if (!keep) x.remind = false }
  })
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

      {/* 2 · Nooit twee keer missen. Eén misser red je met een reservedag; terugkomen telt dubbel.
          Streng, niet beschamend (Breines & Chen: wie mild naar een misser kijkt, werkt daarna harder). */}
      {comeback ? (
        <div className="miss-bar back">Teruggekomen na gisteren.{reserveBack(s, today) ? ' Je reservedag is terug.' : ''}</div>
      ) : missed && isSaved(s, yesterday) ? (
        <div className="miss-bar saved">Gisteren gered. Twee keer niet.</div>
      ) : savable ? (
        <div className="miss-bar" role="alert">
          <span className="miss-text">Gisteren gemist.<span className="miss-sub">Nog {left} {left === 1 ? 'reservedag' : 'reservedagen'}</span></span>
          <button className="miss-act" onClick={saveYesterday} aria-label="Gisteren redden met een reservedag">Red hem</button>
        </div>
      ) : lost ? (
        <div className="miss-bar" role="alert">{twoInRow ? 'Twee dagen op rij gemist. Doorbreek het vandaag.' : left === 0 ? 'Gisteren gemist, geen reservedagen meer. Vandaag terug.' : 'Gisteren gemist. Vandaag terug.'}</div>
      ) : null}

      {/* Een verse start */}
      {fresh && (
        <div className="fresh-line">
          <p>{fresh === 'month' ? <><b>Nieuwe maand.</b> Twee nieuwe reservedagen. Begin schoon.</> : <><b>Nieuwe week.</b> Die telt opnieuw. Wat vorige week gebeurde, ligt achter je.</>}</p>
          <button className="link" onClick={() => update((d) => { d.asked = { ...d.asked, fresh: today } })}>Oké</button>
        </div>
      )}

      {/* 3 · Het doel, met aftelling */}
      {date === today && (goal ? (
        <button className="goal-hero" onClick={() => setGoalSheet(true)}>
          <span className="goal-title">{goalTitle(goal)}</span>
          <span className="goal-count">{goal.due ? countdownLabel(goal.due, today) : 'Zet er een datum bij'}</span>
          {!(goal.obstacle && goal.ifThen) && <span className="goal-plan">Wat houdt je tegen? Maak een als-dan-plan.</span>}
        </button>
      ) : (
        <button className="goal-hero empty" onClick={() => setGoalSheet(true)}>
          <span className="goal-title">Kies je doel</span>
          <span className="goal-count">Met een datum. Dan telt de app af.</span>
        </button>
      ))}

      {/* Het obstakel bij je doel, met wat je dan doet (WOOP) */}
      {date === today && goal?.obstacle && goal.ifThen && <p className="plan-line"><b>Als {goal.obstacle.replace(/^als\s+/i, '')}:</b> {goal.ifThen}</p>}

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
          onTear={(h) => {
            setValue(date, h.id, h.type === 'target' ? h.amount ?? 1 : 1)
            setTorn((t) => ({ h, n: (t?.n ?? 0) + 1 }))
            // Teruggekomen na een misser: dat is een overwinning op zich, dus een koekje
            update((d) => {
              const id = 'terug-' + today
              if (date === today && isComeback(d, today) && !d.jar.some((j) => j.id === id)) d.jar.unshift({ id, text: 'Teruggekomen na een gemiste dag', date: today })
            })
          }}
          onBack={(h) => { setValue(date, h.id, 0); setTorn(null) }}
          onTime={setTimeFor}
          onRemove={(h) => removeRock(h.id)}
        />
        <div className="won-row">
          <div className="won-dots" aria-label={`${stats.won} van de ${stats.counted} dagen gewonnen`}>
            {week.map((d) => {
              // Vandaag is nog niet voorbij: pas gewonnen, nooit al verloren
              const r = d === today && dayResult(s, d) === false ? null : dayResult(s, d)
              const sv = r === null && isSaved(s, d)
              return <button key={d} className={`won-dot ${r === true ? 'won' : r === false ? 'lost' : sv ? 'saved' : ''} ${d === date ? 'sel' : ''}`} disabled={d < s.createdAt} onClick={() => setDate(d)} aria-label={new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long' }) + (r === true ? ', gewonnen' : r === false ? ', verloren' : sv ? ', gered met een reservedag' : '')}>{new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2)}</button>
            })}
          </div>
          <div className="small">{stats.won} van de {stats.counted} dagen gewonnen · {s.jar.length} {s.jar.length === 1 ? 'overwinning' : 'overwinningen'}</div>
        </div>
        {selfMade && (
          <div className="card remind-card">
            <p><b>{selfMade.name}</b>: drie weken bijna elke dag gedaan. Je doet dit nu zelf. Herinnering uit?</p>
            <div className="hstack" style={{ gap: 8 }}>
              <button className="btn sm" onClick={() => answerRemind(selfMade, false)}>Herinnering uit</button>
              <button className="btn soft sm" onClick={() => answerRemind(selfMade, true)}>Laat aan</button>
            </div>
          </div>
        )}
      </section>

      {/* Eén keer: het nieuwe schema, of taak 4 */}
      {date === today && <section className="section"><Offers /></section>}

      {/* Op zondag en maandag: je week naar je getuige */}
      {date === today && <Witness />}

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
const CUES = ['het opstaan', 'het tandenpoetsen', 'de koffie', 'het ontbijt', 'het werk', 'het avondeten']

/**
 * Wanneer doe je het? Eerst waarna (Stawarz e.a.: een vast moment in je dag maakt het automatisch, een melding niet),
 * dan hoe laat. En of je op die tijd een herinnering wilt.
 */
function TimeSheet({ h, date, onClose }: { h: Habit; date: string; onClose: () => void }) {
  const s = useStore()
  const [cue, setCue] = useState(h.cue ?? '')
  const [at, setAt] = useState(h.at ?? '')
  const [remind, setRemind] = useState(h.remind !== false)
  const isRock = !!s.logs[date]?.rocks?.some((x) => x.id === h.id)
  const notifyOn = !!s.settings?.notify?.on
  const save = () => {
    buzz(12)
    const c = cue.trim().replace(/^na\s+/i, '') || undefined
    const t = at || undefined
    update((d) => {
      const r = d.logs[date]?.rocks?.find((x) => x.id === h.id)
      if (r) { r.at = t; r.cue = c }
      else {
        const x = d.habits.find((y) => y.id === h.id)
        if (x) {
          x.at = t
          x.cue = c
          if (remind) delete x.remind
          else x.remind = false
        }
      }
    })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="stack gap-4">
          <h2 className="h2">Wanneer doe je het?</h2>
          <p className="small" style={{ margin: 0 }}>{h.name}. Koppel het aan iets wat je al elke dag doet. Dat maakt het een gewoonte; een melding niet.</p>
        </div>
        <div className="field">
          <label htmlFor="cue">Na</label>
          <div className="chips">
            {CUES.map((c) => <button key={c} className={`chip ${cue === c ? 'on' : ''}`} onClick={() => setCue(cue === c ? '' : c)}>{c}</button>)}
          </div>
          <input id="cue" className="input" value={cue} onChange={(e) => setCue(e.target.value)} placeholder="Of iets anders: het douchen" />
        </div>
        <div className="field">
          <label htmlFor="at">Hoe laat</label>
          <div className="chips">
            {TIMES.map((t) => <button key={t} className={`chip ${at === t ? 'on' : ''}`} onClick={() => setAt(at === t ? '' : t)}>{t}</button>)}
          </div>
          <input id="at" className="input" type="time" value={at} onChange={(e) => setAt(e.target.value)} aria-label="Eigen tijd" />
          {at && <button className="link" onClick={() => setAt('')}>Geen vaste tijd</button>}
        </div>
        {!isRock && at && notifyOn && (
          <button className="row" role="switch" aria-checked={remind} onClick={() => setRemind((x) => !x)}>
            <div className="grow"><div className="name">Herinnering om {at}</div><div className="meta">Alleen als het dan nog niet af is</div></div>
            <span className={`switch ${remind ? 'on' : ''}`} aria-hidden="true"><i /></span>
          </button>
        )}
        <button className="btn" onClick={save}>Vastleggen</button>
      </div>
    </Sheet>
  )
}
