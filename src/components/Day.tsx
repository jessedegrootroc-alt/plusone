import { useState, type ReactNode } from 'react'
import { Icon } from './ui'

export type Part = 'ochtend' | 'overdag' | 'avond'
export const PARTS: Part[] = ['ochtend', 'overdag', 'avond']

/** Welk dagdeel het nu is. De avond begint om 18:00, de ochtend om 3:00. */
export const partNow = (now = new Date()): Part => {
  const h = now.getHours()
  return h >= 3 && h < 12 ? 'ochtend' : h >= 12 && h < 18 ? 'overdag' : 'avond'
}

/**
 * Eén dagdeel op de lijn van je dag. De lijn is de signatuur van Vandaag: wat voorbij is staat er dicht,
 * wat nog komt gestippeld, en waar je nu bent brandt een licht. Zo zie je in één blik waar je in je dag staat.
 */
export function Daypart({ part, label, range, when, meta, collapsible, children }: { part: Part; label: string; range: string; when: 'past' | 'now' | 'next'; meta?: string; collapsible?: boolean; children: ReactNode }) {
  // Wat voorbij is klapt in tot één regel (zoals Tiimo): je taken van nu komen hoger. Tik om hem open te klappen.
  const [open, setOpen] = useState(!collapsible)
  const shut = collapsible && !open
  const head = (
    <>
      <span className="dagdeel-dot" aria-hidden="true" />
      <h2 id={`dd-${part}`} className="dagdeel-label">{label}</h2>
      <span className="dagdeel-range">{range}</span>
      {when === 'now' ? <span className="dagdeel-nu">Nu</span> : meta ? <span className="dagdeel-meta">{meta}{collapsible && <span className={`dagdeel-chev ${open ? 'open' : ''}`} aria-hidden="true">{Icon.next()}</span>}</span> : null}
    </>
  )
  return (
    <section className={`dagdeel ${when} ${shut ? 'shut' : ''}`} aria-labelledby={`dd-${part}`}>
      {collapsible ? (
        <button className="dagdeel-head" aria-expanded={open} onClick={() => setOpen((x) => !x)}>{head}</button>
      ) : (
        <header className="dagdeel-head">{head}</header>
      )}
      {!shut && <div className="dagdeel-body">{children}</div>}
    </section>
  )
}

/**
 * Een moment op de lijn: een gravure, wat het is en hoe lang het duurt, en de vraag zelf.
 * Er is hooguit één kaart tegelijk "nu": die staat licht op donker, zodat je weet wat je dag op dit moment van je vraagt.
 */
export function Moment({ art, kind, title, sub, done, now, muted, onClick }: { art: string; kind: string; title: string; sub?: string; done?: boolean; now?: boolean; muted?: boolean; onClick?: () => void }) {
  const cls = `moment ${now ? 'now' : ''} ${done ? 'done' : ''} ${muted ? 'muted' : ''}`
  const inner = (
    <>
      <span className="moment-art" aria-hidden="true"><img src={`/art/${art}.webp`} alt="" /></span>
      <span className="moment-txt">
        <span className="moment-kind">{kind}</span>
        <span className="moment-title">{title}</span>
        {sub && <span className="moment-sub">{sub}</span>}
      </span>
      {onClick && <span className="moment-end" aria-hidden="true">{done ? Icon.check() : Icon.next()}</span>}
    </>
  )
  return onClick ? <button className={cls} onClick={onClick}>{inner}</button> : <div className={cls}>{inner}</div>
}
