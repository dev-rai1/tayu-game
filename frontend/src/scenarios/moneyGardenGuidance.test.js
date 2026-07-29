import { describe, expect, it } from 'vitest'
import { MONEY_GARDEN_DECISIONS, MONEY_GARDEN_PARTS, moneyGardenPart } from './moneyGardenGuidance.js'
import { OPENING, WEEKS } from './marketScenarios.js'

describe('Money Garden playtest redesign', () => {
  it('splits the ten decisions into two five-decision parts', () => {
    expect(MONEY_GARDEN_PARTS).toHaveLength(2)
    expect(MONEY_GARDEN_PARTS[0].weeks).toEqual([1, 2, 3, 4, 5])
    expect(MONEY_GARDEN_PARTS[1].weeks).toEqual([6, 7, 8, 9, 10])
    expect(moneyGardenPart(5).part).toBe(1)
    expect(moneyGardenPart(6).part).toBe(2)
  })

  it('frames every week as a clue rather than an exact trade instruction', () => {
    const forbidden = /favor the|avoid adding|sell seeds|do not buy|move enough money|buy the company/i
    for (const decision of Object.values(MONEY_GARDEN_DECISIONS)) {
      expect(decision.instruction).not.toMatch(forbidden)
      expect(decision.instruction.length).toBeLessThan(190)
    }
  })

  it('keeps opening and weekly prompts bite-sized', () => {
    expect(OPENING).toHaveLength(2)
    expect(WEEKS).toHaveLength(10)
    for (const week of WEEKS) expect(week.intro.length).toBeLessThan(190)
  })
})
