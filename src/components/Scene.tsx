import { useEffect, useRef, useState } from 'react'
import type { FeatureId } from '../data/catalog'
import type { ObjectId } from '../data/objects'
import { stageFor, type SinId } from '../data/sins'
import LivingScene from './LivingScene'

/**
 * De levende scène: jij in je plek, eindeloos in beweging. Alle lagen, licht en beweging
 * zitten in LivingScene; dit is alleen de lijst eromheen en het tikken naar het Spiegelmoment.
 * Er ligt bewust geen oude plaat onder: tot de beelden klaar zijn is het zwart, daarna staat de scène er meteen.
 * Wissel je van scène, dan loopt er een inktvlek over het beeld; daarachter wisselt de plek.
 */
export default function Scene({ balance, onTap, strong, features, objects, virtueObject, weak }: {
  balance: number
  /** Je twee sterkste deugden, voor de taferelen op de terrassen. */
  strong?: SinId[]
  /** Je doelen, als emblemen in Paradiso. */
  features?: FeatureId[]
  /** De voorwerpen van je verleidingen. */
  objects?: ObjectId[]
  /** Het voorwerp van je sterkste goede gewoonte. */
  virtueObject?: ObjectId
  /** Je twee zwakste terrassen, als zondetafereel in Inferno en het woud. */
  weak?: SinId[]
  onTap?: () => void
  /** Lading van de schaduw, 0–1. Nog niet zichtbaar in de levende scène. */
  shadow?: number
}) {
  const stage = stageFor(balance)
  const [shown, setShown] = useState(stage.scene)
  const [ink, setInk] = useState(0)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (stage.scene === shown) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(stage.scene); return }
    // De vlek loopt uit (0,45 s), de scène wisselt erachter, en de vlek trekt weer weg
    setInk(1)
    const a = setTimeout(() => { setShown(stage.scene); setInk(2) }, 450)
    const b = setTimeout(() => setInk(0), 1250)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [stage.scene, shown])
  const showStage = stageFor(shown === stage.scene ? balance : ({ inferno: -80, woud: -40, kust: 0, terrassen: 40, paradiso: 80 } as const)[shown])
  return (
    <div
      className="scene"
      role={onTap ? 'button' : 'img'}
      tabIndex={onTap ? 0 : undefined}
      aria-label={`${showStage.name}, ${showStage.place}`}
      onClick={onTap}
      onKeyDown={(e) => onTap && (e.key === 'Enter' || e.key === ' ') && onTap()}
    >
      <LivingScene key={shown} scene={shown} balance={balance} strong={strong} features={features} objects={objects} virtueObject={virtueObject} weak={weak} />
      {ink > 0 && <div className={`ink-wipe ${ink === 1 ? 'in' : 'out'}`} aria-hidden="true" />}
    </div>
  )
}
