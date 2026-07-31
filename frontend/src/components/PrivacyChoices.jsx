import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ANALYTICS_CHOICES,
  analyticsRoleAllowed,
  getAnalyticsChoice,
  setAnalyticsChoice,
} from '../services/privacyPreferences.js'

export function PrivacyChoices() {
  const { pathname } = useLocation()
  const [choice, setChoice] = useState(() => getAnalyticsChoice())
  const canAllowAnalytics = analyticsRoleAllowed()
  const effectiveChoice = canAllowAnalytics || choice === ANALYTICS_CHOICES.NECESSARY_ONLY ? choice : null

  useEffect(() => {
    const onChange = (event) => setChoice(event.detail || getAnalyticsChoice())
    window.addEventListener('tayu-analytics-choice-changed', onChange)
    return () => window.removeEventListener('tayu-analytics-choice-changed', onChange)
  }, [])

  if (effectiveChoice || pathname === '/privacy' || pathname === '/cookies') return null

  const choose = (next) => {
    setAnalyticsChoice(next)
    setChoice(next)
  }

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="privacy-choice-title"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-[950] mx-auto max-w-3xl rounded-3xl border-2 border-white/20 bg-navy p-4 text-white shadow-2xl sm:p-5"
    >
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <div id="privacy-choice-title" className="font-display text-lg font-extrabold">Privacy and browser storage</div>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-white/75">
            Necessary storage keeps accounts, settings, and game progress working. Optional analytics record page visits, device type, session time, and learning activity. Optional analytics stay off for student and guest accounts while the child-privacy workflow is under legal review.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-bold">
            <Link to="/privacy" className="text-teal underline underline-offset-4">Privacy notice</Link>
            <Link to="/cookies" className="text-teal underline underline-offset-4">Storage notice</Link>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
          <button type="button" onClick={() => choose(ANALYTICS_CHOICES.NECESSARY_ONLY)} className="min-h-[48px] rounded-xl border-2 border-white/25 px-4 text-sm font-extrabold">Use necessary storage</button>
          {canAllowAnalytics && (
            <button type="button" onClick={() => choose(ANALYTICS_CHOICES.ALLOW)} className="min-h-[48px] rounded-xl bg-teal px-4 text-sm font-extrabold text-navy">Allow optional analytics</button>
          )}
        </div>
      </div>
    </aside>
  )
}
