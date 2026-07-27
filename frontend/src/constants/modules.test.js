import { describe, expect, it } from 'vitest'
import { EDUCATOR_GRADE_BANDS, MODULE_CATALOG } from './modules.js'

describe('module grade-level catalog', () => {
  it('assigns a grade range to every playable module', () => {
    expect(MODULE_CATALOG).toHaveLength(5)
    MODULE_CATALOG.forEach((module) => expect(module.grades).toMatch(/^Grades /))
  })

  it('gives each educator grade band its respective modules', () => {
    const bands = Object.fromEntries(EDUCATOR_GRADE_BANDS.map((band) => [band.title, band]))

    expect(bands['Elementary School']).toBeDefined()
    expect(bands['Middle School']).toBeDefined()
    expect(bands['High School']).toBeDefined()

    expect(bands['Elementary School'].currentModules.map((module) => module.n)).toEqual([1, 2, 3])
    expect(bands['Middle School'].currentModules.map((module) => module.n)).toEqual([3, 4, 5])
    expect(bands['High School'].currentModules.map((module) => module.n)).toEqual([5])
    expect(bands['High School'].plannedModules).toContain('College costs and financial aid')
  })
})
