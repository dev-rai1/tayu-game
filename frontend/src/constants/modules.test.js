import { describe, expect, it } from 'vitest'
import { EDUCATOR_GRADE_BANDS, MODULE_CATALOG } from './modules.js'

describe('module grade-level catalog', () => {
  it('assigns a grade range to every playable module', () => {
    expect(MODULE_CATALOG).toHaveLength(5)
    MODULE_CATALOG.forEach((module) => expect(module.grades).toMatch(/^Grades /))
  })

  it('gives each educator grade band its respective modules', () => {
    const elementary = EDUCATOR_GRADE_BANDS.find((band) => band.title === 'Elementary')
    const middle = EDUCATOR_GRADE_BANDS.find((band) => band.title === 'Middle School')
    const high = EDUCATOR_GRADE_BANDS.find((band) => band.title === 'High School')

    expect(elementary.currentModules.map((module) => module.n)).toEqual([1, 2, 3, 4, 5])
    expect(middle.currentModules.map((module) => module.n)).toEqual([4, 5])
    expect(high.currentModules).toEqual([])
    expect(high.plannedModules).toContain('College Costs')
  })
})
