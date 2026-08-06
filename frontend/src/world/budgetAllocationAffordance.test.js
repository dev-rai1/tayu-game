import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.resolve('src/world/BudgetPanels.jsx'), 'utf8')

describe('Budget Town allocation affordances', () => {
  it('uses financial-account terminology instead of homes for money', () => {
    expect(source).toContain('Three financial accounts')
    expect(source).not.toContain('Three homes for money')
  })

  it('shows a real left-pointing arrow for every decrease control', () => {
    expect(source).toContain('<span aria-hidden="true">←</span>')
    expect(source).toContain('Put one dollar less in')
  })
})
