import { useState } from 'react'
import Plate from '../components/Plate'
import { Icon, Sheet } from '../components/ui'
import HabitPicker from '../components/HabitPicker'
import Pinboard from '../components/Pinboard'
import SceneCompare from '../components/SceneCompare'
import Trophies from '../components/Trophies'
import { scheduleLabel } from '../lib/days'
import Account from '../components/Account'
import { enableMotion, motionOn, needsPermission } from '../lib/motion'
import { DEFAULT_TIMES, disableNotify, enableNotify, notifySupported, schedule } from '../lib/notify'
import { setWakeTime, wakeTime } from '../lib/wake'
import { TIERS, tierInfo, tierOf } from '../lib/tier'
import { RESERVES } from '../lib/days'
import { IMG, type SinId } from '../data/sins'
import { fromTemplate, resetAll, update, useStore, type Habit } from '../lib/store'
import HabitEditor from './HabitEditor'
import { NEED_BY_ID, VOICES, type NeedId } from '../data/urge'
import { SHADOW } from '../data/shadow'
import { FEATURES, FEATURE_ART, type FeatureId } from '../data/catalog'
import { aimedFeatures, earnedFeatures } from '../lib/emblems'

type Panel = null | { t: 'settings' } | { t: 'emblem'; id: FeatureId } | { t: 'habit'; h?: Habit; kind: 'vice' | 'virtue' } | { t: 'catalog'; kind: 'vice' | 'virtue' } | { t: 'why' } | { t: 'reset' }

export default function Self({ openShadow }: { openShadow: () => void }) {
  const s = useStore()
  const [panel, setPanel] = useState<Panel>(null)
  const close = () => setPanel(null)
  // Gewoontes, verleidingen en opnieuw beginnen open je vanuit de instellingen: sluiten brengt je daar terug
  const back = () => setPanel({ t: 'settings' })
  const [askMotion, setAskMotion] = useState(() => needsPermission() && !motionOn())

  // Wat de levende scènes nodig hebben, net als op Vandaag. Emblemen: nu wat je verdiende, je ideale zelf alles waar je naartoe werkt

  const virtues = s.habits.filter((h) => h.kind === 'virtue')
  const vices = s.habits.filter((h) => h.kind === 'vice')

  return (
    <div className="screen">
      <div className="page-head">
        <div>
          <div className="eyebrow">Je reis</div>
          <h1 className="h1">{s.name || 'Jij'}</h1>
        </div>
        <button className="iconbtn gear" onClick={() => setPanel({ t: 'settings' })} aria-label="Instellingen">{Icon.settings()}</button>
      </div>

      {/* Goggins' koektrommel (Can't Hurt Me, opdracht 6): geen prijzenkast maar je energiebank voor als het zwaar wordt.
          Daarom het eerste op je reis, nog voor de tellers. */}
      <Pinboard compact />
      <div className="mt-24"><Trophies /></div>
      <Emblems onOpen={(id) => setPanel({ t: 'emblem', id })} />

      <div className="mt-24">
        <SceneCompare />
      </div>

      <div className="group-title"><h2 className="h2">Waarom</h2><button className="link" onClick={() => setPanel({ t: 'why' })}>Wijzig</button></div>
      <div className="card" style={{ padding: '16px 16px' }}>
        <p className="italic" style={{ margin: 0 }}>{s.why || 'Nog niet ingevuld. Schrijf het voor de dag dat je het nodig hebt.'}</p>
      </div>

      <ShadowCard onOpen={openShadow} />
      <UrgePatterns />


      {panel?.t === 'settings' && (
        <Sheet onClose={close}>
          <div className="hstack between"><h2 className="h1">Instellingen</h2><button className="link" onClick={close}>Klaar</button></div>
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
              {/* Je niveau: hoeveel taken, hoeveel vangnet, welke toon */}
              <div className="row tier-row">
                <div className="grow"><div className="name">Niveau</div><div className="meta">{tierInfo(tierOf(s)).sub} {tierInfo(tierOf(s)).streak}{RESERVES[tierOf(s)] ? ` ${RESERVES[tierOf(s)]} reservedagen per maand.` : ''}</div></div>
                <div className="seg" role="radiogroup" aria-label="Je niveau">
                  {TIERS.map((t) => <button key={t.id} role="radio" aria-checked={tierOf(s) === t.id} className={tierOf(s) === t.id ? 'on' : ''} onClick={() => update((d) => { d.settings = { ...d.settings, tier: t.id } })}>{t.label}</button>)}
                </div>
              </div>
              {/* Je opstaantijd staat er altijd, ook zonder meldingen: je grote taak loopt mee */}
              <label className="row">
                <div className="grow"><div className="name">Opstaan</div><div className="meta">Eerder op dan de rest. Je grote taak loopt mee.</div></div>
                <input className="time-input" type="time" value={wakeTime(s)} onChange={(e) => { if (e.target.value) update((d) => setWakeTime(d, e.target.value)) }} aria-label="Tijd voor opstaan" />
              </label>
              {notifySupported() && <NotifyRows />}
              <div className="row">
                <div className="grow"><div className="name">Je getuige</div><div className="meta">Krijgt op zondag je week, als jij hem stuurt</div></div>
                <input className="input witness-input" value={s.settings?.witness ?? ''} onChange={(e) => update((d) => { d.settings = { ...d.settings, witness: e.target.value || undefined } })} placeholder="Naam" aria-label="Naam van je getuige" />
              </div>
            </div>

            <button className="link center" style={{ display: 'block', margin: '32px auto 8px' }} onClick={() => setPanel({ t: 'reset' })}>Opnieuw beginnen</button>
        </Sheet>
      )}

      {panel?.t === 'emblem' && <EmblemSheet id={panel.id} onClose={close} />}

      {panel?.t === 'habit' && (
        <Sheet onClose={back}>
          <HabitEditor
            initial={panel.h}
            kind={panel.kind}
            onCancel={back}
            onSave={(h) => { update((d) => { const i = d.habits.findIndex((x) => x.id === h.id); if (i >= 0) d.habits[i] = h; else d.habits.push(h) }); back() }}
            onDelete={panel.h ? () => { update((d) => { d.habits = d.habits.filter((x) => x.id !== panel.h!.id) }); back() } : undefined}
          />
        </Sheet>
      )}

      {panel?.t === 'catalog' && (
        <Sheet onClose={back}>
          <div className="hstack between" style={{ marginBottom: 12 }}><h2 className="h2">{panel.kind === 'vice' ? 'Verleiding toevoegen' : 'Goede gewoonte toevoegen'}</h2><button className="link" onClick={back}>Klaar</button></div>
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
        <Sheet onClose={back}>
          <div className="stack gap-16">
            <h2 className="h2">Alles wissen en opnieuw beginnen?</h2>
            <p className="lead">Je gewoontes, geschiedenis, doelen en koektrommel verdwijnen van dit apparaat. Dit kan niet ongedaan worden.</p>
            <button className="btn redbtn" onClick={() => { resetAll(); close() }}>Ja, wis alles</button>
            <button className="btn ghost" onClick={back}>Nee, terug</button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

/**
 * Je prestaties: de emblemen waar je naartoe werkt, als rij (Headway, Gentler Streak).
 * Behaald staat helder met een ring, nog te halen staat grijs. Zo zie je wat je hebt en wat er nog komt.
 */
function Emblems({ onOpen }: { onOpen: (id: FeatureId) => void }) {
  const s = useStore()
  const earned = earnedFeatures(s)
  const list = [...earned, ...aimedFeatures(s).filter((f) => !earned.includes(f))]
  if (!list.length) return null
  return (
    <section className="emblems">
      <div className="section-head"><h2 className="h2">Je prestaties</h2><span className="small">{earned.length} van {list.length}</span></div>
      <div className="emblem-row">
        {list.map((id) => {
          const on = earned.includes(id)
          const f = FEATURES.find((x) => x.id === id)!
          return (
            <button key={id} className={`emblem ${on ? 'on' : ''}`} onClick={() => onOpen(id)} aria-label={`${f.name}, ${on ? 'behaald' : 'nog te halen'}`}>
              <span className="emblem-disc"><img src={`/art/${FEATURE_ART[id]}.webp`} alt="" /></span>
              <span className="emblem-name">{f.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

/** Eén embleem: wat het betekent, en of je het al hebt of waar je eraan werkt. */
function EmblemSheet({ id, onClose }: { id: FeatureId; onClose: () => void }) {
  const s = useStore()
  const f = FEATURES.find((x) => x.id === id)!
  const notes = (s.notes ?? []).filter((n) => n.feature === id)
  const won = notes.find((n) => n.doneAt)
  const open = notes.find((n) => !n.doneAt)
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16 emblem-sheet">
        <span className={`emblem-disc big ${won ? 'on' : ''}`}><img src={`/art/${FEATURE_ART[id]}.webp`} alt="" /></span>
        <div className="stack gap-4 center">
          <h2 className="h1">{f.name}</h2>
          <p className="small" style={{ margin: 0 }}>{f.meaning}</p>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="eyebrow">{won ? 'Behaald' : open ? 'Je werkt eraan' : 'Nog te halen'}</div>
          <p style={{ margin: '4px 0 0' }}>{won ? won.goal || won.text : open ? open.goal || open.text : 'Schrijf een post-it voor je spiegel met dit embleem als beloning.'}</p>
        </div>
        <button className="btn ghost" onClick={onClose}>Sluiten</button>
      </div>
    </Sheet>
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
  ['close', 'Dag afsluiten', 'Tijd om je dag af te sluiten.'],
  ['bed', 'Naar boven', 'Telefoon beneden.'],
] as const

/** Herinneringen aan of uit, en de drie tijden. */
function NotifyRows() {
  const s = useStore()
  const n = s.settings?.notify
  const on = !!n?.on
  const setTime = (k: 'close' | 'bed', v: string) => {
    if (!v) return
    update((d) => { d.settings = { ...d.settings, notify: { ...DEFAULT_TIMES, on, ...d.settings?.notify, [k]: v } } })
    schedule()
  }
  return (
    <>
      <button className="row" role="switch" aria-checked={on} onClick={async () => { if (on) disableNotify(); else await enableNotify(); schedule() }}>
        <div className="grow"><div className="name">Herinneringen</div><div className="meta">{on ? 'Werkt als de app open of op de achtergrond staat. Het getal op je app-icoon: wat vandaag nog open staat.' : 'Opstaan, je taken op hun tijd, dag afsluiten, naar boven. En een getal op je app-icoon.'}</div></div>
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
