import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const source = readFileSync(join(process.cwd(), 'src/world/PointerDragChoice.jsx'), 'utf8')

describe('Module 6/7 no-drag interaction source', () => {
  it('uses ordinary click buttons and no drag APIs', () => {
    expect(source).toContain('onClick')
    expect(source).toContain('type="button"')
    expect(source).not.toContain('setPointerCapture')
    expect(source).not.toContain('dataTransfer')
    expect(source).not.toContain('draggable=')
  })
})
