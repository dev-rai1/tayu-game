import { describe, expect, it } from 'vitest'
import { MODULE_6_HANDOFF_TEXT, fixModule5BridgeCard, handOffGardenToModule6 } from '../components/PathCompletionWatcher.jsx'

describe('Module 5 to Module 6 handoff', () => {
  it('relabels the legacy finale bridge as Module 6 Bond Street', () => {
    const cards = [{ id: 'bridge', text: 'Ready for the Finale?', buttons: [{ label: 'To the Finale!', act: 'mg.bridge' }] }]
    const [card] = fixModule5BridgeCard(cards)
    expect(card.text).toBe(MODULE_6_HANDOFF_TEXT)
    expect(card.buttons[0].label).toContain('Module 6: Bond Street')
  })

  it('hands off after garden completion until the bond badge is earned', () => {
    expect(handOffGardenToModule6(['garden'])).toBe(true)
    expect(handOffGardenToModule6(['garden', 'bond'])).toBe(false)
  })
})
