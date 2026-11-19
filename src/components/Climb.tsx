import { STAGES, stageFor } from '../data/sins'

const SHORT: Record<string, string> = { inferno: 'Inferno', woud: 'Woud', kust: 'Kust', terrassen: 'Terrassen', paradiso: 'Paradiso' }

/** De plek op de berg, kort. */
const PLACE: Record<string, string> = { inferno: 'Inferno', woud: 'Het woud', kust: 'De kust', terrassen: 'De terrassen', paradiso: 'Paradiso' }

/**
 * Wat de scène betekent, in één oogopslag (zoals Duolingo en Brilliant een reeks tonen: groot, met een paar woorden):
 * je plek groot, de berg als balk van Inferno tot Paradiso, en vier woorden over hoe je klimt.
 */
export function ClimbCaption({ balance }: { balance: number }) {
  const stage = stageFor(balance)
  const at = STAGES.indexOf(stage)
  return (
    <div className="climb-cap">
      <div className="climb-head">
        <span className="climb-place">{PLACE[stage.scene]}</span>
        <span className="climb-hint">Win om te klimmen</span>
      </div>
      <ol className="climb-track" aria-label={`Je staat op plek ${at + 1} van ${STAGES.length}, van Inferno naar Paradiso`}>
        {STAGES.map((st, k) => (
          <li key={st.scene} className={k === at ? 'on' : k < at ? 'past' : ''} aria-hidden="true">
            <i />
            <span>{SHORT[st.scene]}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
