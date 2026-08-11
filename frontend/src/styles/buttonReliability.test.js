import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const mainSource = fs.readFileSync(path.resolve('src/main.jsx'), 'utf8')
const source = fs.readFileSync(path.resolve('src/styles/buttonReliability.css'), 'utf8')

describe('button reliability guard', () => {
  it('loads after the existing visual styles so reliability rules win', () => {
    const contrast = mainSource.indexOf("./styles/contrast.css")
    const reliability = mainSource.indexOf("./styles/buttonReliability.css")

    expect(contrast).toBeGreaterThan(-1)
    expect(reliability).toBeGreaterThan(contrast)
  })

  it('keeps real buttons targetable and prevents child icons stealing clicks', () => {
    expect(source).toContain('button {\n  pointer-events: auto;')
    expect(source).toContain("button > [aria-hidden='true']")
    expect(source).toContain('pointer-events: none;')
  })

  it('removes blur-producing control effects after interaction', () => {
    expect(source).toContain('backdrop-filter: none !important;')
    expect(source).toContain('.tayu-action-confirm')
    expect(source).toContain('transform: none !important;')
    expect(source).toContain('filter: none !important;')
  })
})
