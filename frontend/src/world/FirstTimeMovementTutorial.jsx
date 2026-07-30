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
      if (step !== 1) return
      const near = useGame.getState().near
      if (near) completeTutorial(setStep)
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

  if (!enabled || step < 0) return null

  const mobile = usesTouchControls
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[5.25rem] z-[515] flex justify-center px-4" aria-live="polite">
      <section className="w-[min(92vw,28rem)] rounded-3xl border-2 border-teal bg-navy/95 px-5 py-4 text-center text-white shadow-2xl">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-teal">
          Controls practice · {step + 1} of 2
        </div>
        {step === 0 ? (
          <>
            <div className="mt-2 text-3xl" aria-hidden>🕹️</div>
            <h2 className="mt-1 font-display text-xl font-extrabold">
              {mobile ? 'Hold and drag the MOVE pad.' : 'Use WASD to walk.'}
            </h2>
            <p className="mt-1 text-sm font-bold text-white/80">Move a few steps to finish this practice.</p>
          </>
        ) : (
          <>
            <div className="mt-2 text-3xl" aria-hidden>✨</div>
            <h2 className="mt-1 font-display text-xl font-extrabold">Great. Now use the action control.</h2>
            <p className="mt-1 text-sm font-bold text-white/80">
              Follow the arrow to a glowing person or place, then {mobile ? 'tap the blue DO button' : 'press E'}.
            </p>
          </>
        )}
      </section>
    </div>
  )
}
