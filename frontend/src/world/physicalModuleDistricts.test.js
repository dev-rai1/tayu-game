import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const landmarks = fs.readFileSync(path.join(here, 'ModuleLandmarks.jsx'), 'utf8')
const gameWorld = fs.readFileSync(path.join(here, 'GameWorld.jsx'), 'utf8')

describe('physical module districts', () => {
  it('renders a separate playable Paycheck Planet building in the 3D town', () => {
    expect(gameWorld).toContain('<ModuleLandmarks />')
    expect(landmarks).toContain('MODULE 5 · PAYCHECK PLANET')
    expect(landmarks).toContain("window.location.assign('/tax-paycheck')")
    expect(landmarks).toContain('PRESS E OR CLICK TO PLAY')
  })

  it('labels Money Garden as the sixth physical module', () => {
    expect(landmarks).toContain('MODULE 6 · THE MONEY GARDEN')
  })

  it('places Paycheck Planet between the Bank and Money Garden', () => {
    expect(landmarks).toContain('(BANK_DISTRICT[0] + SPROUT[0]) / 2')
    expect(landmarks).toContain('(BANK_DISTRICT[1] + SPROUT[1]) / 2')
  })
})
