import { describe, expect, it } from 'vitest'
import { shouldShowInteractionPrompt } from './interactionPrompt.js'

describe('shouldShowInteractionPrompt', () => {
  it('shows the prompt for required gameplay interactions', () => {
    expect(shouldShowInteractionPrompt({ id: 'mailbox' })).toBe(true)
    expect(shouldShowInteractionPrompt({ id: 'shopkeeper' })).toBe(true)
    expect(shouldShowInteractionPrompt({ id: 'host:penny' })).toBe(true)
    expect(shouldShowInteractionPrompt({ id: 'item:apple' })).toBe(true)
  })

  it('does not show the prompt for optional random NPC conversations', () => {
    expect(shouldShowInteractionPrompt({ id: 'npc:park-friend' })).toBe(false)
    expect(shouldShowInteractionPrompt({ id: 'npc:ambient-1' })).toBe(false)
  })

  it('does not show a prompt when nothing is nearby', () => {
    expect(shouldShowInteractionPrompt(null)).toBe(false)
  })
})
