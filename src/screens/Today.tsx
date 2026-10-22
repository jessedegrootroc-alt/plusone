import { useCallback, useMemo, useState } from 'react'
import BalanceMeter from '../components/BalanceMeter'
import Scene from '../components/Scene'
import { EnergyCheck, GrensCard } from '../components/Grens'
import MirrorNotes from '../components/MirrorNotes'
import { RockIcon } from '../components/Jar'
import { HabitRow, Icon, Sheet, Toast, useTween } from '../components/ui'
import { ROCK_SHORT } from '../data/catalog'
import { pullingObjects } from '../data/objects'
import { SINS, stageFor } from '../data/sins'
import { byRock, computeSeries, habitsFor, isDone, isNote, mirrorStreak, shadowCharge } from '../lib/score'
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

export default function Today({ openMirror, openUrge, openCompass, openShadow }: { openMirror: (date: string) => void; openUrge: () => void; openCompass: () => void; openShadow: (habitId?: string) => void }) {
  const s = useStore()
  const today = todayISO()
  const [date, setDate] = useState(today)
  const [toast, setToast] = useState<string | null>(null)
  const [slipId, setSlipId] = useState<string | null>(null)
  const clearToast = useCallback(() => setToast(null), [])

  const series = useMemo(() => computeSeries(s), [s])
  const point = series.points.find((p) => p.date === date)
  const yesterdayPoint = series.points.find((p) => p.date === addDays(date, -1))
  const balance = series.balance
  const shown = useTween(balance)
  const stage = stageFor(balance)
  const dayDelta = (point?.balance ?? 0) - (yesterdayPoint?.balance ?? 0)
  const streak = mirrorStreak(s)
  const charge = useMemo(() => shadowCharge(s).charge, [s])
  // De voorwerpen van je verleidingen, die het hardst trekken eerst
  const pulling = useMemo(() => pullingObjects(s), [s])
  // Je twee zwakste terrassen: die staan als zondetafereel in Inferno en het woud
  const weakest = useMemo(() => SINS.filter((x) => s.habits.some((h) => h.sin === x.id)).sort((a, b) => series.perSin[a.id] - series.perSin[b.id]).slice(0, 2).map((x) => x.id), [s, series])
  // Je twee sterkste deugden: die staan als tafereel op de terrassen
  const strongest = useMemo(() => SINS.filter((x) => s.habits.some((h) => h.sin === x.id)).sort((a, b) => series.perSin[b.id] - series.perSin[a.id]).slice(0, 2).map((x) => x.id), [s, series])

  const log = s.logs[date]
  const [addRock, setAddRock] = useState(false)
  const virtues = byRock(habitsFor(s, date).filter((h) => h.kind === 'virtue' && !isNote(h)))
  const vices = s.habits.filter((h) => h.kind === 'vice')
  const sealed = !!log?.sealed
  const dayRockIds = new Set((log?.rocks ?? []).map((r) => r.id))
  const done = (h: Habit) => isDone(h, log?.v[h.id] ?? 0) && (h.type !== 'limit' || sealed || (!!log && h.id in log.v))
  const slips = vices.filter((h) => !isDone(h, log?.v[h.id] ?? 0))
  const [showRest, setShowRest] = useState(false)
  const [showVices, setShowVices] = useState(false)
  const [timeFor, setTimeFor] = useState<Habit | null>(null)
  const [suck, setSuck] = useState(false)
  const suckIds = new Set((log?.rocks ?? []).filter((r) => r.suck).map((r) => r.id))
  const big = virtues.filter((h) => h.weight === 3).sort((a, b) => (a.at ?? '99').localeCompare(b.at ?? '99'))
  const rest = virtues.filter((h) => h.weight < 3)
  const bigDone = big.filter(done).length
  const nowHM = new Date().toTimeString().slice(0, 5)
  // Vanaf 19:00, of bij een eerdere dag, is afsluiten de belangrijkste stap: dan staat hij bovenaan.
  const closeTime = date !== today || nowHM >= '19:00'
  // Eerlijk bewijs: hoeveel niet-onderhandelbare dingen je de afgelopen 7 dagen echt deed
  const week7 = useMemo(() => {
    let total = 0
    let n = 0
    for (let i = 0; i < 7; i++) {
      const d = addDays(today, -i)
      if (d < s.createdAt) break
      const l = s.logs[d]
      const hs = habitsFor(s, d).filter((h) => h.kind === 'virtue' && h.weight === 3 && !isNote(h))
      total += hs.length
      n += hs.filter((h) => isDone(h, l?.v[h.id] ?? 0) && (h.type !== 'limit' || !!l?.sealed)).length
    }
    return { done: n, total }
  }, [s, today])
  const plan = s.logs[addDays(date, -1)]?.aar?.plan
  const removeRock = (id: string) => update((d) => {
    const l = d.logs[date]
    if (!l) return
    l.rocks = (l.rocks ?? []).filter((r) => r.id !== id)
    delete l.v[id]
  })
  const yesterday = addDays(today, -1)
  const needsYesterday = date === today && s.createdAt <= yesterday && !s.logs[yesterday]?.sealed

  const week = Array.from({ length: 7 }).map((_, i) => addDays(today, i - 6))

  const change = (id: string, v: number, wasSlip: boolean, isVice: boolean) => {
    setValue(date, id, v)
    if (isVice && !wasSlip && v >= 1) {
      setSlipId(id)
      setToast(SLIP_LINES[Math.floor(Math.random() * SLIP_LINES.length)])
    }
  }

  const shortDate = new Date(date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="screen">
      <div className="hstack between" style={{ gap: 16 }}>
        <div className="stack" style={{ minWidth: 0 }}>
          <div className="eyebrow one-line">{shortDate}{streak > 0 ? ` · ${streak} gespiegeld` : ''}</div>
          <h1 className="h1 one-line">{date === today ? greet(s.name) : 'Terugkijken'}</h1>
        </div>
        {date === today && vices.length > 0 && (
          <button onClick={openUrge} className="hstack urge-btn" aria-label="Ik voel drang">
            {Icon.wave()} <span className="urge-lbl">Drang</span>
          </button>
        )}
      </div>

      {/* De spiegel: in één oogopslag waar je staat. Deze kaart vult precies het scherm. */}
      <div className="card hero-card mt-24" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="hero-scene">
          <Scene balance={shown} onTap={() => openMirror(date)} shadow={charge} strong={strongest} features={s.avatar.features} objects={pulling} weak={weakest} />
        </div>
        <div style={{ padding: '24px 24px 16px' }}>
          <div className="hstack between" style={{ alignItems: 'flex-end', gap: 16 }}>
            <div>
              <div className="eyebrow">{stage.plate} · {stage.place}</div>
              <div className="h2">{stage.name}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="num">{balance >= 0.5 ? '+' : balance <= -0.5 ? '−' : ''}{Math.abs(Math.round(balance))}</div>
              <div className="small">{dayDelta >= 0.05 ? '+' : dayDelta <= -0.05 ? '−' : '±'}{Math.abs(dayDelta).toFixed(1).replace('.', ',')} {date === today ? 'vandaag' : 'die dag'}</div>
            </div>
          </div>
          <div className="mt-16">
            <BalanceMeter balance={shown} onTap={openCompass} />
          </div>
          {plan && (
            <div className="hstack" style={{ gap: 8, marginTop: 8, padding: '8px 12px', borderRadius: 12, background: 'var(--paper-2)' }}>
              <span className="eyebrow" style={{ flex: 'none' }}>Plan van gisteren</span>
              <span className="one-line" style={{ fontSize: 13, lineHeight: '20px', fontWeight: 600 }}>{plan}</span>
            </div>
          )}
        </div>
      </div>

      {/* De spiegel van Goggins direct onder je plaat: het eerste wat je elke dag aankijkt */}
      {date === today && <MirrorNotes date={date} />}

      <div className="week mt-24" role="tablist" aria-label="Kies een dag">
        {week.map((d) => {
          const p = series.points.find((x) => x.date === d)
          const before = d < s.createdAt
          const isSel = d === date
          const n = p?.dayNorm ?? 0
          const sealedD = s.logs[d]?.sealed
          return (
            <button key={d} role="tab" aria-selected={isSel} className={`day ${isSel ? 'sel' : ''}`} disabled={before} onClick={() => setDate(d)} style={{ opacity: before ? 0.3 : 1 }}>
              <span className="dn">{new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2)}</span>
              <span
                className="dot"
                style={{
                  background: sealedD && n > 0.15 ? 'var(--ink)' : sealedD && n < -0.15 ? 'var(--hatch)' : 'transparent',
                  color: sealedD && n > 0.15 ? 'var(--paper)' : 'var(--ink)',
                  borderColor: sealedD ? 'var(--ink)' : 'var(--line)',
                  borderStyle: !sealedD && d !== today && !before ? 'dashed' : 'solid',
                }}
              >
                {Number(d.slice(8))}
              </span>
            </button>
          )
        })}
      </div>

      {needsYesterday && (
        <button className="card mt-24 hstack between" style={{ width: '100%', textAlign: 'left', gap: 16 }} onClick={() => openMirror(yesterday)}>
          <div>
            <div style={{ fontWeight: 600 }}>Gisteren nog niet gespiegeld</div>
            <div className="small">Een paar tikken. Eerlijk is genoeg.</div>
          </div>
          <span className="pill" style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}>Spiegel</span>
        </button>
      )}

      {closeTime && !sealed && (
        <div className="card mt-24 stack gap-16">
          <div className="stack gap-4">
            <div className="eyebrow">{date === today ? 'Vanavond' : 'Deze dag'}</div>
            <div className="h2">Sluit je dag af</div>
            <p className="small" style={{ margin: 0 }}>Twee minuten eerlijk terugkijken. Daarna telt je dag mee in je balans.</p>
          </div>
          <div className="hstack" style={{ gap: 8 }}>
            <button className="btn sm" style={{ flex: 1 }} onClick={() => openMirror(date)}>{Icon.mirror()} Spiegelmoment</button>
            <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => update((d) => { (d.logs[date] ??= { v: {} }).sealed = true })}>Alles klopt zo</button>
          </div>
        </div>
      )}

      {date === today && <EnergyCheck />}

      {/* Goggins: geen lijstje, maar een paar dingen die niet onderhandelbaar zijn, elk op een vaste tijd. */}
      <div className="card mt-16" style={{ paddingBottom: 8 }}>
        <div className="hstack" style={{ gap: 16, paddingBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="h2">Niet-onderhandelbaar</div>
            <div className="small">{bigDone} van {big.length} · deze week {week7.done} van {week7.total}</div>
          </div>
          <button className="iconbtn" aria-label="Steen toevoegen voor deze dag" onClick={() => setAddRock(true)} style={{ border: '1.5px solid var(--line)' }}>{Icon.plus()}</button>
        </div>

        <div className="list flat">
          {big.map((h) => {
            const late = date === today && !!h.at && h.at < nowHM && !done(h)
            const metaBits = [dayRockIds.has(h.id) ? (suckIds.has(h.id) ? 'Het ongemak van vandaag' : date === today ? 'Alleen vandaag' : 'Alleen deze dag') : '', late ? 'te laat' : ''].filter(Boolean)
            return (
              <HabitRow
                key={h.id}
                compact
                h={h}
                lead={<TimeLead at={h.at} late={late} onClick={() => setTimeFor(h)} />}
                value={log?.v[h.id] ?? 0}
                answered={!!log && h.id in log.v}
                onChange={(v) => change(h.id, v, false, false)}
                meta={metaBits.join(' · ') || undefined}
                onRemove={dayRockIds.has(h.id) ? () => removeRock(h.id) : undefined}
              />
            )
          })}
        </div>
        {!big.length && <p className="small" style={{ margin: '0 0 16px' }}>Nog niets. Maak een goede gewoonte groot onder Zelf, of tik op +.</p>}

        {date === today && !suckIds.size && (
          <button className="row suck" onClick={() => setSuck(true)}>
            <span className="time-lead" style={{ color: 'var(--ink-3)' }}>{Icon.plus()}</span>
            <div className="grow">
              <div className="name">Wat ga je vandaag doen dat je niet wilt?</div>
              <div className="meta">Eén ding dat zuigt. Zo eelt je geest.</div>
            </div>
          </button>
        )}

        {rest.length > 0 && (
          <>
            <button className="fold" onClick={() => setShowRest((x) => !x)} aria-expanded={showRest}>
              <span>De rest · {rest.filter(done).length} van {rest.length}</span>
              <span className={`chev ${showRest ? 'open' : ''}`}>{Icon.next()}</span>
            </button>
            <div className={`collapse ${showRest ? 'open' : ''}`} aria-hidden={!showRest} inert={!showRest}>
              <div className="list flat">
                {[...rest.filter((h) => !done(h)), ...rest.filter(done)].map((h) => (
                  <HabitRow
                    key={h.id}
                    compact
                    h={h}
                    lead={<RockIcon size={h.weight} px={16} />}
                    value={log?.v[h.id] ?? 0}
                    answered={!!log && h.id in log.v}
                    onChange={(v) => change(h.id, v, false, false)}
                    meta={dayRockIds.has(h.id) ? (date === today ? 'Alleen vandaag' : 'Alleen deze dag') : undefined}
                    onRemove={dayRockIds.has(h.id) ? () => removeRock(h.id) : undefined}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {vices.length > 0 && (
          <>
            <button className="fold" onClick={() => setShowVices((x) => !x)} aria-expanded={showVices}>
              <span>Verleidingen · {slips.length ? `${slips.length} toegegeven` : 'alles vrij'}</span>
              <span className="hstack" style={{ gap: 8 }}>
                {showVices && <span className="small">tik als je toegaf</span>}
                <span className={`chev ${showVices ? 'open' : ''}`}>{Icon.next()}</span>
              </span>
            </button>
            {(showVices ? vices : slips).length > 0 && (
              <div className="list flat">
                {(showVices ? vices : slips).map((h) => {
                  const v = log?.v[h.id] ?? 0
                  return <HabitRow key={h.id} compact h={h} value={v} answered={sealed || (!!log && h.id in log.v)} onChange={(nv) => change(h.id, nv, !isDone(h, v), true)} />
                })}
              </div>
            )}
          </>
        )}
      </div>

      {date === today && <GrensCard />}

      {/* Afsluiten hoort bij het eind van de dag. Overdag is het een rustige rij onderaan; 's avonds komt het naar boven. */}
      {sealed ? (
        <div className="card mt-24 hstack" style={{ gap: 12 }}>
          {Icon.check()}
          <div>
            <div style={{ fontWeight: 600 }}>{date === today ? 'Vandaag' : 'Deze dag'} is gespiegeld</div>
            <div className="small">Aanpassen kan nog: tik op een gewoonte.</div>
          </div>
        </div>
      ) : !closeTime && (
        <div className="mt-24 stack gap-8">
          <button className="card hstack between" style={{ width: '100%', textAlign: 'left', gap: 16 }} onClick={() => openMirror(date)}>
            <span className="hstack" style={{ gap: 12 }}>
              {Icon.mirror()}
              <span>
                <span className="name" style={{ display: 'block' }}>Dag afsluiten</span>
                <span className="small">Spiegelmoment, vanavond. Twee minuten.</span>
              </span>
            </span>
            <span style={{ color: 'var(--ink-3)', display: 'grid' }}>{Icon.next()}</span>
          </button>
        </div>
      )}

      {timeFor && <TimeSheet h={timeFor} date={date} onClose={() => setTimeFor(null)} />}
      {suck && <SuckSheet date={date} onClose={() => setSuck(false)} />}
      {toast && <Toast text={toast} onDone={clearToast} action={slipId ? 'Vraag je schaduw' : undefined} onAction={() => slipId && openShadow(slipId)} />}
      {addRock && <AddRockSheet date={date} onClose={() => setAddRock(false)} bigCount={virtues.filter((h) => h.weight === 3 && dayRockIds.has(h.id)).length} />}
    </div>
  )
}

function AddRockSheet({ date, onClose, bigCount }: { date: string; onClose: () => void; bigCount: number }) {
  const [text, setText] = useState('')
  const [size, setSize] = useState<1 | 2 | 3>(bigCount >= 3 ? 2 : 3)
  const save = () => {
    if (!text.trim()) return
    buzz(12)
    update((d) => {
      const l = (d.logs[date] ??= { v: {} })
      ;(l.rocks ??= []).push({ id: 'rock-' + uid(), text: text.trim(), size })
    })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="stack gap-4">
          <h2 className="h2">Wat moet vandaag af, hoe dan ook?</h2>
          <p className="small" style={{ margin: 0 }}>Doe eerst wat je dag maakt of breekt. De kleine dingen passen er daarna wel tussen; andersom lukt dat zelden.</p>
        </div>
        <input className="input" autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} placeholder="Bijv. offerte afmaken, moeder bellen" />
        <div className="seg">
          {([3, 2, 1] as const).map((sz) => (
            <button key={sz} className={size === sz ? 'on' : ''} onClick={() => setSize(sz)}>
              <span className="hstack" style={{ gap: 8, justifyContent: 'center' }}><RockIcon size={sz} px={16} /> {ROCK_SHORT[sz]}</span>
            </button>
          ))}
        </div>
        {size === 3 && bigCount >= 3 && <div className="small red">Je hebt er al {bigCount}. Zijn ze allemaal groot, dan is er eigenlijk geen enkele groot.</div>}
        <button className="btn" disabled={!text.trim()} onClick={save}>Zet op vandaag</button>
      </div>
    </Sheet>
  )
}

/** De tijd links van een niet-onderhandelbaar ding. Tik om hem te zetten. */
function TimeLead({ at, late, onClick }: { at?: string; late: boolean; onClick: () => void }) {
  return (
    <span
      role="button"
      tabIndex={0}
      className="time-lead"
      aria-label={at ? `Tijd ${at}, wijzigen` : 'Tijd kiezen'}
      style={{ color: late ? 'var(--ink)' : at ? 'var(--ink-2)' : 'var(--ink-3)', textDecoration: late ? 'underline' : undefined }}
      onClick={(e) => { e.stopPropagation(); onClick() }}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onClick() } }}
    >
      {at ?? 'tijd'}
    </span>
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

const SUCKS = ['Koude douche van 3 minuten', '5 km hardlopen, ook als het regent', 'Het gesprek dat je uitstelt', 'Een uur zonder telefoon', '100 burpees', 'Het vervelendste klusje eerst']

/** Goggins: doe elke dag iets wat je niet wilt. Het telt als grote steen. */
function SuckSheet({ date, onClose }: { date: string; onClose: () => void }) {
  const [text, setText] = useState('')
  const save = () => {
    if (!text.trim()) return
    buzz(12)
    update((d) => {
      const l = (d.logs[date] ??= { v: {} })
      ;(l.rocks ??= []).push({ id: 'rock-' + uid(), text: text.trim(), size: 3, suck: true })
    })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="stack gap-4">
          <h2 className="h2">Wat ga je vandaag doen dat je niet wilt?</h2>
          <p className="small" style={{ margin: 0 }}>Niet het zwaarste dat je kunt bedenken, wel iets wat je liever overslaat. Elke keer dat je het toch doet, wordt je geest wat harder.</p>
        </div>
        <div className="chips">
          {SUCKS.map((x) => <button key={x} className={`chip ${text === x ? 'on' : ''}`} onClick={() => setText(x)}>{x}</button>)}
        </div>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} placeholder="Of schrijf je eigen" />
        <button className="btn" disabled={!text.trim()} onClick={save}>Ik doe het vandaag</button>
      </div>
    </Sheet>
  )
}
