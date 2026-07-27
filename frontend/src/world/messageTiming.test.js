import { describe, expect, it } from 'vitest'
import {
  MIN_BANNER_MS,
  MIN_CAPTION_MS,
  MIN_GUIDANCE_MS,
  readableMessageMs,
} from './messageTiming.js'

describe('readable message timing', () => {
  it('never lets a short caption disappear too quickly', () => {
    expect(readableMessageMs('Short line.', 2200, MIN_CAPTION_MS)).toBeGreaterThanOrEqual(MIN_CAPTION_MS)
  })

  it('keeps suggestions longer than ordinary captions', () => {
    expect(readableMessageMs('Follow the arrow to checkout.', 2800, MIN_GUIDANCE_MS)).toBeGreaterThanOrEqual(MIN_GUIDANCE_MS)
  })

  it('gives longer text additional reading time', () => {
    const short = readableMessageMs('One short message.', 0, MIN_BANNER_MS)
    const long = readableMessageMs('This is a much longer message with enough words that a young player needs more time to read it comfortably.', 0, MIN_BANNER_MS)
    expect(long).toBeGreaterThan(short)
  })

  it('respects a deliberately longer requested duration', () => {
    expect(readableMessageMs('Long animation message', 20000, MIN_CAPTION_MS)).toBe(20000)
  })
})
