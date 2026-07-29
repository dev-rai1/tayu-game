import { describe, expect, it } from 'vitest'
import { BUNDLES } from '../scenarios/lemonade.js'
import { JAR_SCENARIOS } from '../scenarios/jarScenario.js'
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

  it('keeps market consequence cards concise', () => {
    for (const lesson of Object.values(DAY_LESSON)) expect(lesson.length).toBeLessThan(140)
  })
})
