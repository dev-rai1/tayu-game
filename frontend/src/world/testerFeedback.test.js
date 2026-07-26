import { describe, expect, it } from 'vitest'
import { BUNDLES } from '../scenarios/lemonade.js'
import { JARS } from './config.js'

describe('tester feedback regressions', () => {
  it('lists every lemonade ingredient', () => {
    for (const bundle of BUNDLES) expect(bundle.ingredients).toEqual(['cups', 'lemons', 'sugar', 'water', 'table'])
  })

  it('spaces jars apart', () => {
    expect(JARS.save[0] - JARS.spend[0]).toBeGreaterThan(1.7)
    expect(JARS.give[0] - JARS.save[0]).toBeGreaterThan(1.7)
  })
})
