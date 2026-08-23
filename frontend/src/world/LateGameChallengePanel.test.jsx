import React from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { LateGameChallengePanel } from './LateGameChallengePanel.jsx'
import { useGame } from './store.js'
import { BOND_STEPS } from '../scenarios/bondTaxFlow.js'

// Reproduces the reported blocker: in Module 6/7 you tap an answer and nothing
// happens. The panel must remove the question card and reveal feedback so the
// player can continue.
describe('LateGameChallengePanel advances on tap', () => {
  beforeEach(() => {
    useGame.setState({ week: 6, bondStep: 0, taxStep: 0, dialog: null, lessons: [] })
    // Step 0 is a tap-choice step (renders the choice buttons).
    useGame.getState().pushBondStep(0)
  })
  afterEach(() => { cleanup(); useGame.setState({ week: 1, cards: [], bondStep: 0 }) })

  it('reveals feedback after a correct tap and continues to the next step', () => {
    render(<LateGameChallengePanel />)
    // The question is on screen.
    expect(screen.getByText(BOND_STEPS[0].text)).toBeInTheDocument()

    const correct = BOND_STEPS[0].choices.find((c) => c.correct)
    act(() => { fireEvent.click(screen.getByRole('button', { name: correct.label })) })

    // Feedback for the correct answer must now be visible (the question is gone).
    expect(screen.getByText(correct.feedback)).toBeInTheDocument()

    // Continue advances to step 1.
    act(() => { fireEvent.click(screen.getByRole('button', { name: /continue/i })) })
    expect(useGame.getState().bondStep).toBe(1)
    expect(screen.getByText(BOND_STEPS[1].text)).toBeInTheDocument()
  })
})
