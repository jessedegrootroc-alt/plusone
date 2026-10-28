// De muziek en geluiden, live gemaakt met Web Audio: geen bestaande nummers, dus geen rechten nodig.
// Vijf cues aan de scroll (BRIEF §8): drone en regen in de stad, een hartslag bij de telefoon,
// een riser met stilte in het portaal, strijkers en koor die groeien bij de klim, een opgelost akkoord in Paradiso.
import { clamp, smooth } from './story'

type Bus = { gain: GainNode; set: (v: number, s?: number) => void }

export class Score {
  ctx: AudioContext
  private master: GainNode
  private drone!: Bus
  private rain!: Bus
  private riser!: Bus & { filter: BiquadFilterNode }
  private pad!: Bus & { voices: OscillatorNode[] }
  private tone!: Bus & { osc: OscillatorNode }
  private heartRate = 0
  private nextBeat = 0
  private noise: AudioBuffer
  private major = false

  constructor() {
    this.ctx = new AudioContext()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    const comp = this.ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    this.master.connect(comp).connect(this.ctx.destination)
    this.noise = this.makeNoise()
    this.build()
  }

  private bus(): Bus {
    const gain = this.ctx.createGain()
    gain.gain.value = 0
    gain.connect(this.master)
    return { gain, set: (v, s = 0.6) => gain.gain.setTargetAtTime(v, this.ctx.currentTime, s) }
  }

  private makeNoise() {
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate)
    const d = b.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    return b
  }

  private noiseSource() {
    const s = this.ctx.createBufferSource()
    s.buffer = this.noise
    s.loop = true
    return s
  }

  private build() {
    const c = this.ctx
    // Drone: twee bijna gelijke tonen die tegen elkaar zweven, laag gefilterd
    this.drone = this.bus()
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 260
    lp.connect(this.drone.gain)
    for (const f of [55, 55.35, 82.4]) {
      const o = c.createOscillator()
      o.type = 'sawtooth'
      o.frequency.value = f
      const g = c.createGain()
      g.gain.value = f > 80 ? 0.08 : 0.16
      o.connect(g).connect(lp)
      o.start()
    }
    // Regen: ruis, hoog en laag afgesneden
    this.rain = this.bus()
    const rn = this.noiseSource()
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 900
    const rl = c.createBiquadFilter()
    rl.type = 'lowpass'
    rl.frequency.value = 7000
    rn.connect(hp).connect(rl).connect(this.rain.gain)
    rn.start()
    // Riser: ruis door een bandfilter dat omhoog schuift
    const rb = this.bus()
    const bf = c.createBiquadFilter()
    bf.type = 'bandpass'
    bf.Q.value = 6
    bf.frequency.value = 200
    const rs = this.noiseSource()
    rs.connect(bf).connect(rb.gain)
    rs.start()
    this.riser = { ...rb, filter: bf }
    // Strijkers en koor: een akkoord van zachte tonen met een trage vibrato
    const pb = this.bus()
    const pl = c.createBiquadFilter()
    pl.type = 'lowpass'
    pl.frequency.value = 1800
    pl.connect(pb.gain)
    const lfo = c.createOscillator()
    lfo.frequency.value = 4.8
    const lg = c.createGain()
    lg.gain.value = 2.2
    lfo.connect(lg)
    lfo.start()
    const voices = [110, 164.8, 220, 261.6, 329.6].map((f) => {
      const o = c.createOscillator()
      o.type = 'triangle'
      o.frequency.value = f
      lg.connect(o.detune)
      const g = c.createGain()
      g.gain.value = 0.07
      o.connect(g).connect(pl)
      o.start()
      return o
    })
    this.pad = { ...pb, voices }
    // De toon onder een gebaar: stijgt mee met hoe ver je bent
    const tb = this.bus()
    const to = c.createOscillator()
    to.type = 'sine'
    to.frequency.value = 220
    to.connect(tb.gain)
    to.start()
    this.tone = { ...tb, osc: to }
  }

  async start() {
    if (this.ctx.state !== 'running') await this.ctx.resume()
    this.master.gain.setTargetAtTime(0.9, this.ctx.currentTime, 1.2)
  }
  mute(m: boolean) { this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.3) }

  /** Elk frame: de mix volgt waar je in de film bent. */
  update(u: number, gesture: number) {
    const now = this.ctx.currentTime
    const stad = 1 - smooth(5.5, 7, u)
    const portal = smooth(9.6, 13.4, u) * (1 - smooth(13.5, 13.7, u))
    const silence = smooth(13.5, 13.7, u) * (1 - smooth(14.25, 14.4, u))
    const klim = smooth(14.6, 16, u)
    this.drone.set((0.55 * stad + 0.18 * (1 - stad) * (1 - klim)) * (1 - silence))
    this.rain.set(0.22 * stad * (1 - silence))
    this.riser.set(0.5 * portal)
    this.riser.filter.frequency.setTargetAtTime(200 + 4800 * portal, now, 0.2)
    const station = smooth(14.6, 16, u) * 0.5 + smooth(17.6, 18.6, u) * 0.25 + smooth(20.6, 21.6, u) * 0.25
    this.pad.set(clamp(station + smooth(24, 25, u) * 0.3) * 0.75 * (1 - silence))
    // Paradiso: het akkoord lost op naar majeur
    const wantMajor = u > 24.4
    if (wantMajor !== this.major) {
      this.major = wantMajor
      const chord = wantMajor ? [110, 164.8, 220, 277.2, 329.6] : [110, 164.8, 220, 261.6, 329.6]
      this.pad.voices.forEach((o, i) => o.frequency.setTargetAtTime(chord[i], now, 0.8))
    }
    // Hartslag in bedrijf II: sneller naarmate je de telefoon langer vasthoudt
    this.heartRate = u > 5.6 && u < 9.6 ? 62 + gesture * 70 : 0
    if (this.heartRate && now >= this.nextBeat) {
      this.beat(now)
      this.nextBeat = now + 60 / this.heartRate
    }
  }

  private beat(at: number) {
    for (const [d, v] of [[0, 1], [0.16, 0.6]] as const) {
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.frequency.setValueAtTime(70, at + d)
      o.frequency.exponentialRampToValueAtTime(38, at + d + 0.18)
      g.gain.setValueAtTime(0.0001, at + d)
      g.gain.exponentialRampToValueAtTime(0.6 * v, at + d + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, at + d + 0.22)
      o.connect(g).connect(this.master)
      o.start(at + d)
      o.stop(at + d + 0.3)
    }
  }

  /** Een heldere bel, bij de "+1". */
  ping() {
    const at = this.ctx.currentTime
    for (const [f, v] of [[1318.5, 0.25], [1975.5, 0.12], [2637, 0.06]] as const) {
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()
      o.type = 'sine'
      o.frequency.value = f
      g.gain.setValueAtTime(0.0001, at)
      g.gain.exponentialRampToValueAtTime(v, at + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, at + 1.6)
      o.connect(g).connect(this.master)
      o.start(at)
      o.stop(at + 1.7)
    }
  }

  /** De klap als een gebaar lukt: een diepe trom en een heldere klank. */
  hit(deep = 1) {
    const at = this.ctx.currentTime
    const o = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    o.frequency.setValueAtTime(110 * deep, at)
    o.frequency.exponentialRampToValueAtTime(34, at + 0.5)
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(0.9, at + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.9)
    o.connect(g).connect(this.master)
    o.start(at)
    o.stop(at + 1)
    const n = this.noiseSource()
    const nf = this.ctx.createBiquadFilter()
    nf.type = 'lowpass'
    nf.frequency.value = 1400
    const ng = this.ctx.createGain()
    ng.gain.setValueAtTime(0.35, at)
    ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.25)
    n.connect(nf).connect(ng).connect(this.master)
    n.start(at)
    n.stop(at + 0.3)
  }

  /** Te vroeg losgelaten: een zacht uitademen, geen straf. */
  sigh() {
    const at = this.ctx.currentTime
    const n = this.noiseSource()
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.setValueAtTime(1200, at)
    f.frequency.exponentialRampToValueAtTime(300, at + 0.5)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.exponentialRampToValueAtTime(0.18, at + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.55)
    n.connect(f).connect(g).connect(this.master)
    n.start(at)
    n.stop(at + 0.6)
  }

  /** De toon onder een gebaar: stijgt van 196 naar 392 Hz terwijl je vasthoudt of sleept. */
  gestureTone(p: number, on: boolean) {
    const now = this.ctx.currentTime
    this.tone.osc.frequency.setTargetAtTime(196 * Math.pow(2, clamp(p)), now, 0.05)
    this.tone.set(on ? 0.12 + 0.12 * p : 0, on ? 0.05 : 0.15)
  }

  /** Een zachte tik bij elke regel tekst die binnenkomt. */
  ink() {
    const at = this.ctx.currentTime
    const n = this.noiseSource()
    const f = this.ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 3000
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.08, at)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.12)
    n.connect(f).connect(g).connect(this.master)
    n.start(at)
    n.stop(at + 0.15)
  }
}
