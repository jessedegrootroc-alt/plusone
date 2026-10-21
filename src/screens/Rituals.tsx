import { useEffect, useMemo, useState } from 'react'
import { StagePlate } from '../components/Plate'
import { Ico } from '../components/Ico'
import { Icon, fmt, useTween } from '../components/ui'
import { ROCK } from '../data/catalog'
import { SIN_BY_ID, stageFor } from '../data/sins'
import { byRock, computeSeries, habitsFor, isDone } from '../lib/score'
import { buzz, getState, setValue, todayISO, uid, update, useStore, type Habit } from '../lib/store'

const dayLabel = (iso: string) =>
  iso === todayISO() ? 'vandaag' : new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

const CLOSERS_NEVER_FINISHED = [
  'Je bent er. En je bent nooit klaar. Morgen weer.',
  'Hier stoppen de meeste mensen. Jij niet.',
]
const CLOSERS_GOOD = [
  'Niemand gaat je dit cadeau doen. Je hebt het vandaag zelf gepakt.',
  'Comfort was de makkelijke keuze. Je koos iets anders.',
  'Dit is hoe eelt op de geest ontstaat: dag na dag, zonder applaus.',
  'Je dacht dat je op was. Je was op 40%.',
]
const CLOSERS_MIXED = [
  'Eén val is data, geen identiteit. Mis het nooit twee keer.',
  'Je keek eerlijk. Dat is meer dan de meeste mensen vandaag deden.',
  'Geen excuses, geen zelfhaat. Alleen: wat doe je morgen anders?',
]
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)]

const AAR_CAUSES = ['Te laat naar bed', 'Stress', 'Verveling', 'Telefoon binnen handbereik', 'Geen plan', 'Alleen', 'Moe', 'Een bepaalde plek of persoon']
const AAR_PLANS = ['Telefoon buiten de slaapkamer', 'Grote steen vóór 10:00', 'Om 22:30 naar bed', 'Drang-knop bij de eerste trek', 'Het zware ding als eerste', 'Iemand vertellen wat mijn doel is', 'Die plek of situatie vermijden']

/**
 * Het Spiegelmoment: één vraag tegelijk, één tik per antwoord.
 * Alleen wat nog open staat wordt gevraagd — wat je overdag al afvinkte sla je over.
 */
export function Mirror({ date, onClose }: { date: string; onClose: () => void }) {
  const s = useStore()
  const queue = useMemo(() => {
    const log = getState().logs[date]
    // Grote stenen eerst, ook in de spiegel.
    const virtues = byRock(habitsFor(getState(), date).filter((h) => h.kind === 'virtue' && !(isDone(h, log?.v[h.id] ?? 0) && (h.type === 'do' || h.type === 'target'))))
    const vices = getState().habits.filter((h) => h.kind === 'vice')
    // Deugden eerst: begin met wat je wél deed.
    return [...virtues, ...vices]
  }, [date])
  const [i, setI] = useState(0)
  const [before] = useState(() => computeSeries(getState(), date).balance)
  const [jar, setJar] = useState('')
  const [closer] = useState(() => ({ good: pick(CLOSERS_GOOD), mixed: pick(CLOSERS_MIXED), top: pick(CLOSERS_NEVER_FINISHED) }))
  const [aar, setAar] = useState(0)
  const [memory] = useState(() => (getState().jar.length ? pick(getState().jar.map((j) => j.text)) : null))

  const h: Habit | undefined = queue[i]
  const val = h ? s.logs[date]?.v[h.id] ?? 0 : 0

  const answer = (v: number) => {
    if (!h) return
    buzz(v ? 10 : 6)
    setValue(date, h.id, v)
    setI((x) => x + 1)
  }

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!h) return
      if (h.type === 'do' && (e.key === 'ArrowRight' || e.key === 'j')) answer(1)
      if (h.type === 'do' && (e.key === 'ArrowLeft' || e.key === 'n')) answer(0)
      if (h.type === 'avoid' && (e.key === 'ArrowRight' || e.key === 'j')) answer(0)
      if (h.type === 'avoid' && (e.key === 'ArrowLeft' || e.key === 'n')) answer(1)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const finished = i >= queue.length
  useEffect(() => {
    if (finished && !getState().logs[date]?.sealed) {
      update((d) => {
        const log = (d.logs[date] ??= { v: {} })
        log.sealed = true
      })
    }
  }, [finished, date])

  const after = computeSeries(s, date).balance
  const shown = useTween(finished ? after : before, 2200)

  if (finished) {
    const log = s.logs[date]
    const slips = s.habits.filter((x) => x.kind === 'vice' && !isDone(x, log?.v[x.id] ?? 0))
    const missedBig = habitsFor(s, date).filter((x) => x.kind === 'virtue' && x.weight === 3 && !isDone(x, log?.v[x.id] ?? 0))
    const badDay = slips.length > 0 || missedBig.length > 0

    // Debrief (Goggins' After Action Report): alleen op een slechte dag, drie tikken, geen schuld.
    if (badDay && aar < 3 && !log?.aar?.plan) {
      const save = (key: 'what' | 'cause' | 'plan', v: string) => {
        buzz(8)
        update((d) => {
          const l = (d.logs[date] ??= { v: {} })
          l.aar = { ...l.aar, [key]: v }
        })
        setAar((x) => x + 1)
      }
      const Q = [
        { key: 'what' as const, title: 'Wat ging er mis?', sub: 'Geen schuld. Alleen data.', opts: [...slips.map((x) => x.name), ...missedBig.map((x) => x.name), 'Iets anders'] },
        { key: 'cause' as const, title: 'Waar begon het?', sub: 'Bijna elke val begint eerder dan je denkt.', opts: AAR_CAUSES },
        { key: 'plan' as const, title: 'Wat doe je morgen anders?', sub: 'Eén ding. Je ziet het morgenochtend terug.', opts: AAR_PLANS },
      ][aar]
      return (
        <div className="mirror">
          <div className="hstack between">
            <div className="eyebrow">Debrief · {aar + 1} / 3</div>
            <button className="iconbtn" onClick={onClose} aria-label="Sluiten" style={{ color: '#F2F2F2' }}>{Icon.close()}</button>
          </div>
          <div className="q" key={aar}>
            <div className="big">{Q.title}</div>
            <div style={{ color: 'var(--ink-2)', fontSize: 16, lineHeight: '24px' }}>{Q.sub}</div>
            <div className="chips" style={{ justifyContent: 'center', marginTop: 8 }}>
              {Q.opts.map((o) => (
                <button key={o} className="chip sg-chip" onClick={() => save(Q.key, o)}>{o}</button>
              ))}
            </div>
          </div>
          <button className="link center" style={{ color: 'var(--ink-3)', padding: 8 }} onClick={() => setAar(3)}>Sla de debrief over</button>
        </div>
      )
    }

    const delta = after - before
    const st = stageFor(after)
    return (
      <div className="mirror" style={{ animation: 'fade .4s both' }}>
        <div className="hstack between">
          <div className="eyebrow">Spiegelmoment · {dayLabel(date)}</div>
          <button className="iconbtn" onClick={onClose} aria-label="Sluiten" style={{ color: '#F2F2F2' }}>{Icon.close()}</button>
        </div>
        <div className="stack gap-16" style={{ flex: 1, justifyContent: 'center' }}>
          <StagePlate balance={shown} className="ritual-plate" />
          <div className="center stack gap-8">
            <div className="eyebrow">Plaat {st.plate} · {st.name}</div>
            <div className="hstack" style={{ justifyContent: 'center', alignItems: 'baseline', gap: 8 }}>
              <span className="num">{delta >= 0.05 ? `+${delta.toFixed(1).replace('.', ',')}` : delta <= -0.05 ? `−${Math.abs(delta).toFixed(1).replace('.', ',')}` : '±0'}</span>
              <span className="lead">balans</span>
            </div>
            <p className="lead">{slips.length ? closer.mixed : st.scene === 'paradiso' ? closer.top : closer.good}</p>
          </div>
          {badDay && memory ? (
            <div className="center stack gap-8" style={{ borderTop: '1px solid var(--line)', paddingTop: 24 }}>
              <div className="eyebrow">Uit je koektrommel</div>
              <p className="h2">“{memory}”</p>
              <p className="small">Dat heb je ook gedaan. Dit kun je ook.</p>
            </div>
          ) : (
            <div className="field mt-8">
              <label htmlFor="jar" style={{ color: 'var(--ink-2)' }}>Eén overwinning voor je koektrommel (optioneel)</label>
              <input id="jar" className="input" style={{ background: 'rgba(242, 242, 242, .06)', borderColor: 'rgba(242, 242, 242, .2)', color: '#F2F2F2' }} value={jar} onChange={(e) => setJar(e.target.value)} placeholder="Bijv. om 22:00 nog gaan hardlopen" />
            </div>
          )}
        </div>
        <button
          className="btn light"
          onClick={() => {
            if (jar.trim()) update((d) => { d.jar.unshift({ id: uid(), text: jar.trim(), date }) })
            onClose()
          }}
        >
          Dag afgesloten
        </button>
      </div>
    )
  }

  if (!h) return null
  const sin = SIN_BY_ID[h.sin]
  const step = h.step ?? 1
  return (
    <div className="mirror">
      <div className="hstack between">
        <div className="eyebrow">Spiegelmoment · {i + 1} / {queue.length}</div>
        <button className="iconbtn" onClick={onClose} aria-label="Sluiten" style={{ color: '#F2F2F2' }}>{Icon.close()}</button>
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
        {queue.map((_, k) => <i key={k} style={{ flex: 1, height: 2, borderRadius: 1, background: k < i ? '#F2F2F2' : 'rgba(242, 242, 242, .18)' }} />)}
      </div>

      <div className="q" key={h.id}>
        <div className="eyebrow" style={{ color: h.kind === 'vice' ? '#BDBDBD' : undefined }}>
          {h.kind === 'vice' ? `${sin.sin} · ${sin.sinLatin}` : h.id.startsWith('rock-') ? `${ROCK[h.weight]} · vandaag` : `${ROCK[h.weight]} · ${sin.virtue}`}
        </div>
        <div className="big">{h.name}</div>
        <div style={{ color: 'var(--ink-2)', fontSize: 16, lineHeight: '24px' }}>
          {h.type === 'do' && 'Gedaan?'}
          {h.type === 'avoid' && 'Ben je er vrij van gebleven?'}
          {h.type === 'target' && `Doel: ${fmt(h.amount ?? 0)} ${h.unit}. Precies tellen mag, hoeft niet.`}
          {h.type === 'limit' && `Maximum: ${fmt(h.amount ?? 0)} ${h.unit}. Precies tellen mag, hoeft niet.`}
        </div>
        {h.cue && <div className="italic" style={{ color: 'var(--ink-2)', fontSize: 16, lineHeight: '24px' }}>“{h.cue}”</div>}
        {(h.type === 'target' || h.type === 'limit') && (
          <div className="bigstep mt-24">
            <button onClick={() => { buzz(); setValue(date, h.id, val - step) }} aria-label="Minder"><Ico name="minus" size={26} /></button>
            <div className="n" style={{ color: h.type === 'limit' && val > (h.amount ?? 0) ? '#BDBDBD' : undefined }}>{fmt(val)}</div>
            <button onClick={() => { buzz(); setValue(date, h.id, val + step) }} aria-label="Meer"><Ico name="plus" size={26} /></button>
          </div>
        )}
      </div>

      {h.type === 'do' && (
        <div className="answers">
          <button className="ans" onClick={() => answer(0)}>Nee</button>
          <button className="ans yes" onClick={() => answer(1)}>Ja, gedaan</button>
        </div>
      )}
      {h.type === 'avoid' && (
        <div className="answers">
          <button className="ans" onClick={() => answer(1)}>Toegegeven</button>
          <button className="ans yes" onClick={() => answer(0)}>Vrij gebleven</button>
        </div>
      )}
      {h.type === 'target' && (
        <div className="answers">
          <button className="ans" onClick={() => answer(val)}>{val > 0 ? `Klopt, ${fmt(val)}` : 'Niet gehaald'}</button>
          <button className="ans yes" onClick={() => answer(Math.max(val, h.amount ?? 1))}>Doel gehaald</button>
        </div>
      )}
      {h.type === 'limit' && (
        <div className="answers">
          <button className="ans" onClick={() => answer(val > (h.amount ?? 0) ? val : (h.amount ?? 0) + step)}>{val > (h.amount ?? 0) ? `Klopt, ${fmt(val)}` : 'Erover'}</button>
          <button className="ans yes" onClick={() => answer(Math.min(val, h.amount ?? 0))}>Eronder gebleven</button>
        </div>
      )}
      <div className="small center mt-16" style={{ color: 'var(--ink-3)' }}>Eerlijk is sneller dan perfect.</div>
    </div>
  )
}
