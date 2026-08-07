import { describe, expect, it } from 'vitest'
import {
  coachVisibility,
  isBlockingGameOverlay,
  isCommerceOverlayActive,
  isSpecializedCoachActive,
} from './overlayVisibility.js'

describe('overlay visibility', () => {
  it('blocks only true story/choice overlays, not module workspaces', () => {
    expect(isBlockingGameOverlay({ cards: [{ id: 'choice' }] })).toBe(true)
    expect(isBlockingGameOverlay({ dialog: { name: 'Penny' } })).toBe(true)
    expect(isBlockingGameOverlay({ lessons: [{ id: 'lesson' }] })).toBe(false)
    expect(isBlockingGameOverlay({ panelPortfolio: true })).toBe(false)
    expect(isBlockingGameOverlay({ panelJar: 'save' })).toBe(false)
    expect(isBlockingGameOverlay({ cards: [], lessons: [] })).toBe(false)
  })

  it('still detects market and Lemonade activity phases', () => {
    expect(isCommerceOverlayActive({
      week: 1,
      objective: 'store',
      bramTalked: true,
      storeMissionDone: false,
      cards: [],
      lessons: [],
    })).toBe(true)

    expect(isCommerceOverlayActive({
      week: 2,
      objective: 'lemonade',
      lemPhase: 'template',
    })).toBe(true)

    expect(isCommerceOverlayActive({
      week: 2,
      objective: 'lemonade',
      lemPhase: 'selling',
    })).toBe(true)
  })

  it('lets the shared coach own Money Garden decision guidance', () => {
    const state = { week: 5, mg: { phase: 'adjust', week: 6 } }
    expect(isSpecializedCoachActive(state)).toBe(true)
    expect(coachVisibility(state).showGuidance).toBe(true)
    expect(coachVisibility(state).showSavedMessage).toBe(true)
  })

  it('keeps guidance beside commerce and module controls', () => {
    expect(coachVisibility({ week: 3, objective: 'house' }).showGuidance).toBe(true)
    expect(coachVisibility({ dialog: { name: 'Penny' } }).showGuidance).toBe(false)
    expect(coachVisibility({ week: 2, objective: 'lemonade', lemPhase: 'supplies' }).showSavedMessage).toBe(true)
    expect(coachVisibility({ week: 2, objective: 'lemonade', lemPhase: 'selling' }).showGuidance).toBe(true)
  })
})
