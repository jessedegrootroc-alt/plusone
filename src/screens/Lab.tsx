import { useState } from 'react'
import LivingScene from '../components/LivingScene'
import { stageFor, type SinId } from '../data/sins'

/** Werkbank voor de levende scène: open de app met ?lab (en eventueel &deugden=lust,gluttony). Schuif door de balans. */
export default function Lab() {
  const [b, setB] = useState(0)
  const strong = (new URLSearchParams(location.search).get('deugden') ?? '').split(',').filter(Boolean) as SinId[]
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#000', padding: 16 }}>
      <div className="stack gap-16" style={{ width: '100%', maxWidth: 430, margin: '0 auto' }}>
        <div className="scene" style={{ aspectRatio: '9 / 14', maxHeight: '78dvh', borderRadius: 24 }}>
          <LivingScene key={stageFor(b).scene} scene={stageFor(b).scene} balance={b} strong={strong} />
        </div>
        <div className="hstack between small"><span>−100 · Inferno</span><span>{stageFor(b).name} · {b > 0 ? '+' : ''}{b}</span><span>Paradiso · +100</span></div>
        <input type="range" min={-100} max={100} value={b} onChange={(e) => setB(Number(e.target.value))} style={{ width: '100%', accentColor: '#F2F2F2' }} aria-label="Balans" />
      </div>
    </div>
  )
}

// De scènes waarvoor je eigen illustraties al klaar zijn, met het bereik van hun balans
const MADE: { scene: 'kust' | 'terrassen'; title: string; range: [number, number]; start: number; tabs?: boolean }[] = [
  { scene: 'kust', title: 'III · De kust van de berg', range: [-20, 20], start: 0 },
  { scene: 'terrassen', title: 'IV · De terrassen', range: [20, 60], start: 40, tabs: true },
]
const VIRTUES: { id: SinId; name: string }[] = [
  { id: 'sloth', name: 'IJver' }, { id: 'envy', name: 'Welwillendheid' }, { id: 'gluttony', name: 'Matigheid' }, { id: 'pride', name: 'Nederigheid' },
  { id: 'lust', name: 'Zuiverheid' }, { id: 'wrath', name: 'Geduld' }, { id: 'greed', name: 'Vrijgevigheid' },
]

/** Alle scènes met eigen illustraties naast elkaar: open de app met ?scenes. */
export function Gallery() {
  return (
    <div style={{ minHeight: '100dvh', background: '#000', padding: '32px 16px 64px' }}>
      <div className="stack gap-8" style={{ maxWidth: 960, margin: '0 auto 24px' }}>
        <div className="eyebrow">Werkende scènes</div>
        <h1 className="h1">Jouw illustraties, levend.</h1>
        <p className="lead">Schuif door de balans van elke scène. Op de terrassen kies je welke twee deugden er staan.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 960, margin: '0 auto' }}>
        {MADE.map((m) => <GalleryScene key={m.scene} {...m} />)}
      </div>
    </div>
  )
}

function GalleryScene({ scene, title, range, start, tabs }: (typeof MADE)[number]) {
  const [b, setB] = useState(start)
  const [pick, setPick] = useState<SinId[]>(['sloth', 'envy'])
  const toggle = (id: SinId) => setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)))
  return (
    <div className="stack gap-12">
      <div className="h2">{title}</div>
      <div className="scene" style={{ aspectRatio: '9 / 14', maxHeight: '82dvh', borderRadius: 24 }}>
        <LivingScene key={scene + pick.join()} scene={scene} balance={b} strong={pick} />
      </div>
      <div className="hstack between small"><span>{range[0]}</span><span>Balans {b > 0 ? '+' : ''}{b}</span><span>+{range[1]}</span></div>
      <input type="range" min={range[0]} max={range[1]} value={b} onChange={(e) => setB(Number(e.target.value))} style={{ width: '100%', accentColor: '#F2F2F2' }} aria-label={`Balans ${title}`} />
      {tabs && (
        <div className="chips">
          {VIRTUES.map((v) => <button key={v.id} className={`chip ${pick.includes(v.id) ? 'on' : ''}`} onClick={() => toggle(v.id)}>{v.name}</button>)}
        </div>
      )}
    </div>
  )
}
