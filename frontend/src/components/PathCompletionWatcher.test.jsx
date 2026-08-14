import React from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PathCompletionWatcher, { MODULE_6_HANDOFF_TEXT, fixModule5BridgeCard, handOffGardenToModule6 } from './PathCompletionWatcher.jsx'
import { useGame } from '../world/store.js'
import { deactivatePaycheckWorld, isPaycheckWorldActive } from '../world/paycheckMode.js'

vi.mock('../services/auth.js', () => ({
  currentUser: () => ({ uid: 'test-student', role: 'student' }),
}))

describe('Module 5 to Module 6 handoff', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    deactivatePaycheckWorld()
    useGame.setState({
      week: 5,
      weekComplete: false,
      pendingWeekComplete: false,
      mgPhase: 'done',
      gameComplete: false,
      enterParty: false,
      objective: 'garden',
      cards: [],
      lessons: [],
      dialog: null,
      banner: null,
      toast: null,
    })
  })

  afterEach(() => {
    cleanup()
    deactivatePaycheckWorld()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renames the stale finale bridge to Module 6', () => {
    const cards = [{ id: 'bridge', text: 'Follow the path to the finale.', buttons: [{ label: 'To the Finale!', act: 'mg.bridge' }] }]
    const fixed = fixModule5BridgeCard(cards)
    expect(fixed[0].text).toBe(MODULE_6_HANDOFF_TEXT)
    expect(fixed[0].buttons[0].label).toBe('Start Module 6: Bond Street →')
  })

  it('only hands off to Module 6 while the bond badge is still missing', () => {
    expect(handOffGardenToModule6(['jars', 'lemonade', 'budget', 'bank', 'garden'])).toBe(true)
    expect(handOffGardenToModule6(['jars', 'lemonade', 'budget', 'bank', 'garden', 'bond'])).toBe(false)
  })

  it('intercepts the actual mg.bridge action before legacy unlockParty can open the portal', async () => {
    const unlockParty = vi.fn()
    const awardBadge = vi.fn()
    const persist = vi.fn()
    useGame.setState({
      unlockParty,
      awardBadge,
      persist,
      mgTotal: () => 42,
      allocations: { spend: 7, save: 35, give: 0 },
    })

    render(<PathCompletionWatcher />)
    useGame.getState().mgAct('mg.bridge')

    await waitFor(() => expect(isPaycheckWorldActive()).toBe(true))
    expect(unlockParty).not.toHaveBeenCalled()
    expect(awardBadge).toHaveBeenCalledWith('garden', 'MONEY GARDENER')
    expect(useGame.getState().enterParty).toBe(false)
    expect(useGame.getState().objective).toBe('tax')
    expect(useGame.getState().allocations.save).toBe(42)
    expect(sessionStorage.getItem('tayu-tax-entry-origin')).toBe('garden-handoff')
  })

  it('closes a premature finale and activates the Module 6 route', async () => {
    localStorage.setItem('tayu-profile-v1', JSON.stringify({ badges: ['jars', 'lemonade', 'budget', 'bank', 'garden'], guru: true }))
    useGame.setState({
      gameComplete: true,
      objective: 'party',
      cards: [{ id: 'bridge', text: 'Follow the path to the finale.', buttons: [{ label: 'To the Finale!', act: 'mg.bridge' }] }],
    })

    render(<PathCompletionWatcher />)

    await waitFor(() => expect(isPaycheckWorldActive()).toBe(true))
    expect(useGame.getState().gameComplete).toBe(false)
    expect(useGame.getState().objective).toBe('tax')
    expect(sessionStorage.getItem('tayu-tax-entry-origin')).toBe('garden-handoff')
    expect(sessionStorage.getItem('tayu-bond-only-entry')).toBeNull()
  })
})
