import { useState } from 'react'
import { dayResult, isSaved } from '../lib/days'
import { countdownLabel, goalTitle, mainGoal } from '../lib/goal'
import { addDays, buzz, todayISO, update, useStore, type State } from '../lib/store'

/** 0 = zondag … 6 = zaterdag */
const weekday = (iso: string) => new Date(iso + 'T12:00:00').getDay()

/** De week die je deelt: op zondag deze week, op maandag de week die net voorbij is. Anders geen. */
export const shareWeek = (today = todayISO()) => {
  const wd = weekday(today)
  const end = wd === 0 ? today : wd === 1 ? addDays(today, -1) : null
  return end ? { from: addDays(end, -6), to: end } : null
}

/** Je week in een paar regels, zoals je hem aan iemand stuurt. */
export const weekText = (s: State, from: string, to: string) => {
  let won = 0
  let counted = 0
  let saved = 0
  const today = todayISO()
  for (let d = from; d <= to; d = addDays(d, 1)) {
    const r = dayResult(s, d)
    // Vandaag telt pas mee als hij al gewonnen is: hij is nog niet voorbij
    if (d === today && r !== true) continue
    if (r !== null) { counted++; if (r) won++ }
    else if (isSaved(s, d)) saved++
  }
  const hard = s.jar.filter((j) => j.date >= from && j.date <= to).slice(0, 2).map((j) => j.text)
  const goal = mainGoal(s)
  return [
    `Mijn week: ${won} van de ${counted} dagen gewonnen${saved ? `, ${saved} gered met een reservedag` : ''}.`,
    hard.length ? `Zwaarste wat ik deed: ${hard.join('; ')}.` : '',
    goal ? `Doel: ${goalTitle(goal)}${goal.due ? ` (${countdownLabel(goal.due, to)})` : ''}.` : '',
  ].filter(Boolean).join('\n')
}

/**
 * Een getuige (Harkin e.a. 2016, 138 studies): bijhouden helpt, en meer als je het aan iemand laat zien.
 * Op zondag en maandag stuur je je week naar één persoon die je zelf kiest. Via je eigen berichten-app: geen server.
 */
export default function Witness() {
  const s = useStore()
  const today = todayISO()
  const wk = shareWeek(today)
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)
  if (!wk || wk.to < s.createdAt) return null
  if (s.asked?.witness === wk.from) return null
  const witness = s.settings?.witness
  const close = () => update((d) => { d.asked = { ...d.asked, witness: wk.from } })

  const send = async () => {
    const text = weekText(s, wk.from, wk.to)
    buzz(12)
    try {
      if (navigator.share) { await navigator.share({ text }); close(); return }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      /* geen klembord */
    }
  }

  return (
    <div className="card witness-card">
      {witness ? (
        <>
          <p><b>Je week voor {witness}.</b> Wie zijn voortgang aan iemand laat zien, houdt het vaker vol.</p>
          <pre className="witness-text">{weekText(s, wk.from, wk.to)}</pre>
          <div className="hstack" style={{ gap: 8 }}>
            <button className="btn sm" onClick={send}>{copied ? 'Gekopieerd' : `Stuur naar ${witness}`}</button>
            <button className="btn soft sm" onClick={close}>{copied ? 'Klaar' : 'Niet deze week'}</button>
          </div>
        </>
      ) : (
        <>
          <p><b>Wie mag je week zien?</b> Eén persoon die je vertrouwt. Wie zijn voortgang aan iemand laat zien, houdt het vaker vol.</p>
          <div className="hstack" style={{ gap: 8 }}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Naam" aria-label="Naam van je getuige" onKeyDown={(e) => e.key === 'Enter' && name.trim() && saveName(name)} />
            <button className="btn sm" style={{ flex: 'none', width: 'auto', padding: '0 20px' }} disabled={!name.trim()} onClick={() => saveName(name)}>Kies</button>
          </div>
          <button className="link" onClick={close}>Niet nu</button>
        </>
      )}
    </div>
  )
}

const saveName = (name: string) => update((d) => { d.settings = { ...d.settings, witness: name.trim() } })
