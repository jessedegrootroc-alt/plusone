// Beweging voor de hele app: de stand van je telefoon (gyroscoop), op desktop de muis.
// Eén bron, één intensiteit en één easing, zodat elk scherm op dezelfde manier meebeweegt.
// Uitkomst: --tx en --ty op <html> (-1 tot 1), en getMotion() voor de canvas-scènes.

/** Maximale kanteling in graden; verder kantelen doet niets meer. */
const MAX = 15
/** Hoe snel de beweging de stand volgt, per frame bij 60 fps. Laag is zacht en trillingsvrij. */
const EASE = 0.08
/** Voor- en achterover kantel je vanzelf bij het scrollen: die as telt maar half mee. */
const Y_WEIGHT = 0.5

const target = { x: 0, y: 0 }
const cur = { x: 0, y: 0 }
let base: { b: number; g: number } | null = null
let raf = 0
let running = false
let listening = false

const clamp = (v: number) => Math.max(-MAX, Math.min(MAX, v))
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** De stand bij het openen is het nulpunt, zodat het niet uitmaakt hoe je de telefoon vasthoudt. */
const onTilt = (e: DeviceOrientationEvent) => {
  if (e.beta == null || e.gamma == null) return
  if (!base) base = { b: e.beta, g: e.gamma }
  target.x = clamp(e.gamma - base.g) / MAX
  target.y = (clamp(e.beta - base.b) / MAX) * Y_WEIGHT
}

/** Desktop: de muis als vervanger. Een vinger op het scherm is scrollen en telt niet mee. */
const onMouse = (e: PointerEvent) => {
  if (e.pointerType !== 'mouse') return
  target.x = (e.clientX / innerWidth) * 2 - 1
  target.y = ((e.clientY / innerHeight) * 2 - 1) * Y_WEIGHT
}
const onLeave = () => { target.x = 0; target.y = 0 }

const root = document.documentElement
const loop = () => {
  const dx = target.x - cur.x
  const dy = target.y - cur.y
  if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
    cur.x += dx * EASE
    cur.y += dy * EASE
    root.style.setProperty('--tx', cur.x.toFixed(4))
    root.style.setProperty('--ty', cur.y.toFixed(4))
  }
  raf = requestAnimationFrame(loop)
}

/** Zet de lus aan (eenmalig, bij het starten van de app). Bij minder beweging blijft alles stil. */
export const startMotion = () => {
  if (running || reduced()) return
  running = true
  window.addEventListener('pointermove', onMouse)
  document.addEventListener('pointerleave', onLeave)
  // Android en desktop: werkt meteen. iOS: pas na toestemming, zie enableMotion.
  if (!needsPermission()) listen()
  // Terug in de app: opnieuw ijken op hoe je de telefoon nu vasthoudt
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0 }
    else { base = null; if (!raf) raf = requestAnimationFrame(loop) }
  })
  raf = requestAnimationFrame(loop)
}

const listen = () => {
  if (listening) return
  listening = true
  window.addEventListener('deviceorientation', onTilt)
}

type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

/** iOS vraagt toestemming, en alleen na een tik. */
export const needsPermission = () => typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as IOSOrientation).requestPermission === 'function'

/** Vraag om de gyroscoop (iOS) en luister ernaar. Moet vanuit een tik worden aangeroepen. */
export const enableMotion = async () => {
  if (!running) return false
  if (listening) return true
  const D = DeviceOrientationEvent as IOSOrientation
  if (D.requestPermission) {
    try {
      if ((await D.requestPermission()) !== 'granted') return false
    } catch {
      return false // geen HTTPS, of geen tik: dan blijft het stil
    }
  }
  listen()
  return true
}

/** Of de gyroscoop al meedoet. */
export const motionOn = () => listening

/** De gladgestreken stand, -1 tot 1, voor wie zelf tekent (de canvas-scènes). */
export const getMotion = () => cur
