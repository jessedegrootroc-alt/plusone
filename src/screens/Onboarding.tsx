import { useState } from 'react'
import Plate from '../components/Plate'
import { HoldButton, Icon, Sheet, fmt } from '../components/ui'
import { type HabitTemplate } from '../data/catalog'
import { IMG, doreAlt } from '../data/sins'
import { buzz, fromTemplate, todayISO, update, type Habit } from '../lib/store'
import { noteFromGoal } from '../lib/emblems'
import { scheduleLabel } from '../lib/days'
import { needsDate } from '../lib/goal'
import { enableNotify, notifySupported } from '../lib/notify'
import { defaultHabits } from '../lib/schema'
import HabitEditor from './HabitEditor'
import HabitPicker from '../components/HabitPicker'
import { scrollToTop } from '../lib/scroll'

// De splash, en dan vier stappen: (1) naam en waarom, (2) verleidingen, (3) gewoontes, grote taken en je doel, (4) het contract.
const STEPS = 5

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [why, setWhy] = useState('')
  // Het standaardschema staat al klaar; je haalt weg wat niet klopt
  const [picked, setPicked] = useState<Record<string, Habit>>(() => Object.fromEntries(defaultHabits().map((h) => [h.id, h])))
  const [custom, setCustom] = useState<null | 'vice' | 'virtue'>(null)
  const [goalText, setGoalText] = useState('12-uursloop')
  const [goalDue, setGoalDue] = useState('')
  const [notifyAsked, setNotifyAsked] = useState<null | boolean>(null)

  const next = () => { buzz(); setStep((s) => Math.min(STEPS - 1, s + 1)); scrollToTop() }
  const back = () => { setStep((s) => Math.max(0, s - 1)); scrollToTop() }

  const toggle = (t: HabitTemplate) => {
    buzz()
    setPicked((p) => {
      const n = { ...p }
      if (n[t.key]) delete n[t.key]
      else n[t.key] = fromTemplate(t)
      return n
    })
  }
  const setAmount = (key: string, amount: number) => setPicked((p) => ({ ...p, [key]: { ...p[key], amount: Math.max(0, amount) } }))
  const remove = (id: string) => setPicked((p) => { const n = { ...p }; delete n[Object.keys(p).find((k) => p[k].id === id)!]; return n })
  const setBig = (id: string, big: boolean) => setPicked((p) => { const k = Object.keys(p).find((x) => p[x].id === id)!; return { ...p, [k]: { ...p[k], weight: big ? 3 : 2 } } })

  const vices = Object.values(picked).filter((h) => h.kind === 'vice')
  const virtues = Object.values(picked).filter((h) => h.kind === 'virtue')
  const bigCount = virtues.filter((h) => h.weight === 3).length
  const dateNeeded = needsDate('medal', goalText)

  const finish = () => {
    const goal = goalText.trim() ? { ...noteFromGoal({ feature: needsDate(undefined, goalText) ? 'medal' : 'laurel', text: goalText.trim() }), due: goalDue || undefined } : null
    update((d) => {
      d.name = name.trim()
      d.why = why.trim()
      d.habits = Object.values(picked)
      d.notes = goal ? [goal] : []
      d.mainGoalId = goal?.id
      d.createdAt = todayISO()
      d.onboarded = true
      d.asked = { ...d.asked, schema: true }
    })
  }

  // Splash
  if (step === 0) {
    return (
      <div className="hero-img" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#0B0B0B' }}>
        <img src={IMG.forest} alt={doreAlt(IMG.forest)} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '109%', objectPosition: 'center top' }} />
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', padding: '0 24px calc(env(safe-area-inset-bottom) + 32px)', color: '#F7F7F5', animation: 'fadeUp .8s var(--ease) both' }}>
          <h1 className="display">PlusOne</h1>
          <p className="lead" style={{ color: 'rgba(247, 247, 245, .85)', marginTop: 8 }}>Elke dag één keuze. Omhoog of omlaag.</p>
          <button className="btn light mt-32" onClick={next}>Begin</button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ paddingBottom: 140 }}>
      <div className="hstack between" style={{ marginBottom: 24, gap: 12 }}>
        <button className="iconbtn" onClick={back} aria-label="Terug" style={{ marginLeft: -8 }}>{Icon.back()}</button>
        <div className="progress" style={{ flex: 1 }}>
          {Array.from({ length: STEPS - 1 }).map((_, i) => <i key={i} className={i < step ? 'on' : ''} />)}
        </div>
        <div className="small" style={{ width: 40, textAlign: 'right' }}>{step} / {STEPS - 1}</div>
      </div>

      <div key={step} style={{ animation: 'fadeUp .45s var(--ease) both' }}>
        {/* 1 · Naam en waarom, met in drie regels hoe het werkt */}
        {step === 1 && (
          <div className="stack gap-24">
            <div className="stack gap-8">
              <h1 className="h1">Hoe het werkt</h1>
              <p className="lead">Elke dag weeg je je goede gewoontes tegen je verleidingen.</p>
              <p className="lead">Doe je je grote taken? Dan is de dag gewonnen.</p>
              <p className="lead">Mis nooit twee keer.</p>
            </div>
            <div className="field">
              <label htmlFor="nm">Hoe heet je?</label>
              <input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Je voornaam" autoComplete="given-name" />
            </div>
            <div className="field">
              <label htmlFor="why">Waarom wil je veranderen?</label>
              <textarea id="why" className="textarea" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Voor wie. Wat het je kost als je niks verandert." />
              <div className="small">Dit zie je elke ochtend terug.</div>
            </div>
          </div>
        )}

        {/* 2 · Verleidingen */}
        {step === 2 && (
          <div className="stack gap-16">
            <div className="stack gap-8">
              <h1 className="h1">Wat trekt je naar beneden?</h1>
              <p className="lead">Je houdt ze bij. Ze tellen nog niet mee.</p>
            </div>
            <CustomChips list={vices} onRemove={remove} title="Gekozen" />
            <PickStep mode="vice" picked={picked} toggle={toggle} setAmount={setAmount} />
            <button className="chip add" style={{ alignSelf: 'flex-start' }} onClick={() => setCustom('vice')}>{Icon.plus()} Eigen verleiding</button>
          </div>
        )}

        {/* 3 · Gewoontes, grote taken, en je doel met een datum */}
        {step === 3 && (
          <div className="stack gap-24">
            <div className="stack gap-8">
              <h1 className="h1">Je dag en je doel</h1>
              <p className="lead">Grote taken maken je dag. Hooguit drie.</p>
            </div>
            <div className="list">
              {virtues.map((h) => (
                <div key={h.id} className="row" style={{ minHeight: 64 }}>
                  <div className="grow"><div className="name">{h.name}</div><div className="meta">{scheduleLabel(h)}</div></div>
                  <button className={`chip ${h.weight === 3 ? 'on' : ''}`} aria-pressed={h.weight === 3} onClick={() => setBig(h.id, h.weight !== 3)}>Groot</button>
                  <button className="iconbtn" aria-label={`${h.name} weghalen`} onClick={() => remove(h.id)} style={{ color: 'var(--ink-3)' }}>{Icon.close()}</button>
                </div>
              ))}
            </div>
            {bigCount > 3 && <p className="lead" style={{ color: 'var(--ink)' }}>{bigCount} grote taken. Als alles groot is, is niets groot.</p>}
            <button className="chip add" style={{ alignSelf: 'flex-start' }} onClick={() => setCustom('virtue')}>{Icon.plus()} Gewoonte toevoegen</button>

            <div className="stack gap-12">
              <h2 className="h2">Je doel</h2>
              <div className="field">
                <label htmlFor="gt">Wat ga je halen?</label>
                <input id="gt" className="input" value={goalText} onChange={(e) => setGoalText(e.target.value)} placeholder="Bijv. 12-uursloop" />
              </div>
              <div className="field">
                <label htmlFor="gd">Wanneer?</label>
                <input id="gd" className="input" type="date" min={todayISO()} value={goalDue} onChange={(e) => setGoalDue(e.target.value)} />
                {dateNeeded && !goalDue && <div className="small" style={{ color: 'var(--ink)' }}>Een race heeft een datum nodig. Dan telt de app af.</div>}
              </div>
            </div>
          </div>
        )}

        {/* 4 · Het contract, en de meldingen */}
        {step === 4 && (
          <div className="stack gap-24">
            <Plate src={IMG.oath} ratio="4 / 5" style={{ width: '40%', margin: '0 auto' }} />
            <div className="stack gap-8 center">
              <h1 className="h1">{name ? `${name}, dit` : 'Dit'} is de deal.</h1>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <ol className="lead" style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
                <li>Ik doe mijn grote taken. Elke dag.</li>
                <li>Ik kijk elke avond eerlijk terug.</li>
                <li>Ik mis nooit twee keer.</li>
              </ol>
            </div>
            {notifySupported() && notifyAsked === null && (
              <div className="card stack gap-12">
                <h2 className="h2">Mag de app je herinneren?</h2>
                <p className="lead" style={{ margin: 0 }}>Om 6:30 om op te staan, om 21:00 om je dag af te sluiten, en om 22:15 om naar boven te gaan.</p>
                <button className="btn ghost" onClick={async () => setNotifyAsked(await enableNotify())}>Ja, herinner me</button>
                <button className="link center" onClick={() => setNotifyAsked(false)}>Nee, liever niet</button>
              </div>
            )}
            {notifyAsked === true && <p className="lead center">{Icon.check()} Herinneringen staan aan. Tijden pas je aan op Reis.</p>}
          </div>
        )}
      </div>

      <div className="dock" style={{ position: 'fixed', left: 0, right: 0, margin: '0 auto', bottom: 0, width: '100%', maxWidth: 460, padding: '16px 20px calc(env(safe-area-inset-bottom) + 18px)', background: 'linear-gradient(180deg, rgba(11, 11, 11, 0), var(--paper) 28%)', zIndex: 10 }}>
        {step < STEPS - 1 ? (
          <button className="btn" onClick={next} disabled={(step === 1 && !name.trim()) || (step === 3 && (virtues.length === 0 || (dateNeeded && !goalDue)))}>Verder</button>
        ) : (
          <HoldButton label="Houd vast om te tekenen" onDone={finish} />
        )}
      </div>

      {custom && (
        <Sheet onClose={() => setCustom(null)}>
          <HabitEditor
            kind={custom}
            onCancel={() => setCustom(null)}
            onSave={(h) => { setPicked((p) => ({ ...p, [h.id]: h })); setCustom(null) }}
          />
        </Sheet>
      )}
    </div>
  )
}

function CustomChips({ list, onRemove, title = 'Eigen' }: { list: Habit[]; onRemove: (id: string) => void; title?: string }) {
  const own = title === 'Eigen' ? list.filter((h) => h.id.startsWith('custom-')) : list
  if (!own.length) return null
  return (
    <div className="stack gap-8">
      <div className="small">{title}</div>
      <div className="chips">
        {own.map((h) => (
          <button key={h.id} className="chip on" onClick={() => onRemove(h.id)} aria-label={`${h.name} verwijderen`}>
            {h.name} {Icon.close()}
          </button>
        ))}
      </div>
    </div>
  )
}

function PickStep({ mode, picked, toggle, setAmount }: {
  mode: 'vice' | 'virtue'
  picked: Record<string, Habit>
  toggle: (t: HabitTemplate) => void
  setAmount: (key: string, n: number) => void
}) {
  const counted = Object.entries(picked).filter(([, h]) => h.kind === mode && (h.type === 'limit' || h.type === 'target'))
  return (
    <section className="stack gap-16">
      <Plate src={mode === 'vice' ? IMG.haunted : IMG.climb} ratio="16 / 9" />
      <HabitPicker kind={mode} isPicked={(t) => !!picked[t.key]} toggle={toggle} />
      {counted.length > 0 && (
        <div className="list">
          {counted.map(([key, h]) => {
            const step = h.step ?? 1
            return (
              <div key={key} className="row" style={{ minHeight: 56 }}>
                <div className="grow">
                  <div className="name" style={{ fontSize: 13, lineHeight: '20px'}}>{h.name}</div>
                  <div className="meta">{h.type === 'limit' ? 'Maximaal per dag' : 'Minimaal per dag'}</div>
                </div>
                <div className="stepper">
                  <button aria-label="Minder" onClick={() => setAmount(key, (h.amount ?? 0) - step)}>{Icon.minus()}</button>
                  <div className="val">{fmt(h.amount ?? 0)}<small>{h.unit}</small></div>
                  <button aria-label="Meer" onClick={() => setAmount(key, (h.amount ?? 0) + step)}>{Icon.plus()}</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
