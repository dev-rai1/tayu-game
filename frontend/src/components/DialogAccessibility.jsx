import { useEffect } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function DialogAccessibility() {
  useEffect(() => {
    let activeDialog = null
    let previousFocus = null

    const activate = (dialog) => {
      if (!dialog || dialog === activeDialog) return
      previousFocus = document.activeElement
      activeDialog = dialog
      const first = dialog.querySelector('[autofocus], ' + FOCUSABLE)
      window.requestAnimationFrame(() => first?.focus())
    }

    const scan = () => {
      const dialogs = [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')]
      const next = dialogs.at(-1) || null
      if (next) activate(next)
      else if (activeDialog) {
        activeDialog = null
        previousFocus?.focus?.()
        previousFocus = null
      }
    }

    const onKeyDown = (event) => {
      if (!activeDialog || !document.contains(activeDialog)) return
      if (event.key === 'Escape') {
        const close = activeDialog.querySelector('[data-dialog-close]')
        if (close) { event.preventDefault(); close.click() }
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...activeDialog.querySelectorAll(FOCUSABLE)].filter((node) => !node.hasAttribute('disabled'))
      if (!focusable.length) { event.preventDefault(); activeDialog.focus?.(); return }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }

    const observer = new MutationObserver(scan)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('keydown', onKeyDown)
    scan()
    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])
  return null
}
