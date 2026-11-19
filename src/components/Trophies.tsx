import { dayResult, totalWon } from '../lib/days'
import { addDays, todayISO, useStore } from '../lib/store'

/**
 * Twee getallen als een plank met trofeeën: elk getal staat bij zijn eigen voorwerp, getekend in de stijl van de scènes.
 * De handspiegel voor je gewonnen dagen, de lauwerkrans voor je koektrommel. (Hoeveel op rij zei bijna hetzelfde als je
 * gewonnen dagen, dus die is weg.)
 * Onder elk getal een klein teken van deze week, zodat je ziet of het nu ook leeft.
 */
export default function Trophies() {
  const s = useStore()
  const today = todayISO()
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  const weekStart = week[0]
  const won = totalWon(s, today)
  const wins = s.jar.length
  const winsWeek = s.jar.filter((j) => j.date >= weekStart).length

  return (
    <div className="trophies">
      <div className="trophy">
        <img className="trophy-img" src="/art/item-handspiegel.webp" alt="" />
        <span className="trophy-num">{won}</span>
        <span className="trophy-lbl">{won === 1 ? 'dag' : 'dagen'} gewonnen</span>
        <span className="trophy-week" aria-label={`Deze week ${week.filter((d) => dayResult(s, d) === true).length} van 7 dagen gewonnen`}>
          {week.map((d) => <i key={d} className={`${dayResult(s, d) === true ? 'on' : ''} ${d === today ? 'now' : ''}`} />)}
        </span>
      </div>
      <div className="trophy">
        <img className="trophy-img" src="/art/item-lauwerkrans.webp" alt="" />
        <span className="trophy-num">{wins}</span>
        <span className="trophy-lbl">{wins === 1 ? 'overwinning' : 'overwinningen'}</span>
        <span className="trophy-sub">{winsWeek ? `+${winsWeek} deze week` : 'nog geen deze week'}</span>
      </div>
    </div>
  )
}
