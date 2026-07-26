import { describe, expect, it } from 'vitest'
import { BUNDLES } from '../scenarios/lemonade.js'
import { initCompanies, weeklyMarketUpdate } from '../scenarios/moneyGarden.js'
import { JARS } from './config.js'

describe('tester feedback regressions', () => {
  it('keeps every lemonade bundle explicit about all required ingredients', () => {
    for (const bundle of BUNDLES) {
      expect(bundle.ingredients).toEqual(['cups', 'lemons', 'sugar', 'water', 'table'])
    }
  })

  it('creates a fresh comparative market update every week', () => {
    const before = initCompanies()
    const after = {
      ...before,
      toy: { ...before.toy, price: 7 },
      snack: { ...before.snack, price: 3 },
    }
    expect(weeklyMarketUpdate(before, after)).toContain('Toy Town rose from $5 to $7')
    expect(weeklyMarketUpdate(before, after)).toContain('Snack Shack fell from $4 to $3')
    expect(weeklyMarketUpdate(before, after)).toContain('Game Land held at $6')
  })

  it('leaves readable separation between all three jars', () => {
    expect(JARS.save[0] - JARS.spend[0]).toBeGreaterThan(1.7)
    expect(JARS.give[0] - JARS.save[0]).toBeGreaterThan(1.7)
  })
})
