import { useEffect, useMemo, useState } from 'react'
import { getReadingBand } from '../services/readingPreferences.js'
import { say } from '../services/speech.js'
import { useGame } from './store.js'
import {
  LEMONADE_FOCUS_KEYS,
  canShowFocusGuide,
  focusStepsFor,
  shouldSuppressTransientGuide,
} from './playtestFocus.js'

function wasSeen(key) {
  if (!key || typeof sessionStorage === 'undefined') return false
  try { return sessionStorage.getItem(key) === '1' } catch { return false }
}

function markSeen(key) {
  if (!key || typeof sessionStorage === 'undefined') return
  try { sessionStorage.setItem(key, '1') } catch { /* Browsers may block storage. */ }
}

export function LemonadeFocusGuide() {
  const week = useGame((state) => state.week)
  const lemPhase = useGame((state) => state.lemPhase)
  const helpOpen = useGame((state) => state.helpOpen)
  const dialog = useGame((state) => state.dialog)
  const cards = useGame((state) => state.cards)
  const lessons = useGame((state) => state.lessons)
  const actorCaption = useGame((state) => state.actorCaption)
  const guide = useGame((state) => state.guide)
  const [activePhase, setActivePhase] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)

  const readingBand = getReadingBand()
  const steps = useMemo(() => focusStepsFor(activePhase, readingBand), [activePhase, readingBand])
  const stateSnapshot = { week, lemPhase, helpOpen, dialog, cards, lessons, actorCaption }
  const clearToShow = canShowFocusGuide(stateSnapshot)

  useEffect(() => {
    if (guide && shouldSuppressTransientGuide({ ...stateSnapshot, guide })) {
      // The focus sequence owns the one shared guidance location for these
      // decisions, so the older transient bubble should not compete with it.
      useGame.setState({ guide: null })
    }
  }, [actorCaption, cards, dialog, guide, helpOpen, lemPhase, lessons, week])

  useEffect(() => {
    if (week !== 2 || !['supplies', 'template'].includes(lemPhase)) {
      setActivePhase(null)
      setStepIndex(0)
      return
    }

    const key = LEMONADE_FOCUS_KEYS[lemPhase]
    if (!wasSeen(key)) {
      setActivePhase(lemPhase)
      setStepIndex(0)
    }
  }, [lemPhase, week])

  if (!activePhase || !clearToShow || steps.length === 0) return null

  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const last = stepIndex >= steps.length - 1
  const finishLabel = activePhase === 'supplies' ? 'Choose my batch' : 'Build my plan'
  const advance = () => {
    if (!last) {
      setStepIndex((index) => index + 1)
      return
    }
    markSeen(LEMONADE_FOCUS_KEYS[activePhase])
    setActivePhase(null)
    setStepIndex(0)
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[510]">
      <div
        role="dialog"
        aria-labelledby="lemonade-focus-title"
        aria-describedby="lemonade-focus-copy"
        data-guidance-rail="true"
        className="pop-in pointer-events-auto absolute right-3 top-[5.5rem] w-[min(92vw,27rem)] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border-2 border-electric bg-white p-5 shadow-2xl sm:right-4 sm:w-[min(32vw,27rem)]"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-electric/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-electric">
            One step at a time
          </span>
          <span className="text-xs font-extrabold text-navy/50">{stepIndex + 1} of {steps.length}</span>
        </div>
        <h2 id="lemonade-focus-title" className="mt-4 font-display text-2xl font-extrabold text-navy">{step.title}</h2>
        <p id="lemonade-focus-copy" className="mt-3 text-lg font-semibold leading-relaxed text-navy/80">{step.text}</p>
        <button
          type="button"
          onClick={() => say(`${step.title}. ${step.text}`)}
          className="mt-4 min-h-[48px] w-full rounded-xl bg-navy/10 px-4 text-sm font-extrabold text-navy transition active:scale-95"
        >
          Read aloud
        </button>
        <button
          type="button"
          onClick={advance}
          className="mt-2 min-h-[56px] w-full rounded-2xl bg-electric px-6 text-lg font-extrabold text-white transition hover:bg-teal hover:text-navy active:scale-95"
        >
          {last ? finishLabel : 'Next step'}
        </button>
      </div>
    </div>
  )
}
