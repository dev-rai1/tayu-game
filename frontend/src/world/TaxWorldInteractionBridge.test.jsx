import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TaxActionPrompt } from './TaxActionPrompt.jsx'
import { TaxWorldInteractionBridge } from './TaxWorldInteractionBridge.jsx'
import { activatePaycheckWorld, deactivatePaycheckWorld } from './paycheckMode.js'
import { playerPos } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_POINTS } from './taxDistrictLayout.js'
import { saveProfile } from '../services/walletStore.js'

function mountTaxInteraction() {
  return render(
    <>
      <TaxWorldInteractionBridge />
      <TaxActionPrompt />
    </>,
  )
}

describe('Module 7 Tax Lab start interaction after Bond Street', () => {
  beforeEach(() => {
    sessionStorage.clear()
    saveProfile({ bondStreet: { completed: true, investedInMuni: false }, badges: ['bond'], rexTaxIntroSeen: true })
    activatePaycheckWorld()
    useTaxLab.getState().reset()
    playerPos.x = 999
    playerPos.z = 999
  })

  afterEach(() => {
    cleanup()
    sessionStorage.clear()
    deactivatePaycheckWorld()
    useTaxLab.getState().reset()
  })

  it('always shows a start action during the intro even when the player is not yet in proximity', () => {
    mountTaxInteraction()
    expect(screen.getByRole('button', { name: /Start Module 7/i })).toBeInTheDocument()
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

  it('clicking the visible start action opens the tax guide', () => {
    mountTaxInteraction()
    fireEvent.click(screen.getByRole('button', { name: /Start Module 7/i }))
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('keeps the visible intro E click working even if the global mode flag updates late', () => {
    mountTaxInteraction()
    deactivatePaycheckWorld()
    fireEvent.click(screen.getByRole('button', { name: /Start Module 7/i }))
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('still requires proximity after the intro instead of making every later E press global', () => {
    mountTaxInteraction()
    useTaxLab.getState().startCaseSelection()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe(null)
  })

  it('opens the guide normally when the player is physically next to it', () => {
    playerPos.x = TAX_POINTS.guide[0]
    playerPos.z = TAX_POINTS.guide[1]
    mountTaxInteraction()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })
})
