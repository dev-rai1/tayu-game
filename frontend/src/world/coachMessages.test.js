import { describe, expect, it } from 'vitest'
import { coachMessageFromTransient, coachMessageSignature } from './coachMessages.js'

describe('shared coach messages', () => {
  it('turns NPC captions into one-line coach dialogue', () => {
    expect(coachMessageFromTransient('actor', { actor: 'bram', text: 'Check the basket first.' })).toMatchObject({
      kind: 'actor',
      label: 'Mr. Bram says',
      title: 'Mr. Bram',
      action: 'Check the basket first.',
    })
  })

  it('normalizes lessons, guides, feedback, and banners into the same shape', () => {
    expect(coachMessageFromTransient('lesson', { text: 'Saving keeps money for later.' })).toMatchObject({
      label: 'Learn this',
      title: 'Quick lesson',
      action: 'Saving keeps money for later.',
    })
    expect(coachMessageFromTransient('guide', { title: 'Go to checkout', action: 'Follow the green glow.' })).toMatchObject({
      label: 'Next step',
      title: 'Go to checkout',
      action: 'Follow the green glow.',
    })
    expect(coachMessageFromTransient('toast', 'Try that choice again.')).toMatchObject({
      label: 'Feedback',
      action: 'Try that choice again.',
    })
    expect(coachMessageFromTransient('banner', { line: 'Week complete!' })).toMatchObject({
      label: 'Game update',
      action: 'Week complete!',
    })
  })

  it('uses stable content signatures so simultaneous duplicate messages do not stack', () => {
    const first = coachMessageFromTransient('toast', 'Nice choice!')
    const second = coachMessageFromTransient('toast', 'Nice choice!')
    expect(coachMessageSignature(first)).toBe(coachMessageSignature(second))
  })
})
