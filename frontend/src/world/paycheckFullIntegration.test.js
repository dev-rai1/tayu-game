import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const gameWorld = read('src/world/GameWorld.jsx')
const keyboard = read('src/world/useKeyboardControls.js')
const world = read('src/pages/World.jsx')
const moduleSelect = read('src/pages/ModuleSelect.jsx')
const paycheckWorld = read('src/world/PaycheckPlanetWorld.jsx')
const paycheckScenario = read('src/scenarios/paycheckPlanet.js')
const paycheckMode = read('src/world/paycheckMode.js')
const objective = read('src/world/objective.js')
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

  it('launches public Module 5 in the same world without automatic gameplay teleporting', () => {
    expect(world).toContain("jump === '5'")
    expect(world).toContain('activatePaycheckWorld()')
    expect(world).toContain('guideToPaycheckPlanet')
    expect(world).not.toContain('adminTeleport(TAX_ENTRY)')
    expect(world).not.toContain("navigate('/tax-paycheck'")
    expect(world).toContain("jump === '6' ? 5")
    expect(moduleSelect).toContain("String(target.n)")
    expect(moduleSelect).not.toContain('target.route')
    expect(paycheckMode).toContain('tayu-paycheck-world-mode')
    expect(objective).toContain('isPaycheckWorldActive()')
    expect(objective).toContain('PAYCHECK_ENTRANCE')
  })

  it('expands Module 5 into a six-week job, tax, budget, and life simulation', () => {
    expect(paycheckScenario).toContain('TOTAL_PAYCHECK_WEEKS = 6')
    expect(paycheckScenario).toContain("title: 'JOB CHANGE'")
    expect(paycheckScenario).toContain("title: 'SURPRISE WEEK'")
    expect(paycheckScenario).toContain('BUDGET_PLANS')
    expect(paycheckScenario).toContain('applyLifeChoice')
    expect(paycheckWorld).toContain('6-WEEK JOB · TAX · BUDGET · LIFE SIM')
    expect(paycheckWorld).toContain('LIFE SNAPSHOT')
    expect(paycheckWorld).toContain('START_JOBS.map')
    expect(paycheckWorld).toContain('CAREER_JOBS.map')
    expect(paycheckWorld).toContain('BUDGET_PLANS.map')
    expect(paycheckWorld).toContain('spec.choices.map')
    expect(paycheckWorld).toContain("type: 'week_complete'")
    expect(paycheckWorld).toContain('taxLabProgress')
  })

  it('keeps the module physical and hands off to Money Garden without teleporting', () => {
    expect(paycheckWorld).toContain("labelTexture('PAYCHECK PLANET'")
    expect(paycheckWorld).toContain('InteractiveStation')
    expect(paycheckWorld).toContain('pushCoins(')
    expect(paycheckWorld).toContain('CelebrationBurst')
    expect(paycheckWorld).toContain('NO TELEPORT · WALK TO MODULE 6')
    expect(paycheckWorld).toContain('deactivatePaycheckWorld()')
    expect(paycheckWorld).not.toContain('adminJumpModule(5)')
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

  it('lets non-button coach space pass clicks through to the game', () => {
    expect(coach).toContain('pointer-events-none fixed')
    expect(coach).toContain('pointer-events-auto')
  })
})
