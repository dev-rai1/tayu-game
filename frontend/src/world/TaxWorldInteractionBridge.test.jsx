import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TaxActionPrompt } from './TaxActionPrompt.jsx'
import { TaxWorldInteractionBridge } from './TaxWorldInteractionBridge.jsx'
import { activatePaycheckWorld, deactivatePaycheckWorld, isPaycheckWorldActive } from './paycheckMode.js'
import { playerPos } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_POINTS } from './taxDistrictLayout.js'
import { saveProfile } from '../services/walletStore.js'

const TAX_ORIGIN_KEY = 'tayu-tax-entry-origin'
const BOND_ONLY_KEY = 'tayu-bond-only-entry'

function mountTaxInteraction() {
  return render(
    <>
      <TaxWorldInteractionBridge />
      <TaxActionPrompt />
    </>,
  )
}

describe('Module 7 Tax Office interactions', () => {
  beforeEach(() => {
    saveProfile({ bondStreet: { completed: true, investedInMuni: false }, badges: ['bond'], rexTaxIntroSeen: true, rexTaxReviewSeen: false })
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

  it('always shows a Module 7 start action during the intro even before proximity initializes', () => {
    mountTaxInteraction()
    expect(screen.getByRole('button', { name: /start Module 7 Tax Office/i })).toBeInTheDocument()
  })

  it('pressing E opens the tax guide even if proximity has not initialized', () => {
    mountTaxInteraction()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('keeps keyboard E working even if the global mode flag updates late', () => {
    mountTaxInteraction()
    deactivatePaycheckWorld()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('clicking the visible Module 7 start action opens the tax guide', () => {
    mountTaxInteraction()
    fireEvent.click(screen.getByRole('button', { name: /start Module 7 Tax Office/i }))
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('keeps the visible intro action working even if the global mode flag updates late', () => {
    mountTaxInteraction()
    deactivatePaycheckWorld()
    fireEvent.click(screen.getByRole('button', { name: /start Module 7 Tax Office/i }))
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('starts the playable guide immediately from Rex first-time intro instead of requiring a second click', () => {
    saveProfile({ rexTaxIntroSeen: false })
    mountTaxInteraction()

    fireEvent.click(screen.getByRole('button', { name: /Start the Tax Office/i }))

    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('allows a direct Module 7 selection without requiring Bond Street completion', () => {
    saveProfile({ bondStreet: null, badges: [], rexTaxIntroSeen: true })
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.removeItem(BOND_ONLY_KEY)

    mountTaxInteraction()

    fireEvent.click(screen.getByRole('button', { name: /start Module 7 Tax Office/i }))
    expect(useTaxLab.getState().panel).toBe('guide')
    expect(playerPos.x).toBe(TAX_POINTS.guide[0])
    expect(playerPos.z).toBeCloseTo(TAX_POINTS.guide[1] + 3.2)
  })

  it('still preserves the Bond Street gate for an explicit Module 6 launch', () => {
    saveProfile({ bondStreet: null, badges: [], rexTaxIntroSeen: true })
    sessionStorage.setItem(TAX_ORIGIN_KEY, 'module-select')
    sessionStorage.setItem(BOND_ONLY_KEY, '1')

    mountTaxInteraction()

    expect(screen.getByText('Module 6 · Bond Street')).toBeInTheDocument()
  })

  it('still requires proximity after the intro instead of making every later E press global', () => {
    mountTaxInteraction()
    useTaxLab.getState().startCaseSelection()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe(null)
  })

  it('opens the guide normally when the player is physically next to Rex', () => {
    playerPos.x = TAX_POINTS.guide[0]
    playerPos.z = TAX_POINTS.guide[1]
    mountTaxInteraction()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('finishes Module 7 from Rex review instead of revealing another required finish click', () => {
    useTaxLab.getState().complete()
    mountTaxInteraction()

    fireEvent.click(screen.getByRole('button', { name: /Finish Module 7/i }))

    expect(isPaycheckWorldActive()).toBe(false)
  })
})
