import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import LivingScene from './LivingScene'
import { ClimbCaption } from './Climb'
import { pullingObjects, strongestVirtueObject } from '../data/objects'
import { SINS, STAGES, stageFor } from '../data/sins'
import { climbOf, wonStats } from '../lib/days'
import { aimedFeatures, earnedFeatures } from '../lib/emblems'
import { computeSeries } from '../lib/score'
import { useStore } from '../lib/store'
import { Icon } from './ui'

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
  const stage = stageFor(climb)
  // Tik op een scène: hij gaat schermvullend open, met wat je ziet en waar je staat
  const [full, setFull] = useState<null | 'nu' | 'ideaal'>(null)
  useEffect(() => {
    if (!full) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [full])
  const nowScene = <LivingScene scene={stage.scene} balance={climb} strong={strongest} features={earnedFeatures(s)} objects={pulling} virtueObject={goodObject} weak={bySin(1)} />
  const idealScene = <LivingScene scene="paradiso" balance={100} strong={strongest} features={aimedFeatures(s)} />
  const paradiso = STAGES[STAGES.length - 1]
  return (
    <div className="card scene-compare" style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="stack gap-8">
          <button className="mini-scene" onClick={() => setFull('nu')} aria-label={`Waar je nu staat: ${stage.place}. Tik voor volledig scherm.`}>
            {!full && nowScene}
          </button>
          <div className="caption">Nu</div>
        </div>
        <div className="stack gap-8">
          <button className="mini-scene" onClick={() => setFull('ideaal')} aria-label="Je ideale zelf: Paradiso. Tik voor volledig scherm.">
            {!full && idealScene}
          </button>
          <div className="caption">Je ideale zelf</div>
        </div>
      </div>
      <ClimbCaption balance={climb} />
      {children}

      {/* Via een portal naar de body: anders zit het vast in de kaart (die beweegt bij het inladen) en onder de tabbalk */}
      {full && createPortal(
        <div className="scene-full" role="dialog" aria-modal="true" aria-label={full === 'nu' ? `Nu: ${stage.place}` : 'Je ideale zelf'}>
          <div className="scene-full-art">{full === 'nu' ? nowScene : idealScene}</div>
          <button className="scene-full-x" onClick={() => setFull(null)} aria-label="Sluiten">{Icon.close()}</button>
          <div className="scene-full-cap">
            <div className="eyebrow">{full === 'nu' ? 'Nu' : 'Je ideale zelf'}</div>
            <h2 className="scene-full-title">{full === 'nu' ? stage.place : paradiso.place}</h2>
            <p className="scene-full-line">{full === 'nu' ? stage.line : paradiso.line}</p>
            {full === 'nu' && <ClimbCaption balance={climb} />}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
