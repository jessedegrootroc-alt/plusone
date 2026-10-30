// De achtergrondmuziek en geluiden van de animatic, live gemaakt met Web Audio (geen rechten nodig).
// Per scène een mix van lagen (regieboek §10), die zacht naar elkaar toe schuiven terwijl je scrolt.
// Tijdelijk: de echte film krijgt een gecomponeerde score in dezelfde lagen (stems).

/** Noors melodie (een slaapliedje op een speeldoos): komt het hele verhaal terug, de laatste noot pas bij haar deur */
const NOOR = [659.25, 783.99, 880, 783.99, 659.25, 587.33, 523.25]
export type MelodyMode = 'box' | 'vals' | 'piano' | 'hum'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }

type Mix = Partial<Record<'drone' | 'rain' | 'wind' | 'hum' | 'pad' | 'choir' | 'riser' | 'rumble' | 'bells' | 'glass', number>> & { heart?: number; major?: boolean }

/** Wat er per scène klinkt, als functie van de voortgang p (0–1) en de interactie v (0–1). */
// since: seconden sinds het kloppen op de deur (-1 als er nog niet geklopt is)
const MIX: Record<string, (p: number, v: number, since: number) => Mix> = {
  titel: () => ({ drone: 0.25, rain: 0.1, wind: 0.05 }),
  steeg: () => ({ drone: 0.5, rain: 0.26, wind: 0.08, hum: 0.04 }),
  gezicht: () => ({ drone: 0.35, rain: 0.14 }),
  // De drang: alles valt weg tot een hartslag die steeds sneller gaat
  drang: (p) => ({ drone: 0.12 * (1 - p), rain: 0.06, heart: 58 + p * 50 }),
  aansteker: (p) => ({ heart: 108 + p * 12, rain: 0.05, hum: p > 0.34 ? 0.25 : 0 }),
  vlam: (p, v) => ({ riser: 0.15 + p * 0.25 + v * 0.3, heart: 120, wind: 0.15 }),
  breken: (p) => (p < 0.64 ? { riser: 0.5, heart: 126, wind: 0.2 } : { rain: 0.04 }),
  // De val: de rook zuigt alles weg (riser), een sub drop, dan volledige stilte, dan het eerste licht
  val: (p) => (p < 0.7 ? { riser: 0.15 + p * 0.9, wind: 0.35 + p * 0.3 } : p < 0.86 ? {} : { pad: (p - 0.86) * 4, choir: (p - 0.86) * 2 }),
  ontwaken: (p) => ({ pad: smooth(0, 0.3, p) * 0.5, choir: 0.1 + p * 0.15, wind: 0.06 }),
  // De spiegel: de muziek trekt zich terug; alleen een lage toon en wind, zodat de waarheid hard aankomt
  spiegel: (p) => ({ drone: 0.25, pad: 0.3 * (1 - smooth(0.2, 0.5, p)), wind: 0.08 }),
  keuze: () => ({ drone: 0.2, choir: 0.18 }),
  // v is de spanning (vasthouden of doorscrollen); na het scheuren valt hij weg: een klap en stilte
  scheur: (_p, v) => ({ drone: 0.2, riser: v * 0.35, pad: v * 0.3 }),
  visie: (p, v) => { const k = Math.max(v, smooth(0.25, 0.8, p)); return { pad: 0.45 + k * 0.35, choir: 0.25 + k * 0.4, riser: k * 0.3, major: k > 0.97 } },
  muren: (p) => ({ drone: 0.35, rumble: smooth(0.1, 0.5, p) * 0.6 * (1 - smooth(0.85, 1, p)), pad: 0.35, major: true }),
  // Stilte: het doel van alles. Bijna niets: wind en één zacht aangehouden akkoord
  stilte: () => ({ wind: 0.05, pad: 0.16, major: true }),
  deur: () => ({ wind: 0.03, heart: 84 }),
  // Noor: stilte voor de deur (alleen zijn hart), na het kloppen het thema, zacht
  // Na het kloppen valt de muziek weg en gaat zijn hart sneller; als de deur opengaat: stilte, dan haar melodie
  noor: (p, _v, since) => {
    const open = Math.max(since >= 0 ? smooth(2.6, 3.4, since) : 0, smooth(0.54, 0.6, p))
    const waiting = since >= 0 && open < 1
    return { wind: waiting ? 0.015 : 0.04, heart: open < 1 ? (waiting ? 100 + since * 9 : 78 + p * 20) : undefined, pad: (waiting ? 0 : 0.06) + smooth(0.78, 0.9, p) * 0.45, choir: smooth(0.8, 0.95, p) * 0.3, bells: smooth(0.86, 1, p) * 0.2, major: true }
  },
  titeldrop: () => ({ pad: 0.65, choir: 0.45, bells: 0.3, drone: 0.18, major: true }),
  ritueel: () => ({ pad: 0.32, bells: 0.18, major: true }),
  jouwspiegel: () => ({ pad: 0.3, bells: 0.15, major: true }),
  app: () => ({ pad: 0.28, bells: 0.15, major: true }),
  installeer: () => ({ pad: 0.28, bells: 0.15, major: true }),
  footer: () => ({ pad: 0.22, major: true }),
}


type Bus = { gain: GainNode; set: (v: number, s?: number) => void }

export class Score {
  ctx: AudioContext
  private out: GainNode
  private music: GainNode
  private noise: AudioBuffer
  private bus: Record<string, Bus> = {}
  private hum!: OscillatorNode
  private riserF!: BiquadFilterNode
  private pad: OscillatorNode[] = []
  private choir: OscillatorNode[] = []
  private major = false
  private ducked: boolean | null = null
  private riserHz = 0
  private humHz = 0
  private nextBeat = 0
  private nextBell = 0
  private bellStep = 0
  private muted = false

  constructor() {
    this.ctx = new AudioContext()
    const comp = this.ctx.createDynamicsCompressor()
    comp.threshold.value = -16
    this.out = this.ctx.createGain()
    this.out.gain.value = 0
    this.out.connect(comp).connect(this.ctx.destination)
    this.music = this.ctx.createGain()
    this.music.connect(this.out)
    this.noise = this.makeNoise()
    this.build()
  }

  private makeNoise() {
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate)
    const d = b.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    return b
  }
  private src() { const s = this.ctx.createBufferSource(); s.buffer = this.noise; s.loop = true; return s }
  private mk(name: string): Bus {
    const gain = this.ctx.createGain()
    gain.gain.value = 0
    gain.connect(this.music)
    // Alleen een nieuwe glijder als het doel echt verandert: update() roept dit elk frame aan, en Safari ruimt oude
    // glijders niet op. Ze stapelden zich op (honderdduizenden na een paar minuten) tot een iPhone de pagina opgaf
    let last = -1
    const b = { gain, set: (v: number, s = 0.5) => { if (Math.abs(v - last) < 0.004) return; last = v; gain.gain.setTargetAtTime(v, this.ctx.currentTime, s) } }
    this.bus[name] = b
    return b
  }
  private osc(type: OscillatorType, f: number, to: AudioNode, g = 1) {
    const o = this.ctx.createOscillator()
    o.type = type
    o.frequency.value = f
    const gn = this.ctx.createGain()
    gn.gain.value = g
    o.connect(gn).connect(to)
    o.start()
    return o
  }
  private filter(type: BiquadFilterType, f: number, q = 1) {
    const b = this.ctx.createBiquadFilter()
    b.type = type
    b.frequency.value = f
    b.Q.value = q
    return b
  }

  private build() {
    const c = this.ctx
    // Drone: twee bijna gelijke lage tonen die tegen elkaar zweven
    const lp = this.filter('lowpass', 240)
    lp.connect(this.mk('drone').gain)
    for (const f of [55, 55.4, 82.4]) this.osc('sawtooth', f, lp, f > 80 ? 0.07 : 0.15)
    // Regen en wind: gefilterde ruis; de wind ademt met een trage LFO
    const rn = this.src()
    rn.connect(this.filter('highpass', 1100)).connect(this.filter('lowpass', 7500)).connect(this.mk('rain').gain)
    rn.start()
    const wn = this.src()
    const wf = this.filter('bandpass', 420, 0.8)
    const lfo = c.createOscillator()
    lfo.frequency.value = 0.13
    const lg = c.createGain()
    lg.gain.value = 260
    lfo.connect(lg).connect(wf.frequency)
    lfo.start()
    wn.connect(wf).connect(this.mk('wind').gain)
    wn.start()
    // Het zoemen van de telefoon: een lage, trillende toon
    const hf = this.filter('lowpass', 900)
    const trem = c.createGain()
    const tl = c.createOscillator()
    tl.frequency.value = 7
    const tg = c.createGain()
    tg.gain.value = 0.4
    tl.connect(tg).connect(trem.gain)
    tl.start()
    hf.connect(trem).connect(this.mk('hum').gain)
    this.hum = this.osc('square', 98, hf, 0.18)
    // Riser: ruis door een bandfilter dat omhoog schuift
    const rs = this.src()
    this.riserF = this.filter('bandpass', 300, 5)
    rs.connect(this.riserF).connect(this.mk('riser').gain)
    rs.start()
    // Gerommel van brekend steen
    const rb = this.src()
    rb.connect(this.filter('lowpass', 140)).connect(this.mk('rumble').gain)
    rb.start()
    // Strijkers: zachte driehoeksgolven met vibrato
    const pl = this.filter('lowpass', 1600)
    pl.connect(this.mk('pad').gain)
    const vib = c.createOscillator()
    vib.frequency.value = 4.6
    const vg = c.createGain()
    vg.gain.value = 3
    vib.connect(vg)
    vib.start()
    this.pad = [110, 164.8, 220, 261.6, 329.6].map((f) => { const o = this.osc('triangle', f, pl, 0.07); vg.connect(o.detune); return o })
    // Koor: zaagtanden door twee formanten ("aa")
    const choirIn = c.createGain()
    const f1 = this.filter('bandpass', 720, 6)
    const f2 = this.filter('bandpass', 1150, 7)
    const cb = this.mk('choir')
    choirIn.connect(f1).connect(cb.gain)
    choirIn.connect(f2).connect(cb.gain)
    this.choir = [220, 261.6, 329.6, 440].map((f, i) => { const o = this.osc('sawtooth', f, choirIn, 0.05); o.detune.value = (i - 1.5) * 6; return o })
    // Glas: een heldere toon met boventoon (de spiegel)
    const gb = this.mk('glass')
    this.osc('sine', 1318.5, gb.gain, 0.12)
    this.osc('sine', 1975.5, gb.gain, 0.05)
    this.mk('bells')
  }

  async start() {
    if (this.ctx.state !== 'running') await this.ctx.resume()
    this.out.gain.setTargetAtTime(0.85, this.ctx.currentTime, 1)
  }
  mute(m: boolean) { this.muted = m; this.out.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.3) }
  /** Even helemaal niets (het sterkste geluid): alles weg, daarna komt het terug. */
  hush(s: number) {
    if (this.muted) return
    const now = this.ctx.currentTime
    this.out.gain.cancelScheduledValues(now)
    this.out.gain.setTargetAtTime(0.0001, now, 0.02)
    this.out.gain.setTargetAtTime(0.85, now + s, 0.15)
    this.nextBeat = now + s + 0.05
  }
  /**
   * Noors melodie, de eerste n noten:
   * - box: een speeldoos, helder;
   * - vals: ontstemd en vertraagd, een speeldoos die afloopt (de drang);
   * - piano: een octaaf lager, langzaam (de stilte op de top);
   * - hum: zacht en zingend, alsof zij hem neuriet (bij haar deur).
   */
  melody(n = NOOR.length, mode: MelodyMode = 'box') {
    const step = { box: 0.42, vals: 0.6, piano: 0.8, hum: 0.55 }[mode]
    NOOR.slice(0, n).forEach((f, i) => {
      const at = this.ctx.currentTime + 0.05 + i * step * (mode === 'vals' ? 1 + i * 0.12 : 1)
      const cents = mode === 'vals' ? -i * 22 + (Math.random() - 0.5) * 50 : 0
      this.note(at, f * 2 ** (cents / 1200) * (mode === 'piano' ? 0.5 : 1), mode)
    })
  }
  private note(at: number, f: number, mode: MelodyMode) {
    const parts: [number, number][] = mode === 'hum' ? [[1, 1], [2, 0.12]] : mode === 'piano' ? [[1, 1], [2, 0.35], [3, 0.12]] : [[1, 1], [3.01, 0.25], [5.4, 0.08]]
    const dur = mode === 'hum' ? 0.62 : mode === 'piano' ? 2.4 : 1.4
    for (const [m, g] of parts) {
      const o = this.ctx.createOscillator()
      o.type = mode === 'hum' ? 'triangle' : 'sine'
      o.frequency.value = f * m
      const e = this.ctx.createGain()
      const peak = (mode === 'hum' ? 0.07 : mode === 'piano' ? 0.09 : 0.06) * g
      e.gain.setValueAtTime(0.0001, at)
      // Neuriën zwelt aan; speeldoos en piano worden aangeslagen
      e.gain.exponentialRampToValueAtTime(peak, at + (mode === 'hum' ? 0.12 : 0.008))
      e.gain.exponentialRampToValueAtTime(0.0001, at + dur)
      e.connect(this.music)
      o.connect(e)
      o.start(at)
      o.stop(at + dur + 0.05)
    }
  }
  /** De muziek zakt onder de vertelstem (ducking). */
  duck(on: boolean) {
    if (on === this.ducked) return // elk frame aangeroepen: alleen bij een wissel
    this.ducked = on
    this.music.gain.setTargetAtTime(on ? 0.45 : 1, this.ctx.currentTime, 0.25)
  }

  /** Elk frame: de mix volgt de scène waarin je bent. */
  update(scene: string, p: number, v: number, since = -1) {
    const now = this.ctx.currentTime
    const m = (MIX[scene] ?? (() => ({})))(clamp(p), v, since)
    for (const k of ['drone', 'rain', 'wind', 'hum', 'pad', 'choir', 'riser', 'rumble', 'bells', 'glass'] as const) this.bus[k].set(m[k] ?? 0, 0.6)
    const riserHz = 300 + (m.riser ?? 0) * 6000
    if (Math.abs(riserHz - this.riserHz) > 5) { this.riserHz = riserHz; this.riserF.frequency.setTargetAtTime(riserHz, now, 0.3) }
    const humHz = 98 + (m.hum ?? 0) * 60 + v * 80
    if (Math.abs(humHz - this.humHz) > 0.5) { this.humHz = humHz; this.hum.frequency.setTargetAtTime(humHz, now, 0.2) }
    const major = !!m.major
    if (major !== this.major) {
      this.major = major
      const chord = major ? [110, 164.8, 220, 277.2, 329.6] : [110, 164.8, 220, 261.6, 329.6]
      this.pad.forEach((o, i) => o.frequency.setTargetAtTime(chord[i], now, 0.9))
      const ch = major ? [220, 277.2, 329.6, 440] : [220, 261.6, 329.6, 440]
      this.choir.forEach((o, i) => o.frequency.setTargetAtTime(ch[i], now, 0.9))
    }
    if (m.heart && now >= this.nextBeat) { this.beat(now); this.nextBeat = now + 60 / m.heart }
    // Een klein motief van klokjes: het thema
    if ((m.bells ?? 0) > 0.05 && now >= this.nextBell) {
      const notes = [440, 554.4, 659.3, 554.4, 493.9, 554.4, 440, 329.6]
      this.bell(notes[this.bellStep++ % notes.length], (m.bells ?? 0) * 0.5)
      this.nextBell = now + 0.6
    }
  }

  private env(at: number, peak: number, dur: number) {
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(peak, at + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
    g.connect(this.out)
    return g
  }
  private beat(at: number) {
    for (const [d, v] of [[0, 0.7], [0.17, 0.45]] as const) {
      const o = this.ctx.createOscillator()
      o.frequency.setValueAtTime(70, at + d)
      o.frequency.exponentialRampToValueAtTime(38, at + d + 0.18)
      o.connect(this.env(at + d, v, 0.24))
      o.start(at + d)
      o.stop(at + d + 0.3)
    }
  }
  private bell(f: number, v: number) {
    const at = this.ctx.currentTime
    for (const [m, g] of [[1, 1], [2.76, 0.3]] as const) {
      const o = this.ctx.createOscillator()
      o.frequency.value = f * m
      const e = this.env(at, v * g * 0.25, 1.8)
      e.disconnect()
      e.connect(this.music)
      o.connect(e)
      o.start(at)
      o.stop(at + 1.9)
    }
  }
  private burst(type: BiquadFilterType, f: number, peak: number, dur: number) {
    const at = this.ctx.currentTime
    const n = this.src()
    n.connect(this.filter(type, f)).connect(this.env(at, peak, dur))
    n.start(at)
    n.stop(at + dur + 0.05)
  }

  /** De klap van Darkest Dungeon: een diepe trom plus een droge tik. */
  hit(deep = 1) {
    const at = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    o.frequency.setValueAtTime(120 * deep, at)
    o.frequency.exponentialRampToValueAtTime(32, at + 0.5)
    o.connect(this.env(at, 0.9, 0.9))
    o.start(at)
    o.stop(at + 1)
    this.burst('lowpass', 1600, 0.4, 0.22)
  }
  /** Het oordeel (moment van de waarheid): een grote trom met nagalm. */
  drum() { this.hit(0.6); setTimeout(() => this.hit(0.45), 180) }
  /** Papier dat scheurt (de post-it). */
  tear() { this.burst('highpass', 2500, 0.35, 0.35) }
  /** Een paneel schuift binnen: een zachte zwiep van papier. */
  swish() { this.burst('bandpass', 1800, 0.06, 0.22) }
  /** Een voetstap op steen. */
  step() { this.burst('lowpass', 500, 0.18, 0.09) }
  /** Het slot van een deur: een droge dubbele klik. */
  latch() { this.burst('highpass', 3000, 0.22, 0.03); setTimeout(() => this.burst('bandpass', 1400, 0.2, 0.05), 70) }
  /** Een deur die langzaam opengaat: een lage, lange zucht van hout en lucht. */
  creak() { this.burst('bandpass', 620, 0.07, 1.1) }
  /** Een zegel dat rinkelt. */
  ping() { this.bell(880, 0.9); this.bell(1318.5, 0.5) }
  /** Het wieltje van de aansteker: een droge klik en een sissende vonk. */
  spark() { this.burst('highpass', 4000, 0.3, 0.06); setTimeout(() => this.burst('bandpass', 6000, 0.12, 0.18), 30) }
  /** Een knokkel op een houten deur: een korte doffe bons. */
  knock() {
    const at = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    o.frequency.setValueAtTime(180, at)
    o.frequency.exponentialRampToValueAtTime(70, at + 0.12)
    o.connect(this.env(at, 0.55, 0.16))
    o.start(at)
    o.stop(at + 0.2)
    this.burst('lowpass', 900, 0.3, 0.05)
  }
  /** Een post-it die op het glas wordt geplakt: een droge tik van plakband. */
  tape() { this.burst('highpass', 2600, 0.14, 0.08) }
  /** Papier dat ritselt (een briefje kiezen). */
  rustle() { this.burst('bandpass', 3200, 0.18, 0.25) }
  /** De val: een diepe sub drop. */
  drop() {
    const at = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    o.frequency.setValueAtTime(90, at)
    o.frequency.exponentialRampToValueAtTime(24, at + 1.4)
    o.connect(this.env(at, 1, 1.6))
    o.start(at)
    o.stop(at + 1.7)
  }
}
