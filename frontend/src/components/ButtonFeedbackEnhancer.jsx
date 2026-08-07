import { useEffect } from 'react'

const ACTION_RULES = [
  { action: 'success', icon: '✓', pattern: /continue|start|play|resume|submit|finish|complete|confirm|save|deposit|cash out|buy|choose this/i },
  // Put close/hide actions before help so labels like "Hide this hint" do not
  // get mistaken for help buttons and rendered as a duplicate icon.
  { action: 'back', icon: '←', pattern: /back|cancel|close|hide|dismiss|choose another|not now|return/i },
  // Clues, hints, guides, and help controls keep their help styling but do not
  // receive a generated question mark. The clue copy itself should be the focus.
  { action: 'help', icon: null, pattern: /help|glossary|word|hint|clue|learn|guide|explain/i },
  { action: 'settings', icon: '⚙', pattern: /setting|preference|change grade|customize|edit/i },
  { action: 'practice', icon: '↻', pattern: /practice|retake|try again|play again|restart|replay/i },
  { action: 'reward', icon: '★', pattern: /certificate|reward|achievement|badge|score/i },
]

function hasOwnVisualIcon(button, visibleLabel) {
  // Do not layer a generated icon on controls that already render one. This
  // covers the TAYU logo, music button, and compact controls such as ? and ×.
  if (button.querySelector('svg, img')) return true
  return /^[?×✕✖←→↻✓★⚙…]+$/u.test(visibleLabel)
}

function hideLegacyMoneyGardenCashOut(button, label) {
  const normalized = label.replace(/\s+/g, ' ').trim().toLowerCase()
  if (normalized !== 'cash out all') return false

  // Money Garden now progresses by testing the player's current choice.
  // Keep the old portfolio-wide liquidation control out of the UI so players
  // are not encouraged to exit every investment between decisions.
  button.hidden = true
  button.setAttribute('aria-hidden', 'true')
  button.tabIndex = -1
  button.dataset.tayuEnhanced = 'true'
  button.dataset.tayuLegacyControl = 'hidden'
  return true
}

function classifyButton(button) {
  if (!(button instanceof HTMLElement) || button.dataset.tayuEnhanced === 'true') return
  if (button.getAttribute('role') === 'switch' || button.closest('[role="menu"]')) return

  const visibleLabel = (button.textContent || '').trim()
  const label = (button.getAttribute('aria-label') || visibleLabel).trim()
  if (!label) return
  if (hideLegacyMoneyGardenCashOut(button, label)) return

  // Learning-resource links are a single browse list, not different action
  // types. Keep every resource visually consistent so words such as "save",
  // "credit", or "certificate" do not accidentally recolor individual rows.
  const isLearningResource = button.matches('a[href]') && button.closest('#help-panel-resources')
  const match = isLearningResource ? null : ACTION_RULES.find((rule) => rule.pattern.test(label))
  button.dataset.tayuEnhanced = 'true'
  button.dataset.tayuAction = match?.action || 'primary'

  // Only add a semantic icon when a rule explicitly supplies one and the
  // control does not already have its own icon. Hint/clue/help rules purposely
  // have no icon, so they stay clean instead of getting a generated question mark.
  if (match?.icon && !hasOwnVisualIcon(button, visibleLabel)) {
    button.dataset.tayuActionIcon = 'true'
    button.style.setProperty('--tayu-action-icon', `"${match.icon}"`)
  } else {
    delete button.dataset.tayuActionIcon
    button.style.removeProperty('--tayu-action-icon')
  }
}

function enhanceButtons(root = document) {
  root.querySelectorAll('button, a[href]').forEach(classifyButton)
}

function createBurst(target, x, y) {
  if (!(target instanceof HTMLElement)) return
  const rect = target.getBoundingClientRect()
  const burst = document.createElement('span')
  burst.className = 'tayu-action-burst'
  burst.style.left = `${x - rect.left}px`
  burst.style.top = `${y - rect.top}px`
  burst.setAttribute('aria-hidden', 'true')
  target.appendChild(burst)
  window.setTimeout(() => burst.remove(), 620)
}

export function ButtonFeedbackEnhancer() {
  useEffect(() => {
    enhanceButtons()

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return
          classifyButton(node)
          enhanceButtons(node)
        })
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    const onPointerDown = (event) => {
      const target = event.target.closest('button, a[href]')
      if (!target || target.matches(':disabled,[aria-disabled="true"]')) return
      classifyButton(target)
      createBurst(target, event.clientX, event.clientY)
      target.classList.remove('tayu-action-confirm')
      requestAnimationFrame(() => target.classList.add('tayu-action-confirm'))
      window.setTimeout(() => target.classList.remove('tayu-action-confirm'), 500)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      observer.disconnect()
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  return null
}
