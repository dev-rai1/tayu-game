import { describe, expect, it } from 'vitest'
import { MODULE_CATALOG } from '../constants/modules.js'

describe('Paycheck Planet deployment wiring', () => {
  it('keeps Bond Street as Module 6 and tax as public Module 7 without standalone page routes', () => {
    const bond = MODULE_CATALOG.find((module) => module.badge === 'bond')
    const tax = MODULE_CATALOG.find((module) => module.badge === 'tax')
    const garden = MODULE_CATALOG.find((module) => module.badge === 'garden')

    expect(bond).toMatchObject({ n: 6, badge: 'bond' })
    expect(tax).toMatchObject({ n: 7, badge: 'tax' })
    expect(bond.route).toBeUndefined()
    expect(tax.route).toBeUndefined()
    expect(garden).toMatchObject({ n: 5, worldModule: 5 })
    expect(garden.n).toBeLessThan(bond.n)
    expect(bond.n).toBeLessThan(tax.n)
  })
})
