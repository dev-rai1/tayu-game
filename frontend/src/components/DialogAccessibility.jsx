import { useEffect } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const MODULE_ENTRY_LABEL = 'module-entry-title'
const GRADE_LEGEND_ID = 'tayu-grade-band-legend'

function polishModuleMenu() {
  if (window.location.pathname !== '/modules') return

  const statusPills = [...document.querySelectorAll('span')]
  statusPills.forEach((pill) => {
    const text = pill.textContent?.trim()
    if (text === '★ Play next') {
      pill.textContent = '★ START HERE'
      pill.style.background = '#020617'
      pill.style.color = '#ffffff'
      pill.style.padding = '0.45rem 0.85rem'
      pill.style.letterSpacing = '0.08em'
      pill.style.boxShadow = '0 8px 20px rgba(2, 6, 23, 0.18)'
      const card = pill.closest('button, article')
      if (card) {
        card.style.borderWidth = '2px'
        card.style.borderColor = '#020617'
        card.style.boxShadow = '0 16px 34px rgba(2, 6, 23, 0.13)'
      }
    }
    if (text === '✓ Completed') {
      pill.textContent = '✓ COMPLETED'
      pill.style.background = '#dcfce7'
      pill.style.color = '#166534'
      pill.style.border = '1px solid #86efac'
      const card = pill.closest('button, article')
      if (card) {
        card.style.borderColor = '#86efac'
        card.style.background = 'rgba(255,255,255,0.97)'
      }
    }
  })

  if (document.getElementById(GRADE_LEGEND_ID)) return
  const menuLabel = [...document.querySelectorAll('div, p')].find((node) => node.textContent?.trim() === 'TAYU module menu')
  if (!menuLabel) return
  const surface = menuLabel.closest('header, section')
  if (!surface) return

  const legend = document.createElement('div')
  legend.id = GRADE_LEGEND_ID
  legend.setAttribute('aria-label', 'Grade level guide')
  legend.style.marginTop = '1rem'
  legend.style.display = 'grid'
  legend.style.gridTemplateColumns = 'repeat(auto-fit, minmax(135px, 1fr))'
  legend.style.gap = '0.55rem'
  legend.innerHTML = `
    <div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:14px;padding:10px 12px;color:#0f172a"><strong style="display:block;color:#1d4ed8">Elementary</strong><span style="font-size:12px;font-weight:700">Grades K–2</span></div>
    <div style="border:1px solid #bfdbfe;background:#f8fbff;border-radius:14px;padding:10px 12px;color:#0f172a"><strong style="display:block;color:#1d4ed8">Elementary</strong><span style="font-size:12px;font-weight:700">Grades 3–5</span></div>
    <div style="border:1px solid #ddd6fe;background:#f5f3ff;border-radius:14px;padding:10px 12px;color:#0f172a"><strong style="display:block;color:#6d28d9">Middle School</strong><span style="font-size:12px;font-weight:700">Grades 6–8</span></div>
    <div style="border:1px solid #a7f3d0;background:#ecfdf5;border-radius:14px;padding:10px 12px;color:#0f172a"><strong style="display:block;color:#047857">High School</strong><span style="font-size:12px;font-weight:700">Grades 9–12</span></div>
  `
  surface.appendChild(legend)
}

export default function DialogAccessibility() {
  useEffect(() => {
    let activeDialog = null
    let previousFocus = null

    const activate = (dialog) => {
      if (!dialog || dialog === activeDialog) return

      // Module selection should feel like entering the world, not opening a
      // confirmation modal. World.jsx still owns the launch logic; we simply
      // trigger its Start/Resume action immediately while CSS keeps that
      // transitional dialog invisible.
      if (dialog.getAttribute('aria-labelledby') === MODULE_ENTRY_LABEL) {
        const start = dialog.querySelector?.('button[autofocus]')
        if (start) window.requestAnimationFrame(() => start.click())
        return
      }

      previousFocus = document.activeElement
      activeDialog = dialog
      const first = dialog.querySelector?.('[autofocus], ' + FOCUSABLE)
      window.requestAnimationFrame(() => {
        if (first && document.contains(first)) first.focus()
      })
    }

    const scan = () => {
      polishModuleMenu()
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
