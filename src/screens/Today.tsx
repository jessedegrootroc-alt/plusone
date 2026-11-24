import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SceneCompare from '../components/SceneCompare'
import WinMoment from '../components/WinMoment'
import Offers from '../components/Offers'
import TaskNotes from '../components/TaskNotes'
import { MorningFlow, inMorningWindow, morningDone } from '../components/Morning'
import { Playback } from '../components/Recorder'
import { clipKey } from '../lib/voice'
import { Daypart, Moment, PARTS, partNow, type Part } from '../components/Day'
import { NoteSheet } from '../components/MirrorNotes'
import { AddTaskSheet } from '../components/DaySheets'
import { HabitRow, Icon, Sheet, Toast } from '../components/ui'
import { tierOf } from '../lib/tier'
import { bigTasksOn, canSave, dayResult, doesItAlone, isComeback, isSaved, lostYesterday, missedYesterday, otherTasksOn, scheduleLabel, keptOnly, streakNeed, winStreak, wonStats } from '../lib/days'
import { countdownLabel, daysLeft, goalTitle, mainGoal } from '../lib/goal'
import { isDone } from '../lib/score'
import { isWakeHabit, setWakeTime, shortTime, wakeTime } from '../lib/wake'
import { addDays, buzz, getState, setValue, todayISO, uid, update, useStore, type Habit } from '../lib/store'

const SLIP_LINES = [
  'Genoteerd. Eén val is data, geen identiteit.',
  'Eerlijk. Nu: mis het niet twee keer.',
  'Gezien. De volgende keuze telt weer volledig.',
]

/** Wat je met één tik kiest om vandaag anders te doen. */
const FIXES = ['Het zware ding eerst', 'Telefoon weg', 'Eerder naar bed']

export default function Today({ openMirror, openUrge, openShadow }: { openMirror: (date: string) => void; openUrge: () => void; openShadow: (habitId?: string) => void }) {
  const s = useStore()
  const today = todayISO()
  const [date, setDate] = useState(today)
  const [toast, setToast] = useState<string | null>(null)
  const [slipId, setSlipId] = useState<string | null>(null)
  const clearToast = useCallback(() => setToast(null), [])
  const [timeFor, setTimeFor] = useState<Habit | null>(null)
  const [goalSheet, setGoalSheet] = useState(false)
  const [addTask, setAddTask] = useState(false)
  const [showVices, setShowVices] = useState(false)
  // Na het afscheuren: was het zwaar? Dan wordt het een koekje. Anders is het gewoon gedaan.
  const [torn, setTorn] = useState<{ h: Habit; n: number } | null>(null)
  const [hardFor, setHardFor] = useState<Habit | null>(null)
  const clearTorn = useCallback(() => setTorn(null), [])
  const [sheet, setSheet] = useState<null | 'morning'>(null)

  const stats = useMemo(() => wonStats(s, today), [s, today])
  // Je reeks (Duolingo): dagen op rij gewonnen. Een dag die je reservedag redde, breekt hem niet.
  const streak = useMemo(() => winStreak(s, today), [s, today])
  const wonToday = dayResult(s, today) === true
  const keptToday = keptOnly(s, today)
  // Het moment dat je de dag wint: één keer per dag, alleen als het gebeurt terwijl je de app gebruikt
  const [cheer, setCheer] = useState(false)
  const sawOpen = useRef(false)
  useEffect(() => {
    if (!wonToday) { sawOpen.current = true; return }
    if (getState().logs[today]?.cheered) return
    update((d) => { (d.logs[today] ??= { v: {} }).cheered = true })
    if (sawOpen.current) setCheer(true)
  }, [wonToday, today])

  const log = s.logs[date]
  const sealed = !!log?.sealed
  const big = bigTasksOn(s, date).sort((a, b) => (a.at ?? '99').localeCompare(b.at ?? '99'))
  const other = otherTasksOn(s, date)
  const vices = s.habits.filter((h) => h.kind === 'vice')
  const dayRockIds = new Set((log?.rocks ?? []).map((r) => r.id))
  const done = (h: Habit) => isDone(h, log?.v[h.id] ?? 0) && (log?.v[h.id] ?? 0) > 0
  const slips = vices.filter((h) => !isDone(h, log?.v[h.id] ?? 0))
  const bigDone = big.filter(done).length
  // Wat je reeks vandaag nog vraagt (per niveau minder dan winnen, behalve voor een expert)
  const streakLeft = Math.max(0, streakNeed(s, big.length) - bigDone)
  const nowHM = new Date().toTimeString().slice(0, 5)
  const lost = date === today && lostYesterday(s, today)
  // Gisteren in het kort: wat je deed, en wat je vandaag anders doet
  const yBig = bigTasksOn(s, addDays(today, -1))
  const yDone = yBig.filter((h) => isDone(h, s.logs[addDays(today, -1)]?.v[h.id] ?? 0) && (s.logs[addDays(today, -1)]?.v[h.id] ?? 0) > 0)
  const yPlan = s.logs[addDays(today, -1)]?.aar?.plan
  // Reservedagen: gisteren gemist? Eén keer red je hem, twee keer op rij niet.
  const yesterday = addDays(today, -1)
  const missed = date === today && missedYesterday(s, today)
  const savable = missed && canSave(s, yesterday)
  const comeback = date === today && isComeback(s, today)
  // Gisteren redden verdien je: win vandaag, dan vangt een reservedag gisteren op. Geen knop, het gebeurt bij je winst.
  useEffect(() => {
    if (!wonToday || !savable) return
    buzz(18)
    update((d) => { (d.logs[yesterday] ??= { v: {} }).saved = true })
  }, [wonToday, savable, yesterday])
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
  // Gedaan: een post-it afgescheurd, of op de kaart Nu
  const tear = (h: Habit) => {
    setValue(date, h.id, h.type === 'target' ? h.amount ?? 1 : 1)
    setTorn((t) => ({ h, n: (t?.n ?? 0) + 1 }))
    update((d) => {
      const l = d.logs[date]
      if (l?.due?.id === h.id) delete l.due
      // Teruggekomen na een misser: dat is een overwinning op zich, dus een koekje
      const id = 'terug-' + today
      if (date === today && isComeback(d, today) && !d.jar.some((j) => j.id === id)) d.jar.unshift({ id, text: 'Teruggekomen na een gemiste dag', date: today })
    })
  }
  const change = (id: string, v: number, wasSlip: boolean, isVice: boolean) => {
    setValue(date, id, v)
    if (isVice && !wasSlip && v >= 1) {
      setSlipId(id)
      setToast(SLIP_LINES[Math.floor(Math.random() * SLIP_LINES.length)])
    }
  }
  // De dag in drie dagdelen, op één lijn. Wat voorbij is, wat nu is, wat nog komt.
  const part = partNow()
  const isToday = date === today
  // Een andere dag is helemaal voorbij; hij krijgt dezelfde opbouw als vandaag, alleen de inhoud verschilt
  const whenOf = (p: Part) => (!isToday ? 'past' : p === part ? 'now' : PARTS.indexOf(p) < PARTS.indexOf(part) ? 'past' : 'next') as 'past' | 'now' | 'next'
  const wake = wakeTime(s)
  const bed = s.settings?.notify?.bed ?? '22:15'
  const m = log?.morning
  const morningOpen = !morningDone(m) && !m?.skipped
  const morningNow = part === 'ochtend' && morningOpen && inMorningWindow(s)
  const fromHM = (() => { const [h, mm] = wake.split(':').map(Number); const t = Math.max(0, h * 60 + mm - 60); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}` })()
  // Je week als zeven rondjes: gewonnen, gemist of gered. Tik een dag om terug te kijken.
  const weekDots = (
    <div className="won-dots" aria-label={`${stats.won} van de ${stats.counted} dagen gewonnen`}>
      {week.map((d) => {
        // Vandaag is nog niet voorbij: pas gewonnen, nooit al verloren
        const kept = keptOnly(s, d)
        const r = (d === today || kept) && dayResult(s, d) === false ? null : dayResult(s, d)
        const sv = r === null && isSaved(s, d)
        return <button key={d} className={`won-dot ${r === true ? 'won' : kept ? 'kept' : r === false ? 'lost' : sv ? 'saved' : ''} ${d === date ? 'sel' : ''}`} disabled={d < s.createdAt} onClick={() => setDate(d)} aria-label={new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long' }) + (r === true ? ', gewonnen' : kept ? ', niet gewonnen, reeks gehouden' : r === false ? ', verloren' : sv ? ', gered met een reservedag' : '')}>{new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2)}</button>
      })}
    </div>
  )
  // De post-its per dagdeel, op hun tijd: voor 12:00 ochtend, tot 18:00 overdag, daarna avond.
  // Zonder tijd: opstaan hoort bij de ochtend, de rest staat overdag (daar zet je er een tijd bij).
  const partOfTask = (h: Habit): Part => (h.at ? (h.at < '12:00' ? 'ochtend' : h.at < '18:00' ? 'overdag' : 'avond') : isWakeHabit(h) ? 'ochtend' : 'overdag')
  const allItems = [
    ...big.map((h) => ({ h, big: true, done: done(h), late: date === today && !!h.at && h.at < nowHM && !done(h), removable: dayRockIds.has(h.id) })),
    ...other.map((h) => ({ h, big: false, done: done(h), late: false, meta: scheduleLabel(h), removable: dayRockIds.has(h.id) })),
  ].sort((a, b) => (a.h.at ?? '99').localeCompare(b.h.at ?? '99'))
  const itemsIn = (p: Part) => allItems.filter((x) => partOfTask(x.h) === p)
  const firstBoard = PARTS.find((p) => itemsIn(p).length || p === 'overdag')
  const board = (p: Part) => (
    <section className="tasks">
      <TaskNotes
        count={false}
        hint={p === firstBoard}
        bigDone={bigDone}
        bigTotal={big.length}
        items={itemsIn(p)}
        onTear={tear}
        onBack={(h) => { setValue(date, h.id, 0); setTorn(null) }}
        onTime={setTimeFor}
        onRemove={(h) => removeRock(h.id)}
        onAdd={isToday && p === 'overdag' ? () => setAddTask(true) : undefined}
      />
    </section>
  )
  const shortDate = new Date(date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '')

  return (
    <div className="screen">
      {/* 1 · Je dag in één kop: de datum, je doel als titel (het belangrijkste), en rechts je reeks en Drang.
          Geen begroeting en geen los doelblok meer: boven de vouw hoort wat je vandaag moet doen. */}
      <div className="page-head">
        <div>
          <div className="eyebrow one-line">{shortDate}</div>
          {date !== today ? (
            <h1 className="h1 one-line">Terugkijken</h1>
          ) : goal ? (
            <button className="goal-head" onClick={() => setGoalSheet(true)}>
              {goal.due && daysLeft(goal.due, today) > 0 ? (
                <><span className="goal-num">{daysLeft(goal.due, today)}</span> <span className="goal-lbl">{daysLeft(goal.due, today) === 1 ? 'dag' : 'dagen'} tot je <b>{goalTitle(goal)}</b></span></>
              ) : (
                <span className="goal-lbl"><b>{goalTitle(goal)}</b> · {goal.due ? countdownLabel(goal.due, today) : 'zet er een datum bij'}</span>
              )}
            </button>
          ) : (
            <button className="goal-head empty" onClick={() => setGoalSheet(true)}><span className="goal-lbl"><b>Kies je doel</b> · met een datum</span></button>
          )}
        </div>
        {date === today && (
          <div className="head-acts">
            <span className="streak-chip" aria-label={`${streak} ${streak === 1 ? 'dag' : 'dagen'} op rij. ${wonToday ? 'Vandaag gewonnen.' : keptToday ? 'Je reeks staat.' : `Nog ${streakLeft} ${streakLeft === 1 ? 'taak' : 'taken'} voor ${streak + 1}.`}`}>
              <img src="/art/item-vuur.webp" alt="" />{streak}
            </span>
          </div>
        )}
      </div>

      {/* Je week direct onder je doel: zeven rondjes, tik een dag om terug te kijken */}
      <div className="week-head">{weekDots}</div>

      {/* 2 · Nooit twee keer missen. Eén misser red je met een reservedag; terugkomen telt dubbel.
          Streng, niet beschamend (Breines & Chen: wie mild naar een misser kijkt, werkt daarna harder). */}
      {comeback ? (
        <div className="miss-bar back">{isSaved(s, yesterday) ? 'Opgestaan, en gisteren gered met je reservedag. Nu geen tweede keer.' : 'Gevallen en weer opgestaan. Dát telt.'}</div>
      ) : missed && isSaved(s, yesterday) ? (
        <div className="miss-bar saved">Gered. Nu geen tweede keer.</div>
      ) : (savable || lost) ? (
        // Na een gemiste dag geen rode balk maar Goggins' After Action Report, zonder iets in te vullen:
        // wat goed ging weet de app al, wat je anders doet kies je met één tik.
        <div className="yday">
          <div className="yday-head">
            <span className="eyebrow">Gisteren</span>
            {/* Zoals Stoic's streak-rondjes: per grote taak een bolletje, gedaan gevuld */}
            <span className="yday-dots" aria-label={`${yDone.length} van ${yBig.length} gedaan`}>{yBig.map((h) => <i key={h.id} className={yDone.includes(h) ? 'on' : ''} />)}</span>
          </div>
          {/* Wat je deed voorop, wat bleef liggen stil eronder: eerlijk, zonder rood */}
          <ul className="yday-done">
            {[...yDone, ...yBig.filter((h) => !yDone.includes(h))].map((h) => <li key={h.id} className={yDone.includes(h) ? 'on' : ''}>{yDone.includes(h) ? Icon.check() : <i className="yday-open" />}<span>{h.name}</span></li>)}
          </ul>
          <div className="yday-next">
            {yPlan ? (
              <button className="yday-plan" onClick={() => update((d) => { const l = d.logs[yesterday]; if (l?.aar) delete l.aar.plan })} aria-label={`Vandaag anders: ${yPlan}. Tik om te wijzigen.`}>
                <span className="eyebrow">Vandaag anders</span>
                <span className="yday-plan-txt">{yPlan}</span>
              </button>
            ) : (
              <>
                <span className="eyebrow">Vandaag anders</span>
                <div className="yday-opts">
                  {FIXES.map((f) => <button key={f} className="yday-opt" onClick={() => { buzz(12); update((d) => { const l = (d.logs[yesterday] ??= { v: {} }); l.aar = { ...l.aar, plan: f } }) }}>{f}</button>)}
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {/* Nu: het ene ding dat nu aan de beurt is, met je bewijs uit de koektrommel en één knop om te beginnen */}

      {cheer && <WinMoment onClose={() => setCheer(false)} />}

      {/* De dag: ochtend, overdag, avond. Elk dagdeel vraagt één ding; de taken staan overdag. */}
      <div className="dag">
          <Daypart part="ochtend" label="Ochtend" range={`${shortTime(wake)} – 12:00`} when={whenOf('ochtend')} meta={morningDone(m) ? 'Gedaan' : m?.skipped ? 'Overgeslagen' : !isToday ? 'Niet gedaan' : whenOf('ochtend') === 'past' ? '1 open' : undefined} collapsible={whenOf('ochtend') === 'past' && !itemsIn('ochtend').some((x) => !x.done)}>
            {morningDone(m) ? (
              <Moment art="item-dageraad" kind="Ritueel" title="Ochtendmoment" sub={isToday ? 'Gedaan. Je sterke versie staat bovenaan.' : 'Gedaan.'} done onClick={isToday ? () => setSheet('morning') : undefined} />
            ) : (
              <Moment art="item-dageraad" kind={`Ritueel · 30 sec${inMorningWindow(s) ? '' : ` · vanaf ${fromHM}`}`} title={m?.skipped ? 'Ochtendmoment' : 'Wat zegt de zachte stem in je hoofd?'} sub={m?.skipped ? 'Vandaag overgeslagen. Toch doen?' : 'Neem het op. Dan praat jij terug.'} now={isToday && morningNow} muted={!isToday || (!morningNow && part !== 'ochtend')} onClick={isToday ? () => setSheet('morning') : undefined} />
            )}
            {itemsIn('ochtend').length > 0 && board('ochtend')}
          </Daypart>
          <Daypart part="overdag" label="Overdag" range="12:00 – 18:00" when={whenOf('overdag')}>
      {/* 5 en 6 · De taken van vandaag als briefjes, per dagdeel: scheur eraf wat gedaan is */}
            {board('overdag')}
            <section className="tasks-extra">
        {selfMade && (
          <div className="card remind-card">
            <p><b>{selfMade.name}</b>: drie weken bijna elke dag. Je hebt geen herinnering meer nodig om dit te doen. Uitzetten?</p>
            <div className="hstack" style={{ gap: 8 }}>
              <button className="btn sm" onClick={() => answerRemind(selfMade, false)}>Herinnering uit</button>
              <button className="btn soft sm" onClick={() => answerRemind(selfMade, true)}>Laat aan</button>
            </div>
          </div>
        )}
      </section>

          </Daypart>
          <Daypart part="avond" label="Avond" range={`18:00 – ${shortTime(bed)}`} when={whenOf('avond')}>
            {itemsIn('avond').length > 0 && board('avond')}
            {sealed ? (
              <Moment art="item-handspiegel" kind="Terugkijken" title="Dag afgesloten" sub={dayResult(s, date) === true ? (isToday ? 'Gewonnen. Morgen weer.' : 'Gewonnen.') : (isToday ? 'Eerlijk teruggekeken. Morgen weer.' : 'Eerlijk teruggekeken.')} done onClick={() => openMirror(date)} />
            ) : (
              <Moment art="item-handspiegel" kind="Terugkijken · 2 min" title="Heb je gedaan wat je zei?" sub="Dag afsluiten" now={isToday && part === 'avond'} onClick={() => openMirror(date)} />
            )}
          </Daypart>
        </div>


      {/* Na je dag alleen wat je zelf zei: je sterke versie van vanochtend, en je plan van gisteren. Geen duwtjes meer. */}
      {date === today && morningDone(log?.morning) && (log?.morning?.strong || log?.morning?.strongClip) && (
        <div className="after-day">
          {morningDone(log?.morning) && (
            <div className="morning-line">
              {log?.morning?.strong && <p className="morning-quote">“{log.morning.strong}” <span>zei je vanochtend</span></p>}
              {log?.morning?.strongClip && <Playback clip={clipKey(today, 'strong')} label="Je sterke versie van vanochtend" />}
            </div>
          )}
        </div>
      )}

      {/* Eén keer: het nieuwe schema, of taak 4 */}
      {date === today && <section className="section"><Offers /></section>}

      {/* Verleidingen: bijhouden, telt niet mee. Hier woont ook Drang: voel je hem, dan zit je hem uit. */}
      {(vices.length > 0 || isToday) && (
        <section className="section">
          <div className="card day-card">
            {vices.length > 0 && <button className="fold" onClick={() => setShowVices((x) => !x)} aria-expanded={showVices}>
              <span>Verleidingen · {slips.length ? `${slips.length} toegegeven` : 'alles vrij'}</span>
              <span className={`chev ${showVices ? 'open' : ''}`}>{Icon.next()}</span>
            </button>}
            {vices.length > 0 && (showVices ? vices : slips).length > 0 && (
              <div className="list flat">
                {(showVices ? vices : slips).map((h) => {
                  const v = log?.v[h.id] ?? 0
                  return <HabitRow key={h.id} compact tight h={h} value={v} answered={sealed || (!!log && h.id in log.v)} onChange={(nv) => change(h.id, nv, !isDone(h, v), true)} />
                })}
              </div>
            )}
            {isToday && (
              <button className="urge-row" onClick={openUrge}>
                {Icon.wave()}
                <span className="grow">Voel je drang? <b>Zit hem uit.</b></span>
                <span className="chev">{Icon.next()}</span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* 7 · Het beeld: de figuur klimt mee met je gewonnen dagen */}
      <div className="scene-today">
        <SceneCompare />
      </div>


      {sheet === 'morning' && <Sheet onClose={() => setSheet(null)}><MorningFlow s={s} onDone={() => setSheet(null)} /></Sheet>}
      {timeFor && <TimeSheet h={timeFor} date={date} onClose={() => setTimeFor(null)} />}
      {goalSheet && <NoteSheet note={goal} onClose={() => setGoalSheet(false)} />}
      {addTask && <AddTaskSheet onClose={() => setAddTask(false)} />}
      {torn && !toast && <Toast key={torn.n} text="Gedaan. Kostte het je iets?" action="In de koektrommel" onDone={clearTorn} onAction={() => setHardFor(torn.h)} />}
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
          <h2 className="h2">Wat heb je overwonnen?</h2>
          <p className="small" style={{ margin: 0 }}>Schrijf het op. Op een slechte dag lees je terug wat je al kon.</p>
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
  // Een expert krijgt per taak alleen een herinnering als hij die zelf aanzet
  const expert = tierOf(s) === 'expert'
  const [remind, setRemind] = useState(expert ? h.remind === true : h.remind !== false)
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
          // Je opstaan: de tijd loopt gelijk met je ochtendmelding
          if (t && isWakeHabit(x)) setWakeTime(d, t)
          if (remind) x.remind = expert ? true : undefined
          else x.remind = false
          if (x.remind === undefined) delete x.remind
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
