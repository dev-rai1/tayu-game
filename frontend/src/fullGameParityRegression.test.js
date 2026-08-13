import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

describe('full Aug. 9 game-test closure and 3D-only runtime', () => {
  it('fully removes the old Accessible 2D world implementation', () => {
    expect(existsSync(resolve(root, 'frontend/src/world/AccessibleWorld.jsx'))).toBe(false)
    const world = read('frontend/src/pages/World.jsx')
    expect(world).toContain('<GameWorld key={worldSession} avatar={state.avatar} />')
    expect(world).toContain('data-world-mode="3d"')
    expect(world).not.toContain('AccessibleWorld')
  })

  it('keeps the runtime preference pinned to 3D and repairs stale browser state', () => {
    const prefs = read('frontend/src/services/worldModePreferences.js')
    expect(prefs).toContain("localStorage.setItem(STORAGE_KEY, WORLD_MODES.THREE_D)")
    expect(prefs).toContain('return WORLD_MODES.THREE_D')
    expect(prefs).toContain('forceThreeDPreference()')
  })

  it('always lets the real 3D renderer attempt startup even after a failed WebGL probe', () => {
    const source = read('frontend/src/utils/webgl.js')
    expect(source).toContain('attempting the 3D renderer anyway')
    expect(source).toMatch(/return true\s*\n}/)
  })

  it('enforces the report cognitive-load rule: one surface and <=25 words before expansion', () => {
    const source = read('frontend/src/components/PlaytestUxParity.jsx')
    expect(source).toContain('const MAX_CARD_WORDS = 25')
    expect(source).toContain("toggle.textContent = 'Tell me more'")
    expect(source).toContain('queueModalSurfaces()')
    expect(source).toContain("node.style.visibility = 'hidden'")
    expect(source).toContain("node.style.pointerEvents = 'none'")
    expect(source).toContain("node.setAttribute('aria-hidden', 'true')")
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
})
