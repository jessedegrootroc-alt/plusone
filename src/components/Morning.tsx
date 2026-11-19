import { useState } from 'react'
import { buzz, todayISO, update, type State } from '../lib/store'
import { canRecord, clipKey } from '../lib/voice'
import { Playback, Recorder } from './Recorder'
import { wakeTime } from '../lib/wake'
import { Icon } from './ui'

const minutes = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m }

/** Of het ochtendmoment nu past: van een uur voor tot drie uur na je opstaantijd. */
export const inMorningWindow = (s: State, now = new Date()) => {
  const t = now.getHours() * 60 + now.getMinutes()
  const w = minutes(wakeTime(s))
  return t >= w - 60 && t <= w + 180
}

/** Het ochtendmoment is klaar als er een sterke versie is: opgenomen of getypt. */
export const morningDone = (m?: State['logs'][string]['morning']) => !!(m?.strong || m?.strongClip)

/**
 * Het ochtendmoment (Goggins, Evolution 2): neem bij het wakker worden op wat je hoofd zegt, ook het zwakke.
 * Luister het terug, en neem dan de sterke versie op, zoals je een maat wakker schudt. Dertig seconden.
 * Twee stappen, en je ziet altijd waar je bent: na je eerste opname schuift de app zelf door naar je antwoord.
 * De opnames blijven op je telefoon. Kan je telefoon niet opnemen, of wil je niet praten, dan typ je het.
 */
export function MorningFlow({ s, onDone }: { s: State; onDone: () => void }) {
  const today = todayISO()
  const m = s.logs[today]?.morning
  const [dread, setDread] = useState(m?.dread ?? '')
  const [strong, setStrong] = useState(m?.strong ?? '')
  const [step, setStep] = useState<'dread' | 'strong'>(m?.dread || m?.dreadClip ? 'strong' : 'dread')
  const [typing, setTyping] = useState(!canRecord())
  // Net opgenomen: even laten zien dat het staat, dan door naar stap 2
  const [moving, setMoving] = useState(false)
  // Je antwoord opnieuw opnemen
  const [redo, setRedo] = useState(false)
  const hasDread = !!(m?.dreadClip || dread.trim())
  const hasStrong = !!(m?.strongClip || strong.trim())
  const mic = canRecord()

  const save = (patch: NonNullable<typeof m>) => update((d) => {
    const l = (d.logs[today] ??= { v: {} })
    l.morning = { ...l.morning, ...patch }
  })
  const toStrong = () => { buzz(10); if (dread.trim()) save({ dread: dread.trim() }); setStep('strong') }
  const dreadRecorded = () => {
    save({ dreadClip: true })
    setMoving(true)
    window.setTimeout(() => { setMoving(false); setStep('strong') }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1200)
  }
  const finish = () => { buzz(14); if (strong.trim()) save({ strong: strong.trim() }); onDone() }
  const typeToggle = mic && <button className="link" onClick={() => setTyping((x) => !x)}>{typing ? 'Toch opnemen' : 'Liever typen'}</button>

  return (
    <div className="stack gap-16 morning">
      <ol className="mf-steps" aria-label={`Stap ${step === 'dread' ? 1 : 2} van 2`}>
        <li className={step === 'dread' ? 'on' : 'done'}><i /><span>1 · De zachte stem</span></li>
        <li className={step === 'strong' ? 'on' : ''}><i /><span>2 · Jouw antwoord</span></li>
      </ol>

      {step === 'dread' ? (
        <>
          <div className="stack gap-4">
            <h2 className="h2">Wat zegt de zachte stem in je hoofd?</h2>
            <p className="small" style={{ margin: 0 }}>Het gezeur, de smoesjes, de moeheid. Zeg het hardop. Daarna praat jij terug.</p>
          </div>
          {moving ? (
            <div className="mf-moving" role="status">
              <span className="mf-ok" aria-hidden="true">{Icon.check('#0B0B0B')}</span>
              <span>Opgenomen.</span>
              <span className="mf-next">Nu praat jij terug…</span>
            </div>
          ) : typing ? (
            <textarea className="input" rows={3} autoFocus value={dread} onChange={(e) => setDread(e.target.value)} placeholder="Bijv. te koud, te moe, morgen wel" aria-label="Typ wat je hoofd zegt" />
          ) : (
            <Recorder clip={clipKey(today, 'dread')} label="Tik en zeg het hardop" onSaved={dreadRecorded} />
          )}
          {!moving && (
            <>
              <button className="btn" disabled={!hasDread} onClick={toStrong}>Volgende: praat terug</button>
              <div className="mf-links">
                {typeToggle || <span />}
                <button className="link" onClick={() => { save({ skipped: true }); onDone() }}>Niet vandaag</button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="stack gap-4">
            <h2 className="h2">Nu praat jij terug.</h2>
            <p className="small" style={{ margin: 0 }}>Luister eerst hoe die stem klinkt. Antwoord dan zoals je een maat wakker schudt: geen medelijden, wel respect.</p>
          </div>
          {m?.dreadClip && <Playback clip={clipKey(today, 'dread')} label="Luister: zo klinkt je zachte stem" />}
          {(dread || m?.dread) && <p className="morning-dread">“{dread || m?.dread}”</p>}
          {typing ? (
            <textarea className="input" rows={3} autoFocus value={strong} onChange={(e) => setStrong(e.target.value)} placeholder="Bijv. koud duurt tien minuten. Niemand doet dit voor je. Op." aria-label="Typ je antwoord" />
          ) : m?.strongClip && !redo ? (
            <div className="mf-done">
              <div className="mf-saved"><span className="mf-ok sm" aria-hidden="true">{Icon.check('#0B0B0B')}</span><span><b>Je antwoord staat.</b> Dit hoor je terug op Vandaag.</span></div>
              <Playback clip={clipKey(today, 'strong')} label="Luister je antwoord terug" />
              <button className="link" onClick={() => setRedo(true)}>Opnieuw opnemen</button>
            </div>
          ) : (
            <Recorder clip={clipKey(today, 'strong')} label="Tik en praat terug" fresh={redo} onSaved={() => { save({ strongClip: true }); setRedo(false) }} />
          )}
          <button className="btn" disabled={!hasStrong} onClick={finish}>{hasStrong ? 'Klaar. Op. Nu.' : typing ? 'Typ eerst je antwoord' : 'Neem eerst je antwoord op'}</button>
          <div className="mf-links">
            <button className="link" onClick={() => setStep('dread')}>Terug</button>
            {typeToggle}
          </div>
        </>
      )}
    </div>
  )
}
