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
    state.helpOpen || state.dialog || state.cards?.length ||
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

  // Keep phone guidance deliberately short: one instruction and one action at a time.
  // PersistentCoach captures this message and owns the single guidance lane.
  useEffect(() => {
    if (!enabled || step < 0 || blocking) return
    if (step === 1 && !near) return
    const mobile = usesTouchControls
    useGame.setState({
      guide: {
        title: step === 0 ? (mobile ? 'Move to the glow' : 'Move around TAYU') : (mobile ? 'Tap DO' : 'Use the action control'),
        action: step === 0
          ? mobile ? 'Drag the MOVE pad.' : 'Use WASD to walk toward the glowing destination.'
          : mobile ? 'You made it — tap DO.' : 'You made it. Press E or click the action button.',
      },
    })
  }, [blocking, enabled, near, step])

  return null
}
