import { useState } from 'react'
import Plate, { StagePlate } from '../components/Plate'
import { RockIcon } from '../components/Jar'
import { HoldButton, Icon, Sheet, fmt, useTween } from '../components/ui'
import { FEATURES, ROCK_PLURAL, ROCK_SHORT, type HabitTemplate } from '../data/catalog'
import { IMG, SINS } from '../data/sins'
import { DEFAULT_AVATAR, buzz, fromTemplate, todayISO, uid, update, type AvatarConfig, type Goal, type Habit } from '../lib/store'
import Builder from './Builder'
import HabitEditor from './HabitEditor'
import HabitPicker from '../components/HabitPicker'
import { scrollToTop } from '../lib/scroll'

const STEPS = 9

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [why, setWhy] = useState('')
  const [picked, setPicked] = useState<Record<string, Habit>>({})
  const [custom, setCustom] = useState<null | 'vice' | 'virtue'>(null)
  const [avatar, setAvatar] = useState<AvatarConfig>({ ...DEFAULT_AVATAR })
  const [goals, setGoals] = useState<Record<string, string>>({})

  const next = () => { buzz(); setStep((s) => Math.min(STEPS - 1, s + 1)); scrollToTop() }
  const back = () => { setStep((s) => Math.max(0, s - 1)); scrollToTop() }

  const toggle = (t: HabitTemplate) => {
    buzz()
    setPicked((p) => {
      const n = { ...p }
      if (n[t.key]) delete n[t.key]
      else n[t.key] = fromTemplate(t)
      return n
    })
  }
  const setAmount = (key: string, amount: number) => setPicked((p) => ({ ...p, [key]: { ...p[key], amount: Math.max(0, amount) } }))

  const vices = Object.values(picked).filter((h) => h.kind === 'vice')
  const virtues = Object.values(picked).filter((h) => h.kind === 'virtue')
  const bigCount = virtues.filter((h) => h.weight === 3).length

  const finish = () => {
    const goalList: Goal[] = avatar.features.map((f) => ({ id: uid(), feature: f, text: goals[f]?.trim() || FEATURES.find((x) => x.id === f)!.meaning }))
    update((d) => {
      d.name = name.trim()
      d.why = why.trim()
      d.habits = Object.values(picked)
      d.avatar = avatar
      d.goals = goalList
      d.createdAt = todayISO()
      d.onboarded = true
    })
  }

  // Splash
  if (step === 0) {
    return (
      <div className="hero-img" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#0B0B0B' }}>
        <img src={IMG.forest} alt="Gustave Doré: Dante verdwaald in het donkere woud" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '109%', objectPosition: 'center top' }} />
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', padding: '0 24px calc(env(safe-area-inset-bottom) + 32px)', color: '#F7F7F5', animation: 'fadeUp .8s var(--ease) both' }}>
          <div className="eyebrow" style={{ color: 'rgba(247, 247, 245, .65)' }}>Inferno · Canto I</div>
          <p className="italic" style={{ color: '#F7F7F5', fontSize: 20, lineHeight: '28px', margin: '8px 0 24px' }}>
            “Halverwege de reis van ons leven bevond ik mij in een donker woud, want het rechte pad was ik kwijt.”
          </p>
          <h1 className="display">PlusOne</h1>
          <p className="lead" style={{ color: 'rgba(247, 247, 245, .8)', marginTop: 8 }}>Elke dag één keuze. Omhoog of omlaag.</p>
          <button className="btn light mt-32" onClick={next}>Begin de klim</button>
          <div className="small center mt-16" style={{ color: 'rgba(247, 247, 245, .5)' }}>Illustraties: Gustave Doré, publiek domein</div>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ paddingBottom: 140 }}>
      <div className="hstack between" style={{ marginBottom: 24, gap: 12 }}>
        <button className="iconbtn" onClick={back} aria-label="Terug" style={{ marginLeft: -8 }}>{Icon.back()}</button>
        <div className="progress" style={{ flex: 1 }}>
          {Array.from({ length: STEPS - 1 }).map((_, i) => <i key={i} className={i < step ? 'on' : ''} />)}
        </div>
        <div style={{ width: 34 }} />
      </div>

      <div key={step} style={{ animation: 'fadeUp .45s var(--ease) both' }}>
        {step === 1 && <Concept />}

        {step === 2 && (
          <div className="stack gap-24">
            <div className="stack gap-8">
              <div className="eyebrow">De spiegel</div>
              <h1 className="h1">Wees eerlijk. Niemand kijkt mee.</h1>
              <p className="lead">Deze app werkt alleen als je niet tegen jezelf liegt. Alles blijft op je eigen telefoon.</p>
            </div>
            <div className="field">
              <label htmlFor="nm">Hoe heet je?</label>
              <input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Je voornaam" autoComplete="given-name" />
            </div>
            <div className="field">
              <label htmlFor="why">Waarom wil je veranderen?</label>
              <textarea id="why" className="textarea" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Niet wat je wilt bereiken, maar waaróm. Voor wie. Wat het je kost als je niks verandert." />
              <div className="small">Op zware dagen laten we je dit teruglezen. Schrijf het voor die dag.</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="stack gap-16">
            <div className="stack gap-8">
              <div className="eyebrow">Je schaduw</div>
              <h1 className="h1">Wat trekt je naar beneden?</h1>
              <p className="lead">Kies wat écht speelt. Je hoeft niets uit te leggen, alleen te benoemen.</p>
            </div>
            <PickStep mode="vice" picked={picked} toggle={toggle} setAmount={setAmount} />
            <CustomChips list={vices} onRemove={(id) => setPicked((p) => { const n = { ...p }; delete n[id]; return n })} />
            <button className="chip add" style={{ alignSelf: 'flex-start' }} onClick={() => setCustom('vice')}>{Icon.plus()} Eigen verleiding toevoegen</button>
          </div>
        )}

        {step === 4 && (
          <div className="stack gap-16">
            <div className="stack gap-8">
              <div className="eyebrow">Je licht</div>
              <h1 className="h1">Wat trekt je omhoog?</h1>
              <p className="lead">De goede gewoontes die je dagelijks wilt doen. Zo concreet mogelijk.</p>
            </div>
            <PickStep mode="virtue" picked={picked} toggle={toggle} setAmount={setAmount} />
            <CustomChips list={virtues} onRemove={(id) => setPicked((p) => { const n = { ...p }; delete n[id]; return n })} />
            <button className="chip add" style={{ alignSelf: 'flex-start' }} onClick={() => setCustom('virtue')}>{Icon.plus()} Eigen gewoonte toevoegen</button>
          </div>
        )}

        {step === 5 && (
          <div className="stack gap-16">
            <div className="stack gap-8">
              <div className="eyebrow">Grote stenen eerst</div>
              <h1 className="h1">Wat moet er écht in?</h1>
              <p className="lead">Stel je je dag voor als een pot. Gooi je eerst het zand erin (scrollen, mail, kleine klusjes), dan passen de grote stenen er niet meer bij. Leg je de grote stenen er eerst in, dan vult de rest de ruimte ertussen.</p>
            </div>
            <div className="card">
              <div className="stack gap-8">
                {([3, 2, 1] as const).map((sz) => (
                  <div key={sz} className="hstack" style={{ gap: 8, fontSize: 13, lineHeight: '20px'}}>
                    <RockIcon size={sz} />
                    <span style={{ flex: 1 }}>{ROCK_PLURAL[sz]}</span>
                    <b style={{ fontWeight: sz === 3 && bigCount > 3 ? 800 : undefined, textDecoration: sz === 3 && bigCount > 3 ? 'underline' : undefined }}>{virtues.filter((h) => h.weight === sz).length}</b>
                  </div>
                ))}
              </div>
            </div>
            <p className="small" style={{ margin: '0 4px', color: bigCount > 3 ? 'var(--ink)' : undefined, fontWeight: bigCount > 3 ? 600 : undefined }}>
              {bigCount > 3 ? `${bigCount} grote stenen. Als alles groot is, is niets groot. Kies er hooguit drie.` : 'Kies hooguit drie grote stenen: de dingen die je dag maken of breken.'}
            </p>
            <div className="list">
              {virtues.map((h) => (
                <div key={h.id} className="row" style={{ minHeight: 58, flexWrap: 'wrap', rowGap: 8 }}>
                  <div className="grow" style={{ minWidth: 140 }}><div className="name">{h.name}</div></div>
                  <div className="seg" style={{ padding: 4 }}>
                    {([3, 2, 1] as const).map((sz) => (
                      <button key={sz} className={h.weight === sz ? 'on' : ''} style={{ height: 32, padding: '0 8px', fontSize: 13, lineHeight: '20px'}} onClick={() => { buzz(); setPicked((p) => { const key = Object.keys(p).find((k) => p[k].id === h.id)!; return { ...p, [key]: { ...p[key], weight: sz } } }) }}>
                        {ROCK_SHORT[sz]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="stack gap-16">
            <div className="stack gap-8">
              <div className="eyebrow">Je ideale zelf</div>
              <h1 className="h1">Wie word je?</h1>
              <p className="lead">Je ideale zelf is de ridder: niet perfect, maar trouw aan zijn eed.</p>
            </div>
            <Builder value={avatar} onChange={setAvatar} />
          </div>
        )}

        {step === 7 && (
          <div className="stack gap-16">
            <div className="stack gap-8">
              <div className="eyebrow">Je doelen</div>
              <h1 className="h1">Maak het meetbaar.</h1>
              <p className="lead">Elk kenmerk van je ideale zelf krijgt een concreet doel. Vaag is vrijblijvend.</p>
            </div>
            {avatar.features.length === 0 && (
              <div className="card" style={{ padding: 16 }}>
                <p className="lead" style={{ margin: 0 }}>Je hebt nog geen kenmerken gekozen.</p>
                <button className="link mt-8" onClick={back}>Terug naar je ideale zelf</button>
              </div>
            )}
            {avatar.features.map((f) => {
              const meta = FEATURES.find((x) => x.id === f)!
              return (
                <div key={f} className="field">
                  <label htmlFor={'g' + f}>{meta.name}: <span style={{ fontWeight: 400 }}>{meta.meaning.toLowerCase()}</span></label>
                  <input id={'g' + f} className="input" value={goals[f] ?? ''} placeholder={meta.placeholder} onChange={(e) => setGoals((g) => ({ ...g, [f]: e.target.value }))} />
                </div>
              )
            })}
          </div>
        )}

        {step === 8 && (
          <div className="stack gap-24">
            <Plate src={IMG.oath} alt="Gustave Doré: een ridder draagt zijn zwaard op" ratio="4 / 5" style={{ width: '72%', margin: '0 auto' }} />
            <div className="stack gap-8 center">
              <div className="eyebrow">Het contract</div>
              <h1 className="h1">{name ? `${name}, dit` : 'Dit'} is de deal.</h1>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <ol className="lead" style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
                <li>Ik kijk elke avond eerlijk in de spiegel. Ook als het lelijk is.</li>
                <li>Grote stenen eerst. Pas daarna het zand.</li>
                <li>Eén slechte dag is data, geen identiteit. Ik mis nooit twee keer.</li>
                <li>Ik zoek geen excuses. Ik zoek de volgende stap.</li>
              </ol>
            </div>
            <div className="small center">
              {bigCount} grote stenen · {virtues.length} goede gewoontes · {vices.length} verleidingen · {avatar.features.length} doelen
            </div>
          </div>
        )}
      </div>

      <div className="dock" style={{ position: 'fixed', left: 0, right: 0, margin: '0 auto', bottom: 0, width: '100%', maxWidth: 460, padding: '16px 20px calc(env(safe-area-inset-bottom) + 18px)', background: 'linear-gradient(180deg, rgba(11, 11, 11, 0), var(--paper) 28%)', zIndex: 10 }}>
        {step === 3 && <div className="small center" style={{ marginBottom: 8 }}>{vices.length ? `${vices.length} gekozen` : 'Niks? Dan ben je eerlijk, of nog niet.'}</div>}
        {step === 4 && (
          <div className="small center" style={{ marginBottom: 8, color: virtues.length > 8 ? 'var(--ink)' : undefined, fontWeight: virtues.length > 8 ? 600 : undefined }}>
            {virtues.length > 8 ? `${virtues.length} gekozen. Ambitieus. Begin liever met ±5 en bouw op.` : `${virtues.length} gekozen`}
          </div>
        )}
        {step < STEPS - 1 ? (
          <button className="btn" onClick={next} disabled={(step === 2 && !name.trim()) || (step === 4 && virtues.length === 0)}>
            {step === 1 ? 'Ik snap het' : 'Verder'}
          </button>
        ) : (
          <HoldButton label="Houd vast om te tekenen" onDone={finish} />
        )}
      </div>

      {custom && (
        <Sheet onClose={() => setCustom(null)}>
          <HabitEditor
            kind={custom}
            onCancel={() => setCustom(null)}
            onSave={(h) => { setPicked((p) => ({ ...p, [h.id]: h })); setCustom(null) }}
          />
        </Sheet>
      )}
    </div>
  )
}

function Concept() {
  const [b, setB] = useState(0)
  const tb = useTween(b, 900)
  const label = b <= -60 ? 'De Schim' : b >= 60 ? 'Je Ideale Zelf' : 'Jij, nu'
  return (
    <div className="stack gap-24">
      <div className="stack gap-8">
        <div className="eyebrow">Hoe het werkt</div>
        <h1 className="h1">Je lichaam volgt je gewoontes. Langzaam. Eerlijk.</h1>
      </div>
      <StagePlate balance={tb} style={{ width: '72%', margin: '0 auto' }} />
      <div className="stack gap-8">
        <div className="caption">{label}</div>
        <input type="range" min={-100} max={100} value={b} onChange={(e) => setB(Number(e.target.value))} aria-label="Probeer de balans" style={{ width: '100%', accentColor: '#F2F2F2' }} />
        <div className="redline-labels"><span>Inferno</span><span>Paradiso</span></div>
      </div>
      <div className="stack gap-12">
        <p className="lead">Elke dag weeg je je goede gewoontes tegen je verleidingen. Geef je toe, dan glijd je langzaam richting <b>de Schim</b>: gebogen, uitgehold, vastgeklampt aan het scherm. Houd je vol, dan groei je naar <b>je ideale zelf</b>.</p>
        <p className="lead">De <b>morele lijn</b> loopt langs de zeven hoofdzonden, met tegenover elke zonde een deugd.</p>
      </div>
      <div className="stack gap-4">
        {SINS.map((s) => (
          <div key={s.id} className="hstack between" style={{ padding: '8px 4px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'var(--title)', fontWeight: 400, fontSize: 16, lineHeight: '24px'}}>{s.sin}</span>
            <span style={{ flex: 1, height: 1, background: 'var(--ink)', margin: '0 12px', opacity: 0.35 }} />
            <span style={{ fontFamily: 'var(--title)', fontSize: 16, lineHeight: '24px', fontWeight: 400 }}>{s.virtue}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomChips({ list, onRemove }: { list: Habit[]; onRemove: (id: string) => void }) {
  const own = list.filter((h) => h.id.startsWith('custom-'))
  if (!own.length) return null
  return (
    <div className="stack gap-8 mt-16">
      <div className="eyebrow">Eigen</div>
      <div className="chips">
        {own.map((h) => (
          <button key={h.id} className="chip on" onClick={() => onRemove(h.id)} aria-label={`${h.name} verwijderen`}>
            {h.name} {Icon.close()}
          </button>
        ))}
      </div>
    </div>
  )
}

function PickStep({ mode, picked, toggle, setAmount }: {
  mode: 'vice' | 'virtue'
  picked: Record<string, Habit>
  toggle: (t: HabitTemplate) => void
  setAmount: (key: string, n: number) => void
}) {
  const counted = Object.entries(picked).filter(([, h]) => h.kind === mode && (h.type === 'limit' || h.type === 'target'))
  return (
    <section className="stack gap-16">
      <Plate src={mode === 'vice' ? IMG.haunted : IMG.climb} alt="" ratio="16 / 9" />
      <HabitPicker kind={mode} isPicked={(t) => !!picked[t.key]} toggle={toggle} />
      {counted.length > 0 && (
        <div className="list">
          {counted.map(([key, h]) => {
            const step = h.step ?? 1
            return (
              <div key={key} className="row" style={{ minHeight: 56 }}>
                <div className="grow">
                  <div className="name" style={{ fontSize: 13, lineHeight: '20px'}}>{h.name}</div>
                  <div className="meta">{h.type === 'limit' ? 'Maximaal per dag' : 'Minimaal per dag'}</div>
                </div>
                <div className="stepper">
                  <button aria-label="Minder" onClick={() => setAmount(key, (h.amount ?? 0) - step)}>{Icon.minus()}</button>
                  <div className="val">{fmt(h.amount ?? 0)}<small>{h.unit}</small></div>
                  <button aria-label="Meer" onClick={() => setAmount(key, (h.amount ?? 0) + step)}>{Icon.plus()}</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
