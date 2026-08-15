import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { MODULE_CATALOG } from '../constants/modules.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const moduleSelect = fs.readFileSync(path.resolve('src/pages/ModuleSelect.jsx'), 'utf8')
const launch = fs.readFileSync(path.join(here, 'physicalModuleLaunch.js'), 'utf8')
const bondGate = fs.readFileSync(path.join(here, 'BondStreetGate.jsx'), 'utf8')
const taxBridge = fs.readFileSync(path.join(here, 'TaxWorldInteractionBridge.jsx'), 'utf8')
const bondWorld = fs.readFileSync(path.join(here, 'BondStreetWorld.jsx'), 'utf8')
const taxWorld = fs.readFileSync(path.join(here, 'PaycheckPlanetWorld.jsx'), 'utf8')

describe('Module 6 and 7 physical launch flow', () => {
  it('bypasses the generic modal-first entry flow for physical destinations', () => {
    expect(moduleSelect).toContain("preparePhysicalModuleLaunch(target.n)")
    expect(moduleSelect).toContain("nav('/world')")
    expect(launch).toContain("localStorage.removeItem('tayu-module-entry-intent')")
    expect(launch).toContain("activatePaycheckWorld()")
  })

  it('routes Module 6 to Bond Street and Module 7 to the Tax Office independently', () => {
    expect(launch).toContain("if (id === 6) sessionStorage.setItem(BOND_ONLY_KEY, '1')")
    expect(launch).toContain('else sessionStorage.removeItem(BOND_ONLY_KEY)')
    expect(bondWorld).toContain('MODULE 6 · BOND STREET')
    expect(taxWorld).toContain('MODULE 7 · TAYU TAX OFFICE')
  })

  it('places both physical modules at a real building even after world initialization', () => {
    expect(launch).toContain('const point = id === 6 ? BOND_ENTRY : TAX_POINTS.guide')
    expect(launch).toContain('playerPos.x = point[0]')
    expect(launch).toContain('playerPos.z = point[1]')
    expect(launch).toContain('window.setTimeout(() => placePhysicalModuleArrival(id), 80)')
    expect(launch).toContain('window.setTimeout(() => placePhysicalModuleArrival(id), 180)')
  })

  it('shows Module 6 as a brief animated arrival over live in-world interaction', () => {
    expect(bondGate).toContain('function BondArrivalIntro()')
    expect(bondGate).toContain('Welcome to Bond Street')
    expect(bondGate).toContain('animate-bounce')
    expect(bondGate).toContain('setShowArrivalIntro(false), 1900')
    expect(bondGate).toContain('showArrivalIntro && <BondArrivalIntro />')
    expect(bondGate).toContain('Walk around the building. Get close, then click or press E to interact.')
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
