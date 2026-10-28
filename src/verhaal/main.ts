// De verhaalwebsite: laden, de drempel, en dan één film die je met je duim afspeelt.
// Scrollen is reizen; de pagina is nooit langer dan tot het volgende keerpunt, dus op een keerpunt
// kun je niet verder tot je het gebaar zelf maakt (BRIEF §3). Daarna loopt de film een stukje vanzelf door.
import Lenis from 'lenis'
import { enableMotion, startMotion } from '../lib/motion'
import { Score } from './audio'
import { Gesture } from './gesture'
import { ASSETS, FIRST, drawFrame, type Frame, type Imgs } from './scene'
import { ACTS, END, GATES, LINES, clamp, smooth, type GateId } from './story'
import './verhaal.css'

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const touch = matchMedia('(pointer: coarse)').matches

// ── Opbouw van de pagina ──
document.body.innerHTML = `
  <canvas class="film" aria-hidden="true"></canvas>
  <div class="spacer"></div>
  <div class="lines" aria-live="polite">${LINES.map((l) => `<p class="line ${l.big ? 'big' : ''}"><span class="t">${l.text}</span>${l.small ? `<span class="s">${l.small}</span>` : ''}</p>`).join('')}</div>
  <div class="plus" aria-hidden="true">+1</div>
  <nav class="path" aria-label="Voortgang">${ACTS.map((a) => `<i title="${a.label}" style="top:${(a.from / END) * 100}%"></i>`).join('')}<b></b></nav>
  <button class="sound" type="button" aria-pressed="false">Geluid uit</button>
  <section class="cta" aria-hidden="true">
    <img src="/icons/icon-512.png" alt="Het app-icoon van PlusOne: een lauwerkrans rond +1" />
    <h2>Zet PlusOne op je beginscherm</h2>
    <p>${touch ? 'Tik op Delen, dan <b>Zet op beginscherm</b>. Elke dag één keuze.' : 'Open deze pagina op je telefoon en zet hem op je beginscherm.'}</p>
    <a class="btn" href="/">Open PlusOne</a>
  </section>
  <div class="loader" role="status"><img src="/icons/icon-512.png" alt="" /><i><b></b></i></div>
  <div class="threshold" hidden>
    <p class="q">Ben je klaar om<br />eerlijk te kijken?</p>
    <div class="choices"><button type="button" data-sound="1">Met geluid</button><button type="button" data-sound="0">Zonder geluid</button></div>
    <a class="direct" href="/">Direct naar de app</a>
  </div>`

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!
const canvas = $<HTMLCanvasElement>('.film')
const ctx = canvas.getContext('2d')!
// Een beeld dat nog niet binnen is, slaan we over in plaats van een fout te geven (de rest laadt tijdens het kijken)
const drawImage = ctx.drawImage.bind(ctx) as (...a: unknown[]) => void
ctx.drawImage = ((img: CanvasImageSource, ...rest: number[]) => {
  if (img instanceof HTMLImageElement && !img.naturalWidth) return
  drawImage(img, ...rest)
}) as typeof ctx.drawImage
const spacer = $<HTMLDivElement>('.spacer')
const lineEls = [...document.querySelectorAll<HTMLElement>('.line')]
const pathFill = $<HTMLElement>('.path b')
const soundBtn = $<HTMLButtonElement>('.sound')
const cta = $<HTMLElement>('.cta')
const plus = $<HTMLElement>('.plus')

// Eén vaste schermhoogte: bij scrollen schuift de adresbalk, maar de film mag niet verspringen
let vh = innerHeight
let lockedW = innerWidth
let W = 0
let H = 0
let dpr = 1
const size = () => {
  if (innerWidth !== lockedW) { lockedW = innerWidth; vh = innerHeight }
  dpr = Math.min(2, devicePixelRatio || 1)
  W = innerWidth
  H = innerHeight
  canvas.width = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  setLimit()
}

// ── Beelden laden, met de krans en een lijn die zich als een pad tekent ──
const imgs: Imgs = {}
let icon: HTMLImageElement | undefined
const load = (src: string) => new Promise<HTMLImageElement>((res) => {
  const i = new Image()
  i.decoding = 'async'
  i.onload = () => res(i)
  i.onerror = () => res(i)
  i.src = src
})
/** Eerst wat bedrijf I nodig heeft (daarop wacht het laadscherm), de rest in verhaalvolgorde erachteraan, zes tegelijk. */
const loadAll = async () => {
  let n = 0
  const bar = $<HTMLElement>('.loader b')
  const one = async (k: string) => { imgs[k] = await load(`/${k}.webp`) }
  // Elk beeld heeft meteen een plek (leeg tot hij binnen is), zodat een scène nooit een gat vindt
  for (const k of ASSETS) imgs[k] ??= new Image()
  const first = ASSETS.slice(0, FIRST)
  await Promise.all(first.map(async (k) => { await one(k); bar.style.width = `${(++n / first.length) * 100}%` }))
  icon = await load('/icons/icon-512.png')
  const rest = ASSETS.slice(FIRST)
  const worker = async () => { for (let k = rest.shift(); k; k = rest.shift()) await one(k) }
  void Promise.all(Array.from({ length: 6 }, worker))
}

// ── De film ──
const done: Partial<Record<GateId, number>> = {}
let score: Score | null = null
let lenis: Lenis | null = null
let u = 0
let gp = 0
let shake = 0
let landed = false
const t0 = performance.now()
const now = () => (performance.now() - t0) / 1000

/** Het volgende keerpunt dat nog niet gelukt is. */
const nextGate = () => GATES.find((g) => done[g.id] == null)

/** De pagina is precies zo lang als tot het volgende keerpunt: verder scrollen kan pas na het gebaar. */
const setLimit = () => {
  const g = nextGate()
  spacer.style.height = `${((g ? g.at : END + 0.6) * vh + innerHeight).toFixed(0)}px`
  lenis?.resize()
}

const gesture = new Gesture({
  progress: (p, active) => { gp = p; score?.gestureTone(p, active) },
  release: () => score?.sigh(),
  done: () => {
    const g = gesture.current
    if (!g) return
    done[g.id] = now()
    gesture.hide()
    gp = 0
    score?.gestureTone(0, false)
    // De klap: een flits, een schok, een trilling en de beloning
    shake = g.id === 'portaal' ? 1 : 0.6
    if (g.id === 'telefoon') { score?.ping(); buzz([40, 60, 40]) }
    else { score?.hit(g.id === 'portaal' ? 0.7 : 1); buzz(30) }
    if (g.id.startsWith('trede')) { plus.classList.remove('pop'); void plus.offsetWidth; plus.classList.add('pop') }
    setLimit()
    // De film loopt een stukje vanzelf door, zodat de beloning meteen in beeld komt
    lenis?.scrollTo((g.at + (g.id === 'portaal' ? 0.5 : 0.35)) * vh, { duration: 1.4, easing: (x) => 1 - Math.pow(1 - x, 3) })
  },
}, reduce)

/** Trillen mag pas na een echte tik; daarvoor blijft het stil in plaats van een fout. */
const buzz = (p: number | number[]) => { if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(p) }

const frame = () => {
  const t = now()
  const target = clamp(scrollY / vh, 0, END + 1)
  u = reduce ? target : u + (target - u) * 0.12
  // Op een keerpunt: het gebaar verschijnt
  const g = nextGate()
  if (g && target >= g.at - 0.03) { if (gesture.current?.id !== g.id) gesture.show(g) }
  else if (gesture.current) gesture.hide()
  // De landing na de val: een klap en een diepe trom
  if (!landed && u > 14.32) { landed = true; shake = 1; score?.hit(0.5); buzz(60) }
  shake = Math.max(0, shake - 0.06)
  const f: Frame = { u, t, gp, gate: gesture.current?.id ?? null, done, reduce, shake }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  // Gaat één frame mis, dan loopt de film gewoon door met het volgende
  try { drawFrame(ctx, W, H, f, imgs, icon) } catch (e) { console.warn('Frame overgeslagen', e) }
  // Tekst: één regel tegelijk
  LINES.forEach((l, i) => {
    const a = smooth(l.from, l.from + 0.25, u) * (1 - smooth(l.to - 0.25, l.to, u))
    const el = lineEls[i]
    const on = a > 0.02
    if (on && !el.classList.contains('on')) score?.ink()
    el.classList.toggle('on', on)
    el.style.opacity = a.toFixed(3)
    el.style.transform = `translateY(${((1 - a) * 18).toFixed(1)}px)`
  })
  pathFill.style.height = `${clamp(u / END) * 100}%`
  const showCta = done.krans != null && u > 28
  cta.classList.toggle('on', showCta)
  cta.setAttribute('aria-hidden', String(!showCta))
  score?.update(u, gesture.current ? gp : 0)
  requestAnimationFrame(frame)
}

// ── Start: laden, de drempel, en dan de film ──
const begin = async (withSound: boolean) => {
  $('.threshold').classList.add('out')
  if (withSound) {
    score = new Score()
    await score.start()
    soundBtn.textContent = 'Geluid aan'
    soundBtn.setAttribute('aria-pressed', 'true')
  }
  void enableMotion()
  setTimeout(() => $('.threshold').remove(), 700)
  document.body.classList.add('playing')
}

soundBtn.addEventListener('click', async () => {
  if (!score) { score = new Score(); await score.start(); soundBtn.textContent = 'Geluid aan'; soundBtn.setAttribute('aria-pressed', 'true'); return }
  const on = soundBtn.getAttribute('aria-pressed') === 'true'
  score.mute(on)
  soundBtn.textContent = on ? 'Geluid uit' : 'Geluid aan'
  soundBtn.setAttribute('aria-pressed', String(!on))
})

const start = async () => {
  history.scrollRestoration = 'manual'
  scrollTo(0, 0)
  startMotion()
  size()
  addEventListener('resize', size)
  if (!reduce) {
    lenis = new Lenis({ duration: 1.2, easing: (x) => 1 - Math.pow(1 - x, 5), smoothWheel: true, syncTouch: false })
    const raf = (t: number) => { lenis!.raf(t); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
  }
  await loadAll()
  await document.fonts?.ready
  // Alleen tijdens het bouwen: ?vanaf=16 springt naar dat punt, met de keerpunten ervoor al gedaan
  const from = import.meta.env.DEV ? Number(new URLSearchParams(location.search).get('vanaf')) : 0
  if (from > 0) {
    for (const g of GATES) if (g.at < from) done[g.id] = -10
    landed = from > 14.4
    setLimit()
    $('.loader').classList.add('out')
    $('.threshold').remove()
    document.body.classList.add('playing')
    requestAnimationFrame(frame)
    setTimeout(() => { scrollTo(0, from * vh); u = from }, 50)
    return
  }
  $('.loader').classList.add('out')
  const th = $('.threshold')
  th.hidden = false
  th.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => void begin(b.dataset.sound === '1')))
  requestAnimationFrame(frame)
}
void start()
