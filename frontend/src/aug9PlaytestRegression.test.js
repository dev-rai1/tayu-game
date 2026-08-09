import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '..')
const read = (path) => readFileSync(resolve(root, path), 'utf8')

describe('Aug. 9 comprehensive playtest regressions', () => {
  it('keeps every badge reward lookup safe, including the tax look', () => {
    const source = read('frontend/src/components/AvatarRewards.jsx')
    expect(source).toContain("tax: {")
    expect(source).toContain("label: 'Tax Pro Look'")
    expect(source).toContain('if (!check || !look) return null')
  })

  it('keeps Module 6 enabled in teacher defaults and persistence', () => {
    const source = read('frontend/src/services/classroom.js')
    expect(source).toContain('export const DEFAULT_MODULES = [1, 2, 3, 4, 5, 6]')
    expect(source).toMatch(/filter\(\(n\) => n >= 1 && n <= 6\)/)
    expect(source).toContain('amountDone: `${badges.length}/6`')
  })

  it('keeps the modal focus trap null-safe during transitions', () => {
    const source = read('frontend/src/components/DialogAccessibility.jsx')
    expect(source).toContain('const dialog = activeDialog')
    expect(source).toContain('dialog.querySelectorAll?.(FOCUSABLE)')
    expect(source).toContain('if (!dialog || !document.contains(dialog)) return')
  })

  it('keeps the accessible 2D intro dismissible instead of permanently covering play', () => {
    const source = read('frontend/src/world/AccessibleWorld.jsx')
    expect(source).toContain('const [introExpanded, setIntroExpanded] = useState(true)')
    expect(source).toContain('Got it — show my next step')
    expect(source).toContain('2D mode info')
  })

  it('keeps the desktop cookie prompt away from the centered landing controls', () => {
    const source = read('frontend/src/components/PrivacyChoices.jsx')
    expect(source).toContain('sm:right-[calc(1rem+env(safe-area-inset-right,0px))]')
    expect(source).toContain('sm:w-[min(28rem,calc(100vw-2rem))]')
  })

  it('clamps jar allocation to the remaining balance so it cannot wrap or over-allocate', () => {
    const source = read('frontend/src/world/store.js')
    expect(source).toContain('const give = Math.max(0, Math.min(amt, remaining))')
    expect(source).toContain('wallet: remaining - give')
  })

  it('does not restore stale Module 1 jar state on a fresh world initialization', () => {
    const source = read('frontend/src/world/store.js')
    expect(source).toContain('if (saved && saved.week === 2)')
    expect(source).toContain('set(get()._baseState())')
  })
})
