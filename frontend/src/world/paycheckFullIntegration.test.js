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

  it('launches public Module 5 directly at the Tax Filing Lab', () => {
    expect(world).toContain("jump === '5'")
    expect(world).toContain('enterPaycheckPlanet()')
    expect(world).toContain('game.adminTeleport(PAYCHECK_START)')
    expect(world).toContain('activatePaycheckWorld()')
    expect(world).toContain('Paycheck Planet · Tax Filing Lab')
    expect(world).not.toContain("navigate('/tax-paycheck'")
    expect(world).toContain("jump === '6' ? 5")
    expect(moduleSelect).toContain("String(target.n)")
    expect(moduleSelect).not.toContain('target.route')
    expect(paycheckMode).toContain('tayu-paycheck-world-mode')
  })

  it('makes Module 5 a six-step practice tax return with real math decisions', () => {
    expect(paycheckScenario).toContain('TOTAL_TAX_STEPS = 6')
    expect(paycheckScenario).toContain('TAX_CASES')
    expect(paycheckScenario).toContain('GAME_STANDARD_DEDUCTION')
    expect(paycheckScenario).toContain('bracketTax')
    expect(paycheckScenario).toContain('taxReturnMath')
    expect(paycheckScenario).toContain('filingStepFor')
    expect(paycheckScenario).toContain('Read the W-2')
    expect(paycheckScenario).toContain('Find taxable income')
    expect(paycheckScenario).toContain('Use the tax brackets')
    expect(paycheckScenario).toContain('Apply the tax credit')
    expect(paycheckScenario).toContain('Refund or amount due?')
    expect(paycheckScenario).toContain('Review and file')
    expect(paycheckWorld).toContain('six_step_tax_filing_practice')
    expect(paycheckWorld).toContain("type: correct ? 'tax_step_correct' : 'tax_step_retry'")
    expect(paycheckWorld).toContain('taxLabProgress')
  })

  it('starts with a large explanation and then uses a popup for every choice', () => {
    expect(paycheckWorld).toContain('File a practice tax return')
    expect(paycheckWorld).toContain('This module is about <strong>how a tax return works</strong>')
    expect(paycheckWorld).toContain('TAX_INTRO_STEPS.map')
    expect(paycheckWorld).toContain('<TaxFilingPanel')
    expect(paycheckWorld).toContain('<Html fullscreen')
    expect(paycheckWorld).toContain('Show a hint on the side')
    expect(paycheckWorld).toContain('onChooseCase')
    expect(paycheckWorld).toContain('onAnswer')
  })

  it('keeps all three choices reachable and visibly gives each one a path', () => {
    expect(paycheckScenario).toContain('x: -2.6')
    expect(paycheckScenario).toContain('x: 0')
    expect(paycheckScenario).toContain('x: 2.6')
    expect(paycheckWorld).toContain('function ChoicePath')
    expect(paycheckWorld).toContain('<ChoicePath')
    expect(paycheckWorld).toContain('The popup is the main control, so no choice can be blocked by the map.')
  })

  it('keeps Module 5 animated without stacked Press E instructions', () => {
    expect(paycheckWorld).toContain("labelTexture('PAYCHECK PLANET · TAX LAB'")
    expect(paycheckWorld).toContain('AnimatedStation')
    expect(paycheckWorld).toContain('pushCoins(')
    expect(paycheckWorld).toContain('CelebrationBurst')
    expect(paycheckWorld).not.toContain('PRESS E')
    expect(paycheckWorld).not.toContain('NO TELEPORT')
    expect(paycheckWorld).not.toContain('WALK TO MODULE 6')
    expect(paycheckWorld).toContain("phase === 'complete'")
  })

  it('turns off redundant world navigation prompts during Module 5', () => {
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

  it('uses important popups in front and ordinary hints on the side', () => {
    expect(coach).toContain("data-guidance-lane={important ? 'important-popup' : 'side-hint'}")
    expect(coach).toContain('data-important-message-scrim="true"')
    expect(coach).toContain("queuedMessage?.kind === 'actor'")
    expect(coach).toContain('right-[max(0.75rem,env(safe-area-inset-right,0px))]')
    expect(coach).toContain('pointer-events-none fixed')
  })
})
