import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.resolve('src/world/GuidedCommerceOverlay.jsx'), 'utf8')

describe('guided commerce overlay layout', () => {
  it('keeps compact market and lemonade guidance out of the permanent top HUD', () => {
    expect(source).not.toContain("top-[5.5rem]")
    expect(source).not.toContain("right-3 top-")
    expect(source).toContain('data-tayu-overlay-slot="guided-action"')
  })

  it('uses the shared lower guidance lane on desktop', () => {
    expect(source).toContain("bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))'")
    expect(source).toContain("left: 'max(0.75rem, env(safe-area-inset-left, 0px))'")
  })

  it('lifts guidance above touch controls on phones and tablets', () => {
    expect(source).toContain('usesTouchControls')
    expect(source).toContain("bottom: 'calc(10.75rem + env(safe-area-inset-bottom, 0px))'")
  })
})
