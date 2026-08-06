import { describe, expect, it } from 'vitest'
import { MODULE_CATALOG } from '../constants/modules.js'


describe('Paycheck Planet deployment wiring', () => {
  it('keeps the tax module in the public module catalog before the Money Garden', () => {
    const tax = MODULE_CATALOG.find((module) => module.badge === 'tax')
    const garden = MODULE_CATALOG.find((module) => module.badge === 'garden')

    expect(tax).toMatchObject({ n: 5, route: '/tax-paycheck' })
    expect(garden).toMatchObject({ n: 6, worldModule: 5 })
    expect(tax.n).toBeLessThan(garden.n)
  })
})
