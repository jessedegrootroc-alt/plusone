import { useState, type CSSProperties } from 'react'
import { DOMAINS, DOMAIN_BY_ID, guessDomain, guessSin, planFor, termLabel, type Domain } from '../data/ladders'
import { SINS, SIN_BY_ID, type SinId } from '../data/sins'
import { paperFor } from '../lib/paper'
import { countdownLabel, domainForFeature, mainGoal, needsDate } from '../lib/goal'
import { FEATURES, FEATURE_ART, type FeatureId } from '../data/catalog'
import { BoardCols } from './Pinboard'
import { noteHabitId, stepHabitId } from '../lib/score'
import { activeNote, focusOn, leftLabel, nextStep } from '../lib/focus'
import { buzz, todayISO, uid, update, useStore, type MirrorNote } from '../lib/store'
import { HoldButton, Icon, Sheet } from './ui'

/** Waar mensen bij een groot doel het vaakst bang voor zijn. Eén tik, of je eigen woorden. */
const FEARS = ['dat ik het niet haal', 'dat anderen het zien', 'voor de pijn', 'dat ik weer opgeef', 'dat ik het niet kan']

/**
 * "Ik durf dit niet" (Goggins: eerlijk in de spiegel, en dan toch). Benoem waar je bang voor bent;
 * daarna staat je angst op de post-it naast je stap, en zet je hem toch, dan gaat hij de koektrommel in als "ondanks angst".
 */
function FearPanel({ n, onDone }: { n: MirrorNote; onDone: () => void }) {
  const [fear, setFear] = useState(n.fear ?? '')
  const save = (f: string) => {
    const v = f.trim().replace(/^bang\s+/i, '')
    if (!v) return
    buzz(14)
    update((d) => { const x = d.notes.find((y) => y.id === n.id); if (x) x.fear = v })
    onDone()
  }
  return (
    <div className="fear-panel">
      <h3 className="fear-q">Waar ben je bang voor?</h3>
      <p className="focus-hint" style={{ margin: 0 }}>Zeg het eerlijk. Wat je benoemt, kun je aanpakken.</p>
      <div className="fear-opts">
        {FEARS.map((f) => <button key={f} className={`fear-opt ${n.fear === f ? 'on' : ''}`} onClick={() => save(f)}>{f[0].toUpperCase() + f.slice(1)}</button>)}
      </div>
      <input className="input fear-input" value={FEARS.includes(fear) ? '' : fear} onChange={(e) => setFear(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save(fear)} placeholder="Of in je eigen woorden" maxLength={60} aria-label="Waar je bang voor bent" />
      {fear.trim() && !FEARS.includes(fear) && <button className="btn pill" onClick={() => save(fear)}>Dit is het</button>}
      <div className="focus-more">
        <button className="link" onClick={onDone}>Terug</button>
        {n.fear && <button className="link" onClick={() => { update((d) => { const x = d.notes.find((y) => y.id === n.id); if (x) delete x.fear }); onDone() }}>Niet meer bang</button>}
      </div>
    </div>
  )
}

/** Hooguit twee per onderdeel: als alles moet, gebeurt er niets. */
const MAX_PER = 2


/** Een stap afvinken: hij gaat eraf en de koektrommel in, de volgende hangt er vanaf vandaag. */
const completeStep = (id: string) => update((d) => {
  const x = d.notes.find((y) => y.id === id)
  const i = x?.steps?.findIndex((y) => !y.doneAt) ?? -1
  if (!x || i < 0) return
  const today = todayISO()
  x.steps![i].doneAt = today
  if (x.steps![i + 1]) x.steps![i + 1].startedAt = today
  ;(d.logs[today] ??= { v: {} }).v[stepHabitId(x, i)] = 1
  // Laatste stap gezet? Dan is de volgende post-it aan de beurt, en zijn termijn begint vandaag
  if (!x.steps![i + 1]) {
    delete d.focusNote
    const nx = activeNote(d)
    if (nx) focusOn(d, nx.id)
  }
  // Een gehaalde post-it gaat de koektrommel in, met het plakband van de spiegel er nog aan.
  // Had je je angst benoemd, dan staat erbij dat je het deed terwijl je bang was: dat is het sterkste bewijs.
  d.jar.unshift({ id: uid(), text: x.fear ? `Ondanks angst: ${x.steps![i].text} · bang ${x.fear}` : `Van de spiegel: ${x.steps![i].text}`, date: today })
})

/**
 * De Accountability Mirror van Goggins, per onderdeel van je leven: fysiek, mentaal, financieel en emotioneel.
 * Zoals in Can't Hurt Me: bovenaan de harde waarheid, en op de post-it alleen de stap van nu, met een termijn.
 * Haal je hem, dan gaat hij eraf en hangt de volgende er, tot het doel bereikt is.
 * Eén post-it tegelijk: aan de stap van die ene werk je, de rest wacht met "Daarna". Die stap staat ook op Vandaag.
 */
export default function MirrorNotes() {
  const s = useStore()
  const all = (s.notes ?? []).filter((n) => !n.doneAt)
  const off = (s.notes ?? []).length - all.length
  const [filter, setFilter] = useState<Domain | 'alles'>('alles')
  const [edit, setEdit] = useState<MirrorNote | 'new' | null>(null)
  const [focusId, setFocus] = useState<string | null>(null)
  const focused = focusId ? all.find((n) => n.id === focusId) : undefined
  const act = activeNote(s)
  const notes = (filter === 'alles' ? all : all.filter((n) => n.domain === filter)).sort((a, b) => Number(b.id === act?.id) - Number(a.id === act?.id))
  const count = (d: Domain) => all.filter((n) => n.domain === d).length

  return (
    <section className="section">
      {/* Voor wie het voor het eerst ziet: wat dit blok is, en wat je ermee doet */}
      <div className="section-head" style={{ marginBottom: 'var(--s2)' }}>
        <h2 className="h2">Je spiegel</h2>
        {off > 0 && <span className="small">{off} eraf gehaald</span>}
      </div>
      <p className="small mirror-intro">Wat je eerlijk over jezelf zei, per deel van je leven. Je werkt aan één post-it tegelijk; die stap staat in je dag, overdag. Gehaald? Dan komt de volgende.</p>

      {all.length > 0 && (
        <div className="chips scroll" role="tablist" aria-label="Filter op onderdeel">
          <button role="tab" aria-selected={filter === 'alles'} className={`chip ${filter === 'alles' ? 'on' : ''}`} onClick={() => setFilter('alles')}>Alles · {all.length}</button>
          {DOMAINS.map((d) => (
            <button key={d.id} role="tab" aria-selected={filter === d.id} className={`chip ${filter === d.id ? 'on' : ''}`} onClick={() => setFilter(d.id)}>
              {d.name}{count(d.id) ? ` · ${count(d.id)}` : ''}
            </button>
          ))}
        </div>
      )}

      {all.length === 0 ? (
        <div className="card stack gap-12">
          <p className="lead">Schrijf op wat er mis is en wat er moet gebeuren, zo hard en eerlijk als Goggins. Per onderdeel van je leven, met een ladder van kleine stappen naar het doel.</p>
          <button className="btn ghost sm" onClick={() => setEdit('new')}>Schrijf je eerste post-it</button>
        </div>
      ) : (
        <div className="board glass" aria-label="Post-its op je spiegel">
          <BoardCols>
            {notes.map((n, i) => {
              const waiting = n.id !== act?.id
              const dom = n.domain ? DOMAIN_BY_ID[n.domain] : null
              const st = nextStep(n)
              const p = paperFor(n.id, 4)
              return (
                <div key={`${n.id}:${st.i}`} className={`jar-note mnote ${waiting ? 'waiting' : 'now'}`} style={{ '--rot': `${p.rot}deg`, '--dx': `${p.dx}px`, '--tint': p.tint, '--pin': `${p.pin}%`, '--tape': `${p.tape}deg`, animationDelay: `${Math.min(i, 8) * 70}ms` } as CSSProperties}>
                  <span className="tape" aria-hidden="true" />
                  {n.feature && <img className="mnote-emblem" src={`/art/${FEATURE_ART[n.feature]}.webp`} alt="" />}
                  <button className="mnote-open" onClick={() => setFocus(n.id)}>
                    <span className="jar-kind">{dom ? dom.name : 'Kies een onderdeel'}{!waiting && st.step ? ' · nu' : ''}</span>
                    <span className="mnote-truth">{n.text}</span>
                    {waiting ? (
                      <span className="mnote-wait">Daarna</span>
                    ) : (
                      <span className="mnote-text">{st.step ? st.step.text : 'Doel bereikt? Haal hem eraf, of leg de lat hoger.'}</span>
                    )}
                    {st.total > 0 && <Ladder n={n} />}
                  </button>
                  <div className="mnote-foot">
                    <span className="jar-date">{waiting ? (n.due ? countdownLabel(n.due) : '') : st.step ? leftLabel(st.left) : n.due ? countdownLabel(n.due) : ''}</span>
                  </div>
                </div>
              )
            })}
            <button className="jar-note jar-add" onClick={() => setEdit('new')}>
              {Icon.plus()}
              <span>Nieuwe post-it</span>
            </button>
          </BoardCols>
          {notes.length === 0 && filter !== 'alles' && <p className="board-empty">Nog niets voor {DOMAIN_BY_ID[filter].name.toLowerCase()}. Hier groei je dus nog niet.</p>}
        </div>
      )}

      {focused && <FocusSheet n={focused} onEdit={() => { setFocus(null); setEdit(focused) }} onClose={() => setFocus(null)} />}
      {edit && <NoteSheet note={edit === 'new' ? undefined : edit} preset={filter === 'alles' ? undefined : filter} onClose={() => setEdit(null)} />}
    </section>
  )
}

/**
 * De hele ladder als eigen scherm, rustig: een lijn met bolletjes zoals de dag op Vandaag.
 * Gezet staat stil en grijs (geen doorgestreepte tekst), de stap van nu licht op, wat nog komt staat gestippeld met zijn termijn.
 */
function LadderView({ n, onBack }: { n: MirrorNote; onBack: () => void }) {
  const steps = n.steps ?? []
  const now = steps.findIndex((x) => !x.doneAt)
  return (
    <div className="ladder-view">
      <h3 className="fear-q">De ladder</h3>
      <p className="focus-hint" style={{ margin: 0 }}>{steps.filter((x) => x.doneAt).length} van {steps.length} gezet{n.goal ? ` · ${n.goal}` : ''}</p>
      <ol className="ladder-line">
        {steps.map((x, j) => (
          <li key={j} className={x.doneAt ? 'done' : j === now ? 'now' : 'next'}>
            <span className="ll-dot" aria-hidden="true">{x.doneAt ? Icon.check('#0B0B0B') : null}</span>
            <span className="ll-txt">
              <span className="ll-name">{x.text}</span>
              <span className="ll-term">{x.doneAt ? 'Gezet' : j === now ? 'Nu' : termLabel(x.days ?? 7)}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="focus-more"><button className="link" onClick={onBack}>Terug</button></div>
    </div>
  )
}

/** De ladder als streepjes: gezette stappen zwart, de rest nog grijs. */
function Ladder({ n }: { n: MirrorNote }) {
  return (
    <span className="mnote-ladder" aria-hidden="true">
      {(n.steps ?? []).map((x, j) => <i key={j} className={x.doneAt ? 'on' : ''} />)}
    </span>
  )
}

/**
 * Eén post-it van dichtbij, zoals Goggins hem ophangt: de harde waarheid en je doel erboven,
 * op de post-it alleen de stap van nu met zijn termijn. Zet je hem (vasthouden: gedaan, niet gezegd),
 * dan scheurt hij eraf en plakt de volgende erop. Daaronder de hele ladder.
 */
export function FocusSheet({ n, onEdit, onClose, onAll }: { n: MirrorNote; onEdit: () => void; onClose: () => void; onAll?: () => void }) {
  const s = useStore()
  const st = nextStep(n)
  const dom = n.domain ? DOMAIN_BY_ID[n.domain] : null
  const act = activeNote(s)
  const waiting = !!act && act.id !== n.id
  const [peel, setPeel] = useState<string | null>(null)
  const [fearOpen, setFearOpen] = useState(false)
  const [ladder, setLadder] = useState(false)
  const paper = (salt: number) => {
    const p = paperFor(`${n.id}:${salt}`, 2.5)
    return { '--rot': `${p.rot}deg`, '--tint': p.tint, '--pin': `${p.pin}%`, '--tape': `${p.tape}deg` } as CSSProperties
  }
  const stepDone = () => {
    buzz(20)
    setPeel(st.step!.text)
    completeStep(n.id)
    setTimeout(() => setPeel(null), 800)
  }
  const steps = n.steps ?? []
  return (
    <Sheet onClose={onClose}>
      {/* Eén ding tegelijk (zoals Stoic): je ladder als streepjes, je stap als post-it, één smalle knop.
          De harde waarheid, de hele ladder en je angst staan erachter, niet ernaast. */}
      <div className="focus">
        {steps.length > 0 && (
          <div className="focus-dashes" aria-label={`Stap ${st.i + 1} van ${st.total}`}>
            {steps.map((x, j) => <i key={j} className={x.doneAt ? 'on' : j === st.i ? 'now' : ''} />)}
          </div>
        )}

        {fearOpen ? (
          <FearPanel n={n} onDone={() => setFearOpen(false)} />
        ) : ladder ? (
          <LadderView n={n} onBack={() => setLadder(false)} />
        ) : (
          <>
            <div className="focus-meta">
              <span className="eyebrow">{st.step ? `Stap ${st.i + 1} van ${st.total} · ${leftLabel(st.left)}` : dom ? dom.name : 'De spiegel'}</span>
              {n.goal && <span className="focus-goal">{n.goal}</span>}
            </div>

            <div className="peel-wrap focus-note">
              {peel && <div className="jar-note mnote jar-solo peel" style={paper(st.i - 1)}><span className="tape" aria-hidden="true" /><span className="mnote-text">{peel}</span></div>}
              <div key={st.i} className="jar-note mnote jar-solo" style={paper(st.i)}>
                <span className="tape" aria-hidden="true" />
                <span className="mnote-text">{st.step ? st.step.text : 'Alle stappen gezet. Bereikt? Haal hem eraf.'}</span>
                {st.step && n.fear && <span className="mnote-fear">Bang {n.fear}</span>}
              </div>
            </div>

            {waiting ? (
              <div className="focus-acts">
                <p className="small center" style={{ margin: 0 }}>Je werkt nu aan: <b style={{ color: 'var(--ink)' }}>{act!.text}</b></p>
                <button className="btn pill" onClick={() => { buzz(); update((d) => focusOn(d, n.id)); onClose() }}>Hier eerst aan werken</button>
              </div>
            ) : st.step && (
              <div className="focus-acts">
                <HoldButton key={st.i} className="btn pill" label={n.fear || st.left < 0 ? 'Toch gedaan' : 'Gehaald'} ms={900} onDone={stepDone} />
                <span className="focus-hint">{n.fear ? 'Houd vast. Dan gaat hij de koektrommel in als ondanks angst.' : st.left < 0 ? 'Over tijd. Haal hem deze week, of maak hem kleiner.' : 'Houd vast om hem eraf te scheuren.'}</span>
                <button className="link focus-fear" onClick={() => setFearOpen(true)}>{n.fear ? 'Mijn angst wijzigen' : 'Ik durf dit niet'}</button>
              </div>
            )}

            {/* Alles wat er verder bij hoort, één tik verder */}
            <div className="focus-more">
              {steps.length > 0 && <button className="link" onClick={() => setLadder(true)}>De hele ladder</button>}
              <button className="link" onClick={onEdit}>Bewerken</button>
              {onAll && <button className="link" onClick={onAll}>Alle post-its</button>}
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}

/** Een post-it schrijven of bewerken. Vanaf een terras komt de zonde al ingevuld mee. */
export function NoteSheet({ note, preset, presetSin, presetGoal, onClose }: { note?: MirrorNote; preset?: Domain; presetSin?: SinId; presetGoal?: string; onClose: () => void }) {
  const s = useStore()
  const [text, setText] = useState(note?.text ?? '')
  const [goal, setGoal] = useState(note?.goal ?? presetGoal ?? '')
  const [feature, setFeature] = useState<FeatureId | undefined>(note?.feature)
  const [due, setDue] = useState(note?.due ?? '')
  const [obstacle, setObstacle] = useState(note?.obstacle ?? '')
  const [ifThen, setIfThen] = useState(note?.ifThen ?? '')
  const [isMain, setIsMain] = useState(() => !!note && mainGoal(s)?.id === note.id)
  const [domain, setDomain] = useState<Domain | undefined>(note?.domain ?? preset)
  const [domTouched, setDomTouched] = useState(!!(note?.domain ?? preset))
  const [sin, setSin] = useState<SinId | undefined>(note?.sin ?? presetSin)
  const [sinTouched, setSinTouched] = useState(!!(note?.sin ?? presetSin))
  const [sinOpen, setSinOpen] = useState(false)
  const words = `${goal} ${text}`
  // Een Medaille (race of prestatie) en andere lichamelijke kenmerken horen bij Fysiek
  const dom = domTouched ? domain : domainForFeature(feature) ?? guessDomain(words)
  const shownSin = sinTouched ? sin : guessSin(words, dom)
  const steps = dom && (text.trim() || goal.trim()) ? planFor(dom, goal, text) : []
  const fresh = (today: string) => steps.map((p, i) => ({ text: p.text, days: p.days, startedAt: i === 0 ? today : undefined }))
  const full = !note && dom ? (s.notes ?? []).filter((n) => !n.doneAt && n.domain === dom).length >= MAX_PER : false

  const dateNeeded = needsDate(feature, `${goal} ${text}`)
  const save = () => {
    buzz(12)
    const id = note?.id ?? uid()
    update((d) => {
      d.notes ??= []
      if (isMain) d.mainGoalId = id
      else if (d.mainGoalId === id) d.mainGoalId = undefined
      if (note) {
        const x = d.notes.find((y) => y.id === note.id)!
        const reset = x.domain !== dom || (x.goal ?? '') !== goal.trim() || !x.steps?.length
        Object.assign(x, { text: text.trim(), goal: goal.trim() || undefined, due: due || undefined, obstacle: obstacle.trim() || undefined, ifThen: ifThen.trim() || undefined, feature, sin: shownSin, domain: dom, steps: reset ? fresh(todayISO()) : x.steps })
      } else d.notes.push({ id, text: text.trim(), goal: goal.trim() || undefined, due: due || undefined, obstacle: obstacle.trim() || undefined, ifThen: ifThen.trim() || undefined, feature, sin: shownSin, domain: dom, steps: fresh(todayISO()), createdAt: todayISO() })
    })
    onClose()
  }
  const done = () => {
    const today = todayISO()
    update((d) => {
      const x = d.notes.find((y) => y.id === note!.id)
      if (!x) return
      const wasActive = activeNote(d)?.id === x.id
      x.doneAt = today
      ;(d.logs[today] ??= { v: {} }).v[noteHabitId(x)] = 1
      // Was dit je actieve post-it? Dan is de volgende aan de beurt
      if (wasActive) {
        delete d.focusNote
        const nx = activeNote(d)
        if (nx) focusOn(d, nx.id)
      }
      d.jar.unshift({ id: uid(), text: `Van de spiegel: ${x.text}`, date: today })
    })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="stack gap-4">
          <h2 className="h2">{note ? 'Je post-it' : 'Kijk in de spiegel'}</h2>
          <p className="small" style={{ margin: 0 }}>Eerst waar je nu staat, zonder verzachting. Dan waar je naartoe gaat. De app hakt het in stappen, elk met een eigen termijn.</p>
        </div>
        <div className="field">
          <label htmlFor="truth">De harde waarheid</label>
          <textarea id="truth" className="textarea" autoFocus={!note} value={text} onChange={(e) => setText(e.target.value)} placeholder="Bijv. Je bent 12 kilo te zwaar en je weet het." style={{ minHeight: 80 }} />
        </div>
        <div className="field">
          <label htmlFor="goal">Je doel, meetbaar</label>
          <input id="goal" className="input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Bijv. 12 kilo eraf, 10 klanten benaderen" />
        </div>

        <div className="field">
          <label>Voor welk onderdeel?</label>
          <div className="chips">
            {DOMAINS.map((d) => (
              <button key={d.id} className={`chip ${dom === d.id ? 'on' : ''}`} onClick={() => { setDomain(d.id); setDomTouched(true) }}>
                {dom === d.id && Icon.check('#0B0B0B')} {d.name}
              </button>
            ))}
          </div>
          <div className="small">{dom ? DOMAIN_BY_ID[dom].line : 'Kies er één. Dan krijg je een ladder van stappen naar je doel.'}</div>
          {full && <div className="small" style={{ color: 'var(--ink)' }}>Je hebt al {MAX_PER} post-its voor {DOMAIN_BY_ID[dom!].name.toLowerCase()}. Haal er eerst één af: als alles moet, gebeurt er niets.</div>}
        </div>

        {steps.length > 0 && (!note || note.domain !== dom || (note.goal ?? '') !== goal.trim() || !note.steps?.length) && (
          <div className="field">
            <label>Je stappen</label>
            <ol className="ladder-preview">
              {steps.map((p, i) => <li key={i}><span className="n">{i + 1}</span><span className="grow">{p.text}</span><span className="term">{termLabel(p.days)}</span></li>)}
            </ol>
            <div className="small">Zoals Goggins: elke stap is een eigen post-it. Haal je hem, dan scheur je hem eraf en hangt de volgende.</div>
          </div>
        )}

        <div className="small">
          Telt mee voor {shownSin ? <b style={{ color: 'var(--ink-2)' }}>{SIN_BY_ID[shownSin].sin} → {SIN_BY_ID[shownSin].virtue}</b> : 'je balans'} · <button className="link" onClick={() => setSinOpen((x) => !x)}>{sinOpen ? 'klaar' : 'wijzig'}</button>
        </div>
        {sinOpen && (
          <div className="chips">
            {SINS.map((x) => (
              <button key={x.id} className={`chip ${shownSin === x.id ? 'on' : ''}`} onClick={() => { setSin(x.id); setSinTouched(true) }}>
                {shownSin === x.id && Icon.check('#0B0B0B')} {x.sin}
              </button>
            ))}
          </div>
        )}

        {/* Het embleem dat je ideale zelf krijgt als je hem haalt: zo bouw je Paradiso uit wat je echt deed */}
        <div className="field">
          <label>Beloning als je hem haalt <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(mag ook leeg)</span></label>
          <div className="chips scroll">
            {FEATURES.filter((f) => f.id !== 'dumbbell').map((f) => (
              <button key={f.id} className={`chip emblem ${feature === f.id ? 'on' : ''}`} aria-pressed={feature === f.id} onClick={() => setFeature((x) => (x === f.id ? undefined : f.id))}>
                <img src={`/art/${FEATURE_ART[f.id]}.webp`} alt="" /> {f.name}
              </button>
            ))}
          </div>
          {feature && <div className="small">Haal je hem, dan staat {FEATURES.find((f) => f.id === feature)!.name.toLowerCase()} bij je ideale zelf in Paradiso.</div>}
        </div>

        {/* De datum: verplicht bij een race of prestatie. Zonder datum is het een wens. */}
        <div className="field">
          <label htmlFor="due">Wanneer gehaald? {dateNeeded ? '' : <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(mag ook leeg)</span>}</label>
          <input id="due" className="input" type="date" min={todayISO()} value={due} onChange={(e) => setDue(e.target.value)} />
          {dateNeeded && !due && <div className="small" style={{ color: 'var(--ink)' }}>Een race of prestatie heeft een datum nodig. Dan telt de app af.</div>}
        </div>
        {/* WOOP (Oettingen): je doel naast wat je tegenhoudt, met een plan voor dat moment */}
        <div className="field">
          <label htmlFor="obstacle">Wat houdt je het meest tegen? <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(mag ook leeg)</span></label>
          <input id="obstacle" className="input" value={obstacle} onChange={(e) => setObstacle(e.target.value)} placeholder="Bijv. ik twijfel als de wekker gaat" />
        </div>
        {obstacle.trim() && (
          <div className="field">
            <label htmlFor="ifthen">Als dat gebeurt, dan …</label>
            <input id="ifthen" className="input" value={ifThen} onChange={(e) => setIfThen(e.target.value)} placeholder="Bijv. sta ik op voordat ik tot 5 tel" />
            <div className="small">Bedenk het nu, dan hoef je op het moment zelf niet te kiezen.</div>
          </div>
        )}

        <button className="row" role="switch" aria-checked={isMain} onClick={() => setIsMain((x) => !x)} style={{ borderTop: 0, padding: 0 }}>
          <div className="grow"><div className="name">Dit is mijn hoofddoel</div><div className="meta">Staat bovenaan Vandaag, met de aftelling</div></div>
          <span className={`switch ${isMain ? 'on' : ''}`} aria-hidden="true"><i /></span>
        </button>

        <button className={note ? 'btn soft' : 'btn'} disabled={!text.trim() || !dom || !shownSin || full || (dateNeeded && !due)} onClick={save}>{note ? 'Opslaan' : 'Plak hem op de spiegel'}</button>
        {note && (
          <>
            <HoldButton label="Bereikt: haal hem eraf" onDone={done} />
            <p className="small center" style={{ margin: 0 }}>Alleen als het echt bereikt is. Vandaag telt dan als grote steen, en hij gaat de koektrommel in.</p>
            <button className="link center" style={{ color: 'var(--ink-3)' }} onClick={() => { update((d) => { d.notes = d.notes.filter((x) => x.id !== note.id) }); onClose() }}>Weggooien, klopt niet meer</button>
          </>
        )}
      </div>
    </Sheet>
  )
}
