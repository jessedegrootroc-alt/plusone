// Een gebaar dat iets kost (BRIEF §3): vasthouden of slepen, met een ring die zich vult.
// Te vroeg loslaten veert terug zonder straf; uitleg komt pas als je aarzelt; er is altijd een uitweg.
import { clamp, type Gate } from './story'

export interface GestureEvents {
  progress: (p: number, active: boolean) => void
  release: () => void
  done: () => void
}

const HINT_AFTER = 1500
const SKIP_AFTER = 6000

export class Gesture {
  el: HTMLDivElement
  private ring: SVGCircleElement
  private label: HTMLSpanElement
  private skip: HTMLButtonElement
  private gate: Gate | null = null
  private p = 0
  private active = false
  private t0 = 0
  private y0 = 0
  private raf = 0
  private hintTimer = 0
  private skipTimer = 0
  private simple: boolean
  private on: GestureEvents

  constructor(on: GestureEvents, simple: boolean) {
    this.on = on
    this.simple = simple
    this.el = document.createElement('div')
    this.el.className = 'gate'
    this.el.setAttribute('role', 'button')
    this.el.tabIndex = -1
    this.el.innerHTML = `
      <div class="gate-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="track"/><circle cx="60" cy="60" r="52" class="fill" pathLength="100"/></svg><i class="gate-arrow" aria-hidden="true"></i></div>
      <span class="gate-label"></span>
      <button class="gate-skip" type="button">Sla over</button>`
    this.ring = this.el.querySelector('.fill')!
    this.label = this.el.querySelector('.gate-label')!
    this.skip = this.el.querySelector('.gate-skip')!
    this.skip.addEventListener('click', (e) => { e.stopPropagation(); this.finish() })
    this.el.addEventListener('pointerdown', this.down)
    window.addEventListener('pointerup', this.up)
    window.addEventListener('pointercancel', this.up)
    window.addEventListener('pointermove', this.move)
    window.addEventListener('keydown', this.key)
    window.addEventListener('keyup', this.keyUp)
    document.body.append(this.el)
  }

  /** Een keerpunt openen: de pagina staat stil tot het gebaar gelukt is. */
  show(g: Gate) {
    this.gate = g
    this.p = 0
    this.draw()
    this.el.dataset.kind = this.simple ? 'tap' : g.kind
    this.label.textContent = this.simple ? 'Verder' : g.label
    this.el.setAttribute('aria-label', this.simple ? 'Verder' : `${g.label} om verder te gaan`)
    this.el.classList.add('on')
    this.el.classList.remove('hint', 'skippable')
    clearTimeout(this.hintTimer)
    clearTimeout(this.skipTimer)
    this.hintTimer = window.setTimeout(() => this.el.classList.add('hint'), this.simple ? 0 : HINT_AFTER)
    this.skipTimer = window.setTimeout(() => this.el.classList.add('skippable'), SKIP_AFTER)
    this.el.focus({ preventScroll: true })
  }

  hide() {
    this.gate = null
    this.el.classList.remove('on', 'hint', 'skippable', 'held')
    clearTimeout(this.hintTimer)
    clearTimeout(this.skipTimer)
  }

  get current() { return this.gate }

  private draw() {
    this.ring.style.strokeDasharray = `${this.p * 100} 100`
    this.el.style.setProperty('--p', this.p.toFixed(3))
  }

  private down = (e: PointerEvent) => {
    if (!this.gate || (e.target as HTMLElement).closest('.gate-skip')) return
    e.preventDefault()
    if (this.simple) return this.finish()
    this.active = true
    this.el.classList.add('held')
    this.el.classList.remove('hint')
    clearTimeout(this.hintTimer)
    this.t0 = performance.now() - this.p * (this.gate.ms ?? 1200)
    this.y0 = e.clientY - this.p * innerHeight * 0.4
    if (this.gate.kind === 'hold') this.tick()
  }

  private tick = () => {
    if (!this.active || !this.gate) return
    this.p = clamp((performance.now() - this.t0) / (this.gate.ms ?? 1200))
    this.draw()
    this.on.progress(this.p, true)
    if (this.p >= 1) return this.finish()
    this.raf = requestAnimationFrame(this.tick)
  }

  private move = (e: PointerEvent) => {
    if (!this.active || this.gate?.kind !== 'drag') return
    // Slepen met weerstand, als elastiek: de eerste centimeters gaan makkelijk, daarna zwaarder
    const raw = clamp((e.clientY - this.y0) / (innerHeight * 0.4))
    this.p = Math.pow(raw, 1.25)
    this.draw()
    this.on.progress(this.p, true)
    if (raw >= 1) this.finish()
  }

  private up = () => {
    if (!this.active) return
    this.active = false
    cancelAnimationFrame(this.raf)
    this.el.classList.remove('held')
    if (!this.gate || this.p >= 1) return
    // Te vroeg los: terugveren
    this.on.release()
    const from = this.p
    const t0 = performance.now()
    const back = () => {
      const k = clamp((performance.now() - t0) / 320)
      this.p = from * (1 - (1 - Math.pow(1 - k, 3)))
      this.draw()
      this.on.progress(this.p, false)
      if (k < 1 && !this.active) requestAnimationFrame(back)
    }
    requestAnimationFrame(back)
    this.hintTimer = window.setTimeout(() => this.el.classList.add('hint'), HINT_AFTER)
  }

  /** Spatiebalk vasthouden doet hetzelfde als je vinger, ook bij slepen. */
  private key = (e: KeyboardEvent) => {
    if (!this.gate || e.repeat || (e.key !== ' ' && e.key !== 'Enter')) return
    e.preventDefault()
    if (this.simple || e.key === 'Enter') return this.finish()
    this.active = true
    this.el.classList.add('held')
    this.t0 = performance.now() - this.p * (this.gate.ms ?? 1200)
    this.tick()
  }
  private keyUp = (e: KeyboardEvent) => { if (e.key === ' ') this.up() }

  private finish() {
    if (!this.gate) return
    this.active = false
    cancelAnimationFrame(this.raf)
    this.p = 1
    this.draw()
    this.on.progress(1, false)
    this.on.done()
  }
}
