// De film zelf, op één canvas. Elk frame leest u (waar je bent), t (de tijd), en hoe ver het huidige gebaar is.
// Stijl: Darkest Dungeon. Gravure in zwart-wit, lagen op diepte, poppenspel, deeltjes, een klap bij impact.
// De camera is dezelfde als in de app (cameraAt): hij ademt, drijft en volgt je telefoon.
import { cameraAt } from '../lib/motion'
import { clamp, easeOut, lerp, smooth, type GateId } from './story'

export type Imgs = Record<string, HTMLImageElement>

const BG = (scene: string) => ['1-ver', '2-midden', '3-grond', '4-voorgrond'].map((l) => `art/achtergrond-${scene}-${l}`)
const SINS = ['hoogmoed', 'afgunst', 'toorn', 'traagheid', 'hebzucht', 'vraatzucht', 'lust']
const VIRTUES = ['nederigheid', 'welwillendheid', 'geduld', 'ijver', 'vrijgevigheid', 'matigheid', 'zuiverheid']

/** Alles wat de film nodig heeft, in de volgorde waarin hij het gebruikt (het eerste bedrijf eerst). */
export const ASSETS = [
  ...BG('woud'),
  'art/karakter-schim', 'art/item-drankfles', 'art/item-vape', 'art/item-fastfood', 'art/item-dobbelstenen', 'art/item-asbak', 'art/item-gebroken-glas',
  'art/item-lantaarn', 'art/item-raaf-zittend', 'art/item-raaf-vleugels-omhoog', 'art/item-raaf-vleugels-omlaag',
  'art/effect-regen', 'art/effect-ogen', 'art/effect-gloed', 'verhaal/item-telefoon',
  // Tot hier is bedrijf I en het begin van II: daarop wacht het laadscherm. De rest komt erachteraan.
  'art/effect-stralen', 'art/effect-mist', 'verhaal/scherm-inktvlek', 'art/effect-wervelwind', 'art/effect-vonk', 'art/effect-stofje',
  'art/achtergrond-inferno-1-ver', 'art/achtergrond-terrassen-1-ver', 'art/karakter-verdwaalde',
  ...BG('kust'), 'verhaal/item-handspiegel', 'art/karakter-balans', 'art/karakter-klimmer',
  ...SINS.map((s) => `art/rig-${s}-basis`), ...VIRTUES.map((s) => `art/rig-${s}-basis`),
  ...BG('paradiso'), 'art/karakter-ideaal', 'art/item-stralenkrans', 'art/item-duif-omhoog', 'art/item-duif-omlaag', 'verhaal/item-lauwerkrans',
]

/** Zoveel beelden zijn nodig voor de eerste schermen: tot en met de telefoon. */
export const FIRST = ASSETS.indexOf('verhaal/item-telefoon') + 1

export interface Frame {
  u: number
  t: number
  /** Hoe ver het gebaar van het huidige keerpunt is (0–1), en welk keerpunt. */
  gp: number
  gate: GateId | null
  /** Wanneer elk keerpunt gelukt is (t in seconden). */
  done: Partial<Record<GateId, number>>
  reduce: boolean
  /** Een korte klap (0–1), loopt vanzelf af. */
  shake: number
}

type Ctx = CanvasRenderingContext2D
type Cam = { x: number; y: number; zoom: number }

/** Beeld vullend in het scherm, zoals background-size: cover. */
const coverRect = (img: HTMLImageElement | undefined, W: number, H: number, focusY = 0.5) => {
  if (!img?.naturalWidth) return { x: 0, y: 0, w: 0, h: 0 } // nog niet binnen: niets tekenen
  const k = Math.max(W / img.naturalWidth, H / img.naturalHeight)
  const w = img.naturalWidth * k
  const h = img.naturalHeight * k
  return { x: (W - w) / 2, y: (H - h) * focusY, w, h }
}

/** Een laag op diepte d: schuift tegen de camera in en zoomt mee rond (midden, 62%), net als LivingScene. */
const layer = (ctx: Ctx, W: number, H: number, cam: Cam, d: number, fn: () => void) => {
  ctx.save()
  ctx.translate(W / 2 - cam.x * d, H * 0.62 - cam.y * d)
  const z = 1 + (cam.zoom - 1) * (0.3 + d)
  ctx.scale(z, z)
  ctx.translate(-W / 2, -H * 0.62)
  fn()
  ctx.restore()
}

const darken = (ctx: Ctx, W: number, H: number, a: number) => {
  if (a <= 0) return
  ctx.fillStyle = `rgba(0,0,0,${clamp(a)})`
  ctx.fillRect(-W, -H, W * 3, H * 3)
}

const vignette = (ctx: Ctx, W: number, H: number, a = 0.85) => {
  const g = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.2, W / 2, H * 0.55, Math.max(W, H) * 0.75)
  g.addColorStop(0, 'rgba(0,0,0,0)')
  g.addColorStop(1, `rgba(0,0,0,${a})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

/** Een voorwerp of figuur met de voeten op (x, y) en hoogte h. */
const stand = (ctx: Ctx, img: HTMLImageElement | undefined, x: number, y: number, h: number, alpha = 1) => {
  if (!img?.naturalWidth) return
  const w = (img.naturalWidth / img.naturalHeight) * h
  ctx.globalAlpha = alpha
  ctx.drawImage(img, x - w / 2, y - h, w, h)
  ctx.globalAlpha = 1
}

/** Een figuur die ademt: de borst gaat op en neer (zachte schaal vanaf de voeten). */
const breathe = (ctx: Ctx, img: HTMLImageElement, x: number, y: number, h: number, t: number, rate = 5, alpha = 1) => {
  const s = 1 + 0.012 * Math.sin((Math.PI * 2 * t) / rate)
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(1 / Math.sqrt(s), s)
  stand(ctx, img, 0, 0, h, alpha)
  ctx.restore()
}

const screen = (ctx: Ctx, fn: () => void, alpha = 1) => {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = alpha
  fn()
  ctx.restore()
}

/** Regen in twee lagen, naadloos herhaald, schuin. */
const rain = (ctx: Ctx, W: number, H: number, t: number, img: HTMLImageElement, a: number) => {
  if (a <= 0) return
  screen(ctx, () => {
    for (const [size, speed, alpha] of [[260, 1.6, 0.35], [170, 2.4, 0.22]] as const) {
      ctx.save()
      ctx.globalAlpha = a * alpha
      ctx.translate(W / 2, H / 2)
      ctx.rotate(0.18)
      const off = (t * speed * size) % size
      for (let x = -W; x < W; x += size) for (let y = -H - size; y < H + size; y += size) ctx.drawImage(img, x, y + off, size, size)
      ctx.restore()
    }
  })
}

/** De draaikolk van het portaal: de windband rondgedraaid tot een spiraal. */
const vortex = (ctx: Ctx, W: number, H: number, t: number, imgs: Imgs, a: number, speed = 1) => {
  const band = imgs['art/effect-wervelwind']
  const R = Math.hypot(W, H) * 0.7
  screen(ctx, () => {
    ctx.translate(W / 2, H / 2)
    for (let i = 0; i < 10; i++) {
      ctx.save()
      const k = i / 10
      ctx.rotate(t * 0.6 * speed * (1 + k) + k * Math.PI * 2)
      const s = (0.25 + k * 0.9) * R
      ctx.globalAlpha = a * (0.55 - k * 0.35)
      ctx.drawImage(band, -s, -s * 0.12, s * 2, s * 0.4)
      ctx.restore()
    }
    const g = imgs['art/effect-gloed']
    const gs = Math.min(W, H) * (0.7 + 0.08 * Math.sin(t * 3))
    ctx.globalAlpha = a
    ctx.drawImage(g, -gs / 2, -gs / 2, gs, gs)
  })
}

/** Een post-it, getekend: papier, plakband, tekst in de titelletter. */
const postit = (ctx: Ctx, x: number, y: number, w: number, rot: number, lines: string[], a: number) => {
  if (a <= 0) return
  ctx.save()
  ctx.globalAlpha = a
  ctx.translate(x, y)
  ctx.rotate(rot)
  const h = w * 0.62
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = w * 0.08
  ctx.shadowOffsetY = w * 0.04
  ctx.fillStyle = '#ECEBE7'
  ctx.fillRect(-w / 2, -h / 2, w, h)
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = 'rgba(210,210,204,0.75)'
  ctx.fillRect(-w * 0.18, -h / 2 - w * 0.05, w * 0.36, w * 0.1)
  ctx.fillStyle = '#0B0B0B'
  ctx.font = `${Math.round(w * 0.095)}px Marcellus, Georgia, serif`
  ctx.textBaseline = 'top'
  lines.forEach((l, i) => ctx.fillText(l, -w / 2 + w * 0.08, -h / 2 + w * 0.12 + i * w * 0.13))
  ctx.restore()
}

/** Een medaillon: het tafereel in een cirkel, met een rand. flip 0→1 draait hem om van zonde naar deugd. */
const medal = (ctx: Ctx, x: number, y: number, r: number, from: HTMLImageElement, to: HTMLImageElement, flip: number, a: number) => {
  const sx = Math.cos(flip * Math.PI)
  const img = flip < 0.5 ? from : to
  ctx.save()
  ctx.globalAlpha = a
  ctx.translate(x, y)
  ctx.scale(Math.max(0.02, Math.abs(sx)), 1)
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fillStyle = '#0B0B0B'
  ctx.fill()
  ctx.save()
  ctx.clip()
  ctx.globalAlpha = a * (flip < 0.5 ? 0.6 : 1)
  ctx.drawImage(img, -r * 1.1, -r * 1.1, r * 2.2, r * 2.2)
  ctx.restore()
  ctx.strokeStyle = flip < 0.5 ? 'rgba(242,242,242,0.25)' : 'rgba(242,242,242,0.9)'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

/** Een stenen trede: bovenrand licht, voorkant donker met gravurelijnen. */
const step = (ctx: Ctx, x: number, y: number, w: number, h: number, lit: boolean) => {
  const g = ctx.createLinearGradient(0, y, 0, y + h)
  g.addColorStop(0, lit ? '#3a3a3a' : '#262626')
  g.addColorStop(0.08, '#1a1a1a')
  g.addColorStop(1, '#0a0a0a')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = lit ? 'rgba(242,242,242,0.75)' : 'rgba(242,242,242,0.3)'
  ctx.fillRect(x, y, w, 2)
  ctx.strokeStyle = 'rgba(242,242,242,0.05)'
  ctx.lineWidth = 1
  for (let i = 8; i < h; i += 6) { ctx.beginPath(); ctx.moveTo(x, y + i); ctx.lineTo(x + w, y + i + 3); ctx.stroke() }
}

const since = (f: Frame, id: GateId) => (f.done[id] != null ? f.t - f.done[id]! : -1)

// ── De bedrijven ──

/** I en II: de stad bij nacht, en de telefoon die in zijn hand oplicht. */
const city = (ctx: Ctx, W: number, H: number, f: Frame, im: Imgs, cam: Cam) => {
  const crane = easeOut(f.u / 5)
  const dolly = smooth(5, 7.2, f.u)
  // De kraan daalt: in het begin hangt de camera hoog, dus staat de wereld lager in beeld
  const drop = H * 0.16 * (1 - crane)
  // De dolly: inzoomen op de telefoon in zijn hand
  const phoneX = W * 0.535
  const phoneY = H * 0.74
  const zoom = 1 + 4.5 * dolly * dolly
  ctx.save()
  ctx.translate(phoneX, phoneY + drop)
  ctx.scale(zoom, zoom)
  ctx.translate(-phoneX, -phoneY)
  const bg = BG('woud')
  bg.slice(0, 3).forEach((k, i) => layer(ctx, W, H, cam, [0.12, 0.3, 0.55][i], () => {
    const r = coverRect(im[k], W, H, 0.75)
    ctx.drawImage(im[k], r.x, r.y, r.w, r.h)
    darken(ctx, W, H, [0.55, 0.45, 0.35][i])
  }))
  // Ogen in de steeg: lichten op, knipperen, doven (12 s)
  layer(ctx, W, H, cam, 0.3, () => {
    const c = (f.t % 12) / 12
    const on = c > 0.5 && c < 0.8 && !(c > 0.62 && c < 0.64)
    if (on) screen(ctx, () => ctx.drawImage(im['art/effect-ogen'], W * 0.18, H * 0.5, W * 0.09, W * 0.027), 0.8)
  })
  layer(ctx, W, H, cam, 0.55, () => {
    // De lantaarn, flakkerend, met een raaf erop
    const lx = W * 0.82
    const ly = H * 0.86
    stand(ctx, im['art/item-lantaarn'], lx, ly, H * 0.2)
    const fl = 0.5 + 0.2 * Math.sin(f.t * 9.3) * Math.sin(f.t * 2.1)
    screen(ctx, () => { const g = H * 0.5; ctx.drawImage(im['art/effect-gloed'], lx - g / 2, ly - H * 0.14 - g / 2, g, g) }, 0.35 * fl)
    stand(ctx, im['art/item-raaf-zittend'], lx + W * 0.01, ly - H * 0.19, H * 0.06)
    // Zijn verslavingen om hem heen op de natte grond
    const g = H * 0.93
    stand(ctx, im['art/item-fastfood'], W * 0.22, g + H * 0.01, H * 0.07)
    stand(ctx, im['art/item-drankfles'], W * 0.33, g - H * 0.005, H * 0.09)
    stand(ctx, im['art/item-asbak'], W * 0.42, g + H * 0.02, H * 0.035)
    stand(ctx, im['art/item-gebroken-glas'], W * 0.64, g + H * 0.02, H * 0.04)
    stand(ctx, im['art/item-vape'], W * 0.7, g, H * 0.06)
    stand(ctx, im['art/item-dobbelstenen'], W * 0.77, g + H * 0.02, H * 0.035)
    // Hij, in de portiek, onderuit
    breathe(ctx, im['art/karakter-schim'], W * 0.5, g, H * 0.42, f.t, 6)
    // Het scherm in zijn hand licht op, steeds sterker
    const glow = 0.15 + 0.25 * smooth(4.5, 6.5, f.u) + 0.5 * (f.gate === 'telefoon' ? f.gp : f.done.telefoon != null ? 1 : 0)
    screen(ctx, () => { const s = H * 0.35; ctx.drawImage(im['art/effect-gloed'], phoneX - s / 2, phoneY - s / 2, s, s) }, glow * (1 - dolly * 0.6))
  })
  ctx.restore()
  // De straat valt weg in het zwart; alleen het scherm blijft over
  darken(ctx, W, H, smooth(5.4, 6.9, f.u) * 0.97)
  rain(ctx, W, H, f.t, im['art/effect-regen'], 1 - smooth(6, 7.4, f.u))
  // Het scherm komt dichterbij tot het het beeld vult
  if (dolly > 0) phone(ctx, W, H, f, im, dolly)
  vignette(ctx, W, H, 0.8 + 0.15 * dolly)
}

/** De telefoon van dichtbij: de gebarsten ruit, het licht, en de melding "+1". */
const phone = (ctx: Ctx, W: number, H: number, f: Frame, im: Imgs, k: number) => {
  const img = im['verhaal/item-telefoon']
  const size = lerp(W * 0.1, Math.min(W * 0.95, H * 0.75), easeOut(k))
  const x = lerp(W * 0.535, W / 2, easeOut(k))
  const y = lerp(H * 0.74, H * 0.5, easeOut(k))
  const hold = f.gate === 'telefoon' ? f.gp : f.done.telefoon != null ? 1 : 0
  ctx.save()
  // Bij het vasthouden licht het scherm op en trilt het een beetje
  const jitter = f.gate === 'telefoon' && f.gp > 0 && !f.reduce ? (Math.random() - 0.5) * 2 * f.gp : 0
  ctx.translate(x + jitter, y)
  ctx.globalAlpha = clamp(k * 3)
  ctx.drawImage(img, -size / 2, -size / 2, size, size)
  screen(ctx, () => { const s = size * 1.4; ctx.drawImage(im['art/effect-gloed'], -s / 2, -s / 2, s, s) }, (0.25 + 0.6 * hold) * clamp(k * 2))
  // De melding
  const n = since(f, 'telefoon')
  if (n >= 0) {
    const a = easeOut(n / 0.5)
    const w = size * 0.42
    const h = w * 0.42
    ctx.globalAlpha = a
    ctx.translate(-size * 0.02, -size * 0.04 + (1 - a) * size * 0.05)
    ctx.rotate(-0.42)
    ctx.shadowColor = 'rgba(255,255,255,0.8)'
    ctx.shadowBlur = size * 0.08
    ctx.fillStyle = '#F2F2F2'
    ctx.beginPath()
    ctx.roundRect(-w / 2, -h / 2, w, h, h * 0.3)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#0B0B0B'
    ctx.font = `600 ${Math.round(h * 0.62)}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('+1', 0, h * 0.04)
  }
  ctx.restore()
}

/** III: het portaal. Eerst trek je de inkt zelf open; dan de val door de werelden. */
const portal = (ctx: Ctx, W: number, H: number, f: Frame, im: Imgs, cam: Cam) => {
  const opened = f.done.portaal != null
  if (!opened) {
    // Bij het keerpunt: de telefoon, en de inktvlek die eroverheen groeit als een gordijn
    city(ctx, W, H, { ...f, u: 9.4 }, im, cam)
    const p = f.gate === 'portaal' ? f.gp : 0
    const blot = im['verhaal/scherm-inktvlek']
    // Begint als een vlekje midden op het scherm, en groeit mee met hoe ver je trekt
    const s = Math.max(W, H) * (0.12 + 1.7 * p)
    ctx.save()
    ctx.translate(W / 2, H / 2 + p * H * 0.15)
    ctx.rotate(p * 0.3)
    ctx.drawImage(blot, -s / 2, -s / 2, s, s)
    ctx.restore()
    // Door het gat dat je trekt zie je de draaikolk al
    if (p > 0) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(W / 2, H / 2, Math.max(W, H) * 0.45 * p * p, 0, Math.PI * 2)
      ctx.clip()
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      vortex(ctx, W, H, f.t, im, 0.4 + 0.6 * p, 1 + p)
      ctx.restore()
    }
    return
  }
  // De val: werelden flitsen voorbij, elk net te kort om te lezen
  const fall = f.u - 9.6
  const worlds = ['art/achtergrond-inferno-1-ver', 'art/achtergrond-woud-1-ver', 'art/achtergrond-terrassen-1-ver']
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  if (fall < 3.9) {
    const seg = fall / 1.3
    const i = Math.min(worlds.length - 1, Math.floor(seg))
    const k = seg - Math.floor(seg)
    const img = im[worlds[i]]
    ctx.save()
    ctx.translate(W / 2, H / 2)
    ctx.scale(lerp(2.2, 1, easeOut(k)), lerp(2.2, 1, easeOut(k)))
    ctx.rotate((i % 2 ? 1 : -1) * 0.08 * (1 - k))
    const r = coverRect(img, W, H)
    ctx.globalAlpha = 0.85
    ctx.drawImage(img, r.x - W / 2, r.y - H / 2, r.w, r.h)
    ctx.restore()
    darken(ctx, W, H, 0.35)
    vortex(ctx, W, H, f.t, im, 0.7, 2.2)
    // Snelheidslijnen vanuit het midden
    ctx.save()
    ctx.translate(W / 2, H / 2)
    ctx.strokeStyle = 'rgba(242,242,242,0.25)'
    for (let n = 0; n < 36; n++) {
      const a = (n * 2.39996 + Math.floor(f.t * 20) * 0.7) % (Math.PI * 2)
      const r0 = Math.max(W, H) * (0.15 + ((n * 37) % 20) / 50)
      ctx.lineWidth = 1 + (n % 3)
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0)
      ctx.lineTo(Math.cos(a) * r0 * 1.6, Math.sin(a) * r0 * 1.6)
      ctx.stroke()
    }
    ctx.restore()
    // Hij valt, tollend, en komt dichterbij
    const fig = im['art/karakter-verdwaalde']
    ctx.save()
    ctx.translate(W / 2 + cam.x * 2, H * 0.5 + cam.y * 2)
    ctx.rotate(f.t * 1.4 + fall)
    const h = H * lerp(0.18, 0.42, k)
    stand(ctx, fig, 0, h / 2, h)
    ctx.restore()
    // Flits bij elke nieuwe wereld
    if (k < 0.1) { ctx.fillStyle = `rgba(242,242,242,${(1 - k / 0.1) * 0.7})`; ctx.fillRect(0, 0, W, H) }
  } else if (fall < 4.7) {
    // Volstrekte stilte: zwart, en heel ver weg een vallend figuurtje
    const k = (fall - 3.9) / 0.8
    stand(ctx, im['art/karakter-verdwaalde'], W / 2, H * lerp(0.3, 0.62, k), H * 0.05, 0.5)
  }
  vignette(ctx, W, H, 0.9)
}

/** IV: de klim. De spiegel, het kompas, en de treden. */
const climb = (ctx: Ctx, W: number, H: number, f: Frame, im: Imgs, cam: Cam) => {
  const bg = BG('kust')
  bg.slice(0, 3).forEach((k, i) => layer(ctx, W, H, cam, [0.12, 0.3, 0.55][i], () => {
    const r = coverRect(im[k], W, H, 0.7)
    ctx.drawImage(im[k], r.x, r.y, r.w, r.h)
  }))
  darken(ctx, W, H, 0.5)
  const u = f.u
  // KIJK: de spiegel met de post-its die er één voor één op komen
  const mirrorA = smooth(14.7, 15.2, u) * (1 - smooth(17.2, 17.7, u))
  if (mirrorA > 0) layer(ctx, W, H, cam, 0.6, () => {
    const m = im['verhaal/item-handspiegel']
    const s = Math.min(W * 1.15, H * 0.72)
    ctx.globalAlpha = mirrorA
    ctx.drawImage(m, W / 2 - s / 2, H * 0.58 - s / 2, s, s)
    ctx.globalAlpha = 1
    // Het glas zit linksboven in het beeld (midden op 50%, 35%): daar plakken de post-its
    const gx = W / 2
    const gy = H * 0.58 - s * 0.15
    const w = s * 0.3
    postit(ctx, gx - s * 0.07, gy - s * 0.11, w, -0.07, ['Je bent 12 kilo', 'te zwaar.'], mirrorA * easeOut((u - 15.3) / 0.4))
    postit(ctx, gx + s * 0.07, gy + s * 0.01, w, 0.05, ['De eerste kilo', 'binnen een week'], mirrorA * easeOut((u - 15.9) / 0.4))
    postit(ctx, gx - s * 0.04, gy + s * 0.13, w, -0.03, ['Elke ochtend', '6:30 trainen'], mirrorA * easeOut((u - 16.5) / 0.4))
  })
  // KIES: de zeven medaillons draaien om hem heen en keren van zonde naar deugd
  const compassA = smooth(17.4, 17.9, u) * (1 - smooth(20.2, 20.7, u))
  if (compassA > 0) layer(ctx, W, H, cam, 0.6, () => {
    const cx = W / 2
    const cy = H * 0.5
    breathe(ctx, im['art/karakter-balans'], cx, cy + H * 0.2, H * 0.36, f.t, 5, compassA)
    const R = Math.min(W, H) * 0.38
    const r = Math.min(W, H) * 0.075
    SINS.forEach((s, i) => {
      const a = -Math.PI / 2 + (i / 7) * Math.PI * 2 + u * 0.5
      const flip = smooth(17.9 + i * 0.3, 18.2 + i * 0.3, u)
      medal(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.9, r, im[`art/rig-${s}-basis`], im[`art/rig-${VIRTUES[i]}-basis`], flip, compassA)
    })
  })
  // KLIM: drie treden; je zet ze zelf, en bij elke trede wordt hij iemand anders
  const stepsA = smooth(20.5, 21, u)
  if (stepsA > 0) layer(ctx, W, H, cam, 0.6, () => {
    ctx.globalAlpha = stepsA
    const n = (['trede1', 'trede2', 'trede3'] as const).filter((g) => f.done[g] != null).length
    const sw = Math.min(W * 0.24, H * 0.16)
    const sh = H * 0.07
    const base = H * 0.86
    const x0 = W / 2 - (sw * 0.7 * 3 + sw) / 2
    for (let i = 0; i < 4; i++) step(ctx, x0 + i * sw * 0.7, base - i * sh, sw, H, i === n)
    const figs = ['art/karakter-verdwaalde', 'art/karakter-balans', 'art/karakter-klimmer', 'art/karakter-klimmer']
    const fx = x0 + n * sw * 0.7 + sw / 2
    const last = n ? since(f, (['trede1', 'trede2', 'trede3'] as const)[n - 1]) : 9
    const hop = last >= 0 && last < 0.5 ? Math.sin((last / 0.5) * Math.PI) * H * 0.04 : 0
    breathe(ctx, im[figs[n]], fx, base - n * sh - hop, H * (0.34 + n * 0.02), f.t, 5)
    // Het gebaar: de ring licht op onder zijn voeten terwijl je vasthoudt
    if (f.gate?.startsWith('trede')) screen(ctx, () => { const s = H * 0.3 * (0.5 + f.gp); ctx.drawImage(im['art/effect-gloed'], fx - s / 2, base - n * sh - s / 2, s, s) }, 0.3 + 0.5 * f.gp)
    ctx.globalAlpha = 1
  })
  vignette(ctx, W, H, 0.75)
}

/** V: Paradiso. Licht breekt door, hij staat als ridder, en de krans wordt het icoon. */
const paradise = (ctx: Ctx, W: number, H: number, f: Frame, im: Imgs, cam: Cam, icon: HTMLImageElement | undefined) => {
  const bg = BG('paradiso')
  bg.slice(0, 3).forEach((k, i) => layer(ctx, W, H, cam, [0.12, 0.3, 0.55][i], () => {
    const r = coverRect(im[k], W, H, 0.6)
    ctx.drawImage(im[k], r.x, r.y, r.w, r.h)
  }))
  darken(ctx, W, H, 0.2)
  screen(ctx, () => { const r = coverRect(im['art/effect-stralen'], W, H, 0); ctx.drawImage(im['art/effect-stralen'], r.x, r.y, r.w, r.h) }, 0.35 + 0.15 * Math.sin((f.t * Math.PI * 2) / 12))
  const iconT = since(f, 'krans')
  const knightA = iconT < 0 ? 1 : 1 - easeOut(iconT / 1.2)
  layer(ctx, W, H, cam, 0.6, () => {
    // Duiven die overvliegen (12 s per vlucht)
    const c = (f.t % 12) / 12
    const dove = im[Math.floor(f.t * 3) % 2 ? 'art/item-duif-omhoog' : 'art/item-duif-omlaag']
    stand(ctx, dove, lerp(-W * 0.1, W * 1.1, c), H * (0.25 - 0.05 * Math.sin(c * Math.PI)), H * 0.05, 0.8)
    breathe(ctx, im['art/karakter-ideaal'], W / 2, H * 0.94, H * 0.5, f.t, 6, knightA)
    // De krans zweeft boven hem; vasthouden laat hem zakken
    const p = f.gate === 'krans' ? f.gp : iconT >= 0 ? 1 : 0
    const wy = lerp(H * 0.31, H * 0.43, easeOut(p)) + Math.sin(f.t * 1.2) * H * 0.008
    const ws = Math.min(W * 0.5, H * 0.26)
    screen(ctx, () => { const s = ws * 2.2; ctx.drawImage(im['art/effect-gloed'], W / 2 - s / 2, wy - s / 2, s, s) }, 0.3 + 0.5 * p)
    ctx.globalAlpha = knightA
    ctx.drawImage(im['verhaal/item-lauwerkrans'], W / 2 - ws / 2, wy - ws * 0.36, ws, ws * 0.72)
    ctx.globalAlpha = 1
  })
  // De krans wordt het app-icoon
  if (iconT >= 0 && icon) {
    const k = easeOut(iconT / 1)
    const s = Math.min(W, H) * lerp(0.2, 0.34, k)
    ctx.save()
    ctx.globalAlpha = k
    ctx.translate(W / 2, H * 0.4)
    ctx.shadowColor = 'rgba(242,242,242,0.25)'
    ctx.shadowBlur = s * 0.3
    ctx.beginPath()
    ctx.roundRect(-s / 2, -s / 2, s, s, s * 0.225)
    ctx.clip()
    ctx.drawImage(icon, -s / 2, -s / 2, s, s)
    ctx.restore()
  }
  vignette(ctx, W, H, 0.7)
}

/** Eén frame van de film. Bedrijven lopen in elkaar over met de inktvlek of een flits. */
export const drawFrame = (ctx: Ctx, W: number, H: number, f: Frame, im: Imgs, icon?: HTMLImageElement) => {
  const cam = f.reduce ? { x: 0, y: 0, zoom: 1.02 } : cameraAt(f.t)
  ctx.save()
  if (f.shake > 0 && !f.reduce) ctx.translate((Math.random() - 0.5) * 14 * f.shake, (Math.random() - 0.5) * 10 * f.shake)
  ctx.fillStyle = '#000'
  ctx.fillRect(-20, -20, W + 40, H + 40)
  const u = f.u
  if (u < 9.6 || (u < 9.7 && f.done.portaal == null)) city(ctx, W, H, f, im, cam)
  if (u >= 9.55 && u < 14.6) portal(ctx, W, H, f, im, cam)
  if (u >= 14.3 && u < 24.6) {
    // De landing: witte flits die uitdooft
    ctx.save()
    ctx.globalAlpha = smooth(14.3, 14.6, u)
    climb(ctx, W, H, f, im, cam)
    ctx.restore()
    const land = 1 - smooth(14.3, 15.1, u)
    if (u > 14.3 && land > 0) { ctx.fillStyle = `rgba(242,242,242,${land * 0.8})`; ctx.fillRect(0, 0, W, H) }
  }
  if (u >= 24) {
    ctx.save()
    ctx.globalAlpha = smooth(24, 24.8, u)
    paradise(ctx, W, H, f, im, cam, icon)
    ctx.restore()
    const flash = smooth(24, 24.3, u) * (1 - smooth(24.3, 25, u))
    if (flash > 0) { ctx.fillStyle = `rgba(242,242,242,${flash})`; ctx.fillRect(0, 0, W, H) }
  }
  ctx.restore()
}
