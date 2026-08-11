import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TaxActionPrompt } from './TaxActionPrompt.jsx'
import { TaxWorldInteractionBridge } from './TaxWorldInteractionBridge.jsx'
import { activatePaycheckWorld, deactivatePaycheckWorld } from './paycheckMode.js'
import { playerPos } from './store.js'
import { useTaxLab } from './taxLabStore.js'
import { TAX_POINTS } from './taxDistrictLayout.js'

function mountTaxInteraction() {
  return render(
    <>
      <TaxWorldInteractionBridge />
      <TaxActionPrompt />
    </>,
  )
}

describe('Module 6 Tax Lab start interaction', () => {
  beforeEach(() => {
    activatePaycheckWorld()
    useTaxLab.getState().reset()
    playerPos.x = 999
    playerPos.z = 999
  })

  afterEach(() => {
    cleanup()
    deactivatePaycheckWorld()
    useTaxLab.getState().reset()
  })

  it('always shows a start action during the intro even when the player is not yet in proximity', () => {
    mountTaxInteraction()
    expect(screen.getByRole('button', { name: /Start Module 6/i })).toBeInTheDocument()
  })

  it('pressing E opens Maya and starts Module 6 even if proximity has not initialized', () => {
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

  it('clicking the visible start action opens Maya', () => {
    mountTaxInteraction()
    fireEvent.click(screen.getByRole('button', { name: /Start Module 6/i }))
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('keeps the visible intro E click working even if the global mode flag updates late', () => {
    mountTaxInteraction()
    deactivatePaycheckWorld()
    fireEvent.click(screen.getByRole('button', { name: /Start Module 6/i }))
    expect(useTaxLab.getState().panel).toBe('guide')
  })

  it('still requires proximity after the intro instead of making every later E press global', () => {
    mountTaxInteraction()
    useTaxLab.getState().startCaseSelection()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe(null)
  })

  it('opens Maya normally when the player is physically next to her', () => {
    playerPos.x = TAX_POINTS.guide[0]
    playerPos.z = TAX_POINTS.guide[1]
    mountTaxInteraction()
    fireEvent.keyDown(window, { code: 'KeyE', key: 'e' })
    expect(useTaxLab.getState().panel).toBe('guide')
  })
})
