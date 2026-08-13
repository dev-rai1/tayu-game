import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const gameWorld = fs.readFileSync(path.join(here, 'GameWorld.jsx'), 'utf8')
const taxPrompt = fs.readFileSync(path.join(here, 'TaxActionPrompt.jsx'), 'utf8')
const taxBridge = fs.readFileSync(path.join(here, 'TaxWorldInteractionBridge.jsx'), 'utf8')

describe('Module 6/7 streamlined interaction regression', () => {
  it('keeps the Tax Office mounted in its own 3D scene boundary', () => {
    expect(gameWorld).toContain('name="tax-town"')
    expect(gameWorld).toContain('<PaycheckPlanetWorld />')
  })

  it('does not leave an inactive E prompt covering Next buttons', () => {
    expect(taxPrompt).toContain('if (!canActivate) return null')
    expect(taxPrompt).toContain('Press E or click here')
    expect(taxPrompt).toContain('min-h-[76px]')
  })

  it('keeps client and station steps explicit after the Bond Street and Rex introductions', () => {
    expect(taxBridge).toContain('const action = nearbyTaxAction()')
    expect(taxBridge).toContain('runTaxInteraction()')
    expect(taxBridge).toContain('BondStreetGate')
    expect(taxBridge).toContain('RexTaxIntro')
    expect(taxBridge).not.toContain("lab.phase === 'case' || lab.phase === 'steps'")
  })
})
