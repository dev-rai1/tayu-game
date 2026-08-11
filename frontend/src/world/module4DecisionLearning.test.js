import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.resolve('src/world/BankPanels.jsx'), 'utf8')

describe('Module 4 decision-first learning', () => {
  it('puts a student choice before the old automatic lesson timelines', () => {
    expect(source).toContain('clearTimelines()')
    expect(source).toContain("useGame.setState({ cards: [], scenarioLocked: false, near: null })")
    expect(source).toContain('Choose first')
  })

  it('adds meaningful decisions for the formerly passive bank lessons', () => {
    expect(source).toContain('Put it in the bank vault')
    expect(source).toContain('Savings + a CD')
    expect(source).toContain('Debit card')
    expect(source).toContain('Pay the full $5 now')
    expect(source).toContain('Ask a trusted nonprofit counselor for help')
  })

  it('uses short try-again feedback instead of dumping another lecture', () => {
    expect(source).toContain('Try again: {feedback}')
    expect(source).toContain('Money left outside is easier to lose')
    expect(source).toContain('Credit borrows money and makes a bill later')
    expect(source).toContain('Ignoring debt or adding more cards can make the problem harder')
  })

  it('keeps consequences after the decision so choices change or demonstrate the game state', () => {
    expect(source).toContain('resolveQuickDeposit()')
    expect(source).toContain('resolveQuickDebit()')
    expect(source).toContain('resolveQuickDebtHelp()')
    expect(source).toContain("act: 'bk.w2.smart'")
    expect(source).toContain("act: 'bk.w4.full'")
  })
})
