import { describe, expect, it } from 'vitest'
import { shouldHideObjectiveChip } from './ObjectiveChip.jsx'

describe('ObjectiveChip contextual visibility', () => {
  it('stays visible while the player is traveling so wayfinding is available', () => {
    expect(shouldHideObjectiveChip({ week: 3, near: null, mg: null })).toBe(false)
    expect(shouldHideObjectiveChip({ week: 5, near: null, mg: { phase: 'scenario' } })).toBe(false)
  })

  it('hides while the Investing lesson hint owns the screen', () => {
    expect(shouldHideObjectiveChip({ week: 5, near: { label: 'Invest' }, mg: { phase: 'adjust' } })).toBe(true)
    expect(shouldHideObjectiveChip({ week: 5, near: { label: 'Invest' }, mg: { phase: 'slider' } })).toBe(true)
  })

  it('appears only when an interaction is relevant and no specialized hint is active', () => {
    expect(shouldHideObjectiveChip({ week: 3, near: { label: 'Talk' }, mg: null })).toBe(false)
    expect(shouldHideObjectiveChip({ week: 5, near: { label: 'Start week' }, mg: { phase: 'scenario' } })).toBe(false)
  })
})
