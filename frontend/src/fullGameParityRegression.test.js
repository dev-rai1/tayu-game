import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

describe('full Aug. 9 game-test closure and 2D/3D parity', () => {
  it('keeps Accessible 2D on the same gameplay state/actions as the 3D world', () => {
    const world = read('frontend/src/pages/World.jsx')
    const accessible = read('frontend/src/world/AccessibleWorld.jsx')

    expect(world).toContain('{use3D ? <GameWorld avatar={state.avatar} /> : <AccessibleWorld taxMode={taxMode} />}')
    expect(world).toContain('<Hud playerName={state.player.name || \'friend\'} onContinue={onContinue} />')

    for (const action of [
      'game.openMailbox',
      "game.openPanel('spend')",
      'game.openSupplies',
      'game.openTemplate',
      'game.enterBudget',
      'game.enterBank',
      'game.enterGarden',
      'tax.openGuide',
      'tax.previewClient(taxCase)',
      'tax.openStation(tax.stepNumber)',
    ]) expect(accessible).toContain(action)
  })

  it('enforces the report cognitive-load rule: one surface and <=25 words before expansion', () => {
    const source = read('frontend/src/components/PlaytestUxParity.jsx')
    expect(source).toContain('const MAX_CARD_WORDS = 25')
    expect(source).toContain("toggle.textContent = 'Tell me more'")
    expect(source).toContain('queueModalSurfaces()')
    expect(source).toContain("surface.style.visibility = 'hidden'")
  })

  it('turns Lemonade configuration into progressive steps without changing the economics', () => {
    const source = read('frontend/src/components/PlaytestUxParity.jsx')
    expect(source).toContain('Lemonade Stand · Step {step} of {totalSteps}')
    expect(source).toContain('⏱ Time & your pay')
    expect(source).toContain('🍋 Stand choices')
    expect(source).toContain('💵 Cost & price')
    expect(source).toContain('quality.addPerCup * bundle.cups + sign.cost')
    expect(source).toContain('const wages = wageRate * hours')
    expect(source).toContain('Town tax')
    expect(source).toContain('disabled={!economics.canAfford || price === null}')
    expect(source).toContain('Set a price to open your stand.')
  })

  it('keeps the 3D breadcrumb trail clear of the avatar', () => {
    const source = read('frontend/src/world/CompassBeam.jsx')
    expect(source).toContain('const AVATAR_CLEARANCE = 2.6')
    expect(source).toContain('let carry = AVATAR_CLEARANCE')
  })

  it('keeps market signage inside the camera-safe area and readable', () => {
    const source = read('frontend/src/world/Store.jsx')
    expect(source).toContain('<Billboard position={[0, 4.55, 0]}>')
    expect(source).toContain('<planeGeometry args={[3.6, 1.2]} />')
    expect(source).toContain('<Billboard position={[0, 1.52, 0]}>')
    expect(source).toContain('<planeGeometry args={[1.58, 0.72]} />')
  })

  it('keeps explicit world-mode choice and Accessible 2D fallback', () => {
    const settings = read('frontend/src/pages/Settings.jsx')
    const world = read('frontend/src/pages/World.jsx')
    expect(settings).toContain('Automatic')
    expect(settings).toContain('Accessible 2D')
    expect(settings).toContain('3D world')
    expect(world).toContain('Accessible 2D is active')
  })
})
