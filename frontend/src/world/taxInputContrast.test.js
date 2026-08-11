import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.resolve('src/world/TaxWorkbenchOverlay.jsx'), 'utf8')

describe('Module 6 tax input visibility', () => {
  it('renders the final-tax input with explicit high-contrast colors', () => {
    expect(source).toContain('placeholder="$ final tax"')
    expect(source).toContain('bg-white')
    expect(source).toContain('text-navy')
    expect(source).toContain('caret-navy')
    expect(source).toContain('placeholder:text-navy/35')
  })
})
