import { useEffect, useMemo, useState } from 'react'
import Plate, { StagePlate } from '../components/Plate'
import { Icon } from '../components/ui'
import { AFTER_GAVE_IN, AFTER_RESISTED, HELP_KEYS, NEEDS, NEED_BY_ID, SURF_LINES, VOICES, type NeedId } from '../data/urge'
import { IMG, SIN_BY_ID } from '../data/sins'
import { ALPHA, habitsFor } from '../lib/score'
import { buzz, setValue, todayISO, uid, update, useStore, type UrgeEvent } from '../lib/store'

type Step = 'pick' | 'level' | 'need' | 'voice' | 'film' | 'surf' | 'now' | 'act' | 'commit' | 'feel' | 'done'
const FLOW: Step[] = ['pick', 'level', 'need', 'voice', 'film', 'surf', 'now', 'act']

const daypart = (d: Date) => {
  const h = d.getHours()
  return h < 6 ? 'nacht' : h < 12 ? 'ochtend' : h < 18 ? 'middag' : 'avond'
}

const SURF_SECONDS = 90
const nl = (n: number) => n.toFixed(1).replace('.', ',')

/**
 * Het Drang-moment. Niet iemand eruit praten, maar de drang uit elkaar halen:
 * hoe sterk is hij, welke behoefte zit eronder, wat fluistert hij, waar leidt hij heen,
 * hoe voelt hij in je lijf, en wat doe je in plaats daarvan. Elke stap is één tik.
 */
export default function Urge({ onClose, onShadow }: { onClose: () => void; onShadow: (habitId?: string) => void }) {
  const s = useStore()
  const date = todayISO()
  const vices = s.habits.filter((h) => h.kind === 'vice')
  const [step, setStep] = useState<Step>(vices.length ? 'pick' : 'level')
  const [ev, setEv] = useState<UrgeEvent>(() => ({ id: uid(), at: new Date().toISOString() }))
  const set = (patch: Partial<UrgeEvent>) => setEv((e) => ({ ...e, ...patch }))
  const go = (st: Step) => {
    buzz(8)
    setStep(st)
  }
  const next = () => {
    const i = FLOW.indexOf(step)
    go(FLOW[Math.min(FLOW.length - 1, i + 1)])
  }

  const habit = s.habits.find((h) => h.id === ev.habitId)
  const sin = habit ? SIN_BY_ID[habit.sin] : undefined
  const need = ev.need ? NEED_BY_ID[ev.need as NeedId] : undefined

  // Wat je eerder voelde na toegeven of na doorstaan: je eigen bewijs, geen preek.
  const memory = useMemo(() => {
    const past = (s.urgeLog ?? []).filter((e) => e.feeling && (!ev.habitId || e.habitId === ev.habitId))
    const tally = (o: UrgeEvent['outcome']) => {
      const c: Record<string, number> = {}
      past.filter((e) => e.outcome === o).forEach((e) => { c[e.feeling!] = (c[e.feeling!] ?? 0) + 1 })
      return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 3)
    }
    return { gaveIn: tally('gave-in'), resisted: tally('resisted') }
  }, [s.urgeLog, ev.habitId])

  // Patroon: welke behoefte zit er meestal onder op dit moment van de dag?
  const pattern = useMemo(() => {
    const part = daypart(new Date())
    const same = (s.urgeLog ?? []).filter((e) => e.need && daypart(new Date(e.at)) === part)
    if (same.length < 3) return null
    const c: Record<string, number> = {}
    same.forEach((e) => { c[e.need!] = (c[e.need!] ?? 0) + 1 })
    const [top, n] = Object.entries(c).sort((a, b) => b[1] - a[1])[0]
    return { part, need: NEED_BY_ID[top as NeedId], n, total: same.length }
  }, [s.urgeLog])

  // Wat deze keuze vandaag met je balans doet (zelfde formule als de score).
  const impact = useMemo(() => {
    const total = habitsFor(s, date).reduce((a, h) => a + h.weight, 0) || 1
    const w = habit?.weight ?? 2
    return { lose: (ALPHA * 100 * (2 * w)) / total, gain: ALPHA * 100 * 0.1 }
  }, [s, date, habit])

  const finish = (outcome: 'resisted' | 'gave-in') => {
    buzz(outcome === 'resisted' ? 30 : 10)
    set({ outcome })
    if (outcome === 'resisted') {
      update((d) => {
        const log = (d.logs[date] ??= { v: {} })
        log.urges = (log.urges ?? 0) + 1
      })
    } else if (habit) {
      const cur = s.logs[date]?.v[habit.id] ?? 0
      setValue(date, habit.id, habit.type === 'limit' ? Math.max(cur, habit.amount ?? 0) + (habit.step ?? 1) : 1)
    }
    setStep('feel')
  }

  const save = (feeling?: string) => {
    const final = { ...ev, feeling }
    update((d) => {
      ;(d.urgeLog ??= []).unshift(final)
      if (final.outcome === 'resisted') {
        const what = habit ? habit.name.toLowerCase() : 'iets'
        const drop = final.before && final.after !== undefined ? ` (${final.before} → ${final.after})` : ''
        d.jar.unshift({ id: uid(), text: `Drang naar ${what} doorstaan${drop}`, date })
      }
    })
    setEv(final)
    setStep('done')
  }

  const progress = FLOW.indexOf(step)
  const showHelp = (ev.before ?? 0) >= 9 || (ev.need === 'empty' && (ev.before ?? 0) >= 7)

  return (
    <div className="mirror" style={{ position: 'relative', overflow: 'hidden' }}>
      {sin && (step === 'voice' || step === 'film') && (
        <img src={sin.sinImg} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)', opacity: 0.16, pointerEvents: 'none' }} />
      )}
      <div className="hstack between" style={{ position: 'relative' }}>
        <div className="eyebrow">Drang{habit ? ` · ${habit.name}` : ''}</div>
        <button className="iconbtn" onClick={onClose} aria-label="Sluiten" style={{ color: '#F2F2F2' }}>{Icon.close()}</button>
      </div>
      {progress >= 0 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 8, position: 'relative' }}>
          {FLOW.map((_, k) => <i key={k} style={{ flex: 1, height: 2, borderRadius: 1, background: k <= progress ? '#F2F2F2' : 'rgba(242,242,242,.18)' }} />)}
        </div>
      )}

      <div className="q" key={step} style={{ position: 'relative' }}>
        {step === 'pick' && (
          <>
            <div className="big">Goed dat je hier bent in plaats van dáár.</div>
            <div style={{ color: 'var(--ink-2)' }}>Waar trekt het aan?</div>
            <div className="chips" style={{ justifyContent: 'center' }}>
              {vices.map((v) => (
                <button key={v.id} className="chip" style={{ background: 'transparent', color: '#F2F2F2', borderColor: 'rgba(242,242,242,.3)' }} onClick={() => { set({ habitId: v.id }); go('level') }}>
                  {v.name}
                </button>
              ))}
              <button className="chip" style={{ background: 'transparent', color: 'var(--ink-2)', borderColor: 'rgba(242,242,242,.2)' }} onClick={() => go('level')}>Iets anders</button>
            </div>
            {pattern && (
              <p className="italic" style={{ color: 'var(--ink-2)', fontSize: 16, lineHeight: '24px', marginTop: 8 }}>
                Patroon: in de {pattern.part} zat er {pattern.n} van de {pattern.total} keer <b>{pattern.need.label.toLowerCase()}</b> onder.
              </p>
            )}
          </>
        )}

        {step === 'level' && (
          <>
            <div className="big">Hoe sterk trekt het, nu?</div>
            <div style={{ color: 'var(--ink-2)' }}>Eerlijk. 1 is een fluistering, 10 is een magneet.</div>
            <Scale value={ev.before} onPick={(n) => { set({ before: n }); go('need') }} />
          </>
        )}

        {step === 'need' && (
          <>
            <div className="big">Wat zit eronder?</div>
            <div style={{ color: 'var(--ink-2)' }}>Een drang is bijna altijd een snelle oplossing voor iets anders. Wat voel je eigenlijk?</div>
            <div className="chips" style={{ justifyContent: 'center' }}>
              {NEEDS.map((n) => (
                <button key={n.id} className="chip" style={{ background: 'transparent', color: '#F2F2F2', borderColor: pattern?.need.id === n.id ? '#F2F2F2' : 'rgba(242,242,242,.3)' }} onClick={() => { set({ need: n.id }); go('voice') }}>
                  {n.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'voice' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '84px 1fr', gap: 16, alignItems: 'center', textAlign: 'left' }}>
              <Plate src={IMG.shadow} alt="Je schaduw" />
              <div>
                <div className="big">Wat fluistert De Schim?</div>
                <div style={{ color: 'var(--ink-2)', fontSize: 13, lineHeight: '20px', marginTop: 4 }}>Het is een gedachte, geen bevel. Welke hoor je?</div>
              </div>
            </div>
            {ev.voice === undefined ? (
              <div className="stack gap-8" style={{ marginTop: 8 }}>
                {VOICES.map((v, i) => (
                  <button key={i} className="ans" style={{ height: 'auto', minHeight: 52, padding: '8px 16px', fontFamily: 'var(--title)', fontStyle: 'italic', fontSize: 16, lineHeight: '24px', fontWeight: 400, textAlign: 'left' }} onClick={() => { buzz(8); set({ voice: i }) }}>
                    “{v.says}”
                  </button>
                ))}
              </div>
            ) : (
              <div className="stack gap-16" style={{ marginTop: 8 }}>
                <p className="italic" style={{ color: 'var(--ink-2)', margin: 0, fontSize: 16, lineHeight: '24px' }}>De Schim: “{VOICES[ev.voice].says}”</p>
                <p className="big" style={{ margin: 0 }}>{VOICES[ev.voice].answer}</p>
                <p style={{ color: 'var(--ink-2)', margin: 0, fontSize: 13, lineHeight: '20px' }}>Zeg het in je hoofd: “Ik merk dat ik de gedachte heb dat …” Dan is het een gedachte, en geen waarheid meer.</p>
              </div>
            )}
          </>
        )}

        {step === 'film' && (
          <>
            <div className="big">Speel de film door.</div>
            <div style={{ color: 'var(--ink-2)' }}>
              {need ? <>Deze drang belooft je <b>{need.promise}</b>. Krijg je dat echt, of alleen 10 minuten?</> : 'Niet de eerste minuut. De tien minuten daarna, en morgenochtend.'}
            </div>
            {memory.gaveIn.length > 0 ? (
              <div style={{ borderTop: '1px solid rgba(242,242,242,.15)', paddingTop: 12 }}>
                <div className="eyebrow">Na toegeven voelde je je eerder</div>
                <div className="big" style={{ marginTop: 8 }}>{memory.gaveIn.map(([f, n]) => `${f.toLowerCase()} (${n}×)`).join(' · ')}</div>
              </div>
            ) : (
              <p className="italic" style={{ color: 'var(--ink-2)', margin: 0, fontSize: 16, lineHeight: '24px' }}>Denk aan de laatste keer. Hoe voelde je je een kwartier later?</p>
            )}
            {memory.resisted.length > 0 && (
              <div>
                <div className="eyebrow">Na doorstaan voelde je je</div>
                <div className="big" style={{ marginTop: 8 }}>{memory.resisted.map(([f, n]) => `${f.toLowerCase()} (${n}×)`).join(' · ')}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
              {[[-85, 'Als toegeven je patroon wordt', `≈ −${nl(impact.lose)} vandaag`], [85, 'Als doorstaan je patroon wordt', `+${nl(impact.gain)} vandaag`]].map(([b, l, n]) => (
                <div key={l as string} className="stack gap-8">
                  <StagePlate balance={b as number} />
                  <div style={{ fontSize: 13, lineHeight: '20px', color: 'var(--ink-2)'}}>{l}</div>
                  <div style={{ fontFamily: 'var(--title)', fontWeight: 400, fontSize: 20, lineHeight: '28px' }}>{n}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'surf' && <Surf onDone={() => go('now')} />}

        {step === 'now' && (
          <>
            <div className="big">En nu? Hoe sterk is het?</div>
            {ev.before && <div style={{ color: 'var(--ink-2)' }}>Daarnet was het een {ev.before}.</div>}
            <Scale value={ev.after} onPick={(n) => { set({ after: n }); go('act') }} />
          </>
        )}

        {step === 'act' && (
          <>
            <div className="big">
              {ev.before && ev.after !== undefined && ev.after < ev.before
                ? `Van ${ev.before} naar ${ev.after}. Dat deed jij.`
                : 'Hij is er nog. Dat mag. Geef die energie een andere kant op.'}
            </div>
            <div style={{ color: 'var(--ink-2)' }}>{need ? `Wat je eigenlijk zoekt is ${need.promise}. Kies wat je nu doet:` : 'Kies wat je nu doet:'}</div>
            <div className="stack gap-8">
              {(need?.actions ?? ['20 push-ups, nu', 'Verander van ruimte', 'Stuur iemand een bericht']).map((a) => (
                <button key={a} className="ans" style={{ height: 'auto', minHeight: 60, padding: '12px 16px', textAlign: 'left', fontSize: 16, lineHeight: '24px' }} onClick={() => { set({ action: a }); go('commit') }}>
                  {a}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'commit' && (
          <>
            <div className="eyebrow">Nu</div>
            <div className="big">{ev.action}</div>
            <div style={{ color: 'var(--ink-2)' }}>Doe het meteen, voordat je hoofd gaat onderhandelen. Kom daarna terug.</div>
          </>
        )}

        {step === 'feel' && (
          <>
            <div className="big">{ev.outcome === 'resisted' ? 'Hoe voel je je nu?' : 'Eerlijk. Hoe voel je je nu?'}</div>
            <div style={{ color: 'var(--ink-2)' }}>Dit bewaar ik. De volgende keer laat ik het je zien, op het moment dat je het nodig hebt.</div>
            <div className="chips" style={{ justifyContent: 'center' }}>
              {(ev.outcome === 'resisted' ? AFTER_RESISTED : AFTER_GAVE_IN).map((f) => (
                <button key={f} className="chip" style={{ background: 'transparent', color: '#F2F2F2', borderColor: 'rgba(242,242,242,.3)' }} onClick={() => save(f)}>{f}</button>
              ))}
            </div>
            <button className="link" style={{ color: 'var(--ink-2)' }} onClick={() => save()}>Sla over</button>
          </>
        )}

        {step === 'done' && (
          <>
            <div className="big">{ev.outcome === 'resisted' ? 'Kijk wat je net deed. Dat ben jij ook.' : 'Gezien. Eén val is data, geen identiteit.'}</div>
            <div style={{ color: 'var(--ink-2)' }}>
              {ev.outcome === 'resisted'
                ? 'Het staat in je koektrommel. Elke golf die je uitzit, maakt de volgende vaak een fractie zwakker.'
                : 'Mis het nooit twee keer. De volgende keuze telt weer volledig.'}
            </div>
            {ev.outcome === 'gave-in' && habit && HELP_KEYS.some((k) => habit.id.startsWith(k + '-')) && (
              <p style={{ color: 'var(--ink-2)', fontSize: 13, lineHeight: '20px', margin: 0 }}>
                Gebeurt dit vaak? Hulp vragen is geen zwakte, het is strategie. Jellinek (jellinek.nl) helpt bij middelen en gedrag, Loket Kansspel (loketkansspel.nl) bij gokken.
              </p>
            )}
          </>
        )}
      </div>

      {showHelp && step !== 'done' && (
        <p style={{ position: 'relative', color: 'var(--ink-2)', fontSize: 13, lineHeight: '20px', textAlign: 'center', margin: '0 0 8px' }}>
          Wordt het je te zwaar? Praat met iemand: 113 Zelfmoordpreventie, 0800-0113 (gratis, dag en nacht).
        </p>
      )}

      <div style={{ position: 'relative' }}>
        {step === 'voice' && ev.voice !== undefined && <button className="ans yes" style={{ width: '100%', height: 60 }} onClick={next}>Verder</button>}
        {step === 'film' && <button className="ans yes" style={{ width: '100%', height: 60 }} onClick={next}>Ik zie het. Nu de golf.</button>}
        {step === 'commit' && (
          <div className="stack gap-8">
            <button className="ans yes" style={{ width: '100%', height: 64 }} onClick={() => finish('resisted')}>Ik heb het doorstaan</button>
            <button className="ans" style={{ width: '100%', height: 52, fontSize: 16, lineHeight: '24px' }} onClick={() => go('surf')}>Hij is er nog. Nog een golf.</button>
          </div>
        )}
        {step === 'done' && (
          <div className="stack gap-8">
            {ev.outcome === 'gave-in' && <button className="ans yes" style={{ width: '100%', height: 60 }} onClick={() => onShadow(ev.habitId)}>Vraag je schaduw wat hij zocht</button>}
            <button className={ev.outcome === 'gave-in' ? 'ans' : 'ans yes'} style={{ width: '100%', height: ev.outcome === 'gave-in' ? 52 : 60 }} onClick={onClose}>Terug</button>
          </div>
        )}
        {(['level', 'need', 'voice', 'film', 'now', 'act', 'commit'] as Step[]).includes(step) && (
          <div className="hstack between" style={{ marginTop: 8 }}>
            <button className="link" style={{ color: 'var(--ink-3)', padding: 8 }} onClick={() => finish('gave-in')}>Ik gaf toe. Eerlijk noteren.</button>
            {step !== 'commit' && !(step === 'voice' && ev.voice !== undefined) && step !== 'film' && (
              <button className="link" style={{ color: 'var(--ink-3)', padding: 8 }} onClick={next}>Sla over</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Scale({ value, onPick }: { value?: number; onPick: (n: number) => void }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 8 }}>
      {Array.from({ length: 10 }).map((_, i) => {
        const n = i + 1
        const on = value === n
        return (
          <button
            key={n}
            onClick={() => onPick(n)}
            aria-label={`Sterkte ${n}`}
            style={{
              height: 56, borderRadius: 16, fontFamily: 'var(--title)', fontWeight: 400, fontSize: 20,
              border: '1.5px solid rgba(242,242,242,.25)',
              background: on ? '#F2F2F2' : `rgba(242,242,242,${0.02 + i * 0.022})`,
              color: on ? '#0B0B0B' : '#F2F2F2',
            }}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

/** Urge surfing: 90 seconden ademen (4 in, 6 uit) met aandacht in het lijf. */
function Surf({ onDone }: { onDone: () => void }) {
  const [t0] = useState(() => performance.now())
  const [now, setNow] = useState(t0)
  useEffect(() => {
    let raf = 0
    const tick = (n: number) => {
      setNow(n)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const el = (now - t0) / 1000
  const left = Math.max(0, Math.ceil(SURF_SECONDS - el))
  const cyc = el % 10
  const inhale = cyc < 4
  const scale = inhale ? 0.45 + 0.55 * (cyc / 4) : 1 - 0.55 * ((cyc - 4) / 6)
  const line = SURF_LINES[Math.min(SURF_LINES.length - 1, Math.floor(el / 15))]
  const over = left === 0
  return (
    <>
      <div className="eyebrow">Surf de golf</div>
      <div className="breath">
        <div className="orb" style={{ transform: `scale(${over ? 0.7 : scale})` }} />
        <div className="lbl">{over ? 'Geland' : inhale ? 'Adem in' : 'Adem uit'}</div>
      </div>
      <div style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--ink-2)' }}>{over ? 'De golf is geland.' : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}</div>
      <p className="italic" style={{ color: '#F2F2F2', minHeight: 52, margin: '4px 8px' }} key={line}>{line}</p>
      {/* De 40%-regel (Goggins): als je hoofd zegt dat je op bent, zit je pas op 40%. */}
      <div style={{ width: '100%', maxWidth: 300, margin: '0 auto' }} aria-label="Als je denkt dat je op bent, heb je nog 60% over">
        <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(242,242,242,.35)' }}>
          <div style={{ width: '40%', backgroundImage: 'repeating-linear-gradient(-45deg, transparent 0 3px, rgba(242,242,242,.35) 3px 4px)' }} />
          <div style={{ width: '60%', background: '#F2F2F2', animation: 'orb 2.8s ease-in-out infinite' }} />
        </div>
        <div className="hstack between" style={{ fontSize: 13, lineHeight: '20px', color: 'var(--ink-2)', marginTop: 8 }}>
          <span>Hier denk je dat je op bent</span>
          <span style={{ color: '#F2F2F2', fontWeight: 600 }}>Nog 60% in de tank</span>
        </div>
      </div>
      <button className="ans yes" style={{ width: '100%', height: 60 }} onClick={onDone}>{over ? 'Verder' : 'Ik ben er klaar voor'}</button>
    </>
  )
}
