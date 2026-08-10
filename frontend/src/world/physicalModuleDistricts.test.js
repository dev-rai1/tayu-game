import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BANK_DISTRICT, PARTY_HOUSE, SPROUT, STOP_ANGLES, TAX_DISTRICT } from './config.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const landmarks = fs.readFileSync(path.join(here, 'ModuleLandmarks.jsx'), 'utf8')
const paycheck = fs.readFileSync(path.join(here, 'PaycheckPlanetWorld.jsx'), 'utf8')
const overlay = fs.readFileSync(path.join(here, 'TaxWorkbenchOverlay.jsx'), 'utf8')
const layout = fs.readFileSync(path.join(here, 'taxDistrictLayout.js'), 'utf8')
const gameWorld = fs.readFileSync(path.join(here, 'GameWorld.jsx'), 'utf8')
const bank = fs.readFileSync(path.join(here, 'BankDistrict.jsx'), 'utf8')
const modules = fs.readFileSync(path.resolve('src/constants/modules.js'), 'utf8')

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

describe('physical module districts', () => {
  it('renders Paycheck Planet as a playable district inside the main town', () => {
    expect(gameWorld).toContain('<ModuleLandmarks />')
    expect(landmarks).toContain('<PaycheckPlanetWorld />')
    expect(paycheck).toContain("labelTexture('PAYCHECK PLANET · TAX LAB'")
    expect(paycheck).toContain('TaxStation')
    expect(paycheck).toContain('TAX_STEP_STATIONS')
    expect(paycheck).toContain('Maya · Tax Guide')
    expect(paycheck).toContain('RovingTaxWorker')
    expect(paycheck).toContain('DeskWorker')
    expect(paycheck).toContain('CelebrationBurst')
    expect(layout).toContain('TAX_POINTS')
    expect(layout).toContain('TAX_CLIENTS')
    expect(overlay).toContain('data-tax-station-panel="true"')
    expect(paycheck).not.toContain('<Html fullscreen')
    expect(paycheck).not.toContain('PRESS E / TAP')
    expect(paycheck).not.toContain("window.location.assign('/tax-paycheck')")
  })

  it('requires walking close to NPCs and stations before interaction', () => {
    expect(paycheck).toContain('INTERACT_RADIUS = 3.3')
    expect(paycheck).toContain('closeEnough(point)')
    expect(paycheck).toContain('Walk closer to ${label} to interact.')
    expect(paycheck).toContain('useTaxLab.getState().openStation(step)')
  })

  it('keeps physical signs clean while the catalog identifies the Money Garden as modules 5A and 5B', () => {
    expect(bank).toContain("labelTexture('BANK OF TAYU'")
    expect(bank).not.toContain("labelTexture('MODULE 4")
    expect(landmarks).toContain("labelTexture('THE MONEY GARDEN'")
    expect(landmarks).not.toContain("labelTexture('MODULE 5")
    expect(modules).toMatch(/n:\s*5,[\s\S]*?badge:\s*'garden',[\s\S]*?title:\s*'Money Garden — Modules 5A \+ 5B'/)
    expect(modules).toContain("label: 'Module 5A'")
    expect(modules).toContain("label: 'Module 5B'")
  })

  it('gives Bank, Money Garden, Paycheck Planet, and Finale real breathing room', () => {
    expect(STOP_ANGLES.bank).toBeGreaterThan(STOP_ANGLES.garden)
    expect(STOP_ANGLES.garden).toBeGreaterThan(STOP_ANGLES.tax)
    expect(STOP_ANGLES.tax).toBeGreaterThan(STOP_ANGLES.party)
    expect(distance(BANK_DISTRICT, SPROUT)).toBeGreaterThan(17)
    expect(distance(SPROUT, TAX_DISTRICT)).toBeGreaterThan(17)
    expect(distance(TAX_DISTRICT, PARTY_HOUSE)).toBeGreaterThan(30)
  })
})
