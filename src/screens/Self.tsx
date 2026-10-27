import { useMemo, useState } from 'react'
import Plate, { StagePlate } from '../components/Plate'
import { Icon, Sheet, useTween } from '../components/ui'
import { FEATURES, ROCK } from '../data/catalog'
import HabitPicker from '../components/HabitPicker'
import { IMG, SIN_BY_ID, STAGES, stageFor, type SinId } from '../data/sins'
import { computeSeries, mirrorStreak } from '../lib/score'
import { fromTemplate, resetAll, uid, update, useStore, type AvatarConfig, type Habit } from '../lib/store'
import Builder from './Builder'
import HabitEditor from './HabitEditor'
import { NEED_BY_ID, VOICES, type NeedId } from '../data/urge'
import { SHADOW } from '../data/shadow'

type Panel = null | { t: 'builder' } | { t: 'habit'; h?: Habit; kind: 'vice' | 'virtue' } | { t: 'catalog'; kind: 'vice' | 'virtue' } | { t: 'preview' } | { t: 'why' } | { t: 'goal'; id?: string } | { t: 'reset' }

export default function Self({ openShadow }: { openShadow: () => void }) {
  const s = useStore()
  const series = useMemo(() => computeSeries(s), [s])
  const [panel, setPanel] = useState<Panel>(null)
  const [draftAvatar, setDraftAvatar] = useState<AvatarConfig>(s.avatar)
  const [jarText, setJarText] = useState('')
  const close = () => setPanel(null)

  const virtues = s.habits.filter((h) => h.kind === 'virtue')
  const vices = s.habits.filter((h) => h.kind === 'vice')
  const gap = 100 - series.balance

  return (
    <div className="screen">
      <div className="page-head">
        <div>
          <div className="eyebrow">Zelf</div>
          <h1 className="h1">{s.name || 'Jij'}</h1>
        </div>
      </div>

      {/* Zoals het profiel van Headspace: drie getallen in één oogopslag */}
      <div className="stats">
        <div className="stat"><span className="num">{mirrorStreak(s)}</span><span className="small">dagen gespiegeld</span></div>
        <div className="stat"><span className="num">{s.jar.length}</span><span className="small">overwinningen</span></div>
        <div className="stat"><span className="num">{(s.growth ?? []).filter((c) => c.status === 'gedaan').length}</span><span className="small">grenzen verlegd</span></div>
      </div>

      <div className="card mt-16" style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="stack gap-8">
            <StagePlate balance={series.balance} />
            <div className="caption">Nu · {stageFor(series.balance).name}</div>
          </div>
          <div className="stack gap-8">
            <Plate src={IMG.knight} alt="Gustave Doré: de hemelse ridder" />
            <div className="caption">Je ideale zelf</div>
          </div>
        </div>
        <p className="small center mt-16" style={{ margin: '16px 0 0' }}>
          Nog {gap.toFixed(0)} punten tot je ideale zelf. Bij een goede dag kruip je er zo’n {(gap * 0.15).toFixed(1).replace('.', ',')} dichterbij.
        </p>
        <div className="hstack gap-8 mt-16" style={{ gap: 8 }}>
          <button className="btn soft sm" onClick={() => { setDraftAvatar(s.avatar); setPanel({ t: 'builder' }) }}>Aanpassen</button>
          <button className="btn soft sm" onClick={() => setPanel({ t: 'preview' })}>Bekijk de reis</button>
        </div>
      </div>

      <div className="group-title"><h2 className="h2">Waarom</h2><button className="link" onClick={() => setPanel({ t: 'why' })}>Wijzig</button></div>
      <div className="card" style={{ padding: '16px 16px' }}>
        <p className="italic" style={{ margin: 0 }}>{s.why || 'Nog niet ingevuld. Schrijf het voor de dag dat je het nodig hebt.'}</p>
      </div>

      <div className="group-title"><h2 className="h2">Doelen</h2><button className="link" onClick={() => setPanel({ t: 'goal' })}>Nieuw</button></div>
      <div className="list">
        {s.goals.length === 0 && <div className="small">Kies kenmerken voor je ideale zelf en geef ze een doel.</div>}
        {s.goals.map((g) => {
          const f = FEATURES.find((x) => x.id === g.feature)!
          return (
            <div key={g.id} className={`row ${g.done ? 'done' : ''}`}>
              <button className="grow" style={{ textAlign: 'left' }} onClick={() => setPanel({ t: 'goal', id: g.id })}>
                <div className="name" style={{ textDecoration: g.done ? 'line-through' : undefined }}>{g.text}</div>
                <div className="meta">{f.name}</div>
              </button>
              <button className={`check ${g.done ? 'on' : ''}`} aria-label="Behaald" onClick={() => update((d) => { const x = d.goals.find((y) => y.id === g.id)!; x.done = !x.done })}>
                {g.done && Icon.check('#0B0B0B')}
              </button>
            </div>
          )
        })}
      </div>

      <ShadowCard onOpen={openShadow} />
      <UrgePatterns />

      <div className="group-title"><h2 className="h2">Koektrommel</h2><span className="small">{s.jar.length} overwinningen</span></div>
      <p className="small" style={{ margin: '-4px 4px 8px' }}>Bewijs dat je zwaardere dingen hebt doorstaan. Voor de dagen dat je het vergeet.</p>
      <div className="hstack gap-8" style={{ gap: 8 }}>
        <input className="input" value={jarText} onChange={(e) => setJarText(e.target.value)} placeholder="Een overwinning, groot of klein" onKeyDown={(e) => { if (e.key === 'Enter' && jarText.trim()) { update((d) => { d.jar.unshift({ id: uid(), text: jarText.trim(), date: new Date().toISOString().slice(0, 10) }) }); setJarText('') } }} />
        <button className="iconbtn" style={{ background: 'var(--ink)', color: 'var(--paper)', flex: 'none', width: 52, height: 52, borderRadius: 16 }} aria-label="Toevoegen" disabled={!jarText.trim()} onClick={() => { update((d) => { d.jar.unshift({ id: uid(), text: jarText.trim(), date: new Date().toISOString().slice(0, 10) }) }); setJarText('') }}>{Icon.plus()}</button>
      </div>
      <div className="list mt-8">
        {s.jar.slice(0, 6).map((j) => (
          <div key={j.id} className="row" style={{ minHeight: 52 }}>
            <div className="grow"><div className="name">{j.text}</div><div className="meta">{new Date(j.date + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</div></div>
          </div>
        ))}
      </div>

      <div className="group-title"><h2 className="h2">Goede gewoontes</h2><button className="link" onClick={() => setPanel({ t: 'catalog', kind: 'virtue' })}>Toevoegen</button></div>
      <HabitList list={virtues} onEdit={(h) => setPanel({ t: 'habit', h, kind: 'virtue' })} />
      <div className="group-title"><h2 className="h2">Verleidingen</h2><button className="link" onClick={() => setPanel({ t: 'catalog', kind: 'vice' })}>Toevoegen</button></div>
      <HabitList list={vices} onEdit={(h) => setPanel({ t: 'habit', h, kind: 'vice' })} />

      <div className="divider" />
      <p className="small center">Illustraties: Gustave Doré (1832–1883) voor Dantes <i>Divina Commedia</i>. Publiek domein, via Wikimedia Commons. Je gegevens blijven op dit apparaat.</p>
      <button className="link center" style={{ display: 'block', margin: '12px auto 0' }} onClick={() => setPanel({ t: 'reset' })}>Opnieuw beginnen</button>

      {panel?.t === 'builder' && (
        <Sheet onClose={close}>
          <div className="hstack between" style={{ marginBottom: 12 }}><h2 className="h2">Je ideale zelf</h2><button className="link" onClick={close}>Annuleer</button></div>
          <Builder value={draftAvatar} onChange={setDraftAvatar} />
          <button className="btn mt-24" onClick={() => {
            update((d) => {
              d.avatar = draftAvatar
              for (const f of draftAvatar.features) if (!d.goals.some((g) => g.feature === f)) d.goals.push({ id: uid(), feature: f, text: FEATURES.find((x) => x.id === f)!.meaning })
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

      {panel?.t === 'preview' && <JourneySheet onClose={close} />}

      {panel?.t === 'why' && <WhySheet initial={s.why} onClose={close} />}

      {panel?.t === 'goal' && <GoalSheet id={panel.id} onClose={close} />}

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
        <Plate src={IMG.shadow} alt="" />
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
        const sin = SIN_BY_ID[h.sin]
        const detail = h.type === 'target' ? `min. ${h.amount} ${h.unit}` : h.type === 'limit' ? `max. ${h.amount} ${h.unit}` : h.type === 'avoid' ? 'vermijden' : 'dagelijks'
        return (
          <button key={h.id} className="row" onClick={() => onEdit(h)} style={{ minHeight: 56 }}>
            <div className="grow">
              <div className="name">{h.name}</div>
              <div className="meta">{h.kind === 'vice' ? `${sin.sin} · ${detail} · ${['licht', 'middel', 'zwaar'][h.weight - 1]}` : `${ROCK[h.weight]} · ${sin.virtue} · ${detail}`}</div>
            </div>
            <span style={{ color: 'var(--ink-3)', display: 'grid' }}>{Icon.next()}</span>
          </button>
        )
      })}
    </div>
  )
}

function JourneySheet({ onClose }: { onClose: () => void }) {
  const [b, setB] = useState(0)
  const tb = useTween(b, 500)
  const st = stageFor(b)
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <div className="center stack gap-4">
          <div className="eyebrow">De vijf platen</div>
          <h2 className="h2">Waar je heen kunt, beide kanten op.</h2>
        </div>
        <StagePlate balance={tb} style={{ width: '72%', margin: '0 auto' }} />
        <div className="caption">Plaat {st.plate} · {st.name} · {st.place}</div>
        <p className="italic center" style={{ margin: 0, fontSize: 16, lineHeight: '24px'}}>{st.line}</p>
        <input type="range" min={-100} max={100} value={b} onChange={(e) => setB(Number(e.target.value))} style={{ width: '100%', accentColor: '#F2F2F2' }} aria-label="Balans" />
        <div className="hstack between" style={{ gap: 4 }}>
          {STAGES.map((x, i) => {
            const v = i === 0 ? -100 : i === STAGES.length - 1 ? 100 : Math.round((x.min + (STAGES[i + 1]?.min ?? 100)) / 2)
            return <button key={x.plate} className={`chip ${st.plate === x.plate ? 'on' : ''}`} style={{ padding: '8px 8px', minHeight: 34, fontSize: 13, lineHeight: '20px'}} onClick={() => setB(v)}>{x.plate}</button>
          })}
        </div>
      </div>
    </Sheet>
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

function GoalSheet({ id, onClose }: { id?: string; onClose: () => void }) {
  const s = useStore()
  const g = s.goals.find((x) => x.id === id)
  const [text, setText] = useState(g?.text ?? '')
  const [feature, setFeature] = useState(g?.feature ?? FEATURES[0].id)
  const meta = FEATURES.find((x) => x.id === feature)!
  return (
    <Sheet onClose={onClose}>
      <div className="stack gap-16">
        <h2 className="h2">{g ? 'Doel aanpassen' : 'Nieuw doel'}</h2>
        <div className="chips">
          {FEATURES.map((f) => <button key={f.id} className={`chip ${feature === f.id ? 'on' : ''}`} onClick={() => setFeature(f.id)}>{f.name}</button>)}
        </div>
        <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={meta.placeholder} />
        <button className="btn" disabled={!text.trim()} onClick={() => {
          update((d) => {
            if (g) Object.assign(d.goals.find((x) => x.id === g.id)!, { text: text.trim(), feature })
            else d.goals.push({ id: uid(), text: text.trim(), feature })
            if (!d.avatar.features.includes(feature)) d.avatar.features.push(feature)
          })
          onClose()
        }}>Opslaan</button>
        {g && <button className="btn ghost" onClick={() => { update((d) => { d.goals = d.goals.filter((x) => x.id !== g.id) }); onClose() }}>Verwijderen</button>}
      </div>
    </Sheet>
  )
}
