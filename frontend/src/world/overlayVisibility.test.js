import { describe, expect, it } from 'vitest'
import { coachVisibility, isBlockingGameOverlay, isCommerceOverlayActive } from './overlayVisibility.js'

describe('overlay visibility', () => {
  it('treats decision panels and lesson cards as blocking overlays', () => {
    expect(isBlockingGameOverlay({ cards: [{ id: 'choice' }] })).toBe(true)
    expect(isBlockingGameOverlay({ lessons: [{ id: 'lesson' }] })).toBe(true)
    expect(isBlockingGameOverlay({ panelPortfolio: true })).toBe(true)
    expect(isBlockingGameOverlay({ cards: [], lessons: [] })).toBe(false)
  })

  it('detects the market and lemonade helper sheets', () => {
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
  })

  it('shows the persistent coach only when the play area is clear', () => {
    expect(coachVisibility({ week: 3, objective: 'house' }).showGuidance).toBe(true)
    expect(coachVisibility({ dialog: { name: 'Penny' } }).showGuidance).toBe(false)
    expect(coachVisibility({ week: 2, objective: 'lemonade', lemPhase: 'supplies' }).showSavedMessage).toBe(false)
  })
})
