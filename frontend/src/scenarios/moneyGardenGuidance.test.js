import { describe, expect, it } from 'vitest'
import {
  MONEY_GARDEN_DECISIONS,
  MONEY_GARDEN_PARTS,
  moneyGardenPart,
  shouldPauseBetweenGardenParts,
} from './moneyGardenGuidance.js'
import { OPENING, WEEKS } from './marketScenarios.js'

describe('Money Garden playtest redesign', () => {
  it('splits the ten decisions into two five-decision parts', () => {
    expect(MONEY_GARDEN_PARTS).toHaveLength(2)
    expect(MONEY_GARDEN_PARTS[0].weeks).toEqual([1, 2, 3, 4, 5])
    expect(MONEY_GARDEN_PARTS[1].weeks).toEqual([6, 7, 8, 9, 10])
    expect(moneyGardenPart(5).part).toBe(1)
    expect(moneyGardenPart(6).part).toBe(2)
  })

  it('pauses once at the Part 1 save point and resumes from saved state', () => {
    expect(shouldPauseBetweenGardenParts(5, false)).toBe(false)
    expect(shouldPauseBetweenGardenParts(6, false)).toBe(true)
    expect(shouldPauseBetweenGardenParts(6, true)).toBe(false)
    expect(shouldPauseBetweenGardenParts(7, false)).toBe(false)
  })

  it('frames every week as a clue rather than an exact trade instruction', () => {
    const forbidden = /favor the|avoid adding|sell seeds|do not buy|move enough money|buy the company/i
    for (const decision of Object.values(MONEY_GARDEN_DECISIONS)) {
      expect(decision.instruction).not.toMatch(forbidden)
      expect(decision.instruction.length).toBeLessThan(190)
    }
  })

  it('keeps the existing three-card opening and weekly prompts bite-sized', () => {
    expect(OPENING).toHaveLength(3)
    for (const line of OPENING) expect(line.length).toBeLessThan(120)
    expect(WEEKS).toHaveLength(10)
    for (const week of WEEKS) expect(week.intro.length).toBeLessThan(190)
  })
})
