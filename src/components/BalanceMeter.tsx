import { STAGES } from '../data/sins'

const INK = '#F2F2F2'

const W = 336
const X0 = 8
const X1 = W - 8
const RULE_Y = 36
const BOUNDS = [-100, -60, -20, 20, 60, 100]

const xFor = (balance: number) => X0 + ((Math.max(-100, Math.min(100, balance)) + 100) / 200) * (X1 - X0)
const fmt = (n: number) => `${n >= 0.5 ? '+' : n <= -0.5 ? '−' : ''}${Math.abs(Math.round(n))}`

/** Tempelierskruis (cross pattée), rond (0,0), halve breedte s. */
const pattee = (s: number) => {
  const c = s * 0.18
  const e = s * 0.55
  return `M ${-c} ${-c} L ${-e} ${-s} L ${e} ${-s} L ${c} ${-c} L ${s} ${-e} L ${s} ${e} L ${c} ${c} L ${e} ${s} L ${-e} ${s} L ${-c} ${c} L ${-s} ${e} L ${-s} ${-e} Z`
}

/**
 * De balansmeter als gegraveerde schaal: een haarlijn met maatstreepjes, vijf Romeinse cijfers
 * voor de vijf plekken, en een tempelierskruis dat aangeeft waar je staat.
 */
export default function BalanceMeter({ balance, onTap }: { balance: number; onTap?: () => void }) {
  const x = xFor(balance)
  const idx = Math.max(0, STAGES.findLastIndex((s) => balance >= s.min))
  const current = STAGES[idx]

  return (
    <button className="meter" onClick={onTap} aria-label={`Balans ${fmt(balance)}: ${current.place}. Open het kompas.`} style={{ width: '100%', display: 'block' }}>
      <svg viewBox={`0 0 ${W} 64`} aria-hidden="true">
        {/* De schaal */}
        <line x1={X0} y1={RULE_Y} x2={X1} y2={RULE_Y} stroke={INK} strokeWidth="1" opacity="0.35" />
        <line x1={xFor(BOUNDS[idx])} y1={RULE_Y} x2={xFor(BOUNDS[idx + 1])} y2={RULE_Y} stroke={INK} strokeWidth="2" style={{ transition: 'all .8s cubic-bezier(.22,1,.36,1)' }} />
        {Array.from({ length: 21 }).map((_, i) => {
          const v = -100 + i * 10
          const major = BOUNDS.includes(v)
          const tx = xFor(v)
          return <line key={v} x1={tx} y1={RULE_Y - (major ? 8 : 4)} x2={tx} y2={RULE_Y} stroke={INK} strokeWidth="1" opacity={major ? 0.6 : 0.3} />
        })}

        {/* Vijf plekken in Romeinse cijfers */}
        {STAGES.map((s, i) => {
          const cx = (xFor(BOUNDS[i]) + xFor(BOUNDS[i + 1])) / 2
          const on = i === idx
          return (
            <text key={s.scene} x={cx} y={60} textAnchor="middle" fill={INK} opacity={on ? 1 : 0.32} style={{ fontFamily: 'var(--sans)', fontWeight: 600, fontSize: on ? 14 : 12, letterSpacing: '.12em', transition: 'opacity .6s' }}>
              {s.plate}
            </text>
          )
        })}

        {/* Het tempelierskruis */}
        <g style={{ transform: `translateX(${x}px)`, transition: 'transform 1.1s cubic-bezier(.22,1,.36,1)' }}>
          <line x1="0" y1={RULE_Y - 10} x2="0" y2={RULE_Y + 8} stroke={INK} strokeWidth="1.5" />
          <path d={pattee(12)} transform={`translate(0 ${RULE_Y - 22})`} fill={INK} stroke="#141414" strokeWidth="2" paintOrder="stroke" />
        </g>
      </svg>
    </button>
  )
}
