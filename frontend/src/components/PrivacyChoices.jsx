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
  const [expanded, setExpanded] = useState(false)
  const canAllowAnalytics = analyticsRoleAllowed()
  const effectiveChoice = canAllowAnalytics || choice === ANALYTICS_CHOICES.NECESSARY_ONLY ? choice : null
  const isImmersive = IMMERSIVE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  useEffect(() => {
    const onChange = (event) => setChoice(event.detail || getAnalyticsChoice())
    window.addEventListener('tayu-analytics-choice-changed', onChange)
    return () => window.removeEventListener('tayu-analytics-choice-changed', onChange)
  }, [])

  // Never cover directions, controls, or the live avatar preview. Until a choice
  // is made, optional analytics remain off and the prompt returns on a non-game page.
  if (effectiveChoice || isImmersive || pathname === '/privacy' || pathname === '/cookies') return null

  const choose = (next) => {
    setAnalyticsChoice(next)
    setChoice(next)
  }

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="privacy-choice-title"
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-[950] mx-auto max-w-3xl rounded-2xl border-2 border-white/20 bg-navy p-3 text-white shadow-2xl sm:inset-x-auto sm:bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:right-[calc(1rem+env(safe-area-inset-right,0px))] sm:mx-0 sm:w-[min(28rem,calc(100vw-2rem))] sm:max-w-none sm:p-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div id="privacy-choice-title" className="font-display text-base font-extrabold sm:text-lg">Cookie consent</div>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-white/75">
            Necessary cookies and browser storage keep accounts, settings, and progress working. Optional analytics are off unless an authorized adult allows them.
          </p>
          {expanded && (
            <p className="mt-2 text-xs font-semibold leading-relaxed text-white/65">
              Optional analytics can record page visits, device type, session time, and learning activity. Student and guest accounts use necessary storage only while the child-privacy workflow is under legal review.
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold">
            <button type="button" onClick={() => setExpanded((value) => !value)} className="text-teal underline underline-offset-4">
              {expanded ? 'Show less' : 'Learn more'}
            </button>
            <Link to="/privacy" className="text-teal underline underline-offset-4">Privacy notice</Link>
            <Link to="/cookies" className="text-teal underline underline-offset-4">Cookie notice</Link>
          </div>
        </div>
        <div className="grid w-full gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => choose(ANALYTICS_CHOICES.NECESSARY_ONLY)} className="min-h-[48px] rounded-xl border-2 border-white/25 px-4 text-sm font-extrabold">Necessary only</button>
          {canAllowAnalytics && (
            <button type="button" onClick={() => choose(ANALYTICS_CHOICES.ALLOW)} className="min-h-[48px] rounded-xl bg-teal px-4 text-sm font-extrabold text-navy">Allow analytics</button>
          )}
        </div>
      </div>
    </aside>
  )
}
