import { useEffect, useState } from 'react'
import { AddRockSheet, SuckSheet } from '../components/DaySheets'
import { GrensRow, TankStrip } from '../components/Grens'
import { Icon } from '../components/ui'
import { bigTasksOn, dayResult } from '../lib/days'
import { isDone } from '../lib/score'
import { addDays, buzz, setValue, todayISO, uid, update, useStore } from '../lib/store'

const dayLabel = (iso: string) =>
  iso === todayISO() ? 'vandaag' : new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })

const BLACK = ['10 minuten lezen', 'Korte training', 'Huis opruimen', 'Morgen klaarzetten']
const PLANS = ['Telefoon buiten de slaapkamer', 'Om 22:30 naar boven', 'Het zware ding als eerste', 'Kleren voor morgen klaarleggen', 'Iemand vertellen wat ik ga doen']

/**
 * Dag afsluiten: drie korte vragen, zoals Goggins na elke dag.
 * 1 · Heb ik gedaan wat ik zei? Dat zegt de app zelf: gewonnen of verloren.
 * 2 · Wat was vandaag zwaar, en deed ik toch? Met één tik in de koektrommel.
 * 3 · Wat doe ik morgen anders? Alleen na een verloren dag, één regel.
 * Daaronder wat bij de avond hoort: je tank, je grens, en wat morgen af moet.
 */
export function Mirror({ date, onClose }: { date: string; onClose: () => void }) {
  const s = useStore()
  const log = s.logs[date]
  const big = bigTasksOn(s, date)
  const result = dayResult(s, date)
  const vices = s.habits.filter((h) => h.kind === 'vice')
  const [hard, setHard] = useState('')
  // Het briefje dat je net in de koektrommel deed, zodat je het kunt terugdraaien
  const [saved, setSaved] = useState<string | null>(null)
  const [plan, setPlan] = useState(log?.aar?.plan ?? '')
  const [black, setBlack] = useState('')
  const [sheet, setSheet] = useState<null | 'rock' | 'suck'>(null)
  const tomorrow = addDays(date, 1)
  const isToday = date === todayISO()

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const toJar = () => {
    if (!hard.trim()) return
    buzz(14)
    const id = uid()
    update((d) => { d.jar.unshift({ id, text: hard.trim(), date }) })
    setSaved(id)
  }
  const undoJar = () => {
    update((d) => { d.jar = d.jar.filter((j) => j.id !== saved) })
    setSaved(null)
  }
  const finish = () => {
    update((d) => {
      const l = (d.logs[date] ??= { v: {} })
      l.sealed = true
      if (result === false && plan.trim()) l.aar = { ...l.aar, plan: plan.trim() }
    })
    onClose()
  }

  return (
    <div className="mirror day-close-screen">
      <div className="hstack between">
        <div className="eyebrow">Dag afsluiten · {dayLabel(date)}</div>
        <button className="iconbtn" onClick={onClose} aria-label="Sluiten" style={{ color: '#F2F2F2' }}>{Icon.close()}</button>
      </div>

      {/* 1 · Heb ik gedaan wat ik zei? */}
      <section className="dc-q">
        <h2 className="dc-title"><span className="dc-n">1</span> Heb ik gedaan wat ik zei?</h2>
        <div className={`dc-result ${result === true ? 'won' : result === false ? 'lost' : ''}`}>
          {result === true ? 'Gewonnen' : result === false ? 'Gemist' : 'Geen grote taken vandaag'}
        </div>
        {result === false && <p className="small" style={{ margin: 0 }}>Eén dag zegt niets, twee wel. Schrijf op wat morgen anders moet, en laat deze dag hier.</p>}
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
            <span className="small">Verleidingen, om bij te houden:</span>
            <div className="chips">
              {vices.map((h) => {
                const slip = (log?.v[h.id] ?? 0) >= 1
                return <button key={h.id} className={`chip ${slip ? 'on' : ''}`} aria-pressed={slip} onClick={() => setValue(date, h.id, slip ? 0 : 1)}>{h.name}{slip ? ': toegegeven' : ''}</button>
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2 · Wat was zwaar en deed ik toch? */}
      <section className="dc-q">
        <h2 className="dc-title"><span className="dc-n">2</span> Wat heb ik vandaag gedaan, terwijl het zwaar was?</h2>
        {saved ? (
          <div className="hstack between" style={{ gap: 12 }}>
            <p className="lead" style={{ color: 'var(--ink)', margin: 0 }}>{Icon.check()} „{hard.trim()}” zit in je koektrommel.</p>
            <button className="link" onClick={undoJar}>Haal eruit</button>
          </div>
        ) : (
          <>
            <p className="small" style={{ margin: 0 }}>Alleen wat je echt gedaan hebt. Het wordt bewijs voor de dagen dat je wilt opgeven. Niets gedaan? Sla over.</p>
            <div className="dc-row">
              <input className="input" value={hard} onChange={(e) => setHard(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && toJar()} placeholder="Bijv. toch gaan lopen in de regen" aria-label="Wat je deed, terwijl het zwaar was" />
              <button className="btn ghost dc-jar" disabled={!hard.trim()} onClick={toJar}>Gedaan, in de koektrommel</button>
            </div>
          </>
        )}
      </section>

      {/* Niet in de min naar bed (Goggins): na een gemiste dag nog één goed ding voor het slapen */}
      {result === false && isToday && (
        <section className="dc-q">
          <h2 className="dc-title">Je gaat niet in de min slapen</h2>
          {log?.black ? (
            <p className="lead" style={{ color: 'var(--ink)' }}>{Icon.check()} {log.black}. Afgevinkt. Je slaapt in de plus.</p>
          ) : (
            <>
              <p className="small" style={{ margin: 0 }}>De dag is verloren, de avond nog niet. Doe nu één ding goed, dan begin je morgen niet op achterstand.</p>
              <div className="chips">
                {BLACK.map((b) => <button key={b} className={`chip ${black === b ? 'on' : ''}`} onClick={() => setBlack(b)}>{b}</button>)}
              </div>
              <div className="dc-row">
                <input className="input" value={black} onChange={(e) => setBlack(e.target.value)} placeholder="Of iets anders" maxLength={60} />
                <button className="btn ghost dc-jar" disabled={!black.trim()} onClick={() => { buzz(14); update((d) => { (d.logs[date] ??= { v: {} }).black = black.trim() }) }}>Gedaan</button>
              </div>
            </>
          )}
        </section>
      )}

      {/* 3 · Wat doe ik morgen anders? Alleen na een verloren dag */}
      {result === false && (
        <section className="dc-q">
          <h2 className="dc-title"><span className="dc-n">3</span> Wat doe ik morgen anders?</h2>
          <input className="input" value={plan} onChange={(e) => setPlan(e.target.value)} placeholder="Eén ding" maxLength={80} />
          <div className="chips">
            {PLANS.map((p) => <button key={p} className={`chip ${plan === p ? 'on' : ''}`} onClick={() => setPlan(p)}>{p}</button>)}
          </div>
        </section>
      )}

      {/* Wat bij de avond hoort: tank, grens, en morgen */}
      {isToday && (
        <section className="dc-q dc-extra">
          <h2 className="dc-title">Voor morgen</h2>
          <TankStrip />
          <div className="list flat"><GrensRow /></div>
          <div className="day-add">
            <button className="chip add" onClick={() => setSheet('rock')}>{Icon.plus()} Moet morgen af</button>
            <button className="chip add" onClick={() => setSheet('suck')}>{Icon.plus()} Iets wat zuigt</button>
          </div>
        </section>
      )}

      <button className="btn light dc-done" onClick={finish}>Dag afsluiten</button>

      {sheet === 'rock' && <AddRockSheet date={tomorrow} onClose={() => setSheet(null)} bigCount={(s.logs[tomorrow]?.rocks ?? []).filter((r) => r.size === 3).length} />}
      {sheet === 'suck' && <SuckSheet date={tomorrow} onClose={() => setSheet(null)} />}
    </div>
  )
}
