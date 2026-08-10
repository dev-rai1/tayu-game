import { useEffect } from 'react'

function isOverlayWrapper(node) {
  if (!(node instanceof HTMLElement)) return false
  const cls = typeof node.className === 'string' ? node.className : ''
  return cls.includes('pointer-events-auto') &&
    (cls.includes('absolute') || cls.includes('fixed')) &&
    cls.includes('z-[') && Boolean(node.querySelector('.pop-in'))
}

function sanitizeNestedQueueState() {
  document.querySelectorAll('[data-tayu-queued-hidden="true"]').forEach((node) => {
    if (!(node instanceof HTMLElement)) return
    let parent = node.parentElement
    while (parent && !isOverlayWrapper(parent)) parent = parent.parentElement
    if (!parent || parent.dataset.tayuQueuedHidden === 'true') return

    node.style.removeProperty('visibility')
    node.style.removeProperty('pointer-events')
    node.removeAttribute('aria-hidden')
    delete node.dataset.tayuQueuedHidden
  })
}

export function ModalQueueSanitizer() {
  useEffect(() => {
    const refresh = () => window.requestAnimationFrame(sanitizeNestedQueueState)
    refresh()
    const observer = new MutationObserver(refresh)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])
  return null
}
