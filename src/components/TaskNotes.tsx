import { useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from 'react'
import { paperFor } from '../lib/paper'
import { buzz, type Habit } from '../lib/store'
import { isWakeHabit } from '../lib/wake'
import { BoardCols } from './Pinboard'
import { Icon } from './ui'

/** Zo ver trek je een briefje opzij voordat het afscheurt. */
const TEAR_AT = 72

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export interface TaskItem {
  h: Habit
  big: boolean
  done: boolean
  late: boolean
  meta?: string
  removable: boolean
}

/**
 * De taken van vandaag als briefjes op het prikbord. Gedaan? Scheur het eraf: tik erop, of trek het opzij.
 * Het briefje vliegt in het blik met wat gedaan is; op het bord blijft het plakband met een afgescheurd randje.
 * Alleen wat zwaar was, wordt een koekje in de echte koektrommel (dat vraagt Vandaag na het afscheuren).
 * Tik op dat randje en het briefje hangt er weer.
 */
export default function TaskNotes({ items, bigDone, bigTotal, onTear, onBack, onTime, onRemove, title, count = true }: {
  items: TaskItem[]
  /** De teller onder de titel; op Vandaag staat hij al bovenaan */
  count?: boolean
  bigDone: number
  bigTotal: number
  onTear: (h: Habit) => void
  onBack: (h: Habit) => void
  onTime: (h: Habit) => void
  onRemove: (h: Habit) => void
  title: string
}) {
  const jarRef = useRef<HTMLDivElement>(null)
  const [bump, setBump] = useState(0)
  const inJar = items.filter((x) => x.done).length
  const won = bigTotal > 0 && bigDone === bigTotal

  return (
    <div className="task-pad">
      <div className="task-head">
        <div className="stack gap-4">
          <h2 className="h2">{title}</h2>
          {count && <span className="small">{bigTotal ? `${bigDone} van ${bigTotal} grote taken gedaan` : 'Geen grote taken'}</span>}
        </div>
        <div ref={jarRef} key={bump} className={`trommel ${bump ? 'bump' : ''} ${won ? 'won' : ''}`} role="img" aria-label={`Gedaan: ${inJar} ${inJar === 1 ? 'briefje' : 'briefjes'}`}>
          <Trommel count={inJar} />
        </div>
      </div>

      <div className="board task-board">
        {items.length ? (
          <BoardCols>
            {items.map((x, i) => (
              <TaskNote key={x.h.id} item={x} i={i} jarRef={jarRef} onTear={() => { onTear(x.h); setBump((b) => b + 1) }} onBack={() => onBack(x.h)} onTime={() => onTime(x.h)} onRemove={() => onRemove(x.h)} />
            ))}
          </BoardCols>
        ) : (
          <p className="board-empty">Geen taken voor deze dag. Maak een gewoonte groot onder Reis.</p>
        )}
        {items.some((x) => !x.done) && <p className="board-hint">Gedaan? Scheur het eraf.</p>}
      </div>
    </div>
  )
}

function TaskNote({ item, i, jarRef, onTear, onBack, onTime, onRemove }: {
  item: TaskItem
  i: number
  jarRef: RefObject<HTMLDivElement | null>
  onTear: () => void
  onBack: () => void
  onTime: () => void
  onRemove: () => void
}) {
  const { h, big, done, late, meta, removable } = item
  const p = paperFor(h.id + 'taak', 4)
  const ref = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; dx: number; on: boolean } | null>(null)
  const moved = useRef(false)
  const [flying, setFlying] = useState(false)
  const style = { '--rot': `${p.rot}deg`, '--dx': `${p.dx}px`, '--tint': p.tint, '--pin': `${p.pin}%`, '--tape': `${p.tape}deg`, animationDelay: `${Math.min(i, 8) * 60}ms` } as CSSProperties

  const tear = async (fromX = 0) => {
    const el = ref.current
    const jar = jarRef.current
    if (flying || !el) return
    buzz(16)
    if (reduced() || !jar || !el.animate) { onTear(); return }
    const a = el.getBoundingClientRect()
    const b = jar.getBoundingClientRect()
    const tx = b.left + b.width / 2 - (a.left + a.width / 2)
    const ty = b.top + b.height * 0.35 - (a.top + a.height / 2)
    const dir = fromX < 0 ? -1 : 1
    setFlying(true)
    // Eerst de ruk: het briefje schiet los van het plakband. Dan een boog omhoog, en de trommel in.
    const anim = el.animate([
      { transform: `translate(${p.dx + fromX}px, 0) rotate(${p.rot + fromX / 10}deg)` },
      { transform: `translate(${p.dx + fromX + dir * 16}px, 10px) rotate(${p.rot + dir * 9}deg)`, offset: 0.16 },
      { transform: `translate(${tx * 0.5}px, ${Math.min(ty, 0) * 0.6 - 70}px) rotate(${p.rot + dir * 50}deg) scale(0.62)`, offset: 0.55 },
      { transform: `translate(${tx}px, ${ty - 18}px) rotate(${p.rot + dir * 92}deg) scale(0.2)`, opacity: 1, offset: 0.86 },
      { transform: `translate(${tx}px, ${ty + 6}px) rotate(${p.rot + dir * 100}deg) scale(0.12)`, opacity: 0 },
    ], { duration: 860, easing: 'cubic-bezier(.33,.66,.25,1)', fill: 'forwards' })
    await anim.finished.catch(() => undefined)
    onTear()
    setFlying(false)
  }

  // Opzij trekken scheurt het briefje af; op en neer blijft gewoon scrollen.
  const down = (e: PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY, dx: 0, on: false } }
  const move = (e: PointerEvent) => {
    const d = drag.current
    const el = ref.current
    if (!d || !el) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.on) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag.current = null; return }
      if (Math.abs(dx) < 10) return
      d.on = true
      el.setPointerCapture(e.pointerId)
      el.classList.add('pulling')
    }
    d.dx = dx
    // Het plakband houdt de bovenkant vast: hoe verder je trekt, hoe schever het hangt
    el.style.transform = `translate(${p.dx + dx * 0.85}px, ${Math.abs(dx) * 0.08}px) rotate(${p.rot + dx / 10}deg)`
  }
  const up = () => {
    const d = drag.current
    const el = ref.current
    drag.current = null
    if (!d?.on || !el) return
    moved.current = true
    el.classList.remove('pulling')
    if (Math.abs(d.dx) > TEAR_AT) void tear(d.dx * 0.85)
    else el.style.transform = ''
  }

  if (done && !flying) {
    return (
      <div className={`task-slot ${big ? '' : 'minor'}`} style={style}>
        <span className="tape" aria-hidden="true" />
        <button className="task-stub" onClick={() => { buzz(6); onBack() }} aria-label={`${h.name}: terughangen`}>
          <span className="stub-paper" aria-hidden="true" />
          <span className="stub-name">{h.name}</span>
          <span className="stub-back">terughangen</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`task-slot ${big ? '' : 'minor'} ${flying ? 'flying' : ''}`} style={style}>
      {flying && <span className="stub-paper left" aria-hidden="true" />}
      {!flying && <span className="tape" aria-hidden="true" />}
      <div ref={ref} className={`jar-note task-note ${big ? '' : 'minor'} ${flying ? 'torn' : ''}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <button className="tn-main" aria-label={`${h.name}: gedaan, afscheuren`} onClick={() => { if (moved.current) { moved.current = false; return } void tear() }} />
        <span className="jar-kind">{big ? 'Grote taak' : meta}</span>
        <span className="jar-text">{h.name}</span>
        {/* Het moment: waarna, en hoe laat. Zonder moment vraagt het briefje erom.
            Opstaan niet: dat is het eerste van je dag, de tijd staat al in de naam, en je wijzigt hem in Reis. */}
        {isWakeHabit(h) ? (
          <span className={`tn-time static ${late ? 'late' : ''}`}>
            {late && <span className="tn-at">Te laat</span>}
            <span className="tn-cue">Het eerste van je dag</span>
          </span>
        ) : (
        <button className={`tn-time ${late ? 'late' : ''}`} onClick={() => { if (moved.current) { moved.current = false; return } onTime() }} aria-label={`Wanneer ${h.name}: ${[h.cue && `na ${h.cue}`, h.at].filter(Boolean).join(', ') || 'nog geen moment'}`}>
          {h.cue && <span className="tn-cue">Na {h.cue}</span>}
          {h.at ? <span className="tn-at">{h.at}{late ? ' · te laat' : ''}</span> : !h.cue && <span className="tn-at">Wanneer?</span>}
        </button>
        )}
        {removable && <button className="tn-x" onClick={onRemove} aria-label={`${h.name} weghalen`}>{Icon.close()}</button>}
      </div>
    </div>
  )
}

/**
 * Het blik voor wat gedaan is, getekend als de rest: een rond blik, het deksel schuin erachter, en voor elk afgescheurd
 * briefje een papiertje dat boven de rand uitsteekt.
 */
function Trommel({ count }: { count: number }) {
  const scraps = Array.from({ length: Math.min(count, 7) })
  return (
    <svg viewBox="0 0 120 104" width="76" height="66" aria-hidden="true">
      <defs>
        <linearGradient id="tr-body" x1="0" x2="1">
          <stop offset="0" stopColor="#1A1A1A" />
          <stop offset="0.38" stopColor="#5C5C5C" />
          <stop offset="0.5" stopColor="#8C8C8C" />
          <stop offset="0.66" stopColor="#4A4A4A" />
          <stop offset="1" stopColor="#141414" />
        </linearGradient>
        <linearGradient id="tr-lid" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#6E6E6E" />
          <stop offset="1" stopColor="#1C1C1C" />
        </linearGradient>
        <pattern id="tr-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(28)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#000" strokeWidth="1.2" opacity="0.55" />
        </pattern>
      </defs>
      {/* Het deksel, schuin tegen de achterkant */}
      <ellipse cx="88" cy="34" rx="27" ry="31" transform="rotate(24 88 34)" fill="url(#tr-lid)" stroke="#D9D9D9" strokeWidth="1.4" />
      <ellipse cx="88" cy="34" rx="20" ry="23" transform="rotate(24 88 34)" fill="none" stroke="#D9D9D9" strokeWidth="0.8" opacity="0.6" />
      {/* De opening */}
      <ellipse cx="56" cy="46" rx="46" ry="11" fill="#050505" stroke="#D9D9D9" strokeWidth="1.4" />
      {/* De briefjes in de trommel */}
      {scraps.map((_, i) => {
        const x = 22 + ((i * 23) % 62)
        const r = (i % 2 ? -1 : 1) * (6 + ((i * 7) % 16))
        const top = 24 + ((i * 5) % 10)
        return <rect key={i} className="tr-scrap" x={x} y={top} width="20" height="30" rx="1" transform={`rotate(${r} ${x + 10} ${top + 30})`} fill={['#F2F2F2', '#ECEBE7', '#F5F4F0', '#E7E7E5'][i % 4]} stroke="#0B0B0B" strokeWidth="0.6" />
      })}
      {/* Het blik zelf, met twee geperste ringen */}
      <path d="M10 46 L10 88 A46 11 0 0 0 102 88 L102 46 A46 11 0 0 1 10 46 Z" fill="url(#tr-body)" stroke="#D9D9D9" strokeWidth="1.4" />
      <path d="M10 46 L10 88 A46 11 0 0 0 102 88 L102 46 A46 11 0 0 1 10 46 Z" fill="url(#tr-hatch)" opacity="0.5" />
      <path d="M10 56 A46 11 0 0 0 102 56" fill="none" stroke="#D9D9D9" strokeWidth="0.9" opacity="0.7" />
      <path d="M10 80 A46 11 0 0 0 102 80" fill="none" stroke="#D9D9D9" strokeWidth="0.9" opacity="0.7" />
      <path d="M30 60 L30 86 M82 60 L82 86" stroke="#F2F2F2" strokeWidth="0.6" opacity="0.25" />
      <path d="M50 62 L50 88" stroke="#FFFFFF" strokeWidth="2.2" opacity="0.35" strokeLinecap="round" />
    </svg>
  )
}
