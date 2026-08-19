import { describe, expect, it } from 'vitest'

describe('pointer drag bridge', () => {
  it('keeps the drag bridge module importable', async () => {
    const mod = await import('./pointerDragBridge.js')
    expect(typeof mod.installPointerDragBridge).toBe('function')
  })
})
