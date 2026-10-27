import { useState } from 'react'
import { declineMotion, enableMotion, shouldAskMotion } from '../lib/motion'

/**
 * Eén keer vragen of de scènes mogen meebewegen met je telefoon. iOS geeft de bewegingssensoren alleen vrij
 * na een tik én toestemming, ook in de app op je beginscherm; daarom een duidelijke knop in plaats van een
 * verrassing bij je eerste tik. Zeg je "niet nu", dan staat hij later nog op Reis.
 */
export default function MotionPrompt() {
  const [show, setShow] = useState(shouldAskMotion)
  const [blocked, setBlocked] = useState(false)
  if (!show) return null
  const on = async () => {
    if (await enableMotion()) setShow(false)
    else setBlocked(true)
  }
  return (
    <div className="card motion-prompt">
      <svg className="motion-phone" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="13" y="7" width="14" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M6 14C4 18 4 22 6 26M34 14C36 18 36 22 34 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="grow stack gap-4" style={{ minWidth: 0 }}>
        <div className="name">Laat je scène meebewegen</div>
        <div className="small">
          {blocked
            ? 'Je telefoon houdt het tegen. Zet het aan bij Instellingen › Safari › Beweging en richting, en probeer opnieuw.'
            : 'Kantel je telefoon en de scènes kantelen mee, met diepte.'}
        </div>
        <div className="hstack" style={{ gap: 16, marginTop: 8 }}>
          <button className="btn sm" style={{ width: 'auto', padding: '0 16px', height: 40 }} onClick={() => void on()}>{blocked ? 'Opnieuw' : 'Aanzetten'}</button>
          <button className="link" style={{ color: 'var(--ink-3)' }} onClick={() => { declineMotion(); setShow(false) }}>Niet nu</button>
        </div>
      </div>
    </div>
  )
}
