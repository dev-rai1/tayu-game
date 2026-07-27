import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = (name) => readFileSync(resolve(process.cwd(), 'src/world', name), 'utf8')
const playerSource = source('Player.jsx')
const mobileSource = source('MobileControls.jsx')
const worldSource = source('GameWorld.jsx')

describe('ground click movement', () => {
  it('does not register or dispatch ground-tap movement', () => {
    expect(playerSource).not.toContain('tayu-ground-tap')
    expect(mobileSource).not.toContain('tayu-ground-tap')
  })

  it('does not render a click-to-move marker', () => {
    expect(worldSource).not.toContain('ClickMarker')
  })
})
