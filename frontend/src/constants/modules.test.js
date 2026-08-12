import { describe, expect, it } from 'vitest'
import { EDUCATOR_GRADE_BANDS, MODULE_CATALOG } from './modules.js'

describe('module grade-level catalog', () => {
  it('assigns a grade range and expected time to every playable module', () => {
    expect(MODULE_CATALOG).toHaveLength(7)
    MODULE_CATALOG.forEach((module) => {
      expect(module.grades).toMatch(/^Grades /)
      expect(module.minutes).toBeTruthy()
    })
  })

  it('keeps foundational modules in the older-student pathways', () => {
    const bands = Object.fromEntries(EDUCATOR_GRADE_BANDS.map((band) => [band.title, band]))
    expect(bands['Elementary School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3])
    expect(bands['Middle School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(bands['High School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(bands['High School'].plannedModules).toContain('College costs and financial aid')
    expect(bands['High School'].plannedModules).not.toContain('Tax filing')
  })

  it('places Money Garden before Bond Street before the Module 7 Tax Office', () => {
    const tax = MODULE_CATALOG.find((module) => module.badge === 'tax')
    const bond = MODULE_CATALOG.find((module) => module.badge === 'bond')
    const garden = MODULE_CATALOG.find((module) => module.badge === 'garden')
    expect(garden.n).toBe(5)
    expect(garden.worldModule).toBe(5)
    expect(garden.parts.map((part) => part.label)).toEqual(['Module 5A', 'Module 5B'])
    expect(bond.n).toBe(6)
    expect(bond.title).toContain('Bond Street')
    expect(bond.desc).toMatch(/Treasury|municipal|corporate/i)
    expect(tax.n).toBe(7)
    expect(tax.title).toContain('Tax Office')
    expect(tax.desc).toContain('practice tax return')
    expect(tax.desc).toContain('withholding')
  })
})
