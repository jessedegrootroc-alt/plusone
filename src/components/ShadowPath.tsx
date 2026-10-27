import { useId, type CSSProperties } from 'react'
import { ART } from '../data/tableaux'
import type { SinMeta } from '../data/sins'
import TableauParts from './TableauParts'

const FIG = 150 // hoe groot elk tafereel op de kaart staat
const MOTES = [58, 66, 74, 82, 90, 96]

/**
 * Je zwakste terras als één rustige scène: één achtergrond, links in de schaduw met mist over de grond,
 * daar staat de zonde; rechts in het licht met stralen en opstijgend stof, daar staat de deugd.
 * Een lichtje loopt het pad van de een naar de ander.
 * Alles beweegt op één maat van 12 seconden (of een deel daarvan), zodat de lus naadloos is.
 */
export default function ShadowPath({ meta, onOpen }: { meta: SinMeta; onOpen: () => void }) {
  const id = useId().replace(/:/g, '')
  const [virtue, sin] = ART[meta.id]
  const k = { '--k': FIG / 627 } as CSSProperties
  const path = 'M 116 276 C 148 286, 182 262, 214 254'
  return (
    <button className="card mt-16 ps" onClick={onOpen} aria-label={`Hier zit je schaduw het sterkst: ${meta.sin}, op weg naar ${meta.virtue}`}>
      {/* Eén achtergrond: de verre lucht van de terrassen, links in de schaduw, rechts in het licht */}
      <span className="ps-bg" aria-hidden="true" />
      <span className="ps-shade" aria-hidden="true" />
      <span className="ps-rays" aria-hidden="true" />
      <span className="ps-glow" aria-hidden="true" />

      <div className="ps-fig sin" style={k}><span className="ps-shadow" /><div className="ps-art"><TableauParts name={sin} /></div></div>
      <div className="ps-fig virtue" style={k}><span className="ps-shadow" /><div className="ps-art"><TableauParts name={virtue} /></div></div>

      <svg className="ps-path" viewBox="0 0 327 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path id={`p${id}`} d={path} fill="none" stroke="#F2F2F2" strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="1.5 5" strokeLinecap="round" />
        <image href="/art/effect-lichtje.webp" width="18" height="20" x="-9" y="-10">
          <animateMotion dur="6s" repeatCount="indefinite" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines="0.45 0 0.55 1">
            <mpath href={`#p${id}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="6s" repeatCount="indefinite" />
        </image>
      </svg>

      <span className="ps-mist" aria-hidden="true" />
      <span className="ps-motes" aria-hidden="true">{MOTES.map((x, i) => <img key={i} src="/art/effect-stofje.webp" alt="" style={{ left: `${x}%`, animationDelay: `${-i * 2}s` }} />)}</span>
      <span className="ps-vignette" aria-hidden="true" />

      <div className="txt">
        <div className="eyebrow">Hier zit je schaduw het sterkst</div>
        <div className="h2">{meta.sin} <span style={{ color: 'var(--ink-3)' }}>→</span> {meta.virtue}</div>
      </div>
    </button>
  )
}
