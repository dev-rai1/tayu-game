import { describe, expect, it } from 'vitest'
import { MODULE_CATALOG } from '../constants/modules.js'

describe('Paycheck Planet deployment wiring', () => {
  it('keeps tax as public module 6 without a standalone page route', () => {
    const tax = MODULE_CATALOG.find((module) => module.badge === 'tax')
    const garden = MODULE_CATALOG.find((module) => module.badge === 'garden')

    expect(tax).toMatchObject({ n: 6, badge: 'tax' })
    expect(tax.route).toBeUndefined()
    expect(garden).toMatchObject({ n: 5, worldModule: 5 })
    expect(garden.n).toBeLessThan(tax.n)
  })
})
