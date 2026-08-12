import { describe, expect, it } from 'vitest'
import {
  applyStarterInvestingGift,
  BOND_MEADOW,
  MONEY_GARDEN_DECISIONS,
  MONEY_GARDEN_FLOW,
  MONEY_GARDEN_PARTS,
  MONEY_GARDEN_STARTER_GIFT,
  STOCK_BOND_COMPARE,
  moneyGardenClues,
  moneyGardenPart,
  shouldPauseBetweenGardenParts,
} from './moneyGardenGuidance.js'
import { OPENING, WEEKS } from './marketScenarios.js'

describe('Money Garden consolidated flow', () => {
  it('splits the investing finale into clear Module 6A and Module 6B parts', () => {
    expect(MONEY_GARDEN_PARTS).toHaveLength(2)
    expect(MONEY_GARDEN_PARTS[0].moduleLabel).toBe('Module 6A')
    expect(MONEY_GARDEN_PARTS[1].moduleLabel).toBe('Module 6B')
    expect(MONEY_GARDEN_PARTS[0].weeks).toEqual([1, 2, 3, 4, 5])
    expect(MONEY_GARDEN_PARTS[1].weeks).toEqual([6, 7, 8, 9, 10])
    expect(moneyGardenPart(5).part).toBe(1)
    expect(moneyGardenPart(6).part).toBe(2)
  })

  it('pauses once at the 6A/6B divider and resumes from saved state', () => {
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

  it('separates the reason from the action without prescribing an exact company trade', () => {
    expect(MONEY_GARDEN_FLOW).toEqual([
      '1. Read one clue.',
      '2. Make one evidence-based change.',
      '3. Test your choice, then see the lesson.',
    ])
    const exactTrade = /(buy|sell)\s+(Toy Town|Snack Shack|Game Land)/i
    for (const decision of Object.values(MONEY_GARDEN_DECISIONS)) {
      expect(decision.why.length).toBeGreaterThan(20)
      expect(decision.instruction.length).toBeGreaterThan(20)
      expect(decision.instruction).not.toMatch(exactTrade)
      expect(decision.instruction.length).toBeLessThan(260)
    }
  })

  it('turns busy and empty storefront evidence into separate readable clues before the bond comparison', () => {
    const clues = moneyGardenClues(4, { fx: { busy: 'game', dusty: 'snack' } })
    expect(clues[0]).toBe('Game Land is PACKED — lots of customers are showing up.')
    expect(clues[1]).toBe('Snack Shack is EMPTY — very few customers are showing up.')
    expect(clues[2]).toBe(STOCK_BOND_COMPARE.stock)
    expect(clues[3]).toBe(STOCK_BOND_COMPARE.bond)
  })

  it('adds Treasury, muni, and corporate bond comparisons without replacing stock play', () => {
    expect(Object.keys(BOND_MEADOW)).toEqual(['treasury', 'muni', 'corporate'])
    expect(BOND_MEADOW.treasury.safety).toBeGreaterThanOrEqual(BOND_MEADOW.corporate.safety)
    expect(BOND_MEADOW.muni.line).toMatch(/tax/i)
    expect(MONEY_GARDEN_DECISIONS[7].why).toMatch(/bondholder/i)
    expect(MONEY_GARDEN_DECISIONS[9].why).toMatch(/interest rates/i)
  })

  it('keeps evidence clues short enough to show one at a time', () => {
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
      for (const clue of clues) expect(clue.length).toBeLessThan(180)
    }
  })

  it('explains the three money locations before the first decision', () => {
    expect(OPENING).toHaveLength(3)
    expect(OPENING.join(' ')).toMatch(/zero company shares/i)
    expect(OPENING.join(' ')).toMatch(/READY TO INVEST/)
    expect(OPENING.join(' ')).toMatch(/Pocket/)
    expect(OPENING.join(' ')).toMatch(/Bank Sprout/)
    expect(WEEKS).toHaveLength(10)
    for (const line of OPENING) expect(line.length).toBeLessThan(240)
    for (const week of WEEKS) expect(week.intro.length).toBeLessThan(260)
  })
})
