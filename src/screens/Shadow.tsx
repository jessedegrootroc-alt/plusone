import { useMemo, useState } from 'react'
import Plate, { StagePlate } from '../components/Plate'
import { Icon } from '../components/ui'
import { JUNG_LINE, SHADOW, TRAITS } from '../data/shadow'
import { IMG, SINS, SIN_BY_ID, type SinId } from '../data/sins'
import { computeSeries } from '../lib/score'
import { buzz, uid, update, useStore } from '../lib/store'

type Step = 'wish' | 'other' | 'speak' | 'project' | 'gold' | 'merge'

/**
 * Het schaduwgesprek (naar Jung). Niet vechten tegen wat je wilt, maar vragen wat het eigenlijk zoekt.
 * Visueel: jij en je schaduw staan tegenover elkaar en komen per stap dichterbij,
 * tot de schaduw weer gewoon jouw schaduw is.
 */
export default function Shadow({ habitId, sin: presetSin, onClose }: { habitId?: string; sin?: SinId; onClose: () => void }) {
  const s = useStore()
  const balance = useMemo(() => computeSeries(s).balance, [s])
  const preset = s.habits.find((h) => h.id === habitId)
  const [step, setStep] = useState<Step>(preset || presetSin ? 'speak' : 'wish')
  const [sin, setSin] = useState<SinId | null>(preset?.sin ?? presetSin ?? null)
  const [hid, setHid] = useState<string | undefined>(preset?.id)
  const [projection, setProjection] = useState(false)
  const [trait, setTrait] = useState<string | null>(null)
  const [way, setWay] = useState<string | null>(null)
  const habit = s.habits.find((h) => h.id === hid)
  const voice = sin ? SHADOW[sin] : null
  const vices = s.habits.filter((h) => h.kind === 'vice')

  const go = (st: Step) => {
    buzz(8)
    setStep(st)
  }

  const merge = (w: string) => {
    setWay(w)
    buzz(30)
    update((d) => {
      ;(d.shadowLog ??= []).unshift({ id: uid(), at: new Date().toISOString(), habitId: hid, sin: sin!, projection, trait: trait ?? undefined, way: w })
    })
    setStep('merge')
  }

  // Twee platen tegenover elkaar: je schaduw en jij. Per stap komen ze dichterbij; bij verzoening vloeien ze samen.
  const pos: Record<Step, { sx: number; so: number; yx: number; yo: number }> = {
    wish: { sx: -56, so: 0.4, yx: 56, yo: 1 },
    other: { sx: -56, so: 0.4, yx: 56, yo: 1 },
    speak: { sx: -52, so: 1, yx: 56, yo: 0.5 },
    project: { sx: -52, so: 0.6, yx: 52, yo: 0.6 },
    gold: { sx: -26, so: 0.9, yx: 26, yo: 0.9 },
    merge: { sx: 0, so: 0, yx: 0, yo: 0 },
  }
  const p = pos[step]

  return (
    <div className="mirror" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="hstack between" style={{ position: 'relative', zIndex: 2 }}>
        <div className="eyebrow">Schaduwgesprek</div>
        <button className="iconbtn" onClick={onClose} aria-label="Sluiten" style={{ color: '#F2F2F2' }}>{Icon.close()}</button>
      </div>

      {/* Het toneel: Doré's gevallen engel tegenover de plaat van je toestand */}
      <div className="sg-stage" aria-hidden="true">
        <Plate src={IMG.shadow} className="sg-plate" style={{ transform: `translateX(${p.sx}%)`, opacity: p.so }} />
        <StagePlate balance={balance} className="sg-plate" style={{ transform: `translateX(${p.yx}%)`, opacity: p.yo }} />
        {step === 'project' && <StagePlate balance={balance} className="sg-plate sg-mirror" />}
        <div className={`sg-orb ${step === 'gold' ? 'on' : ''}`} />
        <Plate src={IMG.blessing} className="sg-plate sg-merge" style={{ opacity: step === 'merge' ? 1 : 0 }} />
      </div>

      <div className="q" key={step} style={{ position: 'relative', zIndex: 2, flex: 'none', paddingTop: 8 }}>
        {step === 'wish' && (
          <>
            <div className="big">Wat wil je nu?</div>
            <div className="chips" style={{ justifyContent: 'center' }}>
              {vices.map((v) => (
                <button key={v.id} className="chip sg-chip" onClick={() => { setHid(v.id); setSin(v.sin); go('speak') }}>{v.name}</button>
              ))}
              <button className="chip sg-chip" onClick={() => { setSin('wrath'); setProjection(true); go('speak') }}>Ik ben boos op iemand</button>
              <button className="chip sg-chip" onClick={() => { setSin('envy'); setProjection(true); go('speak') }}>Ik ben jaloers op iemand</button>
              <button className="chip sg-chip" style={{ opacity: 0.7 }} onClick={() => go('other')}>Iets anders</button>
            </div>
          </>
        )}

        {step === 'other' && (
          <>
            <div className="big">Wat zoekt het eigenlijk?</div>
            <div className="chips" style={{ justifyContent: 'center' }}>
              {SINS.map((x) => (
                <button key={x.id} className="chip sg-chip" onClick={() => { setSin(x.id); go('speak') }}>{SHADOW[x.id].gold}</button>
              ))}
            </div>
          </>
        )}

        {step === 'speak' && voice && (
          <>
            <div className="eyebrow">Je schaduw</div>
            {(habit || projection) && (
              <p className="italic" style={{ color: 'var(--ink-2)', margin: 0, fontSize: 16, lineHeight: '24px' }}>
                “Het gaat me niet om {projection ? 'die ander' : habit!.name.toLowerCase()}.”
              </p>
            )}
            <div className="big">“{voice.need}”</div>
          </>
        )}

        {step === 'project' && (
          <>
            <div className="big">Wat zie je in die ander?</div>
            <div className="chips" style={{ justifyContent: 'center' }}>
              {TRAITS.map((t) => (
                <button key={t} className="chip sg-chip" onClick={() => { setTrait(t); go('gold') }}>{t}</button>
              ))}
            </div>
          </>
        )}

        {step === 'gold' && voice && (
          <>
            <div className="eyebrow">Het goud in je schaduw</div>
            <div className="big">{trait ?? voice.gold}</div>
            <div style={{ color: 'var(--ink-2)', fontSize: 16, lineHeight: '24px' }}>{trait ? 'Wat je in de ander ziet, woont ook in jou. Hoe geef je het zelf ruimte?' : 'Geef het bewust, dan hoeft het niet stiekem.'}</div>
            <div className="stack gap-8" style={{ marginTop: 4 }}>
              {voice.ways.map((w) => (
                <button key={w} className="ans" style={{ height: 'auto', minHeight: 56, padding: '12px 16px', fontSize: 16, lineHeight: '24px' }} onClick={() => merge(w)}>{w}</button>
              ))}
            </div>
          </>
        )}

        {step === 'merge' && (
          <>
            <div className="big">Wat je erkent, verliest zijn greep.</div>
            <div style={{ color: 'var(--ink-2)', fontSize: 16, lineHeight: '24px' }}>Nu: <b>{way}</b></div>
            <p className="italic" style={{ color: 'var(--ink-2)', margin: '8px 0 0', fontSize: 16, lineHeight: '24px' }}>“{JUNG_LINE}” <span style={{ fontStyle: 'normal', fontSize: 13, lineHeight: '20px' }}>naar C.G. Jung</span></p>
          </>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto' }}>
        {step === 'speak' && <button className="ans yes" style={{ width: '100%', height: 60 }} onClick={() => go(projection ? 'project' : 'gold')}>Ik hoor je</button>}
        {step === 'merge' && <button className="ans yes" style={{ width: '100%', height: 60 }} onClick={onClose}>Terug</button>}
        {sin && step !== 'merge' && step !== 'wish' && (
          <div className="small center" style={{ color: 'var(--ink-3)', marginTop: 8 }}>{SIN_BY_ID[sin].sin} · {SIN_BY_ID[sin].sinLatin}</div>
        )}
      </div>
    </div>
  )
}
