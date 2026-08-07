import { describe, expect, it } from 'vitest'
import {
  coachVisibility,
  isBlockingGameOverlay,
  isCommerceOverlayActive,
  isSpecializedCoachActive,
} from './overlayVisibility.js'

describe('overlay visibility', () => {
  it('treats decision panels and lesson cards as blocking overlays', () => {
    expect(isBlockingGameOverlay({ cards: [{ id: 'choice' }] })).toBe(true)
    expect(isBlockingGameOverlay({ lessons: [{ id: 'lesson' }] })).toBe(true)
    expect(isBlockingGameOverlay({ panelPortfolio: true })).toBe(true)
    expect(isBlockingGameOverlay({ cards: [], lessons: [] })).toBe(false)
  })

  it('keeps the shared guidance rail available during commerce gameplay', () => {
    expect(isCommerceOverlayActive({
      week: 1,
      objective: 'store',
      bramTalked: true,
      storeMissionDone: false,
    })).toBe(false)

    expect(isCommerceOverlayActive({
      week: 2,
      objective: 'lemonade',
      lemPhase: 'template',
    })).toBe(false)

    expect(isCommerceOverlayActive({
      week: 2,
      objective: 'lemonade',
      lemPhase: 'selling',
    })).toBe(false)
  })

  it('reserves Money Garden decisions for the specialized coach', () => {
    const state = { week: 5, mg: { phase: 'adjust', week: 6 } }
    expect(isSpecializedCoachActive(state)).toBe(true)
    expect(coachVisibility(state).showGuidance).toBe(false)
    expect(coachVisibility(state).showSavedMessage).toBe(false)
  })

  it('shows the persistent coach unless a blocking read or specialized coach owns the rail', () => {
    expect(coachVisibility({ week: 3, objective: 'house' }).showGuidance).toBe(true)
    expect(coachVisibility({ dialog: { name: 'Penny' } }).showGuidance).toBe(false)
    expect(coachVisibility({ week: 2, objective: 'lemonade', lemPhase: 'supplies' }).showSavedMessage).toBe(true)
    expect(coachVisibility({ week: 2, objective: 'lemonade', lemPhase: 'selling' }).showGuidance).toBe(true)
  })
})
