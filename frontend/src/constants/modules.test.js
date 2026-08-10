import { describe, expect, it } from 'vitest'
import { EDUCATOR_GRADE_BANDS, MODULE_CATALOG } from './modules.js'

describe('module grade-level catalog', () => {
  it('assigns a grade range and expected time to every playable module', () => {
    expect(MODULE_CATALOG).toHaveLength(6)
    MODULE_CATALOG.forEach((module) => {
      expect(module.grades).toMatch(/^Grades /)
      expect(module.minutes).toBeTruthy()
    })
  })

  it('keeps foundational modules in the older-student pathways', () => {
    const bands = Object.fromEntries(EDUCATOR_GRADE_BANDS.map((band) => [band.title, band]))
    expect(bands['Elementary School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3])
    expect(bands['Middle School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3, 4, 5, 6])
    expect(bands['High School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3, 4, 5, 6])
    expect(bands['High School'].plannedModules).toContain('College costs and financial aid')
    expect(bands['High School'].plannedModules).not.toContain('Tax filing')
  })

  it('places Money Garden 5A/5B before the Module 6 Tax Filing Lab', () => {
    const tax = MODULE_CATALOG.find((module) => module.badge === 'tax')
    const garden = MODULE_CATALOG.find((module) => module.badge === 'garden')
    expect(garden.n).toBe(5)
    expect(garden.worldModule).toBe(5)
    expect(garden.minutes).toContain('Two')
    expect(garden.parts.map((part) => part.label)).toEqual(['Module 5A', 'Module 5B'])
    expect(tax.n).toBe(6)
    expect(tax.route).toBeUndefined()
    expect(tax.title).toContain('Tax Filing Lab')
    expect(tax.desc).toContain('practice tax return')
    expect(tax.desc).toContain('W-2')
  })
})
