import { useEffect, useRef, useState } from 'react'
import { playerPos, useGame } from './store.js'
import { usesTouchControls } from './controlMode.js'

const TUTORIAL_KEY = 'tayu-interactive-controls-v1'
const MOVEMENT_DISTANCE = 1.25
const EXPERIENCED_PLAYER_DELAY_MS = 8000

function completeTutorial(setStep) {
  localStorage.setItem(TUTORIAL_KEY, '1')
  setStep(-1)
}

export function FirstTimeMovementTutorial({ enabled = true }) {
  const near = useGame((state) => state.near)
  const blocking = useGame((state) => Boolean(
    state.helpOpen || state.dialog || state.cards?.length || state.lessons?.length ||
    state.panelJar || state.panelItem || state.btPanel || state.bkPanel || state.panelPortfolio
  ))
  const [step, setStep] = useState(() => {
    if (!enabled || typeof window === 'undefined') return -1
    return localStorage.getItem(TUTORIAL_KEY) ? -1 : 0
  })
  const [showExperiencedOption, setShowExperiencedOption] = useState(false)
  const start = useRef(null)

  useEffect(() => {
    if (!enabled || step < 0) return undefined
    setShowExperiencedOption(false)
    const timer = window.setTimeout(() => setShowExperiencedOption(true), EXPERIENCED_PLAYER_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [enabled, step])

  useEffect(() => {
    if (!enabled || step < 0) return undefined
    if (!start.current) start.current = { x: playerPos.x, z: playerPos.z }

    const movementTimer = window.setInterval(() => {
      if (step !== 0 || !start.current) return
      const moved = Math.hypot(playerPos.x - start.current.x, playerPos.z - start.current.z)
      if (moved >= MOVEMENT_DISTANCE) setStep(1)
    }, 120)

    const finishOnRealInteraction = () => {
      if (step === 1 && useGame.getState().near) completeTutorial(setStep)
    }
    const finishOnKeyboardInteraction = (event) => {
      if (event.code === 'KeyE') finishOnRealInteraction()
    }

    window.addEventListener('tayu-interact', finishOnRealInteraction)
    window.addEventListener('keydown', finishOnKeyboardInteraction)
    return () => {
      window.clearInterval(movementTimer)
      window.removeEventListener('tayu-interact', finishOnRealInteraction)
      window.removeEventListener('keydown', finishOnKeyboardInteraction)
    }
  }, [enabled, step])

  if (!enabled || step < 0 || blocking) return null
  const mobile = usesTouchControls
  if (step === 1 && !near) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[515] flex justify-center px-4" aria-live="polite">
      <section className="pointer-events-auto flex w-[min(90vw,27rem)] items-center gap-3 rounded-2xl border-2 border-teal bg-navy/95 px-3 py-2 text-white shadow-xl">
        <p className="min-w-0 flex-1 text-sm font-extrabold leading-snug">
          {step === 0
            ? mobile ? 'Use the MOVE pad to walk toward the glowing destination.' : 'Use WASD to walk toward the glowing destination.'
            : mobile ? 'You made it. Tap the blue action button.' : 'You made it. Press E or click the action button.'}
        </p>
        {showExperiencedOption && (
          <button type="button" onClick={() => completeTutorial(setStep)} aria-label="I already know how to use these controls" className="min-h-[42px] shrink-0 rounded-xl bg-white/10 px-3 text-xs font-extrabold active:scale-95">I know these controls</button>
        )}
      </section>
    </div>
  )
}
