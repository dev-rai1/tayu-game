import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const gameWorld = read('src/world/GameWorld.jsx')
const keyboard = read('src/world/useKeyboardControls.js')
const world = read('src/pages/World.jsx')
const moduleSelect = read('src/pages/ModuleSelect.jsx')
const paycheckWorld = read('src/world/PaycheckPlanetWorld.jsx')
const paycheckMode = read('src/world/paycheckMode.js')
const app = read('src/App.jsx')
const watcher = read('src/components/PathCompletionWatcher.jsx')
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

  it('launches public Module 5 inside the same world and keeps public Module 6 mapped to Money Garden', () => {
    expect(world).toContain("jump === '5'")
    expect(world).toContain('activatePaycheckWorld()')
    expect(world).toContain('adminTeleport(TAX_ENTRY)')
    expect(world).not.toContain("navigate('/tax-paycheck'")
    expect(world).toContain("jump === '6' ? 5")
    expect(moduleSelect).toContain("String(target.n)")
    expect(moduleSelect).not.toContain('target.route')
    expect(paycheckMode).toContain('tayu-paycheck-world-mode')
  })

  it('puts an animated physical Paycheck Planet between Bank and Money Garden', () => {
    expect(world).toContain("badges.includes('bank') && !badges.includes('tax')")
    expect(world).toContain('To Paycheck Planet!')
    expect(paycheckWorld).toContain("labelTexture('PAYCHECK PLANET'")
    expect(paycheckWorld).toContain('InteractiveStation')
    expect(paycheckWorld).toContain('pushCoins(')
    expect(paycheckWorld).toContain('CelebrationBurst')
    expect(paycheckWorld).toContain('CONTINUE TO MONEY GARDEN')
    expect(paycheckWorld).toContain('adminJumpModule(5)')
  })

  it('removes the standalone tax and per-module quiz detours', () => {
    expect(app).not.toContain("lazy(() => import('./pages/TaxPaycheck.jsx'))")
    expect(app).not.toContain("lazy(() => import('./pages/ModuleCheck.jsx'))")
    expect(app).toContain('LegacyPaycheckRedirect')
    expect(moduleSelect).not.toContain('Retake a quick check')
    expect(moduleSelect).not.toContain('Best quick check')
    expect(watcher).not.toContain('navigate(`/module-check/')
  })

  it('tracks tax as a real module in admin and teacher analytics', () => {
    for (const source of [dashboard, teacher, behavior]) {
      expect(source).toContain("'tax'")
      expect(source).toContain('Paycheck Planet')
      expect(source).toContain('Money Garden')
    }
    expect(world).toContain("paycheckMode ? 'tax'")
    expect(paycheckWorld).toContain("type: 'module_complete'")
  })

  it('gives admin navigation seven public stops including in-world Paycheck Planet', () => {
    expect(admin).toContain("5: 'Paycheck Planet'")
    expect(admin).toContain("6: 'Money Garden'")
    expect(admin).toContain("7: 'Finale Area'")
    expect(admin).not.toContain('/tax-paycheck?admin=1')
    expect(admin).toContain("localStorage.setItem('tayu-jump-module', String(step))")
    expect(admin).toContain('MODULE {moduleStep} of 7')
  })

  it('keeps the same coach lane active inside Paycheck Planet', () => {
    expect(world).toContain('<PersistentCoach paycheckMode={paycheckMode} />')
    expect(world).not.toContain('!paycheckMode && <PersistentCoach')
    expect(coach).toContain('paycheckMode = false')
    expect(coach).toContain("type === 'lesson'")
  })

  it('lets non-button coach space pass clicks through to the game', () => {
    expect(coach).toContain('pointer-events-none fixed')
    expect(coach).toContain('pointer-events-auto')
  })
})
