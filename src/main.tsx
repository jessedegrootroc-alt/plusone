import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { enableMotion, startMotion } from './lib/motion'
import { startSmoothScroll } from './lib/scroll'

// Alleen in productie: in dev zou de cache hot reload in de weg zitten.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

// Scènes bewegen mee met de stand van je telefoon. iOS vraagt daar toestemming voor, en alleen na een tik:
// daarom bij de eerste tik in de app.
startMotion()
startSmoothScroll()
document.addEventListener('click', () => { void enableMotion() }, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
