import { useMemo, useState } from 'react'
import Plate from '../components/Plate'
import { Icon, Sheet } from '../components/ui'
import HabitPicker from '../components/HabitPicker'
import Pinboard from '../components/Pinboard'
import LivingScene from '../components/LivingScene'
import { pullingObjects, strongestVirtueObject } from '../data/objects'
import Trophies from '../components/Trophies'
import MirrorNotes from '../components/MirrorNotes'
import { scheduleLabel, wonStats } from '../lib/days'
import Account from '../components/Account'
import { enableMotion, motionOn, needsPermission } from '../lib/motion'
import { DEFAULT_TIMES, disableNotify, enableNotify, notifySupported, schedule } from '../lib/notify'
import { aimedFeatures, earnedFeatures } from '../lib/emblems'
import { IMG, SINS, stageFor, type SinId } from '../data/sins'
import { computeSeries } from '../lib/score'
import { fromTemplate, resetAll, update, useStore, type AvatarConfig, type Habit } from '../lib/store'
import Builder from './Builder'
import HabitEditor from './HabitEditor'
import { NEED_BY_ID, VOICES, type NeedId } from '../data/urge'
import { SHADOW } from '../data/shadow'

type Panel = null | { t: 'builder' } | { t: 'habit'; h?: Habit; kind: 'vice' | 'virtue' } | { t: 'catalog'; kind: 'vice' | 'virtue' } | { t: 'why' } | { t: 'reset' }

export default function Self({ openShadow }: { openShadow: () => void }) {
  const s = useStore()
  const series = useMemo(() => computeSeries(s), [s])
  const [panel, setPanel] = useState<Panel>(null)
  const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>(s.avatar)
  const close = () => setPanel(null)
  const [askMotion, setAskMotion] = useState(() => needsPermission() && !motionOn())

  // Wat de levende scènes nodig hebben, net als op Vandaag. Emblemen: nu wat je verdiende, je ideale zelf alles waar je naartoe werkt
  const earned = earnedFeatures(s)
  const aimed = aimedFeatures(s)
  const pulling = useMemo(() => pullingObjects(s), [s])
  const goodObject = useMemo(() => strongestVirtueObject(s), [s])
  const bySin = (dir: 1 | -1) => SINS.filter((x) => s.habits.some((h) => h.sin === x.id)).sort((a, b) => dir * (series.perSin[a.id] - series.perSin[b.id])).slice(0, 2).map((x) => x.id)
  const weakest = bySin(1)
  const strongest = bySin(-1)

  const virtues = s.habits.filter((h) => h.kind === 'virtue')
  const vices = s.habits.filter((h) => h.kind === 'vice')
  // De figuur klimt mee met je gewonnen dagen, net als op Vandaag
  const st = wonStats(s)
  const climb = st.counted ? -100 + 200 * (st.won / st.counted) : 0

  return (
    <div className="screen">
      <div className="page-head">
        <div>
          <div className="eyebrow">Je reis</div>
          <h1 className="h1">{s.name || 'Jij'}</h1>
        </div>
      </div>

      <Trophies />

      <div className="card mt-16" style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Dezelfde levende scènes als op Vandaag: waar je nu staat, en Paradiso als je ideale zelf */}
          <div className="stack gap-8">
            <div className="mini-scene" role="img" aria-label="Waar je nu staat op de berg">
              <LivingScene scene={stageFor(climb).scene} balance={climb} strong={strongest} features={earned} objects={pulling} virtueObject={goodObject} weak={weakest} />
            </div>
            <div className="caption">Nu</div>
          </div>
          <div className="stack gap-8">
            <div className="mini-scene" role="img" aria-label="Je ideale zelf: Paradiso">
              <LivingScene scene="paradiso" balance={100} strong={strongest} features={aimed} />
            </div>
            <div className="caption">Je ideale zelf</div>
          </div>
        </div>
        <p className="small center mt-16" style={{ margin: '16px 0 0' }}>{st.won} van de {st.counted} dagen gewonnen. Elke gewonnen dag klim je hoger.</p>
        <button className="btn soft sm mt-16" onClick={() => { setDraftAvatar(s.avatar); setPanel({ t: 'builder' }) }}>Je ideale zelf aanpassen</button>
      </div>

      {/* Je doelen, als post-its op de spiegel */}
      <MirrorNotes />

      <div className="group-title"><h2 className="h2">Waarom</h2><button className="link" onClick={() => setPanel({ t: 'why' })}>Wijzig</button></div>
      <div className="card" style={{ padding: '16px 16px' }}>
        <p className="italic" style={{ margin: 0 }}>{s.why || 'Nog niet ingevuld. Schrijf het voor de dag dat je het nodig hebt.'}</p>
      </div>

      <ShadowCard onOpen={openShadow} />
      <UrgePatterns />

      <Pinboard />

      <div className="group-title"><h2 className="h2">Goede gewoontes</h2><button className="link" onClick={() => setPanel({ t: 'catalog', kind: 'virtue' })}>Toevoegen</button></div>
      <HabitList list={virtues} onEdit={(h) => setPanel({ t: 'habit', h, kind: 'virtue' })} />
      <div className="group-title"><h2 className="h2">Verleidingen</h2><button className="link" onClick={() => setPanel({ t: 'catalog', kind: 'vice' })}>Toevoegen</button></div>
      <HabitList list={vices} onEdit={(h) => setPanel({ t: 'habit', h, kind: 'vice' })} />

      <Account />

      {/* Instellingen */}
      <div className="group-title"><h2 className="h2">Instellingen</h2></div>
      <div className="list">
        {askMotion && (
          <button className="row" onClick={async () => { if (await enableMotion()) setAskMotion(false) }}>
            <div className="grow"><div className="name">Laat je scène meebewegen</div><div className="meta">Kantel je telefoon en het beeld kantelt mee</div></div>
            <span className="pill">Aanzetten</span>
          </button>
        )}
        <button className="row" role="switch" aria-checked={!!s.settings?.showCompass} onClick={() => update((d) => { d.settings = { ...d.settings, showCompass: !d.settings?.showCompass } })}>
          <div className="grow"><div className="name">Toon kompas</div><div className="meta">De zeven zonden en deugden, als extra tab</div></div>
          <span className={`switch ${s.settings?.showCompass ? 'on' : ''}`} aria-hidden="true"><i /></span>
        </button>
        {notifySupported() && <NotifyRows />}
        <div className="row">
          <div className="grow"><div className="name">Je getuige</div><div className="meta">Krijgt op zondag je week, als jij hem stuurt</div></div>
          <input className="input witness-input" value={s.settings?.witness ?? ''} onChange={(e) => update((d) => { d.settings = { ...d.settings, witness: e.target.value || undefined } })} placeholder="Naam" aria-label="Naam van je getuige" />
        </div>
      </div>

      <div className="divider" />
      <button className="link center" style={{ display: 'block', margin: '12px auto 0' }} onClick={() => setPanel({ t: 'reset' })}>Opnieuw beginnen</button>

      {panel?.t === 'builder' && (
        <Sheet onClose={close}>
          <div className="hstack between" style={{ marginBottom: 12 }}><h2 className="h2">Je ideale zelf</h2><button className="link" onClick={close}>Annuleer</button></div>
          <Builder value={draftAvatar} onChange={setDraftAvatar} />
          <button className="btn mt-24" onClick={() => {
            update((d) => {
              d.avatar = draftAvatar
            })
            close()
          }}>Opslaan</button>
        </Sheet>
      )}

      {panel?.t === 'habit' && (
        <Sheet onClose={close}>
          <HabitEditor
            initial={panel.h}
            kind={panel.kind}
            onCancel={close}
            onSave={(h) => { update((d) => { const i = d.habits.findIndex((x) => x.id === h.id); if (i >= 0) d.habits[i] = h; else d.habits.push(h) }); close() }}
            onDelete={panel.h ? () => { update((d) => { d.habits = d.habits.filter((x) => x.id !== panel.h!.id) }); close() } : undefined}
          />
        </Sheet>
      )}

      {panel?.t === 'catalog' && (
        <Sheet onClose={close}>
          <div className="hstack between" style={{ marginBottom: 12 }}><h2 className="h2">{panel.kind === 'vice' ? 'Verleiding toevoegen' : 'Goede gewoonte toevoegen'}</h2><button className="link" onClick={close}>Klaar</button></div>
          <HabitPicker
            kind={panel.kind}
            isPicked={(t) => s.habits.some((h) => h.id.startsWith(t.key + '-'))}
            toggle={(t) => update((d) => {
              if (d.habits.some((h) => h.id.startsWith(t.key + '-'))) d.habits = d.habits.filter((h) => !h.id.startsWith(t.key + '-'))
              else d.habits.push(fromTemplate(t))
            })}
          />
          <button className="btn ghost mt-24" onClick={() => setPanel({ t: 'habit', kind: panel.kind })}>{Icon.plus()} Zelf iets maken</button>
        </Sheet>
      )}


      {panel?.t === 'why' && <WhySheet initial={s.why} onClose={close} />}


      {panel?.t === 'reset' && (
        <Sheet onClose={close}>
          <div className="stack gap-16">
            <h2 className="h2">Alles wissen en opnieuw beginnen?</h2>
            <p className="lead">Je gewoontes, geschiedenis, doelen en koektrommel verdwijnen van dit apparaat. Dit kan niet ongedaan worden.</p>
            <button className="btn redbtn" onClick={() => { resetAll(); close() }}>Ja, wis alles</button>
            <button className="btn ghost" onClick={close}>Nee, terug</button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

/** Wat je van je eigen drang-momenten kunt leren. Zelfkennis is de helft van de strategie. */
/** Je schaduw (Jung): niet wat je bent kwijtgeraakt, maar wat je nog niet leeft. */
function ShadowCard({ onOpen }: { onOpen: () => void }) {
  const s = useStore()
  const log = s.shadowLog ?? []
  const c = new Map<string, number>()
  log.forEach((e) => c.set(e.sin, (c.get(e.sin) ?? 0) + 1))
  const top = [...c.entries()].sort((a, b) => b[1] - a[1])[0]
  const gold = top ? SHADOW[top[0] as SinId].gold : null
  return (
    <button className="card mt-24" onClick={onOpen} style={{ display: 'grid', gridTemplateColumns: '76px 1fr', gap: 16, alignItems: 'center', padding: 16, width: '100%', textAlign: 'left' }}>
      <div style={{ position: 'relative' }}>
        <Plate src={IMG.shadow} />
      </div>
      <div className="stack gap-4">
        <div className="eyebrow">Je schaduw</div>
        <div className="h2">{gold ? `Vraagt vooral om ${gold.toLowerCase()}` : 'Wat zit er in jouw schaduw?'}</div>
        <div className="small">{log.length ? `${log.length} ${log.length === 1 ? 'gesprek' : 'gesprekken'} · tik voor een nieuw` : 'Tik om het eerste gesprek te beginnen'}</div>
      </div>
    </button>
  )
}

function UrgePatterns() {
  const s = useStore()
  const log = s.urgeLog ?? []
  if (!log.length) return null
  const top = <T extends string | number>(vals: T[]) => {
    const c = new Map<T, number>()
    vals.forEach((v) => c.set(v, (c.get(v) ?? 0) + 1))
    return [...c.entries()].sort((a, b) => b[1] - a[1])[0]
  }
  const done = log.filter((e) => e.outcome)
  const resisted = done.filter((e) => e.outcome === 'resisted').length
  const drops = log.filter((e) => e.before && e.after !== undefined).map((e) => e.before! - e.after!)
  const avgDrop = drops.length ? drops.reduce((a, b) => a + b, 0) / drops.length : null
  const part = (iso: string) => { const h = new Date(iso).getHours(); return h < 6 ? 'nacht' : h < 12 ? 'ochtend' : h < 18 ? 'middag' : 'avond' }
  const need = top(log.filter((e) => e.need).map((e) => e.need!))
  const when = top(log.map((e) => part(e.at)))
  const voice = top(log.filter((e) => e.voice !== undefined).map((e) => e.voice!))
  const rows: [string, string][] = [
    ['Doorstaan', done.length ? `${resisted} van ${done.length} keer` : 'nog niet'],
    ['Gemiddelde daling', avgDrop !== null ? `${avgDrop >= 0 ? '−' : '+'}${Math.abs(avgDrop).toFixed(1).replace('.', ',')} op 10` : 'nog niet'],
    ['Meestal eronder', need ? NEED_BY_ID[need[0] as NeedId].label : 'nog niet'],
    ['Meestal in de', when ? when[0] : 'nog niet'],
  ]
  return (
    <>
      <div className="group-title"><h2 className="h2">Je drang-patronen</h2><span className="small">{log.length} momenten</span></div>
      <div className="card" style={{ padding: '8px 16px' }}>
        {rows.map(([k, v]) => (
          <div key={k} className="hstack between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="small">{k}</span>
            <span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        {voice && <p className="italic" style={{ margin: '12px 0 8px', fontSize: 16, lineHeight: '24px'}}>De Schim zegt het vaakst: “{VOICES[voice[0]].says}”</p>}
      </div>
    </>
  )
}

function HabitList({ list, onEdit }: { list: Habit[]; onEdit: (h: Habit) => void }) {
  if (!list.length) return <div className="small" style={{ padding: '0 4px' }}>Nog niets.</div>
  return (
    <div className="list">
      {[...list].sort((a, b) => (a.kind === 'virtue' ? b.weight - a.weight : 0)).map((h) => {
        const detail = h.type === 'target' ? `min. ${h.amount} ${h.unit}` : h.type === 'limit' ? `max. ${h.amount} ${h.unit}` : h.type === 'avoid' ? 'vermijden' : scheduleLabel(h)
        return (
          <button key={h.id} className="row" onClick={() => onEdit(h)} style={{ minHeight: 56 }}>
            <div className="grow">
              <div className="name">{h.name}</div>
              <div className="meta">{h.kind === 'vice' ? `Verleiding · ${detail}` : `${h.weight === 3 ? 'Grote taak' : 'Taak'} · ${detail}`}</div>
            </div>
            <span style={{ color: 'var(--ink-3)', display: 'grid' }}>{Icon.next()}</span>
          </button>
        )
      })}
    </div>
  )
}

function WhySheet({ initial, onClose }: { initial: string; onClose: () => void }) {
  const [v, setV] = useState(initial)
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <h2 className="h2">Waarom wil je veranderen?</h2>
        <textarea className="textarea" autoFocus value={v} onChange={(e) => setV(e.target.value)} style={{ minHeight: 140 }} />
        <button className="btn" onClick={() => { update((d) => { d.why = v.trim() }); onClose() }}>Opslaan</button>
      </div>
    </Sheet>
  )
}


const NOTIFY_ROWS = [
  ['wake', 'Opstaan', 'Je weet waarom.'],
  ['close', 'Dag afsluiten', 'Tijd om je dag af te sluiten.'],
  ['bed', 'Naar boven', 'Telefoon beneden.'],
] as const

/** Herinneringen aan of uit, en de drie tijden. */
function NotifyRows() {
  const s = useStore()
  const n = s.settings?.notify
  const on = !!n?.on
  const setTime = (k: 'wake' | 'close' | 'bed', v: string) => {
    if (!v) return
    update((d) => { d.settings = { ...d.settings, notify: { ...DEFAULT_TIMES, on, ...d.settings?.notify, [k]: v } } })
    schedule()
  }
  return (
    <>
      <button className="row" role="switch" aria-checked={on} onClick={async () => { if (on) disableNotify(); else await enableNotify(); schedule() }}>
        <div className="grow"><div className="name">Herinneringen</div><div className="meta">{on ? 'Werkt als de app open of op de achtergrond staat' : 'Opstaan, je taken op hun tijd, dag afsluiten, naar boven'}</div></div>
        <span className={`switch ${on ? 'on' : ''}`} aria-hidden="true"><i /></span>
      </button>
      {on && NOTIFY_ROWS.map(([k, name, meta]) => (
        <label key={k} className="row">
          <div className="grow"><div className="name">{name}</div><div className="meta">{meta}</div></div>
          <input className="time-input" type="time" value={n?.[k] ?? DEFAULT_TIMES[k]} onChange={(e) => setTime(k, e.target.value)} aria-label={`Tijd voor ${name.toLowerCase()}`} />
        </label>
      ))}
    </>
  )
}
