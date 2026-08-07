import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const css = fs.readFileSync(path.resolve('src/world/worldDeclutter.css'), 'utf8')
const coach = fs.readFileSync(path.resolve('src/world/PersistentCoach.jsx'), 'utf8')

const BUDGET_PANEL = fs.readFileSync(path.resolve('src/world/BudgetPanels.jsx'), 'utf8')
const HUD = fs.readFileSync(path.resolve('src/world/Hud.jsx'), 'utf8')

describe('shared guidance rail layout', () => {
  it('marks the persistent coach as the one primary guidance lane', () => {
    expect(coach).toContain('data-guidance-lane="primary"')
    expect(coach).toContain("queue.length > 1 ? 'Next' : 'Got it'")
  })

  it('reserves a separate right-side region for guidance on desktop', () => {
    expect(css).toContain('--tayu-guidance-rail-width: clamp(20rem, 27vw, 27rem)')
    expect(css).toContain('[data-guidance-lane="primary"]')
    expect(css).toContain('right: max(1rem, env(safe-area-inset-right, 0px)) !important')
    expect(css).toContain('padding-right: calc(var(--tayu-guidance-rail-width)')
    expect(css).toContain('max-width: min(44rem, calc(100vw - var(--tayu-guidance-rail-width) - 3.5rem)) !important')
  })

  it('stacks guidance and module workspaces instead of overlapping on narrow screens', () => {
    expect(css).toContain('@media (max-width: 899px)')
    expect(css).toContain('padding-top: calc(16.75rem + env(safe-area-inset-top, 0px)) !important')
    expect(css).toContain('max-height: calc(100dvh - 18rem - env(safe-area-inset-bottom, 0px)) !important')
  })

  it('covers existing semantic module dialogs such as Budget Town and HUD panels', () => {
    expect(BUDGET_PANEL).toContain('role="dialog" aria-modal="true"')
    expect(HUD).toContain('aria-modal="true"')
    expect(css).toContain('div.pointer-events-auto.absolute.inset-0:has(> [role="dialog"][aria-modal="true"]')
  })
})
