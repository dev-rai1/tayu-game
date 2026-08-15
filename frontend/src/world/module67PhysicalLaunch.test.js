import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MODULE_CATALOG } from '../constants/modules.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const moduleSelect = fs.readFileSync(path.resolve('src/pages/ModuleSelect.jsx'), 'utf8')
const launch = fs.readFileSync(path.join(here, 'physicalModuleLaunch.js'), 'utf8')
const gameWorld = fs.readFileSync(path.join(here, 'GameWorld.jsx'), 'utf8')
const bondGate = fs.readFileSync(path.join(here, 'BondStreetGate.jsx'), 'utf8')
const taxBridge = fs.readFileSync(path.join(here, 'TaxWorldInteractionBridge.jsx'), 'utf8')
const bondWorld = fs.readFileSync(path.join(here, 'BondStreetWorld.jsx'), 'utf8')
const taxWorld = fs.readFileSync(path.join(here, 'PaycheckPlanetWorld.jsx'), 'utf8')
const physicalSigns = fs.readFileSync(path.join(here, 'PhysicalModuleSigns.jsx'), 'utf8')
const questionHelp = fs.readFileSync(path.join(here, 'WorldQuestionHelp.jsx'), 'utf8')
const partyHouse = fs.readFileSync(path.join(here, 'PartyHouse.jsx'), 'utf8')
const taxCheck = fs.readFileSync(path.resolve('src/components/PaycheckCompletionCheck.jsx'), 'utf8')

describe('Module 6 and 7 physical launch flow', () => {
  it('bypasses the generic modal-first entry flow for physical destinations', () => {
    expect(moduleSelect).toContain('preparePhysicalModuleLaunch(target.n)')
    expect(moduleSelect).toContain("nav('/world')")
    expect(launch).toContain("localStorage.removeItem('tayu-module-entry-intent')")
    expect(launch).toContain('sessionStorage.setItem(PHYSICAL_MODULE_KEY, String(id))')
    expect(launch).toContain('activatePaycheckWorld()')
  })

  it('clears stale earlier-module messages and completion state before entering 6 or 7', () => {
    expect(launch).toContain('clearStalePhysicalModuleUi()')
    expect(launch).toContain('dialog: null')
    expect(launch).toContain('lessons: []')
    expect(launch).toContain('cards: []')
    expect(launch).toContain('pendingWeekComplete: false')
    expect(launch).toContain('weekComplete: false')
    expect(launch).toContain('enterParty: false')
    expect(launch).toContain('scenarioLocked: false')
    expect(launch).toContain('playerSpeedMult: 1')
  })

  it('routes Bond Street and the Tax Office independently without numbered in-world labels', () => {
    expect(launch).toContain("if (id === 6) sessionStorage.setItem(BOND_ONLY_KEY, '1')")
    expect(launch).toContain('else sessionStorage.removeItem(BOND_ONLY_KEY)')
    expect(bondWorld).toContain("labelTexture('BOND STREET'")
    expect(bondWorld).not.toContain('BOND STREET · UNDER CONSTRUCTION')
    expect(bondWorld).not.toContain('MODULE 6 · BOND STREET')
    expect(physicalSigns).toContain('TAYU TAX OFFICE · UNDER CONSTRUCTION')
    expect(taxBridge).not.toContain('start Module 7')
  })

  it('keeps public order 1 through 7 and puts the Finale after the Tax Office', () => {
    expect(MODULE_CATALOG.map((module) => module.n)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(MODULE_CATALOG[5].title).toBe('Bond Street')
    expect(MODULE_CATALOG[5].underConstruction).not.toBe(true)
    expect(MODULE_CATALOG[6].title).toContain('TAYU Tax Office')
    expect(MODULE_CATALOG[6].underConstruction).toBe(true)
    expect(MODULE_CATALOG[6].leadsToFinale).toBe(true)
    expect(MODULE_CATALOG[6].finale).not.toBe(true)
    expect(moduleSelect).toContain('Tax Office → Finale')
    expect(taxCheck).toContain('Module 7 · tax filing check complete')
    expect(taxCheck).toContain('Continue to Finale →')
    expect(partyHouse).toContain("cardTexture('FINALE AREA'")
    expect(partyHouse).not.toContain("cardTexture('MODULE 6'")
  })

  it('spawns Module 6 outside in front of the Bond Street entrance', () => {
    expect(launch).toContain('const point = id === 6 ? BOND_ENTRY : TAX_ENTRY')
    expect(launch).toContain("typeof game.adminTeleport === 'function'")
    expect(bondWorld).toContain('BOND_ENTRY = [BOND_DISTRICT[0] - 9.35, BOND_DISTRICT[1]]')
    expect(bondWorld).toContain('arrive in front of Bond Street')
    expect(gameWorld).toContain('settlePhysicalLaunchAfterCanvasMount()')
  })

  it('keeps Bond Street before the Tax Office with a landscaped route buffer', () => {
    expect(bondWorld).toContain('TAX_DISTRICT[0] - 8.9')
    expect(bondWorld).toContain('TAX_DISTRICT[1] - 8.0')
    expect(bondWorld).toContain('BondApproachAndLandscaping')
    expect(bondWorld).toContain('bond-planter-')
    expect(taxWorld).toContain('TaxCenterBuilding')
  })

  it('completely removes the fullscreen 2D Bond Street arrival version', () => {
    expect(bondGate).not.toContain('function BondArrivalIntro()')
    expect(bondGate).not.toContain('showArrivalIntro')
    expect(bondGate).not.toContain('Welcome to Bond Street')
    expect(bondGate).toContain('Bond Street is 3D-only')
    expect(bondGate).toContain('Walk inside the building. Get close, then click or press E to interact.')
  })

  it('does not use a blue Canvas background for the physical Module 6/7 world', () => {
    expect(gameWorld).toContain("paycheckWorld ? '#f4efe3' : '#cfe6f2'")
    expect(gameWorld).toContain("paycheckWorld ? '#e9e3d6' : '#d6e9f0'")
  })

  it('keeps a persistent question-mark help control with Bond-specific instructions', () => {
    expect(gameWorld).toContain('<WorldQuestionHelp />')
    expect(questionHelp).toContain('Open instructions and learning resources')
    expect(questionHelp).toContain('Instructions')
    expect(questionHelp).toContain('Learning resources')
    expect(questionHelp).toContain("? 'Bond Street'")
    expect(questionHelp).toContain('You arrive in front of Bond Street.')
    expect(questionHelp).toContain('TAYU Tax Office — Under Construction')
  })

  it('does not auto-start either lesson and requires a nearby E interaction', () => {
    expect(bondGate).toContain("event.code !== 'KeyE'")
    expect(bondGate).toContain('nearestExpected(stage)')
    expect(taxBridge).toContain("event.code !== 'KeyE'")
    expect(taxBridge).toContain('nearbyTaxAction()')
    expect(bondGate).toContain('Walk inside and talk to Beau.')
    expect(taxBridge).toContain('Talk to Rex and start the Tax Office')
  })

  it('keeps every module title assigned a visible catalog color', () => {
    expect(MODULE_CATALOG).toHaveLength(7)
    for (const module of MODULE_CATALOG) {
      expect(module.color, `Module ${module.n} should have a title color`).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
    expect(moduleSelect).toContain('style={{ color: module.color }}')
    expect(moduleSelect).toContain('style={{ color: part.color }}')
  })
})
