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

describe('Module 6 and 7 physical launch flow', () => {
  it('bypasses the generic modal-first entry flow for physical destinations', () => {
    expect(moduleSelect).toContain("preparePhysicalModuleLaunch(target.n)")
    expect(moduleSelect).toContain("nav('/world')")
    expect(launch).toContain("localStorage.removeItem('tayu-module-entry-intent')")
    expect(launch).toContain("sessionStorage.setItem(PHYSICAL_MODULE_KEY, String(id))")
    expect(launch).toContain("activatePaycheckWorld()")
  })

  it('clears stale earlier-module messages and completion state before entering 6 or 7', () => {
    expect(launch).toContain('clearStalePhysicalModuleUi()')
    expect(launch).toContain('dialog: null')
    expect(launch).toContain('lessons: []')
    expect(launch).toContain('cards: []')
    expect(launch).toContain('pendingWeekComplete: false')
    expect(launch).toContain('weekComplete: false')
    expect(launch).toContain('enterParty: false')
  })

  it('routes Module 6 to Bond Street and Module 7 to the Tax Office independently', () => {
    expect(launch).toContain("if (id === 6) sessionStorage.setItem(BOND_ONLY_KEY, '1')")
    expect(launch).toContain('else sessionStorage.removeItem(BOND_ONLY_KEY)')
    expect(bondWorld).toContain('MODULE 6 · BOND STREET')
    expect(taxWorld).toContain('MODULE 7 · TAYU TAX OFFICE')
  })

  it('places both physical modules at real building entrances and re-applies the spawn after Canvas creation', () => {
    expect(launch).toContain('const point = id === 6 ? BOND_ENTRY : TAX_ENTRY')
    expect(launch).toContain('playerPos.x = point[0]')
    expect(launch).toContain('playerPos.z = point[1]')
    expect(launch).toContain('window.setTimeout(() => placePhysicalModuleArrival(id), 80)')
    expect(gameWorld).toContain('settlePhysicalLaunchAfterCanvasMount()')
    expect(gameWorld).toContain('window.requestAnimationFrame(() => placePhysicalModuleArrival(moduleId))')
    expect(gameWorld).toContain('window.setTimeout(() => placePhysicalModuleArrival(moduleId), 360)')
  })

  it('completely removes the Module 6 fullscreen 2D arrival version', () => {
    expect(bondGate).not.toContain('function BondArrivalIntro()')
    expect(bondGate).not.toContain('showArrivalIntro')
    expect(bondGate).not.toContain('Welcome to Bond Street')
    expect(bondGate).toContain('Module 6 is now 3D-only')
    expect(bondGate).toContain('Walk around the building. Get close, then click or press E to interact.')
  })

  it('does not use a blue Canvas background for the Module 6/7 paycheck world', () => {
    expect(gameWorld).toContain("paycheckWorld ? '#f4efe3' : '#cfe6f2'")
    expect(gameWorld).toContain("paycheckWorld ? '#e9e3d6' : '#d6e9f0'")
  })

  it('does not auto-start either lesson and requires a nearby E interaction', () => {
    expect(bondGate).toContain("event.code !== 'KeyE'")
    expect(bondGate).toContain('nearestExpected(stage)')
    expect(taxBridge).toContain("event.code !== 'KeyE'")
    expect(taxBridge).toContain('nearbyTaxAction()')
    expect(bondGate).toContain('Walk inside and talk to Beau.')
    expect(taxBridge).toContain('Talk to Rex and start Module 7')
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
