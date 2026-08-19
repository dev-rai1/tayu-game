import { describe, expect, it } from 'vitest'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('./AdminPanel.jsx', import.meta.url), 'utf8')

describe('admin panel demo controls', () => {
  it('includes a current-step skip control', () => {
    expect(source).toContain('Skip current step')
    expect(source).toContain('pushBondStep')
    expect(source).toContain('pushTaxStep')
  })

  it('uses the current seven-module map', () => {
    expect(source).toContain("6: 'Bond Street'")
    expect(source).toContain("7: 'TAYU Tax Office'")
    expect(source).not.toContain("6: 'Paycheck Planet'")
    expect(source).not.toContain("7: 'Finale Area'")
  })

  it('supports direct module jumps and week navigation', () => {
    expect(source).toContain("localStorage.setItem('tayu-jump-module'")
    expect(source).toContain('Jump directly to module')
    expect(source).toContain('adminJumpWeek(target)')
    expect(source).toContain('Week back')
    expect(source).toContain('Week forward')
  })
})
