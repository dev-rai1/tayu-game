import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (path) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8')

const app = source('App.jsx')
const world = source('pages/World.jsx')
const avatar = source('pages/AvatarCreate.jsx')
const moduleSelect = source('pages/ModuleSelect.jsx')
const pathWatcher = source('components/PathCompletionWatcher.jsx')
const gardenGuide = source('world/MoneyGardenFlowGuide.jsx')
const coach = source('world/PersistentCoach.jsx')
const hud = source('world/Hud.jsx')

describe('multi-transcript follow-up regressions', () => {
  it('sizes the app, avatar creator, and world from Safari VisualViewport', () => {
    expect(app).toContain('installViewportSync')
    expect(app).toContain('./styles/viewport.css')
    expect(world).toContain('tayu-fixed-viewport')
    expect(avatar).toContain('tayu-page-viewport')
    expect(avatar).toContain('var(--tayu-viewport-height)')
  })

  it('keeps module completion inside gameplay instead of forcing quick-check screens', () => {
    expect(app).not.toContain("import('./pages/ModuleCheck.jsx')")
    expect(app).not.toContain('/module-check/:badge')
    expect(pathWatcher).not.toContain('navigate(`/module-check/')
    expect(moduleSelect).not.toContain('Practice and improve')
    expect(moduleSelect).not.toContain('Best quick check:')
    expect(moduleSelect).not.toContain('Retake a quick check')
  })

  it('keeps the two-part Money Garden flow while moving instructions into the shared coach', () => {
    expect(gardenGuide).toContain('Part 1 complete')
    expect(gardenGuide).toContain('Start Part 2')
    expect(gardenGuide).toContain('Save and exit')
    expect(gardenGuide).toContain('partTwoStarted: true')
    expect(coach).toContain('moneyGardenDecision')
    expect(coach).toContain("mg?.phase === 'adjust'")
  })

  it('keeps unmistakable Lemonade price controls', () => {
    expect(hud).toContain('MY PRICE PER CUP')
    expect(hud).toContain('>-25¢</button>')
    expect(hud).toContain('>+25¢</button>')
    expect(hud).toContain('How do I pick?')
  })
})
