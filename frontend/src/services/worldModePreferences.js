export const WORLD_MODES = Object.freeze({
  AUTO: 'auto',
  TWO_D: '2d',
  THREE_D: '3d',
})

const STORAGE_KEY = 'tayu-world-mode'
const CHANGE_EVENT = 'tayu-world-mode-changed'
const VALID = new Set(Object.values(WORLD_MODES))

export function getWorldModePreference() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return VALID.has(value) ? value : WORLD_MODES.AUTO
  } catch {
    return WORLD_MODES.AUTO
  }
}

export function setWorldModePreference(value) {
  const next = VALID.has(value) ? value : WORLD_MODES.AUTO
  try { localStorage.setItem(STORAGE_KEY, next) } catch { /* storage is optional */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { value: next } }))
  return next
}

export function subscribeWorldModePreference(listener) {
  if (typeof window === 'undefined') return () => {}
  const handler = (event) => listener(event?.detail?.value || getWorldModePreference())
  window.addEventListener(CHANGE_EVENT, handler)
  return () => window.removeEventListener(CHANGE_EVENT, handler)
}
