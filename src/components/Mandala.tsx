import { useEffect, useId, useState } from 'react'
import { SINS, type SinId } from '../data/sins'
import { artFor } from '../data/tableaux'
import type { GogginsLevel } from '../lib/level'

const INK = '#F2F2F2'
const INK_2 = '#B3B3B3'
const INK_3 = '#808080'
const W = 360
const H = 372
const C = { x: W / 2, y: 178 }
const RING = 128 // waar de medaillons staan
const MED = 30 // straal van een medaillon
const ARC = MED + 5 // de boog eromheen: hoe sterk de deugd of de zonde is
const SPAN = (Math.PI * 2) / 7

const pt = (a: number, r: number) => [C.x + Math.cos(a) * r, C.y + Math.sin(a) * r]
const ang = (i: number) => -Math.PI / 2 + i * SPAN

/** Een boog rond (x, y), met de klok mee vanaf boven, voor een deel `f` van de cirkel. */
const arc = (x: number, y: number, r: number, f: number) => {
  const a = Math.min(f, 0.9999) * Math.PI * 2
  const ex = x + Math.sin(a) * r
  const ey = y - Math.cos(a) * r
  return `M ${x} ${y - r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${ex} ${ey}`
}

const fmt = (v: number) => `${v >= 0.5 ? '+' : v <= -0.5 ? '−' : ''}${Math.abs(Math.round(v))}`

/** Groeit bij het openen vanaf de nullijn naar buiten, terras na terras. */
const STAGGER = 0.08
const END = 1 + 6 * STAGGER

const useGrow = (ms = 900) => {
  const [t, setT] = useState(() => (matchMedia('(prefers-reduced-motion: reduce)').matches ? END : 0))
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const k = (now - start) / ms
      setT(k)
      if (k < END) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ms])
  return (i: number) => {
    const k = Math.max(0, Math.min(1, t - i * STAGGER))
    return 1 - Math.pow(1 - k, 3)
  }
}

/**
 * De mandala van het Zelf: je zeven terrassen als medaillons in een kring, getekend in de stijl van de scènes.
 * Leef je de deugd, dan zie je de deugd; wint de zonde, dan staat de zonde in het medaillon, donkerder.
 * De boog om een medaillon is hoe sterk. De medaillons zijn de kaart: wáár je werkt.
 * In het midden je niveau (zacht, gemiddeld, ongewoon, beest), gemeten zoals Goggins dat doet: óf je het doet.
 * Tik het midden voor de vier maatstaven.
 * Tik een medaillon en het midden vertelt over dat terras; nog een tik opent het.
 */
export default function Mandala({ values, active, onPick, level, onLevel }: { values: Record<SinId, number>; active: Set<SinId>; onPick: (s: SinId) => void; level: GogginsLevel; onLevel: () => void }) {
  const id = useId().replace(/:/g, '')
  const grow = useGrow()
  const [sel, setSel] = useState<SinId | null>(null)
  const lv = level
  const picked = sel ? SINS.find((s) => s.id === sel)! : null
  const tap = (s: SinId) => (sel === s ? onPick(s) : setSel(s))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', touchAction: 'manipulation' }} role="img" aria-label={`Mandala van je zeven terrassen: ${lv.name.toLowerCase()}`}>
      <defs>
        {SINS.map((s, i) => {
          const [x, y] = pt(ang(i), RING)
          return <clipPath key={s.id} id={`m${id}${i}`}><circle cx={x} cy={y} r={MED} /></clipPath>
        })}
      </defs>

      {/* Tik naast de mandala: terug naar wat je bent */}
      <rect width={W} height={H} fill="transparent" onClick={() => setSel(null)} />

      {/* De zeven medaillons */}
      {SINS.map((s, i) => {
        const on = active.has(s.id)
        const v = on ? values[s.id] : 0
        const k = grow(i)
        const [x, y] = pt(ang(i), RING)
        const isSel = sel === s.id
        const dim = sel && !isSel ? 0.4 : 1
        const dark = v < -0.5
        return (
          <g key={s.id} onClick={() => tap(s.id)} style={{ cursor: 'pointer', transition: 'opacity .4s' }} opacity={dim}>
            <circle cx={x} cy={y} r={ARC + 6} fill="transparent" />
            <circle cx={x} cy={y} r={MED} fill="#0B0B0B" />
            <image href={artFor(s.id, v)} x={x - MED * 1.1} y={y - MED * 1.1} width={MED * 2.2} height={MED * 2.2} preserveAspectRatio="xMidYMid slice" clipPath={`url(#m${id}${i})`} opacity={!on ? 0.22 : dark ? 0.55 : 1} />
            {isSel && <circle cx={x} cy={y} r={MED} fill="none" stroke={INK} strokeWidth="1.5" />}
            {/* De boog: hoe sterk, rond vanaf boven. Wit voor de deugd, grijs voor de zonde */}
            {on && Math.abs(v) > 0.5 && <path d={arc(x, y, ARC, (Math.abs(v) / 100) * k)} fill="none" stroke={dark ? INK_3 : INK} strokeWidth="2" strokeLinecap="round" />}
            <text x={x} y={y + ARC + 16} textAnchor="middle" fill={!on ? INK_3 : isSel ? INK : INK_2} style={{ fontFamily: 'var(--sans)', fontWeight: isSel ? 600 : 400, fontSize: 13, transition: 'fill .3s' }}>
              {dark ? s.sin : s.virtue}
            </text>
          </g>
        )
      })}

      {/* Het midden: wat je bent en hoe ver het volgende is, of het terras dat je aantikt */}
      <g onClick={() => (sel ? onPick(sel) : onLevel())} style={{ cursor: 'pointer' }} role="button" aria-label={sel ? 'Open dit terras' : `Je niveau: ${lv.name}. Tik voor de vier maatstaven`}>
        <circle cx={C.x} cy={C.y} r={48} fill="transparent" />
        <text x={C.x} y={C.y + 6} textAnchor="middle" fill={INK} style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: 28, letterSpacing: '-0.02em' }}>
          {picked ? (active.has(picked.id) ? fmt(values[picked.id]) : '–') : lv.name}
        </text>
        <text x={C.x} y={C.y + 28} textAnchor="middle" fill={INK_3} style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>
          {picked ? 'tik om te openen' : lv.next ? `nog ${lv.to} tot ${lv.next}` : 'en nooit klaar'}
        </text>
      </g>
    </svg>
  )
}
