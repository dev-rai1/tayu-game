import { describe, expect, it } from 'vitest'
import { BUNDLES } from '../scenarios/lemonade.js'
import { JAR_SCENARIOS, checkAllocation } from '../scenarios/jarScenario.js'
import { DAY_LESSON } from '../scenarios/storeMission.js'
import { JARS } from './config.js'

describe('tester feedback regressions', () => {
  it('lists every lemonade ingredient', () => {
    for (const bundle of BUNDLES) expect(bundle.ingredients).toEqual(['cups', 'lemons', 'sugar', 'water', 'table'])
  })

  it('spaces jars apart', () => {
    expect(JARS.save[0] - JARS.spend[0]).toBeGreaterThan(1.7)
    expect(JARS.give[0] - JARS.save[0]).toBeGreaterThan(1.7)
  })

  it('keeps jar introductions bite-sized', () => {
    for (const scenario of JAR_SCENARIOS) expect(scenario.intro.length).toBeLessThanOrEqual(2)
  })

  it('uses directional jar clues instead of revealing exact retry amounts', () => {
    for (const scenario of JAR_SCENARIOS) {
      for (const hint of Object.values(scenario.hints)) {
        expect(hint).not.toMatch(/try (about )?\$\d+/i)
        expect(hint.length).toBeLessThan(180)
      }
    }
  })

  it('accepts more than one complete birthday plan', () => {
    const scenario = JAR_SCENARIOS[0]
    expect(checkAllocation({ spend: 10, save: 10, give: 10 }, scenario).ok).toBe(true)
    expect(checkAllocation({ spend: 8, save: 14, give: 8 }, scenario).ok).toBe(true)
    expect(checkAllocation({ spend: 12, save: 12, give: 6 }, scenario).ok).toBe(true)
    expect(checkAllocation({ spend: 30, save: 0, give: 0 }, scenario).ok).toBe(false)
  })

  it('judges later jar stories by their financial goal', () => {
    const rainyDay = JAR_SCENARIOS[1]
    const bigWant = JAR_SCENARIOS[2]

    expect(checkAllocation({ spend: 7, save: 16, give: 7 }, rainyDay).ok).toBe(true)
    expect(checkAllocation({ spend: 12, save: 10, give: 8 }, rainyDay).ok).toBe(false)
    expect(checkAllocation({ spend: 5, save: 20, give: 5 }, bigWant).ok).toBe(true)
    expect(checkAllocation({ spend: 10, save: 10, give: 10 }, bigWant).ok).toBe(false)
  })

  it('keeps market consequence cards concise', () => {
    for (const lesson of Object.values(DAY_LESSON)) expect(lesson.length).toBeLessThan(140)
  })
})
