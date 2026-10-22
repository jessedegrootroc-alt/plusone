import type { FeatureId } from '../data/catalog'
import { stageFor, type SinId } from '../data/sins'
import LivingScene from './LivingScene'

/**
 * De levende scène: jij in je plek, eindeloos in beweging. Alle lagen, licht en beweging
 * zitten in LivingScene; dit is alleen de lijst eromheen en het tikken naar het Spiegelmoment.
 * Er ligt bewust geen oude plaat onder: tot de beelden klaar zijn is het zwart, daarna staat de scène er meteen.
 */
export default function Scene({ balance, onTap, strong, features }: {
  balance: number
  /** Je twee sterkste deugden, voor de taferelen op de terrassen. */
  strong?: SinId[]
  /** Je doelen, als emblemen in Paradiso. */
  features?: FeatureId[]
  onTap?: () => void
  /** Lading van de schaduw, 0–1. Nog niet zichtbaar in de levende scène. */
  shadow?: number
}) {
  const stage = stageFor(balance)
  return (
    <div
      className="scene"
      role={onTap ? 'button' : 'img'}
      tabIndex={onTap ? 0 : undefined}
      aria-label={`${stage.name}, ${stage.place}`}
      onClick={onTap}
      onKeyDown={(e) => onTap && (e.key === 'Enter' || e.key === ' ') && onTap()}
    >
      <LivingScene key={stage.scene} scene={stage.scene} balance={balance} strong={strong} features={features} />
    </div>
  )
}
