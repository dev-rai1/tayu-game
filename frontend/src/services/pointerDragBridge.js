// Reliable cross-device drag/drop for TAYU's existing `draggable` activities.
// We deliberately own the pointer gesture instead of relying on native HTML5
// drag/drop, which is inconsistent across Safari, touch devices and embedded
// browser contexts. Existing React onDragStart/onDragOver/onDrop handlers are
// preserved by dispatching compatible synthetic drag events.

const DRAG_SELECTOR = '[draggable="true"]'
const MOVE_THRESHOLD = 6

function makeDataTransfer() {
  const values = new Map()
  return {
    dropEffect: 'move',
    effectAllowed: 'all',
    files: [],
    items: [],
    types: [],
    setData(type, value) {
      values.set(type, String(value))
      this.types = [...values.keys()]
    },
    getData(type) { return values.get(type) || '' },
    clearData(type) {
      if (type) values.delete(type)
      else values.clear()
      this.types = [...values.keys()]
    },
    setDragImage() {},
  }
}

function dispatchDrag(target, type, transfer, point) {
  if (!target) return true
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    dataTransfer: { value: transfer },
    clientX: { value: point?.clientX || 0 },
    clientY: { value: point?.clientY || 0 },
  })
  return target.dispatchEvent(event)
}

function prepare(root = document) {
  const nodes = []
  if (root instanceof Element && root.matches?.(DRAG_SELECTOR)) nodes.push(root)
  root.querySelectorAll?.(DRAG_SELECTOR).forEach((node) => nodes.push(node))
  nodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return
    node.style.touchAction = 'none'
    node.style.userSelect = 'none'
    node.style.webkitUserSelect = 'none'
  })
}

function createGhost(source, x, y) {
  const rect = source.getBoundingClientRect()
  const ghost = source.cloneNode(true)
  ghost.removeAttribute('draggable')
  Object.assign(ghost.style, {
    position: 'fixed',
    left: '0px',
    top: '0px',
    width: `${rect.width}px`,
    minHeight: `${rect.height}px`,
    margin: '0',
    pointerEvents: 'none',
    zIndex: '99999',
    opacity: '0.92',
    transform: `translate(${x - rect.width / 2}px, ${y - rect.height / 2}px) rotate(1deg) scale(1.03)`,
    boxShadow: '0 20px 45px rgba(0,0,0,.22)',
  })
  document.body.appendChild(ghost)
  return { ghost, width: rect.width, height: rect.height }
}

export function installPointerDragBridge() {
  if (typeof window === 'undefined' || window.__tayuPointerDragInstalled) return
  window.__tayuPointerDragInstalled = true

  let drag = null
  prepare()
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) prepare(node)
    }))
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })

  const start = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    const source = event.target?.closest?.(DRAG_SELECTOR)
    if (!source) return
    drag = {
      source,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      started: false,
      transfer: makeDataTransfer(),
      over: null,
      ghostInfo: null,
      originalDraggable: source.getAttribute('draggable'),
    }
    // Stop the browser's native drag machinery. The bridge below replaces it.
    source.setAttribute('draggable', 'false')
    try { source.setPointerCapture?.(event.pointerId) } catch { /* optional */ }
  }

  const move = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
    if (!drag.started && distance < MOVE_THRESHOLD) return
    event.preventDefault()

    if (!drag.started) {
      drag.started = true
      drag.source.classList.add('tayu-pointer-dragging')
      // React's existing onDragStart fills our dataTransfer payload here.
      dispatchDrag(drag.source, 'dragstart', drag.transfer, event)
      drag.ghostInfo = createGhost(drag.source, event.clientX, event.clientY)
    }

    if (drag.ghostInfo?.ghost) {
      const { ghost, width, height } = drag.ghostInfo
      ghost.style.transform = `translate(${event.clientX - width / 2}px, ${event.clientY - height / 2}px) rotate(1deg) scale(1.03)`
    }

    const over = document.elementFromPoint(event.clientX, event.clientY)
    if (over !== drag.over) {
      if (drag.over) dispatchDrag(drag.over, 'dragleave', drag.transfer, event)
      if (over) dispatchDrag(over, 'dragenter', drag.transfer, event)
      drag.over = over
    }
    if (over) dispatchDrag(over, 'dragover', drag.transfer, event)
  }

  const finish = (event, cancelled = false) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    const active = drag
    drag = null

    if (active.started) {
      event.preventDefault()
      const target = document.elementFromPoint(event.clientX, event.clientY)
      if (!cancelled && target) dispatchDrag(target, 'drop', active.transfer, event)
      dispatchDrag(active.source, 'dragend', active.transfer, event)
    }

    active.ghostInfo?.ghost?.remove()
    active.source.classList.remove('tayu-pointer-dragging')
    active.source.setAttribute('draggable', active.originalDraggable || 'true')
    try { active.source.releasePointerCapture?.(event.pointerId) } catch { /* optional */ }
  }

  window.addEventListener('pointerdown', start, { capture: true, passive: false })
  window.addEventListener('pointermove', move, { capture: true, passive: false })
  window.addEventListener('pointerup', (event) => finish(event, false), { capture: true, passive: false })
  window.addEventListener('pointercancel', (event) => finish(event, true), { capture: true, passive: false })
  window.addEventListener('dragstart', (event) => {
    if (drag) event.preventDefault()
  }, true)
}
