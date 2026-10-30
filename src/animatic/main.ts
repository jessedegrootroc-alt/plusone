// De animatic: het regieboek afgespeeld als bewegende graphic novel in zwart-wit, met vertelstem, muziek en de
// echte scrollafstanden. Elke scène staat vast over `sh` schermhoogtes; daarna schuift de volgende er als een nieuw
// stripblad onderdoor. Op een breed scherm vult het verhaal de hele breedte, met een eigen paneelindeling.
// Beelden die nog niet gemaakt zijn (docs/ILLUSTRATIES-VERHAAL.md) laten zien wat er straks komt te staan.
// ?scene=ontwaken springt direct naar een scène.
import Lenis from 'lenis'
import { enableMotion, getMotion, startMotion } from '../lib/motion'
import { Score } from './score'
import { CHOICES, SCENES, SPOTS, type Choice, type Fx, type Layer, type Panel, type Pin, type Scene, type Shot } from './script'
import './animatic.css'

interface Word { text: string; start: number; end: number }
interface Line { duration: number; words: Word[] }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const touch = matchMedia('(pointer: coarse)').matches
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

let T: Record<string, Line> = {}
let choice: Choice = 'rook'
const voKey = (k: string) => (k === '15' ? `15-${choice}` : k)

// ── Opbouw ──
document.body.innerHTML = `
  <main class="film"></main>
  <div class="flash" aria-hidden="true"></div>
  <div class="disc" aria-hidden="true"><i></i><span></span></div>
  <button class="sound" type="button" aria-pressed="false">Geluid uit</button>
  <aside class="hud"><div class="hud-now"></div><div class="hud-cue" hidden></div><ol class="hud-list" hidden></ol></aside>
  <nav class="chapters" aria-hidden="true"></nav>
  <svg class="defs" aria-hidden="true" width="0" height="0"><filter id="ink"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="1.8"/></filter></svg>
  <div class="gate">
    <p class="q"><span>BEN JE KLAAR OM</span><span>EERLIJK TE KIJKEN?</span></p>
    <div class="choices"><button type="button" data-sound="1">Met geluid</button><button type="button" data-sound="0">Zonder geluid</button></div>
    <p class="hint">Animatic · tijdelijke stem</p>
  </div>`

const $ = <E extends Element>(s: string, root: ParentNode = document) => root.querySelector<E>(s)!
const film = $<HTMLElement>('.film')
const flash = $<HTMLElement>('.flash')
const disc = $<HTMLElement>('.disc')
const hudNow = $<HTMLElement>('.hud-now')
const hudCue = $<HTMLElement>('.hud-cue')
const hudList = $<HTMLOListElement>('.hud-list')
const soundBtn = $<HTMLButtonElement>('.sound')
const chapters = $<HTMLElement>('.chapters')

// ── Panelen en lagen als HTML ──
const file = (src: string) => src.split('/').pop()
/** De zwart-witversie als terugval voor een kleurbeeld dat nog niet gemaakt is (`naam-kleur` → `naam`) */
const plain = (src: string) => (src.endsWith('-kleur') ? src.slice(0, -6) : '')
const im = (src: string, cls: string, style = '', alt = plain(src)) => `<img class="${cls}" src="/${src}.webp" alt="" decoding="async" data-file="${file(src)}.png"${alt ? ` data-alt="/${alt}.webp"` : ''}${style ? ` style="${style}"` : ''}/>`

const label = () => CHOICES.find((c) => c.id === choice)!.label
const pinHtml = (pn: Pin) => {
  const at = `left:${pn.x}%;top:${pn.y}%;width:${pn.w}%;--r:${pn.r ?? 0}deg`
  if (pn.src) return `<img class="pin" src="/${pn.src}.webp" alt="" decoding="async"${plain(pn.src) ? ` data-alt="/${plain(pn.src)}.webp"` : ''} style="${at}${pn.clip ? `;clip-path:${pn.clip}` : ''}"/>`
  return `<b class="tag ${pn.kind ?? 'note'}${pn.text ? '' : ' chosen-label'}" style="${at}">${pn.text ?? label()}</b>`
}

/** Hoe de tekst op elk getekend blaadje past: het midden en de breedte van het papier (% van het blaadje) en zijn eigen scheefstand */
const FACE: Record<number, { x: number; y: number; w: number; r: number }> = {
  1: { x: 44, y: 53, w: 62, r: -3 },
  2: { x: 48, y: 57, w: 68, r: -1 },
  3: { x: 49, y: 54, w: 70, r: 1 },
  4: { x: 49, y: 52, w: 66, r: -7 },
}
/** Een post-it zoals hij echt op het glas zit: getekend blaadje, met de hand geschreven tekst die het papier volgt */
const postitHtml = (t: string, sp: { x: number; y: number; r: number; s: number }, extra = '') => {
  const f = FACE[sp.s]
  return `<i class="postit" ${extra} style="left:${sp.x}%;top:${sp.y}%;--r:${sp.r}deg;--pi:url(/verhaal/art/postit-${sp.s}.webp)"><span style="left:${f.x}%;top:${f.y}%;width:${f.w}%;--fr:${f.r}deg">${t}</span></i>`
}
const RING = '<svg class="ring" viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="1" d="M58 7C84 6 98 27 96 53 94 80 71 96 46 95 19 94 3 74 5 48 7 22 27 6 52 9 60 10 66 13 70 16"/></svg>'

const layerHtml = (l: Layer, i: number) => {
  const fit = l.fit ?? 'cover'
  const wrap = l.anim === 'spin'
    // Draait rond: een vierkant precies zo groot als de diagonaal (plus wat parallax), dan draaien de hoeken nooit
    // in beeld en wordt het beeld niet verder opgeblazen dan nodig
    ? '--s:calc(hypot(100cqw, 100cqh) * 1.04);left:calc(50% - var(--s) / 2);top:calc(50% - var(--s) / 2);width:var(--s);height:var(--s)'
    : fit === 'cover'
      ? `inset:-${3 + (l.depth ?? 0.5) * 5}%` // ruimte rondom voor de parallax
      : `left:${l.x ?? 50}%;bottom:${l.b ?? 0}%;height:${l.h ?? 50}%`
  const filter = l.dark ? `filter:brightness(${(1 - l.dark).toFixed(2)});` : ''
  const mv = `${l.rot ? `rotate:${l.rot}deg;` : ''}${filter}${l.op != null ? `opacity:${l.op};` : ''}animation-delay:-${((i * 0.73) % 3).toFixed(2)}s`
  const pos = l.pos ? `object-position:${l.pos}` : ''
  const tag = l.pins?.length ? `<div class="cover-box" style="--a:${l.aspect ?? 1}">${l.pins.map(pinHtml).join('')}</div>` : ''
  return `<div class="ly f-${fit}${l.role ? ` ro-${l.role}` : ''}" style="${wrap}"><div class="mv${l.anim ? ` a-${l.anim}` : ''}${tag ? ' tagged' : ''}" style="${mv}">${im(l.src, 'base', pos, l.alt)}${l.reveal ? im(l.reveal, 'ov reveal', pos) : ''}${tag}</div></div>`
}

const fxHtml = (f: Fx) => ({
  rain: '<div class="fx rain"><i></i><i></i></div>',
  'rain-soft': '<div class="fx rain soft"><i></i></div>',
  mist: '<div class="fx mist"><i></i></div>',
  wind: '<div class="fx wind"><i></i><i></i></div>',
  dust: '<div class="fx dust"><i></i></div>',
  rays: '<div class="fx rays"></div>',
  speed: '<div class="fx speed"></div>',
  rings: '<div class="fx rings"><i></i><i></i><i></i></div>',
  vig: '<div class="fx vig"></div>',
  'vig-flicker': '<div class="fx vig flicker"></div>',
  beam: '<div class="fx beam"></div>',
  sparks: '<div class="fx sparks"></div>',
  embers: '<div class="fx embers"><i></i><i></i></div>',
}[f])

const panelHtml = (pn: Panel) => {
  const cls = ['panel', `k-${pn.kind ?? 'inset'}`, pn.role ? `r-${pn.role}` : ''].join(' ')
  const g = pn.glow
  const vars = `${g ? `--gx:${g.x}%;--gy:${g.y}%;--gr:${g.r}cqw;` : ''}${pn.bg ? `background:${pn.bg};` : ''}`
  const glow = g ? `<div class="fx glow${g.pulse ? ' pulse' : ''}${g.flicker ? ' flicker' : ''}"></div>` : ''
  const lids = pn.lids ? '<i class="lid top"></i><i class="lid bot"></i>' : ''
  const postits = (pn.postits ?? []).map((t) => postitHtml(t.t, t, `data-at="${t.at}"`)).join('')
  // De keuze: dezelfde drie blaadjes op dezelfde plek, nu met wat hij er vandaag aan doet
  const pick = pn.pick
    ? CHOICES.map((c, i) => postitHtml(c.label, SPOTS[i], `role="button" tabindex="0" data-choice="${c.id}" aria-label="${c.label}"`).replace('class="postit"', 'class="postit pickit on"').replace('</i>', `${RING}</i>`)).join('')
    : ''
  const need = pn.note ? `<div class="need"><p>${pn.note}</p><small></small></div>` : ''
  return `<div class="${cls}" style="${vars}">
    ${need}<div class="pi">${(pn.layers ?? []).map(layerHtml).join('')}${glow}${(pn.fx ?? []).map(fxHtml).join('')}${lids}${postits}${pick}</div>
    <i class="edge"></i></div>`
}

interface CapState { el: HTMLElement; words: HTMLElement[]; key: string; played: boolean; vis: number }
interface LayerView { l: Layer; el: HTMLElement; shown: boolean }
interface PanelView { p: Panel; el: HTMLElement; pi: HTMLElement; layers: LayerView[]; seen: boolean }
interface View {
  scene: Scene
  section: HTMLElement
  /** De vaste laag van deze scène */
  stage: HTMLElement
  frame: HTMLElement
  /** Het beeld zelf: klappen raken alleen dit, tekstkaders blijven staan */
  cam: HTMLElement
  panels: PanelView[]
  caps: CapState[]
  top: number
  height: number
  time: number
  holding: boolean
  value: number
  t: number
  done: boolean
  fired: Set<string>
  walk: number
  /** Waar je begon met trekken (px) */
  pull: { gx: number; gy: number }
  /** Hoe ver de interactie zichtbaar is (0–1): jouw gebaar of je scroll, wat het verst is */
  shown: number
}

/** Het eerste paneelbeeld van een scène, als wazige achtergrond (alleen te zien rond een smal kader) */
const backdrop = (s: Scene) => s.panels.flatMap((p) => p.layers ?? []).find((l) => (l.fit ?? 'cover') === 'cover')?.src

const views: View[] = SCENES.map((scene) => {
  const section = document.createElement('section')
  section.className = `scene w-${scene.world}`
  section.dataset.id = scene.id
  const fall = scene.fall
    ? `<div class="drip">${Array.from({ length: 26 }, (_, i) => `<i style="left:${(i / 26) * 100}%;--d:${((Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.22).toFixed(3)}"></i>`).join('')}</div>`
    : ''
  const title = scene.title ? `<div class="title"><div class="strokes"><i></i><i></i><i></i></div><b>${scene.title.big}</b>${scene.title.sub ? `<small>${scene.title.sub}</small>` : ''}</div>` : ''
  const bd = backdrop(scene)
  section.innerHTML = `
    <div class="stage"${bd ? ` style="--bd:url(/${bd}.webp)${plain(bd) ? `, url(/${plain(bd)}.webp)` : ''}"` : ''}>
      <div class="frame">
        <div class="cam">
          ${(scene.fx ?? []).map(fxHtml).join('')}
          ${scene.panels.map(panelHtml).join('')}
          ${title}${fall}
          ${scene.html ?? ''}
        </div>
        ${scene.captions.map((c) => `<div class="cap${c.who ? ` ${c.who}` : ''}"><p></p></div>`).join('')}
        ${scene.act?.kind === 'rise' ? '<div class="pop virtue">DAG ÉÉN.</div>' : ''}
      </div>
    </div>`
  film.append(section)
  $<HTMLElement>('.stage', section).style.zIndex = String(SCENES.indexOf(scene) + 1)
  const panelEls = [...section.querySelectorAll<HTMLElement>('.panel')]
  return {
    scene, section,
    stage: $<HTMLElement>('.stage', section),
    frame: $<HTMLElement>('.frame', section),
    cam: $<HTMLElement>('.cam', section),
    panels: scene.panels.map((p, i) => {
      const el = panelEls[i]
      const lyEls = [...el.querySelectorAll<HTMLElement>('.ly')]
      return { p, el, pi: $<HTMLElement>('.pi', el), layers: (p.layers ?? []).map((l, k) => ({ l, el: lyEls[k], shown: false })), seen: false }
    }),
    caps: scene.captions.map((_, i) => ({ el: section.querySelectorAll<HTMLElement>('.cap')[i], words: [], key: '', played: false, vis: 0 })),
    top: 0, height: 0, time: 0, holding: false, value: 0, t: 0, done: false, fired: new Set(), walk: 0,
    pull: { gx: 0, gy: 0 }, shown: 0,
  }
})

// Een beeld dat nog niet gemaakt is: het paneel laat zien wat er straks komt, en welk bestand dat is
for (const img of document.querySelectorAll<HTMLImageElement>('.panel img')) {
  img.addEventListener('error', () => {
    // Is er een terugvalbeeld (de vorige reeks), toon dat zolang het nieuwe er niet is
    if (img.dataset.alt) { img.src = img.dataset.alt; delete img.dataset.alt; return }
    const panel = img.closest<HTMLElement>('.panel')!
    img.closest<HTMLElement>('.ly')!.classList.add('missing')
    panel.classList.add('needs')
    const small = panel.querySelector('.need small')
    if (small && !small.textContent!.includes(img.dataset.file!)) small.textContent = `${small.textContent ? `${small.textContent} · ` : 'nog te maken: '}${img.dataset.file}`
  })
}

// De beelden van deze en de volgende twee scènes alvast uitpakken. Anders gebeurt dat pas als ze in beeld komen,
// allemaal tegelijk, en hapert het beeld (op een telefoon een paar honderd ms)
const decoded = new Set<View>()
const decodeAhead = (v: View) => {
  for (const w of views.slice(views.indexOf(v), views.indexOf(v) + 3)) {
    if (decoded.has(w)) continue
    decoded.add(w)
    for (const img of w.section.querySelectorAll('img')) void img.decode().catch(() => {})
  }
}

chapters.innerHTML = views.filter((v) => v.scene.panels.length).map((v) => `<a data-id="${v.scene.id}">${v.scene.name}</a>`).join('')

/** Zet de woorden van een zin in het tekstkader (opnieuw bij de variant die bij de keuze hoort). */
const fillCaption = (cs: CapState, raw: string) => {
  const key = voKey(raw)
  if (cs.key === key) return
  cs.key = key
  const line = T[key]
  const p = cs.el.querySelector('p')!
  p.innerHTML = line ? line.words.map((w) => `<span>${w.text}</span>`).join(' ') : ''
  cs.words = [...p.querySelectorAll('span')]
}

// ── Maten: smal = staande pagina, breed = de hele breedte met de desktop-indeling ──
let vh = innerHeight
let lockedW = innerWidth
let wide = false
const layout = () => {
  if (innerWidth !== lockedW || !views[0].height) { lockedW = innerWidth; vh = innerHeight }
  wide = innerWidth >= 900 && innerWidth / innerHeight >= 1.15
  document.body.classList.toggle('wide', wide)
  for (const v of views) {
    // Vast over sh schermhoogtes, plus één scherm waarin het blad wegschuift en het volgende binnenkomt
    v.height = (v.scene.sh + 1) * vh
    v.section.style.height = `${v.height}px`
    for (const pv of v.panels) {
      const [x, y, w, h] = wide && pv.p.d ? pv.p.d : [pv.p.x, pv.p.y, pv.p.w, pv.p.h]
      Object.assign(pv.el.style, { left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` })
      // Figuren kunnen op een breed scherm een eigen plek en maat hebben
      for (const { l, el } of pv.layers) {
        if (l.fit !== 'fig') continue
        const [fx, fb, fh] = wide && l.d ? l.d : [l.x ?? 50, l.b ?? 0, l.h ?? 50]
        Object.assign(el.style, { left: `${fx}%`, bottom: `${fb}%`, height: `${fh}%` })
      }
    }
    v.scene.captions.forEach((c, i) => {
      const el = v.caps[i].el
      el.style.top = c.y > 50 ? '' : `${c.y}%`
      el.style.bottom = c.y > 50 ? `${Math.max(3, 94 - c.y)}%` : ''
    })
  }
  let y = 0
  for (const v of views) { v.top = y; y += v.height }
}

// ── Geluid: vertelstem per zin (met tijdcodes per woord) en de muziek ──
const audio = new Map<string, HTMLAudioElement>()
let score: Score | null = null
let soundOn = false
let playing: { key: string; el: HTMLAudioElement } | null = null
/** De zin die wacht tot de vorige uit is (alleen de nieuwste wacht) */
let queued: string | null = null
const speaking = () => !!playing && !playing.el.paused && !playing.el.ended
const speak = (key: string) => {
  const el = audio.get(key)
  if (!el) return
  if (playing) playing.el.pause()
  el.currentTime = 0
  void el.play().catch(() => {})
  playing = { key, el }
}
// Het beeld wacht nooit op de stem: ben je al bij de volgende zin terwijl de vorige nog klinkt, dan komt die erna
const play = (key: string) => {
  if (!soundOn) return
  if (speaking()) queued = key
  else speak(key)
}
const playQueued = () => {
  const key = queued
  queued = null
  // Alleen als die zin nog bij wat je ziet hoort (niet na een sprong naar een heel andere scène)
  if (key && soundOn && views.some((v) => v.stage.classList.contains('on') && v.caps.some((c) => c.key === key))) speak(key)
}
/** iOS geeft geluid pas vrij binnen een tik: elk bestand één keer stil starten en weer stoppen. */
const unlock = () => {
  for (const el of audio.values()) {
    el.muted = true
    void el.play().then(() => { el.pause(); el.currentTime = 0; el.muted = false }).catch(() => { el.muted = false })
  }
}
const setSound = async (on: boolean) => {
  soundOn = on
  if (on) {
    unlock()
    score ??= new Score()
    await score.start()
    score.mute(false)
  } else {
    score?.mute(true)
    if (playing) { playing.el.pause(); playing = null }
    queued = null
  }
  soundBtn.textContent = on ? 'Geluid aan' : 'Geluid uit'
  soundBtn.setAttribute('aria-pressed', String(on))
}
soundBtn.addEventListener('click', () => void setSound(!soundOn))

// ── Interactie: één schijf met tekst; vasthouden speelt de scène zelf ──
const pointer = { x: innerWidth / 2, y: innerHeight * 0.7 }
let activeAct: View | null = null
addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY })
const startHold = (e: PointerEvent | null) => {
  const v = activeAct
  if (!v || v.scene.act?.kind === 'choose') return
  if (v.scene.act?.kind === 'knock') {
    // Drie keer kloppen; elke klop een doffe bons en een schokje in het beeld
    v.value = clamp(v.value + 1 / 3 + 0.001)
    score?.knock()
    if (!reduce) v.cam.animate([{ translate: '0 0' }, { translate: '0 4px' }, { translate: '0 0' }], { duration: 140, easing: 'ease-out' })
    return
  }
  v.holding = true
  disc.classList.add('held')
  if (e) { pointer.x = e.clientX; pointer.y = e.clientY }
  v.pull.gx = pointer.x
  v.pull.gy = pointer.y
}
const endHold = () => { for (const v of views) v.holding = false; disc.classList.remove('held') }
// Op desktop houd je de muis ergens in het beeld vast; op een telefoon de schijf zelf (zo blijft scrollen werken)
film.addEventListener('pointerdown', (e) => { if (!touch && e.button === 0) startHold(e) })
disc.addEventListener('pointerdown', (e) => { if (touch) { e.preventDefault(); disc.setPointerCapture(e.pointerId); startHold(e) } })
addEventListener('pointerup', endHold)
addEventListener('pointercancel', endHold)
addEventListener('keydown', (e) => { if (e.key === ' ' && activeAct && !e.repeat) { e.preventDefault(); startHold(null) } })
addEventListener('keyup', (e) => { if (e.key === ' ') endHold() })

for (const b of document.querySelectorAll<HTMLElement>('.pickit')) {
  const pickIt = () => {
    choice = b.dataset.choice as Choice
    for (const o of document.querySelectorAll('.pickit')) o.classList.toggle('chosen', o === b)
    b.closest('.panel')!.classList.add('picked')
    for (const t of document.querySelectorAll('.chosen-label')) t.textContent = label()
    const v = views.find((w) => w.scene.act?.kind === 'choose')
    if (v) { v.done = true; impact(v.cam, 0.35) }
    score?.rustle()
    score?.tape()
    for (const w of views) w.caps.forEach((c, i) => fillCaption(c, w.scene.captions[i].vo))
  }
  b.addEventListener('pointerenter', () => { b.dataset.hover = '' })
  b.addEventListener('pointerleave', () => { delete b.dataset.hover })
  b.addEventListener('click', pickIt)
  b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickIt() } })
}

// ── Effecten in Darkest Dungeon-stijl ──
const impact = (cam: HTMLElement, deep = 1) => {
  score?.hit(deep)
  if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.(30) // trillen mag pas na een echte tik
  if (reduce) return
  flash.classList.remove('on'); void flash.offsetWidth; flash.classList.add('on')
  cam.classList.remove('impact'); void cam.offsetWidth; cam.classList.add('impact')
}
const pop = (el: HTMLElement | null | undefined, on: boolean) => { if (el) el.classList.toggle('on', on) }

/** De camera volgt de vertelling: tussen twee shots beweegt hij rustig in en uit */
const shot = (shots: Shot[], p: number) => {
  let a = shots[0]
  let b = shots[0]
  for (const s of shots) { if (s[0] <= p) a = s; if (s[0] >= p) { b = s; break } b = s }
  const k = a === b ? 0 : smooth(a[0], b[0], p)
  return { z: lerp(a[1], b[1], k), x: lerp(a[2], b[2], k), y: lerp(a[3], b[3], k), c: lerp(a[4] ?? 0, b[4] ?? 0, k) }
}

// ── De film ──
let lenis: Lenis | null = null
let started = false
let total = 0
let tilt = 0
let last = performance.now()

const update = (v: View, p: number, dt: number) => {
  const s = v.scene
  const m = reduce ? { x: 0, y: 0 } : getMotion()
  for (const pv of v.panels) {
    const pn = pv.p
    // Panelen schuiven niet het beeld in: ze worden onthuld, als inkt die over het papier loopt (een zachte wipe
    // vanaf hun kant, met een klein stukje beweging erbij), en lossen aan het eind rustig op
    const enter = pn.in == null ? 1 : easeOut(clamp((p - pn.in) / 0.16))
    const exit = pn.out == null ? 0 : smooth(pn.out, pn.out + 0.1, p)
    const d = pn.depth ?? 1
    const off = 1 - enter
    let tx = 0
    let ty = (0.5 - p) * d * 4
    const cut = (off * 100).toFixed(1)
    let clip = 'none'
    if (pn.in != null && off > 0.001) {
      if (pn.from === 'left') { tx -= off * 6; clip = `inset(0 ${cut}% 0 0)` }
      else if (pn.from === 'right') { tx += off * 6; clip = `inset(0 0 0 ${cut}%)` }
      else if (pn.from === 'top') { ty -= off * 3; clip = `inset(0 0 ${cut}% 0)` }
      else { ty += off * 3; clip = `inset(${cut}% 0 0 0)` }
    }
    ty -= exit * 4
    if (pn.role === 'debris') { const k = smooth(pn.in ?? 0, 1, p); ty -= k * 110; clip = 'none'; pv.el.style.rotate = `${(k * (pn.x - 50) * 4).toFixed(1)}deg` }
    pv.el.style.transform = `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}vh)`
    pv.el.style.clipPath = clip
    pv.el.style.opacity = (Math.min(1, enter * 1.6) * (1 - exit)).toFixed(3)
    if (pn.in != null && !pv.seen && enter > 0.4) { pv.seen = true; if (pn.sfx === 'click') score?.spark(); else score?.swish() }
    if (pn.in != null && enter < 0.05) pv.seen = false
    if (pn.lids) pv.el.style.setProperty('--open', smooth(pn.lids[0], pn.lids[1], p).toFixed(3))
    const shots = wide && pn.dshots ? pn.dshots : pn.shots
    if (shots) {
      const c = shot(shots, p)
      pv.pi.style.transformOrigin = `${c.x.toFixed(2)}% ${c.y.toFixed(2)}%`
      pv.pi.style.scale = c.z.toFixed(4)
      // Kadreren: het punt waar hij naar kijkt schuift (deels) naar het midden van het beeld
      pv.pi.style.translate = c.c ? `${((50 - c.x) * c.c).toFixed(2)}% ${((50 - c.y) * c.c).toFixed(2)}%` : ''
    }
    for (const lv of pv.layers) {
      const { l, el } = lv
      const ld = l.depth ?? 0.5
      let lx = m.x * ld * 14
      let ly = m.y * ld * 10
      let extra = ''
      let op = 1
      if (l.vis) {
        const on = p >= l.vis[0] && p < l.vis[1]
        op = on ? 1 : 0
        // Pose naar pose: de nieuwe pose springt erin met een kleine overshoot
        if (on && !lv.shown && !reduce) { el.classList.remove('snap'); void el.offsetWidth; el.classList.add('snap') }
        lv.shown = on
      }
      if (l.fade) op *= smooth(l.fade[0], l.fade[1], p)
      if (l.role === 'walker') {
        const k = smooth(l.vis ? l.vis[0] : 0.1, 1, p)
        const x0 = wide && l.d ? l.d[0] : l.x!
        el.style.left = `${(x0 + k * (wide ? 30 : 34)).toFixed(2)}%`
        if (Math.abs(k - v.walk) > 0.035) { v.walk = k; score?.step() }
      }
      if (l.role === 'split-l' || l.role === 'split-r') {
        const k = smooth(0.12, 0.7, p)
        const dir = l.role === 'split-l' ? -1 : 1
        lx += dir * k * 0.7 * vh
        ly -= k * 0.4 * vh
        extra = ` rotate(${(dir * k * 9).toFixed(2)}deg)`
      }
      if (l.role === 'riser') ly -= v.shown * 0.12 * vh // hij komt los van de grond, maar blijft helemaal in beeld
      if (l.role === 'faller') {
        // Hij valt langzaam achterover de rook in: van boven naar het midden, steeds kleiner, licht draaiend
        const k = smooth(0.4, 0.86, p)
        ly += (k * 0.55 - 0.42) * vh
        extra = ` rotate(${(Math.sin(p * 5) * 7).toFixed(2)}deg) scale(${(1.05 - k * 0.8).toFixed(3)})`
        op *= smooth(0.4, 0.5, p) * (1 - smooth(0.8, 0.88, p))
      }
      // Een getekende eindstand die verschijnt naarmate jij de interactie doet (of scrolt)
      if (l.byAct) op *= v.shown
      el.style.translate = `${lx.toFixed(1)}px calc(${ly.toFixed(1)}px + ${((0.5 - p) * ld * 4).toFixed(2)}vh)`
      el.style.transform = `${l.fit === 'fig' ? 'translateX(-50%)' : ''}${extra}`
      el.style.opacity = op.toFixed(3)
    }
  }

  // Tekstkaders met karaoke: het woord dat klinkt licht op. Zonder geluid volgt het woord je scroll.
  s.captions.forEach((c, i) => {
    const cs = v.caps[i]
    fillCaption(cs, c.vo)
    const here = smooth(c.at, c.at + 0.04, p) * (1 - smooth(c.to - 0.03, c.to, p))
    // Met geluid staat een zin in beeld zolang hij klinkt, ook als je al verder bent; een zin die op de vorige wacht,
    // verschijnt pas als hij begint (nooit twee kaders over elkaar)
    const own = soundOn && playing?.key === cs.key && speaking() ? playing : null
    const want = own ? 1 : soundOn && queued === cs.key ? 0 : here
    cs.vis += (want - cs.vis) * (1 - Math.exp(-dt * 12))
    const vis = cs.vis
    cs.el.style.opacity = vis.toFixed(3)
    cs.el.style.transform = `translateY(${((1 - vis) * (c.y > 50 ? 14 : -14)).toFixed(1)}px)`
    if (p < c.at - 0.02) { cs.played = false; if (queued === cs.key) queued = null }
    if (p >= c.at && p < c.to && !cs.played) { cs.played = true; play(cs.key) }
    const line = T[cs.key]
    let idx = -1
    if (line) {
      if (own) {
        const t = own.el.currentTime
        idx = line.words.findIndex((w, k) => t >= w.start && t < (line.words[k + 1]?.start ?? w.end + 0.3))
      } else if (!soundOn && vis > 0.5) {
        idx = Math.floor(clamp((p - c.at) / (c.to - c.at - 0.05)) * (line.words.length - 0.001))
      }
    }
    // Meelezen zoals in de app: wat gezegd is staat helder, wat nog komt staat gedimd
    cs.words.forEach((w, k) => { w.classList.toggle('on', k === idx); w.classList.toggle('said', idx >= 0 && k < idx) })
  })

  for (const pv of v.panels) for (const pt of pv.el.querySelectorAll<HTMLElement>('.postit:not(.pickit)')) {
    const on = p >= Number(pt.dataset.at)
    if (on && !pt.classList.contains('on')) score?.tape()
    pt.classList.toggle('on', on)
  }
  if (s.impact != null) {
    if (p < s.impact - 0.03) v.fired.delete('impact')
    if (p >= s.impact && !v.fired.has('impact')) { v.fired.add('impact'); impact(v.cam); if (playing) playing.el.pause(); queued = null }
  }
  if (s.shake && !reduce) {
    const a = 0.5 + p * 2.5
    v.cam.style.translate = `${((Math.random() - 0.5) * a).toFixed(1)}px ${((Math.random() - 0.5) * a).toFixed(1)}px`
  }
  // De aansteker: een klik en een vonk op "Een vonk", en nog eens
  if (s.id === 'aansteker') for (const at of [0.12, 0.2, 0.27]) {
    const key = `spark${at}`
    if (p < at - 0.02) v.fired.delete(key)
    if (p >= at && !v.fired.has(key)) { v.fired.add(key); score?.spark(); v.cam.querySelector('.sparks')?.classList.remove('on'); void v.cam.offsetWidth; v.cam.querySelector('.sparks')?.classList.add('on') }
  }
  // Geluiden op een vast moment: Noors melodie, de klik van het pakje, de melding
  for (const [i, sd] of (s.sounds ?? []).entries()) {
    const key = `sound${i}`
    if (p < sd.at - 0.03) v.fired.delete(key)
    if (p >= sd.at && p < sd.at + 0.2 && !v.fired.has(key)) {
      v.fired.add(key)
      if (sd.play === 'melody') score?.melody(sd.n, sd.mode)
      else if (sd.play === 'motif') score?.melody(2, 'box')
      else score?.spark()
    }
  }
  if (s.title) v.frame.style.setProperty('--title-in', smooth(s.title.at ?? -1, (s.title.at ?? -1) + 0.15, p).toFixed(3))

  // De val: inkt druipt traag over het beeld, de rook zuigt hem weg, dan zwart en stilte, dan licht
  if (s.fall) {
    v.frame.style.setProperty('--p', p.toFixed(3))
    if (p < 0.3) v.fired.delete('drop')
    if (p >= 0.82 && !v.fired.has('drop')) { v.fired.add('drop'); score?.drop() }
  }

  const act = s.act
  if (!act) return
  if (p >= act.from && p <= act.to && !(v.done && act.kind !== 'choose')) activeAct = v
  if (act.kind === 'pour') {
    // Afscheuren zoals in de app: vasthouden bouwt in 3 s spanning op, loslaten laat hem in 1 s terugveren. Dan
    // scheurt hij in één klap (geen overvloeier) en blijft hij eraf. Scrol je alleen door, dan scheurt hij laat vanzelf.
    if (p < act.from) { v.done = false; v.t = 0 }
    if (!v.done) v.t = clamp(v.t + (v.holding ? dt / 3 : -dt / 1))
    v.value = v.done ? 0 : Math.max(v.t, smooth(0.45, 0.85, p))
    if (v.value >= 1 && !v.done) { v.done = true; v.value = 0; endHold(); score?.tear(); impact(v.cam, 0.7) }
    v.shown = v.done ? 1 : 0
    // De spanning: het beeld trekt naar je toe en trilt steeds harder
    const a = reduce ? 0 : v.value * v.value * 3
    v.cam.style.scale = v.value ? (1 + 0.06 * easeOut(v.value)).toFixed(4) : ''
    v.cam.style.translate = a ? `${((Math.random() - 0.5) * a).toFixed(1)}px ${((Math.random() - 0.5) * a).toFixed(1)}px` : ''
    disc.style.setProperty('--v', v.value.toFixed(3))
  }
  if (act.kind === 'rise') {
    // Vasthouden: in 3 s verandert hij van onder naar boven in de man die hij kan zijn; loslaten veert terug. Eenmaal
    // helemaal veranderd blijft hij dat. Scrol je alleen door, dan gebeurt het laat in de scène vanzelf.
    if (p < act.from) { v.done = false; v.t = 0 }
    v.t = v.done ? 1 : clamp(v.t + (v.holding ? dt / 3 : -dt / 2))
    v.value = v.t
    v.shown = Math.max(smooth(0.4, 0.85, p), v.value)
    const shown = v.shown
    v.frame.style.setProperty('--rv', shown.toFixed(3))
    v.cam.style.scale = (1 + 0.04 * shown).toFixed(4)
    v.cam.style.setProperty('--beam', shown.toFixed(3))
    if (shown >= 0.98 && !v.done) {
      // Het moment van de waarheid (Darkest Dungeon): het beeld stokt, een trom, dan het oordeel
      v.done = true
      v.t = 1
      endHold()
      const verdict = $<HTMLElement>('.virtue', v.frame)
      score?.drum()
      impact(v.cam, 0.6)
      pop(verdict, true)
      setTimeout(() => pop(verdict, false), 2400)
      if (soundOn) { queued = null; speak('deugd') } // tegelijk met het oordeel, niet in de rij
    }
    disc.style.setProperty('--v', v.value.toFixed(3))
  }
  if (act.kind === 'knock') {
    if (p < act.from) { v.done = false; v.value = 0 }
    v.shown = Math.max(smooth(0.54, 0.6, p), v.value >= 1 ? 1 : 0)
    if (v.value >= 1 && !v.done) { v.done = true; setTimeout(() => score?.swish(), 500) }
    disc.style.setProperty('--v', v.value.toFixed(3))
  }
  if (act.kind === 'move') {
    // Trek de sigaret weg: hoe verder je sleept, hoe verder hij hem van de vlam houdt
    // Eenmaal ver genoeg weg blijft hij weg: de interactie is klaar en je scrolt verder
    if (p < act.from) { v.done = false; v.value = 0 }
    if (v.done) v.value = 1
    else if (v.holding) v.value = clamp(Math.hypot(pointer.x - v.pull.gx, pointer.y - v.pull.gy) / (0.28 * innerWidth))
    else v.value = clamp(v.value - dt * 0.8)
    // Gelukt: een halve seconde helemaal niets, dan één hartslag
    if (!v.done && v.value >= 0.92) { v.done = true; v.value = 1; endHold(); score?.hush(0.5) }
    v.shown = Math.max(smooth(0.55, 0.9, p), v.value)
    disc.style.setProperty('--v', v.value.toFixed(3))
  }
}

/**
 * De overgang naar een scène, over één scherm scrollen (t van 0 naar 1). De vorige scène duwt zacht door
 * (een beetje dichterbij en donkerder); de nieuwe komt eroverheen:
 * - ink: een inktvlek die vanuit het midden uitloopt en het nieuwe beeld onthult;
 * - fade: rustig overvloeien (vanuit of naar zwart);
 * - zoom: een match cut naar een close-up, het nieuwe beeld zakt van dichtbij op zijn plek;
 * - eyes: door zijn ogen: een smalle spleet licht die opengaat, even knippert, dan scherp wordt;
 * - light: door wit heen, als een sluier van licht die opkomt en weer wegtrekt;
 * - cut: een harde cut, voor een match cut (dezelfde hand, eerst overdag, dan 's nachts);
 * - dip: eerst helemaal naar zwart, dan het nieuwe beeld (tekst schuift nooit over tekst, zoals in het merkdeel).
 */
type Tr = 'ink' | 'fade' | 'zoom' | 'eyes' | 'light' | 'cut' | 'dip'
const TR: Record<string, Tr> = {
  deur: 'fade', steeg: 'cut', vlam: 'zoom', breken: 'ink', val: 'fade', ontwaken: 'eyes', keuze: 'zoom', visie: 'light', noor: 'light', titeldrop: 'fade',
  ritueel: 'dip', jouwspiegel: 'dip', app: 'dip', installeer: 'dip', footer: 'dip',
}
const veil = document.createElement('div')
veil.className = 'veil'
document.body.append(veil)
let veilT = 0
const setMask = (el: HTMLElement, img: string, size = 'auto') => {
  const s = el.style as CSSStyleDeclaration & { webkitMaskImage: string; webkitMaskSize: string }
  s.maskImage = s.webkitMaskImage = img
  s.maskSize = s.webkitMaskSize = size
}
/** Hoe ver de ogen open zijn: een eerste spleet, één keer knipperen, dan helemaal open */
const lidOpen = (t: number) => (t < 0.38 ? 0.18 * easeOut(t / 0.38) : t < 0.5 ? 0.18 * (1 - smooth(0.38, 0.44, t)) + 0.04 * smooth(0.44, 0.5, t) : lerp(0.04, 1, easeInOut((t - 0.5) / 0.5)))
const transition = (v: View, prev: View | undefined, t: number) => {
  const kind = TR[v.scene.id] ?? (v.scene.world === 'zwart' ? 'fade' : 'ink')
  const st = v.stage
  const k = easeInOut(t)
  const busy = t > 0 && t < 1
  if (prev) {
    const dark = kind === 'dip' ? 1 - smooth(0, 0.5, t) : 1 - k * 0.55
    prev.cam.style.filter = busy && kind !== 'light' && kind !== 'eyes' ? `brightness(${dark.toFixed(3)})` : ''
    prev.stage.style.scale = busy ? (1 + k * 0.05).toFixed(4) : ''
  }
  if (kind === 'light' && busy) veilT = Math.max(veilT, Math.sin(Math.PI * t))
  if (t >= 1 || reduce) { setMask(st, 'none'); st.style.opacity = ''; st.style.scale = ''; v.cam.style.filter = ''; return }
  st.style.scale = ''
  v.cam.style.filter = ''
  if (kind === 'dip') {
    setMask(st, 'none')
    st.style.opacity = smooth(0.5, 1, t).toFixed(3)
  } else if (kind === 'cut') {
    // Een harde cut (de match cut van de deur naar de steeg): halverwege het scherm wisselt het beeld in één keer
    setMask(st, 'none')
    st.style.opacity = t > 0.5 ? '1' : '0'
  } else if (kind === 'ink') {
    // Twee lagen masker: de inktvlek groeit, en een zachte cirkel vult de gaten op het eind
    const r = Math.max(0, (k - 0.45) * 190)
    setMask(st, `url(/art/scherm-inktvlek.webp), radial-gradient(circle at 50% 50%, #000 ${r.toFixed(1)}%, transparent ${(r + 30).toFixed(1)}%)`, `${(k * 520).toFixed(1)}% auto, 100% 100%`)
    st.style.opacity = String(Math.min(1, k * 4))
    st.style.scale = (1.08 - k * 0.08).toFixed(4)
  } else if (kind === 'eyes') {
    // Zwart, dan gaan zijn ogen open: een horizontale spleet met zachte randen, wazig tot hij scherp ziet
    const h = lidOpen(t) * 62
    const f = 4 + (1 - t) * 6
    setMask(st, `linear-gradient(to bottom, transparent ${(50 - h).toFixed(2)}%, #000 ${(50 - h + f).toFixed(2)}%, #000 ${(50 + h - f).toFixed(2)}%, transparent ${(50 + h).toFixed(2)}%)`, '100% 100%')
    st.style.opacity = h > 0.5 ? '1' : '0'
    if (!reduce) v.cam.style.filter = `blur(${((1 - smooth(0.45, 1, t)) * 7).toFixed(2)}px) brightness(${(1.6 - smooth(0.3, 1, t) * 0.6).toFixed(3)})`
  } else if (kind === 'zoom') {
    setMask(st, 'none')
    st.style.opacity = smooth(0.15, 0.85, t).toFixed(3)
    st.style.scale = (1.22 - k * 0.22).toFixed(4)
  } else if (kind === 'light') {
    // Onder de witte sluier wisselt het beeld; je ziet de wissel nooit
    setMask(st, 'none')
    st.style.opacity = t > 0.5 ? '1' : '0'
    st.style.scale = (1.04 - k * 0.04).toFixed(4)
  } else {
    setMask(st, 'none')
    st.style.opacity = k.toFixed(3)
  }
}

// ── Tempo: in de rustige momenten bepaalt het verhaal het tempo, maar je duim wordt nooit genegeerd ──
// Het beeld volgt je scroll (yView). In een scène met `pace` loopt het in dat tempo, en hoe verder je vooruit scrolt,
// hoe harder het meetrekt: elke veeg doet iets, en het loopt hooguit MAX_LAG achter. Daarbuiten haalt het een
// achterstand zacht in (geen sprong). Terug scrollen en sprongen (hoofdstukken) gaan direct. Het beeld wacht nooit
// op de stem: die praat zijn zin uit en het tekstkader blijft zolang staan (zie `play` en de tekstkaders).
let yView = 0
let yScrollLast = 0
let jumping = 0
const MAX_LAG = 1.5 // schermhoogtes: verder dan dit loopt het beeld nooit achter
const PULL = 1.2 // per seconde: hoe hard een achterstand het beeld meetrekt in een rustige scène
const CATCH_UP = 8 // per seconde: hoe snel een achterstand daarbuiten wordt ingehaald (95% in ~0,4 s)
const sceneAt = (y: number) => views.find((v) => y >= v.top && y < v.top + v.height)
/** Zwaarder scrollen in een rustige scène: hetzelfde wieltje legt minder af. */
const heaviness = () => (sceneAt(yView)?.scene.pace ? 0.5 : 1)

let lastChapter = ''
const frame = (now: number) => {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  lenis?.raf(now)
  const yScroll = lenis ? lenis.scroll : scrollY
  if (jumping > 0 || yScroll <= yView) {
    yView = yScroll
    jumping = Math.max(0, jumping - dt)
  } else {
    const v = sceneAt(yView)
    const lag = yScroll - yView
    const next = v?.scene.pace
      ? yView + (vh / v.scene.pace + lag * PULL) * dt
      : yView + Math.max(yScroll - yScrollLast, lag * (1 - Math.exp(-CATCH_UP * dt)))
    yView = Math.max(Math.min(next, yScroll), yScroll - MAX_LAG * vh)
  }
  yScrollLast = yScroll
  const y = yView
  // De camera helt mee met je scrollsnelheid en veert terug als je stopt (zoals bij Santioni)
  tilt += (clamp((lenis?.velocity ?? 0) * 0.004, -0.2, 0.2) - tilt) * 0.06
  activeAct = null
  veilT = 0
  let current: View | null = null
  for (const [i, v] of views.entries()) {
    // Elke scène is een vaste laag. De volgende komt er in het laatste scherm overheen (zie `transition`),
    // dus je scrolt nooit een blad weg: het ene beeld gaat over in het andere.
    const on = y >= v.top - vh && y < v.top + v.height
    v.stage.classList.toggle('on', on)
    if (!on) continue
    const p = (y - v.top) / (v.scene.sh * vh)
    if (!current && y >= v.top - vh * 0.5 && y < v.top + v.height - vh * 0.5) current = v
    update(v, p, dt)
    transition(v, views[i - 1], clamp((y - (v.top - vh)) / vh))
    if (!reduce) v.frame.style.rotate = `x ${(-tilt * 0.3).toFixed(4)}rad`
  }
  veil.style.opacity = (easeInOut(veilT) * 0.96).toFixed(3)
  const act = (activeAct as View | null)?.scene.act // update() zet hem; TS ziet dat niet
  disc.classList.toggle('on', !!act)
  document.body.classList.toggle('acting', !!act && !touch)
  if (act) {
    const chosen = act.kind === 'choose' && (activeAct as View | null)?.done
    $<HTMLElement>('span', disc).innerText = chosen ? 'GEKOZEN\n↓' : (touch && act.touchText) || act.text
    disc.classList.toggle('ok', !!chosen)
    disc.classList.toggle('choose', act.kind === 'choose')
    if (!touch) disc.style.translate = `${pointer.x}px ${pointer.y}px`
  }
  if (current) {
    const p = clamp((y - current.top) / (current.scene.sh * vh))
    score?.update(current.scene.id, p, (activeAct as View | null)?.value ?? 0)
    score?.duck(!!playing && !playing.el.paused)
    if (current.scene.id !== lastChapter) {
      lastChapter = current.scene.id
      decodeAhead(current)
      chapters.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === lastChapter))
    }
  }
  // Tempo-meter
  if (started && current) {
    total += dt
    current.time += dt
    const vo = current.scene.captions.reduce((n, c) => n + (T[voKey(c.vo)]?.duration ?? 0), 0)
    const p = (y - current.top) / (current.scene.sh * vh)
    hudNow.innerHTML = `<b>${current.scene.name}</b> · ${fmt(total)} · hier ${fmt(current.time)}${vo ? `/${fmt(vo)}` : ''}`
    if (!hudList.hidden) hudCue.innerHTML = `${current.scene.ref} · p ${clamp(p, -1, 2).toFixed(2)}<br/><span>${current.scene.cue}</span>`
  }
  requestAnimationFrame(frame)
}

/** Wat je per scène deed, naast hoe lang de zinnen duren: zo zie je waar het te snel of te traag is. */
const renderList = () => {
  hudList.innerHTML = views.map((v) => {
    const vo = v.scene.captions.reduce((n, c) => n + (T[voKey(c.vo)]?.duration ?? 0), 0)
    const flag = vo && v.time ? (v.time < vo * 0.8 ? ' ⚠ sneller dan de stem' : '') : ''
    return `<li>${v.scene.name} · ${v.scene.sh} sh · jij ${fmt(v.time)}${vo ? ` / stem ${fmt(vo)}` : ''}${flag}</li>`
  }).join('') + `<li><b>Totaal ${fmt(total)}</b></li>`
}
$<HTMLElement>('.hud').addEventListener('click', () => { hudList.hidden = !hudList.hidden; hudCue.hidden = hudList.hidden; renderList() })
addEventListener('keydown', (e) => { if (e.key === 'h') $<HTMLElement>('.hud').classList.toggle('off') })
chapters.addEventListener('click', (e) => {
  const v = views.find((w) => w.scene.id === (e.target as HTMLElement).dataset.id)
  jumping = 1.8 // een sprong gaat direct, zonder tempo
  if (v && lenis) lenis.scrollTo(v.top, { duration: 1.6 })
  else if (v) scrollTo({ top: v.top, behavior: 'smooth' })
})

// ── Start ──
const start = async () => {
  history.scrollRestoration = 'manual'
  startMotion()
  T = await fetch('/animatic/vo/timings.json').then((r) => r.json())
  for (const key of Object.keys(T)) {
    const el = new Audio(`/animatic/vo/${key}.m4a`)
    el.preload = 'auto'
    el.addEventListener('ended', playQueued)
    audio.set(key, el)
  }
  layout()
  addEventListener('resize', layout)
  if (!reduce) {
    lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      // Zwaarder scrollen in de rustige momenten (Lenis laat ons de afstand per wieltje aanpassen)
      virtualScroll: (e) => { const k = heaviness(); e.deltaX *= k; e.deltaY *= k; return true },
    })
  }
  requestAnimationFrame(frame)
  const jump = new URLSearchParams(location.search).get('scene')
  const gate = $<HTMLElement>('.gate')
  const go = (withSound: boolean) => {
    void enableMotion()
    if (withSound) void setSound(true)
    gate.classList.add('out')
    setTimeout(() => gate.remove(), 900)
    started = true
    document.body.classList.add('playing')
    const target = views.find((v) => v.scene.id === jump)
    jumping = 0.5
    if (target && lenis) lenis.scrollTo(target.top, { immediate: true })
    else if (target) scrollTo(0, target.top)
  }
  gate.querySelectorAll<HTMLButtonElement>('button').forEach((b) => b.addEventListener('click', () => go(b.dataset.sound === '1')))
}
void start()
