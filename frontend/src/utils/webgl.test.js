import { afterEach, describe, expect, it, vi } from 'vitest'
import { hasWebGL } from './webgl.js'

describe('3D renderer policy', () => {
  afterEach(() => vi.restoreAllMocks())

  it('attempts the 3D renderer even when a capability probe returns no context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(hasWebGL()).toBe(true)
  })

  it('attempts the 3D renderer when WebGL context probing throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('driver probe failed')
    })
    expect(hasWebGL()).toBe(true)
  })
})
