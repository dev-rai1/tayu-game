import { describe, expect, it } from 'vitest'
import {
  applyStarterInvestingGift,
  MONEY_GARDEN_DECISIONS,
  MONEY_GARDEN_PARTS,
  MONEY_GARDEN_STARTER_GIFT,
  moneyGardenClues,
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

  it('gives enough starter money to experiment without double-gifting', () => {
    const original = { cash: 8, startTotal: 8, goal: 20 }
    const gifted = applyStarterInvestingGift(original)
    expect(MONEY_GARDEN_STARTER_GIFT).toBe(100)
    expect(gifted.cash).toBe(108)
    expect(gifted.startTotal).toBe(108)
    expect(gifted.goal).toBe(120)
    expect(gifted.starterGiftApplied).toBe(true)
    expect(applyStarterInvestingGift(gifted)).toBe(gifted)
    expect(OPENING.join(' ')).toContain('$100 investing gift')
  })

  it('frames every week as a clue rather than an exact trade instruction', () => {
    const forbidden = /favor the|avoid adding|sell seeds|do not buy|move enough money|buy the company/i
    for (const decision of Object.values(MONEY_GARDEN_DECISIONS)) {
      expect(decision.instruction).not.toMatch(forbidden)
      expect(decision.instruction.length).toBeLessThan(190)
    }
  })

  it('turns busy and empty storefront evidence into separate readable clues', () => {
    const clues = moneyGardenClues(4, { fx: { busy: 'game', dusty: 'snack' } })
    expect(clues).toEqual([
      'Game Land is PACKED — lots of customers are showing up.',
      'Snack Shack is EMPTY — very few customers are showing up.',
    ])
  })

  it('keeps each evidence clue short enough to show one at a time', () => {
    const sample = {
      pocket: 6,
      fx: { rain: 'toy', dip: 'game', busy: 'game', dusty: 'snack', sale: 'toy', sale2: 'snack', shabby: 'snack', balloon: 'game', star: 'toy' },
      companies: {
        toy: { owned: 2, price: 6 },
        snack: { owned: 1, price: 5 },
        game: { owned: 1, price: 4 },
      },
    }

    for (let week = 1; week <= 10; week += 1) {
      const clues = moneyGardenClues(week, sample)
      expect(clues.length).toBeGreaterThan(0)
      for (const clue of clues) expect(clue.length).toBeLessThan(140)
    }
  })

  it('keeps the existing three-card opening and weekly prompts bite-sized', () => {
    expect(OPENING).toHaveLength(3)
    for (const line of OPENING) expect(line.length).toBeLessThan(120)
    expect(WEEKS).toHaveLength(10)
    for (const week of WEEKS) expect(week.intro.length).toBeLessThan(190)
  })
})
