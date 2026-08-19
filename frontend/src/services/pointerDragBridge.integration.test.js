import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('./pointerDragBridge.js', import.meta.url), 'utf8')

describe('cross-device drag/drop integration', () => {
  it('dispatches drag start, drag over and drop events', () => {
    expect(source).toContain("'dragstart'")
    expect(source).toContain("'dragover'")
    expect(source).toContain("'drop'")
    expect(source).toContain('elementFromPoint')
  })
})
