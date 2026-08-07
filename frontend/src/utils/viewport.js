export function visibleViewport(windowLike = window) {
  const viewport = windowLike.visualViewport
  return {
    width: Math.max(1, Math.round(viewport?.width || windowLike.innerWidth || 1)),
    height: Math.max(1, Math.round(viewport?.height || windowLike.innerHeight || 1)),
    // Keep the app anchored to the layout viewport. Safari/Chrome can report
    // visualViewport offsets while toolbars, zoom, or touch scrolling settle;
    // applying those offsets to a fixed full-screen root makes the entire game
    // visibly slide or expose half of the page.
    left: 0,
    top: 0,
  }
}

export function syncViewportVariables(windowLike = window, documentLike = document) {
  const size = visibleViewport(windowLike)
  const style = documentLike.documentElement.style
  style.setProperty('--tayu-viewport-width', `${size.width}px`)
  style.setProperty('--tayu-viewport-height', `${size.height}px`)
  style.setProperty('--tayu-viewport-left', '0px')
  style.setProperty('--tayu-viewport-top', '0px')
  return size
}

export function installViewportSync(windowLike = window, documentLike = document) {
  let frame = null
  const update = () => {
    if (frame !== null && typeof windowLike.cancelAnimationFrame === 'function') windowLike.cancelAnimationFrame(frame)
    if (typeof windowLike.requestAnimationFrame === 'function') {
      frame = windowLike.requestAnimationFrame(() => {
        frame = null
        syncViewportVariables(windowLike, documentLike)
      })
    } else syncViewportVariables(windowLike, documentLike)
  }

  const viewport = windowLike.visualViewport
  syncViewportVariables(windowLike, documentLike)
  windowLike.addEventListener?.('resize', update)
  windowLike.addEventListener?.('orientationchange', update)
  windowLike.addEventListener?.('pageshow', update)
  viewport?.addEventListener?.('resize', update)

  return () => {
    if (frame !== null && typeof windowLike.cancelAnimationFrame === 'function') windowLike.cancelAnimationFrame(frame)
    windowLike.removeEventListener?.('resize', update)
    windowLike.removeEventListener?.('orientationchange', update)
    windowLike.removeEventListener?.('pageshow', update)
    viewport?.removeEventListener?.('resize', update)
  }
}
