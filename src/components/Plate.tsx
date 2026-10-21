import type { CSSProperties } from 'react'
import { STAGES, stageFor } from '../data/sins'

/** Een Doré-prent, randloos tot in de hoeken. */
export default function Plate({ src, alt = '', ratio = '3 / 4', className = '', style }: { src: string; alt?: string; ratio?: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={`plate ${className}`} style={style}>
      <img src={src} alt={alt} loading="lazy" style={{ aspectRatio: ratio }} />
    </div>
  )
}

/** De plaat van je toestand. Alle vijf liggen klaar en vloeien in elkaar over als je stijgt of zakt. */
export function StagePlate({ balance, ratio = '3 / 4', className = '', style }: { balance: number; ratio?: string; className?: string; style?: CSSProperties }) {
  const current = stageFor(balance)
  return (
    <div className={`plate ${className}`} style={style} role="img" aria-label={`${current.name}, ${current.place}`}>
      <div style={{ position: 'relative', aspectRatio: ratio, overflow: 'hidden' }}>
        {STAGES.map((s) => (
          <img
            key={s.scene}
            src={s.img}
            alt=""
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) contrast(1.05)', opacity: s.scene === current.scene ? 1 : 0, transition: 'opacity 1.2s ease' }}
          />
        ))}
      </div>
    </div>
  )
}
