import { useRef, useState } from 'react'
import { AREAS, AREA_BY_ID, CHALLENGES, ENERGY, FEAR, FELT, type AreaId, type Size } from '../data/growth'
import { LEVELS, MAX_OPEN, MONTH_GOAL, growthOf, insightsOf, levelsOf, nextSuggestion } from '../lib/growth'
import { addDays, buzz, todayISO, uid, update, useStore, type Challenge } from '../lib/store'
import { Icon, Sheet } from './ui'

const day = (iso: string) => {
  const t = todayISO()
  if (iso === t) return 'vandaag'
  if (iso === addDays(t, 1)) return 'morgen'
  if (iso < t) return `sinds ${new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}`
  return `uiterlijk ${new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}`
}

const ZONE_NAME = { comfort: 'Comfortzone', groei: 'Groeizone', rust: 'Herstel' } as const

const TANK: Record<1 | 2 | 3, string> = {
  3: 'Goede dag om je grens te verleggen.',
  2: 'Doe je niet-onderhandelbare dingen. Je grens kan vandaag, als je hem klein houdt.',
  1: 'Vandaag herstel je: slaap, eet goed, wandel. Je grens wacht tot morgen.',
}

/**
 * De ochtendvraag: hoe vol is je tank? Eén tik, en je ziet meteen wat het voor je dag betekent.
 * Dit is de rem op burn-out: bij een lege tank schakelt De grens naar herstel.
 */
export function EnergyCheck() {
  const s = useStore()
  const today = todayISO()
  const e = s.logs[today]?.energy
  const g = growthOf(s)
  const [edit, setEdit] = useState(false)
  const set = (v: 1 | 2 | 3) => {
    buzz()
    update((d) => { (d.logs[today] ??= { v: {} }).energy = v })
    setEdit(false)
  }
  const label = ENERGY.find((x) => x.v === e)?.label
  const outcome = e ? (g.zone === 'rust' && e !== 1 ? g.reason : TANK[e]) : null

  if (e && !edit) {
    return (
      <button className="card mt-24 hstack between" style={{ width: '100%', textAlign: 'left', gap: 16 }} onClick={() => setEdit(true)} aria-label={`Tank: ${label}. Wijzigen`}>
        <div className="stack gap-4" style={{ minWidth: 0 }}>
          <div className="eyebrow">Je tank · {label}</div>
          <div className="lead">{outcome}</div>
        </div>
        <span className="link" style={{ flex: 'none' }}>Wijzig</span>
      </button>
    )
  }

  return (
    <div className="card mt-24 stack gap-16">
      <div className="stack gap-4">
        <div className="eyebrow">Ochtendvraag</div>
        <div className="h2">Hoe vol is je tank vandaag?</div>
        <p className="small" style={{ margin: 0 }}>Eén tik. De app past je dag erop aan, zodat groeien geen burn-out wordt.</p>
      </div>
      <div className="seg">
        {ENERGY.map((x) => (
          <button key={x.v} className={e === x.v ? 'on' : ''} aria-pressed={e === x.v} onClick={() => set(x.v)}>{x.label}</button>
        ))}
      </div>
    </div>
  )
}

/** Hoeveel dagen je nog hebt, in woorden die je voelt. */
const countdown = (due: string) => {
  const n = Math.round((new Date(due + 'T12:00:00').getTime() - new Date(todayISO() + 'T12:00:00').getTime()) / 86400000)
  if (n < 0) return { text: `${-n} ${n === -1 ? 'dag' : 'dagen'} over tijd`, late: true }
  if (n === 0) return { text: 'vandaag', late: false }
  if (n === 1) return { text: 'morgen', late: false }
  return { text: `nog ${n} dagen`, late: false }
}

/** Vasthouden tot de ring rond is: dezelfde vorm als een vinkje, maar met een drempel. */
function HoldRing({ onDone, label }: { onDone: () => void; label: string }) {
  const [p, setP] = useState(0)
  const raf = useRef(0)
  const t0 = useRef(0)
  const MS = 1400
  const start = () => {
    t0.current = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0.current) / MS)
      setP(k)
      if (k >= 1) { buzz(30); onDone(); setP(0) } else raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const stop = () => { cancelAnimationFrame(raf.current); setP(0) }
  const R = 22
  const C = 2 * Math.PI * R
  return (
    <button
      className="hold-ring"
      aria-label={label}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && start()}
      onKeyUp={stop}
    >
      <svg viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r={R} fill="none" stroke="var(--line)" strokeWidth="2" />
        {p > 0 && <circle cx="26" cy="26" r={R} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${p * C} ${C}`} transform="rotate(-90 26 26)" />}
      </svg>
      <span className="ico-wrap" style={{ opacity: 0.35 + p * 0.65 }}>{Icon.check()}</span>
      <span className="cap">{p > 0 ? 'vasthouden' : 'houd vast'}</span>
    </button>
  )
}

/** Acht streepjes: je grenzen deze maand. Zichtbaar zonder te lezen. */
function MonthPips({ n, zone }: { n: number; zone: keyof typeof ZONE_NAME }) {
  return (
    <div className="stack gap-8">
      <div className="hstack" style={{ gap: 4 }} aria-hidden="true">
        {Array.from({ length: MONTH_GOAL }).map((_, i) => (
          <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < n ? 'var(--ink)' : 'var(--line)' }} />
        ))}
      </div>
      <span className="small">{Math.min(n, MONTH_GOAL)} van {MONTH_GOAL} grenzen deze maand · {ZONE_NAME[zone].toLowerCase()}</span>
    </div>
  )
}

/**
 * Op Vandaag: je grens van deze week. Eén vraag, één eerste stap, één ring om af te ronden.
 * De ring lijkt op een vinkje maar vraagt vasthouden: gedaan, niet gezegd.
 */
export function GrensCard() {
  const s = useStore()
  const g = growthOf(s)
  const [pick, setPick] = useState(false)
  const [felt, setFelt] = useState<Challenge | null>(null)
  const next = g.open[0]
  const cd = next ? countdown(next.due) : null

  return (
    <div className="card mt-16 stack gap-16">
      {g.zone === 'rust' ? (
        <div className="stack gap-4">
          <div className="eyebrow">Je grens · rustdag</div>
          <div className="h2">Vandaag herstel je.</div>
          <p className="lead">{g.reason}{next ? ' Je grens wacht.' : ''}</p>
        </div>
      ) : next ? (
        <>
          <div className="hstack between" style={{ gap: 12 }}>
            <div className="eyebrow">Je grens deze week</div>
            <span className="small" style={{ color: cd!.late ? 'var(--ink)' : undefined, fontWeight: cd!.late ? 600 : undefined }}>{cd!.text}</span>
          </div>
          <div className="hstack" style={{ gap: 16, alignItems: 'flex-start' }}>
            <div className="stack gap-4 grow" style={{ minWidth: 0 }}>
              <div className="h2">{next.title}</div>
              <div className="small">{AREA_BY_ID[next.area].name}{g.open.length > 1 ? ` · nog ${g.open.length - 1} open` : ''}</div>
            </div>
            <HoldRing label={`${next.title}: houd vast als het gedaan is`} onDone={() => setFelt(next)} />
          </div>
          {next.step && (
            <button
              className={`grens-step ${next.stepDone ? 'on' : ''}`}
              aria-pressed={!!next.stepDone}
              onClick={() => { buzz(); update((d) => { const x = d.growth.find((y) => y.id === next.id); if (x) x.stepDone = !x.stepDone }) }}
            >
              <span className={`check ${next.stepDone ? 'on' : ''}`} style={{ width: 24, height: 24 }}>{next.stepDone && Icon.check('#0B0B0B')}</span>
              <span className="stack" style={{ gap: 0 }}>
                <span className="small">{next.stepDone ? 'Eerste stap gezet. Nu de rest.' : 'Eerste stap, twee minuten'}</span>
                <span className="txt">{next.step}</span>
              </span>
            </button>
          )}
        </>
      ) : (
        <div className="stack gap-12">
          <div className="stack gap-4">
            <div className="eyebrow">Je grens deze week</div>
            <div className="h2">Wat ga je doen dat je spannend vindt?</div>
            <p className="lead">{g.zone === 'comfort' ? g.reason : 'Eén ding buiten je comfortzone. Groot hoeft niet.'}</p>
          </div>
          <button className="btn ghost sm" onClick={() => setPick(true)}>Kies je grens</button>
        </div>
      )}

      <MonthPips n={g.month.length} zone={g.zone} />

      {pick && <ChallengeSheet onClose={() => setPick(false)} />}
      {felt && <FeltSheet c={felt} onClose={() => setFelt(null)} />}
    </div>
  )
}

/** Na afloop: hoe was het? Gaat ook in de koektrommel, als bewijs voor zwaardere dagen. */
export function FeltSheet({ c, onClose }: { c: Challenge; onClose: () => void }) {
  const save = (v: 1 | 2 | 3) => {
    buzz(30)
    update((d) => {
      const x = d.growth.find((y) => y.id === c.id)
      if (!x) return
      x.status = 'gedaan'
      x.doneAt = todayISO()
      x.felt = v
      d.jar.unshift({ id: uid(), text: `Grens verlegd: ${c.title}`, date: todayISO() })
    })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="stack gap-4">
          <div className="eyebrow">Gedaan</div>
          <h2 className="h2">Hoe was het?</h2>
          <p className="small" style={{ margin: 0 }}>Eerlijk is genoeg. ‘Te veel’ is geen falen; het vertelt de app dat de volgende kleiner moet.</p>
        </div>
        <div className="stack gap-8">
          {FELT.map((x) => (
            <button key={x.v} className={`btn ${x.v === 2 ? '' : 'soft'}`} onClick={() => save(x.v)}>{x.label}</button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

/** Een grens kiezen: een plek in je leven, iets concreets, hoe spannend, en wanneer. */
export function ChallengeSheet({ onClose, preset }: { onClose: () => void; preset?: { area: AreaId; title: string; step: string; size: Size } }) {
  const s = useStore()
  const g = growthOf(s)
  const today = todayISO()
  const [area, setArea] = useState<AreaId | null>(preset?.area ?? null)
  const [title, setTitle] = useState(preset?.title ?? '')
  const [step, setStep] = useState<string | undefined>(preset?.step)
  const [size, setSize] = useState<Size>(preset?.size ?? 'klein')
  const [fear, setFear] = useState<1 | 2 | 3>(2)
  const [due, setDue] = useState(addDays(today, 6))
  const full = g.open.length >= MAX_OPEN
  const levels = levelsOf(s)
  const levelOf = (id: AreaId) => levels.find((l) => l.area === id)!

  if (g.zone === 'rust' || full) {
    return (
      <Sheet onClose={onClose}>
        <div className="stack gap-16">
          <h2 className="h2">{full ? `Je hebt er al ${MAX_OPEN} open.` : 'Nu even niet.'}</h2>
          <p className="lead">{full ? 'Als alles moet, gebeurt er niets. Maak er eerst één af, of laat er één los.' : g.reason}</p>
          <button className="btn" onClick={onClose}>Begrepen</button>
        </div>
      </Sheet>
    )
  }

  // Stap 1: waar wil je groeien? Tegels per plek, gegroepeerd, met je niveau erop.
  if (!area) {
    const groups = [...new Set(AREAS.map((a) => a.group))]
    return (
      <Sheet onClose={onClose}>
        <div className="stack gap-24">
          <div className="stack gap-4">
            <h2 className="h2">Waar wil je groeien?</h2>
            <p className="small" style={{ margin: 0 }}>Groeien op één plek maakt je sterk; groeien overal maakt je heel. Begin gerust waar je nog niets hebt gedaan.</p>
          </div>
          {groups.map((gr) => (
            <div key={gr} className="stack gap-8">
              <div className="eyebrow">{gr}</div>
              <div className="area-grid">
                {AREAS.filter((a) => a.group === gr).map((a) => {
                  const l = levelOf(a.id)
                  return (
                    <button key={a.id} className={`area-tile ${a.id === g.quiet ? 'hint' : ''}`} onClick={() => { setArea(a.id); setTitle(''); setStep(undefined) }}>
                      <span className="t">{a.name}</span>
                      <span className="small">{a.id === g.quiet && !l.points ? 'Voorstel · nog niets' : l.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    )
  }

  const save = () => {
    buzz(30)
    update((d) => {
      ;(d.growth ??= []).push({ id: uid(), area, title: title.trim(), size, step, fear, status: 'open', createdAt: today, due })
    })
    onClose()
  }
  const tried = new Set((s.growth ?? []).map((c) => c.title))

  // Stap 2: wat precies? Een lijst om uit te kiezen, of je eigen grens.
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <button className="link hstack" style={{ gap: 4, alignSelf: 'flex-start', textDecoration: 'none', color: 'var(--ink-2)' }} onClick={() => setArea(null)}>{Icon.back()} Alle plekken</button>
        <div className="stack gap-4">
          <div className="eyebrow">{AREA_BY_ID[area].group} · {levelOf(area).name}</div>
          <h2 className="h2">{AREA_BY_ID[area].name}</h2>
          <p className="small" style={{ margin: 0 }}>{AREA_BY_ID[area].line}</p>
        </div>

        <div className="list" role="radiogroup" aria-label="Kies een grens">
          {CHALLENGES.filter((c) => c.area === area).map((c) => {
            const on = title === c.title
            return (
              <button key={c.title} role="radio" aria-checked={on} className={`row pick ${on ? 'on' : ''}`} style={{ width: '100%', textAlign: 'left' }} onClick={() => { setTitle(c.title); setStep(c.step); setSize(c.size) }}>
                <div className="grow">
                  <div className="name">{c.title}</div>
                  <div className="meta">{c.size === 'groot' ? 'Groot, een mijlpaal' : 'Klein, een uur'}{tried.has(c.title) ? ' · al eens gekozen' : ''}</div>
                </div>
                <div className={`check ${on ? 'on' : ''}`}>{on && Icon.check('#0B0B0B')}</div>
              </button>
            )
          })}
        </div>
        <input className="input" value={CHALLENGES.some((c) => c.title === title) ? '' : title} onChange={(e) => { setTitle(e.target.value); setStep(undefined) }} placeholder="Of schrijf je eigen grens" />

        <div className="field">
          <label>Hoe groot?</label>
          <div className="seg">
            {(['klein', 'groot'] as const).map((x) => (
              <button key={x} className={size === x ? 'on' : ''} onClick={() => setSize(x)}>{x === 'klein' ? 'Klein, een uur' : 'Groot, een mijlpaal'}</button>
            ))}
          </div>
          {size === 'groot' && g.bigThisWeek && <div className="small" style={{ color: 'var(--ink)' }}>Je hebt deze week al een grote. Eén per week is genoeg; kies een latere datum of iets kleiners.</div>}
        </div>

        <div className="field">
          <label>Hoe spannend voelt het?</label>
          <div className="seg">
            {FEAR.map((x) => (
              <button key={x.v} className={fear === x.v ? 'on' : ''} onClick={() => setFear(x.v)}>{x.label}</button>
            ))}
          </div>
          <div className="small">{fear === 1 ? 'Lekker is je comfortzone. Prima om te beginnen, maar daar groei je niet.' : fear === 2 ? 'Precies goed. Hier groei je.' : 'Doodeng is de paniekzone. Alleen doen als je tank vol is, en dan nog liever een stapje kleiner.'}</div>
        </div>

        <div className="field">
          <label>Wanneer is het gedaan?</label>
          <div className="seg">
            {([[today, 'Vandaag'], [addDays(today, 1), 'Morgen'], [addDays(today, 6), 'Deze week'], [addDays(today, 13), 'Over twee weken']] as const).map(([d, l]) => (
              <button key={d} className={due === d ? 'on' : ''} onClick={() => setDue(d)}>{l}</button>
            ))}
          </div>
        </div>

        <button className="btn" disabled={!title.trim()} onClick={save}>Zet hem neer</button>
      </div>
    </Sheet>
  )
}

const INSIGHT_LABEL = { kracht: 'Je kracht', 'blinde vlek': 'Wat je laat liggen', patroon: 'Hoe je kiest' } as const

/** Alles per plek, achter "Alle plekken": niveaus, wat de app ziet, wat open staat. */
export function GrensDetails({ onClose }: { onClose: () => void }) {
  const s = useStore()
  const g = growthOf(s)
  const levels = levelsOf(s)
  const insights = insightsOf(s)
  const next = nextSuggestion(s)
  const [pick, setPick] = useState<null | 'new' | 'next'>(null)
  const [felt, setFelt] = useState<Challenge | null>(null)
  const steps = LEVELS.length - 1
  const openAreas = new Set(g.open.map((c) => c.area))
  const touched = levels.filter((l) => l.points > 0 || openAreas.has(l.area)).sort((a, b) => b.points - a.points)
  const untouched = levels.filter((l) => !touched.includes(l))

  return (
    <>
      <Sheet onClose={onClose}>
      <div className="stack gap-24">
        <div className="hstack between"><h2 className="h2">De grens per plek</h2><button className="link" onClick={onClose}>Klaar</button></div>
        <p className="lead">{g.reason}</p>

        {/* Per plek: vijf treden, van eerste stap tot nieuwe comfortzone */}
        <div className="stack gap-16" role="list" aria-label="Je niveau per plek in je leven">
          {touched.map((l) => {
            const a = AREA_BY_ID[l.area]
            return (
              <div key={l.area} role="listitem" className="stack gap-8" aria-label={`${a.name}: ${l.name}`}>
                <div className="hstack between" style={{ gap: 12 }}>
                  <span style={{ color: l.points ? 'var(--ink)' : 'var(--ink-3)' }}>{a.name}</span>
                  <span className="small" style={{ color: l.points ? 'var(--ink-2)' : 'var(--ink-3)' }}>{l.name}</span>
                </div>
                <div className="hstack" style={{ gap: 4 }}>
                  {Array.from({ length: steps }).map((_, i) => {
                    const fill = i < l.level ? 1 : i === l.level ? l.toNext : 0
                    return (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}>
                        <div style={{ width: `${fill * 100}%`, height: '100%', background: 'var(--ink)', transition: 'width .8s var(--ease)' }} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {untouched.length > 0 && (
            <p className="small" style={{ margin: 0 }}>
              <span style={{ color: 'var(--ink-2)' }}>Nog onbekend terrein ({untouched.length}):</span> {untouched.map((l) => AREA_BY_ID[l.area].name.toLowerCase()).join(', ')}.
            </p>
          )}
          <p className="small" style={{ margin: 0 }}>Een kleine grens telt 1 punt, een grote 3, een doodenge 1 extra. Op de laatste trede is het je nieuwe comfortzone: daar groei je niet meer, zoek dan verderop.</p>
        </div>

        {/* Wat de app aan je gedrag ziet */}
        <div className="stack gap-16">
          <div className="eyebrow">Wat ik zie</div>
          {insights.map((x) => (
            <div key={x.kind} className="stack gap-4">
              <div style={{ fontWeight: 600 }}>{INSIGHT_LABEL[x.kind]}</div>
              <p className="lead">{x.text}</p>
            </div>
          ))}
          <div className="small">{g.said ? `Doen, niet zeggen: ${g.done} van ${g.said} gedaan.` : 'Nog niets neergezet.'}</div>
        </div>

        {/* Het voorstel: de stilste plek, op jouw niveau */}
        {next && g.canAdd && (
          <div className="stack gap-12" style={{ padding: 16, borderRadius: 'var(--r-md)', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            <div className="eyebrow">Je volgende grens</div>
            <div className="stack gap-4">
              <div className="h2">{next.title}</div>
              <div className="small">{AREA_BY_ID[next.area].name} · {next.size === 'groot' ? 'een mijlpaal' : 'klein, een uur'} · hier ben je: {next.level.name.toLowerCase()}</div>
            </div>
            <button className="btn sm" onClick={() => setPick('next')}>Zet hem neer</button>
          </div>
        )}

        {g.open.length > 0 && (
          <div className="stack gap-8">
            <div className="eyebrow">Staat open</div>
            <div className="list flat">
              {g.open.map((c) => (
                <div key={c.id} className="row" style={{ minHeight: 56 }}>
                  <div className="grow">
                    <div className="name">{c.title}</div>
                    <div className="meta">{AREA_BY_ID[c.area].name} · {day(c.due)}</div>
                  </div>
                  <button className="link" onClick={() => setFelt(c)}>Gedaan</button>
                  <button className="link" style={{ color: 'var(--ink-3)' }} onClick={() => update((d) => { const x = d.growth.find((y) => y.id === c.id); if (x) x.status = 'losgelaten' })}>Loslaten</button>
                </div>
              ))}
            </div>
            {g.stale.length > 0 && <div className="small">Staat al een paar dagen over tijd. Plan het opnieuw of laat het los: een belofte die blijft liggen, weegt zwaarder dan een die je loslaat.</div>}
          </div>
        )}

        <button className="btn soft sm" onClick={() => setPick('new')}>Zelf een grens kiezen</button>
      </div>
      </Sheet>

      {pick && <ChallengeSheet onClose={() => setPick(null)} preset={pick === 'next' && next ? next : undefined} />}
      {felt && <FeltSheet c={felt} onClose={() => setFelt(null)} />}
    </>
  )
}

