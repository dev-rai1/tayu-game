import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const mainSource = fs.readFileSync(path.resolve('src/main.jsx'), 'utf8')
const contrastSource = fs.readFileSync(path.resolve('src/styles/contrast.css'), 'utf8')

describe('global text contrast guard', () => {
  it('loads after the base and action styles so readability rules win', () => {
    const base = mainSource.indexOf("./styles/index.css")
    const actions = mainSource.indexOf("./styles/actionButtons.css")
    const contrast = mainSource.indexOf("./styles/contrast.css")

    expect(base).toBeGreaterThan(-1)
    expect(actions).toBeGreaterThan(base)
    expect(contrast).toBeGreaterThan(actions)
  })

  it('replaces low-opacity white and navy body text with solid readable tones', () => {
    expect(contrastSource).toContain('.text-white\\/60')
    expect(contrastSource).toContain('.text-white\\/75')
    expect(contrastSource).toContain('var(--tayu-muted-on-dark) !important')
    expect(contrastSource).toContain('.text-navy\\/60')
    expect(contrastSource).toContain('.text-navy\\/75')
    expect(contrastSource).toContain('var(--tayu-muted-on-light) !important')
  })

  it('gives world HUD panels a strong opaque backing instead of depending on blur', () => {
    expect(contrastSource).toContain('background: rgba(7, 23, 72, 0.92)')
    expect(contrastSource).toContain('.tayu-world-declutter .glass--navy')
    expect(contrastSource).toContain('background: var(--tayu-world-panel-strong)')
    expect(contrastSource).toContain('backdrop-filter: none')
  })

  it('keeps world text sharp instead of adding fuzzy text shadows', () => {
    expect(contrastSource).toContain('.text-legible,')
    expect(contrastSource).toContain('text-shadow: none !important')
    expect(contrastSource).toContain('.tayu-world-declutter .text-electric')
    expect(contrastSource).toContain('.tayu-world-declutter .text-brandpurple')
  })

  it('gives Bond Street an opaque visual background and sharp lesson surfaces', () => {
    expect(contrastSource).toContain('[data-bond-street="true"]')
    expect(contrastSource).toContain('linear-gradient(145deg, #071748 0%, #0b2863 48%, #071737 100%)')
    expect(contrastSource).toContain('[data-bond-street="true"] header')
    expect(contrastSource).toContain('[data-bond-street="true"] header *')
    expect(contrastSource).toContain('[data-bond-street="true"] > main > section')
  })

  it('keeps the explicit higher-contrast preference', () => {
    expect(contrastSource).toContain('@media (prefers-contrast: more)')
  })
})
