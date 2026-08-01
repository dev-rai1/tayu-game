import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const authSource = readFileSync(resolve(process.cwd(), 'src/pages/Auth.jsx'), 'utf8')

describe('auth screen layout', () => {
  it('does not render the removed payment-safety panel', () => {
    expect(authSource).not.toContain('Safe practice, not real spending')
    expect(authSource).not.toContain('Free to play')
    expect(authSource).not.toContain('No in-app purchases')
    expect(authSource).not.toContain('Game money only')
    expect(authSource).not.toContain('No bank connection')
    expect(authSource).not.toContain('AccountTrustNote')
  })
})
