import { useState } from 'react'
import { sendLoginLink, signOut, useSync } from '../lib/sync'
import { Icon } from './ui'

const time = (at?: number) => (at ? new Date(at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '')

/**
 * Je reis bewaren in de cloud. Inloggen gaat met een link in je mail, zonder wachtwoord.
 * Zonder Supabase-instellingen is deze kaart er niet: dan blijft alles op dit apparaat.
 */
export default function Account() {
  const sync = useSync()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (sync.state === 'uit') return null

  if (sync.state === 'uitgelogd') {
    const send = async () => {
      if (!email.includes('@')) return setError('Vul een geldig e-mailadres in.')
      setBusy(true)
      const err = await sendLoginLink(email.trim())
      setBusy(false)
      if (err) setError(err)
      else { setError(null); setSent(true) }
    }
    return (
      <section className="section">
      <div className="card stack gap-12">
        <div className="stack gap-4">
          <h3 className="h2">Bewaar je reis</h3>
          <p className="small" style={{ margin: 0 }}>Nu staat alles alleen op deze telefoon. Log in en je raakt niets kwijt, ook niet op een nieuwe telefoon.</p>
        </div>
        {sent ? (
          <p className="lead" style={{ color: 'var(--ink)', margin: 0 }}>Check je mail en tik op de link. Daarna is je reis bewaard.</p>
        ) : (
          <>
            <input className="input" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="je@email.nl" onKeyDown={(e) => e.key === 'Enter' && void send()} />
            {error && <p className="small" style={{ margin: 0, color: 'var(--ink)' }}>{error}</p>}
            <button className="btn sm" disabled={busy || !email.trim()} onClick={() => void send()}>{busy ? 'Even geduld…' : 'Stuur inloglink'}</button>
          </>
        )}
      </div>
      </section>
    )
  }

  const line = sync.state === 'bezig' ? 'Bezig met bewaren…' : sync.state === 'offline' ? 'Geen verbinding. Hij probeert het opnieuw zodra je online bent.' : `Bewaard om ${time(sync.at)}`
  return (
    <section className="section">
    <div className="section-head"><h2 className="h2">Account</h2></div>
    <div className="card hstack" style={{ gap: 12 }}>
      <span style={{ display: 'grid', color: sync.state === 'offline' ? 'var(--ink-3)' : 'var(--ink)' }}>{Icon.check()}</span>
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="name ellipsis">{sync.email}</div>
        <div className="small">{line}</div>
      </div>
      <button className="link" onClick={() => void signOut()}>Uitloggen</button>
    </div>
    </section>
  )
}
