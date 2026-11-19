import { useState } from 'react'
import { RockIcon } from './Jar'
import { Sheet } from './ui'
import { ROCK_SHORT } from '../data/catalog'
import { addDays as addDaysISO, buzz, todayISO, uid, update } from '../lib/store'
import { guessSin } from '../data/ladders'

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

const DAYS = [1, 2, 3, 4, 5, 6, 0] // ma t/m zo
const DAY_LABEL = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
type Often = 'once' | 'daily' | 'days' | 'week'

/**
 * Een nieuwe post-it op je takenbord: wat je gaat doen, en hoe vaak. Eén keer (vandaag of morgen) wordt een losse taak
 * voor die dag; elke dag, op vaste dagen of een paar keer per week wordt een gewoonte die vanzelf terugkomt.
 */
export function AddTaskSheet({ onClose }: { onClose: () => void }) {
  const today = todayISO()
  const [text, setText] = useState('')
  const [often, setOften] = useState<Often>('once')
  const [when, setWhen] = useState<'today' | 'tomorrow'>('today')
  const [days, setDays] = useState<number[]>([1, 3, 5])
  const [times, setTimes] = useState(3)
  const [big, setBig] = useState(true)
  // Hoe laat: mag leeg blijven; ingevuld komt hij op het briefje en krijg je er (met meldingen aan) een herinnering voor
  const [at, setAt] = useState('')
  const ok = text.trim() && (often !== 'days' || days.length > 0)
  const save = () => {
    if (!ok) return
    buzz(12)
    const name = text.trim()
    update((d) => {
      if (often === 'once') {
        const date = when === 'today' ? today : addDaysISO(today, 1)
        const l = (d.logs[date] ??= { v: {} })
        ;(l.rocks ??= []).push({ id: 'rock-' + uid(), text: name, size: big ? 3 : 2, ...(at ? { at } : {}) })
      } else {
        const schedule = often === 'daily' ? { kind: 'daily' as const } : often === 'days' ? { kind: 'days' as const, days } : { kind: 'week' as const, times }
        d.habits.push({ id: 'custom-' + uid(), name, sin: guessSin(name) ?? 'sloth', kind: 'virtue', type: 'do', weight: big ? 3 : 2, schedule, ...(at ? { at } : {}) })
      }
    })
    onClose()
  }
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <h2 className="h2">Nieuwe post-it</h2>
        <input className="input" autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} placeholder="Wat ga je doen?" aria-label="Wat ga je doen?" />
        <div className="stack gap-8">
          <span className="small">Hoe vaak?</span>
          <div className="seg often-seg" role="radiogroup" aria-label="Hoe vaak">
            {([['once', 'Eén keer'], ['daily', 'Elke dag'], ['days', 'Vaste dagen'], ['week', 'Per week']] as const).map(([k, l]) => (
              <button key={k} role="radio" aria-checked={often === k} className={often === k ? 'on' : ''} onClick={() => { buzz(6); setOften(k) }}>{l}</button>
            ))}
          </div>
          {often === 'once' && (
            <div className="chips">
              <button className={`chip ${when === 'today' ? 'on' : ''}`} onClick={() => setWhen('today')}>Vandaag</button>
              <button className={`chip ${when === 'tomorrow' ? 'on' : ''}`} onClick={() => setWhen('tomorrow')}>Morgen</button>
            </div>
          )}
          {often === 'days' && (
            <div className="week-pick" role="group" aria-label="Op welke dagen">
              {DAYS.map((d) => (
                <button key={d} className={`chip ${days.includes(d) ? 'on' : ''}`} aria-pressed={days.includes(d)} onClick={() => setDays((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]))}>{DAY_LABEL[d]}</button>
              ))}
            </div>
          )}
          {often === 'week' && (
            <div className="hstack" style={{ gap: 12 }}>
              <button className="chip" aria-label="Minder" onClick={() => setTimes((t) => Math.max(1, t - 1))}>−</button>
              <span className="lead" style={{ margin: 0, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{times} keer per week</span>
              <button className="chip" aria-label="Meer" onClick={() => setTimes((t) => Math.min(6, t + 1))}>+</button>
            </div>
          )}
        </div>
        <label className="row add-row">
          <div className="grow"><div className="name">Hoe laat</div><div className="meta">Optioneel</div></div>
          {at && <button className="link" onClick={(e) => { e.preventDefault(); setAt('') }} style={{ marginRight: 12 }}>Geen tijd</button>}
          <input className="time-input add-time" type="time" value={at} onChange={(e) => setAt(e.target.value)} aria-label="Hoe laat (optioneel)" />
        </label>
        <button className="row add-row" role="switch" aria-checked={big} onClick={() => setBig((x) => !x)}>
          <div className="grow"><div className="name">Grote taak</div><div className="meta">Telt mee of je de dag wint</div></div>
          <span className={`switch ${big ? 'on' : ''}`} aria-hidden="true"><i /></span>
        </button>
        <button className="btn" disabled={!ok} onClick={save}>Plak hem op je bord</button>
      </div>
    </Sheet>
  )
}
