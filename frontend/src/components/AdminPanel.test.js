import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('./AdminPanel.jsx', import.meta.url), 'utf8')

describe('admin panel demo controls', () => {
  it('includes a current-step skip control', () => {
    expect(source).toContain('Skip current step')
    expect(source).toContain('pushBondStep')
    expect(source).toContain('pushTaxStep')
  })
})
