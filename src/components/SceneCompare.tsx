import { useMemo, type ReactNode } from 'react'
import LivingScene from './LivingScene'
import { ClimbCaption } from './Climb'
import { pullingObjects, strongestVirtueObject } from '../data/objects'
import { SINS, stageFor } from '../data/sins'
import { climbOf, wonStats } from '../lib/days'
import { aimedFeatures, earnedFeatures } from '../lib/emblems'
import { computeSeries } from '../lib/score'
import { useStore } from '../lib/store'

/**
 * Waar je nu staat naast je ideale zelf: twee levende scènes naast elkaar, en daaronder de berg als balk.
 * Zo zie je in één blik het verschil tussen wie je nu bent en wie je wordt. Staat op Vandaag en in Reis.
 */
export default function SceneCompare({ children }: { children?: ReactNode }) {
  const s = useStore()
  const series = useMemo(() => computeSeries(s), [s])
  const pulling = useMemo(() => pullingObjects(s), [s])
  const goodObject = useMemo(() => strongestVirtueObject(s), [s])
  const bySin = (dir: 1 | -1) => SINS.filter((x) => s.habits.some((h) => h.sin === x.id)).sort((a, b) => dir * (series.perSin[a.id] - series.perSin[b.id])).slice(0, 2).map((x) => x.id)
  const strongest = bySin(-1)
  const climb = climbOf(wonStats(s))
  return (
    <div className="card scene-compare" style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="stack gap-8">
          <div className="mini-scene" role="img" aria-label="Waar je nu staat op de berg">
            <LivingScene scene={stageFor(climb).scene} balance={climb} strong={strongest} features={earnedFeatures(s)} objects={pulling} virtueObject={goodObject} weak={bySin(1)} />
          </div>
          <div className="caption">Nu</div>
        </div>
        <div className="stack gap-8">
          <div className="mini-scene" role="img" aria-label="Je ideale zelf: Paradiso">
            <LivingScene scene="paradiso" balance={100} strong={strongest} features={aimedFeatures(s)} />
          </div>
          <div className="caption">Je ideale zelf</div>
        </div>
      </div>
      <ClimbCaption balance={climb} />
      {children}
    </div>
  )
}
