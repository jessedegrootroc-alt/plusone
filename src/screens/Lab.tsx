import { useState } from 'react'
import LivingScene from '../components/LivingScene'
import { FEATURES, type FeatureId } from '../data/catalog'
import type { ObjectId } from '../data/objects'
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
const MADE: { scene: 'inferno' | 'woud' | 'kust' | 'terrassen' | 'paradiso'; title: string; range: [number, number]; start: number; tabs?: boolean; goals?: boolean; objs?: boolean; sins?: boolean }[] = [
  { scene: 'inferno', title: 'I · Inferno', range: [-100, -60], start: -80, objs: true, sins: true },
  { scene: 'woud', title: 'II · Het donkere woud', range: [-60, -20], start: -40, sins: true },
  { scene: 'kust', title: 'III · De kust van de berg', range: [-20, 20], start: 0, objs: true },
  { scene: 'terrassen', title: 'IV · De terrassen', range: [20, 60], start: 40, tabs: true },
  { scene: 'paradiso', title: 'V · Paradiso', range: [60, 100], start: 85, goals: true },
]
const OBJECTS: ObjectId[] = ['telefoon', 'laptop', 'asbak', 'vape', 'drankfles', 'blikje', 'fastfood', 'snoep', 'dobbelstenen', 'speelkaarten', 'munten', 'boodschappentas', 'wekker', 'controller', 'afstandsbediening', 'gebroken-glas', 'brief', 'tijdschriften', 'handspiegel', 'kroon', 'masker']
const GOOD_OBJECTS: ObjectId[] = ['kettlebell', 'hardloopschoenen', 'ijsbad', 'saunaemmer', 'saunastenen', 'boeken', 'dagboek', 'kaars', 'meditatiekussen', 'fruitschaal', 'waterkruik', 'brood', 'spaarpot', 'lantaarn', 'pelgrimsstaf']
const SIN_NAMES: { id: SinId; name: string }[] = [
  { id: 'sloth', name: 'Traagheid' }, { id: 'greed', name: 'Hebzucht' }, { id: 'lust', name: 'Lust' }, { id: 'gluttony', name: 'Vraatzucht' },
  { id: 'wrath', name: 'Toorn' }, { id: 'envy', name: 'Afgunst' }, { id: 'pride', name: 'Hoogmoed' },
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
        <p className="lead">Schuif door de balans van elke scène. Op de terrassen kies je welke twee deugden er staan, in Paradiso welke doelen om je heen zweven, op de kust en in Inferno welke verleidingen er liggen, in Inferno en het woud welke zonden er staan.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 960, margin: '0 auto' }}>
        {MADE.map((m) => <GalleryScene key={m.scene} {...m} />)}
      </div>
    </div>
  )
}

function GalleryScene({ scene, title, range, start, tabs, goals, objs, sins }: (typeof MADE)[number]) {
  const [b, setB] = useState(start)
  const [pick, setPick] = useState<SinId[]>(['sloth', 'envy'])
  const [feat, setFeat] = useState<FeatureId[]>(['laurel', 'medal', 'sun'])
  const [obj, setObj] = useState<ObjectId[]>(['telefoon', 'drankfles', 'dobbelstenen'])
  const [weak, setWeak] = useState<SinId[]>(['greed', 'lust'])
  const [good, setGood] = useState<ObjectId>('kettlebell')
  const toggle = (id: SinId) => setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)))
  return (
    <div className="stack gap-12">
      <div className="h2">{title}</div>
      <div className="scene" style={{ aspectRatio: '9 / 14', maxHeight: '82dvh', borderRadius: 24 }}>
        <LivingScene key={scene + pick.join()} scene={scene} balance={b} strong={pick} features={feat} objects={obj} virtueObject={good} weak={weak} />
      </div>
      <div className="hstack between small"><span>{range[0] > 0 ? '+' : ''}{range[0]}</span><span>Balans {b > 0 ? '+' : ''}{b}</span><span>{range[1] > 0 ? '+' : ''}{range[1]}</span></div>
      <input type="range" min={range[0]} max={range[1]} value={b} onChange={(e) => setB(Number(e.target.value))} style={{ width: '100%', accentColor: '#F2F2F2' }} aria-label={`Balans ${title}`} />
      {scene === 'kust' && (
        <div className="chips">
          {GOOD_OBJECTS.map((o) => <button key={o} className={`chip ${good === o ? 'on' : ''}`} onClick={() => setGood(o)}>{o}</button>)}
        </div>
      )}
      {sins && (
        <div className="chips">
          {SIN_NAMES.map((v) => <button key={v.id} className={`chip ${weak.includes(v.id) ? 'on' : ''}`} onClick={() => setWeak((p) => (p.includes(v.id) ? p.filter((x) => x !== v.id) : [...p, v.id].slice(-2)))}>{v.name}</button>)}
        </div>
      )}
      {objs && (
        <div className="chips">
          {OBJECTS.map((o) => <button key={o} className={`chip ${obj.includes(o) ? 'on' : ''}`} onClick={() => setObj((p) => (p.includes(o) ? p.filter((x) => x !== o) : [o, ...p].slice(0, 3)))}>{o.replace('-', ' ')}</button>)}
        </div>
      )}
      {goals && (
        <div className="chips">
          {FEATURES.map((f) => <button key={f.id} className={`chip ${feat.includes(f.id) ? 'on' : ''}`} onClick={() => setFeat((p) => (p.includes(f.id) ? p.filter((x) => x !== f.id) : [...p, f.id]))}>{f.name}</button>)}
        </div>
      )}
      {tabs && (
        <div className="chips">
          {VIRTUES.map((v) => <button key={v.id} className={`chip ${pick.includes(v.id) ? 'on' : ''}`} onClick={() => toggle(v.id)}>{v.name}</button>)}
        </div>
      )}
    </div>
  )
}
