import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { isFrozen } from './Player.jsx'

const hudSource = fs.readFileSync(path.resolve('src/world/Hud.jsx'), 'utf8')
const playerSource = fs.readFileSync(path.resolve('src/world/Player.jsx'), 'utf8')

const clearState = (overrides = {}) => ({
  panelJar: null,
  panelItem: null,
  dialog: null,
  weekComplete: false,
  scenarioLocked: false,
  lessons: [],
  cards: [],
  lemPhase: null,
  week: 1,
  mgPhase: null,
  mg: null,
  panelPortfolio: false,
  btPanel: null,
  bkPanel: null,
  helpOpen: false,
  ...overrides,
})

describe('University of Arizona final gameplay feedback', () => {
  it('does not leave the player frozen from stale Money Garden state outside Module 5', () => {
    expect(isFrozen(clearState({ week: 1, objective: 'store', mg: { phase: 'slider' } }))).toBe(false)
    expect(isFrozen(clearState({ week: 3, mg: { phase: 'choices' } }))).toBe(false)
  })

  it('unfreezes after store and Module 5 blocking surfaces close', () => {
    expect(isFrozen(clearState({ week: 1, objective: 'store' }))).toBe(false)
    expect(isFrozen(clearState({ week: 5, mg: { phase: 'adjust' } }))).toBe(false)
    expect(isFrozen(clearState({ week: 5, mg: { phase: 'slider' } }))).toBe(true)
    expect(isFrozen(clearState({ week: 5, panelPortfolio: true, mg: { phase: 'adjust' } }))).toBe(true)
  })

  it('keeps dialogue learner-controlled instead of auto-advancing it', () => {
    expect(playerSource).toContain("if (st.dialog) { st.advanceDialog(); return }")
    expect(hudSource).toContain('advanceDialog')
    expect(hudSource).toMatch(/Continue|Next/)
  })

  it('keeps Money Garden decision guidance above rather than over portfolio controls', () => {
    expect(hudSource).toContain('top-[92px]')
    expect(hudSource).toContain('max-h-[calc(100vh-108px)]')
    expect(hudSource).toContain('overflow-y-auto')
    expect(hudSource).toContain('bottom-[calc(7rem+env(safe-area-inset-bottom,0px))]')
    expect(hudSource).toContain('My Portfolio')
  })
})
