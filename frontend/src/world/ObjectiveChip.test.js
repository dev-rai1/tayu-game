import { describe, expect, it } from 'vitest'
import { shouldHideObjectiveChip } from './ObjectiveChip.jsx'

describe('ObjectiveChip Investing visibility', () => {
  it('hides while the Investing lesson hint is pinned', () => {
    expect(shouldHideObjectiveChip({ week: 5, mg: { phase: 'adjust' } })).toBe(true)
    expect(shouldHideObjectiveChip({ week: 5, mg: { phase: 'slider' } })).toBe(true)
  })

  it('remains available in other modules and Investing phases', () => {
    expect(shouldHideObjectiveChip({ week: 3, mg: null })).toBe(false)
    expect(shouldHideObjectiveChip({ week: 5, mg: { phase: 'scenario' } })).toBe(false)
    expect(shouldHideObjectiveChip({ week: 5, mg: null })).toBe(false)
  })
})
