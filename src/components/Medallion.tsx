import { useEffect, useState, type CSSProperties } from 'react'
import { tableauFor } from '../data/tableaux'
import TableauParts from './TableauParts'
import type { SinId } from '../data/sins'

const FRAME = 627 // de taferelen zijn 627×627
const DUST = [12, 27, 41, 55, 68, 80, 90]

/**
 * Het medaillon van een terras, groot en levend: het tafereel ademt, het ene deel dat beweegt beweegt
 * (de hamer van IJver, de slinger van Traagheid, de kan van Matigheid), er trekt een lichtbaan over
 * en er dwarrelt stof omhoog. De boog eromheen is hoe sterk de deugd of de zonde is, en tekent zich bij het openen.
 */
export default function Medallion({ id, value, active = true, size = 224 }: { id: SinId; value: number; active?: boolean; size?: number }) {
  const dark = active && value < -0.5
  const name = tableauFor(id, active ? value : 0)
  const [drawn, setDrawn] = useState(0)
  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(active ? Math.min(100, Math.abs(value)) : 0))
    return () => cancelAnimationFrame(t)
  }, [value, active])

  const ring = size + 24
  const r = size / 2 + 8
  const style = { '--size': `${size}px`, '--k': (size * 1.06) / FRAME } as CSSProperties

  return (
    <div className={`medal ${dark ? 'dark' : ''} ${active ? '' : 'off'}`} style={style}>
      <svg className="medal-ring" width={ring} height={ring} viewBox={`0 0 ${ring} ${ring}`} aria-hidden="true">
        <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke="#F2F2F2" strokeOpacity="0.1" strokeWidth="2" />
        <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke={dark ? '#808080' : '#F2F2F2'} strokeWidth="2.5" strokeLinecap="round" pathLength={100} strokeDasharray={`${drawn} 100`} transform={`rotate(-90 ${ring / 2} ${ring / 2})`} style={{ transition: 'stroke-dasharray 1.2s var(--ease)' }} />
      </svg>
      <div className="medal-disc">
        <div className="medal-art">
          <TableauParts name={name} />
        </div>
        <span className="medal-sheen" />
        <span className="medal-dust" aria-hidden="true">
          {DUST.map((x, i) => <i key={i} style={{ left: `${x}%`, animationDelay: `${-i * 1.5}s`, animationDuration: `${i % 2 ? 12 : 6}s` }} />)}
        </span>
      </div>
    </div>
  )
}
