import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { lemonadePrimaryCorrection } from './lemonadeCorrection.js'

const coachSource = readFileSync(resolve(process.cwd(), 'src/world/PersistentImprovementCoach.jsx'), 'utf8')

const plan = {
  price: 1.25,
  hours: 4,
  bundle: { id: 'medium' },
  quality: { id: 'basic' },
  sign: { id: 'none' },
}

const levers = (overrides = {}) => ({
  price: 1.25,
  hours: 4,
  bundle: { id: 'medium' },
  quality: { id: 'basic' },
  sign: { id: 'none' },
  ...overrides,
})

const result = (overrides = {}) => ({ missed: 0, leftover: 0, ...overrides })

describe('one-fix Lemonade feedback', () => {
  it('prioritizes a large price miss as one clear change', () => {
    const correction = lemonadePrimaryCorrection(result({ missed: 5 }), levers({ price: 2 }), { plan })
    expect(correction.lever).toBe('price')
    expect(correction.action).toBe('Lower the price first, then test the same plan again.')
    expect(correction.action).not.toMatch(/batch|hours/i)
  })

  it('uses supply evidence when price is already close', () => {
    expect(lemonadePrimaryCorrection(result({ missed: 4 }), levers(), { plan })).toEqual({
      lever: 'batch',
      action: 'Choose a larger batch first so more waiting customers can buy.',
    })
    expect(lemonadePrimaryCorrection(result({ leftover: 4 }), levers(), { plan })).toEqual({
      lever: 'batch',
      action: 'Choose a smaller batch first so fewer cups are left over.',
    })
  })

  it('points to one later lever when price and supply fit', () => {
    const correction = lemonadePrimaryCorrection(result(), levers({ hours: 2 }), { plan })
    expect(correction.lever).toBe('hours')
    expect(correction.action).toContain('Stay open longer first')
  })

  it('wires the single correction into the shared feedback coach and analytics', () => {
    expect(coachSource).toContain('lemonadePrimaryCorrection')
    expect(coachSource).toContain('action: correction.action')
    expect(coachSource).toContain("correction.lever")
  })
})
