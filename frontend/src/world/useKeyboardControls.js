import { useEffect, useRef } from 'react'

// Movement is intentionally predictable: WASD walks, and only Up/Down mirror
// forward/back for accessibility. Left/Right arrows are NOT gameplay controls;
// earlier playtests showed they were easy to press accidentally and made the
// camera/player feel like it was moving on its own.
const KEYS = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left',
  KeyD: 'right',
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
