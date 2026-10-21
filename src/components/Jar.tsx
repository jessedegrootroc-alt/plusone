const INK = '#F2F2F2'

/** Onregelmatige kiezelvorm, vast per index zodat stenen niet verspringen. */
const pebble = (cx: number, cy: number, r: number, seed: number) => {
  const pts = Array.from({ length: 7 }).map((_, i) => {
    const a = (i / 7) * Math.PI * 2
    const j = 0.84 + 0.16 * Math.abs(Math.sin(seed * 12.9898 + i * 78.233))
    return [cx + Math.cos(a) * r * j * 1.08, cy + Math.sin(a) * r * j * 0.9]
  })
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M ${mid(pts[6], pts[0]).join(' ')}`
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % 7])
    d += ` Q ${p[0]} ${p[1]} ${m[0]} ${m[1]}`
  })
  return d + ' Z'
}

export function RockIcon({ size, done = true, px = 18 }: { size: 1 | 2 | 3; done?: boolean; px?: number }) {
  const r = { 3: 8, 2: 5.8, 1: 3.8 }[size]
  return (
    <svg width={px} height={px} viewBox="0 0 20 20" aria-hidden="true" style={{ flex: 'none' }}>
      <path d={pebble(10, 11, r, size)} fill={done ? INK : 'none'} stroke={INK} strokeWidth={1.4} strokeDasharray={done ? undefined : '2 2'} />
    </svg>
  )
}
