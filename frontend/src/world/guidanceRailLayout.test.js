import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const css = fs.readFileSync(path.resolve('src/world/worldDeclutter.css'), 'utf8')
const coach = fs.readFileSync(path.resolve('src/world/PersistentCoach.jsx'), 'utf8')

const BUDGET_PANEL = fs.readFileSync(path.resolve('src/world/BudgetPanels.jsx'), 'utf8')
const HUD = fs.readFileSync(path.resolve('src/world/Hud.jsx'), 'utf8')

describe('shared guidance layout', () => {
  it('separates important popups from ordinary side hints', () => {
    expect(coach).toContain("data-guidance-lane={important ? 'important-popup' : 'side-hint'}")
    expect(coach).toContain("['dialog', 'lesson', 'improvement'].includes(type)")
    expect(coach).toContain('data-important-message-scrim="true"')
    expect(coach).toContain("queue.length > 1 ? 'Next' : 'Got it'")
  })

  it('reserves a separate right-side region only for hints on desktop', () => {
    expect(css).toContain('--tayu-guidance-rail-width: clamp(20rem, 27vw, 27rem)')
    expect(css).toContain('[data-guidance-lane="side-hint"]')
    expect(css).not.toContain('[data-guidance-lane="primary"]')
    expect(css).toContain('right: max(1rem, env(safe-area-inset-right, 0px)) !important')
    expect(css).toContain('padding-right: calc(var(--tayu-guidance-rail-width)')
    expect(css).toContain('max-width: min(44rem, calc(100vw - var(--tayu-guidance-rail-width) - 3.5rem)) !important')
  })

  it('keeps side hints compact on narrow screens without moving important popups', () => {
    expect(css).toContain('@media (max-width: 899px)')
    expect(css).toContain('width: min(90vw, 22rem) !important')
    expect(css).toContain('padding-top: calc(15.75rem + env(safe-area-inset-top, 0px)) !important')
    expect(css).toContain('max-height: calc(100dvh - 17rem - env(safe-area-inset-bottom, 0px)) !important')
  })

  it('covers existing semantic module dialogs such as Budget Town and HUD panels', () => {
    expect(BUDGET_PANEL).toContain('role="dialog" aria-modal="true"')
    expect(HUD).toContain('aria-modal="true"')
    expect(css).toContain('div.pointer-events-auto.absolute.inset-0:has(> [role="dialog"][aria-modal="true"]')
  })
})
