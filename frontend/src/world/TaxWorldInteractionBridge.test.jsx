import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TaxActionPrompt } from './TaxActionPrompt.jsx'
import { TaxWorkbenchOverlay } from './TaxWorkbenchOverlay.jsx'
import { TaxWorldInteractionBridge } from './TaxWorldInteractionBridge.jsx'
import { activatePaycheckWorld, deactivatePaycheckWorld } from './paycheckMode.js'
import { playerPos } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_POINTS } from './taxDistrictLayout.js'
import { saveProfile } from '../services/walletStore.js'

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'

function mountTaxInteraction({ workbench = false } = {}) {
  return render(
    <>
      <TaxWorldInteractionBridge />
      <TaxActionPrompt />
      {workbench && <TaxWorkbenchOverlay />}
    </>,
  )
}

function standByRex() {
  playerPos.x = TAX_POINTS.guide[0]
  playerPos.z = TAX_POINTS.guide[1]
}

describe('Module 7 Tax Office interactions', () => {
  beforeEach(() => {
    saveProfile({ bondStreet: { completed: true, investedInMuni: false }, badges: ['bond'] })
    sessionStorage.removeItem(TAX_ORIGIN_KEY)
    sessionStorage.removeItem(BOND_ONLY_KEY)
    activatePaycheckWorld()
    useTaxLab.getState().reset()
    playerPos.x = 999
    playerPos.z = 999
  })

  afterEach(() => {
    cleanup()
    deactivatePaycheckWorld()
    useTaxLab.getState().reset()
    sessionStorage.removeItem(TAX_ORIGIN_KEY)
    sessionStorage.removeItem(BOND_ONLY_KEY)
  })

  it('does not show an action prompt when the player is far away', async () => {
    mountTaxInteraction()
    playerPos.x = 999
    playerPos.z = 999
    useTaxLab.getState().setNearbyAction(null)
    // mount places the player at the entrance (now within the widened guide
    // reach), so wait one poll cycle for the bridge to re-evaluate at 999.
    await new Promise((resolve) => setTimeout(resolve, 140))
    expect(screen.queryByRole('button', { name: /start the Tax Office/i })).not.toBeInTheDocument()
    expect(useTaxLab.getState().panel).toBe(null)
  })

  it('does not let a global E press open the guide from across the map', () => {
    mountTaxInteraction()
    playerPos.x = 999
    playerPos.z = 999
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe(null)
  })

  it('opens the guide when the player physically walks next to Rex and presses E', () => {
    mountTaxInteraction()
    standByRex()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('starts the taxpayer walk from the compact Rex workbench instead of a blank quiz screen', () => {
    mountTaxInteraction({ workbench: true })
    standByRex()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    fireEvent.click(screen.getByRole('button', { name: /let me walk to a taxpayer/i }))
    expect(useTaxLab.getState().phase).toBe('case')
    expect(useTaxLab.getState().panel).toBe(null)
  })

  it('allows a direct Module 7 selection without requiring Bond Street completion and places the player at its own entrance', () => {
    saveProfile({ bondStreet: null, badges: [] })
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.removeItem(BOND_ONLY_KEY)
    mountTaxInteraction()
    expect(playerPos.x).toBe(TAX_POINTS.guide[0])
    expect(playerPos.z).toBeCloseTo(TAX_POINTS.guide[1] + 4.2)
    expect(useTaxLab.getState().panel).toBe(null)
  })

  it('preserves the separate Bond Street building flow for an explicit Module 6 launch', () => {
    saveProfile({ bondStreet: null, badges: [] })
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(BOND_ONLY_KEY, '1')
    mountTaxInteraction()
    expect(screen.getByText('Bond Street')).toBeInTheDocument()
  })

  it('requires proximity to the next physical station after Rex starts the case flow', () => {
    mountTaxInteraction()
    playerPos.x = 999
    playerPos.z = 999
    useTaxLab.getState().startCaseSelection()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe(null)
  })

  it('requires the learner to return to Rex after filing rather than showing an automatic full-screen finish modal', () => {
    useTaxLab.getState().complete()
    mountTaxInteraction()
    playerPos.x = 999
    playerPos.z = 999
    expect(screen.queryByRole('button', { name: /Finish Tax Office/i })).not.toBeInTheDocument()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe(null)
    standByRex()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })
})
