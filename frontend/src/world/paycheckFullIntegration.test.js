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
const taxLayout = read('src/world/taxDistrictLayout.js')
const paycheckScenario = read('src/scenarios/paycheckPlanet.js')
const paycheckMode = read('src/world/paycheckMode.js')
const objective = read('src/world/objective.js')
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

  it('starts Module 5 in the same persistent town instead of teleporting or swapping scenes', () => {
    expect(world).toContain("jump === '5'")
    expect(world).toContain('enterPaycheckPlanet({ restart: true })')
    expect(world).toContain('activatePaycheckWorld()')
    expect(world).not.toContain('adminTeleport(PAYCHECK_START)')
    expect(world).not.toContain('TaxLabWorld')
    expect(world).toContain('{use3D ? <GameWorld avatar={state.avatar} /> : <AccessibleWorld />}')
    expect(world).toContain('{taxMode && <TaxWorkbenchOverlay />}')
    expect(world).not.toContain("navigate('/tax-paycheck'")
    expect(world).toContain("jump === '6' ? 5")
    expect(moduleSelect).toContain("String(target.n)")
    expect(moduleSelect).not.toContain('target.route')
    expect(paycheckMode).toContain('tayu-paycheck-world-mode')
  })

  it('keeps the six-step tax math but requires decisions and calculations instead of next-button clicking', () => {
    expect(paycheckScenario).toContain('TOTAL_TAX_STEPS = 6')
    expect(paycheckScenario).toContain('GAME_STANDARD_DEDUCTION')
    expect(paycheckScenario).toContain('bracketTax')
    expect(paycheckScenario).toContain('taxReturnMath')
    expect(overlay).toContain('Select the two fields')
    expect(overlay).toContain('draggable')
    expect(overlay).toContain('Build the bracket split yourself')
    expect(overlay).toContain("placeholder=\"$ amount\"")
    expect(overlay).toContain('Place the credit in the right stage')
    expect(overlay).toContain('Decide the outcome and calculate the difference')
    expect(overlay).toContain('Catch the planted error before you file')
    expect(overlay).toContain('Type <strong>FILE</strong>')
    expect(overlay).not.toContain('Continue to next filing step')
    expect(overlay).not.toContain('There are no A/B/C quiz answers.')
  })

  it('uses physical station progression and closes the task panel between steps', () => {
    expect(taxStore).toContain('panel: null')
    expect(taxStore).toContain('openStation: (stepNumber)')
    expect(taxStore).toContain('advanceStep: () => set')
    expect(taxStore).toContain('`Good work. Walk to the ${taxStationForStep(next).label}.`')
    expect(taxLayout).toContain('TAX_STEP_STATIONS')
    expect(paycheckWorld).toContain('TaxStation')
    expect(paycheckWorld).toContain('NEXT · WALK HERE')
    expect(objective).toContain('taxStationForStep(tax.stepNumber).point')
  })

  it('keeps the map and movement usable while focused station panels stay compact', () => {
    expect(world).toContain('<Hud playerName={state.player.name')
    expect(world).toContain('{use3D && usesTouchControls && <MobileControls />}')
    expect(overlay).toContain('data-tax-field-ui="true"')
    expect(overlay).toContain('data-tax-station-panel="true"')
    expect(overlay).toContain('max-h-[72dvh]')
    expect(overlay).not.toContain('aria-modal="true"')
    expect(paycheckWorld).not.toContain('<Html fullscreen')
    expect(taxCss).toContain("[data-tax-field-ui='true']")
  })

  it('adds multiple active NPC roles rather than using an empty Tax Lab backdrop', () => {
    expect(taxLayout).toContain('TAX_CLIENTS')
    expect(taxLayout).toContain("name: 'Ari'")
    expect(taxLayout).toContain("name: 'Sam'")
    expect(taxLayout).toContain("name: 'Jordan'")
    expect(paycheckWorld).toContain('Maya · Tax Guide')
    expect(paycheckWorld).toContain('RovingTaxWorker')
    expect(paycheckWorld).toContain('Leo · carrying returns')
    expect(paycheckWorld).toContain('Rae · delivering W-2s')
    expect(paycheckWorld).toContain('DeskWorker')
    expect(paycheckWorld).toContain('Nia · checking math')
    expect(paycheckWorld).toContain('CharacterMesh')
  })

  it('makes the client choice teach evidence instead of revealing the answer upfront', () => {
    expect(overlay).toContain('Before doing any tax math, what can you actually conclude?')
    expect(overlay).toContain('We cannot know yet')
    expect(overlay).toContain("prediction === 'unknown'")
    expect(overlay).toContain('Withholding is only money already paid')
    expect(taxStore).toContain('predictionMistakes')
  })

  it('requires correct bracket allocation and tax math', () => {
    expect(overlay).toContain('numberValue(inputs.firstIncome) === math.firstBracketIncome')
    expect(overlay).toContain('numberValue(inputs.secondIncome) === math.secondBracketIncome')
    expect(overlay).toContain('numberValue(inputs.firstTax) === firstTax')
    expect(overlay).toContain('numberValue(inputs.secondTax) === secondTax')
    expect(overlay).toContain('bracketMistakes')
  })

  it('requires the player to catch and repair a filing error', () => {
    expect(overlay).toContain('const plantedWrongTax = math.finalTax + 100')
    expect(overlay).toContain("field === 'finalTax'")
    expect(overlay).toContain('numberValue(work.reviewCorrection) === math.finalTax')
    expect(overlay).toContain('reviewMistakes')
  })

  it('routes Module 5 navigation through the real district instead of disabling guidance', () => {
    expect(objective).toContain("if (tax.phase === 'intro') return TAX_POINTS.guide")
    expect(objective).toContain("if (tax.phase === 'case') return TAX_POINTS.caseCenter")
    expect(objective).toContain("if (tax.phase === 'steps') return taxStationForStep(tax.stepNumber).point")
    expect(objective).not.toContain('if (isPaycheckWorldActive()) return null')
  })

  it('adds visible motion in the in-world district and tactile panel feedback', () => {
    expect(paycheckWorld).toContain('RovingTaxWorker')
    expect(paycheckWorld).toContain('StationProp')
    expect(paycheckWorld).toContain('CelebrationBurst')
    expect(taxCss).toContain('@keyframes taxScanLine')
    expect(taxCss).toContain('@keyframes taxCreditSlide')
    expect(taxCss).toContain('@keyframes taxShake')
    expect(paycheckWorld).not.toContain('PRESS E')
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
    expect(overlay).toContain("type: 'tax_decision_action'")
    expect(overlay).toContain("mode: 'in_world_decision_lab'")
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
