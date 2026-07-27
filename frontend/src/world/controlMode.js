// Choose instructions and controls by the device's primary input, not merely
// whether the hardware has a touchscreen. Many Windows laptops report touch
// points while the player is actually using a keyboard and mouse.
export function shouldUseTouchControls({
  touchCapable = false,
  coarsePointer = false,
  hoverNone = false,
  mobileUserAgent = false,
  forceTouch = false,
} = {}) {
  if (forceTouch) return true
  if (!touchCapable) return false
  return (coarsePointer && hoverNone) || mobileUserAgent
}

export function detectTouchControls(win = globalThis.window, nav = globalThis.navigator) {
  if (!win || !nav) return false

  const mediaMatches = (query) => Boolean(win.matchMedia?.(query).matches)
  const params = new URLSearchParams(win.location?.search || '')
  const touchCapable = nav.maxTouchPoints > 0 || 'ontouchstart' in win
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent || '')

  return shouldUseTouchControls({
    touchCapable,
    coarsePointer: mediaMatches('(pointer: coarse)'),
    hoverNone: mediaMatches('(hover: none)'),
    mobileUserAgent,
    forceTouch: params.has('touch'),
  })
}

export const usesTouchControls = detectTouchControls()
