import { describe, expect, it } from 'vitest'
import { shouldUseTouchControls } from './controlMode.js'

describe('shouldUseTouchControls', () => {
  it('keeps desktop instructions on a Windows touchscreen laptop', () => {
    expect(shouldUseTouchControls({
      touchCapable: true,
      coarsePointer: false,
      hoverNone: false,
      mobileUserAgent: false,
    })).toBe(false)
  })

  it('uses touch instructions on a phone or tablet', () => {
    expect(shouldUseTouchControls({
      touchCapable: true,
      coarsePointer: true,
      hoverNone: true,
    })).toBe(true)
  })

  it('does not use touch controls on a regular desktop', () => {
    expect(shouldUseTouchControls()).toBe(false)
  })

  it('allows the explicit touch QA override', () => {
    expect(shouldUseTouchControls({ forceTouch: true })).toBe(true)
  })
})
