import { useState } from 'react'
import { scheduleLabel, wonStats } from '../lib/days'
import { addTask4, applySchema, missingFromSchema, offerSchema, offerTask4 } from '../lib/schema'
import { todayISO, update, useStore } from '../lib/store'

/**
 * Wat de app je één keer voorlegt: het nieuwe schema (bij bestaande gegevens), en na 30 sterke dagen taak 4.
 * Beide met twee knoppen; je antwoord wordt onthouden, dus hij blijft niet zeuren.
 */
export default function Offers() {
  const s = useStore()
  const [pick, setPick] = useState(false)
  const won30 = wonStats(s, todayISO(), 30).won

  if (offerSchema(s)) {
    const add = missingFromSchema(s)
    return (
      <div className="card offer">
        <h2 className="h2">Je nieuwe schema</h2>
        <p className="lead" style={{ margin: 0 }}>Drie grote taken elke dag. De rest op vaste momenten.</p>
        <ul className="offer-list">
          {add.map((h) => <li key={h.id}><b>{h.name}</b> <span>{h.kind === 'vice' ? 'bijhouden' : h.weight === 3 ? 'grote taak · elke dag' : scheduleLabel(h)}</span></li>)}
        </ul>
        <div className="offer-btns">
          <button className="btn" onClick={() => update((d) => { applySchema(d); d.asked = { ...d.asked, schema: true } })}>Zet klaar</button>
          <button className="btn ghost" onClick={() => update((d) => { d.asked = { ...d.asked, schema: true } })}>Nee, laat zo</button>
        </div>
      </div>
    )
  }

  if (offerTask4(s, won30)) {
    return (
      <div className="card offer">
        <h2 className="h2">Klaar voor taak 4?</h2>
        <p className="lead" style={{ margin: 0 }}>Stoppen met roken of drinken. Je won {won30} van de laatste 30 dagen.</p>
        {pick ? (
          <div className="offer-btns">
            <button className="btn" onClick={() => update((d) => addTask4(d, 'roken'))}>Stoppen met roken</button>
            <button className="btn ghost" onClick={() => update((d) => addTask4(d, 'drinken'))}>Stoppen met drinken</button>
          </div>
        ) : (
          <div className="offer-btns">
            <button className="btn" onClick={() => setPick(true)}>Ja, kies er één</button>
            <button className="btn ghost" onClick={() => update((d) => { d.asked = { ...d.asked, task4: true } })}>Nog niet</button>
          </div>
        )}
      </div>
    )
  }
  return null
}
