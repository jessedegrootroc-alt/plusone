import { useState } from 'react'
import { RockIcon } from './Jar'
import { Sheet } from './ui'
import { ROCK_SHORT } from '../data/catalog'
import { buzz, todayISO, uid, update } from '../lib/store'

/** Vandaag of morgen: de sheets openen ook vanuit Dag afsluiten, voor de dag erna. */
const dayWord = (date: string) => (date === todayISO() ? 'vandaag' : 'morgen')

// Iets toevoegen aan een dag: een taak die af moet, of iets wat je niet wilt en toch doet.
// Hoort bij Dag afsluiten: daar plan je morgen.

export function AddRockSheet({ date, onClose, bigCount }: { date: string; onClose: () => void; bigCount: number }) {
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
          <h2 className="h2">Wat moet {dayWord(date)} af, hoe dan ook?</h2>
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
        <button className="btn" disabled={!text.trim()} onClick={save}>Zet op {dayWord(date)}</button>
      </div>
    </Sheet>
  )
}

const SUCKS = ['Koude douche van 3 minuten', '5 km hardlopen, ook als het regent', 'Het gesprek dat je uitstelt', 'Een uur zonder telefoon', '100 burpees', 'Het vervelendste klusje eerst']

/** Goggins: doe elke dag iets wat je niet wilt. Het telt als grote steen. */
export function SuckSheet({ date, onClose }: { date: string; onClose: () => void }) {
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
          <h2 className="h2">Wat ga je {dayWord(date)} doen dat je niet wilt?</h2>
          <p className="small" style={{ margin: 0 }}>Niet het zwaarste dat je kunt bedenken, wel iets wat je liever overslaat. Elke keer dat je het toch doet, wordt je geest wat harder.</p>
        </div>
        <div className="chips">
          {SUCKS.map((x) => <button key={x} className={`chip ${text === x ? 'on' : ''}`} onClick={() => setText(x)}>{x}</button>)}
        </div>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} placeholder="Of schrijf je eigen" />
        <button className="btn" disabled={!text.trim()} onClick={save}>Ik doe het {dayWord(date)}</button>
      </div>
    </Sheet>
  )
}
