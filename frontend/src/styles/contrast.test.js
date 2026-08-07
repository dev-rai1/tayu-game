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

  it('gives glass HUD panels a strong backing over moving scenery', () => {
    expect(contrastSource).toContain('background: rgba(7, 23, 72, 0.88)')
    expect(contrastSource).toContain('.tayu-world-declutter .glass--navy')
    expect(contrastSource).toContain('background: var(--tayu-world-panel-strong)')
  })

  it('adds extra world-scene legibility and a higher-contrast preference', () => {
    expect(contrastSource).toContain('text-shadow: 0 1px 2px rgba(7, 23, 72, 0.92)')
    expect(contrastSource).toContain('.tayu-world-declutter .text-electric')
    expect(contrastSource).toContain('.tayu-world-declutter .text-brandpurple')
    expect(contrastSource).toContain('@media (prefers-contrast: more)')
  })
})
