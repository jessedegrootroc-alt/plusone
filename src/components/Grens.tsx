import { useRef, useState } from 'react'
import { AREAS, AREA_BY_ID, CHALLENGES, ENERGY, FEAR, FELT, type AreaId, type Size } from '../data/growth'
import { LEVELS, MAX_OPEN, growthOf, insightsOf, levelsOf, nextSuggestion } from '../lib/growth'
import { addDays, buzz, todayISO, uid, update, useStore, type Challenge } from '../lib/store'
import { grensHabitId, grensWeight } from '../lib/score'
import { Icon, Sheet } from './ui'

const day = (iso: string) => {
  const t = todayISO()
  if (iso === t) return 'vandaag'
  if (iso === addDays(t, 1)) return 'morgen'
  if (iso < t) return `sinds ${new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}`
  return `uiterlijk ${new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })}`
}


const TANK: Record<1 | 2 | 3, string> = {
  3: 'Goede dag om je grens te verleggen.',
  2: 'Doe je niet-onderhandelbare dingen. Je grens kan vandaag, als je hem klein houdt.',
  1: 'Vandaag herstel je: slaap, eet goed, wandel. Je grens wacht tot morgen.',
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

/**
 * Op Vandaag: je grens van deze week. Eén vraag, één eerste stap, één ring om af te ronden.
 * De ring lijkt op een vinkje maar vraagt vasthouden: gedaan, niet gezegd.
 */
/**
 * De tank als één regel: drie knoppen naast elkaar, één tik. Alleen als het ertoe doet (leeg, of herstel)
 * staat er een zin onder: dan remt de app je grens af, zodat groeien geen burn-out wordt.
 */
export function TankStrip() {
  const s = useStore()
  const today = todayISO()
  const e = s.logs[today]?.energy
  const g = growthOf(s)
  const set = (v: 1 | 2 | 3) => { buzz(); update((d) => { (d.logs[today] ??= { v: {} }).energy = v }) }
  const warn = e === 1 ? TANK[1] : e && g.zone === 'rust' ? g.reason : null
  return (
    <div className="day-tank">
      <div className="day-tank-row">
        <span className="day-label">Je tank</span>
        <div className="tank-pills" role="group" aria-label="Hoe vol is je tank vandaag?">
          {ENERGY.map((x) => <button key={x.v} className={e === x.v ? 'on' : ''} aria-pressed={e === x.v} onClick={() => set(x.v)}>{x.label}</button>)}
        </div>
      </div>
      {warn && <p className="small" style={{ margin: 0 }}>{warn}</p>}
    </div>
  )
}

/**
 * Je grens van deze week als één regel in je dag. Vasthouden als hij gedaan is;
 * de details (eerste stap, per plek) staan achter een tik.
 */
export function GrensRow() {
  const s = useStore()
  const g = growthOf(s)
  const [pick, setPick] = useState(false)
  const [felt, setFelt] = useState<Challenge | null>(null)
  const [more, setMore] = useState(false)
  const next = g.open[0]
  const cd = next ? countdown(next.due) : null
  const staff = <img src="/art/item-pelgrimsstaf.webp" alt="" className="row-icon" />
  return (
    <>
      {g.zone === 'rust' ? (
        <div className="row tight">
          {staff}
          <div className="grow"><div className="name">Rustdag</div><div className="meta">Je grens wacht tot je tank weer vol is</div></div>
        </div>
      ) : next ? (
        <div className="row tight">
          {staff}
          <button className="grow" style={{ textAlign: 'left', minWidth: 0 }} onClick={() => setMore(true)}>
            <div className="name ellipsis">{next.title}</div>
            <div className="meta" style={{ color: cd!.late ? 'var(--ink)' : undefined }}>Grens · {cd!.text} · {grensWeight(next)}×</div>
          </button>
          <HoldRing label={`${next.title}: houd vast als het gedaan is`} onDone={() => setFelt(next)} />
        </div>
      ) : (
        <button className="row tight" onClick={() => setPick(true)}>
          {staff}
          <div className="grow"><div className="name">Kies je grens van deze week</div><div className="meta">{g.zone === 'comfort' ? 'Twee weken niets spannends' : 'Eén ding buiten je comfortzone'}</div></div>
          <span style={{ color: 'var(--ink-3)', display: 'grid' }}>{Icon.next()}</span>
        </button>
      )}
      {pick && <ChallengeSheet onClose={() => setPick(false)} />}
      {felt && <FeltSheet c={felt} onClose={() => setFelt(null)} />}
      {more && <GrensDetails onClose={() => setMore(false)} />}
    </>
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
      ;(d.logs[todayISO()] ??= { v: {} }).v[grensHabitId(x)] = 1
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
          <div className="small">{fear === 1 ? 'Lekker is je comfortzone. Prima om te beginnen, maar daar groei je niet.' : fear === 2 ? 'Precies goed. Hier groei je.' : 'Doodeng is de paniekzone. Alleen doen als je tank vol is, en dan nog liever een stapje kleiner.'} Telt {grensWeight({ fear, size })}× mee in je balans.</div>
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
const ZONE_TEXT = { comfort: 'Comfortzone', groei: 'Groeizone', rust: 'Herstel' } as const

/**
 * Comfort, groei en paniek als drie ringen (Senninger). De stip staat waar je nu zit.
 * In herstel staat hij in het midden, gedimd: even terug naar veilig, en dat is ook training.
 */
function ZoneRings({ zone }: { zone: 'comfort' | 'groei' | 'rust' }) {
  const r = zone === 'groei' ? 19 : 0
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true" style={{ flex: 'none' }}>
      <circle cx="32" cy="32" r="29" fill="none" stroke="#F2F2F2" strokeOpacity="0.2" strokeDasharray="2 3" />
      <circle cx="32" cy="32" r="19" fill={zone === 'groei' ? 'rgba(242,242,242,0.08)' : 'none'} stroke="#F2F2F2" strokeOpacity={zone === 'groei' ? 0.9 : 0.25} />
      <circle cx="32" cy="32" r="9" fill={zone !== 'groei' ? 'rgba(242,242,242,0.1)' : 'none'} stroke="#F2F2F2" strokeOpacity={zone !== 'groei' ? 0.9 : 0.25} />
      <circle cx={32 + r * Math.cos(-0.7)} cy={32 + r * Math.sin(-0.7)} r="4" fill={zone === 'rust' ? '#808080' : '#F2F2F2'} className="zone-dot" />
    </svg>
  )
}

/** Vijf treden als een trap: gevuld tot je niveau, de trede waar je naartoe klimt half. */
function Stairs({ level, toNext }: { level: number; toNext: number }) {
  return (
    <svg width="44" height="20" viewBox="0 0 44 20" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const h = 4 + i * 4
        const on = i < level
        const now = i === level && toNext > 0
        return <rect key={i} x={i * 9} y={20 - h} width="7" height={h} rx="1" fill="#F2F2F2" fillOpacity={on ? 1 : now ? 0.45 : 0.12} />
      })}
    </svg>
  )
}

/**
 * De grens per plek, als een kaart van je leven. Waar je al bent geweest is verlicht en heeft een trap
 * van vijf treden; waar je nooit kwam ligt in de mist. Tik een plek en de app stelt een grens voor, op jouw niveau.
 */
export function GrensDetails({ onClose }: { onClose: () => void }) {
  const s = useStore()
  const g = growthOf(s)
  const levels = levelsOf(s)
  const insights = insightsOf(s)
  const next = nextSuggestion(s)
  const [pick, setPick] = useState<null | { preset?: Parameters<typeof ChallengeSheet>[0]['preset'] }>(null)
  const [felt, setFelt] = useState<Challenge | null>(null)
  const openAreas = new Set(g.open.map((c) => c.area))
  const lit = levels.filter((l) => l.points > 0 || openAreas.has(l.area)).sort((a, b) => b.points - a.points)
  const fog = levels.filter((l) => !lit.includes(l))
  const known = lit.length
  const [showFog, setShowFog] = useState(false)
  const pickArea = (area: AreaId) => { const n = nextSuggestion(s, [area]); setPick({ preset: n ?? { area, title: '', step: '', size: 'klein' } }) }

  return (
    <>
      <Sheet onClose={onClose}>
      <div className="stack gap-24">
        <div className="hstack between"><h2 className="h2">De grens per plek</h2><button className="link" onClick={onClose}>Klaar</button></div>

        {/* Waar je nu zit: comfort, groei of herstel */}
        <div className="zone-card">
          <ZoneRings zone={g.zone} />
          <div className="stack gap-4" style={{ minWidth: 0 }}>
            <div className="h2">{ZONE_TEXT[g.zone]}</div>
            <p className="small" style={{ margin: 0 }}>{g.reason.replace(/^Je zit in de groeizone\. /, '')}</p>
          </div>
        </div>

        {/* Waar je groeit: alleen de plekken waar je al was, elk met zijn trap en wat de volgende trede is.
            De rest van de kaart is één regel; open hem pas als je een nieuwe plek wilt kiezen. */}
        <div className="stack gap-12">
          <div className="section-head" style={{ margin: 0 }}><h3 className="h2">Waar je groeit</h3><span className="small">{known} van {levels.length} plekken</span></div>
          <div className="list">
            {lit.map((l) => {
              const a = AREA_BY_ID[l.area]
              const up = LEVELS[l.level + 1]
              return (
                <button key={l.area} className="row" onClick={() => pickArea(l.area)} aria-label={`${a.name}: ${l.name}. Tik voor een grens hier.`}>
                  <Stairs level={l.level} toNext={l.toNext} />
                  <div className="grow">
                    <div className="name">{a.name}{openAreas.has(l.area) && <span className="area-dot" aria-label="staat een grens open" />}</div>
                    <div className="meta">{l.level === 0 ? 'Je eerste grens hier staat open' : `${l.name}${up ? ` · nog ${l.need} ${l.need === 1 ? 'punt' : 'punten'} tot ${up.name.toLowerCase()}` : ' · nieuwe comfortzone, zoek verderop'}`}</div>
                  </div>
                  <span style={{ color: 'var(--ink-3)', display: 'grid' }}>{Icon.plus()}</span>
                </button>
              )
            })}
            <button className="row" onClick={() => setShowFog((x) => !x)} aria-expanded={showFog}>
              <span className="fog-swatch" aria-hidden="true" />
              <div className="grow">
                <div className="name">Onbekend terrein</div>
                <div className="meta">{fog.length} plekken waar je nog nooit kwam</div>
              </div>
              <span className={`chev ${showFog ? 'open' : ''}`} style={{ color: 'var(--ink-3)', display: 'grid' }}>{Icon.next()}</span>
            </button>
          </div>
          {showFog && (
            <div className="chips">
              {fog.map((l) => <button key={l.area} className="chip add" onClick={() => pickArea(l.area)}>{AREA_BY_ID[l.area].name}</button>)}
            </div>
          )}
        </div>

        {/* Het voorstel: de stilste plek, op jouw niveau */}
        {next && g.canAdd && (
          <div className="next-grens">
            <div className="eyebrow">Je volgende grens</div>
            <div className="h2">{next.title}</div>
            <div className="small">{AREA_BY_ID[next.area].name} · {next.size === 'groot' ? 'een mijlpaal' : 'klein, een uur'}</div>
            <button className="btn sm" style={{ marginTop: 8 }} onClick={() => setPick({ preset: next })}>Zet hem neer</button>
          </div>
        )}

        {g.open.length > 0 && (
          <div className="stack gap-8">
            <div className="section-head" style={{ margin: 0 }}><h3 className="h2">Staat open</h3>{g.stale.length > 0 && <span className="small">over tijd</span>}</div>
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
          </div>
        )}

        {/* Wat de app ziet, kort */}
        <div className="stack gap-8">
          <div className="section-head" style={{ margin: 0 }}><h3 className="h2">Wat ik zie</h3>{g.said > 0 && <span className="small">{g.done} van {g.said} gedaan</span>}</div>
          <div className="list">
            {insights.map((x) => (
              <div key={x.kind} className="row" style={{ minHeight: 56 }}>
                <div className="grow">
                  <div className="meta">{INSIGHT_LABEL[x.kind]}</div>
                  <div className="name" style={{ textTransform: 'none' }}>{x.short.charAt(0).toUpperCase() + x.short.slice(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn soft sm" onClick={() => setPick({})}>Zelf een grens kiezen</button>
      </div>
      </Sheet>

      {pick && <ChallengeSheet onClose={() => setPick(null)} preset={pick.preset} />}
      {felt && <FeltSheet c={felt} onClose={() => setFelt(null)} />}
    </>
  )
}

