import { useEffect, useId, useState } from 'react'
import { SINS, type SinId } from '../data/sins'

const INK = '#F2F2F2'
const INK_2 = '#B3B3B3'
const INK_3 = '#808080'
const C = 160
const BASE = 76 // de nullijn: hierbuiten wat je leeft, hierbinnen wat je schaduw vasthoudt
const OUT = 44
const IN = 32
const RIM = BASE + OUT + 8
const GRENS = BASE + OUT + 4
const SPAN = (Math.PI * 2) / 7
const GAP = 0.05

const pt = (a: number, r: number) => [C + Math.cos(a) * r, C + Math.sin(a) * r]
const ang = (i: number) => -Math.PI / 2 + i * SPAN

/** Een ringsegment tussen twee stralen: één terras. */
const wedge = (a: number, r1: number, r2: number) => {
  const a1 = a - SPAN / 2 + GAP
  const a2 = a + SPAN / 2 - GAP
  const [x1, y1] = pt(a1, r2)
  const [x2, y2] = pt(a2, r2)
  const [x3, y3] = pt(a2, r1)
  const [x4, y4] = pt(a1, r1)
  return `M ${x1} ${y1} A ${r2} ${r2} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r1} ${r1} 0 0 0 ${x4} ${y4} Z`
}

const fmt = (v: number) => `${v >= 0.5 ? '+' : v <= -0.5 ? '−' : ''}${Math.abs(Math.round(v))}`

/** Hoe gelijkmatig je zeven terrassen ontwikkeld zijn (0–100). Jung: heelheid, geen perfectie. */
export const evenness = (values: number[]) => {
  if (values.length < 2) return 100
  const m = values.reduce((a, b) => a + b, 0) / values.length
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length)
  return Math.max(0, Math.min(100, Math.round(100 - sd)))
}

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
 * De mandala van het Zelf, als gegraveerde wijzerplaat. Elk terras is een segment:
 * massief naar buiten is wat je aan deugd leeft, gearceerd naar binnen is wat je schaduw vasthoudt.
 * In het midden staat je evenwicht; tik een terras aan en het midden vertelt over dat terras.
 * Nog een tik opent het. De dunne ring vlak binnen de schaal is de grens: hoeveel je deze maand
 * uit je comfortzone bent gegaan. In herstel staat hij gestippeld stil.
 */
export default function Mandala({ values, active, onPick, grens = 0, rest = false }: { values: Record<SinId, number>; active: Set<SinId>; onPick: (s: SinId) => void; grens?: number; rest?: boolean }) {
  const id = useId().replace(/:/g, '')
  const grow = useGrow()
  const [sel, setSel] = useState<SinId | null>(null)
  const ev = evenness(SINS.filter((s) => active.has(s.id)).map((s) => values[s.id]))
  const picked = sel ? SINS.find((s) => s.id === sel)! : null

  const tap = (s: SinId) => (sel === s ? onPick(s) : setSel(s))

  return (
    <svg viewBox="-52 4 424 306" style={{ width: '100%', display: 'block', touchAction: 'manipulation' }} role="img" aria-label={`Mandala van je zeven terrassen, ${ev}% evenwicht`}>
      <defs>
        <pattern id={`mh${id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke={INK} strokeWidth="1.2" />
        </pattern>
      </defs>

      {/* Tik naast de mandala: terug naar je evenwicht */}
      <rect x="-52" y="4" width="424" height="306" fill="transparent" onClick={() => setSel(null)} />

      {/* De rand: een gegraveerde schaal, net als de balansmeter */}
      <circle cx={C} cy={C} r={RIM} fill="none" stroke={INK} strokeWidth="1" opacity="0.35" />
      {Array.from({ length: 70 }).map((_, i) => {
        const a = -Math.PI / 2 + (i / 70) * Math.PI * 2
        const major = i % 10 === 0
        const [x1, y1] = pt(a, RIM)
        const [x2, y2] = pt(a, RIM + (major ? 6 : 3))
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="1" opacity={major ? 0.5 : 0.2} />
      })}

      {/* De grens: deze maand verlegd, rond vanaf boven */}
      <circle cx={C} cy={C} r={GRENS} fill="none" stroke={INK} strokeWidth="2" opacity="0.12" />
      {grens > 0 && (
        <circle cx={C} cy={C} r={GRENS} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeDasharray={rest ? '2 6' : `${Math.min(1, grens) * grow(6) * 2 * Math.PI * GRENS} ${2 * Math.PI * GRENS}`} transform={`rotate(-90 ${C} ${C})`} opacity={rest ? 0.5 : 1} />
      )}

      {SINS.map((s, i) => {
        const a = ang(i)
        const on = active.has(s.id)
        const v = on ? values[s.id] * grow(i) : 0
        const isSel = sel === s.id
        const dim = sel && !isSel ? 0.35 : 1
        const [lx, ly] = pt(a, RIM + 16)
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end'
        return (
          <g key={s.id} onClick={() => tap(s.id)} style={{ cursor: 'pointer', transition: 'opacity .4s' }} opacity={dim}>
            {/* Het spoor: hoe ver dit terras kan gaan, naar binnen en naar buiten */}
            <path d={wedge(a, BASE - IN, BASE + OUT)} fill={INK} fillOpacity={isSel ? 0.08 : 0.035} />
            {v > 0.5 && <path d={wedge(a, BASE, BASE + (OUT * v) / 100)} fill={INK} />}
            {v < -0.5 && <path d={wedge(a, BASE, BASE - (IN * -v) / 100)} fill={`url(#mh${id})`} stroke={INK} strokeWidth="1" />}
            <text x={lx} y={ly + 4} textAnchor={anchor} fill={!on ? INK_3 : isSel ? INK : INK_2} style={{ fontFamily: 'var(--sans)', fontWeight: isSel ? 600 : 400, fontSize: 13, transition: 'fill .3s' }}>
              {s.virtue}
            </text>
          </g>
        )
      })}

      {/* De nullijn */}
      <circle cx={C} cy={C} r={BASE} fill="none" stroke={INK} strokeWidth="1.5" pointerEvents="none" />

      {/* Het midden: je evenwicht, of het terras dat je aantikt */}
      <g onClick={() => (sel ? onPick(sel) : undefined)} style={{ cursor: sel ? 'pointer' : 'default' }}>
        <circle cx={C} cy={C} r={BASE - IN - 4} fill="transparent" />
        {picked ? (
          <>
            <text x={C} y={C - 4} textAnchor="middle" fill={INK} style={{ fontFamily: 'var(--title)', fontWeight: 400, fontSize: 28 }}>
              {active.has(picked.id) ? fmt(values[picked.id]) : '–'}
            </text>
            <text x={C} y={C + 20} textAnchor="middle" fill={INK_3} style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 13 }}>
              tik om te openen
            </text>
          </>
        ) : (
          <>
            <text x={C} y={C - 4} textAnchor="middle" fill={INK} style={{ fontFamily: 'var(--title)', fontWeight: 400, fontSize: 28 }}>
              {ev}%
            </text>
            <text x={C} y={C + 20} textAnchor="middle" fill={INK_3} style={{ fontFamily: 'var(--sans)', fontWeight: 400, fontSize: 13 }}>
              evenwicht
            </text>
          </>
        )}
      </g>
    </svg>
  )
}
