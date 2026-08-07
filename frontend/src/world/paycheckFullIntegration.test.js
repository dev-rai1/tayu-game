import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const gameWorld = read('src/world/GameWorld.jsx')
const keyboard = read('src/world/useKeyboardControls.js')
const world = read('src/pages/World.jsx')
const moduleSelect = read('src/pages/ModuleSelect.jsx')
const paycheckWorld = read('src/world/PaycheckPlanetWorld.jsx')
const overlay = read('src/world/TaxWorkbenchOverlay.jsx')
const taxStore = read('src/world/taxLabStore.js')
const paycheckScenario = read('src/scenarios/paycheckPlanet.js')
const paycheckMode = read('src/world/paycheckMode.js')
const objective = read('src/world/objective.js')
const taxScene = read('src/world/TaxLabWorld.jsx')
const taxCss = read('src/world/taxWorkbench.css')
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

  it('launches public Module 5 directly at the isolated Tax Filing Lab', () => {
    expect(world).toContain("jump === '5'")
    expect(world).toContain('enterPaycheckPlanet({ restart: true })')
    expect(world).toContain('game.adminTeleport(PAYCHECK_START)')
    expect(world).toContain('activatePaycheckWorld()')
    expect(world).toContain('taxMode ? <TaxLabWorld />')
    expect(world).toContain('{taxMode && <TaxWorkbenchOverlay />}')
    expect(world).not.toContain("navigate('/tax-paycheck'")
    expect(world).toContain("jump === '6' ? 5")
    expect(moduleSelect).toContain("String(target.n)")
    expect(moduleSelect).not.toContain('target.route')
    expect(paycheckMode).toContain('tayu-paycheck-world-mode')
    expect(taxScene).toContain('<PaycheckPlanetWorld />')
  })

  it('keeps the six-step tax math but turns the experience into workbench actions', () => {
    expect(paycheckScenario).toContain('TOTAL_TAX_STEPS = 6')
    expect(paycheckScenario).toContain('TAX_CASES')
    expect(paycheckScenario).toContain('GAME_STANDARD_DEDUCTION')
    expect(paycheckScenario).toContain('bracketTax')
    expect(paycheckScenario).toContain('taxReturnMath')
    expect(overlay).toContain('interactive_tax_workbench')
    expect(overlay).toContain("type: 'tax_workbench_action'")
    expect(overlay).toContain('W2Scanner')
    expect(overlay).toContain('DeductionWorkbench')
    expect(overlay).toContain('BracketMachine')
    expect(overlay).toContain('CreditStation')
    expect(overlay).toContain('ReconcileScale')
    expect(overlay).toContain('FilingDesk')
    expect(taxStore).toContain('emptyTaxWork')
    expect(overlay).toContain('taxLabProgress')
  })

  it('uses one browser-level workbench instead of a canvas popup plus side hint', () => {
    expect(world).toContain('{taxMode && <TaxWorkbenchOverlay />}')
    expect(overlay).toContain('data-tax-workbench="true"')
    expect(overlay).not.toContain('createPortal(')
    expect(paycheckWorld).not.toContain('<Html fullscreen')
    expect(overlay).not.toContain('Show a hint on the side')
    expect(world).not.toContain('TaxSideHint')
    expect(taxCss).toContain('width: 100vw')
    expect(taxCss).toContain('min-width: 100vw')
  })

  it('is not multiple-choice gameplay after selecting a W-2 folder', () => {
    expect(overlay).toContain('There are no A/B/C quiz answers.')
    expect(overlay).toContain('Tap the two boxes')
    expect(overlay).toContain('PRESS TO APPLY')
    expect(overlay).toContain('Run the bracket lanes')
    expect(overlay).toContain('Compare the two totals')
    expect(overlay).toContain('Sign & file practice return')
    expect(overlay).not.toContain('answerChoice')
    expect(paycheckWorld).not.toContain('ANSWER ${String.fromCharCode')
  })

  it('keeps all three W-2 folders visible in the 3D Tax Lab', () => {
    expect(paycheckScenario).toContain('x: -2.6')
    expect(paycheckScenario).toContain('x: 0')
    expect(paycheckScenario).toContain('x: 2.6')
    expect(paycheckWorld).toContain('function ChoicePath')
    expect(paycheckWorld).toContain('<ChoicePath')
    expect(overlay).toContain('Open one W-2 folder')
  })

  it('adds visible motion to both the DOM workbench and 3D Tax Lab', () => {
    expect(paycheckWorld).toContain('TaxMachineAnimation')
    expect(paycheckWorld).toContain('CelebrationBurst')
    expect(taxCss).toContain('@keyframes taxScanLine')
    expect(taxCss).toContain('@keyframes taxCoinFlow')
    expect(taxCss).toContain('@keyframes taxCreditSlide')
    expect(taxCss).toContain('@keyframes taxEnvelopeFly')
    expect(paycheckWorld).not.toContain('PRESS E')
  })

  it('turns off unrelated world UI and navigation prompts during Module 5', () => {
    expect(objective).toContain('if (isPaycheckWorldActive()) return null')
    expect(world).toContain('{!taxMode && <Hud')
    expect(world).toContain('{!taxMode && <PersistentCoach')
    expect(world).toContain('{!taxMode && <AdminPanel />')
    expect(world).toContain('<FirstTimeMovementTutorial enabled={use3D && !taxMode} />')
    expect(world).toContain('usesTouchControls && !taxMode')
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
    expect(world).toContain("taxMode ? 'tax'")
    expect(overlay).toContain("type: 'module_complete'")
  })

  it('gives admin navigation seven public stops including Paycheck Planet', () => {
    expect(admin).toContain("5: 'Paycheck Planet'")
    expect(admin).toContain("6: 'Money Garden'")
    expect(admin).toContain("7: 'Finale Area'")
    expect(admin).not.toContain('/tax-paycheck?admin=1')
    expect(admin).toContain("localStorage.setItem('tayu-jump-module', String(step))")
  })

  it('keeps the shared world coach hierarchy for normal modules', () => {
    expect(coach).toContain("data-guidance-lane={important ? 'important-popup' : 'side-hint'}")
    expect(coach).toContain('data-important-message-scrim="true"')
    expect(coach).toContain('pointer-events-none fixed')
    expect(world).toContain('{!taxMode && <PersistentCoach key="world-coach" />}')
  })
})
