import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const read = (relative) => fs.readFileSync(path.resolve(relative), 'utf8')

const jars = read('src/scenarios/jarScenario.js')
const storeMission = read('src/scenarios/storeMission.js')
const lemonade = read('src/scenarios/lemonade.js')
const budget = read('src/scenarios/budgetTown.js')
const bankPanels = read('src/world/BankPanels.jsx')
const garden = read('src/scenarios/moneyGarden.js')
const tax = read('src/world/TaxWorkbenchOverlay.jsx')

describe('decision-first learning across every public module', () => {
  it('Module 1 asks for money choices and teaches through the resulting consequence', () => {
    expect(jars).toContain('Split it into SPEND, SAVE, and GIVE')
    expect(jars).toContain('Try again:')
    expect(storeMission).toContain('evaluateBasket')
    expect(storeMission).toContain('Choose needs before wants')
  })

  it('Module 2 remains the Lemonade Stand model: choose levers, simulate, then get one directional hint', () => {
    expect(lemonade).toContain('simulateSales')
    expect(lemonade).toContain('Adjust one thing next round')
    expect(lemonade).toContain('Change only one choice')
    expect(lemonade).toContain('FEATURE_QUEUE')
  })

  it('Module 3 presents tradeoffs before takeaways', () => {
    expect(budget).toContain('Each stop presents one tradeoff')
    expect(budget).toContain('ride:')
    expect(budget).toContain("save: 'Keep the money'")
    expect(budget).toContain('splitNudge')
  })

  it('Module 4 uses the explicit choose-first decision coach', () => {
    expect(bankPanels).toContain('BANK_DECISIONS')
    expect(bankPanels).toContain('Choose first')
    expect(bankPanels).toContain('Pick the right card')
    expect(bankPanels).toContain('Make debt easier to manage')
  })

  it('Module 5 Money Garden is one choice per screen with consequence feedback', () => {
    expect(garden).toContain('One decision per screen')
    expect(garden).toContain("'R3.prompt'")
    expect(garden).toContain("'R4.prompt'")
    expect(garden).toContain("'R6.think'")
  })

  it('Module 6 requires the learner to make and calculate filing decisions instead of clicking through explanations', () => {
    expect(tax).toContain('Before doing any tax math, what can you actually conclude?')
    expect(tax).toContain('Select the two fields')
    expect(tax).toContain('Build the bracket split yourself')
    expect(tax).toContain('Decide the outcome and calculate the difference')
    expect(tax).toContain('Catch the planted error before you file')
  })
})
