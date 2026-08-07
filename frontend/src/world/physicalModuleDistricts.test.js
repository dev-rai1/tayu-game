import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BANK_DISTRICT, PARTY_HOUSE, SPROUT, STOP_ANGLES, TAX_DISTRICT } from './config.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const landmarks = fs.readFileSync(path.join(here, 'ModuleLandmarks.jsx'), 'utf8')
const paycheck = fs.readFileSync(path.join(here, 'PaycheckPlanetWorld.jsx'), 'utf8')
const overlay = fs.readFileSync(path.join(here, 'TaxWorkbenchOverlay.jsx'), 'utf8')
const taxScene = fs.readFileSync(path.join(here, 'TaxLabWorld.jsx'), 'utf8')
const gameWorld = fs.readFileSync(path.join(here, 'GameWorld.jsx'), 'utf8')
const bank = fs.readFileSync(path.join(here, 'BankDistrict.jsx'), 'utf8')
const modules = fs.readFileSync(path.resolve('src/constants/modules.js'), 'utf8')

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

describe('physical module districts', () => {
  it('renders Paycheck Planet as a playable animated Tax Filing Lab with a separate full-screen workbench', () => {
    expect(gameWorld).toContain('<ModuleLandmarks />')
    expect(landmarks).toContain('<PaycheckPlanetWorld />')
    expect(paycheck).toContain("labelTexture('PAYCHECK PLANET · TAX LAB'")
    expect(paycheck).toContain('AnimatedStation')
    expect(paycheck).toContain('ChoicePath')
    expect(paycheck).toContain('TaxMachineAnimation')
    expect(paycheck).toContain('CelebrationBurst')
    expect(taxScene).toContain('<PaycheckPlanetWorld />')
    expect(overlay).toContain('data-tax-workbench="true"')
    expect(overlay).toContain('W2Scanner')
    expect(overlay).toContain('FilingDesk')
    expect(paycheck).not.toContain('<TaxFilingPanel')
    expect(paycheck).not.toContain('<Html fullscreen')
    expect(paycheck).not.toContain('PRESS E / TAP')
    expect(paycheck).not.toContain("window.location.assign('/tax-paycheck')")
  })

  it('keeps physical signs clean while the catalog identifies the Money Garden as modules 6A and 6B', () => {
    expect(bank).toContain("labelTexture('BANK OF TAYU'")
    expect(bank).not.toContain("labelTexture('MODULE 4")
    expect(landmarks).toContain("labelTexture('THE MONEY GARDEN'")
    expect(landmarks).not.toContain("labelTexture('MODULE 6")
    expect(modules).toMatch(/n:\s*6,[\s\S]*?badge:\s*'garden',[\s\S]*?title:\s*'Money Garden — Modules 6A \+ 6B'/)
    expect(modules).toContain("label: 'Module 6A'")
    expect(modules).toContain("label: 'Module 6B'")
  })

  it('gives Bank, Paycheck Planet, Money Garden, and Finale real breathing room', () => {
    expect(STOP_ANGLES.bank).toBeGreaterThan(STOP_ANGLES.tax)
    expect(STOP_ANGLES.tax).toBeGreaterThan(STOP_ANGLES.garden)
    expect(STOP_ANGLES.garden).toBeGreaterThan(STOP_ANGLES.party)
    expect(distance(BANK_DISTRICT, TAX_DISTRICT)).toBeGreaterThan(17)
    expect(distance(TAX_DISTRICT, SPROUT)).toBeGreaterThan(17)
    expect(distance(SPROUT, PARTY_HOUSE)).toBeGreaterThan(30)
  })
})
