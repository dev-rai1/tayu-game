import { beforeEach, describe, expect, it } from 'vitest'
import { useGame } from './store.js'
import { BOND_STEPS, TAX_STEPS } from '../scenarios/bondTaxFlow.js'

// Regression: picking an answer in Module 6/7 must POP the question card and
// leave a feedback card on top. The old bug pushed feedback WITHOUT popping the
// question, so cards[0] stayed the question forever and the panel looked frozen
// ("selecting an option does nothing / never progresses").
describe('Module 6/7 answer picks advance the card flow', () => {
  beforeEach(() => {
    useGame.setState({ week: 6, bondStep: 0, taxStep: 0, cards: [], lessons: [], dialog: null })
  })

  const firstCorrect = (steps, n) => steps[n].choices.findIndex((c) => c.correct)

  it('Module 6: a correct pick shows feedback, and Continue advances to the next step', () => {
    const g = useGame.getState()
    g.pushBondStep(0)
    expect(useGame.getState().cards).toHaveLength(1)
    expect(useGame.getState().cards[0].id).toBe('bond0')

    // Simulate the panel tapping a choice: it must route through cardAct so the
    // question card is removed before the feedback card is pushed.
    const correct = firstCorrect(BOND_STEPS, 0)
    useGame.getState().cardAct(`bond.pick:${correct}`)

    const afterPick = useGame.getState().cards
    expect(afterPick).toHaveLength(1)
    expect(afterPick[0].id).toMatch(/^bondfb0_/)
    expect(afterPick[0].buttons[0].act).toBe('bond.next')

    // Continue moves to step 1.
    useGame.getState().cardAct('bond.next')
    expect(useGame.getState().bondStep).toBe(1)
    expect(useGame.getState().cards[0].id).toBe('bond1')
  })

  it('Module 6: a wrong pick shows Try again and re-asks the SAME step', () => {
    const g = useGame.getState()
    g.pushBondStep(0)
    const wrong = BOND_STEPS[0].choices.findIndex((c) => !c.correct)
    useGame.getState().cardAct(`bond.pick:${wrong}`)

    const fb = useGame.getState().cards
    expect(fb).toHaveLength(1)
    expect(fb[0].buttons[0].act).toBe('bond.reask')

    useGame.getState().cardAct('bond.reask')
    expect(useGame.getState().bondStep).toBe(0)
    expect(useGame.getState().cards[0].id).toBe('bond0')
  })

  it('Module 7: a correct pick advances the tax return', () => {
    useGame.setState({ week: 7, taxStep: 0, cards: [] })
    useGame.getState().pushTaxStep(0)
    const correct = firstCorrect(TAX_STEPS, 0)
    useGame.getState().cardAct(`tax.pick:${correct}`)
    expect(useGame.getState().cards[0].id).toMatch(/^taxfb0_/)
    useGame.getState().cardAct('tax.next')
    expect(useGame.getState().taxStep).toBe(1)
  })
})
