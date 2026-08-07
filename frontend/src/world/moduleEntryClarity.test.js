import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const world = read('src/pages/World.jsx')
const overlay = read('src/world/TaxWorkbenchOverlay.jsx')
const paycheck = read('src/world/PaycheckPlanetWorld.jsx')
const taxScene = read('src/world/TaxLabWorld.jsx')
const taxCss = read('src/world/taxWorkbench.css')

describe('module entry clarity', () => {
  it('starts Explore launches from the beginning instead of resuming Module 5', () => {
    expect(world).toContain("if (jump === '5')")
    expect(world).toContain('enterPaycheckPlanet({ restart: true })')
    expect(world).toContain('saveProfile({ taxLabProgress: null, taxLab: null })')
    expect(world).toContain('adminJumpModule(internal, false)')
  })

  it('clears old world messages before entering an explored module', () => {
    expect(world).toContain('function clearWorldMessages()')
    expect(world).toContain('guide: null')
    expect(world).toContain('actorCaption: null')
    expect(world).toContain('banner: null')
    expect(world).toContain('helpOpen: false')
  })

  it('gives Tax Lab one full-screen DOM foreground surface with no side popup', () => {
    expect(world).toContain('taxMode ? <TaxLabWorld />')
    expect(world).toContain('{taxMode && <TaxWorkbenchOverlay />}')
    expect(world).toContain('{!taxMode && <Hud')
    expect(world).toContain('{!taxMode && <PersistentCoach')
    expect(world).toContain('{!taxMode && <AdminPanel />')
    expect(world).not.toContain('TaxSideHint')
    expect(overlay).toContain('data-tax-workbench="true"')
    expect(overlay).not.toContain('createPortal(')
    expect(paycheck).not.toContain('<Html fullscreen')
    expect(taxCss).toContain('width: 100vw')
    expect(taxCss).toContain('min-width: 100vw')
  })

  it('uses an isolated Tax Lab scene instead of showing the entire town behind Module 5', () => {
    expect(taxScene).toContain('export function TaxLabWorld()')
    expect(taxScene).toContain('<PaycheckPlanetWorld />')
    expect(taxScene).not.toContain('<Environment3D />')
    expect(taxScene).not.toContain('<MoneyGarden />')
    expect(taxScene).not.toContain('<BankDistrict />')
  })

  it('keeps hints inside the same tax workbench instead of opening another overlay', () => {
    expect(overlay).toContain("{hintOpen ? 'Hide hint' : 'Need a hint?'}")
    expect(overlay).toContain('<strong className="text-electric">Hint:</strong>')
    expect(overlay).not.toContain('data-guidance-kind="tax-hint"')
    expect(overlay).not.toContain('Show a hint on the side')
  })
})
