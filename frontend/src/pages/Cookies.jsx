import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ANALYTICS_CHOICES,
  getAnalyticsChoice,
  setAnalyticsChoice,
} from '../services/privacyPreferences.js'

const storageRows = [
  ['Account session', 'Session storage', 'Keeps a signed-in account active during the current browser session.'],
  ['Game progress and profile', 'Local storage and Firebase when available', 'Restores modules, badges, avatar, settings, and learning-path progress.'],
  ['Accessibility and reading preferences', 'Local storage', 'Remembers reading band, audio choices, tutorials, and interface settings.'],
  ['Optional site analytics', 'Local or session storage and Firebase', 'Creates visitor and session identifiers and records page, device, time, and learning activity only after optional analytics are allowed.'],
]

export default function Cookies() {
  const [choice, setChoice] = useState(() => getAnalyticsChoice())

  useEffect(() => {
    const onChange = (event) => setChoice(event.detail || getAnalyticsChoice())
    window.addEventListener('tayu-analytics-choice-changed', onChange)
    return () => window.removeEventListener('tayu-analytics-choice-changed', onChange)
  }, [])

  const choose = (next) => {
    setAnalyticsChoice(next)
    setChoice(next)
  }

  return (
    <main className="min-h-screen bg-[#eef8ff] px-5 py-10 text-navy sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-12 w-12 rounded-xl" />
            <span className="font-display text-2xl font-extrabold">TAYU</span>
          </Link>
          <Link to="/privacy" className="rounded-xl bg-navy px-4 py-2 text-sm font-extrabold text-white">Privacy notice</Link>
        </div>

        <section className="mt-8 rounded-3xl bg-white p-6 shadow-xl sm:p-8">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-electric">Browser storage notice</div>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Cookies and local storage</h1>
          <p className="mt-3 max-w-3xl font-semibold leading-relaxed text-navy/70">
            TAYU uses browser storage to keep the app working. The current code primarily uses local storage and session storage. Firebase services may also use technical browser storage needed for authentication and security.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-navy/10">
            <div className="hidden grid-cols-[1fr_0.8fr_1.5fr] gap-3 bg-navy px-4 py-3 text-sm font-extrabold text-white sm:grid">
              <div>Category</div><div>Where</div><div>Purpose</div>
            </div>
            {storageRows.map(([category, where, purpose]) => (
              <div key={category} className="grid gap-1 border-t border-navy/10 px-4 py-4 first:border-t-0 sm:grid-cols-[1fr_0.8fr_1.5fr] sm:gap-3">
                <div className="font-extrabold">{category}</div>
                <div className="text-sm font-bold text-navy/60">{where}</div>
                <div className="text-sm font-semibold leading-relaxed text-navy/70">{purpose}</div>
              </div>
            ))}
          </div>

          <section className="mt-6 rounded-2xl bg-navy p-5 text-white">
            <h2 className="font-display text-xl font-extrabold">Your optional analytics choice</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-white/75">
              Current choice: <span className="font-extrabold text-teal">{choice === ANALYTICS_CHOICES.ALLOW ? 'Optional analytics allowed' : choice === ANALYTICS_CHOICES.NECESSARY_ONLY ? 'Necessary storage only' : 'Not chosen yet'}</span>
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => choose(ANALYTICS_CHOICES.NECESSARY_ONLY)} className="min-h-[48px] rounded-xl border-2 border-white/25 px-4 font-extrabold">Use necessary storage only</button>
              <button type="button" onClick={() => choose(ANALYTICS_CHOICES.ALLOW)} className="min-h-[48px] rounded-xl bg-teal px-4 font-extrabold text-navy">Allow optional analytics</button>
            </div>
          </section>

          <p className="mt-6 text-sm font-semibold leading-relaxed text-navy/65">
            Blocking necessary browser storage may prevent login, saved progress, accessibility settings, and classroom features from working correctly. Last updated July 31, 2026.
          </p>
        </section>
      </div>
    </main>
  )
}
