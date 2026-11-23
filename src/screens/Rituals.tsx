import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '../components/ui'
import { bigTasksOn, dayResult } from '../lib/days'
import { isDone } from '../lib/score'
import { buzz, setValue, todayISO, uid, update, useStore } from '../lib/store'

const dayLabel = (iso: string) =>
  iso === todayISO() ? 'vandaag' : new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

const PLANS = ['Telefoon buiten de slaapkamer', 'Om 22:30 naar boven', 'Het zware ding als eerste', 'Kleren voor morgen klaarleggen', 'Iemand vertellen wat ik ga doen']

type Step = 'day' | 'hard' | 'plan'

/**
 * Dag afsluiten in hooguit drie schermen, één vraag per scherm (zoals Stoic's avondreflectie):
 * 1 · Je dag: gewonnen of gemist, je taken zoals je ze afscheurde (vergeten? tik hem alsnog aan), je verleidingen klein.
 * 2 · Wat deed je, terwijl het zwaar was? Dat gaat de koektrommel in (Goggins). Overslaan mag.
 * 3 · Alleen na een gemiste dag: wat doe je morgen anders? Eén regel, die je morgen op Vandaag terugziet.
 * De knop op het laatste scherm sluit je dag af.
 */
export function Mirror({ date, onClose }: { date: string; onClose: () => void }) {
  const s = useStore()
  const log = s.logs[date]
  const big = bigTasksOn(s, date)
  const result = dayResult(s, date)
  const vices = s.habits.filter((h) => h.kind === 'vice')
  const [hard, setHard] = useState('')
  const [plan, setPlan] = useState(log?.aar?.plan ?? '')
  const doneCount = big.filter((h) => isDone(h, log?.v[h.id] ?? 0) && (log?.v[h.id] ?? 0) > 0).length

  const steps: Step[] = ['day', 'hard', ...(result === false ? ['plan' as const] : [])]
  const [step, setStep] = useState<Step>('day')
  const at = Math.max(0, steps.indexOf(step))
  const last = at === steps.length - 1

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const finish = () => {
    buzz(14)
    update((d) => {
      const l = (d.logs[date] ??= { v: {} })
      l.sealed = true
      if (result === false && plan.trim()) l.aar = { ...l.aar, plan: plan.trim() }
    })
    onClose()
  }
  const next = () => (last ? finish() : (buzz(6), setStep(steps[at + 1])))
  const back = () => { buzz(6); setStep(steps[at - 1]) }
  const toJar = () => {
    if (!hard.trim()) return
    buzz(14)
    update((d) => { d.jar.unshift({ id: uid(), text: hard.trim(), date }) })
    next()
  }

  let q = ''
  let sub: string | null = null
  let body: ReactNode = null
  let primary: { label: string; onClick: () => void; disabled?: boolean } = { label: last ? 'Dag afsluiten' : 'Volgende', onClick: next }
  let skip: string | null = null

  if (step === 'day') {
    q = result === true ? 'Gewonnen.' : result === false ? 'Gemist.' : 'Je dag.'
    sub = big.length ? 'Vergeten af te scheuren? Tik het hier aan.' : 'Geen grote taken vandaag.'
    body = (
      <>
        {big.length > 0 && (
          <div className="list flat">
            {big.map((h) => {
              const on = isDone(h, log?.v[h.id] ?? 0) && (log?.v[h.id] ?? 0) > 0
              return (
                <button key={h.id} className={`big-task ${on ? 'done' : ''}`} aria-pressed={on} onClick={() => { buzz(); setValue(date, h.id, on ? 0 : h.type === 'target' ? h.amount ?? 1 : 1) }}>
                  <span className={`check big ${on ? 'on' : ''}`}>{on && Icon.check('#0B0B0B')}</span>
                  <span className="bt-name grow">{h.name}</span>
                </button>
              )
            })}
          </div>
        )}
        {vices.length > 0 && (
          <div className="dc-vices">
            <span className="small">Toegegeven aan een verleiding? Alleen om bij te houden.</span>
            <div className="chips">
              {vices.map((h) => {
                const slip = (log?.v[h.id] ?? 0) >= 1
                return <button key={h.id} className={`chip ${slip ? 'on' : ''}`} aria-pressed={slip} onClick={() => setValue(date, h.id, slip ? 0 : 1)}>{h.name}</button>
              })}
            </div>
          </div>
        )}
      </>
    )
  } else if (step === 'hard') {
    q = 'Wat deed je vandaag, terwijl het zwaar was?'
    sub = 'Alleen wat je echt deed. Het wordt bewijs voor de dagen dat je wilt opgeven.'
    body = <input className="input dc-input" autoFocus value={hard} onChange={(e) => setHard(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && toJar()} placeholder="Bijv. toch gaan lopen in de regen" aria-label="Wat je deed, terwijl het zwaar was" />
    primary = { label: 'In de koektrommel', onClick: toJar, disabled: !hard.trim() }
    skip = 'Niets vandaag'
  } else {
    q = 'Wat doe je morgen anders?'
    sub = 'Eén ding. Je ziet het morgen op Vandaag terug.'
    body = (
      <>
        <input className="input dc-input" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Eén ding" maxLength={80} />
        <div className="chips">
          {PLANS.map((p) => <button key={p} className={`chip ${plan === p ? 'on' : ''}`} onClick={() => setPlan(p)}>{p}</button>)}
        </div>
      </>
    )
    primary = { label: 'Dag afsluiten', onClick: finish, disabled: !plan.trim() }
    skip = 'Weet ik nog niet'
  }

  return (
    <div className="mirror dc-flow">
      <div className="dc-top">
        {at > 0 ? <button className="iconbtn" onClick={back} aria-label="Vorige vraag" style={{ color: '#F2F2F2' }}>{Icon.back()}</button> : <span className="dc-top-gap" />}
        <div className="ob-progress" aria-hidden="true"><i style={{ transform: `scaleX(${(at + 1) / steps.length})` }} /></div>
        <button className="iconbtn" onClick={onClose} aria-label="Sluiten" style={{ color: '#F2F2F2' }}>{Icon.close()}</button>
      </div>

      <div key={step} className="dc-body ob-step">
        <div className="eyebrow">Dag afsluiten · {dayLabel(date)}{big.length > 0 && step === 'day' ? ` · ${doneCount} van ${big.length}` : ''}</div>
        <h2 className={`dc-q-title ${step === 'day' ? (result === true ? 'won' : result === false ? 'lost' : '') : ''}`}>{q}</h2>
        {sub && <p className="dc-sub">{sub}</p>}
        <div className="dc-field">{body}</div>
      </div>

      <div className="dc-foot">
        <button className="btn light" disabled={primary.disabled} onClick={primary.onClick}>{primary.label}</button>
        {skip && <button className="link dc-skip" onClick={next}>{skip}</button>}
      </div>
    </div>
  )
}
