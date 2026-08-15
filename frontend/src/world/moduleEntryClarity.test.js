import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const world = read('src/pages/World.jsx')
const overlay = read('src/world/TaxWorkbenchOverlay.jsx')
const paycheck = read('src/world/PaycheckPlanetWorld.jsx')
const objective = read('src/world/objective.js')
const taxCss = read('src/world/taxWorkbench.css')
const bridge = read('src/world/TaxWorldInteractionBridge.jsx')

describe('module entry clarity', () => {
  it('teleports to the selected module before any module state or UI starts', () => {
    expect(world).toContain('readModuleEntryIntent()')
    expect(world).toContain('teleportToModuleArrival(entry.moduleId)')
    expect(world).toContain("if (moduleId === '6' || moduleId === '7') return [TAX_DISTRICT[0], TAX_DISTRICT[1] + 5]")
    expect(world).toContain("if (moduleId === '6' || moduleId === '7')")
    expect(world).toContain("if (moduleId === '6') sessionStorage.setItem(BOND_ONLY_KEY, '1')")
    expect(world).toContain("enterPaycheckPlanet({ restart: moduleId === '7', origin: 'module-select' })")
    expect(world).toContain('saveProfile({ taxLabProgress: null, taxLab: null })')
    expect(world).toContain('Nothing in the module starts or appears until you choose')
    expect(world).toContain('{moduleEntry.resume ? `Resume ${arrival.label}` : `Start ${arrival.label}`} →')
    expect(world).not.toContain('adminTeleport(PAYCHECK_START)')
    expect(world).not.toContain('TaxLabWorld')
  })

  it('keeps the actual town canvas visible while module UI waits behind the start gate', () => {
    expect(world).toContain('<GameWorld key={worldSession} avatar={state.avatar} />')
    expect(world).toContain('data-world-mode="3d"')
    expect(world).not.toContain('AccessibleWorld')
    expect(world).toContain('{!moduleEntry && taxMode && <TaxWorkbenchOverlay />}')
    expect(world).toContain('{!moduleEntry && <Hud playerName={state.player.name')
    expect(world).toContain('{!moduleEntry && usesTouchControls && <MobileControls />}')
    expect(world).toContain('{moduleEntry && (')
    expect(world).toContain("window.addEventListener('keydown', blockKeyInteraction, true)")
    expect(world).toContain("window.addEventListener('tayu-interact', blockWorldInteraction, true)")
    expect(world).toContain('prepareWorldForTaxWalking()')
    expect(world).toContain('playerSpeedMult: 1')
    expect(world).toContain('scenarioLocked: false')
    expect(world).not.toContain('? <TaxLabWorld />')
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

  it('makes Rex, taxpayers, and E/action interactions clear without crowding the start experience', () => {
    expect(paycheck).toContain('Rex · Tax Guide')
    expect(paycheck).toContain('TAX_CLIENTS.map')
    expect(paycheck).toContain('InteractionGlow')
    expect(paycheck).toContain('CurrentTaxStation')
    expect(paycheck).not.toContain('RovingTaxWorker')
    expect(paycheck).not.toContain('DeskWorker')
    expect(paycheck).toContain('closeEnough(point)')
    expect(bridge).toContain("label: 'Talk to Rex and start the Tax Office'")
    expect(bridge).toContain("event.code !== 'KeyE'")
    expect(bridge).toContain("window.addEventListener('tayu-interact'")
  })
})
