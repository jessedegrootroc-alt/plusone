import { useMemo, useState } from 'react'
import Mandala from '../components/Mandala'
import { GrensDetails } from '../components/Grens'
import { MONTH_GOAL, growthOf } from '../lib/growth'
import { Icon, RedLine, Sheet } from '../components/ui'
import { SINS, SIN_BY_ID, type SinId } from '../data/sins'
import { computeSeries } from '../lib/score'
import { useStore } from '../lib/store'

function History({ points }: { points: { date: string; balance: number }[] }) {
  const data = points.slice(-30)
  const W = 320
  const H = 120
  if (data.length < 2) return <div className="small center" style={{ padding: '28px 0' }}>Na een paar dagen zie je hier je koers.</div>
  const x = (i: number) => (i / (data.length - 1)) * (W - 8) + 4
  const y = (v: number) => H / 2 - (v / 100) * (H / 2 - 8)
  const d = data.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.balance)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Balans afgelopen 30 dagen">
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#F2F2F2" strokeDasharray="2 4" opacity={0.35} />
      <text x="4" y="12" style={{ fontFamily: 'var(--sans)', fontSize: 13 }} fill="#8C8C8C">paradiso</text>
      <text x="4" y={H - 4} style={{ fontFamily: 'var(--sans)', fontSize: 13 }} fill="#8C8C8C">inferno</text>
      <path d={d} fill="none" stroke="#F2F2F2" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].balance)} r={4} fill="#0B0B0B" stroke="#F2F2F2" strokeWidth={2} />
    </svg>
  )
}

export default function Compass({ openShadow }: { openShadow: (sin?: SinId) => void }) {
  const s = useStore()
  const series = useMemo(() => computeSeries(s), [s])
  const [open, setOpen] = useState<SinId | null>(null)
  const [grens, setGrens] = useState(false)
  const ordered = [...SINS].sort((a, b) => series.perSin[a.id] - series.perSin[b.id])
  const weakest = ordered.find((x) => s.habits.some((h) => h.sin === x.id))
  const active = new Set(SINS.filter((x) => s.habits.some((h) => h.sin === x.id)).map((x) => x.id))
  const talks = (s.shadowLog ?? []).length
  const g = growthOf(s)

  return (
    <div className="screen">
      <div className="page-head">
        <div>
          <div className="eyebrow">Het kompas</div>
          <h1 className="h1">Je mandala</h1>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 8px 16px' }}>
        <Mandala values={series.perSin} active={active} onPick={setOpen} grens={g.month.length / MONTH_GOAL} rest={g.zone === 'rust'} />
        <div className="hstack" style={{ justifyContent: 'center', gap: 24, marginTop: 8 }}>
          <Legend kind="light" label="Wat je leeft" />
          <Legend kind="dark" label="Wat je schaduw vasthoudt" />
        </div>
        <button className="small center" style={{ display: 'block', width: '100%', marginTop: 8, padding: '4px 0' }} onClick={() => setGrens(true)}>
          Buitenring: je grens, {g.month.length} van {MONTH_GOAL} deze maand · <u>per plek</u>
        </button>
        <button className="hstack between" style={{ width: '100%', marginTop: 16, padding: '16px 8px 0', borderTop: '1px solid var(--line)' }} onClick={() => openShadow()}>
          <span className="small">{talks} {talks === 1 ? 'schaduwgesprek' : 'schaduwgesprekken'}</span>
          <span className="hstack" style={{ gap: 4, color: 'var(--ink)' }}>Nieuw gesprek {Icon.next()}</span>
        </button>
      </div>

      {/* Je zwakste terras als weg: links de zonde in het donker, rechts de deugd waar je heen gaat */}
      {weakest && series.perSin[weakest.id] < 0 && (
        <button className="card mt-16 path-card" onClick={() => setOpen(weakest.id)} aria-label={`Hier zit je schaduw het sterkst: ${weakest.sin}, op weg naar ${weakest.virtue}`}>
          <img className="from" src={weakest.sinImg} alt="" style={{ objectPosition: weakest.sinPos }} />
          <img className="to" src={weakest.virtueImg} alt="" style={{ objectPosition: weakest.virtuePos }} />
          <div className="txt">
            <div className="eyebrow">Hier zit je schaduw het sterkst</div>
            <div className="h2">{weakest.sin} <span style={{ color: 'var(--ink-3)' }}>→</span> {weakest.virtue}</div>
          </div>
        </button>
      )}

      <div className="group-title"><h2 className="h2">Koers</h2><span className="small">30 dagen</span></div>
      <div className="card" style={{ padding: '16px 12px' }}>
        <History points={series.points} />
      </div>

      <div className="group-title"><h2 className="h2">De terrassen</h2></div>
      <div className="list">
        {SINS.map((x) => {
          const v = series.perSin[x.id]
          const n = s.habits.filter((h) => h.sin === x.id).length
          return (
            <button key={x.id} className="row" onClick={() => setOpen(x.id)} style={{ alignItems: 'stretch', opacity: n ? 1 : 0.55 }}>
              <div className="grow stack gap-4">
                <div className="hstack between">
                  <span className="name" style={{ fontFamily: 'var(--title)', fontSize: 20, lineHeight: '28px', fontWeight: 400 }}>{x.numeral} · {x.virtue}</span>
                  <span className="small">{n ? `${v >= 0 ? '+' : ''}${v.toFixed(0)}` : 'geen gewoontes'}</span>
                </div>
                <RedLine value={v} compact />
              </div>
            </button>
          )
        })}
      </div>

      {grens && <GrensDetails onClose={() => setGrens(false)} />}
      {open && <SinSheet id={open} value={series.perSin[open]} onClose={() => setOpen(null)} onShadow={() => { const x = open; setOpen(null); openShadow(x) }} />}
    </div>
  )
}

function SinSheet({ id, value, onClose, onShadow }: { id: SinId; value: number; onClose: () => void; onShadow: () => void }) {
  const s = useStore()
  const meta = SIN_BY_ID[id]
  const hs = s.habits.filter((h) => h.sin === id)
  const notes = (s.notes ?? []).filter((n) => n.sin === id && !n.doneAt)
  const good = value >= 0
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="plate">
          <img className="engraving" src={good ? meta.virtueImg : meta.sinImg} alt={`Gustave Doré: ${good ? meta.virtue : meta.sin}`} style={{ aspectRatio: '16 / 9', objectPosition: good ? meta.virtuePos : meta.sinPos }} />
        </div>
        <div className="center stack gap-4">
          <div className="eyebrow">Terras {meta.numeral}</div>
          <h2 className="h1">{meta.sin} <span style={{ color: 'var(--ink-3)' }}>→</span> {meta.virtue}</h2>
          <div className="small">{meta.sinLatin} · {meta.virtueLatin}</div>
        </div>
        <RedLine value={value} compact />
        <div className="hstack between small" style={{ marginTop: -8 }}><span>{meta.sin}</span><span>{meta.virtue}</span></div>
        <p className="lead"><b>De zonde.</b> {meta.sinLine}</p>
        <p className="lead" style={{ marginTop: -8 }}><b>De deugd.</b> {meta.virtueLine}</p>
        <button className="btn ghost sm" onClick={onShadow}>Praat met je schaduw hierover</button>
        {notes.length > 0 && (
          <div className="stack gap-8">
            <div className="ornament">Op je spiegel</div>
            {notes.map((n) => <div key={n.id} className="postit"><div className="postit-text">{n.text}</div></div>)}
          </div>
        )}
        <div className="ornament">Jouw gewoontes</div>
        {hs.length ? (
          <div className="list">
            {hs.map((h) => (
              <div key={h.id} className="row" style={{ minHeight: 52 }}>
                <div className="grow">
                  <div className="name">{h.name}</div>
                  <div className="meta">{h.kind === 'vice' ? 'verleiding' : 'goede gewoonte'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="small center">Nog geen gewoontes op dit terras. Voeg ze toe onder Zelf.</p>
        )}
      </div>
    </Sheet>
  )
}

function Legend({ kind, label }: { kind: 'light' | 'dark'; label: string }) {
  return (
    <span className="hstack small" style={{ gap: 8 }}>
      <span style={{ width: 12, height: 12, borderRadius: 6, border: '1px solid var(--ink)', background: kind === 'light' ? 'var(--ink)' : 'var(--hatch)' }} />
      {label}
    </span>
  )
}
