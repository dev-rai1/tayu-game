import { describe, expect, it } from 'vitest'
import { MODULE_CATALOG } from '../constants/modules.js'
import { BOND_STREET_SCRIPT, BEAU_AMBIENT_LINES } from './bondStreet.js'

describe('final bond and tax sequence', () => {
  it('shows Bond Street before the Tax Office in the public module copy', () => {
    const finalModule = MODULE_CATALOG.find((module) => module.n === 6)
    expect(finalModule.title).toMatch(/Bond Street.*Tax Office/i)
    expect(finalModule.desc).toMatch(/Treasury/i)
    expect(finalModule.desc).toMatch(/municipal/i)
    expect(finalModule.desc).toMatch(/corporate/i)
  })

  it('keeps the required Bond Street handoff concepts', () => {
    expect(BOND_STREET_SCRIPT.beauIntro).toMatch(/LEND/i)
    expect(BOND_STREET_SCRIPT.rateLesson).toMatch(/interest rates/i)
    expect(BOND_STREET_SCRIPT.seniorityLesson).toMatch(/bondholders/i)
    expect(BOND_STREET_SCRIPT.handoff).toMatch(/Tax Office/i)
    expect(BEAU_AMBIENT_LINES).toHaveLength(3)
  })
})
