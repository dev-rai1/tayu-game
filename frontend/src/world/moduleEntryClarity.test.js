import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const world = read('src/pages/World.jsx')
const overlay = read('src/world/TaxWorkbenchOverlay.jsx')
const paycheck = read('src/world/PaycheckPlanetWorld.jsx')
const objective = read('src/world/objective.js')
const taxCss = read('src/world/taxWorkbench.css')

describe('module entry clarity', () => {
  it('starts Explore launches from the beginning without teleporting the player', () => {
    expect(world).toContain("if (jump === '5')")
    expect(world).toContain('enterPaycheckPlanet({ restart: true })')
    expect(world).toContain('saveProfile({ taxLabProgress: null, taxLab: null })')
    expect(world).not.toContain('adminTeleport(PAYCHECK_START)')
    expect(world).not.toContain("import { TaxLabWorld }")
  })

  it('keeps the actual town canvas and movement active during Module 5', () => {
    expect(world).toContain('{use3D ? <GameWorld avatar={state.avatar} /> : <AccessibleWorld />}')
    expect(world).toContain('{taxMode && <TaxWorkbenchOverlay />}')
    expect(world).toContain('<Hud playerName={state.player.name')
    expect(world).toContain('{use3D && usesTouchControls && <MobileControls />}')
    expect(world).not.toContain('? <TaxLabWorld />')
    expect(world).not.toContain('{!taxMode && <Hud')
  })

  it('guides the player to the real tax district and exact next station', () => {
    expect(objective).toContain("if (tax.phase === 'intro') return TAX_POINTS.guide")
    expect(objective).toContain("if (tax.phase === 'case') return TAX_POINTS.caseCenter")
    expect(objective).toContain("if (tax.phase === 'steps') return taxStationForStep(tax.stepNumber).point")
    expect(objective).not.toContain('if (isPaycheckWorldActive()) return null')
  })

  it('uses small station panels instead of replacing the map with a full-screen workbench', () => {
    expect(overlay).toContain('data-tax-field-ui="true"')
    expect(overlay).toContain('data-tax-station-panel="true"')
    expect(overlay).toContain('pointer-events-none fixed inset-0')
    expect(overlay).toContain('max-h-[72dvh]')
    expect(overlay).not.toContain('aria-modal="true"')
    expect(overlay).not.toContain('data-tax-workbench="true"')
    expect(paycheck).not.toContain('<Html fullscreen')
    expect(taxCss).toContain("[data-tax-field-ui='true']")
  })

  it('makes Maya, taxpayers, and moving workers part of the start experience', () => {
    expect(paycheck).toContain('Maya · Tax Guide')
    expect(paycheck).toContain('TAX_CLIENTS.map')
    expect(paycheck).toContain('RovingTaxWorker')
    expect(paycheck).toContain('DeskWorker')
    expect(paycheck).toContain('closeEnough(point)')
  })
})
