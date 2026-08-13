import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BondStreetGate } from './BondStreetGate.jsx'
import { TaxWorldInteractionBridge } from './TaxWorldInteractionBridge.jsx'
import { useTaxLab } from './taxLabStore.js'

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'

describe('Modules 6 and 7 progression', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useTaxLab.getState().reset()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
    sessionStorage.clear()
    useTaxLab.getState().reset()
  })

  it('lets standalone Module 6 progress even without a Money Garden balance', () => {
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(BOND_ONLY_KEY, '1')
    render(<BondStreetGate />)
    expect(screen.getByText(/Practice Bond Street stake/i)).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Meet the three borrowers/i }))
    fireEvent.click(screen.getByRole('button', { name: /Split my Bond Street stake/i }))
    expect(screen.getByRole('button', { name: /Run the bond outcomes/i })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Split evenly/i }))
    expect(screen.getByRole('button', { name: /Run the bond outcomes/i })).toBeEnabled()
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
