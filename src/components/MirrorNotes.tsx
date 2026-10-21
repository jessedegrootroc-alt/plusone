import { useState } from 'react'
import { SINS, SIN_BY_ID, type SinId } from '../data/sins'
import { noteHabitId } from '../lib/score'
import { buzz, setValue, todayISO, uid, update, useStore, type MirrorNote } from '../lib/store'
import { HoldButton, Icon, Sheet } from './ui'

const MAX = 3
const TILT = [-0.8, 0.6, -0.4]

// Een eerste gok op basis van de woorden, zodat je meestal alleen hoeft te bevestigen.
const HINTS: [SinId, RegExp][] = [
  ['gluttony', /kilo|zwaar|eten|suiker|drank|alcohol|roken|vape|snack|bier/i],
  ['lust', /porno|scroll|telefoon|scherm|instagram|tiktok|seks/i],
  ['greed', /geld|schuld|gok|kopen|uitgeven|sparen|crypto/i],
  ['wrath', /boos|woede|ruzie|schreeuw|geduld|snauw/i],
  ['envy', /vergelijk|jaloers|klagen|roddel/i],
  ['pride', /excuus|excuses|hulp|sorry|gelijk|ego|liegen/i],
  ['sloth', /trainen|sport|bedrijf|bel|uitstel|lui|opstaan|bed|werk|lezen|leren/i],
]
const guess = (text: string): SinId | undefined => HINTS.find(([, re]) => re.test(text))?.[0]

/**
 * De Accountability Mirror van Goggins: hooguit drie post-its, in je eigen harde woorden.
 * Elke post-it valt onder een zonde en telt elke dag mee in je balans: eraan gewerkt telt,
 * overslaan kost. Je haalt hem pas af als het echt bereikt is; die dag telt als grote steen.
 */
export default function MirrorNotes({ date = todayISO() }: { date?: string }) {
  const s = useStore()
  const notes = (s.notes ?? []).filter((n) => !n.doneAt)
  const off = (s.notes ?? []).length - notes.length
  const [edit, setEdit] = useState<MirrorNote | 'new' | null>(null)
  const log = s.logs[date]

  return (
    <div className="card mt-24 stack gap-16">
      <div className="hstack between">
        <div className="eyebrow">De spiegel</div>
        <span className="small">{off > 0 ? `${off} eraf gehaald` : 'telt elke dag mee'}</span>
      </div>

      {notes.length === 0 ? (
        <div className="stack gap-12">
          <p className="lead">Schrijf op wat er mis is en wat er moet gebeuren, zo hard en eerlijk als Goggins. Elke post-it valt onder een zonde en telt elke dag mee in je balans.</p>
          <button className="btn ghost sm" onClick={() => setEdit('new')}>Schrijf je eerste post-it</button>
        </div>
      ) : (
        <div className="stack gap-12">
          {notes.map((n, i) => {
            const on = (log?.v[noteHabitId(n)] ?? 0) >= 1
            const sin = n.sin ? SIN_BY_ID[n.sin] : null
            return (
              <div key={n.id} className="postit" style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
                <button className="postit-text" onClick={() => setEdit(n)}>{n.text}</button>
                <div className="postit-foot">
                  <button className="postit-sin" onClick={() => setEdit(n)}>{sin ? `${sin.sin} → ${sin.virtue}` : 'Kies een zonde'}</button>
                  {sin && (
                    <button className={`postit-check ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => { buzz(); setValue(date, noteHabitId(n), on ? 0 : 1) }}>
                      {on ? <>{Icon.check('#F2F2F2')} Vandaag gedaan</> : 'Vandaag gedaan?'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {notes.length < MAX && (
            <button className="chip add" style={{ alignSelf: 'flex-start' }} onClick={() => setEdit('new')}>{Icon.plus()} Post-it</button>
          )}
        </div>
      )}

      {edit && <NoteSheet note={edit === 'new' ? undefined : edit} onClose={() => setEdit(null)} />}
    </div>
  )
}

function NoteSheet({ note, onClose }: { note?: MirrorNote; onClose: () => void }) {
  const [text, setText] = useState(note?.text ?? '')
  const [sin, setSin] = useState<SinId | undefined>(note?.sin)
  const [touched, setTouched] = useState(!!note?.sin)
  const shown = touched ? sin : guess(text)
  const save = () => {
    buzz(12)
    update((d) => {
      d.notes ??= []
      if (note) Object.assign(d.notes.find((x) => x.id === note.id)!, { text: text.trim(), sin: shown })
      else d.notes.push({ id: uid(), text: text.trim(), sin: shown, createdAt: todayISO() })
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
          <p className="small" style={{ margin: 0 }}>Schrijf het zoals het is, zonder verzachting. Wat is er mis, en wat moet er gebeuren?</p>
        </div>
        <textarea className="textarea" autoFocus={!note} value={text} onChange={(e) => setText(e.target.value)} placeholder="Bijv. Je bent 12 kilo te zwaar. Elke ochtend om 6:00 trainen, geen excuus." style={{ minHeight: 112 }} />

        <div className="field">
          <label>Onder welke zonde valt dit?</label>
          <div className="chips">
            {SINS.map((x) => (
              <button key={x.id} className={`chip ${shown === x.id ? 'on' : ''}`} onClick={() => { setSin(x.id); setTouched(true) }}>
                {shown === x.id && Icon.check('#0B0B0B')} {x.sin}
              </button>
            ))}
          </div>
          <div className="small">
            {shown ? SIN_BY_ID[shown].sinDef : 'Kies er één, dan telt de post-it mee in je balans.'}
          </div>
        </div>

        <button className={note ? 'btn soft' : 'btn'} disabled={!text.trim() || !shown} onClick={save}>{note ? 'Opslaan' : 'Plak hem op de spiegel'}</button>
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
