import { describe, it, expect } from 'vitest'
import { useGame } from './store.js'
import { BOND_STEPS, TAX_STEPS } from '../scenarios/bondTaxFlow.js'

const g = () => useGame.getState()

// Drive a card-driven flow to completion, always choosing the correct answer on
// decisions and the continue button on teaching cards. Returns the number of
// cards clicked (guards against infinite loops).
function drive(steps, correctByStep) {
  let clicks = 0
  for (let i = 0; i < 60 && !g().pendingWeekComplete; i += 1) {
    const card = g().cards[0]
    if (!card) break
    const buttons = card.buttons || []
    // Feedback card after a correct pick has a single "Continue" -> advance.
    // Decision card: pick the button whose label matches the correct choice.
    let btn = buttons.find((b) => correctByStep.has(b.label)) || buttons[0]
    g().cardAct(btn.act)
    clicks += 1
  }
  return clicks
}

describe('Module 6 Bond Street card flow', () => {
  it('starts in the town scene and completes with a badge', () => {
    g().startBond()
    expect(g().week).toBe(6)
    expect(g().objective).toBe('bond')
    g().beginBond()
    expect(g().dialog).toBeTruthy()
    // Finishing the intro dialog pushes the first card.
    g().dialog.onClose?.()
    expect(g().cards.length).toBeGreaterThan(0)

    const correct = new Set(
      BOND_STEPS.flatMap((s) => (s.choices || []).filter((c) => c.correct).map((c) => c.label)),
    )
    const clicks = drive(BOND_STEPS, correct)
    expect(clicks).toBeGreaterThan(BOND_STEPS.length - 1)
    expect(g().pendingWeekComplete).toBe(true)
  })
})

describe('Module 7 Tax Office card flow', () => {
  it('starts in the town scene and completes with a badge', () => {
    g().startTax()
    expect(g().week).toBe(7)
    expect(g().objective).toBe('tax')
    g().beginTax()
    expect(g().dialog).toBeTruthy()
    g().dialog.onClose?.()
    expect(g().cards.length).toBeGreaterThan(0)

    const correct = new Set(
      TAX_STEPS.flatMap((s) => (s.choices || []).filter((c) => c.correct).map((c) => c.label)),
    )
    const clicks = drive(TAX_STEPS, correct)
    expect(clicks).toBeGreaterThan(TAX_STEPS.length - 1)
    expect(g().pendingWeekComplete).toBe(true)
  })
})
