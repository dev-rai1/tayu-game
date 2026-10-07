import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PersistentCoach } from './PersistentCoach.jsx'
import { LateGameChallengePanel } from './LateGameChallengePanel.jsx'
import { MoneyWordHelp } from '../components/MoneyWordHelp.jsx'
import { useGame } from './store.js'
import { useFeedbackCoach } from './feedbackCoach.js'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useGame.getState().initWorld()
  useGame.getState().adminClearUi()
  useFeedbackCoach.getState().clearAllFeedback()
  useGame.setState({ guide: null, actorCaption: null, banner: null, toast: null })
})
afterEach(cleanup)

describe('October tester regressions', () => {
  it('renders and submits both labeled Tax Office question 5 categories', () => {
    useGame.setState({ week: 7, taxStep: 4, cards: [], dialog: null })
    useGame.getState().pushTaxStep(4)
    render(<LateGameChallengePanel />)
    const muni = screen.getByRole('button', { name: 'Municipal interest: Excluded' })
    const corp = screen.getByRole('button', { name: 'Corporate interest: Taxable' })
    expect(muni).toHaveClass('text-navy', 'bg-white')
    expect(corp).toHaveClass('text-navy', 'bg-white')
    expect(screen.getByRole('button', { name: 'Send to return' })).toBeDisabled()
    fireEvent.click(muni)
    fireEvent.click(corp)
    expect(muni).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Send to return' }))
    expect(useGame.getState().cards[0].id).toMatch(/^taxfb/)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(useGame.getState().taxStep).toBe(5)
  })

  it('keeps queued Budget feedback behind decision cards and does not repeat dismissed text', () => {
    useGame.setState({ week: 3, objective: 'keeper', bt: { stage: 'house' }, toast: 'The lights came on.' })
    const { container } = render(<PersistentCoach />)
    expect(screen.getByText('The lights came on.')).toBeInTheDocument()
    act(() => useGame.setState({ cards: [{ id: 'bt-grocery', text: 'Choose groceries' }] }))
    expect(container.querySelector('aside')).toBeNull()
    act(() => useGame.setState({ cards: [] }))
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }))
    act(() => useGame.setState({ toast: 'The lights came on.' }))
    expect(screen.queryByText('The lights came on.')).not.toBeInTheDocument()
  })

  it('drops previous-module feedback on a handoff', () => {
    useGame.setState({ week: 4, objective: 'banker', toast: 'Your bank plan is ready.' })
    render(<PersistentCoach />)
    expect(screen.getByText('Your bank plan is ready.')).toBeInTheDocument()
    act(() => useGame.setState({ week: 5, objective: 'sprout', mg: null }))
    expect(screen.queryByText('Your bank plan is ready.')).not.toBeInTheDocument()
  })

  it('opens current-module definitions on request and closes them on module change', () => {
    const { rerender } = render(<MoneyWordHelp moduleNumber={4} />)
    expect(screen.queryByText('Borrowing cost')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Money words' }))
    expect(screen.getByText('Borrowing cost')).toBeInTheDocument()
    rerender(<MoneyWordHelp moduleNumber={7} />)
    expect(screen.queryByText('Borrowing cost')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Money words' }))
    expect(screen.getByText('Withholding')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText('Withholding')).not.toBeInTheDocument()
  })
})
