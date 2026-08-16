import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const world = read('src/pages/World.jsx')
const moduleSelect = read('src/pages/ModuleSelect.jsx')
const paycheckWorld = read('src/world/PaycheckPlanetWorld.jsx')
const overlay = read('src/world/TaxWorkbenchOverlay.jsx')
const actionPrompt = read('src/world/TaxActionPrompt.jsx')
const taxStore = read('src/world/taxLabStore.js')
const taxLayout = read('src/world/taxDistrictLayout.js')
const paycheckScenario = read('src/scenarios/paycheckPlanet.js')
const objective = read('src/world/objective.js')
const bridge = read('src/world/TaxWorldInteractionBridge.jsx')
const physicalSigns = read('src/world/PhysicalModuleSigns.jsx')

describe('Paycheck Planet full integration', () => {
  it('routes Modules 6 and 7 into the shared 3D town experience', () => {
    expect(world).toContain("if (moduleId === '6' || moduleId === '7')")
    expect(world).toContain("if (moduleId === '6') sessionStorage.setItem(BOND_ONLY_KEY, '1')")
    expect(world).toContain("enterPaycheckPlanet({ restart: moduleId === '7', origin: 'module-select' })")
    expect(world).toContain('teleportToModuleArrival(entry.moduleId)')
    expect(world).toContain('<GameWorld key={worldSession} avatar={state.avatar} />')
    expect(world).toContain('data-world-mode="3d"')
    expect(moduleSelect).toContain('String(target.n)')
  })

  it('keeps Module 7 inside a physical Tax Office with Rex and taxpayer NPCs', () => {
    expect(physicalSigns).toContain("labelTexture('TAYU TAX OFFICE'")
    expect(paycheckWorld).toContain('function TaxCenterBuilding')
    expect(paycheckWorld).toContain('Rex · Tax Guide')
    expect(paycheckWorld).toContain('TAX_CLIENTS.map')
    expect(paycheckWorld).toContain('InteractiveTaxNpc')
    expect(paycheckWorld).toContain('CharacterMesh')
    expect(paycheckWorld).toContain('InteractionGlow')
  })

  it('uses a six-step tax workflow with real calculations', () => {
    expect(paycheckScenario).toContain('TOTAL_TAX_STEPS = 6')
    expect(paycheckScenario).toContain('GAME_STANDARD_DEDUCTION')
    expect(paycheckScenario).toContain('bracketTax')
    expect(paycheckScenario).toContain('taxReturnMath')
  })

  it('returns control to the Tax Office after each completed decision', () => {
    expect(taxStore).toContain('openStation: (stepNumber)')
    expect(taxStore).toContain('advanceStep: () => {')
    expect(taxStore).toContain("emitTaxWorld('step-complete'")
    expect(taxStore).toContain('const next = state.stepNumber + 1')
    expect(taxStore).toContain('panel: null')
    expect(taxStore).toContain('The office reacted to your decision. Now walk to ${taxStationForStep(next).label}.')
    expect(paycheckWorld).toContain('CurrentTaxStation')
    expect(paycheckWorld).toContain('StationProp')
    expect(paycheckWorld).toContain('CelebrationBurst')
  })

  it('uses proximity-based E interactions for Rex, clients, and stations', () => {
    expect(world).toContain('<TaxWorldInteractionBridge />')
    expect(world).toContain('<TaxActionPrompt />')
    expect(bridge).toContain("event.code !== 'KeyE'")
    expect(bridge).toContain("window.addEventListener('tayu-interact'")
    expect(bridge).toContain("label: 'Talk to Rex and start the Tax Office'")
    expect(bridge).toContain("state.phase === 'case'")
    expect(bridge).toContain("state.phase === 'steps'")
    expect(bridge).toContain('taxStationForStep(state.stepNumber)')
  })

  it('keeps station workbenches compact instead of replacing the 3D room', () => {
    expect(overlay).toContain('data-tax-field-ui="true"')
    expect(overlay).toContain('data-tax-station-panel="true"')
    expect(overlay).toContain('max-h-[72dvh]')
    expect(overlay).not.toContain('aria-modal="true"')
    expect(paycheckWorld).not.toContain('<Html fullscreen')
  })

  it('keeps the action prompt hidden unless an in-world interaction is available', () => {
    expect(actionPrompt).toContain('if (!canActivate) return null')
    expect(actionPrompt).toContain('Press E or click here')
    expect(actionPrompt).toContain("nearbyAction.kind === 'client'")
    expect(actionPrompt).toContain("nearbyAction.kind === 'station'")
  })

  it('keeps taxpayer and station navigation tied to the real district', () => {
    expect(taxLayout).toContain('TAX_CLIENTS')
    expect(taxLayout).toContain("name: 'Ari'")
    expect(taxLayout).toContain("name: 'Sam'")
    expect(taxLayout).toContain("name: 'Jordan'")
    expect(taxLayout).toContain('TAX_STEP_STATIONS')
    expect(objective).toContain("if (tax.phase === 'intro') return TAX_POINTS.guide")
    expect(objective).toContain("if (tax.phase === 'case') return TAX_POINTS.caseCenter")
    expect(objective).toContain("if (tax.phase === 'steps') return taxStationForStep(tax.stepNumber).point")
  })

  it('keeps decision-first tax activities instead of next-button quiz progression', () => {
    expect(overlay).toContain('Select the two fields')
    expect(overlay).toContain('Build the bracket split yourself')
    expect(overlay).toContain('Place the credit in the right stage')
    expect(overlay).toContain('Decide the outcome and calculate the difference')
    expect(overlay).toContain('Catch the planted error before you file')
    expect(overlay).toContain('Type <strong>FILE</strong>')
    expect(overlay).not.toContain('Continue to next filing step')
  })
})
