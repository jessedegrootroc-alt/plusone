import { useState } from 'react'
import { GROUPS, POPULAR, VICES, VIRTUES, type GroupId, type HabitTemplate } from '../data/catalog'
import { Icon } from './ui'

const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/**
 * Snel kiezen uit de top 50: zoeken, of één tik op een plek in je leven en één tik op wat speelt.
 * Bovenaan staat wat de meeste mensen kiezen, zodat je vaak al klaar bent zonder te zoeken.
 */
export default function HabitPicker({ kind, isPicked, toggle }: { kind: 'vice' | 'virtue'; isPicked: (t: HabitTemplate) => boolean; toggle: (t: HabitTemplate) => void }) {
  const all = kind === 'vice' ? VICES : VIRTUES
  const [group, setGroup] = useState<GroupId | 'top'>('top')
  const [q, setQ] = useState('')
  const groups = GROUPS.filter((g) => all.some((t) => t.group === g.id))
  const list = q.trim()
    ? all.filter((t) => norm(`${t.name} ${GROUPS.find((g) => g.id === t.group)!.name}`).includes(norm(q.trim())))
    : group === 'top'
      ? POPULAR[kind].map((k) => all.find((t) => t.key === k)!)
      : all.filter((t) => t.group === group)
  const count = all.filter(isPicked).length

  return (
    <div className="stack gap-12">
      <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={kind === 'vice' ? 'Zoek, bijv. roken of gamen' : 'Zoek, bijv. sporten of lezen'} aria-label="Zoeken" />
      {!q.trim() && (
        <div className="seg" role="tablist">
          <button role="tab" aria-selected={group === 'top'} className={group === 'top' ? 'on' : ''} onClick={() => setGroup('top')}>Populair</button>
          {groups.map((g) => (
            <button key={g.id} role="tab" aria-selected={group === g.id} className={group === g.id ? 'on' : ''} onClick={() => setGroup(g.id)}>{g.name}</button>
          ))}
        </div>
      )}
      <div className="chips">
        {list.map((t) => {
          const on = isPicked(t)
          return (
            <button key={t.key} className={`chip ${on ? 'on' : ''}`} onClick={() => toggle(t)} aria-pressed={on}>
              {on && Icon.check('#0B0B0B')} {t.name}
            </button>
          )
        })}
        {!list.length && <div className="small">Niets gevonden. Maak het hieronder zelf.</div>}
      </div>
      <div className="small">{count ? `${count} gekozen` : 'Tik aan wat bij je past. Je kunt het later altijd aanpassen.'}</div>
    </div>
  )
}
