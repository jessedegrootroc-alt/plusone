import { useEffect, useState, type CSSProperties } from 'react'
import { stageFor } from '../data/sins'
import { climbOf, dayResult, isSaved, keptOnly, winStreak, wonStats } from '../lib/days'
import { addDays, buzz, todayISO, useStore } from '../lib/store'

/** Wanneer wat gebeurt (ms). Eén plek, zodat de trillingen gelijk lopen met het beeld. */
const T = { land: 1560, roll: 1650 }
/** De lichtjes: waar (%), wanneer (ms), hoeveel opzij (px). */
const MOTES = [[18, 0, 14], [34, 1400, -10], [62, 700, 18], [78, 2100, -16], [48, 3000, 8]] as const

/**
 * Het moment dat je de dag wint (Duolingo's reeks-scherm, in de taal van de app).
 * Geen vuurtje: je pelgrim zet een stap hoger op jouw berg, landt, het licht breekt door,
 * en je reeks rolt één omhoog. Daarna je week, en wat dit getal betekent. Ruim drie seconden; tik om over te slaan.
 */
export default function WinMoment({ onClose }: { onClose: () => void }) {
  const s = useStore()
  const today = todayISO()
  const [n] = useState(() => winStreak(s, today))
  const [skip, setSkip] = useState(false)
  const [out, setOut] = useState(false)
  const scene = stageFor(climbOf(wonStats(s, today))).scene
  const week = Array.from({ length: 7 }).map((_, i) => addDays(today, i - 6))

  useEffect(() => {
    const a = setTimeout(() => buzz(18), T.land)
    const b = setTimeout(() => buzz(10), T.roll + 260)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])

  const close = () => { setOut(true); setTimeout(onClose, 280) }

  // Wat het getal betekent: een geredde dag, je belofte, of gewoon morgen
  const savedDay = [...week].reverse().find((d) => d !== today && isSaved(s, d))
  const commit = s.settings?.commit
  const line = savedDay
    ? `${new Date(savedDay + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase())} ving je reservedag je op. Morgen ${n + 1}.`
    : commit && n < commit ? `Nog ${commit - n} tot je belofte van ${commit} dagen.`
    : commit && n === commit ? `Je belofte van ${commit} dagen: gehaald.`
    : `Morgen ${n + 1}.`

  const layer = (k: string, cls: string) => <img className={`wm-layer ${cls}`} src={`/art/achtergrond-${scene}-${k}.webp`} alt="" />
  return (
    <div className={`wm ${skip ? 'skip' : ''} ${out ? 'out' : ''}`} role="dialog" aria-modal="true" aria-label={`Dag gewonnen. ${n} ${n === 1 ? 'dag' : 'dagen'} op rij.`} onClick={() => setSkip(true)}>
      <div className="wm-scene" aria-hidden="true">
        {layer('1-ver', 'wm-sky')}
        <img className="wm-fx wm-glow" src="/art/effect-gloed.webp" alt="" />
        <img className="wm-fx wm-rays" src="/art/effect-stralen.webp" alt="" />
        {layer('2-midden', 'wm-mid')}
        {layer('3-grond', 'wm-ground')}
        <div className="wm-walker">
          <div className="wm-step">
            <img className="wm-f1" src="/art/item-pelgrim-1.webp" alt="" />
            <img className="wm-f2" src="/art/item-pelgrim-2.webp" alt="" />
          </div>
          <img className="wm-dust" src="/art/effect-stofje.webp" alt="" />
        </div>
        {layer('4-voorgrond', 'wm-front')}
        {MOTES.map(([x, d, dx], i) => <img key={i} className="wm-mote" src="/art/effect-lichtje.webp" alt="" style={{ '--x': `${x}%`, '--d': `${d}ms`, '--dx': `${dx}px` } as CSSProperties} />)}
        <div className="wm-shade" />
        <div className="wm-flash" />
      </div>

      <div className="wm-top">
        <div className="wm-count" aria-hidden="true">
          <span className="wm-old">{n - 1}</span>
          <span className="wm-new">{n}</span>
        </div>
        <div className="wm-lbl">{n === 1 ? 'dag gewonnen' : 'dagen op rij gewonnen'}</div>
      </div>

      <div className="wm-bottom">
        <div className="won-dots wm-dots">
          {week.map((d, i) => {
            const r = d === today ? true : dayResult(s, d)
            const sv = r === null && isSaved(s, d)
            const kept = d !== today && keptOnly(s, d)
            return (
              <span key={d} className={`won-dot ${d === today ? 'wm-today' : r === true ? 'won' : kept ? 'kept' : r === false ? 'lost' : sv ? 'saved' : ''}`} style={{ '--i': i } as CSSProperties}>
                {new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short' }).slice(0, 2)}
              </span>
            )
          })}
        </div>
        <p className="wm-line">{line}</p>
        <button className="btn wm-btn" onClick={(e) => { e.stopPropagation(); close() }}>Door</button>
      </div>
    </div>
  )
}
