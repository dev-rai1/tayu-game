import { describe, expect, it } from 'vitest'
import { BUNDLES } from '../scenarios/lemonade.js'
import { initCompanies, weeklyMarketUpdate } from '../scenarios/moneyGarden.js'
import { JARS } from './config.js'
describe('tester feedback regressions', () => {
  it('lists every lemonade ingredient', () => { for (const b of BUNDLES) expect(b.ingredients).toEqual(['cups','lemons','sugar','water','table']) })
  it('reports weekly price changes', () => {
    const before=initCompanies(), after={...before,toy:{...before.toy,price:7},snack:{...before.snack,price:3}}
    const update=weeklyMarketUpdate(before,after)
    expect(update).toContain('Toy Town rose from $5 to $7')
    expect(update).toContain('Snack Shack fell from $4 to $3')
    expect(update).toContain('Game Land held at $6')
  })
  it('spaces jars apart', () => {
    expect(JARS.save[0]-JARS.spend[0]).toBeGreaterThan(1.7)
    expect(JARS.give[0]-JARS.save[0]).toBeGreaterThan(1.7)
  })
})
