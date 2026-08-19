// Makes existing HTML5 `draggable` interactions work on touch/pen devices.
// React's drag/drop handlers still receive a dataTransfer-like object, so
// existing desktop behavior stays unchanged while iPhone/iPad can drag too.

const DRAG_SELECTOR = '[draggable="true"]'
const MOVE_THRESHOLD = 8

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
    getData(type) {
      return values.get(type) || ''
    },
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

function markTouchDraggables(root = document) {
  root.querySelectorAll?.(DRAG_SELECTOR).forEach((node) => {
    if (!(node instanceof HTMLElement)) return
    node.style.touchAction = 'none'
    node.style.webkitUserSelect = 'none'
    node.style.userSelect = 'none'
  })
}

export function installTouchDragBridge() {
  if (typeof window === 'undefined' || window.__tayuTouchDragInstalled) return
  window.__tayuTouchDragInstalled = true

  let drag = null

  markTouchDraggables()
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue
        if (node.matches?.(DRAG_SELECTOR)) markTouchDraggables(node.parentElement || document)
        else markTouchDraggables(node)
      }
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' || event.button !== 0) return
    const source = event.target?.closest?.(DRAG_SELECTOR)
    if (!source) return

    drag = {
      pointerId: event.pointerId,
      source,
      startX: event.clientX,
      startY: event.clientY,
      started: false,
      transfer: makeDataTransfer(),
      over: null,
    }
    try { source.setPointerCapture?.(event.pointerId) } catch { /* optional */ }
  }

  const onPointerMove = (event) => {
    if (!drag || drag.pointerId !== event.pointerId) return
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY)
    if (!drag.started && distance < MOVE_THRESHOLD) return

    event.preventDefault()
    if (!drag.started) {
      drag.started = true
      drag.source.classList.add('tayu-touch-dragging')
      dispatchDrag(drag.source, 'dragstart', drag.transfer, event)
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
      active.source.classList.remove('tayu-touch-dragging')
    }
    try { active.source.releasePointerCapture?.(event.pointerId) } catch { /* optional */ }
  }

  window.addEventListener('pointerdown', onPointerDown, { capture: true, passive: false })
  window.addEventListener('pointermove', onPointerMove, { capture: true, passive: false })
  window.addEventListener('pointerup', (event) => finish(event, false), { capture: true, passive: false })
  window.addEventListener('pointercancel', (event) => finish(event, true), { capture: true, passive: false })
}
