import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BondStreetGate } from './BondStreetGate.jsx'
import { TaxWorldInteractionBridge } from './TaxWorldInteractionBridge.jsx'
import { useTaxLab } from './taxLabStore.js'

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'

function advanceBondAnimation(ms = 2000) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('Modules 6 and 7 progression', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useTaxLab.getState().reset()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
    localStorage.clear()
    sessionStorage.clear()
    useTaxLab.getState().reset()
  })

  it('lets standalone Module 6 progress through the rebuilt Bond Street flow without a Money Garden balance', () => {
    vi.useFakeTimers()
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(BOND_ONLY_KEY, '1')
    render(<BondStreetGate />)

    expect(screen.getByText(/Walk into the exchange and meet Beau/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Talk to Beau/i }))
    advanceBondAnimation()

    expect(screen.getByText(/Who should get your loan/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Go to the allocation counter/i }))
    advanceBondAnimation()

    expect(screen.getByText(/Lend your \$100 stake/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lock decision/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Split evenly/i }))
    advanceBondAnimation(1200)
    expect(screen.getByRole('button', { name: /Lock decision/i })).toBeEnabled()
  })

  it('does not strand Module 6 when a saved route has no usable Money Garden stake', () => {
    vi.useFakeTimers()
    localStorage.setItem('tayu-wallet-v1', JSON.stringify({ spend: 0, save: 20, give: 0, week: 6, mg: null }))
    render(<BondStreetGate />)

    fireEvent.click(screen.getByRole('button', { name: /Talk to Beau/i }))
    advanceBondAnimation()
    fireEvent.click(screen.getByRole('button', { name: /Go to the allocation counter/i }))
    advanceBondAnimation()

    expect(screen.getByText(/Lend your \$100 stake/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Split evenly/i }))
    advanceBondAnimation(1200)
    expect(screen.getByRole('button', { name: /Lock decision/i })).toBeEnabled()
  })

  it('replays Module 6 even when Bond Street was completed before', () => {
    localStorage.setItem('tayu-profile-v1', JSON.stringify({ badges: ['bond'], bondStreet: { completed: true }, rexTaxIntroSeen: true }))
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(BOND_ONLY_KEY, '1')
    render(<TaxWorldInteractionBridge />)
    expect(screen.getByText(/Module 6 · Bond Street/i)).toBeInTheDocument()
  })

  it('opens Module 7 directly without forcing Module 6 first', () => {
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    render(<TaxWorldInteractionBridge />)
    expect(screen.queryByText(/Module 6 · Bond Street/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Module 7 · Tax Office · Rex the Assessor/i)).toBeInTheDocument()
  })

  it('keeps keyboard E working in a direct Module 7 launch without a bond badge', () => {
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    render(<TaxWorldInteractionBridge />)
    fireEvent.click(screen.getByRole('button', { name: /Start the Tax Office/i }))
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })
})
