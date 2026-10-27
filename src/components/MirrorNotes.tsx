import { useState, type CSSProperties } from 'react'
import { DOMAINS, DOMAIN_BY_ID, guessDomain, ladderFor, type Domain } from '../data/ladders'
import { SINS, SIN_BY_ID, type SinId } from '../data/sins'
import { paperFor } from '../lib/paper'
import { noteHabitId, stepHabitId, stepWeight } from '../lib/score'
import { buzz, setValue, todayISO, uid, update, useStore, type MirrorNote } from '../lib/store'
import { HoldButton, Icon, Sheet } from './ui'

/** Hooguit twee per onderdeel: als alles moet, gebeurt er niets. */
const MAX_PER = 2

// Een eerste gok voor de zonde op basis van de woorden; zonder treffer de zonde die bij het onderdeel hoort.
const HINTS: [SinId, RegExp][] = [
  ['gluttony', /kilo|zwaar|eten|suiker|drank|alcohol|roken|vape|snack|bier/i],
  ['lust', /porno|scroll|telefoon|scherm|instagram|tiktok|seks/i],
  ['greed', /geld|schuld|gok|kopen|uitgeven|sparen|crypto/i],
  ['wrath', /boos|woede|ruzie|schreeuw|geduld|snauw/i],
  ['envy', /vergelijk|jaloers|klagen|roddel/i],
  ['pride', /excuus|excuses|hulp|sorry|gelijk|ego|liegen/i],
  ['sloth', /trainen|sport|bedrijf|bel|uitstel|lui|opstaan|bed|werk|lezen|leren/i],
]
const guessSin = (text: string, domain?: Domain): SinId | undefined => HINTS.find(([, re]) => re.test(text))?.[0] ?? (domain ? DOMAIN_BY_ID[domain].sin : undefined)

const nextStep = (n: MirrorNote) => {
  const steps = n.steps ?? []
  const i = steps.findIndex((x) => !x.doneAt)
  return { i, step: i >= 0 ? steps[i] : null, total: steps.length, done: steps.filter((x) => x.doneAt).length }
}

/**
 * De Accountability Mirror van Goggins, per onderdeel van je leven: fysiek, mentaal, financieel en spiritueel.
 * Elke post-it krijgt een ladder van kleine stappen die steeds ongemakkelijker worden, tot het doel zelf.
 * Hij telt elke dag mee in je balans: eraan gewerkt telt, overslaan kost. Je haalt hem pas af als het echt bereikt is.
 */
export default function MirrorNotes({ date = todayISO() }: { date?: string }) {
  const s = useStore()
  const all = (s.notes ?? []).filter((n) => !n.doneAt)
  const off = (s.notes ?? []).length - all.length
  const [filter, setFilter] = useState<Domain | 'alles'>('alles')
  const [edit, setEdit] = useState<MirrorNote | 'new' | null>(null)
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
        <div className="carousel notes" aria-label="Post-its">
          {notes.length === 0 && filter !== 'alles' && <div className="card"><p className="small" style={{ margin: 0 }}>Nog niets voor {DOMAIN_BY_ID[filter].name.toLowerCase()}. Hier groei je dus nog niet.</p></div>}
          {notes.map((n) => {
            const on = (log?.v[noteHabitId(n)] ?? 0) >= 1
            const dom = n.domain ? DOMAIN_BY_ID[n.domain] : null
            const st = nextStep(n)
            const p = paperFor(n.id, 2.6)
            return (
              <div key={n.id} className="postit" style={{ '--rot': `${p.rot}deg`, '--tint': p.tint, '--pin': `${p.pin}%`, '--tape': `${p.tape}deg` } as CSSProperties}>
                <span className="tape" aria-hidden="true" />
                <button className="postit-dom" onClick={() => setEdit(n)}>{dom ? dom.name : 'Kies een onderdeel'}</button>
                <button className="postit-text" onClick={() => setEdit(n)}>{n.text}</button>
                {st.total > 0 && (
                  <div className="postit-ladder">
                    <div className="hstack" style={{ gap: 4 }} aria-hidden="true">
                      {(n.steps ?? []).map((x, j) => <span key={j} style={{ flex: 1, height: 3, borderRadius: 2, background: x.doneAt ? '#0B0B0B' : 'rgba(11,11,11,0.15)' }} />)}
                    </div>
                    {st.step ? (
                      <div className="postit-step">
                        <span className="lbl">Stap {st.i + 1} van {st.total} · telt {stepWeight(st.i, st.total)}× mee</span>
                        <span>{st.step.text}</span>
                      </div>
                    ) : (
                      <div className="postit-step"><span className="lbl">Alle stappen gezet</span><span>Bereikt? Haal hem eraf. Nog niet? Leg de lat hoger.</span></div>
                    )}
                  </div>
                )}
                <div className="postit-foot">
                  {st.step ? (
                    <HoldStep key={st.i} onDone={() => update((d) => { const x = d.notes.find((y) => y.id === n.id); const t = x?.steps?.find((y) => !y.doneAt); if (!x || !t) return; const today = todayISO(); t.doneAt = today; (d.logs[today] ??= { v: {} }).v[stepHabitId(x, x.steps!.indexOf(t))] = 1 })} />
                  ) : <span />}
                  {n.sin && (
                    <button className={`postit-check ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => { buzz(); setValue(date, noteHabitId(n), on ? 0 : 1) }}>
                      {on ? <>{Icon.check('#F2F2F2')} Vandaag gedaan</> : 'Vandaag gedaan?'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          <button className="carousel-add" onClick={() => setEdit('new')}>{Icon.plus()} Nieuwe post-it</button>
        </div>
      )}

      {edit && <NoteSheet note={edit === 'new' ? undefined : edit} preset={filter === 'alles' ? undefined : filter} onClose={() => setEdit(null)} />}
    </section>
  )
}

/** Een stap afvinken vraagt vasthouden: gedaan, niet gezegd. */
function HoldStep({ onDone }: { onDone: () => void }) {
  return <HoldButton className="btn postit-hold" label="Stap gezet" ms={900} onDone={onDone} />
}

function NoteSheet({ note, preset, onClose }: { note?: MirrorNote; preset?: Domain; onClose: () => void }) {
  const s = useStore()
  const [text, setText] = useState(note?.text ?? '')
  const [domain, setDomain] = useState<Domain | undefined>(note?.domain ?? preset)
  const [domTouched, setDomTouched] = useState(!!(note?.domain ?? preset))
  const [sin, setSin] = useState<SinId | undefined>(note?.sin)
  const [sinTouched, setSinTouched] = useState(!!note?.sin)
  const [sinOpen, setSinOpen] = useState(false)
  const dom = domTouched ? domain : guessDomain(text)
  const shownSin = sinTouched ? sin : guessSin(text, dom)
  const steps = dom && text.trim() ? ladderFor(dom, text) : []
  const full = !note && dom ? (s.notes ?? []).filter((n) => !n.doneAt && n.domain === dom).length >= MAX_PER : false

  const save = () => {
    buzz(12)
    update((d) => {
      d.notes ??= []
      if (note) {
        const x = d.notes.find((y) => y.id === note.id)!
        const reset = x.domain !== dom || !x.steps?.length
        Object.assign(x, { text: text.trim(), sin: shownSin, domain: dom, steps: reset ? steps.map((t) => ({ text: t })) : x.steps })
      } else d.notes.push({ id: uid(), text: text.trim(), sin: shownSin, domain: dom, steps: steps.map((t) => ({ text: t })), createdAt: todayISO() })
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
          <h2 className="h2">{note ? 'Je post-it' : 'Wat moet je jezelf eerlijk zeggen?'}</h2>
          <p className="small" style={{ margin: 0 }}>Schrijf het zoals het is, zonder verzachting. Wat is er mis, en waar wil je naartoe?</p>
        </div>
        <textarea className="textarea" autoFocus={!note} value={text} onChange={(e) => setText(e.target.value)} placeholder="Bijv. Je bent 12 kilo te zwaar. Over zes maanden loop je de halve marathon." style={{ minHeight: 104 }} />

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

        {steps.length > 0 && (!note || note.domain !== dom || !note.steps?.length) && (
          <div className="field">
            <label>Je ladder</label>
            <ol className="ladder-preview">
              {steps.map((t, i) => <li key={i}><span className="n">{i + 1}</span>{t}</li>)}
            </ol>
            <div className="small">Elke trede iets ongemakkelijker dan de vorige. Je ziet er steeds één tegelijk.</div>
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
