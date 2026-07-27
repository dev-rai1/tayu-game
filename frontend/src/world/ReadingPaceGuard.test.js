import { describe, expect, it } from 'vitest'
import { readingUnlockMs } from './ReadingPaceGuard.jsx'

describe('readingUnlockMs', () => {
  it('always protects short messages from instant skipping', () => {
    expect(readingUnlockMs('Read me.')).toBeGreaterThanOrEqual(1600)
  })

  it('gives longer messages more reading time', () => {
    const shortTime = readingUnlockMs('A short message.')
    const longTime = readingUnlockMs('This is a longer lesson with several important words that a younger player should have time to read carefully before continuing.')
    expect(longTime).toBeGreaterThan(shortTime)
  })

  it('caps the delay so players are never trapped', () => {
    expect(readingUnlockMs('word '.repeat(200))).toBeLessThanOrEqual(4500)
  })
})
