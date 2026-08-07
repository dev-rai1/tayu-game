import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const ci = read('../.github/workflows/deploy.yml')
const firebase = read('../.github/workflows/firebase-hosting-deploy.yml')

describe('CI and production deployment workflow', () => {
  it('uses a Node version supported by current Supabase packages', () => {
    expect(ci).not.toContain('node-version: 20')
    expect(ci).toContain('node-version: 22')
    expect(firebase).toContain("node-version: '22'")
  })

  it('does not abort production verification on the first transient route timeout', () => {
    expect(firebase).toContain('fetch_url()')
    expect(firebase).toContain('--retry-all-errors')
    expect(firebase).toContain('verify_routes()')
    expect(firebase).toContain('if ! body="$(fetch_url')
    expect(firebase).toContain('if verify_routes "$host"; then')
    expect(firebase).toContain('for attempt in $(seq 1 18)')
  })

  it('still fails when production never becomes healthy', () => {
    expect(firebase).toContain('did not consistently serve deployment')
    expect(firebase).toContain('return 1')
    expect(firebase).toContain("context: 'firebase/production'")
    expect(firebase).toContain("state: 'failure'")
  })
})
