import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { rearmMotion, startMotion } from './lib/motion'
import { startSmoothScroll } from './lib/scroll'
import { startSync } from './lib/sync'

// Alleen in productie: in dev zou de cache hot reload in de weg zitten.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

// Eén vaste schermhoogte voor de scènes: gemeten bij het openen, en alleen opnieuw als de breedte verandert
// (draaien). Bij scrollen schuiven adresbalk en knoppen in en uit; daar mag de scène niet van groeien of krimpen.
let lockedW = 0
const lockHeight = () => {
  if (window.innerWidth === lockedW) return
  lockedW = window.innerWidth
  document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`)
}
lockHeight()
window.addEventListener('resize', lockHeight)

// Scènes bewegen mee met de stand van je telefoon. iOS vraagt daar toestemming voor, en alleen na een tik:
// de eerste keer via de kaart op Vandaag, daarna bij je eerste aanraking (ook in de app op je beginscherm).
startMotion()
rearmMotion()
startSmoothScroll()
// Je reis in de cloud, als Supabase is ingesteld (.env.local)
startSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
