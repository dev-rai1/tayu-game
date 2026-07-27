import { describe, expect, it } from 'vitest'
import {
  BUNDLES, EVENTS, QUALITY, SIGNS,
  estimateDemandSignal, recommendedStarterPrice, simulateSales, nextTip,
} from './lemonade.js'

describe('lemonade supply and demand guidance', () => {
  it('uses kid-friendly batch names instead of Mega', () => {
    expect(BUNDLES.some((bundle) => bundle.label === 'Mega')).toBe(false)
    expect(BUNDLES.at(-1).label).toBe('Festival Batch')
  })

  it('shows stronger demand for a fair than a rainy day', () => {
    const rainy = estimateDemandSignal(4, EVENTS.find((event) => event.id === 'rain'), SIGNS[0])
    const fair = estimateDemandSignal(4, EVENTS.find((event) => event.id === 'fair'), SIGNS[0])
    expect(fair.potential).toBeGreaterThan(rainy.potential)
    expect(['High', 'Very high']).toContain(fair.label)
  })

  it('recommends a price above cost per cup but inside the game range', () => {
    const bundle = BUNDLES[1]
    const price = recommendedStarterPrice({
      bundle,
      hours: 4,
      quality: QUALITY[0],
      sign: SIGNS[0],
      wageRate: 1,
      event: EVENTS[0],
    })
    const costPerCup = (bundle.cost + 4) / bundle.cups
    expect(price).toBeGreaterThan(costPerCup)
    expect(price).toBeGreaterThanOrEqual(0.25)
    expect(price).toBeLessThanOrEqual(3)
  })

  it('tells the player to lower an overly high price and keep other choices steady', () => {
    const levers = {
      price: 3,
      hours: 4,
      bundle: BUNDLES[1],
      quality: QUALITY[0],
      sign: SIGNS[0],
      wageRate: 1,
    }
    const sim = simulateSales(levers, EVENTS[0])
    const tip = nextTip(sim, levers, EVENTS[0], 0, [])
    expect(tip.text.toLowerCase()).toContain('lower')
    expect(tip.text.toLowerCase()).toContain('keep supply and hours the same')
  })
})
