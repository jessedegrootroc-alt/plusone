import { useState } from 'react'
import { ROCK_SHORT } from '../data/catalog'
import { SINS } from '../data/sins'
import type { Habit } from '../lib/store'
import { uid } from '../lib/store'

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

      <div className="field">
        <label>{h.kind === 'vice' ? 'Welke zonde voedt dit?' : 'Welke deugd bouwt dit?'}</label>
        <div className="chips">
          {SINS.map((s) => (
            <button key={s.id} className={`chip ${h.sin === s.id ? 'on' : ''}`} onClick={() => set({ sin: s.id })}>
              {h.kind === 'vice' ? s.sin : s.virtue}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>{h.kind === 'virtue' ? 'Hoe groot is deze steen?' : 'Hoe zwaar weegt het?'}</label>
        <div className="seg">
          {(h.kind === 'virtue' ? ([3, 2, 1] as const) : ([1, 2, 3] as const)).map((w) => (
            <button key={w} className={h.weight === w ? 'on' : ''} onClick={() => set({ weight: w })}>
              {h.kind === 'virtue' ? ROCK_SHORT[w] : ['Licht', 'Middel', 'Zwaar'][w - 1]}
            </button>
          ))}
        </div>
        {h.kind === 'virtue' && <div className="small">Grote stenen maken of breken je dag en wegen het zwaarst in je balans.</div>}
      </div>

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
