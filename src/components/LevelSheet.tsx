import { useEffect, useState, type CSSProperties } from 'react'
import type { GogginsLevel, Measure } from '../lib/level'
import { Sheet, useTween } from './ui'

/** De vier niveaus als de figuren uit de scènes: van de schim met zijn telefoon tot de ridder. */
const FIGURES = [
  { name: 'Zacht', img: 'karakter-schim' },
  { name: 'Gemiddeld', img: 'karakter-balans' },
  { name: 'Ongewoon', img: 'karakter-klimmer' },
  { name: 'Beest', img: 'karakter-ideaal' },
] as const

/** Elke maatstaf zijn eigen voorwerp, in dezelfde stijl. */
const ICON: Record<Measure['key'], string> = {
  woord: 'item-halter',
  ongemak: 'item-ijsbad',
  eerlijk: 'item-handspiegel',
  volhouden: 'item-pelgrimsstaf',
}

/**
 * Je niveau als een klim: vier stenen treden met op elke trede een figuur. Jij staat in het licht,
 * wie je was is verbleekt, wie je kunt worden staat hogerop in de mist, als silhouet met een rand licht. Daaronder de vier maatstaven als ringen rond hun voorwerp.
 * De score telt op, de stip schuift naar je plek, de ringen tekenen zich; de zwakste ring licht op.
 */
export default function LevelSheet({ level, onClose }: { level: GogginsLevel; onClose: () => void }) {
  const [go, setGo] = useState(false)
  useEffect(() => { const t = requestAnimationFrame(() => setGo(true)); return () => cancelAnimationFrame(t) }, [])
  const score = useTween(go ? level.score : 0, 1400)
  const at = FIGURES.findIndex((f) => f.name === level.name)

  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-24">
        {/* De klim: vier treden in steen, op elke trede een figuur. De camera duwt in op jouw trede,
            het licht valt op jou, wie je kunt worden staat hoger op in de mist. */}
        <div className="lv-stage" style={{ '--at': at } as CSSProperties} aria-label={`Je niveau: ${level.name}, ${level.score} punten`}>
          <span className="lv-sky" aria-hidden="true" />
          <div className="lv-world">
            <span className="lv-rays" aria-hidden="true" />
            {FIGURES.map((f, i) => (
              <div key={f.name} className={`lv-step ${i < at ? 'past' : i === at ? 'now' : 'next'}`} style={{ '--i': i } as CSSProperties}>
                <span className="lv-riser">{f.name}</span>
              </div>
            ))}
            {FIGURES.map((f, i) => (
              <figure key={f.name} className={`lv-fig ${i < at ? 'past' : i === at ? 'now' : 'next'}`} style={{ '--i': i } as CSSProperties}>
                <span className="lv-shadow" aria-hidden="true" />
                <img src={`/art/${f.img}.webp`} alt="" />
              </figure>
            ))}
            <span className="lv-motes" aria-hidden="true">{[0, 1, 2, 3, 4].map((k) => <img key={k} src="/art/effect-stofje.webp" alt="" style={{ animationDelay: `${-k * 1.2}s`, left: `${30 + k * 10}%` }} />)}</span>
          </div>
          <span className="lv-mist" aria-hidden="true" />
          <span className="lv-fade" aria-hidden="true" />
        </div>

        <div className="center stack gap-4">
          <div className="lv-score"><span>{Math.round(score)}</span><small>/100</small></div>
          <h2 className="h1">{level.name}</h2>
          <div className="small">{level.next ? `Nog ${level.to} ${level.to === 1 ? 'punt' : 'punten'} tot ${level.next}` : 'En je bent nooit klaar'}</div>
        </div>

        {/* De vier maatstaven */}
        <div className="lv-grid">
          {level.parts.map((p, i) => (
            <Ring key={p.key} m={p} go={go} delay={i * 120} weak={p.key === level.weakest.key} />
          ))}
        </div>

        <div className="smoes">
          <div className="eyebrow">Hier win je nu het meest · {level.weakest.label.toLowerCase()}</div>
          <p className="lead" style={{ color: 'var(--ink)' }}>{level.weakest.push}</p>
        </div>
        <p className="small center" style={{ margin: 0 }}>De zonden laten zien wáár je werkt. Dit laat zien óf je het doet.</p>
      </div>
    </Sheet>
  )
}

function Ring({ m, go, delay, weak }: { m: Measure; go: boolean; delay: number; weak: boolean }) {
  const pct = Math.round(m.value * 100)
  return (
    <div className={`lv-ring ${weak ? 'weak' : ''}`}>
      <div className="lv-ring-art">
        <svg viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" fill="none" stroke="#F2F2F2" strokeOpacity="0.1" strokeWidth="3" />
          <circle cx="40" cy="40" r="36" fill="none" stroke="#F2F2F2" strokeWidth="3" strokeLinecap="round" pathLength={100} strokeDasharray={`${go ? Math.max(0.5, pct) : 0} 100`} transform="rotate(-90 40 40)" style={{ transition: `stroke-dasharray 1.2s var(--ease) ${delay}ms` }} />
        </svg>
        <img src={`/art/${ICON[m.key]}.webp`} alt="" />
      </div>
      <div className="lv-pct">{pct}%</div>
      <div className="lv-label">{m.label}</div>
      <div className="small">{m.detail}</div>
    </div>
  )
}
