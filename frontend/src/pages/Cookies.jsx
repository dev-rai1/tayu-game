import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ANALYTICS_CHOICES,
  analyticsRoleAllowed,
  getAnalyticsChoice,
  optionalAnalyticsAllowed,
  setAnalyticsChoice,
} from '../services/privacyPreferences.js'

const storageItems = [
  {
    title: 'Account session',
    where: 'Session storage',
    purpose: 'Keeps a signed-in account active during the current browser session.',
  },
  {
    title: 'Game progress and profile',
    where: 'Local storage and Firebase when available',
    purpose: 'Restores modules, badges, avatar, settings, and learning-path progress.',
  },
  {
    title: 'Reading and accessibility settings',
    where: 'Local storage',
    purpose: 'Remembers reading, audio, tutorial, and interface preferences.',
  },
  {
    title: 'Optional analytics',
    where: 'Browser storage and Firebase',
    purpose: 'Records page, device, session-time, and limited learning activity only when an authorized educator or administrator allows optional analytics.',
  },
]

export default function Cookies() {
  const [choice, setChoice] = useState(() => getAnalyticsChoice())
  const canAllowAnalytics = analyticsRoleAllowed()

  useEffect(() => {
    const onChange = (event) => setChoice(event.detail || getAnalyticsChoice())
    window.addEventListener('tayu-analytics-choice-changed', onChange)
    return () => window.removeEventListener('tayu-analytics-choice-changed', onChange)
  }, [])

  const choose = (next) => {
    setAnalyticsChoice(next)
    setChoice(next)
  }

  const status = optionalAnalyticsAllowed()
    ? 'Optional analytics allowed'
    : choice === ANALYTICS_CHOICES.NECESSARY_ONLY
      ? 'Necessary storage only'
      : canAllowAnalytics
        ? 'No analytics choice yet'
        : 'Optional analytics unavailable for this account'

  return (
    <main className="min-h-screen bg-[#eef8ff] px-5 py-8 text-navy sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/tayu-logo.webp" alt="TAYU" className="h-11 w-11 rounded-xl" />
            <span className="font-display text-2xl font-extrabold">TAYU</span>
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm font-extrabold">
            <Link to="/privacy" className="underline underline-offset-4">Privacy</Link>
            <Link to="/" className="underline underline-offset-4">Back home</Link>
          </nav>
        </header>

        <article className="mt-8 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-electric">Cookies & browser storage</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">How TAYU stores information</h1>
          <p className="mt-4 font-semibold leading-relaxed text-navy/75">
            TAYU mainly uses local storage and session storage so accounts, settings, and saved progress work correctly. Firebase may also use technical browser storage needed for authentication and security.
          </p>
          <p className="mt-3 text-sm font-bold text-navy/55">Last updated: September 24, 2026</p>

          <div className="mt-8 divide-y divide-navy/10 border-y border-navy/10">
            {storageItems.map((item) => (
              <section key={item.title} className="py-5">
                <div className="font-display text-lg font-extrabold">{item.title}</div>
                <div className="mt-1 text-sm font-bold text-navy/55">{item.where}</div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-navy/75">{item.purpose}</p>
              </section>
            ))}
          </div>

          <section className="mt-8 border-t border-navy/10 pt-6">
            <h2 className="font-display text-xl font-extrabold">Your analytics choice</h2>
            <p className="mt-2 text-sm font-semibold text-navy/70">
              Current status: <span className="font-extrabold text-navy">{status}</span>
            </p>
            {!canAllowAnalytics && (
              <p className="mt-2 text-sm font-semibold leading-relaxed text-navy/65">
                Student, guest, and unverified individual accounts use necessary storage only.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => choose(ANALYTICS_CHOICES.NECESSARY_ONLY)}
                className="min-h-[46px] rounded-xl border-2 border-navy/20 px-4 text-sm font-extrabold"
              >
                Use necessary storage only
              </button>
              {canAllowAnalytics && (
                <button
                  type="button"
                  onClick={() => choose(ANALYTICS_CHOICES.ALLOW)}
                  className="min-h-[46px] rounded-xl bg-navy px-4 text-sm font-extrabold text-white"
                >
                  Allow optional analytics
                </button>
              )}
            </div>
          </section>

          <p className="mt-7 text-sm font-semibold leading-relaxed text-navy/60">
            Blocking necessary browser storage may prevent sign-in, saved progress, reading or accessibility settings, and classroom features from working correctly.
          </p>
        </article>
      </div>
    </main>
  )
}