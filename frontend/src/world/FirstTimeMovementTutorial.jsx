import { useEffect, useRef, useState } from 'react'
import { playerPos, useGame } from './store.js'
import { usesTouchControls } from './controlMode.js'

const TUTORIAL_KEY = 'tayu-interactive-controls-v1'
const MOVEMENT_DISTANCE = 1.25

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
  const start = useRef(null)

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
      <section className="w-[min(88vw,24rem)] rounded-2xl border-2 border-teal bg-navy/95 px-4 py-3 text-center text-white shadow-xl">
        {step === 0 ? (
          <p className="text-sm font-extrabold">
            {mobile ? 'Use the MOVE pad to walk toward the arrow.' : 'Use WASD to walk toward the arrow.'}
          </p>
        ) : (
          <p className="text-sm font-extrabold">
            You made it. {mobile ? 'Tap the blue action button.' : 'Press E or click the action button.'}
          </p>
        )}
      </section>
    </div>
  )
}
