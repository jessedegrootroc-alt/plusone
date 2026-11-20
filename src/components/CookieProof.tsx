import { useState, type CSSProperties } from 'react'
import { proofFor, readJar } from '../lib/jar'
import { paperFor } from '../lib/paper'
import { todayISO, useStore } from '../lib/store'

/**
 * Het bewijs naast wat je nu moet doen, zoals Goggins het doet: "Ik moet een marathon lopen? Ik liep
 * al eens 160 km in één race. Dit is niets." Eén briefje uit je koektrommel, liefst over hetzelfde onderwerp.
 * Staat op de kaart Nu, onder de taak; zonder koektrommel niets.
 */
export default function CookieProof({ task }: { task: string }) {
  const s = useStore()
  const today = todayISO()
  const [shift, setShift] = useState(0)
  const proof = proofFor(s.jar, task, today, shift)
  if (!proof) return null
  const r = readJar(proof)
  const p = paperFor(proof.id, 3)
  const more = s.jar.length > 1
  const date = new Date(proof.date + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
  return (
    <div className="proof">
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
  )
}
