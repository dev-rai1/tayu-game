import { describe, expect, it } from 'vitest'
import { getGuidance } from './guidance.js'

const base = {
  week: 1,
  objective: 'mailbox',
  bought: [],
  cards: [],
  lessons: [],
}

describe('whole-game next-step guidance', () => {
  it.each([
    [{}, 'COLLECT YOUR ALLOWANCE', 'Press E'],
    [{ objective: 'kitchen' }, 'DIVIDE ALL $30', 'Press E'],
    [{ objective: 'store', bramTalked: false }, 'TALK TO MR. BRAM', 'Press E'],
    [{ objective: 'store', bramTalked: true, bought: ['apple'] }, 'BUY FOOD AND A DRINK', 'Press E'],
    [{ objective: 'store', bramTalked: true, bought: ['apple', 'water'] }, 'GO TO CHECKOUT', 'Press E'],
    [{ week: 2, lemPhase: 'toMarket' }, 'BUY THIS WEEK’S SUPPLIES', 'Press E'],
    [{ week: 2, lemPhase: 'template' }, 'BUILD THIS WEEK’S PLAN', 'start selling'],
    [{ week: 3, bt: { stage: 'intro' } }, 'TALK TO THE BUDGET KEEPER', 'Press E'],
    [{ week: 3, bt: { stage: 'split' } }, 'BUILD THE MONEY PLAN', 'automatically'],
    [{ week: 4, bk: { week: 3, seen: { intro: true } } }, 'BANK LESSON 3 OF 6', 'no repeated E presses'],
    [{ week: 5, mgPhase: 'toGarden', mg: { week: 1, phase: 'opening' } }, 'TALK TO MR. SPROUT', 'Press E'],
    [{ week: 5, mgPhase: 'rounds', mg: { week: 4, phase: 'adjust' } }, 'MONEY GARDEN WEEK 4', 'Start the Week'],
    [{ gameComplete: true }, 'GO TO THE FINALE AREA', 'Press E'],
  ])('guides %# clearly', (state, title, actionText) => {
    const result = getGuidance({ ...base, ...state })
    expect(result.title).toBe(title)
    expect(`${result.instruction} ${result.action}`).toContain(actionText)
  })

  it('uses touch-specific interaction language', () => {
    expect(getGuidance(base, true).action).toContain('blue ACT button')
  })

  it('prioritizes the active choice over world navigation', () => {
    const result = getGuidance({ ...base, week: 4, cards: [{ id: 'choice' }] })
    expect(result.title).toBe('MAKE THE CHOICE ON SCREEN')
  })

  it('tells players not to press E during bank animations', () => {
    const result = getGuidance({ ...base, week: 4, scenarioLocked: true, bk: { week: 3, seen: { intro: true } } })
    expect(result.title).toBe('BANK ACTION IN PROGRESS')
    expect(result.action).toContain('Do not press E')
  })

  it('tells players to watch during other consequences', () => {
    const result = getGuidance({ ...base, scenarioLocked: true })
    expect(result.title).toBe('WATCH WHAT HAPPENS')
  })
})
