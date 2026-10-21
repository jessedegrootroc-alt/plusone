import Plate from '../components/Plate'
import { Icon } from '../components/ui'
import { FEATURES, type FeatureId } from '../data/catalog'
import { IMG } from '../data/sins'
import { buzz, type AvatarConfig } from '../lib/store'

/**
 * Je ideale zelf: de ridder (Doré) en de kenmerken die je wilt verdienen.
 * Elk kenmerk staat voor een concreet doel; het uiterlijk komt uit de Doré-platen.
 */
export default function Builder({ value, onChange }: { value: AvatarConfig; onChange: (v: AvatarConfig) => void }) {
  const toggle = (f: FeatureId) => {
    buzz()
    const has = value.features.includes(f)
    onChange({ ...value, features: has ? value.features.filter((x) => x !== f) : [...value.features, f] })
  }

  return (
    <div className="stack gap-24">
      <Plate src={IMG.oath} alt="Gustave Doré: een ridder draagt zijn zwaard op" ratio="4 / 5" />
      <div className="stack gap-8">
        <div className="h2">Wat ga je verdienen?</div>
        <p className="small">Elk kenmerk krijgt een concreet doel. Je ziet het pas als je ernaartoe leeft.</p>
      </div>
      <div className="list">
        {FEATURES.map((f) => {
          const on = value.features.includes(f.id)
          return (
            <button key={f.id} className="row" onClick={() => toggle(f.id)} aria-pressed={on}>
              <div className="grow">
                <div className="name">{f.name}</div>
                <div className="small">{f.meaning}</div>
              </div>
              <div className={`check ${on ? 'on' : ''}`}>{on && Icon.check('#0B0B0B')}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
