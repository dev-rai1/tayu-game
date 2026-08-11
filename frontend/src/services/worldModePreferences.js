export const WORLD_MODES = Object.freeze({
  AUTO: 'auto',
  TWO_D: '2d',
  THREE_D: '3d',
})

const STORAGE_KEY = 'tayu-world-mode'
const CHANGE_EVENT = 'tayu-world-mode-changed'

function forceThreeDPreference() {
  try {
    if (localStorage.getItem(STORAGE_KEY) !== WORLD_MODES.THREE_D) {
      localStorage.setItem(STORAGE_KEY, WORLD_MODES.THREE_D)
    }
  } catch { /* storage is optional */ }
  return WORLD_MODES.THREE_D
}

// Gameplay is 3D-only. This also repairs browsers that were previously pushed
// into the temporary Accessible 2D fallback by older builds.
export function getWorldModePreference() {
  return forceThreeDPreference()
}

export function setWorldModePreference() {
  const next = forceThreeDPreference()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { value: next } }))
  }
  return next
}

export function subscribeWorldModePreference(listener) {
  if (typeof window === 'undefined') return () => {}
  // Immediately repair any stale 2D value on browsers that loaded an older build.
  forceThreeDPreference()
  const handler = () => listener(WORLD_MODES.THREE_D)
  window.addEventListener(CHANGE_EVENT, handler)
  return () => window.removeEventListener(CHANGE_EVENT, handler)
}
