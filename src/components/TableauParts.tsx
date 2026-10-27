import { RIGS } from '../data/tableaux'

/**
 * Een tafereel op ware grootte (627×627) met het ene deel dat beweegt. De ouder schaalt het:
 * in een medaillon, of los op een donkere achtergrond zoals op de kaart van je schaduw.
 */
export default function TableauParts({ name }: { name: string }) {
  const rig = RIGS[name]
  return (
    <>
      <img src={`/art/rig-${name}-basis.webp`} alt="" width={627} height={627} />
      {rig && (
        <img
          className={`rig rig-${rig.kind}`}
          src={`/art/${rig.file}.webp`}
          alt=""
          style={{ left: rig.piece[0], top: rig.piece[1], width: rig.size[0], height: rig.size[1], transformOrigin: rig.pivot ? `${rig.pivot[0] - rig.piece[0]}px ${rig.pivot[1] - rig.piece[1]}px` : '50% 0' }}
        />
      )}
      {/* Water dat blijft stromen: lichtbanden die door de straal naar beneden lopen */}
      {rig?.kind === 'pour' && <span className="rig-flow" style={{ left: rig.piece[0], top: rig.piece[1], width: rig.size[0], height: rig.size[1], maskImage: `url(/art/${rig.file}.webp)`, WebkitMaskImage: `url(/art/${rig.file}.webp)` }} />}
    </>
  )
}
