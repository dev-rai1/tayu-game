import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ANALYTICS_CHOICES,
  analyticsRoleAllowed,
  getAnalyticsChoice,
  setAnalyticsChoice,
} from '../services/privacyPreferences.js'

const IMMERSIVE_PATHS = ['/avatar', '/world', '/guru', '/path-complete']

export function PrivacyChoices() {
  const { pathname } = useLocation()
  const [choice, setChoice] = useState(() => getAnalyticsChoice())
  const canAllowAnalytics = analyticsRoleAllowed()
  const isImmersive = IMMERSIVE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  useEffect(() => {
    const onChange = (event) => setChoice(event.detail || getAnalyticsChoice())
    window.addEventListener('tayu-analytics-choice-changed', onChange)
    return () => window.removeEventListener('tayu-analytics-choice-changed', onChange)
  }, [])

  // Student, guest, and unverified accounts cannot enable optional analytics,
  // so do not interrupt them with a consent banner for necessary-only storage.
  // Authorized educator/admin accounts see this choice outside immersive gameplay.
  if (!canAllowAnalytics || choice || isImmersive || pathname === '/privacy' || pathname === '/cookies') return null

  const choose = (next) => {
    setAnalyticsChoice(next)
    setChoice(next)
  }

  return (
    <aside
      aria-label="Privacy choices"
      className="fixed inset-x-0 bottom-0 z-[450] border-t border-white/15 bg-navy/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-display text-base font-extrabold">Privacy choices</div>
          <p className="mt-0.5 text-sm font-semibold leading-relaxed text-white/75">
            TAYU uses necessary browser storage for sign-in, settings, and saved progress. Optional analytics are off unless you choose to allow them.
          </p>
          <div className="mt-1.5 flex gap-4 text-xs font-bold">
            <Link to="/privacy" className="text-teal underline underline-offset-4">Privacy</Link>
            <Link to="/cookies" className="text-teal underline underline-offset-4">Cookies & storage</Link>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose(ANALYTICS_CHOICES.NECESSARY_ONLY)}
            className="min-h-[44px] rounded-xl border border-white/30 px-4 text-sm font-extrabold"
          >
            Necessary only
          </button>
          {canAllowAnalytics && (
            <button
              type="button"
              onClick={() => choose(ANALYTICS_CHOICES.ALLOW)}
              className="min-h-[44px] rounded-xl bg-teal px-4 text-sm font-extrabold text-navy"
            >
              Allow optional analytics
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}