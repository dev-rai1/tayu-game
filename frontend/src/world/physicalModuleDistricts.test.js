import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BANK_DISTRICT, PARTY_HOUSE, SPROUT, STOP_ANGLES, TAX_DISTRICT } from './config.js'

const here = path.dirname(fileURLToPath(import.meta.url))
const landmarks = fs.readFileSync(path.join(here, 'ModuleLandmarks.jsx'), 'utf8')
const gameWorld = fs.readFileSync(path.join(here, 'GameWorld.jsx'), 'utf8')
const bank = fs.readFileSync(path.join(here, 'BankDistrict.jsx'), 'utf8')
const modules = fs.readFileSync(path.resolve('src/constants/modules.js'), 'utf8')

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

describe('physical module districts', () => {
  it('renders a separate playable Paycheck Planet building in the 3D town', () => {
    expect(gameWorld).toContain('<ModuleLandmarks />')
    expect(landmarks).toContain("labelTexture('PAYCHECK PLANET'")
    expect(landmarks).toContain("window.location.assign('/tax-paycheck')")
    expect(landmarks).toContain('PRESS E OR CLICK TO PLAY')
  })

  it('keeps physical signs clean while the catalog identifies Money Garden as module 6', () => {
    expect(bank).toContain("labelTexture('BANK OF TAYU'")
    expect(bank).not.toContain("labelTexture('MODULE 4")
    expect(landmarks).toContain("labelTexture('THE MONEY GARDEN'")
    expect(landmarks).not.toContain("labelTexture('MODULE 6")
    expect(modules).toMatch(/n:\s*6,[\s\S]*?badge:\s*'garden',[\s\S]*?title:\s*'Money Garden'/)
  })

  it('gives Bank, Paycheck Planet, Money Garden, and Finale real breathing room', () => {
    expect(STOP_ANGLES.bank).toBeGreaterThan(STOP_ANGLES.tax)
    expect(STOP_ANGLES.tax).toBeGreaterThan(STOP_ANGLES.garden)
    expect(STOP_ANGLES.garden).toBeGreaterThan(STOP_ANGLES.party)
    expect(distance(BANK_DISTRICT, TAX_DISTRICT)).toBeGreaterThan(17)
    expect(distance(TAX_DISTRICT, SPROUT)).toBeGreaterThan(17)
    expect(distance(SPROUT, PARTY_HOUSE)).toBeGreaterThan(30)
  })
})
