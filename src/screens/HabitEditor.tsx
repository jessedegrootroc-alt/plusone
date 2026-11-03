import { useState } from 'react'
import { DAY_SHORT } from '../lib/days'
import type { Habit, Schedule } from '../lib/store'
import { uid } from '../lib/store'

const SCHEDULES: [Schedule['kind'], string][] = [['daily', 'Elke dag'], ['days', 'Vaste dagen'], ['week', 'Per week'], ['month', 'Per maand']]

interface Props {
  initial?: Habit
  kind: 'vice' | 'virtue'
  onSave: (h: Habit) => void
  onDelete?: () => void
  onCancel: () => void
}

/** Eén formulier voor nieuwe en bestaande gewoontes. */
export default function HabitEditor({ initial, kind, onSave, onDelete, onCancel }: Props) {
  const [h, setH] = useState<Habit>(
    initial ?? {
      id: 'custom-' + uid(),
      name: '',
      sin: kind === 'vice' ? 'sloth' : 'sloth',
      kind,
      type: kind === 'vice' ? 'avoid' : 'do',
      weight: 2,
    },
  )
  const set = (patch: Partial<Habit>) => setH((x) => ({ ...x, ...patch }))
  const sc: Schedule = h.schedule ?? { kind: 'daily' }
  const counted = h.type === 'target' || h.type === 'limit'
  const types: [Habit['type'], string][] = h.kind === 'vice'
    ? [['avoid', 'Helemaal niet'], ['limit', 'Maximaal …']]
    : [['do', 'Ja / nee'], ['target', 'Minimaal …'], ['limit', 'Maximaal …']]

  return (
    <div className="stack gap-16">
      <div className="hstack between">
        <h2 className="h2">{initial ? 'Gewoonte aanpassen' : h.kind === 'vice' ? 'Eigen verleiding' : 'Eigen goede gewoonte'}</h2>
        <button className="link" onClick={onCancel}>Annuleer</button>
      </div>

      <div className="field">
        <label htmlFor="hname">Naam</label>
        <input id="hname" className="input" autoFocus={!initial} value={h.name} placeholder={h.kind === 'vice' ? 'Bijv. YouTube na middernacht' : 'Bijv. 50 push-ups'} onChange={(e) => set({ name: e.target.value })} />
      </div>

      <div className="field">
        <label>Hoe meet je het?</label>
        <div className="chips">
          {types.map(([t, l]) => (
            <button key={t} className={`chip ${h.type === t ? 'on' : ''}`} onClick={() => set({ type: t, amount: t === 'limit' || t === 'target' ? h.amount ?? (t === 'limit' ? 0 : 1) : undefined, unit: h.unit ?? (t === 'limit' || t === 'target' ? 'keer' : undefined), step: h.step ?? 1 })}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {counted && (
        <div className="hstack gap-8" style={{ gap: 8 }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="hamt">{h.type === 'target' ? 'Doel' : 'Maximum'}</label>
            <input id="hamt" className="input" inputMode="numeric" value={h.amount ?? 0} onChange={(e) => set({ amount: Number(e.target.value.replace(/\D/g, '')) || 0 })} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="hunit">Eenheid</label>
            <input id="hunit" className="input" value={h.unit ?? ''} onChange={(e) => set({ unit: e.target.value })} />
          </div>
          <div className="field" style={{ width: 84 }}>
            <label htmlFor="hstep">Per tik</label>
            <input id="hstep" className="input" inputMode="numeric" value={h.step ?? 1} onChange={(e) => set({ step: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) })} />
          </div>
        </div>
      )}

      {h.kind === 'virtue' ? (
        <>
          <div className="field">
            <label>Hoe belangrijk?</label>
            <div className="seg">
              <button className={h.weight === 3 ? 'on' : ''} onClick={() => set({ weight: 3 })}>Grote taak</button>
              <button className={h.weight < 3 ? 'on' : ''} onClick={() => set({ weight: 2 })}>Gewone taak</button>
            </div>
            <div className="small">Alleen grote taken tellen voor een gewonnen dag.</div>
          </div>

          {/* Wanneer: elke dag, op vaste dagen, of een aantal keer per week of maand */}
          <div className="field">
            <label>Wanneer?</label>
            <div className="seg">
              {SCHEDULES.map(([k, l]) => (
                <button key={k} className={(sc.kind) === k ? 'on' : ''} onClick={() => set({ schedule: k === 'daily' ? undefined : k === 'days' ? { kind: 'days', days: [1, 3] } : { kind: k, times: 1 } })}>{l}</button>
              ))}
            </div>
            {sc.kind === 'days' && (
              <div className="day-pick" role="group" aria-label="Kies dagen">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const on = sc.days.includes(d)
                  return <button key={d} className={`chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => set({ schedule: { kind: 'days', days: on ? sc.days.filter((x) => x !== d) : [...sc.days, d] } })}>{DAY_SHORT[d]}</button>
                })}
              </div>
            )}
            {(sc.kind === 'week' || sc.kind === 'month') && (
              <div className="stepper-row">
                <button className="iconbtn step-btn" aria-label="Minder" onClick={() => set({ schedule: { kind: sc.kind, times: Math.max(1, sc.times - 1) } })}>−</button>
                <span className="lead" style={{ color: 'var(--ink)' }}>{sc.times} keer per {sc.kind === 'week' ? 'week' : 'maand'}</span>
                <button className="iconbtn step-btn" aria-label="Meer" onClick={() => set({ schedule: { kind: sc.kind, times: Math.min(sc.kind === 'week' ? 7 : 31, sc.times + 1) } })}>+</button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="field">
          <label>Hoe zwaar weegt het?</label>
          <div className="seg">
            {([1, 2, 3] as const).map((w) => (
              <button key={w} className={h.weight === w ? 'on' : ''} onClick={() => set({ weight: w })}>{['Licht', 'Middel', 'Zwaar'][w - 1]}</button>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label htmlFor="hcue">Als-dan-plan <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>(optioneel)</span></label>
        <input id="hcue" className="input" value={h.cue ?? ''} placeholder={h.kind === 'vice' ? 'Als ik drang voel, dan doe ik 20 push-ups' : 'Als ik koffie zet, dan doe ik mijn ademhaling'} onChange={(e) => set({ cue: e.target.value })} />
        <div className="small">Een concreet als-dan-plan maakt de kans veel groter dat je het op het moment zelf ook echt doet.</div>
      </div>

      <button className="btn" disabled={!h.name.trim()} onClick={() => onSave({ ...h, name: h.name.trim() })}>
        Opslaan
      </button>
      {onDelete && (
        <button className="btn ghost" onClick={onDelete}>
          Verwijderen
        </button>
      )}
    </div>
  )
}
