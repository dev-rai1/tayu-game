import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (path) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8')

const app = source('App.jsx')
const world = source('pages/World.jsx')
const avatar = source('pages/AvatarCreate.jsx')
const moduleCheck = source('pages/ModuleCheck.jsx')
const moduleSelect = source('pages/ModuleSelect.jsx')
const gardenGuide = source('world/MoneyGardenFlowGuide.jsx')
const hud = source('world/Hud.jsx')

describe('multi-transcript follow-up regressions', () => {
  it('sizes the app, avatar creator, and world from Safari VisualViewport', () => {
    expect(app).toContain('installViewportSync')
    expect(app).toContain('./styles/viewport.css')
    expect(world).toContain('tayu-fixed-viewport')
    expect(avatar).toContain('tayu-page-viewport')
    expect(avatar).toContain('var(--tayu-viewport-height)')
  })

  it('lets completed learners practice and measure improvement', () => {
    expect(moduleCheck).toContain('Personal best:')
    expect(moduleCheck).toContain('Practice this module again')
    expect(moduleCheck).toContain('Retake the quick check')
    expect(moduleSelect).toContain('Practice and improve')
    expect(moduleSelect).toContain('Best quick check:')
  })

  it('keeps the already-implemented two-part Money Garden flow', () => {
    expect(gardenGuide).toContain('Part 1 complete')
    expect(gardenGuide).toContain('Start Part 2')
    expect(gardenGuide).toContain('Save and exit')
    expect(gardenGuide).toContain('Decision {partWeek} of 5')
  })

  it('keeps unmistakable Lemonade price controls', () => {
    expect(hud).toContain('MY PRICE PER CUP')
    expect(hud).toContain('>-25¢</button>')
    expect(hud).toContain('>+25¢</button>')
    expect(hud).toContain('How do I pick?')
  })
})
