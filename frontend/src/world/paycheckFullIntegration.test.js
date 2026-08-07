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
  it('removes the This way edge pointer and uses left/right arrows only for camera rotation', () => {
    expect(gameWorld).not.toContain('ObjectiveEdgePointer')
    expect(keyboard).toContain("ArrowLeft: 'lookLeft'")
    expect(keyboard).toContain("ArrowRight: 'lookRight'")
    expect(keyboard).not.toContain("ArrowLeft: 'left'")
    expect(keyboard).not.toContain("ArrowRight: 'right'")
  })

  it('launches public Module 5 directly at Paycheck Planet', () => {
    expect(world).toContain("jump === '5'")
    expect(world).toContain('enterPaycheckPlanet()')
    expect(world).toContain('game.adminTeleport(PAYCHECK_START)')
    expect(world).toContain('activatePaycheckWorld()')
    expect(world).not.toContain('guideToPaycheckPlanet')
    expect(world).not.toContain('you will not be teleported')
    expect(world).not.toContain("navigate('/tax-paycheck'")
    expect(world).toContain("jump === '6' ? 5")
    expect(moduleSelect).toContain("String(target.n)")
    expect(moduleSelect).not.toContain('target.route')
    expect(paycheckMode).toContain('tayu-paycheck-world-mode')
  })

  it('expands Module 5 into a six-week job, tax, budget, and life simulation', () => {
    expect(paycheckScenario).toContain('TOTAL_PAYCHECK_WEEKS = 6')
    expect(paycheckScenario).toContain("title: 'JOB CHANGE'")
    expect(paycheckScenario).toContain("title: 'SURPRISE WEEK'")
    expect(paycheckScenario).toContain('BUDGET_PLANS')
    expect(paycheckScenario).toContain('applyLifeChoice')
    expect(paycheckWorld).toContain('WEEK 1 · CHOOSE A JOB')
    expect(paycheckWorld).toContain('START_JOBS.map')
    expect(paycheckWorld).toContain('CAREER_JOBS.map')
    expect(paycheckWorld).toContain('BUDGET_PLANS.map')
    expect(paycheckWorld).toContain('spec.choices.map')
    expect(paycheckWorld).toContain("type: 'week_complete'")
    expect(paycheckWorld).toContain('taxLabProgress')
  })

  it('keeps Module 5 animated and clickable without stacked Press E or no-teleport labels', () => {
    expect(paycheckWorld).toContain("labelTexture('PAYCHECK PLANET'")
    expect(paycheckWorld).toContain('AnimatedStation')
    expect(paycheckWorld).toContain('pushCoins(')
    expect(paycheckWorld).toContain('CelebrationBurst')
    expect(paycheckWorld).not.toContain('PRESS E')
    expect(paycheckWorld).not.toContain('NO TELEPORT')
    expect(paycheckWorld).not.toContain('WALK TO MODULE 6')
    expect(paycheckWorld).toContain("phase === 'complete'")
    expect(paycheckWorld).toContain("phase === 'complete') return")
  })

  it('turns off the redundant world arrow and first-time Press E tutorial during Module 5', () => {
    expect(objective).toContain('if (isPaycheckWorldActive()) return null')
    expect(world).toContain('<FirstTimeMovementTutorial enabled={use3D && !paycheckMode} />')
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
