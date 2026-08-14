import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path) => readFileSync(join(process.cwd(), path), 'utf8')

describe('screenshot playtest fixes stay closed', () => {
  it('keeps the Module 1 plan check lower and SAVE visually consistent', () => {
    const coach = read('src/world/JarPlanCoach.jsx')
    const css = read('src/world/worldDeclutter.css')
    const hud = read('src/world/Hud.jsx')

    expect(coach).toContain('top-[17rem]')
    expect(coach).toContain('sm:top-[15rem]')
    expect(hud).toContain('aria-label={`Choose ${JAR_LABEL[key]} jar')
    expect(css).toContain('button[aria-label^="Choose SAVE jar"]')
    expect(css).toContain('background: rgba(255, 255, 255, 0.1) !important;')
  })

  it('keeps Bond Street scrollable and prevents Module 7 UI from leaking into Module 6', () => {
    const worldCss = read('src/world/worldDeclutter.css')
    const taxCss = read('src/world/taxWorkbench.css')

    expect(worldCss).toContain('[data-bond-street="true"]')
    expect(worldCss).toContain('overflow-y: auto !important;')
    expect(worldCss).toContain('touch-action: pan-y;')
    expect(taxCss).toContain("[data-tax-field-ui='true']")
    expect(taxCss).toContain("[data-tax-action-prompt='true']")
    expect(taxCss).toContain("content: 'Module 7 · TAYU Tax Office';")
    expect(taxCss).not.toContain("content: 'Module 6 · in-world Tax Lab';")
  })

  it('shows Module 6 before the real finale and rewrites the Module 5 bridge before paint', () => {
    const party = read('src/world/PartyHouse.jsx')
    const watcher = read('src/components/PathCompletionWatcher.jsx')

    expect(party).toContain("cardTexture('MODULE 6', 'Bond Street is next — keep going!'")
    expect(party).toContain("cardTexture('FINALE AREA', 'Come in, Money Guru!'")
    expect(party).not.toContain("cardTexture('FINALE AREA', 'Finish the journey... the party is waiting!'")
    expect(watcher).toContain('useLayoutEffect')
    expect(watcher).toContain("label: /finale/i.test(String(button?.label || '')) ? 'Start Module 6: Bond Street →'")
    expect(watcher).toContain("sessionStorage.setItem(TAX_ORIGIN_KEY, 'garden-handoff')")
  })
})
