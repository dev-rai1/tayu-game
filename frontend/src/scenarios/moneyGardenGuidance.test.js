import { describe, expect, it } from 'vitest'
import {
  applyStarterInvestingGift,
  MONEY_GARDEN_DECISIONS,
  MONEY_GARDEN_FLOW,
  MONEY_GARDEN_PARTS,
  MONEY_GARDEN_STARTER_GIFT,
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

  it('separates WHY from the exact action on every decision', () => {
    expect(MONEY_GARDEN_FLOW).toEqual(['1. Learn why.', '2. Do the action.', '3. Check your mix.', '4. Start the week.'])
    const exactTrade = /(buy|sell)\s+(Toy Town|Snack Shack|Game Land)/i
    for (const decision of Object.values(MONEY_GARDEN_DECISIONS)) {
      expect(decision.why.length).toBeGreaterThan(20)
      expect(decision.instruction.length).toBeGreaterThan(20)
      expect(decision.instruction).not.toMatch(exactTrade)
      expect(decision.instruction.length).toBeLessThan(190)
    }
  })

  it('makes diversification the first playable portfolio requirement', () => {
    expect(MONEY_GARDEN_DECISIONS[1].title).toMatch(/diversified/i)
    expect(MONEY_GARDEN_DECISIONS[1].why).toMatch(/zero company shares/i)
    expect(MONEY_GARDEN_DECISIONS[1].instruction).toMatch(/READY TO INVEST/)
    expect(MONEY_GARDEN_DECISIONS[1].instruction).toMatch(/2 different companies/i)
    const oneCompany = { companies: { toy: { owned: 1 }, snack: { owned: 0 }, game: { owned: 0 } } }
    const twoCompanies = { companies: { toy: { owned: 1 }, snack: { owned: 1 }, game: { owned: 0 } } }
    expect(WEEKS[0].judge(oneCompany)).toBe(false)
    expect(WEEKS[0].judge(twoCompanies)).toBe(true)
  })

  it('explains the three money locations before the first decision', () => {
    expect(OPENING).toHaveLength(3)
    expect(OPENING.join(' ')).toMatch(/zero company shares/i)
    expect(OPENING.join(' ')).toMatch(/READY TO INVEST/)
    expect(OPENING.join(' ')).toMatch(/Pocket/)
    expect(OPENING.join(' ')).toMatch(/Bank Sprout/)
    for (const line of OPENING) expect(line.length).toBeLessThan(120)
    expect(WEEKS).toHaveLength(10)
    for (const week of WEEKS) expect(week.intro.length).toBeLessThan(190)
  })
})
