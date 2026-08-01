import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const authSource = readFileSync(resolve(process.cwd(), 'src/pages/Auth.jsx'), 'utf8')

describe('account and payment clarity', () => {
  it('answers the common parent payment questions before signup', () => {
    expect(authSource).toContain('Free to play')
    expect(authSource).toContain('No in-app purchases')
    expect(authSource).toContain('Game money only')
    expect(authSource).toContain('No bank connection')
    expect(authSource).toContain('does not ask students to connect a card or financial account')
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
    expect(authSource).toContain('Privacy notice')
    expect(authSource).toContain('Browser storage')
  })
})
