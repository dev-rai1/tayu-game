import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const authSource = readFileSync(resolve(process.cwd(), 'src/pages/Auth.jsx'), 'utf8')

describe('account setup clarity', () => {
  it('does not restore the removed payment-safety panel', () => {
    expect(authSource).not.toContain('Safe practice, not real spending')
    expect(authSource).not.toContain('Free to play')
    expect(authSource).not.toContain('No in-app purchases')
    expect(authSource).not.toContain('Game money only')
    expect(authSource).not.toContain('No bank connection')
    expect(authSource).not.toContain('AccountTrustNote')
  })

  it('uses plain-language account choices for independent testers and classrooms', () => {
    expect(authSource).toContain('Playing on my own')
    expect(authSource).toContain('School or organization')
    expect(authSource).toContain('School students use their teacher’s class code')
  })

  it('keeps classroom safeguards and required setup fields', () => {
    expect(authSource).toContain("if (f.role === 'student' && !f.studentCode.trim())")
    expect(authSource).toContain('Teacher’s class code')
    expect(authSource).toContain('How did you find TAYU?')
    expect(authSource).toContain('Organization name')
    expect(authSource).toContain('Your grade level')
  })
})
