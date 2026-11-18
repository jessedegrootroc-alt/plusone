import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import Plate from '../components/Plate'
import { HoldButton, Icon, Sheet, fmt } from '../components/ui'
import { type HabitTemplate } from '../data/catalog'
import { IMG, doreAlt } from '../data/sins'
import { buzz, fromTemplate, todayISO, uid, update, type Habit, type MirrorNote } from '../lib/store'
import { noteFromGoal } from '../lib/emblems'
import { scheduleLabel } from '../lib/days'
import { countdownLabel, needsDate } from '../lib/goal'
import { enableNotify, notifySupported } from '../lib/notify'
import { isWakeHabit, setWakeTime, shortTime } from '../lib/wake'
import { DOMAIN_BY_ID, planFor, type Domain } from '../data/ladders'
import HabitEditor from './HabitEditor'
import HabitPicker from '../components/HabitPicker'
import { scrollToTop } from '../lib/scroll'

/*
 * De start van de app als een korte reeks vragen: één vraag per scherm, grote keuzes, en bij één keuze meteen door.
 * Daarna bouwt de app zichtbaar je plan (de lijn van je dag tekent zichzelf), laat het plan zien, en teken je de deal.
 *
 *   naam → de spiegel (vier delen van je leven) → per zwak deel de harde waarheid → wat houdt je tegen
 *   → waar sta je nu → (verleidingen) → opstaan → doel → waarom → je plan wordt gebouwd → je plan → de deal
 *
 * De spiegel is die van Goggins: fysiek, mentaal, financieel en emotioneel. Je geeft elk deel een eerlijk cijfer;
 * de twee zwakste krijgen een vervolgvraag. Elk antwoord wordt een post-it op je spiegel en een taak voor elke dag.
 */

type Area = 'fysiek' | 'mentaal' | 'financieel' | 'emotioneel'
type StepId = 'splash' | 'name' | 'mirror' | `area-${Area}` | 'obstacle' | 'level' | 'vices' | 'wake' | 'goal' | 'why' | 'build' | 'plan' | 'deal'
type Rating = 'sterk' | 'matig' | 'slecht'
/** Wanneer een taak op je dag hoort. Zo komt hij in je plan en op Vandaag op de goede plek. */
type Part = 'ochtend' | 'overdag' | 'avond'
const isQuestion = (x: StepId) => !['splash', 'build', 'plan', 'deal'].includes(x)

const RATINGS: { id: Rating; label: string }[] = [
  { id: 'sterk', label: 'Sterk' },
  { id: 'matig', label: 'Kan beter' },
  { id: 'slecht', label: 'Slecht' },
]

/** De vier delen. Per deel vier harde waarheden; elk met de post-it die op je spiegel komt en de taak die erbij hoort. */
const AREAS: { id: Area; domain: Domain; label: string; sub: string; q: string; options: { id: string; label: string; truth: string; task: string; part: Part; at?: string }[] }[] = [
  { id: 'fysiek', domain: 'fysiek', label: 'Fysiek', sub: 'Je lichaam: kracht, conditie, gewicht, slaap', q: 'Fysiek. Wat zie je echt in de spiegel?', options: [
    { id: 'beweeg', label: 'Ik beweeg bijna niet', truth: 'Je lichaam doet bijna niets. Dat verandert vandaag.', task: 'Elke dag 30 minuten bewegen', part: 'overdag' },
    { id: 'zwaar', label: 'Ik ben te zwaar', truth: 'Je bent te zwaar, en je weet het.', task: 'Elke dag 10.000 stappen', part: 'overdag' },
    { id: 'zacht', label: 'Ik train, maar te zacht', truth: 'Je traint, maar je zoekt nooit je grens op.', task: 'Eén training per dag die pijn doet', part: 'overdag' },
    { id: 'slaap', label: 'Ik slaap slecht', truth: 'Je slaapt slecht en betaalt er elke dag voor.', task: 'Telefoon de slaapkamer uit', part: 'avond', at: '22:00' },
  ] },
  { id: 'mentaal', domain: 'mentaal', label: 'Mentaal', sub: 'Je hoofd: discipline, focus, twijfel, uitstel', q: 'Mentaal. Waar breek je?', options: [
    { id: 'opgeven', label: 'Ik geef op als het zwaar wordt', truth: 'Je stopt op het moment dat het pijn gaat doen.', task: 'Elke dag één ding dat je liever overslaat', part: 'overdag' },
    { id: 'uitstel', label: 'Ik stel uit wat ertoe doet', truth: 'Je stelt uit wat het meest telt.', task: 'Het zwaarste ding als eerste', part: 'ochtend', at: '09:00' },
    { id: 'twijfel', label: 'Ik twijfel aan mezelf', truth: 'Je gelooft je twijfel meer dan je bewijs.', task: 'Eén overwinning in je koektrommel', part: 'avond', at: '21:00' },
    { id: 'scherm', label: 'Mijn telefoon heeft mijn aandacht', truth: 'Je telefoon krijgt meer van je aandacht dan jij zelf.', task: 'Het eerste uur zonder telefoon', part: 'ochtend' },
  ] },
  { id: 'financieel', domain: 'financieel', label: 'Financieel', sub: 'Je geld: schulden, sparen, inkomen', q: 'Financieel. Hoe staat het er echt voor?', options: [
    { id: 'uitgeven', label: 'Ik geef meer uit dan ik verdien', truth: 'Er gaat meer uit dan er binnenkomt.', task: 'Je uitgaven van vandaag opschrijven', part: 'avond', at: '21:00' },
    { id: 'schuld', label: 'Ik heb schulden', truth: 'Je schulden nemen je beslissingen.', task: '15 minuten aan je aflosplan', part: 'overdag' },
    { id: 'sparen', label: 'Ik spaar niets', truth: 'Je hebt geen buffer. Eén tegenvaller en je staat klem.', task: '€5 opzij zetten', part: 'ochtend' },
    { id: 'groei', label: 'Ik verdien minder dan ik kan', truth: 'Je verdient minder dan je waard bent.', task: 'Een uur aan je volgende stap', part: 'overdag' },
  ] },
  { id: 'emotioneel', domain: 'spiritueel', label: 'Emotioneel', sub: 'Je binnenkant: wat je verdooft, wat je meedraagt', q: 'Emotioneel. Wat draag je mee?', options: [
    { id: 'verdoof', label: 'Ik verdoof het met eten, drank of schermen', truth: 'Je verdooft wat je niet wilt voelen.', task: '10 minuten stil, zonder afleiding', part: 'ochtend' },
    { id: 'pijn', label: 'Ik draag oude pijn mee', truth: 'Je laat je verleden je toekomst kiezen.', task: 'Opschrijven wat je dwarszit', part: 'avond', at: '21:30' },
    { id: 'alleen', label: 'Ik sta er alleen voor', truth: 'Niemand weet hoe het echt met je gaat.', task: 'Eén eerlijk gesprek', part: 'overdag' },
    { id: 'boos', label: 'Ik word snel boos', truth: 'Je woede beslist voordat jij dat doet.', task: 'Terugkijken: waar werd ik boos, en waarom?', part: 'avond', at: '21:30' },
  ] },
]
const AREA_BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a])) as Record<Area, (typeof AREAS)[number]>
const wakeHabit = (): Habit => ({ id: 'schema-' + uid(), name: '6:30 op', sin: 'sloth', kind: 'virtue', type: 'do', weight: 3, at: '06:30', wake: true })

/** Wat je tegenhoudt, met het als-dan-plan dat erbij hoort. Het komt bij je doel te staan. */
const OBSTACLES = [
  { id: 'uitstel', label: 'Ik stel het uit', when: 'ik wil uitstellen', then: 'begin ik twee minuten. Nu, niet straks.' },
  { id: 'afhaken', label: 'Ik begin sterk en haak dan af', when: 'ik wil afhaken', then: 'doe ik de kleinste versie. Nooit twee keer missen.' },
  { id: 'scherm', label: 'Mijn telefoon', when: 'mijn telefoon trekt', then: 'leg ik hem in een andere kamer.' },
  { id: 'moe', label: 'Ik ben te moe', when: 'ik te moe ben', then: 'doe ik tien minuten. Moe is geen reden.' },
  { id: 'tijd', label: 'Ik heb geen tijd', when: 'ik geen tijd heb', then: 'doe ik het voordat de rest van de dag begint.' },
] as const

/** Waar je staat bepaalt hoeveel grote taken je elke dag doet (opstaan telt mee): beter één die je doet dan drie die je mist. */
const LEVELS = [
  { id: 'beginner', label: 'Beginner', sub: 'Eén of twee taken per dag. Eerst leren winnen.', min: 1, max: 2 },
  { id: 'gemiddeld', label: 'Gemiddeld', sub: 'Twee of drie taken per dag. Deze keer hou je vol.', min: 2, max: 3 },
  { id: 'expert', label: 'Expert', sub: 'Drie of vier taken per dag. Geen ruimte voor smoesjes.', min: 3, max: 4 },
] as const
const levelOf = (id: string | null) => LEVELS.find((l) => l.id === id) ?? LEVELS[1]

/** Wat mensen er vaak bij zetten. Eén tik en hij staat in je plan. */
const QUICK: { name: string; part: Part }[] = [
  { name: 'Hardlopen', part: 'ochtend' },
  { name: 'Naar de gym', part: 'overdag' },
  { name: 'Video maken', part: 'overdag' },
  { name: '20 pagina\'s lezen', part: 'avond' },
  { name: 'Koud douchen', part: 'ochtend' },
  { name: 'Een uur aan je project', part: 'overdag' },
]

const WAKE_TIMES = ['04:30', '05:00', '05:30', '06:00', '06:30', '07:00']

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Onboarding() {
  const [i, setI] = useState(0)
  const [name, setName] = useState('')
  const [ratings, setRatings] = useState<Partial<Record<Area, Rating>>>({})
  const [answers, setAnswers] = useState<Partial<Record<Area, string>>>({})
  // Bij welk dagdeel elke taak uit je antwoorden hoort
  const [parts, setParts] = useState<Record<string, Part>>({})
  const [obstacle, setObstacle] = useState<string | null>(null)
  const [level, setLevel] = useState<string | null>(null)
  const [why, setWhy] = useState('')
  // Je plan begint met opstaan; de antwoorden op de spiegel voegen er per deel een taak aan toe
  const [picked, setPicked] = useState<Record<string, Habit>>(() => ({ wake: wakeHabit() }))
  const [custom, setCustom] = useState<null | 'vice' | 'virtue'>(null)
  const [goalText, setGoalText] = useState('12-uursloop')
  const [goalDue, setGoalDue] = useState('')
  const [notifyAsked, setNotifyAsked] = useState<null | boolean>(null)
  const [wake, setWake] = useState('06:30')

  // De twee zwakste delen krijgen een vervolgvraag (eerst slecht, dan kan beter; sterk niet)
  const focus = AREAS.filter((a) => ratings[a.id] === 'slecht').concat(AREAS.filter((a) => ratings[a.id] === 'matig')).slice(0, 2).map((a) => a.id)
  // De verleidingen vraagt de app alleen als je zegt dat je iets verdooft
  const numbs = answers.emotioneel === 'verdoof' && focus.includes('emotioneel')
  const flow: StepId[] = ['splash', 'name', 'mirror', ...focus.map((a) => `area-${a}` as const), 'obstacle', 'level', ...(numbs ? ['vices' as const] : []), 'wake', 'goal', 'why', 'build', 'plan', 'deal']
  const id = flow[Math.min(i, flow.length - 1)]
  const questions = flow.filter(isQuestion)
  const qIndex = questions.indexOf(id)

  const next = () => { buzz(); setI((x) => Math.min(flow.length - 1, x + 1)); scrollToTop() }
  const back = () => { setI((x) => Math.max(0, x - (id === 'plan' ? 2 : 1))); scrollToTop() }
  // Eén keuze: even laten zien dat hij staat, dan door
  const pickAndGo = (set: () => void) => { set(); buzz(8); window.setTimeout(next, reduced() ? 0 : 320) }

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
  const remove = (hid: string) => setPicked((p) => { const n = { ...p }; delete n[Object.keys(p).find((k) => p[k].id === hid)!]; return n })
  const setBig = (hid: string, big: boolean) => setPicked((p) => { const k = Object.keys(p).find((x) => p[x].id === hid)!; return { ...p, [k]: { ...p[k], weight: big ? 3 : 2 } } })

  // Het niveau zet het aantal grote taken: opstaan altijd, dan de taken van je zwakste delen, in die volgorde
  const applyLevel = (lv: string) => {
    const n = levelOf(lv).max
    setPicked((p) => {
      const out = { ...p }
      const order = ['wake', ...focus.map((a) => `area-${a}`)].filter((k) => out[k])
      order.forEach((k, idx) => { out[k] = { ...out[k], weight: idx < n ? 3 : 2 } })
      return out
    })
  }
  // Een antwoord op de spiegel: de taak van dat deel komt in je plan (een nieuw antwoord vervangt de oude)
  const answerArea = (a: Area, optId: string) => {
    const o = AREA_BY_ID[a].options.find((x) => x.id === optId)!
    setAnswers((x) => ({ ...x, [a]: optId }))
    setPicked((p) => ({ ...p, [`area-${a}`]: { id: `area-${a}-${uid()}`, name: o.task, sin: DOMAIN_BY_ID[AREA_BY_ID[a].domain].sin, kind: 'virtue', type: 'do', weight: 2, ...(o.at ? { at: o.at } : {}) } }))
    setParts((x) => ({ ...x, [`area-${a}`]: o.part }))
  }
  // Na de spiegel: taken van delen die geen vervolgvraag meer krijgen, gaan eruit
  const leaveMirror = () => setPicked((p) => Object.fromEntries(Object.entries(p).filter(([k]) => !k.startsWith('area-') || focus.includes(k.slice(5) as Area))))
  const truths = focus.filter((a) => answers[a]).map((a) => ({ area: AREA_BY_ID[a], truth: AREA_BY_ID[a].options.find((o) => o.id === answers[a])!.truth }))

  const vices = Object.values(picked).filter((h) => h.kind === 'vice')
  const virtues = Object.values(picked).filter((h) => h.kind === 'virtue')
  const bigs = virtues.filter((h) => h.weight === 3)
  const dateNeeded = needsDate('medal', goalText)
  const obs = OBSTACLES.find((o) => o.id === obstacle)
  const lv = levelOf(level)
  const countLabel = (n: number) => `${n} ${n === 1 ? 'taak' : 'taken'}`
  const quick = QUICK.filter((q) => !virtues.some((h) => h.name.toLowerCase() === q.name.toLowerCase()))
  const addQuick = (q: (typeof QUICK)[number]) => {
    buzz()
    const key = 'custom-' + uid()
    setPicked((p) => ({ ...p, [key]: { id: key, name: q.name, sin: 'sloth', kind: 'virtue', type: 'do', weight: bigs.length < lv.max ? 3 : 2 } }))
    setParts((x) => ({ ...x, [key]: q.part }))
  }
  const habitName = (h: Habit) => (isWakeHabit(h) ? `${shortTime(wake)} op` : h.name)
  // De taken uit je antwoorden, per dagdeel, met hun tijd erbij als die er is (eigen taken staan overdag)
  const tasksIn = (part: Part) => Object.entries(picked)
    .filter(([k, h]) => h.kind === 'virtue' && k !== 'wake' && (parts[k] ?? 'overdag') === part)
    .map(([, h]) => (h.at ? `${h.name}, ${shortTime(h.at)}` : h.name))

  const finish = () => {
    const goal = goalText.trim()
      ? { ...noteFromGoal({ feature: needsDate(undefined, goalText) ? 'medal' : 'laurel', text: goalText.trim() }), due: goalDue || undefined, obstacle: obs?.when, ifThen: obs?.then }
      : null
    update((d) => {
      d.name = name.trim()
      d.why = why.trim()
      d.habits = Object.values(picked).filter((h) => h.kind === 'virtue' || numbs)
      setWakeTime(d, wake)
      // Elke harde waarheid wordt een post-it op je spiegel, met een ladder naar beter
      const today = todayISO()
      const mirror: MirrorNote[] = truths.map(({ area, truth }) => ({ id: uid(), text: truth, domain: area.domain, sin: DOMAIN_BY_ID[area.domain].sin, steps: planFor(area.domain, '', truth).map((st, k) => ({ ...st, startedAt: k === 0 ? today : undefined })), createdAt: today }))
      d.notes = [...(goal ? [goal] : []), ...mirror]
      d.mainGoalId = goal?.id
      d.createdAt = todayISO()
      d.onboarded = true
      d.asked = { ...d.asked, schema: true }
    })
  }

  // Het startscherm
  if (id === 'splash') {
    return (
      <div className="hero-img" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#0B0B0B' }}>
        <img src={IMG.forest} alt={doreAlt(IMG.forest)} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '109%', objectPosition: 'center top' }} />
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto', padding: '0 24px calc(env(safe-area-inset-bottom) + 32px)', color: '#F7F7F5', animation: 'fadeUp .8s var(--ease) both' }}>
          <h1 className="display">PlusOne</h1>
          <p className="lead" style={{ color: 'rgba(247, 247, 245, .85)', marginTop: 8 }}>Elke dag één keuze. Omhoog of omlaag.</p>
          <button className="btn light mt-32" onClick={next}>Begin</button>
          <p className="small center" style={{ color: 'rgba(247, 247, 245, .6)', marginTop: 12 }}>Een paar vragen. Twee minuten. Dan heb je een plan.</p>
        </div>
      </div>
    )
  }

  // Je plan wordt gebouwd: de lijn van je dag tekent zichzelf
  if (id === 'build') return <PlanBuild wake={wake} bigCount={bigs.length} hasGoal={!!goalText.trim()} hasObstacle={!!obs} onDone={next} />

  const dockLabel: Partial<Record<StepId, string>> = { name: 'Verder', mirror: 'Verder', vices: 'Verder', wake: 'Verder', goal: 'Verder', why: why.trim() ? 'Bouw mijn plan' : 'Sla over en bouw mijn plan', plan: 'Dit is mijn plan' }
  const disabled = (id === 'name' && !name.trim()) || (id === 'mirror' && !AREAS.every((a) => ratings[a.id])) || (id === 'goal' && dateNeeded && !goalDue) || (id === 'plan' && (bigs.length < lv.min || bigs.length > lv.max))

  return (
    <div className="screen ob" style={{ paddingBottom: 140 }}>
      <div className="ob-top">
        <button className="iconbtn" onClick={back} aria-label="Terug" style={{ marginLeft: -8 }}>{Icon.back()}</button>
        {qIndex >= 0 ? (
          <div className="ob-progress" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={qIndex + 1} aria-label="Voortgang">
            <i style={{ transform: `scaleX(${(qIndex + 1) / questions.length})` }} />
          </div>
        ) : <div style={{ flex: 1 }} />}
        {/* Geen teller: het aantal vragen hangt af van je antwoorden, en een teller die oploopt voelt als terugvallen */}
        <div className="ob-count" aria-hidden="true" />
      </div>

      <div key={id} className="ob-step">
        {id === 'name' && (
          <Q title="Eerst: hoe heet je?" lead="Zo spreekt de app je aan. Elke ochtend.">
            <input className="input ob-big-input" autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && name.trim() && next()} placeholder="Je voornaam" autoComplete="given-name" aria-label="Je voornaam" />
          </Q>
        )}

        {id === 'mirror' && (
          <Q title={`${name.trim() || 'Oké'}, kijk in de spiegel.`} lead="Vier delen van je leven. Geen mooie praatjes: hoe staat het er echt voor?">
            <div className="ob-rates">
              {AREAS.map((a) => (
                <div key={a.id} className="ob-rate" role="radiogroup" aria-label={a.label}>
                  <div className="ob-rate-head"><span className="ob-rate-name">{a.label}</span><span className="ob-rate-sub">{a.sub}</span></div>
                  <div className="ob-rate-seg">
                    {RATINGS.map((r) => (
                      <button key={r.id} role="radio" aria-checked={ratings[a.id] === r.id} className={`ob-rate-btn ${r.id} ${ratings[a.id] === r.id ? 'on' : ''}`} onClick={() => { buzz(6); setRatings((x) => ({ ...x, [a.id]: r.id })) }}>{r.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {AREAS.every((a) => ratings[a.id]) && focus.length === 0 && <p className="small" style={{ margin: 0, color: 'var(--ink)' }}>Alles sterk? Kijk nog een keer. Niemand is af.</p>}
          </Q>
        )}

        {id.startsWith('area-') && (() => {
          const a = AREA_BY_ID[id.slice(5) as Area]
          return (
            <Q title={a.q} lead="Kies wat het hardst klinkt. Dat is meestal het ware.">
              <div className="ob-opts">
                {a.options.map((o) => <Opt key={o.id} on={answers[a.id] === o.id} label={o.label} onClick={() => pickAndGo(() => answerArea(a.id, o.id))} />)}
              </div>
            </Q>
          )
        })()}

        {id === 'obstacle' && (
          <Q title="Wat houdt je meestal tegen?" lead="Eerlijk. Het eerste dat opkomt.">
            <div className="ob-opts">
              {OBSTACLES.map((o) => <Opt key={o.id} on={obstacle === o.id} label={o.label} onClick={() => pickAndGo(() => setObstacle(o.id))} />)}
            </div>
          </Q>
        )}

        {id === 'level' && (
          <Q title="Waar sta je nu?" lead="Je plan begint waar jij staat. Niet waar je zou willen staan.">
            <div className="ob-opts">
              {LEVELS.map((l) => <Opt key={l.id} on={level === l.id} label={l.label} sub={l.sub} onClick={() => pickAndGo(() => { setLevel(l.id); applyLevel(l.id) })} />)}
            </div>
          </Q>
        )}

        {id === 'vices' && (
          <Q title="Waarmee verdoof je het?" lead="Je houdt ze bij. Ze tellen nog niet mee voor je dag.">
            <CustomChips list={vices} onRemove={remove} title="Gekozen" />
            <PickStep mode="vice" picked={picked} toggle={toggle} setAmount={setAmount} />
            <button className="chip add" style={{ alignSelf: 'flex-start' }} onClick={() => setCustom('vice')}>{Icon.plus()} Eigen verleiding</button>
          </Q>
        )}

        {id === 'wake' && (
          <Q title="Hoe laat sta je op?" lead="Wees op voordat de rest wakker is. Welke tijd is dat voor jou?">
            <div className="ob-times">
              {WAKE_TIMES.map((t) => <button key={t} className={`ob-time ${wake === t ? 'on' : ''}`} aria-pressed={wake === t} onClick={() => { buzz(6); setWake(t) }}>{shortTime(t)}</button>)}
            </div>
            <label className="field">
              <span className="small">Of een eigen tijd</span>
              <input className="input" type="time" value={wake} onChange={(e) => e.target.value && setWake(e.target.value)} aria-label="Eigen opstaantijd" />
            </label>
          </Q>
        )}

        {id === 'goal' && (
          <Q title="Wat ga je halen?" lead="Eén doel, met een datum. Dan telt de app elke dag af.">
            <input className="input ob-big-input" value={goalText} onChange={(e) => setGoalText(e.target.value)} placeholder="Bijv. 12-uursloop" aria-label="Je doel" />
            <label className="field">
              <span className="small">Wanneer?</span>
              <input className="input" type="date" min={todayISO()} value={goalDue} onChange={(e) => setGoalDue(e.target.value)} aria-label="Datum van je doel" />
            </label>
            {dateNeeded && !goalDue && <p className="small" style={{ color: 'var(--ink)', margin: 0 }}>Een race heeft een datum nodig.</p>}
          </Q>
        )}

        {id === 'why' && (
          <Q title="Waarom? Voor wie?" lead="Dit lees je elke ochtend terug. Op de dagen dat je het nodig hebt.">
            <textarea className="textarea" autoFocus value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Wat het je kost als je niks verandert." />
          </Q>
        )}

        {id === 'plan' && (
          <div className="stack gap-24">
            <div className="stack gap-8">
              <div className="eyebrow">Je plan</div>
              <h1 className="h1">{name.trim() ? `${name.trim()}, dit` : 'Dit'} is je dag.</h1>
            </div>
            <div className="ob-plan-line">
              <PlanRow part="Ochtend" items={[`${shortTime(wake)} op`, 'Ochtendmoment: zeg het hardop, 30 seconden', ...tasksIn('ochtend')]} />
              <PlanRow part="Overdag" items={tasksIn('overdag').length ? tasksIn('overdag') : ['Geen vaste taak. Wat erbij komt, zet je op Vandaag.']} />
              <PlanRow part="Avond" items={[...tasksIn('avond'), 'Dag afsluiten, 2 minuten']} last />
            </div>
            {goalText.trim() && (
              <div className="ob-goal">
                <span className="ob-goal-title">{goalText.trim()}</span>
                <span className="ob-goal-count">{goalDue ? countdownLabel(goalDue) : 'Zonder datum'}</span>
                {obs && <span className="ob-goal-plan"><b>Als {obs.when}:</b> {obs.then}</span>}
              </div>
            )}
            {truths.length > 0 && (
              <div className="stack gap-12">
                <h2 className="h2">Op je spiegel</h2>
                <div className="ob-truths">
                  {truths.map(({ area, truth }, k) => (
                    <div key={area.id} className="jar-note ob-truth" style={{ '--r': `${k % 2 ? 1.5 : -1.5}deg` } as CSSProperties}>
                      <span className="tape" aria-hidden="true" />
                      <span className="jar-kind">{area.label}</span>
                      <span className="jar-text">{truth}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="stack gap-8">
              <div className="section-head" style={{ margin: 0 }}>
                <h2 className="h2">Je grote taken</h2>
                <span className={`small ob-tally ${bigs.length >= lv.min && bigs.length <= lv.max ? 'ok' : ''}`}>{bigs.length} van {lv.min}–{lv.max}</span>
              </div>
              <p className="small" style={{ margin: 0 }}>{lv.label}: elke dag {lv.min} of {lv.max} grote taken. Doe je ze allemaal, dan is de dag gewonnen.</p>
              <div className="list">
                {virtues.map((h) => (
                  <div key={h.id} className="row" style={{ minHeight: 64 }}>
                    <div className="grow"><div className="name">{habitName(h)}</div><div className="meta">{scheduleLabel(h)}</div></div>
                    <button className={`chip ${h.weight === 3 ? 'on' : ''}`} aria-pressed={h.weight === 3} disabled={h.weight !== 3 && bigs.length >= lv.max} onClick={() => setBig(h.id, h.weight !== 3)}>Groot</button>
                    <button className="iconbtn" aria-label={`${h.name} weghalen`} onClick={() => remove(h.id)} style={{ color: 'var(--ink-3)' }}>{Icon.close()}</button>
                  </div>
                ))}
              </div>
              {bigs.length > lv.max && <p className="small" style={{ color: 'var(--ink)', margin: 0 }}>{bigs.length} grote taken. {lv.label} is hooguit {lv.max}. Maak er een klein of haal er een weg.</p>}
              {bigs.length < lv.min && <p className="small" style={{ color: 'var(--ink)', margin: 0 }}>Nog {countLabel(lv.min - bigs.length)} erbij. {lv.label} betekent minstens {lv.min}.</p>}
              {bigs.length < lv.max && quick.length > 0 && (
                <div className="stack gap-8">
                  <span className="small">Snel erbij</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {quick.map((q) => <button key={q.name} className="chip add" onClick={() => addQuick(q)}>{Icon.plus()} {q.name}</button>)}
                  </div>
                </div>
              )}
              <button className="chip add" style={{ alignSelf: 'flex-start' }} onClick={() => setCustom('virtue')}>{Icon.plus()} Taak toevoegen</button>
            </div>
          </div>
        )}

        {id === 'deal' && (
          <div className="stack gap-24">
            <Plate src={IMG.oath} ratio="4 / 5" style={{ width: '40%', margin: '0 auto' }} />
            <div className="stack gap-8 center">
              <h1 className="h1">{name.trim() ? `${name.trim()}, dit` : 'Dit'} is de deal.</h1>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <ol className="lead" style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8 }}>
                <li>Ik doe mijn grote taken. Elke dag.</li>
                <li>Ik kijk elke avond eerlijk terug.</li>
                <li>Ik mis nooit twee keer.</li>
              </ol>
            </div>
            {notifySupported() && notifyAsked === null && (
              <div className="card stack gap-12">
                <h2 className="h2">Mag de app je wakker schudden?</h2>
                <p className="lead" style={{ margin: 0 }}>Om {shortTime(wake)} om op te staan, om 21:00 om je dag af te sluiten, en om 22:15 om naar boven te gaan.</p>
                <button className="btn ghost" onClick={async () => setNotifyAsked(await enableNotify())}>Ja, herinner me</button>
                <button className="link center" onClick={() => setNotifyAsked(false)}>Nee, liever niet</button>
              </div>
            )}
            {notifyAsked === true && <p className="lead center">{Icon.check()} Herinneringen staan aan. Tijden pas je aan op Reis.</p>}
          </div>
        )}
      </div>

      {(dockLabel[id] || id === 'deal') && (
        <div className="dock" style={{ position: 'fixed', left: 0, right: 0, margin: '0 auto', bottom: 0, width: '100%', maxWidth: 460, padding: '16px 20px calc(env(safe-area-inset-bottom) + 18px)', background: 'linear-gradient(180deg, rgba(11, 11, 11, 0), var(--paper) 28%)', zIndex: 10 }}>
          {id === 'deal' ? <HoldButton label="Houd vast om te tekenen" onDone={finish} /> : <button className="btn" onClick={() => { if (id === 'mirror') leaveMirror(); next() }} disabled={disabled}>{dockLabel[id]}</button>}
        </div>
      )}

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

/** Eén vraag: groot, met een korte regel eronder, en de keuzes. */
function Q({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
  return (
    <div className="stack gap-24">
      <div className="stack gap-8">
        <h1 className="h1 ob-q">{title}</h1>
        <p className="lead" style={{ margin: 0 }}>{lead}</p>
      </div>
      {children}
    </div>
  )
}

/** Een keuze als brede kaart. Bij één keuze een rondje, bij meer een vinkje in een vierkantje. */
function Opt({ on, label, sub, multi, onClick }: { on: boolean; label: string; sub?: string; multi?: boolean; onClick: () => void }) {
  return (
    <button className={`ob-opt ${on ? 'on' : ''}`} role={multi ? 'checkbox' : 'radio'} aria-checked={on} onClick={onClick}>
      <span className="ob-opt-txt"><span className="ob-opt-label">{label}</span>{sub && <span className="ob-opt-sub">{sub}</span>}</span>
      <span className={`ob-mark ${multi ? 'sq' : ''}`} aria-hidden="true">{on && Icon.check('#0B0B0B')}</span>
    </button>
  )
}

function PlanRow({ part, items, last }: { part: string; items: string[]; last?: boolean }) {
  return (
    <div className={`ob-plan-row ${last ? 'last' : ''}`}>
      <span className="ob-plan-dot" aria-hidden="true" />
      <div className="ob-plan-part">{part}</div>
      <ul>{items.map((t) => <li key={t}>{t}</li>)}</ul>
    </div>
  )
}

/**
 * Je plan wordt gebouwd, als een korte film van zes seconden: de klim.
 * Een pelgrim loopt de trappen op naar de poort; de camera klimt mee (vier lagen gravure, elk op hun eigen snelheid).
 * Onderweg valt bij elk dagdeel een briefje uit de lucht dat je plan vastprikt, met een tik en een schok door het beeld.
 * Dan komt de zon op achter de berg, het beeld licht op, en staat er: je plan staat. Tik om over te slaan.
 * Alles is eigen beeld uit de app; de beweging leent alleen het principe van een verhaal in plaats van een laadbalk.
 */
const CLIMB_MS = 6200
const DROPS = [1500, 2600, 3700]
function PlanBuild({ wake, bigCount, onDone }: { wake: string; bigCount: number; hasGoal: boolean; hasObstacle: boolean; onDone: () => void }) {
  const still = reduced()
  const done = useRef(onDone)
  useEffect(() => { done.current = onDone })
  useEffect(() => {
    if (still) return
    const ts = DROPS.map((t) => window.setTimeout(() => buzz(14), t + 180))
    ts.push(window.setTimeout(() => buzz(30), 4400))
    ts.push(window.setTimeout(() => done.current(), CLIMB_MS))
    return () => ts.forEach(clearTimeout)
  }, [still])

  const notes = [
    { part: 'Ochtend', text: `Op om ${shortTime(wake)}`, cls: 'n1' },
    { part: 'Overdag', text: `${bigCount} ${bigCount === 1 ? 'grote taak' : 'grote taken'}`, cls: 'n2' },
    { part: 'Avond', text: 'Dag afsluiten', cls: 'n3' },
  ]

  return (
    <div className={`climb ${still ? 'still' : ''}`} role="status" aria-live="polite" aria-label="Je plan wordt gebouwd" onClick={() => !still && onDone()}>
      <div className="climb-scene">
        <img className="cl-layer cl-sky" src="/art/achtergrond-terrassen-1-ver.webp" alt="" />
        <img className="cl-fx cl-glow" src="/art/effect-gloed.webp" alt="" />
        <img className="cl-fx cl-rays" src="/art/effect-stralen.webp" alt="" />
        <img className="cl-layer cl-mid" src="/art/achtergrond-terrassen-2-midden.webp" alt="" />
        <img className="cl-layer cl-ground" src="/art/achtergrond-terrassen-3-grond.webp" alt="" />
        <img className="cl-layer cl-front" src="/art/achtergrond-terrassen-4-voorgrond.webp" alt="" />
        <div className="cl-walker" aria-hidden="true">
          <div className="cl-step">
            <img className="cl-f1" src="/art/item-pelgrim-1.webp" alt="" />
            <img className="cl-f2" src="/art/item-pelgrim-2.webp" alt="" />
          </div>
        </div>
        <div className="cl-shade" aria-hidden="true" />
        <div className="cl-flash" aria-hidden="true" />
      </div>

      {notes.map((n, k) => (
        <div key={n.part} className={`jar-note cl-note ${n.cls}`} style={{ '--d': `${DROPS[k]}ms` } as CSSProperties}>
          <span className="tape" aria-hidden="true" />
          <span className="jar-kind">{n.part}</span>
          <span className="jar-text">{n.text}</span>
        </div>
      ))}

      <div className="cl-top">
        <div className="cl-building">Je plan wordt gebouwd</div>
      </div>
      <div className="cl-ready">
        <h1 className="cl-title">Je plan staat.</h1>
        <p className="cl-sub">Nu de klim.</p>
      </div>
      {still ? <button className="btn cl-btn" onClick={onDone}>Bekijk je plan</button> : <p className="cl-skip">Tik om over te slaan</p>}
    </div>
  )
}

function CustomChips({ list, onRemove, title = 'Eigen' }: { list: Habit[]; onRemove: (id: string) => void; title?: string }) {
  const own = title === 'Eigen' ? list.filter((h) => h.id.startsWith('custom-')) : list
  if (!own.length) return null
  return (
    <div className="stack gap-8">
      <div className="small">{title}</div>
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
      <Plate src={mode === 'vice' ? IMG.haunted : IMG.climb} ratio="16 / 9" />
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
