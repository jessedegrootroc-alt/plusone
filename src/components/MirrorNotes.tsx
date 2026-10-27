import { useState, type CSSProperties } from 'react'
import { DOMAINS, DOMAIN_BY_ID, guessDomain, guessSin, planFor, termLabel, type Domain } from '../data/ladders'
import { SINS, SIN_BY_ID, type SinId } from '../data/sins'
import { paperFor } from '../lib/paper'
import { FEATURES, FEATURE_ART, type FeatureId } from '../data/catalog'
import { BoardCols } from './Pinboard'
import { noteHabitId, stepHabitId, stepWeight } from '../lib/score'
import { addDays, buzz, setValue, todayISO, uid, update, useStore, type MirrorNote } from '../lib/store'
import { HoldButton, Icon, Sheet } from './ui'

/** Hooguit twee per onderdeel: als alles moet, gebeurt er niets. */
const MAX_PER = 2


const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5)

/** De stap die nu op de spiegel hangt, en hoeveel dagen je er nog voor hebt. */
const nextStep = (n: MirrorNote, today = todayISO()) => {
  const steps = n.steps ?? []
  const i = steps.findIndex((x) => !x.doneAt)
  const step = i >= 0 ? steps[i] : null
  const start = step ? step.startedAt ?? steps[i - 1]?.doneAt ?? n.createdAt : today
  const left = step ? daysBetween(today, addDays(start, step.days ?? 7)) : 0
  return { i, step, total: steps.length, done: steps.filter((x) => x.doneAt).length, left }
}
const leftLabel = (left: number) => (left < 0 ? 'over tijd' : left === 0 ? 'vandaag' : left === 1 ? 'nog 1 dag' : `nog ${left} dagen`)

/** Een stap afvinken: hij gaat eraf en de koektrommel in, de volgende hangt er vanaf vandaag. */
const completeStep = (id: string) => update((d) => {
  const x = d.notes.find((y) => y.id === id)
  const i = x?.steps?.findIndex((y) => !y.doneAt) ?? -1
  if (!x || i < 0) return
  const today = todayISO()
  x.steps![i].doneAt = today
  if (x.steps![i + 1]) x.steps![i + 1].startedAt = today
  ;(d.logs[today] ??= { v: {} }).v[stepHabitId(x, i)] = 1
  // Een gehaalde post-it gaat de koektrommel in, met het plakband van de spiegel er nog aan
  d.jar.unshift({ id: uid(), text: `Van de spiegel: ${x.steps![i].text}`, date: today })
})

/**
 * De Accountability Mirror van Goggins, per onderdeel van je leven: fysiek, mentaal, financieel en spiritueel.
 * Zoals in Can't Hurt Me: bovenaan de harde waarheid, en op de post-it alleen de stap van nu, met een termijn.
 * Haal je hem, dan gaat hij eraf en hangt de volgende er, tot het doel bereikt is.
 * Hij telt elke dag mee in je balans: eraan gewerkt telt, overslaan kost. Je haalt hem pas af als het echt bereikt is.
 */
export default function MirrorNotes({ date = todayISO() }: { date?: string }) {
  const s = useStore()
  const all = (s.notes ?? []).filter((n) => !n.doneAt)
  const off = (s.notes ?? []).length - all.length
  const [filter, setFilter] = useState<Domain | 'alles'>('alles')
  const [edit, setEdit] = useState<MirrorNote | 'new' | null>(null)
  const [focusId, setFocus] = useState<string | null>(null)
  const focused = focusId ? all.find((n) => n.id === focusId) : undefined
  const log = s.logs[date]
  const notes = filter === 'alles' ? all : all.filter((n) => n.domain === filter)
  const count = (d: Domain) => all.filter((n) => n.domain === d).length

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="h2">De spiegel</h2>
        <span className="small">{off > 0 ? `${off} eraf gehaald` : 'telt elke dag mee'}</span>
      </div>

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
              const on = (log?.v[noteHabitId(n)] ?? 0) >= 1
              const dom = n.domain ? DOMAIN_BY_ID[n.domain] : null
              const st = nextStep(n)
              const p = paperFor(n.id, 4)
              return (
                <div key={`${n.id}:${st.i}`} className="jar-note mnote" style={{ '--rot': `${p.rot}deg`, '--dx': `${p.dx}px`, '--tint': p.tint, '--pin': `${p.pin}%`, '--tape': `${p.tape}deg`, animationDelay: `${Math.min(i, 8) * 70}ms` } as CSSProperties}>
                  <span className="tape" aria-hidden="true" />
                  {n.feature && <img className="mnote-emblem" src={`/art/${FEATURE_ART[n.feature]}.webp`} alt="" />}
                  <button className="mnote-open" onClick={() => setFocus(n.id)}>
                    <span className="jar-kind">{dom ? dom.name : 'Kies een onderdeel'}</span>
                    <span className="mnote-truth">{n.text}</span>
                    <span className="mnote-text">{st.step ? st.step.text : 'Doel bereikt? Haal hem eraf, of leg de lat hoger.'}</span>
                    {st.total > 0 && <Ladder n={n} />}
                  </button>
                  <div className="mnote-foot">
                    <span className={`jar-date ${st.step && st.left < 0 ? 'late' : ''}`}>{st.step ? leftLabel(st.left) : 'alles gezet'}</span>
                    {n.sin && (
                      <button className={`mnote-check ${on ? 'on' : ''}`} aria-pressed={on} aria-label={on ? 'Vandaag gedaan' : 'Vandaag gedaan?'} onClick={() => { buzz(); setValue(date, noteHabitId(n), on ? 0 : 1) }}>
                        {Icon.check(on ? '#F2F2F2' : '#0B0B0B')}
                      </button>
                    )}
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

      {focused && <FocusSheet n={focused} date={date} onEdit={() => { setFocus(null); setEdit(focused) }} onClose={() => setFocus(null)} />}
      {edit && <NoteSheet note={edit === 'new' ? undefined : edit} preset={filter === 'alles' ? undefined : filter} onClose={() => setEdit(null)} />}
    </section>
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
function FocusSheet({ n, date, onEdit, onClose }: { n: MirrorNote; date: string; onEdit: () => void; onClose: () => void }) {
  const s = useStore()
  const st = nextStep(n)
  const dom = n.domain ? DOMAIN_BY_ID[n.domain] : null
  const on = (s.logs[date]?.v[noteHabitId(n)] ?? 0) >= 1
  const [peel, setPeel] = useState<string | null>(null)
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
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-24">
        <div className="stack gap-8">
          <div className="eyebrow">{dom ? dom.name : 'De spiegel'}</div>
          <p className="lead" style={{ color: 'var(--ink)' }}>{n.text}</p>
          {n.goal && <div className="small">Doel: <b style={{ color: 'var(--ink-2)' }}>{n.goal}</b></div>}
          {n.feature && <div className="small hstack" style={{ gap: 8 }}><img src={`/art/${FEATURE_ART[n.feature]}.webp`} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} /> Beloning: {FEATURES.find((f) => f.id === n.feature)!.name.toLowerCase()} voor je ideale zelf</div>}
        </div>

        {/* De stap van nu als eigen post-it; de vorige scheurt eraf */}
        <div className="peel-wrap">
          {peel && <div className="jar-note mnote jar-solo peel" style={paper(st.i - 1)}><span className="tape" aria-hidden="true" /><span className="mnote-text">{peel}</span></div>}
          <div key={st.i} className="jar-note mnote jar-solo" style={paper(st.i)}>
            <span className="tape" aria-hidden="true" />
            {st.step ? (
              <>
                <span className="jar-kind">Stap {st.i + 1} van {st.total} · {leftLabel(st.left)}</span>
                <span className="mnote-text">{st.step.text}</span>
                <span className="jar-date">telt {stepWeight(st.i, st.total)}× mee in je balans</span>
              </>
            ) : (
              <>
                <span className="jar-kind">Alle stappen gezet</span>
                <span className="mnote-text">Bereikt? Haal hem eraf. Nog niet? Leg de lat hoger.</span>
              </>
            )}
          </div>
        </div>

        <div className="stack gap-12">
          {st.step && <HoldButton key={st.i} className="btn" label={st.left < 0 ? 'Toch gehaald' : 'Gehaald: scheur hem eraf'} ms={900} onDone={stepDone} />}
          {st.step && st.left < 0 && <p className="small center" style={{ margin: 0 }}>Over tijd. Haal hem deze week, of maak hem kleiner via bewerken. Eerlijk zijn is de helft.</p>}
          {n.sin && (
            <button className={`btn ${on ? '' : 'ghost'}`} aria-pressed={on} onClick={() => { buzz(); setValue(date, noteHabitId(n), on ? 0 : 1) }}>
              {on ? <>{Icon.check('#0B0B0B')} Vandaag aan gewerkt</> : 'Vandaag aan gewerkt?'}
            </button>
          )}
        </div>

        {st.total > 0 && (
          <div className="stack gap-12">
            <div className="section-head" style={{ margin: 0 }}><h3 className="h2">De ladder</h3><span className="small">{st.done} van {st.total}</span></div>
            <ol className="ladder-preview">
              {(n.steps ?? []).map((x, j) => (
                <li key={j} className={x.doneAt ? 'done' : j === st.i ? 'now' : ''}>
                  <span className="n">{x.doneAt ? Icon.check('#F2F2F2') : j + 1}</span>
                  <span className="grow">{x.text}</span>
                  {!x.doneAt && <span className="term">{termLabel(x.days ?? 7)}</span>}
                </li>
              ))}
            </ol>
          </div>
        )}
        <button className="link center" onClick={onEdit}>Bewerken</button>
      </div>
    </Sheet>
  )
}

/** Een post-it schrijven of bewerken. Vanaf een terras komt de zonde al ingevuld mee. */
export function NoteSheet({ note, preset, presetSin, onClose }: { note?: MirrorNote; preset?: Domain; presetSin?: SinId; onClose: () => void }) {
  const s = useStore()
  const [text, setText] = useState(note?.text ?? '')
  const [goal, setGoal] = useState(note?.goal ?? '')
  const [feature, setFeature] = useState<FeatureId | undefined>(note?.feature)
  const [domain, setDomain] = useState<Domain | undefined>(note?.domain ?? preset)
  const [domTouched, setDomTouched] = useState(!!(note?.domain ?? preset))
  const [sin, setSin] = useState<SinId | undefined>(note?.sin ?? presetSin)
  const [sinTouched, setSinTouched] = useState(!!(note?.sin ?? presetSin))
  const [sinOpen, setSinOpen] = useState(false)
  const words = `${goal} ${text}`
  const dom = domTouched ? domain : guessDomain(words)
  const shownSin = sinTouched ? sin : guessSin(words, dom)
  const steps = dom && (text.trim() || goal.trim()) ? planFor(dom, goal, text) : []
  const fresh = (today: string) => steps.map((p, i) => ({ text: p.text, days: p.days, startedAt: i === 0 ? today : undefined }))
  const full = !note && dom ? (s.notes ?? []).filter((n) => !n.doneAt && n.domain === dom).length >= MAX_PER : false

  const save = () => {
    buzz(12)
    update((d) => {
      d.notes ??= []
      if (note) {
        const x = d.notes.find((y) => y.id === note.id)!
        const reset = x.domain !== dom || (x.goal ?? '') !== goal.trim() || !x.steps?.length
        Object.assign(x, { text: text.trim(), goal: goal.trim() || undefined, feature, sin: shownSin, domain: dom, steps: reset ? fresh(todayISO()) : x.steps })
      } else d.notes.push({ id: uid(), text: text.trim(), goal: goal.trim() || undefined, feature, sin: shownSin, domain: dom, steps: fresh(todayISO()), createdAt: todayISO() })
    })
    onClose()
  }
  const done = () => {
    const today = todayISO()
    update((d) => {
      const x = d.notes.find((y) => y.id === note!.id)
      if (!x) return
      x.doneAt = today
      ;(d.logs[today] ??= { v: {} }).v[noteHabitId(x)] = 1
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

        <button className={note ? 'btn soft' : 'btn'} disabled={!text.trim() || !dom || !shownSin || full} onClick={save}>{note ? 'Opslaan' : 'Plak hem op de spiegel'}</button>
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
