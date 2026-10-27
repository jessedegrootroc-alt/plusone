import { useMemo, useState } from 'react'
import Mandala from '../components/Mandala'
import Medallion from '../components/Medallion'
import ShadowPath from '../components/ShadowPath'
import { NoteSheet } from '../components/MirrorNotes'
import { GrensDetails } from '../components/Grens'
import { MONTH_GOAL, growthOf } from '../lib/growth'
import { Icon, RedLine, Sheet } from '../components/ui'
import { SINS, SIN_BY_ID, type SinId } from '../data/sins'
import { computeSeries, isDone } from '../lib/score'
import { addDays, todayISO, useStore } from '../lib/store'

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
  const [noteFor, setNoteFor] = useState<SinId | null>(null)
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
        <Mandala values={series.perSin} active={active} onPick={setOpen} />
        {/* De grens: hoe vaak je de afgelopen 30 dagen uit je comfortzone ging. Acht vakjes in vier weken van twee. */}
        <button className="grens-row" onClick={() => setGrens(true)} aria-label={`Uit je comfortzone: ${g.month.length} van ${MONTH_GOAL} grenzen verlegd in 30 dagen. Open per plek.`}>
          <img src="/art/item-pelgrimsstaf.webp" alt="" className="grens-icon" />
          <span className="grens-body">
            <span className="grens-title">Uit je comfortzone</span>
            <span className="grens-meter">
              <span className={`grens-pips ${g.zone === 'rust' ? 'rest' : ''}`} aria-hidden="true">
                {[0, 1, 2, 3].map((w) => <span key={w}>{[0, 1].map((j) => <i key={j} className={w * 2 + j < g.month.length ? 'on' : ''} />)}</span>)}
              </span>
              <b>{Math.min(g.month.length, MONTH_GOAL)}/{MONTH_GOAL}</b>
            </span>
            <span className="small">{g.zone === 'rust' ? 'Herstel: rust is nu ook training' : g.zone === 'comfort' ? 'Twee weken niets spannends. Tijd voor een grens' : 'Grenzen verlegd in 30 dagen. Twee per week is genoeg'}</span>
          </span>
          {Icon.next()}
        </button>
        <button className="hstack between" style={{ width: '100%', marginTop: 16, padding: '16px 8px 0', borderTop: '1px solid var(--line)' }} onClick={() => openShadow()}>
          <span className="small">{talks} {talks === 1 ? 'schaduwgesprek' : 'schaduwgesprekken'}</span>
          <span className="hstack" style={{ gap: 4, color: 'var(--ink)' }}>Nieuw gesprek {Icon.next()}</span>
        </button>
      </div>

      {/* Je zwakste terras als weg: links de zonde in het donker, rechts de deugd waar je heen gaat */}
      {weakest && series.perSin[weakest.id] < 0 && (
        <ShadowPath meta={weakest} onOpen={() => setOpen(weakest.id)} />
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
      {open && <SinSheet id={open} value={series.perSin[open]} before={series.points.length > 7 ? series.points[series.points.length - 8].perSin[open] : null} onClose={() => setOpen(null)} onShadow={() => { const x = open; setOpen(null); openShadow(x) }} onNote={() => { setNoteFor(open); setOpen(null) }} />}
      {noteFor && <NoteSheet presetSin={noteFor} onClose={() => setNoteFor(null)} />}
    </div>
  )
}

// De smoes die elke zonde je influistert, en wat Goggins terugzegt.
const SMOES: Record<SinId, [lie: string, answer: string]> = {
  pride: ['Ik weet het al.', 'Dan had je het al gedaan. Vraag vandaag om eerlijke feedback en verdedig je niet.'],
  envy: ['Zij hebben gewoon geluk.', 'Hun geluk is jouw probleem niet. Wat jij vandaag doet wel.'],
  wrath: ['Hij begon.', 'Het maakt niet uit wie begon. Jij bepaalt wat er nu gebeurt. Tel tot tien, dan pas praten.'],
  sloth: ['Morgen begin ik.', 'Morgen is de leugen die je al jaren vertelt. Vijf minuten, nu.'],
  greed: ['Ik heb het verdiend.', 'Verdiend is wat je doet als niemand kijkt, niet wat je koopt.'],
  gluttony: ['Eentje kan geen kwaad.', 'Het is nooit eentje. Kies wat je over een uur nog goed vindt.'],
  lust: ['Even kijken.', 'Even wordt een uur. Leg je telefoon nu in een andere kamer.'],
}

/**
 * Een terras door de ogen van Goggins: eerst de waarheid (wie wint er, en ga je vooruit of achteruit),
 * dan de smoes die je jezelf vertelt, dan het bewijs van de afgelopen week, en dan wat je nu doet.
 * Geen uitleg vooraf; wat de zonde is staat onderaan, voor wie het wil weten.
 */
function SinSheet({ id, value, before, onClose, onShadow, onNote }: { id: SinId; value: number; before: number | null; onClose: () => void; onShadow: () => void; onNote: () => void }) {
  const s = useStore()
  const meta = SIN_BY_ID[id]
  const hs = s.habits.filter((h) => h.sin === id)
  const notes = (s.notes ?? []).filter((n) => n.sin === id && !n.doneAt)
  const active = hs.length > 0
  const trend = before === null ? 0 : value - before
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayISO(), i - 6))
  const [lie, answer] = SMOES[id]
  const sinWins = active && value < -0.5
  const verdict = !active ? 'Hier meet je nog niets. Wat je niet meet, wint stilletjes.'
    : sinWins ? `${meta.sin} wint${trend < -2 ? ', en je zakt verder' : trend > 2 ? ', maar je klimt' : ''}.`
    : trend < -2 ? `${meta.virtue} wint, maar je zakt. Zo begint het.`
    : `${meta.virtue} wint. Niet tevreden worden.`

  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-24">
        <div className="stack gap-16" style={{ alignItems: 'center' }}>
          <Medallion id={id} value={value} active={active} />
          <div className="center stack gap-4">
            <div className="eyebrow">Terras {meta.numeral}</div>
            <h2 className="h1">{sinWins ? meta.sin : meta.virtue}</h2>
            <div className="terrace-score">
              {active && <span className="num">{value >= 0.5 ? '+' : value <= -0.5 ? '−' : ''}{Math.abs(Math.round(value))}</span>}
              {active && before !== null && Math.abs(trend) >= 1 && <span className={`trend ${trend > 0 ? 'up' : 'down'}`}>{trend > 0 ? '↑' : '↓'} {Math.abs(Math.round(trend))} deze week</span>}
            </div>
            <p className="lead" style={{ color: 'var(--ink)' }}>{verdict}</p>
          </div>
        </div>

        {/* De smoes: wat de zonde je influistert, en het antwoord */}
        <div className="smoes">
          <div className="eyebrow">De smoes</div>
          <p className="smoes-lie">“{lie}”</p>
          <p className="lead">{answer}</p>
        </div>

        {/* Het bewijs: geen gevoel, maar wat je deed */}
        <div className="stack gap-12">
          <div className="section-head" style={{ margin: 0 }}><h3 className="h2">Het bewijs</h3><span className="small">7 dagen</span></div>
          {active ? (
            <div className="list">
              {hs.map((h) => {
                const vals = days.map((d) => s.logs[d]?.v[h.id])
                const won = vals.filter((v, i) => v !== undefined && isDone(h, v) && days[i] <= todayISO()).length
                return (
                  <div key={h.id} className="row proof">
                    <div className="grow">
                      <div className="name">{h.name}</div>
                      <div className="meta">{h.kind === 'vice' ? 'weerstaan' : 'gedaan'} · {won} van 7</div>
                    </div>
                    <span className="proof-days" aria-hidden="true">
                      {vals.map((v, i) => <i key={i} className={v === undefined ? '' : isDone(h, v) ? 'won' : 'lost'} />)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="small" style={{ margin: 0 }}>Nog geen gewoontes op dit terras. Voeg er een toe onder Reis, dan zie je hier elke dag wat je deed.</p>
          )}
        </div>

        {notes.length > 0 && (
          <div className="stack gap-12">
            <div className="section-head" style={{ margin: 0 }}><h3 className="h2">Op je spiegel</h3></div>
            {notes.map((n) => <div key={n.id} className="postit"><div className="postit-text">{n.text}</div></div>)}
          </div>
        )}

        {/* Wat je nu doet */}
        <div className="stack gap-12">
          <button className="btn" onClick={onNote}>Zet het op je spiegel</button>
          <button className="btn ghost" onClick={onShadow}>Praat met je schaduw</button>
        </div>

        <div className="stack gap-8 small" style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <span><b style={{ color: 'var(--ink-2)' }}>{meta.sin}:</b> {meta.sinLine}</span>
          <span><b style={{ color: 'var(--ink-2)' }}>{meta.virtue}:</b> {meta.virtueLine}</span>
        </div>
      </div>
    </Sheet>
  )
}
