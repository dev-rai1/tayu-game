import { useEffect, useRef } from 'react'
import { useGame } from './store.js'

// Movement stays predictable: WASD walks, Up/Down mirror forward/back, and
// Left/Right rotate the camera. Camera arrows only flip booleans here; the
// actual rotation happens once per animation frame in Player, so holding them
// stays smooth and does not create key-repeat lag.
const KEYS = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  ArrowLeft: 'lookLeft',
  ArrowRight: 'lookRight',
}

// Fallback for browsers/environments where KeyboardEvent.code is unavailable
// or altered. KeyboardEvent.key is layout-aware, so normalize it here.
const KEY_FALLBACK = {
  w: 'forward', W: 'forward',
  s: 'backward', S: 'backward',
  a: 'left', A: 'left',
  d: 'right', D: 'right',
  ArrowUp: 'forward', ArrowDown: 'backward',
  ArrowLeft: 'lookLeft', ArrowRight: 'lookRight',
}

const EMPTY_KEYS = () => ({
  forward: false,
  backward: false,
  left: false,
  right: false,
  lookLeft: false,
  lookRight: false,
})

const isTypingTarget = (target) => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'))
const movementFor = (event) => KEYS[event.code] || KEY_FALLBACK[event.key]

function releaseGuidanceForMovement() {
  const state = useGame.getState()
  const dialog = state.dialog
  if (!dialog) return

  // Check-in / guidance dialogs should never trap a player at a module spawn.
  // Treat the first movement input as "continue": close the guidance, run the
  // same completion callback the final click would have run, and restore normal
  // walking. True locked sequences still remain locked via scenarioLocked and
  // the decision-panel freeze rules in Player.
  useGame.setState({
    dialog: null,
    scenarioLocked: false,
    playerSpeedMult: 1,
    scenarioState: state.week === 1 && state.scenarioState === 'INTRO' ? 'ALLOCATING' : state.scenarioState,
  })
  try { dialog.onClose?.() } catch (error) { console.error(error) }
}

// Returns a stable ref whose .current holds the live pressed-direction booleans.
export function useKeyboardControls() {
  const keys = useRef(EMPTY_KEYS())
  useEffect(() => {
    const reset = () => { keys.current = EMPTY_KEYS() }
    const onDown = (e) => {
      if (isTypingTarget(e.target)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const k = movementFor(e)
      if (!k) return

      if (k === 'forward' || k === 'backward' || k === 'left' || k === 'right') {
        releaseGuidanceForMovement()
      }

      e.preventDefault()
      keys.current[k] = true
    }
    const onUp = (e) => {
      const k = movementFor(e)
      if (!k) return
      e.preventDefault()
      keys.current[k] = false
    }
    const onVisibility = () => { if (document.hidden) reset() }

    // Capture phase is intentional: in-game dialogs and accessibility overlays
    // may stop bubbling keyboard events. Movement should still receive WASD as
    // long as the player is not typing into a form field.
    window.addEventListener('keydown', onDown, true)
    window.addEventListener('keyup', onUp, true)
    window.addEventListener('blur', reset)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onDown, true)
      window.removeEventListener('keyup', onUp, true)
      window.removeEventListener('blur', reset)
      document.removeEventListener('visibilitychange', onVisibility)
      reset()
    }
  }, [])
  return keys
}
