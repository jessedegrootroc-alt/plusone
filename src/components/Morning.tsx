import { useState } from 'react'
import { buzz, todayISO, update, type State } from '../lib/store'
import { canRecord, clipKey } from '../lib/voice'
import { Playback, Recorder } from './Recorder'
import { wakeTime } from '../lib/wake'

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
 * De opnames blijven op je telefoon. Kan je telefoon niet opnemen, of wil je niet praten, dan typ je het.
 */
export function MorningFlow({ s, onDone }: { s: State; onDone: () => void }) {
  const today = todayISO()
  const m = s.logs[today]?.morning
  const [dread, setDread] = useState(m?.dread ?? '')
  const [strong, setStrong] = useState('')
  const [step, setStep] = useState<'dread' | 'strong'>(m?.dread || m?.dreadClip ? 'strong' : 'dread')
  const [typing, setTyping] = useState(!canRecord())
  const hasDread = !!(m?.dreadClip || dread.trim())
  const hasStrong = !!(m?.strongClip || strong.trim())

  const save = (patch: NonNullable<typeof m>) => update((d) => {
    const l = (d.logs[today] ??= { v: {} })
    l.morning = { ...l.morning, ...patch }
  })

  return (
    <div className="stack gap-16 morning">
      <div className="eyebrow">Ochtend · {step === 'dread' ? '1' : '2'} van 2</div>
      {step === 'dread' ? (
        <>
          <div className="stack gap-4">
            <h2 className="h2">Wat zegt de zachte stem in je hoofd?</h2>
            <p className="small">Alles eruit: het gezeur, de smoesjes, de moeheid. Hardop.</p>
          </div>
          {canRecord() && <Recorder clip={clipKey(today, 'dread')} label="Neem het op" onSaved={() => save({ dreadClip: true })} />}
          {typing ? (
            <textarea className="input" rows={3} value={dread} onChange={(e) => setDread(e.target.value)} placeholder="Bijv. te koud, te moe, morgen wel" aria-label="Typ wat je hoofd zegt" />
          ) : <button className="link" onClick={() => setTyping(true)}>Liever typen</button>}
          <button className="btn" disabled={!hasDread} onClick={() => { buzz(10); if (dread.trim()) save({ dread: dread.trim() }); setStep('strong') }}>Verder</button>
          <button className="link center" onClick={() => { save({ skipped: true }); onDone() }}>Niet vandaag</button>
        </>
      ) : (
        <>
          <div className="stack gap-8">
            {m?.dreadClip && <Playback clip={clipKey(today, 'dread')} label="Luister hoe het klinkt" />}
            {(dread || m?.dread) && <p className="morning-dread">“{dread || m?.dread}”</p>}
          </div>
          <div className="stack gap-4">
            <h2 className="h2">Hoor hoe dat klinkt. Nu praat jij terug.</h2>
            <p className="small">Zoals je een maat wakker schudt. Geen medelijden, wel respect.</p>
          </div>
          {canRecord() && <Recorder clip={clipKey(today, 'strong')} label="Neem de sterke versie op" onSaved={() => save({ strongClip: true })} />}
          {typing ? (
            <textarea className="input" rows={3} value={strong} onChange={(e) => setStrong(e.target.value)} placeholder="Bijv. koud duurt tien minuten. Niemand doet dit voor je. Op." aria-label="Typ de sterke versie" />
          ) : <button className="link" onClick={() => setTyping(true)}>Liever typen</button>}
          <button className="btn" disabled={!hasStrong} onClick={() => { buzz(14); if (strong.trim()) save({ strong: strong.trim() }); onDone() }}>Op. Nu.</button>
        </>
      )}
    </div>
  )
}
