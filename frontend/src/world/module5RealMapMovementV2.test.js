import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const world = read('src/pages/World.jsx')
const gameWorld = read('src/world/GameWorld.jsx')
const landmarks = read('src/world/ModuleLandmarks.jsx')
const paycheckWorld = read('src/world/PaycheckPlanetWorld.jsx')
const overlay = read('src/world/TaxWorkbenchOverlay.jsx')
const taxStore = read('src/world/taxLabStore.js')
const bridge = read('src/world/TaxWorldInteractionBridge.jsx')
const keyboard = read('src/world/useKeyboardControls.js')

describe('final-module real-map movement v2', () => {
  it('has exactly one persistent town scene and isolates Tax Town in its own scene boundary', () => {
    expect(world).toContain('<GameWorld key={worldSession} avatar={state.avatar} />')
    expect(world).toContain('data-world-mode="3d"')
    expect(world).not.toContain('AccessibleWorld')
    expect(world).not.toContain('TaxLabWorld')
    expect(gameWorld).toContain('<ModuleLandmarks />')
    expect(gameWorld).toContain('name="bond-tax"')
    expect(gameWorld).toContain('<BondTaxBuildings week={week} bondStep={bondStep} taxStep={taxStep} choiceFeedback={choiceFeedback} />')
    expect(fs.existsSync(path.resolve('src/world/TaxLabWorld.jsx'))).toBe(false)
  })

  it('teleports Explore launches for Module 6 or Module 7 to the district before module UI starts', () => {
    expect(world).toContain("if (moduleId === '6') return [BOND_ENTRY[0], BOND_ENTRY[1]]")
    expect(world).toContain("if (moduleId === '7') return [TAX_ENTRY[0], TAX_ENTRY[1]]")
    expect(world).toContain('function teleportToModuleArrival(moduleId)')
    expect(world).toContain('const point = moduleArrivalPoint(moduleId)')
    expect(world).toContain('const arrivalTimer = setTimeout(() => teleportToModuleArrival(entry.moduleId), 60)')
    expect(world).toContain('{!moduleEntry && taxMode && <TaxWorldInteractionBridge />}')
  })

  it('actively removes every legacy movement freeze while tax mode is running', () => {
    expect(world).toContain('prepareWorldForTaxWalking()')
    expect(world).toContain('scenarioLocked: false')
    expect(world).toContain('weekComplete: false')
    expect(world).toContain('lemPhase: null')
    expect(world).toContain("mgPhase: state.mg ? 'tax-paused' : state.mgPhase")
    expect(world).toContain("mg: state.mg ? { ...state.mg, phase: 'tax-paused' } : state.mg")
    expect(world).toContain('playerSpeedMult: 1')
    expect(world).toContain('joystick.x = 0')
    expect(world).toContain('moveTarget.x = null')
  })

  it('hands off from the Bank into Money Garden as Module 5 before Bond Street and tax', () => {
    expect(world).toContain("label: 'Start Module 5', act: null")
    expect(world).toContain('finishBankHandoffIntoGarden()')
    expect(world).toContain('game.startGarden()')
    expect(world).toContain("enterPaycheckPlanet({ origin: 'garden-handoff' })")
  })

  it('lets the player walk up and use the tax guide, taxpayers, and stations with E or the action control', () => {
    expect(world).toContain('<TaxWorldInteractionBridge />')
    expect(world).toContain('<TaxActionPrompt />')
    expect(bridge).toContain("event.code !== 'KeyE'")
    expect(bridge).toContain("window.addEventListener('tayu-interact'")
    expect(bridge).toContain('playerPos.x')
    expect(bridge).toContain('TAX_CLIENTS')
    expect(bridge).toContain('taxStationForStep(state.stepNumber)')
    expect(taxStore).toContain('nearbyAction')
  })

  it('keeps tax learning decision-based instead of next-button clicking', () => {
    expect(overlay).toContain('Before doing any tax math, what can you actually conclude?')
    expect(overlay).toContain('Select the two fields')
    expect(overlay).toContain('Build the bracket split yourself')
    expect(overlay).toContain('What is the dollar difference?')
    expect(overlay).toContain('Catch the planted error before you file')
    expect(overlay).not.toContain('Continue to next filing step')
  })

  it('declutters the live tax district and shows only the current decision targets', () => {
    expect(paycheckWorld).toContain('Rex · Tax Guide')
    expect(paycheckWorld).toContain('TAX_CLIENTS.map')
    expect(paycheckWorld).toContain('CurrentTaxStation')
    expect(paycheckWorld).toContain('InteractionGlow')
    expect(paycheckWorld).not.toContain('Leo · carrying returns')
    expect(paycheckWorld).not.toContain('Rae · delivering W-2s')
    expect(paycheckWorld).not.toContain('Nia · checking math')
    expect(paycheckWorld).toContain('Billboard')
    expect(paycheckWorld).toContain('labelTexture')
    expect(landmarks).not.toContain('TaxDistrictActivity')
  })

  it('does not turn form typing into movement input', () => {
    expect(keyboard).toContain("input, textarea, select, [contenteditable=\"true\"]")
    expect(keyboard).toContain('if (isTypingTarget(e.target)) return')
  })
})
