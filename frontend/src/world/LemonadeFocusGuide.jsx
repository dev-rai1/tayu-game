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
  const lemFeatures = useGame((state) => state.lemFeatures)
  const helpOpen = useGame((state) => state.helpOpen)
  const dialog = useGame((state) => state.dialog)
  const cards = useGame((state) => state.cards)
  const lessons = useGame((state) => state.lessons)
  const actorCaption = useGame((state) => state.actorCaption)
  const guide = useGame((state) => state.guide)
  const [activePhase, setActivePhase] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)

  const readingBand = getReadingBand()
  const steps = useMemo(
    () => focusStepsFor(activePhase, readingBand, lemFeatures),
    [activePhase, readingBand, lemFeatures],
  )
  const stateSnapshot = { week, lemPhase, helpOpen, dialog, cards, lessons, actorCaption }
  const clearToShow = canShowFocusGuide(stateSnapshot)

  useEffect(() => {
    if (guide && shouldSuppressTransientGuide({ ...stateSnapshot, guide })) {
      // Lemonade already has a full decision surface or a focused animation.
      // Remove the short-lived coach bubble so the learner sees one message.
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
    <div className="pointer-events-auto absolute inset-0 z-[360] flex items-center justify-center bg-navy/65 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lemonade-focus-title"
        aria-describedby="lemonade-focus-copy"
        className="pop-in w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
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
          className="mt-4 min-h-[44px] rounded-xl bg-navy/10 px-4 text-sm font-extrabold text-navy transition active:scale-95"
        >
          Read aloud
        </button>
        <button
          type="button"
          onClick={advance}
          className="mt-4 min-h-[60px] w-full rounded-2xl bg-electric px-6 text-lg font-extrabold text-white transition hover:bg-teal hover:text-navy active:scale-95"
        >
          {last ? finishLabel : 'Next step'}
        </button>
      </div>
    </div>
  )
}
