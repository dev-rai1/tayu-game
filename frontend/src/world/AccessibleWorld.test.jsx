import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearTimelines, playTimeline } from '../anim/timeline.js'
import { AccessibleWorld } from './AccessibleWorld.jsx'
import { useGame } from './store.js'

const initialGameState = useGame.getState()

describe('accessible world integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    clearTimelines()
    useGame.setState(initialGameState, true)
  })

  afterEach(() => {
    clearTimelines()
    vi.useRealTimers()
  })

  it('keeps the engaging module navigation while skipping hidden choreography', () => {
    const completed = vi.fn()
    playTimeline([{ at: 2_000, run: completed }])
    useGame.setState({ week: 2, lemPhase: 'toStand' })

    render(<AccessibleWorld />)

    expect(screen.getByRole('heading', { name: 'The Lemonade Stand' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Go to the Lemonade Stand/ })).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(50))

    expect(completed).toHaveBeenCalledOnce()
  })

  it('preserves direct navigation into the accessible Budget and Bank modules', () => {
    const enterBudget = vi.fn()
    useGame.setState({ week: 3, bt: { stage: 'intro' }, enterBudget })
    const { rerender } = render(<AccessibleWorld />)

    fireEvent.click(screen.getByRole('button', { name: /Meet the Budget Keeper/ }))
    expect(enterBudget).toHaveBeenCalledOnce()

    const enterBank = vi.fn()
    act(() => useGame.setState({ week: 4, bt: null, bk: { seen: {} }, enterBank }))
    rerender(<AccessibleWorld />)

    fireEvent.click(screen.getByRole('button', { name: /Meet Banker Bea/ }))
    expect(enterBank).toHaveBeenCalledOnce()
  })
})
