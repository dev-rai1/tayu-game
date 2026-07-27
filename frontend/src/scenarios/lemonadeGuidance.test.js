import { describe, expect, it } from 'vitest'
import {
  BUNDLES, EVENTS, QUALITY, SIGNS,
  analyzeLemonadeResult, estimateDemandSignal, findProfitablePlan,
  nextEventFor, nextTip, recommendedStarterPrice, rollEvent, simulateSales,
} from './lemonade.js'

const normal = EVENTS.find((event) => event.id === 'normal')

function baseLevers(price) {
  return {
    price,
    hours: 4,
    bundle: BUNDLES[1],
    quality: QUALITY[0],
    sign: SIGNS[0],
    wageRate: 1,
  }
}

describe('lemonade supply, demand, and pinned profit guidance', () => {
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
      event: normal,
    })
    const costPerCup = (bundle.cost + 4) / bundle.cups
    expect(price).toBeGreaterThan(costPerCup)
    expect(price).toBeGreaterThanOrEqual(0.25)
    expect(price).toBeLessThanOrEqual(3)
  })

  it('finds an affordable combination that produces positive projected profit', () => {
    const plan = findProfitablePlan(0, normal, 10)
    expect(plan.upfront).toBeLessThanOrEqual(10)
    expect(plan.sim.keep).toBeGreaterThan(0)
    expect(plan.price).toBeGreaterThanOrEqual(0.25)
    expect(plan.price).toBeLessThanOrEqual(3)
  })

  it('makes lowering an overly high price the primary exact correction', () => {
    const levers = baseLevers(3)
    const sim = simulateSales(levers, normal)
    const feedback = analyzeLemonadeResult(sim, levers, normal, 0, 12)

    expect(feedback.action.toLowerCase()).toContain('lower the price')
    expect(feedback.action).toContain(feedback.plan.price.toFixed(2))
    expect(feedback.diagnosis.toLowerCase()).toContain('you lost')
    expect(feedback.plan.sim.keep).toBeGreaterThan(0)
  })

  it('makes raising an overly low price the primary exact correction', () => {
    const levers = baseLevers(0.25)
    const sim = simulateSales(levers, normal)
    const feedback = analyzeLemonadeResult(sim, levers, normal, 0, 12)

    expect(feedback.action.toLowerCase()).toContain('raise the price')
    expect(feedback.goal.toLowerCase()).toContain('projected result')
    expect(feedback.plan.sim.keep).toBeGreaterThan(0)
  })

  it('previews the exact feature and Town News that afterRound will unlock', () => {
    const expected = nextEventFor(normal.id)
    const rolled = rollEvent(true, normal.id)
    const levers = baseLevers(3)
    const sim = simulateSales(levers, normal)
    // Two features are live; the existing game unlocks Town News next.
    const tip = nextTip(sim, levers, normal, 2, [])

    expect(tip.nextFeatures).toBe(3)
    expect(rolled.id).toBe(expected.id)
    expect(tip.targetEvent.id).toBe(rolled.id)
    expect(tip.text).toContain('NEXT ROUND UNLOCK: EVENTS')
    expect(tip.text).toContain("NEXT WEEK'S TOWN NEWS")
    expect(tip.plan.sim.keep).toBeGreaterThan(0)
  })

  it('keeps the existing nextTip API while returning structured next-round guidance', () => {
    const levers = baseLevers(3)
    const sim = simulateSales(levers, normal)
    const tip = nextTip(sim, levers, normal, 0, [])

    expect(tip.text).toContain('NEXT MOVE')
    expect(tip.diagnosis.length).toBeGreaterThan(20)
    expect(tip.action.length).toBeGreaterThan(20)
    expect(tip.goal).toContain('Projected result')
    expect(tip.plan.sim.keep).toBeGreaterThan(0)
  })
})
