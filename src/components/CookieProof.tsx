import { useState, type CSSProperties } from 'react'
import { growthOf } from '../lib/growth'
import { proofFor, readJar } from '../lib/jar'
import { paperFor } from '../lib/paper'
import { habitsFor, isDone, isNote } from '../lib/score'
import { addDays, todayISO, useStore, type State } from '../lib/store'

const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5)

/** Wat je vandaag moet doen: eerst je niet-onderhandelbare dingen, dan de post-it die het eerst verloopt, dan je grens. */
const taskOf = (s: State, today: string): string | null => {
  const l = s.logs[today]
  const nowHM = new Date().toTimeString().slice(0, 5)
  const big = habitsFor(s, today)
    .filter((h) => h.kind === 'virtue' && h.weight === 3 && !isNote(h) && !isDone(h, l?.v[h.id] ?? 0))
    .sort((a, b) => ((a.at ?? '99') < nowHM ? 1 : 0) - ((b.at ?? '99') < nowHM ? 1 : 0) || (a.at ?? '99').localeCompare(b.at ?? '99'))
  if (big.length) return big[0].name
  const steps = (s.notes ?? []).filter((n) => !n.doneAt).flatMap((n) => {
    const i = (n.steps ?? []).findIndex((x) => !x.doneAt)
    if (i < 0) return []
    const st = n.steps![i]
    const start = st.startedAt ?? n.steps![i - 1]?.doneAt ?? n.createdAt
    return [{ text: st.text, left: daysBetween(today, addDays(start, st.days ?? 7)) }]
  }).sort((a, b) => a.left - b.left)
  if (steps.length) return steps[0].text
  return growthOf(s, today).open[0]?.title ?? null
}

/**
 * Het bewijs naast wat je vandaag moet doen, zoals Goggins het doet: "Ik moet een marathon lopen? Ik liep
 * al eens 160 km in één race. Dit is niets." Eén briefje uit je koektrommel, liefst over hetzelfde onderwerp.
 */
export default function CookieProof() {
  const s = useStore()
  const today = todayISO()
  const [shift, setShift] = useState(0)
  const task = taskOf(s, today)
  const proof = task ? proofFor(s.jar, task, today, shift) : null
  if (!task || !proof) return null
  const r = readJar(proof)
  const p = paperFor(proof.id, 3)
  const more = s.jar.length > 1
  const date = new Date(proof.date + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
  return (
    <section className="section">
      <div className="card proof">
        <div className="stack gap-4">
          <div className="eyebrow">Vandaag moet je</div>
          <div className="h2">{task}</div>
        </div>
        <div className="proof-vs"><span>maar je deed al</span></div>
        <div key={proof.id} className="jar-note proof-note" style={{ '--rot': `${p.rot}deg`, '--tint': p.tint, '--pin': `${p.pin}%`, '--tape': `${p.tape}deg` } as CSSProperties}>
          {r.tape ? <span className="tape" aria-hidden="true" /> : <span className="proof-pin" aria-hidden="true" />}
          <span className="jar-kind">{r.label} · {date}</span>
          <span className="jar-text">{r.text}</span>
        </div>
        <div className="proof-foot">
          <span className="lead" style={{ color: 'var(--ink)' }}>Dit is niets.</span>
          {more && <button className="link" onClick={() => setShift((x) => x + 1)}>Ander bewijs</button>}
        </div>
      </div>
    </section>
  )
}
