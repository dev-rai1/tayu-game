import { describe, expect, it } from 'vitest'
import { EDUCATOR_GRADE_BANDS, MODULE_CATALOG } from './modules.js'

describe('module grade-level catalog', () => {
  it('assigns a grade range and expected time to every playable module', () => {
    expect(MODULE_CATALOG).toHaveLength(5)
    MODULE_CATALOG.forEach((module) => {
      expect(module.grades).toMatch(/^Grades /)
      expect(module.minutes).toBeTruthy()
    })
  })

  it('keeps foundational modules in the older-student pathways', () => {
    const bands = Object.fromEntries(EDUCATOR_GRADE_BANDS.map((band) => [band.title, band]))

    expect(bands['Elementary School']).toBeDefined()
    expect(bands['Middle School']).toBeDefined()
    expect(bands['High School']).toBeDefined()

    expect(bands['Elementary School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3])
    expect(bands['Middle School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3, 4, 5])
    expect(bands['High School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3, 4, 5])
    expect(bands['High School'].plannedModules).toContain('College costs and financial aid')
  })

  it('describes the Money Garden as two shorter parts', () => {
    const garden = MODULE_CATALOG.find((module) => module.n === 5)
    expect(garden.minutes).toContain('Two')
    expect(garden.desc).toContain('Part 1')
    expect(garden.desc).toContain('Part 2')
  })
})
