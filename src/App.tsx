import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { Icon } from './components/ui'
import { preloadScenes } from './components/LivingScene'
import { STAGES, stageFor } from './data/sins'
import { computeSeries } from './lib/score'
import { seedDemo } from './lib/demo'
import { useStore } from './lib/store'
import Compass from './screens/Compass'
import Onboarding from './screens/Onboarding'
import { Mirror } from './screens/Rituals'
import Urge from './screens/Urge'
import Shadow from './screens/Shadow'
import type { SinId } from './data/sins'
import Self from './screens/Self'
import Today from './screens/Today'
import Lab, { Gallery } from './screens/Lab'

type Tab = 'today' | 'compass' | 'self'

export default function App() {
  const s = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [mirror, setMirror] = useState<string | null>(null)
  const [urge, setUrge] = useState(false)
  const [shadow, setShadow] = useState<null | { habitId?: string; sin?: SinId }>(null)

  useEffect(() => {
    const demo = new URLSearchParams(location.search).get('demo')
    if (demo) {
      seedDemo(demo)
      history.replaceState(null, '', location.pathname)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [tab])

  // Van pagina wisselen: de oude vervaagt, de nieuwe komt op (View Transitions). De tabbalk blijft staan.
  // Zonder ondersteuning of met minder beweging: gewoon meteen.
  const go = (k: Tab) => {
    if (k === tab) return
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return setTab(k)
    document.startViewTransition(() => {
      flushSync(() => setTab(k))
      window.scrollTo(0, 0)
    })
  }

  // De levende scène alvast laden: eerst je eigen plek, daarna de buren en de rest
  useEffect(() => {
    if (!s.onboarded) return
    const here = stageFor(computeSeries(s).balance).scene
    const i = STAGES.findIndex((x) => x.scene === here)
    preloadScenes([...STAGES].sort((a, b) => Math.abs(STAGES.indexOf(a) - i) - Math.abs(STAGES.indexOf(b) - i)).map((x) => x.scene))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.onboarded])

  if (new URLSearchParams(location.search).has('scenes')) return <Gallery />
  if (new URLSearchParams(location.search).has('lab')) return <Lab />
  if (!s.onboarded) return <div className="app"><Onboarding /></div>

  return (
    <div className="app">
      {tab === 'today' && <Today openMirror={setMirror} openUrge={() => setUrge(true)} openCompass={() => go('compass')} openShadow={(habitId) => setShadow({ habitId })} />}
      {tab === 'compass' && <Compass openShadow={(sin) => setShadow({ sin })} />}
      {tab === 'self' && <Self openShadow={() => setShadow({})} />}

      <nav className="tabbar" aria-label="Hoofdmenu">
        {([['today', 'Spiegel', Icon.mirror], ['compass', 'Kompas', Icon.compass], ['self', 'Reis', Icon.mountain]] as const).map(([k, l, ic]) => (
          <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => go(k)} aria-current={tab === k ? 'page' : undefined}>
            <span className="tab-ico">{ic()}</span>
            <span>{l}</span>
          </button>
        ))}
      </nav>

      {mirror && (
        <div className="full dark"><div className="inner"><Mirror date={mirror} onClose={() => setMirror(null)} /></div></div>
      )}
      {shadow && (
        <div className="full dark"><div className="inner"><Shadow habitId={shadow.habitId} sin={shadow.sin} onClose={() => setShadow(null)} /></div></div>
      )}
      {urge && (
        <div className="full dark"><div className="inner"><Urge onClose={() => setUrge(false)} onShadow={(habitId) => { setUrge(false); setShadow({ habitId }) }} /></div></div>
      )}
    </div>
  )
}
