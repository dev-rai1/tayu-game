import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (path) => readFileSync(resolve(process.cwd(), 'src', path), 'utf8')

const authPage = source('pages/Auth.jsx')
const app = source('App.jsx')

describe('account-only entry flow', () => {
  it('keeps login, sign-up, and password reset as the only account entry options', () => {
    expect(authPage).toContain("['signin', 'Log In']")
    expect(authPage).toContain("['signup', 'Sign Up']")
    expect(authPage).toContain("['reset', 'Forgot?']")
    expect(authPage).not.toMatch(/guest mode|GuestModeButton|startGuestSession/i)
  })

  it('requires authentication before assessments, modules, avatar creation, and the world', () => {
    expect(app).toContain('<PreQuizGate><Suspense')
    expect(app).toContain('path="/avatar"')
    expect(app).toContain('path="/world"')
    expect(app).toContain('path="/modules"')
    expect(app).not.toContain('GuestModeButton')
  })
})
