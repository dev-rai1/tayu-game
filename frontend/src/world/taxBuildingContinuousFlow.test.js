import { describe, expect, it, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { useTaxLab } from './taxLabStore.js'
import { TAX_CASES } from '../scenarios/paycheckPlanet.js'
import { taxStationForStep } from './taxDistrictLayout.js'

const paycheckWorld = fs.readFileSync(path.resolve('src/world/PaycheckPlanetWorld.jsx'), 'utf8')

describe('Tax Center building and continuous flow', () => {
  beforeEach(() => useTaxLab.getState().reset())

  it('renders a walk-in Tax Center shell around the Module 6 activity', () => {
    expect(paycheckWorld).toContain('function TaxCenterBuilding')
    expect(paycheckWorld).toContain('<TaxCenterBuilding active={active} />')
    expect(paycheckWorld).toContain('wide, obvious walk-through entrance')
    expect(paycheckWorld).toContain('Interior service counter behind Maya')
  })

  it('returns to the Tax Office after a taxpayer case is accepted', () => {
    const taxCase = TAX_CASES[0]
    useTaxLab.getState().chooseCase(taxCase)
    const state = useTaxLab.getState()
    expect(state.phase).toBe('steps')
    expect(state.stepNumber).toBe(1)
    expect(state.panel).toBeNull()
    expect(state.worldNotice).toContain(taxStationForStep(1).label)
  })

  it('returns to the building between stations so the next station can animate in-world', () => {
    useTaxLab.getState().chooseCase(TAX_CASES[0])
    for (let step = 1; step < 6; step += 1) {
      expect(useTaxLab.getState().panel).toBeNull()
      expect(useTaxLab.getState().openStation(step)).toBe(true)
      expect(useTaxLab.getState().panel).toBe(taxStationForStep(step).key)
      useTaxLab.getState().advanceStep()
      expect(useTaxLab.getState().stepNumber).toBe(step + 1)
      expect(useTaxLab.getState().panel).toBeNull()
      expect(useTaxLab.getState().worldNotice).toContain(taxStationForStep(step + 1).label)
    }
  })
})
