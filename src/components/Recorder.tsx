import { useEffect, useRef, useState } from 'react'
import { buzz } from '../lib/store'
import { getClip, saveClip } from '../lib/voice'
import { Icon } from './ui'

const MAX_S = 60

/**
 * Opnemen, zoals Goggins met zijn taperecorder: één grote knop in het midden. Tik om op te nemen, tik om te stoppen.
 * De opname blijft op je telefoon. Bij een tweede opname wordt de eerste vervangen.
 * `fresh`: begin leeg, ook als er al een opname is (opnieuw opnemen).
 */
export function Recorder({ clip, label, onSaved, fresh }: { clip: string; label: string; onSaved: () => void; fresh?: boolean }) {
  const [state, setState] = useState<'idle' | 'rec' | 'done' | 'denied'>('idle')
  const [secs, setSecs] = useState(0)
  const rec = useRef<MediaRecorder | null>(null)
  const timer = useRef(0)
  const stream = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!fresh) void getClip(clip).then((b) => { if (b) setState((s) => (s === 'idle' ? 'done' : s)) })
    return () => { clearInterval(timer.current); stream.current?.getTracks().forEach((t) => t.stop()) }
  }, [clip, fresh])

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.current = s
      const r = new MediaRecorder(s)
      const parts: Blob[] = []
      r.ondataavailable = (e) => { if (e.data.size) parts.push(e.data) }
      r.onstop = async () => {
        s.getTracks().forEach((t) => t.stop())
        clearInterval(timer.current)
        await saveClip(clip, new Blob(parts, { type: r.mimeType || 'audio/mp4' }))
        setState('done')
        onSaved()
      }
      rec.current = r
      r.start()
      buzz(12)
      setSecs(0)
      setState('rec')
      const t0 = Date.now()
      timer.current = window.setInterval(() => {
        const n = Math.floor((Date.now() - t0) / 1000)
        setSecs(n)
        if (n >= MAX_S) stop()
      }, 250)
    } catch {
      setState('denied')
    }
  }
  const stop = () => { buzz(8); if (rec.current?.state === 'recording') rec.current.stop() }

  return (
    <div className={`rec ${state}`}>
      <button className={`rec-btn ${state === 'rec' ? 'on' : ''} ${state === 'done' ? 'ok' : ''}`} onClick={state === 'rec' ? stop : start} aria-label={state === 'rec' ? 'Stop opname' : state === 'done' ? `${label}: opnieuw opnemen` : label}>
        {state === 'done' ? Icon.check('#0B0B0B') : <span className="rec-dot" aria-hidden="true" />}
      </button>
      <div className="rec-txt" aria-live="polite">
        {state === 'rec' ? (
          <><span className="rec-live">0:{String(secs).padStart(2, '0')}</span><span className="rec-hint">Tik als je klaar bent</span></>
        ) : state === 'done' ? (
          <><span className="rec-label">Opgenomen</span><span className="rec-hint">Tik om het opnieuw op te nemen</span></>
        ) : state === 'denied' ? (
          <><span className="rec-label">Geen microfoon</span><span className="rec-hint">Geef de app toegang, of typ het hieronder</span></>
        ) : (
          <><span className="rec-label">{label}</span><span className="rec-hint">Hooguit een minuut</span></>
        )}
      </div>
    </div>
  )
}

/** Een opname afspelen: één knop, met hoe ver hij is. */
export function Playback({ clip, label }: { clip: string; label: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [pct, setPct] = useState(0)
  const audio = useRef<HTMLAudioElement | null>(null)
  useEffect(() => {
    let u: string | null = null
    void getClip(clip).then((b) => { if (b) { u = URL.createObjectURL(b); setUrl(u) } })
    return () => { if (u) URL.revokeObjectURL(u) }
  }, [clip])
  if (!url) return null
  const toggle = () => {
    const a = audio.current
    if (!a) return
    if (a.paused) { void a.play(); setPlaying(true) } else { a.pause(); setPlaying(false) }
  }
  return (
    <button className={`play ${playing ? 'on' : ''}`} onClick={toggle} aria-label={playing ? 'Pauze' : label}>
      <span className="play-ico" aria-hidden="true">{playing ? '❚❚' : '▶'}</span>
      <span className="play-label">{label}</span>
      <span className="play-bar" aria-hidden="true"><i style={{ transform: `scaleX(${pct})` }} /></span>
      <audio ref={audio} src={url} preload="auto" onTimeUpdate={(e) => { const a = e.currentTarget; setPct(a.duration ? a.currentTime / a.duration : 0) }} onEnded={() => { setPlaying(false); setPct(0) }} />
    </button>
  )
}
