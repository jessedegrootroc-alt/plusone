import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Habit } from '../lib/store'
import { buzz } from '../lib/store'
import { SIN_BY_ID } from '../data/sins'
import { Ico } from './Ico'

export const Icon = {
  check: (c?: string) => <Ico name="check" size={18} color={c} />,
  close: () => <Ico name="close" size={22} />,
  back: () => <Ico name="back" size={22} />,
  next: () => <Ico name="next" size={20} />,
  plus: () => <Ico name="plus" size={18} />,
  minus: () => <Ico name="minus" size={18} />,
  mirror: () => <Ico name="mirror" size={24} />,
  compass: () => <Ico name="compass" size={24} />,
  self: () => <Ico name="user" size={24} />,
  path: () => <Ico name="path" size={24} />,
  wave: () => <Ico name="urge" size={18} />,
}

/** Getal dat zacht naar zijn doel glijdt — voor de morph van de avatar. */
export const useTween = (target: number, ms = 1100) => {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const start = performance.now()
    const a = from.current
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms)
      const e = 1 - Math.pow(1 - k, 3)
      const val = a + (target - a) * e
      from.current = val
      setV(val)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

export function RedLine({ value, compact }: { value: number; compact?: boolean }) {
  const pct = (Math.max(-100, Math.min(100, value)) + 100) / 2
  return (
    <div>
      <div className="redline">
        <div className="track" />
        {[0, 50, 100].map((p) => (
          <div key={p} className="tick" style={{ left: `${p}%` }} />
        ))}
        <div className="fill" style={{ left: `${Math.min(50, pct)}%`, width: `${Math.abs(pct - 50)}%` }} />
        <div className="knob" style={{ left: `${pct}%` }} />
      </div>
      {!compact && (
        <div className="redline-labels">
          <span>Inferno</span>
          <span>Purgatorio</span>
          <span>Paradiso</span>
        </div>
      )}
    </div>
  )
}

export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  // Wegvegen of Escape: eerst de sheet laten zakken, dan pas sluiten
  const [out, setOut] = useState(false)
  const animated = useRef(false)
  const scrimRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return onClose()
    animated.current = true
    setOut(true)
    setTimeout(onClose, 260)
  }, [onClose])
  // Sluit hij op een andere manier (Klaar, Opslaan, een stap gezet), dan verdwijnt hij niet in één klap:
  // een kopie van hoe hij er nu uitziet zakt weg, terwijl de echte al weg is. Werkt voor elke sheet, hoe die ook sluit.
  useLayoutEffect(() => {
    const sheet = sheetRef.current
    const scrim = scrimRef.current
    return () => {
      if (animated.current || !sheet || !scrim || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const top = sheet.scrollTop
      const ghosts = [scrim, sheet].map((el) => {
        const g = el.cloneNode(true) as HTMLElement
        g.classList.add('out', 'ghost')
        g.setAttribute('aria-hidden', 'true')
        document.body.append(g)
        return g
      })
      ghosts[1].scrollTop = top
      setTimeout(() => ghosts.forEach((g) => g.remove()), 320)
    }
  }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [close])
  return createPortal(
    <>
      <div ref={scrimRef} className={`scrim ${out ? 'out' : ''}`} onClick={close} />
      <div ref={sheetRef} className={`sheet ${out ? 'out' : ''}`} role="dialog" aria-modal="true">
        <div className="grab" />
        {children}
      </div>
    </>,
    document.body,
  )
}

/** Vasthouden om te bevestigen. Een kleine drempel maakt een belofte serieus. */
export function HoldButton({ label, onDone, ms = 1600, className = 'btn' }: { label: string; onDone: () => void; ms?: number; className?: string }) {
  const [p, setP] = useState(0)
  const raf = useRef(0)
  const t0 = useRef(0)
  const done = useRef(false)
  const start = () => {
    if (done.current) return
    t0.current = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0.current) / ms)
      setP(k)
      if (k >= 1) {
        done.current = true
        buzz(30)
        onDone()
      } else raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }
  const stop = () => {
    cancelAnimationFrame(raf.current)
    if (!done.current) setP(0)
  }
  return (
    <button
      className={`${className} hold`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && start()}
      onKeyUp={stop}
    >
      <div className="fillbar" style={{ transform: `scaleX(${p})` }} />
      <span>{p > 0 && p < 1 ? 'Blijf vasthouden…' : label}</span>
    </button>
  )
}

export function Toast({ text, onDone, action, onAction }: { text: string; onDone: () => void; action?: string; onAction?: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, action ? 6500 : 3600)
    return () => clearTimeout(t)
  }, [text, onDone, action])
  return createPortal(
    <div className="toast hstack between" role="status" style={{ gap: 12 }}>
      <span>{text}</span>
      {action && (
        <button onClick={() => { onAction?.(); onDone() }} style={{ fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap', color: 'inherit' }}>
          {action}
        </button>
      )}
    </div>,
    document.body,
  )
}

export const fmt = (n: number) => (n >= 1000 ? n.toLocaleString('nl-NL') : String(n))

/** Eén gewoonte, één tik. Deugden tik je aan; verleidingen staan op 'vrij' en tik je alleen als je toegaf. */
export function HabitRow({ h, value, answered, onChange, meta: metaOverride, onRemove, lead, compact, tight }: {
  h: Habit
  value: number
  answered: boolean
  onChange: (v: number) => void
  meta?: string
  onRemove?: () => void
  /** Klein element links van de naam, bijvoorbeeld de grootte van de steen. */
  lead?: ReactNode
  /** Alleen het hoognodige: geen zonde/deugd-label, alleen het doel. */
  compact?: boolean
  /** Eén regel hoog: de naam wordt afgekapt in plaats van te breken. */
  tight?: boolean
}) {
  const sin = SIN_BY_ID[h.sin]
  const meta = metaOverride ?? (compact ? '' : h.kind === 'virtue' ? sin.virtue : sin.sin)
  const step = h.step ?? 1
  const amt = h.amount ?? 0

  if (h.type === 'do') {
    const on = value >= 1
    return (
      <button className={`row ${tight ? 'tight' : ''} ${on ? 'done' : ''}`} onClick={() => { buzz(); onChange(on ? 0 : 1) }} aria-pressed={on}>
        {lead}
        <div className="grow">
          <div className="name">{h.name}</div>
          {meta && <div className="meta">{meta}</div>}
        </div>
        {onRemove && (
          <span
            role="button"
            tabIndex={0}
            aria-label={`${h.name} verwijderen`}
            className="iconbtn"
            style={{ width: 32, height: 32, color: 'var(--ink-3)' }}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemove() } }}
          >
            {Icon.close()}
          </span>
        )}
        <div className={`check ${on ? 'on' : ''}`}>{on && Icon.check('#0B0B0B')}</div>
      </button>
    )
  }

  if (h.type === 'avoid') {
    const slip = value >= 1
    return (
      <button className={`row ${tight ? 'tight' : ''} ${slip ? 'slip' : ''}`} onClick={() => { buzz(slip ? 8 : 20); onChange(slip ? 0 : 1) }} aria-pressed={slip}>
        {lead}
        <div className="grow">
          <div className="name">{h.name}</div>
          {meta && <div className="meta">{meta}</div>}
        </div>
        <span className={`pill ${slip ? 'slip' : answered ? 'clean' : ''}`}>{slip ? 'Toegegeven' : 'Vrij'}</span>
      </button>
    )
  }

  const over = h.type === 'limit' && value > amt
  const ok = h.type === 'target' ? value >= amt : !over
  const pct = h.type === 'target' ? Math.min(100, (value / Math.max(1, amt)) * 100) : Math.min(100, (value / Math.max(1, amt || step)) * 100)
  return (
    <div className={`row ${tight ? 'tight' : ''} ${h.type === 'target' && ok ? 'done' : over ? 'slip' : ''}`}>
      {lead}
      <button className="grow" style={{ textAlign: 'left' }} onClick={() => { buzz(); onChange(value + step) }}>
        <div className="name">{h.name}</div>
        <div className="meta">
          {meta ? `${meta} · ` : ''}{h.type === 'target' ? 'doel' : 'max'} {fmt(amt)} {h.unit}
        </div>
        <div className={`bar ${over ? 'over' : ''}`}><i style={{ width: `${pct}%` }} /></div>
      </button>
      <div className="stepper">
        <button aria-label="Minder" onClick={() => { buzz(); onChange(Math.max(0, value - step)) }}>{Icon.minus()}</button>
        <div className="val">{fmt(value)}<small>{h.unit}</small></div>
        <button aria-label="Meer" onClick={() => { buzz(); onChange(value + step) }}>{Icon.plus()}</button>
      </div>
    </div>
  )
}
