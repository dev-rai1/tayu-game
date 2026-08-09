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
      const first = dialog.querySelector?.('[autofocus], ' + FOCUSABLE)
      window.requestAnimationFrame(() => {
        if (first && document.contains(first)) first.focus()
      })
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
      const dialog = activeDialog
      if (!dialog || !document.contains(dialog)) return
      if (event.key === 'Escape') {
        const close = dialog.querySelector?.('[data-dialog-close]')
        if (close) { event.preventDefault(); close.click() }
        return
      }
      if (event.key !== 'Tab') return
      const focusable = [...(dialog.querySelectorAll?.(FOCUSABLE) || [])].filter((node) => !node.hasAttribute('disabled'))
      if (!focusable.length) { event.preventDefault(); dialog.focus?.(); return }
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
      activeDialog = null
      previousFocus = null
      observer.disconnect()
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])
  return null
}
