import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

describe('current TAYU documentation', () => {
  it('documents the account-only public entry flow', () => {
    const walkthrough = read('WALKTHROUGH.md')
    expect(walkthrough).toContain('Log In or Sign Up')
    expect(walkthrough).toContain('Guest Mode is no longer a public entry option')
    expect(walkthrough).not.toContain('Play in Guest Mode')
  })

  it('uses modules as the learner-facing curriculum term', () => {
    const walkthrough = read('WALKTHROUGH.md')
    expect(walkthrough).toContain('Use **module** consistently')
    expect(walkthrough).toContain('Module 1: Market & Three Jars')
    expect(walkthrough).toContain('Module 5: Money Garden')
  })

  it('does not present the old stacked pull requests as current work', () => {
    const checklist = read('docs/TAYU_COMPLETE_UPDATE_CHECKLIST.md')
    expect(checklist).toContain('replaces the obsolete July 30 stacked-PR tracker')
    expect(checklist).not.toContain('PR #121–#124')
    expect(checklist).not.toContain('| #121 |')
  })
})
