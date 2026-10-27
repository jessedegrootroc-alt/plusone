import { useState, type CSSProperties } from 'react'
import { paperFor } from '../lib/paper'
import { todayISO, uid, update, useStore, type JarItem } from '../lib/store'
import { HoldButton, Icon, Sheet } from './ui'

/** Hoeveel briefjes er op het bord passen; de rest zit in de trommel en zie je via "alles". */
const ON_BOARD = 7

// Waar een overwinning vandaan komt, af te lezen aan hoe de app hem opschrijft
const KINDS: { re: RegExp; label: string; big?: boolean; tape?: boolean }[] = [
  { re: /^Van de spiegel: /, label: 'Van de spiegel', big: true, tape: true },
  { re: /^Grens verlegd: /, label: 'Grens verlegd', big: true },
  { re: /^(?=Drang naar )/, label: 'Golf uitgezeten' },
]
const read = (j: JarItem) => {
  const k = KINDS.find((x) => x.re.test(j.text))
  return { label: k?.label ?? 'Overwinning', text: k ? j.text.replace(k.re, '') : j.text, big: !!k?.big, tape: !!k?.tape }
}
const fmtDate = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })

/**
 * De koektrommel als prikbord: elke overwinning een briefje met een punaise, schuin, nooit twee hetzelfde.
 * Wat van de spiegel komt, hangt er nog met het plakband van de spiegel op. Grote overwinningen zijn groter.
 */
export default function Pinboard() {
  const s = useStore()
  const [add, setAdd] = useState(false)
  const [all, setAll] = useState(false)
  const [open, setOpen] = useState<JarItem | null>(null)
  const jar = s.jar

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="h2">Koektrommel</h2>
        {jar.length > ON_BOARD ? <button className="link" onClick={() => setAll(true)}>Alle {jar.length}</button> : <span className="small">{jar.length} {jar.length === 1 ? 'overwinning' : 'overwinningen'}</span>}
      </div>

      <div className="board">
        <div className="board-cols">
          <button className="jar-note jar-add" onClick={() => setAdd(true)}>
            {Icon.plus()}
            <span>{jar.length ? 'Overwinning ophangen' : 'Hang je eerste overwinning op'}</span>
          </button>
          {jar.slice(0, ON_BOARD).map((j, i) => <Note key={j.id} j={j} i={i} onOpen={() => setOpen(j)} />)}
        </div>
        {jar.length === 0 && <p className="board-empty">Bewijs dat je zwaardere dingen hebt doorstaan. Voor de dagen dat je het vergeet.</p>}
      </div>

      {add && <AddSheet onClose={() => setAdd(false)} />}
      {all && (
        <Sheet onClose={() => setAll(false)}>
          <div className="stack gap-16">
            <h2 className="h2">Je koektrommel · {jar.length}</h2>
            <div className="board">
              <div className="board-cols">{jar.map((j, i) => <Note key={j.id} j={j} i={i} onOpen={() => { setAll(false); setOpen(j) }} />)}</div>
            </div>
          </div>
        </Sheet>
      )}
      {open && <NoteSheet j={open} onClose={() => setOpen(null)} />}
    </section>
  )
}

function Note({ j, i, onOpen }: { j: JarItem; i: number; onOpen: () => void }) {
  const p = paperFor(j.id, 4)
  const r = read(j)
  const style = { '--rot': `${p.rot}deg`, '--dx': `${p.dx}px`, '--tint': p.tint, '--pin': `${p.pin}%`, '--tape': `${p.tape}deg`, animationDelay: `${Math.min(i, 8) * 70}ms` } as CSSProperties
  return (
    <button className={`jar-note ${r.big ? 'big' : ''}`} style={style} onClick={onOpen}>
      {r.tape ? <span className="tape" aria-hidden="true" /> : <Pin />}
      <span className="jar-kind">{r.label}</span>
      <span className="jar-text">{r.text}</span>
      <span className="jar-date">{fmtDate(j.date)}</span>
    </button>
  )
}

/** Een punaise van bovenaf: kop met een lichtvlek, en een schaduw die naar rechtsonder valt. */
function Pin() {
  return (
    <svg className="pin" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <ellipse cx="11" cy="12" rx="6" ry="4.5" fill="rgba(0,0,0,.35)" />
      <circle cx="8" cy="8" r="6" fill="#1A1A1A" />
      <circle cx="8" cy="8" r="6" fill="none" stroke="#000" strokeWidth="1" />
      <circle cx="6" cy="6" r="2" fill="rgba(255,255,255,.55)" />
    </svg>
  )
}

function AddSheet({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('')
  const save = () => {
    if (!text.trim()) return
    update((d) => { d.jar.unshift({ id: uid(), text: text.trim(), date: todayISO() }) })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <h2 className="h2">Een overwinning ophangen</h2>
        <p className="small" style={{ margin: 0 }}>Groot of klein. Iets wat je deed terwijl je geen zin had, iets wat je doorstond. Later lees je dit terug op een zware dag.</p>
        <textarea className="input" rows={3} autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Bijv. om 22:00 nog gaan hardlopen" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } }} />
        <button className="btn" disabled={!text.trim()} onClick={save}>Ophangen</button>
      </div>
    </Sheet>
  )
}

function NoteSheet({ j, onClose }: { j: JarItem; onClose: () => void }) {
  const r = read(j)
  const p = paperFor(j.id)
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-24">
        <div className="jar-note big jar-solo" style={{ '--rot': `${p.rot / 2}deg`, '--tint': p.tint, '--pin': `${p.pin}%`, '--tape': `${p.tape}deg` } as CSSProperties}>
          {r.tape ? <span className="tape" aria-hidden="true" /> : <Pin />}
          <span className="jar-kind">{r.label}</span>
          <span className="jar-text">{r.text}</span>
          <span className="jar-date">{new Date(j.date + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <HoldButton className="btn ghost" label="Vasthouden om eraf te halen" onDone={() => { update((d) => { d.jar = d.jar.filter((x) => x.id !== j.id) }); onClose() }} />
      </div>
    </Sheet>
  )
}
