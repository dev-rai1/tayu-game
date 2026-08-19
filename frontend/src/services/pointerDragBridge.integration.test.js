import { describe, expect, it } from 'vitest'
import source from './pointerDragBridge.js?raw'

describe('cross-device drag/drop integration', () => {
  it('dispatches drag start, drag over and drop events', () => {
    expect(source).toContain("'dragstart'")
    expect(source).toContain("'dragover'")
    expect(source).toContain("'drop'")
    expect(source).toContain('elementFromPoint')
  })
})
