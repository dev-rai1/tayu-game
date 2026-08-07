import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const gameWorld = read('src/world/GameWorld.jsx')
const keyboard = read('src/world/useKeyboardControls.js')
const world = read('src/pages/World.jsx')
const moduleSelect = read('src/pages/ModuleSelect.jsx')
const tax = read('src/pages/TaxPaycheck.jsx')
const admin = read('src/components/AdminPanel.jsx')
const dashboard = read('src/pages/Dashboard.jsx')
const teacher = read('src/pages/TeacherDashboard.jsx')
const behavior = read('src/components/PlaytestBehaviorSummary.jsx')
const coach = read('src/world/PersistentCoach.jsx')

describe('Paycheck Planet full integration', () => {
  it('removes the This way edge pointer and accidental left/right arrow controls', () => {
    expect(gameWorld).not.toContain('ObjectiveEdgePointer')
    expect(keyboard).not.toContain("ArrowLeft:")
    expect(keyboard).not.toContain("ArrowRight:")
  })

  it('routes public Module 5 to Paycheck Planet and public Module 6 to Money Garden', () => {
    expect(world).toContain("jump === '5'")
    expect(world).toContain("navigate('/tax-paycheck'")
    expect(world).toContain("jump === '6' ? 5")
    expect(moduleSelect).toContain("String(target.n)")
  })

  it('puts Paycheck Planet between Bank and Money Garden in the story', () => {
    expect(world).toContain("badges.includes('bank') && !badges.includes('tax')")
    expect(world).toContain("/tax-paycheck?from=story")
    expect(world).toContain('To Paycheck Planet!')
    expect(tax).toContain('Continue to Module 6: Money Garden')
    expect(tax).toContain("localStorage.setItem('tayu-jump-module', '6')")
  })

  it('tracks tax as a real module in admin and teacher analytics', () => {
    for (const source of [dashboard, teacher, behavior]) {
      expect(source).toContain("'tax'")
      expect(source).toContain('Paycheck Planet')
      expect(source).toContain('Money Garden')
    }
    expect(tax).toContain("setUsageModule('tax')")
    expect(tax).toContain("type: 'module_complete'")
  })

  it('gives admin navigation seven public stops including Paycheck Planet', () => {
    expect(admin).toContain("5: 'Paycheck Planet'")
    expect(admin).toContain("6: 'Money Garden'")
    expect(admin).toContain("7: 'Finale Area'")
    expect(admin).toContain("/tax-paycheck?admin=1")
    expect(admin).toContain('MODULE {moduleStep} of 7')
  })

  it('lets non-button coach space pass clicks through to the game', () => {
    expect(coach).toContain('pointer-events-none fixed')
    expect(coach).toContain('pointer-events-auto')
  })
})
