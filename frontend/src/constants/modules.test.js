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

  it('places Money Garden 5A/5B before standalone Bond Street and Tax Office destinations', () => {
    const garden = MODULE_CATALOG.find((module) => module.badge === 'garden')
    const bond = MODULE_CATALOG.find((module) => module.badge === 'bond')
    const tax = MODULE_CATALOG.find((module) => module.badge === 'tax')
    expect(garden.n).toBe(5)
    expect(garden.worldModule).toBe(5)
    expect(garden.parts.map((part) => part.label)).toEqual(['Module 5A', 'Module 5B'])
    expect(bond.n).toBe(6)
    expect(bond.title).toContain('Bond Street')
    expect(bond.underConstruction).toBe(true)
    expect(bond.desc).toMatch(/Treasury/i)
    expect(bond.desc).toMatch(/municipal/i)
    expect(bond.desc).toMatch(/corporate/i)
    expect(tax.n).toBe(7)
    expect(tax.title).toContain('TAYU Tax Office')
    expect(tax.underConstruction).toBe(true)
    expect(tax.desc).toMatch(/Tax Office/i)
    expect(tax.leadsToFinale).toBe(true)
  })
})
