import { useEffect } from 'react'

const ACTION_RULES = [
  { action: 'success', icon: '✓', pattern: /continue|start|play|resume|submit|finish|complete|confirm|save|deposit|cash out|buy|choose this/i },
  { action: 'help', icon: '?', pattern: /help|glossary|word|hint|learn|guide|explain/i },
  { action: 'settings', icon: '⚙', pattern: /setting|preference|change grade|customize|edit/i },
  { action: 'practice', icon: '↻', pattern: /practice|retake|try again|play again|restart|replay/i },
  { action: 'back', icon: '←', pattern: /back|cancel|close|choose another|not now|return/i },
  { action: 'reward', icon: '★', pattern: /certificate|reward|achievement|badge|score/i },
]

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

  const label = (button.getAttribute('aria-label') || button.textContent || '').trim()
  if (!label) return
  if (hideLegacyMoneyGardenCashOut(button, label)) return

  // Learning-resource links are a single browse list, not different action
  // types. Keep every resource visually consistent so words such as "save",
  // "credit", or "certificate" do not accidentally recolor individual rows.
  const isLearningResource = button.matches('a[href]') && button.closest('#help-panel-resources')
  const match = isLearningResource ? null : ACTION_RULES.find((rule) => rule.pattern.test(label))
  button.dataset.tayuEnhanced = 'true'
  button.dataset.tayuAction = match?.action || 'primary'
  button.style.setProperty('--tayu-action-icon', `"${match?.icon || '→'}"`)
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
