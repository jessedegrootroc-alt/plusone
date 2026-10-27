import { useEffect, useId, useRef, type CSSProperties } from 'react'
import { cameraAt } from '../lib/motion'
import { ART } from '../data/tableaux'
import type { SinMeta } from '../data/sins'
import TableauParts from './TableauParts'

const FIG = 150 // hoe groot elk tafereel op de kaart staat
const MOTES = [58, 66, 74, 82, 90, 96]
const TAU = Math.PI * 2

const load = (n: string) => new Promise<HTMLImageElement>((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(i); i.src = `/art/${n}.webp` })

/** Een beeld vullend in een vak, zoals background-size: cover, met de focus op (px, py). */
const cover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, px = 0.5, py = 0.5) => {
  if (!img.naturalWidth) return
  const k = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * k
  const dh = img.naturalHeight * k
  ctx.drawImage(img, x + (w - dw) * px, y + (h - dh) * py, dw, dh)
}

type Imgs = { bg: HTMLImageElement; rays: HTMLImageElement; glow: HTMLImageElement; mist: HTMLImageElement; mote: HTMLImageElement }
type Cam = ReturnType<typeof cameraAt>

/** Een laag op diepte d: schuift tegen de camera in en zoomt mee rond (midden, 62%), net als in LivingScene. */
const inLayer = (ctx: CanvasRenderingContext2D, W: number, H: number, cam: Cam, d: number, fn: () => void) => {
  ctx.save()
  ctx.translate(W / 2 - cam.x * d, H * 0.62 - cam.y * d)
  const z = 1 + (cam.zoom - 1) * (0.3 + d)
  ctx.scale(z, z)
  ctx.translate(-W / 2, -H * 0.62)
  fn()
  ctx.restore()
}

/** Achter de figuren: de lucht, de schaduw van links, en het licht van rechtsboven. */
const drawBack = (ctx: CanvasRenderingContext2D, W: number, H: number, t: number, cam: Cam, im: Imgs) => {
  ctx.clearRect(0, 0, W, H)
  inLayer(ctx, W, H, cam, 0.2, () => {
    cover(ctx, im.bg, -16, -8, W + 32, H + 16, 0.5, 0.3)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fillRect(-40, -40, W + 80, H + 80)
  })
  const shade = ctx.createLinearGradient(0, 0, W, 0)
  shade.addColorStop(0, 'rgba(0,0,0,0.85)')
  shade.addColorStop(0.4, 'rgba(0,0,0,0.55)')
  shade.addColorStop(0.75, 'rgba(0,0,0,0.1)')
  shade.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, W, H)
  inLayer(ctx, W, H, cam, 0.35, () => {
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    // Stralen van rechtsboven, ademend op een maat van 12 s
    ctx.globalAlpha = 0.32 + 0.1 * Math.sin((TAU * t) / 12)
    const rw = W * 0.72
    const rh = H * 0.95
    ctx.translate(W * 1.12, -H * 0.12)
    ctx.scale(-1, 1)
    cover(ctx, im.rays, 0, 0, rw, rh, 0, 0)
    ctx.restore()
    // Gloed achter de deugd
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    const p = 0.5 - 0.5 * Math.cos((TAU * t) / 6)
    ctx.globalAlpha = 0.24 + 0.14 * p
    const s = 240 * (1 + 0.06 * p)
    ctx.drawImage(im.glow, W + 40 - 120 - s / 2, H - 120 - s / 2, s, s)
    ctx.restore()
  })
}

/** Voor de figuren: stof dat opstijgt in het licht, en mist laag over de grond aan de schaduwkant. */
const drawFront = (ctx: CanvasRenderingContext2D, W: number, H: number, t: number, cam: Cam, im: Imgs, mist: HTMLCanvasElement | null) => {
  ctx.clearRect(0, 0, W, H)
  ctx.save()
  inLayer(ctx, W, H, cam, 0.8, () => {
    MOTES.forEach((x, i) => {
      const ph = (((t + i) % 6) + 6) % 6 / 6
      const a = ph < 0.15 ? (ph / 0.15) * 0.55 : 0.55 - (ph - 0.15) * 0.25
      ctx.globalAlpha = Math.max(0, ph > 0.85 ? a * (1 - ph) / 0.15 : a)
      ctx.drawImage(im.mote, (W * x) / 100 + 12 * ph, H * 0.86 - 160 * ph, 6, 9.5)
    })
  })
  if (mist) inLayer(ctx, W, H, cam, 1, () => {
    ctx.globalAlpha = 0.3
    ctx.drawImage(mist, -W * 0.2 + 18 * Math.sin((TAU * t) / 24), H - 96)
  })
  ctx.restore()
}

/** De mist als één strook, eenmalig getekend: herhaald in de breedte en naar rechts weggevaagd. */
const mistStrip = (W: number, img: HTMLImageElement, dpr: number) => {
  if (!img.naturalWidth) return null
  const c = document.createElement('canvas')
  const w = W * 1.4
  const h = 120
  c.width = w * dpr
  c.height = h * dpr
  const x = c.getContext('2d')!
  x.scale(dpr, dpr)
  const tw = (img.naturalWidth / img.naturalHeight) * h
  for (let i = 0; i < w; i += tw) x.drawImage(img, i, 0, tw, h)
  // De mist staat op zwart; maak er licht met doorzichtigheid van, zodat hij zonder blend-mode over de figuren valt
  const px = x.getImageData(0, 0, c.width, c.height)
  for (let i = 0; i < px.data.length; i += 4) {
    const l = (px.data[i] + px.data[i + 1] + px.data[i + 2]) / 3
    px.data[i] = px.data[i + 1] = px.data[i + 2] = 242
    px.data[i + 3] = l
  }
  x.putImageData(px, 0, 0)
  x.globalCompositeOperation = 'destination-in'
  const g = x.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, '#000')
  g.addColorStop(0.3 + 0.2 / 1.4, '#000')
  g.addColorStop(0.72 * (1 / 1.4) + 0.2 / 1.4, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, w, h)
  return c
}

/**
 * Je zwakste terras als één rustige scène: één achtergrond, links in de schaduw met mist over de grond,
 * daar staat de zonde; rechts in het licht met stralen en opstijgend stof, daar staat de deugd.
 * Een lichtje loopt het pad van de een naar de ander.
 * De camera is dezelfde als op Vandaag (cameraAt): hij ademt en drijft, en volgt je telefoon.
 * Elke laag hangt op een diepte: hoe dichterbij, hoe meer hij meebeweegt, net als in de levende scène.
 */
export default function ShadowPath({ meta, onOpen }: { meta: SinMeta; onOpen: () => void }) {
  const id = useId().replace(/:/g, '')
  const [virtue, sin] = ART[meta.id]
  const k = { '--k': FIG / 627 } as CSSProperties
  const path = 'M 116 276 C 148 286, 182 262, 214 254'
  const ref = useRef<HTMLButtonElement>(null)
  const backRef = useRef<HTMLCanvasElement>(null)
  const frontRef = useRef<HTMLCanvasElement>(null)
  // Lucht, licht, stof en mist tekenen op canvas (zoals de scène op Vandaag): blend-modes op lagen die
  // elk frame bewegen laten Safari flikkeren of lagen wegvallen. De figuren volgen dezelfde camera via --cx/--cy/--cz.
  useEffect(() => {
    const el = ref.current
    const back = backRef.current
    const front = frontRef.current
    if (!el || !back || !front) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const bctx = back.getContext('2d')!
    const fctx = front.getContext('2d')!
    let im: Imgs | null = null
    let mist: HTMLCanvasElement | null = null
    let W = 0
    let H = 0
    let dpr = 1
    let raf = 0
    let on = false
    let alive = true
    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1)
      W = el.clientWidth
      H = el.clientHeight
      for (const c of [back, front]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr) }
      if (im) mist = mistStrip(W, im.mist, dpr)
    }
    const frame = (now: number) => {
      if (!im || !W) return
      const t = now / 1000
      const cam = reduce ? { x: 0, y: 0, zoom: 1.02 } : cameraAt(t)
      for (const x of [bctx, fctx]) x.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawBack(bctx, W, H, t, cam, im)
      drawFront(fctx, W, H, t, cam, im, mist)
      el.style.setProperty('--cx', cam.x.toFixed(2))
      el.style.setProperty('--cy', cam.y.toFixed(2))
      el.style.setProperty('--cz', (cam.zoom - 1).toFixed(4))
    }
    const tick = (now: number) => { frame(now); raf = requestAnimationFrame(tick) }
    const start = () => { if (!on && !reduce) { on = true; raf = requestAnimationFrame(tick) } }
    const stop = () => { on = false; cancelAnimationFrame(raf) }
    Promise.all([load('achtergrond-terrassen-1-ver'), load('effect-stralen'), load('effect-gloed'), load('effect-mist'), load('effect-stofje')]).then(([bg, rays, glow, mi, mote]) => {
      if (!alive) return
      im = { bg, rays, glow, mist: mi, mote }
      size()
      frame(performance.now())
    })
    const ro = new ResizeObserver(() => { size(); frame(performance.now()) })
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
    io.observe(el)
    return () => { alive = false; stop(); ro.disconnect(); io.disconnect() }
  }, [])
  const depth = (d: number) => ({ '--d': d }) as CSSProperties
  return (
    <button ref={ref} className="card mt-16 ps" onClick={onOpen} aria-label={`Hier zit je schaduw het sterkst: ${meta.sin}, op weg naar ${meta.virtue}`}>
      {/* Achter de figuren: lucht, schaduw en licht, op canvas */}
      <canvas ref={backRef} className="ps-canvas" aria-hidden="true" />

      <div className="ps-cam" style={depth(0.6)}>
      <div className="ps-fig sin" style={k}><span className="ps-shadow" /><div className="ps-art"><TableauParts name={sin} /></div></div>
      <div className="ps-fig virtue" style={k}><span className="ps-shadow" /><div className="ps-art"><TableauParts name={virtue} /></div></div>

      <svg className="ps-path" viewBox="0 0 327 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <path id={`p${id}`} d={path} fill="none" stroke="#F2F2F2" strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="1.5 5" strokeLinecap="round" />
        <image href="/art/effect-lichtje.webp" width="18" height="20" x="-9" y="-10">
          <animateMotion dur="6s" repeatCount="indefinite" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines="0.45 0 0.55 1">
            <mpath href={`#p${id}`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.8;1" dur="6s" repeatCount="indefinite" />
        </image>
      </svg>
      </div>

      {/* Voor de figuren: stof en mist, op canvas */}
      <canvas ref={frontRef} className="ps-canvas" aria-hidden="true" />
      <span className="ps-vignette" aria-hidden="true" />

      <div className="txt">
        <div className="eyebrow">Hier zit je schaduw het sterkst</div>
        <div className="h2">{meta.sin} <span style={{ color: 'var(--ink-3)' }}>→</span> {meta.virtue}</div>
      </div>
    </button>
  )
}
