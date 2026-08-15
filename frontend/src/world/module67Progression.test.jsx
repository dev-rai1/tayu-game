import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { BondStreetGate } from './BondStreetGate.jsx'
import { BOND_INTERACT_EVENT } from './BondStreetWorld.jsx'
import { TaxWorldInteractionBridge } from './TaxWorldInteractionBridge.jsx'
import { playerPos } from './store.js'
import { TAX_POINTS } from './taxDistrictLayout.js'
import { useTaxLab } from './taxLabStore.js'

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'

function bondInteract(kind, bondId = null) {
  act(() => {
    window.dispatchEvent(new CustomEvent(BOND_INTERACT_EVENT, { detail: { kind, bondId } }))
  })
}

function reachBondAllocation() {
  bondInteract('guide')
  bondInteract('booth', 'treasury')
  bondInteract('booth', 'muni')
  bondInteract('booth', 'corporate')
}

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

  it('lets standalone Module 6 progress through physical interactions without a Money Garden balance', () => {
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(BOND_ONLY_KEY, '1')
    render(<BondStreetGate />)

    expect(screen.getByText(/Walk inside and talk to Beau/i)).toBeInTheDocument()
    expect(screen.queryByText(/Practice Bond Street stake/i)).not.toBeInTheDocument()
    reachBondAllocation()
    expect(screen.getByText(/Choose where to lend your \$90 stake/i)).toBeInTheDocument()
    expect(screen.getByText(/\$90 left to place/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Lend more here/i }))
    expect(screen.getByText(/\$60 left to place/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lock in lending/i })).toBeEnabled()
  })

  it('does not strand Module 6 when a saved route has no usable Money Garden stake', () => {
    localStorage.setItem('tayu-wallet-v1', JSON.stringify({ spend: 0, save: 20, give: 0, week: 6, mg: null }))
    render(<BondStreetGate />)
    reachBondAllocation()
    expect(screen.getByText(/Choose where to lend your \$90 stake/i)).toBeInTheDocument()
    expect(screen.getByText(/\$90 left to place/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Lend more here/i }))
    expect(screen.getByText(/\$60 left to place/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Lock in lending/i })).toBeEnabled()
  })

  it('replays Module 6 even when Bond Street was completed before', () => {
    localStorage.setItem('tayu-profile-v1', JSON.stringify({ badges: ['bond'], bondStreet: { completed: true } }))
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(BOND_ONLY_KEY, '1')
    render(<TaxWorldInteractionBridge />)
    expect(screen.getByText(/Bond Street · Under Construction/i)).toBeInTheDocument()
  })

  it('opens Module 7 directly without forcing Module 6 first', () => {
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    render(<TaxWorldInteractionBridge />)
    expect(screen.queryByText(/Bond Street · Under Construction/i)).not.toBeInTheDocument()
    expect(playerPos.x).toBe(TAX_POINTS.guide[0])
    expect(playerPos.z).toBeCloseTo(TAX_POINTS.guide[1] + 4.2)
    expect(useTaxLab.getState().phase).toBe('intro')
  })

  it('keeps keyboard E working after walking to Rex in a direct Module 7 launch without a bond badge', () => {
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    render(<TaxWorldInteractionBridge />)
    playerPos.x = TAX_POINTS.guide[0]
    playerPos.z = TAX_POINTS.guide[1]
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })
})
