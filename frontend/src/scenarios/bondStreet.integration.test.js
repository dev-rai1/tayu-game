import { describe, expect, it } from 'vitest'
import { MODULE_CATALOG } from '../constants/modules.js'
import { BOND_STREET_SCRIPT, BEAU_AMBIENT_LINES } from './bondStreet.js'

describe('final bond and tax sequence', () => {
  it('shows standalone Bond Street before the Tax Office in the public module sequence', () => {
    const bondModule = MODULE_CATALOG.find((module) => module.n === 6)
    const taxModule = MODULE_CATALOG.find((module) => module.n === 7)

    expect(bondModule).toMatchObject({ n: 6, badge: 'bond' })
    expect(bondModule.title).toMatch(/Bond Street/i)
    expect(bondModule.desc).toMatch(/Treasury/i)
    expect(bondModule.desc).toMatch(/municipal/i)
    expect(bondModule.desc).toMatch(/corporate/i)
    expect(taxModule).toMatchObject({ n: 7, badge: 'tax' })
    expect(taxModule.title).toMatch(/Tax Office/i)
    expect(bondModule.n).toBeLessThan(taxModule.n)
  })

  it('keeps the required Bond Street handoff concepts', () => {
    expect(BOND_STREET_SCRIPT.beauIntro).toMatch(/LEND/i)
    expect(BOND_STREET_SCRIPT.rateLesson).toMatch(/interest rates/i)
    expect(BOND_STREET_SCRIPT.seniorityLesson).toMatch(/bondholders/i)
    expect(BOND_STREET_SCRIPT.handoff).toMatch(/Tax Office/i)
    expect(BEAU_AMBIENT_LINES).toHaveLength(3)
  })
})
