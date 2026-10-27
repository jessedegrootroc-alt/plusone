import { mirrorStreak } from '../lib/score'
import { addDays, todayISO, useStore } from '../lib/store'

/**
 * Drie getallen als een plank met trofeeën: elk getal staat bij zijn eigen voorwerp, getekend in de stijl van de scènes.
 * De handspiegel voor de dagen dat je eerlijk keek, de lauwerkrans voor je koektrommel, de pelgrimsstaf voor je grenzen.
 * Onder elk getal een klein teken van deze week, zodat je ziet of het nu ook leeft.
 */
export default function Trophies() {
  const s = useStore()
  const today = todayISO()
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  const weekStart = week[0]
  const streak = mirrorStreak(s)
  const wins = s.jar.length
  const winsWeek = s.jar.filter((j) => j.date >= weekStart).length
  const growth = s.growth ?? []
  const pushed = growth.filter((c) => c.status === 'gedaan').length
  const open = growth.filter((c) => c.status === 'open').length

  return (
    <div className="trophies">
      <div className="trophy">
        <img className="trophy-img" src="/art/item-handspiegel.webp" alt="" />
        <span className="trophy-num">{streak}</span>
        <span className="trophy-lbl">{streak === 1 ? 'dag' : 'dagen'} gespiegeld</span>
        <span className="trophy-week" aria-label={`Deze week ${week.filter((d) => s.logs[d]?.sealed).length} van 7 dagen gespiegeld`}>
          {week.map((d) => <i key={d} className={`${s.logs[d]?.sealed ? 'on' : ''} ${d === today ? 'now' : ''}`} />)}
        </span>
      </div>
      <div className="trophy">
        <img className="trophy-img" src="/art/item-lauwerkrans.webp" alt="" />
        <span className="trophy-num">{wins}</span>
        <span className="trophy-lbl">{wins === 1 ? 'overwinning' : 'overwinningen'}</span>
        <span className="trophy-sub">{winsWeek ? `+${winsWeek} deze week` : 'nog geen deze week'}</span>
      </div>
      <div className="trophy">
        <img className="trophy-img" src="/art/item-pelgrimsstaf.webp" alt="" />
        <span className="trophy-num">{pushed}</span>
        <span className="trophy-lbl">{pushed === 1 ? 'grens' : 'grenzen'} verlegd</span>
        <span className="trophy-sub">{open ? `${open} staat open` : 'verleg er een'}</span>
      </div>
    </div>
  )
}
