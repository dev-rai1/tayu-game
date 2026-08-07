import { describe, expect, it } from 'vitest'
import { MODULE_CATALOG } from '../constants/modules.js'

describe('Paycheck Planet deployment wiring', () => {
  it('keeps tax as public module 5 without a standalone page route', () => {
    const tax = MODULE_CATALOG.find((module) => module.badge === 'tax')
    const garden = MODULE_CATALOG.find((module) => module.badge === 'garden')

    expect(tax).toMatchObject({ n: 5, badge: 'tax' })
    expect(tax.route).toBeUndefined()
    expect(garden).toMatchObject({ n: 6, worldModule: 5 })
    expect(tax.n).toBeLessThan(garden.n)
  })
})
