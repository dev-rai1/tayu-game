import { useEffect, useRef } from 'react'

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

// Returns a stable ref whose .current holds the live pressed-direction booleans.
export function useKeyboardControls() {
  const keys = useRef({ forward: false, backward: false, left: false, right: false, lookLeft: false, lookRight: false })
  useEffect(() => {
    const onDown = (e) => {
      const k = KEYS[e.code]
      if (!k) return
      e.preventDefault()
      keys.current[k] = true
    }
    const onUp = (e) => {
      const k = KEYS[e.code]
      if (!k) return
      e.preventDefault()
      keys.current[k] = false
    }
    const onBlur = () => { keys.current = { forward: false, backward: false, left: false, right: false, lookLeft: false, lookRight: false } }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])
  return keys
}
